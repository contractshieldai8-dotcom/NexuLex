const fs = require('fs');
let s = fs.readFileSync('i18n.js', 'utf8');
if (!s.includes("from './i18n.wavegr8'")) {
  s = s.replace("import { WAVE_ST7_I18N } from './i18n.wavest7';", "import { WAVE_ST7_I18N } from './i18n.wavest7';\nimport { WAVE_GR8_I18N } from './i18n.wavegr8';");
}
for (const L of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
  const needle = `...WAVE_ST7_I18N.${L},`;
  if (!s.includes(`...WAVE_GR8_I18N.${L},`)) s = s.replace(needle, `${needle}\n      ...WAVE_GR8_I18N.${L},`);
}
fs.writeFileSync('i18n.js', s);
console.log('wired GR.8');
