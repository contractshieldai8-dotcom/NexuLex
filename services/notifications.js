// Tuzak takvimi yerel bildirimleri.
// Native modül yoksa try/catch ile no-op; varsa sistem izin penceresi açılır.

import { Platform } from 'react-native';
import { reminderItems } from '../utils/trapExtract';
import { expandLeadReminders, leadDaysFor, nudgeDates } from '../utils/reminderLead';
import { hasNotificationsNative } from './nativeAvailability';

const CHANNEL_ID = 'trap-calendar';
const NUDGE_CHANNEL_ID = 'comeback';
const ID_PREFIX = 'nexulex';
const NUDGE_PREFIX = `${ID_PREFIX}:nudge:`;

function loadNotifications() {
  if (Platform.OS === 'web' || !hasNotificationsNative()) return null;
  try {
    const mod = require('expo-notifications');
    mod.setNotificationHandler?.({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    return mod;
  } catch (error) {
    return null;
  }
}

let Notifications = null;
try {
  Notifications = loadNotifications();
} catch {
  Notifications = null;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android' || !Notifications?.setNotificationChannelAsync) return;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Contract reminders',
      importance: Notifications.AndroidImportance?.HIGH ?? 4,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00F5D4',
    });
  } catch (error) {
    console.log('Bildirim kanalı atlandı:', error?.message);
  }
  try {
    // Separate, quieter channel so people can mute check-ins without losing deadline reminders.
    await Notifications.setNotificationChannelAsync(NUDGE_CHANNEL_ID, {
      name: 'Check-in reminders',
      importance: Notifications.AndroidImportance?.DEFAULT ?? 3,
    });
  } catch (error) {
    console.log('Hatırlatma kanalı atlandı:', error?.message);
  }
}

async function countOurPending(exceptPrefix = '') {
  if (!Notifications?.getAllScheduledNotificationsAsync) return 0;
  try {
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    return (existing || []).filter((item) => {
      const id = String(item.identifier || '');
      return id.startsWith(ID_PREFIX) && !(exceptPrefix && id.startsWith(exceptPrefix));
    }).length;
  } catch {
    return 0;
  }
}

export async function hasReminderPermission() {
  if (Platform.OS === 'web' || !hasNotificationsNative() || !Notifications?.getPermissionsAsync) return false;
  try {
    await ensureAndroidChannel();
    const current = await Notifications.getPermissionsAsync();
    return current.status === 'granted';
  } catch (error) {
    console.log('Bildirim izni okunamadı:', error.message);
    return false;
  }
}

export async function ensureReminderPermissions() {
  if (Platform.OS === 'web' || !hasNotificationsNative() || !Notifications?.requestPermissionsAsync) return false;
  try {
    await ensureAndroidChannel();
    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === 'granted';
  } catch (error) {
    console.log('Bildirim izni atlandı:', error.message);
    return false;
  }
}

function shortHash(text) {
  let hash = 5381;
  const raw = String(text || '');
  for (let i = 0; i < raw.length; i += 1) hash = ((hash << 5) + hash + raw.charCodeAt(i)) | 0;
  return (hash >>> 0).toString(36);
}

function fallbackFireDate() {
  const when = new Date();
  when.setDate(when.getDate() + 1);
  when.setHours(9, 0, 0, 0);
  if (when.getTime() <= Date.now() + 60 * 1000) {
    when.setTime(Date.now() + 60 * 60 * 1000);
  }
  return when;
}

async function cancelForAnalysis(analysisId) {
  if (!Notifications?.getAllScheduledNotificationsAsync) return;
  const prefix = `${ID_PREFIX}:${analysisId || 'local'}:`;
  try {
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      (existing || [])
        .filter((item) => String(item.identifier || '').startsWith(prefix))
        .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
    );
  } catch (error) {
    console.log('Eski hatırlatıcılar temizlenemedi:', error.message);
  }
}

export async function cancelAnalysisReminders(analysisId) {
  if (Platform.OS === 'web' || !analysisId) return;
  await cancelForAnalysis(analysisId);
}

