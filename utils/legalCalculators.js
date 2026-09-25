/**
 * WAVE CB / CB.1 — Pure local financial/legal calculators (0 LLM, 0 network).
 * Jurisdiction-aware: statutory values come only from a rate pack; otherwise generic mode
 * with user-entered rates. Currency is passed in and never defaults to TRY.
 */

import { getCalcPack, getCalculatorMeta, resolveCurrency } from '../constants/legalCalcRates';
import { normalizeLanguage, resolveJurisdiction } from '../constants/jurisdiction';

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const makeLine = (currency) => (labelKey, amount) => ({
  labelKey,
  amount: round2(amount),
  currency: currency || null,
});

const dayCount = (startDate, endDate) => {
  const a = parseIsoDate(startDate);
  const b = parseIsoDate(endDate);
  if (!a || !b) return 0;
  const ms = b.getTime() - a.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / 86400000);
};

export function parseIsoDate(value) {
  const raw = String(value || '').trim();
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return dt;
}

/**
 * Explicit { pack, currency } wins; otherwise both are resolved from { country, language }.
 * Missing everything → no pack, no currency (generic / unavailable).
 */
export function resolveCalcContext({ pack, currency, country, language } = {}) {
  const explicit = pack !== undefined || currency !== undefined;
  const resolvedPack = explicit ? pack || null : getCalcPack(country, language);
  const resolvedCurrency = explicit
    ? currency !== undefined
      ? currency || null
      : resolvedPack?.currency || null
    : resolveCurrency(country, language);
  const jurisdiction =
    resolvedPack?.code || (country !== undefined || language !== undefined ? resolveJurisdiction(country, language) : null);
  return { pack: resolvedPack, currency: resolvedCurrency, jurisdiction: jurisdiction || null };
}

/** Short currency tag for field labels: Turkish UI keeps the familiar "TL"; others use the ISO code. */
export function currencyLabel(currency, language) {
  if (!currency) return '';
  if (currency === 'TRY' && String(language || '').slice(0, 2).toLowerCase() === 'tr') return 'TL';
  return currency;
}

/** UI display: Intl currency when known, plain number when currency is unset. */
export function formatMoney(amount, currency, locale) {
  const n = Number(amount) || 0;
  if (currency === 'DAY') return String(Math.round(n));
  if (currency === 'PCT') return `%${Math.abs(n).toFixed(2)}`;
  try {
    if (!currency) {
      return new Intl.NumberFormat(locale || undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n);
    }
    return new Intl.NumberFormat(locale || undefined, { style: 'currency', currency }).format(n);
  } catch (_error) {
    return currency ? `${n.toFixed(2)} ${currency}` : n.toFixed(2);
  }
}

/**
 * Kıdem (severance): monthly base capped × years; stamp tax deducted.
 * Statutory only — no pack → unavailable (no numbers).
 */
export function calculateSeverance({ grossSalary, workMonths, includesNoticePay, ...ctxInput } = {}) {
  const ctx = resolveCalcContext(ctxInput);
  const rates = ctx.pack?.calculators?.labor_severance;
  if (!rates) {
    return {
      calculatorId: 'labor_severance',
      unavailable: true,
      reasonKey: 'calcNotAvailableForCountry',
      jurisdiction: ctx.jurisdiction,
      currency: ctx.currency,
      mode: null,
      breakdown: [],
      totalAmount: null,
      disclaimerKey: 'calcDisclaimer',
    };
  }
  const line = makeLine(ctx.currency);
  const salary = Math.max(0, Number(grossSalary) || 0);
  const months = Math.max(0, Number(workMonths) || 0);
  const years = months / 12;
  const monthlyBase = Math.min(salary, Number(rates.severanceCap) || 0);
  const capApplied = salary > monthlyBase;
  const grossSeverance = monthlyBase * years;
  const stampTax = grossSeverance * (Number(rates.stampTaxRate) || 0);
  const noticePay = includesNoticePay ? monthlyBase : 0;
  const netSeverance = grossSeverance - stampTax;
  const totalAmount = netSeverance + noticePay;

  const breakdown = [
    line('calcLabelMonthlyBase', monthlyBase),
    ...(capApplied ? [line('calcLabelCapApplied', Number(rates.severanceCap) || 0)] : []),
    line('calcLabelGrossSeverance', grossSeverance),
    line('calcLabelStampTax', -stampTax),
    line('calcLabelNetSeverance', netSeverance),
  ];
  if (includesNoticePay) breakdown.push(line('calcLabelNoticePay', noticePay));

  return {
    calculatorId: 'labor_severance',
    jurisdiction: ctx.jurisdiction,
    currency: ctx.currency,
    mode: 'statutory',
    breakdown,
    totalAmount: round2(totalAmount),
    statutoryFootnoteKey: ctx.pack.footnoteKeys?.labor_severance || 'calcFootnoteSeverance',
    disclaimerKey: 'calcDisclaimer',
    asOfDate: ctx.pack.asOfDate,
    meta: { years: round2(years), monthlyBase: round2(monthlyBase), capApplied },
  };
}

