/**
 * WAVE UX.5 — Analyze empty-home honesty. Five GR.1 chips stay; guides never lock.
 * Does not rewrite fi* goldens.
 */

import { FIRST_INTENTS, FIRST_INTENT_IDS, firstIntentKeys } from './firstIntent';
import { hookForFirstIntent } from './paywallIntent';

export const ANALYZE_HOME_LOCALE_KEYS = [
  'ux5Country',
  'ux5Lang',
  'ux5Scan',
  'ux5Free',
  'ux5Guides',
  'ux5Lawyer',
  'ux5NoWin',
  'ux5Disclaimer',
];

export function assertAnalyzeHomeLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`analyzeHomeLocale: ${msg}`);
  };
  check(FIRST_INTENTS.length === 5 && FIRST_INTENT_IDS.join(',') === 'analyze,ask,case,guides,lawyer', 'GR.1 order stays');
  check(FIRST_INTENTS.every((item) => item.action?.type !== 'openPaywall'), 'chips never open a paywall');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  check(firstIntentKeys().length === 16, 'fi keys stay');
  check(ANALYZE_HOME_LOCALE_KEYS.length === 8 && ANALYZE_HOME_LOCALE_KEYS[ANALYZE_HOME_LOCALE_KEYS.length - 1] === 'ux5Disclaimer', 'eight keys, disclaimer last');
  return { cases };
}
