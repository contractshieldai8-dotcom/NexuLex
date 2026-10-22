import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
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
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';

import { ACCENT, styles } from '../theme';
import { JURISDICTIONS } from '../constants/options';
import { resolveJurisdiction } from '../constants/jurisdiction';
import {
  DEFAULT_QUESTIONS,
  GOAL_MAX,
  HANDOFF_PREP,
  HANDOFF_QUESTIONS,
  SUMMARY_MAX,
  buildHandoffPacket,
  buildIntroMessage,
  canBuildPacket,
  handoffJurisdiction,
  lawyerDirectoriesFor,
} from '../constants/lawyerHandoff';
import { CASE_AREAS, CASE_AREA_ICONS, todayIso } from '../utils/caseFiles';
import { loadCases } from '../services/caseFileStore';
import { exportPlain, paginatePlainHtml } from '../utils/exportPlain';
import { readOwnedFile, writeOwnedBase64, cleanStaleExportCache } from '../utils/fileAccess';
import { isRtlLanguage } from '../utils/rtl';
import { useFeedback } from '../context/FeedbackContext';
import KeyboardSafeSheet, { useKeyboardSafeSheet } from './KeyboardSafeSheet';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.92);
const PDF_NAME = 'NexuLex-lawyer-brief.pdf';
const TXT_NAME = 'NexuLex-lawyer-brief.txt';

