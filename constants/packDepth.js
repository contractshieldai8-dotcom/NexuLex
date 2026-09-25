/**
 * WAVE JP.3 — Official-source depth for the selected country.
 * Reuses JP.2 packs and LR.4 official bodies. Does not enable unverified packs
 * and does not add statutory lists to anyone but the existing TR pack.
 */

import { resolveJurisdiction } from './jurisdiction';
import { JURISDICTION_PACKS, OFFICIAL_SOURCE_ROOTS } from './jurisdictionPacks';
import { OFFICIAL_BODIES, PG_EU_MEMBERS } from './processGuides';
import { OFFICIAL_SOURCES, isOfficialUrl } from '../utils/legalAnswer';

export const PACK_DEPTH_TYPES = ['portal', 'courts', 'legalAid', 'labor'];

export function packDepthFor(country, language) {
  const code = resolveJurisdiction(country, language);
  const pack = code ? JURISDICTION_PACKS[code] || null : null;
  const official = code ? OFFICIAL_SOURCES[code] || null : null;
  const portal = official?.portal || pack?.sources?.[0]?.url || (code ? OFFICIAL_SOURCE_ROOTS[code] : '') || '';
  const tables = [code && OFFICIAL_BODIES[code], code && PG_EU_MEMBERS.includes(code) ? OFFICIAL_BODIES.EU : null].filter(Boolean);
  const seen = new Set();
  const links = [];
  if (portal && /^https:\/\//i.test(portal) && !seen.has(portal)) {
    seen.add(portal);
    links.push({ type: 'portal', name: 'portal', url: portal });
  }
  for (const type of PACK_DEPTH_TYPES) {
    for (const table of tables) {
      for (const body of table[type] || []) {
        const url = String(body?.url || '').trim();
        if (!url || seen.has(url) || !isOfficialUrl(url, code)) continue;
        seen.add(url);
        links.push({ type, name: body.name, url });
      }
    }
  }
  return {
    code: code || null,
    portal,
    links,
    officialCount: links.length,
    statutoryLive: Boolean(pack?.enabled && (pack.calculators || []).length),
    packPending: Boolean(pack && !pack.enabled),
    asOfDate: pack?.asOfDate || null,
  };
}

export function assertPackDepthFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`packDepth: ${msg}`);
  };
  const tr = packDepthFor('TR', 'tr');
  check(tr.statutoryLive && tr.asOfDate === '2026-01-01', 'TR statutory pack date stays 2026-01-01');
  check(String(tr.portal).startsWith('https://www.mevzuat.gov.tr'), 'TR portal is mevzuat.gov.tr');
  check(!tr.packPending && tr.officialCount >= 1, 'TR is live and has at least the portal');
  const de = packDepthFor('DE', 'de');
  check(!de.statutoryLive && de.packPending, 'DE stays pending — no invented German tables');
  check(String(de.portal).startsWith('https://www.gesetze-im-internet.de'), 'DE portal stays the JP.2 root');
  const us = packDepthFor('US', 'en');
  check(!us.statutoryLive && us.packPending, 'US pack stays disabled');
  const autoEn = packDepthFor('auto', 'en');
  check(autoEn.code === null && !autoEn.statutoryLive, 'auto+en stays generic');
  const autoTr = packDepthFor('auto', 'tr');
  check(autoTr.code === 'TR' && autoTr.statutoryLive, 'auto+tr still resolves to TR');
  check(
    JURISDICTION_PACKS.TR.calculators.join() === 'labor_severance,rent_cap,legal_interest',
    'TR calculator list is byte-stable'
  );
  check(
    Object.keys(JURISDICTION_PACKS)
      .filter((code) => code !== 'TR')
      .every((code) => !JURISDICTION_PACKS[code].enabled && !JURISDICTION_PACKS[code].calculators.length),
    'no other pack gained statutory lists'
  );
  for (const row of [tr, de, us]) {
    check(row.links.every((link) => isOfficialUrl(link.url, row.code)), `${row.code} links stay on the official allowlist`);
    check(!/TBK|BGB|Art\.|§/.test(JSON.stringify(row.links)), `${row.code} must not invent citations`);
  }
  return { cases };
}
