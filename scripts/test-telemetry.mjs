// WAVE ECON.4: offline test of the telemetry tools (export aggregation, CSV/JSON reading, cost report prices, --matrix block).
// No key, no network, no cost. Run: npm run test:telemetry
import { aggregateDaily, matrixFragment, parseCsvLine, parseRows, priceRows, toCsv } from './lib/telemetry.mjs';
import { costUsd } from './lib/claude.mjs';

let pass = 0;
let fail = 0;
const ok = (cond, msg) => {
  if (cond) pass++;
  else {
    fail++;
    console.log('FAIL', msg);
  }
};
const near = (a, b) => Math.abs(a - b) < 1e-9;

// ---- reading ---------------------------------------------------------------------------------------------------------------
ok(parseCsvLine('a,"b,c","d ""q"""').join('|') === 'a|b,c|d "q"', 'CSV quotes and escaped quotes');
const csv = '\uFEFF"feature","plan","model","calls","input_tokens","output_tokens","truncated","failed"\r\n"legal_ask","pro","claude-sonnet-5-5","10","20000","5000","1","0"\r\n';
const parsed = parseRows(csv);
ok(parsed.length === 1 && parsed[0].calls === 10 && parsed[0].input === 20000 && parsed[0].truncated === 1, 'SQL-editor CSV (BOM, CRLF, quoted) parses');
ok(parseRows(JSON.stringify([{ feature: 'f', plan: 'pro', model: 'm', calls: 2, input_tokens: 3, output_tokens: 4 }]), { json: true })[0].output === 4, 'JSON export parses');
let threw = false;
try { parseRows('a,b\n1,2'); } catch { threw = true; }
ok(threw, 'a file that is not an ai_cost_daily export is refused, not priced as zeros');

// ---- export aggregation ----------------------------------------------------------------------------------------------------
const daily = [
  { day: '2026-10-18', feature: 'legal_ask', plan: 'pro', model: 'claude-sonnet-5-5', calls: 4, input_tokens: 8000, output_tokens: 2000, truncated: 0, failed: 1 },
  { day: '2026-10-19', feature: 'legal_ask', plan: 'pro', model: 'claude-sonnet-5-5', calls: '6', input_tokens: '12000', output_tokens: '3000', truncated: 1, failed: 0 },
  { day: '2026-10-19', feature: 'legal_ask', plan: 'free', model: 'claude-sonnet-5-5', calls: 2, input_tokens: 4000, output_tokens: 1000, truncated: 0, failed: 0 },
];
const agg = aggregateDaily(daily);
ok(agg.length === 2 && agg.find((r) => r.plan === 'pro').calls === 10 && agg.find((r) => r.plan === 'pro').input_tokens === 20000 && agg.find((r) => r.plan === 'pro').failed === 1, 'days are summed per feature / plan / model, strings coerced');
const roundTrip = parseRows(toCsv(agg));
ok(roundTrip.length === 2 && roundTrip.reduce((total, r) => total + r.calls, 0) === 12, 'exported CSV reads back identically');

// ---- pricing ---------------------------------------------------------------------------------------------------------------
const priced = priceRows(parseRows(toCsv(agg)));
const pro = priced.find((r) => r.plan === 'pro');
ok(pro.avgIn === 2000 && pro.avgOut === 500 && near(pro.perCallUsd, costUsd('claude-sonnet-5-5', 2000, 500)) && near(pro.totalUsd, pro.perCallUsd * 10), 'per-call and total dollars come from the price table');
ok(near(pro.truncatedShare, 0.1) && near(pro.failedShare, 0.1), 'truncated / failed shares');
ok(priceRows([{ feature: 'x', plan: 'pro', model: 'claude-mystery', calls: 1, input: 1, output: 1, truncated: 0, failed: 0 }])[0].totalUsd === null, 'an unknown model is reported as unknown, never as free');
ok(priceRows([{ feature: 'x', plan: 'pro', model: 'claude-sonnet-5-5', calls: 0, input: 0, output: 0, truncated: 0, failed: 0 }])[0].perCallUsd === null, 'zero calls do not divide by zero');

