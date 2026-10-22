import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { darkTheme, alignStart } from '../theme';
import { syncProfileAndQuota } from '../services/quota';
import SearchableSheet from './SearchableSheet';
import { APP_LANGUAGES, getLanguage } from '../constants/options';
import { TRUST_URLS } from '../constants/settingsTrust';
import { setAppLanguage } from '../utils/language';
import { createAuthRedirectUrl } from '../utils/authRedirects';
import { authErrorMessage } from '../utils/authErrors';

// Bump when the Terms of Use or Privacy Policy change in a way that needs fresh consent.
const LEGAL_VERSION = '2026-10';

// Sign-in screen follows the app appearance. Sign-up asks only for email + password:
// no phone number is collected (data minimisation); free-quota abuse is handled server-side
// with the device id and the verified email.
export default function Auth({ onLoginSuccess, theme = darkTheme }) {
  const { t, i18n } = useTranslation();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  // Keyboards and password managers often append a space; a padded address is rejected by the server.
  const email = emailInput.trim();
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [langSheetVisible, setLangSheetVisible] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const activeLang = (i18n.language || 'tr').split('-')[0];

  const languageOptions = useMemo(
    () =>
      (APP_LANGUAGES || []).map((item) => ({
        code: item.code,
        label: item.label,
        hint: item.english,
        flag: item.flag,
        keywords: [item.short],
      })),
    []
  );

  const openLegal = (url, fallback) => {
    Linking.openURL(url || fallback).catch(() => Alert.alert(t('errorTitle'), t('askLinkFailed')));
  };

  // "18+ and accept Terms and Privacy" sentence with tappable links; the sentence order is per language.
  const agreementParts = useMemo(() => {
    const text = t('sgAgree', { terms: '\u0001T\u0001', privacy: '\u0001P\u0001', interpolation: { escapeValue: false } });
    return String(text).split(/(\u0001[TP]\u0001)/);
  }, [t, activeLang]);

  const passwordRef = useRef(null);

  const handleAuth = async () => {
    if (loading) return;
    if (!email || !password) {
      Alert.alert(t('errorTitle'), t('authFillFields'));
      return;
    }

    if (isSignUp && !agreed) {
      Alert.alert(t('warningTitle'), t('sgAgreeRequired'));
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Email verification link (no SMS OTP).
            emailRedirectTo: createAuthRedirectUrl(),
            // Evidence of the 18+ declaration and which legal texts were accepted.
            data: {
              age_18_confirmed: true,
              legal_accepted_at: new Date().toISOString(),
              legal_version: LEGAL_VERSION,
            },
          },
        });
        if (error) throw error;

        let session = data.session;
        let sessionUser = data.session?.user || null;

        if (!session && __DEV__) {
          const signedIn = await supabase.auth.signInWithPassword({ email, password });
          if (!signedIn.error && signedIn.data?.session) {
            session = signedIn.data.session;
            sessionUser = signedIn.data.user;
          }
        }

        if (session && sessionUser) {
          try {
            await syncProfileAndQuota();
          } catch (quotaError) {
            if (quotaError.code === 'CLOCK_SKEW') {
              Alert.alert(t('warningTitle'), t('clockSkewHint'));
            }
          }
          onLoginSuccess(sessionUser);
          return;
        }

        setPendingVerification(true);
        Alert.alert(t('verifyEmailTitle'), t('verifyEmailMessage'));
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) onLoginSuccess(data.user);
      }
    } catch (error) {
      Alert.alert(t('errorTitle'), authErrorMessage(error, t));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: createAuthRedirectUrl() },
      });
      if (error) throw error;
      Alert.alert(t('successTitle'), t('verificationResent'));
    } catch (error) {
      Alert.alert(t('errorTitle'), authErrorMessage(error, t));
    } finally {
      setLoading(false);
    }
  };

  const handleSkipVerificationDev = async () => {
    if (!email || !password) {
      Alert.alert(t('errorTitle'), t('authFillFields'));
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        try {
          if (isSignUp) await syncProfileAndQuota();
        } catch (quotaError) {
          if (quotaError.code === 'CLOCK_SKEW') {
            Alert.alert(t('warningTitle'), t('clockSkewHint'));
          }
        }
        onLoginSuccess(data.user);
      }
    } catch (error) {
      Alert.alert(t('errorTitle'), authErrorMessage(error, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity accessibilityRole="button"
        style={styles.langChip}
        onPress={() => setLangSheetVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.langChipFlag}>{getLanguage(activeLang).flag}</Text>
        <Text style={styles.langChipText}>{getLanguage(activeLang).label}</Text>
        <Ionicons name="chevron-down" size={14} color={theme.accent} />
      </TouchableOpacity>

      <Text style={styles.title}>
        {pendingVerification ? t('verifyEmailTitle') : isSignUp ? t('signUpTitle') : t('signInTitle')}
      </Text>

      <TextInput accessibilityLabel={t('emailPlaceholder')}
        style={styles.input}
        placeholder={t('emailPlaceholder')}
        placeholderTextColor={theme.subText}
        value={emailInput}
        onChangeText={setEmailInput}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        returnKeyType="next"
        blurOnSubmit={false}
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <TextInput accessibilityLabel={t('passwordPlaceholder')}
        ref={passwordRef}
        style={styles.input}
        placeholder={t('passwordPlaceholder')}
        placeholderTextColor={theme.subText}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        textContentType={isSignUp ? 'newPassword' : 'password'}
        autoComplete={isSignUp ? 'new-password' : 'current-password'}
        returnKeyType={isSignUp ? 'done' : 'go'}
        onSubmitEditing={isSignUp ? undefined : handleAuth}
        value={password}
        onChangeText={setPassword}
      />

      {isSignUp && !pendingVerification && (
        <>
          <View style={styles.agreeRow}>
            <TouchableOpacity
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreed }}
              accessibilityLabel={String(t('sgAgree', { terms: t('sgTermsLink'), privacy: t('sgPrivacyLink') }))}
              onPress={() => setAgreed((value) => !value)}
              activeOpacity={0.8}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name={agreed ? 'checkbox' : 'square-outline'}
                size={24}
                color={agreed ? theme.accent : theme.subText}
              />
            </TouchableOpacity>
            <Text style={styles.agreeText}>
              {agreementParts.map((part, index) => {
                if (part === '\u0001T\u0001') {
                  return (
                    <Text
                      key={`p${index}`}
                      accessibilityRole="link"
                      style={styles.agreeLink}
                      onPress={() => openLegal(TRUST_URLS.terms, 'https://nexulexai.netlify.app/terms.html')}
                    >
                      {t('sgTermsLink')}
                    </Text>
                  );
                }
                if (part === '\u0001P\u0001') {
                  return (
                    <Text
                      key={`p${index}`}
                      accessibilityRole="link"
                      style={styles.agreeLink}
                      onPress={() => openLegal(TRUST_URLS.privacy, 'https://nexulexai.netlify.app/privacy.html')}
                    >
                      {t('sgPrivacyLink')}
                    </Text>
                  );
                }
                return <Text key={`p${index}`}>{part}</Text>;
              })}
            </Text>
          </View>
          <Text style={styles.noPhoneHint}>{t('sgNoPhone')}</Text>
        </>
      )}

      {pendingVerification ? (
        <>
          <Text style={styles.verifyHint}>{t('verifyEmailMessage')}</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={handleResendVerification} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={theme.onAccent} />
            ) : (
              <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                {t('resendVerification')}
              </Text>
            )}
          </TouchableOpacity>
          {__DEV__ && (
            <>
              <TouchableOpacity accessibilityRole="button"
                style={styles.devSkipButton}
                onPress={handleSkipVerificationDev}
                disabled={loading}
              >
                <Text style={styles.devSkipText} numberOfLines={2}>
                  {t('skipVerificationDev')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.devSkipHint}>{t('skipVerificationDevHint')}</Text>
            </>
          )}
          <TouchableOpacity accessibilityRole="button"
            onPress={() => {
              setPendingVerification(false);
              setIsSignUp(false);
            }}
            style={{ marginTop: 15 }}
          >
            <Text style={styles.switchText}>{t('hasAccountText')}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled: loading || (isSignUp && !agreed) }}
            style={[styles.button, isSignUp && !agreed && styles.buttonDim]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.onAccent} />
            ) : (
              <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                {isSignUp ? t('signUpButton') : t('signInButton')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity accessibilityRole="button"
            onPress={() => {
              setPendingVerification(false);
              setIsSignUp(!isSignUp);
            }}
            style={{ marginTop: 15 }}
          >
            <Text style={styles.switchText} numberOfLines={2}>
              {isSignUp ? t('hasAccountText') : t('noAccountText')}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <SearchableSheet
        visible={langSheetVisible}
        theme={theme}
        title={t('languageSelectorTitle')}
        searchPlaceholder={t('languageSearchPlaceholder')}
        emptyLabel={t('languageNoResult')}
        closeLabel={t('closeButton')}
        options={languageOptions}
        selectedCode={activeLang}
        onSelect={setAppLanguage}
        onClose={() => setLangSheetVisible(false)}
      />
    </View>
  );
}

