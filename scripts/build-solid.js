const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + '\n');
}

function collectBbQuestionIds(bb) {
  const ids = new Set();

  for (const entry of bb.studyKeywords || []) {
    for (const id of entry.questionIds || []) {
      ids.add(id);
    }
  }

  for (const entry of bb.correctOnlyWords || []) {
    for (const id of entry.questionIds || []) {
      ids.add(id);
    }
  }

  return [...ids].sort((a, b) => a - b);
}

const bb = readJson('BB.json');
const quiz = readJson('quiz.json');
const questionIds = collectBbQuestionIds(bb);
const quizById = new Map(quiz.map((q) => [q.id, q]));

const solid = [];
const missing = [];

for (const id of questionIds) {
  const question = quizById.get(id);
  if (!question) {
    missing.push(id);
    continue;
  }
  solid.push(question);
}

if (missing.length) {
  console.warn('Warning: BB.json references missing quiz IDs:', missing.join(', '));
}

writeJson('BongoBondhu_Solid.json', solid);
console.log(`Built BongoBondhu_Solid.json: ${solid.length} questions from BB.json`);
