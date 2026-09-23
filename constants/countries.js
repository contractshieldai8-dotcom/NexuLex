// Uluslararası telefon girişi için ülke / arama kodu veri seti.
// iso: ISO 3166-1 alpha-2, dial: E.164 ülke kodu, name: aramada kullanılan İngilizce ad.

export const COUNTRY_CODES = [
  { iso: 'TR', dial: '+90', flag: '🇹🇷', name: 'Türkiye', min: 10, max: 10 },
  { iso: 'US', dial: '+1', flag: '🇺🇸', name: 'United States', min: 10, max: 10 },
  { iso: 'CA', dial: '+1', flag: '🇨🇦', name: 'Canada', min: 10, max: 10 },
  { iso: 'GB', dial: '+44', flag: '🇬🇧', name: 'United Kingdom', min: 9, max: 10 },
  { iso: 'DE', dial: '+49', flag: '🇩🇪', name: 'Germany', min: 10, max: 11 },
  { iso: 'FR', dial: '+33', flag: '🇫🇷', name: 'France', min: 9, max: 9 },
  { iso: 'ES', dial: '+34', flag: '🇪🇸', name: 'Spain', min: 9, max: 9 },
  { iso: 'IT', dial: '+39', flag: '🇮🇹', name: 'Italy', min: 9, max: 10 },
  { iso: 'NL', dial: '+31', flag: '🇳🇱', name: 'Netherlands', min: 9, max: 9 },
  { iso: 'BE', dial: '+32', flag: '🇧🇪', name: 'Belgium', min: 8, max: 9 },
  { iso: 'CH', dial: '+41', flag: '🇨🇭', name: 'Switzerland', min: 9, max: 9 },
  { iso: 'AT', dial: '+43', flag: '🇦🇹', name: 'Austria', min: 9, max: 11 },
  { iso: 'PT', dial: '+351', flag: '🇵🇹', name: 'Portugal', min: 9, max: 9 },
  { iso: 'IE', dial: '+353', flag: '🇮🇪', name: 'Ireland', min: 9, max: 9 },
  { iso: 'DK', dial: '+45', flag: '🇩🇰', name: 'Denmark', min: 8, max: 8 },
  { iso: 'SE', dial: '+46', flag: '🇸🇪', name: 'Sweden', min: 7, max: 9 },
  { iso: 'NO', dial: '+47', flag: '🇳🇴', name: 'Norway', min: 8, max: 8 },
  { iso: 'FI', dial: '+358', flag: '🇫🇮', name: 'Finland', min: 9, max: 10 },
  { iso: 'IS', dial: '+354', flag: '🇮🇸', name: 'Iceland', min: 7, max: 7 },
  { iso: 'PL', dial: '+48', flag: '🇵🇱', name: 'Poland', min: 9, max: 9 },
  { iso: 'CZ', dial: '+420', flag: '🇨🇿', name: 'Czechia', min: 9, max: 9 },
  { iso: 'SK', dial: '+421', flag: '🇸🇰', name: 'Slovakia', min: 9, max: 9 },
  { iso: 'HU', dial: '+36', flag: '🇭🇺', name: 'Hungary', min: 9, max: 9 },
  { iso: 'RO', dial: '+40', flag: '🇷🇴', name: 'Romania', min: 9, max: 9 },
  { iso: 'BG', dial: '+359', flag: '🇧🇬', name: 'Bulgaria', min: 8, max: 9 },
  { iso: 'GR', dial: '+30', flag: '🇬🇷', name: 'Greece', min: 10, max: 10 },
  { iso: 'HR', dial: '+385', flag: '🇭🇷', name: 'Croatia', min: 8, max: 9 },
  { iso: 'RS', dial: '+381', flag: '🇷🇸', name: 'Serbia', min: 8, max: 9 },
  { iso: 'SI', dial: '+386', flag: '🇸🇮', name: 'Slovenia', min: 8, max: 8 },
  { iso: 'BA', dial: '+387', flag: '🇧🇦', name: 'Bosnia and Herzegovina', min: 8, max: 8 },
  { iso: 'AL', dial: '+355', flag: '🇦🇱', name: 'Albania', min: 9, max: 9 },
  { iso: 'MK', dial: '+389', flag: '🇲🇰', name: 'North Macedonia', min: 8, max: 8 },
  { iso: 'LT', dial: '+370', flag: '🇱🇹', name: 'Lithuania', min: 8, max: 8 },
  { iso: 'LV', dial: '+371', flag: '🇱🇻', name: 'Latvia', min: 8, max: 8 },
  { iso: 'EE', dial: '+372', flag: '🇪🇪', name: 'Estonia', min: 7, max: 8 },
  { iso: 'UA', dial: '+380', flag: '🇺🇦', name: 'Ukraine', min: 9, max: 9 },
  { iso: 'RU', dial: '+7', flag: '🇷🇺', name: 'Russia', min: 10, max: 10 },
  { iso: 'KZ', dial: '+7', flag: '🇰🇿', name: 'Kazakhstan', min: 10, max: 10 },
  { iso: 'BY', dial: '+375', flag: '🇧🇾', name: 'Belarus', min: 9, max: 9 },
  { iso: 'GE', dial: '+995', flag: '🇬🇪', name: 'Georgia', min: 9, max: 9 },
  { iso: 'AM', dial: '+374', flag: '🇦🇲', name: 'Armenia', min: 8, max: 8 },
  { iso: 'AZ', dial: '+994', flag: '🇦🇿', name: 'Azerbaijan', min: 9, max: 9 },
  { iso: 'CY', dial: '+357', flag: '🇨🇾', name: 'Cyprus', min: 8, max: 8 },
  { iso: 'MT', dial: '+356', flag: '🇲🇹', name: 'Malta', min: 8, max: 8 },
  { iso: 'LU', dial: '+352', flag: '🇱🇺', name: 'Luxembourg', min: 9, max: 9 },

  { iso: 'AE', dial: '+971', flag: '🇦🇪', name: 'United Arab Emirates', min: 9, max: 9 },
  { iso: 'SA', dial: '+966', flag: '🇸🇦', name: 'Saudi Arabia', min: 9, max: 9 },
  { iso: 'QA', dial: '+974', flag: '🇶🇦', name: 'Qatar', min: 8, max: 8 },
  { iso: 'KW', dial: '+965', flag: '🇰🇼', name: 'Kuwait', min: 8, max: 8 },
  { iso: 'BH', dial: '+973', flag: '🇧🇭', name: 'Bahrain', min: 8, max: 8 },
  { iso: 'OM', dial: '+968', flag: '🇴🇲', name: 'Oman', min: 8, max: 8 },
  { iso: 'JO', dial: '+962', flag: '🇯🇴', name: 'Jordan', min: 9, max: 9 },
  { iso: 'LB', dial: '+961', flag: '🇱🇧', name: 'Lebanon', min: 7, max: 8 },
  { iso: 'IQ', dial: '+964', flag: '🇮🇶', name: 'Iraq', min: 10, max: 10 },
  { iso: 'IR', dial: '+98', flag: '🇮🇷', name: 'Iran', min: 10, max: 10 },
  { iso: 'IL', dial: '+972', flag: '🇮🇱', name: 'Israel', min: 9, max: 9 },
  { iso: 'EG', dial: '+20', flag: '🇪🇬', name: 'Egypt', min: 10, max: 10 },
  { iso: 'MA', dial: '+212', flag: '🇲🇦', name: 'Morocco', min: 9, max: 9 },
  { iso: 'DZ', dial: '+213', flag: '🇩🇿', name: 'Algeria', min: 9, max: 9 },
  { iso: 'TN', dial: '+216', flag: '🇹🇳', name: 'Tunisia', min: 8, max: 8 },
  { iso: 'LY', dial: '+218', flag: '🇱🇾', name: 'Libya', min: 9, max: 9 },
  { iso: 'NG', dial: '+234', flag: '🇳🇬', name: 'Nigeria', min: 10, max: 10 },
  { iso: 'GH', dial: '+233', flag: '🇬🇭', name: 'Ghana', min: 9, max: 9 },
  { iso: 'KE', dial: '+254', flag: '🇰🇪', name: 'Kenya', min: 9, max: 9 },
  { iso: 'TZ', dial: '+255', flag: '🇹🇿', name: 'Tanzania', min: 9, max: 9 },
  { iso: 'UG', dial: '+256', flag: '🇺🇬', name: 'Uganda', min: 9, max: 9 },
  { iso: 'ET', dial: '+251', flag: '🇪🇹', name: 'Ethiopia', min: 9, max: 9 },
  { iso: 'ZA', dial: '+27', flag: '🇿🇦', name: 'South Africa', min: 9, max: 9 },
  { iso: 'SN', dial: '+221', flag: '🇸🇳', name: 'Senegal', min: 9, max: 9 },
  { iso: 'CI', dial: '+225', flag: '🇨🇮', name: "Côte d'Ivoire", min: 10, max: 10 },
  { iso: 'CM', dial: '+237', flag: '🇨🇲', name: 'Cameroon', min: 9, max: 9 },

  { iso: 'CN', dial: '+86', flag: '🇨🇳', name: 'China', min: 11, max: 11 },
  { iso: 'JP', dial: '+81', flag: '🇯🇵', name: 'Japan', min: 10, max: 10 },
  { iso: 'KR', dial: '+82', flag: '🇰🇷', name: 'South Korea', min: 9, max: 10 },
  { iso: 'IN', dial: '+91', flag: '🇮🇳', name: 'India', min: 10, max: 10 },
  { iso: 'PK', dial: '+92', flag: '🇵🇰', name: 'Pakistan', min: 10, max: 10 },
  { iso: 'BD', dial: '+880', flag: '🇧🇩', name: 'Bangladesh', min: 10, max: 10 },
  { iso: 'LK', dial: '+94', flag: '🇱🇰', name: 'Sri Lanka', min: 9, max: 9 },
  { iso: 'NP', dial: '+977', flag: '🇳🇵', name: 'Nepal', min: 10, max: 10 },
  { iso: 'AF', dial: '+93', flag: '🇦🇫', name: 'Afghanistan', min: 9, max: 9 },
  { iso: 'UZ', dial: '+998', flag: '🇺🇿', name: 'Uzbekistan', min: 9, max: 9 },
  { iso: 'TH', dial: '+66', flag: '🇹🇭', name: 'Thailand', min: 9, max: 9 },
  { iso: 'VN', dial: '+84', flag: '🇻🇳', name: 'Vietnam', min: 9, max: 10 },
  { iso: 'ID', dial: '+62', flag: '🇮🇩', name: 'Indonesia', min: 9, max: 12 },
  { iso: 'MY', dial: '+60', flag: '🇲🇾', name: 'Malaysia', min: 9, max: 10 },
  { iso: 'SG', dial: '+65', flag: '🇸🇬', name: 'Singapore', min: 8, max: 8 },
  { iso: 'PH', dial: '+63', flag: '🇵🇭', name: 'Philippines', min: 10, max: 10 },
  { iso: 'HK', dial: '+852', flag: '🇭🇰', name: 'Hong Kong', min: 8, max: 8 },
  { iso: 'TW', dial: '+886', flag: '🇹🇼', name: 'Taiwan', min: 9, max: 9 },
  { iso: 'AU', dial: '+61', flag: '🇦🇺', name: 'Australia', min: 9, max: 9 },
  { iso: 'NZ', dial: '+64', flag: '🇳🇿', name: 'New Zealand', min: 8, max: 10 },

  { iso: 'BR', dial: '+55', flag: '🇧🇷', name: 'Brazil', min: 10, max: 11 },
  { iso: 'MX', dial: '+52', flag: '🇲🇽', name: 'Mexico', min: 10, max: 10 },
  { iso: 'AR', dial: '+54', flag: '🇦🇷', name: 'Argentina', min: 10, max: 11 },
  { iso: 'CL', dial: '+56', flag: '🇨🇱', name: 'Chile', min: 9, max: 9 },
  { iso: 'CO', dial: '+57', flag: '🇨🇴', name: 'Colombia', min: 10, max: 10 },
  { iso: 'PE', dial: '+51', flag: '🇵🇪', name: 'Peru', min: 9, max: 9 },
  { iso: 'VE', dial: '+58', flag: '🇻🇪', name: 'Venezuela', min: 10, max: 10 },
  { iso: 'EC', dial: '+593', flag: '🇪🇨', name: 'Ecuador', min: 9, max: 9 },
  { iso: 'UY', dial: '+598', flag: '🇺🇾', name: 'Uruguay', min: 8, max: 8 },
  { iso: 'PY', dial: '+595', flag: '🇵🇾', name: 'Paraguay', min: 9, max: 9 },
  { iso: 'BO', dial: '+591', flag: '🇧🇴', name: 'Bolivia', min: 8, max: 8 },
  { iso: 'CR', dial: '+506', flag: '🇨🇷', name: 'Costa Rica', min: 8, max: 8 },
  { iso: 'PA', dial: '+507', flag: '🇵🇦', name: 'Panama', min: 8, max: 8 },
  { iso: 'DO', dial: '+1809', flag: '🇩🇴', name: 'Dominican Republic', min: 10, max: 10 },
  { iso: 'GT', dial: '+502', flag: '🇬🇹', name: 'Guatemala', min: 8, max: 8 },
];

// Uygulama diline göre makul bir varsayılan ülke kodu seçer.
const LANGUAGE_TO_ISO = {
  tr: 'TR',
  en: 'GB',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
  it: 'IT',
  pt: 'PT',
  nl: 'NL',
  ru: 'RU',
  ar: 'AE',
  zh: 'CN',
  ja: 'JP',
  fa: 'IR',
};

export const getCountryByIso = (iso) =>
  COUNTRY_CODES.find((item) => item.iso === iso) || COUNTRY_CODES[0];

export const getDefaultCountryForLanguage = (lang) =>
  getCountryByIso(LANGUAGE_TO_ISO[(lang || 'tr').split('-')[0]] || 'TR');

// Ülke kodu + yerel numaradan E.164 üretir (yalnızca "+" ve rakamlar).
export const toE164 = (country, localNumber) => {
  const digits = String(localNumber || '').replace(/\D/g, '').replace(/^0+/, '');
  if (!digits) return null;
  return `${country.dial}${digits}`.replace(/[^\d+]/g, '');
};

export const isValidLocalNumber = (country, localNumber) => {
  const digits = String(localNumber || '').replace(/\D/g, '').replace(/^0+/, '');
  return digits.length >= (country.min || 6) && digits.length <= (country.max || 14);
};
