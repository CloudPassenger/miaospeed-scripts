const fs = require('fs');
const path = require('path');

const rollup = require('rollup');
const typescript = require('@rollup/plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
const cleanup = require('rollup-plugin-cleanup');

const srcDir = path.resolve(__dirname, 'scripts');
const distDir = path.resolve(__dirname, 'dist');

function ensureDirExistence(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

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

const files = getAllFiles(srcDir, '.ts');

console.log(`👷‍♂️ Building ${files.length} scripts...`);

files.forEach(async (file) => {
  const relativePath = path.relative(srcDir, file);
  const outputPath = path.join(distDir, relativePath.replace('.ts', '.js'));

  ensureDirExistence(path.dirname(outputPath));

  const bundle = await rollup.rollup({
    input: file,
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

  await bundle.write({
    file: outputPath,
    format: 'cjs'
  });

  console.log(`✨ Built ${outputPath}`);
});
