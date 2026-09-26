import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';

import { ACCENT, DANGER, SUCCESS, WARNING, styles } from '../theme';
import {
  cancelCaseReminders,
  deleteEvidenceFiles,
  evidenceUri,
  loadCases,
  noteEvidence,
  saveCases,
  scheduleCaseEventReminders,
  storeFileEvidence,
} from '../services/caseFileStore';
import {
  CASE_AREAS,
  CASE_AREA_ICONS,
  CASE_SIDES,
  CASE_STATUSES,
  DATED_ALERT_KINDS,
  EVENT_KINDS,
  EVENT_KIND_ICONS,
  FREE_CASE_LIMIT,
  addEvent,
  addEvidence,
  canCreateCase,
  caseFromExplanation,
  createCase,
  daysBetween,
  dmyToIso,
  formatCaseBrief,
  isoToDmy,
  mergeExplanation,
  nextAction,
  removeEvent,
  removeEvidence,
  setStatus,
  sortedTimeline,
  todayIso,
} from '../utils/caseFiles';
import { maskDmyDateInput } from '../utils/dateInput';
import { readOwnedFile } from '../utils/fileAccess';
import { useFeedback } from '../context/FeedbackContext';
import KeyboardSafeSheet, { useKeyboardSafeSheet } from './KeyboardSafeSheet';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.92);
const EVIDENCE_ICONS = { photo: 'image-outline', pdf: 'document-outline', note: 'create-outline' };
const EVIDENCE_LABEL_KEYS = { photo: 'caseEvidencePhoto', pdf: 'caseEvidencePdf', note: 'caseEvidenceNote' };

const nextFrame = () => new Promise((resolve) => setTimeout(resolve, 60));

