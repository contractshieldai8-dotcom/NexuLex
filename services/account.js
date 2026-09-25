// NexuLex AI — in-app account deletion + local purge (App Store 5.1.1(v) / Google Play).
// The server derives the user from the session JWT; the client never sends a user id.

import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from './supabase';
import { cancelAllNexuLexNotifications } from './notifications';
import { clearAnalysisCache } from './analysisCache';
import { logOutPurchases } from './purchases';
import { cleanStaleExportCache } from '../utils/fileAccess';
import { purgeEvidenceFiles } from './caseFileStore';

export const SUBSCRIPTION_MANAGE_URLS = {
  ios: 'https://apps.apple.com/account/subscriptions',
  android: 'https://play.google.com/store/account/subscriptions',
};

export const subscriptionManageUrl = (os = Platform.OS) => SUBSCRIPTION_MANAGE_URLS[os] || null;

export async function openSubscriptionManagement(os = Platform.OS) {
  const url = subscriptionManageUrl(os);
  if (!url) return false;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

const APP_KEY_RE = /^(@nexulex\/|nexulex\.)/;
// Device display preferences only (UI language / RTL layout), not account data.
const DEVICE_PREF_KEYS = new Set(['@nexulex/language', '@nexulex/rtlWanted']);

export async function clearAppStorageKeys() {
  try {
    const keys = (await AsyncStorage.getAllKeys()) || [];
    const ours = keys.filter((key) => APP_KEY_RE.test(String(key)) && !DEVICE_PREF_KEYS.has(key));
    if (ours.length) await AsyncStorage.multiRemove(ours);
    return ours.length;
  } catch {
    return 0;
  }
}

export async function purgeLocalAppData() {
  const [notifications, , storage, exports] = await Promise.allSettled([
    cancelAllNexuLexNotifications(),
    clearAnalysisCache(),
    clearAppStorageKeys(),
    cleanStaleExportCache(0),
    logOutPurchases(),
    purgeEvidenceFiles(),
  ]);
  return {
    notifications: notifications.status === 'fulfilled' ? notifications.value : 0,
    storageKeys: storage.status === 'fulfilled' ? storage.value : 0,
    exports: exports.status === 'fulfilled' ? exports.value?.deleted || 0 : 0,
  };
}

export async function requestAccountDeletion() {
  const { data, error } = await supabase.functions.invoke('delete-account', { body: {} });
  if (error || !data?.ok) {
    const failure = new Error('ACCOUNT_DELETE_FAILED');
    failure.code = 'ACCOUNT_DELETE_FAILED';
    failure.cause = error || null;
    throw failure;
  }
  return true;
}

/** Server delete → local purge → local sign-out (the session is already invalid server-side). */
export async function deleteAccountAndPurge() {
  await requestAccountDeletion();
  const purged = await purgeLocalAppData();
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    /* session storage is cleared by the auth listener either way */
  }
  return purged;
}
