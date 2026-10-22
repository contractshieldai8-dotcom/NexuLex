/**
 * WAVE CB / CB.1 — Parametric statutory rate packs per jurisdiction (static placeholders).
 * Verify numbers with counsel before store submission. No live rate APIs.
 * Only jurisdictions with reviewed values get a pack; everything else runs in generic mode.
 */

import { isAutoCountry, normalizeLanguage } from './jurisdiction';

export const LEGAL_CALC_PACKS = {
  TR: {
    code: 'TR',
    currency: 'TRY',
    locale: 'tr-TR',
    asOfDate: '2026-01-01',
    verified: false,
    sourceNoteKey: 'calcRateTableSourceNote',
    calculators: {
      /** TR statutory monthly severance ceiling (TL) + stamp tax ratio — placeholder; verify before prod. */
      labor_severance: { severanceCap: 46154.2, stampTaxRate: 0.00759 },
      rent_cap: { indexLabelKey: 'calcTufeRate' },
      /** Statutory legal / commercial advance interest % (annual). */
      legal_interest: { legalInterestAnnual: 24.0, commercialInterestAnnual: 48.0 },
    },
    footnoteKeys: {
      labor_severance: 'calcFootnoteSeverance',
      rent_cap: 'calcFootnoteRent',
      legal_interest: 'calcFootnoteInterest',
    },
  },
};

/** Backward-compat alias. */
export const LEGAL_CALC_RATES = LEGAL_CALC_PACKS.TR;

/** Currency only — carries no legal values. */
export const GENERIC_CURRENCY_BY_COUNTRY = {
  TR: 'TRY',
  US: 'USD',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  EU: 'EUR',
  GB: 'GBP',
  AE: 'AED',
  SA: 'SAR',
  CN: 'CNY',
  JP: 'JPY',
  RU: 'RUB',
  IR: 'IRR',
  IN: 'INR',
  CA: 'CAD',
  AU: 'AUD',
  AT: 'EUR',
  CH: 'CHF',
  BR: 'BRL',
  MX: 'MXN',
  KR: 'KRW',
};

/** 'auto' country only. 'en' is intentionally unmapped (US / GB / others are ambiguous). */
const LANGUAGE_TO_CURRENCY = {
  tr: 'TRY',
  de: 'EUR',
  fr: 'EUR',
  es: 'EUR',
  it: 'EUR',
  nl: 'EUR',
  pt: 'EUR',
  ru: 'RUB',
  ar: 'AED',
  zh: 'CNY',
  ja: 'JPY',
  fa: 'IRR',
};

export function getCalcPack(country, language) {
  if (isAutoCountry(country)) return normalizeLanguage(language) === 'tr' ? LEGAL_CALC_PACKS.TR : null;
  return LEGAL_CALC_PACKS[String(country).toUpperCase()] || null;
}

/** Never falls back to TRY for non-tr; unknown → null (UI shows calcCurrencyUnset). */
export function resolveCurrency(country, language) {
  if (isAutoCountry(country)) return LANGUAGE_TO_CURRENCY[normalizeLanguage(language)] || null;
  return GENERIC_CURRENCY_BY_COUNTRY[String(country).toUpperCase()] || null;
}

/** JP.2 — pure arithmetic tools with no statutory values; offered in every country. */
export const UNIVERSAL_CALCULATOR_IDS = ['deadline_date', 'pro_rata', 'percent_change', 'installment_plan', 'penalty_ratio'];

export const CALCULATOR_IDS = ['labor_severance', 'rent_cap', 'legal_interest', ...UNIVERSAL_CALCULATOR_IDS];

export const LEGAL_CALCULATORS = [
  {
    id: 'labor_severance',
    titleKey: 'calcSeveranceTitle',
    descriptionKey: 'calcSeveranceDesc',
    icon: 'cash-outline',
  },
  {
    id: 'rent_cap',
    titleKey: 'calcRentTitle',
    descriptionKey: 'calcRentDesc',
    genericTitleKey: 'calcRentTitleGeneric',
    genericDescriptionKey: 'calcRentDescGeneric',
    icon: 'home-outline',
  },
  {
    id: 'legal_interest',
    titleKey: 'calcInterestTitle',
    descriptionKey: 'calcInterestDesc',
    genericTitleKey: 'calcInterestTitleGeneric',
    genericDescriptionKey: 'calcInterestDescGeneric',
    icon: 'trending-up-outline',
  },
  {
    id: 'deadline_date',
    titleKey: 'calcDeadlineTitle',
    descriptionKey: 'calcDeadlineDesc',
    icon: 'calendar-outline',
    universal: true,
    usesMoney: false,
  },
  {
    id: 'pro_rata',
    titleKey: 'calcProRataTitle',
    descriptionKey: 'calcProRataDesc',
    icon: 'pie-chart-outline',
    universal: true,
  },
  {
    id: 'percent_change',
    titleKey: 'calcPercentTitle',
    descriptionKey: 'calcPercentDesc',
    icon: 'stats-chart-outline',
    universal: true,
    usesMoney: false,
  },
  {
    id: 'installment_plan',
    titleKey: 'calcInstallmentTitle',
    descriptionKey: 'calcInstallmentDesc',
    icon: 'list-outline',
    universal: true,
  },
  {
    id: 'penalty_ratio',
    titleKey: 'calcPenaltyTitle',
    descriptionKey: 'calcPenaltyDesc',
    icon: 'alert-circle-outline',
    universal: true,
  },
];

export function getCalculatorMeta(calculatorId) {
  return LEGAL_CALCULATORS.find((item) => item.id === calculatorId) || null;
}

/** Statutory calculators carry a pack entry; generic mode must not show country-specific copy (e.g. TÜFE). */
export function isCalculatorStatutory(calculatorId, pack) {
  return !!pack?.calculators?.[calculatorId];
}

export function calculatorCopyKeys(calculatorId, pack) {
  const meta = LEGAL_CALCULATORS.find((item) => item.id === calculatorId);
  if (!meta) return null;
  const generic = !isCalculatorStatutory(calculatorId, pack) && meta.genericTitleKey;
  return {
    titleKey: generic ? meta.genericTitleKey : meta.titleKey,
    descriptionKey: generic ? meta.genericDescriptionKey : meta.descriptionKey,
  };
}

/** labor_severance has no generic mode; rent/interest fall back to user-entered rates. */
export function isCalculatorAvailable(calculatorId, pack) {
  if (calculatorId === 'labor_severance') return !!pack?.calculators?.labor_severance;
  return CALCULATOR_IDS.includes(calculatorId);
}
