const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const questionsMd = fs.readFileSync(path.join(root, 'Questions.md'), 'utf8');
const answersMd = fs.readFileSync(path.join(root, 'Answers.md'), 'utf8');

const explanationsPath = path.join(root, 'Explanations.md');
if (!fs.existsSync(explanationsPath)) {
  const template = Array.from({ length: 150 }, (_, i) => `**${i + 1}**`).join('\n');
  fs.writeFileSync(explanationsPath, template + '\n');
}

const explanationsMd = fs.readFileSync(explanationsPath, 'utf8');

const answers = {};
for (const match of answersMd.matchAll(/\*\*(\d+)\*\*\s+([A-C])/g)) {
  answers[parseInt(match[1], 10)] = match[2];
}

const explanations = {};
for (const match of explanationsMd.matchAll(/^\*\*(\d+)\*\*\s*(.*)$/gm)) {
  explanations[parseInt(match[1], 10)] = match[2].trim();
}

const questions = [];
const blocks = questionsMd.split(/\*\*(\d+)\\?\.\s*/).slice(1);

for (let i = 0; i < blocks.length; i += 2) {
  const num = parseInt(blocks[i], 10);
  const body = blocks[i + 1] || '';

  const optionRegex = /^([A-C])\\?\.\s*(.+)$/gm;
  const options = [];
  let firstOptionIndex = body.search(/^[A-C]\\?\./m);

  let text = firstOptionIndex >= 0 ? body.slice(0, firstOptionIndex) : body;
  text = text
    .replace(/\*\*/g, '')
    .replace(/\\/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+[D]\s*$/i, '')
    .trim();

  let m;
  while ((m = optionRegex.exec(body)) !== null) {
    options.push({
      letter: m[1],
      text: m[2].replace(/\*\*/g, '').replace(/\\/g, '').replace(/\s+/g, ' ').trim(),
    });
  }

  const correct = answers[num];
  if (!correct || !['A', 'B', 'C'].includes(correct)) continue;

  const optionLetters = new Set(options.map((o) => o.letter));
  if (!optionLetters.has(correct)) {
    console.warn(`Question ${num}: answer "${correct}" not found among options ${[...optionLetters].join(', ')}`);
    continue;
  }

  questions.push({
    id: num,
    text,
    options,
    correct,
    explanation: explanations[num] || '',
  });
}

questions.sort((a, b) => a.id - b.id);

const out = `window.QUIZ_DATA = ${JSON.stringify(questions, null, 2)};\n`;
fs.writeFileSync(path.join(root, 'quiz-data.js'), out);
console.log(`Parsed ${questions.length} questions.`);
