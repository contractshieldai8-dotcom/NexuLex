// Ülke mevzuatı ve rapor dili seçicilerinin ortak veri kaynağı.
// Etiketler i18n anahtarlarıyla, hukuk ipuçları ise sabit mevzuat adlarıyla verilir.

export const JURISDICTIONS = [
  { code: 'auto', labelKey: 'countryAuto', hint: '' },
  { code: 'TR', labelKey: 'countryTR', hint: 'TBK · TMK · İş Kanunu · TTK' },
  { code: 'US', labelKey: 'countryUS', hint: 'UCC · NY / DE / CA State Law' },
  { code: 'DE', labelKey: 'countryDE', hint: 'BGB · HGB · AGB-Kontrolle' },
  { code: 'GB', labelKey: 'countryGB', hint: 'Common Law · UCTA 1977 · CRA 2015' },
  { code: 'FR', labelKey: 'countryFR', hint: 'Code civil · Code du travail' },
  { code: 'ES', labelKey: 'countryES', hint: 'Código Civil · Estatuto de los Trabajadores' },
  { code: 'IT', labelKey: 'countryIT', hint: 'Codice civile · art. 1341-1342' },
  { code: 'NL', labelKey: 'countryNL', hint: 'Burgerlijk Wetboek' },
  { code: 'EU', labelKey: 'countryEU', hint: 'GDPR · Rome I · EU Directives' },
  { code: 'AE', labelKey: 'countryAE', hint: 'UAE Civil Code · Federal Decree-Law' },
  { code: 'SA', labelKey: 'countrySA', hint: 'Civil Transactions Law · Sharia' },
  { code: 'CN', labelKey: 'countryCN', hint: '民法典 · 劳动合同法' },
  { code: 'RU', labelKey: 'countryRU', hint: 'Гражданский кодекс РФ · ТК РФ' },
  { code: 'IR', labelKey: 'countryIR', hint: 'قانون مدنی · قانون کار' },
  { code: 'IN', labelKey: 'countryIN', hint: 'Indian Contract Act 1872 · Stamp Act · IT Act' },
  { code: 'CA', labelKey: 'countryCA', hint: 'Common Law · Code civil du Québec' },
  { code: 'AU', labelKey: 'countryAU', hint: 'Common Law · ACL · Unfair Contract Terms' },
  { code: 'AT', labelKey: 'countryAT', hint: 'ABGB · KSchG · UGB' },
  { code: 'CH', labelKey: 'countryCH', hint: 'OR · ZGB · UWG' },
  { code: 'JP', labelKey: 'countryJP', hint: '民法 · 消費者契約法 · 労働契約法' },
  { code: 'BR', labelKey: 'countryBR', hint: 'Código Civil · CDC · CLT · LGPD' },
  { code: 'PT', labelKey: 'countryPT', hint: 'Código Civil · DL 446/85 · Código do Trabalho' },
  { code: 'MX', labelKey: 'countryMX', hint: 'Código Civil Federal · LFPC · LFT' },
  { code: 'KR', labelKey: 'countryKR', hint: '민법 · 약관규제법 · 근로기준법' },
];