export default function CaseHubSheet({
  visible,
  theme,
  country = 'auto',
  isPro = false,
  openCaseId = null,
  importExplanation = null,
  onImportDone,
  seed = null,
  onNeedPaywall,
  onAskAdvisor,
  onOpenProTools,
  onOpenLawyer,
  onChanged,
  onClose,
}) {
  const { t } = useTranslation();
  const { showToast } = useFeedback();
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX });
  const appliedSeedRef = useRef(null);

  const [cases, setCases] = useState([]);
  const [view, setView] = useState('list');
  const [activeId, setActiveId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ title: '', area: 'other', side: 'undecided', counterparty: '' });
  const [eventDraft, setEventDraft] = useState({ kind: 'event', date: '', title: '', note: '' });
  const [evidenceDraft, setEvidenceDraft] = useState({ label: '', note: '' });

  const today = todayIso();
  const active = useMemo(() => cases.find((item) => item.id === activeId) || null, [cases, activeId]);

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    loadCases().then((list) => {
      if (!alive) return;
      setCases(list);
      if (openCaseId && list.some((item) => item.id === openCaseId)) {
        setActiveId(openCaseId);
        setView('detail');
      } else if (seed && appliedSeedRef.current !== seed && canCreateCase(list, isPro)) {
        // Over the free limit the seed waits in the list; "new case" opens the paywall as usual.
        appliedSeedRef.current = seed;
        setDraft({ title: seed.title || '', area: seed.area || 'other', side: 'undecided', counterparty: '' });
        setView('new');
      } else {
        setView('list');
      }
    });
    return () => {
      alive = false;
    };
  }, [visible, openCaseId, seed, isPro]);

  const commit = useCallback(
    async (next) => {
      setCases(next);
      await saveCases(next);
      onChanged?.(next);
    },
    [onChanged]
  );

  const replaceCase = (updated) => commit(cases.map((item) => (item.id === updated.id ? updated : item)));

  const go = (next) => {
    setView(next);
    sheet.scrollRef.current?.scrollTo?.({ y: 0, animated: false });
  };

  const needPaywall = () => onNeedPaywall?.('cases');

  const startNew = () => {
    if (!canCreateCase(cases, isPro)) {
      needPaywall();
      return;
    }
    const fromSeed = seed && appliedSeedRef.current !== seed ? seed : null;
    if (fromSeed) appliedSeedRef.current = fromSeed;
    setDraft({ title: fromSeed?.title || '', area: fromSeed?.area || 'other', side: 'undecided', counterparty: '' });
    go('new');
  };

  const saveNew = async () => {
    if (!draft.title.trim()) {
      showToast(t('caseNeedTitle'), { type: 'warning' });
      return;
    }
    const item = createCase({ ...draft, country });
    await commit([item, ...cases]);
    setActiveId(item.id);
    showToast(t('caseSaved'), { type: 'success' });
    go('detail');
  };

  const importInto = async (target) => {
    if (!importExplanation) return;
    let updated;
    if (target) {
      updated = mergeExplanation(target, importExplanation, today);
      if (updated) await commit(cases.map((item) => (item.id === updated.id ? updated : item)));
    } else {
      if (!canCreateCase(cases, isPro)) {
        needPaywall();
        return;
      }
      updated = caseFromExplanation(importExplanation, { country, today });
      if (updated) await commit([updated, ...cases]);
    }
    onImportDone?.();
    if (!updated) return;
    setActiveId(updated.id);
    showToast(t('caseImported'), { type: 'success' });
    go('detail');
  };

  const openEventForm = () => {
    setEventDraft({ kind: 'event', date: isoToDmy(today), title: '', note: '' });
    go('event');
  };

  const saveEvent = async () => {
    const iso = dmyToIso(eventDraft.date);
    if (!iso) {
      showToast(t('caseInvalidDate'), { type: 'warning' });
      return;
    }
    if (!eventDraft.title.trim()) {
      showToast(t('caseNeedTitle'), { type: 'warning' });
      return;
    }
    const result = addEvent(active, { ...eventDraft, date: iso });
    if (!result) return;
    await replaceCase(result.item);
    showToast(t('caseEventAdded'), { type: 'success' });
    go('detail');
  };

  const remind = async (event) => {
    const result = await scheduleCaseEventReminders({ caseId: active.id, event, title: active.title });
    if (result.scheduled > 0) showToast(t('docExplainRemindDone', { count: result.scheduled }), { type: 'success' });
    else showToast(t(result.unavailable ? 'docExplainRemindUnavailable' : 'docExplainRemindDenied'), { type: 'warning' });
  };

  const deleteEvent = async (event) => {
    await cancelCaseReminders(active, [event.id]);
    await replaceCase(removeEvent(active, event.id));
  };

  const openEvidenceForm = () => {
    setEvidenceDraft({ label: '', note: '' });
    go('evidence');
  };

  const attachEvidence = async (meta) => {
    const updated = addEvidence(active, meta);
    if (!updated) {
      if (meta.fileName) deleteEvidenceFiles([meta.fileName]);
      return;
    }
    await replaceCase(updated);
    showToast(t('caseEvidenceAdded'), { type: 'success' });
    go('detail');
  };

  const evidenceError = (error) => {
    if (error?.code === 'TOO_LARGE') showToast(t('caseEvidenceTooLarge'), { type: 'warning' });
    else showToast(t('filePickError'), { type: 'error' });
  };

  const pickPhotoEvidence = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: false, quality: 1 });
      if (result?.canceled || !result?.assets?.length) return;
      setBusy(true);
      await nextFrame();
      const asset = result.assets[0];
      const base64 = await readOwnedFile(asset.uri, { asBase64: true });
      const ext = (String(asset.fileName || asset.uri).match(/\.([a-z0-9]{2,5})(?:\?|$)/i) || [])[1] || 'jpg';
      await attachEvidence(await storeFileEvidence({ base64, ext, label: evidenceDraft.label.trim(), kind: 'photo' }));
    } catch (error) {
      evidenceError(error);
    } finally {
      setBusy(false);
    }
  };

  const pickPdfEvidence = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf'], copyToCacheDirectory: true });
      if (result?.canceled || !result?.assets?.length) return;
      setBusy(true);
      await nextFrame();
      const file = result.assets[0];
      const base64 = await readOwnedFile(file.uri, { asBase64: true });
      const label = evidenceDraft.label.trim() || String(file.name || '').replace(/\.pdf$/i, '');
      await attachEvidence(await storeFileEvidence({ base64, ext: 'pdf', label, kind: 'pdf' }));
    } catch (error) {
      evidenceError(error);
    } finally {
      setBusy(false);
    }
  };

  const saveNoteEvidence = async () => {
    if (!evidenceDraft.note.trim()) {
      showToast(t('caseNeedTitle'), { type: 'warning' });
      return;
    }
    await attachEvidence(noteEvidence({ label: evidenceDraft.label.trim(), note: evidenceDraft.note }));
  };

  const shareEvidence = async (item) => {
    try {
      if (item.kind === 'note') {
        await Share.share({ message: `${item.label ? `${item.label}\n` : ''}${item.note}\n\n${item.fingerprint}` });
        return;
      }
      const uri = evidenceUri(item.fileName);
      if (uri && (await Sharing.isAvailableAsync())) await Sharing.shareAsync(uri);
    } catch {
      /* user cancelled */
    }
  };

  const deleteEvidence = async (item) => {
    if (item.fileName) deleteEvidenceFiles([item.fileName]);
    await replaceCase(removeEvidence(active, item.id));
  };

  const confirmDeleteCase = () => {
    Alert.alert(t('caseDelete'), t('caseDeleteConfirm'), [
      { text: t('cancelButton'), style: 'cancel' },
      {
        text: t('caseDelete'),
        style: 'destructive',
        onPress: async () => {
          const target = active;
          await cancelCaseReminders(target);
          deleteEvidenceFiles(target.evidence.map((item) => item.fileName));
          setActiveId(null);
          go('list');
          await commit(cases.filter((item) => item.id !== target.id));
        },
      },
    ]);
  };

  const shareBrief = async () => {
    if (!isPro) {
      needPaywall();
      return;
    }
    try {
      await Share.share({ message: formatCaseBrief(active, t, { disclaimer: t('caseBriefDisclaimer'), today }) });
    } catch {
      /* user cancelled */
    }
  };

  const askAdvisor = () => {
    const brief = formatCaseBrief(active, t, { today, includeEvidence: false });
    onAskAdvisor?.(`${t('caseAdvisorPrompt')}\n\n${brief}`);
  };

  const daysLabel = (left) =>
    left > 0 ? t('docExplainDaysLeft', { count: left }) : left === 0 ? t('docExplainToday') : t('docExplainOverdue');

  const box = { borderWidth: 1, borderColor: theme.borderColor, borderRadius: 12, padding: 12, marginBottom: 8 };
  const bodyText = [styles.sectionHint, { color: theme.text, fontSize: 13, lineHeight: 19, marginBottom: 0 }];
  const inputStyle = [
    styles.chatInput,
    { flex: 0, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor, marginBottom: 10 },
  ];
  const linkBtn = (icon, labelKey, onPress, color = ACCENT, extra = null) => (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
      <Ionicons name={icon} size={15} color={color} />
      <Text style={[styles.label, { color, marginBottom: 0 }]}>{t(labelKey)}</Text>
      {extra}
    </TouchableOpacity>
  );
  const sectionTitle = (key, icon) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, marginBottom: 6 }}>
      <Ionicons name={icon} size={15} color={ACCENT} />
      <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>{t(key)}</Text>
    </View>
  );
  const chips = (values, selected, onSelect, labelOf, iconOf) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
      {values.map((value) => {
        const on = value === selected;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => onSelect(value)}
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
            }}
          >
            {iconOf ? <Ionicons name={iconOf(value)} size={14} color={on ? ACCENT : theme.subText} /> : null}
            <Text style={{ color: on ? ACCENT : theme.text, fontSize: 13, fontWeight: on ? '700' : '500' }}>{labelOf(value)}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const nextLine = (item) => {
    const next = nextAction(item, today);
    if (next.type === 'closed') return { text: t('caseNextClosed'), color: theme.subText };
    if (next.type === 'none') return { text: t('caseNextNone'), color: theme.subText };
    return {
      text: `${t(`caseKind_${next.type}`)}: ${next.event.title} · ${isoToDmy(next.event.date)} · ${daysLabel(next.daysLeft)}`,
      color: next.daysLeft <= 7 ? DANGER : next.daysLeft <= 14 ? WARNING : SUCCESS,
    };
  };

  const renderList = () => (
    <View>
      {importExplanation ? (
        <View style={{ ...box, borderColor: ACCENT, backgroundColor: `${ACCENT}11` }}>
          <Text style={[styles.settingLabel, { color: theme.text, fontSize: 14 }]}>{t('caseImportTitle')}</Text>
          <Text style={[bodyText, { marginTop: 4 }]} numberOfLines={2}>
            {importExplanation.title}
          </Text>
          <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 10 }]} onPress={() => importInto(null)}>
            <Text style={styles.secondaryBtnText}>{t('caseImportNew')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {!cases.length ? <Text style={[bodyText, { color: theme.subText, marginBottom: 10 }]}>{t('caseEmpty')}</Text> : null}
      {cases.map((item) => {
        const line = nextLine(item);
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              if (importExplanation) {
                importInto(item);
                return;
              }
              setActiveId(item.id);
              go('detail');
            }}
            style={{ ...box, backgroundColor: theme.cardBg }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name={CASE_AREA_ICONS[item.area]} size={18} color={ACCENT} />
              <Text style={[styles.settingLabel, { color: theme.text, flex: 1, fontSize: 15 }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Ionicons name={importExplanation ? 'add-circle-outline' : 'chevron-forward'} size={18} color={theme.subText} />
            </View>
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>
              {t(`caseArea_${item.area}`)} · {t(`caseStatus_${item.status}`)}
            </Text>
            <Text style={[styles.sectionHint, { color: line.color, marginTop: 4, marginBottom: 0 }]} numberOfLines={2}>
              {line.text}
            </Text>
          </TouchableOpacity>
        );
      })}
      {!isPro ? (
        <Text style={[styles.sectionHint, { color: cases.length >= FREE_CASE_LIMIT ? WARNING : theme.subText, marginTop: 4 }]}>
          {t('caseFreeLimit')}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
        <Ionicons name="lock-closed-outline" size={13} color={theme.subText} />
        <Text style={[styles.sectionHint, { color: theme.subText, flex: 1, marginBottom: 0 }]}>{t('caseStorageNote')}</Text>
      </View>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 8, marginBottom: 0 }]}>{t('ux7OnDevice')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux7NoContract')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux7Free')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux7Evidence')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux7Brief')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux7NoWin')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux7Share')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux7Disclaimer')}</Text>
    </View>
  );

  const renderNew = () => (
    <View>
      <Text style={[styles.label, { color: theme.subText }]}>{t('caseTitleLabel')}</Text>
      <TextInput
        {...sheet.field('caseTitle')}
        style={inputStyle}
        value={draft.title}
        onChangeText={(title) => setDraft((prev) => ({ ...prev, title }))}
        placeholder={t('caseTitlePlaceholder')}
        placeholderTextColor={theme.subText}
        maxLength={120}
      />
      <Text style={[styles.label, { color: theme.subText }]}>{t('caseAreaLabel')}</Text>
      {chips(CASE_AREAS, draft.area, (area) => setDraft((prev) => ({ ...prev, area })), (v) => t(`caseArea_${v}`), (v) => CASE_AREA_ICONS[v])}
      <Text style={[styles.label, { color: theme.subText }]}>{t('caseSideLabel')}</Text>
      {chips(CASE_SIDES, draft.side, (side) => setDraft((prev) => ({ ...prev, side })), (v) => t(`caseSide_${v}`))}
      <Text style={[styles.label, { color: theme.subText }]}>{t('caseCounterpartyLabel')}</Text>
      <TextInput
        {...sheet.field('caseParty')}
        style={inputStyle}
        value={draft.counterparty}
        onChangeText={(counterparty) => setDraft((prev) => ({ ...prev, counterparty }))}
        placeholder={t('caseCounterpartyPlaceholder')}
        placeholderTextColor={theme.subText}
        maxLength={160}
      />
    </View>
  );

  const renderDetail = () => {
    if (!active) return null;
    const line = nextLine(active);
    const timeline = sortedTimeline(active);
    return (
      <View>
        <View style={{ ...box, backgroundColor: theme.cardBg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name={CASE_AREA_ICONS[active.area]} size={20} color={ACCENT} />
            <Text style={[styles.settingLabel, { color: theme.text, flex: 1 }]}>{active.title}</Text>
          </View>
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>
            {t(`caseArea_${active.area}`)} · {t(`caseSide_${active.side}`)}
            {active.counterparty ? ` · ${active.counterparty}` : ''}
          </Text>
        </View>

        <Text style={[styles.label, { color: theme.subText }]}>{t('caseStatusLabel')}</Text>
        {chips(CASE_STATUSES, active.status, (status) => replaceCase(setStatus(active, status)), (v) => t(`caseStatus_${v}`))}

        <View style={{ ...box, borderColor: line.color }}>
          <Text style={[styles.label, { color: theme.subText, marginBottom: 2 }]}>{t('caseNextAction')}</Text>
          <Text style={[bodyText, { color: line.color === theme.subText ? theme.text : line.color }]}>{line.text}</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginVertical: 6 }}>
          {linkBtn('chatbubbles-outline', 'caseAskAdvisor', askAdvisor)}
          {linkBtn(
            'briefcase-outline',
            'caseBrief',
            shareBrief,
            ACCENT,
            isPro ? null : <Ionicons name="lock-closed" size={12} color={ACCENT} />
          )}
          {onOpenProTools ? linkBtn('ribbon-outline', 'ptCardTitle', () => onOpenProTools(active)) : null}
          {onOpenLawyer ? linkBtn('person-outline', 'lhFindCta', () => onOpenLawyer(active)) : null}
        </View>

        {sectionTitle('caseTimeline', 'git-commit-outline')}
        {!timeline.length ? <Text style={[bodyText, { color: theme.subText }]}>{t('caseTimelineEmpty')}</Text> : null}
        {timeline.map((event) => {
          const alert = DATED_ALERT_KINDS.includes(event.kind);
          const left = daysBetween(today, event.date);
          const urgent = alert && left !== null && left >= 0 && left <= 7;
          return (
            <View key={event.id} style={{ ...box, borderColor: urgent ? DANGER : theme.borderColor }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name={EVENT_KIND_ICONS[event.kind]} size={15} color={alert ? WARNING : ACCENT} />
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, flex: 1 }]}>
                  {isoToDmy(event.date)} · {t(`caseKind_${event.kind}`)}
                  {alert && left !== null ? ` · ${daysLabel(left)}` : ''}
                </Text>
                <TouchableOpacity onPress={() => deleteEvent(event)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel={t('caseDeleteItem')}>
                  <Ionicons name="trash-outline" size={15} color={theme.subText} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.settingLabel, { color: theme.text, fontSize: 14, marginTop: 4 }]}>{event.title}</Text>
              {event.note ? <Text style={[bodyText, { marginTop: 4 }]}>{event.note}</Text> : null}
              {alert && left !== null && left >= 0 ? (
                <View style={{ marginTop: 8 }}>{linkBtn('notifications-outline', 'docExplainRemind', () => remind(event))}</View>
              ) : null}
            </View>
          );
        })}
        <TouchableOpacity style={[styles.secondaryBtn, { flexDirection: 'row', gap: 6, justifyContent: 'center' }]} onPress={openEventForm}>
          <Ionicons name="add" size={16} color={ACCENT} />
          <Text style={styles.secondaryBtnText}>{t('caseAddEvent')}</Text>
        </TouchableOpacity>

        {sectionTitle('caseEvidence', 'shield-checkmark-outline')}
        {!active.evidence.length ? <Text style={[bodyText, { color: theme.subText }]}>{t('caseEvidenceEmpty')}</Text> : null}
        {active.evidence.map((item) => (
          <View key={item.id} style={box}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name={EVIDENCE_ICONS[item.kind]} size={15} color={ACCENT} />
              <Text style={[styles.settingLabel, { color: theme.text, fontSize: 14, flex: 1 }]} numberOfLines={2}>
                {item.label || t(EVIDENCE_LABEL_KEYS[item.kind])}
              </Text>
              <TouchableOpacity onPress={() => shareEvidence(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel={t('caseEvidenceShare')}>
                <Ionicons name="share-outline" size={16} color={ACCENT} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteEvidence(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel={t('caseDeleteItem')}>
                <Ionicons name="trash-outline" size={15} color={theme.subText} />
              </TouchableOpacity>
            </View>
            {item.note ? (
              <Text style={[bodyText, { marginTop: 4 }]} numberOfLines={4}>
                {item.note}
              </Text>
            ) : null}
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0, fontSize: 11 }]} selectable>
              {isoToDmy(item.addedAt.slice(0, 10))} · {t('caseFingerprint')}: {item.fingerprint.slice(7, 23)}…
            </Text>
          </View>
        ))}
        {active.evidence.length ? <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('caseFingerprintHint')}</Text> : null}
        <TouchableOpacity style={[styles.secondaryBtn, { flexDirection: 'row', gap: 6, justifyContent: 'center' }]} onPress={openEvidenceForm}>
          <Ionicons name="add" size={16} color={ACCENT} />
          <Text style={styles.secondaryBtnText}>{t('caseAddEvidence')}</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 18 }}>{linkBtn('trash-outline', 'caseDelete', confirmDeleteCase, DANGER)}</View>
        <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 10, marginBottom: 0 }]}>{t('ux7Disclaimer')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 14 }]}>{t('caseBriefDisclaimer')}</Text>
      </View>
    );
  };

  const renderEventForm = () => (
    <View>
      <Text style={[styles.label, { color: theme.subText }]}>{t('caseEventKind')}</Text>
      {chips(EVENT_KINDS, eventDraft.kind, (kind) => setEventDraft((prev) => ({ ...prev, kind })), (v) => t(`caseKind_${v}`), (v) => EVENT_KIND_ICONS[v])}
      <Text style={[styles.label, { color: theme.subText }]}>{t('caseEventDate')}</Text>
      <TextInput
        {...sheet.field('eventDate')}
        style={inputStyle}
        value={eventDraft.date}
        onChangeText={(value) => setEventDraft((prev) => ({ ...prev, date: maskDmyDateInput(value) }))}
        placeholder="31.12.2026"
        placeholderTextColor={theme.subText}
        keyboardType="number-pad"
        maxLength={10}
      />
      <Text style={[styles.label, { color: theme.subText }]}>{t('caseEventTitle')}</Text>
      <TextInput
        {...sheet.field('eventTitle')}
        style={inputStyle}
        value={eventDraft.title}
        onChangeText={(title) => setEventDraft((prev) => ({ ...prev, title }))}
        placeholder={t('caseEventTitlePlaceholder')}
        placeholderTextColor={theme.subText}
        maxLength={160}
      />
      <Text style={[styles.label, { color: theme.subText }]}>{t('caseEventNote')}</Text>
      <TextInput
        {...sheet.field('eventNote', { multiline: true })}
        style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
        value={eventDraft.note}
        onChangeText={(note) => setEventDraft((prev) => ({ ...prev, note }))}
        placeholderTextColor={theme.subText}
        multiline
        maxLength={600}
      />
    </View>
  );

  const renderEvidenceForm = () => (
    <View>
      <Text style={[styles.label, { color: theme.subText }]}>{t('caseEvidenceLabel')}</Text>
      <TextInput
        {...sheet.field('evidenceLabel')}
        style={inputStyle}
        value={evidenceDraft.label}
        onChangeText={(label) => setEvidenceDraft((prev) => ({ ...prev, label }))}
        placeholder={t('caseEvidenceLabelPlaceholder')}
        placeholderTextColor={theme.subText}
        maxLength={120}
      />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <TouchableOpacity
          style={[styles.secondaryBtn, { flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center' }, busy && styles.buttonDisabled]}
          onPress={pickPhotoEvidence}
          disabled={busy}
        >
          <Ionicons name="image-outline" size={16} color={ACCENT} />
          <Text style={styles.secondaryBtnText}>{t('caseEvidencePhoto')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, { flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center' }, busy && styles.buttonDisabled]}
          onPress={pickPdfEvidence}
          disabled={busy}
        >
          <Ionicons name="document-outline" size={16} color={ACCENT} />
          <Text style={styles.secondaryBtnText}>{t('caseEvidencePdf')}</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.label, { color: theme.subText }]}>{t('caseEvidenceNote')}</Text>
      <TextInput
        {...sheet.field('evidenceNote', { multiline: true })}
        style={[inputStyle, { minHeight: 110, textAlignVertical: 'top' }]}
        value={evidenceDraft.note}
        onChangeText={(note) => setEvidenceDraft((prev) => ({ ...prev, note }))}
        placeholder={t('caseEvidenceNotePlaceholder')}
        placeholderTextColor={theme.subText}
        multiline
        maxLength={2000}
      />
      <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('caseFingerprintHint')}</Text>
    </View>
  );

  const footer = () => {
    if (busy) return null;
    if (view === 'list') {
      return (
        <TouchableOpacity style={[styles.primaryButton, { marginTop: 8 }]} onPress={startNew}>
          <Text style={styles.primaryButtonText}>{t('caseNew')}</Text>
        </TouchableOpacity>
      );
    }
    const action = view === 'new' ? saveNew : view === 'event' ? saveEvent : view === 'evidence' ? saveNoteEvidence : null;
    return (
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={() => go(view === 'detail' ? 'list' : activeId && view !== 'new' ? 'detail' : 'list')}>
          <Text style={styles.secondaryBtnText}>{t('caseBack')}</Text>
        </TouchableOpacity>
        {action ? (
          <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={action}>
            <Text style={styles.primaryButtonText}>{t('caseSave')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const titleKey = view === 'new' ? 'caseNew' : view === 'event' ? 'caseAddEvent' : view === 'evidence' ? 'caseAddEvidence' : 'caseCardTitle';

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
            <Ionicons name="folder-open-outline" size={20} color={ACCENT} />
            <Text style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]} numberOfLines={2}>
              {t(titleKey)}
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
            {busy ? (
              <View style={{ alignItems: 'center', paddingVertical: 32, gap: 12 }}>
                <ActivityIndicator color={ACCENT} />
                <Text style={[styles.sectionHint, { color: theme.subText, textAlign: 'center' }]}>{t('caseEvidenceWorking')}</Text>
              </View>
            ) : view === 'new' ? (
              renderNew()
            ) : view === 'detail' ? (
              renderDetail()
            ) : view === 'event' ? (
              renderEventForm()
            ) : view === 'evidence' ? (
              renderEvidenceForm()
            ) : (
              renderList()
            )}
          </KeyboardSafeSheet>
          {footer()}
        </View>
      </View>
    </Modal>
  );
}
