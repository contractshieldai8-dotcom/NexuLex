/**
 * WAVE UX.11 — Paywall first-value honesty. Store owns prices; GR.4 / MX.1 / MX.2 goldens stay.
 */

import { hookForFirstIntent } from './paywallIntent';

export const PAYWALL_LOCALE_KEYS = [
  'ux11Store',
  'ux11First',
  'ux11Guides',
  'ux11Yearly',
  'ux11Peer',
  'ux11Restore',
  'ux11NoCourt',
  'ux11Disclaimer',
];

export function assertPaywallLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`paywallLocale: ${msg}`);
  };
  check(PAYWALL_LOCALE_KEYS.length === 8 && PAYWALL_LOCALE_KEYS[PAYWALL_LOCALE_KEYS.length - 1] === 'ux11Disclaimer', 'eight keys, disclaimer last');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  check(hookForFirstIntent('ask') === 'ask' && hookForFirstIntent('analyze') === 'quota', 'first-value hooks stay');
  return { cases };
}
