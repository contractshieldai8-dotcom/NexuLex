/**
 * WAVE UX.26 — History pair compare. Reuses DiffTool. Does not rewrite UX.21/UX.23 goldens.
 */

import { hookForFirstIntent } from './paywallIntent';
import { formatHistoryRegisterCsv } from '../utils/historyRegister';
import {
  buildHistoryCompareSeed,
  canCompareHistoryPair,
  toggleHistoryComparePick,
} from '../utils/historyCompare';

export const HISTORY_COMPARE_LOCALE_KEYS = [
  'ux26Compare',
  'ux26Pick',
  'ux26Ready',
  'ux26Need',
  'ux26Local',
  'ux26NoWin',
  'ux26Guides',
  'ux26Disclaimer',
];

export function assertHistoryCompareLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`historyCompareLocale: ${msg}`);
  };
  check(
    HISTORY_COMPARE_LOCALE_KEYS.length === 8 &&
      HISTORY_COMPARE_LOCALE_KEYS[HISTORY_COMPARE_LOCALE_KEYS.length - 1] === 'ux26Disclaimer',
    'eight keys, disclaimer last'
  );
  check(toggleHistoryComparePick([], 'a').join(',') === 'a', 'first pick');
  check(toggleHistoryComparePick(['a', 'b'], 'c').join(',') === 'b,c', 'third pick replaces oldest');
  const left = { id: 'a1', created_at: '2026-01-01', contract_text: 'OLD CLAUSE' };
  const right = { id: 'a2', created_at: '2026-02-01', contract_text: 'NEW CLAUSE' };
  check(canCompareHistoryPair(left, right), 'two sourced rows compare');
  check(!canCompareHistoryPair(left, { id: 'a3', contract_text: '' }), 'empty source cannot compare');
  const seed = buildHistoryCompareSeed(right, left);
  check(seed.original === 'OLD CLAUSE' && seed.revised === 'NEW CLAUSE' && seed.mode === 'history', 'older text stays left');
  const csv = formatHistoryRegisterCsv([{ ...left, summary: 'ok', contract_text: 'SECRET CLAUSE MUST NOT EXPORT' }]);
  check(!/SECRET|contract_text|SECRET CLAUSE/i.test(csv), 'register still refuses contract text');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
