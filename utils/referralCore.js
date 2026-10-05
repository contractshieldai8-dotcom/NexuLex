// WAVE J: pure helpers for invite codes (no React Native imports, so scripts can test them).
// The alphabet and length must match supabase/migrations/20261005180000_referrals.sql.

export const CODE_LENGTH = 8;
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no I, L, O, 0, 1
export const REFERRAL_CAP = 5;

const CODE_RE = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

/** Uppercases and drops spaces, dashes and other separators people add when typing or pasting. */
export function normalizeCode(raw) {
  return String(raw == null ? '' : raw)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function isValidCode(raw) {
  return CODE_RE.test(normalizeCode(raw));
}

/** ABCD2345 -> ABCD-2345 (easier to read aloud and to type). */
export function formatCode(raw) {
  const code = normalizeCode(raw);
  return code.length === CODE_LENGTH ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
}

/** Server error text -> i18n key. Unknown errors fall back to the generic message. */
export function referralErrorKey(message) {
  const text = String(message || '');
  if (/INVALID_CODE/.test(text)) return 'refErrInvalid';
  if (/SELF_REFERRAL/.test(text)) return 'refErrSelf';
  if (/ALREADY_REDEEMED/.test(text)) return 'refErrUsed';
  if (/CODE_WINDOW_CLOSED/.test(text)) return 'refErrOld';
  if (/EMAIL_NOT_VERIFIED/.test(text)) return 'refErrVerify';
  if (/SAME_DEVICE|DEVICE_USED/.test(text)) return 'refErrDevice';
  return 'refErrGeneric';
}

/** Adds the invite line under the public invite text (kept separate so the get-page invite stays unchanged). */
export function withInviteCode(message, line) {
  const base = String(message || '').trim();
  const extra = String(line || '').trim();
  return extra ? `${base}\n\n${extra}` : base;
}

/** Reads the object returned by get_my_referral(); anything unexpected becomes null. */
export function parseReferral(data) {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object' || !isValidCode(row.code)) return null;
  return {
    code: normalizeCode(row.code),
    rewards: Math.max(0, Math.min(REFERRAL_CAP, Number(row.rewards) || 0)),
    cap: Number(row.cap) > 0 ? Number(row.cap) : REFERRAL_CAP,
    redeemed: Boolean(row.redeemed),
  };
}
