// NEXULEX AI — Cihaz kimliği ve ücretsiz analiz hakkı yönetimi.
// SMS OTP yerine e-posta doğrulaması + telefon/cihaz eşsizliği ile kötüye
// kullanımı maliyetsiz biçimde engeller.

import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { supabase } from './supabase';

export const FREE_ANALYSES_ON_SIGNUP = 2;

let cachedDeviceId = null;

// Android'de ANDROID_ID, iOS'ta identifierForVendor kullanılır.
// İkisi de alınamazsa donanım imzasından kararlı bir yedek kimlik üretilir.
export async function getDeviceId() {
  if (cachedDeviceId) return cachedDeviceId;

  try {
    if (Platform.OS === 'android') {
      const androidId = Application.getAndroidId();
      if (androidId) {
        cachedDeviceId = `android:${androidId}`;
        return cachedDeviceId;
      }
    }

    if (Platform.OS === 'ios') {
      const vendorId = await Application.getIosIdForVendorAsync();
      if (vendorId) {
        cachedDeviceId = `ios:${vendorId}`;
        return cachedDeviceId;
      }
    }
  } catch (error) {
    console.warn('Cihaz kimliği okunamadı, yedek imzaya geçiliyor.', error);
  }

  const fingerprint = [
    Platform.OS,
    Device.brand,
    Device.manufacturer,
    Device.modelName,
    Device.osBuildId || Device.osInternalBuildId,
    Device.totalMemory,
    Application.applicationId,
  ]
    .filter(Boolean)
    .join('|');

  cachedDeviceId = `fp:${simpleHash(fingerprint)}`;
  return cachedDeviceId;
}

// Kısa, kararlı ve çakışma olasılığı düşük bir imza (kriptografik değildir).
function simpleHash(input) {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;

  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + code, 0x85ebca6b) >>> 0;
  }

  return `${h1.toString(36)}${h2.toString(36)}`;
}

// E.164'e yakın normalizasyon: yalnızca rakamlar ve baştaki "+" korunur.
export function normalizePhone(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  const digits = trimmed.replace(/[^\d]/g, '');
  if (!digits) return null;
  return trimmed.startsWith('+') ? `+${digits}` : `+${digits}`;
}

export function isValidPhone(raw) {
  const normalized = normalizePhone(raw);
  return !!normalized && normalized.length >= 9 && normalized.length <= 17;
}

export const QUOTA_ERRORS = {
  PHONE_TAKEN: 'PHONE_TAKEN',
  QUOTA_EXHAUSTED: 'QUOTA_EXHAUSTED',
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
};

const isClockSkewError = (error) =>
  /issued at future|iat.*future/i.test(String(error?.message || ''));

const mapRpcError = (error) => {
  const message = error?.message || '';
  if (message.includes('PHONE_TAKEN')) return QUOTA_ERRORS.PHONE_TAKEN;
  if (message.includes('QUOTA_EXHAUSTED')) return QUOTA_ERRORS.QUOTA_EXHAUSTED;
  if (message.includes('NOT_AUTHENTICATED')) return QUOTA_ERRORS.NOT_AUTHENTICATED;
  return null;
};

async function getFreshSession() {
  const { data } = await supabase.auth.getSession();
  let session = data?.session;

  const expiringSoon =
    session?.expires_at && session.expires_at * 1000 < Date.now() + 15_000;

  if (!session?.access_token || expiringSoon) {
    const refreshed = await supabase.auth.refreshSession();
    if (refreshed.data?.session?.access_token) {
      session = refreshed.data.session;
    }
  }

  return session?.access_token ? session : null;
}

// Giriş / kayıt sonrasında çağrılır. Profili kurar, telefon+cihaz eşsizse ve
// e-posta doğrulanmışsa 2 ücretsiz hak tanımlar, aksi halde 0 bırakır.
export async function syncProfileAndQuota({ phone } = {}) {
  const session = await getFreshSession();
  if (!session) return null;

  const deviceId = await getDeviceId();
  const normalizedPhone = normalizePhone(phone);

  const runClaim = () =>
    supabase.rpc('claim_free_quota', {
      p_phone: normalizedPhone,
      p_device: deviceId,
    });

  let { data, error } = await runClaim();

  // JWT henüz Postgres'e yansımadıysa bir kez yenileyip tekrar dene.
  if (error && mapRpcError(error) === QUOTA_ERRORS.NOT_AUTHENTICATED) {
    const retried = await supabase.auth.refreshSession();
    if (retried.data?.session?.access_token) {
      ({ data, error } = await runClaim());
    }
    if (error && mapRpcError(error) === QUOTA_ERRORS.NOT_AUTHENTICATED) {
      return null;
    }
  }

  if (error) {
    if (isClockSkewError(error)) {
      console.warn('claim_free_quota saat kayması:', error.message);
      const skew = new Error('CLOCK_SKEW');
      skew.code = 'CLOCK_SKEW';
      throw skew;
    }
    const code = mapRpcError(error);
    if (code) {
      const mapped = new Error(code);
      mapped.code = code;
      throw mapped;
    }

    // Migration henüz uygulanmadıysa uygulamayı kilitleme; sadece uyar.
    console.log('claim_free_quota çağrılamadı:', error.message);
    return null;
  }

  return Array.isArray(data) ? data[0] : data;
}

export async function fetchProfile() {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, phone_number, device_id, free_analyses_left, is_pro')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.log('Profil okunamadı:', error.message);
    return null;
  }

  return data;
}

// Başarılı bir analizden sonra hak düşer. Hak yoksa QUOTA_EXHAUSTED fırlatır.
// Başarısız (timeout / 546 / PARSE) taramalar bu fonksiyonu çağırmaz.
export async function consumeAnalysisCredit() {
  const { data, error } = await supabase.rpc('consume_free_analysis');

  if (error) {
    const code = mapRpcError(error);
    if (code) {
      const mapped = new Error(code);
      mapped.code = code;
      throw mapped;
    }

    console.warn('consume_free_analysis çağrılamadı:', error.message);
    return null;
  }

  // -1 => sınırsız (Pro), diğer değerler kalan ücretsiz hak.
  return typeof data === 'number' ? data : null;
}

export const isProProfile = (profile) => !!profile?.is_pro;

export const remainingAnalyses = (profile) =>
  profile?.is_pro ? Infinity : Math.max(0, profile?.free_analyses_left ?? 0);
