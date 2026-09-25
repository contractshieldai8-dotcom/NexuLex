/**
 * WAVE GR.4 — Intent-aware paywall. First-value paths stay free; a hook is only used after that value.
 * Does not change plan limits or existing hookAsk / hookCases / hookLawyer body copy (digit goldens).
 */

export const INTENT_PAYWALL_HOOK = {
  analyze: 'quota',
  ask: 'ask',
  case: 'cases',
  guides: null,
  lawyer: 'lawyer',
};

export const PAYWALL_FOOT_KEYS = {
  ask: 'pwFootAsk',
  cases: 'pwFootCases',
  lawyer: 'pwFootLawyer',
  quota: 'pwFootQuota',
  draft: 'pwFootDraft',
  share: 'pwFootShare',
  explain: 'pwFootExplain',
  professional: 'pwFootProfessional',
};

export const PAYWALL_FOOT_KEY_LIST = [
  'pwFootAsk',
  'pwFootCases',
  'pwFootLawyer',
  'pwFootQuota',
  'pwFootDraft',
  'pwFootShare',
  'pwFootExplain',
  'pwFootProfessional',
];

export function hookForFirstIntent(id) {
  if (!Object.prototype.hasOwnProperty.call(INTENT_PAYWALL_HOOK, id)) return undefined;
  return INTENT_PAYWALL_HOOK[id];
}

export function footKeyForHook(hook) {
  return PAYWALL_FOOT_KEYS[hook] || null;
}

export function assertPaywallIntentFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`paywallIntent: ${msg}`);
  };
  check(hookForFirstIntent('guides') === null, 'guides never open a paywall');
  check(hookForFirstIntent('ask') === 'ask' && hookForFirstIntent('case') === 'cases', 'ask and case hooks');
  check(hookForFirstIntent('lawyer') === 'lawyer' && hookForFirstIntent('analyze') === 'quota', 'lawyer and analyze hooks');
  check(hookForFirstIntent('bogus') === undefined, 'unknown intent is undefined');
  check(footKeyForHook('ask') === 'pwFootAsk' && footKeyForHook('cases') === 'pwFootCases', 'ask/cases footnotes');
  check(footKeyForHook('lawyer') === 'pwFootLawyer' && !footKeyForHook('guides'), 'lawyer footnote; guides have none');
  check(PAYWALL_FOOT_KEY_LIST.length === 8 && Object.keys(PAYWALL_FOOT_KEYS).length === 8, 'eight footnotes');
  check(!/%|win rate|best lawyer/i.test(Object.values(PAYWALL_FOOT_KEYS).join(' ')), 'ids are not marketing claims');
  return { cases };
}
