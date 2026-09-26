/**
 * WAVE UX.6 — Lawyer hand-off honesty. Official bodies only; no lawyer list.
 * Does not rewrite LR.6 lh* goldens or BAR_BODIES.
 */

import { BAR_BODIES, HANDOFF_QUESTIONS, lawyerDirectoriesFor } from './lawyerHandoff';
import { hookForFirstIntent } from './paywallIntent';

export const LAWYER_HANDOFF_LOCALE_KEYS = [
  'ux6NoList',
  'ux6Country',
  'ux6OnDevice',
  'ux6IntroFree',
  'ux6Packet',
  'ux6NoWin',
  'ux6Check',
  'ux6Disclaimer',
];

export function assertLawyerHandoffLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`lawyerHandoffLocale: ${msg}`);
  };
  check(LAWYER_HANDOFF_LOCALE_KEYS.length === 8 && LAWYER_HANDOFF_LOCALE_KEYS[LAWYER_HANDOFF_LOCALE_KEYS.length - 1] === 'ux6Disclaimer', 'eight keys, disclaimer last');
  check(lawyerDirectoriesFor('TR').covered && BAR_BODIES.TR[0].url === 'https://www.barobirlik.org.tr', 'TR bar body stays');
  check(HANDOFF_QUESTIONS.length === 8, 'question list stays');
  check(!Object.values(BAR_BODIES).flat().some((body) => /\b(avukat|attorney at law|rechtsanwalt)\b/i.test(body.name) && !/birli|kammer|bar|society|association/i.test(body.name)), 'directories stay bodies');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
