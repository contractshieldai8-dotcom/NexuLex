/**
 * WAVE GR.6 — After the first acceptable scan: save a case, ask, or invite.
 * Invite reuses the GR.3 share loop after the 400 ms sheet gap. No outcome claims.
 */

export const SCAN_SUCCESS_JOBS = [
  { id: 'case', icon: 'folder-open-outline', titleKey: 'ssCase', hintKey: 'ssCaseHint', action: { type: 'openAdvisorTool', id: 'case_files' } },
  { id: 'ask', icon: 'help-buoy-outline', titleKey: 'ssAsk', hintKey: 'ssAskHint', action: { type: 'openAdvisorTool', id: 'legal_ask' } },
  { id: 'invite', icon: 'gift-outline', titleKey: 'ssInvite', hintKey: 'ssInviteHint', action: { type: 'invite' } },
];

export const SCAN_SUCCESS_IDS = SCAN_SUCCESS_JOBS.map((item) => item.id);

export const SCAN_SUCCESS_KEYS = [
  'ssTitle',
  'ssHint',
  'ssLead',
  'ssCase',
  'ssCaseHint',
  'ssAsk',
  'ssAskHint',
  'ssInvite',
  'ssInviteHint',
  'ssSkip',
  'ssTail',
  'ssDisclaimer',
];

export function jobForScanSuccess(id) {
  return SCAN_SUCCESS_JOBS.find((item) => item.id === id) || null;
}

export function assertScanSuccessFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`scanSuccess: ${msg}`);
  };
  check(SCAN_SUCCESS_JOBS.length === 3, 'three after-scan jobs');
  check(new Set(SCAN_SUCCESS_IDS).size === SCAN_SUCCESS_JOBS.length, 'unique ids');
  check(SCAN_SUCCESS_JOBS.every((item) => item.icon && item.titleKey && item.hintKey && item.action?.type), 'each job is complete');
  check(jobForScanSuccess('case')?.action.id === 'case_files', 'case opens case files');
  check(jobForScanSuccess('ask')?.action.id === 'legal_ask', 'ask opens legal ask');
  check(jobForScanSuccess('invite')?.action.type === 'invite' && !jobForScanSuccess('bogus'), 'invite is local; unknown is null');
  check(SCAN_SUCCESS_JOBS.filter((item) => item.action.type === 'openAdvisorTool').length === 2, 'two advisor tools');
  check(SCAN_SUCCESS_JOBS.every((item) => item.action.type !== 'openPaywall'), 'jobs never open the paywall');
  check(SCAN_SUCCESS_KEYS.length === 12 && SCAN_SUCCESS_KEYS.includes('ssDisclaimer'), 'twelve copy keys');
  return { cases };
}
