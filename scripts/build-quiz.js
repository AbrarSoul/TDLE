const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const quizPath = path.join(root, 'quiz.json');
const outPath = path.join(root, 'quiz-data.js');

const VALID_LETTERS = ['A', 'B', 'C'];

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

let questions;
try {
  questions = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
} catch (err) {
  fail(`Could not read quiz.json: ${err.message}`);
}

if (!Array.isArray(questions)) {
  fail('quiz.json must be a JSON array of questions.');
}

const seenIds = new Set();

for (const q of questions) {
  if (!q || typeof q !== 'object') {
    fail('Each question must be an object.');
  }

  if (!Number.isInteger(q.id) || q.id < 1) {
    fail(`Question has invalid id: ${JSON.stringify(q.id)}`);
  }

  if (seenIds.has(q.id)) {
    fail(`Duplicate question id: ${q.id}`);
  }
  seenIds.add(q.id);

  if (typeof q.text !== 'string' || !q.text.trim()) {
    fail(`Question ${q.id}: "text" must be a non-empty string.`);
  }

  if (!Array.isArray(q.options) || q.options.length !== 3) {
    fail(`Question ${q.id}: must have exactly 3 options.`);
  }

  const letters = new Set();
  for (const opt of q.options) {
    if (!opt || typeof opt !== 'object') {
      fail(`Question ${q.id}: each option must be an object.`);
    }
    if (!VALID_LETTERS.includes(opt.letter)) {
      fail(`Question ${q.id}: option letter must be A, B, or C (got "${opt.letter}").`);
    }
    if (letters.has(opt.letter)) {
      fail(`Question ${q.id}: duplicate option letter "${opt.letter}".`);
    }
    letters.add(opt.letter);

    if (typeof opt.text !== 'string' || !opt.text.trim()) {
      fail(`Question ${q.id}: option ${opt.letter} must have non-empty text.`);
    }
  }

  if (!VALID_LETTERS.includes(q.correct)) {
    fail(`Question ${q.id}: "correct" must be A, B, or C (got "${q.correct}").`);
  }

  if (!letters.has(q.correct)) {
    fail(`Question ${q.id}: correct answer "${q.correct}" not found among options.`);
  }

  if (typeof q.explanation !== 'string') {
    fail(`Question ${q.id}: "explanation" must be a string.`);
  }

  if (q.image !== undefined) {
    if (typeof q.image !== 'string' || !q.image.trim()) {
      fail(`Question ${q.id}: "image" must be a non-empty string when provided.`);
    }
  }
}

questions.sort((a, b) => a.id - b.id);

const out = `window.QUIZ_DATA = ${JSON.stringify(questions, null, 2)};\n`;
fs.writeFileSync(outPath, out);
console.log(`Validated ${questions.length} questions → quiz-data.js`);
