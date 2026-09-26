/**
 * WAVE UX.23 — History command center. Client filter + metadata register.
 * Does not rewrite historyTitle or UX.21 goldens.
 */

import { hookForFirstIntent } from './paywallIntent';
import { LIFECYCLES } from '../utils/lifecycle';
import {
  HISTORY_LIFECYCLE_FILTERS,
  HISTORY_RISK_FILTERS,
  buildHistoryRegisterRows,
  formatHistoryRegisterCsv,
} from '../utils/historyRegister';

export const HISTORY_OPS_LOCALE_KEYS = [
  'ux23Search',
  'ux23Filter',
  'ux23Export',
  'ux23Register',
  'ux23Count',
  'ux23Empty',
  'ux23Guides',
  'ux23Disclaimer',
];

export function assertHistoryOpsLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`historyOpsLocale: ${msg}`);
  };
  check(
    HISTORY_OPS_LOCALE_KEYS.length === 8 &&
      HISTORY_OPS_LOCALE_KEYS[HISTORY_OPS_LOCALE_KEYS.length - 1] === 'ux23Disclaimer',
    'eight keys, disclaimer last'
  );
  check(LIFECYCLES.join(',') === 'draft,negotiating,signed', 'lifecycle codes stay');
  check(HISTORY_RISK_FILTERS.join(',') === 'all,RED,YELLOW,GREEN', 'risk chips stay');
  check(HISTORY_LIFECYCLE_FILTERS[0] === 'all' && HISTORY_LIFECYCLE_FILTERS.slice(1).join(',') === LIFECYCLES.join(','), 'lifecycle chips stay');
  const sample = formatHistoryRegisterCsv([
    {
      id: 'a1',
      created_at: '2026-01-01',
      score: 40,
      overall_risk: 'RED',
      lifecycle: 'draft',
      contract_category: 'rent',
      parties: 'A / B',
      summary: 'Deposit held too long',
      contract_text: 'SECRET CLAUSE MUST NOT EXPORT',
    },
  ]);
  check(!/SECRET|contract_text|SECRET CLAUSE/i.test(sample), 'register never copies contract text');
  check(buildHistoryRegisterRows([{ id: 'a1', summary: 'ok', contract_text: 'nope' }])[0].summary === 'ok', 'register keeps summary only');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
