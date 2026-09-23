// ar / fa için RTL; diğer dillerde LTR’ye zorla. Yön değişince yeniden açma uyarısı.

import { Alert, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

const RTL_LANGS = new Set(['ar', 'fa']);
const WANTED_KEY = '@nexulex/rtlWanted';

export function isRtlLanguage(code) {
  return RTL_LANGS.has(String(code || '').split(/[-_]/)[0].toLowerCase());
}

function tryReload() {
  try {
    const Updates = require('expo-updates');
    if (typeof Updates.reloadAsync === 'function') {
      Updates.reloadAsync().catch(() => {});
      return true;
    }
  } catch {
    /* Expo Go / web’de reload yoksa uyarı yeter */
  }
  return false;
}

export async function applyRtlForLanguage(code) {
  const wantRtl = isRtlLanguage(code);
  const current = Boolean(I18nManager.isRTL);

  try {
    I18nManager.allowRTL(wantRtl);
    I18nManager.forceRTL(wantRtl);
  } catch (error) {
    console.warn('RTL yönü ayarlanamadı:', error?.message);
    return false;
  }

  let previous = null;
  try {
    previous = await AsyncStorage.getItem(WANTED_KEY);
    await AsyncStorage.setItem(WANTED_KEY, wantRtl ? '1' : '0');
  } catch {
    /* bayrak yazılamazsa yine de yönü dene */
  }

  const intentChanged = previous !== null && previous !== (wantRtl ? '1' : '0');
  const firstRtl = previous === null && wantRtl && !current;
  if (!intentChanged && !firstRtl) return false;
  if (wantRtl === current && !intentChanged) return false;

  Alert.alert(i18n.t('warningTitle'), i18n.t('rtlRestartHint'), [
    { text: i18n.t('localeContinue'), style: 'cancel' },
    {
      text: i18n.t('toastOk'),
      onPress: () => {
        tryReload();
      },
    },
  ]);
  return true;
}
