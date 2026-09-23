const fs = require('fs');
let s = fs.readFileSync('i18n.js', 'utf8');
if (!s.includes("from './i18n.wavecc'")) {
  s = s.replace(
    "import { WAVE_CB_I18N } from './i18n.wavecb';",
    "import { WAVE_CB_I18N } from './i18n.wavecb';\nimport { WAVE_CC_I18N } from './i18n.wavecc';"
  );
}
const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
for (const L of langs) {
  const needle = `...WAVE_CB_I18N.${L},`;
  const repl = `${needle}\n      ...WAVE_CC_I18N.${L},`;
  if (s.includes(`...WAVE_CC_I18N.${L},`)) continue;
  if (!s.includes(needle)) {
    console.error('missing', L);
    process.exit(1);
  }
  s = s.replace(needle, repl);
}
fs.writeFileSync('i18n.js', s);
console.log('wired CC');
