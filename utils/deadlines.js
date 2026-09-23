// Sözleşmeden çıkan kritik tarihleri yerelde tutar ve yaklaşanları sıralar.
// Push bildirimi yoktur; uygulama içi radar iskeletidir.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nexulex/deadlines';
const MAX_ITEMS = 40;
const UPCOMING_WINDOW_DAYS = 90;

const DATE_KINDS = new Set([
  'RENEWAL',
  'TERMINATION_WINDOW',
  'DEADLINE',
  'START',
  'END',
  'PRICE_INCREASE',
  'TRIAL_END',
  'OBLIGATION',
  'CONFIDENTIALITY',
  'RETURN',
]);

const EVENT_KIND_MAP = {
  renewal_notice: 'RENEWAL',
  price_increase: 'PRICE_INCREASE',
  trial_end: 'TRIAL_END',
  termination_window: 'TERMINATION_WINDOW',
  confidentiality: 'CONFIDENTIALITY',
  return_or_refund: 'RETURN',
};

export const normalizeDateKind = (kind) => {
  const value = String(kind || '').toUpperCase().replace(/[\s-]+/g, '_');
  if (EVENT_KIND_MAP[String(kind || '').toLowerCase()]) {
    return EVENT_KIND_MAP[String(kind).toLowerCase()];
  }
  return DATE_KINDS.has(value) ? value : 'DEADLINE';
};

export const kindLabelKey = (kind) => {
  switch (normalizeDateKind(kind)) {
    case 'RENEWAL':
      return 'deadlineRenewal';
    case 'TERMINATION_WINDOW':
      return 'deadlineWindow';
    case 'START':
      return 'deadlineStart';
    case 'END':
      return 'deadlineEnd';
    case 'PRICE_INCREASE':
      return 'eventPriceIncrease';
    case 'TRIAL_END':
      return 'eventTrialEnd';
    case 'OBLIGATION':
      return 'eventObligation';
    case 'CONFIDENTIALITY':
      return 'eventConfidentiality';
    case 'RETURN':
      return 'eventReturn';
    default:
      return 'deadlineDeadline';
  }
};

export const kindIcon = (kind) => {
  switch (normalizeDateKind(kind)) {
    case 'RENEWAL':
      return 'refresh-outline';
    case 'TERMINATION_WINDOW':
      return 'exit-outline';
    case 'START':
      return 'play-outline';
    case 'END':
      return 'flag-outline';
    case 'PRICE_INCREASE':
      return 'trending-up-outline';
    case 'TRIAL_END':
      return 'hourglass-outline';
    case 'OBLIGATION':
      return 'checkbox-outline';
    case 'CONFIDENTIALITY':
      return 'lock-closed-outline';
    case 'RETURN':
      return 'wallet-outline';
    default:
      return 'alarm-outline';
  }
};

export function nextAnniversary(value) {
  const date = parseIsoDate(value);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  while (next.getTime() < today.getTime()) {
    next.setFullYear(next.getFullYear() + 1);
  }
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  const d = String(next.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function daysUntil(value) {
  const date = parseIsoDate(value);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86400000);
}

export function normalizeDeadline(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const label = String(entry.label || entry.event_title || '').trim();
  if (!label) return null;
  const dateRaw = String(entry.date || entry.event_date || '').trim();
  const offset = String(entry.event_date_or_offset || entry.note || '').trim();
  const iso = parseIsoDate(dateRaw) ? dateRaw.slice(0, 10) : parseIsoDate(offset) ? offset.slice(0, 10) : '';
  return {
    label,
    date: iso,
    kind: normalizeDateKind(entry.kind || entry.event_type),
    note: iso ? String(entry.note || '').trim() : offset,
    criticality: String(entry.criticality || '').toUpperCase(),
  };
}

export function sortDeadlines(entries) {
  return [...(entries || [])]
    .map(normalizeDeadline)
    .filter(Boolean)
    .sort((a, b) => {
      const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      const cr = (rank[a.criticality] ?? 3) - (rank[b.criticality] ?? 3);
      if (cr !== 0) return cr;
      const da = daysUntil(a.date);
      const db = daysUntil(b.date);
      if (da == null && db == null) return 0;
      if (da == null) return 1;
      if (db == null) return -1;
      return da - db;
    });
}

async function readStore() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Tarih radarı okunamadı:', error.message);
    return [];
  }
}

export async function mergeDeadlines({ userId, dates, summary } = {}) {
  const incoming = sortDeadlines(dates);
  if (!incoming.length || !userId) return [];

  const existing = await readStore();
  const stamp = Date.now();
  const next = [
    ...incoming.map((item) => ({
      ...item,
      userId,
      summary: String(summary || '').slice(0, 160),
      savedAt: stamp,
    })),
    ...existing.filter((item) => item?.userId === userId),
  ];

  const seen = new Set();
  const unique = [];
  for (const item of next) {
    const key = `${item.userId}|${item.date}|${item.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
    if (unique.length >= MAX_ITEMS) break;
  }

  const others = existing.filter((item) => item?.userId && item.userId !== userId);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...unique, ...others]));
  } catch (error) {
    console.warn('Tarih radarı kaydedilemedi:', error.message);
  }

  return unique;
}

export async function loadUpcomingDeadlines(userId) {
  if (!userId) return [];
  const all = await readStore();
  return sortDeadlines(all.filter((item) => item?.userId === userId)).filter((item) => {
    const days = daysUntil(item.date);
    if (days == null) return Boolean(item.note);
    return days <= UPCOMING_WINDOW_DAYS;
  });
}
