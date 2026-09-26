/**
 * WAVE UX.10 — Process-guide honesty. Guides never lock; LR.4 pg* goldens stay.
 */

import { PROCESS_GUIDES } from './processGuides';
import { hookForFirstIntent } from './paywallIntent';

export const PROCESS_GUIDE_LOCALE_KEYS = [
  'ux10Free',
  'ux10Country',
  'ux10NoAdvice',
  'ux10Deadlines',
  'ux10Sources',
  'ux10NoList',
  'ux10Device',
  'ux10Disclaimer',
];

export function assertProcessGuideLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`processGuideLocale: ${msg}`);
  };
  check(PROCESS_GUIDE_LOCALE_KEYS.length === 8 && PROCESS_GUIDE_LOCALE_KEYS[PROCESS_GUIDE_LOCALE_KEYS.length - 1] === 'ux10Disclaimer', 'eight keys, disclaimer last');
  check(PROCESS_GUIDES.length === 25, 'guide catalog stays');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
