import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACCENT, DANGER, styles } from '../theme';
import { LEGAL_CALCULATORS, isCalculatorAvailable } from '../constants/legalCalcRates';
import {
  buildCalcAdvisorPrompt,
  calculateLegalInterest,
  calculateRentIncrease,
  calculateSeverance,
  formatCalculationForSharing,
  formatMoney,
  resolveCalcContext,
} from '../utils/legalCalculators';
import { useFeedback } from '../context/FeedbackContext';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.9);

const toNumber = (value) => Number(String(value ?? '').replace(',', '.'));

export default function CalculatorModal({
  visible,
  theme,
  calculatorId,
  country = 'auto',
  onClose,
  onAskAdvisor,
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const ctx = useMemo(() => resolveCalcContext({ country, language }), [country, language]);
  const available = isCalculatorAvailable(calculatorId, ctx.pack);
  const statutory =
    calculatorId === 'labor_severance'
      ? available
      : !!ctx.pack?.calculators?.[calculatorId];
  const displayLocale = ctx.pack?.locale || language;
  const insets = useSafeAreaInsets();
  const { showToast } = useFeedback();
  const meta = useMemo(
    () => (LEGAL_CALCULATORS || []).find((item) => item.id === calculatorId) || null,
    [calculatorId]
  );

  const [grossSalary, setGrossSalary] = useState('50000');
  const [workMonths, setWorkMonths] = useState('36');
  const [includesNoticePay, setIncludesNoticePay] = useState(false);
  const [currentRent, setCurrentRent] = useState('15000');
  const [proposedRent, setProposedRent] = useState('18000');
  const [tufeRate, setTufeRate] = useState('25');
  const [isResidential, setIsResidential] = useState(true);
  const [principal, setPrincipal] = useState('100000');
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2026-01-01');
  const [interestType, setInterestType] = useState('legal');
  const [userRate, setUserRate] = useState('');
  const [result, setResult] = useState(null);
  const hasResultRef = useRef(false);

  useEffect(() => {
    if (!visible) setResult(null);
  }, [visible, calculatorId]);

  const compute = () => {
    const ctxArgs = { country, language };
    if (calculatorId === 'labor_severance') {
      return calculateSeverance({
        grossSalary: toNumber(grossSalary),
        workMonths: toNumber(workMonths),
        includesNoticePay,
        ...ctxArgs,
      });
    }
    if (calculatorId === 'rent_cap') {
      return calculateRentIncrease({
        currentRent: toNumber(currentRent),
        proposedRent: toNumber(proposedRent),
        tufeRate: toNumber(tufeRate),
        isResidential,
        ...ctxArgs,
      });
    }
    if (calculatorId === 'legal_interest') {
      return calculateLegalInterest({
        principal: toNumber(principal),
        startDate,
        endDate,
        interestType,
        userRate: toNumber(userRate),
        ...ctxArgs,
      });
    }
    return null;
  };

  const runCalculate = () => {
    const next = compute();
    setResult(next && !next.unavailable ? next : null);
  };

  hasResultRef.current = !!result;
  // Jurisdiction switched while open: recompute so no stale currency / statutory numbers remain.
  useEffect(() => {
    if (!hasResultRef.current) return;
    const next = compute();
    setResult(next && !next.unavailable ? next : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, language]);

  const handleCopy = async () => {
    if (!result) return;
    const text = formatCalculationForSharing(result, 'plain', t);
    await Clipboard.setStringAsync(text);
    showToast(t('copiedToClipboard'), { type: 'success', duration: 1400 });
  };

  const handleShare = async () => {
    if (!result) return;
    const message = formatCalculationForSharing(result, 'whatsapp', t);
    try {
      await Share.share({ message });
    } catch (_error) {
      showToast(t('shareUnavailable'), { type: 'warning' });
    }
  };

  const handleAskAdvisor = () => {
    if (!result) return;
    onAskAdvisor?.(buildCalcAdvisorPrompt(result, t), result);
    onClose?.();
  };

  if (!meta) return null;

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.inputBg,
      color: theme.text,
      borderColor: theme.borderColor,
      marginBottom: 10,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* BL.3: backdrop Pressable is sibling of sheet — not a wrapping parent. */}
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('calcClose')}
        />
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.borderColor,
              maxHeight: SHEET_MAX,
              paddingBottom: Math.max(insets.bottom, 0) + 16,
            },
          ]}
        >
          <View style={styles.modalHandle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Ionicons name={meta.icon || 'calculator-outline'} size={20} color={ACCENT} />
            <Text style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]} numberOfLines={2}>
              {t(meta.titleKey)}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ maxHeight: Math.round(WIN_H * 0.68) }}
            contentContainerStyle={{ paddingBottom: 12 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              <View style={[styles.offerTierChip, { borderColor: theme.borderColor, backgroundColor: theme.cardBg }]}>
                <Text style={[styles.offerTierChipText, { color: theme.text }]}>
                  {`${ctx.jurisdiction || '—'} · ${ctx.currency || '—'}`}
                </Text>
              </View>
              {available ? (
                <View
                  style={[
                    styles.offerTierChip,
                    { borderColor: statutory ? ACCENT : theme.borderColor, backgroundColor: theme.cardBg },
                  ]}
                >
                  <Text style={[styles.offerTierChipText, { color: statutory ? ACCENT : theme.subText }]}>
                    {t(statutory ? 'calcModeStatutory' : 'calcModeGeneric')}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>
              {t(meta.descriptionKey)}
            </Text>
            {statutory && ctx.pack ? (
              <>
                <Text style={[styles.sectionHint, { color: ACCENT, marginBottom: 12 }]}>
                  {t('calcAsOfNotice', { date: ctx.pack.asOfDate })}
                </Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 14 }]}>
                  {t(ctx.pack.sourceNoteKey)}
                </Text>
              </>
            ) : null}
            {available && !ctx.currency ? (
              <Text style={[styles.sectionHint, { color: DANGER, marginBottom: 12 }]}>
                {t('calcCurrencyUnset')}
              </Text>
            ) : null}

            {!available ? (
              <View
                style={[
                  styles.previewBanner,
                  { backgroundColor: theme.cardBg, borderColor: DANGER, marginBottom: 12 },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={16} color={DANGER} />
                <Text style={[styles.previewBannerText, { color: theme.text }]}>
                  {t('calcNotAvailableForCountry')}
                </Text>
              </View>
            ) : null}

            {calculatorId === 'labor_severance' && available ? (
              <>
                <Text style={[styles.label, { color: theme.subText }]}>{t('calcGrossSalary')}</Text>
                <TextInput
                  style={inputStyle}
                  keyboardType="decimal-pad"
                  value={grossSalary}
                  onChangeText={setGrossSalary}
                  placeholderTextColor={theme.subText}
                />
                <Text style={[styles.label, { color: theme.subText }]}>{t('calcWorkMonths')}</Text>
                <TextInput
                  style={inputStyle}
                  keyboardType="decimal-pad"
                  value={workMonths}
                  onChangeText={setWorkMonths}
                  placeholderTextColor={theme.subText}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <Text style={[styles.settingLabel, { color: theme.text, flex: 1 }]}>
                    {t('calcIncludesNotice')}
                  </Text>
                  <Switch
                    value={includesNoticePay}
                    onValueChange={setIncludesNoticePay}
                    trackColor={{ true: ACCENT }}
                  />
                </View>
              </>
            ) : null}

            {calculatorId === 'rent_cap' ? (
              <>
                <Text style={[styles.label, { color: theme.subText }]}>{t('calcCurrentRent')}</Text>
                <TextInput
                  style={inputStyle}
                  keyboardType="decimal-pad"
                  value={currentRent}
                  onChangeText={setCurrentRent}
                  placeholderTextColor={theme.subText}
                />
                <Text style={[styles.label, { color: theme.subText }]}>{t('calcProposedRent')}</Text>
                <TextInput
                  style={inputStyle}
                  keyboardType="decimal-pad"
                  value={proposedRent}
                  onChangeText={setProposedRent}
                  placeholderTextColor={theme.subText}
                />
                <Text style={[styles.label, { color: theme.subText }]}>
                  {t(statutory ? ctx.pack.calculators.rent_cap.indexLabelKey : 'calcUserRate')}
                </Text>
                <TextInput
                  style={inputStyle}
                  keyboardType="decimal-pad"
                  value={tufeRate}
                  onChangeText={setTufeRate}
                  placeholderTextColor={theme.subText}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <Text style={[styles.settingLabel, { color: theme.text, flex: 1 }]}>
                    {t('calcIsResidential')}
                  </Text>
                  <Switch value={isResidential} onValueChange={setIsResidential} trackColor={{ true: ACCENT }} />
                </View>
              </>
            ) : null}

            {calculatorId === 'legal_interest' ? (
              <>
                <Text style={[styles.label, { color: theme.subText }]}>{t('calcPrincipal')}</Text>
                <TextInput
                  style={inputStyle}
                  keyboardType="decimal-pad"
                  value={principal}
                  onChangeText={setPrincipal}
                  placeholderTextColor={theme.subText}
                />
                <Text style={[styles.label, { color: theme.subText }]}>{t('calcStartDate')}</Text>
                <TextInput
                  style={inputStyle}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.subText}
                  autoCapitalize="none"
                />
                <Text style={[styles.label, { color: theme.subText }]}>{t('calcEndDate')}</Text>
                <TextInput
                  style={inputStyle}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.subText}
                  autoCapitalize="none"
                />
                {!statutory ? (
                  <>
                    <Text style={[styles.label, { color: theme.subText }]}>{t('calcUserRate')}</Text>
                    <TextInput
                      style={inputStyle}
                      keyboardType="decimal-pad"
                      value={userRate}
                      onChangeText={setUserRate}
                      placeholder="%"
                      placeholderTextColor={theme.subText}
                    />
                  </>
                ) : null}
                {statutory ? (
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                  {[
                    { id: 'legal', labelKey: 'calcInterestTypeLegal' },
                    { id: 'commercial', labelKey: 'calcInterestTypeCommercial' },
                  ].map((opt) => {
                    const active = interestType === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => setInterestType(opt.id)}
                        style={[
                          styles.offerTierChip,
                          {
                            borderColor: active ? ACCENT : theme.borderColor,
                            backgroundColor: active ? `${ACCENT}22` : theme.cardBg,
                          },
                        ]}
                      >
                        <Text style={[styles.offerTierChipText, { color: active ? ACCENT : theme.subText }]}>
                          {t(opt.labelKey)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                ) : null}
              </>
            ) : null}

            {available ? (
              <TouchableOpacity style={styles.primaryButton} onPress={runCalculate} activeOpacity={0.85}>
                <Text style={styles.primaryButtonText}>{t('calcCalculate')}</Text>
              </TouchableOpacity>
            ) : null}

            {result ? (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.takeawayTitle, { color: theme.text, marginBottom: 8 }]}>
                  {t('calcBreakdownTitle')}
                </Text>
                {(result.breakdown || []).map((row, index) => (
                  <View
                    key={`${row.labelKey}-${index}`}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 6,
                    }}
                  >
                    <Text style={[styles.sectionHint, { color: theme.subText, flex: 1, marginBottom: 0 }]}>
                      {t(row.labelKey)}
                    </Text>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      {formatMoney(row.amount, row.currency, displayLocale)}
                    </Text>
                  </View>
                ))}

                <View
                  style={[
                    styles.previewBanner,
                    { backgroundColor: theme.cardBg, borderColor: ACCENT, marginTop: 10, marginBottom: 10 },
                  ]}
                >
                  <Ionicons name="calculator-outline" size={16} color={ACCENT} />
                  <Text style={[styles.previewBannerText, { color: theme.text }]}>
                    {t('calcEstimatedNet')}: {formatMoney(result.totalAmount, result.currency, displayLocale)}
                  </Text>
                </View>

                {result.meta?.overCap ? (
                  <Text style={[styles.sectionHint, { color: DANGER, marginBottom: 10 }]}>
                    {t('calcRentOverCap')}
                  </Text>
                ) : null}

                <View
                  style={[
                    styles.previewBanner,
                    { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginBottom: 10 },
                  ]}
                >
                  <Ionicons name="book-outline" size={14} color={theme.subText} />
                  <Text style={[styles.previewBannerText, { color: theme.subText }]}>
                    {t(result.statutoryFootnoteKey)}
                  </Text>
                </View>

                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 12 }]}>
                  {t(result.disclaimerKey || 'calcDisclaimer')}
                </Text>

                <TouchableOpacity style={styles.primaryButton} onPress={handleCopy} activeOpacity={0.85}>
                  <Text style={styles.primaryButtonText}>{t('calcCopy')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare} activeOpacity={0.85}>
                  <Text style={styles.secondaryBtnText}>{t('calcShare')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={handleAskAdvisor} activeOpacity={0.85}>
                  <Text style={styles.secondaryBtnText}>{t('calcAskAdvisor')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
