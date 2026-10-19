// WAVE PRICE.1 — Checks a store price matrix (config/pricing-matrix.json) against the app's own rules and the AI cost floor.
// It never supplies a number: every price, token price, tax and fee is read from the matrix. Pure (harness-tested).
//
//  - Structure: each priced region has Pro + Professional, monthly + yearly, in one currency.
//  - Paywall: the MX.1 yearly line and the MX.2 Professional line must actually render for those prices
//    (the app stays silent when a yearly saving is outside 1..80 percent or Professional is not above Pro).
//  - Cost: worst case = a paying user spends the whole monthly cap (PLAN_LIMITS) every month.

import { PLAN_LIMITS } from './plan';
import { annualSavings } from '../constants/annualHighlight';
import { pickProfessionalCompare } from '../constants/professionalCompare';

const num = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null);
const pos = (value) => num(value) !== null && value > 0;
const TIERS = ['pro', 'professional'];
const PERIODS = ['monthly', 'yearly'];
const typeOf = (period) => (period === 'yearly' ? 'ANNUAL' : 'MONTHLY');

// WAVE ECON.4: two input shapes, one evaluator.
//  - Legacy (WAVE PRICE.1): one flat usdPerMTokInput / usdPerMTokOutput for every feature, legal_ask + pro_tools only.
//  - Model based: costInputs.featureModels names the model of each feature, costInputs.models holds each model's price, and
//    contract scans (analyze, analyze_extract, analyze_deep) are priced too. A matrix is model based as soon as
//    costInputs.featureModels is an object (the template ships it with nulls). Nothing here ever supplies a number.
export const isModelBased = (inputs) => !!inputs?.featureModels && typeof inputs.featureModels === 'object' && !Array.isArray(inputs.featureModels);
const textOf = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);

// USD per million tokens (input, output) the feature is billed at: its model's price, else the legacy flat price.
export function pricesFor(inputs, feature) {
  const model = textOf(inputs?.featureModels?.[feature]);
  if (model) return { in: num(inputs?.models?.[model]?.usdPerMTokInput), out: num(inputs?.models?.[model]?.usdPerMTokOutput) };
  return { in: num(inputs?.usdPerMTokInput), out: num(inputs?.usdPerMTokOutput) };
}

export function tokenCostUsd(inputs, feature) {
  const tokens = inputs?.avgTokensPerCall?.[feature];
  const { in: pIn, out: pOut } = pricesFor(inputs, feature);
  const tIn = num(tokens?.input);
  const tOut = num(tokens?.output);
  if (pIn === null || pOut === null || tIn === null || tOut === null) return null;
  return (tIn / 1e6) * pIn + (tOut / 1e6) * pOut;
}

// One contract scan: the analysis call + the OCR / PDF text-extraction calls it needs (+ the deep model for a share of
// Professional scans). null while any needed figure is missing.
export function scanCostUsd(plan, inputs) {
  const analysis = tokenCostUsd(inputs, 'analyze');
  const ratio = num(inputs?.analyze?.extractCallsPerScan);
  if (analysis === null || ratio === null) return null;
  let extract = 0;
  if (ratio > 0) {
    const perExtract = tokenCostUsd(inputs, 'analyze_extract');
    if (perExtract === null) return null;
    extract = ratio * perExtract;
  }
  let analysisCost = analysis;
  if (plan === 'professional') {
    const share = num(inputs?.analyze?.deepShareProfessional);
    if (share === null) return null;
    if (share > 0) {
      const deep = tokenCostUsd(inputs, 'analyze_deep');
      if (deep === null) return null;
      analysisCost = (1 - share) * analysis + share * deep;
    }
  }
  return analysisCost + extract;
}

