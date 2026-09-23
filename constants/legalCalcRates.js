/**
 * WAVE CB — Parametric statutory rate table (static placeholders for P0).
 * Verify numbers with counsel before store submission. No live rate APIs.
 */

export const LEGAL_CALC_RATES = {
  asOfDate: '2026-01-01',
  /** TR statutory monthly severance ceiling (TL) — placeholder; verify before prod. */
  severanceCap: 46154.2,
  /** Stamp tax ratio applied to severance. */
  stampTaxRate: 0.00759,
  /** Statutory legal interest % (annual). */
  legalInterestAnnual: 24.0,
  /** Commercial advance interest % (annual). */
  commercialInterestAnnual: 48.0,
  sourceNoteKey: 'calcRateTableSourceNote',
};

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
