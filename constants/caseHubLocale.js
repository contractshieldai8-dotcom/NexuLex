/**
 * WAVE UX.7 — Case hub honesty. Device-local file; original contract is not attached.
 * Does not rewrite LR.2 case* goldens or FREE_CASE_LIMIT.
 */

import { hookForFirstIntent } from './paywallIntent';
import { FREE_CASE_LIMIT } from '../utils/caseFiles';

export const CASE_HUB_LOCALE_KEYS = [
  'ux7OnDevice',
  'ux7NoContract',
  'ux7Free',
  'ux7Evidence',
  'ux7Brief',
  'ux7NoWin',
  'ux7Share',
  'ux7Disclaimer',
];

export function assertCaseHubLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`caseHubLocale: ${msg}`);
  };
  check(CASE_HUB_LOCALE_KEYS.length === 8 && CASE_HUB_LOCALE_KEYS[CASE_HUB_LOCALE_KEYS.length - 1] === 'ux7Disclaimer', 'eight keys, disclaimer last');
  check(FREE_CASE_LIMIT === 1, 'free case limit stays');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
