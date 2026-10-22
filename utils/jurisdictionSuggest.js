// Pure jurisdiction suggestion (no React Native imports, so it can be unit-tested in Node).
// Maps the app language and the device region to a default legal corridor.

const LANG_TO_JURISDICTION = {
  tr: 'TR',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
  it: 'IT',
  nl: 'NL',
  ru: 'RU',
  zh: 'CN',
  fa: 'IR',
  ar: 'AE',
  ja: 'JP',
  pt: 'PT',
};

// Regions that have their own selectable corridor but no matching UI language
// (or a language shared with several countries).
const REGION_CORRIDORS = ['JP', 'BR', 'PT', 'MX', 'KR'];

const norm = (value, upper) => {
  const part = String(value || '').split(/[-_]/)[0];
  return upper ? part.toUpperCase() : part.toLowerCase();
};

export function suggestJurisdictionFor(lang, region) {
  const code = norm(lang, false);
  const regionCode = norm(region, true);

  if (code === 'en') {
    if (REGION_CORRIDORS.includes(regionCode)) {
      return { code: regionCode, englishPick: false, arabicAlt: false };
    }
    if (['GB', 'AU', 'IE'].includes(regionCode)) {
      return { code: 'GB', englishPick: false, arabicAlt: false };
    }
    if (['US', 'CA'].includes(regionCode)) {
      return { code: 'US', englishPick: false, arabicAlt: false };
    }
    return { code: 'US', englishPick: true, arabicAlt: false };
  }

  if (code === 'ar') {
    if (regionCode === 'SA') {
      return { code: 'SA', englishPick: false, arabicAlt: true };
    }
    return { code: 'AE', englishPick: false, arabicAlt: true };
  }

  // Portuguese is shared by Portugal and Brazil; Spanish by Spain and Mexico.
  if (code === 'pt') {
    return { code: regionCode === 'BR' ? 'BR' : 'PT', englishPick: false, arabicAlt: false };
  }
  if (code === 'es' && regionCode === 'MX') {
    return { code: 'MX', englishPick: false, arabicAlt: false };
  }

  if (LANG_TO_JURISDICTION[code]) {
    return { code: LANG_TO_JURISDICTION[code], englishPick: false, arabicAlt: false };
  }

  return { code: 'auto', englishPick: false, arabicAlt: false };
}
