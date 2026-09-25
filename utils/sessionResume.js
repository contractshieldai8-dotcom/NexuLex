// WAVE GR.2 — Unfinished analyze draft lives on this phone only. Purged with the account.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { isUsableDraft, parseDraft, serializeDraft } from '../constants/sessionResume';

export const RESUME_DRAFT_KEY = '@nexulex/resumeDraft';

export async function loadResumeDraft() {
  try {
    return parseDraft(await AsyncStorage.getItem(RESUME_DRAFT_KEY));
  } catch {
    return null;
  }
}

export async function saveResumeDraft({ text = '', fileName = '' } = {}) {
  const next = serializeDraft({ text, fileName });
  try {
    if (next) await AsyncStorage.setItem(RESUME_DRAFT_KEY, JSON.stringify(next));
    else await AsyncStorage.removeItem(RESUME_DRAFT_KEY);
  } catch {
    /* depolama yoksa sessiz */
  }
  return next;
}

export async function clearResumeDraft() {
  try {
    await AsyncStorage.removeItem(RESUME_DRAFT_KEY);
  } catch {
    /* already gone */
  }
}

export { isUsableDraft };
