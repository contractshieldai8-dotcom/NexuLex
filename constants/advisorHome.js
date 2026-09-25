/**
 * WAVE GR.5 — Advisor empty-home jobs. Four first actions on the advisor tab.
 * Guides and lawyer stay on the main screen; nothing here opens a paywall.
 */

export const ADVISOR_HOME_JOBS = [
  { id: 'ask', icon: 'help-buoy-outline', titleKey: 'ahAsk', open: 'ask' },
  { id: 'guides', icon: 'map-outline', titleKey: 'ahGuides', open: 'guides' },
  { id: 'case', icon: 'folder-open-outline', titleKey: 'ahCase', open: 'case' },
  { id: 'lawyer', icon: 'briefcase-outline', titleKey: 'ahLawyer', open: 'lawyer' },
];

export const ADVISOR_HOME_KEYS = ['ahTitle', 'ahHint', 'ahAsk', 'ahGuides', 'ahCase', 'ahLawyer', 'ahEmptyLead', 'ahEmptyTail'];

export function advisorHomeJob(id) {
  return ADVISOR_HOME_JOBS.find((item) => item.id === id) || null;
}

export function assertAdvisorHomeFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`advisorHome: ${msg}`);
  };
  check(ADVISOR_HOME_JOBS.length === 4, 'four home jobs');
  check(new Set(ADVISOR_HOME_JOBS.map((item) => item.id)).size === 4, 'unique ids');
  check(ADVISOR_HOME_JOBS.some((item) => item.id === 'guides') && ADVISOR_HOME_JOBS.some((item) => item.id === 'lawyer'), 'guides and lawyer stay on home');
  check(ADVISOR_HOME_JOBS.every((item) => item.icon && item.titleKey && item.open), 'each job is complete');
  check(advisorHomeJob('ask')?.open === 'ask' && !advisorHomeJob('bogus'), 'ask route; unknown is null');
  check(!ADVISOR_HOME_JOBS.some((item) => item.open === 'paywall'), 'home jobs never open a paywall');
  check(ADVISOR_HOME_KEYS.length === 8, 'eight copy keys');
  check(ADVISOR_HOME_JOBS[0].id === 'ask' && ADVISOR_HOME_JOBS[3].id === 'lawyer', 'ask first, lawyer last');
  return { cases };
}
