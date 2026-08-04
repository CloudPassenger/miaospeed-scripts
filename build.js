const fs = require('fs');
const path = require('path');

const rollup = require('rollup');
const swc = require('@rollup/plugin-swc');
const commonjs = require('@rollup/plugin-commonjs');
const cleanup = require('rollup-plugin-cleanup');
const { nodeResolve } = require('@rollup/plugin-node-resolve');

const srcDir = path.resolve(__dirname, 'scripts');
const distDir = path.resolve(__dirname, 'dist');

const YAML = require('yaml');

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
        return __dirname;
      }
      if (source.startsWith('@/')) {
        return resolveFile(path.resolve(__dirname, source.slice(2)));
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
 * @return {*} { name: string, description: string, regions: string[], tags: string[], priority: number }
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

async function processFiles() {
  const files = getAllFiles(srcDir, '.ts');

  console.log(`👷‍♂️ Building ${files.length} scripts...`);

  const metadataArray = [];

  for (const inputPath of files) {
    const content = fs.readFileSync(inputPath, 'utf-8');
    const metadata = parseMetadata(content);
    const relativePath = path.relative(srcDir, inputPath);
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
        nodeResolve({ extensions: ['.js', '.json', '.ts'] }),
        cleanup({
          comments: 'none',
          extensions: ['js', 'jsx', 'ts', 'tsx'],
          maxEmptyLines: 0,
          sourceMap: false,
          lineEndings: 'unix'
        })
      ],
      output: {
        compact: true,
      }
    });

    const { output } = await bundle.generate({
      strict: false,
      format: 'cjs'
    });

    const code = output[0].code;

    if (metadata.name || metadata.author || metadata.description || metadata.regions || metadata.tags) {
      // console.log(`📝 Adding metadata to ${outputPath}`);
      const metadataCode = [
        metadata.name ? `// @name: ${metadata.name}` : null,
        metadata.author ? `// @author: ${metadata.author}` : null,
        metadata.description ? `// @description: ${metadata.description}` : null,
        metadata.regions && metadata.regions.length > 0 ? `// @regions: ${metadata.regions.join(', ')}` : null,
        metadata.tags && metadata.tags.length > 0 ? `// @tags: ${metadata.tags.join(', ')}` : null
      ].filter((x) => x !== null).join('\n');

      const modifiedCode = `${metadataCode}\n\n${code}`;
      fs.writeFileSync(outputPath, modifiedCode);
    } else {
      fs.writeFileSync(outputPath, code);
    }

    metadataArray.push({
      id: path.basename(inputPath, '.ts'),
      path: path.posix.join(...relativePath.split(path.sep)).replace('.ts', '.js'),
      ...metadata
    });

    console.log(`✨ Built ${outputPath}`);
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


  console.log('📝 Writing index.json...');
  const indexJsonContent = JSON.stringify(metadataArray, null, 2);
  fs.writeFileSync(path.join(distDir, 'index.json'), indexJsonContent);

  // Metadata Array to yaml
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
      {
        name: '实用工具',
        script: metadataArray.filter((item) => item.regions && item.tags.includes('tool')).map(item => item.name || item.id),
      },
      {
        name: '国际平台',
        script: metadataArray.filter((item) => item.regions && item.regions.includes('global')).map(item => item.name || item.id),
      },
      {
        name: '香港平台',
        script: metadataArray.filter((item) => item.regions && item.regions.includes('hk')).map(item => item.name || item.id),
      },
      {
        name: '台湾平台',
        script: metadataArray.filter((item) => item.regions && item.regions.includes('tw')).map(item => item.name || item.id),
      },
      {
        name: '流媒体服务',
        script: metadataArray.filter((item) => item.tags && item.tags.includes('stream')).map(item => item.name || item.id),
      },
      {
        name: 'AI平台',
        script: metadataArray.filter((item) => item.tags && item.tags.includes('ai')).map(item => item.name || item.id),
      },
      {
        name: '外服游戏',
        script: metadataArray.filter((item) => item.tags && item.tags.includes('game')).map(item => item.name || item.id),
      }
    ]
  }
  const koipyYamlContent = YAML.stringify(koipyConfig);

  // 写入 koipy.yaml
  console.log('📝 Writing config.yaml for Koipy...');
  fs.writeFileSync(path.join(distDir, 'koipy-config.yaml'), koipyYamlContent);

  console.log('📦 All scripts built successfully.');
}

processFiles();
