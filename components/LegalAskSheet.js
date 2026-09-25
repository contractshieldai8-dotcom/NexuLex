import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';

import { ACCENT, DANGER, WARNING, styles } from '../theme';
import { ASK_ERROR_CODES, askLegalQuestion, fetchLegalAskQuota, loadSavedAnswers, saveAnswer } from '../services/legalAsk';
import { loadCases, saveCases } from '../services/caseFileStore';
import { CASE_AREAS, CASE_AREA_ICONS, addEvent, formatCaseBrief, todayIso } from '../utils/caseFiles';
import { ASK_AUDIENCES, ASK_FACTS_MAX, ASK_QUESTION_MAX, ASK_QUESTION_MIN, formatAnswerText, officialPortal } from '../utils/legalAnswer';
import { describeError } from '../utils/errors';
import { useFeedback } from '../context/FeedbackContext';
import { ReportAiButton } from './AiReportSheet';
import KeyboardSafeSheet, { useKeyboardSafeSheet } from './KeyboardSafeSheet';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.92);
const AUDIENCE_ICONS = { person: 'person-outline', business: 'business-outline', professional: 'school-outline' };

export default function LegalAskSheet({
  visible,
  theme,
  country = 'auto',
  isPro = false,
  onNeedPaywall,
  onAskAdvisor,
  onOpenCalculator,
  onFindLawyer,
  prefill = null,
  onClose,
}) {
  const { t, i18n } = useTranslation();
  const { showToast } = useFeedback();
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX });
  const appliedPrefillRef = useRef(null);

  const [question, setQuestion] = useState('');
  const [facts, setFacts] = useState('');
  const [area, setArea] = useState('other');
  const [audience, setAudience] = useState('person');
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState(null);
  const [quota, setQuota] = useState(null);
  const [saved, setSaved] = useState([]);
  const [entry, setEntry] = useState(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    Promise.all([loadCases(), loadSavedAnswers(), fetchLegalAskQuota()]).then(([caseList, answers, remote]) => {
      if (!alive) return;
      setCases(caseList);
      setSaved(answers);
      if (remote) setQuota(remote);
    });
    return () => {
      alive = false;
    };
  }, [visible]);

  // Applied once per prefill object, so a paywall round-trip keeps whatever the user typed since.
  useEffect(() => {
    if (!visible || !prefill || appliedPrefillRef.current === prefill) return;
    appliedPrefillRef.current = prefill;
    if (CASE_AREAS.includes(prefill.area)) setArea(prefill.area);
    if (prefill.question) setQuestion(String(prefill.question).slice(0, ASK_QUESTION_MAX));
    setEntry(null);
  }, [visible, prefill]);

  const attached = cases.find((item) => item.id === caseId) || null;
  const outOfQuota = !!quota && quota.remaining <= 0;

  const handleAsk = async () => {
    const q = question.trim();
    if (q.length < ASK_QUESTION_MIN) {
      showToast(t('askTooShort'), { type: 'warning' });
      return;
    }
    if (outOfQuota) {
      if (!isPro) onNeedPaywall?.();
      else showToast(t('askProLimit'), { type: 'warning' });
      return;
    }
    setWorking(true);
    try {
      const caseContext = attached ? formatCaseBrief(attached, t, { includeEvidence: false }) : '';
      const result = await askLegalQuestion({ question: q, facts, area, audience, country, lang: i18n.language, caseContext });
      if (result.quota) setQuota(result.quota);
      const { entry: created, saved: list } = await saveAnswer({ question: q, facts, area, audience, answer: result.answer });
      setSaved(list);
      setEntry(created);
      sheet.scrollRef.current?.scrollTo?.({ y: 0, animated: false });
    } catch (error) {
      if (error?.quota) setQuota(error.quota);
      if (error?.code === ASK_ERROR_CODES.QUOTA) {
        if (!isPro) onNeedPaywall?.();
        else showToast(t('askProLimit'), { type: 'warning' });
      } else if (error?.code === ASK_ERROR_CODES.UNAVAILABLE) {
        showToast(t('askUnavailable'), { type: 'warning', duration: 3200 });
      } else if (error?.code === ASK_ERROR_CODES.INVALID) {
        showToast(t('askTooShort'), { type: 'warning' });
      } else {
        showToast(describeError(t, error), { type: 'error', duration: 3200 });
      }
    } finally {
      setWorking(false);
    }
  };

  const shareText = () =>
    formatAnswerText(entry.answer, t, { question: entry.question, disclaimer: t('askDisclaimer') });

  const handleShare = async () => {
    try {
      await Share.share({ message: shareText() });
    } catch {
      /* user cancelled */
    }
  };

  const handleAskAdvisor = () => {
    onAskAdvisor?.(`${t('askAdvisorPrompt')}\n\n${formatAnswerText(entry.answer, t, { question: entry.question })}`);
  };

  const saveToCase = async () => {
    const list = await loadCases();
    const target = list.find((item) => item.id === caseId);
    if (!target) return;
    const added = addEvent(target, {
      date: todayIso(),
      title: entry.question,
      note: entry.answer.shortAnswer,
      kind: 'document',
    });
    if (!added) return;
    const next = list.map((item) => (item.id === target.id ? added.item : item));
    await saveCases(next);
    setCases(next);
    showToast(t('askSavedToCase'), { type: 'success' });
  };

  const followUp = (text) => {
    setQuestion(text);
    setEntry(null);
    sheet.scrollRef.current?.scrollTo?.({ y: 0, animated: false });
  };

  const openUrl = (url) => {
    Linking.openURL(url).catch(() => showToast(t('askLinkFailed'), { type: 'error' }));
  };

  const sectionTitle = (key, icon) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, marginBottom: 6 }}>
      <Ionicons name={icon} size={15} color={ACCENT} />
      <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>{t(key)}</Text>
    </View>
  );
  const bodyText = [styles.sectionHint, { color: theme.text, fontSize: 13, lineHeight: 19, marginBottom: 0 }];
  const box = { borderWidth: 1, borderColor: theme.borderColor, borderRadius: 12, padding: 12, marginBottom: 8 };
  const inputStyle = [
    styles.chatInput,
    { flex: 0, textAlignVertical: 'top', backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor, marginBottom: 10 },
  ];
  const chip = (key, on, label, onPress, icon) => (
    <TouchableOpacity
      key={key}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: on ? ACCENT : theme.borderColor,
        backgroundColor: on ? `${ACCENT}22` : 'transparent',
        maxWidth: 220,
      }}
    >
      {icon ? <Ionicons name={icon} size={14} color={on ? ACCENT : theme.subText} /> : null}
      <Text style={{ color: on ? ACCENT : theme.text, fontSize: 13, fontWeight: on ? '700' : '500' }} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  const chipRow = (children) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
      {children}
    </ScrollView>
  );
  const linkBtn = (icon, labelKey, onPress) => (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={16} color={ACCENT} />
      <Text style={[styles.label, { color: ACCENT, marginBottom: 0 }]}>{t(labelKey)}</Text>
    </TouchableOpacity>
  );

  const renderIntake = () => (
    <View>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('askHint')}</Text>
      <Text style={[styles.label, { color: theme.subText }]}>{t('askAudienceLabel')}</Text>
      {chipRow(ASK_AUDIENCES.map((value) => chip(value, audience === value, t(`askAudience_${value}`), () => setAudience(value), AUDIENCE_ICONS[value])))}
      <Text style={[styles.label, { color: theme.subText }]}>{t('caseAreaLabel')}</Text>
      {chipRow(CASE_AREAS.map((value) => chip(value, area === value, t(`caseArea_${value}`), () => setArea(value), CASE_AREA_ICONS[value])))}
      <Text style={[styles.label, { color: theme.subText }]}>{t('askQuestionLabel')}</Text>
      <TextInput
        {...sheet.field('askQuestion', { multiline: true })}
        style={[inputStyle, { minHeight: 90 }]}
        value={question}
        onChangeText={setQuestion}
        placeholder={t('askQuestionPlaceholder')}
        placeholderTextColor={theme.subText}
        multiline
        maxLength={ASK_QUESTION_MAX}
        editable={!working}
      />
      <Text style={[styles.label, { color: theme.subText }]}>{t('askFactsLabel')}</Text>
      <TextInput
        {...sheet.field('askFacts', { multiline: true })}
        style={[inputStyle, { minHeight: 80 }]}
        value={facts}
        onChangeText={setFacts}
        placeholder={t('askFactsPlaceholder')}
        placeholderTextColor={theme.subText}
        multiline
        maxLength={ASK_FACTS_MAX}
        editable={!working}
      />
      {cases.length ? (
        <>
          <Text style={[styles.label, { color: theme.subText }]}>{t('askAttachCase')}</Text>
          {chipRow([
            chip('none', !caseId, t('askNoCase'), () => setCaseId(null), 'remove-circle-outline'),
            ...cases.map((item) => chip(item.id, caseId === item.id, item.title, () => setCaseId(item.id), CASE_AREA_ICONS[item.area])),
          ])}
        </>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
        <Ionicons name="lock-closed-outline" size={13} color={theme.subText} />
        <Text style={[styles.sectionHint, { color: theme.subText, flex: 1, marginBottom: 0 }]}>{t('askPrivacy')}</Text>
      </View>
      {quota ? (
        <Text style={[styles.sectionHint, { color: quota.remaining > 0 ? theme.subText : WARNING, marginTop: 6 }]}>
          {t('askQuotaLeft', { count: quota.remaining, total: quota.limit })}
        </Text>
      ) : null}
      {saved.length ? (
        <>
          <Text style={[styles.label, { color: theme.subText, marginTop: 12 }]}>{t('askRecent')}</Text>
          {chipRow(saved.map((item) => chip(item.id, false, item.question, () => setEntry(item), 'chatbox-ellipses-outline')))}
        </>
      ) : null}
    </View>
  );

  const renderAnswer = () => {
    const ans = entry.answer;
    const portal = officialPortal(ans.jurisdiction);
    return (
      <View>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]} numberOfLines={3}>
          {entry.question}
        </Text>
        <View style={{ ...box, borderColor: ACCENT, backgroundColor: theme.cardBg }}>
          <Text style={[styles.label, { color: theme.subText, marginBottom: 4 }]}>{t('askShortAnswer')}</Text>
          <Text style={[bodyText, { fontSize: 14, lineHeight: 21 }]}>{ans.shortAnswer}</Text>
          {ans.jurisdictionNote ? (
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6, marginBottom: 0 }]}>{ans.jurisdictionNote}</Text>
          ) : null}
        </View>

        {ans.confidence === 'LOW' ? (
          <View style={{ ...box, borderColor: WARNING, flexDirection: 'row', gap: 8 }}>
            <Ionicons name="alert-circle-outline" size={16} color={WARNING} />
            <Text style={[bodyText, { flex: 1 }]}>{t('askLowConfidence')}</Text>
          </View>
        ) : null}

        {ans.missingFacts.length ? (
          <View style={{ ...box, borderColor: WARNING }}>
            <Text style={[styles.label, { color: WARNING, marginBottom: 4 }]}>{t('askMissingFacts')}</Text>
            {ans.missingFacts.map((item, index) => (
              <Text key={`mf-${index}`} style={[bodyText, { marginBottom: 2 }]}>
                • {item}
              </Text>
            ))}
          </View>
        ) : null}

        {ans.explanation ? <Text style={bodyText}>{ans.explanation}</Text> : null}

        {ans.rules.length ? sectionTitle('askRules', 'library-outline') : null}
        {ans.rules.map((rule, index) => (
          <View key={`rule-${index}`} style={box}>
            <Text style={[styles.settingLabel, { color: theme.text, fontSize: 14 }]}>{rule.title}</Text>
            {rule.citation ? <Text style={[styles.sectionHint, { color: ACCENT, marginTop: 2, marginBottom: 0 }]}>{rule.citation}</Text> : null}
            {rule.detail ? <Text style={[bodyText, { marginTop: 4 }]}>{rule.detail}</Text> : null}
          </View>
        ))}
        {ans.rules.some((rule) => rule.citation) ? (
          <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('askVerifyCitations')}</Text>
        ) : null}

        {ans.steps.length ? sectionTitle('askSteps', 'footsteps-outline') : null}
        {ans.steps.map((step, index) => (
          <Text key={`step-${index}`} style={[bodyText, { marginBottom: 6 }]}>
            {index + 1}. {step}
          </Text>
        ))}

        {ans.deadlines.length ? sectionTitle('askDeadlines', 'alarm-outline') : null}
        {ans.deadlines.map((deadline, index) => (
          <View key={`dl-${index}`} style={{ ...box, borderColor: DANGER }}>
            <Text style={[styles.settingLabel, { color: theme.text, fontSize: 14 }]}>{deadline.label}</Text>
            <Text style={[bodyText, { marginTop: 4 }]}>{deadline.rule}</Text>
            <View style={{ marginTop: 8 }}>{linkBtn('calculator-outline', 'docExplainCountDays', () => onOpenCalculator?.('deadline_date'))}</View>
          </View>
        ))}

        {ans.documents.length ? sectionTitle('askDocuments', 'folder-open-outline') : null}
        {ans.documents.map((doc, index) => (
          <Text key={`doc-${index}`} style={[bodyText, { marginBottom: 4 }]}>
            • {doc}
          </Text>
        ))}

        {ans.risks.length ? sectionTitle('askRisks', 'warning-outline') : null}
        {ans.risks.map((risk, index) => (
          <Text key={`risk-${index}`} style={[bodyText, { marginBottom: 4 }]}>
            • {risk}
          </Text>
        ))}

        {ans.sources.length || portal ? sectionTitle('askSources', 'globe-outline') : null}
        {ans.sources.map((source) => (
          <TouchableOpacity key={source.url} onPress={() => openUrl(source.url)} style={{ ...box, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="open-outline" size={16} color={ACCENT} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: ACCENT, fontSize: 14 }]} numberOfLines={2}>
                {source.title}
              </Text>
              <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]} numberOfLines={1}>
                {source.host}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {portal ? (
          <TouchableOpacity onPress={() => openUrl(portal)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Ionicons name="search-outline" size={15} color={ACCENT} />
            <Text style={[styles.label, { color: ACCENT, marginBottom: 0 }]}>{t('askOfficialPortal')}</Text>
          </TouchableOpacity>
        ) : null}
        {ans.sources.length || portal ? (
          <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('askSourcesHint')}</Text>
        ) : null}

        {ans.lawyerWhen ? sectionTitle('askLawyerWhen', 'person-outline') : null}
        {ans.lawyerWhen ? <Text style={bodyText}>{ans.lawyerWhen}</Text> : null}
        {onFindLawyer ? (
          <View style={{ marginTop: 8 }}>{linkBtn('person-outline', 'lhFindCta', () => onFindLawyer({ area, caseId }))}</View>
        ) : null}

        {ans.followUps.length ? sectionTitle('askFollowUps', 'chatbubble-ellipses-outline') : null}
        {ans.followUps.length ? chipRow(ans.followUps.map((item, index) => chip(`fu-${index}`, false, item, () => followUp(item)))) : null}

        {caseId ? (
          <TouchableOpacity
            style={[styles.secondaryBtn, { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 12 }]}
            onPress={saveToCase}
          >
            <Ionicons name="folder-open-outline" size={16} color={ACCENT} />
            <Text style={styles.secondaryBtnText}>{t('askSaveToCase')}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 16, flexWrap: 'nowrap' }}>
          {linkBtn('chatbubbles-outline', 'docExplainAskAdvisor', handleAskAdvisor)}
          {linkBtn('share-outline', 'docExplainShare', handleShare)}
          <View style={{ flex: 1 }} />
          <ReportAiButton theme={theme} featureId="legal_ask" targetId={entry.id} country={country} context={shareText()} />
        </View>

        <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 14 }]}>{t('askDisclaimer')}</Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* BL.3: backdrop Pressable is sibling of sheet — not a wrapping parent. */}
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('closeButton')}
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
            <Ionicons name="help-buoy-outline" size={20} color={ACCENT} />
            <Text style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]} numberOfLines={2}>
              {t('askTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <KeyboardSafeSheet
            controller={sheet}
            style={{ maxHeight: Math.round(WIN_H * 0.7) }}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {working ? (
              <View style={{ alignItems: 'center', paddingVertical: 32, gap: 12 }}>
                <ActivityIndicator color={ACCENT} />
                <Text style={[styles.sectionHint, { color: theme.subText, textAlign: 'center' }]}>{t('askWorking')}</Text>
              </View>
            ) : entry ? (
              renderAnswer()
            ) : (
              renderIntake()
            )}
          </KeyboardSafeSheet>

          {entry && !working ? (
            <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={() => setEntry(null)}>
              <Text style={styles.secondaryBtnText}>{t('askNew')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 8 }, (working || question.trim().length < ASK_QUESTION_MIN) && styles.buttonDisabled]}
              onPress={handleAsk}
              disabled={working}
            >
              <Text style={styles.primaryButtonText}>{outOfQuota && !isPro ? t('askUnlock') : t('askCta')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
