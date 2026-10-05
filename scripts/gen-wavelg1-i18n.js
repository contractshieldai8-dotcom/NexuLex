const fs = require('fs');
const path = require('path');
const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const load = (lang) => {
  const file = path.join(__dirname, 'l10n', `wavelg1.${lang}.js`);
  delete require.cache[require.resolve(file)];
  return require(file);
};
const en = load('en');
const baseKeys = Object.keys(en);
const out = {};
const problems = [];
for (const lang of langs) {
  const table = load(lang);
  for (const key of baseKeys) {
    const value = table[key];
    if (typeof value !== 'string' || !value.trim()) { problems.push(`${lang}.${key}: missing`); continue; }
    if (!/NexuLex/.test(value)) problems.push(`${lang}.${key}: brand`);
    if (!/24/.test(value)) problems.push(`${lang}.${key}: 24h rule`);
    if (!/App[ -]Store/.test(value) || !/Google[ -]Play/.test(value)) problems.push(`${lang}.${key}: stores`);
    if (lang !== 'en' && value === en[key]) problems.push(`${lang}.${key}: identical to EN`);
  }
  out[lang] = Object.fromEntries(baseKeys.map((key) => [key, table[key]]));
}
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
fs.writeFileSync(path.join(__dirname, '..', 'i18n.wavelg1.js'), `// WAVE C.1 - paywall auto-renewal disclosure (Apple 3.1.2). Same key set in all 13 languages.\n\nexport const WAVE_LG1_I18N = ${JSON.stringify(out, null, 2)};\n`);
console.log('Wrote i18n.wavelg1.js keys=', baseKeys.length);