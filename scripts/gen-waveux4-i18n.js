const fs = require('fs');
const path = require('path');
const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const only = process.argv[2];
const load = (lang) => {
  const file = path.join(__dirname, 'l10n', `waveux4.${lang}.js`);
  delete require.cache[require.resolve(file)];
  return require(file);
};
const digitsOf = (value) => (value.replace(/\{\{\w+\}\}/g, '').match(/[0-9]+/g) || []).sort().join();
const en = load('en');
const baseKeys = Object.keys(en);
const out = {};
const problems = [];
for (const lang of only ? [only] : langs) {
  const table = load(lang);
  const missing = baseKeys.filter((key) => typeof table[key] !== 'string' || !table[key].trim());
  const extra = Object.keys(table).filter((key) => !baseKeys.includes(key));
  if (missing.length || extra.length) problems.push(`${lang}: missing=[${missing}] extra=[${extra}]`);
  for (const key of baseKeys) {
    const value = table[key];
    if (typeof value !== 'string') continue;
    if ((en[key].match(/\{\{\w+\}\}/g) || []).join() !== (value.match(/\{\{\w+\}\}/g) || []).join()) problems.push(`${lang}.${key}: placeholders`);
    if (digitsOf(value) !== digitsOf(en[key])) problems.push(`${lang}.${key}: numbers`);
    if (/%|guarantee|garanti\b|best lawyer|en iyi avukat|win rate|TBK|BGB/i.test(value)) problems.push(`${lang}.${key}: claims`);
    if (lang !== 'en' && value.length >= 12 && value === en[key]) problems.push(`${lang}.${key}: identical to EN`);
    if ((lang === 'ar' || lang === 'fa') && (/→/.test(value) || /[\u0600-\u06FF][^?]*\?(\s|$)/.test(value))) problems.push(`${lang}.${key}: RTL`);
  }
  if (!/NexuLex/.test(table.ux4Lawyer || '') || !/NexuLex/.test(table.ux4Disclaimer || '')) problems.push(`${lang}: lawyer/disclaimer must name NexuLex`);
  out[lang] = Object.fromEntries(baseKeys.map((key) => [key, table[key]]));
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
if (only) { console.log(`${only} ok`); process.exit(0); }
fs.writeFileSync(path.join(__dirname, '..', 'i18n.waveux4.js'), `// WAVE UX.4 — advisor home job honesty. Same key set in all 13 languages.\n\nexport const WAVE_UX4_I18N = ${JSON.stringify(out, null, 2)};\n`);
console.log('Wrote i18n.waveux4.js keys=', baseKeys.length);
