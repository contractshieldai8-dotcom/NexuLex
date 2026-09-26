/**
 * WAVE UX.17 — After-scan invite honesty. GR.3 get.html and vl* goldens stay.
 */

import { hookForFirstIntent } from './paywallIntent';
import { inviteUrl, rateUrl, SHARE_LOOP_GET_URL, SHARE_LOOP_PLAY_URL } from './shareLoop';

export const SHARE_INVITE_LOCALE_KEYS = [
  'ux17Get',
  'ux17NoReport',
  'ux17Once',
  'ux17NoWin',
  'ux17Store',
  'ux17Device',
  'ux17Guides',
  'ux17Disclaimer',
];

export function assertShareInviteLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`shareInviteLocale: ${msg}`);
  };
  check(SHARE_INVITE_LOCALE_KEYS.length === 8 && SHARE_INVITE_LOCALE_KEYS[SHARE_INVITE_LOCALE_KEYS.length - 1] === 'ux17Disclaimer', 'eight keys, disclaimer last');
  check(inviteUrl() === SHARE_LOOP_GET_URL && SHARE_LOOP_GET_URL === 'https://nexulexai.netlify.app/get.html', 'bare invite stays on get.html');
  check(rateUrl('android') === SHARE_LOOP_PLAY_URL && rateUrl('ios') === SHARE_LOOP_GET_URL, 'rate targets stay');
  check(!inviteUrl('tr').includes('contract'), 'invite never names a contract');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
