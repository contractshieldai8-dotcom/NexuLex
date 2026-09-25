/**
 * WAVE UX.3 — Household / advisor seat invite. Code + public get page only.
 * Never attach contract text. Do not rewrite seatOs* goldens.
 */

import { inviteLeaksAnalysis, inviteUrl, SHARE_LOOP_GET_URL } from './shareLoop';

export const SEAT_INVITE_KEYS = [
  'ux3InviteHint',
  'ux3RedeemHint',
  'ux3Install',
  'ux3Household',
  'ux3Advisor',
  'ux3Get',
  'ux3Copy',
  'ux3Disclaimer',
];

export function buildSeatInvitePayload(t, seat, language) {
  const code = String(seat?.code || '').trim().toUpperCase();
  const base =
    seat?.role === 'household'
      ? t('seatOsHousehold', { code })
      : t('seatOsMessage', { code });
  const url = inviteUrl(language);
  const extra = t('ux3Install', { url });
  return {
    message: `${String(base || '').trim()}\n${String(extra || '').trim()}`,
    url,
    code,
  };
}

export function assertSeatInviteFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`seatInvite: ${msg}`);
  };
  const t = (key, opts) => {
    if (key === 'seatOsHousehold') return `NexuLex household seat ${opts.code}`;
    if (key === 'seatOsMessage') return `NexuLex advisor seat ${opts.code}`;
    if (key === 'ux3Install') return `Public page only: ${opts.url}`;
    return key;
  };
  const advisor = buildSeatInvitePayload(t, { role: 'advisor', code: 'AB23DEFG' }, 'en');
  const house = buildSeatInvitePayload(t, { role: 'household', code: 'XY45KLMN' }, 'tr');
  check(advisor.message.includes('AB23DEFG') && house.message.includes('XY45KLMN'), 'codes travel');
  check(advisor.message.includes(SHARE_LOOP_GET_URL) && house.url.includes('lang=tr'), 'install stays on get.html');
  check(!/contract_text|contractText/.test(advisor.message + house.message), 'payload names no contract field');
  check(
    !inviteLeaksAnalysis(advisor.message, {
      contract_text: 'Secret lease clause about deposit return timing',
      id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    }),
    'invite never includes the contract'
  );
  check(SEAT_INVITE_KEYS.length === 8 && SEAT_INVITE_KEYS[SEAT_INVITE_KEYS.length - 1] === 'ux3Disclaimer', 'eight keys, disclaimer last');
  check(inviteUrl() === SHARE_LOOP_GET_URL, 'unknown language stays on the bare get page');
  return { cases };
}
