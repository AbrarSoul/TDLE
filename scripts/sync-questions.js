/**
 * Keep derivative question JSON files in sync with quiz.json.
 * quiz.json is the single source of truth for question text, options, and correct answers.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const SYNC_FILES = [
  'BongoBondhu_Partial.json',
  'BongoBondhu_Numbers.json',
  'Age_related.json',
  'Image.json',
  'Exception.json',
  'Others.json',
  'Same_but_Different.json',
  'ANI_r.json',
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function isQuestion(item) {
  return (
    item &&
    typeof item === 'object' &&
    Number.isInteger(item.id) &&
    typeof item.text === 'string' &&
    Array.isArray(item.options) &&
    typeof item.correct === 'string'
  );
}

function statedAnswerInExplanation(explanation) {
  if (typeof explanation !== 'string' || !explanation.trim()) return null;
  const correctLine = explanation.match(/Correct answer:\s*([ABC])\b/);
  if (correctLine) return correctLine[1];
  const answerLine = explanation.match(/^Answer:\s*([ABC])\b/m);
  if (answerLine) return answerLine[1];
  return null;
}

function isStubExplanation(explanation) {
  const trimmed = explanation.trim();
  if (!trimmed) return true;
  if (trimmed.length <= 40) return true;

  const withoutMeta = trimmed
    .replace(/^Answer:\s*[ABC]\s*/im, '')
    .replace(/Correct answer:\s*[ABC]\s*/gi, '')
    .trim();

  if (!withoutMeta) return true;

  if (/^Answer:\s*[ABC]\s*\n\nCorrect answer:\s*[ABC]\s*$/i.test(trimmed)) {
    return true;
  }

  return false;
}

function isGenericTemplateExplanation(explanation) {
  return /Read all options;\s*pick the safest/i.test(explanation);
}

function hasStructuredExplanation(explanation) {
  return typeof explanation === 'string' && explanation.includes('--- English Translation ---');
}

function shouldReplaceExplanation(local, source) {
  if (!source.explanation || !source.explanation.trim()) return false;
  if (!local.explanation || !local.explanation.trim()) return true;
  if (local.correct !== source.correct) return true;

  const stated = statedAnswerInExplanation(local.explanation);
  if (stated !== null && stated !== source.correct) return true;

  if (isStubExplanation(local.explanation)) return true;
  if (isGenericTemplateExplanation(local.explanation)) return true;

  if (
    hasStructuredExplanation(source.explanation) &&
    !hasStructuredExplanation(local.explanation)
  ) {
    return true;
  }

  if (
    hasStructuredExplanation(source.explanation) &&
    hasStructuredExplanation(local.explanation) &&
    local.explanation !== source.explanation
  ) {
    return true;
  }

  return false;
}

function mergeOptions(localOptions, sourceOptions) {
  return sourceOptions.map(function (srcOpt, index) {
    const localOpt =
      (localOptions || []).find(function (opt) {
        return opt.letter === srcOpt.letter;
      }) || (localOptions || [])[index];

    const merged = {
      letter: srcOpt.letter,
      text: srcOpt.text,
    };

    if (localOpt && typeof localOpt.text_en === 'string') {
      merged.text_en = localOpt.text_en;
    }

    return merged;
  });
}

function mergeQuestion(local, source) {
  const merged = Object.assign({}, local);
  const correctChanged = local.correct !== source.correct;
  const replaceExplanation = shouldReplaceExplanation(local, source);

  merged.text = source.text;
  merged.correct = source.correct;
  merged.options = mergeOptions(local.options, source.options);

  if (typeof local.text_en === 'string') {
    merged.text_en = local.text_en;
  } else {
    delete merged.text_en;
  }

  if (source.image) {
    merged.image = source.image;
  } else {
    delete merged.image;
  }

  if (replaceExplanation) {
    merged.explanation = source.explanation;
  }

  return { merged, correctChanged, explanationReplaced: replaceExplanation };
}

function syncQuestionList(questions, quizById) {
  let updated = 0;
  let explanationsUpdated = 0;
  let missing = 0;

  const synced = questions.map(function (item) {
    if (!isQuestion(item)) return item;

    const source = quizById.get(item.id);
    if (!source) {
      missing++;
      return item;
    }

    const result = mergeQuestion(item, source);
    if (
      result.correctChanged ||
      result.merged.text !== item.text ||
      result.merged.correct !== item.correct
    ) {
      updated++;
    }
    if (result.explanationReplaced && result.merged.explanation !== item.explanation) {
      explanationsUpdated++;
    }

    return result.merged;
  });

  return { synced, updated, explanationsUpdated, missing };
}

function main() {
  const quizPath = path.join(root, 'quiz.json');
  const quiz = readJson(quizPath);

  if (!Array.isArray(quiz)) {
    console.error('quiz.json must be an array');
    process.exit(1);
  }

  const quizById = new Map(quiz.map(function (q) {
    return [q.id, q];
  }));

  let totalUpdated = 0;
  let totalExplanations = 0;

  for (const file of SYNC_FILES) {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`Skipping missing file: ${file}`);
      continue;
    }

    const data = readJson(filePath);
    if (!Array.isArray(data)) {
      console.warn(`Skipping ${file}: expected a JSON array`);
      continue;
    }

    const result = syncQuestionList(data, quizById);
    writeJson(filePath, result.synced);

    totalUpdated += result.updated;
    totalExplanations += result.explanationsUpdated;
    const missingNote = result.missing ? `, ${result.missing} missing in quiz.json` : '';
    console.log(
      `Synced ${file}: ${result.updated} question(s) updated, ${result.explanationsUpdated} explanation(s) upgraded${missingNote}`
    );
  }

  const solidPath = path.join(root, 'BongoBondhu_Solid.json');
  if (fs.existsSync(solidPath)) {
    const solid = readJson(solidPath);
    if (Array.isArray(solid)) {
      const result = syncQuestionList(solid, quizById);
      writeJson(solidPath, result.synced);
      totalUpdated += result.updated;
      totalExplanations += result.explanationsUpdated;
      console.log(
        `Synced BongoBondhu_Solid.json: ${result.updated} question(s) updated, ${result.explanationsUpdated} explanation(s) upgraded`
      );
    }
  }

  console.log(
    `sync-questions.js complete (${totalUpdated} updates, ${totalExplanations} explanations upgraded)`
  );
}

main();