/** Cancels every scheduled NexuLex reminder (account deletion / full local purge). */
export async function cancelAllNexuLexNotifications() {
  if (Platform.OS === 'web' || !Notifications?.getAllScheduledNotificationsAsync) return 0;
  try {
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    const ours = (existing || []).filter((item) => String(item.identifier || '').startsWith(ID_PREFIX));
    await Promise.all(ours.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
    return ours.length;
  } catch (error) {
    console.log('Hatırlatıcılar iptal edilemedi:', error?.message);
    return 0;
  }
}

export async function scheduleTrapReminders({
  analysisId,
  events = [],
  dates = [],
  title = 'NexuLex AI',
  prompt = false,
  bodyFor = null,
} = {}) {
  if (Platform.OS === 'web' || !hasNotificationsNative() || !Notifications?.scheduleNotificationAsync) {
    return { scheduled: 0, denied: false, unavailable: true };
  }

  try {
    const granted = prompt ? await ensureReminderPermissions() : await hasReminderPermission();
    if (!granted) return { scheduled: 0, denied: true };

    const deadlines = reminderItems(events, dates);
    if (!deadlines.length) {
      return { scheduled: 0, denied: false, unavailable: false };
    }

    await ensureAndroidChannel();
    await cancelForAnalysis(analysisId);

    // WAVE I: 30 / 7 / 1 days before and on the day (fewer steps when many reminders are already pending).
    const pending = await countOurPending();
    const items = expandLeadReminders(deadlines, { leads: leadDaysFor(pending) });
    if (!items.length) {
      return { scheduled: 0, denied: false, unavailable: false };
    }

    let scheduled = 0;
    for (const item of items) {
      const identifier = `${ID_PREFIX}:${analysisId || 'local'}:${item.kind}:${item.when.toISOString()}:${item.lead}:${shortHash(item.label)}`;
      let body = item.label;
      try {
        if (typeof bodyFor === 'function') body = String(bodyFor(item.lead, item.label) || item.label);
      } catch {
        body = item.label;
      }
      try {
        await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title,
            body,
            data: { analysisId: analysisId || null, kind: item.kind, lead: item.lead },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes?.DATE || 'date',
            date: item.when,
            channelId: CHANNEL_ID,
          },
        });
        scheduled += 1;
      } catch (error) {
        console.log('Hatırlatıcı zamanlanamadı:', error.message);
      }
    }

    return { scheduled, denied: false, unavailable: false };
  } catch (error) {
    console.log('Hatırlatıcı altyapısı atlandı:', error?.message);
    return { scheduled: 0, denied: true, unavailable: !hasNotificationsNative() };
  }
}

/** Removes the pending check-in nudges (kept separate from deadline reminders). */
export async function cancelComebackNudges() {
  if (Platform.OS === 'web' || !Notifications?.getAllScheduledNotificationsAsync) return 0;
  try {
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    const ours = (existing || []).filter((item) => String(item.identifier || '').startsWith(NUDGE_PREFIX));
    await Promise.all(ours.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
    return ours.length;
  } catch (error) {
    console.log('Check-in hatırlatmaları iptal edilemedi:', error?.message);
    return 0;
  }
}

/**
 * WAVE I: two quiet check-ins (3 and 10 days after the last visit). Never asks for permission: it only
 * schedules when the user already allowed notifications. Every visit re-arms them, so people who keep
 * using the app never see one. bodies: { 3: string, 10: string }.
 */
export async function scheduleComebackNudges({ bodies = {}, title = 'NexuLex AI' } = {}) {
  if (Platform.OS === 'web' || !hasNotificationsNative() || !Notifications?.scheduleNotificationAsync) {
    return { scheduled: 0, denied: false, unavailable: true };
  }
  try {
    await cancelComebackNudges();
    if (!(await hasReminderPermission())) return { scheduled: 0, denied: true };
    let scheduled = 0;
    for (const nudge of nudgeDates()) {
      const body = String(bodies[nudge.days] || '').trim();
      if (!body) continue;
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: `${NUDGE_PREFIX}${nudge.days}`,
          content: { title, body, data: { kind: 'nudge', days: nudge.days }, sound: false },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes?.DATE || 'date',
            date: nudge.when,
            channelId: NUDGE_CHANNEL_ID,
          },
        });
        scheduled += 1;
      } catch (error) {
        console.log('Check-in zamanlanamadı:', error?.message);
      }
    }
    return { scheduled, denied: false, unavailable: false };
  } catch (error) {
    console.log('Check-in altyapısı atlandı:', error?.message);
    return { scheduled: 0, denied: true, unavailable: !hasNotificationsNative() };
  }
}

export function subscribeReminderOpens(onOpen) {
  if (Platform.OS === 'web' || !hasNotificationsNative() || !Notifications) {
    return () => {};
  }

  let cancelled = false;
  const seen = new Set();
  const emit = (response) => {
    if (cancelled) return;
    const id = String(
      response?.notification?.request?.content?.data?.analysisId ||
        response?.notification?.request?.content?.data?.analysis_id ||
        ''
    ).trim();
    if (!id) return;
    const stamp = String(response?.notification?.request?.identifier || id);
    if (seen.has(stamp)) return;
    seen.add(stamp);
    try {
      onOpen?.(id);
    } catch (error) {
      console.log('Hatırlatıcı açılışı atlandı:', error?.message);
    }
  };

  let sub = null;
  try {
    sub = Notifications.addNotificationResponseReceivedListener?.(emit) || null;
  } catch {
    sub = null;
  }

  try {
    Notifications.getLastNotificationResponseAsync?.()
      .then((response) => {
        const when = response?.notification?.date;
        const ts = when ? new Date(when).getTime() : 0;
        if (ts && Date.now() - ts > 120000) return;
        emit(response);
        try {
          Notifications.clearLastNotificationResponseAsync?.();
        } catch {
          /* no-op */
        }
      })
      .catch(() => {});
  } catch {
    /* native yok */
  }

  return () => {
    cancelled = true;
    try {
      sub?.remove?.();
    } catch {
      /* no-op */
    }
  };
}
