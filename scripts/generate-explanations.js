const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const quiz = JSON.parse(fs.readFileSync(path.join(root, 'quiz.json'), 'utf8'));
const keywordsData = JSON.parse(fs.readFileSync(path.join(root, 'keywords-data.json'), 'utf8'));
const kwById = Object.fromEntries(keywordsData.map((k) => [k.id, k]));

const TRIGGERS = {
  1: { trigger: 'jotta muut', rule: 'Purpose is so that other road users can see your stopped vehicle.' },
  2: { trigger: 'Hätäkeskus / sijainti', rule: '112 Suomi app sends automatic location to the Emergency Response Centre — not call speed.' },
  3: { trigger: 'Liikenteen valvojan', rule: 'When traffic instructions conflict, follow the traffic controller.' },
  4: { trigger: 'itse', rule: 'Passenger aged 15+ is responsible for their own seat belt. Reject vapaaehtoista.' },
  5: { trigger: 'Taksinkuljettaja', rule: 'Passenger under 15 — driver is responsible for seat belt. Reject vapaaehtoista.' },
  6: { trigger: 'Huolehdit', rule: 'Driver must ensure the child wears a seat belt for the whole journey.' },
  7: { trigger: 'turvalaitteessa', rule: 'Under-3 child must always use an appropriate child restraint (Lapsi tulee).' },
  8: { trigger: 'välttämätön', rule: 'Phone use is allowed only when necessary for the transport.' },
  9: { trigger: 'sisätilaan', rule: 'In freezing weather, ensure the customer has entered indoors before leaving.' },
  10: { trigger: 'toisen paikan', rule: 'If the stop is unsafe, find another safe place. Safety first.' },
  11: { trigger: 'herätellä / poliisi paikalle', rule: 'Try to wake the customer first; call police if needed. Never take payment card without consent.' },
  12: { trigger: 'määränpäähän', rule: 'Driver must ensure customer reaches the correct destination. Reject Poikkeuslupaa.' },
  13: { trigger: 'estetään / alkoholia', rule: 'Alkolukko prevents the vehicle from moving if the driver has consumed alcohol.' },
  14: { trigger: 'Koulu- ja päivähoitokuljetuksissa / alkolukko', rule: 'School/daycare transport must always use a vehicle with alkolukko installed.' },
  15: { trigger: 'vastuullisen kuljettajan', rule: 'Driver must behave as a responsible professional in school/daycare transport.' },
  16: { trigger: 'Työnantajan', rule: 'Employer is responsible for ordering the driver\'s criminal record check.' },
  17: { trigger: 'Koulu- ja päivähoitokuljetuksissa', rule: 'Alkolukko is required in school and daycare transport.' },
  18: { trigger: 'turvavyö on kiinni', rule: 'Stop and discuss; continue only when the child\'s seat belt is fastened.' },
  19: { trigger: 'enkä vastaa / kyydin päätyttyä', rule: 'Without handsfree, apologise and call back after the ride ends.' },
  20: { trigger: 'välttämätön / handsfree', rule: 'Driver may use phone with handsfree only when necessary for the transport.' },
  21: { trigger: 'ei saa ylittää', rule: 'Speed limit must not be exceeded regardless of customer request.' },
  22: { trigger: 'Poliisi', rule: 'Police have authority (määräysvalta) when traffic instructions conflict.' },
  23: { trigger: 'kysyä asiakkaalta', rule: 'Ask the visually impaired customer how to help before assisting.' },
  24: { trigger: 'pelätä', rule: 'Blind customer may not know what happens during the ride and may fear. Pick pelätä, not ei pelkää.' },
  25: { trigger: 'tiedustelet / tarvitseeko', rule: 'Ask if the slow-moving customer needs help — do not grab without asking.' },
  27: { trigger: 'tulee käyttää turvavyötä', rule: 'School transport requires seat belts. Reject options with ei tarvitse.' },
  39: { trigger: 'rungosta', rule: 'Wheelchair must be secured from the frame (rungosta).' },
  41: { trigger: 'Huolehdit / määränpään / poliisi', rule: 'Ensure safety, find destination, call police if needed.' },
  54: { trigger: 'Kysy asiakkaalta', rule: 'Best practice: ask the blind customer how to help and indicate direction.' },
  74: { trigger: '135 cm', rule: 'Child under 135 cm needs an approved child restraint in taxi.' },
  80: { trigger: 'poliisille / poliisiasemalle', rule: 'Very intoxicated customer — contact police or take to nearest police station.' },
  81: { trigger: 'huolehdittava', rule: 'Under-15 passenger travelling alone — driver must ensure seat belt use.' },
  82: { trigger: 'aina käyttää turvavyötä', rule: 'Reverse question: driver must ALWAYS wear seat belt. Pick aina, reject ei tarvitse.' },
  83: { trigger: 'pakollista', rule: 'Providing a receipt (kuitti) to the customer is mandatory.' },
  84: { trigger: 'ennakoitava', rule: 'Driver must anticipate other road users\' behaviour.' },
  85: { trigger: 'Huolehdit / turvallisuudesta', rule: 'Intoxicated customer without address — ensure safety, find destination, police if needed.' },
  87: { trigger: 'löytötavaratoimistoon', rule: 'Return forgotten item promptly to customer or police lost-property office.' },
  88: { trigger: 'Koekäyttämällä', rule: 'Inspect the person lift by test-using it before departure.' },
  89: { trigger: 'Koekäyttämällä', rule: 'Same as Q88 — test the lift by using it.' },
  103: { trigger: 'Asiakas', rule: 'Customer who has turned 15 is responsible for own seat belt. Reject vapaaehtoista.' },
  136: { trigger: '15 ikävuoteen asti', rule: 'Driver is responsible for child\'s seat belt until age 15.' },
  137: { trigger: '135 cm', rule: 'Child under 135 cm always needs a child restraint device.' },
  139: { trigger: 'huolehdittava', rule: 'In this question set, pick huolehdittava for 15-vuotias solo passenger. If täyttäneen (turned 15), pick itse/Asiakas instead (see Q103).' },
  140: { trigger: 'aina käyttää turvavyötä', rule: 'Reverse question: driver always wears seat belt — no exemption.' },
  141: { trigger: 'pakollista', rule: 'Receipt is mandatory (pakollista), not voluntary (vapaaehtoista).' },
  142: { trigger: 'ennakoitava', rule: 'Driver must anticipate other road users as part of duty of care.' },
  114: { trigger: '112', rule: '112 is the general emergency number in Finland.' },
  138: { trigger: 'Pitää aina', rule: 'Taxi sign/light rules — always on unless specified otherwise in the question context.' },
  146: { trigger: 'picture / option B', rule: 'Image question — per answer key, correct option is B.' },
  147: { trigger: 'bus + taxi sign → B', rule: 'Picture shows bus lane and taxi sign — answer is B.' },
  149: { trigger: 'bus + taxi sign → B', rule: 'Picture shows bus lane and taxi sign — answer is B.' },
  150: { trigger: 'Image O → B', rule: 'Image question — correct option is B per answer key.' },
};

