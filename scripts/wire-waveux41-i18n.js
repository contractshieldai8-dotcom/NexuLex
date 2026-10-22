// Wires WAVE_UX41_I18N next to WAVE_UX40_I18N in i18n.js and the verify-ui harness. Idempotent.
const fs = require('fs');

const rw = (file, fn) => {
  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const next = fn(raw.replace(/\r\n/g, '\n'));
  fs.writeFileSync(file, eol === '\r\n' ? next.replace(/\n/g, '\r\n') : next);
};

rw('i18n.js', (s) => {
  if (!s.includes("from './i18n.waveux41'")) {
    s = s.replace("import { WAVE_UX40_I18N } from './i18n.waveux40';", "import { WAVE_UX40_I18N } from './i18n.waveux40';\nimport { WAVE_UX41_I18N } from './i18n.waveux41';");
  }
  for (const L of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
    const needle = `...WAVE_UX40_I18N.${L},`;
    if (!s.includes(`...WAVE_UX41_I18N.${L},`)) s = s.replace(needle, `${needle}\n      ...WAVE_UX41_I18N.${L},`);
  }
  console.log('i18n.js UX41 refs', (s.match(/WAVE_UX41_I18N/g) || []).length);
  return s;
});

rw('scripts/verify-ui.js', (s) => {
  if (s.includes('WAVE_UX41_I18N')) return s;
  s = s.replace(
    /(const waveUx40Match = [^\n]*\n)/,
    "$1const waveUx41Src = fs.existsSync('i18n.waveux41.js') ? fs.readFileSync('i18n.waveux41.js', 'utf8') : '';\nconst waveUx41Match = waveUx41Src.match(/export const WAVE_UX41_I18N = ([\\s\\S]*);\\s*$/);\n",
  );
  s = s.replace(
    /(  const WAVE_UX40_I18N = eval\([^\n]*\n)/,
    '$1  const WAVE_UX41_I18N = eval(`(${waveUx41Match[1]})`); // eslint-disable-line no-eval\n',
  );
  s = s.replace(/(\n(\s*)'WAVE_UX40_I18N',)/g, "$1\n$2'WAVE_UX41_I18N',");
  s = s.replace(/WAVE_UX40_I18N, WAVE_LG1_I18N/g, 'WAVE_UX40_I18N, WAVE_UX41_I18N, WAVE_LG1_I18N');
  s = s.replace(
    /(      eval\(`\(\$\{fs\.readFileSync\('i18n\.waveux40\.js'[^\n]*\n)/,
    "$1      eval(`(${fs.readFileSync('i18n.waveux41.js', 'utf8').match(/export const WAVE_UX41_I18N = ([\\s\\S]*);\\s*$/)[1]})`), // eslint-disable-line no-eval\n",
  );
  s = s.replace("'waveux40', 'wavelg1'", "'waveux40', 'waveux41', 'wavelg1'");
  console.log('verify-ui UX41 refs', (s.match(/UX41|waveux41/gi) || []).length);
  return s;
});
