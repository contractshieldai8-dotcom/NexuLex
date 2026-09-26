/**
 * WAVE UX.13 — Guided-draft honesty. Free preview stays; CC draft* goldens stay.
 */

import { DRAFT_CATALOG, DRAFT_FREE_PREVIEW_LINES } from './draftTemplates';
import { hookForFirstIntent } from './paywallIntent';

export const DRAFT_LOCALE_KEYS = [
  'ux13Preview',
  'ux13Blank',
  'ux13Country',
  'ux13NoAdvice',
  'ux13Send',
  'ux13Device',
  'ux13NoWin',
  'ux13Disclaimer',
];

export function assertDraftLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`draftLocale: ${msg}`);
  };
  check(DRAFT_LOCALE_KEYS.length === 8 && DRAFT_LOCALE_KEYS[DRAFT_LOCALE_KEYS.length - 1] === 'ux13Disclaimer', 'eight keys, disclaimer last');
  check(DRAFT_FREE_PREVIEW_LINES === 8 && DRAFT_CATALOG.length === 10, 'preview lines and catalog stay');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
