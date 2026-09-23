/**
 * WAVE CB.1 — Jurisdiction resolution shared by calculators, scenarios and drafts.
 * Pure: no i18n, no device locale, no phone-code lookups.
 */

export function normalizeLanguage(language) {
  return String(language || '').slice(0, 2).toLowerCase();
}

export function isAutoCountry(country) {
  return country == null || country === '' || country === 'auto';
}

/**
 * Explicit country code → that code. 'auto' + tr → 'TR'. 'auto' + anything else → null (generic).
 */
export function resolveJurisdiction(country, language) {
  if (isAutoCountry(country)) return normalizeLanguage(language) === 'tr' ? 'TR' : null;
  return String(country).toUpperCase();
}
