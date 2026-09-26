/**
 * WAVE UX.18 — Second-session resume honesty. GR.2 rs* goldens stay; draft stays on device.
 */

import { hookForFirstIntent } from './paywallIntent';
import { MAX_DRAFT_CHARS, MIN_DRAFT_CHARS, RESUME_KINDS } from './sessionResume';

export const RESUME_LOCALE_KEYS = [
  'ux18Device',
  'ux18Draft',
  'ux18Corridor',
  'ux18NoNet',
  'ux18Jobs',
  'ux18NoWin',
  'ux18Guides',
  'ux18Disclaimer',
];

export function assertResumeLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`resumeLocale: ${msg}`);
  };
  check(RESUME_LOCALE_KEYS.length === 8 && RESUME_LOCALE_KEYS[RESUME_LOCALE_KEYS.length - 1] === 'ux18Disclaimer', 'eight keys, disclaimer last');
  check(RESUME_KINDS.join(',') === 'draft,case,ask,analysis', 'GR.2 kinds stay');
  check(MIN_DRAFT_CHARS === 24 && MAX_DRAFT_CHARS === 20000, 'draft caps stay');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
