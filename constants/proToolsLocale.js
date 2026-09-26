/**
 * WAVE UX.14 — Professional-tools honesty. Server quota stays; LR.5 pt* goldens stay.
 */

import { PLAN_LIMITS } from '../utils/plan';
import { hookForFirstIntent } from './paywallIntent';

export const PRO_TOOLS_LOCALE_KEYS = [
  'ux14Quota',
  'ux14Server',
  'ux14Plan',
  'ux14Material',
  'ux14Sources',
  'ux14NoAdvice',
  'ux14Device',
  'ux14Disclaimer',
];

export function assertProToolsLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`proToolsLocale: ${msg}`);
  };
  check(PRO_TOOLS_LOCALE_KEYS.length === 8 && PRO_TOOLS_LOCALE_KEYS[PRO_TOOLS_LOCALE_KEYS.length - 1] === 'ux14Disclaimer', 'eight keys, disclaimer last');
  check(PLAN_LIMITS.professional.toolsDaily === 30 && PLAN_LIMITS.pro.toolsDaily === 0, 'Professional tools stay paid');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
