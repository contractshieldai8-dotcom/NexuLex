import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ACCENT, styles } from '../theme';
import {
  configurePurchases,
  fetchOfferings,
  isPurchasesAvailable,
  isUserCancelled,
  purchasePackage,
  restorePurchases,
} from '../services/purchases';

const FEATURE_KEYS = [
  'paywallFeature1',
  'paywallFeature2',
  'paywallFeature3',
  'paywallFeature4',
  'paywallFeature5',
  'paywallFeature6',
  'paywallFeature7',
];

const HOOK_COPY = new Set(['escape', 'validity', 'costs', 'negotiate', 'missing', 'ladder', 'lawClash']);
const PRIVACY_URL = 'https://nexulexai.netlify.app/privacy.html';
const TERMS_URL = 'https://nexulexai.netlify.app/terms.html';

const hookCopyKey = (hook, part) =>
  `hook${String(hook)[0].toUpperCase()}${String(hook).slice(1)}${part}`;

// Yıllık paketler genelde en avantajlısıdır; rozet için işaretlenir.
const isAnnual = (pkg) => /ANNUAL|YEARLY/i.test(pkg.packageType || '');

// Ücretsiz hak bittiğinde açılan abonelik ekranı.
export default function PaywallScreen({
  visible,
  theme,
  userId,
  hook,
  context = null,
  exhausted = false,
  onClose,
  onPurchased,
}) {
  const { t } = useTranslation();
  const [packages, setPackages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [busy, setBusy] = useState(false);

  const available = isPurchasesAvailable();

  const heroTitle = () => {
    if (hook === 'share') return t('sharePaywallTitle');
    if (hook === 'quota' || (exhausted && !hook)) return t('quotaExhaustedTitle');
    if (HOOK_COPY.has(hook)) return t(hookCopyKey(hook, 'Title'));
    return t('paywallTitle');
  };

  const heroBody = () => {
    let body = '';
    if (hook === 'share') body = t('sharePaywallBody');
    else if (hook === 'quota' || (exhausted && !hook)) {
      body = exhausted ? t('quotaExhaustedMessage') : t('paywallSubtitle');
    } else if (HOOK_COPY.has(hook)) body = t(hookCopyKey(hook, 'Body'));
    else body = t('paywallSubtitle');

    const partyLabel = String(context?.partyLabel || '').trim();
    if (!partyLabel) return body;
    const harm = String(context?.estimatedHarm || '').trim();
    const extra = t('paywallPartyContext', {
      party: partyLabel,
      harm: harm || t('paywallPartyContextGeneric'),
    });
    return `${body}\n\n${extra}`;
  };

  const loadPlans = useCallback(async () => {
    if (!available) return;

    setLoadingPlans(true);
    try {
      await configurePurchases(userId);
      const offerings = await fetchOfferings();
      setPackages(offerings);
      // Varsayılan olarak en avantajlı paket seçili gelir.
      setSelectedId((offerings.find(isAnnual) || offerings[0])?.identifier ?? null);
    } catch (error) {
      console.warn('Abonelik paketleri alınamadı:', error.message);
      setPackages([]);
    } finally {
      setLoadingPlans(false);
    }
  }, [available, userId]);

  useEffect(() => {
    if (visible) loadPlans();
  }, [visible, loadPlans]);

  const finishAsPro = async () => {
    Alert.alert(t('paywallTitle'), t('paywallPurchaseSuccess'));
    await onPurchased?.();
    onClose();
  };

  const handlePurchase = async () => {
    const selected = packages.find((pkg) => pkg.identifier === selectedId);
    if (!selected) return;

    setBusy(true);
    try {
      if (await purchasePackage(selected)) finishAsPro();
      else Alert.alert(t('paywallTitle'), t('paywallPurchaseFailed'));
    } catch (error) {
      // Kullanıcı vazgeçtiyse hata gösterilmez.
      if (!isUserCancelled(error)) {
        console.warn('Satın alma hatası:', error.message);
        Alert.alert(t('errorTitle'), t('paywallPurchaseFailed'));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    try {
      if (await restorePurchases()) finishAsPro();
      else Alert.alert(t('paywallTitle'), t('paywallNoPurchases'));
    } catch (error) {
      console.warn('Geri yükleme hatası:', error.message);
      Alert.alert(t('errorTitle'), t('paywallPurchaseFailed'));
    } finally {
      setBusy(false);
    }
  };

  const canPurchase = available && !loadingPlans && packages.length > 0 && !!selectedId;

  const renderPlan = (pkg) => {
    const active = pkg.identifier === selectedId;

    return (
      <TouchableOpacity
        key={pkg.identifier}
        activeOpacity={0.85}
        onPress={() => setSelectedId(pkg.identifier)}
        style={[
          styles.planCard,
          {
            backgroundColor: active ? 'rgba(0, 245, 212, 0.08)' : theme.inputBg,
            borderColor: active ? ACCENT : theme.borderColor,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.planTitle, { color: theme.text }]} numberOfLines={1}>
            {pkg.title}
          </Text>
          {isAnnual(pkg) ? (
            <Text style={[styles.planBadge, { color: ACCENT }]}>{t('paywallBestValue')}</Text>
          ) : null}
        </View>

        <Text style={[styles.planPrice, { color: active ? ACCENT : theme.text }]}>
          {pkg.priceString}
        </Text>

        <Ionicons
          name={active ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={active ? ACCENT : theme.subText}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 10,
          }}
        >
          <Text style={[styles.sectionHeader, { color: theme.text, flex: 1, marginBottom: 0 }]}>
            {t('paywallTitle')}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={t('closeButton')}
          >
            <Ionicons name="close" size={24} color={theme.subText} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.cardBg, borderColor: ACCENT, alignItems: 'center' },
            ]}
          >
            <Ionicons name="shield-checkmark" size={44} color={ACCENT} />
            <Text style={[styles.scoreValue, { color: ACCENT, fontSize: 22, marginTop: 8 }]}>
              {heroTitle()}
            </Text>
            <Text style={[styles.summaryText, { color: theme.subText }]}>
              {heroBody()}
            </Text>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginTop: 16 },
            ]}
          >
            <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 14 }]}>
              {t('lockedTitle')}
            </Text>

            {(FEATURE_KEYS || []).map((key) => (
              <View key={key} style={styles.paywallFeatureRow}>
                <Ionicons name="checkmark-circle" size={17} color={ACCENT} />
                <Text style={[styles.paywallFeatureText, { color: theme.text }]}>{t(key)}</Text>
              </View>
            ))}

            <View style={{ marginBottom: 16 }} />

            {loadingPlans ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator color={ACCENT} />
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 10 }]}>
                  {t('paywallLoadingPlans')}
                </Text>
              </View>
            ) : (
              (packages || []).map(renderPlan)
            )}

            {/* Native satın alma modülü yoksa (ör. Expo Go) kullanıcı bilgilendirilir. */}
            {!available || (!loadingPlans && packages.length === 0) ? (
              <Text
                style={[
                  styles.sectionHint,
                  { color: theme.subText, textAlign: 'center', marginVertical: 12 },
                ]}
              >
                {t('paywallUnavailable')}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryButton, (!canPurchase || busy) && { opacity: 0.5 }]}
              onPress={handlePurchase}
              disabled={!canPurchase || busy}
            >
              {busy ? (
                <ActivityIndicator color="#080C14" />
              ) : (
                <Text
                  style={styles.primaryButtonText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {t('paywallCta')}
                </Text>
              )}
            </TouchableOpacity>

            {available ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleRestore} disabled={busy}>
                <Text style={styles.secondaryBtnText}>{t('paywallRestore')}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
              <Text style={styles.secondaryBtnText}>{t('paywallLater')}</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 16, alignItems: 'center', gap: 8 }}>
              <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)} activeOpacity={0.85}>
                <Text style={[styles.sectionHint, { color: ACCENT, marginBottom: 0 }]}>
                  {t('privacyPolicy')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)} activeOpacity={0.85}>
                <Text style={[styles.sectionHint, { color: ACCENT, marginBottom: 0 }]}>
                  {t('termsOfUse')}
                </Text>
              </TouchableOpacity>
              <Text
                style={[
                  styles.sectionHint,
                  { color: theme.subText, textAlign: 'center', marginTop: 4, marginBottom: 0 },
                ]}
              >
                {t('disclaimerCounsel')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
