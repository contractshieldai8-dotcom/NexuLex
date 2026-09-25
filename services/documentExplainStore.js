// WAVE LR.1 — Document explanations are stored on this device only (purged with the account).

import AsyncStorage from '@react-native-async-storage/async-storage';

import { scheduleTrapReminders } from './notifications';
import {
  MAX_SAVED_EXPLAINS,
  freeExplainsLeft,
  nextUsage,
  reminderDates,
} from '../utils/documentExplain';

const SAVED_KEY = '@nexulex/docExplains';
const USAGE_KEY = '@nexulex/docExplainUsage';

const readJson = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export async function loadSavedExplains() {
  const saved = await readJson(SAVED_KEY, []);
  return Array.isArray(saved) ? saved.filter((entry) => entry?.id && entry?.explanation) : [];
}

export async function saveExplain(explanation) {
  const entry = {
    id: `doc${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    explanation,
  };
  const next = [entry, ...(await loadSavedExplains())].slice(0, MAX_SAVED_EXPLAINS);
  try {
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
  } catch (error) {
    console.log('Belge açıklaması kaydedilemedi:', error?.message);
  }
  return { entry, saved: next };
}

export async function removeExplain(id) {
  const next = (await loadSavedExplains()).filter((entry) => entry.id !== id);
  try {
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
  } catch {
    /* keep UI state */
  }
  return next;
}

export async function loadFreeExplainsLeft() {
  return freeExplainsLeft(await readJson(USAGE_KEY, null));
}

export async function recordExplainUse() {
  const next = nextUsage(await readJson(USAGE_KEY, null));
  try {
    await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(next));
  } catch {
    /* counter is best effort */
  }
  return freeExplainsLeft(next);
}

export async function scheduleDeadlineReminders({ entryId, index, deadline, title }) {
  const dates = reminderDates(deadline?.date).map((date) => ({
    date,
    label: `${deadline.label} · ${deadline.date}`,
    kind: 'DEADLINE',
  }));
  if (!dates.length) return { scheduled: 0, denied: false, unavailable: false };
  return scheduleTrapReminders({
    analysisId: `doc-${entryId}-${index}`,
    dates,
    title,
    prompt: true,
  });
}
