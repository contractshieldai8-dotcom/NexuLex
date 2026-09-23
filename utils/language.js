// Seçilen uygulama dilini cihazda kalıcı tutar.
// Kayıt varsa ona uyulur; yoksa cihaz dili; o da yoksa tr.

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import { SUPPORTED_LANGUAGE_CODES } from '../constants/options';
import { deviceLang } from './locale';
import { applyRtlForLanguage } from './rtl';

const STORAGE_KEY = '@nexulex/language';

async function applyLanguage(code) {
  if (i18n.language !== code) await i18n.changeLanguage(code);
  await applyRtlForLanguage(code);
  return code;
}

export async function loadStoredLanguage() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGE_CODES.includes(stored)) {
      return applyLanguage(stored);
    }
  } catch (error) {
    console.warn('Kayıtlı dil okunamadı:', error.message);
  }

  const detected = deviceLang();
  if (detected) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, detected);
    } catch (error) {
      console.warn('Algılanan dil kaydedilemedi:', error.message);
    }
    return applyLanguage(detected);
  }

  const fallback = String(i18n.language || 'tr').split('-')[0];
  const safe = SUPPORTED_LANGUAGE_CODES.includes(fallback) ? fallback : 'tr';
  return applyLanguage(safe);
}

export async function setAppLanguage(code) {
  if (!SUPPORTED_LANGUAGE_CODES.includes(code)) return;

  await applyLanguage(code);

  try {
    await AsyncStorage.setItem(STORAGE_KEY, code);
  } catch (error) {
    console.warn('Dil tercihi kaydedilemedi:', error.message);
  }
}
