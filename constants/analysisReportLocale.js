/**
 * WAVE UX.20 — Analysis-report honesty. Preview lock and GR.6 stay.
 * Same block is shown on the analyze result and the history modal.
 */

import { hookForFirstIntent } from './paywallIntent';

export const ANALYSIS_REPORT_LOCALE_KEYS = [
  'ux20Preview',
  'ux20Country',
  'ux20Score',
  'ux20Pdf',
  'ux20Share',
  'ux20Guides',
  'ux20NoWin',
  'ux20Disclaimer',
];

export function assertAnalysisReportLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`analysisReportLocale: ${msg}`);
  };
  check(
    ANALYSIS_REPORT_LOCALE_KEYS.length === 8 &&
      ANALYSIS_REPORT_LOCALE_KEYS[ANALYSIS_REPORT_LOCALE_KEYS.length - 1] === 'ux20Disclaimer',
    'eight keys, disclaimer last'
  );
  check(ANALYSIS_REPORT_LOCALE_KEYS.includes('ux20Country') && ANALYSIS_REPORT_LOCALE_KEYS.includes('ux20Preview'), 'preview and corridor stay');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
