import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ACCENT, styles } from '../theme';
import KeyboardScreen from '../components/KeyboardScreen';
import { submitSupportMessage } from '../services/support';

// Destek ve Hata Bildirimi: karşılama mesajı + Supabase'e kayıt + e-posta iletimi.
export default function SupportScreen({ theme, onClose }) {
  const { t, i18n } = useTranslation();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = useCallback(async () => {
    if (!message.trim()) {
      Alert.alert(t('warningTitle'), t('supportEmptyMessage'));
      return;
    }

    setSending(true);

    try {
      await submitSupportMessage({ subject, message, locale: i18n.language });
      setSent(true);
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Destek bildirimi hatası:', error);
      Alert.alert(t('errorTitle'), t('supportError'));
    } finally {
      setSending(false);
    }
  }, [i18n.language, message, subject, t]);

  return (
    <KeyboardScreen contentContainerStyle={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Text style={[styles.sectionHeader, { color: theme.text, flex: 1, marginBottom: 0 }]}>
            {t('supportTitle')}
          </Text>

          {onClose ? (
            <TouchableOpacity accessibilityRole="button"
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={t('closeButton')}
            >
              <Ionicons name="close" size={22} color={theme.subText} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Otomatik karşılama balonu */}
        <View
          style={[
            styles.bubbleAssistant,
            {
              alignSelf: 'stretch',
              maxWidth: '100%',
              backgroundColor: theme.cardBg,
              borderColor: theme.borderColor,
              marginBottom: 16,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={theme.accent} />
            <Text style={[styles.bubbleMeta, { color: theme.accent, marginBottom: 0 }]}>NEXULEX AI</Text>
          </View>

          <Text style={[styles.bubbleText, { color: theme.text }]}>{t('supportGreeting')}</Text>
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6, marginBottom: 0 }]}>
            {t('supportIntro')}
          </Text>
        </View>

        {sent ? (
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.accent,
                alignItems: 'center',
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={40} color={theme.accent} />
            <Text
              style={[styles.settingLabel, { color: theme.text, marginTop: 10, textAlign: 'center' }]}
            >
              {t('supportThanks')}
            </Text>
            <Text
              style={[
                styles.sectionHint,
                { color: theme.subText, marginTop: 8, marginBottom: 0, textAlign: 'center' },
              ]}
            >
              {t('supportThanksDetail')}
            </Text>

            <TouchableOpacity accessibilityRole="button"
              style={[styles.secondaryBtn, { alignSelf: 'stretch' }]}
              onPress={() => setSent(false)}
            >
              <Text style={styles.secondaryBtnText}>{t('supportNewMessage')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TextInput accessibilityLabel={t('supportSubjectPlaceholder')}
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.borderColor,
                  marginBottom: 12,
                },
              ]}
              placeholder={t('supportSubjectPlaceholder')}
              placeholderTextColor={theme.subText}
              value={subject}
              onChangeText={setSubject}
              editable={!sending}
            />

            <TextInput accessibilityLabel={t('supportMessagePlaceholder')}
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.borderColor,
                },
              ]}
              placeholder={t('supportMessagePlaceholder')}
              placeholderTextColor={theme.subText}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              editable={!sending}
            />

            <TouchableOpacity accessibilityRole="button"
              style={[styles.primaryButton, sending && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color="#080C14" />
              ) : (
                <Text
                  style={styles.primaryButtonText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {t('supportSend')}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
    </KeyboardScreen>
  );
}
