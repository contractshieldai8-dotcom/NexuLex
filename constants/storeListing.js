/**
 * WAVE REL.1 — App Store / Google Play listing schema, limits and the launch checklist.
 * Pure: store copy is authored in scripts/l10n/store.<lang>.js and is not imported by the app.
 */
import { ENTITLEMENT_IDS, PLAN_LIMITS, PROFESSIONAL_OFFERING_ID } from '../utils/plan.js';

export const STORE_LANGS = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
export const STORE_NAME = 'NexuLex AI';
export const STORE_URLS = {
  privacy: 'https://nexulexai.netlify.app/privacy.html',
  terms: 'https://nexulexai.netlify.app/terms.html',
  deleteAccount: 'https://nexulexai.netlify.app/delete-account.html',
  supportEmail: 'nexulexai@gmail.com',
  appleSubscriptions: 'https://apps.apple.com/account/subscriptions',
  playSubscriptions: 'https://play.google.com/store/account/subscriptions',
};

/** Character limits as the stores count them (JS code points via [...str].length). */
export const STORE_LIMITS = {
  name: 30,
  subtitle: 30,
  promotionalText: 170,
  shortDescription: 80,
  description: 4000,
  keywords: 100,
  whatsNew: 4000,
  screenshot: 48,
};

export const SCREENSHOT_IDS = ['analyze', 'decision', 'advisor', 'cases', 'guides', 'lawyer', 'languages'];

export const STORE_FIELDS = [
  'name',
  'subtitle',
  'promotionalText',
  'shortDescription',
  'description',
  'keywords',
  'whatsNew',
  ...SCREENSHOT_IDS.map((id) => `shot_${id}`),
];

/** Paste-ready launch checklist. The app cannot see the store consoles; these are the fields a human must set. */
export const STORE_CHECKLIST = [
  { id: 'privacy_url', store: 'both', need: `Privacy policy URL: ${STORE_URLS.privacy}` },
  { id: 'terms_url', store: 'both', need: `Terms of use URL: ${STORE_URLS.terms}` },
  { id: 'delete_url', store: 'play', need: `Account deletion URL: ${STORE_URLS.deleteAccount}` },
  { id: 'support_email', store: 'both', need: `Support email: ${STORE_URLS.supportEmail}` },
  { id: 'rc_entitlement_pro', store: 'revenuecat', need: `Entitlement id \`${ENTITLEMENT_IDS.pro}\`` },
  { id: 'rc_entitlement_professional', store: 'revenuecat', need: `Entitlement id \`${ENTITLEMENT_IDS.professional}\`` },
  { id: 'rc_offering_current', store: 'revenuecat', need: 'Current offering sells Pro (monthly + annual)' },
  { id: 'rc_offering_professional', store: 'revenuecat', need: `Offering id \`${PROFESSIONAL_OFFERING_ID}\` sells Professional` },
  { id: 'ios_same_group', store: 'appstore', need: 'Pro and Professional iOS products share one subscription group' },
  { id: 'android_proration', store: 'play', need: 'Play product change uses time proration (WITH_TIME_PRORATION in the app)' },
  { id: 'age_rating', store: 'both', need: 'Age rating 16+ / Teen — legal subject matter, no user-generated social feed' },
  { id: 'category', store: 'both', need: 'Primary category: Productivity; secondary: Business' },
  { id: 'ai_disclosure', store: 'play', need: 'Mark AI-generated content and keep the in-app report action' },
  { id: 'no_win_percent', store: 'both', need: 'Listing never states a win %, court representation or a recommended lawyer' },
  { id: 'screenshot_order', store: 'both', need: 'Seven screenshots in SCREENSHOT_IDS order: analyze, decision, advisor, cases, guides, lawyer, languages' },
  { id: 'aso_keywords_fill', store: 'appstore', need: 'Apple keywords use most of the 100-character budget, no app name, comma-separated, no spaces around commas' },
  { id: 'promo_fill', store: 'appstore', need: 'Apple promotional text uses most of the 170-character budget and names no recommended lawyer' },
  { id: 'whats_new_fill', store: 'both', need: 'What\'s New names official directories, Professional work aids and that NexuLex recommends no lawyer' },
];

