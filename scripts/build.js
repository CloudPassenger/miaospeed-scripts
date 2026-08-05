const fs = require('fs');
const path = require('path');

const rollup = require('rollup');
const swc = require('@rollup/plugin-swc');
const { minify } = require('@swc/core');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'src');
const entryDir = path.join(sourceDir, 'checks');
const distDir = path.join(rootDir, 'dist');

const YAML = require('yaml');

const KNOWN_CATEGORIES = ['ai', 'games', 'media', 'network', 'search', 'social'];
const LICENSE_HEADER = [
  '/*!',
  ' * Copyright (C) 2026 CloudPassenger',
  ' * SPDX-License-Identifier: AGPL-3.0-only',
  ' */',
].join('\n');

/**
 * 已知的 @tags 白名单
 * 新增标签前请先在此登记，避免拼写不一致（如 tool/tools）导致下方分组规则静默失效
 */
const KNOWN_TAGS = [
  'stream', 'video', 'live', 'movie', 'anime', 'ott', 'music', 'radio',
  'game', 'ai', 'social', 'search-engine', 'scholar',
  'tool', 'ip', 'quality',
];

/**
 * 已知的 @regions 白名单
 */
const KNOWN_REGIONS = [
  'global', 'africa', 'au', 'ca', 'ch', 'cn', 'de', 'es', 'eu', 'fr',
  'hk', 'in', 'it', 'jp', 'kr', 'latam', 'nl', 'nz', 'ru', 'sg', 'th',
  'tw', 'uk', 'us', 'vn',
];

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
 * 校验脚本元数据和目录结构
 */
function validateMetadata(metadata, relativePath) {
  const errors = [];
  if (!metadata.id) {
    errors.push('缺少必填的 @id');
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.id)) {
    errors.push(`id "${metadata.id}" 必须使用 lowercase kebab-case`);
  }
  if (!metadata.category) {
    errors.push('缺少必填的 @category');
  } else if (!KNOWN_CATEGORIES.includes(metadata.category)) {
    errors.push(`未知的 category "${metadata.category}"，必须是 ${KNOWN_CATEGORIES.join(', ')} 之一`);
  }
  if (!metadata.name) {
    errors.push('缺少必填的 @name');
  }
  if (!metadata.regions || metadata.regions.length === 0) {
    errors.push('缺少必填的 @regions');
  }
  if (!metadata.tags || metadata.tags.length === 0) {
    errors.push('缺少必填的 @tags');
  }
  (metadata.tags || []).forEach((tag) => {
    if (!KNOWN_TAGS.includes(tag)) {
      errors.push(`未知的 tag "${tag}"，请检查拼写或将其加入 KNOWN_TAGS`);
    }
  });
  (metadata.regions || []).forEach((region) => {
    if (!KNOWN_REGIONS.includes(region)) {
      errors.push(`未知的 region "${region}"，请检查拼写或将其加入 KNOWN_REGIONS`);
    }
  });

  const pathParts = relativePath.split('/');
  const fileName = pathParts[pathParts.length - 1].replace(/\.ts$/, '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fileName)) {
    errors.push(`文件名 "${fileName}" 必须使用 lowercase kebab-case`);
  }
  if (metadata.category === 'media') {
    if (pathParts.length !== 3 || pathParts[0] !== 'media') {
      errors.push('media 分类脚本必须位于 src/checks/media/<region>/<file>.ts');
    } else if (!(metadata.regions || []).includes(pathParts[1])) {
      errors.push(`目录地区 "${pathParts[1]}" 必须存在于 @regions`);
    }
  } else if (KNOWN_CATEGORIES.includes(metadata.category)) {
    if (pathParts.length !== 2 || pathParts[0] !== metadata.category) {
      errors.push(`${metadata.category} 分类脚本必须位于 src/checks/${metadata.category}/<file>.ts`);
    }
  }

  return errors;
}

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

/**
 * 解析元数据
 *
 * @param {*} content 文件内容
 * @return {*} { id: string, category: string, name: string, description: string, regions: string[], tags: string[], priority: number }
 */
function parseMetadata(content) {
  const lines = content.split('\n');
  const metadata = {};
  lines.forEach(line => {
    const match = line.match(/\/\/\s*@(\w+):\s*(.+)/);
    if (match) {
      const key = match[1];
      const value = match[2].trim();
      if (key === 'regions' || key === 'tags') {
        metadata[key] = value.split(',').map(item => item.trim());
      } else if (key === 'priority') {
        metadata[key] = parseInt(value);
      }
      else {
        metadata[key] = value;
      }
    }
  });
  return metadata;
}

function createFileHeader(metadata) {
  const metadataHeader = [
    metadata.id ? `// @id: ${metadata.id}` : null,
    metadata.category ? `// @category: ${metadata.category}` : null,
    metadata.name ? `// @name: ${metadata.name}` : null,
    metadata.author ? `// @author: ${metadata.author}` : null,
    metadata.description ? `// @description: ${metadata.description}` : null,
    metadata.regions && metadata.regions.length > 0 ? `// @regions: ${metadata.regions.join(', ')}` : null,
    metadata.tags && metadata.tags.length > 0 ? `// @tags: ${metadata.tags.join(', ')}` : null,
    metadata.priority !== undefined ? `// @priority: ${metadata.priority}` : null,
  ].filter((line) => line !== null);

  return [...metadataHeader, LICENSE_HEADER].join('\n');
}

function preflightFiles(files) {
  const scripts = [];
  const ids = new Map();
  const names = new Map();
  const errors = [];

  files.forEach((inputPath) => {
    const content = fs.readFileSync(inputPath, 'utf-8');
    const metadata = parseMetadata(content);
    const relativePath = path.posix.join(...path.relative(entryDir, inputPath).split(path.sep));

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
    if (a.priority && b.priority) {
      return a.priority - b.priority;
    } else if (a.priority) {
      return -1;
    } else if (b.priority) {
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
