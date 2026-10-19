// WAVE ECON.4: reads the anonymous token telemetry (public.ai_cost_daily) and turns it into dollars and into the
// model-based costInputs of config/pricing-matrix.json. Pure functions (tested offline by scripts/test-telemetry.mjs).
import { PRICE, configuredModels, costUsd } from './claude.mjs';

export const PAID_PLANS = ['pro', 'professional'];

// ---- reading ---------------------------------------------------------------------------------------------------------------
// One CSV line, with "quoted, values" and "" escapes (the Supabase SQL editor quotes text columns).
export function parseCsvLine(line) {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { cells.push(cell); cell = ''; }
    else cell += ch;
  }
  cells.push(cell);
  return cells.map((c) => c.trim());
}

export function parseRows(text, { json = false } = {}) {
  const raw = String(text).replace(/^\uFEFF/, '').trim();
  const records = json
    ? JSON.parse(raw)
    : (() => {
        const lines = raw.split(/\r?\n/).filter(Boolean);
        const head = parseCsvLine(lines.shift() || '');
        return lines.map((line) => Object.fromEntries(parseCsvLine(line).map((value, index) => [head[index], value])));
      })();
  if (!Array.isArray(records)) throw new Error('expected a list of rows');
  const rows = records.map((r) => ({
    feature: String(r.feature ?? ''), plan: String(r.plan ?? ''), model: String(r.model ?? ''),
    calls: Number(r.calls) || 0, input: Number(r.input_tokens ?? r.input) || 0, output: Number(r.output_tokens ?? r.output) || 0,
    truncated: Number(r.truncated) || 0, failed: Number(r.failed) || 0,
  }));
  const bad = rows.filter((r) => !r.feature || !r.plan || !r.model);
  if (bad.length) throw new Error(`${bad.length} row(s) lack feature, plan or model: is this an ai_cost_daily export?`);
  return rows;
}

// ai_cost_daily rows (one per day) -> one row per feature / plan / model.
export function aggregateDaily(daily) {
  const groups = new Map();
  for (const d of daily) {
    const key = `${d.feature}\u0000${d.plan}\u0000${d.model}`;
    const g = groups.get(key) || { feature: d.feature, plan: d.plan, model: d.model, calls: 0, input_tokens: 0, output_tokens: 0, truncated: 0, failed: 0 };
    g.calls += Number(d.calls) || 0;
    g.input_tokens += Number(d.input_tokens) || 0;
    g.output_tokens += Number(d.output_tokens) || 0;
    g.truncated += Number(d.truncated) || 0;
    g.failed += Number(d.failed) || 0;
    groups.set(key, g);
  }
  return [...groups.values()].sort((a, b) => `${a.feature}|${a.plan}|${a.model}`.localeCompare(`${b.feature}|${b.plan}|${b.model}`));
}

export const toCsv = (rows) => ['feature,plan,model,calls,input_tokens,output_tokens,truncated,failed',
  ...rows.map((r) => [r.feature, r.plan, r.model, r.calls, r.input_tokens, r.output_tokens, r.truncated, r.failed].join(','))].join('\n') + '\n';

// ---- pricing ---------------------------------------------------------------------------------------------------------------
export function priceRows(rows) {
  return rows.map((r) => {
    const price = PRICE[r.model];
    const avgIn = r.calls ? r.input / r.calls : 0;
    // The telemetry holds sums, so the long-context tier can only be flagged on the average call, not split exactly.
    const total = price ? costUsd(r.model, r.input / Math.max(r.calls, 1), r.output / Math.max(r.calls, 1)) * r.calls : null;
    return {
      ...r,
      avgIn: Math.round(avgIn),
      avgOut: r.calls ? Math.round(r.output / r.calls) : 0,
      totalUsd: total,
      perCallUsd: total === null || !r.calls ? null : total / r.calls,
      truncatedShare: r.calls ? r.truncated / r.calls : 0,
      failedShare: r.calls ? r.failed / r.calls : 0,
    };
  });
}

