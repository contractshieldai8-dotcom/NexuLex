/**
 * WAVE UX.19 — First-intent honesty. GR.1 five paths stay; guides never lock.
 */

import { FIRST_INTENT_IDS, FIRST_INTENTS } from './firstIntent';
import { hookForFirstIntent } from './paywallIntent';

export const INTENT_LOCALE_KEYS = [
  'ux19Paths',
  'ux19Guides',
  'ux19Free',
  'ux19Lawyer',
  'ux19NoWin',
  'ux19Device',
  'ux19Corridor',
  'ux19Disclaimer',
];

export function assertIntentLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`intentLocale: ${msg}`);
  };
  check(INTENT_LOCALE_KEYS.length === 8 && INTENT_LOCALE_KEYS[INTENT_LOCALE_KEYS.length - 1] === 'ux19Disclaimer', 'eight keys, disclaimer last');
  check(FIRST_INTENTS.length === 5 && FIRST_INTENT_IDS.join(',') === 'analyze,ask,case,guides,lawyer', 'GR.1 order stays');
  check(FIRST_INTENTS.every((item) => item.action?.type !== 'openPaywall'), 'chips never open a paywall');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