/**
 * Rent increase vs an index / limit %. Statutory mode labels it per pack (e.g. TÜFE);
 * generic mode is a plain comparison against the user's own %.
 */
export function calculateRentIncrease({
  currentRent,
  proposedRent,
  tufeRate,
  indexRate,
  isResidential = true,
  ...ctxInput
} = {}) {
  const ctx = resolveCalcContext(ctxInput);
  const statutory = !!ctx.pack?.calculators?.rent_cap;
  const line = makeLine(ctx.currency);
  const current = Math.max(0, Number(currentRent) || 0);
  const proposed = Math.max(0, Number(proposedRent) || 0);
  const rate = Math.max(0, Number(indexRate ?? tufeRate) || 0);
  const maxAllowed = current * (1 + rate / 100);
  const difference = proposed - maxAllowed;
  const overCap = proposed > maxAllowed + 0.009;

  const breakdown = [
    line('calcLabelCurrentRent', current),
    line('calcLabelProposedRent', proposed),
    line(statutory ? 'calcLabelMaxAllowed' : 'calcLabelMaxAllowedGeneric', maxAllowed),
    line('calcLabelDifference', difference),
  ];

  return {
    calculatorId: 'rent_cap',
    jurisdiction: ctx.jurisdiction,
    currency: ctx.currency,
    mode: statutory ? 'statutory' : 'generic',
    breakdown,
    totalAmount: round2(maxAllowed),
    statutoryFootnoteKey: statutory
      ? ctx.pack.footnoteKeys?.rent_cap || 'calcFootnoteRent'
      : 'calcFootnoteGenericRent',
    disclaimerKey: 'calcDisclaimer',
    ...(statutory ? { asOfDate: ctx.pack.asOfDate } : {}),
    meta: {
      tufeRate: round2(rate),
      isResidential: Boolean(isResidential),
      overCap,
      proposedRate: current > 0 ? round2(((proposed - current) / current) * 100) : 0,
    },
  };
}

/**
 * Simple day-count interest (estimated): (Principal × Rate × Days) / (365 × 100).
 * Statutory mode takes the pack rate; generic mode uses the user's own annual %.
 */
export function calculateLegalInterest({
  principal,
  startDate,
  endDate,
  interestType = 'legal',
  userRate,
  ...ctxInput
} = {}) {
  const ctx = resolveCalcContext(ctxInput);
  const rates = ctx.pack?.calculators?.legal_interest;
  const statutory = !!rates;
  const line = makeLine(ctx.currency);
  const amount = Math.max(0, Number(principal) || 0);
  const days = dayCount(startDate, endDate);
  const isCommercial = String(interestType || 'legal').toLowerCase() === 'commercial';
  const annual = statutory
    ? isCommercial
      ? Number(rates.commercialInterestAnnual) || 0
      : Number(rates.legalInterestAnnual) || 0
    : Math.max(0, Number(userRate) || 0);
  const interest = (amount * annual * days) / (365 * 100);
  const total = amount + interest;

  const breakdown = [
    line('calcLabelPrincipal', amount),
    { labelKey: 'calcLabelDays', amount: days, currency: 'DAY' },
    { labelKey: 'calcLabelInterestRate', amount: round2(annual), currency: 'PCT' },
    line('calcLabelInterest', interest),
    line('calcLabelTotal', total),
  ];

  return {
    calculatorId: 'legal_interest',
    jurisdiction: ctx.jurisdiction,
    currency: ctx.currency,
    mode: statutory ? 'statutory' : 'generic',
    breakdown,
    totalAmount: round2(total),
    statutoryFootnoteKey: statutory
      ? ctx.pack.footnoteKeys?.legal_interest || 'calcFootnoteInterest'
      : 'calcFootnoteGenericInterest',
    disclaimerKey: 'calcDisclaimer',
    ...(statutory ? { asOfDate: ctx.pack.asOfDate } : {}),
    meta: {
      days,
      annualRate: annual,
      interestType: statutory ? (isCommercial ? 'commercial' : 'legal') : 'user',
      interestAmount: round2(interest),
      estimated: true,
    },
  };
}

