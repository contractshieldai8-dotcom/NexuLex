// Deep link ve e-posta yönlendirme adresleri.
//
// Development Build'de sabit `contractshield://auth/callback` Expo Dev Client
// launcher (sunucu seçme) ekranını açar; Metro JS paketine inmez.
// Bu yüzden her zaman `Linking.createURL` kullanılır ve __DEV__ ortamında
// URL, `expo-development-client/?url=<metro>/--/auth/callback` sarmalayıcısından geçer.
//
// Supabase Dashboard → Authentication → URL Configuration Redirect URLs:
//   contractshield://auth/callback
//   contractshield://expo-development-client
//   contractshield://expo-development-client/**
//   contractshield://verify-email
//   contractshield://reset-password
//   nexulex://auth/callback
//   nexulex://expo-development-client/**
//   exp://127.0.0.1:8081/--/auth/callback

import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

export const AUTH_SCHEME = 'contractshield';

export const AUTH_REDIRECT_URLS = [
  'contractshield://auth/callback',
  'contractshield://expo-development-client',
  'contractshield://expo-development-client/**',
  'contractshield://verify-email',
  'contractshield://reset-password',
  'nexulex://auth/callback',
  'nexulex://expo-development-client/**',
];

export function createAuthRedirectUrl(kind = 'callback') {
  const path = kind === 'recovery' ? 'reset-password' : 'auth/callback';
  const created = Linking.createURL(path);

  // Expo Go zaten exp://<metro>/--/path üretir.
  if (Constants.appOwnership === 'expo') return created;

  // Development Client: launcher yerine bağlı Metro paketini aç.
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const metroBase = hostUri.includes('://') ? hostUri.replace(/\/$/, '') : `http://${hostUri}`;
      const deep = `${metroBase}/--/${path}`;
      return `${AUTH_SCHEME}://expo-development-client/?url=${encodeURIComponent(deep)}`;
    }
  }

  return created;
}

export function isAuthCallbackUrl(url) {
  if (!url) return false;
  return /auth\/callback|verify-email|reset-password|expo-development-client|type=signup|type=recovery|type=email|type=magiclink|access_token=|refresh_token=|[?&#]code=/.test(
    url
  );
}
