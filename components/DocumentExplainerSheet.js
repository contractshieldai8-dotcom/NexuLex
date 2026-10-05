import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

import { ACCENT, DANGER, SUCCESS, WARNING, styles } from '../theme';
import { explainLegalDocument } from '../services/ai';
import {
  loadFreeExplainsLeft,
  loadSavedExplains,
  recordExplainUse,
  saveExplain,
  scheduleDeadlineReminders,
} from '../services/documentExplainStore';
import {
  DOC_TYPE_ICONS,
  FREE_EXPLAINS_PER_MONTH,
  MAX_EXPLAIN_PAGES,
  daysUntil,
  formatExplanationText,
  splitForTier,
} from '../utils/documentExplain';
import { readOwnedFile } from '../utils/fileAccess';
import { describeError } from '../utils/errors';
import { useFeedback } from '../context/FeedbackContext';
import { ReportAiButton } from './AiReportSheet';
import { compressImage } from './ContractAnalyzer';
import KeyboardSafeSheet, { useKeyboardSafeSheet } from './KeyboardSafeSheet';
import LockedSection from './LockedSection';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.92);
const URGENCY_STYLE = {
  HIGH: { color: DANGER, key: 'docExplainUrgencyHigh', icon: 'alert-circle' },
  MEDIUM: { color: WARNING, key: 'docExplainUrgencyMedium', icon: 'time' },
  LOW: { color: SUCCESS, key: 'docExplainUrgencyLow', icon: 'checkmark-circle' },
};

