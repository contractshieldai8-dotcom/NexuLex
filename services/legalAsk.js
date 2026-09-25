// WAVE LR.3 — Client for the legal-ask edge function (server prompt + server daily quota).
// Answers are saved on this device only; the server stores only a daily usage counter.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from './supabase';
import { AI_ERROR_CODES } from './ai';
import { MAX_SAVED_ANSWERS, isUsableAnswer, normalizeLegalAnswer } from '../utils/legalAnswer';

const SAVED_KEY = '@nexulex/legalAnswers';
const FUNCTION_NAME = 'legal-ask';
const TIMEOUT_MS = 90000;

export const ASK_ERROR_CODES = {
  QUOTA: 'ASK_QUOTA',
  UNAVAILABLE: 'ASK_UNAVAILABLE',
  INVALID: 'ASK_INVALID',
};

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const fail = (code, extra = {}) => Object.assign(new Error(code), { code, ...extra });

async function invoke(body) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw fail(AI_ERROR_CODES.CONFIG);
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw fail(AI_ERROR_CODES.AUTH);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${SUPABASE_URL.replace(/\/+$/, '')}/functions/v1/${FUNCTION_NAME}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch (error) {
    const aborted = /abort/i.test(String(error?.name || error?.message || ''));
    throw fail(aborted ? AI_ERROR_CODES.TIMEOUT : AI_ERROR_CODES.NETWORK);
  } finally {
    clearTimeout(timer);
  }
  const payload = await response.json().catch(() => null);
  if (response.ok) return payload || {};

  const quota = payload?.quota || null;
  const code = String(payload?.error || '');
  if (response.status === 404) throw fail(ASK_ERROR_CODES.UNAVAILABLE);
  if (response.status === 401 || response.status === 403) throw fail(AI_ERROR_CODES.AUTH);
  if (code === 'QUOTA_EXCEEDED') throw fail(ASK_ERROR_CODES.QUOTA, { quota });
  if (code === 'INVALID') throw fail(ASK_ERROR_CODES.INVALID, { quota });
  if (code === 'CONFIG' || code === 'UNAVAILABLE' || response.status === 503) throw fail(ASK_ERROR_CODES.UNAVAILABLE, { quota });
  if (code === 'PARSE') throw fail(AI_ERROR_CODES.PARSE, { quota });
  if (response.status === 429) throw fail(AI_ERROR_CODES.RATE_LIMIT, { quota });
  throw fail(AI_ERROR_CODES.SERVICE, { quota });
}

export async function fetchLegalAskQuota() {
  try {
    const payload = await invoke({ action: 'quota' });
    return payload?.quota || null;
  } catch {
    return null;
  }
}

export async function askLegalQuestion({ question, facts = '', area = 'other', audience = 'person', country = 'auto', lang = 'en', caseContext = '' }) {
  const payload = await invoke({ question, facts, area, audience, country, lang, caseContext });
  const answer = normalizeLegalAnswer(payload?.answer, { country });
  if (!isUsableAnswer(answer)) throw fail(AI_ERROR_CODES.PARSE, { quota: payload?.quota || null });
  return { answer, quota: payload?.quota || null };
}

export async function loadSavedAnswers() {
  try {
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((entry) => entry?.id && entry?.answer?.shortAnswer) : [];
  } catch {
    return [];
  }
}

export async function saveAnswer({ question, facts, area, audience, answer }) {
  const entry = {
    id: `q${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    question,
    facts,
    area,
    audience,
    answer,
  };
  const next = [entry, ...(await loadSavedAnswers())].slice(0, MAX_SAVED_ANSWERS);
  try {
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
  } catch {
    /* keep UI state */
  }
  return { entry, saved: next };
}
