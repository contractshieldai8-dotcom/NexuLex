const fs = require('fs');
let s = fs.readFileSync('i18n.js', 'utf8');
if (!s.includes("from './i18n.wavegd2'")) {
  s = s.replace(
    "import { WAVE_JP2_I18N } from './i18n.wavejp2';",
    "import { WAVE_JP2_I18N } from './i18n.wavejp2';\nimport { WAVE_GD2_I18N } from './i18n.wavegd2';"
  );
}
const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
for (const L of langs) {
  const needle = `...WAVE_JP2_I18N.${L},`;
  const repl = `${needle}\n      ...WAVE_GD2_I18N.${L},`;
  if (s.includes(`...WAVE_GD2_I18N.${L},`)) continue;
  if (!s.includes(needle)) {
    console.error('missing', L);
    process.exit(1);
  }
  s = s.replace(needle, repl);
}
fs.writeFileSync('i18n.js', s);
console.log('wired GD.2');
