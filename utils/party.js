// Analizde korunacak taraf. Tercih cihazda saklanır (granüler rol kodu: tenant, landlord, …).

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PARTY_SIDES,
  PARTY_ROLES,
  toPartySide,
  isKnownPartyCode,
} from '../constants/options';

const STORAGE_KEY = '@nexulex/partyRole';

export const PARTY_SIDE_CODES = (PARTY_SIDES || []).map((item) => item.code);
export { PARTY_ROLES, toPartySide };

export const getPartyRole = (code) =>
  PARTY_SIDES.find((item) => item.code === toPartySide(code)) || PARTY_SIDES[0];

export const getPartyRoleFull = (code) =>
  (PARTY_ROLES || []).find((item) => item.code === code) ||
  (PARTY_ROLES || []).find((item) => item.code === toPartySide(code)) ||
  PARTY_ROLES[0];

/** @returns {Promise<string|null>} Stored granular/known code, or null on fresh install. */
export async function loadStoredParty() {
  try {
    const stored = String((await AsyncStorage.getItem(STORAGE_KEY)) || '').trim();
    if (stored && isKnownPartyCode(stored)) return stored;
  } catch (error) {
    console.warn('Kayıtlı taraf rolü okunamadı:', error.message);
  }
  return null;
}

export async function savePartyRole(code) {
  const raw = String(code || '').trim();
  const value = isKnownPartyCode(raw) ? raw : 'buyer';
  try {
    await AsyncStorage.setItem(STORAGE_KEY, value);
  } catch (error) {
    console.warn('Taraf rolü kaydedilemedi:', error.message);
  }
}
