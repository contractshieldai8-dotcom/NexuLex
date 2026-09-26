import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  StatusBar,
  Switch,
  Image,
  Modal,
  InteractionManager,
  findNodeHandle,
  Platform,
  Keyboard,
  I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import './i18n';
import { useTranslation } from 'react-i18next';
import { analyzeContract, analyzeContractImages, analyzeContractDocument, reviseParagraphSlice, looksIncompleteExtract, AI_ERROR_CODES } from './services/ai';
import { supabase } from './services/supabase';
import Auth from './components/Auth';
import KeyboardScreen from './components/KeyboardScreen';
import ContractAnalyzer from './components/ContractAnalyzer';
import AnalysisProgress from './components/AnalysisProgress';
import RiskGauge from './components/RiskGauge';
import { OptionSheet, SelectorField } from './components/OptionSelector';
import HistoryScreen from './screens/HistoryScreen';
import ShareBriefScreen from './screens/ShareBriefScreen';
import ShareBriefSheet from './components/ShareBriefSheet';
import AdvisorSeatCard from './components/AdvisorSeatCard';
import LegalAdvisorScreen from './screens/LegalAdvisorScreen';
import LegalContractGenerator from './screens/LegalContractGenerator';
import SupportScreen from './screens/SupportScreen';
import PaywallScreen from './screens/PaywallScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import { AUTH_LINK_RESULTS, handleAuthDeepLink } from './utils/authLinks';
import { createAuthRedirectUrl } from './utils/authRedirects';
import { parseShareCode, SHARE_CODE_RE } from './utils/shareSnapshot';
import { readOwnedFile, writeOwnedBase64, isExpoGoUri, trySaveBase64ViaSaf } from './utils/fileAccess';
import { paginatePlainBody } from './utils/exportPlain';
import { darkTheme, lightTheme, getRiskColor, badgeLabelStyle, styles, ACCENT, DANGER, WARNING, alignStart } from './theme';
import { normalizeAnalysis, getKeyTakeaways, escapeHtml, applyFreePreview, toDecisionCardPayload, pickPaywallHook, hasHiddenCosts, integrityHasWarnings, safeDisplayText, ensureTrapCalendar, FROST_TRAP_DATES, legalStatusKey, legalStatusEmoji, meaningfulRedFlags, buildAdvisorAnalysisContext, userSignConditions, isBillableAnalysis, isAcceptableAnalysis, isPlaceholderText, buildLocalRadarPreview, pickCounterOffer, countOfferTiers, buildReadyToSendMessage } from './utils/analysis';
import { describeError } from './utils/errors';
import { loadStoredLanguage, setAppLanguage } from './utils/language';
import { loadStoredParty, savePartyRole } from './utils/party';
import { buildPartyChoiceCards, flipPartyCode } from './utils/partyCards';
import {
  deviceRegion,
  isIntentOnboarded,
  isLocaleOnboarded,
  loadStoredJurisdiction,
  markIntentOnboarded,
  markLocaleOnboarded,
  persistJurisdiction,
  suggestJurisdiction,
} from './utils/locale';
import { FIRST_INTENTS, actionForIntent } from './constants/firstIntent';
import { jobForScanSuccess } from './constants/scanSuccess';
import { collectResumeItems, shouldOfferResumeSheet, actionForResume } from './constants/sessionResume';
import { loadResumeDraft, saveResumeDraft, clearResumeDraft, isUsableDraft } from './utils/sessionResume';
import { isShareLoopSeen, markShareLoopSeen } from './utils/shareLoop';
import { isScanSuccessSeen, markScanSuccessSeen } from './utils/scanSuccess';
import { loadCases } from './services/caseFileStore';
import { loadSavedAnswers } from './services/legalAsk';
import { mergeDeadlines, loadUpcomingDeadlines, sortDeadlines, kindLabelKey, nextAnniversary, parseIsoDate } from './utils/deadlines';
import {
  APP_LANGUAGES,
  JURISDICTIONS,
  REPORT_LANGUAGES,
  PARTY_ROLES,
  resolveReportLanguage,
  categoryFromTypeKey,
  toUserPartyRole,
  resolvePartyForAnalyze,
  coercePartyForCategory,
  partyRolesForCategory,
  isGranularPartyCode,
  CONTRACT_CATEGORIES,
  getLanguage,
  getJurisdiction,
  typeKeyFromCategory,
} from './constants/options';
import {
  consumeAnalysisCredit,
  fetchProfile,
  QUOTA_ERRORS,
  remainingAnalyses,
  syncProfileAndQuota,
} from './services/quota';
import { playbookItemById, statuteFor, getPlaybook } from './constants/playbooks';
import DecisionCard from './components/DecisionCard';
import ContractMiniRadar from './components/ContractMiniRadar';
import LockedSection from './components/LockedSection';
import DeadlineRadar from './components/DeadlineRadar';
import {
  ConversionHook,
  ValidityLayer,
  LawyerQuestions,
  HiddenCostsCard,
  CounterProposals,
  ObligationsChecklist,
  IntegrityChecks,
  PlaybookCard,
  CostWidget,
  VoiceBriefButton,
  RiskSummary,
  ClauseNavigator,
} from './components/AnalysisLayers';
import DiffTool from './components/DiffTool';
import ShieldDocumentCard from './components/ShieldDocumentCard';
import NexuLexGuideSheet from './components/NexuLexGuideSheet';
import FirstIntentSheet from './components/FirstIntentSheet';
import ResumeSessionSheet from './components/ResumeSessionSheet';
import ShareLoopSheet from './components/ShareLoopSheet';
import ScanSuccessSheet from './components/ScanSuccessSheet';
import { getAvailability } from './constants/jurisdictionPacks';
import LifecycleChips from './components/LifecycleChips';
import VoiceMicButton from './components/VoiceMicButton';
import { shareIcsCalendar } from './utils/calendarExport';
import { detectContractType, isSalesPreamble, isSaasPreamble, resolveAnalysisCategory } from './utils/contractType';
import { saveContractReminders } from './services/reminders';
import { scheduleTrapReminders, subscribeReminderOpens } from './services/notifications';
import { LIFECYCLES, lifecycleLabelKey, normalizeLifecycle } from './utils/lifecycle';
import { resolveSourceText } from './utils/shieldDocument';
import { PLAN_LIMITS, planOf } from './utils/plan';
import { syncEntitlement } from './services/purchases';
import { useFeedback, FeedbackProvider } from './context/FeedbackContext';
import { AdvisorChatProvider, useAdvisorChat } from './context/AdvisorChatContext';
import { ReportAiButton } from './components/AiReportSheet';
import { deleteAccountAndPurge, openSubscriptionManagement } from './services/account';
import { TRUST_URLS } from './constants/settingsTrust';
import { corridorMessage } from './constants/localeCorridor';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_ANALYSIS_KEY = '@nexulex/last_analysis_id';
const GUIDE_ITEM_TYPES = { openCalculator: 'calculator', openDraft: 'draft', openScenario: 'scenario' };

// Analiz butonunda gösterilecek dinamik durum metinleri.
const PROGRESS_LABELS = {
  parsing: 'progressExtract',
  jurisdiction: 'progressShield',
  risks: 'progressClauses',
  clauses: 'progressClauses',
  report: 'progressShield',
};

const asList = (value) => (Array.isArray(value) ? value : []);

const sanitizeAnalysisRow = (row) => {
  if (!row || typeof row !== 'object') return row;
  const counter = row.counter_message ?? row.counterMessage ?? null;
  const sign = row.sign_conditions ?? row.signConditions ?? [];
  const status = row.sign_status ?? row.signStatus ?? null;
  const source = row.contract_text ?? row.contractText ?? '';
  const revised = row.revised_contract_text ?? row.revisedContractText ?? '';
  return {
    ...row,
    counter_message: counter,
    counterMessage: counter,
    sign_conditions: sign,
    signConditions: sign,
    sign_status: status,
    signStatus: status,
    contract_text: source,
    contractText: source,
    revised_contract_text: revised,
    revisedContractText: revised,
    lifecycle: row.lifecycle || 'draft',
  };
};

const stripMissingColumn = (row, error) => {
  const message = String(error?.message || error?.details || '');
  const match =
    message.match(/'([^']+)' column/i) ||
    message.match(/column ['"]([^'"]+)['"]/i) ||
    message.match(/Could not find the '([^']+)' column/i);
  if (!match || !row) return null;
  const next = { ...row };
  delete next[match[1]];
  return next;
};

