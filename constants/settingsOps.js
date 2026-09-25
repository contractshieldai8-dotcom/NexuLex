/**
 * WAVE ST.4 — Settings seats / support / security explainer. Does not change the 7 section anchors.
 */

export const SETTINGS_OPS_KEYS = [
  'st4Seats',
  'st4SeatsHint',
  'st4Support',
  'st4SupportHint',
  'st4Security',
  'st4SecurityHint',
  'st4Plan',
  'st4Disclaimer',
];

export function assertSettingsOpsFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`settingsOps: ${msg}`);
  };
  check(SETTINGS_OPS_KEYS.length === 8 && SETTINGS_OPS_KEYS.includes('st4Disclaimer'), 'eight copy keys');
  check(SETTINGS_OPS_KEYS[SETTINGS_OPS_KEYS.length - 1] === 'st4Disclaimer', 'disclaimer last in the key list');
  check(!/anonymi|hashed|win rate|best lawyer/i.test(SETTINGS_OPS_KEYS.join(' ')), 'ids are not overclaims');
  return { cases };
}
