const fs = require('fs');
let s = fs.readFileSync('i18n.js', 'utf8');
if (!s.includes("from './i18n.waveux1'")) {
  s = s.replace(
    "import { WAVE_ST_I18N } from './i18n.wavest';",
    "import { WAVE_ST_I18N } from './i18n.wavest';\nimport { WAVE_UX1_I18N } from './i18n.waveux1';"
  );
}
const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
for (const L of langs) {
  const needle = `...WAVE_ST_I18N.${L},`;
  const repl = `${needle}\n      ...WAVE_UX1_I18N.${L},`;
  if (s.includes(`...WAVE_UX1_I18N.${L},`)) continue;
  if (!s.includes(needle)) {
    console.error('missing', L);
    process.exit(1);
  }
  s = s.replace(needle, repl);
}
fs.writeFileSync('i18n.js', s);
console.log('wired UX.1');
