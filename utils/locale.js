// Cihaz dili ve hukuk koridoru. Dil kaydı utils/language.js’te kalır;
// ülke tercihi burada @nexulex/jurisdiction altında saklanır.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { JURISDICTIONS, SUPPORTED_LANGUAGE_CODES } from '../constants/options';
import { suggestJurisdictionFor } from './jurisdictionSuggest';

const JURISDICTION_KEY = '@nexulex/jurisdiction';
const ONBOARDED_KEY = '@nexulex/localeOnboarded';
const INTENT_KEY = '@nexulex/intentOnboarded';

const VALID_JURISDICTIONS = new Set((JURISDICTIONS || []).map((item) => item.code));

export function getDeviceLocales() {
  try {
    const locales = getLocales();
    return Array.isArray(locales) ? locales : [];
  } catch {
    return [];
  }
}

export function deviceLang() {
  for (const locale of getDeviceLocales()) {
    const code = String(locale?.languageCode || '')
      .split(/[-_]/)[0]
      .toLowerCase();
    if (SUPPORTED_LANGUAGE_CODES.includes(code)) return code;
  }
  return null;
}

export function deviceRegion() {
  const locale = getDeviceLocales()[0] || {};
  return String(locale.regionCode || locale.languageRegionCode || '')
    .split(/[-_]/)[0]
    .toUpperCase();
}

export function suggestJurisdiction(lang, region) {
  return suggestJurisdictionFor(lang, region || deviceRegion());
}

export async function loadStoredJurisdiction() {
  try {
    const stored = await AsyncStorage.getItem(JURISDICTION_KEY);
    if (stored && VALID_JURISDICTIONS.has(stored)) return stored;
  } catch (error) {
    console.warn('Kayıtlı hukuk koridoru okunamadı:', error.message);
  }
  return null;
}

export async function persistJurisdiction(code) {
  const next = VALID_JURISDICTIONS.has(code) ? code : 'auto';
  try {
    await AsyncStorage.setItem(JURISDICTION_KEY, next);
  } catch (error) {
    console.warn('Hukuk koridoru kaydedilemedi:', error.message);
  }
  return next;
}

export async function isLocaleOnboarded() {
  try {
    return (await AsyncStorage.getItem(ONBOARDED_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function markLocaleOnboarded() {
  try {
    await AsyncStorage.setItem(ONBOARDED_KEY, '1');
  } catch (error) {
    console.warn('Locale onboarding bayrağı yazılamadı:', error.message);
  }
}

export async function isIntentOnboarded() {
  try {
    return (await AsyncStorage.getItem(INTENT_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function markIntentOnboarded() {
  try {
    await AsyncStorage.setItem(INTENT_KEY, '1');
  } catch (error) {
    console.warn('Intent onboarding bayrağı yazılamadı:', error.message);
  }
}
