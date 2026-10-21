// Wires WAVE_CL1_I18N (contract library) after WAVE_ECON1_I18N in i18n.js and the verify-ui harness. Idempotent.
const fs = require('fs');

const rw = (file, fn) => {
  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const next = fn(raw.replace(/\r\n/g, '\n'));
  fs.writeFileSync(file, eol === '\r\n' ? next.replace(/\n/g, '\r\n') : next);
};

const must = (cond, msg) => {
  if (!cond) throw new Error(`wire-wavecl1: ${msg}`);
};

rw('i18n.js', (s) => {
  if (!s.includes("from './i18n.wavecl1'")) {
    s = s.replace("import { WAVE_ECON1_I18N } from './i18n.waveecon1';", "import { WAVE_ECON1_I18N } from './i18n.waveecon1';\nimport { WAVE_CL1_I18N } from './i18n.wavecl1';");
  }
  for (const L of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
    const needle = `...WAVE_ECON1_I18N.${L},`;
    if (!s.includes(`...WAVE_CL1_I18N.${L},`)) s = s.replace(needle, `${needle}\n      ...WAVE_CL1_I18N.${L},`);
  }
  const n = (s.match(/WAVE_CL1_I18N/g) || []).length;
  must(n === 14, `i18n.js expected 14 CL1 refs, got ${n}`);
  console.log('i18n.js CL1 refs', n);
  return s;
});

rw('scripts/verify-ui.js', (s) => {
  if (s.includes('WAVE_CL1_I18N')) return s;
  // 1. source read + match
  s = s.replace(
    /(const waveEcon1Match = [^\n]*\n)/,
    "$1const waveCl1Src = fs.existsSync('i18n.wavecl1.js') ? fs.readFileSync('i18n.wavecl1.js', 'utf8') : '';\nconst waveCl1Match = waveCl1Src.match(/export const WAVE_CL1_I18N = ([\\s\\S]*);\\s*$/);\n",
  );
  // 2. guard on the match chain
  s = s.replace('!waveEcon1Match', '!waveEcon1Match || !waveCl1Match');
  // 3. eval of the parsed block
  s = s.replace(
    /(const WAVE_ECON1_I18N = eval\([^\n]*\n)/,
    '$1const WAVE_CL1_I18N = eval(`(${waveCl1Match[1]})`); // eslint-disable-line no-eval\n',
  );
  // 4. Function parameter name list + call argument list
  s = s.replace(/(\n(\s*)'WAVE_ECON1_I18N',)/g, "$1\n$2'WAVE_CL1_I18N',");
  s = s.replace(/WAVE_ECON1_I18N\);/, 'WAVE_ECON1_I18N, WAVE_CL1_I18N);');
  // 5. second harness eval list
  s = s.replace(
    "eval(`(${fs.readFileSync('i18n.waveecon1.js', 'utf8').match(/export const WAVE_ECON1_I18N = ([\\s\\S]*);\\s*$/)[1]})`)); // eslint-disable-line no-eval",
    "eval(`(${fs.readFileSync('i18n.waveecon1.js', 'utf8').match(/export const WAVE_ECON1_I18N = ([\\s\\S]*);\\s*$/)[1]})`), // eslint-disable-line no-eval\n      eval(`(${fs.readFileSync('i18n.wavecl1.js', 'utf8').match(/export const WAVE_CL1_I18N = ([\\s\\S]*);\\s*$/)[1]})`)); // eslint-disable-line no-eval",
  );
  // 6. source-block error message
  s = s.replace('UX38/UX39 kaynak', 'UX38/UX39/ECON1/CL1 kaynak');
  const n = (s.match(/CL1|wavecl1/gi) || []).length;
  console.log('verify-ui CL1 refs', n);
  must(n >= 9, `verify-ui expected >=9 CL1 refs, got ${n}`);
  return s;
});