// ---------------------------------------------------------------------------
// JP.2 — Universal calculators (no statutory values, identical in every country).
// Non-money rows carry a ready `text` (or a `textKey` translated at render time).
// ---------------------------------------------------------------------------

const DAY_MS = 86400000;
const MAX_DEADLINE_AMOUNT = 3650;
const MAX_INSTALLMENTS = 120;

export function formatIsoDate(date) {
  if (!date) return '';
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

const addDays = (date, n) => new Date(date.getTime() + n * DAY_MS);

/** Calendar months; a day that does not exist in the target month clamps to its last day (01-30 + 1 → 02-28). */
export function addMonthsClamped(date, n) {
  const total = date.getUTCMonth() + n;
  const year = date.getUTCFullYear() + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), daysInMonth(year, month))));
}

const isWeekend = (date) => date.getUTCDay() === 0 || date.getUTCDay() === 6;

function addBusinessDays(date, n) {
  let out = date;
  let left = n;
  while (left > 0) {
    out = addDays(out, 1);
    if (!isWeekend(out)) left -= 1;
  }
  return out;
}

export function weekdayName(date, language) {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat(normalizeLanguage(language) || 'en', { weekday: 'long', timeZone: 'UTC' }).format(date);
  } catch (_error) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getUTCDay()];
  }
}

/** Turkish writes the sign before the number (%12,5); other languages after (12.5%). */
export function formatPercentText(value, language, { signed = false } = {}) {
  const n = round2(value);
  const sign = n < 0 ? '-' : signed && n > 0 ? '+' : '';
  const body = Math.abs(n).toFixed(2);
  return normalizeLanguage(language) === 'tr' ? `${sign}%${body}` : `${sign}${body}%`;
}

const clampInt = (value, min, max) => Math.min(max, Math.max(min, Math.floor(Number(value) || 0)));

function universalResult(calculatorId, ctx, extra) {
  return {
    calculatorId,
    jurisdiction: ctx.jurisdiction,
    currency: ctx.currency,
    mode: 'universal',
    disclaimerKey: 'calcDisclaimer',
    ...extra,
  };
}

/** Deadline: start + N days / weeks / months, or N business days (Sat/Sun skipped; public holidays NOT known). */
export function calculateDeadlineDate({ startDate, amount, unit = 'days', businessDays = false, ...ctxInput } = {}) {
  const ctx = resolveCalcContext(ctxInput);
  const start = parseIsoDate(startDate);
  if (!start) return { calculatorId: 'deadline_date', invalid: true, reasonKey: 'calcInvalidDate' };
  const n = clampInt(amount, 0, MAX_DEADLINE_AMOUNT);
  const kind = unit === 'weeks' || unit === 'months' ? unit : 'days';
  const business = kind === 'days' && !!businessDays;
  const end =
    kind === 'months' ? addMonthsClamped(start, n) : kind === 'weeks' ? addDays(start, n * 7) : business ? addBusinessDays(start, n) : addDays(start, n);
  const addedKey = business ? 'calcAddedBusinessDays' : kind === 'months' ? 'calcAddedMonths' : kind === 'weeks' ? 'calcAddedWeeks' : 'calcAddedDays';
  const endIso = formatIsoDate(end);
  const weekday = weekdayName(end, ctxInput.language);
  return universalResult('deadline_date', ctx, {
    breakdown: [
      { labelKey: 'calcLabelStartDate', text: `${formatIsoDate(start)} · ${weekdayName(start, ctxInput.language)}` },
      { labelKey: 'calcLabelAdded', textKey: addedKey, textParams: { count: n } },
      { labelKey: 'calcLabelEndDate', text: endIso },
      { labelKey: 'calcLabelWeekday', text: weekday },
    ],
    totalAmount: null,
    totalLabelKey: 'calcLabelEndDate',
    totalText: `${endIso} · ${weekday}`,
    statutoryFootnoteKey: 'calcFootnoteDeadline',
    meta: { endDate: endIso, unit: kind, amount: n, businessDays: business, endsOnWeekend: isWeekend(end) },
  });
}

