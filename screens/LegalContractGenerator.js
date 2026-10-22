import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { styles } from '../theme';
import {
  APP_LANGUAGES,
  CONTRACT_CATEGORIES,
  JURISDICTIONS,
  resolvePartyCode,
} from '../constants/options';
import { OptionSheet, PartySideSelector, SelectorField } from '../components/OptionSelector';
import { generateContractDraft, isTruncatedDraft, AI_ERROR_CODES } from '../services/ai';
import { consumeAnalysisCredit, QUOTA_ERRORS } from '../services/quota';
import { describeError } from '../utils/errors';
import { safeDisplayText } from '../utils/analysis';
import { exportPlain } from '../utils/exportPlain';
import { useFeedback } from '../context/FeedbackContext';

const TYPE_KEYS = Object.keys(CONTRACT_CATEGORIES);

const draftBody = (result) =>
  [result?.title, result?.draft].map((item) => String(item || '').trim()).filter(Boolean).join('\n\n');

export default function LegalContractGenerator({
  theme,
  country,
  party,
  categoryKey = 'typeGeneral',
  lang,
  isPro,
  quotaEnforced,
  freeLeft,
  onNeedPaywall,
  onProfileLeft,
}) {
  const { t, i18n } = useTranslation();
  const { showToast } = useFeedback();

  const [draftCountry, setDraftCountry] = useState(country || 'auto');
  const [draftParty, setDraftParty] = useState(party === 'seller' ? 'seller' : 'buyer');
  const [draftType, setDraftType] = useState(categoryKey || 'typeGeneral');
  const [draftLang, setDraftLang] = useState((lang || i18n.language || 'tr').split('-')[0]);
  const [topic, setTopic] = useState('');
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const countryOptions = useMemo(
    () => (JURISDICTIONS || []).map((item) => ({ code: item.code, label: t(item.labelKey), hint: item.hint })),
    [t]
  );
  const typeOptions = useMemo(
    () => TYPE_KEYS.map((key) => ({ code: key, label: t(key) })),
    [t]
  );
  const languageOptions = useMemo(
    () => (APP_LANGUAGES || []).map((item) => ({
      code: item.code,
      label: `${item.flag} ${item.label}`,
      hint: item.english,
    })),
    []
  );

  const selectedCountry = countryOptions.find((item) => item.code === draftCountry) || countryOptions[0];
  const selectedType = typeOptions.find((item) => item.code === draftType) || typeOptions[0];
  const selectedLang = languageOptions.find((item) => item.code === draftLang) || languageOptions[0];

  useEffect(() => {
    if (country) setDraftCountry(country);
  }, [country]);
  useEffect(() => {
    if (lang) setDraftLang(String(lang).split('-')[0]);
  }, [lang]);

  const handleGenerate = async () => {
    if (!String(topic).trim()) {
      showToast(t('genEmptyTopic'), { type: 'warning' });
      return;
    }
    if (quotaEnforced && !isPro && freeLeft <= 0) {
      onNeedPaywall?.('quota');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await generateContractDraft({
        topic: topic.trim(),
        country: draftCountry,
        party: resolvePartyCode(draftParty, CONTRACT_CATEGORIES[draftType] || 'general'),
        category: CONTRACT_CATEGORIES[draftType] || 'general',
        lang: draftLang,
      });
      if (!String(data?.draft || '').trim()) {
        setResult({ title: '', draft: '', summary: '', keyProtections: [], empty: true });
        showToast(t('genEmptyDraft'), { type: 'error' });
        return;
      }
      if (isTruncatedDraft(data.draft)) {
        setResult({ ...data, empty: false, truncated: true });
        showToast(t('errDraftTruncated'), { type: 'error' });
        return;
      }
      setResult(data);

      if (quotaEnforced && !isPro && String(data?.draft || '').length > 400) {
        try {
          const left = await consumeAnalysisCredit();
          if (typeof left === 'number' && left >= 0) onProfileLeft?.(left);
        } catch (quotaError) {
          if (quotaError.code === QUOTA_ERRORS.QUOTA_EXHAUSTED) onNeedPaywall?.('quota');
        }
      }
    } catch (error) {
      const truncated = error?.code === AI_ERROR_CODES.DRAFT_TRUNCATED;
      setResult({ title: '', draft: '', summary: '', keyProtections: [], empty: !truncated, truncated });
      showToast(describeError(t, error), { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      if (isTruncatedDraft(result?.draft)) {
        showToast(t('errDraftTruncated'), { type: 'error' });
        return;
      }
      const body = draftBody(result);
      if (!body) {
        showToast(t('genEmptyDraft'), { type: 'warning' });
        return;
      }
      const { text } = await exportPlain(body, 'NexuLex-taslak.txt');
      showToast(`${t('genCopied')} · ${text.length}`, { type: 'success' });
    } catch {
      showToast(t('genShareFailed'), { type: 'error' });
    }
  };

  const handleShare = async () => {
    if (isTruncatedDraft(result?.draft)) {
      showToast(t('errDraftTruncated'), { type: 'error' });
      return;
    }
    const body = draftBody(result);
    if (!body) {
      showToast(t('genEmptyDraft'), { type: 'warning' });
      return;
    }
    try {
      await exportPlain(body, 'NexuLex-taslak.txt', { shareAlways: true });
    } catch {
      showToast(t('genShareFailed'), { type: 'error' });
    }
  };

  const renderDraftCard = () => {
    if (loading) {
      return (
        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginTop: 16 }]}>
          <ActivityIndicator color={theme.accent} />
          <Text style={[styles.sectionHint, { color: theme.subText, textAlign: 'center', marginTop: 10 }]}>
            {t('genLoading')}
          </Text>
          <View style={{ height: 10, borderRadius: 6, backgroundColor: theme.borderColor, marginTop: 14 }} />
          <View style={{ height: 10, borderRadius: 6, backgroundColor: theme.borderColor, marginTop: 8, width: '88%' }} />
          <View style={{ height: 10, borderRadius: 6, backgroundColor: theme.borderColor, marginTop: 8, width: '72%' }} />
          <View style={{ height: 10, borderRadius: 6, backgroundColor: theme.borderColor, marginTop: 8, width: '94%' }} />
        </View>
      );
    }

    if (!result) return null;

    const draftText = String(result.draft || '').trim();
    const truncated = result.truncated || (!!draftText && isTruncatedDraft(result.draft));
    const empty = (result.empty || !draftText) && !truncated;
    return (
      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginTop: 16 }]}>
        <Text style={[styles.takeawayTitle, { color: theme.text }]}>
          {safeDisplayText(result.title, t('genResult'))}
        </Text>
        {empty ? (
          <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('genEmptyDraft')}</Text>
        ) : truncated ? (
          <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('errDraftTruncated')}</Text>
        ) : (
          <>
            {result.summary ? (
              <Text style={[styles.sectionHint, { color: theme.subText }]}>{safeDisplayText(result.summary)}</Text>
            ) : null}
            {(result.keyProtections || []).map((item, index) => (
              <Text key={`${item}-${index}`} style={[styles.deadlineMeta, { color: theme.text, marginBottom: 4 }]}>
                • {safeDisplayText(item)}
              </Text>
            ))}
            <ScrollView style={{ maxHeight: 280, marginTop: 8 }} nestedScrollEnabled>
              <Text style={[styles.summaryText, { color: theme.text }]}>{safeDisplayText(result.draft)}</Text>
            </ScrollView>
          </>
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <TouchableOpacity accessibilityRole="button"
            style={[styles.proposalBtn, { borderColor: theme.accent, opacity: empty || truncated ? 0.4 : 1 }]}
            disabled={empty || truncated}
            onPress={() => {
              handleCopy().catch(() => showToast(t('genShareFailed'), { type: 'error' }));
            }}
          >
            <Ionicons name="copy-outline" size={14} color={theme.accent} />
            <Text style={styles.proposalBtnText}>{t('genCopy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button"
            style={[styles.proposalBtn, { borderColor: theme.accent, opacity: empty || truncated ? 0.4 : 1 }]}
            disabled={empty || truncated}
            onPress={() => {
              handleShare().catch(() => showToast(t('genShareFailed'), { type: 'error' }));
            }}
          >
            <Ionicons name="share-outline" size={14} color={theme.accent} />
            <Text style={styles.proposalBtnText}>{t('genShare')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 10 }]}>
          {t('genDisclaimer')}
        </Text>
      </View>
    );
  };

  return (
    <View>
      <Text style={[styles.sectionHeader, { color: theme.text }]}>{t('genTitle')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('genHint')}</Text>

      <SelectorField
        theme={theme}
        icon="earth-outline"
        label={t('analysisCountryLabel')}
        value={selectedCountry.label}
        hint={selectedCountry.hint}
        onPress={() => setSheet('country')}
        disabled={loading}
      />
      <SelectorField
        theme={theme}
        icon="briefcase-outline"
        label={t('contractLibrary')}
        value={selectedType.label}
        onPress={() => setSheet('type')}
        disabled={loading}
      />
      <SelectorField
        theme={theme}
        icon="language-outline"
        label={t('reportLanguageLabel')}
        value={selectedLang.label}
        onPress={() => setSheet('lang')}
        disabled={loading}
      />

      <PartySideSelector
        theme={theme}
        selected={draftParty}
        onSelect={setDraftParty}
        disabled={loading}
      />

      <Text style={[styles.label, { color: theme.subText }]}>{t('genTopic')}</Text>
      <TextInput accessibilityLabel={t('genTopicPlaceholder')}
        style={[
          styles.input,
          styles.textArea,
          { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor, minHeight: 90 },
        ]}
        placeholder={t('genTopicPlaceholder')}
        placeholderTextColor={theme.subText}
        value={topic}
        onChangeText={setTopic}
        multiline
        editable={!loading}
      />

      <TouchableOpacity accessibilityRole="button"
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={() => {
          handleGenerate().catch((error) => showToast(describeError(t, error), { type: 'error' }));
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#080C14" />
        ) : (
          <Text style={styles.primaryButtonText}>{t('genAction')}</Text>
        )}
      </TouchableOpacity>

      {renderDraftCard()}

      <OptionSheet
        visible={sheet === 'country'}
        theme={theme}
        title={t('selectCountryTitle')}
        options={countryOptions}
        selectedCode={draftCountry}
        onSelect={setDraftCountry}
        onClose={() => setSheet(null)}
        closeLabel={t('closeButton')}
      />
      <OptionSheet
        visible={sheet === 'type'}
        theme={theme}
        title={t('contractLibrary')}
        options={typeOptions}
        selectedCode={draftType}
        onSelect={setDraftType}
        onClose={() => setSheet(null)}
        closeLabel={t('closeButton')}
      />
      <OptionSheet
        visible={sheet === 'lang'}
        theme={theme}
        title={t('selectReportLanguageTitle')}
        options={languageOptions}
        selectedCode={draftLang}
        onSelect={setDraftLang}
        onClose={() => setSheet(null)}
        closeLabel={t('closeButton')}
      />
    </View>
  );
}
