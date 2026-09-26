/**
 * WAVE UX.16 — Scenario-roadmap honesty. Local table only; CA scenario* goldens stay.
 */

import { LEGAL_SCENARIOS, SCENARIO_IDS } from './legalScenarios';
import { hookForFirstIntent } from './paywallIntent';

export const SCENARIO_LOCALE_KEYS = [
  'ux16Local',
  'ux16Country',
  'ux16Count',
  'ux16NoWin',
  'ux16NoAdvice',
  'ux16Device',
  'ux16Guides',
  'ux16Disclaimer',
];

export function assertScenarioLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`scenarioLocale: ${msg}`);
  };
  check(SCENARIO_LOCALE_KEYS.length === 8 && SCENARIO_LOCALE_KEYS[SCENARIO_LOCALE_KEYS.length - 1] === 'ux16Disclaimer', 'eight keys, disclaimer last');
  check(LEGAL_SCENARIOS.length === 5 && SCENARIO_IDS.length === 5, 'scenario catalog stays');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  return { cases };
}
