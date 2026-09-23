import { supabase } from './supabase';
import { SHARE_CODE_RE } from '../utils/shareSnapshot';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const makeError = (code, detail) => {
  const error = new Error(code);
  error.code = code;
  if (detail) error.detail = detail;
  return error;
};

async function postSeat(body) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw makeError('CONFIG');
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw makeError('AUTH');

  const response = await fetch(`${String(SUPABASE_URL).replace(/\/+$/, '')}/functions/v1/advisor-seat`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  if (response.status === 402) throw makeError(json.error || 'SEAT_LIMIT');
  if (response.status === 401) throw makeError('AUTH');
  if (!response.ok) throw makeError(json.error || 'SEAT_UNAVAILABLE');
  return json;
}

export async function listAdvisorSeats() {
  return postSeat({ action: 'list' });
}

export async function mintAdvisorSeat(role = 'advisor') {
  const seatRole = String(role || 'advisor').toLowerCase().trim();
  if (seatRole !== 'advisor' && seatRole !== 'household') throw makeError('SEAT_INVALID');
  return postSeat({ action: 'mint', role: seatRole });
}

export async function redeemAdvisorSeat(code) {
  const trimmed = String(code || '').trim().toUpperCase();
  if (!SHARE_CODE_RE.test(trimmed)) throw makeError('SEAT_INVALID');
  return postSeat({ action: 'redeem', code: trimmed });
}

export async function revokeAdvisorSeat(code) {
  const trimmed = String(code || '').trim().toUpperCase();
  if (!SHARE_CODE_RE.test(trimmed)) throw makeError('SEAT_INVALID');
  return postSeat({ action: 'revoke', code: trimmed });
}

export async function pushAdvisorBrief({ analysisId, memberId, locale }) {
  if (!analysisId || !memberId) throw makeError('SEAT_UNAVAILABLE');
  return postSeat({
    action: 'push',
    analysisId,
    memberId,
    locale: String(locale || 'en').slice(0, 2),
  });
}
