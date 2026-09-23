import React, { useRef, useState } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';

import * as Device from 'expo-device';

import { ACCENT, styles } from '../theme';
import { useFeedback } from '../context/FeedbackContext';
import {
  composeSpokenText,
  ensureSpeechPermissions,
  recognitionAvailable,
  speechLocale,
  startVoiceInput,
  stopVoiceInput,
  useSpeechRecognitionEventSafe,
} from '../services/voice';

function recognitionUnavailableText(t) {
  const raw = t('voiceRecognitionUnavailable');
  if (Device.isDevice) {
    const first = String(raw || '').split('.')[0].trim();
    return first ? `${first}.` : raw;
  }
  return raw;
}

function errorMessage(t, reason, errorCode) {
  switch (errorCode || reason) {
    case 'not-allowed':
    case 'permission':
      return t('voicePermissionDenied');
    case 'no-speech':
    case 'speech-timeout':
    case 'nomatch':
      return t('voiceNoSpeech');
    case 'unavailable':
    case 'service-not-allowed':
    case 'language-not-supported':
    case 'network':
      return recognitionUnavailableText(t);
    default:
      return t('voiceUnavailable');
  }
}

export default function VoiceMicButton({
  lang,
  disabled,
  value,
  onChangeText,
  onTranscript,
}) {
  const { t } = useTranslation();
  const { showToast, showModal } = useFeedback();
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const baseRef = useRef(String(value || ''));

  useSpeechRecognitionEventSafe('start', () => setListening(true));
  useSpeechRecognitionEventSafe('end', () => {
    setListening(false);
    setBusy(false);
  });
  useSpeechRecognitionEventSafe('result', (event) => {
    const text = event?.results?.[0]?.transcript;
    if (!text) return;
    const interim = event?.isFinal === false;
    const next = composeSpokenText(baseRef.current, String(text).trim());
    onChangeText?.(next);
    onTranscript?.(String(text).trim(), interim);
    if (!interim) baseRef.current = next;
  });
  useSpeechRecognitionEventSafe('error', (event) => {
    setListening(false);
    setBusy(false);
    const code = event?.error;
    if (code === 'aborted' || code === 'no-speech' || code === 'speech-timeout') {
      if (code !== 'aborted') showToast(errorMessage(t, code), { type: 'warning' });
      return;
    }
    showToast(errorMessage(t, code), { type: 'error' });
  });

  const handlePress = async () => {
    try {
      if (listening || busy) {
        stopVoiceInput();
        setListening(false);
        setBusy(false);
        return;
      }

      if (!recognitionAvailable()) {
        showToast(recognitionUnavailableText(t), { type: 'warning' });
        return;
      }

      const permission = await ensureSpeechPermissions();
      if (!permission.granted && !permission.fallback) {
        if (permission.needsSettings) {
          const choice = await showModal({
            title: t('voicePermissionTitle'),
            message: t('voicePermissionSettings'),
            confirmLabel: t('openSettings'),
          });
          if (choice === 'confirm') Linking.openSettings().catch(() => {});
          return;
        }
        showToast(t('voicePermissionDenied'), { type: 'warning' });
        return;
      }

      baseRef.current = String(value || '');
      setBusy(true);
      const result = await startVoiceInput(lang || speechLocale('tr'), {
        onTranscript: (text, interim) => {
          const next = composeSpokenText(baseRef.current, text);
          onChangeText?.(next);
          onTranscript?.(text, interim);
          if (!interim) baseRef.current = next;
        },
      });
      if (result.started) {
        setListening(true);
        return;
      }
      setBusy(false);
      if (result.needsSettings) {
        const choice = await showModal({
          title: t('voicePermissionTitle'),
          message: t('voicePermissionSettings'),
          confirmLabel: t('openSettings'),
        });
        if (choice === 'confirm') Linking.openSettings().catch(() => {});
        return;
      }
      showToast(errorMessage(t, result.reason), { type: 'warning' });
    } catch {
      setListening(false);
      setBusy(false);
      showToast(t('voiceUnavailable'), { type: 'error' });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.chatMicBtn, listening && styles.chatMicBtnActive, disabled && { opacity: 0.45 }]}
      onPress={() => {
        handlePress().catch(() => {
          setListening(false);
          setBusy(false);
        });
      }}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled), busy: listening || busy }}
      accessibilityLabel={listening ? t('voiceListening') : t('voiceListen')}
    >
      {busy && !listening ? (
        <ActivityIndicator size="small" color={ACCENT} />
      ) : (
        <Ionicons name={listening ? 'stop' : 'mic'} size={18} color={listening ? '#080C14' : ACCENT} />
      )}
    </TouchableOpacity>
  );
}
