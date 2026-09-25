/**
 * WAVE GR.8 — After-scan success honesty: country corridor + get.html invite only.
 * Does not rewrite GR.6 ss* goldens or the three jobs.
 */

import { inviteUrl, SHARE_LOOP_GET_URL } from './shareLoop';
import { SCAN_SUCCESS_IDS, SCAN_SUCCESS_JOBS } from './scanSuccess';

export const SCAN_SUCCESS_LOCALE_KEYS = [
  'gr8Country',
  'gr8Invite',
  'gr8Get',
  'gr8Case',
  'gr8Ask',
  'gr8NoWin',
  'gr8Lang',
  'gr8Note',
];

export function scanSuccessInviteUrl(language) {
  return inviteUrl(language);
}

export function assertScanSuccessLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`scanSuccessLocale: ${msg}`);
  };
  check(SCAN_SUCCESS_JOBS.length === 3 && SCAN_SUCCESS_IDS.join(',') === 'case,ask,invite', 'GR.6 jobs stay');
  check(scanSuccessInviteUrl() === SHARE_LOOP_GET_URL, 'bare invite stays on get.html');
  check(scanSuccessInviteUrl('de').startsWith(SHARE_LOOP_GET_URL) && scanSuccessInviteUrl('de').includes('lang=de'), 'invite adds lang');
  check(!scanSuccessInviteUrl('tr').includes('contract'), 'invite never names a contract');
  check(SCAN_SUCCESS_LOCALE_KEYS.length === 8 && SCAN_SUCCESS_LOCALE_KEYS.includes('gr8Note'), 'eight locale keys');
  check(SCAN_SUCCESS_JOBS.every((item) => item.action.type !== 'openPaywall'), 'jobs still never open the paywall');
  return { cases };
}
