/**
 * WAVE UX.4 — Advisor home job honesty. Four chips stay; guides never lock.
 * Does not rewrite GR.5 ah* goldens.
 */

import { ADVISOR_HOME_JOBS, ADVISOR_HOME_KEYS } from './advisorHome';
import { hookForFirstIntent } from './paywallIntent';

export const ADVISOR_HOME_LOCALE_KEYS = [
  'ux4Ask',
  'ux4Guides',
  'ux4Case',
  'ux4Lawyer',
  'ux4Country',
  'ux4Free',
  'ux4NoPay',
  'ux4Disclaimer',
];

export function assertAdvisorHomeLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`advisorHomeLocale: ${msg}`);
  };
  check(ADVISOR_HOME_JOBS.length === 4 && ADVISOR_HOME_JOBS.map((item) => item.id).join(',') === 'ask,guides,case,lawyer', 'GR.5 order stays');
  check(!ADVISOR_HOME_JOBS.some((item) => item.open === 'paywall'), 'chips never open a paywall');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  check(ADVISOR_HOME_KEYS.includes('ahEmptyTail') && ADVISOR_HOME_KEYS.length === 8, 'ah keys stay');
  check(ADVISOR_HOME_LOCALE_KEYS.length === 8 && ADVISOR_HOME_LOCALE_KEYS[ADVISOR_HOME_LOCALE_KEYS.length - 1] === 'ux4Disclaimer', 'eight keys, disclaimer last');
  return { cases };
}
