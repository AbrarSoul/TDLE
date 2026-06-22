const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function readKeywords(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    return [];
  }
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  if (!Array.isArray(data)) {
    throw new Error(`${file} must be an array`);
  }
  return data;
}

const age = readJson('Age_related.json');
const numbers = readJson('BongoBondhu_Numbers.json');

const sections = {
  solid: readJson('BongoBondhu_Solid.json'),
  partial: readJson('BongoBondhu_Partial.json'),
  age: age,
  numbers: numbers,
  image: readJson('Image.json'),
};

const keywordFiles = {
  solid: 'BongoBondhu_Solid_keywords.json',
  partial: 'BongoBondhu_Partial_keywords.json',
  age: 'Age_related_keywords.json',
  numbers: 'BongoBondhu_Numbers_keywords.json',
  image: 'Image_keywords.json',
};

function normalizeBbKeywords(bb) {
  const items = [];

  for (const entry of bb.studyKeywords || []) {
    items.push({
      keyword: entry.keyword,
      english: entry.english || '',
      description: entry.description || '',
      questionIds: entry.questionIds || [],
    });
  }

  for (const entry of bb.correctOnlyWords || []) {
    items.push({
      keyword: entry.word,
      english: entry.english || '',
      description: entry.description || '',
      questionIds: entry.questionIds || [],
    });
  }

  return items;
}

function mergeKeywordEntries(existing, incoming) {
  const map = new Map();

  function add(entry) {
    const key = entry.keyword.toLowerCase();
    const ids = [...(entry.questionIds || [])];

    if (!map.has(key)) {
      map.set(key, {
        keyword: entry.keyword,
        english: entry.english || '',
        description: entry.description || '',
        questionIds: ids,
      });
      return;
    }

    const current = map.get(key);
    const mergedIds = new Set([...(current.questionIds || []), ...ids]);
    current.questionIds = [...mergedIds].sort((a, b) => a - b);

    if (entry.english && !current.english) {
      current.english = entry.english;
    }

    if (
      entry.description &&
      (!current.description || current.description.startsWith('Just see "'))
    ) {
      current.description = entry.description;
    }
  }

  existing.forEach(add);
  incoming.forEach(add);

  return [...map.values()].sort((a, b) =>
    a.keyword.localeCompare(b.keyword, 'fi', { sensitivity: 'base' })
  );
}

const keywords = {};

for (const [key, data] of Object.entries(sections)) {
  if (!Array.isArray(data)) {
    throw new Error(`${key} section data must be an array`);
  }
  keywords[key] = readKeywords(keywordFiles[key]);
}

const bbPath = path.join(root, 'BB.json');
if (fs.existsSync(bbPath)) {
  const bb = readJson('BB.json');
  keywords.solid = mergeKeywordEntries(keywords.solid, normalizeBbKeywords(bb));
}

const out =
  'window.STUDY_DATA = ' +
  JSON.stringify(sections, null, 2) +
  ';\n\n' +
  'window.STUDY_KEYWORDS = ' +
  JSON.stringify(keywords, null, 2) +
  ';\n';

fs.writeFileSync(path.join(root, 'study-data.js'), out);

const counts = Object.fromEntries(
  Object.entries(sections).map(([key, data]) => [key, data.length])
);
const keywordCounts = Object.fromEntries(
  Object.entries(keywords).map(([key, data]) => [key, data.length])
);
console.log('Built study-data.js:', counts);
console.log('Keywords:', keywordCounts);
