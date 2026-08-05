const fs = require('fs');
const path = require('path');
const { parseSync } = require('@swc/core');
const {
  parseMetadataHeader,
  validateMetadata,
} = require('./metadata');

const rootDir = path.resolve(__dirname, '..');
const checksDir = path.join(rootDir, 'src', 'checks');

function getAllFiles(dir, fileList = []) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function getRelativePath(filePath) {
  return path.posix.join(...path.relative(checksDir, filePath).split(path.sep));
}

function validateHandler(content, relativePath) {
  const errors = [];
  let ast;
  try {
    ast = parseSync(content, {
      syntax: 'typescript',
      target: 'es2022',
      comments: true,
    });
  } catch (error) {
    return [`${relativePath}: TypeScript 语法解析失败：${error.message}`];
  }

  const handlers = ast.body.filter(
    (statement) => statement.type === 'FunctionDeclaration' && statement.identifier?.value === 'handler',
  );
  if (handlers.length !== 1) {
    errors.push(`必须有且只有一个顶层 function handler，实际找到 ${handlers.length} 个`);
  } else {
    const handler = handlers[0];
    if (handler.declare || !handler.body) {
      errors.push('handler 必须包含函数实现，不能只有 declare 声明');
    }
    if (handler.async) {
      errors.push('handler 必须是同步函数，不允许使用 async');
    }
    if (handler.generator) {
      errors.push('handler 不允许是 generator 函数');
    }
    if (handler.params.length !== 0) {
      errors.push('handler 必须是无参数函数');
    }
    const returnType = handler.returnType?.typeAnnotation;
    if (
      !returnType
      || returnType.type !== 'TsTypeReference'
      || returnType.typeName?.type !== 'Identifier'
      || returnType.typeName.value !== 'HandlerResult'
    ) {
      errors.push('handler 必须显式声明返回类型 HandlerResult');
    }
  }

  const defaultExports = ast.body.filter((statement) => statement.type === 'ExportDefaultExpression');
  if (
    defaultExports.length !== 1
    || defaultExports[0].expression?.type !== 'Identifier'
    || defaultExports[0].expression.value !== 'handler'
  ) {
    errors.push('必须使用 export default handler 导出处理函数');
  }

  if (errors.length > 0) {
    return errors.map((error) => `${relativePath}: ${error}`);
  }
  return errors;
}

function checkFiles() {
  const files = getAllFiles(checksDir);
  const ids = new Map();
  const names = new Map();
  const errors = [];

  files.forEach((inputPath) => {
    const content = fs.readFileSync(inputPath, 'utf8');
    const relativePath = getRelativePath(inputPath);
    const { metadata, errors: metadataErrors } = parseMetadataHeader(content);

    metadataErrors.forEach((error) => errors.push(`${relativePath}: ${error}`));
    validateMetadata(metadata, relativePath).forEach((error) => errors.push(`${relativePath}: ${error}`));
    validateHandler(content, relativePath).forEach((error) => errors.push(error));

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
  });

  return errors;
}

const errors = checkFiles();
if (errors.length > 0) {
  throw new Error(`源码契约检查失败：\n  ${errors.join('\n  ')}`);
}

console.log(`源码契约检查通过：${getAllFiles(checksDir).length} 个脚本`);
