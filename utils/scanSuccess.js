// WAVE GR.6 — First-scan success flag lives on this phone only. Purged with the account.

import AsyncStorage from '@react-native-async-storage/async-storage';

export const SCAN_SUCCESS_KEY = '@nexulex/scanSuccessSeen';

export async function isScanSuccessSeen() {
  try {
    return (await AsyncStorage.getItem(SCAN_SUCCESS_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function markScanSuccessSeen() {
  try {
    await AsyncStorage.setItem(SCAN_SUCCESS_KEY, '1');
  } catch {
    /* depolama yoksa sessiz */
  }
}
