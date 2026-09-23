import { supabase } from './supabase';
import { SHARE_CODE_RE, normalizeAudience } from '../utils/shareSnapshot';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const makeError = (code, detail) => {
  const error = new Error(code);
  error.code = code;
  if (detail) error.detail = detail;
  return error;
};

async function postMint(body) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw makeError('CONFIG');
  }
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw makeError('AUTH');

  const response = await fetch(`${String(SUPABASE_URL).replace(/\/+$/, '')}/functions/v1/mint-share`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  if (response.status === 402) throw makeError(json.error || 'SHARE_LIMIT');
  if (response.status === 401) throw makeError('AUTH');
  if (!response.ok) throw makeError(json.error || 'SHARE_UNAVAILABLE');
  return json;
}

export async function mintShare({ analysisId, audience, locale }) {
  const audienceCode = normalizeAudience(audience);
  if (!audienceCode) throw makeError('SHARE_AUDIENCE');
  if (!analysisId) throw makeError('SHARE_UNAVAILABLE');
  return postMint({ analysisId, audience: audienceCode, locale: String(locale || 'en').slice(0, 2) });
}

export async function fetchShareSnapshot(code) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw makeError('CONFIG');
  const trimmed = String(code || '').trim().toUpperCase();
  if (!SHARE_CODE_RE.test(trimmed)) throw makeError('SHARE_UNAVAILABLE');

  const response = await fetch(
    `${String(SUPABASE_URL).replace(/\/+$/, '')}/functions/v1/open-share?code=${encodeURIComponent(trimmed)}`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Accept: 'application/json',
      },
    }
  );
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json?.snapshot) throw makeError(json.error || 'SHARE_UNAVAILABLE');
  if (json.contract_text || json.snapshot?.contract_text) throw makeError('SHARE_LEAK');
  return json.snapshot;
}

export async function revokeShare(code) {
  const trimmed = String(code || '').trim().toUpperCase();
  if (!SHARE_CODE_RE.test(trimmed)) throw makeError('SHARE_UNAVAILABLE');
  const { error } = await supabase
    .from('analysis_shares')
    .update({ revoked_at: new Date().toISOString() })
    .eq('code', trimmed)
    .is('revoked_at', null);
  if (error) throw makeError('SHARE_UNAVAILABLE', error.message);
}