export default function LawyerHandoffSheet({
  visible,
  theme,
  country = 'auto',
  isPro = false,
  seed = null,
  onNeedPaywall,
  onClose,
}) {
  const { t, i18n } = useTranslation();
  const { showToast } = useFeedback();
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX });

  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState(null);
  const [area, setArea] = useState('other');
  const [summary, setSummary] = useState('');
  const [goal, setGoal] = useState('');
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [busy, setBusy] = useState(false);
  const appliedSeedRef = useRef(null);

  useEffect(() => {
    if (!visible) return undefined;
    let alive = true;
    loadCases()
      .then((list) => {
        if (!alive) return;
        setCases(list);
        setCaseId((current) => (current && !list.some((item) => item.id === current) ? null : current));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !seed) return;
    if (appliedSeedRef.current === seed) return;
    appliedSeedRef.current = seed;
    if (seed.caseId) setCaseId(seed.caseId);
    if (seed.area && CASE_AREAS.includes(seed.area)) setArea(seed.area);
    if (seed.summary) setSummary(String(seed.summary).slice(0, SUMMARY_MAX));
    sheet.scrollRef.current?.scrollTo?.({ y: 0, animated: false });
  }, [visible, seed, sheet.scrollRef]);

  const caseItem = useMemo(() => cases.find((item) => item.id === caseId) || null, [cases, caseId]);
  const jurisdiction = handoffJurisdiction(caseItem, resolveJurisdiction(country, i18n.language));
  const countryLabel = useMemo(() => {
    const match = JURISDICTIONS.find((item) => item.code === jurisdiction);
    return match ? t(match.labelKey) : jurisdiction || '';
  }, [jurisdiction, t]);
  const dirs = useMemo(() => lawyerDirectoriesFor(jurisdiction), [jurisdiction]);
  const input = { caseItem, summary, area, goal, questions, countryLabel };
  const packetReady = canBuildPacket(input);

  const openUrl = (url) => {
    Linking.openURL(url).catch(() => showToast(t('askLinkFailed'), { type: 'error' }));
  };

  const toggleQuestion = (id) =>
    setQuestions((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));

  const introText = () => buildIntroMessage(input, t, todayIso());
  const packetText = () => buildHandoffPacket(input, t, { today: todayIso(), disclaimer: t('lhDisclaimer') });

  const copyIntro = async () => {
    try {
      await Clipboard.setStringAsync(introText());
      showToast(t('lhCopied'), { type: 'success' });
    } catch {
      showToast(t('genShareFailed'), { type: 'error' });
    }
  };

  const shareIntro = async () => {
    try {
      await Share.share({ message: introText() });
    } catch {
      /* user cancelled */
    }
  };

  const guardPacket = () => {
    if (!isPro) {
      onNeedPaywall?.('lawyer');
      return false;
    }
    if (!packetReady) {
      showToast(t('lhNeedSummary'), { type: 'warning' });
      return false;
    }
    return true;
  };

  const copyPacket = async () => {
    if (!guardPacket()) return;
    try {
      await Clipboard.setStringAsync(packetText());
      showToast(t('lhCopied'), { type: 'success' });
    } catch {
      showToast(t('genShareFailed'), { type: 'error' });
    }
  };

  const sharePacketPdf = async () => {
    if (!guardPacket() || busy) return;
    const text = packetText();
    setBusy(true);
    try {
      const html = paginatePlainHtml(text).replace('<body>', isRtlLanguage(i18n.language) ? '<body dir="rtl">' : '<body>');
      const printed = await Print.printToFileAsync({ html, base64: true });
      let payload = String(printed?.base64 || '').replace(/^data:[^;]+;base64,/, '');
      if (!payload && printed?.uri) {
        try {
          payload = await readOwnedFile(printed.uri, { asBase64: true });
        } catch {
          /* Print URI */
        }
      }
      const ownedUri = payload ? await writeOwnedBase64(payload, PDF_NAME) : '';
      if (!ownedUri || !(await Sharing.isAvailableAsync())) {
        await exportPlain(text, TXT_NAME, { shareAlways: true });
        return;
      }
      await Sharing.shareAsync(ownedUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
      cleanStaleExportCache().catch(() => {});
    } catch {
      try {
        await exportPlain(text, TXT_NAME, { shareAlways: true });
      } catch {
        showToast(t('genShareFailed'), { type: 'error' });
      }
    } finally {
      setBusy(false);
    }
  };

  const bodyText = [styles.sectionHint, { color: theme.text, fontSize: 13, lineHeight: 19, marginBottom: 0 }];
  const box = { borderWidth: 1, borderColor: theme.borderColor, borderRadius: 12, padding: 12, marginBottom: 8 };
  const sectionTitle = (key, icon, params) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, marginBottom: 6 }}>
      <Ionicons name={icon} size={15} color={theme.accent} />
      <Text style={[styles.label, { color: theme.text, marginBottom: 0, flex: 1 }]}>{t(key, params)}</Text>
    </View>
  );
  const chip = (key, on, label, onPress, icon) => (
    <TouchableOpacity accessibilityRole="button"
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
        borderColor: on ? theme.accent : theme.borderColor,
        backgroundColor: on ? `${ACCENT}22` : 'transparent',
      }}
    >
      {icon ? <Ionicons name={icon} size={14} color={on ? theme.accent : theme.subText} /> : null}
      <Text style={{ color: on ? theme.accent : theme.text, fontSize: 13, fontWeight: on ? '700' : '500' }} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  const chipRow = (children) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
      {children}
    </ScrollView>
  );
  const linkRow = (body, icon) => (
    <TouchableOpacity
      key={body.url}
      onPress={() => openUrl(body.url)}
      style={{ ...box, flexDirection: 'row', alignItems: 'center', gap: 10 }}
      accessibilityRole="link"
    >
      <Ionicons name={icon} size={18} color={theme.accent} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: theme.text, marginBottom: 2 }]}>{body.name}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]} numberOfLines={1}>
          {body.url.replace(/^https:\/\//, '')}
        </Text>
      </View>
      <Ionicons name="open-outline" size={15} color={theme.subText} />
    </TouchableOpacity>
  );
  const actionBtn = (icon, labelKey, onPress, { primary = false, locked = false } = {}) => (
    <TouchableOpacity accessibilityRole="button"
      style={[primary ? styles.primaryButton : styles.secondaryBtn, { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 8, opacity: busy ? 0.6 : 1 }]}
      onPress={onPress}
      disabled={busy}
    >
      <Ionicons name={locked ? 'lock-closed' : icon} size={16} color={primary ? '#080C14' : theme.accent} />
      <Text style={primary ? styles.primaryButtonText : styles.secondaryBtnText}>{t(labelKey)}</Text>
    </TouchableOpacity>
  );

  const renderBody = () => (
    <View>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('lhHint')}</Text>
      <View style={{ ...box, borderColor: theme.warning, backgroundColor: 'rgba(232, 163, 61, 0.08)', flexDirection: 'row', gap: 8 }}>
        <Ionicons name="shield-checkmark-outline" size={16} color={theme.warning} />
        <Text style={[bodyText, { flex: 1 }]}>{t('lhNoReferral')}</Text>
      </View>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 8, marginBottom: 0 }]}>{t('ux6NoList')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>
        {t('ux6Country', { country: countryLabel || '—' })}
      </Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux6OnDevice')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux6IntroFree')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux6Packet')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux6NoWin')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 8 }]}>{t('ux6Check')}</Text>

      {sectionTitle('lhFindTitle', 'ribbon-outline', { country: countryLabel || '—' })}
      {!jurisdiction ? (
        <Text style={[bodyText, { color: theme.subText }]}>{t('lhPickCountry')}</Text>
      ) : dirs.covered ? (
        <>
          {dirs.bar.map((body) => linkRow(body, 'ribbon-outline'))}
          <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('lhFindHint')}</Text>
        </>
      ) : (
        <Text style={[bodyText, { color: theme.subText }]}>{t('lhNotCovered')}</Text>
      )}

      {sectionTitle('lhLegalAidTitle', 'people-outline')}
      {dirs.legalAid.length ? dirs.legalAid.map((body) => linkRow(body, 'people-outline')) : null}
      <Text style={[styles.sectionHint, { color: theme.subText }]}>{dirs.legalAid.length ? t('lhLegalAidHint') : t('lhLegalAidNone')}</Text>

      {sectionTitle('lhCaseTitle', 'folder-open-outline')}
      {cases.length ? (
        chipRow([
          chip('none', !caseId, t('lhNoCase'), () => setCaseId(null), 'create-outline'),
          ...cases.map((item) => chip(item.id, caseId === item.id, item.title, () => setCaseId(item.id), CASE_AREA_ICONS[item.area])),
        ])
      ) : (
        <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('lhCaseHint')}</Text>
      )}
      {!caseItem ? (
        <View style={{ marginTop: 8 }}>
          {chipRow(CASE_AREAS.map((id) => chip(id, area === id, t(`caseArea_${id}`), () => setArea(id), CASE_AREA_ICONS[id])))}
        </View>
      ) : null}
      <TextInput
        {...sheet.field('lhSummary', { multiline: true })}
        style={[styles.input, { color: theme.text, borderColor: theme.borderColor, minHeight: 84, textAlignVertical: 'top', marginTop: 8 }]}
        value={summary}
        onChangeText={(value) => setSummary(value.slice(0, SUMMARY_MAX))}
        placeholder={caseItem ? t('lhSummaryOptional') : t('lhSummaryPlaceholder')}
        placeholderTextColor={theme.subText}
        multiline
      />

      {sectionTitle('lhGoalTitle', 'flag-outline')}
      <TextInput
        {...sheet.field('lhGoal', { multiline: true })}
        style={[styles.input, { color: theme.text, borderColor: theme.borderColor, minHeight: 60, textAlignVertical: 'top' }]}
        value={goal}
        onChangeText={(value) => setGoal(value.slice(0, GOAL_MAX))}
        placeholder={t('lhGoalPlaceholder')}
        placeholderTextColor={theme.subText}
        multiline
      />

      {sectionTitle('lhQuestionsTitle', 'list-outline')}
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('lhQuestionsHint')}</Text>
      {HANDOFF_QUESTIONS.map((id) => {
        const on = questions.includes(id);
        return (
          <TouchableOpacity
            key={id}
            onPress={() => toggleQuestion(id)}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 6 }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
          >
            <Ionicons name={on ? 'checkbox' : 'square-outline'} size={18} color={on ? theme.accent : theme.subText} />
            <Text style={[bodyText, { flex: 1 }]}>{t(`lhQ_${id}`)}</Text>
          </TouchableOpacity>
        );
      })}

      {sectionTitle('lhPrepTitle', 'checkmark-done-outline')}
      {HANDOFF_PREP.map((id) => (
        <View key={id} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
          <Ionicons name="ellipse" size={6} color={theme.accent} style={{ marginTop: 7 }} />
          <Text style={[bodyText, { flex: 1 }]}>{t(`lhPrep_${id}`)}</Text>
        </View>
      ))}

      {sectionTitle('lhIntroTitle', 'mail-outline')}
      <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('lhIntroHint')}</Text>
      {actionBtn('copy-outline', 'lhCopyIntro', copyIntro, { primary: true })}
      {actionBtn('share-outline', 'lhShareIntro', shareIntro)}

      {sectionTitle('lhPacketTitle', 'document-text-outline')}
      <Text style={[styles.sectionHint, { color: theme.subText }]}>{isPro ? t('lhPacketHint') : t('lhPacketLocked')}</Text>
      {actionBtn('document-outline', 'lhSharePdf', sharePacketPdf, { primary: isPro, locked: !isPro })}
      {actionBtn('copy-outline', 'lhCopyPacket', copyPacket, { locked: !isPro })}

      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 10, marginBottom: 0 }]}>{t('ux6Disclaimer')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 14 }]}>{t('lhDisclaimer')}</Text>
    </View>
  );

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
            <Ionicons name="briefcase-outline" size={20} color={theme.accent} />
            <Text style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]} numberOfLines={2}>
              {t('lhTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel={t('closeButton')}>
              <Ionicons name="close" size={22} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <KeyboardSafeSheet
            controller={sheet}
            style={{ maxHeight: Math.round(WIN_H * 0.7) }}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {renderBody()}
          </KeyboardSafeSheet>

          <TouchableOpacity accessibilityRole="button" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={onClose}>
            <Text style={styles.secondaryBtnText}>{t('closeButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
