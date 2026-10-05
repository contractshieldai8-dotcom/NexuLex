// WAVE G: anonymous product events and error reports (own Supabase table, no third-party SDK).
//
// - Never contains contract text, emails or account ids: only allow-listed scalar props.
// - Uses a random install id created on the device (not a hardware id), never linked to an account.
// - Consent: in strict-privacy regions (EEA, UK, CH, TR, BR, IN, ...) nothing is sent until the user
//   opts in; elsewhere it is on by default with an opt-out switch in Settings -> Privacy.
// - Every public function is fail-safe: telemetry can never throw into the app.

import { AppState, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import i18n from '../i18n';
import { supabase } from './supabase';
import { deviceRegion } from '../utils/locale';
import {
  FLUSH_AT,
  MAX_BATCH,
  defaultConsent,
  errorProps,
  isStrictRegion,
  makeEvent,
  newInstallId,
  pushBounded,
} from '../utils/telemetryCore';

const INSTALL_KEY = '@nexulex/telemetryInstall';
const CONSENT_KEY = '@nexulex/telemetryConsent'; // 'on' | 'off'
const QUEUE_KEY = '@nexulex/telemetryQueue';
const FIRST_OPEN_KEY = '@nexulex/telemetryFirstOpen'; // local timestamp only, never sent as such
const FIRST_VALUE_KEY = '@nexulex/telemetryFirstValue';
const MAX_FIRST_VALUE_MS = 30 * 24 * 60 * 60 * 1000;
const SEND_TIMEOUT_MS = 8000;

const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

let installId = null;
let consent = null; // 'on' | 'off' | null (not chosen)
let queue = [];
let ready = false;
let flushing = false;
let handlersInstalled = false;
let askedThisSession = false;

const regionDefault = () => defaultConsent(deviceRegion());

export function isTelemetryEnabled() {
  if (consent === 'on') return true;
  if (consent === 'off') return false;
  return regionDefault();
}

/** True when the user still has to be asked (strict region and no answer yet). */
export function needsTelemetryConsent() {
  return consent === null && isStrictRegion(deviceRegion());
}

async function persistQueue() {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // ignore
  }
}

async function load() {
  if (ready) return;
  try {
    const [storedId, storedConsent, storedQueue] = await Promise.all([
      AsyncStorage.getItem(INSTALL_KEY),
      AsyncStorage.getItem(CONSENT_KEY),
      AsyncStorage.getItem(QUEUE_KEY),
    ]);
    installId = /^[a-f0-9]{16,64}$/.test(storedId || '') ? storedId : null;
    consent = storedConsent === 'on' || storedConsent === 'off' ? storedConsent : null;
    try {
      const parsed = JSON.parse(storedQueue || '[]');
      queue = Array.isArray(parsed) ? parsed.slice(-100) : [];
    } catch {
      queue = [];
    }
  } catch {
    // storage unavailable: keep defaults
  }
  ready = true;
}

async function ensureInstallId() {
  if (installId) return installId;
  let bytes = null;
  try {
    // eslint-disable-next-line no-undef
    bytes = globalThis.crypto?.getRandomValues?.(new Uint8Array(16)) || null;
  } catch {
    bytes = null;
  }
  installId = newInstallId(bytes);
  try {
    await AsyncStorage.setItem(INSTALL_KEY, installId);
  } catch {
    // ignore
  }
  return installId;
}

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms))]);
}

export async function flushTelemetry() {
  try {
    await load();
    if (flushing || !queue.length) return;
    if (!isTelemetryEnabled()) {
      queue = [];
      await persistQueue();
      return;
    }
    flushing = true;
    const batch = queue.slice(0, MAX_BATCH);
    const id = await ensureInstallId();
    const { error } = await withTimeout(
      supabase.functions.invoke('log-event', {
        body: {
          install_id: id,
          app_version: APP_VERSION,
          platform: Platform.OS,
          lang: i18n.language || 'en',
          events: batch.map(({ event, props }) => ({ event, props })),
        },
      }),
      SEND_TIMEOUT_MS,
    );
    if (!error) {
      queue = queue.slice(batch.length);
      await persistQueue();
    }
  } catch {
    // keep the queue and try again at the next flush
  } finally {
    flushing = false;
  }
}

