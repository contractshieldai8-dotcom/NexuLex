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
import { useFeedback } from '../context/FeedbackContext';
import HonestyFold from '../components/HonestyFold';
import { track } from '../services/telemetry';
import { footKeyForHook } from '../constants/paywallIntent';
import { isAnnualPackage, isMonthlyPackage, pickAnnualCompare } from '../constants/annualHighlight';
import { pickProfessionalCompare } from '../constants/professionalCompare';
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

const PROFESSIONAL_FEATURE_KEYS = [
  'planProfessionalFeature1',
  'planProfessionalFeature2',
  'planProfessionalFeature3',
  'planProfessionalFeature4',
  'planProfessionalFeature5',
  'planProfessionalFeature6',
  'planProfessionalFeature7',
];
const TIERS = ['pro', 'professional'];

const HOOK_COPY = new Set(['escape', 'validity', 'costs', 'negotiate', 'missing', 'ladder', 'lawClash', 'explain', 'cases', 'ask', 'professional', 'lawyer']);
const PRIVACY_URL = 'https://nexulexai.netlify.app/privacy.html';
const TERMS_URL = 'https://nexulexai.netlify.app/terms.html';

const hookCopyKey = (hook, part) =>
  `hook${String(hook)[0].toUpperCase()}${String(hook).slice(1)}${part}`;

