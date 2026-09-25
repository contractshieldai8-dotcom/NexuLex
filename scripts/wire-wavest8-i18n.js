const fs = require('fs');
let s = fs.readFileSync('i18n.js', 'utf8');
if (!s.includes("from './i18n.wavest8'")) {
  s = s.replace("import { WAVE_MX2_I18N } from './i18n.wavemx2';", "import { WAVE_MX2_I18N } from './i18n.wavemx2';\nimport { WAVE_ST8_I18N } from './i18n.wavest8';");
}
for (const L of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
  const needle = `...WAVE_MX2_I18N.${L},`;
  if (!s.includes(`...WAVE_ST8_I18N.${L},`)) s = s.replace(needle, `${needle}\n      ...WAVE_ST8_I18N.${L},`);
}
fs.writeFileSync('i18n.js', s);
console.log('wired ST.8');
