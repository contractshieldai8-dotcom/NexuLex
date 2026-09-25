/**
 * WAVE CB / CB.1 — Pure local financial/legal calculators (0 LLM, 0 network).
 * Jurisdiction-aware: statutory values come only from a rate pack; otherwise generic mode
 * with user-entered rates. Currency is passed in and never defaults to TRY.
 */

import { getCalcPack, resolveCurrency } from '../constants/legalCalcRates';
import { resolveJurisdiction } from '../constants/jurisdiction';

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

const shareAmount = (amount, currency) => {
  const n = Number(amount) || 0;
  const sign = n < 0 ? '-' : '';
  return `${sign}${Math.abs(n).toFixed(2)}${currency ? ` ${currency}` : ''}`;
};

/**
 * Share/copy text: breakdown → total → footnote → asOf (statutory only) → jurisdiction → disclaimer LAST.
 */
export function formatCalculationForSharing(result, format = 'plain', t = (k) => k) {
  if (!result || typeof result !== 'object' || result.unavailable) return '';
  const lines = [];
  const generic = result.mode === 'generic';
  const titleKey =
    result.calculatorId === 'labor_severance'
      ? 'calcSeveranceTitle'
      : result.calculatorId === 'rent_cap'
        ? generic ? 'calcRentTitleGeneric' : 'calcRentTitle'
        : result.calculatorId === 'legal_interest'
          ? generic ? 'calcInterestTitleGeneric' : 'calcInterestTitle'
          : 'calcSectionTitle';
  lines.push(String(t(titleKey) || '').trim());
  lines.push('');

  (result.breakdown || []).forEach((row) => {
    const label = t(row.labelKey);
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
  lines.push(`${t('calcEstimatedNet')}: ${shareAmount(result.totalAmount, result.currency)}`);
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
