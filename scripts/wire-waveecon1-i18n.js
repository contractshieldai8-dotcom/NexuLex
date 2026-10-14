// WAVE ECON.1 — wires i18n.waveecon1.js after WAVE_D1 in i18n.js and scripts/verify-ui.js. Safe to re-run.
const fs = require('fs');

const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];

let i18n = fs.readFileSync('i18n.js', 'utf8');
if (!i18n.includes("from './i18n.waveecon1'")) {
  i18n = i18n.replace("import { WAVE_D1_I18N } from './i18n.waved1';", "import { WAVE_D1_I18N } from './i18n.waved1';\nimport { WAVE_ECON1_I18N } from './i18n.waveecon1';");
}
for (const L of LANGS) {
  if (i18n.includes(`...WAVE_ECON1_I18N.${L},`)) continue;
  const needle = `      ...WAVE_D1_I18N.${L},`;
  if (!i18n.includes(needle)) throw new Error(`i18n.js: no D1 spread for ${L}`);
  i18n = i18n.replace(needle, `${needle}\n      ...WAVE_ECON1_I18N.${L},`);
}
fs.writeFileSync('i18n.js', i18n);

let v = fs.readFileSync('scripts/verify-ui.js', 'utf8');
const swap = (from, to, label) => {
  if (!v.includes(from)) throw new Error(`verify-ui: anchor missing: ${label}`);
  v = v.replace(from, to);
};
if (!v.includes('waveEcon1Src')) {
  swap(
    "const waveD1Match = waveD1Src.match(/export const WAVE_D1_I18N = ([\\s\\S]*);\\s*$/);",
    "const waveD1Match = waveD1Src.match(/export const WAVE_D1_I18N = ([\\s\\S]*);\\s*$/);\nconst waveEcon1Src = fs.existsSync('i18n.waveecon1.js') ? fs.readFileSync('i18n.waveecon1.js', 'utf8') : '';\nconst waveEcon1Match = waveEcon1Src.match(/export const WAVE_ECON1_I18N = ([\\s\\S]*);\\s*$/);",
    'read'
  );
  swap(
    "const WAVE_D1_I18N = eval(`(${waveD1Match[1]})`); // eslint-disable-line no-eval",
    "const WAVE_D1_I18N = eval(`(${waveD1Match[1]})`); // eslint-disable-line no-eval\nconst WAVE_ECON1_I18N = eval(`(${waveEcon1Match[1]})`); // eslint-disable-line no-eval",
    'eval'
  );
  v = v.replace(/^( +)'WAVE_D1_I18N',\r?\n/gm, (line, indent) => `${line}${indent}'WAVE_ECON1_I18N',\n`);
  swap('WAVE_LG1_I18N, WAVE_D1_I18N);', 'WAVE_LG1_I18N, WAVE_D1_I18N, WAVE_ECON1_I18N);', 'call 1');
  swap(
    "eval(`(${fs.readFileSync('i18n.waved1.js', 'utf8').match(/export const WAVE_D1_I18N = ([\\s\\S]*);\\s*$/)[1]})`)); // eslint-disable-line no-eval",
    "eval(`(${fs.readFileSync('i18n.waved1.js', 'utf8').match(/export const WAVE_D1_I18N = ([\\s\\S]*);\\s*$/)[1]})`), // eslint-disable-line no-eval\n      eval(`(${fs.readFileSync('i18n.waveecon1.js', 'utf8').match(/export const WAVE_ECON1_I18N = ([\\s\\S]*);\\s*$/)[1]})`)); // eslint-disable-line no-eval",
    'call 2'
  );
}
fs.writeFileSync('scripts/verify-ui.js', v);
console.log('wired');
