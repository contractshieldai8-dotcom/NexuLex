const fs = require('fs');
let s = fs.readFileSync('i18n.js', 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';
s = s.replace(/\r\n/g, '\n');
if (!s.includes("from './i18n.waveux39'")) {
  s = s.replace("import { WAVE_UX38_I18N } from './i18n.waveux38';", "import { WAVE_UX38_I18N } from './i18n.waveux38';\nimport { WAVE_UX39_I18N } from './i18n.waveux39';");
}
for (const L of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
  const needle = `...WAVE_UX38_I18N.${L},`;
  if (!s.includes(`...WAVE_UX39_I18N.${L},`)) s = s.replace(needle, `${needle}\n      ...WAVE_UX39_I18N.${L},`);
}
fs.writeFileSync('i18n.js', eol === '\r\n' ? s.replace(/\n/g, '\r\n') : s);
console.log('wired UX.39', (s.match(/WAVE_UX39_I18N/g) || []).length);
