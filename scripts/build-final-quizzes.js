const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const categoriesDir = path.join(root, 'Que Categories');
const outDir = path.join(root, 'Final Quiz');

const SET_COUNT = 8;

const SECTIONS = [
  {
    key: 'assisting_passengers',
    title: 'Assisting passengers and ensuring their safety',
    file: 'Assisting_passengers.json',
    perSet: 15,
    required: 12,
  },
  {
    key: 'special_needs',
    title: 'Special needs of different passenger groups',
    file: 'Special_needs.json',
    perSet: 15,
    required: 12,
  },
  {
    key: 'customer_service',
    title: 'Customer service situations in taxi services',
    file: 'Customer_service.json',
    perSet: 10,
    required: 7,
  },
  {
    key: 'traffic_safety',
    title: 'Factors affecting transport and traffic safety',
    file: 'Traffic_safety.json',
    perSet: 10,
    required: 7,
  },
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(categoriesDir, file), 'utf8'));
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, seed) {
  const rand = mulberry32(seed);
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Split a question pool into `setCount` groups of `perSet` questions each.
 * No duplicate question IDs within a single group.
 */
function splitPool(pool, perSet, setCount, seed) {
  const totalNeeded = perSet * setCount;
  const shuffled = shuffle(pool, seed);
  const repeats = Math.ceil(totalNeeded / shuffled.length);
  const expanded = [];
  for (let r = 0; r < repeats; r++) {
    expanded.push(...shuffle(shuffled, seed + r + 1));
  }

  const groups = Array.from({ length: setCount }, () => []);
  let cursor = 0;

  for (let setIndex = 0; setIndex < setCount; setIndex++) {
    const used = new Set();
    while (groups[setIndex].length < perSet) {
      if (cursor >= expanded.length) {
        expanded.push(...shuffle(shuffled, seed + setIndex + 100));
        cursor = 0;
      }
      const question = expanded[cursor++];
      if (used.has(question.id)) continue;
      used.add(question.id);
      groups[setIndex].push(question);
    }
  }

  return groups;
}

function buildPassingCriteria() {
  const total = SECTIONS.reduce((sum, section) => sum + section.perSet, 0);
  const required = SECTIONS.reduce((sum, section) => sum + section.required, 0);
  return {
    overall: { total, required },
    sections: SECTIONS.map((section) => ({
      key: section.key,
      title: section.title,
      total: section.perSet,
      required: section.required,
    })),
  };
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sectionGroups = {};
for (const section of SECTIONS) {
  const pool = readJson(section.file);
  if (!Array.isArray(pool) || pool.length < section.perSet) {
    throw new Error(
      `${section.file} has ${pool.length} questions but each set needs ${section.perSet}`
    );
  }
  sectionGroups[section.key] = splitPool(pool, section.perSet, SET_COUNT, section.key.length * 7919);
}

const passingCriteria = buildPassingCriteria();

for (let i = 0; i < SET_COUNT; i++) {
  const setNumber = i + 1;
  const sections = {};
  let nextId = 1;

  for (const section of SECTIONS) {
    sections[section.key] = sectionGroups[section.key][i].map((q) => ({
      ...q,
      id: nextId++,
    }));
  }

  const quiz = {
    id: setNumber,
    title: `Final Exam Quiz Set ${setNumber}`,
    passingCriteria,
    sections,
    questions: SECTIONS.flatMap((section) =>
      sections[section.key].map((q) => ({ ...q, section: section.key }))
    ),
  };

  const outPath = path.join(outDir, `quiz-set-${setNumber}.json`);
  fs.writeFileSync(outPath, JSON.stringify(quiz, null, 2) + '\n', 'utf8');
}

const summary = SECTIONS.map((section) => {
  const ids = new Set();
  let overlap = 0;
  for (let i = 0; i < SET_COUNT; i++) {
    for (const q of sectionGroups[section.key][i]) {
      if (ids.has(q.id)) overlap++;
      ids.add(q.id);
    }
  }
  return `${section.key}: ${ids.size} unique across all sets, ${overlap} cross-set repeats`;
});

console.log(`Created ${SET_COUNT} quiz sets in Final Quiz/`);
summary.forEach((line) => console.log(' ', line));
