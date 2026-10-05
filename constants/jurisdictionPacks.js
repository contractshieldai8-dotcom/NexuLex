/**
 * WAVE JP.2 — Jurisdiction registry + availability.
 * A pack goes live by flipping `enabled` after its content is verified; `verified` records legal review.
 * Sources are official portal roots only (no deep links until a reviewer confirms them).
 */

import { resolveJurisdiction } from './jurisdiction';
import { LEGAL_CALCULATORS, isCalculatorAvailable } from './legalCalcRates';
import { DRAFT_CATALOG, resolveDraftVariant } from './draftTemplates';
import { LEGAL_SCENARIOS } from './legalScenarios';

export const OFFICIAL_SOURCE_ROOTS = {
  TR: 'https://www.mevzuat.gov.tr',
  DE: 'https://www.gesetze-im-internet.de',
  GB: 'https://www.legislation.gov.uk',
  US: 'https://www.law.cornell.edu',
  FR: 'https://www.legifrance.gouv.fr',
  ES: 'https://www.boe.es',
  IT: 'https://www.normattiva.it',
  NL: 'https://wetten.overheid.nl',
  AE: 'https://uaelegislation.gov.ae',
  SA: 'https://laws.boe.gov.sa',
  EU: 'https://eur-lex.europa.eu',
  IN: 'https://indiacode.nic.in',
  CA: 'https://laws-lois.justice.gc.ca',
  AU: 'https://www.legislation.gov.au',
  AT: 'https://www.ris.bka.gv.at',
  CH: 'https://www.fedlex.admin.ch',
};

/** The EU pack applies on top of these member jurisdictions. */
export const EU_MEMBERS = ['DE', 'FR', 'ES', 'IT', 'NL', 'AT'];

const pack = (code, overrides = {}) => ({
  code,
  enabled: false,
  verified: false,
  asOfDate: null,
  reviewer: null,
  sources: [{ labelKey: 'jpSourceOfficialPortal', url: OFFICIAL_SOURCE_ROOTS[code] }],
  calculators: [],
  scenarios: [],
  drafts: [],
  ...overrides,
});

export const JURISDICTION_PACKS = {
  // Live launch pack: rates still await review (verified: false) but the behaviour is unchanged.
  TR: pack('TR', {
    enabled: true,
    asOfDate: '2026-01-01',
    calculators: ['labor_severance', 'rent_cap', 'legal_interest'],
    scenarios: LEGAL_SCENARIOS.map((item) => item.id),
    drafts: ['notice_payment', 'mediation_application', 'consumer_complaint'],
  }),
  DE: pack('DE'),
  GB: pack('GB'),
  US: pack('US'),
  FR: pack('FR'),
  ES: pack('ES'),
  IT: pack('IT'),
  NL: pack('NL'),
  AE: pack('AE'),
  SA: pack('SA'),
  EU: pack('EU'),
  IN: pack('IN'),
  CA: pack('CA'),
  AU: pack('AU'),
  AT: pack('AT'),
  CH: pack('CH'),
};

const LIST_KEY = { calculator: 'calculators', draft: 'drafts', scenario: 'scenarios' };

/** Items that work in every country without a pack (generic / arithmetic / neutral letter). */
export function isUniversalItem(itemType, itemId) {
  if (itemType === 'calculator') {
    return LEGAL_CALCULATORS.some((item) => item.id === itemId) && isCalculatorAvailable(itemId, null);
  }
  if (itemType === 'draft') {
    const template = DRAFT_CATALOG.find((item) => item.id === itemId);
    return !!template && !!resolveDraftVariant(template, null);
  }
  if (itemType === 'scenario') return LEGAL_SCENARIOS.some((item) => item.id === itemId);
  return false;
}

export function applicablePacks(jurisdiction, packs = JURISDICTION_PACKS) {
  if (!jurisdiction) return [];
  const out = [];
  if (packs[jurisdiction]) out.push(packs[jurisdiction]);
  if (EU_MEMBERS.includes(jurisdiction) && packs.EU) out.push(packs.EU);
  return out;
}

/**
 * @returns {{ availability: 'available'|'pending'|'none', universal: boolean }}
 * `universal` = offered only through the universal path (no enabled pack lists it) → globe marker in the UI.
 */
export function getAvailabilityInfo(itemType, itemId, { country, language, packs = JURISDICTION_PACKS } = {}) {
  const listKey = LIST_KEY[itemType];
  if (!listKey) return { availability: 'none', universal: false };
  const applicable = applicablePacks(resolveJurisdiction(country, language), packs);
  const listed = (predicate) => applicable.some((p) => predicate(p) && (p[listKey] || []).includes(itemId));
  if (listed((p) => p.enabled)) return { availability: 'available', universal: false };
  if (isUniversalItem(itemType, itemId)) return { availability: 'available', universal: true };
  if (listed((p) => !p.enabled)) return { availability: 'pending', universal: false };
  return { availability: 'none', universal: false };
}

export function getAvailability(itemType, itemId, options = {}) {
  return getAvailabilityInfo(itemType, itemId, options).availability;
}

/** Drops 'none', keeps registry order within each group, available before pending. */
export function withAvailability(itemType, items, options = {}) {
  const rows = (items || []).map((item) => ({ item, ...getAvailabilityInfo(itemType, item.id, options) }));
  return [
    ...rows.filter((row) => row.availability === 'available'),
    ...rows.filter((row) => row.availability === 'pending'),
  ];
}
