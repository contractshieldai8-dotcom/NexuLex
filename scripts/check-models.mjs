// WAVE ECON.3: live smoke test of the Claude models the edge functions use, with the EXACT thinking parameters they send
// (the claude-model-profile block is read from supabase/functions/analyze-contract/index.ts). One tiny request per model,
// well under one cent in total. It proves a model id exists, that its thinking setting is accepted and that text comes back.
//
//   $env:ANTHROPIC_API_KEY = "sk-ant-..."; npm run check:models
//   npm run check:models -- claude-sonnet-5 claude-haiku-4-5      (check other ids, e.g. before a rollback)
//
// Exit code 1 if any model fails. The key is only read from the environment and never printed.
import fs from 'fs';
import ts from 'typescript';

const key = process.env.ANTHROPIC_API_KEY;
if (!key) {
  console.log('Set ANTHROPIC_API_KEY first (PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-...").');
  process.exit(2);
}

const source = fs.readFileSync(new URL('../supabase/functions/analyze-contract/index.ts', import.meta.url), 'utf8');
const block = source.slice(source.indexOf('// BEGIN claude-model-profile'), source.indexOf('// END claude-model-profile'));
const env = {};
globalThis.Deno = { env: { get: (k) => env[k] } };
const js = ts.transpileModule(block, { compilerOptions: { target: 'ES2022' } }).outputText;
const { thinkingParams } = new Function(`${js}; return { thinkingParams };`)();

const defaults = (source.match(/const CLAUDE_MODELS[\s\S]*?\};/) || [''])[0].match(/'(claude-[a-z0-9-]+)'/g) || [];
const models = process.argv.slice(2).length ? process.argv.slice(2) : [...new Set(defaults.map((m) => m.replace(/'/g, '')))];

// USD per million tokens (platform.claude.com pricing, Oct 2026); only used for the cost line below.
const PRICE = {
  'claude-sonnet-5-5': [2, 10], 'claude-sonnet-5': [2, 10],
  'claude-haiku-5-5': [0.1, 0.5], 'claude-haiku-4-5': [1, 5],
  'claude-fable-5-1': [10, 50], 'claude-fable-5': [10, 50],
};

let failed = 0;
for (const model of models) {
  const params = thinkingParams(model);
  const started = Date.now();
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      system: 'You answer with JSON only.',
      messages: [{ role: 'user', content: 'Return {"ok":true,"lang":"tr","word":"sözleşme"} exactly.' }],
      ...params,
    }),
  });
  const data = await res.json().catch(() => null);
  const text = (data?.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  const thinkingBlocks = (data?.content || []).filter((b) => b.type === 'thinking').length;
  const pass = res.ok && text.length > 0;
  if (!pass) failed++;
  const [pIn, pOut] = PRICE[model] || [0, 0];
  const usage = data?.usage || {};
  const cost = ((usage.input_tokens || 0) * pIn + (usage.output_tokens || 0) * pOut) / 1e6;
  console.log(`${pass ? 'OK  ' : 'FAIL'} ${model}  ${res.status}  ${Date.now() - started} ms  thinking=${JSON.stringify(params.thinking)}${params.output_config ? ' effort=' + params.output_config.effort : ''}`);
  console.log(`     stop=${data?.stop_reason ?? '-'} in=${usage.input_tokens ?? '-'} out=${usage.output_tokens ?? '-'} thinkingBlocks=${thinkingBlocks} ~$${cost.toFixed(5)}`);
  console.log(`     ${pass ? 'text: ' + text.slice(0, 120) : 'error: ' + JSON.stringify(data?.error || data).slice(0, 300)}`);
}
console.log(failed ? `${failed} of ${models.length} failed` : `all ${models.length} models answered`);
process.exit(failed ? 1 : 0);
