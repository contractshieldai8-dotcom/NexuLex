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

import { alignStart, styles } from '../theme';
import {
  CONTRACT_FIELDS,
  CONTRACT_FREE_PREVIEW_BLOCKS,
  CONTRACT_LIBRARY,
  getContractTemplateById,
} from '../constants/contractTemplates';
import { loadContractSource } from '../constants/contractLibrary/loaders';
import {
  buildContractDocument,
  buildContractPreview,
  contractDocxFilename,
  formatContractForSharing,
} from '../services/contractLibrary';
import { shareShieldDocx } from '../utils/redlineExport';
import { describeError } from '../utils/errors';
import { useFeedback } from '../context/FeedbackContext';
import KeyboardSafeSheet, { useKeyboardSafeSheet } from './KeyboardSafeSheet';
import { isPlausibleDmyDate, maskDmyDateInput } from '../utils/dateInput';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.92);

function keyboardFor(type) {
  if (type === 'number' || type === 'date') return Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default';
  if (type === 'email') return 'email-address';
  return 'default';
}

/** The contract body is the binding English original; the text engine lays English runs out left-to-right by itself. */
function ContractBlock({ block, theme }) {
  const base = { color: theme.text, textAlign: alignStart };
  if (block.type === 'rule') {
    return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.borderColor, marginVertical: 10 }} />;
  }
  if (block.type === 'title') {
    return (
      <Text selectable style={[styles.bubbleText, base, { fontWeight: '800', fontSize: 16, marginBottom: 6 }]}>
        {block.text.toUpperCase()}
      </Text>
    );
  }
  if (block.type === 'heading') {
    return (
      <Text selectable style={[styles.bubbleText, base, { fontWeight: '700', marginTop: 8, marginBottom: 2 }]}>
        {block.text}
      </Text>
    );
  }
  if (block.type === 'clause' || block.type === 'sub' || block.type === 'bullet') {
    const indent = block.type === 'clause' ? 0 : block.type === 'sub' ? 18 : 12;
    return (
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, paddingStart: indent }}>
        <Text style={[styles.bubbleText, base, { fontWeight: block.type === 'clause' ? '700' : '500' }]}>
          {block.marker}
        </Text>
        <Text selectable style={[styles.bubbleText, base, { flex: 1 }]}>
          {block.text}
        </Text>
      </View>
    );
  }
  return (
    <Text selectable style={[styles.bubbleText, base, { marginTop: 6 }]}>
      {block.text}
    </Text>
  );
}

