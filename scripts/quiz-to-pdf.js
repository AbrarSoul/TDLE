/**
 * Generate a bilingual PDF from quiz.json:
 * left column = Finnish, right column = English + keywords + explanation.
 * Questions with images embed the image above the two columns.
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const root = path.join(__dirname, '..');
const quizPath = path.join(root, 'quiz.json');
const outDir = path.join(root, 'output');
const htmlPath = path.join(outDir, 'quiz-bilingual.html');
const pdfPath = path.join(outDir, 'quiz-bilingual.pdf');

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMultiline(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

function parseExplanation(explanation) {
  if (typeof explanation !== 'string' || !explanation.trim()) {
    return { english: '', keywords: '', explanationText: '' };
  }

  const english =
    explanation.match(/--- English Translation ---\n([\s\S]*?)\n\n--- Keywords ---/)?.[1]?.trim() ??
    '';
  const keywords =
    explanation.match(/--- Keywords ---\n([\s\S]*?)\n\n--- Explanation ---/)?.[1]?.trim() ?? '';
  const explanationText =
    explanation.match(/--- Explanation ---\n([\s\S]*?)(\n\nCorrect answer:|$)/)?.[1]?.trim() ??
    '';

  return { english, keywords, explanationText };
}

function formatFinnishColumn(question) {
  let html =
    '<p class="q-text"><strong>' +
    question.id +
    '. ' +
    escapeHtml(question.text) +
    '</strong></p><div class="options">';

  for (const option of question.options) {
    const mark = option.letter === question.correct ? ' <span class="correct-mark">✓</span>' : '';
    html +=
      '<p><strong>' +
      option.letter +
      '.</strong> ' +
      escapeHtml(option.text) +
      mark +
      '</p>';
  }

  html += '</div>';
  return html;
}

function formatEnglishColumn(parsed) {
  let html = '';

  if (parsed.english) {
    html += '<div class="english-block">' + formatMultiline(parsed.english) + '</div>';
  }

  if (parsed.keywords) {
    html +=
      '<p class="section-label"><strong>Keywords</strong></p>' +
      '<div class="keywords">' +
      formatMultiline(parsed.keywords) +
      '</div>';
  }

  if (parsed.explanationText) {
    html +=
      '<p class="section-label"><strong>Explanation</strong></p>' +
      '<div class="explanation">' +
      formatMultiline(parsed.explanationText) +
      '</div>';
  }

  return html;
}

function imageSrcForHtml(imagePath) {
  const absolute = path.join(root, imagePath.replace(/\//g, path.sep));
  if (!fs.existsSync(absolute)) {
    console.warn(`Warning: image not found for PDF: ${imagePath}`);
    return '';
  }
  return pathToFileURL(absolute).href;
}

function buildQuestionBlock(question) {
  const parsed = parseExplanation(question.explanation);
  let html = '<section class="question-block">';

  if (question.image) {
    const src = imageSrcForHtml(question.image);
    if (src) {
      html +=
        '<figure class="question-figure">' +
        '<img class="question-image" src="' +
        escapeHtml(src) +
        '" alt="Question ' +
        question.id +
        ' image" />' +
        '</figure>';
    }
  }

  html +=
    '<div class="two-col">' +
    '<div class="col col-fi">' +
    formatFinnishColumn(question) +
    '</div>' +
    '<div class="col col-en">' +
    formatEnglishColumn(parsed) +
    '</div>' +
    '</div></section>';

  return html;
}

function buildHtml(questions) {
  const blocks = questions.map(buildQuestionBlock).join('\n');

  return `<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="UTF-8" />
  <title>Taksi Quiz — Finnish / English (${questions.length} Questions)</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm 12mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: "Segoe UI", "Noto Sans", Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.45;
      color: #111;
      margin: 0;
      padding: 0;
    }

    h1 {
      font-size: 16pt;
      margin: 0 0 14px;
      text-align: center;
      page-break-after: avoid;
    }

    .question-block {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 14px;
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: hidden;
    }

    .question-figure {
      margin: 0;
      padding: 8px 10px;
      background: #fafafa;
      border-bottom: 1px solid #ddd;
      text-align: center;
    }

    .question-image {
      max-width: 100%;
      max-height: 220px;
      object-fit: contain;
    }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 0;
    }

    .col {
      padding: 10px 12px;
      vertical-align: top;
    }

    .col-fi {
      border-right: 1px solid #ccc;
      background: #fff;
    }

    .col-en {
      background: #f9f9f9;
    }

    .q-text {
      margin: 0 0 8px;
    }

    .options p {
      margin: 0 0 5px;
    }

    .correct-mark {
      color: #0a7a2f;
      font-weight: bold;
    }

    .section-label {
      margin: 8px 0 4px;
      font-size: 9pt;
    }

    .english-block,
    .keywords,
    .explanation {
      margin: 0;
    }

    .keywords,
    .explanation {
      font-size: 9pt;
    }
  </style>
</head>
<body>
  <h1>Taksi Quiz — Finnish / English (${questions.length} Questions)</h1>
  ${blocks}
</body>
</html>`;
}

async function renderPdf(htmlFile, pdfFile) {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
    fail('puppeteer is not installed. Run: npm install --save-dev puppeteer');
  }

  const tmpPdf = pdfFile + '.tmp';
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: tmpPdf,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '12mm', right: '12mm' },
    });
  } finally {
    await browser.close();
  }

  try {
    if (fs.existsSync(pdfFile)) {
      fs.unlinkSync(pdfFile);
    }
  } catch (err) {
    console.warn(`Warning: could not replace ${pdfFile} (${err.message}). Wrote ${tmpPdf} instead.`);
    return tmpPdf;
  }

  fs.renameSync(tmpPdf, pdfFile);
  return pdfFile;
}

async function main() {
  let questions;
  try {
    questions = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
  } catch (err) {
    fail(`Could not read quiz.json: ${err.message}`);
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    fail('quiz.json must be a non-empty array of questions.');
  }

  fs.mkdirSync(outDir, { recursive: true });

  const html = buildHtml(questions);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`Wrote ${htmlPath}`);

  const writtenPdf = await renderPdf(htmlPath, pdfPath);
  console.log(`Wrote ${writtenPdf} (${questions.length} questions)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
