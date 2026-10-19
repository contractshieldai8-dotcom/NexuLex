import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';

import { ACCENT, DANGER, alignStart, styles } from '../theme';
import {
  DRAFT_FREE_PREVIEW_LINES,
  getDraftTemplateById,
  listDraftCatalogFor,
  resolveDraftVariant,
} from '../constants/draftTemplates';
import { resolveJurisdiction } from '../constants/jurisdiction';
import {
  applyImprovedWording,
  buildDraft,
  buildDraftPreview,
  buildImproveWordingPrompt,
  draftDocxFilename,
  formatDraftForSharing,
} from '../services/guidedDraft';
import { askLegalAdvisor } from '../services/ai';
import { shareShieldDocx } from '../utils/redlineExport';
import { describeError } from '../utils/errors';
import { useFeedback } from '../context/FeedbackContext';
import { ReportAiButton } from './AiReportSheet';
import KeyboardSafeSheet, { useKeyboardSafeSheet } from './KeyboardSafeSheet';
import { isPlausibleDmyDate, maskDmyDateInput } from '../utils/dateInput';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.92);

function keyboardFor(type) {
  if (type === 'number' || type === 'date') return Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default';
  return 'default';
}

export default function DraftWizardModal({
  visible,
  theme,
  templateId: presetTemplateId = null,
  country = 'auto',
  isPro = false,
  answersById = {},
  onChangeAnswers,
  onClearAnswers,
  openAtPreview = false,
  onNeedPaywall,
  onClose,
}) {
  const { t, i18n } = useTranslation();
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX });
  const { showToast } = useFeedback();
  const language = i18n.language;
  const draftCtx = useMemo(() => ({ country, language }), [country, language]);
  const jurisdiction = resolveJurisdiction(country, language);
  const offered = useMemo(() => listDraftCatalogFor(draftCtx), [draftCtx]);

  const [templateId, setTemplateId] = useState(presetTemplateId);
  const [draft, setDraft] = useState(null);
  const [originalDraft, setOriginalDraft] = useState(null);
  const [improving, setImproving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const answers = (templateId && answersById[templateId]) || {};
  const setAnswers = (updater) => {
    if (!templateId) return;
    const next = typeof updater === 'function' ? updater(answers) : updater;
    onChangeAnswers?.(templateId, next);
  };

  useEffect(() => {
    if (visible) {
      setTemplateId(presetTemplateId);
      if (openAtPreview && presetTemplateId) {
        const built = buildDraft(presetTemplateId, answersById[presetTemplateId] || {}, draftCtx);
        setDraft(built);
        setOriginalDraft(built);
      }
    } else {
      setTemplateId(null);
      setDraft(null);
      setOriginalDraft(null);
      setImproving(false);
      setExporting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, presetTemplateId, openAtPreview]);

  const template = useMemo(() => getDraftTemplateById(templateId), [templateId]);
  const variant = useMemo(() => resolveDraftVariant(template, jurisdiction), [template, jurisdiction]);

  // Country / language switched while open: rebuild or fall back to the picker if no longer offered.
  useEffect(() => {
    if (!templateId) return;
    if (!variant) {
      setTemplateId(null);
      setDraft(null);
      setOriginalDraft(null);
      return;
    }
    setDraft((prev) => {
      if (!prev) return prev;
      const rebuilt = buildDraft(templateId, answersById[templateId] || {}, draftCtx);
      setOriginalDraft(rebuilt);
      return rebuilt;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftCtx, variant]);

  const preview = useMemo(() => (draft ? buildDraftPreview(draft) : null), [draft]);
  const missingRequiredLabels = useMemo(
    () => (draft?.missing || []).filter((m) => m.required).map((m) => m.label),
    [draft]
  );

  const handleGenerate = () => {
    if (!template) return;
    const built = buildDraft(template.id, answers, draftCtx);
    setDraft(built);
    setOriginalDraft(built);
  };

  const handleReset = () => {
    if (!templateId) return;
    onClearAnswers?.(templateId);
    setDraft(null);
    setOriginalDraft(null);
  };

  const requirePro = () => {
    if (isPro) return true;
    onNeedPaywall?.(templateId);
    return false;
  };

  const handleCopy = async () => {
    if (!draft || !requirePro()) return;
    await Clipboard.setStringAsync(formatDraftForSharing(draft, 'plain'));
    showToast(t('copiedToClipboard'), { type: 'success', duration: 1400 });
  };

  const handleShare = async () => {
    if (!draft || !requirePro()) return;
    try {
      const out = await Share.share({ message: formatDraftForSharing(draft, 'whatsapp') });
      if (out?.action === Share.sharedAction) onClearAnswers?.(draft.templateId);
    } catch (_error) {
      showToast(t('shareUnavailable'), { type: 'warning' });
    }
  };

  const handleDocx = async () => {
    if (!draft || !requirePro() || exporting) return;
    setExporting(true);
    try {
      const out = await shareShieldDocx(formatDraftForSharing(draft, 'plain'), {
        filename: draftDocxFilename(draft),
      });
      if (!out?.uri) showToast(t('shareUnavailable'), { type: 'warning' });
      else onClearAnswers?.(draft.templateId);
    } catch (error) {
      showToast(describeError(t, error), { type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handleImprove = async () => {
    if (!draft || !requirePro() || improving) return;
    setImproving(true);
    try {
      const improvedText = await askLegalAdvisor({
        question: buildImproveWordingPrompt(draft, i18n.language),
        country,
        lang: i18n.language,
        task: 'draft_polish',
      });
      const result = applyImprovedWording(draft, improvedText);
      if (result.ok) {
        setDraft(result.draft);
        showToast(t('draftImproveApplied'), { type: 'success', duration: 1600 });
      } else {
        showToast(t('draftImproveRejected'), { type: 'warning', duration: 2600 });
      }
    } catch (error) {
      showToast(describeError(t, error), { type: 'error' });
    } finally {
      setImproving(false);
    }
  };

  const goBack = () => {
    if (draft) {
      setDraft(null);
      setOriginalDraft(null);
      return;
    }
    if (template && !presetTemplateId) {
      setTemplateId(null);
      return;
    }
    onClose?.();
  };

  const headerTitle = variant ? t(variant.titleKey) : t('draftSectionTitle');
  const headerIcon = template?.icon || 'document-text-outline';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* BL.3: backdrop Pressable is sibling of sheet — not a wrapping parent. */}
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('draftClose')}
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
            <Ionicons name={headerIcon} size={20} color={theme.accent} />
            <Text
              style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]}
              numberOfLines={2}
            >
              {headerTitle}
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
            {variant?.generic ? (
              <View
                style={[
                  styles.previewBanner,
                  { backgroundColor: theme.cardBg, borderColor: theme.accent, marginBottom: 12 },
                ]}
              >
                <Ionicons name="globe-outline" size={16} color={theme.accent} />
                <Text style={[styles.previewBannerText, { color: theme.text }]}>
                  {t(variant.universal ? 'draftUniversalBanner' : 'draftGenericBanner')}
                </Text>
              </View>
            ) : null}
            {!template || !variant ? (
              <>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 12 }]}>
                  {t('draftSectionHint')}
                </Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 0, marginBottom: 0 }]}>
                  {t('ux13Preview', { previewLines: String(DRAFT_FREE_PREVIEW_LINES) })}
                </Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux13Blank')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>
                  {t('ux13Country', { country: jurisdiction })}
                </Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux13NoAdvice')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux13Send')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux13Device')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux13NoWin')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 12 }]}>{t('ux13Disclaimer')}</Text>
                {offered.map(({ template: item, variant: itemVariant }) => (
                  <TouchableOpacity accessibilityRole="button"
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => setTemplateId(item.id)}
                    style={[
                      styles.secondaryBtn,
                      { marginTop: 8, alignItems: 'flex-start', paddingHorizontal: 14 },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name={item.icon} size={16} color={theme.accent} />
                      <Text style={[styles.secondaryBtnText, { textAlign: alignStart, flexShrink: 1 }]}>
                        {t(itemVariant.titleKey)}
                      </Text>
                      {itemVariant.universal ? (
                        <Ionicons name="globe-outline" size={12} color={theme.subText} accessibilityLabel={t('availUniversal')} />
                      ) : null}
                    </View>
                    <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 4 }]}>
                      {t(itemVariant.descriptionKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : !draft ? (
              <>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 12 }]}>
                  {t(variant.descriptionKey)}
                </Text>
                {template.questions.map((q) => {
                  const value = answers[q.id] || '';
                  const badDate = q.type === 'date' && !isPlausibleDmyDate(value);
                  if (q.type === 'choice') {
                    return (
                      <View key={q.id} style={{ marginBottom: 12 }}>
                        <Text style={[styles.label, { color: theme.subText }]}>
                          {t(q.labelKey)}
                          {q.required ? ' *' : ''}
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {(q.options || []).map((opt) => {
                            const active = value === opt.id;
                            return (
                              <TouchableOpacity
                                key={opt.id}
                                onPress={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                                accessibilityRole="button"
                                accessibilityState={{ selected: active }}
                                style={[
                                  styles.offerTierChip,
                                  {
                                    borderColor: active ? theme.accent : theme.borderColor,
                                    backgroundColor: active ? `${ACCENT}22` : theme.cardBg,
                                  },
                                ]}
                              >
                                <Text style={[styles.offerTierChipText, { color: active ? theme.accent : theme.subText }]}>
                                  {t(opt.labelKey)}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  }
                  return (
                    <View key={q.id} style={{ marginBottom: 12 }}>
                      <Text style={[styles.label, { color: theme.subText }]}>
                        {t(q.labelKey)}
                        {q.required ? ' *' : ''}
                      </Text>
                      <TextInput
                        {...sheet.field(q.id, { multiline: q.type === 'multiline' })}
                        style={[
                          styles.chatInput,
                          {
                            backgroundColor: theme.inputBg,
                            color: theme.text,
                            borderColor: badDate ? theme.danger : theme.borderColor,
                            minHeight: q.type === 'multiline' ? 80 : 44,
                            textAlignVertical: q.type === 'multiline' ? 'top' : 'center',
                          },
                        ]}
                        value={value}
                        onChangeText={(next) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [q.id]: q.type === 'date' ? maskDmyDateInput(next) : next,
                          }))
                        }
                        placeholder={q.type === 'date' ? t('draftDatePlaceholder') : ''}
                        placeholderTextColor={theme.subText}
                        keyboardType={keyboardFor(q.type)}
                        multiline={q.type === 'multiline'}
                      />
                      {badDate ? (
                        <Text style={[styles.sectionHint, { color: theme.danger, marginTop: 4, marginBottom: 0 }]}>
                          {t('draftInvalidDate', { format: t('draftDatePlaceholder') })}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 12 }]}>
                  {t('draftBlankHint')}
                </Text>
                <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={handleGenerate}>
                  <Text style={styles.primaryButtonText}>{t('draftGenerate')}</Text>
                </TouchableOpacity>
                {Object.keys(answers).length ? (
                  <TouchableOpacity accessibilityRole="button" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={handleReset}>
                    <Text style={styles.secondaryBtnText}>{t('draftResetAnswers')}</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : (
              <>
                {missingRequiredLabels.length ? (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: theme.danger,
                      backgroundColor: 'rgba(229, 72, 77, 0.08)',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 12,
                    }}
                  >
                    <Text style={[styles.sectionHint, { color: theme.text, marginBottom: 0 }]}>
                      {t('draftMissingWarning')} {missingRequiredLabels.join(', ')}
                    </Text>
                  </View>
                ) : null}

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: theme.borderColor,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  {draft.improved ? (
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 6 }}>
                      <ReportAiButton
                        theme={theme}
                        featureId="draft_polish"
                        targetId={draft.templateId}
                        country={country}
                        context={draft.body}
                        showLabel
                      />
                    </View>
                  ) : null}
                  <Text selectable style={[styles.bubbleText, { color: theme.text }]}>
                    {isPro ? formatDraftForSharing(draft, 'plain') : preview?.text}
                  </Text>
                </View>

                {!isPro ? (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: theme.accent,
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 4 }]}>
                      🔒 {t('draftProLockTitle')}
                    </Text>
                    <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>
                      {t('draftProLockBody')}
                    </Text>
                    <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={() => onNeedPaywall?.(templateId)}>
                      <Text style={styles.primaryButtonText}>{t('draftUnlockCta')}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <TouchableOpacity accessibilityRole="button"
                  style={[styles.primaryButton, exporting && styles.buttonDisabled]}
                  onPress={handleDocx}
                  disabled={exporting}
                >
                  {exporting ? (
                    <ActivityIndicator color="#080C14" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {isPro ? '' : '🔒 '}
                      {t('draftExportDocx')}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" style={styles.secondaryBtn} onPress={handleCopy}>
                  <Text style={styles.secondaryBtnText}>
                    {isPro ? '' : '🔒 '}
                    {t('draftCopy')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={handleShare}>
                  <Text style={styles.secondaryBtnText}>
                    {isPro ? '' : '🔒 '}
                    {t('draftShare')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button"
                  style={[styles.secondaryBtn, { marginTop: 8 }, improving && styles.buttonDisabled]}
                  onPress={handleImprove}
                  disabled={improving}
                >
                  {improving ? (
                    <ActivityIndicator color={theme.accent} size="small" />
                  ) : (
                    <Text style={styles.secondaryBtnText}>
                      {isPro ? '' : '🔒 '}
                      {t('draftImprove')}
                    </Text>
                  )}
                </TouchableOpacity>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6, marginBottom: 0 }]}>
                  {t('draftImproveHint')}
                </Text>
                {draft.improved && originalDraft ? (
                  <TouchableOpacity accessibilityRole="button"
                    style={[styles.secondaryBtn, { marginTop: 8 }]}
                    onPress={() => setDraft(originalDraft)}
                  >
                    <Text style={styles.secondaryBtnText}>{t('draftRevert')}</Text>
                  </TouchableOpacity>
                ) : null}
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 12, marginBottom: 0 }]}>
                  {t('ux13Disclaimer')}
                </Text>
              </>
            )}
          </KeyboardSafeSheet>

          <TouchableOpacity accessibilityRole="button" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={goBack}>
            <Text style={styles.secondaryBtnText}>
              {draft || (template && !presetTemplateId) ? t('draftBack') : t('draftClose')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
