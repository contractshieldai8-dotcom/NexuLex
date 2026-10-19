// WAVE ECON.4: asks the Anthropic Models API what each model ContractShield uses supports, and checks it against the
// exact parameters the Edge Functions send (thinking type, effort), the file types the scanner sends (images, PDF) and the
// largest output/input the app can request. Read-only, free of charge (no tokens are generated).
//
//   $env:ANTHROPIC_API_KEY = "sk-ant-..."; npm run models:caps
//   npm run models:caps -- claude-sonnet-5-5 claude-haiku-5-5      (specific ids)
//   npm run models:caps -- --list                                   (every model your key can see)
//   npm run models:caps -- --json                                   (raw API records, for the record)
//
// Exit code 1 if a request the app sends would be refused. The key is read from the environment only.
import { configuredModels, getJson, loadProfile, requireKey } from './lib/claude.mjs';
import { evaluateCapabilities, worst } from './lib/capabilities.mjs';

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const key = requireKey();

if (flags.has('--list')) {
  const { ok, status, data } = await getJson('/v1/models?limit=100', key);
  if (!ok) {
    console.log(`FAIL  GET /v1/models -> ${status}  ${JSON.stringify(data?.error || data).slice(0, 300)}`);
    process.exit(1);
  }
  for (const model of data.data || []) {
    console.log(`${String(model.id).padEnd(26)} ${String(model.lifecycle || '').padEnd(11)} ${String(model.line || '-').padEnd(8)} ctx=${model.max_input_tokens ?? '-'} out=${model.max_tokens ?? '-'}`);
  }
  process.exit(0);
}

const { thinkingParams } = loadProfile();
const roles = new Map();
for (const { where, model } of configuredModels()) roles.set(model, [...(roles.get(model) || []), where]);
const requested = args.filter((arg) => !arg.startsWith('--'));
const models = requested.length ? requested : [...roles.keys()];

let failed = 0;
const records = {};
for (const model of models) {
  const { ok, status, data } = await getJson(`/v1/models/${encodeURIComponent(model)}`, key);
  records[model] = data;
  if (!ok) {
    failed++;
    console.log(`FAIL ${model}  GET /v1/models/${model} -> ${status}  ${JSON.stringify(data?.error || data).slice(0, 300)}`);
    continue;
  }
  const used = roles.get(model) || [];
  const params = thinkingParams(model);
  const findings = evaluateCapabilities(model, data, params, used);
  const verdict = worst(findings);
  if (verdict === 'fail') failed++;
  const caps = data.capabilities || {};
  const yes = (node) => (node?.supported ? 'yes' : 'no');
  console.log(`${verdict === 'fail' ? 'FAIL' : verdict === 'warn' ? 'WARN' : 'OK  '} ${model}  (${data.display_name || '?'}, ${data.lifecycle || '?'}, line ${data.line || '-'})`);
  console.log(`     used by: ${used.join(', ') || 'not referenced by the functions'}`);
  console.log(`     sends:   thinking=${JSON.stringify(params.thinking)}${params.output_config ? ` effort=${params.output_config.effort}` : ''}`);
  console.log(`     context ${data.max_input_tokens ?? '?'} in / ${data.max_tokens ?? '?'} out | image ${yes(caps.image_input)} pdf ${yes(caps.pdf_input)} | thinking types: disabled ${yes(caps.thinking?.types?.disabled)}, adaptive ${yes(caps.thinking?.types?.adaptive)}, enabled ${yes(caps.thinking?.types?.enabled)}`);
  console.log(`     effort: low ${yes(caps.effort?.low)} medium ${yes(caps.effort?.medium)} high ${yes(caps.effort?.high)} max ${yes(caps.effort?.max)} | batch ${yes(caps.batch)} | structured outputs ${yes(caps.structured_outputs)}`);
  for (const finding of findings) console.log(`     ${finding.level.toUpperCase().padEnd(4)} ${finding.text}`);
}

if (flags.has('--json')) console.log(JSON.stringify(records, null, 2));
console.log(failed ? `${failed} of ${models.length} models need attention` : `all ${models.length} models match what the app sends`);
process.exit(failed ? 1 : 0);
