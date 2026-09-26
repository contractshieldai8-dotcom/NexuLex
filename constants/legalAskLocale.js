/**
 * WAVE UX.8 — Legal-ask honesty. Daily count is server-side; LR.3 ask* goldens stay.
 */

import { hookForFirstIntent } from './paywallIntent';
import { PLAN_LIMITS } from '../utils/plan';

export const LEGAL_ASK_LOCALE_KEYS = [
  'ux8Quota',
  'ux8Server',
  'ux8Country',
  'ux8NoAdvice',
  'ux8Sources',
  'ux8NoEvidence',
  'ux8Device',
  'ux8Disclaimer',
];

export function assertLegalAskLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`legalAskLocale: ${msg}`);
  };
  check(LEGAL_ASK_LOCALE_KEYS.length === 8 && LEGAL_ASK_LOCALE_KEYS[LEGAL_ASK_LOCALE_KEYS.length - 1] === 'ux8Disclaimer', 'eight keys, disclaimer last');
  check(PLAN_LIMITS.free.askDaily === 3 && PLAN_LIMITS.pro.askDaily === 40 && PLAN_LIMITS.professional.askDaily === 150, 'ask limits stay');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
