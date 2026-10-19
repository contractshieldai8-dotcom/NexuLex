// WAVE ECON.4: runs the app's own ES-module sources (services/ai.js, utils/*.js, constants/*.js) in plain Node, without
// Metro, so the benchmark exercises the REAL prompts, parsers and acceptance rules instead of copies of them.
// Each file is evaluated in its own Function scope; relative imports are loaded recursively; native-only modules
// (the Supabase client, AsyncStorage) are replaced by the stubs you pass in. Same technique as scripts/cb1-harness.js.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const IMPORT_RE = /^import\s+([\s\S]*?)\s+from\s+'([^']+)';?[ \t]*$/gm;
const EXPORT_RE = /export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)/g;

function parseSpecifiers(clause) {
  const out = [];
  const named = clause.match(/\{([\s\S]*)\}/);
  const head = clause.replace(/\{[\s\S]*\}/, '').replace(/,/g, ' ').trim();
  if (head.startsWith('* as ')) out.push({ local: head.slice(5).trim(), imported: '*' });
  else if (head) out.push({ local: head, imported: 'default' });
  if (named) {
    for (const part of named[1].split(',').map((s) => s.trim()).filter(Boolean)) {
      const [imported, local] = part.split(/\s+as\s+/);
      out.push({ local: (local || imported).trim(), imported: imported.trim() });
    }
  }
  return out;
}

// stubs: { 'services/supabase': { supabase: {...} }, '@react-native-async-storage/async-storage': { default: {...} } }
export function createAppLoader({ stubs = {} } = {}) {
  const cache = new Map();
  const loading = new Set();

  const resolve = (fromRel, specifier) => {
    if (!specifier.startsWith('.')) return specifier;
    const base = path.posix.normalize(path.posix.join(path.posix.dirname(fromRel), specifier));
    for (const candidate of [base, `${base}.js`, `${base}/index.js`]) {
      if (stubs[candidate.replace(/\.js$/, '')] || fs.existsSync(path.join(ROOT, candidate)) && fs.statSync(path.join(ROOT, candidate)).isFile()) return candidate;
    }
    throw new Error(`app-modules: ${fromRel} imports ${specifier}, which does not exist`);
  };

  const load = (rel, { expose = [] } = {}) => {
    const id = rel.replace(/\.js$/, '');
    if (stubs[id]) return stubs[id];
    const cacheKey = `${id}|${expose.join(',')}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    if (loading.has(id)) throw new Error(`app-modules: circular import at ${rel}`);
    loading.add(id);

    let source = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const params = [];
    const values = [];
    source = source.replace(IMPORT_RE, (_match, clause, specifier) => {
      const target = resolve(rel, specifier);
      const mod = specifier.startsWith('.') ? load(target) : stubs[specifier];
      if (!mod) throw new Error(`app-modules: no stub for ${specifier} (imported by ${rel})`);
      for (const { local, imported } of parseSpecifiers(clause)) {
        params.push(local);
        values.push(imported === '*' ? mod : imported === 'default' ? mod.default : mod[imported]);
      }
      return '';
    });
    const names = [...new Set([...[...source.matchAll(EXPORT_RE)].map((m) => m[1]), ...expose])];
    source = source.replace(/export\s+(?=(?:async\s+)?(?:function|const|let|class)\s)/g, '');
    const mod = new Function(...params, `${source}\nreturn { ${names.join(', ')} };`)(...values);
    loading.delete(id);
    cache.set(cacheKey, mod);
    return mod;
  };

  return { load, root: ROOT };
}
