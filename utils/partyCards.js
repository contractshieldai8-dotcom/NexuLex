/**
 * Dual party-choice cards for Analyze UX.
 * Parties string from extractRadarPartiesFromText: normally supplier-ish first,
 * customer-ish second. İşveren convention flips to customer-label first — pass
 * sourceText so we map by toPartySide of preferred codes consistently.
 */

import {
  PARTY_ROLES,
  PARTY_SIDES,
  PREFERRED_PARTY_BY_CATEGORY,
  resolvePartyCode,
  toPartySide,
} from '../constants/options';

const preferredPair = (category = 'general') => {
  const pair = PREFERRED_PARTY_BY_CATEGORY[category] || PREFERRED_PARTY_BY_CATEGORY.general;
  return Array.isArray(pair) ? pair : PREFERRED_PARTY_BY_CATEGORY.general;
};

const roleMeta = (code) =>
  (PARTY_ROLES || []).find((item) => item.code === code) || { code, labelKey: 'selectPartyTitle', hintKey: '' };

const sideMeta = (code) => {
  const side = toPartySide(code);
  const fromSides =
    (PARTY_SIDES || []).find((item) => item.code === side) ||
    (PARTY_SIDES || [])[0] ||
    {
      code: 'buyer',
      labelKey: 'partyBuyerSide',
      hintKey: 'partyBuyerSideHint',
      icon: 'shield-checkmark-outline',
    };
  return {
    side,
    sideLabelKey: fromSides.labelKey || 'partyBuyerSide',
    sideHintKey: fromSides.hintKey || 'partyBuyerSideHint',
    icon: fromSides.icon || 'shield-checkmark-outline',
  };
};

const withSide = (card) => ({ ...card, ...sideMeta(card.code) });

const partiesFlippedByIsveren = (sourceText) =>
  /\bi[sş]veren\b/i.test(String(sourceText || ''));

/**
 * Opposing granular code for the same category (buyer↔seller side).
 */
export function flipPartyCode(code, category = 'general') {
  const pair = preferredPair(category);
  const side = toPartySide(code);
  const opposite = pair.find((item) => toPartySide(item) !== side);
  if (opposite) return opposite;
  return resolvePartyCode(side === 'seller' ? 'buyer' : 'seller', category);
}

/**
 * @returns {{
 *   code: string,
 *   name: string,
 *   labelKey: string,
 *   hintKey: string,
 *   side: 'buyer'|'seller',
 *   sideLabelKey: string,
 *   sideHintKey: string,
 *   icon: string,
 * }[]}
 */
export function buildPartyChoiceCards({ partiesStr, category = 'general', sourceText = '' } = {}) {
  const pair = preferredPair(category);
  const sellerCode = pair.find((item) => toPartySide(item) === 'seller') || pair[1] || 'provider';
  const buyerCode = pair.find((item) => toPartySide(item) === 'buyer') || pair[0] || 'customer';
  const seller = roleMeta(sellerCode);
  const buyer = roleMeta(buyerCode);

  const parts = String(partiesStr || '')
    .split(/\s+vs\s+/i)
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    const flipped = partiesFlippedByIsveren(sourceText);
    // Normal extract: [supplier, customer] → seller card, buyer card.
    // İşveren flip: [customer-label, supplier] → buyer card, seller card.
    const first = flipped
      ? { code: buyer.code, name: parts[0], labelKey: buyer.labelKey, hintKey: buyer.hintKey }
      : { code: seller.code, name: parts[0], labelKey: seller.labelKey, hintKey: seller.hintKey };
    const second = flipped
      ? { code: seller.code, name: parts[1], labelKey: seller.labelKey, hintKey: seller.hintKey }
      : { code: buyer.code, name: parts[1], labelKey: buyer.labelKey, hintKey: buyer.hintKey };
    return [withSide(first), withSide(second)];
  }

  // Names missing: preferred pair labels only.
  return [
    withSide({ code: buyer.code, name: '', labelKey: buyer.labelKey, hintKey: buyer.hintKey }),
    withSide({ code: seller.code, name: '', labelKey: seller.labelKey, hintKey: seller.hintKey }),
  ];
}