const len = (value) => [...String(value || '')].length;
const lastParagraph = (value) =>
  String(value || '')
    .trim()
    .split(/\n+/)
    .filter(Boolean)
    .slice(-1)[0] || '';

export function assertStoreListing(tables) {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`storeListing: ${msg}`);
  };
  check(STORE_LANGS.length === 13, '13 store languages');
  check(SCREENSHOT_IDS.length === 7, 'seven screenshot captions');
  check(STORE_CHECKLIST.every((item) => item.id && item.store && item.need), 'checklist rows are complete');
  check(STORE_URLS.privacy.includes('privacy.html') && STORE_URLS.terms.includes('terms.html'), 'legal URLs');
  check(ENTITLEMENT_IDS.pro === 'pro' && ENTITLEMENT_IDS.professional === 'professional', 'entitlement ids');
  check(PROFESSIONAL_OFFERING_ID === 'professional', 'professional offering id');
  check(PLAN_LIMITS.free.askDaily === 3 && PLAN_LIMITS.professional.toolsDaily === 30, 'plan limits stay the source of truth');

  const en = tables.en;
  check(en && en.name === STORE_NAME, 'EN name is NexuLex AI');
  check(/General legal information, not legal advice \/ lawyer representation/.test(en.description), 'EN disclaimer phrase');
  check(/generic mode/i.test(en.description) && /Turkish tables/.test(en.description), 'EN jurisdiction disclosure');
  check(lastParagraph(en.description).includes('not legal advice'), 'EN disclaimer is the last paragraph');

  for (const lang of STORE_LANGS) {
    const row = tables[lang];
    check(row && typeof row === 'object', `${lang} listing exists`);
    const missing = STORE_FIELDS.filter((key) => typeof row[key] !== 'string' || !row[key].trim());
    check(!missing.length, `${lang} missing ${missing.join(', ')}`);
    check(row.name === STORE_NAME, `${lang} name must stay NexuLex AI`);
    check(len(row.name) <= STORE_LIMITS.name, `${lang} name length`);
    check(len(row.subtitle) <= STORE_LIMITS.subtitle, `${lang} subtitle > ${STORE_LIMITS.subtitle}`);
    check(len(row.promotionalText) <= STORE_LIMITS.promotionalText, `${lang} promo`);
    check(len(row.shortDescription) <= STORE_LIMITS.shortDescription, `${lang} short`);
    check(len(row.description) <= STORE_LIMITS.description, `${lang} description`);
    check(len(row.keywords) <= STORE_LIMITS.keywords, `${lang} keywords`);
    check(len(row.whatsNew) <= STORE_LIMITS.whatsNew, `${lang} whatsNew`);
    for (const id of SCREENSHOT_IDS) {
      check(len(row[`shot_${id}`]) <= STORE_LIMITS.screenshot, `${lang} shot_${id} too long`);
    }
    check(!/court-ready|\b\d{1,3}\s?%\s*(win|success|chance)|best lawyer|top lawyer|en iyi avukat/i.test(Object.values(row).join('\n')), `${lang} no win% or lawyer ranking`);
    if (lang === 'ar' || lang === 'fa') {
      const blob = Object.values(row).join('\n');
      check(!/→/.test(blob), `${lang} no arrows`);
      check(!/[\u0600-\u06FF][^?]*\?(\s|$)/.test(blob), `${lang} use ؟`);
    }
    if (lang !== 'en') {
      for (const key of STORE_FIELDS) {
        if (key === 'name') continue;
        if (row[key].length >= 12) check(row[key] !== en[key], `${lang}.${key} identical to EN`);
      }
    }
  }
  check(/hukuki danışmanlık değildir|hukuki tavsiye/.test(tables.tr.description), 'TR names that this is not legal advice');
  check(/avukat önermez|hiçbir avukatı önermez/.test(tables.tr.description), 'TR says NexuLex does not recommend a lawyer');
  return { cases, langs: STORE_LANGS.length, shots: SCREENSHOT_IDS.length, checks: STORE_CHECKLIST.length };
}

