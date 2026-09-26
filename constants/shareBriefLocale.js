/**
 * WAVE UX.22 — Share-brief honesty. Code is a viewer, not the contract.
 * SHARE_AUDIENCES and leak-block stay.
 */

import { hookForFirstIntent } from './paywallIntent';
import { SHARE_AUDIENCES } from '../utils/shareSnapshot';

export const SHARE_BRIEF_LOCALE_KEYS = [
  'ux22Brief',
  'ux22Code',
  'ux22Expire',
  'ux22Leak',
  'ux22Audience',
  'ux22Pro',
  'ux22Guides',
  'ux22Disclaimer',
];

export function assertShareBriefLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`shareBriefLocale: ${msg}`);
  };
  check(
    SHARE_BRIEF_LOCALE_KEYS.length === 8 &&
      SHARE_BRIEF_LOCALE_KEYS[SHARE_BRIEF_LOCALE_KEYS.length - 1] === 'ux22Disclaimer',
    'eight keys, disclaimer last'
  );
  check(SHARE_AUDIENCES.join(',') === 'household,advisor,counterparty', 'audiences stay');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
