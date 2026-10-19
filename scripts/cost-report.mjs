// WAVE ECON.3: turns the anonymous token telemetry (public.ai_cost_daily) into real dollars per call, per feature and per plan.
// Prices are Anthropic list prices in USD per million tokens (platform.claude.com pricing, Oct 2026; no cache, no batch discount).
//
// 1. Supabase SQL editor, run, then "Download CSV" (or copy the result as JSON) into a file:
//      select feature, plan, model,
//             sum(calls) as calls, sum(input_tokens) as input_tokens, sum(output_tokens) as output_tokens,
//             sum(truncated) as truncated, sum(failed) as failed
//        from public.ai_cost_daily
//       where day >= current_date - 30
//       group by feature, plan, model order by feature, plan, model;
// 2. node scripts/cost-report.mjs path/to/export.csv            (or .json)
//    node scripts/cost-report.mjs export.csv --json              (machine-readable)
//
// Thinking tokens are billed as output tokens and are already inside output_tokens.
import fs from 'fs';

const PRICE = {
  'claude-sonnet-5-5': { in: 2, out: 10 },
  'claude-sonnet-5': { in: 2, out: 10 },
  'claude-haiku-5-5': { in: 0.1, out: 0.5, longIn: 0.5, longOut: 2.5, longAt: 100_000 }, // above 100k input tokens a call costs 5x
  'claude-haiku-4-5': { in: 1, out: 5 },
  'claude-fable-5-1': { in: 10, out: 50 },
  'claude-fable-5': { in: 10, out: 50 },
};

const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
  console.log('Usage: node scripts/cost-report.mjs <export.csv|export.json> [--json]   (query: see the header of this file)');
  process.exit(2);
}

const parseCsv = (text) => {
  const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  const head = lines.shift().split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.filter(Boolean).map((line) => {
    const cells = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    return Object.fromEntries(head.map((h, i) => [h, cells[i]]));
  });
};
const raw = fs.readFileSync(file, 'utf8');
const rows = (file.endsWith('.json') ? JSON.parse(raw) : parseCsv(raw)).map((r) => ({
  feature: String(r.feature), plan: String(r.plan), model: String(r.model),
  calls: Number(r.calls) || 0, input: Number(r.input_tokens) || 0, output: Number(r.output_tokens) || 0,
  truncated: Number(r.truncated) || 0, failed: Number(r.failed) || 0,
}));

const costOf = (row) => {
  const p = PRICE[row.model];
  if (!p) return null;
  const avgIn = row.calls ? row.input / row.calls : 0;
  const long = p.longAt && avgIn > p.longAt; // aggregate average only: a flag, not an exact tier split
  return ((row.input * (long ? p.longIn : p.in)) + (row.output * (long ? p.longOut : p.out))) / 1e6;
};

const lines = rows.map((r) => {
  const total = costOf(r);
  return {
    ...r,
    avgIn: r.calls ? Math.round(r.input / r.calls) : 0,
    avgOut: r.calls ? Math.round(r.output / r.calls) : 0,
    totalUsd: total,
    perCallUsd: total === null || !r.calls ? null : total / r.calls,
    truncatedShare: r.calls ? r.truncated / r.calls : 0,
    failedShare: r.calls ? r.failed / r.calls : 0,
  };
});

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(lines, null, 2));
  process.exit(0);
}

const money = (v) => (v === null ? 'unknown model' : `$${v.toFixed(v < 0.1 ? 4 : 2)}`);
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
