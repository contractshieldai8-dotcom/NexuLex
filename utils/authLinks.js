// Supabase e-posta bağlantılarından gelen deep link'leri çözer.
//
// Development Build launcher'ı ve Android, URL fragment'ini (#access_token)
// çoğu zaman JS'e iletmez. Bu yüzden hem query hem hash, hem de Expo'nun
// `--/` ve `?url=` sarmalayıcıları okunur.
//
//   1. PKCE            -> ...://auth/callback?code=<uuid>
//   2. Implicit        -> ...://auth/callback#access_token=...&refresh_token=...
//   3. Token hash      -> ...://auth/callback?token_hash=<hash>&type=signup

import * as Linking from 'expo-linking';
import { supabase } from '../services/supabase';
import { isAuthCallbackUrl } from './authRedirects';

function parseFragment(url) {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return {};

  const params = {};
  for (const pair of url.slice(hashIndex + 1).split('&')) {
    if (!pair) continue;
    const [rawKey, rawValue = ''] = pair.split('=');
    params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.replace(/\+/g, ' '));
  }
  return params;
}

function parseQuery(url) {
  const withoutHash = url.split('#')[0];
  const queryIndex = withoutHash.indexOf('?');
  if (queryIndex === -1) return {};

  const params = {};
  for (const pair of withoutHash.slice(queryIndex + 1).split('&')) {
    if (!pair) continue;
    const [rawKey, rawValue = ''] = pair.split('=');
    params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.replace(/\+/g, ' '));
  }
  return params;
}

function unwrapExpoUrl(url) {
  if (!url) return url;

  let current = url;
  for (let i = 0; i < 3; i++) {
    const nested = parseQuery(current).url;
    if (!nested) break;
    try {
      current = decodeURIComponent(nested);
    } catch {
      current = nested;
    }
  }

  const marker = '/--/';
  const index = current.indexOf(marker);
  if (index !== -1) {
    const rest = current.slice(index + marker.length);
    const schemeEnd = current.indexOf('://');
    const scheme = schemeEnd > 0 ? current.slice(0, schemeEnd) : 'contractshield';
    current = `${scheme}://${rest}`;
  }

  return current;
}

function collectParams(url) {
  if (!url) return {};
  let parsedQuery = {};
  try {
    parsedQuery = Linking.parse(url)?.queryParams || {};
  } catch {
    parsedQuery = {};
  }
  return {
    ...parsedQuery,
    ...parseQuery(url),
    ...parseFragment(url),
  };
}

export const AUTH_LINK_RESULTS = {
  IGNORED: 'IGNORED',
  RECOVERY: 'RECOVERY',
  SIGNED_IN: 'SIGNED_IN',
  ERROR: 'ERROR',
};

/**
 * Deep link'i işler ve gerekiyorsa oturumu kurar.
 * @returns {{ type: string, message?: string }}
 */
export async function handleAuthDeepLink(url) {
  if (!url) return { type: AUTH_LINK_RESULTS.IGNORED };

  const normalized = unwrapExpoUrl(url);
  const params = {
    ...collectParams(url),
    ...collectParams(normalized),
  };

  if (params.error || params.error_code) {
    return {
      type: AUTH_LINK_RESULTS.ERROR,
      message: params.error_description || params.error_code || params.error,
    };
  }

  const hasAuthPayload = Boolean(
    params.code ||
      params.access_token ||
      params.refresh_token ||
      params.token_hash ||
      params.token
  );

  if (!hasAuthPayload && !isAuthCallbackUrl(url) && !isAuthCallbackUrl(normalized)) {
    return { type: AUTH_LINK_RESULTS.IGNORED };
  }

  const isRecovery =
    params.type === 'recovery' ||
    /reset-password/i.test(normalized) ||
    /reset-password/i.test(url);

  try {
    if (params.code) {
      const { error } = await supabase.auth.exchangeCodeForSession(params.code);
      if (error) throw error;
      return { type: isRecovery ? AUTH_LINK_RESULTS.RECOVERY : AUTH_LINK_RESULTS.SIGNED_IN };
    }

    if (params.access_token && params.refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      if (error) throw error;
      return { type: isRecovery ? AUTH_LINK_RESULTS.RECOVERY : AUTH_LINK_RESULTS.SIGNED_IN };
    }

    if (params.token_hash) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: params.token_hash,
        type: params.type || (isRecovery ? 'recovery' : 'signup'),
      });
      if (error) throw error;
      return { type: isRecovery ? AUTH_LINK_RESULTS.RECOVERY : AUTH_LINK_RESULTS.SIGNED_IN };
    }

    if (params.token && params.type) {
      const { error } = await supabase.auth.verifyOtp({
        token: params.token,
        type: params.type,
        email: params.email,
      });
      if (error) throw error;
      return { type: isRecovery ? AUTH_LINK_RESULTS.RECOVERY : AUTH_LINK_RESULTS.SIGNED_IN };
    }
  } catch (error) {
    console.log('Deep link oturumu kurulamadı:', error.message);
    return { type: AUTH_LINK_RESULTS.ERROR, message: error.message };
  }

  return { type: AUTH_LINK_RESULTS.IGNORED };
}
