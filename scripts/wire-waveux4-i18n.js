const fs = require('fs');
let s = fs.readFileSync('i18n.js', 'utf8');
if (!s.includes("from './i18n.waveux4'")) {
  s = s.replace("import { WAVE_GR8_I18N } from './i18n.wavegr8';", "import { WAVE_GR8_I18N } from './i18n.wavegr8';\nimport { WAVE_UX4_I18N } from './i18n.waveux4';");
}
for (const L of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
  const needle = `...WAVE_GR8_I18N.${L},`;
  if (!s.includes(`...WAVE_UX4_I18N.${L},`)) s = s.replace(needle, `${needle}\n      ...WAVE_UX4_I18N.${L},`);
}
fs.writeFileSync('i18n.js', s);
console.log('wired UX.4');
