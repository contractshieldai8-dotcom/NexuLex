const fs = require('fs');
let s = fs.readFileSync('i18n.js', 'utf8');
if (!s.includes("from './i18n.wavest7'")) {
  s = s.replace("import { WAVE_ST6_I18N } from './i18n.wavest6';", "import { WAVE_ST6_I18N } from './i18n.wavest6';\nimport { WAVE_ST7_I18N } from './i18n.wavest7';");
}
for (const L of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
  const needle = `...WAVE_ST6_I18N.${L},`;
  if (!s.includes(`...WAVE_ST7_I18N.${L},`)) s = s.replace(needle, `${needle}\n      ...WAVE_ST7_I18N.${L},`);
}
fs.writeFileSync('i18n.js', s);
console.log('wired ST.7');
