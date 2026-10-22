// Wires WAVE_AC1_I18N (sign-up legal agreement + AI consent) after WAVE_CL1_I18N in i18n.js and the verify-ui harness. Idempotent.
const fs = require('fs');

const rw = (file, fn) => {
  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const next = fn(raw.replace(/\r\n/g, '\n'));
  fs.writeFileSync(file, eol === '\r\n' ? next.replace(/\n/g, '\r\n') : next);
};

const must = (cond, msg) => {
  if (!cond) throw new Error(`wire-waveac1: ${msg}`);
};

rw('i18n.js', (s) => {
  if (!s.includes("from './i18n.waveac1'")) {
    s = s.replace("import { WAVE_CL1_I18N } from './i18n.wavecl1';", "import { WAVE_CL1_I18N } from './i18n.wavecl1';\nimport { WAVE_AC1_I18N } from './i18n.waveac1';");
  }
  for (const L of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
    const needle = `...WAVE_CL1_I18N.${L},`;
    if (!s.includes(`...WAVE_AC1_I18N.${L},`)) s = s.replace(needle, `${needle}\n      ...WAVE_AC1_I18N.${L},`);
  }
  const n = (s.match(/WAVE_AC1_I18N/g) || []).length;
  must(n === 14, `i18n.js expected 14 AC1 refs, got ${n}`);
  return s;
});

rw('scripts/verify-ui.js', (s) => {
  if (s.includes('WAVE_AC1_I18N')) return s;
  s = s.replace(
    /(const waveCl1Match = [^\n]*\n)/,
    "$1const waveAc1Src = fs.existsSync('i18n.waveac1.js') ? fs.readFileSync('i18n.waveac1.js', 'utf8') : '';\nconst waveAc1Match = waveAc1Src.match(/export const WAVE_AC1_I18N = ([\\s\\S]*);\\s*$/);\n",
  );
  s = s.replace('!waveCl1Match', '!waveCl1Match || !waveAc1Match');
  s = s.replace(
    /(const WAVE_CL1_I18N = eval\([^\n]*\n)/,
    '$1const WAVE_AC1_I18N = eval(`(${waveAc1Match[1]})`); // eslint-disable-line no-eval\n',
  );
  s = s.replace(/(\n(\s*)'WAVE_CL1_I18N',)/g, "$1\n$2'WAVE_AC1_I18N',");
  s = s.replace(/WAVE_CL1_I18N\);/, 'WAVE_CL1_I18N, WAVE_AC1_I18N);');
  s = s.replace(
    "eval(`(${fs.readFileSync('i18n.wavecl1.js', 'utf8').match(/export const WAVE_CL1_I18N = ([\\s\\S]*);\\s*$/)[1]})`)); // eslint-disable-line no-eval",
    "eval(`(${fs.readFileSync('i18n.wavecl1.js', 'utf8').match(/export const WAVE_CL1_I18N = ([\\s\\S]*);\\s*$/)[1]})`), // eslint-disable-line no-eval\n      eval(`(${fs.readFileSync('i18n.waveac1.js', 'utf8').match(/export const WAVE_AC1_I18N = ([\\s\\S]*);\\s*$/)[1]})`)); // eslint-disable-line no-eval",
  );
  const n = (s.match(/AC1|waveac1/gi) || []).length;
  console.log('verify-ui AC1 refs', n);
  must(n >= 9, `verify-ui expected >=9 AC1 refs, got ${n}`);
  return s;
});
