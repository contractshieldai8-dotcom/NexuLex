/**
 * WAVE ST.8 — Settings plan / quota honesty. Does not move the 7 section anchors.
 * Numbers come from PLAN_LIMITS; the store still owns the subscription.
 */

import { PLAN_LIMITS } from '../utils/plan';
import { pickAnnualCompare } from './annualHighlight';
import { hookForFirstIntent } from './paywallIntent';
import { pickProfessionalCompare } from './professionalCompare';

export const SETTINGS_PLAN_KEYS = [
  'st8Plan',
  'st8Store',
  'st8Quota',
  'st8Ask',
  'st8Tools',
  'st8First',
  'st8Restore',
];

export function assertSettingsPlanFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`settingsPlan: ${msg}`);
  };
  check(SETTINGS_PLAN_KEYS.length === 7 && !SETTINGS_PLAN_KEYS.some((key) => /Disclaimer$/.test(key)), 'seven keys, no per-card disclaimer (legal footer lives once, in the trust card)');
  check(PLAN_LIMITS.free.askDaily === 3 && PLAN_LIMITS.pro.askDaily === 40 && PLAN_LIMITS.professional.askDaily === 150, 'ask limits stay');
  check(PLAN_LIMITS.pro.toolsDaily === 0 && PLAN_LIMITS.professional.toolsDaily === 30, 'Professional tools stay paid');
  check(hookForFirstIntent('guides') === null, 'guides never lock');
  check(pickAnnualCompare([
    { packageType: 'MONTHLY', price: 10, currencyCode: 'USD' },
    { packageType: 'ANNUAL', price: 84, currencyCode: 'USD' },
  ])?.percent === 30, 'MX.1 yearly compare stays');
  check(pickProfessionalCompare(
    [{ packageType: 'ANNUAL', price: 84, currencyCode: 'USD' }],
    [{ packageType: 'ANNUAL', price: 126, currencyCode: 'USD' }],
  )?.percent === 50, 'MX.2 store compare stays');
  return { cases };
}
