/**
 * WAVE ST.6 — Settings language / country card. Does not move the 7 section anchors.
 */

export const SETTINGS_LOCALE_KEYS = [
  'st6Lang',
  'st6LangHint',
  'st6Country',
  'st6CountryHint',
  'st6Rtl',
  'st6Generic',
  'st6Corridor',
];

export function assertSettingsLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`settingsLocale: ${msg}`);
  };
  check(SETTINGS_LOCALE_KEYS.length === 7, 'seven copy keys (legal footer lives once, in the trust card)');
  check(!SETTINGS_LOCALE_KEYS.some((key) => /Disclaimer$/.test(key)), 'no per-card disclaimer key');
  check(!/anonymi|hashed|win rate|best lawyer|generic mode|Turkish tables/i.test(SETTINGS_LOCALE_KEYS.join(' ')), 'ids are not overclaims');
  return { cases };
}
