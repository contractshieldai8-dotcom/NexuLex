/**
 * WAVE CB — Pure local financial/legal calculators (0 LLM, 0 network).
 */

import { LEGAL_CALC_RATES } from '../constants/legalCalcRates';

const CURRENCY = 'TRY';

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const line = (labelKey, amount) => ({
  labelKey,
  amount: round2(amount),
  currency: CURRENCY,
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
 * Kıdem (severance): monthly base capped × years; stamp tax deducted.
 * Optional estimated notice pay when includesNoticePay (1× capped monthly).
 */
export function calculateSeverance({ grossSalary, workMonths, includesNoticePay } = {}) {
  const rates = LEGAL_CALC_RATES;
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
    breakdown,
    totalAmount: round2(totalAmount),
    statutoryFootnoteKey: 'calcFootnoteSeverance',
    disclaimerKey: 'calcDisclaimer',
    asOfDate: rates.asOfDate,
    meta: { years: round2(years), monthlyBase: round2(monthlyBase), capApplied },
  };
}

/**
 * Rent increase vs TÜFE / statutory limit (local only; proposedRate vs tufeRate).
 */
export function calculateRentIncrease({
  currentRent,
  proposedRent,
  tufeRate,
  isResidential = true,
} = {}) {
  const rates = LEGAL_CALC_RATES;
  const current = Math.max(0, Number(currentRent) || 0);
  const proposed = Math.max(0, Number(proposedRent) || 0);
  const tufe = Math.max(0, Number(tufeRate) || 0);
  // P0: residential and non-residential both compare against provided tufeRate locally.
  const maxAllowed = current * (1 + tufe / 100);
  const difference = proposed - maxAllowed;
  const overCap = proposed > maxAllowed + 0.009;

  const breakdown = [
    line('calcLabelCurrentRent', current),
    line('calcLabelProposedRent', proposed),
    line('calcLabelMaxAllowed', maxAllowed),
    line('calcLabelDifference', difference),
  ];

  return {
    calculatorId: 'rent_cap',
    breakdown,
    totalAmount: round2(maxAllowed),
    statutoryFootnoteKey: 'calcFootnoteRent',
    disclaimerKey: 'calcDisclaimer',
    asOfDate: rates.asOfDate,
    meta: {
      tufeRate: round2(tufe),
      isResidential: Boolean(isResidential),
      overCap,
      proposedRate: current > 0 ? round2(((proposed - current) / current) * 100) : 0,
    },
  };
}

/**
 * Simple day-count legal/commercial interest (estimated).
 * (Principal × Rate × Days) / (365 × 100)
 */
export function calculateLegalInterest({
  principal,
  startDate,
  endDate,
  interestType = 'legal',
} = {}) {
  const rates = LEGAL_CALC_RATES;
  const amount = Math.max(0, Number(principal) || 0);
  const days = dayCount(startDate, endDate);
  const annual =
    String(interestType || 'legal').toLowerCase() === 'commercial'
      ? Number(rates.commercialInterestAnnual) || 0
      : Number(rates.legalInterestAnnual) || 0;
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
    breakdown,
    totalAmount: round2(total),
    statutoryFootnoteKey: 'calcFootnoteInterest',
    disclaimerKey: 'calcDisclaimer',
    asOfDate: rates.asOfDate,
    meta: {
      days,
      annualRate: annual,
      interestType: String(interestType || 'legal').toLowerCase() === 'commercial' ? 'commercial' : 'legal',
      interestAmount: round2(interest),
      estimated: true,
    },
  };
}

/**
 * Share/copy text. Always appends footnote, asOfDate, and mandatory disclaimer last.
 */
export function formatCalculationForSharing(result, format = 'plain', t = (k) => k) {
  if (!result || typeof result !== 'object') return '';
  const lines = [];
  const titleKey =
    result.calculatorId === 'labor_severance'
      ? 'calcSeveranceTitle'
      : result.calculatorId === 'rent_cap'
        ? 'calcRentTitle'
        : result.calculatorId === 'legal_interest'
          ? 'calcInterestTitle'
          : 'calcSectionTitle';
  lines.push(String(t(titleKey) || '').trim());
  lines.push('');

  (result.breakdown || []).forEach((row) => {
    const label = t(row.labelKey);
    const amt = Number(row.amount);
    const cur = String(row.currency || CURRENCY);
    if (cur === 'DAY') {
      lines.push(`${label}: ${Math.round(amt)}`);
      return;
    }
    if (cur === 'PCT') {
      lines.push(`${label}: %${Math.abs(amt).toFixed(2)}`);
      return;
    }
    const sign = amt < 0 ? '-' : '';
    lines.push(`${label}: ${sign}${Math.abs(amt).toFixed(2)} ${cur}`);
  });

  lines.push('');
  lines.push(`${t('calcEstimatedNet')}: ${Number(result.totalAmount || 0).toFixed(2)} ${CURRENCY}`);
  lines.push('');

  const footnote = String(t(result.statutoryFootnoteKey) || '').trim();
  if (footnote) {
    lines.push(footnote);
    lines.push('');
  }

  const asOf = String(result.asOfDate || LEGAL_CALC_RATES.asOfDate || '').trim();
  if (asOf) {
    lines.push(String(t('calcAsOfNotice', { date: asOf }) || `asOf ${asOf}`).trim());
    lines.push('');
  }

  const disclaimer = String(t(result.disclaimerKey || 'calcDisclaimer') || '').trim();
  if (disclaimer) {
    lines.push('—');
    lines.push(disclaimer);
  }

  let text = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (format === 'whatsapp' || format === 'email') {
    text = text;
  }
  return text;
}

export function buildCalcAdvisorPrompt(result, t = (k) => k) {
  const intro = String(t('calcAskAdvisorPrompt') || '').trim();
  const body = formatCalculationForSharing(result, 'plain', t);
  return `${intro}\n\n${body}`.trim();
}
