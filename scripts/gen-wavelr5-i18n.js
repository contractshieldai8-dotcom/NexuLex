// WAVE LR.5 — Professional tier copy. Authored per locale in scripts/l10n/wavelr5.<lang>.js; same key set in all 13 languages.
const fs = require('fs');
const path = require('path');

const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const only = process.argv[2];
const load = (lang) => {
  const file = path.join(__dirname, 'l10n', `wavelr5.${lang}.js`);
  delete require.cache[require.resolve(file)];
  return require(file);
};
// Plan limits are real numbers: each locale must state exactly the numbers EN states, in ASCII digits.
const digitsOf = (value) => (value.replace(/\{\{\w+\}\}/g, '').match(/[0-9]+/g) || []).sort().join();

const en = load('en');
const baseKeys = Object.keys(en);
const out = {};
const problems = [];
for (const lang of only ? [only] : langs) {
  if (!fs.existsSync(path.join(__dirname, 'l10n', `wavelr5.${lang}.js`))) {
    problems.push(`${lang}: file missing`);
    continue;
  }
  const table = load(lang);
  const missing = baseKeys.filter((key) => typeof table[key] !== 'string' || !table[key].trim());
  const extra = Object.keys(table).filter((key) => !baseKeys.includes(key));
  if (missing.length || extra.length) problems.push(`${lang}: missing=[${missing}] extra=[${extra}]`);
  for (const key of baseKeys) {
    const value = table[key];
    if (typeof value !== 'string') continue;
    const want = (en[key].match(/\{\{\w+\}\}/g) || []).sort().join();
    const got = (value.match(/\{\{\w+\}\}/g) || []).sort().join();
    if (want !== got) problems.push(`${lang}.${key}: placeholders ${got} != ${want}`);
    if (/[\u0660-\u0669\u06F0-\u06F9]/.test(value)) problems.push(`${lang}.${key}: use ASCII digits for plan limits`);
    if (digitsOf(value) !== digitsOf(en[key])) problems.push(`${lang}.${key}: numbers ${digitsOf(value)} != ${digitsOf(en[key])}`);
    if (/%|guarantee|garanti\b|garantiert|garantizad|garantit/i.test(value)) problems.push(`${lang}.${key}: no odds or guarantees`);
    if (lang !== 'en' && value.length >= 12 && value === en[key]) problems.push(`${lang}.${key}: identical to EN`);
    if (lang === 'ar' || lang === 'fa') {
      if (/→/.test(value)) problems.push(`${lang}.${key}: → in RTL copy`);
      if (/[\u0600-\u06FF][^?]*\?(\s|$)/.test(value)) problems.push(`${lang}.${key}: ASCII ? after RTL text`);
    }
  }
  if (!/NexuLex/.test(table.ptDisclaimer || '')) problems.push(`${lang}.ptDisclaimer: must name NexuLex`);
  out[lang] = Object.fromEntries(baseKeys.map((key) => [key, table[key]]));
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
if (only) {
  console.log(`${only} ok (${baseKeys.length} keys)`);
  process.exit(0);
}
const file = `// WAVE LR.5 — Professional tier: workbench, plan tiers, paywall, seats, guide workflow. Same key set in all 13 languages.\n\nexport const WAVE_LR5_I18N = ${JSON.stringify(out, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'i18n.wavelr5.js'), file, 'utf8');
console.log('Wrote i18n.wavelr5.js keys=', baseKeys.length, 'langs=', langs.length);
