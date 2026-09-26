/**
 * WAVE ST.9 — Settings delete / retention honesty. Does not move the 7 section anchors.
 * ST.1 accountDeleteWarning and ST.2 trust URLs stay.
 */

import { hookForFirstIntent } from './paywallIntent';
import { TRUST_URLS } from './settingsTrust';

export const SETTINGS_DELETE_KEYS = [
  'st9Analyses',
  'st9Device',
  'st9Sub',
  'st9Web',
  'st9Store',
  'st9Restore',
  'st9Guides',
  'st9Disclaimer',
];

export function assertSettingsDeleteFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`settingsDelete: ${msg}`);
  };
  check(
    SETTINGS_DELETE_KEYS.length === 8 &&
      SETTINGS_DELETE_KEYS[SETTINGS_DELETE_KEYS.length - 1] === 'st9Disclaimer',
    'eight keys, disclaimer last'
  );
  check(TRUST_URLS.deleteAccount.endsWith('/delete-account.html'), 'web delete URL stays');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
