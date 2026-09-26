/**
 * WAVE UX.12 — Calculator honesty. Local table only; CB calc* goldens stay.
 */

import { LEGAL_CALCULATORS } from './legalCalcRates';
import { hookForFirstIntent } from './paywallIntent';

export const CALCULATOR_LOCALE_KEYS = [
  'ux12Table',
  'ux12Country',
  'ux12NoAdvice',
  'ux12Official',
  'ux12NoWin',
  'ux12Device',
  'ux12Free',
  'ux12Disclaimer',
];

export function assertCalculatorLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`calculatorLocale: ${msg}`);
  };
  check(CALCULATOR_LOCALE_KEYS.length === 8 && CALCULATOR_LOCALE_KEYS[CALCULATOR_LOCALE_KEYS.length - 1] === 'ux12Disclaimer', 'eight keys, disclaimer last');
  check(LEGAL_CALCULATORS.length === 8, 'calculator catalog stays');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
