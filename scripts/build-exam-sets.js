const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const quizDir = path.join(root, 'Final Quiz');
const outFile = path.join(root, 'exam-sets-data.js');

if (!fs.existsSync(quizDir)) {
  console.error('Final Quiz folder not found. Run: node scripts/build-final-quizzes.js');
  process.exit(1);
}

const files = fs
  .readdirSync(quizDir)
  .filter((name) => /^quiz-set-\d+\.json$/.test(name))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0], 10);
    const numB = parseInt(b.match(/\d+/)[0], 10);
    return numA - numB;
  });

if (!files.length) {
  console.error('No quiz-set-*.json files found in Final Quiz/');
  process.exit(1);
}

const sets = files.map((file) => JSON.parse(fs.readFileSync(path.join(quizDir, file), 'utf8')));

const out = 'window.EXAM_SETS_DATA = ' + JSON.stringify(sets, null, 2) + ';\n';
fs.writeFileSync(outFile, out, 'utf8');
console.log('Built exam-sets-data.js:', sets.length, 'quiz sets');
