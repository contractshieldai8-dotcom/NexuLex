// WAVE ECON.3 / ECON.4: turns the anonymous token telemetry (public.ai_cost_daily) into real dollars per call, per feature
// and per plan, and (with --matrix) into the model-based costInputs block of config/pricing-matrix.json.
// Prices: scripts/lib/claude.mjs (Anthropic list prices, USD per million tokens; no cache, no batch discount).
//
// 1. Get the export, either way:
//      npm run cost:export                       (reads the table with your service key from the environment, writes a CSV)
//      or in the Supabase SQL editor, then "Download CSV":
//        select feature, plan, model,
//               sum(calls) as calls, sum(input_tokens) as input_tokens, sum(output_tokens) as output_tokens,
//               sum(truncated) as truncated, sum(failed) as failed
//          from public.ai_cost_daily
//         where day >= current_date - 30
//         group by feature, plan, model order by feature, plan, model;
// 2. npm run cost:report -- path\to\export.csv              (or .json)
//    npm run cost:report -- export.csv --json               (machine-readable)
//    npm run cost:report -- export.csv --matrix             (the costInputs block for config/pricing-matrix.json, with sample sizes)
//
// Thinking tokens are billed as output tokens and are already inside output_tokens.
import fs from 'fs';
import { usd } from './lib/claude.mjs';
import { matrixFragment, parseRows, priceRows } from './lib/telemetry.mjs';

const args = process.argv.slice(2);
const file = args.find((arg) => !arg.startsWith('--'));
if (!file || !fs.existsSync(file)) {
  console.log('Usage: node scripts/cost-report.mjs <export.csv|export.json> [--json | --matrix]   (how to get the export: see the header of this file)');
  process.exit(2);
}

let rows;
try {
  rows = parseRows(fs.readFileSync(file, 'utf8'), { json: file.toLowerCase().endsWith('.json') });
} catch (error) {
  console.log(`Cannot read ${file}: ${error.message}`);
  process.exit(2);
}
if (!rows.length) {
  console.log('The export has no rows yet: no AI call has been recorded in this window.');
  process.exit(0);
}

if (args.includes('--matrix')) {
  const fragment = matrixFragment(rows);
  console.log(JSON.stringify({ costInputs: fragment.costInputs }, null, 2));
  console.error('\nSample sizes (paying plans only):');
  for (const [feature, info] of Object.entries(fragment.evidence)) console.error(`  ${feature.padEnd(16)} ${String(info.calls).padStart(6)} calls  ${info.model || ''}${info.note ? `  (${info.note})` : ''}`);
  console.error('\nBefore you paste it into config/pricing-matrix.json:');
  for (const warning of fragment.warnings) console.error(`  - ${warning}`);
  console.error('  - keep your own storeFeeShare, fixedUsdPerPayingUserMonth, targetGrossMargin and minSafeUtilization; this block never touches them.');
  console.error('  - then set "asOf" to today and run: npm run pricing');
  process.exit(0);
}

const lines = priceRows(rows);
if (args.includes('--json')) {
  console.log(JSON.stringify(lines, null, 2));
  process.exit(0);
}

const money = (value) => (value === null ? 'unknown model' : usd(value));
console.log('feature'.padEnd(26) + 'plan'.padEnd(14) + 'model'.padEnd(20) + 'calls'.padStart(7) + 'avg in'.padStart(9) + 'avg out'.padStart(9) + '  $/call'.padStart(10) + '   total'.padStart(10) + '  trunc  fail');
for (const l of lines) {
  console.log(
    l.feature.padEnd(26) + l.plan.padEnd(14) + l.model.padEnd(20) + String(l.calls).padStart(7) + String(l.avgIn).padStart(9) + String(l.avgOut).padStart(9) +
      money(l.perCallUsd).padStart(10) + money(l.totalUsd).padStart(10) + `  ${(l.truncatedShare * 100).toFixed(0).padStart(3)}%  ${(l.failedShare * 100).toFixed(0).padStart(3)}%`
  );
}

const byPlan = {};
for (const l of lines) {
  const p = (byPlan[l.plan] ||= { calls: 0, usd: 0, unknown: 0 });
  p.calls += l.calls;
  if (l.totalUsd === null) p.unknown += l.calls;
  else p.usd += l.totalUsd;
}
console.log('\nPer plan (telemetry holds no user ids: divide by your own paying-user count to get cost per user):');
for (const [plan, p] of Object.entries(byPlan)) console.log(`  ${plan.padEnd(13)} ${String(p.calls).padStart(6)} calls  ${money(p.usd)}${p.unknown ? `  (+${p.unknown} calls on models missing from the price table)` : ''}`);

const warn = lines.filter((l) => l.truncatedShare > 0.05 || l.failedShare > 0.05);
if (warn.length) {
  console.log('\nWatch:');
  for (const l of warn) console.log(`  ${l.feature} / ${l.plan} / ${l.model}: ${(l.truncatedShare * 100).toFixed(0)}% truncated, ${(l.failedShare * 100).toFixed(0)}% failed - raise max_tokens or check the prompt.`);
}