export default function ContractLibrarySheet({
  visible,
  theme,
  templateId: presetTemplateId = null,
  isPro = false,
  answersById = {},
  onChangeAnswers,
  onClearAnswers,
  openAtPreview = false,
  onNeedPaywall,
  onClose,
}) {
  const { t } = useTranslation();
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX });
  const { showToast } = useFeedback();

  const [templateId, setTemplateId] = useState(presetTemplateId);
  const [doc, setDoc] = useState(null);
  const [exporting, setExporting] = useState(false);

  const template = useMemo(() => getContractTemplateById(templateId), [templateId]);
  const answers = (templateId && answersById[templateId]) || {};

  const setAnswer = (id, value) => {
    if (!templateId) return;
    onChangeAnswers?.(templateId, { ...answers, [id]: value });
  };

  const generate = (id, source) => {
    const built = buildContractDocument(id, source || {}, loadContractSource(id));
    setDoc(built);
    return built;
  };

  useEffect(() => {
    if (visible) {
      setTemplateId(presetTemplateId);
      if (openAtPreview && presetTemplateId) setDoc(buildContractDocument(presetTemplateId, answersById[presetTemplateId] || {}, loadContractSource(presetTemplateId)));
    } else {
      setTemplateId(null);
      setDoc(null);
      setExporting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, presetTemplateId, openAtPreview]);

  const preview = useMemo(() => (doc && !isPro ? buildContractPreview(doc, CONTRACT_FREE_PREVIEW_BLOCKS) : null), [doc, isPro]);
  const shownBlocks = doc ? (isPro ? doc.blocks : preview?.blocks || []) : [];
  const missingRequired = useMemo(
    () => (doc?.missingRequired || []).map((id) => t(`clField_${id}`)),
    [doc, t]
  );

  const requirePro = () => {
    if (isPro) return true;
    onNeedPaywall?.(templateId);
    return false;
  };

  const handleCopy = async () => {
    if (!doc || !requirePro()) return;
    await Clipboard.setStringAsync(formatContractForSharing(doc));
    showToast(t('copiedToClipboard'), { type: 'success', duration: 1400 });
  };

  const handleShare = async () => {
    if (!doc || !requirePro()) return;
    try {
      await Share.share({ message: formatContractForSharing(doc) });
    } catch (_error) {
      showToast(t('shareUnavailable'), { type: 'warning' });
    }
  };

  const handleDocx = async () => {
    if (!doc || !requirePro() || exporting) return;
    setExporting(true);
    try {
      const out = await shareShieldDocx(formatContractForSharing(doc), { filename: contractDocxFilename(doc) });
      if (!out?.uri) showToast(t('shareUnavailable'), { type: 'warning' });
    } catch (error) {
      showToast(describeError(t, error), { type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const goBack = () => {
    if (doc) {
      setDoc(null);
      return;
    }
    if (template && !presetTemplateId) {
      setTemplateId(null);
      return;
    }
    onClose?.();
  };

  const headerTitle = template ? t(template.titleKey) : t('clSectionTitle');
  const headerIcon = template?.icon || 'documents-outline';
  const hint = (extra) => [styles.sectionHint, { color: theme.subText, marginBottom: 12 }, extra];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* Backdrop is a sibling of the sheet, never its parent (BL.3). */}
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('draftClose')}
        />
        <View
          style={[
            styles.modalSheet,
            { backgroundColor: theme.cardBg, borderColor: theme.borderColor },
            sheet.sheetStyle,
          ]}
        >
          <View style={styles.modalHandle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Ionicons name={headerIcon} size={20} color={theme.accent} />
            <Text style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]} numberOfLines={2}>
              {headerTitle}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 13, bottom: 13, left: 13, right: 13 }}
              accessibilityRole="button"
              accessibilityLabel={t('closeButton')}
            >
              <Ionicons name="close" size={22} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <KeyboardSafeSheet
            controller={sheet}
            style={{ maxHeight: Math.round(WIN_H * 0.7) }}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {!template ? (
              <>
                <Text style={hint()}>{t('clSectionHint')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Ionicons name="language-outline" size={14} color={theme.accent} />
                  <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, flex: 1 }]}>
                    {t('clEnglishBadge')}
                  </Text>
                </View>
                <Text style={hint({ marginTop: 0 })}>{t('clFreeNote', { blocks: String(CONTRACT_FREE_PREVIEW_BLOCKS) })}</Text>
                {CONTRACT_LIBRARY.map((item) => (
                  <TouchableOpacity
                    accessibilityRole="button"
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => setTemplateId(item.id)}
                    style={[styles.secondaryBtn, { marginTop: 8, alignItems: 'flex-start', paddingHorizontal: 14 }]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name={item.icon} size={16} color={theme.accent} />
                      <Text style={[styles.secondaryBtnText, { textAlign: alignStart, flexShrink: 1 }]}>
                        {t(item.titleKey)}
                      </Text>
                    </View>
                    <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 4 }]}>
                      {t(item.descriptionKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 12, marginBottom: 0 }]}>
                  {t('clReviewNote')}
                </Text>
              </>
            ) : !doc ? (
              <>
                <Text style={hint()}>{t(template.descriptionKey)}</Text>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: theme.accent,
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 12,
                    flexDirection: 'row',
                    gap: 8,
                  }}
                >
                  <Ionicons name="information-circle-outline" size={16} color={theme.accentAlt} />
                  <Text style={[styles.sectionHint, { color: theme.text, marginBottom: 0, flex: 1 }]}>
                    {t(template.assumptionKey)}
                  </Text>
                </View>
                {template.fields.map((id) => {
                  const def = CONTRACT_FIELDS[id] || { type: 'text' };
                  const value = answers[id] || '';
                  const required = (template.required || []).includes(id);
                  const badDate = def.type === 'date' && value.length > 0 && !isPlausibleDmyDate(value);
                  const multiline = def.type === 'multiline';
                  return (
                    <View key={id} style={{ marginBottom: 12 }}>
                      <Text style={[styles.label, { color: theme.subText }]}>
                        {t(`clField_${id}`)}
                        {required ? ' *' : ''}
                      </Text>
                      <TextInput
                        {...sheet.field(id, { multiline })}
                        style={[
                          styles.chatInput,
                          {
                            backgroundColor: theme.inputBg,
                            color: theme.text,
                            borderColor: badDate ? theme.danger : theme.borderColor,
                            minHeight: multiline ? 80 : 44,
                            textAlignVertical: multiline ? 'top' : 'center',
                          },
                        ]}
                        value={value}
                        onChangeText={(next) => setAnswer(id, def.type === 'date' ? maskDmyDateInput(next) : next)}
                        placeholder={def.type === 'date' ? t('draftDatePlaceholder') : ''}
                        placeholderTextColor={theme.subText}
                        keyboardType={keyboardFor(def.type)}
                        autoCapitalize={def.type === 'email' ? 'none' : 'sentences'}
                        autoCorrect={def.type !== 'email'}
                        multiline={multiline}
                      />
                      {badDate ? (
                        <Text style={[styles.sectionHint, { color: theme.danger, marginTop: 4, marginBottom: 0 }]}>
                          {t('draftInvalidDate', { format: t('draftDatePlaceholder') })}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
                <Text style={hint()}>{t('clFillHint')}</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.primaryButton}
                  onPress={() => generate(template.id, answers)}
                >
                  <Text style={styles.primaryButtonText}>{t('clGenerate')}</Text>
                </TouchableOpacity>
                {Object.keys(answers).length ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    style={[styles.secondaryBtn, { marginTop: 8 }]}
                    onPress={() => onClearAnswers?.(template.id)}
                  >
                    <Text style={styles.secondaryBtnText}>{t('draftResetAnswers')}</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : (
              <>
                {missingRequired.length ? (
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
                      {t('draftMissingWarning')} {missingRequired.join(', ')}
                    </Text>
                  </View>
                ) : null}

                <View style={{ borderWidth: 1, borderColor: theme.borderColor, borderRadius: 10, padding: 12, marginBottom: 12 }}>
                  {shownBlocks.map((block, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <ContractBlock key={`${index}-${block.type}`} block={block} theme={theme} />
                  ))}
                  {isPro && doc.attribution ? (
                    <Text selectable style={[styles.sectionHint, { color: theme.subText, marginTop: 12, marginBottom: 0, textAlign: alignStart }]}>
                      {doc.attribution}
                    </Text>
                  ) : null}
                </View>

                {!isPro ? (
                  <View style={{ borderWidth: 1, borderColor: theme.accent, borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Ionicons name="lock-closed-outline" size={15} color={theme.accent} />
                      <Text style={[styles.settingLabel, { color: theme.text, flexShrink: 1 }]}>
                        {t('clLockedMore', { count: String(preview?.hiddenCount || 0) })}
                      </Text>
                    </View>
                    <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('clProLockBody')}</Text>
                    <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={() => onNeedPaywall?.(templateId)}>
                      <Text style={styles.primaryButtonText}>{t('draftUnlockCta')}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <TouchableOpacity
                  accessibilityRole="button"
                  style={[styles.primaryButton, exporting && styles.buttonDisabled]}
                  onPress={handleDocx}
                  disabled={exporting}
                >
                  {exporting ? (
                    <ActivityIndicator color="#080C14" size="small" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      {isPro ? null : <Ionicons name="lock-closed" size={14} color="#080C14" />}
                      <Text style={styles.primaryButtonText}>{t('draftExportDocx')}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" style={styles.secondaryBtn} onPress={handleCopy}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {isPro ? null : <Ionicons name="lock-closed-outline" size={14} color={theme.accent} />}
                    <Text style={styles.secondaryBtnText}>{t('draftCopy')}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={handleShare}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {isPro ? null : <Ionicons name="lock-closed-outline" size={14} color={theme.accent} />}
                    <Text style={styles.secondaryBtnText}>{t('draftShare')}</Text>
                  </View>
                </TouchableOpacity>

                <View
                  style={{ borderWidth: 1, borderColor: theme.borderColor, borderRadius: 10, padding: 12, marginTop: 12 }}
                >
                  <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 6 }]}>{t('clCheckTitle')}</Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t(template.assumptionKey)}</Text>
                  {doc.nexulexAddedParts ? (
                    <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('clAddedParts')}</Text>
                  ) : null}
                  <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('clSourceLine')}</Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>{t('clReviewNote')}</Text>
                </View>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 12, marginBottom: 0 }]}>
                  {t('ux13Disclaimer')}
                </Text>
              </>
            )}
          </KeyboardSafeSheet>

          <TouchableOpacity accessibilityRole="button" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={goBack}>
            <Text style={styles.secondaryBtnText}>
              {doc || (template && !presetTemplateId) ? t('draftBack') : t('draftClose')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
