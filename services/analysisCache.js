import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAcceptableAnalysis } from '../utils/analysis';

const STORAGE_KEY = 'nexulex.analysisCache.v3';
const MAX_ENTRIES = 16;
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function hashSource(text) {
  const raw = String(text || '');
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `h${(hash >>> 0).toString(16)}`;
}

export function documentCacheToken(kind, payload, extra = '') {
  const body = String(payload || '');
  return `${kind}:${body.length}:${hashSource(`${kind}\u0001${extra}\u0001${body}`)}`;
}

const fingerprint = (text, { lang, country, party, category } = {}) =>
  hashSource(
    [
      lang || 'tr',
      country || 'auto',
      party || 'auto',
      category || 'general',
      String(text || '').trim(),
    ].join('\u0001')
  );

const isCacheToken = (value) => /^(pdf|img):/i.test(String(value || '').trim());

const stripRuntimeFlags = (analysis) => {
  if (!analysis || typeof analysis !== 'object') return null;
  const next = { ...analysis };
  delete next.__fromCache;
  delete next.__parsePartial;
  delete next.__extractFallback;
  delete next.__parseFailed;
  return next;
};

const readStore = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStore = async (entries) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* önbellek yazılamazsa analiz yine çalışır */
  }
};

export async function getCachedAnalysis(text, meta) {
  const source = String(text || '').trim();
  if (!isCacheToken(source) && source.length < 200) return null;
  const key = fingerprint(source, meta);
  const now = Date.now();
  try {
    const entries = await readStore();
    const hit = entries.find((item) => item?.key === key && now - Number(item.savedAt || 0) < TTL_MS);
    const analysis = hit?.analysis && typeof hit.analysis === 'object' ? hit.analysis : null;
    if (!analysis) return null;
    if (!isAcceptableAnalysis(analysis, analysis.contract_text || analysis.contractText || source)) {
      await writeStore(entries.filter((item) => item?.key !== key));
      return null;
    }
    return analysis;
  } catch {
    return null;
  }
}

export async function setCachedAnalysis(text, meta, analysis) {
  const source = String(text || '').trim();
  const payload = stripRuntimeFlags(analysis);
  if ((!isCacheToken(source) && source.length < 200) || !payload) return;
  if (!isAcceptableAnalysis(payload, payload.contract_text || payload.contractText || source)) return;
  try {
    const key = fingerprint(source, meta);
    const rest = (await readStore()).filter((item) => item?.key !== key);
    await writeStore([{ key, savedAt: Date.now(), analysis: payload }, ...rest]);
  } catch {
    /* yut */
  }
}
