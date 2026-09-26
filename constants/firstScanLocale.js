/**
 * WAVE UX.15 — First-scan success honesty. GR.6 jobs and GR.8 get.html stay.
 */

import { hookForFirstIntent } from './paywallIntent';
import { SHARE_LOOP_GET_URL } from './shareLoop';
import { SCAN_SUCCESS_IDS, SCAN_SUCCESS_JOBS } from './scanSuccess';
import { scanSuccessInviteUrl } from './scanSuccessLocale';

export const FIRST_SCAN_LOCALE_KEYS = [
  'ux15Once',
  'ux15Country',
  'ux15Free',
  'ux15Jobs',
  'ux15Invite',
  'ux15Pause',
  'ux15Guides',
  'ux15Disclaimer',
];

export function assertFirstScanLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`firstScanLocale: ${msg}`);
  };
  check(FIRST_SCAN_LOCALE_KEYS.length === 8 && FIRST_SCAN_LOCALE_KEYS[FIRST_SCAN_LOCALE_KEYS.length - 1] === 'ux15Disclaimer', 'eight keys, disclaimer last');
  check(SCAN_SUCCESS_JOBS.length === 3 && SCAN_SUCCESS_IDS.join(',') === 'case,ask,invite', 'GR.6 jobs stay');
  check(scanSuccessInviteUrl() === SHARE_LOOP_GET_URL, 'bare invite stays on get.html');
  check(SCAN_SUCCESS_JOBS.every((item) => item.action.type !== 'openPaywall'), 'jobs still never open the paywall');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
