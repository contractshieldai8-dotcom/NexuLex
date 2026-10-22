/**
 * WAVE UX.11 — Paywall first-value honesty. Store owns prices; GR.4 / MX.1 / MX.2 goldens stay.
 */

import { hookForFirstIntent } from './paywallIntent';

export const PAYWALL_LOCALE_KEYS = [
  'ux11Store',
  'ux11Guides',
  'ux11Disclaimer',
];

export function assertPaywallLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`paywallLocale: ${msg}`);
  };
  check(PAYWALL_LOCALE_KEYS.length === 3 && PAYWALL_LOCALE_KEYS[PAYWALL_LOCALE_KEYS.length - 1] === 'ux11Disclaimer', 'three keys, disclaimer last');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  check(hookForFirstIntent('ask') === 'ask' && hookForFirstIntent('analyze') === 'quota', 'first-value hooks stay');
  return { cases };
}
