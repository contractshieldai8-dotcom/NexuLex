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

export const CALCULATOR_IDS = ['labor_severance', 'rent_cap', 'legal_interest'];

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
    icon: 'home-outline',
  },
  {
    id: 'legal_interest',
    titleKey: 'calcInterestTitle',
    descriptionKey: 'calcInterestDesc',
    icon: 'trending-up-outline',
  },
];

/** labor_severance has no generic mode; rent/interest fall back to user-entered rates. */
export function isCalculatorAvailable(calculatorId, pack) {
  if (calculatorId === 'labor_severance') return !!pack?.calculators?.labor_severance;
  return CALCULATOR_IDS.includes(calculatorId);
}
