const fs = require('fs');
let s = fs.readFileSync('i18n.js', 'utf8');
if (!s.includes("from './i18n.wavemx2'")) {
  s = s.replace("import { WAVE_UX4_I18N } from './i18n.waveux4';", "import { WAVE_UX4_I18N } from './i18n.waveux4';\nimport { WAVE_MX2_I18N } from './i18n.wavemx2';");
}
for (const L of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
  const needle = `...WAVE_UX4_I18N.${L},`;
  if (!s.includes(`...WAVE_MX2_I18N.${L},`)) s = s.replace(needle, `${needle}\n      ...WAVE_MX2_I18N.${L},`);
}
fs.writeFileSync('i18n.js', s);
console.log('wired MX.2');
