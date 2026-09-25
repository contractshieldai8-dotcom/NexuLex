/**
 * WAVE ST.7 — Settings privacy / terms / web-delete shortcut explainers.
 * Does not rewrite ST.1 or ST.2 goldens. TRUST_URLS stay the only public links.
 */

export const SETTINGS_SHORTCUT_KEYS = [
  'st7Privacy',
  'st7Terms',
  'st7Delete',
  'st7Lang',
  'st7Binding',
  'st7Store',
  'st7Offline',
  'st7Note',
];

export function assertSettingsShortcutFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`settingsShortcuts: ${msg}`);
  };
  check(SETTINGS_SHORTCUT_KEYS.length === 8 && SETTINGS_SHORTCUT_KEYS.includes('st7Note'), 'eight copy keys');
  check(SETTINGS_SHORTCUT_KEYS[SETTINGS_SHORTCUT_KEYS.length - 1] === 'st7Note', 'note last in the key list');
  check(!/anonymi|hashed|win rate|best lawyer/i.test(SETTINGS_SHORTCUT_KEYS.join(' ')), 'ids are not overclaims');
  return { cases };
}
