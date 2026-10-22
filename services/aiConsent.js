// Explicit, withdrawable consent before any user content leaves the device for the AI provider
// (App Store Review Guideline 5.1.1(i) / 5.1.2(i); GDPR Art. 6(1)(a) and Art. 7(3); KVKK Art. 5).
// Stored per signed-in user on this device and mirrored to an append-only server ledger. Nothing is sent to the AI endpoints until it is granted.
// Quota / status calls that carry no user content do not need it.

import { Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import { supabase } from './supabase';
import { TRUST_URLS } from '../constants/settingsTrust';

export const AI_CONSENT_REQUIRED = 'AI_CONSENT_REQUIRED';
// Bump when the data flow changes materially (new provider, new data type) to ask again.
export const AI_CONSENT_VERSION = 1;
export const AI_CONSENT_TYPE = 'ai_processing';

// Dual write. The device record (AsyncStorage) is authoritative and works offline: the user's decision applies the
// moment it is made. Every decision is also appended to the server ledger (public.consents, append-only, RLS) so
// consent can be demonstrated later. If that insert fails (offline, server error) the device decision still stands
// and the insert waits in a local queue that is retried on the next consent check, app use or settings visit.
const KEY_PREFIX = '@nexulex/aiConsent/v1/';
const QUEUE_PREFIX = '@nexulex/aiConsentQueue/v1/';
const MAX_QUEUE = 20;

let pendingPrompt = null;
let flushing = null;

async function currentUserId() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user?.id || null;
  } catch {
    return null;
  }
}

const storageKey = (userId) => `${KEY_PREFIX}${userId}`;
const queueKey = (userId) => `${QUEUE_PREFIX}${userId}`;

async function readRecord(userId) {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const record = JSON.parse(raw);
    return record && typeof record === 'object' ? record : null;
  } catch {
    return null;
  }
}

async function readQueue(userId) {
  try {
    const raw = await AsyncStorage.getItem(queueKey(userId));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function writeQueue(userId, list) {
  try {
    if (!list.length) await AsyncStorage.removeItem(queueKey(userId));
    else await AsyncStorage.setItem(queueKey(userId), JSON.stringify(list.slice(-MAX_QUEUE)));
  } catch {
    /* the device record is still correct; the ledger entry is best effort */
  }
}

// A rejected insert that will never succeed (constraint, permission) must not block the queue forever.
function isPermanentLedgerError(error) {
  const code = String(error?.code || '');
  return /^23/.test(code) || code === '42501';
}

/**
 * Sends queued consent decisions to the server ledger in order. Never throws, never blocks the caller's decision:
 * on the first transient failure it stops and keeps the rest for the next attempt.
 * Resolves to the number of decisions that are still waiting.
 */
export function flushConsentQueue() {
  if (flushing) return flushing;
  flushing = (async () => {
    const userId = await currentUserId();
    if (!userId) return 0;
    let queue = await readQueue(userId);
    // Records written before the ledger existed have no queue entry: backfill them once.
    const record = await readRecord(userId);
    if (record && record.synced !== true && !queue.some((q) => q.at === record.at)) {
      queue = [...queue, { granted: record.granted === true, version: Number(record.version) || 1, at: record.at || new Date().toISOString() }];
    }
    while (queue.length) {
      const item = queue[0];
      let failed = false;
      try {
        const { error } = await supabase.from('consents').insert({
          user_id: userId,
          consent_type: AI_CONSENT_TYPE,
          version: item.version,
          granted: item.granted === true,
        });
        if (error) failed = !isPermanentLedgerError(error);
      } catch {
        failed = true;
      }
      if (failed) break;
      queue = queue.slice(1);
    }
    await writeQueue(userId, queue);
    if (!queue.length && record && record.synced !== true) {
      const fresh = await readRecord(userId);
      // Only mark synced when the stored decision is still the one we just sent.
      if (fresh && fresh.at === record.at) {
        try {
          await AsyncStorage.setItem(storageKey(userId), JSON.stringify({ ...fresh, synced: true }));
        } catch {
          /* retried next time */
        }
      }
    }
    return queue.length;
  })()
    .catch(() => 0)
    .finally(() => {
      flushing = null;
    });
  return flushing;
}

/** 'granted' | 'declined' | 'outdated' (accepted an older wording version: ask again) | 'none'. */
export async function getAiConsentStatus() {
  const userId = await currentUserId();
  if (!userId) return 'none';
  const record = await readRecord(userId);
  if (!record) return 'none';
  if (record.granted !== true) return 'declined';
  return Number(record.version) >= AI_CONSENT_VERSION ? 'granted' : 'outdated';
}

export async function hasAiConsent() {
  const status = await getAiConsentStatus();
  if (status !== 'none') flushConsentQueue();
  return status === 'granted';
}

export async function setAiConsent(granted) {
  const userId = await currentUserId();
  if (!userId) return false;
  const at = new Date().toISOString();
  const version = AI_CONSENT_VERSION;
  try {
    // 1. Device first: the decision is effective immediately and offline.
    await AsyncStorage.setItem(
      storageKey(userId),
      JSON.stringify({ granted: granted === true, version, at, synced: false })
    );
  } catch {
    return false;
  }
  // 2. Ledger second: queued, then attempted. A failure here never undoes the device decision.
  const queue = await readQueue(userId);
  await writeQueue(userId, [...queue, { granted: granted === true, version, at }]);
  flushConsentQueue();
  return true;
}

function askOnce() {
  return new Promise((resolve) => {
    const t = (key) => i18n.t(key);
    const body = [t('aiConsentSend'), t('aiConsentRules'), t('aiConsentWithdraw')].join('\n\n');
    Alert.alert(
      t('aiConsentTitle'),
      body,
      [
        { text: t('aiConsentDecline'), style: 'cancel', onPress: () => resolve('decline') },
        { text: t('privacyPolicy'), onPress: () => resolve('policy') },
        { text: t('aiConsentAgree'), onPress: () => resolve('agree') },
      ],
      { cancelable: false }
    );
  });
}

async function runPrompt() {
  // The privacy policy button re-opens the question after the link, so the user decides with full information.
  for (let round = 0; round < 5; round += 1) {
    const choice = await askOnce();
    if (choice === 'agree') {
      await setAiConsent(true);
      return true;
    }
    if (choice === 'decline') return false;
    try {
      await Linking.openURL(TRUST_URLS.privacy || 'https://nexulexai.netlify.app/privacy.html');
    } catch {
      /* the question is asked again below */
    }
    // Give the browser time to take focus before the alert returns.
    await new Promise((done) => setTimeout(done, 400));
  }
  return false;
}

/**
 * Resolves when the user has granted AI consent; throws an error with code AI_CONSENT_REQUIRED when
 * the user declines. Concurrent callers share one prompt.
 */
export async function ensureAiConsent() {
  if (await hasAiConsent()) return true;
  if (!pendingPrompt) {
    pendingPrompt = runPrompt().finally(() => {
      pendingPrompt = null;
    });
  }
  const granted = await pendingPrompt;
  if (!granted) {
    throw Object.assign(new Error(AI_CONSENT_REQUIRED), { code: AI_CONSENT_REQUIRED });
  }
  return true;
}
