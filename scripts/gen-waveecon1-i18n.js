// WAVE ECON.1 — builds i18n.waveecon1.js from scripts/l10n/waveecon1.js. Same key set, same placeholders in all 13 languages.
const fs = require('fs');
const path = require('path');

const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const all = require('./l10n/waveecon1.js');
const en = all.en;
const baseKeys = Object.keys(en);
const problems = [];
const out = {};
const digits = (value) => (value.replace(/\{\{\w+\}\}/g, '').match(/[0-9]+/g) || []).join();

for (const lang of langs) {
  const table = all[lang];
  if (!table) { problems.push(`${lang}: missing`); continue; }
  const missing = baseKeys.filter((key) => typeof table[key] !== 'string' || !table[key].trim());
  const extra = Object.keys(table).filter((key) => !baseKeys.includes(key));
  if (missing.length || extra.length) problems.push(`${lang}: missing=[${missing}] extra=[${extra}]`);
  for (const key of baseKeys) {
    const value = table[key];
    if (typeof value !== 'string') continue;
    const want = (en[key].match(/\{\{\w+\}\}/g) || []).sort().join();
    const got = (value.match(/\{\{\w+\}\}/g) || []).sort().join();
    if (want !== got) problems.push(`${lang}.${key}: placeholders ${got} != ${want}`);
    if (digits(value) !== digits(en[key])) problems.push(`${lang}.${key}: no typed numbers, use placeholders`);
    if (/%|guarantee|garanti\b|garantiert|garantizad|garantit/i.test(value)) problems.push(`${lang}.${key}: no odds or guarantees`);
    if (lang !== 'en' && value === en[key]) problems.push(`${lang}.${key}: identical to EN`);
    if ((lang === 'ar' || lang === 'fa') && (/→/.test(value) || /[\u0600-\u06FF][^?]*\?(\s|$)/.test(value))) problems.push(`${lang}.${key}: RTL`);
  }
  if (table.ux8Quota !== table.st8Ask) problems.push(`${lang}: ux8Quota and st8Ask must match`);
  out[lang] = Object.fromEntries(baseKeys.map((key) => [key, table[key]]));
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
const file = `// WAVE ECON.1 — cost protection: free lifetime + weekly, monthly caps, period-aware quota lines. Same key set in all 13 languages.\n\nexport const WAVE_ECON1_I18N = ${JSON.stringify(out, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'i18n.waveecon1.js'), file, 'utf8');
console.log('Wrote i18n.waveecon1.js keys=', baseKeys.length, 'langs=', langs.length);