// Uygulama arayüzü ve rapor dilleri (i18n kodlarıyla birebir aynı).
// `english` alanı, kullanıcı kendi dilinde yazamadığında arama yapabilsin diye tutulur.
export const APP_LANGUAGES = [
  { code: 'tr', label: 'Türkçe', english: 'Turkish', short: 'TR', flag: '🇹🇷' },
  { code: 'en', label: 'English', english: 'English', short: 'EN', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', english: 'German', short: 'DE', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', english: 'French', short: 'FR', flag: '🇫🇷' },
  { code: 'es', label: 'Español', english: 'Spanish', short: 'ES', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', english: 'Italian', short: 'IT', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', english: 'Portuguese', short: 'PT', flag: '🇵🇹' },
  { code: 'nl', label: 'Nederlands', english: 'Dutch', short: 'NL', flag: '🇳🇱' },
  { code: 'ru', label: 'Русский', english: 'Russian', short: 'RU', flag: '🇷🇺' },
  { code: 'ar', label: 'العربية', english: 'Arabic', short: 'AR', flag: '🇸🇦' },
  { code: 'zh', label: '中文', english: 'Chinese', short: 'ZH', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', english: 'Japanese', short: 'JA', flag: '🇯🇵' },
  { code: 'fa', label: 'فارسی', english: 'Persian', short: 'FA', flag: '🇮🇷' },
];

export const SUPPORTED_LANGUAGE_CODES = APP_LANGUAGES.map((item) => item.code);

export const getLanguage = (code) =>
  APP_LANGUAGES.find((item) => item.code === code) || APP_LANGUAGES[1];

// Rapor dili listesi: "auto" seçildiğinde uygulama dili kullanılır.
export const REPORT_LANGUAGES = [
  { code: 'auto', label: null, labelKey: 'sameAsAppLanguage' },
  ...APP_LANGUAGES,
];

export const getJurisdiction = (code) =>
  JURISDICTIONS.find((item) => item.code === code) || JURISDICTIONS[0];

export const resolveReportLanguage = (reportLang, appLang) =>
  !reportLang || reportLang === 'auto' ? appLang : reportLang;

// Analizde kimin çıkarının korunacağı. "auto" sözleşmeden zayıf/imzalayan tarafı seçer.
export const CONTRACT_CATEGORIES = {
  typeGeneral: 'general',
  typeLabor: 'labor',
  typeRent: 'rent',
  typeNDA: 'nda',
  typeSaaS: 'saas',
  typeSales: 'sales',
  typeConsumer: 'consumer',
  typeFreelance: 'freelance',
};

export const categoryFromTypeKey = (typeKey) =>
  CONTRACT_CATEGORIES[typeKey] || 'general';

export const typeKeyFromCategory = (category) => {
  const match = Object.entries(CONTRACT_CATEGORIES).find(([, value]) => value === category);
  return match ? match[0] : 'typeGeneral';
};

const SELLER_CODES = new Set(['seller', 'landlord', 'employer', 'provider', 'freelancer']);
const GRANULAR_PARTY_CODES = new Set([
  'buyer',
  'seller',
  'tenant',
  'landlord',
  'employee',
  'employer',
  'customer',
  'provider',
]);

export const toPartySide = (code) => (SELLER_CODES.has(code) ? 'seller' : 'buyer');

export const isGranularPartyCode = (code) => GRANULAR_PARTY_CODES.has(String(code || '').trim());

export const isKnownPartyCode = (code) =>
  (PARTY_ROLES || []).some((item) => item.code === String(code || '').trim());

export const resolvePartyCode = (side, category = 'general') => {
  const resolved = toPartySide(side);
  const buyerByCategory = {
    rent: 'tenant',
    labor: 'employee',
    sales: 'buyer',
    saas: 'customer',
    nda: 'customer',
    consumer: 'customer',
    freelance: 'customer',
    general: 'buyer',
  };
  const sellerByCategory = {
    rent: 'landlord',
    labor: 'employer',
    sales: 'seller',
    saas: 'provider',
    nda: 'provider',
    consumer: 'seller',
    freelance: 'provider',
    general: 'seller',
  };
  return (resolved === 'seller' ? sellerByCategory : buyerByCategory)[category] || resolved;
};

/** Analyze payload: granular codes (incl. buyer|seller) pass through unchanged. */
export const resolvePartyForAnalyze = (party, category = 'general') => {
  const code = String(party || '').trim();
  if (isGranularPartyCode(code)) return code;
  if (isKnownPartyCode(code)) return code;
  return resolvePartyCode('buyer', category);
};

export const PREFERRED_PARTY_BY_CATEGORY = {
  rent: ['tenant', 'landlord'],
  labor: ['employee', 'employer'],
  sales: ['buyer', 'seller'],
  saas: ['customer', 'provider'],
  nda: ['customer', 'provider'],
  consumer: ['customer', 'provider'],
  freelance: ['customer', 'provider'],
  general: ['customer', 'provider'],
};

/** UI sheet list: granular roles only (incl. buyer/seller for sales). */
export const partyRolesForCategory = (category = 'general') => {
  const preferred = (PREFERRED_PARTY_BY_CATEGORY[category] || PREFERRED_PARTY_BY_CATEGORY.general).filter(
    (code) => isGranularPartyCode(code)
  );
  const head = preferred
    .map((code) => (PARTY_ROLES || []).find((item) => item.code === code))
    .filter(Boolean);
  const headCodes = new Set(head.map((item) => item.code));
  const rest = (PARTY_ROLES || []).filter(
    (item) => isGranularPartyCode(item.code) && !headCodes.has(item.code)
  );
  return [...head, ...rest];
};

/**
 * Align party to category preferred set by side only.
 * Never blanket-map buyer→customer / seller→provider; sales keeps buyer|seller.
 */
export const coercePartyForCategory = (party, category = 'general') => {
  let code = String(party || '').trim();
  if (!isGranularPartyCode(code)) {
    code = resolvePartyCode(toPartySide(code || 'buyer'), category);
  }
  if (!isGranularPartyCode(code)) {
    return (PREFERRED_PARTY_BY_CATEGORY[category] || PREFERRED_PARTY_BY_CATEGORY.general)[0] || 'customer';
  }

  const preferred = new Set(
    (PREFERRED_PARTY_BY_CATEGORY[category] || []).filter((item) => isGranularPartyCode(item))
  );
  if (preferred.size && !preferred.has(code)) {
    const side = toPartySide(code);
    const match = [...preferred].find((item) => toPartySide(item) === side);
    if (match) return match;
  }
  return code;
};

export const toUserPartyRole = (code) => {
  if (!code || code === 'auto') return 'neutral';
  if (code === 'customer') return 'client';
  if (code === 'provider') return 'freelancer';
  return code;
};

export const PARTY_SIDES = [
  { code: 'buyer', labelKey: 'partyBuyerSide', hintKey: 'partyBuyerSideHint', icon: 'shield-checkmark-outline' },
  { code: 'seller', labelKey: 'partySellerSide', hintKey: 'partySellerSideHint', icon: 'scale-outline' },
];

export const PARTY_ROLES = [
  { code: 'buyer', labelKey: 'partyBuyer', hintKey: 'partyBuyerHint' },
  { code: 'seller', labelKey: 'partySeller', hintKey: 'partySellerHint' },
  { code: 'tenant', labelKey: 'partyTenant', hintKey: 'partyTenantHint' },
  { code: 'landlord', labelKey: 'partyLandlord', hintKey: 'partyLandlordHint' },
  { code: 'employee', labelKey: 'partyEmployee', hintKey: 'partyEmployeeHint' },
  { code: 'employer', labelKey: 'partyEmployer', hintKey: 'partyEmployerHint' },
  { code: 'customer', labelKey: 'partyCustomer', hintKey: 'partyCustomerHint' },
  { code: 'provider', labelKey: 'partyProvider', hintKey: 'partyProviderHint' },
];
