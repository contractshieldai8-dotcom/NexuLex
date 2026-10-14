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

export function tokenCostUsd(inputs, feature) {
  const tokens = inputs?.avgTokensPerCall?.[feature];
  const pIn = num(inputs?.usdPerMTokInput);
  const pOut = num(inputs?.usdPerMTokOutput);
  const tIn = num(tokens?.input);
  const tOut = num(tokens?.output);
  if (pIn === null || pOut === null || tIn === null || tOut === null) return null;
  return (tIn / 1e6) * pIn + (tOut / 1e6) * pOut;
}

// Most a paying user can cost in one month: the monthly cap, never more than the daily cap x 30.
export function worstCaseAiCostUsd(plan, inputs) {
  const limits = PLAN_LIMITS[plan];
  if (!limits) return null;
  const asks = Math.min(limits.askMonthly, limits.askDaily * 30);
  const tools = Math.min(limits.toolsMonthly, limits.toolsDaily * 30);
  const askCost = asks > 0 ? tokenCostUsd(inputs, 'legal_ask') : 0;
  const toolCost = tools > 0 ? tokenCostUsd(inputs, 'pro_tools') : 0;
  if (askCost === null || toolCost === null) return null;
  return asks * askCost + tools * toolCost;
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
const COST_PATHS = [
  ['usdPerMTokInput'], ['usdPerMTokOutput'], ['storeFeeShare'], ['fixedUsdPerPayingUserMonth'], ['targetGrossMargin'], ['minSafeUtilization'],
  ['avgTokensPerCall', 'legal_ask', 'input'], ['avgTokensPerCall', 'legal_ask', 'output'],
  ['avgTokensPerCall', 'pro_tools', 'input'], ['avgTokensPerCall', 'pro_tools', 'output'],
];
const readPath = (object, path) => path.reduce((value, key) => (value == null ? undefined : value[key]), object);

export function evaluatePriceMatrix(matrix) {
  const rows = Array.isArray(matrix?.rows) ? matrix.rows : [];
  const inputs = matrix?.costInputs || {};
  const issues = [];
  const missing = [];
  const report = [];

  const costMissing = COST_PATHS.filter((path) => num(readPath(inputs, path)) === null).map((path) => `costInputs.${path.join('.')}`);
  const pricedRows = rows.filter((row) => priceCount(row) > 0);
  const anyCost = costMissing.length < COST_PATHS.length;
  if (!pricedRows.length && !anyCost) return { status: 'template', issues, missing: [], rows: [], pricedRegions: 0 };

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
  return { cases, fail };
}
