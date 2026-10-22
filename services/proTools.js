// WAVE LR.5 — Client for the pro-tools edge function (Professional plan, server prompts, server daily quota).
// Results live only in the sheet or, when the user saves them, in the on-device case file.

import { supabase } from './supabase';
import { AI_ERROR_CODES } from './ai';
import { ensureAiConsent } from './aiConsent';
import { isUsableToolResult, normalizeToolResult } from '../utils/plan';

const FUNCTION_NAME = 'pro-tools';
const TIMEOUT_MS = 120000;

export const PRO_TOOL_ERROR_CODES = {
  PLAN: 'PRO_TOOL_PLAN',
  QUOTA: 'PRO_TOOL_QUOTA',
  UNAVAILABLE: 'PRO_TOOL_UNAVAILABLE',
  INVALID: 'PRO_TOOL_INVALID',
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
  if (response.status === 404) throw fail(PRO_TOOL_ERROR_CODES.UNAVAILABLE);
  if (code === 'PLAN_REQUIRED' || response.status === 402) throw fail(PRO_TOOL_ERROR_CODES.PLAN);
  if (response.status === 401 || response.status === 403) throw fail(AI_ERROR_CODES.AUTH);
  if (code === 'QUOTA_EXCEEDED') throw fail(PRO_TOOL_ERROR_CODES.QUOTA, { quota });
  if (code === 'INVALID') throw fail(PRO_TOOL_ERROR_CODES.INVALID, { quota });
  if (code === 'CONFIG' || code === 'UNAVAILABLE' || response.status === 503) throw fail(PRO_TOOL_ERROR_CODES.UNAVAILABLE, { quota });
  if (code === 'PARSE') throw fail(AI_ERROR_CODES.PARSE, { quota });
  if (response.status === 429) throw fail(AI_ERROR_CODES.RATE_LIMIT, { quota });
  throw fail(AI_ERROR_CODES.SERVICE, { quota });
}

export async function fetchProToolQuota() {
  try {
    const payload = await invoke({ action: 'quota' });
    return payload?.quota || null;
  } catch {
    return null;
  }
}

export async function runProTool({ tool, material, position = '', area = 'other', country = 'auto', lang = 'en' }) {
  await ensureAiConsent();
  const payload = await invoke({ tool, material, position, area, country, lang });
  const result = normalizeToolResult(tool, payload?.result, { country });
  if (!isUsableToolResult(result)) throw fail(AI_ERROR_CODES.PARSE, { quota: payload?.quota || null });
  return { result, quota: payload?.quota || null };
}