// Most a paying user can cost in one month: the monthly cap, never more than the daily cap x 30. Model-based matrices add
// the scans you allow per month (analyze.callsPerMonth: the app has no monthly scan cap of its own, you choose and enforce it).
export function worstCaseAiCostUsd(plan, inputs) {
  const limits = PLAN_LIMITS[plan];
  if (!limits) return null;
  const asks = Math.min(limits.askMonthly, limits.askDaily * 30);
  const tools = Math.min(limits.toolsMonthly, limits.toolsDaily * 30);
  const askCost = asks > 0 ? tokenCostUsd(inputs, 'legal_ask') : 0;
  const toolCost = tools > 0 ? tokenCostUsd(inputs, 'pro_tools') : 0;
  if (askCost === null || toolCost === null) return null;
  let scans = 0;
  if (isModelBased(inputs) && TIERS.includes(plan)) {
    const calls = num(inputs?.analyze?.callsPerMonth?.[plan]);
    const perScan = calls === null ? null : calls > 0 ? scanCostUsd(plan, inputs) : 0;
    if (perScan === null) return null;
    scans = calls * perScan;
  }
  return asks * askCost + tools * toolCost + scans;
}

// What reaches you per month, in USD, after tax and the store's cut. monthlyPrice is in the row currency.
export function netUsdPerMonth(monthlyPrice, row, inputs) {
  const fee = num(inputs?.storeFeeShare);
  const tax = num(row?.taxShare);
  const fx = num(row?.usdPerUnit);
  if (!pos(monthlyPrice) || fee === null || tax === null || fx === null) return null;
  return monthlyPrice * (1 - tax) * (1 - fee) * fx;
}

// Share of the monthly cap a user may spend before the target margin is lost. >= 1: safe even at the full cap.
export function safeUtilization(netUsd, worstUsd, inputs) {
  const margin = num(inputs?.targetGrossMargin);
  const fixed = num(inputs?.fixedUsdPerPayingUserMonth);
  if (netUsd === null || worstUsd === null || margin === null || fixed === null || !(worstUsd > 0)) return null;
  return (netUsd * (1 - margin) - fixed) / worstUsd;
}

const packagesFor = (row, tier, periods) =>
  periods.filter((period) => pos(row?.[tier]?.[period])).map((period) => ({
    packageType: typeOf(period),
    price: row[tier][period],
    currencyCode: row.currency,
    priceString: `${row[tier][period]} ${row.currency}`,
  }));

const priceCount = (row) => TIERS.reduce((sum, tier) => sum + PERIODS.filter((period) => pos(row?.[tier]?.[period])).length, 0);
const LEGACY_COST_PATHS = [
  ['usdPerMTokInput'], ['usdPerMTokOutput'], ['storeFeeShare'], ['fixedUsdPerPayingUserMonth'], ['targetGrossMargin'], ['minSafeUtilization'],
  ['avgTokensPerCall', 'legal_ask', 'input'], ['avgTokensPerCall', 'legal_ask', 'output'],
  ['avgTokensPerCall', 'pro_tools', 'input'], ['avgTokensPerCall', 'pro_tools', 'output'],
];
// Model based: every priced feature needs its model, that model's two prices and its average tokens. Scan extraction and the
// deep model are only required once the matrix says they happen (a ratio / share above zero).
function requiredCostPaths(inputs) {
  if (!isModelBased(inputs)) return LEGACY_COST_PATHS;
  const paths = [['storeFeeShare'], ['fixedUsdPerPayingUserMonth'], ['targetGrossMargin'], ['minSafeUtilization'],
    ['analyze', 'callsPerMonth', 'pro'], ['analyze', 'callsPerMonth', 'professional'], ['analyze', 'extractCallsPerScan'], ['analyze', 'deepShareProfessional']];
  const features = ['legal_ask', 'pro_tools', 'analyze'];
  if (num(inputs?.analyze?.extractCallsPerScan) > 0) features.push('analyze_extract');
  if (num(inputs?.analyze?.deepShareProfessional) > 0) features.push('analyze_deep');
  for (const feature of features) {
    paths.push(['featureModels', feature], ['avgTokensPerCall', feature, 'input'], ['avgTokensPerCall', feature, 'output']);
    const model = textOf(inputs?.featureModels?.[feature]);
    if (model) paths.push(['models', model, 'usdPerMTokInput'], ['models', model, 'usdPerMTokOutput']);
  }
  return paths;
}
const readPath = (object, path) => path.reduce((value, key) => (value == null ? undefined : value[key]), object);
const filled = (value) => num(value) !== null || textOf(value) !== null;

