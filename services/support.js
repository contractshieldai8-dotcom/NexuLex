// NEXULEX AI — Destek ve hata bildirimi servisi.
// Mesaj önce Supabase `support_messages` tablosuna yazılır, ardından
// `notify-support` edge function'ı ile şirket e-postasına iletilir.

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import { getDeviceId } from './quota';

export const SUPPORT_EMAIL = 'nexulexai@gmail.com';
export const SUPPORT_FROM = 'NEXULEX AI <destek@nexulexai.com>';

// Expo Go'da native sürüm okunamaz; app.json'daki sürüm güvenilir kaynaktır.
export const APP_VERSION =
  Constants.expoConfig?.version || Constants.manifest?.version || '1.0.0';

export async function submitSupportMessage({ subject, message, locale }) {
  const trimmed = (message || '').trim();
  if (!trimmed) {
    throw new Error('EMPTY_MESSAGE');
  }

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;

  const payload = {
    user_id: user?.id ?? null,
    email: user?.email ?? null,
    subject: (subject || '').trim() || null,
    message: trimmed,
    locale: locale || null,
    platform: `${Platform.OS} ${Platform.Version}`,
    app_version: APP_VERSION,
    device_id: await getDeviceId().catch(() => null),
  };

  let { data, error } = await supabase
    .from('support_messages')
    .insert(payload)
    .select('id')
    .single();

  // PGRST204: Şema önbelleğinde eksik sütun. Migration henüz uygulanmadıysa
  // bildirim kaybolmasın diye yalnızca çekirdek alanlarla tekrar denenir.
  if (error?.code === 'PGRST204') {
    console.warn('support_messages şeması eksik, çekirdek alanlarla kaydediliyor:', error.message);

    ({ data, error } = await supabase
      .from('support_messages')
      .insert({
        user_id: payload.user_id,
        email: payload.email,
        subject: payload.subject,
        message: payload.message,
      })
      .select('id')
      .single());
  }

  if (error) throw error;

  // E-posta yönlendirmesi bildirimi bloklamaz; başarısız olursa kayıt yine durur.
  supabase.functions
    .invoke('notify-support', {
      body: {
        ...payload,
        id: data?.id,
        to: SUPPORT_EMAIL,
        from: SUPPORT_FROM,
        reply_to: user?.email || payload.email || undefined,
      },
    })
    .catch((err) => console.warn('Destek e-postası iletilemedi:', err?.message));

  return data;
}
