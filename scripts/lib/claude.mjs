// WAVE ECON.4: shared helpers for the offline/online model tools (check-models, model-capabilities, benchmark-models,
// cost-report). Nothing here talks to the network on import and nothing here ever prints a key.
//
//  - the Edge Function sources stay the single source of truth: models, thinking parameters, prompts and token limits are
//    read from supabase/functions/*/index.ts, never copied into a script;
//  - one price table (USD per million tokens) for every script, so a price change is a one-line edit.
import fs from 'fs';
import ts from 'typescript';

const ROOT = new URL('../../', import.meta.url);

export const EDGE_FILES = {
  analyze: 'supabase/functions/analyze-contract/index.ts',
  ask: 'supabase/functions/legal-ask/index.ts',
  tools: 'supabase/functions/pro-tools/index.ts',
};

export const readSource = (rel) => fs.readFileSync(new URL(rel, ROOT), 'utf8');

export const API_BASE = 'https://api.anthropic.com';
export const ANTHROPIC_VERSION = '2023-06-01';

// USD per million tokens, Anthropic list prices (platform.claude.com pricing, Oct 2026). No cache and no batch discount.
// Haiku 5.5 costs 5x per token on a call whose input is above 100k tokens (longAt).
export const PRICE = {
  'claude-sonnet-5-5': { in: 2, out: 10 },
  'claude-sonnet-5': { in: 2, out: 10 },
  'claude-haiku-5-5': { in: 0.1, out: 0.5, longIn: 0.5, longOut: 2.5, longAt: 100_000 },
  'claude-haiku-4-5': { in: 1, out: 5 },
  'claude-fable-5-1': { in: 10, out: 50 },
  'claude-fable-5': { in: 10, out: 50 },
};

// Exact dollars of ONE call. Thinking tokens are billed as output and are already inside output_tokens.
export function costUsd(model, input, output) {
  const price = PRICE[model];
  if (!price) return null;
  const long = price.longAt && input > price.longAt;
  return (input * (long ? price.longIn : price.in) + output * (long ? price.longOut : price.out)) / 1e6;
}

export const anthropicHeaders = (key) => ({
  'content-type': 'application/json',
  'x-api-key': key,
  'anthropic-version': ANTHROPIC_VERSION,
});

// Pulls the named top-level declarations out of an Edge Function source (from `from` up to `to`), transpiles the
// TypeScript and returns them. The slice must not contain imports or network code. Deno.env is served from `env`.
export function loadEdgeParts(file, names, { from = '// BEGIN claude-model-profile', to = 'async function callClaude', env = {} } = {}) {
  const source = readSource(file);
  const start = source.indexOf(from);
  const end = source.indexOf(to);
  if (start === -1 || end <= start) throw new Error(`${file}: cannot find the "${from}" .. "${to}" slice`);
  const js = ts.transpileModule(source.slice(start, end), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const previous = globalThis.Deno;
  globalThis.Deno = { env: { get: (name) => env[name] } };
  try {
    return new Function(`${js}\nreturn { ${names.join(', ')} };`)();
  } finally {
    if (previous === undefined) delete globalThis.Deno;
    else globalThis.Deno = previous;
  }
}

export const loadProfile = () => loadEdgeParts(EDGE_FILES.analyze, ['thinkingParams', 'envModel'], { to: '// END claude-model-profile' });

// Every model id the three functions use by default: [{ where, model }]. Fails loudly if the source layout changes.
export function configuredModels() {
  const found = [];
  const analyze = readSource(EDGE_FILES.analyze);
  const map = (analyze.match(/const CLAUDE_MODELS[\s\S]*?\};/) || [''])[0];
  for (const m of map.matchAll(/(\w+): envModel\('[A-Z_]+', '(claude-[a-z0-9-]+)'\)/g)) found.push({ where: `analyze-contract:${m[1]}`, model: m[2] });
  for (const [name, file] of [['legal-ask', EDGE_FILES.ask], ['pro-tools', EDGE_FILES.tools]]) {
    const m = readSource(file).match(/const MODEL = envModel\('[A-Z_]+', '(claude-[a-z0-9-]+)'\)/);
    if (m) found.push({ where: `${name}:default`, model: m[1] });
  }
  const free = readSource(EDGE_FILES.ask).match(/const FREE_MODEL = envModel\('LEGAL_ASK_FREE_MODEL', '(claude-[a-z0-9-]+)'\)/);
  if (free) found.push({ where: 'legal-ask:free', model: free[1] });
  if (found.length < 5) throw new Error('could not read the model map from the Edge Function sources (expected 3 analyze + legal-ask + pro-tools)');
  return found;
}

export const uniqueModels = () => [...new Set(configuredModels().map((entry) => entry.model))];

export function requireKey() {
  const key = (process.env.ANTHROPIC_API_KEY || '').trim();
  if (!key) {
    console.log('Set ANTHROPIC_API_KEY for this terminal only (PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-..."). The key is never written to a file or printed.');
    process.exit(2);
  }
  return key;
}

export async function getJson(path, key, fetchImpl = fetch) {
  const response = await fetchImpl(`${API_BASE}${path}`, { headers: anthropicHeaders(key) });
  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

export const usd = (value) => (value === null || value === undefined ? 'n/a' : `$${value.toFixed(value < 0.1 ? 4 : 2)}`);
