/** Typing masks for date fields (no date-picker dependency). Separators only appear before further digits. */

const digitsOf = (value, max) => String(value || '').replace(/\D/g, '').slice(0, max);

/** 20250131 → 2025-01-31 */
export function maskIsoDateInput(value) {
  const d = digitsOf(value, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
}

/** 31012025 → 31.01.2025. Free text (letters, e.g. "1 Ağustos 2026") is left untouched. */
export function maskDmyDateInput(value) {
  const raw = String(value || '');
  if (/[^\d.\-/\s]/.test(raw)) return raw;
  const d = digitsOf(raw, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}.${d.slice(2)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4)}`;
}

/** Empty or free text counts as valid; only a complete-looking numeric date is checked. */
export function isPlausibleDmyDate(value) {
  const raw = String(value || '').trim();
  if (!raw || /[^\d.\-/\s]/.test(raw)) return true;
  const m = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return false;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const dt = new Date(Date.UTC(year, month - 1, day));
  return dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day;
}
