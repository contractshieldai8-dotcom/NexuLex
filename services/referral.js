// WAVE J: invite codes (give 1 free analysis, get 1). The server decides everything; the app only
// shows the result. Every function is fail-safe: it returns null or a typed error, never crashes the UI.
import { supabase } from './supabase';
import { isValidCode, normalizeCode, parseReferral, referralErrorKey } from '../utils/referralCore';

/** { code, rewards, cap, redeemed } or null (signed out, or the migration is not applied yet). */
export async function fetchMyReferral() {
  try {
    const { data, error } = await supabase.rpc('get_my_referral');
    if (error) return null;
    return parseReferral(data);
  } catch {
    return null;
  }
}

/** Resolves { ok: true, left } or { ok: false, key } where key is an i18n key explaining the problem. */
export async function redeemReferral(rawCode) {
  if (!isValidCode(rawCode)) return { ok: false, key: 'refErrInvalid' };
  try {
    const { data, error } = await supabase.rpc('redeem_referral', { p_code: normalizeCode(rawCode) });
    if (error) return { ok: false, key: referralErrorKey(error.message) };
    const left = Number(data?.left);
    return { ok: true, left: Number.isFinite(left) ? left : null };
  } catch (error) {
    return { ok: false, key: referralErrorKey(error?.message) };
  }
}
