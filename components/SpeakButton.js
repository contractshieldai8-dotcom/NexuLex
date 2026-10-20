import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';

import { ACCENT, ACCENT_ALT, toneText } from '../theme';
import { useFeedback } from '../context/FeedbackContext';
import { isSpeaking, isSpeakableText, speakAnalysisSummary, speechAvailable, stopBriefing } from '../services/voice';

export default function SpeakButton({ text, lang, color }) {
  const { t, i18n } = useTranslation();
  const { showToast } = useFeedback();
  const [speaking, setSpeaking] = useState(false);

  const handlePress = async () => {
    try {
      if (speaking || (await isSpeaking())) {
        await stopBriefing();
        setSpeaking(false);
        return;
      }

      const script = String(text || '').trim();
      if (!isSpeakableText(script)) {
        showToast(t('voiceSpeakEmpty'), { type: 'warning' });
        return;
      }
      if (!speechAvailable()) {
        showToast(t('nativeAudioMissing'), { type: 'error' });
        return;
      }

      setSpeaking(true);
      const fallbackCopy = async () => {
        try {
          await Clipboard.setStringAsync(script);
          showToast(t('voiceSpeakRetry'), { type: 'warning' });
        } catch {
          showToast(t('voiceSpeakError'), { type: 'error' });
        }
      };
      const started = await speakAnalysisSummary(script, lang || i18n.language || 'tr', {
        onDone: () => setSpeaking(false),
        onError: () => {
          setSpeaking(false);
          fallbackCopy().catch(() => showToast(t('voiceSpeakError'), { type: 'error' }));
        },
      });
      if (!started) {
        setSpeaking(false);
        await fallbackCopy();
      }
    } catch {
      setSpeaking(false);
      showToast(t('voiceSpeakError'), { type: 'error' });
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        handlePress().catch(() => {
          setSpeaking(false);
          showToast(t('voiceSpeakError'), { type: 'error' });
        });
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityState={{ busy: speaking }}
      accessibilityLabel={speaking ? t('advisorStopListen') : t('advisorListen')}
      style={{ alignSelf: 'flex-end', marginTop: 8, minWidth: 24, minHeight: 24, alignItems: 'center' }}
    >
      {speaking ? (
        <Ionicons name="stop-circle" size={18} color={toneText(color || ACCENT)} />
      ) : (
        <Ionicons name="volume-high" size={18} color={toneText(color || ACCENT_ALT)} />
      )}
    </TouchableOpacity>
  );
}
