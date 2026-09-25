const fs = require('fs');
let s = fs.readFileSync('i18n.js', 'utf8');
if (!s.includes("from './i18n.wavelr4'")) {
  s = s.replace(
    "import { WAVE_LR3_I18N } from './i18n.wavelr3';",
    "import { WAVE_LR3_I18N } from './i18n.wavelr3';\nimport { WAVE_LR4_I18N } from './i18n.wavelr4';"
  );
}
const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
for (const L of langs) {
  const needle = `...WAVE_LR3_I18N.${L},`;
  if (s.includes(`...WAVE_LR4_I18N.${L},`)) continue;
  if (!s.includes(needle)) {
    console.error('missing', L);
    process.exit(1);
  }
  s = s.replace(needle, `${needle}\n      ...WAVE_LR4_I18N.${L},`);
}
fs.writeFileSync('i18n.js', s);
console.log('wired LR.4');
