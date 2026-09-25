// WAVE QA.1 — native overrides for keys whose value was still the English text in 11 locales.
// TR and EN are untouched (empty tables), so TR goldens stay byte-identical.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const overridden = langs.filter((L) => L !== 'tr' && L !== 'en');
const REQUIRED = [
  'voiceRecognitionUnavailable', 'voiceNoSpeech', 'voiceListen', 'voiceListening', 'voiceUnavailable', 'voicePermissionDenied', 'voiceSpeakError',
  'legalStatusValid', 'legalStatusVoid', 'legalStatusPartial', 'legalStatusQuestionable', 'validityRemedyLabel',
  'hiddenCostIncrease', 'hiddenCostEarlyExit', 'hiddenCostNotice', 'hiddenCostInterest', 'costWidgetHint', 'clauseIssueMissing',
  'diffHint', 'diffOriginal', 'diffRevised', 'diffEmpty', 'diffWhatChanged', 'diffWhoWon', 'diffWinnerUser', 'diffWinnerOther',
  'diffWinnerMixed', 'diffWorsened', 'diffImproved', 'diffNeutral', 'diffRedline',
  'playbookRentEviction', 'playbookLaborSeverance', 'playbookFreelanceScope', 'playbookFreelancePay', 'playbookConsumerUnfair', 'playbookConsumerWithdraw',
];
const OPTIONAL = { de: ['typeSaaS'] };
// Same spelling as English and correct in that language.
const SAME_AS_EN_OK = { de: ['diffNeutral'] };

const only = process.argv[2];
const load = (lang) => {
  const file = path.join(__dirname, 'l10n', `waveqa1.${lang}.js`);
  delete require.cache[require.resolve(file)];
  return require(file);
};

// Core EN as the app builds it, without this wave.
const src = fs.readFileSync(path.join(ROOT, 'i18n.js'), 'utf8');
const imports = [...src.matchAll(/import \{ (\w+) \} from '\.\/([\w.]+)';/g)].filter(([, name]) => name !== 'WAVE_QA1_I18N');
const names = imports.map(([, name]) => name);
const values = imports.map(([, name, file]) => Function(`${fs.readFileSync(path.join(ROOT, `${file}.js`), 'utf8').replace(/^export /gm, '')}\nreturn ${name};`)());
const body = src.match(/const resources = ([\s\S]*?);\s*\n\s*i18n\.use/)[1].replace(/\s*\.\.\.WAVE_QA1_I18N\.\w+,/g, '');
const en = Function(...names, `return (${body});`)(...values).en.translation;

const out = { tr: {}, en: {} };
const problems = [];
for (const lang of only ? [only] : overridden) {
  const table = load(lang);
  const allowed = [...REQUIRED, ...(OPTIONAL[lang] || [])];
  const missing = REQUIRED.filter((key) => typeof table[key] !== 'string' || !table[key].trim());
  const extra = Object.keys(table).filter((key) => !allowed.includes(key));
  if (missing.length || extra.length) problems.push(`${lang}: missing=[${missing}] extra=[${extra}]`);
  for (const [key, value] of Object.entries(table)) {
    if (typeof en[key] !== 'string') {
      problems.push(`${lang}.${key}: not a core key`);
      continue;
    }
    const want = (en[key].match(/\{\{\w+\}\}/g) || []).sort().join();
    const got = (value.match(/\{\{\w+\}\}/g) || []).sort().join();
    if (want !== got) problems.push(`${lang}.${key}: placeholders ${got} != ${want}`);
    if (value === en[key] && !(SAME_AS_EN_OK[lang] || []).includes(key)) problems.push(`${lang}.${key}: identical to EN`);
    if (lang === 'ar' || lang === 'fa') {
      if (/→/.test(value)) problems.push(`${lang}.${key}: → in RTL copy`);
      if (/[\u0600-\u06FF][^?]*\?(\s|$)/.test(value)) problems.push(`${lang}.${key}: ASCII ? after RTL text`);
    }
  }
  out[lang] = Object.fromEntries(allowed.filter((key) => table[key]).map((key) => [key, table[key]]));
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
if (only) {
  console.log(`${only} ok (${Object.keys(out[only]).length} keys)`);
  process.exit(0);
}
const ordered = Object.fromEntries(langs.map((L) => [L, out[L]]));
const file = `// WAVE QA.1 — native copy for keys that still showed English in 11 locales. TR / EN unchanged.\n\nexport const WAVE_QA1_I18N = ${JSON.stringify(ordered, null, 2)};\n`;
fs.writeFileSync(path.join(ROOT, 'i18n.waveqa1.js'), file, 'utf8');
console.log('Wrote i18n.waveqa1.js keys=', REQUIRED.length, 'locales=', overridden.length);
