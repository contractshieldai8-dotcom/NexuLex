// WAVE GR.3 — Share-loop flag lives on this phone only. Purged with the account.

import AsyncStorage from '@react-native-async-storage/async-storage';

export const SHARE_LOOP_KEY = '@nexulex/shareLoopSeen';

export async function isShareLoopSeen() {
  try {
    return (await AsyncStorage.getItem(SHARE_LOOP_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function markShareLoopSeen() {
  try {
    await AsyncStorage.setItem(SHARE_LOOP_KEY, '1');
  } catch {
    /* depolama yoksa sessiz */
  }
}