/** Pro-rata: amount per period × (days used / days in the period). */
export function calculateProRata({ amount, daysUsed, daysInPeriod, ...ctxInput } = {}) {
  const ctx = resolveCalcContext(ctxInput);
  const line = makeLine(ctx.currency);
  const base = Math.max(0, Number(amount) || 0);
  const period = clampInt(daysInPeriod, 0, 366);
  const used = Math.min(period, clampInt(daysUsed, 0, 366));
  const share = period > 0 ? (base * used) / period : 0;
  return universalResult('pro_rata', ctx, {
    breakdown: [
      line('calcLabelPeriodAmount', base),
      { labelKey: 'calcLabelDaysUsed', amount: used, currency: 'DAY' },
      { labelKey: 'calcLabelDaysInPeriod', amount: period, currency: 'DAY' },
      line('calcLabelProRata', share),
    ],
    totalAmount: round2(share),
    totalLabelKey: 'calcLabelProRata',
    statutoryFootnoteKey: 'calcFootnoteProRata',
    meta: { daysUsed: used, daysInPeriod: period },
  });
}

/** Mode 'diff': old + new → % change. Mode 'apply': old + % → new value. Plain numbers (no currency). */
export function calculatePercentChange({ mode = 'diff', oldValue, newValue, percent, ...ctxInput } = {}) {
  const ctx = resolveCalcContext(ctxInput);
  const lang = ctxInput.language;
  const oldN = Number(oldValue) || 0;
  const apply = mode === 'apply';
  const pct = apply ? Number(percent) || 0 : oldN !== 0 ? (((Number(newValue) || 0) - oldN) / Math.abs(oldN)) * 100 : 0;
  const newN = apply ? oldN * (1 + pct / 100) : Number(newValue) || 0;
  const pctText = formatPercentText(pct, lang, { signed: true });
  const plain = (labelKey, value) => ({ labelKey, amount: round2(value), currency: null });
  return universalResult('percent_change', { ...ctx, currency: null }, {
    breakdown: [
      plain('calcLabelOldValue', oldN),
      plain('calcLabelNewValue', newN),
      plain('calcLabelChangeAbs', newN - oldN),
      { labelKey: 'calcLabelChangePct', text: pctText },
    ],
    totalAmount: apply ? round2(newN) : null,
    totalLabelKey: apply ? 'calcLabelNewValue' : 'calcLabelChangePct',
    ...(apply ? {} : { totalText: pctText }),
    statutoryFootnoteKey: 'calcFootnotePercent',
    meta: { mode: apply ? 'apply' : 'diff', percent: round2(pct), newValue: round2(newN), oldZero: !apply && oldN === 0 },
  });
}

/** Equal installments; the last one absorbs rounding so the rows always add up to the total. */
export function calculateInstallmentPlan({ total, count, firstDate, interval = 'monthly', ...ctxInput } = {}) {
  const ctx = resolveCalcContext(ctxInput);
  const first = parseIsoDate(firstDate);
  if (!first) return { calculatorId: 'installment_plan', invalid: true, reasonKey: 'calcInvalidDate' };
  const line = makeLine(ctx.currency);
  const amount = round2(Math.max(0, Number(total) || 0));
  const n = clampInt(count, 1, MAX_INSTALLMENTS);
  const weekly = interval === 'weekly';
  const cents = Math.round(amount * 100);
  const baseCents = Math.floor(cents / n);
  const rows = [];
  for (let i = 0; i < n; i += 1) {
    const due = weekly ? addDays(first, i * 7) : addMonthsClamped(first, i);
    const rowCents = i === n - 1 ? cents - baseCents * (n - 1) : baseCents;
    rows.push({
      labelKey: 'calcLabelInstallmentRow',
      labelParams: { n: i + 1, date: formatIsoDate(due) },
      amount: rowCents / 100,
      currency: ctx.currency || null,
    });
  }
  return universalResult('installment_plan', ctx, {
    breakdown: [line('calcLabelInstallmentTotal', amount), { labelKey: 'calcLabelInstallmentCount', amount: n, currency: 'DAY' }, ...rows],
    totalAmount: amount,
    totalLabelKey: 'calcLabelInstallmentTotal',
    statutoryFootnoteKey: 'calcFootnoteInstallment',
    meta: { count: n, interval: weekly ? 'weekly' : 'monthly', lastDate: rows[rows.length - 1].labelParams.date },
  });
}