const TRANSLATIONS = {
  'jotta muut': 'so that others',
  'Hätäkeskus': 'Emergency Response Centre',
  sijainti: 'location',
  'Liikenteen valvojan': 'traffic controller',
  itse: 'self / themselves',
  Taksinkuljettaja: 'taxi driver',
  Kuljettaja: 'driver',
  Huolehdit: 'you ensure / take care of',
  huolehdittava: 'must be ensured',
  turvalaitteessa: 'child restraint / safety device',
  välttämätön: 'necessary',
  välttämättöntä: 'necessary',
  sisätilaan: 'indoors',
  'toisen paikan': 'another place',
  turvallinen: 'safe',
  määränpäähän: 'to destination',
  määränpäähänsä: 'to their destination',
  Poliisi: 'police',
  'poliisi paikalle': 'police to the scene',
  Työnantajan: "employer's",
  alkolukko: 'alcohol interlock',
  'Koulu- ja päivähoitokuljetuksissa': 'school and daycare transport',
  vastuullisen: 'responsible',
  pelätä: 'may fear',
  kysyä: 'to ask',
  asiakkaalta: 'the customer',
  rungosta: 'from the frame',
  pakollista: 'mandatory',
  ennakoitava: 'must anticipate',
  löytötavaratoimistoon: 'lost-property office',
  Koekäyttämällä: 'by test-using',
  vapaaehtoista: 'voluntary (usually wrong)',
  Asiakas: 'customer',
  '135 cm': '135 cm height rule',
  '15 ikävuoteen': 'until age 15',
  handsfree: 'handsfree device',
  turvavyö: 'seat belt',
  turvavyötä: 'seat belt',
  pyörätuoli: 'wheelchair',
  näkövamma: 'visually impaired',
  pakkasta: 'freezing weather',
  huolehtii: 'takes care of',
  Selvität: 'you find out / clarify',
  Neuvon: 'I advise',
  Valitettavasti: 'unfortunately',
  Rauhoittelet: 'you calm down',
  Tilaat: 'you order',
  Pyrkiä: 'to strive / aim',
  Lääkärin: "doctor's",
  Laillinen: 'legal',
  Kerrot: 'you tell',
  'ei saa': 'must not / may not',
  'ei saa ylittää': 'must not exceed',
};