// Ücretsiz hak bittiğinde açılan abonelik ekranı.
export default function PaywallScreen({
  visible,
  theme,
  userId,
  hook,
  context = null,
  exhausted = false,
  plan = 'free',
  onClose,
  onPurchased,
}) {
  const { t } = useTranslation();
  const { showToast } = useFeedback();
  const openLegal = (url) => {
    Linking.openURL(url).catch(() => showToast(t('askLinkFailed'), { type: 'error' }));
  };
  const [tier, setTier] = useState('pro');
  const [packages, setPackages] = useState([]);
  const [peerPackages, setPeerPackages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [busy, setBusy] = useState(false);

  const available = isPurchasesAvailable();
  // Professional includes everything in Pro, so a Professional subscriber owns both tiers.
  const owned = plan === tier || plan === 'professional';

  useEffect(() => {
    if (visible) setTier(hook === 'professional' || plan === 'pro' ? 'professional' : 'pro');
  }, [visible, hook, plan]);

  const copyHook = tier === 'professional' ? 'professional' : hook;

  const heroTitle = () => {
    if (copyHook === 'share') return t('sharePaywallTitle');
    if (copyHook === 'quota' || (exhausted && !copyHook)) return t('quotaExhaustedTitle');
    if (HOOK_COPY.has(copyHook)) return t(hookCopyKey(copyHook, 'Title'));
    return t('paywallTitle');
  };

  const heroBody = () => {
    let body = '';
    if (copyHook === 'share') body = t('sharePaywallBody');
    else if (copyHook === 'quota' || (exhausted && !copyHook)) {
      body = exhausted ? t('quotaExhaustedMessage') : t('paywallSubtitle');
    } else if (HOOK_COPY.has(copyHook)) body = t(hookCopyKey(copyHook, 'Body'));
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
    setPackages([]);
    setPeerPackages([]);
    setSelectedId(null);
    try {
      await configurePurchases(userId);
      const [offerings, peer] = await Promise.all([
        fetchOfferings(tier),
        fetchOfferings(tier === 'professional' ? 'pro' : 'professional'),
      ]);
      setPackages(offerings);
      setPeerPackages(peer);
      // Varsayılan olarak en avantajlı paket seçili gelir.
      setSelectedId((offerings.find(isAnnualPackage) || offerings[0])?.identifier ?? null);
    } catch (error) {
      console.warn('Abonelik paketleri alınamadı:', error.message);
      setPackages([]);
      setPeerPackages([]);
    } finally {
      setLoadingPlans(false);
    }
  }, [available, userId, tier]);

  useEffect(() => {
    if (visible) loadPlans();
  }, [visible, loadPlans]);

  // synced=false: the store confirmed the purchase but the server could not confirm it yet.
  const finishAsPro = async ({ synced = true } = {}) => {
    Alert.alert(t('paywallTitle'), synced ? t('paywallPurchaseSuccess') : t('planSyncPending'));
    await onPurchased?.();
    onClose();
  };

  const handlePurchase = async () => {
    const selected = packages.find((pkg) => pkg.identifier === selectedId);
    if (!selected) return;

    setBusy(true);
    try {
      track('purchase_start', { tier, hook: hook || 'general' });
      const outcome = await purchasePackage(selected, { tier });
      if (outcome.plan !== 'free') {
        track('purchase_ok', { tier, plan: outcome.plan, hook: hook || 'general' });
        finishAsPro(outcome);
      } else {
        track('purchase_fail', { tier, code: 'NO_ENTITLEMENT' });
        Alert.alert(t('paywallTitle'), t('paywallPurchaseFailed'));
      }
    } catch (error) {
      // Kullanıcı vazgeçtiyse hata gösterilmez.
      if (isUserCancelled(error)) {
        track('purchase_cancel', { tier });
      } else {
        track('purchase_fail', { tier, code: String(error?.code || error?.name || 'ERROR') });
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
      const outcome = await restorePurchases();
      if (outcome.plan !== 'free') {
        track('restore_ok', { plan: outcome.plan });
        finishAsPro(outcome);
      } else {
        Alert.alert(t('paywallTitle'), t('paywallNoPurchases'));
      }
    } catch (error) {
      console.warn('Geri yükleme hatası:', error.message);
      Alert.alert(t('errorTitle'), t('paywallPurchaseFailed'));
    } finally {
      setBusy(false);
    }
  };

  // Real findings from the user's own analysis (preview): what was spotted and what stays locked.
  const findings = (() => {
    const raw = context?.findings;
    if (!raw) return null;
    const topRisk = String(raw.topRisk || '').trim();
    const lockedRisks = Number(raw.lockedRisks) || 0;
    const lockedFixes = Number(raw.lockedFixes) || 0;
    const hasMessage = Boolean(raw.hasMessage);
    if (!topRisk && !lockedRisks && !lockedFixes && !hasMessage) return null;
    return { topRisk, lockedRisks, lockedFixes, hasMessage };
  })();

  const canPurchase = available && !loadingPlans && packages.length > 0 && !!selectedId && !owned;
  const annualCompare = pickAnnualCompare(packages);
  const tierCompare = pickProfessionalCompare(
    tier === 'professional' ? peerPackages : packages,
    tier === 'professional' ? packages : peerPackages,
  );

  const renderPlan = (pkg) => {
    const active = pkg.identifier === selectedId;
    const yearly = isAnnualPackage(pkg);
    const monthly = isMonthlyPackage(pkg);

    return (
      <TouchableOpacity accessibilityRole="button"
        key={pkg.identifier}
        activeOpacity={0.85}
        onPress={() => setSelectedId(pkg.identifier)}
        style={[
          styles.planCard,
          {
            backgroundColor: active ? theme.accentSoft : theme.inputBg,
            borderColor: active ? theme.accent : theme.borderColor,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.planTitle, { color: theme.text }]} numberOfLines={1}>
            {pkg.title}
          </Text>
          {yearly ? (
            <Text style={[styles.planBadge, { color: theme.accent }]}>
              {annualCompare ? t('mxAnnualBadge', { percent: String(annualCompare.percent) }) : t('paywallBestValue')}
            </Text>
          ) : null}
          {yearly && annualCompare ? (
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('mxAnnualHint')}</Text>
          ) : null}
          {monthly ? (
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('mxMonthlyNote')}</Text>
          ) : null}
          {yearly && pkg.pricePerMonthString ? (
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('wd1PerMonth', { price: pkg.pricePerMonthString })}</Text>
          ) : null}
          {active && pkg.hasFreeTrial ? (
            <Text style={[styles.sectionHint, { color: theme.accent, marginTop: 4, marginBottom: 0 }]}>{t('wd1Trial', { price: pkg.priceString })}</Text>
          ) : null}
        </View>

        <Text style={[styles.planPrice, { color: active ? theme.accent : theme.text }]}>
          {pkg.priceString}
        </Text>

        <Ionicons
          name={active ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={active ? theme.accent : theme.subText}
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
          <TouchableOpacity accessibilityRole="button"
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
              { backgroundColor: theme.cardBg, borderColor: theme.accent, alignItems: 'center' },
            ]}
          >
            <Ionicons name="shield-checkmark" size={44} color={theme.accent} />
            <Text style={[styles.scoreValue, { color: theme.accent, fontSize: 22, marginTop: 8 }]}>
              {heroTitle()}
            </Text>
            <Text style={[styles.summaryText, { color: theme.subText }]}>
              {heroBody()}
            </Text>
            {footKeyForHook(exhausted && !hook ? 'quota' : hook) ? (
              <Text style={[styles.sectionHint, { color: theme.subText, textAlign: 'center', marginTop: 10, marginBottom: 0 }]}>
                {t(footKeyForHook(exhausted && !hook ? 'quota' : hook))}
              </Text>
            ) : null}
          </View>

          {findings ? (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginTop: 16, marginBottom: 0 },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Ionicons name="scan-outline" size={16} color={theme.accentAlt} />
                <Text style={[styles.settingLabel, { color: theme.text, fontSize: 14, flex: 1 }]} numberOfLines={1}>
                  {t('pwFoundTitle')}
                </Text>
              </View>
              {findings.topRisk ? (
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <Ionicons name="alert-circle" size={18} color={theme.danger} style={{ marginTop: 1 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 2 }]}>{t('pwTopRisk')}</Text>
                    <Text style={[styles.summaryText, { color: theme.text, marginBottom: 0 }]} numberOfLines={3}>
                      {findings.topRisk}
                    </Text>
                  </View>
                </View>
              ) : null}
              {findings.lockedRisks > 0 ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Ionicons name="lock-closed-outline" size={16} color={theme.accent} />
                  <Text style={[styles.sectionHint, { color: theme.text, flex: 1, marginBottom: 0 }]}>
                    {t('pwLockedRisks', { count: findings.lockedRisks })}
                  </Text>
                </View>
              ) : null}
              {findings.lockedFixes > 0 || findings.hasMessage ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name="lock-closed-outline" size={16} color={theme.accent} />
                  <Text style={[styles.sectionHint, { color: theme.text, flex: 1, marginBottom: 0 }]}>
                    {findings.lockedFixes > 0
                      ? t('pwLockedFixes', { count: findings.lockedFixes })
                      : t('pwLockedMessage')}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            {TIERS.map((value) => {
              const active = tier === value;
              return (
                <TouchableOpacity
                  key={value}
                  activeOpacity={0.85}
                  onPress={() => setTier(value)}
                  disabled={busy}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderRadius: 14,
                    padding: 12,
                    borderColor: active ? theme.accent : theme.borderColor,
                    backgroundColor: active ? theme.accentSoft : theme.cardBg,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name={value === 'professional' ? 'ribbon-outline' : 'shield-checkmark-outline'} size={16} color={active ? theme.accent : theme.subText} />
                    <Text style={[styles.settingLabel, { color: active ? theme.accent : theme.text, fontSize: 15 }]} numberOfLines={1}>
                      {t(value === 'professional' ? 'planTabProfessional' : 'planTabPro')}
                    </Text>
                  </View>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]} numberOfLines={2}>
                    {t(value === 'professional' ? 'planProfessionalTagline' : 'planProTagline')}
                  </Text>
                </TouchableOpacity>
              );
            })}
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

            {(tier === 'professional' ? PROFESSIONAL_FEATURE_KEYS : FEATURE_KEYS).map((key) => (
              <View key={key} style={styles.paywallFeatureRow}>
                <Ionicons name="checkmark-circle" size={17} color={theme.accent} />
                <Text style={[styles.paywallFeatureText, { color: theme.text }]}>{t(key)}</Text>
              </View>
            ))}

            <View style={{ marginBottom: 16 }} />


            {loadingPlans ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator color={theme.accent} />
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
                {available && tier === 'professional' ? t('planProfessionalUnavailable') : t('paywallUnavailable')}
              </Text>
            ) : null}

            {owned ? (
              <Text style={[styles.sectionHint, { color: theme.accent, textAlign: 'center', marginVertical: 8 }]}>
                {t('planYouHave')}
              </Text>
            ) : tier === 'professional' && plan === 'pro' && packages.length > 0 ? (
              <Text style={[styles.sectionHint, { color: theme.subText, textAlign: 'center', marginVertical: 8 }]}>
                {t('planUpgradeNote')}
              </Text>
            ) : null}

            {available ? (
              <Text
                style={[styles.sectionHint, { color: theme.subText, textAlign: 'center', marginTop: 4, marginBottom: 10 }]}
              >
                {t('lg1AutoRenew')}
              </Text>
            ) : null}

            <TouchableOpacity accessibilityRole="button"
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
              <TouchableOpacity accessibilityRole="button" style={styles.secondaryBtn} onPress={handleRestore} disabled={busy}>
                <Text style={styles.secondaryBtnText}>{t('paywallRestore')}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity accessibilityRole="button" style={styles.secondaryBtn} onPress={onClose}>
              <Text style={styles.secondaryBtnText}>{t('paywallLater')}</Text>
            </TouchableOpacity>

            {/* Explanatory fine print sits below the purchase controls so plans and the CTA stay above the fold. */}
            <View style={{ marginTop: 12 }}>
            <HonestyFold theme={theme} label={t('foldLabel')} showLabel={t('foldShow')} hideLabel={t('foldHide')}>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('mxFirstValue')}</Text>
            {!loadingPlans && packages.length > 0 && !annualCompare ? (
              <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('mxNoCompare')}</Text>
            ) : null}
            {!loadingPlans && annualCompare ? (
              <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('mxYearlyPick')}</Text>
            ) : null}
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('mx2Offering')}</Text>
            {tierCompare ? (
              <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>
                {t('mx2Delta', { percent: String(tierCompare.percent) })}
              </Text>
            ) : !loadingPlans && (packages.length > 0 || peerPackages.length > 0) ? (
              <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('mx2NoDelta')}</Text>
            ) : null}
            {tierCompare && tierCompare.proPriceString && tierCompare.professionalPriceString ? (
              <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>
                {t('mx2Prices', { professionalPrice: tierCompare.professionalPriceString, proPrice: tierCompare.proPriceString })}
              </Text>
            ) : null}
            {tier === 'professional' && annualCompare ? (
              <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('mx2Yearly')}</Text>
            ) : null}
            {tier === 'professional' && plan === 'pro' ? (
              <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('mx2Upgrade')}</Text>
            ) : null}
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('mx2FirstValue')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('mx2Disclaimer')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('ux11Store')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('ux11First')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('ux11Guides')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('ux11Yearly')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('ux11Peer')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('ux11Restore')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('ux11NoCourt')}</Text>
            </HonestyFold>
            </View>

            <View style={{ marginTop: 16, alignItems: 'center', gap: 8 }}>
              <TouchableOpacity accessibilityRole="button" onPress={() => openLegal(PRIVACY_URL)} activeOpacity={0.85}>
                <Text style={[styles.sectionHint, { color: theme.accent, marginBottom: 0 }]}>
                  {t('privacyPolicy')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" onPress={() => openLegal(TERMS_URL)} activeOpacity={0.85}>
                <Text style={[styles.sectionHint, { color: theme.accent, marginBottom: 0 }]}>
                  {t('termsOfUse')}
                </Text>
              </TouchableOpacity>
              <Text
                style={[
                  styles.sectionHint,
                  { color: theme.subText, textAlign: 'center', marginTop: 4, marginBottom: 0 },
                ]}
              >
                {t('ux11Disclaimer')}
              </Text>
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
