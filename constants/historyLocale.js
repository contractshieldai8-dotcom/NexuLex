/**
 * WAVE UX.21 — History-list honesty. Cloud rows, preview lock and share brief stay.
 * Does not rewrite historyTitle or UX.20 report goldens.
 */

import { hookForFirstIntent } from './paywallIntent';

export const HISTORY_LOCALE_KEYS = [
  'ux21Cloud',
  'ux21Delete',
  'ux21Share',
  'ux21Preview',
  'ux21Chat',
  'ux21NoWin',
  'ux21Guides',
  'ux21Disclaimer',
];

export function assertHistoryLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`historyLocale: ${msg}`);
  };
  check(
    HISTORY_LOCALE_KEYS.length === 8 &&
      HISTORY_LOCALE_KEYS[HISTORY_LOCALE_KEYS.length - 1] === 'ux21Disclaimer',
    'eight keys, disclaimer last'
  );
  check(HISTORY_LOCALE_KEYS.includes('ux21Cloud') && HISTORY_LOCALE_KEYS.includes('ux21Delete'), 'cloud and delete stay');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
