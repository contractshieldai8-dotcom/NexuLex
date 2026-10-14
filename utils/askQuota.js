// WAVE ECON.1 — Turns the quota object the server returns (legal-ask, pro-tools) into the line a sheet shows.
// The server counts and decides; this only chooses the words. Pure (harness-tested).
//
// quota = { used, limit, remaining, period: 'day' | 'month' | 'lifetime' | 'week', free?: { nextDay } }
// A quota from an older server has no period and means "day".

const ASK_KEYS = {
  day: 'askQuotaLeft',
  month: 'econ1AskMonth',
  lifetime: 'econ1AskLifetime',
  week: 'econ1AskWeek',
};
const TOOL_KEYS = {
  day: 'ptQuotaLeft',
  month: 'econ1ToolsMonth',
};
const ASK_LIMIT_KEYS = {
  day: 'askProLimit',
  month: 'econ1AskMonthLimit',
};
const TOOL_LIMIT_KEYS = {
  day: 'ptQuotaDone',
  month: 'econ1ToolsMonthLimit',
};

const num = (value) => (Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0);

export function quotaPeriod(quota, feature = 'ask') {
  const raw = String(quota?.period || 'day');
  const table = feature === 'tools' ? TOOL_KEYS : ASK_KEYS;
  return table[raw] ? raw : 'day';
}

// -> { key, count, total, period } for t(key, { count, total }); null without a quota.
export function describeQuota(quota, feature = 'ask') {
  if (!quota || typeof quota !== 'object') return null;
  const period = quotaPeriod(quota, feature);
  const table = feature === 'tools' ? TOOL_KEYS : ASK_KEYS;
  return { key: table[period], count: num(quota.remaining), total: num(quota.limit), period };
}

// The toast for a paid user who ran out. Free users are sent to the paywall instead, so they get null.
export function limitMessageKey(quota, feature = 'ask') {
  const period = quotaPeriod(quota, feature);
  const table = feature === 'tools' ? TOOL_LIMIT_KEYS : ASK_LIMIT_KEYS;
  return table[period] || table.day;
}

// Free plan, starter questions used: the day the next free question opens (YYYY-MM-DD, UTC) or ''.
export function nextFreeDay(quota) {
  const day = String(quota?.free?.nextDay || '');
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(Date.parse(`${day}T00:00:00Z`)) ? day : '';
}

export function formatQuotaDay(day, locale = 'en') {
  const value = String(day || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  try {
    return new Date(`${value}T00:00:00Z`).toLocaleDateString(locale, { timeZone: 'UTC', day: 'numeric', month: 'long' });
  } catch {
    return value;
  }
}

export function assertAskQuotaFixtures() {
  const fail = [];
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  if (describeQuota(null) !== null || describeQuota('x') !== null) fail.push('no quota, no line');
  if (!same(describeQuota({ used: 1, limit: 40, remaining: 39 }), { key: 'askQuotaLeft', count: 39, total: 40, period: 'day' })) fail.push('old server shape means day');
  if (!same(describeQuota({ remaining: 2, limit: 3, period: 'lifetime' }), { key: 'econ1AskLifetime', count: 2, total: 3, period: 'lifetime' })) fail.push('lifetime');
  if (!same(describeQuota({ remaining: 0, limit: 1, period: 'week' }), { key: 'econ1AskWeek', count: 0, total: 1, period: 'week' })) fail.push('week');
  if (!same(describeQuota({ remaining: 12, limit: 300, period: 'month' }), { key: 'econ1AskMonth', count: 12, total: 300, period: 'month' })) fail.push('month');
  if (describeQuota({ remaining: 5, limit: 30, period: 'month' }, 'tools').key !== 'econ1ToolsMonth' || describeQuota({ remaining: 5, limit: 30 }, 'tools').key !== 'ptQuotaLeft') fail.push('tools keys');
  if (describeQuota({ remaining: 5, limit: 30, period: 'lifetime' }, 'tools').period !== 'day') fail.push('tools have no lifetime');
  if (describeQuota({ remaining: 5, limit: 30, period: 'nonsense' }).period !== 'day') fail.push('unknown period means day');
  if (describeQuota({ remaining: -4, limit: 'x' }).count !== 0 || describeQuota({ remaining: -4, limit: 'x' }).total !== 0 || describeQuota({ remaining: 2.9, limit: 3 }).count !== 2) fail.push('numbers are clamped');
  if (limitMessageKey({ period: 'month' }) !== 'econ1AskMonthLimit' || limitMessageKey({ period: 'day' }) !== 'askProLimit' || limitMessageKey(null) !== 'askProLimit') fail.push('ask limit key');
  if (limitMessageKey({ period: 'month' }, 'tools') !== 'econ1ToolsMonthLimit' || limitMessageKey({}, 'tools') !== 'ptQuotaDone') fail.push('tools limit key');
  if (nextFreeDay({ free: { nextDay: '2026-10-21' } }) !== '2026-10-21' || nextFreeDay({ free: { nextDay: '2026-13-40' } }) !== '' || nextFreeDay({ free: { nextDay: null } }) !== '' || nextFreeDay(null) !== '') fail.push('next free day');
  if (formatQuotaDay('nonsense') !== '' || !/21/.test(formatQuotaDay('2026-10-21', 'en'))) fail.push('day label');
  return { cases: 14, fail };
}
