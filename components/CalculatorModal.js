import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
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

import { ACCENT, DANGER, styles } from '../theme';
import { LEGAL_CALCULATORS, calculatorCopyKeys, isCalculatorAvailable } from '../constants/legalCalcRates';
import {
  buildCalcAdvisorPrompt,
  calculateDeadlineDate,
  calculateInstallmentPlan,
  calculateLegalInterest,
  calculatePenaltyRatio,
  calculatePercentChange,
  calculateProRata,
  calculateRentIncrease,
  calculateSeverance,
  currencyLabel,
  formatCalculationForSharing,
  formatIsoDate,
  formatMoney,
  parseIsoDate,
  resolveCalcContext,
} from '../utils/legalCalculators';
import { maskIsoDateInput } from '../utils/dateInput';
import { useFeedback } from '../context/FeedbackContext';
import KeyboardSafeSheet, { useKeyboardSafeSheet } from './KeyboardSafeSheet';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.9);

const toNumber = (value) => Number(String(value ?? '').replace(',', '.'));

const todayIso = () => {
  const now = new Date();
  return formatIsoDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
};

const daysInCurrentMonth = () => {
  const now = new Date();
  return String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());
};

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
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX });
  const { showToast } = useFeedback();
  const meta = useMemo(
    () => (LEGAL_CALCULATORS || []).find((item) => item.id === calculatorId) || null,
    [calculatorId]
  );
  const copyKeys = calculatorCopyKeys(calculatorId, ctx.pack);
  const currencyTag = currencyLabel(ctx.currency, language);
  const moneyLabel = (key) => (currencyTag ? t(key, { currency: currencyTag }) : t(`${key}NoCur`));
  const badgeText = [ctx.jurisdiction || t('calcJurisdictionGeneric'), ctx.currency].filter(Boolean).join(' · ');

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
  const [deadlineStart, setDeadlineStart] = useState(todayIso);
  const [deadlineAmount, setDeadlineAmount] = useState('14');
  const [deadlineUnit, setDeadlineUnit] = useState('days');
  const [businessDays, setBusinessDays] = useState(false);
  const [proRataAmount, setProRataAmount] = useState('3000');
  const [daysUsed, setDaysUsed] = useState('10');
  const [daysInPeriod, setDaysInPeriod] = useState(daysInCurrentMonth);
  const [percentMode, setPercentMode] = useState('diff');
  const [oldValue, setOldValue] = useState('1000');
  const [newValue, setNewValue] = useState('1200');
  const [percentValue, setPercentValue] = useState('10');
  const [installmentTotal, setInstallmentTotal] = useState('12000');
  const [installmentCount, setInstallmentCount] = useState('6');
  const [firstDate, setFirstDate] = useState(todayIso);
  const [installmentInterval, setInstallmentInterval] = useState('monthly');
  const [penaltyAmount, setPenaltyAmount] = useState('5000');
  const [contractValue, setContractValue] = useState('100000');
  const [result, setResult] = useState(null);
  const [dateError, setDateError] = useState(false);
  const hasResultRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      setResult(null);
      setDateError(false);
    }
  }, [visible, calculatorId]);

  const datesValid = () => {
    if (calculatorId === 'deadline_date') return !!parseIsoDate(deadlineStart);
    if (calculatorId === 'installment_plan') return !!parseIsoDate(firstDate);
    const start = parseIsoDate(startDate);
    const end = parseIsoDate(endDate);
    return !!start && !!end && end.getTime() >= start.getTime();
  };
  const needsDates = ['legal_interest', 'deadline_date', 'installment_plan'].includes(calculatorId);

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
    if (calculatorId === 'deadline_date') {
      return calculateDeadlineDate({
        startDate: deadlineStart,
        amount: toNumber(deadlineAmount),
        unit: deadlineUnit,
        businessDays,
        ...ctxArgs,
      });
    }
    if (calculatorId === 'pro_rata') {
      return calculateProRata({
        amount: toNumber(proRataAmount),
        daysUsed: toNumber(daysUsed),
        daysInPeriod: toNumber(daysInPeriod),
        ...ctxArgs,
      });
    }
    if (calculatorId === 'percent_change') {
      return calculatePercentChange({
        mode: percentMode,
        oldValue: toNumber(oldValue),
        newValue: toNumber(newValue),
        percent: toNumber(percentValue),
        ...ctxArgs,
      });
    }
    if (calculatorId === 'installment_plan') {
      return calculateInstallmentPlan({
        total: toNumber(installmentTotal),
        count: toNumber(installmentCount),
        firstDate,
        interval: installmentInterval,
        ...ctxArgs,
      });
    }
    if (calculatorId === 'penalty_ratio') {
      return calculatePenaltyRatio({
        penalty: toNumber(penaltyAmount),
        contractValue: toNumber(contractValue),
        ...ctxArgs,
      });
    }
    return null;
  };

  const runCalculate = () => {
    if (needsDates && !datesValid()) {
      setDateError(true);
      setResult(null);
      return;
    }
    setDateError(false);
    const next = compute();
    setResult(next && !next.unavailable && !next.invalid ? next : null);
  };

  const onDateChange = (setter) => (value) => {
    setter(maskIsoDateInput(value));
    if (dateError) setDateError(false);
  };

  hasResultRef.current = !!result;
  // Jurisdiction switched while open: recompute so no stale currency / statutory numbers remain.
  useEffect(() => {
    if (!hasResultRef.current) return;
    const next = compute();
    setResult(next && !next.unavailable && !next.invalid ? next : null);
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

  const numberField = (key, label, value, setter) => (
    <>
      <Text style={[styles.label, { color: theme.subText }]}>{label}</Text>
      <TextInput
        {...sheet.field(key)}
        style={inputStyle}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={setter}
        placeholderTextColor={theme.subText}
      />
    </>
  );

  const dateField = (key, label, value, setter) => (
    <>
      <Text style={[styles.label, { color: theme.subText }]}>{label}</Text>
      <TextInput
        {...sheet.field(key)}
        style={[inputStyle, dateError && !parseIsoDate(value) && { borderColor: DANGER }]}
        value={value}
        onChangeText={onDateChange(setter)}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={theme.subText}
        keyboardType="number-pad"
        maxLength={10}
        autoCapitalize="none"
      />
    </>
  );

  const choiceChips = (options, value, onChange) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => onChange(opt.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.offerTierChip,
              { borderColor: active ? ACCENT : theme.borderColor, backgroundColor: active ? `${ACCENT}22` : theme.cardBg },
            ]}
          >
            <Text style={[styles.offerTierChipText, { color: active ? ACCENT : theme.subText }]}>{t(opt.labelKey)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const rowValue = (row) => {
    if (row.textKey) return t(row.textKey, row.textParams);
    if (row.text != null) return row.text;
    return formatMoney(row.amount, row.currency, displayLocale);
  };

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
            },
            sheet.sheetStyle,
          ]}
        >
          <View style={styles.modalHandle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Ionicons name={meta.icon || 'calculator-outline'} size={20} color={ACCENT} />
            <Text style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]} numberOfLines={2}>
              {t(copyKeys.titleKey)}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel={t('closeButton')}>
              <Ionicons name="close" size={22} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <KeyboardSafeSheet
            controller={sheet}
            style={{ maxHeight: Math.round(WIN_H * 0.68) }}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              <View style={[styles.offerTierChip, { borderColor: theme.borderColor, backgroundColor: theme.cardBg }]}>
                <Text style={[styles.offerTierChipText, { color: theme.text }]}>{badgeText}</Text>
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
              {meta.universal ? (
                <View
                  style={[
                    styles.offerTierChip,
                    { borderColor: theme.borderColor, backgroundColor: theme.cardBg, flexDirection: 'row', alignItems: 'center', gap: 4 },
                  ]}
                >
                  <Ionicons name="globe-outline" size={12} color={theme.subText} />
                  <Text style={[styles.offerTierChipText, { color: theme.subText }]}>{t('availUniversal')}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>
              {t(copyKeys.descriptionKey)}
            </Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 4 }]}>
              {t('ux12Table')}
            </Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 4 }]}>
              {t('ux12Country', { country: ctx.jurisdiction || country })}
            </Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 4 }]}>{t('ux12NoAdvice')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 4 }]}>{t('ux12Official')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 4 }]}>{t('ux12NoWin')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 4 }]}>{t('ux12Device')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 4 }]}>{t('ux12Free')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux12Disclaimer')}</Text>
            {statutory && ctx.pack ? (
              __DEV__ ? (
                <>
                  <Text style={[styles.sectionHint, { color: ACCENT, marginBottom: 12 }]}>
                    {t('calcAsOfNotice', { date: ctx.pack.asOfDate })}
                  </Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 14 }]}>
                    {t(ctx.pack.sourceNoteKey)}
                  </Text>
                </>
              ) : (
                <Text style={[styles.sectionHint, { color: ACCENT, marginBottom: 14 }]}>
                  {t('calcRatesAsOfPublic', { date: ctx.pack.asOfDate })}
                </Text>
              )
            ) : null}
            {available && !ctx.currency && meta.usesMoney !== false ? (
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
                <Text style={[styles.label, { color: theme.subText }]}>{moneyLabel('calcGrossSalary')}</Text>
                <TextInput
                  {...sheet.field('grossSalary')}
                  style={inputStyle}
                  keyboardType="decimal-pad"
                  value={grossSalary}
                  onChangeText={setGrossSalary}
                  placeholderTextColor={theme.subText}
                />
                <Text style={[styles.label, { color: theme.subText }]}>{t('calcWorkMonths')}</Text>
                <TextInput
                  {...sheet.field('workMonths')}
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
                    accessibilityLabel={t('calcIncludesNotice')}
                    value={includesNoticePay}
                    onValueChange={setIncludesNoticePay}
                    trackColor={{ true: ACCENT }}
                  />
                </View>
              </>
            ) : null}

            {calculatorId === 'rent_cap' ? (
              <>
                <Text style={[styles.label, { color: theme.subText }]}>{moneyLabel('calcCurrentRent')}</Text>
                <TextInput
                  {...sheet.field('currentRent')}
                  style={inputStyle}
                  keyboardType="decimal-pad"
                  value={currentRent}
                  onChangeText={setCurrentRent}
                  placeholderTextColor={theme.subText}
                />
                <Text style={[styles.label, { color: theme.subText }]}>{moneyLabel('calcProposedRent')}</Text>
                <TextInput
                  {...sheet.field('proposedRent')}
                  style={inputStyle}
                  keyboardType="decimal-pad"
                  value={proposedRent}
                  onChangeText={setProposedRent}
                  placeholderTextColor={theme.subText}
                />
                <Text style={[styles.label, { color: theme.subText }]}>
                  {t(statutory ? ctx.pack.calculators.rent_cap.indexLabelKey : 'calcIndexRateGeneric')}
                </Text>
                <TextInput
                  {...sheet.field('indexRate')}
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
                  <Switch accessibilityLabel={t('calcIsResidential')} value={isResidential} onValueChange={setIsResidential} trackColor={{ true: ACCENT }} />
                </View>
              </>
            ) : null}

            {calculatorId === 'legal_interest' ? (
              <>
                <Text style={[styles.label, { color: theme.subText }]}>{moneyLabel('calcPrincipal')}</Text>
                <TextInput
                  {...sheet.field('principal')}
                  style={inputStyle}
                  keyboardType="decimal-pad"
                  value={principal}
                  onChangeText={setPrincipal}
                  placeholderTextColor={theme.subText}
                />
                <Text style={[styles.label, { color: theme.subText }]}>{t('calcStartDate')}</Text>
                <TextInput
                  {...sheet.field('startDate')}
                  style={[inputStyle, dateError && !parseIsoDate(startDate) && { borderColor: DANGER }]}
                  value={startDate}
                  onChangeText={onDateChange(setStartDate)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.subText}
                  keyboardType="number-pad"
                  maxLength={10}
                  autoCapitalize="none"
                />
                <Text style={[styles.label, { color: theme.subText }]}>{t('calcEndDate')}</Text>
                <TextInput
                  {...sheet.field('endDate')}
                  style={[inputStyle, dateError && { borderColor: DANGER }]}
                  value={endDate}
                  onChangeText={onDateChange(setEndDate)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.subText}
                  keyboardType="number-pad"
                  maxLength={10}
                  autoCapitalize="none"
                />
                {dateError ? (
                  <Text style={[styles.sectionHint, { color: DANGER, marginTop: -4, marginBottom: 10 }]}>
                    {t('calcInvalidDate')}
                  </Text>
                ) : null}
                {!statutory ? (
                  <>
                    <Text style={[styles.label, { color: theme.subText }]}>{t('calcUserRate')}</Text>
                    <TextInput
                      {...sheet.field('userRate')}
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
                      <TouchableOpacity accessibilityRole="button"
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

            {calculatorId === 'deadline_date' ? (
              <>
                {dateField('deadlineStart', t('calcStartDate'), deadlineStart, setDeadlineStart)}
                {numberField('deadlineAmount', t('calcDeadlineAmount'), deadlineAmount, setDeadlineAmount)}
                {choiceChips(
                  [
                    { id: 'days', labelKey: 'calcUnitDays' },
                    { id: 'weeks', labelKey: 'calcUnitWeeks' },
                    { id: 'months', labelKey: 'calcUnitMonths' },
                  ],
                  deadlineUnit,
                  setDeadlineUnit
                )}
                {deadlineUnit === 'days' ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={[styles.settingLabel, { color: theme.text, flex: 1 }]}>{t('calcBusinessDays')}</Text>
                    <Switch accessibilityLabel={t('calcBusinessDays')} value={businessDays} onValueChange={setBusinessDays} trackColor={{ true: ACCENT }} />
                  </View>
                ) : null}
              </>
            ) : null}

            {calculatorId === 'pro_rata' ? (
              <>
                {numberField('proRataAmount', moneyLabel('calcProRataAmount'), proRataAmount, setProRataAmount)}
                {numberField('daysUsed', t('calcProRataDaysUsed'), daysUsed, setDaysUsed)}
                {numberField('daysInPeriod', t('calcProRataDaysInPeriod'), daysInPeriod, setDaysInPeriod)}
              </>
            ) : null}

            {calculatorId === 'percent_change' ? (
              <>
                {choiceChips(
                  [
                    { id: 'diff', labelKey: 'calcPercentModeDiff' },
                    { id: 'apply', labelKey: 'calcPercentModeApply' },
                  ],
                  percentMode,
                  setPercentMode
                )}
                {numberField('oldValue', t('calcPercentOld'), oldValue, setOldValue)}
                {percentMode === 'diff'
                  ? numberField('newValue', t('calcPercentNew'), newValue, setNewValue)
                  : numberField('percentValue', t('calcPercentRate'), percentValue, setPercentValue)}
              </>
            ) : null}

            {calculatorId === 'installment_plan' ? (
              <>
                {numberField('installmentTotal', moneyLabel('calcInstallmentTotalInput'), installmentTotal, setInstallmentTotal)}
                {numberField('installmentCount', t('calcInstallmentCount'), installmentCount, setInstallmentCount)}
                {dateField('firstDate', t('calcInstallmentFirstDate'), firstDate, setFirstDate)}
                {choiceChips(
                  [
                    { id: 'monthly', labelKey: 'calcIntervalMonthly' },
                    { id: 'weekly', labelKey: 'calcIntervalWeekly' },
                  ],
                  installmentInterval,
                  setInstallmentInterval
                )}
              </>
            ) : null}

            {calculatorId === 'penalty_ratio' ? (
              <>
                {numberField('penaltyAmount', moneyLabel('calcPenaltyAmountInput'), penaltyAmount, setPenaltyAmount)}
                {numberField('contractValue', moneyLabel('calcContractValueInput'), contractValue, setContractValue)}
              </>
            ) : null}

            {dateError && calculatorId !== 'legal_interest' ? (
              <Text style={[styles.sectionHint, { color: DANGER, marginTop: -4, marginBottom: 10 }]}>{t('calcInvalidDateSingle')}</Text>
            ) : null}

            {available ? (
              <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={runCalculate} activeOpacity={0.85}>
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
                      {t(row.labelKey, row.labelParams)}
                    </Text>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>{rowValue(row)}</Text>
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
                    {t(result.totalLabelKey || 'calcEstimatedNet')}:{' '}
                    {result.totalText != null ? result.totalText : formatMoney(result.totalAmount, result.currency, displayLocale)}
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

                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>
                  {t('ux12Disclaimer')}
                </Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 12 }]}>
                  {t(result.disclaimerKey || 'calcDisclaimer')}
                </Text>

                <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={handleCopy} activeOpacity={0.85}>
                  <Text style={styles.primaryButtonText}>{t('calcCopy')}</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" style={styles.secondaryBtn} onPress={handleShare} activeOpacity={0.85}>
                  <Text style={styles.secondaryBtnText}>{t('calcShare')}</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" style={styles.secondaryBtn} onPress={handleAskAdvisor} activeOpacity={0.85}>
                  <Text style={styles.secondaryBtnText}>{t('calcAskAdvisor')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </KeyboardSafeSheet>
        </View>
      </View>
    </Modal>
  );
}
