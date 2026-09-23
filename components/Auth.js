import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { alignStart } from '../theme';
import { QUOTA_ERRORS, syncProfileAndQuota } from '../services/quota';
import SearchableSheet from './SearchableSheet';
import { APP_LANGUAGES, getLanguage } from '../constants/options';
import {
  COUNTRY_CODES,
  getCountryByIso,
  getDefaultCountryForLanguage,
  isValidLocalNumber,
  toE164,
} from '../constants/countries';
import { setAppLanguage } from '../utils/language';
import { createAuthRedirectUrl } from '../utils/authRedirects';

// GiriÅŸ ekranÄ±, uygulamanÄ±n koyu paletiyle uyumlu yalÄ±n bir tema kullanÄ±r.
const AUTH_THEME = {
  cardBg: '#121824',
  inputBg: '#0B0F19',
  borderColor: '#1E2638',
  text: '#E8EDF5',
  subText: '#A0AEC0',
};

export default function Auth({ onLoginSuccess }) {
  const { t, i18n } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [langSheetVisible, setLangSheetVisible] = useState(false);
  const [countrySheetVisible, setCountrySheetVisible] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const activeLang = (i18n.language || 'tr').split('-')[0];
  const [country, setCountry] = useState(() => getDefaultCountryForLanguage(activeLang));

  // KullanÄ±cÄ± dili deÄŸiÅŸtirdiÄŸinde Ã¼lke kodu da makul varsayÄ±lana taÅŸÄ±nÄ±r.
  useEffect(() => {
    setCountry(getDefaultCountryForLanguage(activeLang));
  }, [activeLang]);

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

  // AynÄ± arama kodunu paylaÅŸan Ã¼lkeler iÃ§in (Ã¶r. +1) anahtar benzersizleÅŸtirilir.
  const countryOptions = useMemo(
    () =>
      (COUNTRY_CODES || []).map((item) => ({
        code: item.iso,
        label: item.name,
        hint: item.dial,
        flag: item.flag,
        keywords: [item.dial, item.dial.replace('+', ''), item.iso],
      })),
    []
  );

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert(t('errorTitle'), t('authFillFields'));
      return;
    }

    // KayÄ±tta telefon zorunlu: Ã¼cretsiz haklarÄ±n kÃ¶tÃ¼ye kullanÄ±mÄ±nÄ± engeller.
    if (isSignUp) {
      if (!phone.trim()) {
        Alert.alert(t('warningTitle'), t('phoneRequired'));
        return;
      }
      if (!isValidLocalNumber(country, phone)) {
        Alert.alert(t('warningTitle'), t('phoneInvalid'));
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Numara her zaman E.164 (+<Ã¼lke kodu><numara>) olarak saklanÄ±r.
        const normalizedPhone = toE164(country, phone);

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // SMS OTP yerine e-posta doÄŸrulama baÄŸlantÄ±sÄ± kullanÄ±lÄ±r.
            emailRedirectTo: createAuthRedirectUrl(),
            data: { phone_number: normalizedPhone },
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
            await syncProfileAndQuota({ phone: normalizedPhone });
          } catch (quotaError) {
            if (quotaError.code === QUOTA_ERRORS.PHONE_TAKEN) {
              Alert.alert(t('warningTitle'), t('phoneAlreadyUsed'));
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
      Alert.alert(t('errorTitle'), error.message);
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
      Alert.alert(t('errorTitle'), error.message);
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
          if (isSignUp && phone.trim()) {
            await syncProfileAndQuota({ phone: toE164(country, phone) });
          }
        } catch (quotaError) {
          if (quotaError.code === QUOTA_ERRORS.PHONE_TAKEN) {
            Alert.alert(t('warningTitle'), t('phoneAlreadyUsed'));
          } else if (quotaError.code === 'CLOCK_SKEW') {
            Alert.alert(t('warningTitle'), t('clockSkewHint'));
          }
        }
        onLoginSuccess(data.user);
      }
    } catch (error) {
      Alert.alert(t('errorTitle'), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.langChip}
        onPress={() => setLangSheetVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.langChipFlag}>{getLanguage(activeLang).flag}</Text>
        <Text style={styles.langChipText}>{getLanguage(activeLang).label}</Text>
        <Ionicons name="chevron-down" size={14} color="#00F5D4" />
      </TouchableOpacity>

      <Text style={styles.title}>
        {pendingVerification ? t('verifyEmailTitle') : isSignUp ? t('signUpTitle') : t('signInTitle')}
      </Text>

      <TextInput
        style={styles.input}
        placeholder={t('emailPlaceholder')}
        placeholderTextColor="#A0AEC0"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder={t('passwordPlaceholder')}
        placeholderTextColor="#A0AEC0"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {isSignUp && !pendingVerification && (
        <View style={styles.phoneRow}>
          <TouchableOpacity
            style={styles.phoneCountryBtn}
            onPress={() => setCountrySheetVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.phoneFlag}>{country.flag}</Text>
            <Text style={styles.phoneDial}>{country.dial}</Text>
            <Ionicons name="chevron-down" size={13} color="#A0AEC0" />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, styles.phoneInput]}
            placeholder={t('phonePlaceholder')}
            placeholderTextColor="#A0AEC0"
            value={phone}
            // YalnÄ±zca rakam ve ayÄ±rÄ±cÄ±lar; Ã¼lke kodu ayrÄ± alandan gelir.
            onChangeText={(value) => setPhone(value.replace(/[^\d\s-]/g, ''))}
            keyboardType="phone-pad"
            maxLength={country.max + 4}
            autoCapitalize="none"
          />
        </View>
      )}

      {pendingVerification ? (
        <>
          <Text style={styles.verifyHint}>{t('verifyEmailMessage')}</Text>
          <TouchableOpacity style={styles.button} onPress={handleResendVerification} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#080C14" />
            ) : (
              <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                {t('resendVerification')}
              </Text>
            )}
          </TouchableOpacity>
          {__DEV__ && (
            <>
              <TouchableOpacity
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
          <TouchableOpacity
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
          <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#080C14" />
            ) : (
              <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                {isSignUp ? t('signUpButton') : t('signInButton')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
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
        theme={AUTH_THEME}
        title={t('languageSelectorTitle')}
        searchPlaceholder={t('languageSearchPlaceholder')}
        emptyLabel={t('languageNoResult')}
        closeLabel={t('closeButton')}
        options={languageOptions}
        selectedCode={activeLang}
        onSelect={setAppLanguage}
        onClose={() => setLangSheetVisible(false)}
      />

      <SearchableSheet
        visible={countrySheetVisible}
        theme={AUTH_THEME}
        title={t('countryCodeTitle')}
        searchPlaceholder={t('countryCodeSearchPlaceholder')}
        emptyLabel={t('languageNoResult')}
        closeLabel={t('closeButton')}
        options={countryOptions}
        selectedCode={country.iso}
        onSelect={(iso) => setCountry(getCountryByIso(iso))}
        onClose={() => setCountrySheetVisible(false)}
      />
    </View>
  );
}

const FONTS = Platform.select({
  ios: { regular: 'System', medium: 'System', bold: 'System' },
  android: { regular: 'sans-serif', medium: 'sans-serif-medium', bold: 'sans-serif-medium' },
  default: { regular: 'System', medium: 'System', bold: 'System' },
});

const styles = StyleSheet.create({
  card: { backgroundColor: '#121824', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#1E2638' },
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
    borderColor: '#1E2638',
    backgroundColor: '#0B0F19',
  },
  langChipFlag: { fontSize: 16 },
  langChipText: { color: '#00F5D4', fontFamily: FONTS.medium, fontSize: 13, fontWeight: '600' },
  phoneRow: { flexDirection: 'row', alignItems: 'stretch', gap: 8 },
  phoneCountryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2638',
    backgroundColor: '#0B0F19',
    marginBottom: 12,
  },
  phoneFlag: { fontSize: 18 },
  phoneDial: { color: '#E8EDF5', fontFamily: FONTS.medium, fontSize: 14, fontWeight: '600' },
  phoneInput: { flex: 1 },
  title: { fontFamily: FONTS.bold, fontSize: 20, fontWeight: '800', letterSpacing: 0.4, color: '#FFFFFF', marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#0B0F19', color: '#FFFFFF', fontFamily: FONTS.regular, fontSize: 14, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1E2638', marginBottom: 12, textAlign: alignStart },
  button: { backgroundColor: '#00F5D4', paddingVertical: 16, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 54, marginTop: 8 },
  buttonText: { color: '#080C14', fontFamily: FONTS.bold, fontWeight: '800', fontSize: 16, letterSpacing: 0.3, textAlign: 'center' },
  switchText: { color: '#A0AEC0', fontFamily: FONTS.regular, textAlign: 'center', fontSize: 13, lineHeight: 18 },
  verifyHint: { color: '#A0AEC0', fontFamily: FONTS.regular, textAlign: 'center', fontSize: 13, lineHeight: 19, marginBottom: 8 },
  devSkipButton: {
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFB800',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  devSkipText: { color: '#FFB800', fontFamily: FONTS.bold, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  devSkipHint: { color: '#6B7280', fontFamily: FONTS.regular, textAlign: 'center', fontSize: 11, lineHeight: 16, marginTop: 8 },
});