/** WAVE REL.2 — ASO fill and screenshot caption tightness. Listing still stays out of the app bundle. */
export function assertStoreAso(tables) {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`storeAso: ${msg}`);
  };
  check(STORE_CHECKLIST.some((item) => item.id === 'screenshot_order'), 'checklist covers screenshot order');
  check(STORE_CHECKLIST.some((item) => item.id === 'aso_keywords_fill'), 'checklist covers keyword fill');
  for (const lang of STORE_LANGS) {
    const row = tables[lang];
    const kw = String(row?.keywords || '');
    const kwLen = len(kw);
    check(kwLen >= 70 && kwLen <= STORE_LIMITS.keywords, `${lang} keywords fill ${kwLen}`);
    const parts = kw.split(',').map((part) => part.trim()).filter(Boolean);
    check(parts.length >= 8 && new Set(parts).size === parts.length, `${lang} unique keyword tokens`);
    check(!parts.some((part) => /nexulex/i.test(part)), `${lang} keywords must not include the app name`);
    check(!/\s/.test(kw.replace(/,/g, '')), `${lang} keywords must not contain spaces`);
    for (const id of SCREENSHOT_IDS) {
      const n = len(row[`shot_${id}`]);
      check(n >= 22 && n <= STORE_LIMITS.screenshot, `${lang} shot_${id} length ${n}`);
    }
  }
  return { cases };
}

/** WAVE REL.3 — promotional text and What's New fill. Still not imported by the app. */
export function assertStorePromo(tables) {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`storePromo: ${msg}`);
  };
  check(STORE_CHECKLIST.some((item) => item.id === 'promo_fill'), 'checklist covers promotional text');
  check(STORE_CHECKLIST.some((item) => item.id === 'whats_new_fill'), 'checklist covers What\'s New');
  const en = tables.en;
  for (const lang of STORE_LANGS) {
    const row = tables[lang];
    const promo = String(row?.promotionalText || '');
    const news = String(row?.whatsNew || '');
    const promoLen = len(promo);
    const newsLen = len(news);
    check(promoLen >= 140 && promoLen <= STORE_LIMITS.promotionalText, `${lang} promo fill ${promoLen}`);
    check(newsLen >= 260 && newsLen <= 1200, `${lang} whatsNew fill ${newsLen}`);
    check(/NexuLex/.test(news), `${lang} whatsNew must name NexuLex`);
    check(/NexuLex/.test(promo), `${lang} promo must name NexuLex`);
    check(!/court-ready|\b\d{1,3}\s?%\s*(win|success|chance)|best lawyer|top lawyer|en iyi avukat/i.test(`${promo}\n${news}`), `${lang} no win% or ranking`);
    if (lang === 'ar' || lang === 'fa') {
      check(!/→/.test(`${promo}\n${news}`), `${lang} no arrows`);
      check(!/[\u0600-\u06FF][^?]*\?(\s|$)/.test(`${promo}\n${news}`), `${lang} use ؟`);
    }
    if (lang !== 'en') {
      if (promo.length >= 12) check(promo !== en.promotionalText, `${lang}.promotionalText identical to EN`);
      if (news.length >= 12) check(news !== en.whatsNew, `${lang}.whatsNew identical to EN`);
    }
  }
  check(/hukuki danışmanlık değildir|hukuki tavsiye/.test(tables.tr.whatsNew), 'TR What\'s New is not legal advice');
  check(/avukatı önermez|avukat önermez/.test(tables.tr.whatsNew), 'TR What\'s New says no lawyer is recommended');
  check(/does not recommend|still does not recommend/.test(en.whatsNew), 'EN What\'s New says no lawyer is recommended');
  check(/not legal advice/.test(en.whatsNew), 'EN What\'s New keeps the disclaimer');
  return { cases };
}
