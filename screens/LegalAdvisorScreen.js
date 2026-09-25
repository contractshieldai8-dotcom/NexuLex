import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';

import { ACCENT, styles } from '../theme';
import { JURISDICTIONS } from '../constants/options';
import { LEGAL_SCENARIOS } from '../constants/legalScenarios';
import {
  LEGAL_CALCULATORS,
  calculatorCopyKeys,
  getCalcPack,
  isCalculatorAvailable,
} from '../constants/legalCalcRates';
import { OptionSheet, SelectorField } from '../components/OptionSelector';
import ScenarioWizardModal from '../components/ScenarioWizardModal';
import CalculatorModal from '../components/CalculatorModal';
import DraftWizardModal from '../components/DraftWizardModal';
import { listDraftTemplatesFor } from '../constants/draftTemplates';
import VoiceMicButton from '../components/VoiceMicButton';
import SpeakButton from '../components/SpeakButton';
import RecentChatsList from '../components/RecentChatsList';
import { ReportAiButton } from '../components/AiReportSheet';
import { askLegalAdvisor } from '../services/ai';
import { nextMessageId } from '../services/advisorChat';
import { describeError } from '../utils/errors';
import { useAdvisorChat } from '../context/AdvisorChatContext';
import { useFeedback } from '../context/FeedbackContext';

