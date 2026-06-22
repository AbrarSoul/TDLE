const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + '\n');
}

function solidKeyword(explanation) {
  const match = explanation.match(/Just see "(.+?)",/);
  return match ? match[1] : null;
}

function partialKeyword(explanation) {
  const lines = explanation.split('\n').map((line) => line.trim()).filter(Boolean);
  let keyword = '';
  let english = '';
  const desc = [];

  for (const line of lines) {
    if (/^Answer:/i.test(line) || /^Correct answer:/i.test(line)) continue;
    const eq = line.match(/^(.+?)\s*=\s*(.+)$/);
    if (eq && !keyword) {
      keyword = eq[1].trim();
      english = eq[2].trim();
      continue;
    }
    if (keyword) desc.push(line);
  }

  return {
    keyword,
    english,
    description: desc.join('\n\n'),
  };
}

function groupSolid(questions) {
  const groups = new Map();

  for (const question of questions) {
    const keyword = solidKeyword(question.explanation || '');
    if (!keyword) continue;

    if (!groups.has(keyword)) {
      groups.set(keyword, {
        keyword,
        english: '',
        description: 'Just see "' + keyword + '", and this is the answer.',
        questionIds: [],
      });
    }

    groups.get(keyword).questionIds.push(question.id);
  }

  return [...groups.values()].sort((a, b) => a.keyword.localeCompare(b.keyword));
}

function groupPartial(questions) {
  const groups = new Map();

  for (const question of questions) {
    const parsed = partialKeyword(question.explanation || '');
    if (!parsed.keyword) continue;

    if (!groups.has(parsed.keyword)) {
      groups.set(parsed.keyword, {
        keyword: parsed.keyword,
        english: parsed.english,
        description: parsed.description,
        questionIds: [],
      });
    }

    groups.get(parsed.keyword).questionIds.push(question.id);
  }

  return [...groups.values()].sort((a, b) => a.keyword.localeCompare(b.keyword));
}

const solid = readJson('BongoBondhu_Solid.json');
const partial = readJson('BongoBondhu_Partial.json');

writeJson('BongoBondhu_Solid_keywords.json', groupSolid(solid));
writeJson('BongoBondhu_Partial_keywords.json', groupPartial(partial));

console.log('Generated keyword files');
