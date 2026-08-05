const fs = require('fs');
const path = require('path');

const rollup = require('rollup');
const swc = require('@rollup/plugin-swc');
const { minify } = require('@swc/core');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const {
  KNOWN_CATEGORIES,
  KNOWN_REGIONS,
  KNOWN_TAGS,
  formatMetadataHeader,
  parseMetadataHeader,
  validateMetadata,
} = require('./metadata');

const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'src');
const entryDir = path.join(sourceDir, 'checks');
const distDir = path.join(rootDir, 'dist');

const YAML = require('yaml');

const LICENSE_HEADER = [
  '/*!',
  ' * Copyright (C) 2026 CloudPassenger',
  ' * SPDX-License-Identifier: AGPL-3.0-only',
  ' */',
].join('\n');

/**
 * 规则分组配置：同一脚本可以同时出现在多个分组中（例如某脚本既属于 stream 也属于 tool）
 * 新增分组只需在此追加一项，无需改动下方生成逻辑
 */
const RULE_GROUPS = [
  { type: 'tag', key: 'tool', name: '实用工具' },
  { type: 'region', key: 'global', name: '国际平台' },
  { type: 'region', key: 'hk', name: '香港平台' },
  { type: 'region', key: 'tw', name: '台湾平台' },
  { type: 'tag', key: 'stream', name: '流媒体服务' },
  { type: 'tag', key: 'ai', name: 'AI平台' },
  { type: 'tag', key: 'game', name: '外服游戏' },
];

RULE_GROUPS.forEach(({ type, key }) => {
  const whitelist = type === 'tag' ? KNOWN_TAGS : KNOWN_REGIONS;
  if (!whitelist.includes(key)) {
    throw new Error(`RULE_GROUPS 中的 "${key}" 不在 KNOWN_${type === 'tag' ? 'TAGS' : 'REGIONS'} 白名单内`);
  }
});

/**
 * 确保文件夹存在
 */
