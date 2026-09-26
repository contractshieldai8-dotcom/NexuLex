const fs = require('fs');
let s = fs.readFileSync('i18n.js', 'utf8');
if (!s.includes("from './i18n.waveux23'")) {
  s = s.replace("import { WAVE_UX22_I18N } from './i18n.waveux22';", "import { WAVE_UX22_I18N } from './i18n.waveux22';\nimport { WAVE_UX23_I18N } from './i18n.waveux23';");
}
for (const L of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
  const needle = `...WAVE_UX22_I18N.${L},`;
  if (!s.includes(`...WAVE_UX23_I18N.${L},`)) s = s.replace(needle, `${needle}\n      ...WAVE_UX23_I18N.${L},`);
}
fs.writeFileSync('i18n.js', s);
console.log('wired UX.23');