const FONTS = Platform.select({
  ios: { regular: 'System', medium: 'System', bold: 'System' },
  android: { regular: 'sans-serif', medium: 'sans-serif-medium', bold: 'sans-serif-medium' },
  default: { regular: 'System', medium: 'System', bold: 'System' },
});

const makeStyles = (theme) =>
  StyleSheet.create({
    card: { backgroundColor: theme.cardBg, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: theme.borderColor },
    langChip: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end',
      gap: 6,
      marginBottom: 15,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.borderColor,
      backgroundColor: theme.inputBg,
    },
    langChipFlag: { fontSize: 16 },
    langChipText: { color: theme.accent, fontFamily: FONTS.medium, fontSize: 13, fontWeight: '600' },
    title: { fontFamily: FONTS.bold, fontSize: 20, fontWeight: '800', letterSpacing: 0.4, color: theme.text, marginBottom: 16, textAlign: 'center' },
    input: { backgroundColor: theme.inputBg, color: theme.text, fontFamily: FONTS.regular, fontSize: 14, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: theme.borderColor, marginBottom: 12, textAlign: alignStart },
    agreeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 2, marginBottom: 8 },
    agreeText: { flex: 1, color: theme.text, fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19, textAlign: alignStart },
    agreeLink: { color: theme.accent, fontFamily: FONTS.medium, fontWeight: '700', textDecorationLine: 'underline' },
    noPhoneHint: { color: theme.subText, fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17, textAlign: alignStart },
    button: { backgroundColor: theme.accent, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 54, marginTop: 8 },
    buttonDim: { opacity: 0.55 },
    buttonText: { color: theme.onAccent, fontFamily: FONTS.bold, fontWeight: '800', fontSize: 16, letterSpacing: 0.3, textAlign: 'center' },
    switchText: { color: theme.subText, fontFamily: FONTS.regular, textAlign: 'center', fontSize: 13, lineHeight: 18 },
    verifyHint: { color: theme.subText, fontFamily: FONTS.regular, textAlign: 'center', fontSize: 13, lineHeight: 19, marginBottom: 8 },
    devSkipButton: {
      marginTop: 10,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.warning,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    devSkipText: { color: theme.warning, fontFamily: FONTS.bold, fontWeight: '700', fontSize: 13, textAlign: 'center' },
    devSkipHint: { color: theme.subText, fontFamily: FONTS.regular, textAlign: 'center', fontSize: 11, lineHeight: 16, marginTop: 8 },
  });