function formatDate(iso, language) {
  const [y, m, d] = String(iso).split('-').map(Number);
  try {
    return new Date(y, m - 1, d).toLocaleDateString(language, { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' });
  } catch {
    return iso;
  }
}

export default function DocumentExplainerSheet({
  visible,
  theme,
  country = 'auto',
  isPro = false,
  openEntryId = null,
  onNeedPaywall,
  onAskAdvisor,
  onOpenCalculator,
  onAddToCase,
  onClose,
}) {
  const { t, i18n } = useTranslation();
  const { showToast } = useFeedback();
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX });

  const [pasted, setPasted] = useState('');
  const [images, setImages] = useState([]);
  const [pdf, setPdf] = useState(null);
  const [picking, setPicking] = useState(false);
  const [working, setWorking] = useState(false);
  const [entry, setEntry] = useState(null);
  const [saved, setSaved] = useState([]);
  const [freeLeft, setFreeLeft] = useState(FREE_EXPLAINS_PER_MONTH);

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    Promise.all([loadSavedExplains(), loadFreeExplainsLeft()]).then(([list, left]) => {
      if (!alive) return;
      setSaved(list);
      setFreeLeft(left);
      if (openEntryId) {
        const match = list.find((item) => item.id === openEntryId);
        if (match) setEntry(match);
      }
    });
    return () => {
      alive = false;
    };
  }, [visible, openEntryId]);

  const hasInput = !!(pasted.trim() || images.length || pdf);
  const { visible: shown, lockedCount } = useMemo(
    () => splitForTier(entry?.explanation || null, isPro),
    [entry, isPro]
  );

  const pickPhotos = async () => {
    const room = MAX_EXPLAIN_PAGES - images.length;
    if (room <= 0) {
      showToast(t('docExplainPageLimit', { count: MAX_EXPLAIN_PAGES }), { type: 'warning' });
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: room,
        quality: 1,
      });
      if (result?.canceled || !result?.assets?.length) return;
      setPicking(true);
      const processed = await Promise.all(
        result.assets.slice(0, room).map(async (asset) => {
          const out = await compressImage(asset.uri, asset.width);
          return { uri: out.uri, base64: out.base64, mimeType: 'image/jpeg' };
        })
      );
      setPdf(null);
      setImages((prev) => [...prev, ...processed.filter((img) => img.base64)].slice(0, MAX_EXPLAIN_PAGES));
    } catch (error) {
      console.warn('Belge görseli seçilemedi:', error?.message);
      showToast(t('errImagePickFailed'), { type: 'error' });
    } finally {
      setPicking(false);
    }
  };

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf'], copyToCacheDirectory: true });
      if (result?.canceled || !result?.assets?.length) return;
      setPicking(true);
      const file = result.assets[0];
      const base64 = await readOwnedFile(file.uri, { asBase64: true });
      setImages([]);
      setPdf({ name: file.name || 'PDF', base64, mimeType: 'application/pdf' });
    } catch (error) {
      console.warn('Belge PDF okunamadı:', error?.message);
      showToast(t('filePickError'), { type: 'error' });
    } finally {
      setPicking(false);
    }
  };

  const handleExplain = async () => {
    if (!hasInput) {
      showToast(t('docExplainEmpty'), { type: 'warning' });
      return;
    }
    if (!isPro && freeLeft <= 0) {
      onNeedPaywall?.();
      return;
    }
    setWorking(true);
    try {
      const explanation = await explainLegalDocument({
        text: pasted,
        images,
        pdf,
        country,
        lang: i18n.language,
      });
      const { entry: created, saved: list } = await saveExplain(explanation);
      setSaved(list);
      setEntry(created);
      if (!isPro) setFreeLeft(await recordExplainUse());
      setPasted('');
      setImages([]);
      setPdf(null);
      sheet.scrollRef.current?.scrollTo?.({ y: 0, animated: false });
    } catch (error) {
      showToast(describeError(t, error), { type: 'error', duration: 3200 });
    } finally {
      setWorking(false);
    }
  };

  const remind = useCallback(
    async (deadline, index) => {
      const result = await scheduleDeadlineReminders({
        entryId: entry?.id,
        index,
        deadline,
        title: entry?.explanation?.title || 'NexuLex AI',
      });
      if (result.scheduled > 0) showToast(t('docExplainRemindDone', { count: result.scheduled }), { type: 'success' });
      else showToast(t(result.unavailable ? 'docExplainRemindUnavailable' : 'docExplainRemindDenied'), { type: 'warning' });
    },
    [entry, showToast, t]
  );

  const shareText = () =>
    formatExplanationText(entry.explanation, t, { includeLocked: isPro, disclaimer: t('docExplainDisclaimer') });

  const handleShare = async () => {
    try {
      await Share.share({ message: shareText() });
    } catch {
      /* user cancelled */
    }
  };

  const handleAskAdvisor = () => {
    const prompt = `${t('docExplainAdvisorPrompt')}\n\n${formatExplanationText(entry.explanation, t, { includeLocked: isPro })}`;
    onAskAdvisor?.(prompt);
  };

  const sectionTitle = (key, icon) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, marginBottom: 6 }}>
      <Ionicons name={icon} size={15} color={ACCENT} />
      <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>{t(key)}</Text>
    </View>
  );

  const bodyText = [styles.sectionHint, { color: theme.text, fontSize: 13, lineHeight: 19, marginBottom: 0 }];
  const box = { borderWidth: 1, borderColor: theme.borderColor, borderRadius: 12, padding: 12, marginBottom: 8 };

  const renderInput = () => (
    <View>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('docExplainHint')}</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
        <TouchableOpacity accessibilityRole="button"
          style={[styles.secondaryBtn, { flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center' }, (picking || working) && styles.buttonDisabled]}
          onPress={pickPhotos}
          disabled={picking || working}
        >
          <Ionicons name="images-outline" size={16} color={ACCENT} />
          <Text style={styles.secondaryBtnText} numberOfLines={1}>
            {images.length ? t('docExplainPages', { count: images.length }) : t('docExplainPickPhotos')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button"
          style={[styles.secondaryBtn, { flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center' }, (picking || working) && styles.buttonDisabled]}
          onPress={pickPdf}
          disabled={picking || working}
        >
          <Ionicons name="document-outline" size={16} color={ACCENT} />
          <Text style={styles.secondaryBtnText} numberOfLines={1}>
            {pdf ? pdf.name : t('docExplainPickPdf')}
          </Text>
        </TouchableOpacity>
      </View>
      {images.length || pdf ? (
        <TouchableOpacity accessibilityRole="button"
          onPress={() => {
            setImages([]);
            setPdf(null);
          }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}
        >
          <Ionicons name="close-circle-outline" size={15} color={theme.subText} />
          <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>{t('docExplainClearFiles')}</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={[styles.label, { color: theme.subText }]}>{t('docExplainOrPaste')}</Text>
      <TextInput
        {...sheet.field('paste', { multiline: true })}
        style={[
          styles.chatInput,
          { flex: 0, minHeight: 110, textAlignVertical: 'top', backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor },
        ]}
        value={pasted}
        onChangeText={setPasted}
        placeholder={t('docExplainPastePlaceholder')}
        placeholderTextColor={theme.subText}
        multiline
        editable={!working}
      />
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
        <Ionicons name="lock-closed-outline" size={13} color={theme.subText} />
        <Text style={[styles.sectionHint, { color: theme.subText, flex: 1, marginBottom: 0 }]}>{t('docExplainPrivacy')}</Text>
      </View>
      {!isPro ? (
        <Text style={[styles.sectionHint, { color: freeLeft > 0 ? theme.subText : WARNING, marginTop: 6 }]}>
          {t('docExplainFreeLeft', { count: freeLeft, total: FREE_EXPLAINS_PER_MONTH })}
        </Text>
      ) : null}
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 8, marginBottom: 0 }]}>
        {t('ux9Free', { freeExplains: String(FREE_EXPLAINS_PER_MONTH) })}
      </Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux9Deadlines')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux9Pro')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux9Country')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux9Verify')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux9Device')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux9NoAdvice')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux9Disclaimer')}</Text>
      {saved.length ? (
        <>
          <Text style={[styles.label, { color: theme.subText, marginTop: 12 }]}>{t('docExplainRecent')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
            {saved.map((item) => (
              <TouchableOpacity accessibilityRole="button"
                key={item.id}
                onPress={() => setEntry(item)}
                style={{ ...box, marginBottom: 0, maxWidth: 200, minWidth: 140, backgroundColor: theme.cardBg }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name={DOC_TYPE_ICONS[item.explanation.docType] || 'document-outline'} size={15} color={ACCENT} />
                  <Text style={[styles.settingLabel, { color: theme.text, fontSize: 13, flex: 1 }]} numberOfLines={2}>
                    {item.explanation.title}
                  </Text>
                </View>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 4 }]}>
                  {formatDate(item.createdAt.slice(0, 10), i18n.language)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : null}
    </View>
  );

  const renderResult = () => {
    const exp = shown;
    const urgency = URGENCY_STYLE[exp.urgency] || URGENCY_STYLE.MEDIUM;
    return (
      <View>
        <View style={{ ...box, backgroundColor: theme.cardBg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name={DOC_TYPE_ICONS[exp.docType] || 'document-outline'} size={20} color={ACCENT} />
            <Text style={[styles.settingLabel, { color: theme.text, flex: 1 }]}>{exp.title}</Text>
          </View>
          {exp.issuer ? (
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>
              {t('docExplainIssuer')}: {exp.issuer}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Ionicons name={urgency.icon} size={15} color={urgency.color} />
            <Text style={[styles.label, { color: urgency.color, marginBottom: 0 }]}>{t(urgency.key)}</Text>
          </View>
        </View>

        {exp.confidence === 'LOW' ? (
          <View style={{ ...box, borderColor: WARNING, flexDirection: 'row', gap: 8 }}>
            <Ionicons name="eye-off-outline" size={16} color={WARNING} />
            <Text style={[bodyText, { flex: 1 }]}>{t('docExplainLowConfidence')}</Text>
          </View>
        ) : null}

        <Text style={bodyText}>{exp.summary}</Text>

        {exp.deadlines.length ? sectionTitle('docExplainDeadlines', 'alarm-outline') : null}
        {exp.deadlines.map((deadline, index) => {
          const left = deadline.date ? daysUntil(deadline.date) : null;
          const leftLabel =
            left === null
              ? ''
              : left > 0
                ? t('docExplainDaysLeft', { count: left })
                : left === 0
                  ? t('docExplainToday')
                  : t('docExplainOverdue');
          return (
            <View key={`${deadline.label}-${index}`} style={{ ...box, borderColor: left !== null && left <= 7 ? DANGER : theme.borderColor }}>
              <Text style={[styles.settingLabel, { color: theme.text, fontSize: 14 }]}>{deadline.label}</Text>
              {deadline.date ? (
                <Text style={[bodyText, { marginTop: 4 }]}>
                  {formatDate(deadline.date, i18n.language)}
                  {leftLabel ? ` · ${leftLabel}` : ''}
                </Text>
              ) : null}
              {deadline.rule ? <Text style={[bodyText, { marginTop: 4 }]}>{deadline.rule}</Text> : null}
              {deadline.fromService ? (
                <Text style={[styles.sectionHint, { color: WARNING, marginTop: 4, marginBottom: 0 }]}>{t('docExplainFromService')}</Text>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {deadline.date && left !== null && left >= 0 ? (
                  <TouchableOpacity accessibilityRole="button" onPress={() => remind(deadline, index)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="notifications-outline" size={15} color={ACCENT} />
                    <Text style={[styles.label, { color: ACCENT, marginBottom: 0 }]}>{t('docExplainRemind')}</Text>
                  </TouchableOpacity>
                ) : null}
                {!deadline.date && deadline.rule ? (
                  <TouchableOpacity accessibilityRole="button" onPress={() => onOpenCalculator?.('deadline_date')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="calculator-outline" size={15} color={ACCENT} />
                    <Text style={[styles.label, { color: ACCENT, marginBottom: 0 }]}>{t('docExplainCountDays')}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        })}
        {exp.deadlines.length ? (
          <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('docExplainVerifyDeadline')}</Text>
        ) : null}

        {exp.amounts.length ? sectionTitle('docExplainAmounts', 'cash-outline') : null}
        {exp.amounts.map((amount, index) => (
          <Text key={`${amount.label}-${index}`} style={[bodyText, { marginBottom: 4 }]}>
            {amount.label}: {amount.value}
          </Text>
        ))}

        {exp.respondTo ? sectionTitle('docExplainRespondTo', 'navigate-outline') : null}
        {exp.respondTo ? <Text style={bodyText}>{exp.respondTo}</Text> : null}

        {sectionTitle('docExplainSteps', 'footsteps-outline')}
        {exp.steps.map((step, index) => (
          <Text key={`step-${index}`} style={[bodyText, { marginBottom: 6 }]}>
            {index + 1}. {step}
          </Text>
        ))}

        {lockedCount > 0 ? (
          <LockedSection
            theme={theme}
            title={t('docExplainLockedTitle', { count: lockedCount })}
            subtitle={t('docExplainLockedBody')}
            ctaKey="docExplainUnlock"
            onUnlock={() => onNeedPaywall?.()}
          />
        ) : null}

        {exp.options.length ? sectionTitle('docExplainOptions', 'git-branch-outline') : null}
        {exp.options.map((option, index) => (
          <View key={`opt-${index}`} style={box}>
            <Text style={[styles.settingLabel, { color: theme.text, fontSize: 14 }]}>{option.title}</Text>
            {option.detail ? <Text style={[bodyText, { marginTop: 4 }]}>{option.detail}</Text> : null}
          </View>
        ))}

        {exp.documents.length ? sectionTitle('docExplainDocuments', 'folder-open-outline') : null}
        {exp.documents.map((doc, index) => (
          <Text key={`doc-${index}`} style={[bodyText, { marginBottom: 4 }]}>
            • {doc}
          </Text>
        ))}

        {exp.legalBasis ? sectionTitle('docExplainLegalBasis', 'library-outline') : null}
        {exp.legalBasis ? <Text style={bodyText}>{exp.legalBasis}</Text> : null}

        {exp.lawyerWhen ? sectionTitle('docExplainLawyerWhen', 'person-outline') : null}
        {exp.lawyerWhen ? <Text style={bodyText}>{exp.lawyerWhen}</Text> : null}

        {exp.unclear.length ? sectionTitle('docExplainUnclear', 'help-circle-outline') : null}
        {exp.unclear.map((item, index) => (
          <Text key={`unclear-${index}`} style={[bodyText, { marginBottom: 4 }]}>
            • {item}
          </Text>
        ))}

        {onAddToCase ? (
          <TouchableOpacity accessibilityRole="button"
            style={[styles.secondaryBtn, { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 16 }]}
            onPress={() => onAddToCase(entry.explanation)}
          >
            <Ionicons name="folder-open-outline" size={16} color={ACCENT} />
            <Text style={styles.secondaryBtnText}>{t('caseAddToCase')}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 16, flexWrap: 'nowrap' }}>
          <TouchableOpacity accessibilityRole="button" onPress={handleAskAdvisor} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="chatbubbles-outline" size={16} color={ACCENT} />
            <Text style={[styles.label, { color: ACCENT, marginBottom: 0 }]}>{t('docExplainAskAdvisor')}</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" onPress={handleShare} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="share-outline" size={16} color={ACCENT} />
            <Text style={[styles.label, { color: ACCENT, marginBottom: 0 }]}>{t('docExplainShare')}</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <ReportAiButton
            theme={theme}
            featureId="document_explain"
            targetId={entry.id}
            country={country}
            context={shareText()}
          />
        </View>

        <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 10, marginBottom: 0 }]}>{t('ux9Disclaimer')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 14 }]}>{t('docExplainDisclaimer')}</Text>
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
            <Ionicons name="document-attach-outline" size={20} color={ACCENT} />
            <Text style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]} numberOfLines={2}>
              {t('docExplainTitle')}
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
            {working ? (
              <View style={{ alignItems: 'center', paddingVertical: 32, gap: 12 }}>
                <ActivityIndicator color={ACCENT} />
                <Text style={[styles.sectionHint, { color: theme.subText, textAlign: 'center' }]}>{t('docExplainWorking')}</Text>
              </View>
            ) : entry && shown ? (
              renderResult()
            ) : (
              renderInput()
            )}
          </KeyboardSafeSheet>

          {entry && !working ? (
            <TouchableOpacity accessibilityRole="button" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={() => setEntry(null)}>
              <Text style={styles.secondaryBtnText}>{t('docExplainNew')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity accessibilityRole="button"
              style={[styles.primaryButton, { marginTop: 8 }, (working || picking || !hasInput) && styles.buttonDisabled]}
              onPress={handleExplain}
              disabled={working || picking}
            >
              <Text style={styles.primaryButtonText}>
                {!isPro && freeLeft <= 0 ? t('docExplainUnlock') : t('docExplainCta')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
