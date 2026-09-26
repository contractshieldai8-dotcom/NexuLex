const fs = require('fs');
let s = fs.readFileSync('i18n.js', 'utf8');
if (!s.includes("from './i18n.waveux13'")) {
  s = s.replace("import { WAVE_UX12_I18N } from './i18n.waveux12';", "import { WAVE_UX12_I18N } from './i18n.waveux12';\nimport { WAVE_UX13_I18N } from './i18n.waveux13';");
}
for (const L of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
  const needle = `...WAVE_UX12_I18N.${L},`;
  if (!s.includes(`...WAVE_UX13_I18N.${L},`)) s = s.replace(needle, `${needle}\n      ...WAVE_UX13_I18N.${L},`);
}
fs.writeFileSync('i18n.js', s);
console.log('wired UX.13');