export function evaluatePriceMatrix(matrix) {
  const rows = Array.isArray(matrix?.rows) ? matrix.rows : [];
  const inputs = matrix?.costInputs || {};
  const issues = [];
  const missing = [];
  const report = [];

  const costPaths = requiredCostPaths(inputs);
  const costMissing = costPaths.filter((path) => !filled(readPath(inputs, path))).map((path) => `costInputs.${path.join('.')}`);
  const pricedRows = rows.filter((row) => priceCount(row) > 0);
  const anyCost = costMissing.length < costPaths.length;
  if (!pricedRows.length && !anyCost) return { status: 'template', issues, missing: [], rows: [], pricedRegions: 0 };

  if (isModelBased(inputs)) {
    const bad = (path, ok) => { const value = readPath(inputs, path); if (value !== null && value !== undefined && !(num(value) !== null && ok(value))) issues.push(`costInputs.${path.join('.')}: not a plausible value`); };
    bad(['analyze', 'deepShareProfessional'], (v) => v >= 0 && v <= 1);
    bad(['analyze', 'extractCallsPerScan'], (v) => v >= 0 && v <= 20);
    bad(['analyze', 'callsPerMonth', 'pro'], (v) => v >= 0 && v <= 100000);
    bad(['analyze', 'callsPerMonth', 'professional'], (v) => v >= 0 && v <= 100000);
    for (const [feature, model] of Object.entries(inputs.featureModels)) {
      if (model !== null && model !== undefined && !textOf(model)) issues.push(`costInputs.featureModels.${feature}: model name must be text or null`);
    }
    for (const [model, price] of Object.entries(inputs.models || {})) {
      for (const key of ['usdPerMTokInput', 'usdPerMTokOutput']) {
        if (price?.[key] !== null && price?.[key] !== undefined && !(num(price[key]) !== null && price[key] > 0 && price[key] < 1000)) issues.push(`costInputs.models.${model}.${key}: not a plausible USD per million tokens`);
      }
    }
  }

  if (!rows.length) issues.push('rows: add at least one region');
  const regions = new Set();
  for (const row of rows) {
    const region = String(row?.region || '').trim();
    if (!region) { issues.push('a row has no region'); continue; }
    if (regions.has(region)) issues.push(`${region}: region listed twice`);
    regions.add(region);
    const count = priceCount(row);
    const entry = { region, currency: row.currency || '', complete: false, mx1: {}, mx2: {}, floor: {} };
    report.push(entry);
    if (count === 0) { missing.push(`${region}: no prices yet`); continue; }
    if (!/^[A-Z]{3}$/.test(String(row.currency || ''))) issues.push(`${region}: currency must be a 3-letter code`);
    for (const tier of TIERS) for (const period of PERIODS) {
      if (!pos(row?.[tier]?.[period])) missing.push(`${region}.${tier}.${period}`);
      else if (row[tier][period] > 1e9) issues.push(`${region}.${tier}.${period}: not a plausible price`);
    }
    if (count < 4) continue;
    entry.complete = true;

    // MX.1: yearly must beat twelve months by 1..80 percent or the paywall shows no saving.
    for (const tier of TIERS) {
      const saving = annualSavings(packagesFor(row, tier, ['monthly'])[0], packagesFor(row, tier, ['yearly'])[0]);
      entry.mx1[tier] = saving ? saving.percent : null;
      if (!saving) issues.push(`${region}.${tier}: yearly must be cheaper than 12 monthly payments by 1-80 percent, or MX.1 stays silent`);
    }
    // MX.2: Professional above Pro by 1..400 percent, in each period.
    for (const period of PERIODS) {
      const compare = pickProfessionalCompare(packagesFor(row, 'pro', [period]), packagesFor(row, 'professional', [period]));
      entry.mx2[period] = compare ? compare.percent : null;
      if (!compare) issues.push(`${region}.${period}: Professional must be above Pro by 1-400 percent, or MX.2 stays silent`);
    }

    // Cost floor: monthly price and yearly price / 12, for each tier.
    const minSafe = num(inputs.minSafeUtilization);
    for (const tier of TIERS) {
      const worst = worstCaseAiCostUsd(tier, inputs);
      for (const period of PERIODS) {
        const monthlyEq = period === 'yearly' ? row[tier].yearly / 12 : row[tier].monthly;
        const net = netUsdPerMonth(monthlyEq, row, inputs);
        const safe = safeUtilization(net, worst, inputs);
        entry.floor[`${tier}.${period}`] = { netUsd: net, worstUsd: worst, safeUtilization: safe };
        if (safe !== null && minSafe !== null && safe < minSafe) {
          issues.push(`${region}.${tier}.${period}: safe utilization ${safe.toFixed(2)} is below the minimum ${minSafe}`);
        }
        if (net === null) missing.push(`${region}.${tier}.${period}: needs taxShare, usdPerUnit and costInputs.storeFeeShare`);
      }
    }
  }
  if (pricedRows.length) costMissing.forEach((path) => missing.push(path));
  const unique = [...new Set(missing)];
  const status = issues.length ? 'fail' : unique.length ? 'incomplete' : 'ok';
  return { status, issues, missing: unique, rows: report, pricedRegions: pricedRows.length };
}