function cleanKeywordText(text) {
  return text
    .replace(/[….…]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractKeywordsFromText(text) {
  const found = [];
  const lower = text.toLowerCase();
  for (const [fi, en] of Object.entries(TRANSLATIONS)) {
    const escaped = fi.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:^|[\\s,.:;])${escaped}(?:$|[\\s,.:;])`, 'i');
    if (re.test(` ${lower} `) || lower.startsWith(fi.toLowerCase())) {
      found.push({ fi, en });
    }
  }
  return found.slice(0, 3);
}

function detectTheme(q) {
  const all = (q.text + ' ' + q.options.map((o) => o.text).join(' ')).toLowerCase();
  if (/turvavyö|turvavyötä/.test(all)) return 'Seat belt responsibility — under 15 = driver, 15+ = itse. Reject vapaaehtoista.';
  if (/alle 3-vuotias|alle kolme|turvalaite|135 cm/.test(all)) return 'Child restraint rules — young/small children need approved safety devices.';
  if (/alkolukko|koulu|päivähoito/.test(all)) return 'School/daycare transport — alkolukko and employer duties apply.';
  if (/pyörätuoli/.test(all)) return 'Wheelchair transport — securing, customer autonomy, and driver assistance rules.';
  if (/näkövamma|näkövammainen/.test(all)) return 'Visually impaired customer — ask how to help before acting.';
  if (/handsfree|puhelin|puhelu/.test(all)) return 'Phone use — only when välttämätön and with handsfree while driving.';
  if (/päihtynyt|humalassa/.test(all)) return 'Intoxicated customer — safety first, find destination, police if needed.';
  if (/poliisi/.test(q.text.toLowerCase())) return 'Police involvement — follow correct procedure for the situation.';
  if (/vastuu|vastuulla|kenen/.test(q.text.toLowerCase())) return 'Responsibility question — check who is legally responsible.';
  if (/mikä seuraavista on oikein/.test(q.text.toLowerCase())) return 'Pick the legally correct, safest, and most professional option.';
  if (/miten toimit|kuinka sinun tulee/.test(q.text.toLowerCase())) return 'Procedure question — choose the safest and most responsible action.';
  return 'Read all options; pick the safest, most professional, and legally required answer.';
}

function buildKeywordLines(q, correctOpt, kwEntry, trigger) {
  const lines = [];
  const fromText = extractKeywordsFromText(correctOpt.text);
  const xlsxKw = kwEntry?.keywords ? cleanKeywordText(kwEntry.keywords) : '';

  if (trigger?.trigger) {
    const parts = trigger.trigger.split('/').map((p) => p.trim());
    lines.push(`Main keyword: ${parts[0]}`);
    if (parts[1]) lines.push(`Important keyword: ${parts[1]}`);
  } else if (xlsxKw && xlsxKw.length > 3 && !xlsxKw.startsWith('if ') && !xlsxKw.startsWith('answer')) {
    lines.push(`Keyword: ${xlsxKw.slice(0, 80)}`);
  }

  const labels = ['Keyword', 'Main keyword', 'Important keyword'];
  let labelIdx = lines.length;
  for (const { fi, en } of fromText) {
    if (lines.some((l) => l.toLowerCase().includes(fi.toLowerCase()))) continue;
    if (labelIdx >= 3) break;
    lines.push(`${labels[labelIdx] || 'Important keyword'}: ${fi} = ${en}`);
    labelIdx++;
  }

  if (lines.length === 0) {
    const snippet = correctOpt.text.slice(0, 60).trim();
    lines.push(`Keyword: ${snippet}${correctOpt.text.length > 60 ? '...' : ''}`);
  }

  return lines;
}

function buildExplanation(q, preserve) {
  if (preserve) return q.explanation;

  const correctOpt = q.options.find((o) => o.letter === q.correct);
  const kwEntry = kwById[q.id];
  const trigger = TRIGGERS[q.id];
  const parts = [`Answer: ${q.correct}`, ''];

  parts.push(...buildKeywordLines(q, correctOpt, kwEntry, trigger));
  parts.push('');

  if (kwEntry?.note) {
    parts.push(`Note: ${kwEntry.note}`);
    parts.push('');
  }

  if (q.id === 114) {
    parts.push('112 is the general emergency number (hätänumero) in Finland.');
  } else if (trigger?.rule) {
    parts.push(trigger.rule);
  } else if (kwEntry?.keywords && (kwEntry.keywords.startsWith('if ') || kwEntry.keywords.includes('answer is'))) {
    parts.push(`Trigger rule: ${cleanKeywordText(kwEntry.keywords)}`);
  } else {
    parts.push(detectTheme(q));
  }

  parts.push('');
  parts.push(`Correct answer: ${correctOpt.letter}`);

  return parts.join('\n');
}

for (const q of quiz) {
  const preserve = q.id <= 10 && q.explanation && q.explanation.startsWith('Answer:');
  q.explanation = buildExplanation(q, preserve);
}

const withExp = quiz.filter((q) => q.explanation && q.explanation.trim()).length;
fs.writeFileSync(path.join(root, 'quiz.json'), JSON.stringify(quiz, null, 2) + '\n');
console.log(`Wrote explanations for ${withExp}/150 questions in quiz.json`);