export default function LegalAdvisorScreen({
  theme,
  country,
  onCountryChange,
  analysisContext = null,
  isPro = false,
  onNeedPaywall,
  paywallVisible = false,
  isActive = true,
}) {
  const { t, i18n } = useTranslation();
  const listRef = useRef(null);
  const { messages, setMessages, resetActive } = useAdvisorChat();
  const { showToast, showModal } = useFeedback();

  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [countrySheet, setCountrySheet] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [scenarioId, setScenarioId] = useState(null);
  const [calculatorId, setCalculatorId] = useState(null);
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftTemplateId, setDraftTemplateId] = useState(null);
  const [draftOpenAtPreview, setDraftOpenAtPreview] = useState(false);
  // In-memory only: wizard answers survive the paywall round-trip, never persisted.
  const [draftAnswersById, setDraftAnswersById] = useState({});
  const pendingDraftReturnRef = useRef(null);
  const paywallWasVisibleRef = useRef(paywallVisible);

  const calcPack = useMemo(() => getCalcPack(country, i18n.language), [country, i18n.language]);
  const offeredDrafts = useMemo(
    () => listDraftTemplatesFor({ country, language: i18n.language }),
    [country, i18n.language]
  );

  const openDraft = useCallback((id = null, { atPreview = false } = {}) => {
    setDraftTemplateId(id);
    setDraftOpenAtPreview(atPreview);
    setDraftOpen(true);
  }, []);

  const handleDraftAnswers = useCallback((id, answers) => {
    setDraftAnswersById((prev) => ({ ...prev, [id]: answers }));
  }, []);

  const clearDraftAnswers = useCallback((id) => {
    setDraftAnswersById((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const handleDraftPaywall = useCallback(
    (id) => {
      pendingDraftReturnRef.current = id || null;
      setDraftOpen(false);
      onNeedPaywall?.('draft');
    },
    [onNeedPaywall]
  );

  const [paywallClosedTick, setPaywallClosedTick] = useState(0);

  useEffect(() => {
    const wasVisible = paywallWasVisibleRef.current;
    paywallWasVisibleRef.current = paywallVisible;
    if (wasVisible && !paywallVisible) setPaywallClosedTick((n) => n + 1);
  }, [paywallVisible]);

  useEffect(() => {
    if (!paywallClosedTick || paywallVisible || !isActive) return undefined;
    const id = pendingDraftReturnRef.current;
    if (!id) return undefined;
    let timer = null;
    // Present only after the purchase Alert / paywall dismissal has settled (iOS stacks one modal at a time).
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        if (pendingDraftReturnRef.current !== id) return;
        pendingDraftReturnRef.current = null;
        openDraft(id, { atPreview: true });
      }, 400);
    });
    return () => {
      task?.cancel?.();
      if (timer) clearTimeout(timer);
    };
  }, [isActive, openDraft, paywallClosedTick, paywallVisible]);

  const countryOptions = useMemo(
    () => (JURISDICTIONS || []).map((item) => ({ code: item.code, label: t(item.labelKey), hint: item.hint })),
    [t]
  );

  const selectedCountry = countryOptions.find((item) => item.code === country) || countryOptions[0];

  // Follow the conversation only after the user sends; first open keeps the header chips in view.
  const followChatRef = useRef(false);
  const scrollToEnd = useCallback(() => {
    if (!followChatRef.current) return;
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToEnd();
  }, [messages.length, scrollToEnd, sending]);

  // Typing: keep the latest bubble (incl. the welcome bubble) right above the input. Mount/empty chat stays put.
  const keyboardFollowRef = useRef({ count: messages.length, active: isActive });
  keyboardFollowRef.current = { count: messages.length, active: isActive };
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      const { count, active } = keyboardFollowRef.current;
      if (!active || count === 0) return;
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    });
    return () => sub.remove();
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = question.trim();

    if (!trimmed) {
      showToast(t('advisorEmptyQuestion'), { type: 'warning' });
      return;
    }

    const userMessage = { id: nextMessageId(), role: 'user', text: trimmed };
    const historySnapshot = messages.filter((msg) => msg.id !== 'greeting');

    followChatRef.current = true;
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setSending(true);

    try {
      const answer = await askLegalAdvisor({
        question: trimmed,
        history: historySnapshot,
        country,
        lang: i18n.language,
        analysisContext,
      });

      setMessages((prev) => [...prev, { id: nextMessageId(), role: 'assistant', text: answer }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId(), role: 'assistant', text: describeError(t, error), isError: true },
      ]);
    } finally {
      setSending(false);
    }
  }, [analysisContext, country, i18n.language, messages, question, setMessages, showToast, t]);

  const handleCopy = useCallback(
    async (message) => {
      await Clipboard.setStringAsync(message.text);
      setCopiedId(message.id);
      showToast(t('copiedToClipboard'), { type: 'success', duration: 1400 });
      setTimeout(() => setCopiedId((current) => (current === message.id ? null : current)), 1500);
    },
    [showToast, t]
  );

  const handleClear = useCallback(async () => {
    const choice = await showModal({
      title: t('advisorClearChat'),
      message: t('advisorClearConfirm'),
      confirmLabel: t('confirmDelete'),
      destructive: true,
    });
    if (choice === 'confirm') {
      followChatRef.current = false;
      resetActive({ archive: true, country });
      listRef.current?.scrollToOffset?.({ offset: 0, animated: true });
    }
  }, [country, resetActive, showModal, t]);

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';

    if (isUser) {
      return (
        <View style={styles.bubbleUser}>
          <Text style={[styles.bubbleMeta, { color: ACCENT }]}>{t('advisorYou')}</Text>
          <Text style={[styles.bubbleText, { color: theme.text }]}>{item.text}</Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.bubbleAssistant,
          { backgroundColor: theme.cardBg, borderColor: theme.borderColor },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.bubbleMeta, { color: theme.subText, flex: 1 }]}>
            {t('advisorAssistant')}
          </Text>

          {item.id !== 'greeting' && !item.isError ? (
            <ReportAiButton
              theme={theme}
              featureId="advisor_answer"
              targetId={item.id}
              country={country}
              context={item.text}
            />
          ) : null}

          {item.id !== 'greeting' && !item.isError ? (
            <TouchableOpacity
              onPress={() => handleCopy(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={t('copyAnswer')}
            >
              <Ionicons
                name={copiedId === item.id ? 'checkmark-circle' : 'copy-outline'}
                size={15}
                color={copiedId === item.id ? ACCENT : theme.subText}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={[styles.bubbleText, { color: item.isError ? '#FF3B5C' : theme.text }]}>
          {item.text}
        </Text>

        {!item.isError && item.text ? (
          <SpeakButton text={item.text} lang={i18n.language} color={theme.subText} />
        ) : null}
      </View>
    );
  };

  // Stable element (not an inline component) so RecentChatsList and chip rows never remount on send.
  const headerElement = useMemo(
    () => (
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Text style={[styles.sectionHeader, { color: theme.text, flex: 1, marginBottom: 0 }]}>
            {t('advisorTitle')}
          </Text>
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={t('advisorClearChat')}
          >
            <Ionicons name="trash-outline" size={18} color={theme.subText} />
          </TouchableOpacity>
        </View>

        <RecentChatsList theme={theme} compact />

        <Text style={[styles.label, { color: theme.subText, marginTop: 8 }]}>
          {t('scenarioSectionTitle')}
        </Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>
          {t('scenarioSectionHint')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 6 }}
          style={{ marginBottom: 8 }}
        >
          {(LEGAL_SCENARIOS || []).map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => setScenarioId(item.id)}
              style={{
                borderWidth: 1,
                borderColor: theme.borderColor,
                backgroundColor: theme.cardBg,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                maxWidth: 200,
                minWidth: 140,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Ionicons name={item.icon || 'map-outline'} size={16} color={ACCENT} />
                <Text
                  style={[styles.settingLabel, { color: theme.text, fontSize: 13, flex: 1 }]}
                  numberOfLines={2}
                >
                  {t(item.titleKey)}
                </Text>
              </View>
              <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]} numberOfLines={2}>
                {t(item.descriptionKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: theme.subText, marginTop: 4 }]}>
          {t('calcSectionTitle')}
        </Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>
          {t('calcSectionHint')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 6 }}
          style={{ marginBottom: 8 }}
        >
          {(LEGAL_CALCULATORS || []).map((item) => {
            const locked = !isCalculatorAvailable(item.id, calcPack);
            const copy = calculatorCopyKeys(item.id, calcPack);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() =>
                  locked
                    ? showToast(t('calcNotAvailableForCountry'), { type: 'info', duration: 2200 })
                    : setCalculatorId(item.id)
                }
                accessibilityState={{ disabled: locked }}
                style={{
                  borderWidth: 1,
                  borderColor: theme.borderColor,
                  backgroundColor: theme.cardBg,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  maxWidth: 200,
                  minWidth: 140,
                  opacity: locked ? 0.55 : 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Ionicons
                    name={locked ? 'lock-closed-outline' : item.icon || 'calculator-outline'}
                    size={16}
                    color={locked ? theme.subText : ACCENT}
                  />
                  <Text
                    style={[styles.settingLabel, { color: theme.text, fontSize: 13, flex: 1 }]}
                    numberOfLines={2}
                  >
                    {t(copy.titleKey)}
                  </Text>
                </View>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]} numberOfLines={2}>
                  {t(locked ? 'calcNotAvailableForCountry' : copy.descriptionKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.label, { color: theme.subText, marginTop: 4 }]}>
          {t('draftSectionTitle')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 6 }}
          style={{ marginBottom: 8 }}
        >
          {offeredDrafts.map(({ template: item, variant }) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => openDraft(item.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderWidth: 1,
                borderColor: theme.borderColor,
                backgroundColor: theme.cardBg,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                maxWidth: 220,
              }}
            >
              <Ionicons name={item.icon || 'document-text-outline'} size={16} color={ACCENT} />
              <Text
                style={[styles.settingLabel, { color: theme.text, fontSize: 13 }]}
                numberOfLines={1}
              >
                {t(variant.titleKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ marginTop: 4 }}>
          <SelectorField
            theme={theme}
            icon="globe-outline"
            label={t('advisorCountryLabel')}
            value={selectedCountry.label}
            hint={selectedCountry.hint}
            onPress={() => setCountrySheet(true)}
            disabled={sending}
          />
        </View>
      </View>
    ),
    [calcPack, handleClear, i18n.language, offeredDrafts, openDraft, selectedCountry, sending, showToast, t, theme]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        style={{ flex: 1, flexGrow: 1 }}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListHeaderComponent={headerElement}
        contentContainerStyle={[styles.chatList, { flexGrow: 1, paddingBottom: 12 }]}
        onContentSizeChange={() => {
          if (messages.length > 0) scrollToEnd();
        }}
        onScrollBeginDrag={() => {
          if (!sending) followChatRef.current = false;
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListFooterComponent={
          sending ? (
            <View
              style={[
                styles.bubbleAssistant,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.borderColor,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                },
              ]}
            >
              <ActivityIndicator size="small" color={ACCENT} />
              <Text style={[styles.bubbleText, { color: theme.subText }]}>
                {t('advisorThinking')}
              </Text>
            </View>
          ) : null
        }
      />

      <Text style={[styles.chatDisclaimer, { color: theme.subText, flexShrink: 0 }]}>
        {t('advisorDisclaimer')}
      </Text>

      <View style={[styles.chatInputRow, { borderTopColor: theme.borderColor, flexGrow: 0, flexShrink: 0 }]}>
        <TextInput
          style={[
            styles.chatInput,
            {
              backgroundColor: theme.inputBg,
              color: theme.text,
              borderColor: theme.borderColor,
            },
          ]}
          placeholder={t('advisorPlaceholder')}
          placeholderTextColor={theme.subText}
          value={question}
          onChangeText={setQuestion}
          multiline
          editable={!sending}
        />

        <VoiceMicButton
          lang={i18n.language}
          disabled={sending}
          value={question}
          onChangeText={setQuestion}
        />

        <TouchableOpacity
          style={[styles.chatSendBtn, sending && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={sending}
          accessibilityLabel={t('advisorPlaceholder')}
        >
          {sending ? (
            <ActivityIndicator color="#080C14" size="small" />
          ) : (
            <Ionicons name="send" size={18} color="#080C14" />
          )}
        </TouchableOpacity>
      </View>

      <OptionSheet
        visible={countrySheet}
        theme={theme}
        title={t('selectCountryTitle')}
        options={countryOptions}
        selectedCode={country}
        onSelect={onCountryChange}
        onClose={() => setCountrySheet(false)}
        closeLabel={t('closeButton')}
      />

      <ScenarioWizardModal
        visible={!!scenarioId}
        theme={theme}
        scenarioId={scenarioId}
        country={country}
        onClose={() => setScenarioId(null)}
        onAskAdvisor={(prompt) => {
          setQuestion(String(prompt || '').trim());
          showToast(t('scenarioAskAdvisor'), { type: 'info', duration: 1600 });
        }}
        onOpenDraft={(id) => {
          setScenarioId(null);
          openDraft(id);
        }}
      />

      <CalculatorModal
        visible={!!calculatorId}
        theme={theme}
        calculatorId={calculatorId}
        country={country}
        onClose={() => setCalculatorId(null)}
        onAskAdvisor={(prompt) => {
          setQuestion(String(prompt || '').trim());
          showToast(t('calcAskAdvisor'), { type: 'info', duration: 1600 });
        }}
      />

      <DraftWizardModal
        visible={draftOpen}
        theme={theme}
        templateId={draftTemplateId}
        country={country}
        isPro={isPro}
        answersById={draftAnswersById}
        onChangeAnswers={handleDraftAnswers}
        onClearAnswers={clearDraftAnswers}
        openAtPreview={draftOpenAtPreview}
        onNeedPaywall={handleDraftPaywall}
        onClose={() => {
          setDraftOpen(false);
          setDraftOpenAtPreview(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}
