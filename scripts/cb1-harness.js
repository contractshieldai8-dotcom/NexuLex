// Node harness: evaluates app ESM source files (constants/utils/services) without Metro.
// Each file runs in its own Function scope; imports are resolved from already-loaded modules.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];

function loadWave(file, name) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return null;
  const m = fs.readFileSync(p, 'utf8').match(new RegExp(`export const ${name} = ([\\s\\S]*);\\s*$`));
  return m ? eval(`(${m[1]})`) : null; // eslint-disable-line no-eval
}

function buildResources() {
  const waves = [
    loadWave('i18n.waveca.js', 'WAVE_CA_I18N'),
    loadWave('i18n.wavecb.js', 'WAVE_CB_I18N'),
    loadWave('i18n.wavecc.js', 'WAVE_CC_I18N'),
    loadWave('i18n.wavecb1.js', 'WAVE_CB1_I18N'),
  ].filter(Boolean);
  const res = {};
  for (const L of LANGS) {
    res[L] = {};
    waves.forEach((w) => Object.assign(res[L], w[L] || {}));
  }
  return res;
}

function interpolate(str, opts) {
  return String(str).replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) =>
    opts && opts[k] !== undefined ? String(opts[k]) : ''
  );
}

function makeI18nStub(res, language = 'tr') {
  const lookup = (lang, key) => {
    const l = String(lang || 'en').slice(0, 2);
    return res[l]?.[key] ?? res.en?.[key];
  };
  return {
    language,
    getResource: (lang, _ns, key) => res[String(lang).slice(0, 2)]?.[key],
    getFixedT: (lang) => (key, opts) => {
      const v = lookup(lang, key);
      return v === undefined ? key : interpolate(v, opts);
    },
    t: (key, opts) => {
      const v = lookup(language, key);
      return v === undefined ? key : interpolate(v, opts);
    },
  };
}

function makeT(res, lang) {
  return (key, opts) => {
    const v = res[lang]?.[key] ?? res.en?.[key];
    return v === undefined ? key : interpolate(v, opts);
  };
}

const IMPORT_RE = /import\s+(?:(\w+)|\{([^}]+)\})\s+from\s+'([^']+)';?/g;
const EXPORT_NAME_RE = /export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)/g;

function loadModules(files, i18nStub) {
  const registry = {};
  for (const rel of files) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    let src = fs.readFileSync(abs, 'utf8');
    const params = [];
    const values = [];
    src = src.replace(IMPORT_RE, (_m, def, named, from) => {
      let mod;
      if (/\/i18n$/.test(from)) mod = { default: i18nStub };
      else {
        const key = path
          .normalize(path.join(path.dirname(rel), from))
          .replace(/\\/g, '/')
          .replace(/\.js$/, '');
        mod = registry[key];
        if (!mod) throw new Error(`harness: ${rel} imports unloaded ${from}`);
      }
      if (def) {
        params.push(def);
        values.push(mod.default);
      } else {
        named.split(',').map((s) => s.trim()).filter(Boolean).forEach((name) => {
          params.push(name);
          values.push(mod[name]);
        });
      }
      return '';
    });
    const names = [...src.matchAll(EXPORT_NAME_RE)].map((m) => m[1]);
    src = src.replace(/export\s+(?=(?:async\s+)?(?:function|const|let|class)\s)/g, '');
    const body = `${src}\nreturn { ${names.join(', ')} };`;
    const mod = new Function(...params, body)(...values); // eslint-disable-line no-new-func
    registry[rel.replace(/\.js$/, '')] = mod;
  }
  return registry;
}

const APP_FILES = [
  'constants/jurisdiction.js',
  'constants/legalCalcRates.js',
  'utils/legalCalculators.js',
  'constants/legalScenarios.js',
  'constants/draftTemplates.js',
  'services/scenarioRoadmap.js',
  'services/guidedDraft.js',
];

function loadApp(language = 'tr') {
  const res = buildResources();
  const i18n = makeI18nStub(res, language);
  const reg = loadModules(APP_FILES, i18n);
  const api = {};
  Object.values(reg).forEach((m) => Object.assign(api, m));
  return { api, res, i18n, t: (lang) => makeT(res, lang) };
}

module.exports = { loadApp, LANGS, buildResources, makeT };
