// Android / iOS entry for i18n (Metro prefers *.native.js over i18n.js on device).
//
// i18n.js merges ~80 translation waves x 13 languages at startup (about 2 MB of strings, ~180 ms of
// JS on a fast machine). Here only the default language and the English fallback are evaluated at
// launch; every other language is a pre-merged bundle (locales/bundles/<lng>.json, generated from
// i18n.js by scripts/build-locale-bundles.js) that is required synchronously the first time it is
// selected, so a language switch never shows untranslated keys.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const DEFAULT_LANGUAGE = 'tr';
const FALLBACK_LANGUAGE = 'en';

// Static require() literals are mandatory for Metro; the functions keep each module unevaluated.
const LOADERS = {
  tr: () => require('./locales/bundles/tr.json'),
  en: () => require('./locales/bundles/en.json'),
  de: () => require('./locales/bundles/de.json'),
  fr: () => require('./locales/bundles/fr.json'),
  es: () => require('./locales/bundles/es.json'),
  ar: () => require('./locales/bundles/ar.json'),
  it: () => require('./locales/bundles/it.json'),
  zh: () => require('./locales/bundles/zh.json'),
  ru: () => require('./locales/bundles/ru.json'),
  fa: () => require('./locales/bundles/fa.json'),
  ja: () => require('./locales/bundles/ja.json'),
  pt: () => require('./locales/bundles/pt.json'),
  nl: () => require('./locales/bundles/nl.json'),
};

const baseCode = (lng) => String(lng || '').split('-')[0].toLowerCase();

export function ensureLanguage(lng) {
  const code = baseCode(lng);
  const load = LOADERS[code];
  if (!load || i18n.hasResourceBundle(code, 'translation')) return code;
  i18n.addResourceBundle(code, 'translation', load(), true, true);
  return code;
}

i18n.use(initReactI18next).init({
  resources: {
    [DEFAULT_LANGUAGE]: { translation: LOADERS[DEFAULT_LANGUAGE]() },
    [FALLBACK_LANGUAGE]: { translation: LOADERS[FALLBACK_LANGUAGE]() },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: FALLBACK_LANGUAGE,
  interpolation: { escapeValue: false },
});

// Any path that targets another language (changeLanguage, getFixedT) loads its bundle first.
const changeLanguage = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = (lng, ...rest) => {
  if (lng) ensureLanguage(lng);
  return changeLanguage(lng, ...rest);
};
const getFixedT = i18n.getFixedT.bind(i18n);
i18n.getFixedT = (lng, ...rest) => {
  if (typeof lng === 'string') ensureLanguage(lng);
  return getFixedT(lng, ...rest);
};

export default i18n;
