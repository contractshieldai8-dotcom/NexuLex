// WAVE G: pure helpers for anonymous telemetry (no React Native imports, so scripts can test them).
// The EVENTS and PROP_KEYS lists must match supabase/functions/log-event/index.ts.

export const EVENTS = [
  'app_open',
  'analysis_start',
  'analysis_done',
  'analysis_fail',
  'paywall_view',
  'purchase_start',
  'purchase_ok',
  'purchase_cancel',
  'purchase_fail',
  'restore_ok',
  'share_minted',
  'app_error',
  'consent_choice',
];

export const PROP_KEYS = [
  'source',
  'category',
  'country',
  'lang',
  'tier',
  'plan',
  'code',
  'ms',
  'count',
  'ok',
  'screen',
  'msg',
  'hook',
  'signed_in',
];

export const MAX_QUEUE = 100;
export const FLUSH_AT = 10;
export const MAX_BATCH = 25;
const MAX_STRING = 120;

// Regions where analytics tied to a device identifier needs opt-in first (GDPR / UK GDPR / FADP,
// Türkiye KVKK, Brazil LGPD, India DPDP, South Korea PIPA, South Africa POPIA). Unknown region = strict.
const STRICT_REGIONS = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU',
  'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH', 'TR', 'BR', 'IN', 'KR', 'ZA',
]);

export function isStrictRegion(region) {
  const code = String(region || '').toUpperCase();
  return !code || STRICT_REGIONS.has(code);
}

/** Default consent when the user has not chosen yet: on only outside strict regions. */
export function defaultConsent(region) {
  return !isStrictRegion(region);
}

const EVENT_SET = new Set(EVENTS);
const KEY_SET = new Set(PROP_KEYS);

export function cleanString(value, max = MAX_STRING) {
  return String(value == null ? '' : value)
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]')
    .replace(/\d{6,}/g, '#')
    .trim()
    .slice(0, max);
}

/** Keeps only allow-listed keys with scalar values. Never throws. */
export function sanitizeProps(props) {
  const out = {};
  if (!props || typeof props !== 'object' || Array.isArray(props)) return out;
  for (const key of Object.keys(props)) {
    if (!KEY_SET.has(key)) continue;
    const value = props[key];
    if (typeof value === 'boolean') out[key] = value;
    else if (typeof value === 'number' && Number.isFinite(value)) out[key] = Math.round(value);
    else if (typeof value === 'string') out[key] = cleanString(value);
  }
  return out;
}

export function makeEvent(name, props) {
  if (!EVENT_SET.has(name)) return null;
  return { event: name, props: sanitizeProps(props), t: Date.now() };
}

/** Error report with no stack and no free text beyond a short scrubbed message. */
export function errorProps(error, screen) {
  const name = cleanString(error && error.name, 40) || 'Error';
  const message = cleanString(error && error.message, 100);
  return sanitizeProps({
    code: name,
    msg: message,
    screen: screen || '',
  });
}

export function pushBounded(queue, item, max = MAX_QUEUE) {
  const next = queue.concat(item);
  return next.length > max ? next.slice(next.length - max) : next;
}

export function newInstallId(randomBytes) {
  let hex = '';
  for (let i = 0; i < 16; i += 1) {
    hex += (randomBytes ? randomBytes[i] : Math.floor(Math.random() * 256)).toString(16).padStart(2, '0');
  }
  return hex;
}