/** Penalty ÷ contract value → %. Neutral: no "excessive" / "unenforceable" judgement. */
export function calculatePenaltyRatio({ penalty, contractValue, ...ctxInput } = {}) {
  const ctx = resolveCalcContext(ctxInput);
  const line = makeLine(ctx.currency);
  const p = Math.max(0, Number(penalty) || 0);
  const v = Math.max(0, Number(contractValue) || 0);
  const ratio = v > 0 ? (p / v) * 100 : 0;
  const ratioText = formatPercentText(ratio, ctxInput.language);
  return universalResult('penalty_ratio', ctx, {
    breakdown: [line('calcLabelPenalty', p), line('calcLabelContractValue', v), { labelKey: 'calcLabelPenaltyRatio', text: ratioText }],
    totalAmount: null,
    totalLabelKey: 'calcLabelPenaltyRatio',
    totalText: ratioText,
    statutoryFootnoteKey: 'calcFootnotePenalty',
    meta: { ratio: round2(ratio), contractValueZero: v === 0 },
  });
}

const shareAmount = (amount, currency) => {
  const n = Number(amount) || 0;
  const sign = n < 0 ? '-' : '';
  return `${sign}${Math.abs(n).toFixed(2)}${currency ? ` ${currency}` : ''}`;
};

/**
 * Share/copy text: breakdown → total → footnote → asOf (statutory only) → jurisdiction → disclaimer LAST.
 */
export function formatCalculationForSharing(result, format = 'plain', t = (k) => k) {
  if (!result || typeof result !== 'object' || result.unavailable || result.invalid) return '';
  const lines = [];
  const generic = result.mode === 'generic';
  const titleKey =
    result.calculatorId === 'labor_severance'
      ? 'calcSeveranceTitle'
      : result.calculatorId === 'rent_cap'
        ? generic ? 'calcRentTitleGeneric' : 'calcRentTitle'
        : result.calculatorId === 'legal_interest'
          ? generic ? 'calcInterestTitleGeneric' : 'calcInterestTitle'
          : getCalculatorMeta(result.calculatorId)?.titleKey || 'calcSectionTitle';
  lines.push(String(t(titleKey) || '').trim());
  lines.push('');

  (result.breakdown || []).forEach((row) => {
    const label = row.labelParams ? t(row.labelKey, row.labelParams) : t(row.labelKey);
    if (row.textKey || row.text != null) {
      lines.push(`${label}: ${row.textKey ? t(row.textKey, row.textParams) : row.text}`);
      return;
    }
    const amt = Number(row.amount);
    if (row.currency === 'DAY') {
      lines.push(`${label}: ${Math.round(amt)}`);
      return;
    }
    if (row.currency === 'PCT') {
      lines.push(`${label}: %${Math.abs(amt).toFixed(2)}`);
      return;
    }
    lines.push(`${label}: ${shareAmount(amt, row.currency)}`);
  });

  lines.push('');
  const totalValue = result.totalText != null ? result.totalText : shareAmount(result.totalAmount, result.currency);
  lines.push(`${t(result.totalLabelKey || 'calcEstimatedNet')}: ${totalValue}`);
  lines.push('');

  const footnote = String(t(result.statutoryFootnoteKey) || '').trim();
  if (footnote) {
    lines.push(footnote);
    lines.push('');
  }

  const asOf = result.mode === 'statutory' ? String(result.asOfDate || '').trim() : '';
  if (asOf) {
    lines.push(String(t('calcAsOfNotice', { date: asOf }) || `asOf ${asOf}`).trim());
    lines.push('');
  }

  const jurisdictionLine = String(
    t('calcJurisdictionLine', {
      jurisdiction: result.jurisdiction || t('calcJurisdictionGeneric'),
      currency: result.currency || '—',
    }) || ''
  ).trim();
  if (jurisdictionLine) {
    lines.push(jurisdictionLine);
    lines.push('');
  }

  const disclaimer = String(t(result.disclaimerKey || 'calcDisclaimer') || '').trim();
  if (disclaimer) {
    lines.push('—');
    lines.push(disclaimer);
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function buildCalcAdvisorPrompt(result, t = (k) => k) {
  const intro = String(t('calcAskAdvisorPrompt') || '').trim();
  const body = formatCalculationForSharing(result, 'plain', t);
  return `${intro}\n\n${body}`.trim();
}
