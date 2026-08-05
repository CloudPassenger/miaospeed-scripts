const Mustache = require('mustache');
const fs = require('fs');
const path = require('path');
const { input, number, select } = require('@inquirer/prompts');

const rootDir = path.resolve(__dirname, '..');
const checksDir = path.join(rootDir, 'src', 'checks');
const template = fs.readFileSync(path.resolve(__dirname, 'templates/fetch.ts.mustache'), 'utf8');
const KNOWN_CATEGORIES = ['ai', 'games', 'media', 'network', 'search', 'social'];
const KNOWN_REGIONS = [
  'global', 'africa', 'au', 'ca', 'ch', 'cn', 'de', 'es', 'eu', 'fr',
  'hk', 'in', 'it', 'jp', 'kr', 'latam', 'nl', 'nz', 'ru', 'sg', 'th',
  'tw', 'uk', 'us', 'vn',
];
const KNOWN_TAGS = [
  'stream', 'video', 'live', 'movie', 'anime', 'ott', 'music', 'radio',
  'game', 'ai', 'social', 'search-engine', 'scholar',
  'tool', 'ip', 'quality',
];
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function ensureDirExistence(file) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getAllFiles(dir, ext, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, ext, fileList);
    } else if (filePath.endsWith(ext)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function getExistingIds() {
  const ids = new Map();
  getAllFiles(checksDir, '.ts').forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/\/\/\s*@id:\s*(.+)/);
    if (match) {
      ids.set(match[1].trim(), path.relative(checksDir, filePath));
    }
  });
  return ids;
}

function getExistingNames() {
  const names = new Map();
  getAllFiles(checksDir, '.ts').forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/\/\/\s*@name:\s*(.+)/);
    if (match) {
      names.set(match[1].trim(), path.relative(checksDir, filePath));
    }
  });
  return names;
}

function parseList(value) {
  return [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
}

function getScriptPath(category, mainRegion, slug) {
  if (category === 'media') {
    return path.join(checksDir, category, mainRegion, `${slug}.ts`);
  }
  return path.join(checksDir, category, `${slug}.ts`);
}

function getDefaultTags(category) {
  const defaults = {
    ai: 'ai',
    games: 'game',
    media: 'stream, video',
    network: 'tool, ip',
    search: 'search-engine',
    social: 'social',
  };
  return defaults[category];
}

(async () => {
  const existingIds = getExistingIds();
  const existingNames = getExistingNames();
  const category = await select({
    message: '请选择新脚本的分类',
    choices: KNOWN_CATEGORIES.map((value) => ({ name: value, value })),
  });
  const regionsInput = await input({
    message: '请输入新脚本适用的地区，多个地区使用逗号分隔',
    required: true,
    default: 'global, us',
    transformer: (value) => parseList(value).join(', '),
    validate: (value) => {
      const regions = parseList(value);
      const unknownRegions = regions.filter((region) => !KNOWN_REGIONS.includes(region));
      if (regions.length === 0) {
        return '请至少输入一个地区';
      }
      return unknownRegions.length === 0 || `未知地区：${unknownRegions.join(', ')}`;
    },
  });
  const regions = parseList(regionsInput);
  const mainRegion = category === 'media' ? await select({
    message: '请选择新媒体脚本的主要目标地区',
    choices: regions.map((value) => ({ name: value, value })),
  }) : null;
  const scriptId = await input({
    message: '请输入新脚本的 ID',
    required: true,
    validate: (value) => {
      const id = value.trim();
      if (!ID_PATTERN.test(id)) {
        return '脚本 ID 必须使用小写 kebab-case';
      }
      const existingPath = existingIds.get(id);
      return !existingPath || `脚本 ID 已存在于 src/checks/${existingPath}`;
    },
  });
  const slug = await input({
    message: '请输入新脚本的文件名 slug',
    required: true,
    default: scriptId.trim(),
    validate: (value) => {
      const fileSlug = value.trim();
      if (!ID_PATTERN.test(fileSlug)) {
        return '文件名 slug 必须使用小写 kebab-case';
      }
      return !fs.existsSync(getScriptPath(category, mainRegion, fileSlug)) || '脚本路径已存在';
    },
  });
  const scriptName = await input({
    message: '请输入新脚本的显示名称',
    required: true,
    validate: (value) => {
      const name = value.trim();
      const existingPath = existingNames.get(name);
      return !existingPath || `脚本名称已存在于 src/checks/${existingPath}`;
    },
  });
  const tagsInput = await input({
    message: '请输入新脚本的标签，多个标签使用逗号分隔',
    required: true,
    default: getDefaultTags(category),
    transformer: (value) => parseList(value).join(', '),
    validate: (value) => {
      const tags = parseList(value);
      const unknownTags = tags.filter((tag) => !KNOWN_TAGS.includes(tag));
      if (tags.length === 0) {
        return '请至少输入一个标签';
      }
      return unknownTags.length === 0 || `未知标签：${unknownTags.join(', ')}`;
    },
  });
  const tags = parseList(tagsInput);

  const priority = await number({ message: '请输入新脚本的优先级', default: 50, required: true });

  const is_mobile = await select({ message: '是否使用移动端 User-Agent？', choices: [{ name: '是', value: true }, { name: '否', value: false }], required: true });

  // 模板输入数据
  const view = {
    id: scriptId.trim(),
    category: category,
    name: scriptName.trim(),
    regions: regions.join(', '),
    tags: tags.join(', '),
    priority: priority,
    is_mobile: is_mobile,
  };

  // 使用输入数据渲染模板
  const output = Mustache.render(template, view);
  const outputPath = getScriptPath(category, mainRegion, slug.trim());

  const currentIds = getExistingIds();
  const currentNames = getExistingNames();
  if (currentIds.has(view.id)) {
    throw new Error(`脚本 ID 已存在于 src/checks/${currentIds.get(view.id)}`);
  }
  if (currentNames.has(view.name)) {
    throw new Error(`脚本名称已存在于 src/checks/${currentNames.get(view.name)}`);
  }
  if (fs.existsSync(outputPath)) {
    throw new Error(`脚本路径已存在：${path.relative(rootDir, outputPath)}`);
  }

  // 将渲染结果写入文件
  ensureDirExistence(outputPath);
  fs.writeFileSync(outputPath, output, 'utf8');
})();
