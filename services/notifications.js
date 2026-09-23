// Tuzak takvimi yerel bildirimleri.
// Native modül yoksa try/catch ile no-op; varsa sistem izin penceresi açılır.

import { Platform } from 'react-native';
import { reminderItems } from '../utils/trapExtract';
import { hasNotificationsNative } from './nativeAvailability';

const CHANNEL_ID = 'trap-calendar';
const ID_PREFIX = 'nexulex';

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
} = {}) {
  if (Platform.OS === 'web' || !hasNotificationsNative() || !Notifications?.scheduleNotificationAsync) {
    return { scheduled: 0, denied: false, unavailable: true };
  }

  try {
    const granted = prompt ? await ensureReminderPermissions() : await hasReminderPermission();
    if (!granted) return { scheduled: 0, denied: true };

    const items = reminderItems(events, dates);
    if (!items.length) {
      return { scheduled: 0, denied: false, unavailable: false };
    }

    await ensureAndroidChannel();
    await cancelForAnalysis(analysisId);

    let scheduled = 0;
    for (const item of items) {
      const identifier = `${ID_PREFIX}:${analysisId || 'local'}:${item.kind}:${item.when.toISOString()}`;
      try {
        await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title,
            body: item.label,
            data: { analysisId: analysisId || null, kind: item.kind },
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
