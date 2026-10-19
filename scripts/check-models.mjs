// WAVE ECON.3: live smoke test of the Claude models the edge functions use, with the EXACT thinking parameters they send
// (the claude-model-profile block is read from supabase/functions/analyze-contract/index.ts). One tiny request per model,
// well under one cent in total. It proves a model id exists, that its thinking setting is accepted and that text comes back.
//
//   $env:ANTHROPIC_API_KEY = "sk-ant-..."; npm run check:models
//   npm run check:models -- claude-sonnet-5 claude-haiku-4-5      (check other ids, e.g. before a rollback)
//
// Exit code 1 if any model fails. The key is only read from the environment and never printed.
// See also: npm run models:caps (what the Models API says each model supports) and npm run test:ab (13-language A/B).
import { API_BASE, anthropicHeaders, costUsd, loadProfile, requireKey, uniqueModels } from './lib/claude.mjs';

const key = requireKey();
const { thinkingParams } = loadProfile();
const requested = process.argv.slice(2);
const models = requested.length ? requested : uniqueModels();

let failed = 0;
for (const model of models) {
  const params = thinkingParams(model);
  const started = Date.now();
  const res = await fetch(`${API_BASE}/v1/messages`, {
    method: 'POST',
    headers: anthropicHeaders(key),
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
  const usage = data?.usage || {};
  const cost = costUsd(model, usage.input_tokens || 0, usage.output_tokens || 0) ?? 0;
  console.log(`${pass ? 'OK  ' : 'FAIL'} ${model}  ${res.status}  ${Date.now() - started} ms  thinking=${JSON.stringify(params.thinking)}${params.output_config ? ' effort=' + params.output_config.effort : ''}`);
  console.log(`     stop=${data?.stop_reason ?? '-'} in=${usage.input_tokens ?? '-'} out=${usage.output_tokens ?? '-'} thinkingBlocks=${thinkingBlocks} ~$${cost.toFixed(5)}`);
  console.log(`     ${pass ? 'text: ' + text.slice(0, 120) : 'error: ' + JSON.stringify(data?.error || data).slice(0, 300)}`);
}
console.log(failed ? `${failed} of ${models.length} failed` : `all ${models.length} models answered`);
process.exit(failed ? 1 : 0);