export function track(name, props) {
  try {
    const item = makeEvent(name, props);
    if (!item) return;
    // Events recorded before the user chooses are dropped in strict regions.
    if (ready && !isTelemetryEnabled()) return;
    load().then(() => {
      if (!isTelemetryEnabled()) return;
      queue = pushBounded(queue, item);
      persistQueue();
      if (queue.length >= FLUSH_AT) flushTelemetry();
    });
  } catch {
    // never throw
  }
}

/**
 * WAVE H: the activation moment. Reported once per install when the first real result is shown,
 * with the time since the first launch (ms, capped). Skipped while telemetry is off, so it can still
 * be recorded after the user opts in.
 */
export async function trackFirstValue(props) {
  try {
    await load();
    if (!isTelemetryEnabled()) return;
    if (await AsyncStorage.getItem(FIRST_VALUE_KEY)) return;
    const opened = Number(await AsyncStorage.getItem(FIRST_OPEN_KEY)) || 0;
    const elapsed = opened ? Math.min(Math.max(Date.now() - opened, 0), MAX_FIRST_VALUE_MS) : undefined;
    await AsyncStorage.setItem(FIRST_VALUE_KEY, '1');
    track('first_value', { ...(props || {}), ms: elapsed });
  } catch {
    // never throw
  }
}

export function trackError(error, screen) {
  try {
    track('app_error', errorProps(error, screen));
  } catch {
    // never throw
  }
}

export async function setTelemetryEnabled(enabled) {
  await load();
  consent = enabled ? 'on' : 'off';
  try {
    await AsyncStorage.setItem(CONSENT_KEY, consent);
  } catch {
    // ignore
  }
  if (!enabled) {
    queue = [];
    await persistQueue();
  } else {
    track('consent_choice', { ok: true });
    flushTelemetry();
  }
}

/** One-time opt-in question for strict regions; resolves true when the user allowed it. */
export async function askTelemetryConsentOnce() {
  try {
    await load();
    if (!needsTelemetryConsent() || askedThisSession) return false;
    askedThisSession = true;
    return await new Promise((resolve) => {
      Alert.alert(
        i18n.t('telAskTitle'),
        i18n.t('telAskBody'),
        [
          {
            text: i18n.t('telNotNow'),
            style: 'cancel',
            onPress: () => {
              setTelemetryEnabled(false).then(() => resolve(false));
            },
          },
          {
            text: i18n.t('telAllow'),
            onPress: () => {
              setTelemetryEnabled(true).then(() => resolve(true));
            },
          },
        ],
        { cancelable: false },
      );
    });
  } catch {
    return false;
  }
}

function installGlobalHandlers() {
  if (handlersInstalled) return;
  handlersInstalled = true;
  try {
    const utils = globalThis.ErrorUtils;
    if (utils?.getGlobalHandler && utils?.setGlobalHandler) {
      const previous = utils.getGlobalHandler();
      utils.setGlobalHandler((error, isFatal) => {
        trackError(error, isFatal ? 'fatal' : 'js');
        // Persist right away: a fatal error may close the app before the next flush.
        flushTelemetry();
        if (typeof previous === 'function') previous(error, isFatal);
      });
    }
  } catch {
    // ignore
  }
  try {
    AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') flushTelemetry();
    });
  } catch {
    // ignore
  }
}

/** Call once at startup (App.js). */
export async function initTelemetry({ signedIn = false } = {}) {
  try {
    await load();
    installGlobalHandlers();
    AsyncStorage.getItem(FIRST_OPEN_KEY)
      .then((stored) => (stored ? null : AsyncStorage.setItem(FIRST_OPEN_KEY, String(Date.now()))))
      .catch(() => {});
    track('app_open', { signed_in: Boolean(signedIn), lang: i18n.language || 'en' });
    flushTelemetry();
  } catch {
    // ignore
  }
}
