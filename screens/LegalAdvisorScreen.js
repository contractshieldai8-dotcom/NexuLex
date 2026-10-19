import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  I18nManager,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
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
import { LEGAL_CALCULATORS, calculatorCopyKeys, getCalcPack } from '../constants/legalCalcRates';
import { withAvailability } from '../constants/jurisdictionPacks';
import { resolveJurisdiction } from '../constants/jurisdiction';
import { OptionSheet, SelectorField } from '../components/OptionSelector';
import ScenarioWizardModal from '../components/ScenarioWizardModal';
import CalculatorModal from '../components/CalculatorModal';
import DraftWizardModal from '../components/DraftWizardModal';
import DocumentExplainerSheet from '../components/DocumentExplainerSheet';
import CaseHubSheet from '../components/CaseHubSheet';
import LegalAskSheet from '../components/LegalAskSheet';
import ProcessGuideSheet from '../components/ProcessGuideSheet';
import ProToolsSheet from '../components/ProToolsSheet';
import LawyerHandoffSheet from '../components/LawyerHandoffSheet';
import { PROCESS_GUIDES } from '../constants/processGuides';
import { packDepthFor } from '../constants/packDepth';
import { ADVISOR_HOME_JOBS } from '../constants/advisorHome';
import { loadCases } from '../services/caseFileStore';
import { DRAFT_CATALOG, DRAFT_FREE_PREVIEW_LINES, resolveDraftVariant } from '../constants/draftTemplates';
import VoiceMicButton from '../components/VoiceMicButton';
import SpeakButton from '../components/SpeakButton';
import RecentChatsList from '../components/RecentChatsList';
import { ReportAiButton } from '../components/AiReportSheet';
import HonestyFold from '../components/HonestyFold';
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
  plan = 'free',
  onNeedPaywall,
  paywallVisible = false,
  isActive = true,
  guideAction = null,
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
  const [docExplainOpen, setDocExplainOpen] = useState(false);
  const [docExplainEntryId, setDocExplainEntryId] = useState(null);
  const pendingExplainReturnRef = useRef(false);
  const [caseHubOpen, setCaseHubOpen] = useState(false);
  const [caseOpenId, setCaseOpenId] = useState(null);
  const [caseImport, setCaseImport] = useState(null);
  const [caseCount, setCaseCount] = useState(0);
  const pendingCaseReturnRef = useRef(false);
  const [askOpen, setAskOpen] = useState(false);
  const [askPrefill, setAskPrefill] = useState(null);
  const pendingAskReturnRef = useRef(false);
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [guideOpenId, setGuideOpenId] = useState(null);
  const [caseSeed, setCaseSeed] = useState(null);
  const [proToolsOpen, setProToolsOpen] = useState(false);
  const [proSeed, setProSeed] = useState(null);
  const pendingProReturnRef = useRef(false);
  const [lawyerOpen, setLawyerOpen] = useState(false);
  const [lawyerSeed, setLawyerSeed] = useState(null);
  const pendingLawyerReturnRef = useRef(false);
  const pendingDraftReturnRef = useRef(null);
  const paywallWasVisibleRef = useRef(paywallVisible);

  const calcPack = useMemo(() => getCalcPack(country, i18n.language), [country, i18n.language]);
  const availCtx = useMemo(() => ({ country, language: i18n.language }), [country, i18n.language]);
  const scenarioItems = useMemo(() => withAvailability('scenario', LEGAL_SCENARIOS, availCtx), [availCtx]);
  const calculatorItems = useMemo(() => withAvailability('calculator', LEGAL_CALCULATORS, availCtx), [availCtx]);
  const offeredDrafts = useMemo(() => {
    const jurisdiction = resolveJurisdiction(country, i18n.language);
    return withAvailability('draft', DRAFT_CATALOG, availCtx).map(({ item, availability, universal }) => ({
      template: item,
      variant:
        resolveDraftVariant(item, jurisdiction) || resolveDraftVariant(item, 'TR') || resolveDraftVariant(item, null),
      availability,
      universal,
    }));
  }, [availCtx, country, i18n.language]);
  const pendingCountryLabel = useMemo(() => {
    const code = resolveJurisdiction(country, i18n.language);
    const match = JURISDICTIONS.find((item) => item.code === code);
    return match ? t(match.labelKey) : code || '';
  }, [country, i18n.language, t]);
  const packDepth = useMemo(() => packDepthFor(country, i18n.language), [country, i18n.language]);

  const openHomeJob = useCallback((open) => {
    if (open === 'ask') setAskOpen(true);
    else if (open === 'guides') {
      setGuideOpenId(null);
      setGuidesOpen(true);
    } else if (open === 'case') {
      setCaseImport(null);
      setCaseOpenId(null);
      setCaseHubOpen(true);
    } else if (open === 'lawyer') {
      setLawyerSeed(null);
      setLawyerOpen(true);
    }
  }, []);

  const showPendingToast = useCallback(
    () => showToast(t('availPendingToast'), { type: 'info', duration: 2400 }),
    [showToast, t]
  );

  const openDraft = useCallback((id = null, { atPreview = false } = {}) => {
    setDraftTemplateId(id);
    setDraftOpenAtPreview(atPreview);
    setDraftOpen(true);
  }, []);

  // WAVE GD.2 — guide deep link (App already checked availability and switched to this tab).
  useEffect(() => {
    if (!guideAction?.nonce) return;
    listRef.current?.scrollToOffset?.({ offset: 0, animated: false });
    if (guideAction.type === 'openCalculator') setCalculatorId(guideAction.id);
    else if (guideAction.type === 'openScenario') setScenarioId(guideAction.id);
    else if (guideAction.type === 'openDraft') openDraft(guideAction.id);
    else if (guideAction.type === 'openAdvisorTool' && guideAction.id === 'doc_explainer') {
      setDocExplainEntryId(guideAction.entryId || null);
      setDocExplainOpen(true);
    } else if (guideAction.type === 'openAdvisorTool' && guideAction.id === 'case_files') {
      setCaseOpenId(guideAction.entryId || null);
      setCaseHubOpen(true);
    } else if (guideAction.type === 'openAdvisorTool' && guideAction.id === 'legal_ask') {
      setAskOpen(true);
    } else if (guideAction.type === 'openAdvisorTool' && guideAction.id === 'process_guides') {
      setGuideOpenId(guideAction.entryId || null);
      setGuidesOpen(true);
    } else if (guideAction.type === 'openAdvisorTool' && guideAction.id === 'pro_tools') {
      setProSeed(null);
      setProToolsOpen(true);
    } else if (guideAction.type === 'openAdvisorTool' && guideAction.id === 'lawyer_handoff') {
      setLawyerSeed(null);
      setLawyerOpen(true);
    }
  }, [guideAction, openDraft]);

  // WAVE LR.4 — guide hand-offs; iOS presents one modal at a time, so open after the guide dismisses.
  const openAskFromGuide = useCallback((prefill) => {
    setGuidesOpen(false);
    setAskPrefill(prefill);
    setTimeout(() => setAskOpen(true), 400);
  }, []);

  const openCaseFromGuide = useCallback((seed) => {
    setGuidesOpen(false);
    setCaseImport(null);
    setCaseOpenId(null);
    setCaseSeed(seed);
    setTimeout(() => setCaseHubOpen(true), 400);
  }, []);

  // WAVE LR.5 — Professional workbench, optionally seeded from a case file.
  const openProToolsFromCase = useCallback((caseItem) => {
    setCaseHubOpen(false);
    setProSeed(caseItem ? { caseItem } : null);
    setTimeout(() => setProToolsOpen(true), 400);
  }, []);

  // WAVE LR.6 — lawyer hand-off from a case, an answer or a guide; the source sheet closes first.
  const openLawyerFrom = useCallback((seed) => {
    setCaseHubOpen(false);
    setAskOpen(false);
    setGuidesOpen(false);
    setLawyerSeed(seed || null);
    setTimeout(() => setLawyerOpen(true), 400);
  }, []);

  const handleLawyerPaywall = useCallback(() => {
    pendingLawyerReturnRef.current = true;
    setLawyerOpen(false);
    onNeedPaywall?.('lawyer');
  }, [onNeedPaywall]);

  const handleProPaywall = useCallback(() => {
    pendingProReturnRef.current = true;
    setProToolsOpen(false);
    onNeedPaywall?.('professional');
  }, [onNeedPaywall]);

  const handleAskPaywall = useCallback(() => {
    pendingAskReturnRef.current = true;
    setAskOpen(false);
    onNeedPaywall?.('ask');
  }, [onNeedPaywall]);

  const handleExplainPaywall = useCallback(() => {
    pendingExplainReturnRef.current = true;
    setDocExplainOpen(false);
    onNeedPaywall?.('explain');
  }, [onNeedPaywall]);

  // WAVE LR.2 — case files (device-local).
  useEffect(() => {
    if (!isActive) return undefined;
    let alive = true;
    loadCases().then((list) => alive && setCaseCount(list.length));
    return () => {
      alive = false;
    };
  }, [isActive]);

  const handleCasePaywall = useCallback(() => {
    pendingCaseReturnRef.current = true;
    setCaseHubOpen(false);
    onNeedPaywall?.('cases');
  }, [onNeedPaywall]);

  const openCaseImport = useCallback((explanation) => {
    setDocExplainOpen(false);
    setCaseImport(explanation);
    setCaseOpenId(null);
    // iOS presents one modal at a time: open after the explainer finishes dismissing.
    setTimeout(() => setCaseHubOpen(true), 400);
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

  useEffect(() => {
    if (!paywallClosedTick || paywallVisible || !isActive || !pendingExplainReturnRef.current) return undefined;
    let timer = null;
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        if (!pendingExplainReturnRef.current) return;
        pendingExplainReturnRef.current = false;
        setDocExplainOpen(true);
      }, 400);
    });
    return () => {
      task?.cancel?.();
      if (timer) clearTimeout(timer);
    };
  }, [isActive, paywallClosedTick, paywallVisible]);

  useEffect(() => {
    if (!paywallClosedTick || paywallVisible || !isActive || !pendingCaseReturnRef.current) return undefined;
    let timer = null;
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        if (!pendingCaseReturnRef.current) return;
        pendingCaseReturnRef.current = false;
        setCaseHubOpen(true);
      }, 400);
    });
    return () => {
      task?.cancel?.();
      if (timer) clearTimeout(timer);
    };
  }, [isActive, paywallClosedTick, paywallVisible]);

  useEffect(() => {
    if (!paywallClosedTick || paywallVisible || !isActive || !pendingAskReturnRef.current) return undefined;
    let timer = null;
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        if (!pendingAskReturnRef.current) return;
        pendingAskReturnRef.current = false;
        setAskOpen(true);
      }, 400);
    });
    return () => {
      task?.cancel?.();
      if (timer) clearTimeout(timer);
    };
  }, [isActive, paywallClosedTick, paywallVisible]);

  useEffect(() => {
    if (!paywallClosedTick || paywallVisible || !isActive || !pendingProReturnRef.current) return undefined;
    let timer = null;
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        if (!pendingProReturnRef.current) return;
        pendingProReturnRef.current = false;
        setProToolsOpen(true);
      }, 400);
    });
    return () => {
      task?.cancel?.();
      if (timer) clearTimeout(timer);
    };
  }, [isActive, paywallClosedTick, paywallVisible]);

  useEffect(() => {
    if (!paywallClosedTick || paywallVisible || !isActive || !pendingLawyerReturnRef.current) return undefined;
    let timer = null;
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        if (!pendingLawyerReturnRef.current) return;
        pendingLawyerReturnRef.current = false;
        setLawyerOpen(true);
      }, 400);
    });
    return () => {
      task?.cancel?.();
      if (timer) clearTimeout(timer);
    };
  }, [isActive, paywallClosedTick, paywallVisible]);

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
          <Text style={[styles.bubbleMeta, { color: theme.accent }]}>{t('advisorYou')}</Text>
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
            <TouchableOpacity accessibilityRole="button"
              onPress={() => handleCopy(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={t('copyAnswer')}
            >
              <Ionicons
                name={copiedId === item.id ? 'checkmark-circle' : 'copy-outline'}
                size={15}
                color={copiedId === item.id ? theme.accent : theme.subText}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={[styles.bubbleText, { color: item.isError ? theme.danger : theme.text }]}>
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
        <Text style={[styles.sectionHeader, { color: theme.text, marginBottom: 4 }]}>
          {t('advisorTitle')}
        </Text>

        <Text style={[styles.label, { color: theme.subText, marginTop: 10, marginBottom: 4 }]}>{t('ahTitle')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>
          {t('ahHint')} {pendingCountryLabel}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
          {ADVISOR_HOME_JOBS.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => openHomeJob(item.open)}
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.borderColor,
                backgroundColor: theme.cardBg,
              }}
            >
              <Ionicons name={item.icon} size={14} color={theme.accent} />
              <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>{t(item.titleKey)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 8, marginBottom: 0 }]}>{t('ux4Disclaimer')}</Text>
        <HonestyFold theme={theme} label={t('foldLabel')} showLabel={t('foldShow')} hideLabel={t('foldHide')}>
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('ux4Ask')}</Text>
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('ux4Guides')}</Text>
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('ux4Case')}</Text>
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('ux4Lawyer')}</Text>
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('ux4Country')}</Text>
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('ux4Free')}</Text>
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('ux4NoPay')}</Text>
        </HonestyFold>
        <View
          style={{
            borderWidth: 1,
            borderColor: theme.borderColor,
            backgroundColor: theme.cardBg,
            borderRadius: 14,
            padding: 14,
            marginTop: 10,
            marginBottom: 8,
          }}
        >
          <Text style={[styles.settingLabel, { color: theme.text, fontSize: 15 }]}>{t('jp3Title')}</Text>
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 8 }]}>
            {packDepth.statutoryLive
              ? t('jp3HintStatutory', { date: packDepth.asOfDate || '' })
              : packDepth.packPending
                ? t('jp3Pending')
                : t('jp3HintUniversal')}
          </Text>
          {packDepth.portal ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(packDepth.portal).catch(() => showToast(t('askLinkFailed'), { type: 'error' }))}
              accessibilityRole="link"
              style={{ marginBottom: 8 }}
            >
              <Text style={[styles.sectionHint, { color: theme.accent, marginBottom: 0 }]}>{t('jp3Portal')}</Text>
            </TouchableOpacity>
          ) : null}
          {packDepth.officialCount ? (
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>
              {t('jp3Bodies', { count: String(packDepth.officialCount) })}
            </Text>
          ) : null}
          <TouchableOpacity
            onPress={() => openHomeJob('guides')}
            accessibilityRole="button"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <Text style={[styles.sectionHint, { color: theme.accent, marginBottom: 0, flex: 1 }]}>{t('jp3SeeGuides')}</Text>
            <Ionicons name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color={theme.accent} />
          </TouchableOpacity>
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 12, marginBottom: 0 }]}>{t('jp3Disclaimer')}</Text>
        </View>
        {messages.length <= 1 ? (
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6, marginBottom: 4 }]}>
            {t('ahEmptyLead')} {t('ahEmptyTail')}
          </Text>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setAskOpen(true)}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderWidth: 1,
            borderColor: theme.accent,
            backgroundColor: `${ACCENT}14`,
            borderRadius: 14,
            padding: 14,
            marginTop: 8,
          }}
        >
          <Ionicons name="help-buoy-outline" size={26} color={theme.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.text, fontSize: 15 }]}>{t('askCardTitle')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 2 }]}>
              {t('askCardHint')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.accent} />
        </TouchableOpacity>
        <HonestyFold theme={theme} label={t('foldLabel')} showLabel={t('foldShow')} hideLabel={t('foldHide')}>
          <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 4 }]}>
            {t('ux8Server')}
          </Text>
        </HonestyFold>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            setDocExplainEntryId(null);
            setDocExplainOpen(true);
          }}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderWidth: 1,
            borderColor: theme.accent,
            backgroundColor: theme.cardBg,
            borderRadius: 14,
            padding: 14,
            marginVertical: 8,
          }}
        >
          <Ionicons name="document-attach-outline" size={26} color={theme.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.text, fontSize: 15 }]}>{t('docExplainCardTitle')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 2 }]}>
              {t('docExplainCardHint')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.accent} />
        </TouchableOpacity>
        <HonestyFold theme={theme} label={t('foldLabel')} showLabel={t('foldShow')} hideLabel={t('foldHide')}>
          <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>{t('ux9Deadlines')}</Text>
        </HonestyFold>

        <TouchableOpacity
          onPress={() => {
            setCaseImport(null);
            setCaseOpenId(null);
            setCaseHubOpen(true);
          }}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderWidth: 1,
            borderColor: theme.borderColor,
            backgroundColor: theme.cardBg,
            borderRadius: 14,
            padding: 14,
            marginBottom: 8,
          }}
        >
          <Ionicons name="folder-open-outline" size={26} color={theme.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.text, fontSize: 15 }]}>
              {t('caseCardTitle')}
              {caseCount ? ` (${caseCount})` : ''}
            </Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 2 }]}>
              {t('caseCardHint')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.accent} />
        </TouchableOpacity>
        <HonestyFold theme={theme} label={t('foldLabel')} showLabel={t('foldShow')} hideLabel={t('foldHide')}>
          <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>{t('ux7OnDevice')}</Text>
        </HonestyFold>

        <TouchableOpacity
          onPress={() => {
            setGuideOpenId(null);
            setGuidesOpen(true);
          }}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderWidth: 1,
            borderColor: theme.borderColor,
            backgroundColor: theme.cardBg,
            borderRadius: 14,
            padding: 14,
            marginBottom: 8,
          }}
        >
          <Ionicons name="map-outline" size={26} color={theme.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.text, fontSize: 15 }]}>
              {t('pgCardTitle')} ({PROCESS_GUIDES.length})
            </Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 2 }]}>
              {t('pgCardHint')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.accent} />
        </TouchableOpacity>
        <HonestyFold theme={theme} label={t('foldLabel')} showLabel={t('foldShow')} hideLabel={t('foldHide')}>
          <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>
            {t('ux10Free', { guides: String(PROCESS_GUIDES.length) })}
          </Text>
        </HonestyFold>

        <TouchableOpacity
          onPress={() => {
            setProSeed(null);
            setProToolsOpen(true);
          }}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderWidth: 1,
            borderColor: plan === 'professional' ? theme.accent : theme.borderColor,
            backgroundColor: theme.cardBg,
            borderRadius: 14,
            padding: 14,
            marginBottom: 8,
          }}
        >
          <Ionicons name="ribbon-outline" size={26} color={theme.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.text, fontSize: 15 }]}>
              {t('ptCardTitle')}
            </Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 2 }]}>
              {t('ptCardHint')}
            </Text>
          </View>
          {plan === 'professional' ? (
            <Ionicons name="chevron-forward" size={18} color={theme.accent} />
          ) : (
            <Text style={{ color: theme.accent, fontSize: 11, fontWeight: '800' }}>{t('planProfessionalBadge')}</Text>
          )}
        </TouchableOpacity>
        <HonestyFold theme={theme} label={t('foldLabel')} showLabel={t('foldShow')} hideLabel={t('foldHide')}>
          <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>{t('ux14Plan')}</Text>
        </HonestyFold>

        <TouchableOpacity
          onPress={() => {
            setLawyerSeed(null);
            setLawyerOpen(true);
          }}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderWidth: 1,
            borderColor: theme.borderColor,
            backgroundColor: theme.cardBg,
            borderRadius: 14,
            padding: 14,
            marginBottom: 8,
          }}
        >
          <Ionicons name="briefcase-outline" size={26} color={theme.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: theme.text, fontSize: 15 }]}>
              {t('lhCardTitle')}
            </Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 2 }]}>
              {t('lhCardHint')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.accent} />
        </TouchableOpacity>
        <HonestyFold theme={theme} label={t('foldLabel')} showLabel={t('foldShow')} hideLabel={t('foldHide')}>
          <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>{t('ux6NoList')}</Text>
        </HonestyFold>

        <RecentChatsList theme={theme} compact />

        <Text style={[styles.label, { color: theme.subText, marginTop: 8 }]}>
          {t('scenarioSectionTitle')} · {scenarioItems.filter((row) => row.availability === 'available').length}
        </Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>
          {t('scenarioSectionHint')}
        </Text>
        <HonestyFold theme={theme} label={t('foldLabel')} showLabel={t('foldShow')} hideLabel={t('foldHide')}>
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 0, marginBottom: 0 }]}>
            {t('ux16Local')}
          </Text>
        </HonestyFold>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 6 }}
          style={{ marginBottom: 8 }}
        >
          {scenarioItems.map(({ item, availability }) => (
            <TouchableOpacity accessibilityRole="button"
              key={item.id}
              activeOpacity={0.85}
              onPress={() => (availability === 'pending' ? showPendingToast() : setScenarioId(item.id))}
              accessibilityState={{ disabled: availability === 'pending' }}
              style={{
                opacity: availability === 'pending' ? 0.55 : 1,
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
                <Ionicons name={item.icon || 'map-outline'} size={16} color={theme.accent} />
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
          {t('calcSectionTitle')} · {calculatorItems.filter((row) => row.availability === 'available').length}
        </Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>
          {t('calcSectionHint')}
        </Text>
        <HonestyFold theme={theme} label={t('foldLabel')} showLabel={t('foldShow')} hideLabel={t('foldHide')}>
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 0, marginBottom: 0 }]}>
            {t('ux12Table')}
          </Text>
        </HonestyFold>
        {calculatorItems.some((row) => row.availability === 'pending') ? (
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: -4, marginBottom: 8 }]}>
            {t('availPendingLine', { country: pendingCountryLabel })}
          </Text>
        ) : null}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 6 }}
          style={{ marginBottom: 8 }}
        >
          {calculatorItems.map(({ item, availability, universal }) => {
            const locked = availability === 'pending';
            const copy = calculatorCopyKeys(item.id, calcPack);
            return (
              <TouchableOpacity accessibilityRole="button"
                key={item.id}
                activeOpacity={0.85}
                onPress={() => (locked ? showPendingToast() : setCalculatorId(item.id))}
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
                    color={locked ? theme.subText : theme.accent}
                  />
                  <Text
                    style={[styles.settingLabel, { color: theme.text, fontSize: 13, flex: 1 }]}
                    numberOfLines={2}
                  >
                    {t(copy.titleKey)}
                  </Text>
                  {universal ? (
                    <Ionicons name="globe-outline" size={12} color={theme.subText} accessibilityLabel={t('availUniversal')} />
                  ) : null}
                </View>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]} numberOfLines={2}>
                  {t(locked ? 'availPendingBadge' : copy.descriptionKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.label, { color: theme.subText, marginTop: 4 }]}>
          {t('draftSectionTitle')} · {offeredDrafts.filter((row) => row.availability === 'available').length}
        </Text>
        <HonestyFold theme={theme} label={t('foldLabel')} showLabel={t('foldShow')} hideLabel={t('foldHide')}>
          <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>
            {t('ux13Preview', { previewLines: String(DRAFT_FREE_PREVIEW_LINES) })}
          </Text>
        </HonestyFold>
        {offeredDrafts.some((row) => row.availability === 'pending') ? (
          <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>
            {t('availPendingLine', { country: pendingCountryLabel })}
          </Text>
        ) : null}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 6 }}
          style={{ marginBottom: 8 }}
        >
          {offeredDrafts.map(({ template: item, variant, availability, universal }) => (
            <TouchableOpacity accessibilityRole="button"
              key={item.id}
              activeOpacity={0.85}
              onPress={() => (availability === 'pending' ? showPendingToast() : openDraft(item.id))}
              accessibilityState={{ disabled: availability === 'pending' }}
              accessibilityHint={availability === 'pending' ? t('availPendingBadge') : undefined}
              style={{
                opacity: availability === 'pending' ? 0.55 : 1,
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
              <Ionicons
                name={availability === 'pending' ? 'lock-closed-outline' : item.icon || 'document-text-outline'}
                size={16}
                color={availability === 'pending' ? theme.subText : theme.accent}
              />
              <Text
                style={[styles.settingLabel, { color: theme.text, fontSize: 13, flexShrink: 1 }]}
                numberOfLines={1}
              >
                {t(variant.titleKey)}
              </Text>
              {universal ? (
                <Ionicons name="globe-outline" size={12} color={theme.subText} accessibilityLabel={t('availUniversal')} />
              ) : null}
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
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
            <TouchableOpacity
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={t('advisorClearChat')}
            >
              <Ionicons name="trash-outline" size={18} color={theme.subText} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [
      calcPack,
      calculatorItems,
      caseCount,
      handleClear,
      i18n.language,
      messages.length,
      offeredDrafts,
      openDraft,
      openHomeJob,
      packDepth,
      pendingCountryLabel,
      plan,
      showToast,
      scenarioItems,
      selectedCountry,
      sending,
      showPendingToast,
      t,
      theme,
    ]
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
              <ActivityIndicator size="small" color={theme.accent} />
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
        <TextInput accessibilityLabel={t('advisorPlaceholder')}
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

        <TouchableOpacity accessibilityRole="button"
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
          setTimeout(() => openDraft(id), 400);
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

      <DocumentExplainerSheet
        visible={docExplainOpen}
        theme={theme}
        country={country}
        isPro={isPro}
        openEntryId={docExplainEntryId}
        onNeedPaywall={handleExplainPaywall}
        onAskAdvisor={(prompt) => {
          setDocExplainOpen(false);
          setQuestion(String(prompt || '').trim());
          showToast(t('docExplainAskAdvisorToast'), { type: 'info', duration: 1600 });
        }}
        onOpenCalculator={(id) => {
          setDocExplainOpen(false);
          setTimeout(() => setCalculatorId(id), 400);
        }}
        onAddToCase={openCaseImport}
        onClose={() => setDocExplainOpen(false)}
      />

      <CaseHubSheet
        visible={caseHubOpen}
        theme={theme}
        country={country}
        isPro={isPro}
        openCaseId={caseOpenId}
        importExplanation={caseImport}
        onImportDone={() => setCaseImport(null)}
        seed={caseSeed}
        onNeedPaywall={handleCasePaywall}
        onChanged={(list) => setCaseCount(list.length)}
        onAskAdvisor={(prompt) => {
          setCaseHubOpen(false);
          setQuestion(String(prompt || '').trim());
          showToast(t('caseAdvisorToast'), { type: 'info', duration: 1600 });
        }}
        onOpenProTools={openProToolsFromCase}
        onOpenLawyer={(caseItem) => openLawyerFrom(caseItem ? { caseId: caseItem.id } : null)}
        onClose={() => {
          setCaseHubOpen(false);
          setCaseImport(null);
          setCaseSeed(null);
        }}
      />

      <LegalAskSheet
        visible={askOpen}
        theme={theme}
        country={country}
        isPro={isPro}
        prefill={askPrefill}
        onNeedPaywall={handleAskPaywall}
        onAskAdvisor={(prompt) => {
          setAskOpen(false);
          setQuestion(String(prompt || '').trim());
          showToast(t('askAdvisorToast'), { type: 'info', duration: 1600 });
        }}
        onOpenCalculator={(id) => {
          setAskOpen(false);
          setTimeout(() => setCalculatorId(id), 400);
        }}
        onFindLawyer={openLawyerFrom}
        onClose={() => {
          setAskOpen(false);
          setAskPrefill(null);
        }}
      />

      <ProcessGuideSheet
        visible={guidesOpen}
        theme={theme}
        country={country}
        openGuideId={guideOpenId}
        onAsk={openAskFromGuide}
        onStartCase={openCaseFromGuide}
        onOpenCalculator={(id) => {
          setGuidesOpen(false);
          setTimeout(() => setCalculatorId(id), 400);
        }}
        onFindLawyer={openLawyerFrom}
        onClose={() => setGuidesOpen(false)}
      />

      <ProToolsSheet
        visible={proToolsOpen}
        theme={theme}
        country={country}
        plan={plan}
        seed={proSeed}
        onNeedPaywall={handleProPaywall}
        onClose={() => {
          setProToolsOpen(false);
          setProSeed(null);
        }}
      />

      <LawyerHandoffSheet
        visible={lawyerOpen}
        theme={theme}
        country={country}
        isPro={isPro}
        seed={lawyerSeed}
        onNeedPaywall={handleLawyerPaywall}
        onClose={() => {
          setLawyerOpen(false);
          setLawyerSeed(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}
