import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ACCENT, DANGER, SUCCESS, WARNING, styles, toneText } from '../theme';
import KeyboardScreen from '../components/KeyboardScreen';
import { supabase } from '../services/supabase';

const MIN_LENGTH = 6;

// Basit güç göstergesi: uzunluk + karakter çeşitliliği.
function scorePassword(value) {
  if (!value) return 0;

  let score = 0;
  if (value.length >= MIN_LENGTH) score += 1;
  if (value.length >= 10) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;

  return score;
}

const STRENGTH = [
  { key: 'passwordStrengthWeak', color: DANGER },
  { key: 'passwordStrengthWeak', color: DANGER },
  { key: 'passwordStrengthMedium', color: WARNING },
  { key: 'passwordStrengthGood', color: SUCCESS },
  { key: 'passwordStrengthStrong', color: ACCENT },
];

// E-postadaki bağlantıdan gelindiğinde açılan, kapatılamaz şifre belirleme ekranı.
export default function ResetPasswordScreen({ visible, theme, email, onDone, onCancel }) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [secure, setSecure] = useState(true);
  const [saving, setSaving] = useState(false);

  const score = useMemo(() => scorePassword(password), [password]);
  const strength = STRENGTH[score];
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = password.length >= MIN_LENGTH && confirm === password && !saving;

  const reset = () => {
    setPassword('');
    setConfirm('');
    setSecure(true);
  };

  const handleSubmit = async () => {
    if (password.length < MIN_LENGTH) {
      Alert.alert(t('warningTitle'), t('minPasswordLength'));
      return;
    }
    if (password !== confirm) {
      Alert.alert(t('warningTitle'), t('passwordsDoNotMatch'));
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      reset();
      Alert.alert(t('successTitle'), t('passwordUpdated'));
      onDone();
    } catch (error) {
      Alert.alert(t('errorTitle'), error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleCancel}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <KeyboardScreen contentContainerStyle={{ padding: 20 }}>
            <View
              style={[
                styles.card,
                { backgroundColor: theme.cardBg, borderColor: theme.accent, alignItems: 'center' },
              ]}
            >
              <Ionicons name="lock-open" size={40} color={theme.accent} />
              <Text style={[styles.scoreValue, { color: theme.accent, fontSize: 20, marginTop: 8 }]}>
                {t('setNewPasswordTitle')}
              </Text>
              <Text style={[styles.summaryText, { color: theme.subText, textAlign: 'center' }]}>
                {t('setNewPasswordSubtitle')}
              </Text>
              {email ? (
                <Text style={[styles.sectionHint, { color: theme.text, marginTop: 8 }]}>{email}</Text>
              ) : null}
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginTop: 16 },
              ]}
            >
              <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 12 }]}>
                {t('newPasswordLabel')}
              </Text>

              <View style={styles.passwordRow}>
                <TextInput accessibilityLabel={t('newPasswordPlaceholder')}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor },
                  ]}
                  placeholder={t('newPasswordPlaceholder')}
                  placeholderTextColor={theme.subText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secure}
                  autoCapitalize="none"
                  autoComplete="new-password"
                />
                <TouchableOpacity accessibilityRole="button"
                  style={styles.passwordToggle}
                  onPress={() => setSecure((prev) => !prev)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={t('togglePasswordVisibility')}
                >
                  <Ionicons
                    name={secure ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={theme.subText}
                  />
                </TouchableOpacity>
              </View>

              {password ? (
                <View style={styles.strengthRow}>
                  <View style={[styles.strengthTrack, { backgroundColor: theme.inputBg }]}>
                    <View
                      style={[
                        styles.strengthFill,
                        { width: `${(score / 4) * 100}%`, backgroundColor: strength.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthLabel, { color: toneText(strength.color) }]}>
                    {t(strength.key)}
                  </Text>
                </View>
              ) : null}

              <TextInput accessibilityLabel={t('confirmPasswordPlaceholder')}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    color: theme.text,
                    borderColor: mismatch ? theme.danger || DANGER : theme.borderColor,
                    marginTop: 12,
                    marginBottom: 14,
                  },
                ]}
                placeholder={t('confirmPasswordPlaceholder')}
                placeholderTextColor={theme.subText}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={secure}
                autoCapitalize="none"
              />

              {mismatch ? (
                <Text style={[styles.sectionHint, { color: theme.danger || DANGER, marginTop: 0 }]}>
                  {t('passwordsDoNotMatch')}
                </Text>
              ) : null}

              <TouchableOpacity accessibilityRole="button"
                style={[styles.primaryButton, !canSubmit && { opacity: 0.5 }]}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                {saving ? (
                  <ActivityIndicator color="#080C14" />
                ) : (
                  <Text
                    style={styles.primaryButtonText}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                  >
                    {t('btnUpdatePassword')}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity accessibilityRole="button" style={styles.secondaryBtn} onPress={handleCancel} disabled={saving}>
                <Text style={styles.secondaryBtnText}>{t('cancelReset')}</Text>
              </TouchableOpacity>
            </View>
        </KeyboardScreen>
      </SafeAreaView>
    </Modal>
  );
}
