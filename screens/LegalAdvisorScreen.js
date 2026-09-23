import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';

import { ACCENT, styles } from '../theme';
import { JURISDICTIONS } from '../constants/options';
import { LEGAL_SCENARIOS } from '../constants/legalScenarios';
import { LEGAL_CALCULATORS } from '../constants/legalCalcRates';
import { OptionSheet, SelectorField } from '../components/OptionSelector';
import ScenarioWizardModal from '../components/ScenarioWizardModal';
import CalculatorModal from '../components/CalculatorModal';
import DraftWizardModal from '../components/DraftWizardModal';
import { DRAFT_TEMPLATES } from '../constants/draftTemplates';
import VoiceMicButton from '../components/VoiceMicButton';
import SpeakButton from '../components/SpeakButton';
import RecentChatsList from '../components/RecentChatsList';
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

  const openDraft = useCallback((id = null) => {
    setDraftTemplateId(id);
    setDraftOpen(true);
  }, []);

  const countryOptions = useMemo(
    () => (JURISDICTIONS || []).map((item) => ({ code: item.code, label: t(item.labelKey), hint: item.hint })),
    [t]
  );

  const selectedCountry = countryOptions.find((item) => item.code === country) || countryOptions[0];

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = question.trim();

    if (!trimmed) {
      showToast(t('advisorEmptyQuestion'), { type: 'warning' });
      return;
    }

    const userMessage = { id: nextMessageId(), role: 'user', text: trimmed };
    const historySnapshot = messages.filter((msg) => msg.id !== 'greeting');

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setSending(true);
    scrollToEnd();

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
      scrollToEnd();
    }
  }, [analysisContext, country, i18n.language, messages, question, scrollToEnd, setMessages, showToast, t]);

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
    if (choice === 'confirm') resetActive({ archive: true, country });
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
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
          {(LEGAL_CALCULATORS || []).map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => setCalculatorId(item.id)}
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
                <Ionicons name={item.icon || 'calculator-outline'} size={16} color={ACCENT} />
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
          {t('draftSectionTitle')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 6 }}
          style={{ marginBottom: 8 }}
        >
          {DRAFT_TEMPLATES.map((item) => (
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
                {t(item.titleKey)}
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
      </TouchableWithoutFeedback>

      <FlatList
        ref={listRef}
        style={{ flex: 1, flexGrow: 1 }}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={scrollToEnd}
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

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Text style={[styles.chatDisclaimer, { color: theme.subText }]}>
          {t('advisorDisclaimer')}
        </Text>
      </TouchableWithoutFeedback>

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
        onNeedPaywall={() => {
          setDraftOpen(false);
          onNeedPaywall?.();
        }}
        onClose={() => setDraftOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}
