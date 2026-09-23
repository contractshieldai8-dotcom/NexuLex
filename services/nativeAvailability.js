// Expo SDK 57 modules register through JSI (`requireOptionalNativeModule`),
// not the legacy NativeModules map. Check both so Dev Client / Expo Go stay accurate.

import { NativeModules } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

export function hasNativeModule(...names) {
  try {
    return names.some((name) => {
      if (NativeModules?.[name]) return true;
      try {
        return Boolean(requireOptionalNativeModule(name));
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

export const hasSpeechNative = () =>
  hasNativeModule('ExpoSpeech', 'ExponentSpeech', 'ExpoSpeechModule');

export const hasSpeechRecognitionNative = () =>
  hasNativeModule('ExpoSpeechRecognition', 'ExpoSpeechRecognitionModule');

export const hasNotificationsNative = () =>
  hasNativeModule(
    'ExpoPushTokenManager',
    'ExpoNotifications',
    'ExpoNotificationsModule',
    'Notifications'
  );
