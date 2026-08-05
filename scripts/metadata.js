const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
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
const METADATA_ORDER = ['id', 'name', 'author', 'description', 'category', 'regions', 'tags', 'priority'];
const REQUIRED_METADATA = ['id', 'name', 'category', 'regions', 'tags'];
const METADATA_LINE_PATTERN = /^\/\/ @(\w+): (.+)$/;
const METADATA_DECLARATION_PATTERN = /^\s*\/\/\s*@([-\w]+):/;

function parseMetadataValue(key, value) {
  if (key === 'regions' || key === 'tags') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  if (key === 'priority') {
    return /^-?\d+$/.test(value) ? Number(value) : Number.NaN;
  }
  return value;
}

function parseMetadataHeader(content) {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);
  const entries = [];
  const errors = [];
  let index = 0;

  while (index < lines.length) {
    const match = lines[index].match(METADATA_LINE_PATTERN);
    if (!match) {
      break;
    }
    entries.push({ key: match[1], value: match[2].trim(), line: index + 1 });
    index += 1;
  }

  if (entries.length === 0) {
    errors.push('metadata 必须位于文件第一段，且使用 // @key: value 格式');
  }

  if (entries.length > 0 && index < lines.length && lines[index].trim() !== '') {
    errors.push(`metadata 头后必须空一行，实际第 ${index + 1} 行不是空行`);
  }

  lines.forEach((line, lineIndex) => {
    const declaration = line.match(METADATA_DECLARATION_PATTERN);
    if (
      lineIndex < entries.length
      || !declaration
      || (lineIndex > 0 && !METADATA_ORDER.includes(declaration[1]))
    ) {
      return;
    }
    if (METADATA_LINE_PATTERN.test(line)) {
      errors.push(`metadata 第 ${lineIndex + 1} 行不在文件第一段`);
    } else {
      errors.push(`metadata 第 ${lineIndex + 1} 行必须使用 // @key: value 格式且不能缩进`);
    }
  });

  const metadata = {};
  const seen = new Set();
  let previousOrder = -1;
  entries.forEach(({ key, value, line }) => {
    const order = METADATA_ORDER.indexOf(key);
    if (order === -1) {
      errors.push(`第 ${line} 行包含未知 metadata 字段 @${key}`);
      return;
    }
    if (seen.has(key)) {
      errors.push(`第 ${line} 行重复定义 metadata 字段 @${key}`);
      return;
    }
    if (order <= previousOrder) {
      errors.push(`metadata 字段 @${key} 顺序错误，应按 ${METADATA_ORDER.join(', ')} 排列`);
    }
    previousOrder = order;
    seen.add(key);
    metadata[key] = parseMetadataValue(key, value);
  });

  return { metadata, errors };
}

function validateMetadata(metadata, relativePath) {
  const errors = [];
  REQUIRED_METADATA.forEach((key) => {
    const value = metadata[key];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      errors.push(`缺少必填的 @${key}`);
    }
  });
  if (metadata.id && !ID_PATTERN.test(metadata.id)) {
    errors.push(`id "${metadata.id}" 必须使用 lowercase kebab-case`);
  }
  if (metadata.category && !KNOWN_CATEGORIES.includes(metadata.category)) {
    errors.push(`未知的 category "${metadata.category}"，必须是 ${KNOWN_CATEGORIES.join(', ')} 之一`);
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
  if (metadata.priority !== undefined && !Number.isSafeInteger(metadata.priority)) {
    errors.push('@priority 必须是十进制安全整数');
  }

  const pathParts = relativePath.split('/');
  const fileName = pathParts[pathParts.length - 1].replace(/\.ts$/, '');
  if (!ID_PATTERN.test(fileName)) {
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

function formatMetadataHeader(metadata) {
  return METADATA_ORDER
    .filter((key) => metadata[key] !== undefined)
    .map((key) => {
      const value = Array.isArray(metadata[key]) ? metadata[key].join(', ') : metadata[key];
      return `// @${key}: ${value}`;
    })
    .join('\n');
}

module.exports = {
  ID_PATTERN,
  KNOWN_CATEGORIES,
  KNOWN_REGIONS,
  KNOWN_TAGS,
  METADATA_ORDER,
  formatMetadataHeader,
  parseMetadataHeader,
  validateMetadata,
};