// Test data only (not prices): fixtures prove the rules, they never reach the app or the matrix.
export function assertPriceMatrixFixtures() {
  let cases = 0;
  const fail = [];
  const check = (cond, msg) => { cases += 1; if (!cond) fail.push(msg); };
  const inputs = {
    usdPerMTokInput: 3, usdPerMTokOutput: 15,
    avgTokensPerCall: { legal_ask: { input: 2000, output: 1000 }, pro_tools: { input: 4000, output: 2000 } },
    storeFeeShare: 0.15, fixedUsdPerPayingUserMonth: 0.5, targetGrossMargin: 0.5, minSafeUtilization: 0.25,
  };
  const row = (extra = {}) => ({ region: 'XX', currency: 'USD', usdPerUnit: 1, taxShare: 0, pro: { monthly: 10, yearly: 90 }, professional: { monthly: 40, yearly: 336 }, ...extra });
  const matrix = (rows, costInputs = inputs) => ({ rows, costInputs });

  check(evaluatePriceMatrix({ rows: [{ region: 'A', currency: 'USD', pro: { monthly: null, yearly: null }, professional: { monthly: null, yearly: null } }], costInputs: {} }).status === 'template', 'all null is a template');
  check(Math.abs(tokenCostUsd(inputs, 'legal_ask') - 0.021) < 1e-9, 'token cost of one question');
  check(tokenCostUsd({ ...inputs, usdPerMTokOutput: null }, 'legal_ask') === null, 'no token price, no cost');
  // Pro: min(300, 40 * 30 = 1200) = 300 questions. Professional: min(900, 4500) = 900 questions + min(300, 900) = 300 runs.
  check(Math.abs(worstCaseAiCostUsd('pro', inputs) - 300 * 0.021) < 1e-9, 'pro worst case is 300 questions');
  check(Math.abs(worstCaseAiCostUsd('professional', inputs) - (900 * 0.021 + 300 * 0.042)) < 1e-9, 'professional worst case adds 300 tool runs');
  check(worstCaseAiCostUsd('free', inputs) === 0 && worstCaseAiCostUsd('nope', inputs) === null, 'free plan has no paid cost; unknown plan is null');
  check(Math.abs(netUsdPerMonth(10, { taxShare: 0.2, usdPerUnit: 1 }, inputs) - 6.8) < 1e-9, 'net = price x (1 - tax) x (1 - fee) x fx');
  check(netUsdPerMonth(10, { taxShare: null, usdPerUnit: 1 }, inputs) === null, 'unknown tax means no net');
  const ok = evaluatePriceMatrix(matrix([row()]));
  check(ok.status === 'ok' && ok.rows[0].complete && ok.rows[0].mx1.pro === 25 && ok.rows[0].mx2.yearly === 273, 'a healthy row passes and shows MX.1 + MX.2');
  check(evaluatePriceMatrix(matrix([row({ pro: { monthly: 10, yearly: 120 } })])).issues.some((m) => /MX\.1/.test(m)), 'yearly equal to twelve months fails MX.1');
  check(evaluatePriceMatrix(matrix([row({ professional: { monthly: 9, yearly: 168 } })])).issues.some((m) => /MX\.2/.test(m)), 'Professional below Pro fails MX.2');
  check(evaluatePriceMatrix(matrix([row({ professional: { monthly: 80, yearly: 168 } })])).issues.some((m) => /MX\.2/.test(m)), 'Professional over 400 percent above Pro fails MX.2');
  const cheap = evaluatePriceMatrix(matrix([row({ pro: { monthly: 1, yearly: 8 } })]));
  check(cheap.status === 'fail' && cheap.issues.some((m) => /safe utilization/.test(m)), 'a price under the cost floor fails');
  check(evaluatePriceMatrix(matrix([row({ currency: 'usd' })])).status === 'fail', 'currency must be a 3-letter code');
  check(evaluatePriceMatrix(matrix([row({ pro: { monthly: 10, yearly: null } })])).status === 'incomplete', 'a half-priced region is incomplete, not ok');
  check(evaluatePriceMatrix(matrix([row()], { ...inputs, storeFeeShare: null })).status === 'incomplete', 'missing cost inputs are incomplete, not ok');
  check(evaluatePriceMatrix(matrix([row(), row()])).issues.some((m) => /twice/.test(m)), 'duplicate region is reported');
  check(evaluatePriceMatrix(matrix([row(), { region: 'YY', currency: 'EUR', pro: {}, professional: {} }])).status === 'incomplete', 'an unpriced region is listed as missing');

  // WAVE ECON.4: model-based inputs (fixture prices, not real ones). Sonnet 3/15, Haiku 1/5, Fable 10/50 USD per million tokens.
  const mInputs = (patch = {}) => ({
    models: {
      'model-s': { usdPerMTokInput: 3, usdPerMTokOutput: 15 },
      'model-h': { usdPerMTokInput: 1, usdPerMTokOutput: 5 },
      'model-f': { usdPerMTokInput: 10, usdPerMTokOutput: 50 },
    },
    featureModels: { legal_ask: 'model-s', pro_tools: 'model-s', analyze: 'model-s', analyze_extract: 'model-h', analyze_deep: 'model-f' },
    avgTokensPerCall: {
      legal_ask: { input: 2000, output: 1000 }, pro_tools: { input: 4000, output: 2000 }, analyze: { input: 10000, output: 4000 },
      analyze_extract: { input: 3000, output: 2000 }, analyze_deep: { input: 10000, output: 6000 },
    },
    analyze: { callsPerMonth: { pro: 20, professional: 40 }, extractCallsPerScan: 0.5, deepShareProfessional: 0.25 },
    storeFeeShare: 0.15, fixedUsdPerPayingUserMonth: 0.5, targetGrossMargin: 0.5, minSafeUtilization: 0.25,
    ...patch,
  });
  const mi = mInputs();
  check(Math.abs(tokenCostUsd(mi, 'analyze_extract') - 0.013) < 1e-9, 'each feature is priced at its own model');
  check(Math.abs(tokenCostUsd(mInputs({ models: { ...mi.models, 'model-s': { usdPerMTokInput: 3, usdPerMTokOutput: 30 } } }), 'legal_ask') - 0.036) < 1e-9, 'a model price change reaches every feature on it');
  check(Math.abs(tokenCostUsd({ ...inputs, featureModels: {} }, 'legal_ask') - 0.021) < 1e-9, 'a feature without a model falls back to the flat price');
  check(Math.abs(scanCostUsd('pro', mi) - 0.0965) < 1e-9, 'a Pro scan = analysis + extraction calls');
  check(Math.abs(scanCostUsd('professional', mi) - 0.174) < 1e-9, 'a Professional scan mixes in the deep model by its share');
  check(Math.abs(worstCaseAiCostUsd('pro', mi) - (300 * 0.021 + 20 * 0.0965)) < 1e-9, 'pro worst case adds the allowed monthly scans');
  check(Math.abs(worstCaseAiCostUsd('professional', mi) - (900 * 0.021 + 300 * 0.042 + 40 * 0.174)) < 1e-9, 'professional worst case adds scans, tools and questions');
  check(worstCaseAiCostUsd('free', mi) === 0, 'free plan still has no paid cost');
  const mOk = evaluatePriceMatrix(matrix([row()], mi));
  check(mOk.status === 'ok' && mOk.rows[0].complete, 'a healthy model-based row passes');
  check(evaluatePriceMatrix(matrix([row()], mInputs({ analyze: { ...mi.analyze, callsPerMonth: { pro: 20, professional: 400 } } }))).issues.some((m) => /safe utilization/.test(m)), 'heavy Professional scans can push a price under the cost floor');
  check(evaluatePriceMatrix(matrix([row()], mInputs({ analyze: { ...mi.analyze, callsPerMonth: { pro: null, professional: 40 } } }))).status === 'incomplete', 'an undecided monthly scan allowance is incomplete, not ok');
  check(evaluatePriceMatrix(matrix([row()], mInputs({ featureModels: { ...mi.featureModels, analyze: 'model-x' } }))).missing.includes('costInputs.models.model-x.usdPerMTokInput'), 'a model without a price is listed as missing');
  check(evaluatePriceMatrix(matrix([row()], mInputs({ featureModels: { ...mi.featureModels, analyze: null } }))).status === 'incomplete', 'a feature without a model is incomplete');
  check(evaluatePriceMatrix(matrix([row()], mInputs({ analyze: { ...mi.analyze, deepShareProfessional: 1.5 } }))).status === 'fail', 'a deep share above 100 percent is rejected');
  check(evaluatePriceMatrix(matrix([row()], mInputs({ models: { ...mi.models, 'model-s': { usdPerMTokInput: -1, usdPerMTokOutput: 15 } } }))).status === 'fail', 'a negative token price is rejected');
  const noExtras = mInputs({ analyze: { callsPerMonth: { pro: 20, professional: 40 }, extractCallsPerScan: 0, deepShareProfessional: 0 }, featureModels: { legal_ask: 'model-s', pro_tools: 'model-s', analyze: 'model-s', analyze_extract: null, analyze_deep: null }, avgTokensPerCall: { legal_ask: mi.avgTokensPerCall.legal_ask, pro_tools: mi.avgTokensPerCall.pro_tools, analyze: mi.avgTokensPerCall.analyze } });
  check(evaluatePriceMatrix(matrix([row()], noExtras)).status === 'ok', 'no extraction and no deep scans means those figures are not required');
  check(Math.abs(worstCaseAiCostUsd('professional', noExtras) - (900 * 0.021 + 300 * 0.042 + 40 * 0.09)) < 1e-9, 'without extraction or deep scans a scan is just the analysis call');
  const mTemplate = { rows: [{ region: 'A', currency: 'USD', pro: { monthly: null, yearly: null }, professional: { monthly: null, yearly: null } }], costInputs: { models: {}, featureModels: { legal_ask: null, pro_tools: null, analyze: null, analyze_extract: null, analyze_deep: null }, avgTokensPerCall: {}, analyze: { callsPerMonth: { pro: null, professional: null }, extractCallsPerScan: null, deepShareProfessional: null } } };
  check(evaluatePriceMatrix(mTemplate).status === 'template', 'an empty model-based matrix is still a template');
  return { cases, fail };
}
