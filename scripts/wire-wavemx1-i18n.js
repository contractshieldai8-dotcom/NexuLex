const fs = require('fs');
let s = fs.readFileSync('i18n.js', 'utf8');
if (!s.includes("from './i18n.wavemx1'")) {
  s = s.replace("import { WAVE_GR6_I18N } from './i18n.wavegr6';", "import { WAVE_GR6_I18N } from './i18n.wavegr6';\nimport { WAVE_MX1_I18N } from './i18n.wavemx1';");
}
for (const L of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
  const needle = `...WAVE_GR6_I18N.${L},`;
  if (!s.includes(`...WAVE_MX1_I18N.${L},`)) s = s.replace(needle, `${needle}\n      ...WAVE_MX1_I18N.${L},`);
}
fs.writeFileSync('i18n.js', s);
console.log('wired MX.1');