// ---- matrix fragment -------------------------------------------------------------------------------------------------------
const sum = (rows, key) => rows.reduce((total, r) => total + r[key], 0);
const dominantModel = (rows) => {
  const byModel = new Map();
  for (const r of rows) byModel.set(r.model, (byModel.get(r.model) || 0) + r.calls);
  return [...byModel.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
};

function measure(rows, model) {
  const used = rows.filter((r) => r.model === model);
  const calls = sum(used, 'calls');
  return calls ? { model, calls, input: Math.round(sum(used, 'input') / calls), output: Math.round(sum(used, 'output') / calls) } : null;
}

// Builds the model-based costInputs from real telemetry (paying plans only). Never invents a number: a feature with no
// calls yet is left null, and every figure carries its sample size so you can judge it.
export function matrixFragment(rows, { minCalls = 30, models = configuredModels() } = {}) {
  const defaultModel = models.find((m) => m.where === 'analyze-contract:default')?.model;
  const deepModel = models.find((m) => m.where === 'analyze-contract:deep')?.model;
  const paid = rows.filter((r) => PAID_PLANS.includes(r.plan));
  const warnings = [];
  const evidence = {};
  const inputs = { models: {}, featureModels: {}, avgTokensPerCall: {}, analyze: { callsPerMonth: { pro: null, professional: null }, extractCallsPerScan: null, deepShareProfessional: null } };

  const record = (feature, measured, note) => {
    if (!measured) {
      inputs.featureModels[feature] = null;
      inputs.avgTokensPerCall[feature] = { input: null, output: null };
      evidence[feature] = { calls: 0, note: note || 'no paid calls in this export yet' };
      warnings.push(`${feature}: no paid calls in this export yet, left null`);
      return;
    }
    inputs.featureModels[feature] = measured.model;
    inputs.avgTokensPerCall[feature] = { input: measured.input, output: measured.output };
    evidence[feature] = { calls: measured.calls, model: measured.model, ...(note ? { note } : {}) };
    if (measured.calls < minCalls) warnings.push(`${feature}: only ${measured.calls} paid calls (< ${minCalls}); wait for more data before relying on it`);
    if (!PRICE[measured.model]) warnings.push(`${feature}: model ${measured.model} is not in scripts/lib/claude.mjs PRICE, add its price`);
    else inputs.models[measured.model] = { usdPerMTokInput: PRICE[measured.model].in, usdPerMTokOutput: PRICE[measured.model].out };
  };

  const ask = paid.filter((r) => r.feature === 'legal_ask');
  record('legal_ask', measure(ask, dominantModel(ask)));

  // The matrix prices the most expensive tool (pro_tools_*), the conservative reading its source note asks for.
  const toolRows = paid.filter((r) => r.feature.startsWith('pro_tools_'));
  const perTool = [...new Set(toolRows.map((r) => r.feature))].map((feature) => {
    const rowsOfTool = toolRows.filter((r) => r.feature === feature);
    const measured = measure(rowsOfTool, dominantModel(rowsOfTool));
    return { feature, measured, perCall: measured ? costUsd(measured.model, measured.input, measured.output) ?? 0 : 0 };
  }).sort((a, b) => b.perCall - a.perCall);
  record('pro_tools', perTool[0]?.measured || null, perTool.length ? `priciest tool: ${perTool[0].feature}; all: ${perTool.map((t) => `${t.feature}=$${t.perCall.toFixed(4)}`).join(', ')}` : '');

  const analysis = paid.filter((r) => r.feature === 'analyze:analysis');
  const standard = analysis.filter((r) => r.model !== deepModel);
  record('analyze', measure(standard, standard.some((r) => r.model === defaultModel) ? defaultModel : dominantModel(standard)), 'scans in the default mode (Sonnet); "fast" (Haiku) scans are cheaper and are not what a worst case assumes');
  // Deep scans and OCR/PDF extraction are only priced when they really happen: a zero share / ratio means "not needed".
  const deep = analysis.filter((r) => r.model === deepModel);
  if (deep.length) record('analyze_deep', measure(deep, deepModel), 'Professional "deep" scans');
  const extract = paid.filter((r) => r.feature === 'analyze:text');
  if (extract.length) record('analyze_extract', measure(extract, dominantModel(extract)), 'OCR / PDF text extraction calls (feature analyze:text)');

  const scans = sum(analysis, 'calls');
  if (scans) {
    inputs.analyze.extractCallsPerScan = Math.round((sum(extract, 'calls') / scans) * 100) / 100;
    const proAnalysis = analysis.filter((r) => r.plan === 'professional');
    if (proAnalysis.length) inputs.analyze.deepShareProfessional = Math.round((sum(proAnalysis.filter((r) => r.model === deepModel), 'calls') / sum(proAnalysis, 'calls')) * 1000) / 1000;
    else warnings.push('analyze.deepShareProfessional: no Professional scans in this export yet, left null');
  }
  // Calls per paying user and month cannot be read from anonymous telemetry: it is a limit YOU choose and enforce.
  warnings.push('analyze.callsPerMonth.pro / .professional stay null: telemetry holds no user ids, so this is the monthly scan allowance you decide (the server only enforces 200 / 400 a day today)');
  return { costInputs: inputs, evidence, warnings };
}
