import React, { useEffect, useMemo, useState } from 'react';
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
import { LEGAL_CALC_RATES, LEGAL_CALCULATORS } from '../constants/legalCalcRates';
import {
  buildCalcAdvisorPrompt,
  calculateLegalInterest,
  calculateRentIncrease,
  calculateSeverance,
  formatCalculationForSharing,
} from '../utils/legalCalculators';
import { useFeedback } from '../context/FeedbackContext';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.9);

const formatMoney = (amount, currency = 'TRY') => {
  const n = Number(amount);
  if (currency === 'DAY') return String(Math.round(n));
  if (currency === 'PCT') return `%${Math.abs(n).toFixed(2)}`;
  const sign = n < 0 ? '-' : '';
  return `${sign}${Math.abs(n).toFixed(2)} ${currency}`;
};

export default function CalculatorModal({ visible, theme, calculatorId, onClose, onAskAdvisor }) {
  const { t } = useTranslation();
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
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!visible) setResult(null);
  }, [visible, calculatorId]);

  const runCalculate = () => {
    let next = null;
    if (calculatorId === 'labor_severance') {
      next = calculateSeverance({
        grossSalary: Number(String(grossSalary).replace(',', '.')),
        workMonths: Number(String(workMonths).replace(',', '.')),
        includesNoticePay,
      });
    } else if (calculatorId === 'rent_cap') {
      next = calculateRentIncrease({
        currentRent: Number(String(currentRent).replace(',', '.')),
        proposedRent: Number(String(proposedRent).replace(',', '.')),
        tufeRate: Number(String(tufeRate).replace(',', '.')),
        isResidential,
      });
    } else if (calculatorId === 'legal_interest') {
      next = calculateLegalInterest({
        principal: Number(String(principal).replace(',', '.')),
        startDate,
        endDate,
        interestType,
      });
    }
    setResult(next);
  };

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
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>
              {t(meta.descriptionKey)}
            </Text>
            <Text style={[styles.sectionHint, { color: ACCENT, marginBottom: 12 }]}>
              {t('calcAsOfNotice', { date: LEGAL_CALC_RATES.asOfDate })}
            </Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 14 }]}>
              {t(LEGAL_CALC_RATES.sourceNoteKey)}
            </Text>

            {calculatorId === 'labor_severance' ? (
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
                <Text style={[styles.label, { color: theme.subText }]}>{t('calcTufeRate')}</Text>
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
              </>
            ) : null}

            <TouchableOpacity style={styles.primaryButton} onPress={runCalculate} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>{t('calcCalculate')}</Text>
            </TouchableOpacity>

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
                      {formatMoney(row.amount, row.currency)}
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
                    {t('calcEstimatedNet')}: {formatMoney(result.totalAmount)}
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
