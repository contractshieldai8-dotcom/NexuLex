const fs = require('fs');
let s = fs.readFileSync('i18n.js', 'utf8');
if (!s.includes("from './i18n.wavegr7'")) {
  s = s.replace("import { WAVE_ST4_I18N } from './i18n.wavest4';", "import { WAVE_ST4_I18N } from './i18n.wavest4';\nimport { WAVE_GR7_I18N } from './i18n.wavegr7';");
}
for (const L of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
  const needle = `...WAVE_ST4_I18N.${L},`;
  if (!s.includes(`...WAVE_GR7_I18N.${L},`)) s = s.replace(needle, `${needle}\n      ...WAVE_GR7_I18N.${L},`);
}
fs.writeFileSync('i18n.js', s);
console.log('wired GR.7');
