const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const categoriesDir = path.join(root, 'Que Categories');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(categoriesDir, file), 'utf8'));
}

const sections = {
  assisting_passengers: readJson('Assisting_passengers.json'),
  special_needs: readJson('Special_needs.json'),
  customer_service: readJson('Customer_service.json'),
  traffic_safety: readJson('Traffic_safety.json'),
};

for (const [key, data] of Object.entries(sections)) {
  if (!Array.isArray(data)) {
    throw new Error(`${key} section data must be an array`);
  }
}

const out = 'window.EXAM_PREP_DATA = ' + JSON.stringify(sections, null, 2) + ';\n';

fs.writeFileSync(path.join(root, 'exam-data.js'), out);

const counts = Object.fromEntries(
  Object.entries(sections).map(([key, data]) => [key, data.length])
);
console.log('Built exam-data.js:', counts);