function AppContent() {
  const { t, i18n } = useTranslation();
  const { showToast, showModal } = useFeedback();
  const { wipeAll: wipeAdvisorChats } = useAdvisorChat();
  
  // Dinamik Sözleşme Tipleri
  const CONTRACT_TYPES = [
    { key: 'typeGeneral', label: t('typeGeneral') },
    { key: 'typeLabor', label: t('typeLabor') },
    { key: 'typeRent', label: t('typeRent') },
    { key: 'typeNDA', label: t('typeNDA') },
    { key: 'typeSaaS', label: t('typeSaaS') },
    { key: 'typeSales', label: t('typeSales') },
    { key: 'typeConsumer', label: t('typeConsumer') },
    { key: 'typeFreelance', label: t('typeFreelance') },
  ];

  // Uygulama Durumları (States)
  const [activeTab, setActiveTab] = useState('analyze');
  const [guideVisible, setGuideVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [contractText, setContractText] = useState('');
  const [localRadarPreview, setLocalRadarPreview] = useState(null);
  const [selectedTypeKey, setSelectedTypeKey] = useState('typeGeneral');
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'tr');
  const [user, setUser] = useState(null);
  
  // Kimlik Doğrulama ve Şifre Sıfırlama
  const [resetEmail, setResetEmail] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Geçmiş Taramalar ve Modal Durumu
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Kopyalanan maddenin geçici onay ikonu
  const [copiedKey, setCopiedKey] = useState(null);
  // WAVE BO — per-item counter-offer tier (balanced|shield|fast); local only, no network
  const [offerTiers, setOfferTiers] = useState({});

  // Ülke mevzuatı / rapor dili seçicileri
  const [analysisCountry, setAnalysisCountry] = useState('auto');
  const [reportLanguage, setReportLanguage] = useState('auto');
  const [advisorCountry, setAdvisorCountry] = useState('auto');
  // WAVE GD.2 — guide deep links: advisor tool request + settings section anchor.
  const [guideAdvisorAction, setGuideAdvisorAction] = useState(null);
  const [pendingSettingsSection, setPendingSettingsSection] = useState(null);
  const settingsScrollRef = useRef(null);
  const settingsSectionYRef = useRef({});
  const onSettingsSectionLayout = useCallback(
    (id) => (event) => {
      settingsSectionYRef.current[id] = event.nativeEvent.layout.y;
    },
    []
  );
  const handleGuideAction = useCallback(
    (action) => {
      if (!action?.type) return;
      setGuideVisible(false);
      if (action.type === 'openTab') {
        setActiveTab(action.id);
        return;
      }
      if (action.type === 'openSettingsSection') {
        setActiveTab('settings');
        setPendingSettingsSection({ id: action.id, nonce: Date.now() });
        return;
      }
      if (action.type === 'openAdvisorTool') {
        setActiveTab('advisor');
        setGuideAdvisorAction({ type: action.type, id: action.id, entryId: action.entryId || null, nonce: Date.now() });
        return;
      }
      const itemType = GUIDE_ITEM_TYPES[action.type];
      if (!itemType) return;
      const availability = getAvailability(itemType, action.id, { country: advisorCountry, language: i18n.language });
      if (availability !== 'available') {
        showToast(t(availability === 'pending' ? 'availPendingToast' : 'guideNotAvailableHere'), { type: 'info', duration: 2400 });
        return;
      }
      setActiveTab('advisor');
      setGuideAdvisorAction({ type: action.type, id: action.id, nonce: Date.now() });
    },
    [advisorCountry, i18n.language, showToast, t]
  );
  const applyFirstIntent = useCallback(
    (id) => {
      const action = actionForIntent(id);
      if (!action || action.type === 'openTab') {
        setActiveTab('analyze');
        setWorkspaceMode('analyze');
        return;
      }
      handleGuideAction(action);
    },
    [handleGuideAction]
  );

  const runFirstIntent = useCallback(
    (id, { fromSheet = false } = {}) => {
      markIntentOnboarded();
      if (fromSheet) {
        setIntentOpen(false);
        setTimeout(() => applyFirstIntent(id), 400);
        return;
      }
      applyFirstIntent(id);
    },
    [applyFirstIntent]
  );

  const skipFirstIntent = useCallback(() => {
    markIntentOnboarded();
    setIntentOpen(false);
  }, []);

  const guideActionRef = useRef(handleGuideAction);
  guideActionRef.current = handleGuideAction;
  useEffect(() => {
    if (activeTab !== 'settings' || !pendingSettingsSection) return undefined;
    // Settings mounts on tab switch; give its sections one layout pass before scrolling.
    const timer = setTimeout(() => {
      const y = settingsSectionYRef.current[pendingSettingsSection.id];
      if (typeof y === 'number') settingsScrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
      setPendingSettingsSection(null);
    }, 250);
    return () => clearTimeout(timer);
  }, [activeTab, pendingSettingsSection]);
  const [countrySheetVisible, setCountrySheetVisible] = useState(false);
  const [welcomeLangSheet, setWelcomeLangSheet] = useState(false);
  const [intentOpen, setIntentOpen] = useState(false);
  const [localeOnboardTick, setLocaleOnboardTick] = useState(0);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [resumeItems, setResumeItems] = useState([]);
  const [resumeDraft, setResumeDraft] = useState(null);
  const [resumeReady, setResumeReady] = useState(false);
  const [resumeBannerHidden, setResumeBannerHidden] = useState(false);
  const resumeOfferedRef = useRef(false);
  const [shareLoopOpen, setShareLoopOpen] = useState(false);
  const shareOfferedRef = useRef(false);
  const [scanSuccessOpen, setScanSuccessOpen] = useState(false);
  const scanSuccessOfferedRef = useRef(false);
  const overlayBusyRef = useRef(false);
  const [localeReady, setLocaleReady] = useState(false);
  const [authBootstrapped, setAuthBootstrapped] = useState(false);
  const [reportLangSheetVisible, setReportLangSheetVisible] = useState(false);
  const [analysisParty, setAnalysisParty] = useState('buyer');
  const [partyConfirmed, setPartyConfirmed] = useState(false);
  const [partyDisplayName, setPartyDisplayName] = useState('');
  const [partySheetVisible, setPartySheetVisible] = useState(false);
  const [paywallContext, setPaywallContext] = useState(null);
  const partySectionYRef = useRef(0);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [workspaceMode, setWorkspaceMode] = useState('analyze');
  const [typeLocked, setTypeLocked] = useState(false);
  const [detectedTypeHint, setDetectedTypeHint] = useState('');
  const [signedShieldCount, setSignedShieldCount] = useState(0);
  const [diffSeed, setDiffSeed] = useState({ nonce: 0, revised: '', original: '', mode: '' });

  // Analiz ilerleme adımı ("parsing" | "jurisdiction" | "risks" | "report")
  const [progressStep, setProgressStep] = useState(null);

  // Kota, abonelik ve destek ekranı
  const [profile, setProfile] = useState(null);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallHook, setPaywallHook] = useState(null);
  const [shareSheetAnalysis, setShareSheetAnalysis] = useState(null);
  const [pendingShareCode, setPendingShareCode] = useState('');
  const [advisorSnapshot, setAdvisorSnapshot] = useState(null);
  const [shareCodeInput, setShareCodeInput] = useState('');
  const pendingShareCodeRef = useRef('');
  const briefNudgeAnalysisIdRef = useRef('');
  const resultRef = useRef(null);
  const userIdRef = useRef(null);
  const hadUserRef = useRef(false);
  const analyzeScrollRef = useRef(null);
  const analyzeContentRef = useRef(null);
  const reportAnchorRef = useRef(null);
  const reportYRef = useRef(0);
  const scrollOffsetRef = useRef(0);
  const pendingSignedScrollRef = useRef(false);
  const signedScrollTriesRef = useRef(0);
  const signedContentHeightRef = useRef(0);
  const signedScrollTimerRef = useRef(null);
  const paywallHookRef = useRef(null);
  const pendingShareReturnRef = useRef(null);
  const paywallWasVisibleRef = useRef(false);
  const [paywallClosedTick, setPaywallClosedTick] = useState(0);
  const openPaywall = (hook = null, context = null) => {
    setPaywallHook(hook);
    setPaywallContext(context || null);
    setPaywallVisible(true);
    paywallHookRef.current = hook;
  };
  useEffect(() => {
    const wasVisible = paywallWasVisibleRef.current;
    paywallWasVisibleRef.current = paywallVisible;
    if (wasVisible && !paywallVisible) setPaywallClosedTick((n) => n + 1);
  }, [paywallVisible]);
  useEffect(() => {
    if (!paywallClosedTick || paywallVisible || !pendingShareReturnRef.current) return undefined;
    const snap = pendingShareReturnRef.current;
    let timer = null;
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => {
        if (pendingShareReturnRef.current !== snap) return;
        pendingShareReturnRef.current = null;
        setShareSheetAnalysis(snap);
      }, 400);
    });
    return () => {
      task?.cancel?.();
      if (timer) clearTimeout(timer);
    };
  }, [paywallClosedTick, paywallVisible]);
  const [supportVisible, setSupportVisible] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  // E-postadaki kurtarma bağlantısından gelindiğinde açılan şifre belirleme ekranı
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [devEmailBypass, setDevEmailBypass] = useState(false);


  // Deep Link: e-posta doğrulama / şifre sıfırlama.
  // Development Build kapalıyken tıklanan link getInitialURL ile,
  // açıkken addEventListener ile gelir. Aynı URL iki kez işlenmez.
  useEffect(() => {
    let cancelled = false;
    const seen = new Set();

    const onLink = async (event) => {
      const url = typeof event === 'string' ? event : event?.url;
      if (!url || cancelled) return;
      if (seen.has(url)) return;

      const shareCode = parseShareCode(url);
      if (shareCode) {
        seen.add(url);
        setPendingShareCode(shareCode);
        return;
      }

      const result = await handleAuthDeepLink(url);
      if (cancelled) return;

      // Launcher URL'si token taşımıyorsa tekrar denenebilsin.
      if (result.type !== AUTH_LINK_RESULTS.IGNORED) {
        seen.add(url);
      }

      if (result.type === AUTH_LINK_RESULTS.RECOVERY) {
        setResetPasswordVisible(true);
      } else if (result.type === AUTH_LINK_RESULTS.SIGNED_IN) {
        Alert.alert(t('successTitle'), t('emailVerifiedMessage'));
      } else if (result.type === AUTH_LINK_RESULTS.ERROR) {
        Alert.alert(t('errorTitle'), t('resetLinkInvalid'));
      }
    };

    const subscription = Linking.addEventListener('url', onLink);
    Linking.getInitialURL()
      .then((url) => {
        if (url) onLink(url);
      })
      .catch(() => {});

    // Dev Client launcher JS'e geç teslim eder; ikinci okuma token'ı kaçırmaz.
    const retry = setTimeout(() => {
      Linking.getInitialURL()
        .then((url) => {
          if (url) onLink(url);
        })
        .catch(() => {});
    }, 800);
    const retryLate = setTimeout(() => {
      Linking.getInitialURL()
        .then((url) => {
          if (url) onLink(url);
        })
        .catch(() => {});
    }, 2000);

    return () => {
      cancelled = true;
      clearTimeout(retry);
      clearTimeout(retryLate);
      subscription.remove();
    };
  }, [t]);

  // Supabase Oturum Dinleyici
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .finally(() => {
        setAuthBootstrapped(true);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      // Supabase, kurtarma bağlantısıyla oturum açıldığında bu olayı yayar.
      // detectSessionInUrl kapalı olsa da setSession/exchangeCode sonrası tetiklenir.
      if (event === 'PASSWORD_RECOVERY') setResetPasswordVisible(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const appReady = localeReady && authBootstrapped;
  useEffect(() => {
    if (appReady) SplashScreen.hideAsync().catch(() => {});
  }, [appReady]);

  // Kayıtlı dil, taraf ve hukuk koridorunu açılışta geri yükler.
  useEffect(() => {
    let cancelled = false;

    const bootstrapLocale = async () => {
      const lang = await loadStoredLanguage();
      if (cancelled) return;
      setCurrentLang(lang);
      loadStoredParty().then((party) => {
        if (cancelled) return;
        // Fresh install: no stored code → leave partyConfirmed false (never auto-confirm).
        if (!party || !isGranularPartyCode(party)) return;
        const category = categoryFromTypeKey('typeGeneral');
        const next = coercePartyForCategory(party, category);
        setAnalysisParty(next);
        setPartyConfirmed(true);
        if (next !== party) savePartyRole(next).catch(() => {});
      });

      const storedCountry = await loadStoredJurisdiction();
      const suggestion = suggestJurisdiction(lang, deviceRegion());
      const country = storedCountry || suggestion.code || 'auto';
      if (cancelled) return;
      setAnalysisCountry(country);
      if (!storedCountry) persistJurisdiction(country).catch(() => {});
      setLocaleReady(true);
    };

    bootstrapLocale().catch((error) => {
      console.warn('Locale bootstrap:', error?.message);
      setLocaleReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const userId = user?.id;

  useEffect(() => {
    pendingShareCodeRef.current = pendingShareCode;
  }, [pendingShareCode]);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  useEffect(() => {
    userIdRef.current = userId || null;
  }, [userId]);

  const rememberLastAnalysisId = useCallback(async (id) => {
    try {
      const value = String(id || '').trim();
      if (value) await AsyncStorage.setItem(LAST_ANALYSIS_KEY, value);
      else await AsyncStorage.removeItem(LAST_ANALYSIS_KEY);
    } catch {
      /* depolama yoksa sessiz */
    }
  }, []);

  const restoreLastShield = useCallback(async (uid) => {
    if (!uid) return;
    if (pendingShareCodeRef.current) return;
    if (resultRef.current) return;
    if (isUsableDraft(await loadResumeDraft())) return;
    try {
      const initialUrl = await Linking.getInitialURL().catch(() => null);
      if (parseShareCode(initialUrl) || pendingShareCodeRef.current) return;
      if (resultRef.current || userIdRef.current !== uid) return;
      const stored = String((await AsyncStorage.getItem(LAST_ANALYSIS_KEY)) || '').trim();
      if (pendingShareCodeRef.current || resultRef.current || userIdRef.current !== uid) return;
      let query = supabase.from('analyses').select('*').eq('user_id', uid);
      const { data, error } = stored
        ? await query.eq('id', stored).maybeSingle()
        : await query.order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (error || !data) return;
      if (pendingShareCodeRef.current || resultRef.current || userIdRef.current !== uid) return;
      const decorated = sanitizeAnalysisRow(data);
      setResult(decorated);
      if (decorated?.id) rememberLastAnalysisId(decorated.id);
    } catch {
      /* soğuk açılış sessiz */
    }
  }, [rememberLastAnalysisId]);

  const applyResume = useCallback(
    (item) => {
      const action = actionForResume(item);
      if (!action) return;
      if (item.kind === 'draft') {
        if (resumeDraft?.text) {
          setContractText((prev) => (String(prev || '').trim() ? prev : resumeDraft.text));
        }
        setActiveTab('analyze');
        setWorkspaceMode('analyze');
        if (resumeDraft?.fileName) showToast(t('rsFileAgain'), { type: 'info' });
        return;
      }
      if (item.kind === 'analysis') {
        restoreLastShield(userId).catch(() => {});
        setActiveTab('analyze');
        setWorkspaceMode('analyze');
        return;
      }
      handleGuideAction(action);
    },
    [handleGuideAction, restoreLastShield, resumeDraft, showToast, t, userId]
  );

  const runResume = useCallback(
    (item, { fromSheet = false } = {}) => {
      if (fromSheet) {
        setResumeOpen(false);
        setTimeout(() => applyResume(item), 400);
        return;
      }
      applyResume(item);
    },
    [applyResume]
  );

  const skipResume = useCallback(() => {
    setResumeOpen(false);
  }, []);

  overlayBusyRef.current = intentOpen || resumeOpen || guideVisible || paywallVisible || shareLoopOpen || scanSuccessOpen;

  const closeShareLoop = useCallback(() => {
    markShareLoopSeen();
    setShareLoopOpen(false);
  }, []);

  const skipScanSuccess = useCallback(() => {
    markScanSuccessSeen();
    setScanSuccessOpen(false);
  }, []);

  const runScanSuccess = useCallback(
    (id) => {
      markScanSuccessSeen();
      setScanSuccessOpen(false);
      const job = jobForScanSuccess(id);
      if (!job) return;
      setTimeout(() => {
        if (job.action.type === 'invite') {
          if (shareOfferedRef.current) return;
          shareOfferedRef.current = true;
          setShareLoopOpen(true);
          return;
        }
        handleGuideAction(job.action);
      }, 400);
    },
    [handleGuideAction]
  );

  const maybeOfferShareLoop = useCallback(() => {
    if (shareOfferedRef.current) return;
    const offer = async () => {
      if (!(await isScanSuccessSeen())) {
        if (scanSuccessOfferedRef.current) return;
        scanSuccessOfferedRef.current = true;
        setTimeout(() => {
          if (overlayBusyRef.current) {
            scanSuccessOfferedRef.current = false;
            return;
          }
          setScanSuccessOpen(true);
        }, 800);
        return;
      }
      if (await isShareLoopSeen()) return;
      setTimeout(() => {
        if (overlayBusyRef.current) return;
        shareOfferedRef.current = true;
        setShareLoopOpen(true);
      }, 800);
    };
    offer().catch(() => {});
  }, []);

  const openReminderAnalysis = useCallback(
    async (analysisId) => {
      const id = String(analysisId || '').trim();
      if (!id || !userId) {
        showToast(t('reminderOpenFailed'), { type: 'warning' });
        return;
      }
      try {
        const { data, error } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', userId)
          .eq('id', id)
          .maybeSingle();
        if (error || !data) {
          showToast(t('reminderOpenFailed'), { type: 'warning' });
          return;
        }
        if (userIdRef.current !== userId) return;
        setResult(sanitizeAnalysisRow(data));
        rememberLastAnalysisId(id);
        setActiveTab('analyze');
        setModalVisible(false);
        setWorkspaceMode('analyze');
      } catch {
        showToast(t('reminderOpenFailed'), { type: 'warning' });
      }
    },
    [userId, showToast, t, rememberLastAnalysisId]
  );

  const scrollToSignedReport = useCallback(() => {
    const scroll = analyzeScrollRef.current;
    const sentinel = reportAnchorRef.current;
    if (!scroll) return;

    const finishWithStored = () => {
      signedScrollTriesRef.current += 1;
      const y = Math.max(0, Number(reportYRef.current) || 0);
      if (y > 0) {
        scroll.scrollTo?.({ y: Math.max(0, y - 12), animated: true });
        pendingSignedScrollRef.current = false;
        return;
      }
      if (signedScrollTriesRef.current >= 2) pendingSignedScrollRef.current = false;
    };

    const runMeasure = () => {
      const node = findNodeHandle(analyzeContentRef.current);
      if (!sentinel || !node || typeof sentinel.measureLayout !== 'function') {
        finishWithStored();
        return;
      }
      let retried = false;
      const attempt = () => {
        sentinel.measureLayout(
          node,
          (_x, y) => {
            scroll.scrollTo({ y: Math.max(0, y - 12), animated: true });
            pendingSignedScrollRef.current = false;
          },
          () => {
            if (!retried) {
              retried = true;
              attempt();
              return;
            }
            finishWithStored();
          }
        );
      };
      attempt();
    };

    InteractionManager.runAfterInteractions(() => {
      setTimeout(runMeasure, 50);
    });
  }, []);

  const openSignedStrip = useCallback(async () => {
    if (!userId) {
      showToast(t('signedStripEmpty'), { type: 'info' });
      return;
    }
    const isSigned = (row) => normalizeLifecycle(row?.lifecycle) === 'signed';
    let row = null;
    try {
      const { data } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', userId)
        .eq('lifecycle', 'signed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data && isSigned(data)) row = sanitizeAnalysisRow(data);
    } catch {
      row = null;
    }
    if (!row) {
      const fromHistory = (history || [])
        .filter(isSigned)
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))[0];
      if (fromHistory && isSigned(fromHistory)) row = sanitizeAnalysisRow(fromHistory);
    }
    if (!row) {
      try {
        const stored = String((await AsyncStorage.getItem(LAST_ANALYSIS_KEY)) || '').trim();
        if (stored) {
          const { data } = await supabase
            .from('analyses')
            .select('*')
            .eq('user_id', userId)
            .eq('id', stored)
            .maybeSingle();
          if (data && isSigned(data)) row = sanitizeAnalysisRow(data);
        }
      } catch {
        /* stored imzasızsa yok say */
      }
    }
    if (!row || !isSigned(row)) {
      setSignedShieldCount(0);
      showToast(t('signedStripEmpty'), { type: 'info' });
      return;
    }
    const decorated = sanitizeAnalysisRow(row);
    const same = resultRef.current?.id && String(resultRef.current.id) === String(decorated.id);
    setActiveTab('analyze');
    setWorkspaceMode('analyze');
    setResult(decorated);
    if (decorated?.id) rememberLastAnalysisId(decorated.id);
    if (same) showToast(t('shieldResumeHint'), { type: 'info' });
    pendingSignedScrollRef.current = true;
    signedScrollTriesRef.current = 0;
    signedContentHeightRef.current = 0;
  }, [userId, history, rememberLastAnalysisId, showToast, t]);

  useEffect(() => {
    if (!userId || !localeReady) return;
    let cancelled = false;

    const offerCorridor = async () => {
      if (await isLocaleOnboarded()) return;
      const suggestion = suggestJurisdiction(currentLang, deviceRegion());
      const languageLabel = getLanguage(currentLang)?.label || currentLang;
      const countryLabel = i18n.t(getJurisdiction(analysisCountry).labelKey);
      const actions = [
        { id: 'continue', label: i18n.t('localeContinue'), style: 'primary' },
        { id: 'lang', label: i18n.t('localeChangeLanguage') },
        { id: 'country', label: i18n.t('localeChangeCountry') },
      ];
      if (suggestion.englishPick) {
        actions.push(
          { id: 'us', label: i18n.t('localeEnglishPickUS') },
          { id: 'gb', label: i18n.t('localeEnglishPickGB') }
        );
      }
      if (suggestion.arabicAlt) {
        actions.push({ id: 'sa', label: i18n.t('countrySA') });
      }

      const choice = await showModal({
        title: i18n.t('localeWelcomeTitle'),
        message: corridorMessage((key, opts) => i18n.t(key, opts), { language: languageLabel, country: countryLabel }),
        cancelLabel: false,
        actions,
      });
      await markLocaleOnboarded();
      setLocaleOnboardTick((n) => n + 1);
      if (cancelled) return;
      if (choice === 'us') {
        setAnalysisCountry('US');
        persistJurisdiction('US').catch(() => {});
      } else if (choice === 'gb') {
        setAnalysisCountry('GB');
        persistJurisdiction('GB').catch(() => {});
      } else if (choice === 'sa') {
        setAnalysisCountry('SA');
        persistJurisdiction('SA').catch(() => {});
      } else {
        persistJurisdiction(analysisCountry).catch(() => {});
        if (choice === 'lang') setWelcomeLangSheet(true);
        else if (choice === 'country') setCountrySheetVisible(true);
      }
    };

    offerCorridor().catch((error) => {
      console.warn('Locale onboarding:', error?.message);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, localeReady]);

  useEffect(() => {
    if (!userId || !localeReady) return undefined;
    let cancelled = false;
    const offerIntent = async () => {
      if (await isIntentOnboarded()) return;
      if (!(await isLocaleOnboarded())) return;
      if (cancelled) return;
      setIntentOpen(true);
    };
    offerIntent().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId, localeReady, localeOnboardTick]);

  useEffect(() => {
    if (!userId) {
      setResumeDraft(null);
      setResumeReady(false);
      setResumeBannerHidden(false);
      setResumeOpen(false);
      setResumeItems([]);
      resumeOfferedRef.current = false;
      shareOfferedRef.current = false;
      setShareLoopOpen(false);
      return undefined;
    }
    let cancelled = false;
    loadResumeDraft().then((draft) => {
      if (cancelled) return;
      if (isUsableDraft(draft)) {
        setResumeDraft(draft);
        setContractText((prev) => (String(prev || '').trim() ? prev : draft.text || prev));
      }
      setResumeReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !resumeReady) return undefined;
    if (result) {
      clearResumeDraft();
      setResumeDraft(null);
      return undefined;
    }
    const timer = setTimeout(() => {
      saveResumeDraft({ text: contractText, fileName: selectedFile?.name || '' }).then((next) => {
        setResumeDraft(next);
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [userId, resumeReady, result, contractText, selectedFile]);

  useEffect(() => {
    if (!userId || !localeReady || intentOpen) return undefined;
    let cancelled = false;
    const offerResume = async () => {
      if (resumeOfferedRef.current) return;
      if (!(await isLocaleOnboarded()) || !(await isIntentOnboarded())) return;
      const draft = await loadResumeDraft();
      const cases = await loadCases();
      const answers = await loadSavedAnswers();
      const lastAnalysisId = String((await AsyncStorage.getItem(LAST_ANALYSIS_KEY)) || '').trim();
      const lastCase = [...cases].sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0] || null;
      const lastAsk = answers[0] || null;
      const items = collectResumeItems({ draft, lastCase, lastAsk, lastAnalysisId });
      if (cancelled || !shouldOfferResumeSheet(items)) return;
      resumeOfferedRef.current = true;
      setResumeItems(items);
      setResumeOpen(true);
    };
    offerResume().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId, localeReady, localeOnboardTick, intentOpen]);

  // Girişte ve satın alma sonrasında profili/kotayı yeniden okur.
  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      if (!user) setProfile(null);
      return null;
    }

    try {
      const phone =
        session.user.user_metadata?.phone_number ||
        session.user.phone ||
        user?.user_metadata?.phone_number ||
        user?.phone ||
        null;
      const claimed = await syncProfileAndQuota({ phone });
      const resolved = claimed || (await fetchProfile());
      setProfile(resolved);
      return resolved;
    } catch (error) {
      if (error.code === QUOTA_ERRORS.PHONE_TAKEN) {
        Alert.alert(t('warningTitle'), t('phoneAlreadyUsed'));
      } else if (error.code === 'CLOCK_SKEW') {
        showToast(t('clockSkewHint'), { type: 'warning' });
      }

      const fallback = await fetchProfile();
      setProfile(fallback);
      return fallback;
    }
  }, [user, t, showToast]);

  // Yalnızca kullanıcı değiştiğinde çalışır; dil değişiminde gereksiz RPC atmaz.
  useEffect(() => {
    refreshProfile();
    if (!userId) {
      setUpcomingDeadlines([]);
      setSignedShieldCount(0);
      setResult(null);
      setSelectedHistoryItem(null);
      if (hadUserRef.current) {
        rememberLastAnalysisId('').catch(() => {});
      }
      hadUserRef.current = false;
      return;
    }
    hadUserRef.current = true;
    loadUpcomingDeadlines(userId).then(setUpcomingDeadlines).catch(() => setUpcomingDeadlines([]));
    supabase
      .from('analyses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('lifecycle', 'signed')
      .then(({ count, error }) => {
        if (!error) setSignedShieldCount(count || 0);
      })
      .catch(() => {});
    if (resultRef.current?.user_id && resultRef.current.user_id !== userId) {
      setResult(null);
      resultRef.current = null;
    }
    restoreLastShield(userId).catch(() => {});
    // WAVE LR.5: once per sign-in the server re-checks the store plan (renewals, expiries, upgrades).
    syncEntitlement()
      .then((synced) => (synced ? fetchProfile() : null))
      .then((fresh) => {
        if (fresh && fresh.id === userId) setProfile(fresh);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!userId) return undefined;
    return subscribeReminderOpens((analysisId) => {
      const docMatch = /^doc-([a-z0-9]+)-\d+$/i.exec(String(analysisId || ''));
      if (docMatch) {
        guideActionRef.current?.({ type: 'openAdvisorTool', id: 'doc_explainer', entryId: docMatch[1] });
        return;
      }
      const caseMatch = /^case-([a-z0-9]+)-[a-z0-9]+$/i.exec(String(analysisId || ''));
      if (caseMatch) {
        guideActionRef.current?.({ type: 'openAdvisorTool', id: 'case_files', entryId: caseMatch[1] });
        return;
      }
      openReminderAnalysis(analysisId).catch(() => {});
    });
  }, [userId, openReminderAnalysis]);

  const emailVerified = !!user?.email_confirmed_at || !!user?.confirmed_at || (__DEV__ && devEmailBypass);
  const freeLeft = remainingAnalyses(profile);
  const isPro = !!profile?.is_pro;
  const plan = planOf(profile);
  // Migration henüz uygulanmadıysa profil okunamaz; bu durumda kota zorlanmaz.
  const quotaEnforced = !!profile;
  const lockPremium = quotaEnforced && !isPro;

  // Geçmiş Analizleri Çekme
  useEffect(() => {
    if (user && activeTab === 'history') {
      fetchHistory();
    }
  }, [user, activeTab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory((data || []).map(sanitizeAnalysisRow));
    } catch (err) {
      console.log('Geçmiş hatası:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    const onLang = (lng) => setCurrentLang((lng || 'tr').split('-')[0]);
    i18n.on('languageChanged', onLang);
    return () => i18n.off('languageChanged', onLang);
  }, [i18n]);

  const analysisLang = (currentLang || i18n.language || 'tr').split('-')[0];

  // Rapor dili "auto" ise uygulama dili kullanılır (çapraz dil desteği).
  const reportLang = resolveReportLanguage(reportLanguage, analysisLang);

  const countryOptions = useMemo(
    () => (JURISDICTIONS || []).map((item) => ({ code: item.code, label: t(item.labelKey), hint: item.hint })),
    [t]
  );

  const reportLanguageOptions = useMemo(
    () =>
      (REPORT_LANGUAGES || []).map((item) => ({
        code: item.code,
        label: item.label || t(item.labelKey),
        hint: item.code === 'auto' ? APP_LANGUAGES.find((l) => l.code === analysisLang)?.label : null,
      })),
    [analysisLang, t]
  );

  const partyOptions = useMemo(() => {
    const category = categoryFromTypeKey(selectedTypeKey);
    return partyRolesForCategory(category).map((item) => ({
      code: item.code,
      label: t(item.labelKey),
      hint: t(item.hintKey),
    }));
  }, [selectedTypeKey, t]);

  const selectedPartyRole =
    (PARTY_ROLES || []).find((item) => item.code === analysisParty && isGranularPartyCode(item.code)) ||
    (PARTY_ROLES || []).find((item) => item.code === 'customer') ||
    PARTY_ROLES.find((item) => isGranularPartyCode(item.code));
  const selectedPartyLabel = !partyConfirmed
    ? t('partyNotSelected')
    : selectedPartyRole
      ? t(selectedPartyRole.labelKey)
      : t('selectPartyTitle');
  const selectedPartyHint = partyConfirmed && selectedPartyRole ? t(selectedPartyRole.hintKey) : t('partyProtectHint');

  const partyChoiceCards = useMemo(() => {
    const category = categoryFromTypeKey(selectedTypeKey);
    const partiesStr =
      localRadarPreview?.parties ||
      result?.contractRadar?.parties ||
      result?.contract_radar?.parties ||
      '';
    return buildPartyChoiceCards({
      partiesStr,
      category,
      sourceText: contractText || result?.contract_text || result?.contractText || '',
    });
  }, [selectedTypeKey, localRadarPreview, result, contractText]);

  const selectedCountryOption = countryOptions.find((item) => item.code === analysisCountry) || countryOptions[0];
  const selectedReportLangOption =
    reportLanguageOptions.find((item) => item.code === reportLanguage) || reportLanguageOptions[0];

  useEffect(() => {
    if (!copiedKey) return;
    const timer = setTimeout(() => setCopiedKey(null), 1800);
    return () => clearTimeout(timer);
  }, [copiedKey]);

  const formatDate = (value) => {
    const date = new Date(value);
    try {
      return date.toLocaleDateString(i18n.language);
    } catch {
      return date.toLocaleDateString();
    }
  };

  const getConfidenceLabel = (confidence) => {
    switch (String(confidence || '').toUpperCase()) {
      case 'HIGH': return t('confidenceHigh');
      case 'MEDIUM': return t('confidenceMedium');
      case 'LOW': return t('confidenceLow');
      default: return null;
    }
  };

  const getRiskLabel = (level) => {
    switch (level) {
      case 'RED': return t('riskHigh');
      case 'YELLOW': return t('riskMedium');
      case 'GREEN': return t('riskLow');
      default: return t('riskUnknown');
    }
  };

  const copyClauseToClipboard = async (clause, index, keyPrefix) => {
    const tierKey = `clause:${index}`;
    const offer = pickCounterOffer(clause, offerTiers[tierKey] || 'balanced');
    const lines = [
      clause.clauseTitle || t('clauseItem', { index: index + 1 }),
      clause.originalText ? `"${clause.originalText}"` : null,
      clause.issue ? `${t('detectedRisk')}: ${clause.issue}` : null,
      clause.legalReference ? `${t('legalReferenceLabel')}: ${clause.legalReference}` : null,
      offer ? `${t('suggestedCounter')}: ${offer}` : null,
    ].filter(Boolean);

    await Clipboard.setStringAsync(lines.join('\n\n'));
    setCopiedKey(`${keyPrefix}-${index}`);
  };

  // Yalnızca revize/alternatif madde metnini kopyalar.
  const copyCounterOfferToClipboard = async (clause, index, keyPrefix, itemId) => {
    const tier = offerTiers[itemId || `clause:${index}`] || 'balanced';
    await Clipboard.setStringAsync(pickCounterOffer(clause, tier) || '');
    setCopiedKey(`${keyPrefix}-counter-${index}`);
  };

  const setOfferTier = (itemId, tier) => {
    setOfferTiers((prev) => ({ ...prev, [itemId]: tier }));
  };

  const renderOfferTierChips = (item, itemId) => {
    if (countOfferTiers(item) < 2) return null;
    const offers = item?.counterOffers || {};
    const active = offerTiers[itemId] || 'balanced';
    const chips = [
      { id: 'balanced', labelKey: 'offerBalanced', hintKey: 'offerBalancedHint' },
      { id: 'shield', labelKey: 'offerShield', hintKey: 'offerShieldHint' },
      { id: 'fast', labelKey: 'offerFast', hintKey: 'offerFastHint' },
    ].filter((chip) => String(offers[chip.id] || '').trim());
    if (chips.length < 2) return null;
    return (
      <View style={styles.offerTierRow}>
        {chips.map((chip) => {
          const selected = active === chip.id;
          return (
            <TouchableOpacity
              key={chip.id}
              activeOpacity={0.85}
              onPress={() => setOfferTier(itemId, chip.id)}
              accessibilityLabel={t(chip.hintKey)}
              style={[
                styles.offerTierChip,
                {
                  borderColor: selected ? ACCENT : theme.borderColor,
                  backgroundColor: selected ? `${ACCENT}22` : theme.cardBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.offerTierChipText,
                  { color: selected ? ACCENT : theme.subText },
                ]}
                numberOfLines={1}
              >
                {t(chip.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const copyCounterMessage = async (message) => {
    await Clipboard.setStringAsync(message || '');
    setCopiedKey('counter-message');
  };

  const copyCounterMessageFromDecision = async (message, analysisForNudge) => {
    await copyCounterMessage(message);
    if (lockPremium) return;
    const target = analysisForNudge;
    if (!target) return;
    const id = String(target.id || '').trim() || 'pending';
    if (briefNudgeAnalysisIdRef.current === id) return;
    briefNudgeAnalysisIdRef.current = id;
    openShareBrief(target);
  };

  const openShareBrief = (target) => {
    if (!target) return;
    if (lockPremium) {
      openPaywall('share');
      return;
    }
    setShareSheetAnalysis(target);
  };

  const persistAnalysisColumns = async (analysisId, patch) => {
    if (!user || !analysisId || !patch || !Object.keys(patch).length) return false;
    try {
      let payload = { ...patch };
      for (let step = 0; step < 4; step += 1) {
        const { error } = await supabase.from('analyses').update(payload).eq('id', analysisId);
        if (!error) return true;
        const stripped = stripMissingColumn(payload, error);
        if (!stripped || Object.keys(stripped).length === Object.keys(payload).length) return false;
        payload = stripped;
      }
      return false;
    } catch {
      return false;
    }
  };

  const applyLocalAnalysisPatch = (fullRaw, patch) => {
    if (!fullRaw) return;
    const next = { ...patch };
    if (result && ((fullRaw.id && result.id === fullRaw.id) || fullRaw === result)) {
      setResult((prev) => (prev ? { ...prev, ...next } : prev));
    }
    if (
      selectedHistoryItem &&
      ((fullRaw.id && selectedHistoryItem.id === fullRaw.id) || fullRaw === selectedHistoryItem)
    ) {
      setSelectedHistoryItem((prev) => (prev ? { ...prev, ...next } : prev));
    }
    if (next.id || fullRaw.id) {
      const id = next.id || fullRaw.id;
      rememberLastAnalysisId(id);
      setHistory((prev) =>
        prev.map((row) => (row.id === id || row === fullRaw ? { ...row, ...next } : row))
      );
    }
  };

  const patchSavedAnalysis = async (fullRaw, patch) => {
    if (!fullRaw) return false;
    const next = { ...patch };
    const dbPatch = {};
    if (next.signConditions || next.sign_conditions) {
      dbPatch.sign_conditions = next.signConditions || next.sign_conditions;
    }
    if (Object.prototype.hasOwnProperty.call(next, 'signStatus') || Object.prototype.hasOwnProperty.call(next, 'sign_status')) {
      dbPatch.sign_status = next.signStatus ?? next.sign_status ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(next, 'lifecycle')) {
      dbPatch.lifecycle = next.lifecycle;
    }
    if (
      Object.prototype.hasOwnProperty.call(next, 'revised_contract_text') ||
      Object.prototype.hasOwnProperty.call(next, 'revisedContractText')
    ) {
      dbPatch.revised_contract_text = next.revised_contract_text ?? next.revisedContractText ?? null;
    }
    if (next.id) applyLocalAnalysisPatch(fullRaw, { id: next.id });
    let row = fullRaw;
    if (Object.keys(dbPatch).length && !row.id && !next.id) {
      const id = await saveAnalysisToSupabase({ ...row, ...next });
      if (!id) {
        showToast(t('errUnexpected'), { type: 'warning' });
        return false;
      }
      applyLocalAnalysisPatch(row, { id });
      row = { ...row, id };
    }
    if (row.id) rememberLastAnalysisId(row.id);
    if (Object.keys(dbPatch).length) {
      const ok = await persistAnalysisColumns(row.id || next.id, dbPatch);
      if (!ok) {
        showToast(t('errUnexpected'), { type: 'warning' });
        return false;
      }
    }
    applyLocalAnalysisPatch(row, next);
    return true;
  };

  const handleToggleSignCondition = (fullRaw, analysis, item) => {
    const current = userSignConditions(analysis);
    const exists = current.some((row) => row.id === item.id);
    let next;
    if (exists) {
      next = current.filter((row) => row.id !== item.id);
    } else if (current.length >= 3) {
      showToast(t('signMaxThree'), { type: 'warning' });
      return;
    } else {
      next = [
        ...current,
        {
          id: item.id,
          titleKey: item.titleKey,
          label: item.titleKey,
          statute: statuteFor(item, analysisCountry) || '',
          rule: item.titleKey,
        },
      ].slice(0, 3);
    }
    patchSavedAnalysis(fullRaw || analysis, { signConditions: next, sign_conditions: next });
  };

  const handleExportPdf = (rawAnalysis, mode = 'share') => {
    if (lockPremium) {
      openPaywall(pickPaywallHook(normalizeAnalysis(rawAnalysis)) || 'negotiate');
      return;
    }
    exportPDFReport(rawAnalysis, mode).catch((error) => {
      console.warn('PDF dışa aktarma:', error?.message);
    });
  };

  const handleCountryChange = (code) => {
    setAnalysisCountry(code);
    persistJurisdiction(code).catch(() => {});
  };

  const changeLanguage = (lang) => {
    setCurrentLang(lang);
    // Tercih AsyncStorage'a yazılır; sonraki açılışta otomatik geri yüklenir.
    setAppLanguage(lang).catch(() => {});
  };

  const handlePartyChange = (code, displayName = '') => {
    const raw = String(code || '').trim();
    // Explicit granular pick only — never store abstract buyer|seller in UI state.
    if (!isGranularPartyCode(raw)) return;
    setAnalysisParty(raw);
    setPartyConfirmed(true);
    setPartyDisplayName(String(displayName || '').trim());
    savePartyRole(raw).catch(() => {});
  };

  const focusPartySelection = () => {
    const y = Math.max(0, Number(partySectionYRef.current) || 0);
    if (analyzeScrollRef.current) {
      analyzeScrollRef.current.scrollTo?.({ y: Math.max(0, y - 8), animated: true });
    }
  };

  const handlePartyFlip = () => {
    const category = categoryFromTypeKey(selectedTypeKey);
    const next = flipPartyCode(analysisParty, category);
    const match = (partyChoiceCards || []).find((item) => item.code === next);
    handlePartyChange(next, match?.name || '');
    setResult(null);
    showToast(t('partyFlipHint'), { type: 'info' });
  };

  const handleTypeChange = (key) => {
    setSelectedTypeKey(key);
    setTypeLocked(true);
    setDetectedTypeHint('');
    const category = categoryFromTypeKey(key);
    setAnalysisParty((prev) => {
      const next = coercePartyForCategory(prev, category);
      if (next !== prev) savePartyRole(next).catch(() => {});
      return next;
    });
  };

  const handleContractTextChange = (text) => {
    const next = String(text || '')
      .replace(/&?emsp;?/gi, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#(\d+);/g, (_, n) => {
        const code = Number(n);
        return Number.isFinite(code) ? String.fromCharCode(code) : '';
      })
      .replace(/&#x([0-9a-f]+);/gi, (_, n) => {
        const code = parseInt(n, 16);
        return Number.isFinite(code) ? String.fromCharCode(code) : '';
      })
      .replace(/\u2003/g, ' ');
    setContractText(next);
    const trimmedNext = next.trim();
    if (trimmedNext) {
      setSelectedImages([]);
      setSelectedFile(null);
    }
    // Stale last-analysis result blocks BA live preview — invalidate when text diverges.
    const prior = String(result?.contract_text || result?.contractText || '').trim();
    if (result && trimmedNext.length >= 90 && trimmedNext !== prior) {
      setResult(null);
    }
    if (typeLocked) return;
    const detected = detectContractType(next);
    if (detected.confidence >= 0.5 && detected.typeKey !== selectedTypeKey) {
      setSelectedTypeKey(detected.typeKey);
      setDetectedTypeHint(detected.typeKey);
      const cat = categoryFromTypeKey(detected.typeKey);
      setAnalysisParty((prev) => {
        // Explicit granular persona (e.g. Customer) must not flip silently on paste/detect.
        if (isGranularPartyCode(prev)) return prev;
        const coerced = coercePartyForCategory(prev, cat);
        if (coerced !== prev) savePartyRole(coerced).catch(() => {});
        return coerced;
      });
    }
  };

  // Live Mini-Radar preview: local extractors only, XOR with post-analysis radar.
  useEffect(() => {
    if (loading || result) {
      setLocalRadarPreview(null);
      return undefined;
    }
    const trimmed = String(contractText || '').trim();
    if (trimmed.length < 90) {
      setLocalRadarPreview(null);
      return undefined;
    }
    const timer = setTimeout(() => {
      const next = buildLocalRadarPreview(trimmed);
      const hasSignal = Boolean(next.parties || next.governingLawForum || next.noticePeriod);
      setLocalRadarPreview(hasSignal ? next : null);
    }, 300);
    return () => clearTimeout(timer);
  }, [contractText, loading, result]);

  const handleScheduleReminders = async (rawAnalysis) => {
    try {
      const analysis = normalizeAnalysis(rawAnalysis);
      if (!analysis) return;
      const dates = ensureTrapCalendar(
        { ...analysis, contract_text: analysis.contract_text || analysis.contractText || contractText },
        t('trapNotSpecified'),
        analysisLang
      );
      const hasIsoDate = (dates || []).some((item) => parseIsoDate(item?.date || item?.eventDateOrOffset));
      if (!hasIsoDate) {
        showToast(t('reminderNeedEndDate'), { type: 'info' });
        return;
      }
      const outcome = await scheduleTrapReminders({
        analysisId: rawAnalysis?.id,
        dates,
        events: analysis.contractEvents,
        title: t('upcomingDeadlinesTitle'),
        prompt: true,
      });
      const hasDurationBadge = (dates || []).some((item) => String(item?.badge || '').trim());
      const allDummy = (dates || []).every((item) => {
        if (String(item?.badge || '').trim()) return false;
        return item?.placeholder || !parseIsoDate(item?.date || item?.eventDateOrOffset);
      });
      const toastUnscheduled = () => {
        if (hasDurationBadge) showToast(t('reminderNeedEndDate'), { type: 'info' });
        else if (allDummy) showToast(t('trapNotSpecified'), { type: 'info' });
      };
      if (outcome.unavailable || outcome.denied) {
        const choice = await showModal({
          title: t('calendarExportTitle'),
          message: t('calendarExportHint'),
          confirmLabel: t('calendarExportAction'),
        });
        if (choice === 'confirm') {
          try {
            await shareIcsCalendar({ title: t('upcomingDeadlinesTitle'), dates });
            showToast(t('calendarExportTitle'), { type: 'info' });
          } catch {
            /* sessiz */
          }
        } else {
          toastUnscheduled();
        }
        return;
      }
      if (outcome.scheduled > 0) {
        showToast(t('remindersSetupSuccess'), { type: 'success' });
      } else {
        toastUnscheduled();
      }
    } catch (error) {
      console.log('Hatırlatıcı atlandı:', error?.message);
    }
  };

  const onRemind = (rawAnalysis) => {
    handleScheduleReminders(rawAnalysis).catch(() => {});
  };

  const armSignedReminders = async (rawAnalysis) => {
    const analysis = normalizeAnalysis(rawAnalysis);
    if (!analysis) return;
    const trapDates = ensureTrapCalendar(
      { ...analysis, contract_text: analysis.contract_text || analysis.contractText || contractText },
      t('trapNotSpecified'),
      analysisLang
    );
    const dates = trapDates
      .map((item) => {
        const iso = nextAnniversary(item.date);
        if (!iso || !parseIsoDate(iso)) return null;
        return { ...item, date: iso };
      })
      .filter(Boolean);
    const events = (analysis.contractEvents || [])
      .map((item) => {
        const iso = nextAnniversary(item.eventDateOrOffset || item.date);
        if (!iso) return null;
        return { ...item, eventDateOrOffset: iso, date: iso };
      })
      .filter(Boolean);

    if (user?.id && (dates.length || events.length)) {
      await saveContractReminders({
        userId: user.id,
        analysisId: rawAnalysis?.id,
        events,
        dates,
      });
    }

    if (!dates.length && !events.length) {
      showToast(t('shieldArmed'), { type: 'success' });
      return;
    }

    const outcome = await scheduleTrapReminders({
      analysisId: rawAnalysis?.id,
      dates,
      events,
      title: t('upcomingDeadlinesTitle'),
      prompt: true,
    });
    if (outcome.unavailable || outcome.denied) {
      const choice = await showModal({
        title: t('calendarExportTitle'),
        message: t('calendarExportHint'),
        confirmLabel: t('calendarExportAction'),
      });
      if (choice === 'confirm') {
        try {
          await shareIcsCalendar({ title: t('upcomingDeadlinesTitle'), dates });
        } catch {
          /* sessiz */
        }
      }
    }
    showToast(t('shieldArmed'), { type: 'success' });
  };

  const handleLifecycleChange = async (fullRaw, nextCode) => {
    const lifecycle = normalizeLifecycle(nextCode);
    const previous = normalizeLifecycle(fullRaw?.lifecycle);
    if (lifecycle === previous) return;
    if (lifecycle === 'signed' && lockPremium) {
      openPaywall(pickPaywallHook(normalizeAnalysis(fullRaw)) || 'negotiate');
      return;
    }
    let row = fullRaw;
    if (!row?.id) {
      const id = await saveAnalysisToSupabase(row);
      if (!id) {
        showToast(t('errUnexpected'), { type: 'warning' });
        return;
      }
      row = { ...row, id };
      applyLocalAnalysisPatch(fullRaw, { id });
      if (result === fullRaw || (result && !result.id)) {
        setResult((prev) => (prev ? { ...prev, id } : prev));
      }
    }
    const ok = await persistAnalysisColumns(row.id, { lifecycle });
    if (!ok) {
      showToast(t('errUnexpected'), { type: 'warning' });
      return;
    }
    applyLocalAnalysisPatch(row, { lifecycle });
    if (lifecycle === 'signed') {
      setSignedShieldCount((count) => count + (previous === 'signed' ? 0 : 1));
      armSignedReminders(row).catch(() => {
        showToast(t('shieldArmed'), { type: 'success' });
      });
      return;
    }
    if (previous === 'signed') {
      setSignedShieldCount((count) => Math.max(0, count - 1));
      showToast(t('shieldDisarmed'), { type: 'info' });
    }
  };

  const pickLifecycle = async (fullRaw) => {
    const choice = await showModal({
      title: t('lifecycleHint'),
      message: t(lifecycleLabelKey(fullRaw?.lifecycle)),
      cancelLabel: false,
      actions: LIFECYCLES.map((code) => ({
        id: code,
        label: t(lifecycleLabelKey(code)),
        style: code === 'signed' ? 'primary' : undefined,
      })),
    });
    if (!choice || choice === 'cancel') return;
    handleLifecycleChange(fullRaw, choice).catch(() => {});
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      Alert.alert(t('warningTitle'), t('enterEmail'));
      return;
    }
    try {
      const redirectUrl = createAuthRedirectUrl('recovery');
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: redirectUrl,
      });
      if (error) throw error;
      Alert.alert(t('successTitle'), t('resetLinkSent'));
      setForgotPasswordMode(false);
      setResetEmail('');
    } catch (err) {
      Alert.alert(t('errorTitle'), err.message);
    }
  };

  // E-posta doğrulama bağlantısını yeniden gönderir (SMS OTP maliyeti olmadan).
  const handleResendVerification = async () => {
    if (!user?.email) return;

    setResendingVerification(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: { emailRedirectTo: createAuthRedirectUrl() },
      });
      if (error) throw error;
      Alert.alert(t('successTitle'), t('verificationResent'));
    } catch (error) {
      Alert.alert(t('errorTitle'), error.message);
    } finally {
      setResendingVerification(false);
    }
  };

  const passwordLongEnough = newPassword.trim().length >= 6;
  const handleUpdatePassword = async () => {
    if (!passwordLongEnough) {
      Alert.alert(t('warningTitle'), t('minPasswordLength'));
      return;
    }
    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      Alert.alert(t('successTitle'), t('passwordUpdated'));
      setNewPassword('');
    } catch (error) {
      Alert.alert(t('errorTitle'), error.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Store 5.1.1(v): two-step confirm → server delete → local purge → local sign-out (Auth screen).
  const handleDeleteAccount = async () => {
    if (deletingAccount) return;
    const first = await showModal({
      title: t('accountDeleteTitle'),
      message: t('accountDeleteWarning'),
      destructive: true,
      actions: [
        { id: 'cancel', label: t('cancelButton'), style: 'cancel' },
        { id: 'manage', label: t('accountManageSubscription'), style: 'cancel' },
        { id: 'continue', label: t('accountDeleteContinue'), style: 'destructive' },
      ],
    });
    if (first === 'manage') {
      const opened = await openSubscriptionManagement();
      if (!opened) showToast(t('accountManageSubscriptionFailed'), { type: 'warning' });
      return;
    }
    if (first !== 'continue') return;
    await new Promise((resolve) => setTimeout(resolve, 320));
    const second = await showModal({
      title: t('accountDeleteConfirmTitle'),
      message: t('accountDeleteConfirmBody'),
      confirmLabel: t('accountDeleteConfirmCta'),
      destructive: true,
    });
    if (second !== 'confirm') return;

    setDeletingAccount(true);
    try {
      await deleteAccountAndPurge();
      wipeAdvisorChats();
      setActiveTab('analyze');
      showToast(t('accountDeleteDone'), { type: 'success' });
    } catch {
      showToast(t('accountDeleteFailed'), { type: 'error' });
    } finally {
      setDeletingAccount(false);
    }
  };

  const saveAnalysisToSupabase = async (analysisData) => {
    if (!user) return;

    const baseRow = {
      user_id: user.id,
      score: analysisData.score,
      overall_risk: analysisData.overallRisk || analysisData.overall_risk,
      summary: analysisData.summary,
      clauses: analysisData.clauses,
      created_at: new Date().toISOString()
    };

    // Gelişmiş alanlar için sütunlar henüz yoksa kademeli olarak sadeleştirilir.
    const extendedRow = {
      ...baseRow,
      jurisdiction: analysisData.jurisdiction ?? null,
      key_takeaways: analysisData.keyTakeaways ?? null,
      red_flags: analysisData.redFlags ?? null,
      negotiation_tips: analysisData.negotiationTips ?? null,
      glossary: analysisData.glossary ?? null,
    };
    const waveARow = {
      ...extendedRow,
      decision: analysisData.decision ?? null,
      counter_message: analysisData.counterMessage ?? null,
      important_dates: analysisData.importantDates ?? null,
      party_role: resolvePartyForAnalyze(analysisParty, categoryFromTypeKey(selectedTypeKey)),
    };
    const normalized = normalizeAnalysis({
      ...analysisData,
      party_role: resolvePartyForAnalyze(analysisParty, categoryFromTypeKey(selectedTypeKey)),
      contract_category: categoryFromTypeKey(selectedTypeKey),
    });
    const waveBRow = {
      ...waveARow,
      user_party_role: toUserPartyRole(
        resolvePartyForAnalyze(analysisParty, categoryFromTypeKey(selectedTypeKey))
      ),
      decision_card: analysisData.decision_card || toDecisionCardPayload(normalized?.decision) || {},
      hidden_costs: analysisData.hidden_costs_breakdown || analysisData.hidden_costs || {},
      counter_proposals: analysisData.counter_proposals || [],
      invalid_clauses: analysisData.validity_analysis || [],
      contract_events: analysisData.contract_events || [],
      obligations: analysisData.obligations_checklist || [],
      integrity_checks: analysisData.integrity_checks || {},
      contract_category: categoryFromTypeKey(selectedTypeKey),
    };

    const waveCRow = {
      ...waveBRow,
      missing_protections: normalized?.missingProtections || [],
      power_tilt: normalized?.powerTilt || null,
      batna_ladder: normalized?.batnaLadder || [],
      governing_law_conflict: normalized?.governingLawConflict || null,
      lawyer_questions: normalized?.lawyerQuestions || [],
      sign_conditions: analysisData.sign_conditions || analysisData.signConditions || [],
      sign_status: analysisData.sign_status || analysisData.signStatus || null,
      contract_text: analysisData.contract_text || analysisData.contractText || '',
    };

    const waveDRow = {
      ...waveCRow,
      revised_contract_text: analysisData.revised_contract_text || analysisData.revisedContractText || null,
      lifecycle: analysisData.lifecycle || 'draft',
    };

    try {
      const attempts = [waveDRow, waveCRow, waveBRow, waveARow, extendedRow, baseRow];
      for (const row of attempts) {
        let payload = { ...row };
        for (let step = 0; step < 4; step += 1) {
          const { data, error } = await supabase.from('analyses').insert([payload]).select('id').maybeSingle();
          if (!error) return data?.id || null;
          const stripped = stripMissingColumn(payload, error);
          if (!stripped || Object.keys(stripped).length === Object.keys(payload).length) {
            console.log('Analiz kaydı sadeleştiriliyor:', error.message);
            break;
          }
          payload = stripped;
        }
      }
    } catch (err) {
      console.log('Kayıt hatası:', err.message);
    }
  };

  // Belge / PDF Seçimi
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setContractText('');
        setSelectedImages([]);
        setSelectedFile(file);
        Alert.alert(t('filePickedTitle'), file.name);
      }
    } catch (err) {
      Alert.alert(t('errorTitle'), t('filePickError'));
    }
  };

  const isPdfFile = (file) => {
    const mime = (file.mimeType || '').toLowerCase();
    const name = (file.name || '').toLowerCase();
    return mime.includes('pdf') || name.endsWith('.pdf');
  };

  const readPickedFile = async (file, asBase64) => {
    const uri = String(file?.uri || '');
    const fail = (detail) => {
      const error = new Error('UNREADABLE_FILE');
      error.code = 'UNREADABLE_FILE';
      error.detail = detail;
      if (isExpoGoUri(uri)) error.hintKey = 'shareUseDevClient';
      return error;
    };
    try {
      return await readOwnedFile(uri, { asBase64 });
    } catch (error) {
      console.warn('owned file okunamadı:', error?.message);
      throw fail('READ');
    }
  };

  const handleAnalyzeText = async () => {
    const pasted = String(contractText || '').trim();
    const file = selectedFile;
    const images = selectedImages;
    if (!pasted && images.length === 0 && !file) {
      Alert.alert(t('warningTitle'), t('selectContentError'));
      return;
    }

    // BN: never analyze with silent buyer default — user must confirm a side.
    Keyboard.dismiss();
    if (!partyConfirmed) {
      focusPartySelection();
      showToast(t('partyNeedSelect'), { type: 'warning' });
      return;
    }

    // Ücretsiz hak kontrolü: hak yoksa doğrudan abonelik ekranına yönlendirilir.
    if (quotaEnforced && !isPro && freeLeft <= 0) {
      if (!emailVerified) {
        Alert.alert(t('verifyEmailTitle'), t('emailNotVerified'));
        return;
      }
      openPaywall('quota');
      return;
    }

    setLoading(true);
    setResult(null);
    setProgressStep('parsing');

    const typeLabel = t(selectedTypeKey);
    const contractCategory = categoryFromTypeKey(selectedTypeKey);
    const resolvedParty = resolvePartyForAnalyze(analysisParty, contractCategory);
    const options = {
      country: analysisCountry,
      party: resolvedParty,
      category: contractCategory,
      onProgress: setProgressStep,
    };

    try {
      let data;
      let sourceText = '';
      if (pasted) {
        sourceText = pasted;
        data = await analyzeContract(sourceText, typeLabel, reportLang, 'default', {
          ...options,
          category: resolveAnalysisCategory(sourceText, contractCategory),
        });
      } else if (file) {
        if (isPdfFile(file)) {
          const fileBase64 = await readPickedFile(file, true);
          data = await analyzeContractDocument(
            { base64: fileBase64, mimeType: 'application/pdf' },
            typeLabel,
            reportLang,
            'default',
            options
          );
          sourceText = String(data?.contract_text || data?.contractText || '').trim();
        } else {
          const fileContent = await readPickedFile(file, false);
          sourceText = String(fileContent || '').trim();
          data = await analyzeContract(sourceText, typeLabel, reportLang, 'default', {
            ...options,
            category: resolveAnalysisCategory(sourceText, contractCategory),
          });
        }
      } else {
        data = await analyzeContractImages(images, typeLabel, reportLang, 'default', options);
        sourceText = String(data?.contract_text || data?.contractText || '').trim();
      }

      const analysisSource = sourceText || data?.contract_text || data?.contractText;
      if (!isAcceptableAnalysis(data, analysisSource)) {
        await showModal({
          title: t('analysisError'),
          message: t(
            data?.__extractTruncated || looksIncompleteExtract(analysisSource, { fromMedia: !pasted })
              ? 'errExtractTruncated'
              : 'errUnreadableResponse'
          ),
          cancelLabel: false,
          confirmLabel: t('toastOk'),
        });
        return;
      }

      if (data?.__fromCache) {
        showToast(t('cacheHit'), { type: 'info' });
      }

      const extractCut =
        !pasted &&
        (Boolean(data?.__extractTruncated) ||
          looksIncompleteExtract(analysisSource, { fromMedia: true }));
      const billable = isBillableAnalysis(data) && !extractCut;
      const resolvedCategory = resolveAnalysisCategory(analysisSource, contractCategory);
      const decorated = {
        ...data,
        party_role: resolvedParty,
        contract_category: resolvedCategory,
        contract_text: pasted || sourceText,
        contractText: pasted || sourceText,
        sign_conditions: [],
        signConditions: [],
        lifecycle: 'draft',
        revised_contract_text: '',
        revisedContractText: '',
      };
      let analysisId = decorated.id || null;
      if (user) {
        analysisId = (await saveAnalysisToSupabase(decorated)) || analysisId;
      }
      setOfferTiers({});
      setResult({ ...decorated, id: analysisId });
      if (isAcceptableAnalysis(decorated, pasted || sourceText)) maybeOfferShareLoop();
      if (analysisId) rememberLastAnalysisId(analysisId);
      const detectedCategory = decorated.detected_contract_category || decorated.detectedContractCategory;
      if (!typeLocked) {
        const detectSource =
          sourceText ||
          decorated.contract_text ||
          decorated.contractText ||
          contractText ||
          '';
        const localResolved = resolveAnalysisCategory(detectSource, contractCategory);
        const localDetect = detectContractType(detectSource);
        const strongLocalSales =
          localResolved === 'sales' ||
          isSalesPreamble(String(detectSource).slice(0, 500)) ||
          (localDetect.category === 'sales' && Number(localDetect.confidence || 0) >= 0.5);
        const strongLocalSaas =
          localResolved === 'saas' ||
          isSaasPreamble(String(detectSource).slice(0, 500)) ||
          (localDetect.category === 'saas' && Number(localDetect.confidence || 0) >= 0.5);

        if (strongLocalSales) {
          // Strong local sales detect must not be overwritten by Claude nda/etc.
          setSelectedTypeKey('typeSales');
          setDetectedTypeHint('typeSales');
          setAnalysisParty((prev) =>
            isGranularPartyCode(prev) ? prev : coercePartyForCategory(prev, 'sales')
          );
        } else if (strongLocalSaas) {
          // Strong local SaaS (YÜKLENİCİ / license) must not be overwritten by Claude nda.
          setSelectedTypeKey('typeSaaS');
          setDetectedTypeHint('typeSaaS');
          setAnalysisParty((prev) =>
            isGranularPartyCode(prev) ? prev : coercePartyForCategory(prev, 'saas')
          );
        } else {
          const localStrong =
            localDetect.category &&
            localDetect.category !== 'general' &&
            Number(localDetect.confidence || 0) >= 0.5
              ? localDetect.category
              : null;
          const claudeCat = detectedCategory ? String(detectedCategory).toLowerCase() : '';
          // Only apply Claude category when it does not contradict a strong local detect.
          const nextCategory =
            localStrong && claudeCat && localStrong !== claudeCat
              ? localStrong
              : claudeCat || localStrong || null;
          if (nextCategory) {
            const key =
              typeKeyFromCategory(nextCategory) ||
              Object.keys(CONTRACT_CATEGORIES).find((item) => CONTRACT_CATEGORIES[item] === nextCategory);
            if (key) {
              setSelectedTypeKey(key);
              setDetectedTypeHint(key);
              setAnalysisParty((prev) =>
                isGranularPartyCode(prev) ? prev : coercePartyForCategory(prev, nextCategory)
              );
            }
          }
        }
      }
      const trapDates = ensureTrapCalendar(
        { ...decorated, contract_text: sourceText || decorated.contract_text },
        t('trapNotSpecified'),
        analysisLang
      );
      const dates = decorated.importantDates || [];
      const events = decorated.contract_events || [];
      if (user?.id) {
        await mergeDeadlines({
          userId: user.id,
          dates: trapDates.length ? trapDates : dates.length ? dates : events,
          summary: decorated.summary,
        });
        await saveContractReminders({
          userId: user.id,
          analysisId,
          events,
          dates: trapDates.length ? trapDates : dates,
        });
        scheduleTrapReminders({
          analysisId,
          events,
          dates: trapDates,
          title: t('upcomingDeadlinesTitle'),
          prompt: false,
        }).catch(() => {});
        setUpcomingDeadlines(await loadUpcomingDeadlines(user.id));
      }

      if (quotaEnforced && !isPro && billable) {
        try {
          const left = await consumeAnalysisCredit();
          if (typeof left === 'number' && left >= 0) {
            setProfile((prev) => (prev ? { ...prev, free_analyses_left: left } : prev));
          }
        } catch (quotaError) {
          console.warn('Analiz hakkı düşülemedi:', quotaError?.message);
          if (quotaError.code === QUOTA_ERRORS.QUOTA_EXHAUSTED) {
            openPaywall('quota');
          }
        }
      }
    } catch (error) {
      if (error?.code === QUOTA_ERRORS.QUOTA_EXHAUSTED) {
        openPaywall('quota');
      } else if (error?.code === 'UNREADABLE_FILE') {
        await showModal({
          title: t('analysisError'),
          message: t(error.hintKey || 'errUnreadableFile'),
          cancelLabel: false,
          confirmLabel: t('toastOk'),
        });
      } else {
        // Empty extractedText is NOT a truncated document. Prefer PARSE retry toast on paste.
        const extracted = String(error?.extractedText || '').trim();
        const truncated =
          Boolean(error?.__extractTruncated) ||
          (extracted.length > 0 &&
            !pasted &&
            looksIncompleteExtract(extracted, { fromMedia: true }));
        const isParse =
          error?.code === AI_ERROR_CODES.PARSE || error?.code === 'PARSE';
        const message = truncated
          ? t('errExtractTruncated')
          : isParse
            ? t('errParseRetry')
            : describeError(t, error);
        try {
          await showModal({
            title: t('analysisError'),
            message,
            cancelLabel: false,
            confirmLabel: t('toastOk'),
          });
        } catch {
          Alert.alert(t('analysisError'), message);
        }
      }
    } finally {
      setLoading(false);
      setProgressStep(null);
    }
  };

  const removeImage = (indexToRemove) => {
    setSelectedImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
  };

  // PDF Rapor Çıktısı Alma ve Paylaşma
  const exportPDFReport = async (rawAnalysis, mode = 'share') => {
    const analysis = normalizeAnalysis(rawAnalysis);
    if (!analysis) return;

    const risk = analysis.risk;
    const takeaways = asList(getKeyTakeaways(analysis)).filter((item) => !isPlaceholderText(item));
    const unspecified = t('trapNotSpecified');
    const trapDates = ensureTrapCalendar(
      { ...analysis, contract_text: analysis.contract_text || analysis.contractText || contractText },
      unspecified,
      analysisLang
    );
    const pdfText = (value, fallback = '') => escapeHtml(safeDisplayText(value, fallback));
    const REPORT_CHAR_BUDGET = 3800;
    const REPORT_LINE_BUDGET = 72;
    const reportBlockCost = (html) => {
      const text = String(html || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|h[1-6]|li|ul|tr)>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&[a-z#0-9]+;/gi, ' ')
        .replace(/\n{2,}/g, '\n')
        .trim();
      const lines = text
        ? text.split('\n').reduce((n, line) => n + Math.max(1, Math.ceil(line.length / 80)), 0)
        : 0;
      return { chars: text.length, lines };
    };
    const packReportPages = (blocks) => {
      const pages = [];
      let current = [];
      let usedChars = 0;
      let usedLines = 0;
      const flush = () => {
        if (!current.length) return;
        pages.push(`<div class="page">${current.join('\n')}</div>`);
        current = [];
        usedChars = 0;
        usedLines = 0;
      };
      (blocks || []).forEach((html) => {
        const block = String(html || '').trim();
        if (!block) return;
        const cost = reportBlockCost(block);
        if (
          current.length
          && (usedChars + cost.chars > REPORT_CHAR_BUDGET || usedLines + cost.lines > REPORT_LINE_BUDGET)
        ) {
          flush();
        }
        current.push(block);
        usedChars += cost.chars;
        usedLines += cost.lines;
      });
      flush();
      // Merge a tiny trailing page into the previous when there is free space (avoid orphan pages).
      if (pages.length >= 2) {
        const pageInner = (html) =>
          String(html || '')
            .replace(/^<div class="page">/, '')
            .replace(/<\/div>\s*$/, '');
        const lastInner = pageInner(pages[pages.length - 1]);
        const prevInner = pageInner(pages[pages.length - 2]);
        const lastCost = reportBlockCost(lastInner);
        const prevCost = reportBlockCost(prevInner);
        if (
          lastCost.lines <= 10
          && lastCost.chars <= 700
          && prevCost.chars + lastCost.chars <= REPORT_CHAR_BUDGET
          && prevCost.lines + lastCost.lines <= REPORT_LINE_BUDGET
        ) {
          pages[pages.length - 2] = `<div class="page">${prevInner}\n${lastInner}</div>`;
          pages.pop();
        }
      }
      return pages.join('\n');
    };

    const reportBlocks = [];
    const pushReportBlock = (html, headingHtml = '') => {
      const block = String(html || '').trim();
      if (!block) return;
      const heading = String(headingHtml || '').trim();
      reportBlocks.push(heading ? `${heading}\n${block}` : block);
    };

    const headerHtml = `
      <div class="header" style="background:#0A0F1D;color:#FFFFFF;padding:22px 20px;border-radius:10px;border-bottom:0;margin-bottom:22px">
        <p style="letter-spacing:2px;text-transform:uppercase;font-size:11px;color:#00F5D4;margin:0 0 8px">${escapeHtml(t('executiveAudit'))}</p>
        <h1 style="color:#FFFFFF;margin:0 0 8px">${escapeHtml(t('pdfBrandTitle'))}</h1>
        <p style="color:#94A3B8;margin:0"><strong>${escapeHtml(t('dateLabel'))}:</strong> ${escapeHtml(formatDate(analysis.created_at || Date.now()))}</p>
      </div>
    `;
    const scoreHtml = `
      <p class="score">${pdfText(t('scoreText'))}: ${analysis.score} / 100 (${pdfText(getRiskLabel(risk))})</p>
      <div class="gauge"><div class="gauge-fill"></div></div>
    `;
    const jurisdictionHtml = analysis.jurisdiction
      ? `
        <div class="jurisdiction">
          <strong>${pdfText(t('jurisdictionTitle'))}:</strong> ${pdfText(analysis.jurisdiction.country)}
          &nbsp;|&nbsp; <strong>${pdfText(t('governingLawLabel'))}:</strong> ${pdfText(analysis.jurisdiction.governingLaw)}
        </div>
      `
      : '';
    const leadCluster = `${headerHtml}\n${scoreHtml}`;
    const jurisdictionCost = reportBlockCost(jurisdictionHtml);
    const jurisdictionShort = !jurisdictionHtml
      || (jurisdictionCost.chars <= 280 && jurisdictionCost.lines <= 4);
    pushReportBlock(jurisdictionShort && jurisdictionHtml ? `${leadCluster}\n${jurisdictionHtml}` : leadCluster);
    if (jurisdictionHtml && !jurisdictionShort) {
      pushReportBlock(jurisdictionHtml);
    }
    if (asList(takeaways).length) {
      pushReportBlock(`
        <div class="takeaways section">
          <h3>${pdfText(t('keyTakeawaysTitle'))}</h3>
          <ul>${asList(takeaways).map((item) => `<li>${pdfText(item)}</li>`).join('')}</ul>
        </div>
      `);
    }
    if (analysis.decision?.headline) {
      pushReportBlock(`
        <div class="takeaways">
          <h3>${pdfText(t('decisionTitle'))}: ${pdfText(t(
            analysis.decision.action === 'SIGN'
              ? 'decisionSign'
              : analysis.decision.action === 'WALK_AWAY'
                ? 'decisionWalkAway'
                : 'decisionNegotiate'
          ))}</h3>
          <p><strong>${pdfText(analysis.decision.headline)}</strong></p>
          <ul>${(analysis.decision?.reasons || []).map((item) => `<li>${pdfText(item)}</li>`).join('')}</ul>
          ${analysis.decision.estimatedHarm ? `<p>${pdfText(t('decisionHarmLabel'))}: ${pdfText(analysis.decision.estimatedHarm)}</p>` : ''}
        </div>
      `);
    }
    pushReportBlock(`
      <h3>${pdfText(t('summaryTitle'))}</h3>
      <p>${pdfText(analysis.summary)}</p>
    `);
    (analysis?.redFlags || []).forEach((flag, index) => {
      pushReportBlock(`
        <div class="red-flag risk-box">
          <p class="risk-badge">${pdfText(t(flag.severity === 'YELLOW' ? 'yellowFlagBadge' : 'redFlagBadge'))} · ${pdfText(getRiskLabel(flag.severity))}</p>
          <p><strong>${pdfText(flag.title)}</strong></p>
          <p>${pdfText(flag.explanation)}</p>
          ${flag.legalReference ? `<p class="legal-ref">${pdfText(t('legalReferenceLabel'))}: ${pdfText(flag.legalReference)}</p>` : ''}
        </div>
      `, index === 0 ? `<h3>${pdfText(t('redFlagsTitle'))}</h3>` : '');
    });
    (analysis?.clauses || []).forEach((c, i) => {
      pushReportBlock(`
        <div class="clause clause-item">
          <p class="risk-badge">${pdfText(getRiskLabel(c.riskLevel))}</p>
          <p><strong>${pdfText(t('clauseItem', { index: i + 1 }))}:</strong> ${pdfText(c.clauseTitle)}</p>
          ${c.originalText ? `<p><em>"${pdfText(c.originalText)}"</em></p>` : ''}
          <p><strong>${pdfText(t('detectedRisk'))}:</strong> ${pdfText(c.issue, t('clauseGeneralFallback'))}</p>
          ${c.legalReference ? `<p class="legal-ref">${pdfText(t('legalReferenceLabel'))}: ${pdfText(c.legalReference)}</p>` : ''}
          ${c.counterOffer ? `<div class="counter-box"><strong>${pdfText(t('suggestedCounter'))}:</strong> ${pdfText(c.counterOffer)}</div>` : ''}
        </div>
      `, i === 0 ? `<h3>${pdfText(t('clausesTitle'))}</h3>` : '');
    });
    (analysis?.negotiationTips || []).forEach((tip, i) => {
      pushReportBlock(`
        <div class="tip section">
          <p><strong>${i + 1}. ${pdfText(tip.argument)}</strong></p>
          ${tip.rationale ? `<p>${pdfText(tip.rationale)}</p>` : ''}
        </div>
      `, i === 0 ? `<h3>${pdfText(t('negotiationTitle'))}</h3>` : '');
    });
    (analysis?.glossary || []).forEach((entry, i) => {
      pushReportBlock(
        `<p class="glossary-item"><strong>${pdfText(entry.term)}:</strong> ${pdfText(entry.definition)}</p>`,
        i === 0 ? `<h3>${pdfText(t('glossaryTitle'))}</h3>` : ''
      );
    });
    if (analysis.counterMessage) {
      pushReportBlock(`
        <h3>${pdfText(t('counterMessageTitle'))}</h3>
        <p>${pdfText(analysis.counterMessage)}</p>
      `);
    }
    (trapDates || []).forEach((item, i) => {
      const label = item.placeholder || item.label === item.kind ? t(kindLabelKey(item.kind)) : item.label;
      const when = item.badge || item.date || item.note || unspecified;
      pushReportBlock(
        `<p class="glossary-item"><strong>${pdfText(label)}</strong> — ${pdfText(when)}</p>`,
        i === 0 ? `<h3>${pdfText(t('trapCalendarTitle'))}</h3>` : ''
      );
    });
    (analysis?.validityAnalysis || []).forEach((item, i) => {
      pushReportBlock(`
        <div class="clause clause-item">
          <p class="risk-badge">${pdfText(t(item.legalStatus === 'VOID' ? 'legalStatusVoid' : item.legalStatus === 'PARTIALLY_VOID' ? 'legalStatusPartial' : item.legalStatus === 'VALID' ? 'legalStatusValid' : 'legalStatusQuestionable'))}</p>
          <p><strong>${pdfText(item.clauseNumber)}</strong> ${item.originalText ? `<em>"${pdfText(item.originalText)}"</em>` : ''}</p>
          <p>${pdfText(item.explanation)}</p>
          ${item.governingLawReference ? `<p class="legal-ref">${pdfText(item.governingLawReference)}</p>` : ''}
        </div>
      `, i === 0 ? `<h3>${pdfText(t('validityTitle'))}</h3>` : '');
    });
    if (hasHiddenCosts(analysis.hiddenCosts)) {
      pushReportBlock(`
        <h3>${pdfText(t('hiddenCostsTitle'))}</h3>
        <p>${pdfText(t('hiddenCostTotal'))}: ${pdfText(analysis.hiddenCosts.totalEstimatedLiability)}</p>
      `);
    }
    (analysis?.obligations || []).forEach((item, i) => {
      pushReportBlock(
        `<p class="glossary-item"><strong>${pdfText(item.party === 'USER' ? t('obligationUser') : t('obligationOther'))}:</strong> ${pdfText(item.task)}${item.deadline ? ` — ${pdfText(item.deadline)}` : ''}</p>`,
        i === 0 ? `<h3>${pdfText(t('obligationsTitle'))}</h3>` : ''
      );
    });

    const shieldText = String(analysis.revised_contract_text || analysis.revisedContractText || '')
      .replace(/&emsp;?/gi, ' ')
      .replace(/&nbsp;/gi, ' ')
      .trim();
    const shieldHeading = `<h3>${pdfText(t('shieldDocTitle'))}</h3>`;
    const shieldPages = shieldText
      ? String(paginatePlainBody(shieldText)).replace(
          '<div class="page">',
          `<div class="page">${shieldHeading}`
        )
      : '';

    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            @page { size: A4; margin: 16mm; }
            body { font-family: Helvetica, Arial, sans-serif; padding: 0; color: #1A202C; font-size: 11pt; line-height: 1.45; }
            h1, h3, .section-title { color: #00B4D8; page-break-after: avoid; break-after: avoid; }
            h1 { margin-bottom: 5px; letter-spacing: 0.5px; }
            h3, .section-title { font-size: 13pt; font-weight: 700; margin-top: 18px; margin-bottom: 8px; }
            p { orphans: 3; widows: 3; }
            .header { border-bottom: 2px solid #E2E8F0; padding-bottom: 15px; margin-bottom: 20px; page-break-inside: avoid; break-inside: avoid; }
            .score { font-size: 22px; font-weight: bold; color: ${risk === 'RED' ? '#FF3B5C' : '#00E676'}; page-break-after: avoid; }
            .gauge { background: #E2E8F0; border-radius: 6px; height: 12px; margin: 6px 0 18px; overflow: hidden; }
            .gauge-fill { height: 12px; width: ${Math.max(0, Math.min(100, analysis.score))}%; background: ${getRiskColor(risk)}; }
            .takeaways { background-color: #F0FDFA; border: 1px solid #99F6E4; padding: 12px 18px; border-radius: 8px; margin-bottom: 18px; page-break-inside: avoid; break-inside: avoid; }
            .jurisdiction { background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px 16px; border-radius: 8px; margin-bottom: 18px; font-size: 12px; page-break-inside: avoid; break-inside: avoid; }
            .red-flag { background-color: #FFF1F2; border: 1px solid #FECDD3; border-left: 4px solid #FF3B5C; padding: 12px; border-radius: 8px; margin-bottom: 10px; page-break-inside: avoid; break-inside: avoid; }
            .clause { margin-bottom: 15px; border: 1px solid #E2E8F0; padding: 12px; border-radius: 8px; page-break-inside: avoid; break-inside: avoid; }
            .risk-badge { font-size: 9pt; font-weight: bold; color: #FF3B5C; text-transform: uppercase; letter-spacing: 0.06em; }
            .counter-box { background-color: #E6FFFA; padding: 10px; border-radius: 6px; margin-top: 8px; page-break-inside: avoid; break-inside: avoid; }
            .legal-ref, .glossary-item { font-size: 9.5pt; color: #475569; }
            .legal-ref { margin-top: 6px; }
            .tip { border-left: 3px solid #00B4D8; padding: 4px 0 4px 12px; margin-bottom: 10px; }
            .glossary-item { margin-bottom: 6px; }
            .page { box-sizing: border-box; width: 178mm; page-break-after: always; }
            .page:last-child { page-break-after: auto; }
            pre.doc { white-space: pre-wrap; word-break: normal; overflow-wrap: break-word; font-family: Georgia, serif; font-size: 12px; line-height: 1.5; margin: 0; }
          </style>
        </head>
        <body>
          ${packReportPages(reportBlocks)}
          ${shieldPages}
        </body>
      </html>
    `;

    try {
      const printed = await Print.printToFileAsync({ html: htmlContent, base64: true });
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `NexuLex-rapor-${stamp}.pdf`;
      let payload = String(printed?.base64 || '').replace(/^data:[^;]+;base64,/, '');
      if (!payload && printed?.uri) {
        try {
          payload = await readOwnedFile(printed.uri, { asBase64: true });
        } catch (readError) {
          console.warn('Print URI owned okunamadı:', readError?.message);
        }
      }
      const ownedUri = payload ? await writeOwnedBase64(payload, filename) : '';
      if (!ownedUri) {
        Alert.alert(t('errorTitle'), t('pdfExportError'));
        return;
      }

      const shareOwned = async (dialogTitle) => {
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert(t('successTitle'), `${t('sharingUnavailable')}\n${ownedUri}`);
          return false;
        }
        await Sharing.shareAsync(ownedUri, {
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf',
          dialogTitle,
        });
        return true;
      };

      if (mode !== 'save') {
        await shareOwned(t('downloadPdfReport'));
        return;
      }

      if (Platform.OS === 'android') {
        const saved = await trySaveBase64ViaSaf(payload, filename, 'application/pdf');
        if (saved) {
          showToast(t('pdfSavedTo', { path: filename }), { type: 'success' });
          return;
        }
      }

      await shareOwned(t('savePdfToDevice'));
    } catch (err) {
      Alert.alert(t('errorTitle'), `${t('pdfExportError')}\n${err.message}`);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;
  const openShareFromInput = () => {
    const parsed = parseShareCode(shareCodeInput);
    const code = parsed || String(shareCodeInput || '').trim().toUpperCase().replace(/[^0-9A-HJKMNP-TV-Z]/g, '');
    if (!SHARE_CODE_RE.test(code)) {
      showToast(t('shareUnavailable'), { type: 'warning' });
      return;
    }
    setPendingShareCode(code);
  };

  const renderShareCodeEntry = () => (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginTop: 8, marginBottom: 14 }]}>
      <Text style={[styles.settingLabel, { color: theme.text }]}>{t('shareEnterCode')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>
        {t('shareEnterCodeHint')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <TextInput
          style={[
            styles.input,
            {
              flex: 1,
              backgroundColor: theme.inputBg,
              color: theme.text,
              borderColor: theme.borderColor,
              letterSpacing: 2,
              marginBottom: 0,
            },
          ]}
          value={shareCodeInput}
          onChangeText={(text) => {
            const parsed = parseShareCode(text);
            if (parsed) {
              setShareCodeInput(parsed);
              return;
            }
            setShareCodeInput(
              String(text || '')
                .toUpperCase()
                .replace(/[^0-9A-HJKMNP-TV-Z]/g, '')
                .slice(0, 8)
            );
          }}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={2048}
          placeholder="A1B2C3D4"
          placeholderTextColor={theme.subText}
          accessibilityLabel={t('shareEnterCode')}
        />
        <TouchableOpacity
          style={[styles.secondaryBtn, { marginTop: 0, paddingHorizontal: 12 }]}
          onPress={openShareFromInput}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText} numberOfLines={1}>
            {t('shareOpenCode')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const activeResult = applyFreePreview(result, !lockPremium);
  const activeHistoryItem = applyFreePreview(selectedHistoryItem, !lockPremium);

  const renderRiskGauge = (score, risk) => (
    <RiskGauge theme={theme} score={score} risk={risk} label={getRiskLabel(risk)} />
  );

  // Hızlı Özet ve Kritik Uyarılar
  const renderKeyTakeaways = (analysis) => {
    const takeaways = asList(getKeyTakeaways(analysis)).filter((item) => !isPlaceholderText(item));
    if (!takeaways.length) return null;

    return (
      <View style={[styles.takeawayCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
        <View style={styles.takeawayHeader}>
          <Ionicons name="alert-circle" size={16} color="#FFB800" />
          <Text style={[styles.takeawayTitle, { color: theme.text }]} numberOfLines={1}>
            {t('keyTakeawaysTitle')}
          </Text>
        </View>
        {takeaways.map((item, index) => (
          <View key={index} style={styles.takeawayRow}>
            <Text style={styles.takeawayIndex}>{index + 1}</Text>
            <Text style={[styles.takeawayText, { color: theme.subText }]}>{safeDisplayText(item)}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Otomatik Tespit Edilen Yetkili Hukuk
  const renderJurisdiction = (analysis) => {
    const info = analysis.jurisdiction;
    if (!info || (!info.country && !info.governingLaw)) return null;

    const confidence = getConfidenceLabel(info.confidence);

    return (
      <View style={[styles.jurisdictionCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
        <View style={styles.takeawayHeader}>
          <Ionicons name="globe-outline" size={16} color="#00B4D8" />
          <Text style={[styles.takeawayTitle, { color: theme.text }]} numberOfLines={1}>
            {t('jurisdictionTitle')}
          </Text>
          {confidence ? (
            <Text style={[styles.jurisdictionConfidence, { color: theme.subText }]} numberOfLines={1}>
              {t('confidenceLabel')}: {confidence}
            </Text>
          ) : null}
        </View>

        {info.country ? (
          <Text style={[styles.jurisdictionRow, { color: theme.subText }]}>
            <Text style={styles.jurisdictionKey}>{info.country}</Text>
          </Text>
        ) : null}
        {info.governingLaw ? (
          <Text style={[styles.jurisdictionRow, { color: theme.subText }]}>
            {t('governingLawLabel')}: {info.governingLaw}
          </Text>
        ) : null}
        {info.detectedLanguage ? (
          <Text style={[styles.jurisdictionRow, { color: theme.subText }]}>
            {t('detectedLanguageLabel')}: {info.detectedLanguage}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderLawClash = (analysis, locked, onUnlock) => {
    const clash = analysis?.governingLawConflict;
    if (!clash?.hasClash) return null;
    const autoWithoutForeign =
      String(analysisCountry || 'auto').toLowerCase() === 'auto' && !clash.contractLaw;
    if (autoWithoutForeign) return null;

    if (locked) {
      return (
        <View style={[styles.clashBanner, { backgroundColor: theme.cardBg, borderColor: WARNING }]}>
          <Text style={[styles.takeawayTitle, { color: theme.text }]}>{t('lawClashTitle')}</Text>
          <ConversionHook theme={theme} hook="lawClash" onUnlock={onUnlock} />
        </View>
      );
    }

    return (
      <View style={[styles.clashBanner, { backgroundColor: theme.cardBg, borderColor: DANGER }]}>
        <Text style={[styles.takeawayTitle, { color: theme.text }]}>{t('lawClashTitle')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('lawClashBody')}</Text>
        {clash.contractLaw ? (
          <Text style={[styles.jurisdictionRow, { color: theme.subText }]}>{clash.contractLaw}</Text>
        ) : null}
        {clash.userLaw ? (
          <Text style={[styles.jurisdictionRow, { color: theme.subText }]}>{clash.userLaw}</Text>
        ) : null}
        {clash.clauseRef ? (
          <Text style={[styles.jurisdictionRow, { color: theme.subText }]}>{clash.clauseRef}</Text>
        ) : null}
        {clash.effect ? (
          <Text style={[styles.summaryText, { color: theme.text, textAlign: alignStart, marginBottom: 0 }]}>
            {safeDisplayText(clash.effect)}
          </Text>
        ) : null}
      </View>
    );
  };

  // Zehirli / Adil Olmayan Madde Uyarıları
  const renderRedFlags = (analysis) => {
    const flags = meaningfulRedFlags(analysis?.redFlags);

    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={[styles.sectionHeader, { color: theme.text }]}>{t('redFlagsTitle')}</Text>
        {flags.length ? flags.map((flag, index) => (
          <View key={index} style={[styles.redFlagCard, { backgroundColor: theme.cardBg }]}>
            <View style={styles.clauseHeader}>
              <View style={styles.clauseHeaderTop}>
                <View style={[styles.badge, { backgroundColor: getRiskColor(flag.severity || 'RED') }]}>
                  <Text style={badgeLabelStyle(flag.severity || 'RED')} numberOfLines={1}>
                    {t(flag.severity === 'YELLOW' ? 'yellowFlagBadge' : 'redFlagBadge')}
                  </Text>
                </View>
              </View>
              <Text style={[styles.clauseTitle, { color: theme.text, flexShrink: 1, flexWrap: 'wrap' }]}>
                {safeDisplayText(flag.title)}
              </Text>
            </View>

            <Text style={[styles.redFlagText, { color: theme.subText, flexWrap: 'wrap' }]}>
              {safeDisplayText(flag.explanation, t('clauseGeneralFallback'))}
            </Text>

            {flag.legalReference ? (
              <Text style={styles.legalReference}>
                ⚖ {t('legalReferenceLabel')}: {safeDisplayText(flag.legalReference)}
              </Text>
            ) : (() => {
              const book = getPlaybook(analysis?.contractCategory || categoryFromTypeKey(selectedTypeKey));
              const fallback = (book?.items || [])
                .map((item) => statuteFor(item, analysisCountry))
                .find((cite) => cite && /[§]|m\.\s*\d|Art\.|المادة|ст\./i.test(cite));
              return fallback ? (
                <Text style={styles.legalReference}>
                  ⚖ {t('legalReferenceLabel')}: {fallback}
                </Text>
              ) : null;
            })()}

            {(() => {
              const flagId = `flag:${index}`;
              const offer = pickCounterOffer(flag, offerTiers[flagId] || 'balanced');
              if (!offer) return null;
              const isCounterCopied = copiedKey === `flag-counter-${index}`;
              return (
                <View style={styles.counterBox}>
                  <View style={styles.counterHeader}>
                    <Text style={[styles.counterTitle, { flex: 1 }]}>{t('counterTitle')}</Text>
                    <TouchableOpacity
                      onPress={() => copyCounterOfferToClipboard(flag, index, 'flag', flagId)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityLabel={t('copyCounterOffer')}
                    >
                      <Ionicons
                        name={isCounterCopied ? 'checkmark-circle' : 'copy-outline'}
                        size={16}
                        color={isCounterCopied ? '#00E676' : '#00F5D4'}
                      />
                    </TouchableOpacity>
                  </View>
                  {renderOfferTierChips(flag, flagId)}
                  <Text style={styles.counterText}>{safeDisplayText(offer)}</Text>
                </View>
              );
            })()}
          </View>
        )) : (
          <View style={[styles.redFlagCard, { backgroundColor: theme.cardBg, borderLeftColor: ACCENT, borderColor: theme.borderColor }]}>
            <Text style={[styles.redFlagText, { color: theme.subText }]}>{t('redFlagsEmpty')}</Text>
          </View>
        )}
      </View>
    );
  };

  // Müzakere Stratejisi ve Pazarlık İpuçları
  const renderNegotiationTips = (analysis) => {
    const tips = analysis?.negotiationTips || [];
    if (!tips.length) return null;

    return (
      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginBottom: 20 }]}>
        <View style={styles.takeawayHeader}>
          <Ionicons name="chatbubbles-outline" size={16} color="#00F5D4" />
          <Text style={[styles.takeawayTitle, { color: theme.text }]} numberOfLines={1}>
            {t('negotiationTitle')}
          </Text>
        </View>
        <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('negotiationHint')}</Text>

        {tips.map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <Text style={styles.tipIndex}>{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tipArgument, { color: theme.text }]}>{safeDisplayText(tip.argument)}</Text>
              {tip.rationale ? (
                <Text style={[styles.tipRationale, { color: theme.subText }]}>{safeDisplayText(tip.rationale)}</Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Hukuki Terimler Sözlüğü
  const renderGlossary = (analysis) => {
    const glossary = analysis?.glossary || [];
    if (!glossary.length) return null;

    return (
      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginBottom: 30 }]}>
        <View style={styles.takeawayHeader}>
          <Ionicons name="book-outline" size={16} color="#00B4D8" />
          <Text style={[styles.takeawayTitle, { color: theme.text }]} numberOfLines={1}>
            {t('glossaryTitle')}
          </Text>
        </View>

        {glossary.map((entry, index) => (
          <View key={index} style={styles.glossaryRow}>
            <Text style={[styles.glossaryTerm, { color: '#00B4D8' }]}>{safeDisplayText(entry?.term)}</Text>
            <Text style={[styles.glossaryDefinition, { color: theme.subText }]}>{safeDisplayText(entry?.definition)}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Tek Madde Kartı (Analiz sonucu ve geçmiş detayı ortak kullanır)
  const renderClauseCard = (item, index, keyPrefix) => {
    const clauseKey = `${keyPrefix}-${index}`;
    const isCopied = copiedKey === clauseKey;
    const isCounterCopied = copiedKey === `${keyPrefix}-counter-${index}`;

    return (
      <View key={clauseKey} style={[styles.clauseCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
        <View style={styles.clauseHeader}>
          <View style={[styles.badge, { backgroundColor: getRiskColor(item.riskLevel) }]}>
            <Text style={badgeLabelStyle(item.riskLevel)} numberOfLines={1}>{item.riskLevel}</Text>
          </View>
          <Text
            style={[styles.clauseTitle, { color: theme.text, flexShrink: 1, flexWrap: 'wrap' }]}
          >
            {safeDisplayText(item.clauseTitle) || t('clauseItem', { index: index + 1 })}
          </Text>
          <TouchableOpacity
            onPress={() => copyClauseToClipboard(item, index, keyPrefix)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={t('copyClause')}
            style={{ flexShrink: 0 }}
          >
            <Ionicons
              name={isCopied ? 'checkmark-circle' : 'copy-outline'}
              size={18}
              color={isCopied ? '#00E676' : theme.subText}
            />
          </TouchableOpacity>
        </View>
        {item.legalStatus ? (
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: getRiskColor(
                  item.legalStatus === 'VALID' ? 'GREEN' : item.legalStatus === 'QUESTIONABLE' ? 'YELLOW' : 'RED'
                ),
                alignSelf: 'flex-start',
                marginBottom: 8,
              },
            ]}
          >
            <Text style={styles.statusChipText} numberOfLines={1}>
              {legalStatusEmoji(item.legalStatus)} {t(legalStatusKey(item.legalStatus))}
            </Text>
          </View>
        ) : null}

        {item.originalText ? (
          <Text style={[styles.originalText, { color: theme.subText }]}>
            "{safeDisplayText(item.originalText)}"
          </Text>
        ) : null}

        <View style={styles.issueBox}>
          <Text style={styles.issueTitle}>{t('riskTitle')}</Text>
          <Text style={styles.issueText}>
            {safeDisplayText(item.issue, t('clauseGeneralFallback'))}
          </Text>
        </View>

        {safeDisplayText(item.legalReference) ? (
          <Text style={styles.legalReference}>
            ⚖ {t('legalReferenceLabel')}: {safeDisplayText(item.legalReference)}
          </Text>
        ) : null}

        {(item.legalStatus === 'VOID' || item.legalStatus === 'PARTIALLY_VOID') && item.cancellationRight ? (
          <Text style={[styles.issueText, { marginTop: 8 }]}>
            {t('validityRemedyLabel')}: {safeDisplayText(item.cancellationRight)}
          </Text>
        ) : null}

        {(() => {
          const clauseId = `clause:${index}`;
          const offer = pickCounterOffer(item, offerTiers[clauseId] || 'balanced');
          if (!offer) return null;
          return (
            <View style={styles.counterBox}>
              <View style={styles.counterHeader}>
                <Text style={[styles.counterTitle, { flex: 1 }]}>{t('counterTitle')}</Text>
                <TouchableOpacity
                  onPress={() => copyCounterOfferToClipboard(item, index, keyPrefix, clauseId)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={t('copyCounterOffer')}
                >
                  <Ionicons
                    name={isCounterCopied ? 'checkmark-circle' : 'copy-outline'}
                    size={16}
                    color={isCounterCopied ? '#00E676' : '#00F5D4'}
                  />
                </TouchableOpacity>
              </View>
              {renderOfferTierChips(item, clauseId)}
              <Text style={styles.counterText}>{safeDisplayText(offer)}</Text>
            </View>
          );
        })()}
      </View>
    );
  };

  const renderCounterMessage = (analysis) => {
    if (!analysis.counterMessage) return null;
    const copied = copiedKey === 'counter-message';

    return (
      <View
        style={[
          styles.counterMessageCard,
          { backgroundColor: theme.cardBg, borderColor: theme.borderColor },
        ]}
      >
        <View style={styles.takeawayHeader}>
          <Ionicons name="send-outline" size={16} color={ACCENT} />
          <Text style={[styles.takeawayTitle, { color: theme.text }]} numberOfLines={1}>
            {t('counterMessageTitle')}
          </Text>
          <TouchableOpacity
            onPress={() => copyCounterMessage(analysis.counterMessage)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={t('copyCounterMessage')}
          >
            <Ionicons
              name={copied ? 'checkmark-circle' : 'copy-outline'}
              size={18}
              color={copied ? '#00E676' : ACCENT}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('counterMessageHint')}</Text>
        <Text style={[styles.summaryText, { color: theme.text, marginBottom: 0 }]}>
          {safeDisplayText(analysis.counterMessage)}
        </Text>
      </View>
    );
  };

  const renderAnalysisReport = (analysis, keyPrefix, fullRaw) => {
    if (!analysis) return null;
    const locked = analysis.isPreview;
    const counts = analysis.lockedCounts || {};
    const paywallCtx = () => {
      const partyCode = analysis.partyRole || analysis.party_role || analysisParty;
      const role =
        (PARTY_ROLES || []).find((item) => item.code === partyCode) ||
        (PARTY_ROLES || []).find((item) => item.code === 'buyer') ||
        PARTY_ROLES[0];
      const roleLabel = role?.labelKey ? t(role.labelKey) : '';
      const name = String(partyDisplayName || '').trim();
      return {
        partyLabel: name || roleLabel,
        estimatedHarm: String(analysis?.decision?.estimatedHarm || '').trim(),
      };
    };
    const unlock = () => openPaywall(pickPaywallHook(analysis) || 'negotiate', paywallCtx());
    const trapDates = ensureTrapCalendar(
      { ...analysis, contract_text: analysis.contract_text || analysis.contractText || contractText },
      t('trapNotSpecified'),
      analysisLang
    );

    return (
      <View style={styles.resultContainer}>
        {locked ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={unlock}
            style={[styles.previewBanner, { backgroundColor: theme.cardBg, borderColor: ACCENT }]}
          >
            <Ionicons name="lock-closed" size={14} color={ACCENT} />
            <Text style={[styles.previewBannerText, { color: theme.text }]}>{t('previewBanner')}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 6 }}>
          <ReportAiButton
            theme={theme}
            featureId="analysis_report"
            targetId={analysis.id || fullRaw?.id || ''}
            country={analysis.country || analysisCountry}
            context={analysis.contract_text || analysis.contractText || (keyPrefix === 'result' ? contractText : '')}
            showLabel
          />
        </View>

        <ContractMiniRadar theme={theme} radar={analysis?.contractRadar} />

        {(() => {
          const partyCode = analysis.partyRole || analysis.party_role || analysisParty;
          const role =
            (PARTY_ROLES || []).find((item) => item.code === partyCode) ||
            (PARTY_ROLES || []).find((item) => item.code === 'buyer') ||
            PARTY_ROLES[0];
          if (!role?.labelKey) return null;
          const roleLabel = t(role.labelKey);
          const name = String(partyDisplayName || '').trim();
          const flipCode = flipPartyCode(partyCode, categoryFromTypeKey(selectedTypeKey));
          const flipRole =
            (PARTY_ROLES || []).find((item) => item.code === flipCode) || null;
          const flipLabel = flipRole?.labelKey ? t(flipRole.labelKey) : '';
          const flipName =
            (partyChoiceCards || []).find((item) => item.code === flipCode)?.name || '';
          return (
            <View style={{ marginBottom: 10, gap: 8 }}>
              <View
                style={[
                  styles.previewBanner,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: ACCENT,
                    marginBottom: 0,
                  },
                ]}
              >
                <Ionicons name="shield-checkmark-outline" size={14} color={ACCENT} />
                <Text style={[styles.previewBannerText, { color: theme.text }]} numberOfLines={2}>
                  {t('partyShieldActive', { name: name || roleLabel, role: roleLabel })}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePartyFlip}
                style={[
                  styles.previewBanner,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.borderColor,
                    marginBottom: 0,
                  },
                ]}
              >
                <Ionicons name="swap-horizontal-outline" size={14} color={ACCENT} />
                <Text style={[styles.previewBannerText, { color: theme.text }]} numberOfLines={2}>
                  {t('partyFlipCta', {
                    name: flipName || flipLabel,
                    role: flipLabel,
                  })}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })()}

        <DecisionCard
          theme={theme}
          decision={analysis?.decision}
          score={analysis?.score}
          risk={analysis?.risk}
          extraReasons={counts.reasons || 0}
          onUnlock={unlock}
          powerTilt={analysis?.powerTilt}
          batnaLadder={analysis?.batnaLadder || []}
          signStatus={analysis?.signStatus}
          locked={locked}
          counterMessage={
            buildReadyToSendMessage(analysis, { tierById: offerTiers }) ||
            analysis?.counterMessage ||
            ''
          }
          onCopyCounterMessage={(message) =>
            copyCounterMessageFromDecision(message, fullRaw || analysis)
          }
          onShareBrief={() => openShareBrief(fullRaw || analysis)}
          onVerifyRevision={() => {
            if (lockPremium) {
              openPaywall(pickPaywallHook(analysis) || 'negotiate', paywallCtx());
              return;
            }
            const source =
              analysis?.contract_text ||
              analysis?.contractText ||
              (fullRaw || analysis)?.contract_text ||
              (fullRaw || analysis)?.contractText ||
              contractText ||
              '';
            if (fullRaw && fullRaw !== result) setResult(fullRaw);
            setDiffSeed({ nonce: Date.now(), mode: 'verify', revised: '', original: source });
            setActiveTab('analyze');
            setWorkspaceMode('diff');
            setModalVisible(false);
          }}
        />
        <ShieldDocumentCard
          theme={theme}
          analysis={fullRaw || analysis}
          sourceText={contractText}
          lockPremium={lockPremium}
          onNeedPaywall={() => openPaywall(pickPaywallHook(analysis) || 'negotiate', paywallCtx())}
          countryLabel={t(getJurisdiction(analysisCountry).labelKey)}
          partyLabel={t(
            (PARTY_ROLES.find((item) => item.code === (analysis.partyRole || analysisParty)) || PARTY_ROLES[0])
              .labelKey
          )}
          dateLabel={formatDate(Date.now())}
          offerTierById={offerTiers}
          preferredTier="balanced"
          onPersist={(patch) => patchSavedAnalysis(fullRaw || analysis, patch)}
          onOpenDiff={(text) => {
            const source = resolveSourceText(fullRaw || analysis, contractText);
            if (fullRaw && fullRaw !== result) setResult(fullRaw);
            setDiffSeed({ nonce: Date.now(), revised: text, original: source, mode: '' });
            setWorkspaceMode('diff');
            setActiveTab('analyze');
            setModalVisible(false);
          }}
          onShareBrief={() => openShareBrief(fullRaw || analysis)}
          placeSkipped={
            lockPremium
              ? undefined
              : ({ paragraph, from, to }) =>
                  reviseParagraphSlice({
                    paragraph,
                    from,
                    to,
                    lang: reportLang,
                    country: analysisCountry,
                  })
          }
        />
        {locked && counts.ladder > 0 ? (
          <LockedSection
            theme={theme}
            title={t('ladderTitle')}
            subtitle={t('hookLadderBody')}
            onUnlock={unlock}
          />
        ) : null}
        <CostWidget theme={theme} costs={analysis?.hiddenCosts} />
        <VoiceBriefButton theme={theme} analysis={analysis} lang={reportLang} />
        <RiskSummary theme={theme} clauses={analysis?.clauses || []} redFlags={analysis?.redFlags || []} />

        <LifecycleChips
          theme={theme}
          value={(fullRaw || analysis)?.lifecycle}
          onSelect={(code) => {
            handleLifecycleChange(fullRaw || analysis, code).catch(() => {});
          }}
        />

        <View style={[styles.scoreCard, { backgroundColor: theme.cardBg, borderColor: getRiskColor(analysis.risk) }]}>
          <Text style={[styles.scoreTitle, { color: theme.subText }]}>{t('securityScore')}</Text>
          <Text style={[styles.scoreValue, { color: getRiskColor(analysis.risk) }]}>
            {analysis.score} / 100
          </Text>

          {renderRiskGauge(analysis.score, analysis.risk)}

          <Text style={[styles.summaryText, { color: theme.text }]}>{safeDisplayText(analysis.summary)}</Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <TouchableOpacity
              style={[styles.exportBtn, { marginTop: 0, flexGrow: 1 }]}
              onPress={() => handleExportPdf(fullRaw || analysis, 'share')}
            >
              <Ionicons name={locked ? 'lock-closed' : 'share-outline'} size={18} color="#080C14" />
              <Text style={styles.exportBtnText} numberOfLines={1} adjustsFontSizeToFit>
                {keyPrefix === 'history' ? t('exportPdfShort') : t('downloadPdfReport')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.exportBtn,
                {
                  marginTop: 0,
                  flexGrow: 1,
                  backgroundColor: theme.inputBg,
                  borderWidth: 1,
                  borderColor: ACCENT,
                },
              ]}
              onPress={() => handleExportPdf(fullRaw || analysis, 'save')}
            >
              <Ionicons name={locked ? 'lock-closed' : 'download-outline'} size={18} color={ACCENT} />
              <Text style={[styles.exportBtnText, { color: ACCENT }]} numberOfLines={1} adjustsFontSizeToFit>
                {t('savePdfToDevice')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {locked ? <ConversionHook theme={theme} hook={pickPaywallHook(analysis)} onUnlock={unlock} /> : null}

        {analysis?.contractRadar ? null : renderJurisdiction(analysis)}
        {renderLawClash(analysis, locked, unlock)}
        {renderKeyTakeaways(analysis)}
        {renderRedFlags(analysis)}

        {locked && counts.redFlags > 0 ? (
          <LockedSection
            theme={theme}
            subtitle={t('lockedMoreFlags', { count: counts.redFlags })}
            onUnlock={unlock}
          />
        ) : null}

        {locked && counts.validity > 0 ? (
          <LockedSection
            theme={theme}
            title={t('validityTitle')}
            subtitle={t('lockedSubtitle')}
            onUnlock={unlock}
          />
        ) : (
          <ValidityLayer
            theme={theme}
            items={analysis?.validityAnalysis || []}
            extraCount={counts.validity || 0}
            onUnlock={unlock}
          />
        )}
        <LawyerQuestions
          theme={theme}
          questions={analysis?.lawyerQuestions || []}
          extraCount={locked ? counts.lawyerQuestions || 0 : 0}
          onUnlock={unlock}
        />

        {locked && counts.hasHiddenCosts ? (
          <LockedSection
            theme={theme}
            title={t('hiddenCostsTitle')}
            subtitle={t('lockedSubtitle')}
            onUnlock={unlock}
          />
        ) : (
          <HiddenCostsCard
            theme={theme}
            costs={analysis?.hiddenCosts}
            locked={false}
            onUnlock={unlock}
          />
        )}

        {locked ? (
          <LockedSection
            theme={theme}
            title={t('trapCalendarTitle')}
            subtitle={t('lockedPreviewNotUnread')}
            onUnlock={unlock}
          >
            <DeadlineRadar
              theme={theme}
              dates={FROST_TRAP_DATES}
              title={t('trapCalendarTitle')}
              emptyLabel={t('trapNotSpecified')}
            />
          </LockedSection>
        ) : (
          <DeadlineRadar
            theme={theme}
            dates={trapDates}
            title={t('trapCalendarTitle')}
            emptyLabel={t('trapNotSpecified')}
            onRemind={() => onRemind(fullRaw || analysis)}
          />
        )}

        <PlaybookCard
          theme={theme}
          category={analysis.contractCategory}
          country={analysisCountry !== 'auto' ? analysisCountry : undefined}
          analysis={analysis}
          locked={locked}
          lockedCounts={counts}
          onUnlock={unlock}
          signConditions={userSignConditions(analysis)}
          onToggleCondition={(item) => handleToggleSignCondition(fullRaw || analysis, analysis, item)}
          onAppendClause={(clause) => {
            const current = String((fullRaw || analysis).counterMessage || '').trim();
            copyCounterMessage(current ? `${current}\n\n${clause}` : clause);
          }}
        />

        {locked ? (
          <LockedSection
            theme={theme}
            title={t('counterMessageTitle')}
            subtitle={t('lockedSubtitle')}
            onUnlock={unlock}
          >
            <View style={[styles.counterMessageCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.summaryText, { color: theme.text, marginBottom: 0 }]}>
                •••••••••••••••••••••••••••••
              </Text>
            </View>
          </LockedSection>
        ) : (
          <>
            <CounterProposals
              theme={theme}
              items={analysis.counterProposals}
              country={analysisCountry}
            />
            {renderCounterMessage(analysis)}
          </>
        )}

        {locked ? (
          <LockedSection
            theme={theme}
            title={t('obligationsTitle')}
            onUnlock={unlock}
          />
        ) : (
          <ObligationsChecklist theme={theme} items={analysis?.obligations || []} />
        )}

        {locked && counts.hasIntegrity ? (
          <LockedSection theme={theme} title={t('integrityTitle')} onUnlock={unlock} />
        ) : integrityHasWarnings(analysis?.integrityChecks) ? (
          <IntegrityChecks theme={theme} checks={analysis?.integrityChecks} />
        ) : analysis?.integrity_checks ? (
          <IntegrityChecks theme={theme} checks={analysis?.integrityChecks} />
        ) : null}

        {locked ? (
          <LockedSection
            theme={theme}
            title={t('analyzedClauses')}
            subtitle={t('lockedPreviewNotUnread')}
            onUnlock={unlock}
          />
        ) : (
          <>
            <Text style={[styles.sectionHeader, { color: theme.text }]}>{t('analyzedClauses')}</Text>
            <ClauseNavigator
              theme={theme}
              clauses={analysis?.clauses || []}
              renderCard={(item, index) => renderClauseCard(item, index, keyPrefix)}
            />
          </>
        )}

        {locked ? (
          <LockedSection
            theme={theme}
            title={t('negotiationTitle')}
            onUnlock={unlock}
          />
        ) : (
          renderNegotiationTips(analysis)
        )}

        {locked ? null : renderGlossary(analysis)}
      </View>
    );
  };

  if (!appReady) {
    return <View style={{ flex: 1, backgroundColor: '#000000' }} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />
      
      {/* Üst Başlık — opaque sticky so scroll content cannot bleed under tabs */}
      <View style={[styles.topHeader, { backgroundColor: theme.bg, zIndex: 20, elevation: 20 }]}>
        <View style={styles.brandRow}>
          <Text style={[styles.title, { color: theme.text }]}>
            NEXULEX <Text style={{ color: '#00F5D4' }}>AI</Text>
          </Text>
          {user ? (
            <TouchableOpacity
              onPress={() => setGuideVisible(true)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel={t('guideTitle')}
              style={{ marginLeft: 'auto', padding: 4 }}
            >
              <Ionicons name="compass-outline" size={24} color={ACCENT} />
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={[styles.tagline, { color: theme.subText }]}>{t('tagline')}</Text>

        {user && (
          <View style={[styles.tabBar, { borderBottomColor: theme.borderColor, backgroundColor: theme.bg }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { key: 'analyze', label: t('tabAnalyze') },
                { key: 'advisor', label: t('tabAdvisor') },
                { key: 'history', label: t('tabHistory') },
                { key: 'settings', label: t('tabSettings') },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.tabItem, activeTab === tab.key && styles.activeTabBorder]}
                >
                  <Text
                    style={[styles.tabText, { color: activeTab === tab.key ? ACCENT : theme.subText }]}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {!user ? (
        <KeyboardScreen contentContainerStyle={{ padding: 20 }}>
          {forgotPasswordMode ? (
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
              <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 12 }]}>{t('forgotPasswordTitle')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor }]}
                placeholder={t('resetEmailPlaceholder')}
                placeholderTextColor={theme.subText}
                value={resetEmail}
                onChangeText={setResetEmail}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.primaryButton} onPress={handleResetPassword}>
                <Text style={styles.primaryButtonText}>{t('btnSendResetLink')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 15 }} onPress={() => setForgotPasswordMode(false)}>
                <Text style={{ color: '#00F5D4', textAlign: 'center' }}>{t('backToLogin')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Auth onLoginSuccess={(u) => setUser(u)} />
              <TouchableOpacity style={{ marginTop: 15 }} onPress={() => setForgotPasswordMode(true)}>
                <Text style={{ color: theme.subText, textAlign: 'center', fontSize: 13 }}>{t('forgotPasswordTitle')}?</Text>
              </TouchableOpacity>
              {renderShareCodeEntry()}
            </>
          )}
        </KeyboardScreen>
      ) : (
        <View style={{ flex: 1 }}>
          {/* TAB 1: ANALİZ EKRANI */}
          {activeTab === 'analyze' && (
            <KeyboardScreen
              scrollRef={analyzeScrollRef}
              containerRef={analyzeContentRef}
              contentContainerStyle={styles.scrollContent}
              contentFlexGrow={activeResult ? 0 : 1}
              onScroll={(event) => {
                scrollOffsetRef.current = Number(event?.nativeEvent?.contentOffset?.y) || 0;
              }}
              onContentSizeChange={(_width, height) => {
                if (!pendingSignedScrollRef.current) return;
                const next = Number(height) || 0;
                const prev = signedContentHeightRef.current;
                signedContentHeightRef.current = next;
                const equal = prev > 0 && prev === next;
                if (signedScrollTimerRef.current) {
                  clearTimeout(signedScrollTimerRef.current);
                  signedScrollTimerRef.current = null;
                }
                const fire = () => {
                  signedScrollTimerRef.current = null;
                  if (!pendingSignedScrollRef.current) return;
                  scrollToSignedReport();
                };
                if (equal) {
                  fire();
                  return;
                }
                signedScrollTimerRef.current = setTimeout(fire, 300);
              }}
            >
              {/* Kalan Ücretsiz Hak / Pro Rozeti */}
              {quotaEnforced && (
                <TouchableOpacity
                  activeOpacity={isPro ? 1 : 0.8}
                  onPress={() => !isPro && openPaywall(freeLeft <= 0 ? 'quota' : null)}
                  style={[
                    styles.quotaBadge,
                    {
                      backgroundColor: theme.cardBg,
                      borderColor: freeLeft > 0 || isPro ? ACCENT : '#FF3B5C',
                    },
                  ]}
                >
                  <Ionicons
                    name={isPro ? 'shield-checkmark' : freeLeft > 0 ? 'flash-outline' : 'lock-closed-outline'}
                    size={13}
                    color={freeLeft > 0 || isPro ? ACCENT : '#FF3B5C'}
                  />
                  <Text
                    style={[styles.quotaText, { color: freeLeft > 0 || isPro ? ACCENT : '#FF3B5C' }]}
                    numberOfLines={1}
                  >
                    {isPro
                      ? plan === 'professional' ? t('planTabProfessional') : t('paywallTitle')
                      : freeLeft > 0
                        ? t('freeAnalysesLeft', { count: freeLeft })
                        : `${t('noFreeAnalysesLeft')} · ${t('seePlans')}`}
                  </Text>
                </TouchableOpacity>
              )}

              {/* E-Posta Doğrulama Uyarısı */}
              {!emailVerified && (
                <View
                  style={[
                    styles.card,
                    { backgroundColor: theme.cardBg, borderColor: '#FFB800', marginBottom: 14 },
                  ]}
                >
                  <View style={styles.takeawayHeader}>
                    <Ionicons name="mail-unread-outline" size={16} color="#FFB800" />
                    <Text style={[styles.takeawayTitle, { color: theme.text }]} numberOfLines={1}>
                      {t('verifyEmailTitle')}
                    </Text>
                  </View>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>
                    {t('verifyEmailMessage')}
                  </Text>
                  <TouchableOpacity
                    style={[styles.secondaryBtn, resendingVerification && styles.buttonDisabled]}
                    onPress={handleResendVerification}
                    disabled={resendingVerification}
                  >
                    {resendingVerification ? (
                      <ActivityIndicator color={ACCENT} />
                    ) : (
                      <Text style={styles.secondaryBtnText} numberOfLines={1} adjustsFontSizeToFit>
                        {t('resendVerification')}
                      </Text>
                    )}
                  </TouchableOpacity>
                  {__DEV__ && (
                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => setDevEmailBypass(true)}>
                      <Text style={styles.secondaryBtnText} numberOfLines={2} adjustsFontSizeToFit>
                        {t('skipVerificationDev')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Ülke Mevzuatı ve Rapor Dili Seçicileri */}
              <SelectorField
                theme={theme}
                icon="globe-outline"
                label={t('analysisCountryLabel')}
                value={selectedCountryOption.label}
                hint={selectedCountryOption.hint}
                onPress={() => setCountrySheetVisible(true)}
                disabled={loading}
              />

              <SelectorField
                theme={theme}
                icon="language-outline"
                label={t('reportLanguageLabel')}
                value={selectedReportLangOption.label}
                hint={selectedReportLangOption.hint}
                onPress={() => setReportLangSheetVisible(true)}
                disabled={loading}
              />

              <View
                onLayout={(event) => {
                  partySectionYRef.current = event?.nativeEvent?.layout?.y || 0;
                }}
              >
                <Text style={[styles.label, { color: theme.subText }]}>{t('partyProtectTitle')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>
                  {t('partyProtectHint')}
                </Text>
                <View style={styles.partyChoiceRow}>
                  {(partyChoiceCards || []).map((card) => {
                    const selected = partyConfirmed && analysisParty === card.code;
                    const primary = t(card.sideLabelKey || 'partyBuyerSide');
                    const secondary = card.name
                      ? `${card.name} · ${t(card.labelKey)}`
                      : t(card.sideHintKey || card.hintKey || card.labelKey);
                    return (
                      <TouchableOpacity
                        key={card.code}
                        activeOpacity={0.88}
                        disabled={loading}
                        onPress={() => handlePartyChange(card.code, card.name || '')}
                        style={[
                          styles.partyChoiceCard,
                          {
                            backgroundColor: theme.cardBg,
                            borderColor: selected ? ACCENT : theme.borderColor,
                          },
                          selected && styles.partyChoiceCardActive,
                        ]}
                      >
                        <Ionicons
                          name={card.icon || 'shield-checkmark-outline'}
                          size={22}
                          color={selected ? ACCENT : theme.subText}
                          style={styles.partyChoiceIcon}
                        />
                        <Text
                          style={[
                            styles.partyChoiceTitle,
                            { color: selected ? ACCENT : theme.text },
                          ]}
                          numberOfLines={3}
                        >
                          {primary}
                        </Text>
                        <Text
                          style={[styles.partyChoiceSubtitle, { color: theme.subText }]}
                          numberOfLines={2}
                        >
                          {secondary}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {!partyConfirmed ? (
                  <Text style={[styles.partyChoiceMeta, { color: theme.subText }]}>
                    {t('partyNotSelected')}
                  </Text>
                ) : null}
              </View>

              <SelectorField
                theme={theme}
                icon="shield-outline"
                label={t('partyOtherRoles')}
                value={selectedPartyLabel}
                hint={selectedPartyHint}
                onPress={() => setPartySheetVisible(true)}
                disabled={loading}
              />

              <Text style={[styles.label, { color: theme.subText }]}>{t('contractLibrary')}</Text>
              <View
                style={[
                  styles.typeChipRow,
                  { backgroundColor: theme.bg, zIndex: 5 },
                ]}
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.typeChipContent}
                >
                  {(CONTRACT_TYPES || []).map((type) => {
                    const active = selectedTypeKey === type.key;
                    return (
                      <TouchableOpacity
                        key={type.key}
                        onPress={() => handleTypeChange(type.key)}
                        style={[styles.typeChip, active && styles.typeChipActive]}
                      >
                        <Text
                          style={[styles.typeChipText, active && styles.typeChipTextActive]}
                          numberOfLines={1}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
              {detectedTypeHint ? (
                <Text style={[styles.sectionHint, { color: theme.subText }]}>
                  {t('detectedTypeHint', { type: t(detectedTypeHint) })}
                </Text>
              ) : null}

              <View style={styles.modeToggleRow}>
                {[
                  { mode: 'analyze', label: t('workspaceAnalyze') },
                  { mode: 'diff', label: t('workspaceCompare') },
                  { mode: 'generate', label: t('workspaceGenerate') },
                ].map((item) => {
                  const active = workspaceMode === item.mode;
                  return (
                    <TouchableOpacity
                      key={item.mode}
                      onPress={() => setWorkspaceMode(item.mode)}
                      style={[
                        styles.modeToggle,
                        {
                          backgroundColor: active ? 'rgba(0, 245, 212, 0.12)' : theme.inputBg,
                          borderColor: active ? ACCENT : theme.borderColor,
                        },
                      ]}
                    >
                      <Text style={[styles.modeToggleText, { color: active ? ACCENT : theme.subText }]} numberOfLines={1}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {workspaceMode === 'generate' ? (
                <LegalContractGenerator
                  theme={theme}
                  country={analysisCountry}
                  party={analysisParty}
                  categoryKey={selectedTypeKey}
                  lang={reportLang}
                  isPro={isPro}
                  quotaEnforced={quotaEnforced}
                  freeLeft={freeLeft}
                  onNeedPaywall={(hook) => openPaywall(hook || 'quota')}
                  onProfileLeft={(left) =>
                    setProfile((prev) => (prev ? { ...prev, free_analyses_left: left } : prev))
                  }
                />
              ) : null}

              {workspaceMode === 'diff' ? (
                <DiffTool
                  theme={theme}
                  lang={reportLang}
                  country={analysisCountry}
                  party={resolvePartyForAnalyze(analysisParty, categoryFromTypeKey(selectedTypeKey))}
                  category={categoryFromTypeKey(selectedTypeKey)}
                  disabled={loading}
                  sourceText={
                    diffSeed.original ||
                    result?.contract_text ||
                    result?.contractText ||
                    contractText ||
                    ''
                  }
                  seedRevised={
                    diffSeed.mode === 'verify'
                      ? (diffSeed.revised || '')
                      : (diffSeed.revised || result?.revised_contract_text || result?.revisedContractText || '')
                  }
                  seedNonce={diffSeed.nonce}
                  seedMode={diffSeed.mode || ''}
                  analysis={result}
                  lockPremium={lockPremium}
                  onUnlock={() => openPaywall(pickPaywallHook(result) || 'negotiate')}
                  onSignStatus={(status) => {
                    if (!status) return;
                    patchSavedAnalysis(result, {
                      signStatus: status,
                      sign_status: status,
                    });
                  }}
                />
              ) : null}

              {workspaceMode === 'analyze' ? (
              <View>
              {!result ? (
                <View style={{ marginBottom: 12 }}>
                  {isUsableDraft(resumeDraft) && !resumeBannerHidden ? (
                    <View
                      style={{
                        marginBottom: 12,
                        padding: 12,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: theme.borderColor,
                        backgroundColor: theme.cardBg,
                      }}
                    >
                      <Text style={[styles.settingLabel, { color: theme.text, fontSize: 15 }]}>{t('rsHomeDraft')}</Text>
                      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('rsHomeDraftHint')}</Text>
                      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 10 }]}>{t('ux18Device')}</Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => runResume({ kind: 'draft', icon: 'document-text-outline' })}
                          accessibilityRole="button"
                          style={[styles.secondaryBtn, { flex: 1, marginTop: 0 }]}
                        >
                          <Text style={styles.secondaryBtnText}>{t('rsHomeContinue')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setResumeBannerHidden(true)}
                          accessibilityRole="button"
                          style={[styles.secondaryBtn, { flex: 1, marginTop: 0 }]}
                        >
                          <Text style={styles.secondaryBtnText}>{t('rsHomeDismiss')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : null}
                  <Text style={[styles.label, { color: theme.subText, marginBottom: 8 }]}>{t('fiHomeTitle')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
                    {FIRST_INTENTS.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => runFirstIntent(item.id)}
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
                        }}
                      >
                        <Ionicons name={item.icon} size={14} color={ACCENT} />
                        <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>{t(item.titleKey)}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6, marginBottom: 0 }]}>{t('fiHomeHint')}</Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6, marginBottom: 0 }]}>
                    {t('ux5Country', { country: selectedCountryOption.label })}
                  </Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux5Lang')}</Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux5Scan')}</Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux5Free')}</Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux5Guides')}</Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux5Lawyer')}</Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux5NoWin')}</Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux5Disclaimer')}</Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux15Once')}</Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux17Get')}</Text>
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <ContractAnalyzer
                  disabled={loading}
                  imageCount={selectedImages.length}
                  onImagesReady={(images) => {
                    setContractText('');
                    setSelectedFile(null);
                    setSelectedImages((prev) => {
                      const room = Math.max(0, 8 - prev.length);
                      if (images.length > room) {
                        showToast(t('errImagesTooLarge'), { type: 'warning' });
                      }
                      return [...prev, ...images].slice(0, 8);
                    });
                    if (images.length) showToast(t('sourceImagesActive'), { type: 'info' });
                  }}
                />

                <TouchableOpacity 
                  style={[styles.uploadButton, { flex: 1, backgroundColor: '#1A233A', borderWidth: 1, borderColor: 'rgba(0, 180, 216, 0.4)' }]} 
                  onPress={handlePickDocument}
                  disabled={loading}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="document-text-outline" size={16} color="#00B4D8" />
                    <Text
                      style={[styles.uploadButtonText, { color: '#00B4D8', flexShrink: 1 }]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      {selectedFile ? t('pdfSelected') : t('pickPdfDocument')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Görsel Listesi ve Silme İkonları */}
              {selectedImages.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                  {(selectedImages || []).map((img, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri: img.uri }} style={styles.previewImage} />
                      <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={22} color="#FF3B5C" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Seçili Dosya Gösterim Rozeti */}
              {selectedFile && (
                <View style={styles.fileBadge}>
                  <Text style={{ color: '#00B4D8', fontSize: 12, flex: 1 }} numberOfLines={1}>
                    📄 {selectedFile.name}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedFile(null)}>
                    <Ionicons name="close-circle" size={18} color="#FF3B5C" />
                  </TouchableOpacity>
                </View>
              )}

              {!loading && !activeResult && localRadarPreview ? (
                <ContractMiniRadar theme={theme} radar={localRadarPreview} preview />
              ) : null}

              <Text style={[styles.label, { color: theme.subText }]}>{t('pasteLabel')}</Text>
              <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>
                {t('pasteAnalyzeHint')}
              </Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[styles.textArea, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor, paddingRight: 56 }]}
                  multiline
                  numberOfLines={6}
                  placeholder={t('placeholderText')}
                  placeholderTextColor={theme.subText}
                  value={contractText}
                  onChangeText={handleContractTextChange}
                />
                <View style={{ position: 'absolute', right: 8, bottom: 22, zIndex: 2 }}>
                  <VoiceMicButton
                    lang={analysisLang}
                    disabled={loading}
                    value={contractText}
                    onChangeText={handleContractTextChange}
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                style={[styles.primaryButton, loading && styles.buttonDisabled]} 
                onPress={handleAnalyzeText}
                disabled={loading}
              >
                {loading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator color="#080C14" />
                    <Text
                      style={[styles.primaryButtonText, { flexShrink: 1 }]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                    >
                      {t(PROGRESS_LABELS[progressStep] || 'analyzing')}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                    {t('btnStartAnalyze')}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Dinamik Analiz İlerleme Kartı */}
              {loading && <AnalysisProgress theme={theme} step={progressStep} />}

              {!loading && signedShieldCount > 0 ? (
                <TouchableOpacity onPress={() => openSignedStrip().catch(() => {})} activeOpacity={0.85}>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 4 }]}>
                    {t('shieldStrip', {
                      count: signedShieldCount,
                      next: (() => {
                        const next = sortDeadlines(upcomingDeadlines)[0];
                        if (next?.date) return formatDate(next.date);
                        return next?.note || '—';
                      })(),
                    })}
                  </Text>
                  <Text style={[styles.sectionHint, { color: ACCENT, marginBottom: 8 }]}>
                    {t('shieldResumeHint')}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {!loading && upcomingDeadlines.length > 0 && !activeResult ? (
                <DeadlineRadar
                  theme={theme}
                  compact
                  dates={sortDeadlines(upcomingDeadlines).slice(0, 3)}
                  title={t('upcomingDeadlinesTitle')}
                />
              ) : null}

              {!loading && renderShareCodeEntry()}

              {activeResult ? (
                <>
                {(!String(contractText || '').trim() && !selectedFile) ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 10,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.borderColor,
                      backgroundColor: theme.cardBg,
                    }}
                  >
                    <Text style={[styles.settingLabel, { color: theme.text, flex: 1 }]} numberOfLines={2}>
                      {t('lastAnalysisTitle')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setResult(null);
                        rememberLastAnalysisId('').catch(() => {});
                      }}
                      activeOpacity={0.85}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: theme.borderColor,
                        backgroundColor: theme.inputBg,
                      }}
                    >
                      <Text style={[styles.secondaryBtnText, { color: theme.text }]} numberOfLines={1}>
                        {t('clearLastAnalysis')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                <View
                  ref={reportAnchorRef}
                  collapsable={false}
                  pointerEvents="none"
                  onLayout={(event) => {
                    reportYRef.current = Number(event?.nativeEvent?.layout?.y) || 0;
                  }}
                  style={{ height: 1 }}
                />
                {renderAnalysisReport(activeResult, 'result', result)}
                </>
              ) : null}
              </View>
              ) : null}
            </KeyboardScreen>
          )}

          {/* TAB 2: HUKUK DANIŞMANI — sekme değişince unmount olmasın */}
          <View
            style={{
              flex: activeTab === 'advisor' ? 1 : 0,
              display: activeTab === 'advisor' ? 'flex' : 'none',
            }}
            pointerEvents={activeTab === 'advisor' ? 'auto' : 'none'}
          >
            <LegalAdvisorScreen
              theme={theme}
              country={advisorCountry}
              onCountryChange={setAdvisorCountry}
              analysisContext={buildAdvisorAnalysisContext(activeResult, (id) => {
                const item = playbookItemById(id);
                return item ? t(item.titleKey) : id;
              })}
              isPro={!lockPremium}
              plan={plan}
              // Advisor sheets close before asking; iOS presents one modal at a time.
              onNeedPaywall={(hook) => setTimeout(() => openPaywall(hook || null, null), 400)}
              paywallVisible={paywallVisible}
              isActive={activeTab === 'advisor'}
              guideAction={guideAdvisorAction}
            />
          </View>

          {/* TAB 3: GEÇMİŞ */}
          {activeTab === 'history' && (
            <View style={{ flex: 1 }}>
              <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>{renderShareCodeEntry()}</View>
              <HistoryScreen
                theme={theme}
                history={history}
                loading={loadingHistory}
                getRiskLabel={getRiskLabel}
                formatDate={formatDate}
                onOpenChat={() => setActiveTab('advisor')}
                onOpenItem={(item) => {
                  setSelectedHistoryItem(item);
                  setModalVisible(true);
                }}
                onShareItem={(item) => openShareBrief(item)}
                onLifecyclePress={(item) => {
                  pickLifecycle(item).catch(() => {});
                }}
                onDeleted={(id) => {
                  setHistory((prev) => prev.filter((row) => row.id !== id));
                  setResult((prev) => (prev?.id === id ? null : prev));
                  setSelectedHistoryItem((prev) => (prev?.id === id ? null : prev));
                  AsyncStorage.getItem(LAST_ANALYSIS_KEY)
                    .then((stored) => {
                      if (stored === id) return AsyncStorage.removeItem(LAST_ANALYSIS_KEY);
                      return null;
                    })
                    .catch(() => {});
                }}
              />
            </View>
          )}

          {/* TAB 4: AYARLAR & DİL SEÇİMİ */}
          {activeTab === 'settings' && (
            <KeyboardScreen contentContainerStyle={{ padding: 20 }} scrollRef={settingsScrollRef}>
              <View
                onLayout={onSettingsSectionLayout('account')}
                style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginBottom: 16 }]}
              >
                <Text style={[styles.settingLabel, { color: theme.text }]}>{t('userInfo')}</Text>
                <Text style={{ color: theme.subText, marginTop: 6, fontSize: 14 }}>{t('userEmail')}: {user.email}</Text>

                {quotaEnforced && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}>
                    <Ionicons
                      name={emailVerified ? 'checkmark-circle' : 'alert-circle-outline'}
                      size={15}
                      color={emailVerified ? ACCENT : '#FFB800'}
                    />
                    <Text style={{ color: theme.subText, fontSize: 13, flex: 1 }}>
                      {isPro
                        ? plan === 'professional' ? t('planTabProfessional') : t('planTabPro')
                        : freeLeft > 0
                          ? t('freeAnalysesLeft', { count: freeLeft })
                          : t('noFreeAnalysesLeft')}
                    </Text>
                  </View>
                )}
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 10, marginBottom: 0 }]}>{t('st8Plan')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('st8Store')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('st8Quota')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>
                  {t('st8Ask', {
                    freeAsk: String(PLAN_LIMITS.free.askDaily),
                    proAsk: String(PLAN_LIMITS.pro.askDaily),
                    professionalAsk: String(PLAN_LIMITS.professional.askDaily),
                  })}
                </Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('st8Tools')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('st8First')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('st8Restore')}</Text>

                {!emailVerified && (
                  <>
                    <TouchableOpacity
                      style={[styles.secondaryBtn, resendingVerification && styles.buttonDisabled]}
                      onPress={handleResendVerification}
                      disabled={resendingVerification}
                    >
                      {resendingVerification ? (
                        <ActivityIndicator color={ACCENT} />
                      ) : (
                        <Text style={styles.secondaryBtnText} numberOfLines={1} adjustsFontSizeToFit>
                          {t('resendVerification')}
                        </Text>
                      )}
                    </TouchableOpacity>
                    {__DEV__ && (
                      <TouchableOpacity style={styles.secondaryBtn} onPress={() => setDevEmailBypass(true)}>
                        <Text style={styles.secondaryBtnText} numberOfLines={2} adjustsFontSizeToFit>
                          {t('skipVerificationDev')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}

                {!isPro && (
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => openPaywall(null)}>
                    <Text style={styles.secondaryBtnText} numberOfLines={1} adjustsFontSizeToFit>
                      {t('seePlans')}
                    </Text>
                  </TouchableOpacity>
                )}
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 10, marginBottom: 0 }]}>{t('st8Disclaimer')}</Text>
              </View>

              <View onLayout={onSettingsSectionLayout('seats')}>
                <AdvisorSeatCard
                  theme={theme}
                  isPro={isPro}
                  plan={plan}
                  onNeedPaywall={(hook) => openPaywall(hook === 'professional' ? 'professional' : 'share')}
                  onOpenBrief={(snapshot) => setAdvisorSnapshot(snapshot)}
                />
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 8 }]}>{t('st4Seats')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('st4SeatsHint')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('st4Plan')}</Text>
              </View>

              {/* Destek ve Hata Bildirimi */}
              <TouchableOpacity
                activeOpacity={0.8}
                onLayout={onSettingsSectionLayout('support')}
                onPress={() => setSupportVisible(true)}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.borderColor,
                    marginBottom: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  },
                ]}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={ACCENT} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: theme.text }]} numberOfLines={1}>
                    {t('supportTitle')}
                  </Text>
                  <Text
                    style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 2 }]}
                    numberOfLines={2}
                  >
                    {t('st4SupportHint')}
                  </Text>
                  <Text
                    style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 4 }]}
                    numberOfLines={3}
                  >
                    {t('st4Support')}
                  </Text>
                </View>
                <Ionicons name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.subText} />
              </TouchableOpacity>

              <View
                onLayout={onSettingsSectionLayout('security')}
                style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginBottom: 16 }]}
              >
                <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 10 }]}>{t('securitySettings')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('st4Security')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('st4SecurityHint')}</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBg,
                      color: theme.text,
                      borderColor: theme.borderColor,
                    },
                  ]}
                  placeholder={t('newPasswordPlaceholder')}
                  placeholderTextColor={theme.subText}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                {newPassword.length > 0 && !passwordLongEnough ? (
                  <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>
                    {t('minPasswordLength')}
                  </Text>
                ) : null}
                <TouchableOpacity
                  style={[styles.secondaryBtn, (updatingPassword || !passwordLongEnough) && styles.buttonDisabled]}
                  onPress={handleUpdatePassword}
                  disabled={updatingPassword || !passwordLongEnough}
                  accessibilityState={{ disabled: updatingPassword || !passwordLongEnough }}
                >
                  {updatingPassword ? (
                    <ActivityIndicator color="#00F5D4" />
                  ) : (
                    <Text style={styles.secondaryBtnText}>{t('btnUpdatePassword')}</Text>
                  )}
                </TouchableOpacity>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 10, marginBottom: 0 }]}>
                  {t('st4Disclaimer')}
                </Text>
              </View>

              <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginBottom: 16 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>{t('darkMode')}</Text>
                  <Switch 
                    value={isDarkMode} 
                    onValueChange={(val) => setIsDarkMode(val)}
                    thumbColor={isDarkMode ? "#00F5D4" : "#f4f3f4"}
                  />
                </View>
              </View>

              {/* Dil Seçim Alanı */}
              <View
                onLayout={onSettingsSectionLayout('language')}
                style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginBottom: 20 }]}
              >
                <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 8 }]}>{t('appLanguage')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('st6Lang')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('st6LangHint')}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {(APP_LANGUAGES || []).map((lang) => (
                    <TouchableOpacity 
                      key={lang.code} 
                      onPress={() => changeLanguage(lang.code)}
                      style={[styles.langBtn, currentLang === lang.code && styles.activeLangBtn]}
                    >
                      <Text
                        style={[styles.langText, currentLang === lang.code && styles.activeLangText]}
                        numberOfLines={1}
                      >
                        {lang.flag}  {lang.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 12, marginBottom: 8 }]}>{t('st6Rtl')}</Text>
                <Text style={[styles.settingLabel, { color: theme.text, marginTop: 8, marginBottom: 4 }]}>
                  {t('analysisCountryLabel')}
                </Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('st6Country')}</Text>
                <TouchableOpacity
                  onPress={() => setCountrySheetVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel={t('analysisCountryLabel')}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}
                >
                  <Text style={[styles.sectionHint, { color: theme.text, flex: 1, marginBottom: 0 }]}>
                    {selectedCountryOption.label} · {t('localeCountryHint')}
                  </Text>
                  <Ionicons name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.subText} />
                </TouchableOpacity>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 8 }]}>{t('st6CountryHint')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('st6Generic')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('st6Corridor')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 10, marginBottom: 0 }]}>
                  {t('st6Disclaimer')}
                </Text>
              </View>

              <View
                onLayout={onSettingsSectionLayout('privacy')}
                style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginBottom: 16 }]}
              >
                <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 10 }]}>{t('privacyPolicy')}</Text>
                <Text style={[styles.settingLabel, { color: theme.text, fontSize: 15, marginBottom: 6 }]}>{t('st2Title')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('st2Hint')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('st2Keep')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('st2Picker')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('st2Sub')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('st2Quota')}</Text>
                <TouchableOpacity
                  style={[styles.secondaryBtn, { marginTop: 0 }]}
                  onPress={() => Linking.openURL(TRUST_URLS.privacy || 'https://nexulexai.netlify.app/privacy.html').catch(() => showToast(t('askLinkFailed'), { type: 'error' }))}
                  activeOpacity={0.85}
                >
                  <Text style={styles.secondaryBtnText}>{t('privacyPolicy')}</Text>
                </TouchableOpacity>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6, marginBottom: 8 }]}>{t('st7Privacy')}</Text>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => Linking.openURL(TRUST_URLS.terms || 'https://nexulexai.netlify.app/terms.html').catch(() => showToast(t('askLinkFailed'), { type: 'error' }))}
                  activeOpacity={0.85}
                >
                  <Text style={styles.secondaryBtnText}>{t('termsOfUse')}</Text>
                </TouchableOpacity>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6, marginBottom: 8 }]}>{t('st7Terms')}</Text>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => Linking.openURL(TRUST_URLS.deleteAccount || 'https://nexulexai.netlify.app/delete-account.html').catch(() => showToast(t('askLinkFailed'), { type: 'error' }))}
                  activeOpacity={0.85}
                >
                  <Text style={styles.secondaryBtnText}>{t('st2WebDelete')}</Text>
                </TouchableOpacity>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('st7Delete')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('st7Lang')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('st7Binding')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('st7Store')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('st7Offline')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('st7Note')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 10 }]}>
                  {t('disclaimerShort')}
                </Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 8, marginBottom: 0 }]}>
                  {t('st2Disclaimer')}
                </Text>
              </View>

              <TouchableOpacity 
                onPress={() => supabase.auth.signOut()}
                style={styles.logoutBtnLarge}
              >
                <Text style={styles.logoutTextLarge}>{t('logout')}</Text>
              </TouchableOpacity>

              {/* Hesap silme — App Store 5.1.1(v) / Google Play */}
              <View
                onLayout={onSettingsSectionLayout('delete')}
                style={[
                  styles.card,
                  { backgroundColor: theme.cardBg, borderColor: DANGER, marginTop: 16, marginBottom: 24 },
                ]}
              >
                <Text style={[styles.settingLabel, { color: DANGER }]}>{t('accountDeleteTitle')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>
                  {t('accountDeleteHint')}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.secondaryBtn,
                    { borderColor: DANGER, marginTop: 4 },
                    deletingAccount && styles.buttonDisabled,
                  ]}
                  onPress={handleDeleteAccount}
                  disabled={deletingAccount}
                  accessibilityRole="button"
                  accessibilityLabel={t('accountDeleteTitle')}
                >
                  {deletingAccount ? (
                    <ActivityIndicator color={DANGER} />
                  ) : (
                    <Text style={[styles.secondaryBtnText, { color: DANGER }]}>{t('accountDeleteTitle')}</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryBtn, { marginTop: 8 }]}
                  onPress={async () => {
                    const opened = await openSubscriptionManagement();
                    if (!opened) showToast(t('accountManageSubscriptionFailed'), { type: 'warning' });
                  }}
                >
                  <Text style={styles.secondaryBtnText}>{t('accountManageSubscription')}</Text>
                </TouchableOpacity>
              </View>
            </KeyboardScreen>
          )}
        </View>
      )}

      {/* GEÇMİŞ DETAY MODALI */}
      <Modal visible={modalVisible} animationType="slide" transparent={false} onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold' }}>{t('analysisDetail')}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close-circle-outline" size={30} color={theme.text} />
            </TouchableOpacity>
          </View>
          {activeHistoryItem && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderAnalysisReport(activeHistoryItem, 'history', selectedHistoryItem)}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* ÜLKE MEVZUATI SEÇİCİ */}
      <OptionSheet
        visible={countrySheetVisible}
        theme={theme}
        title={t('selectCountryTitle')}
        options={countryOptions}
        selectedCode={analysisCountry}
        onSelect={handleCountryChange}
        onClose={() => setCountrySheetVisible(false)}
        closeLabel={t('closeButton')}
      />

      <OptionSheet
        visible={welcomeLangSheet}
        theme={theme}
        title={t('languageSelectorTitle')}
        options={(APP_LANGUAGES || []).map((item) => ({
          code: item.code,
          label: `${item.flag} ${item.label}`,
          hint: item.english,
        }))}
        selectedCode={currentLang}
        onSelect={(code) => {
          changeLanguage(code);
          setWelcomeLangSheet(false);
        }}
        onClose={() => setWelcomeLangSheet(false)}
        closeLabel={t('closeButton')}
      />

      {/* RAPOR DİLİ SEÇİCİ */}
      <OptionSheet
        visible={reportLangSheetVisible}
        theme={theme}
        title={t('selectReportLanguageTitle')}
        options={reportLanguageOptions}
        selectedCode={reportLanguage}
        onSelect={setReportLanguage}
        onClose={() => setReportLangSheetVisible(false)}
        closeLabel={t('closeButton')}
      />

      {/* TARAF ROLÜ SEÇİCİ */}
      <OptionSheet
        visible={partySheetVisible}
        theme={theme}
        title={t('partyProtectTitle')}
        options={partyOptions}
        selectedCode={analysisParty}
        onSelect={handlePartyChange}
        onClose={() => setPartySheetVisible(false)}
        closeLabel={t('closeButton')}
      />

      {/* DESTEK VE HATA BİLDİRİMİ */}
      <Modal visible={supportVisible} animationType="slide" onRequestClose={() => setSupportVisible(false)}>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
          <SupportScreen theme={theme} onClose={() => setSupportVisible(false)} />
        </SafeAreaView>
      </Modal>

      {/* ABONELİK / PAYWALL */}
      <PaywallScreen
        visible={paywallVisible}
        theme={theme}
        userId={user?.id}
        hook={paywallHook}
        context={paywallContext}
        exhausted={quotaEnforced && !isPro && freeLeft <= 0}
        plan={plan}
        onClose={() => {
          setPaywallVisible(false);
          paywallHookRef.current = null;
          setPaywallHook(null);
          setPaywallContext(null);
        }}
        onPurchased={async () => {
          const capturedHook = paywallHookRef.current;
          if (capturedHook === 'draft' || capturedHook === 'explain' || capturedHook === 'cases' || capturedHook === 'ask' || capturedHook === 'professional' || capturedHook === 'lawyer' || capturedHook === 'share') {
            // Advisor / share sheets reopen themselves; stay on the tab the user was already on.
            await refreshProfile();
            return;
          }
          await refreshProfile();
          setActiveTab('analyze');
          const y = Math.max(0, Number(reportYRef.current) || 0);
          if (analyzeScrollRef.current && y > 0) {
            InteractionManager.runAfterInteractions(() => {
              analyzeScrollRef.current?.scrollTo?.({ y: Math.max(0, y - 12), animated: true });
            });
          }
        }}
      />

      <ShareBriefSheet
        visible={!!shareSheetAnalysis}
        theme={theme}
        analysis={shareSheetAnalysis}
        locale={reportLang || i18n.language}
        isPro={isPro}
        onClose={() => setShareSheetAnalysis(null)}
        onNeedPaywall={(hook) => {
          pendingShareReturnRef.current = shareSheetAnalysis;
          setShareSheetAnalysis(null);
          setTimeout(() => openPaywall(hook || 'share'), 400);
        }}
        onOpenCode={(code) => setPendingShareCode(code)}
        onEnsureSaved={async () => {
          const current = shareSheetAnalysis;
          if (!current) return null;
          if (current.id) return current.id;
          const id = await saveAnalysisToSupabase(current);
          if (!id) return null;
          setShareSheetAnalysis((prev) => (prev ? { ...prev, id } : prev));
          setResult((prev) => (prev ? { ...prev, id } : prev));
          rememberLastAnalysisId(id);
          return id;
        }}
      />

      <FirstIntentSheet
        visible={intentOpen}
        theme={theme}
        onPick={(id) => runFirstIntent(id, { fromSheet: true })}
        onSkip={skipFirstIntent}
        onClose={skipFirstIntent}
      />

      <ResumeSessionSheet
        visible={resumeOpen}
        theme={theme}
        items={resumeItems}
        onPick={(item) => runResume(item, { fromSheet: true })}
        onSkip={skipResume}
        onClose={skipResume}
      />

      <ShareLoopSheet
        visible={shareLoopOpen}
        theme={theme}
        country={analysisCountry}
        onDone={closeShareLoop}
        onClose={closeShareLoop}
      />

      <ScanSuccessSheet
        visible={scanSuccessOpen}
        theme={theme}
        countryLabel={t(getJurisdiction(analysisCountry).labelKey)}
        onPick={runScanSuccess}
        onSkip={skipScanSuccess}
        onClose={skipScanSuccess}
      />

      <NexuLexGuideSheet
        visible={guideVisible}
        theme={theme}
        country={advisorCountry}
        onClose={() => setGuideVisible(false)}
        onOpenAdvisor={() => {
          setGuideVisible(false);
          setActiveTab('advisor');
        }}
        onAction={handleGuideAction}
      />

      <Modal visible={Boolean(pendingShareCode)} animationType="slide" onRequestClose={() => setPendingShareCode('')}>
        <ShareBriefScreen
          theme={theme}
          code={pendingShareCode}
          onClose={() => setPendingShareCode('')}
          onScanOwn={() => {
            setPendingShareCode('');
            setActiveTab('analyze');
          }}
        />
      </Modal>

      <Modal visible={Boolean(advisorSnapshot)} animationType="slide" onRequestClose={() => setAdvisorSnapshot(null)}>
        <ShareBriefScreen
          theme={theme}
          snapshot={advisorSnapshot}
          onClose={() => setAdvisorSnapshot(null)}
          onScanOwn={() => {
            setAdvisorSnapshot(null);
            setActiveTab('analyze');
          }}
        />
      </Modal>

      <ResetPasswordScreen
        visible={resetPasswordVisible}
        theme={theme}
        email={user?.email}
        onDone={() => setResetPasswordVisible(false)}
        onCancel={() => setResetPasswordVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <FeedbackProvider>
      <AdvisorChatProvider>
        <AppContent />
      </AdvisorChatProvider>
    </FeedbackProvider>
  );
}