function ensureDirExistence(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function resolvePathAliases() {
  function resolveFile(filePath) {
    const candidates = [filePath, `${filePath}.ts`, `${filePath}.js`, path.join(filePath, 'index.ts'), path.join(filePath, 'index.js')];
    return candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || filePath;
  }

  return {
    name: 'resolve-path-aliases',
    resolveId(source) {
      if (source === '@') {
        return sourceDir;
      }
      if (source.startsWith('@/')) {
        return resolveFile(path.resolve(sourceDir, source.slice(2)));
      }
      return null;
    }
  };
}

/**
 * 递归读取所有文件
 * 
 * @param {string} dir 路径
 * @param {string} ext 扩展名
 * @returns 
 */
function getAllFiles(dir, ext, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, ext, fileList);
    } else if (filePath.endsWith(ext)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function createFileHeader(metadata) {
  return `${formatMetadataHeader(metadata)}\n${LICENSE_HEADER}`;
}

function preflightFiles(files) {
  const scripts = [];
  const ids = new Map();
  const names = new Map();
  const errors = [];

  files.forEach((inputPath) => {
    const content = fs.readFileSync(inputPath, 'utf-8');
    const relativePath = path.posix.join(...path.relative(entryDir, inputPath).split(path.sep));
    const { metadata, errors: metadataErrors } = parseMetadataHeader(content);

    metadataErrors.forEach((error) => {
      errors.push(`${relativePath}: ${error}`);
    });

    validateMetadata(metadata, relativePath).forEach((error) => {
      errors.push(`${relativePath}: ${error}`);
    });

    if (metadata.id) {
      const existingPath = ids.get(metadata.id);
      if (existingPath) {
        errors.push(`${relativePath}: id "${metadata.id}" 与 ${existingPath} 重复`);
      } else {
        ids.set(metadata.id, relativePath);
      }
    }

    if (metadata.name) {
      const existingPath = names.get(metadata.name);
      if (existingPath) {
        errors.push(`${relativePath}: name "${metadata.name}" 与 ${existingPath} 重复`);
      } else {
        names.set(metadata.name, relativePath);
      }
    }

    scripts.push({ inputPath, metadata, relativePath });
  });

  if (errors.length > 0) {
    throw new Error(`脚本预检失败：\n  ${errors.join('\n  ')}`);
  }

  return scripts;
}

async function processFiles() {
  const files = getAllFiles(entryDir, '.ts');
  const scripts = preflightFiles(files);

  console.log(`👷‍♂️ 正在构建 ${scripts.length} 个脚本...`);

  const metadataArray = [];

  for (const { inputPath, metadata, relativePath } of scripts) {
    const outputPath = path.join(distDir, relativePath.replace('.ts', '.js'));

    ensureDirExistence(path.dirname(outputPath));

    const bundle = await rollup.rollup({
      input: inputPath,
      plugins: [
        resolvePathAliases(),
        commonjs(),
        swc({
          swc: {
            jsc: {
              target: 'es2015',
              parser: {
                syntax: 'typescript',
                decorators: true
              },
              transform: {
                decoratorMetadata: true,
                legacyDecorator: true
              },
              loose: true
            }
          }
        }),
        nodeResolve({ extensions: ['.js', '.json', '.ts'] })
      ]
    });

    try {
      const { output } = await bundle.generate({
        strict: false,
        format: 'cjs'
      });

      const { code } = await minify(output[0].code, {
        compress: {
          top_retain: ['handler'],
        },
        mangle: {
          topLevel: true,
          reserved: ['handler'],
        },
        ecma: 2015,
        module: false,
        toplevel: true,
        format: {
          comments: false,
        },
      });
      const fileHeader = createFileHeader(metadata);

      if (!/\bfunction handler\s*\(/.test(code)) {
        throw new Error(`${relativePath}: 压缩后未保留全局 handler 函数`);
      }
      if (!/\bmodule\.exports\s*=\s*handler\b/.test(code)) {
        throw new Error(`${relativePath}: 压缩后未保留 handler 导出`);
      }

      fs.writeFileSync(outputPath, `${fileHeader}\n${code}\n`);
    } finally {
      await bundle.close();
    }

    metadataArray.push({
      ...metadata,
      id: metadata.id,
      path: relativePath.replace('.ts', '.js')
    });

    console.log(`✨ 已构建 ${outputPath}`);
  }

  // 按照 priority 排序，值越小排名越前
  metadataArray.sort((a, b) => {
    if (a.priority !== undefined && b.priority !== undefined) {
      return a.priority - b.priority;
    } else if (a.priority !== undefined) {
      return -1;
    } else if (b.priority !== undefined) {
      return 1;
    } else {
      return 0;
    }
  });


  console.log('📝 正在写入 index.json...');
  const indexJsonContent = JSON.stringify(metadataArray, null, 2);
  fs.writeFileSync(path.join(distDir, 'index.json'), indexJsonContent);

  // 将元数据数组转换为 YAML
  const koipyConfig = {
    scriptConfig: {
      scripts: metadataArray.map((item, index) => {
        return {
          type: 'gojajs',
          name: item.name || item.id,
          rank: index,
          content: path.posix.join('resources/scripts', item.path),
        }
      })
    },
    rules: [
      {
        name: '全部项目',
        script: metadataArray.map(item => item.name || item.id),
      },
      ...RULE_GROUPS.map(({ type, key, name }) => ({
        name,
        script: metadataArray
          .filter((item) => {
            const list = type === 'tag' ? item.tags : item.regions;
            return list && list.includes(key);
          })
          .map(item => item.name || item.id),
      })),
    ]
  }
  const koipyYamlContent = YAML.stringify(koipyConfig);

  // 写入 koipy.yaml
  console.log('📝 正在写入 Koipy 配置文件...');
  fs.writeFileSync(path.join(distDir, 'koipy-config.yaml'), koipyYamlContent);

  console.log('📦 所有脚本构建成功。');
}

processFiles();
