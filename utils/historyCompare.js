/**
 * WAVE UX.26 — Pair two loaded history rows for the existing DiffTool.
 * Stays on-device. Never writes contract text into the UX.23 register.
 */

export function historySourceText(item) {
  return String(item?.contract_text || item?.contractText || '').trim();
}

export function toggleHistoryComparePick(picked, id) {
  const key = String(id || '');
  if (!key) return Array.isArray(picked) ? picked.filter(Boolean) : [];
  const list = (Array.isArray(picked) ? picked : []).map((value) => String(value || '')).filter(Boolean);
  if (list.includes(key)) return list.filter((value) => value !== key);
  if (list.length >= 2) return [list[1], key];
  return [...list, key];
}

export function orderHistoryComparePair(left, right) {
  const ta = Date.parse(left?.created_at || left?.createdAt || 0) || 0;
  const tb = Date.parse(right?.created_at || right?.createdAt || 0) || 0;
  return ta <= tb ? [left, right] : [right, left];
}

export function canCompareHistoryPair(left, right) {
  return Boolean(
    left &&
      right &&
      String(left.id) !== String(right.id) &&
      historySourceText(left) &&
      historySourceText(right)
  );
}

export function buildHistoryCompareSeed(left, right) {
  const [older, newer] = orderHistoryComparePair(left, right);
  return {
    original: historySourceText(older),
    revised: historySourceText(newer),
    mode: 'history',
    nonce: Date.now(),
  };
}
