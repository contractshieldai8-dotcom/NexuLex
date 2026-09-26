/**
 * WAVE UX.9 — Document-explainer honesty. Free deadlines stay; LR.1 docExplain* goldens stay.
 */

import { hookForFirstIntent } from './paywallIntent';
import { FREE_EXPLAINS_PER_MONTH, MAX_EXPLAIN_PAGES } from '../utils/documentExplain';

export const DOCUMENT_EXPLAIN_LOCALE_KEYS = [
  'ux9Free',
  'ux9Deadlines',
  'ux9Pro',
  'ux9Country',
  'ux9Verify',
  'ux9Device',
  'ux9NoAdvice',
  'ux9Disclaimer',
];

export function assertDocumentExplainLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`documentExplainLocale: ${msg}`);
  };
  check(DOCUMENT_EXPLAIN_LOCALE_KEYS.length === 8 && DOCUMENT_EXPLAIN_LOCALE_KEYS[DOCUMENT_EXPLAIN_LOCALE_KEYS.length - 1] === 'ux9Disclaimer', 'eight keys, disclaimer last');
  check(FREE_EXPLAINS_PER_MONTH === 3 && MAX_EXPLAIN_PAGES === 4, 'free explains and page cap stay');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
