const fs = require('fs');
const path = require('path');

const rollup = require('rollup');
const typescript = require('@rollup/plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
const cleanup = require('rollup-plugin-cleanup');

const srcDir = path.resolve(__dirname, 'scripts');
const distDir = path.resolve(__dirname, 'dist');

/**
 * 确保文件夹存在
 */
function ensureDirExistence(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
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
 * @return {*} { name: string, description: string, regions: string[], tags: string[]
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
      } else {
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
        commonjs(),
        typescript(),
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

  fs.writeFileSync(path.join(distDir, 'index.json'), JSON.stringify(metadataArray, null, 2));

  console.log('📦 All scripts built successfully.');
}

processFiles();