// ---- matrix fragment -------------------------------------------------------------------------------------------------------
const r = (feature, plan, model, calls, input, output) => ({ feature, plan, model, calls, input: input * calls, output: output * calls, truncated: 0, failed: 0 });
const models = [
  { where: 'analyze-contract:default', model: 'claude-sonnet-5-5' },
  { where: 'analyze-contract:deep', model: 'claude-fable-5-1' },
  { where: 'analyze-contract:fast', model: 'claude-haiku-5-5' },
];
const rows = [
  r('legal_ask', 'pro', 'claude-sonnet-5-5', 50, 2500, 900),
  r('legal_ask', 'free', 'claude-sonnet-5-5', 500, 9999, 9999), // free plan is not a paying user: ignored
  r('pro_tools_chronology', 'professional', 'claude-sonnet-5-5', 40, 5000, 2000),
  r('pro_tools_memo', 'professional', 'claude-sonnet-5-5', 40, 9000, 4000),
  r('analyze:analysis', 'pro', 'claude-sonnet-5-5', 60, 12000, 3000),
  r('analyze:analysis', 'pro', 'claude-haiku-5-5', 20, 11000, 2500),
  r('analyze:analysis', 'professional', 'claude-sonnet-5-5', 30, 12000, 3000),
  r('analyze:analysis', 'professional', 'claude-fable-5-1', 10, 15000, 5000),
  r('analyze:text', 'pro', 'claude-haiku-5-5', 45, 3000, 1500),
];
const frag = matrixFragment(rows, { models });
const ci = frag.costInputs;
ok(ci.featureModels.legal_ask === 'claude-sonnet-5-5' && ci.avgTokensPerCall.legal_ask.input === 2500 && ci.avgTokensPerCall.legal_ask.output === 900, 'legal_ask averages come from paid rows only');
ok(ci.featureModels.pro_tools === 'claude-sonnet-5-5' && ci.avgTokensPerCall.pro_tools.input === 9000, 'pro_tools uses the priciest tool, the conservative reading');
ok(ci.avgTokensPerCall.analyze.input === 12000 && ci.featureModels.analyze === 'claude-sonnet-5-5', 'analyze is the default (Sonnet) mode, not the cheaper fast mode');
ok(ci.featureModels.analyze_deep === 'claude-fable-5-1' && ci.avgTokensPerCall.analyze_deep.output === 5000, 'deep scans are measured on the deep model');
ok(ci.featureModels.analyze_extract === 'claude-haiku-5-5' && ci.avgTokensPerCall.analyze_extract.input === 3000, 'OCR / PDF extraction is its own feature');
ok(near(ci.analyze.extractCallsPerScan, 0.38), 'extraction calls per scan = extraction calls / analysis calls (45 / 120, 2 decimals)');
ok(near(ci.analyze.deepShareProfessional, 0.25), 'deep share = deep scans / Professional scans');
ok(ci.analyze.callsPerMonth.pro === null && ci.analyze.callsPerMonth.professional === null && frag.warnings.some((w) => /callsPerMonth/.test(w)), 'the monthly scan allowance is never invented');
ok(ci.models['claude-sonnet-5-5'].usdPerMTokInput === 2 && ci.models['claude-fable-5-1'].usdPerMTokOutput === 50 && ci.models['claude-haiku-5-5'].usdPerMTokInput === 0.1, 'model prices come from the price table');
ok(frag.evidence.legal_ask.calls === 50 && frag.evidence.pro_tools.calls === 40, 'sample sizes are reported');
ok(frag.warnings.some((w) => /analyze_deep: only 10 paid calls/.test(w)) && frag.warnings.every((w) => !/legal_ask: only/.test(w)), 'small samples are flagged, enough samples are not');
ok(!('storeFeeShare' in ci) && !('targetGrossMargin' in ci) && !('minSafeUtilization' in ci), 'the fragment never touches your own business inputs');

// No data yet: nothing is invented, features are null, no crash.
const empty = matrixFragment([r('legal_ask', 'free', 'claude-sonnet-5-5', 5, 100, 100)], { models });
ok(empty.costInputs.featureModels.legal_ask === null && empty.costInputs.avgTokensPerCall.legal_ask.input === null && empty.costInputs.avgTokensPerCall.analyze.output === null, 'no paid calls: every figure stays null');
ok(!('analyze_deep' in empty.costInputs.featureModels) && !('analyze_extract' in empty.costInputs.featureModels) && empty.costInputs.analyze.extractCallsPerScan === null, 'no scans: deep / extraction are not invented');
ok(empty.warnings.some((w) => /legal_ask: no paid calls/.test(w)), 'the missing data is explained');

// No deep scans and no extraction: those entries are left out, share = 0.
const noDeep = matrixFragment([r('analyze:analysis', 'professional', 'claude-sonnet-5-5', 40, 12000, 3000)], { models });
ok(noDeep.costInputs.analyze.deepShareProfessional === 0 && noDeep.costInputs.analyze.extractCallsPerScan === 0 && !('analyze_deep' in noDeep.costInputs.featureModels), 'no deep scans and no extraction measure as zero, not as missing');

// A model missing from the price table is called out.
const unknown = matrixFragment([r('legal_ask', 'pro', 'claude-mystery', 50, 100, 100)], { models });
ok(unknown.warnings.some((w) => /claude-mystery is not in scripts\/lib\/claude\.mjs PRICE/.test(w)) && !('claude-mystery' in unknown.costInputs.models), 'an unpriced model is flagged, not priced at zero');

console.log(`${fail ? 'FAIL' : 'OK'}  telemetry tools: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
