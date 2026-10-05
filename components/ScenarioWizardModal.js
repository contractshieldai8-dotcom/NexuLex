import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';

import { ACCENT, DANGER, alignStart, styles } from '../theme';
import { LEGAL_SCENARIOS, getScenarioById } from '../constants/legalScenarios';
import { draftForScenario } from '../constants/draftTemplates';
import { resolveJurisdiction } from '../constants/jurisdiction';
import {
  buildAdvisorFollowUpPrompt,
  buildRoadmap,
  formatRoadmapForSharing,
} from '../services/scenarioRoadmap';
import { useFeedback } from '../context/FeedbackContext';
import KeyboardSafeSheet, { useKeyboardSafeSheet } from './KeyboardSafeSheet';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.9);

export default function ScenarioWizardModal({
  visible,
  theme,
  scenarioId,
  country = 'auto',
  onClose,
  onAskAdvisor,
  onOpenDraft,
}) {
  const { t, i18n } = useTranslation();
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX });
  const { showToast } = useFeedback();
  const scenario = useMemo(() => getScenarioById(scenarioId), [scenarioId]);

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [roadmap, setRoadmap] = useState(null);

  useEffect(() => {
    if (!visible) {
      setStepIndex(0);
      setAnswers({});
      setRoadmap(null);
    }
  }, [visible, scenarioId]);

  const questions = scenario?.questions || [];
  const currentQ = questions[stepIndex] || null;
  const isResult = !!roadmap;
  const jurisdiction = resolveJurisdiction(country, i18n.language);
  const draftTemplateId = roadmap
    ? draftForScenario(roadmap.scenarioId, roadmap.templateId, jurisdiction)
    : null;

  useEffect(() => {
    setRoadmap((prev) =>
      prev ? buildRoadmap(prev.scenarioId, prev.answers, { country, language: i18n.language }) : prev
    );
  }, [country, i18n.language]);

  const pickOption = (value) => {
    if (!currentQ) return;
    const nextAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(nextAnswers);
    if (stepIndex < questions.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    // Instant local generation — no network.
    const built = buildRoadmap(scenario.id, nextAnswers, { country, language: i18n.language });
    setRoadmap(built);
  };

  const handleCopy = async () => {
    if (!roadmap) return;
    const text = formatRoadmapForSharing(roadmap, 'plain');
    await Clipboard.setStringAsync(text);
    showToast(t('copiedToClipboard'), { type: 'success', duration: 1400 });
  };

  const handleShare = async () => {
    if (!roadmap) return;
    const message = formatRoadmapForSharing(roadmap, 'whatsapp');
    try {
      await Share.share({ message });
    } catch (_error) {
      showToast(t('shareUnavailable'), { type: 'warning' });
    }
  };

  const handleAskAdvisor = () => {
    if (!roadmap) return;
    const prompt = buildAdvisorFollowUpPrompt(roadmap, i18n.language);
    onAskAdvisor?.(prompt, roadmap);
    onClose?.();
  };

  const goBack = () => {
    if (isResult) {
      setRoadmap(null);
      setStepIndex(Math.max(0, questions.length - 1));
      return;
    }
    if (stepIndex > 0) setStepIndex((i) => i - 1);
    else onClose?.();
  };

  if (!scenario) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* BL.3: backdrop Pressable is sibling of sheet — not a wrapping parent. */}
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('scenarioClose')}
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
            <Ionicons name={scenario.icon || 'map-outline'} size={20} color={ACCENT} />
            <Text style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]} numberOfLines={2}>
              {t(scenario.titleKey)}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel={t('closeButton')}>
              <Ionicons name="close" size={22} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <KeyboardSafeSheet
            controller={sheet}
            style={{ maxHeight: Math.round(WIN_H * 0.68) }}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {!isResult ? (
              <>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 12 }]}>
                  {t(scenario.descriptionKey)}
                </Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 0, marginBottom: 0 }]}>{t('ux16Local')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>
                  {t('ux16Country', { country: jurisdiction || country })}
                </Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>
                  {t('ux16Count', { scenarios: String(LEGAL_SCENARIOS.length) })}
                </Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux16NoWin')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux16NoAdvice')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux16Device')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux16Guides')}</Text>
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 12 }]}>{t('ux16Disclaimer')}</Text>
                <Text style={[styles.label, { color: theme.subText }]}>
                  {stepIndex + 1}/{questions.length}
                </Text>
                {currentQ ? (
                  <>
                    <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 12 }]}>
                      {t(currentQ.labelKey)}
                    </Text>
                    {(currentQ.options || []).map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        activeOpacity={0.85}
                        onPress={() => pickOption(opt.value)}
                        style={[
                          styles.secondaryBtn,
                          {
                            marginTop: 8,
                            borderColor:
                              answers[currentQ.id] === opt.value ? ACCENT : theme.borderColor,
                            alignItems: 'flex-start',
                            paddingHorizontal: 14,
                          },
                        ]}
                      >
                        <Text style={[styles.secondaryBtnText, { textAlign: alignStart }]}>
                          {t(opt.labelKey)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </>
                ) : null}
              </>
            ) : (
              <>
                {roadmap.generic ? (
                  <View
                    style={[
                      styles.previewBanner,
                      { backgroundColor: theme.cardBg, borderColor: ACCENT, marginBottom: 12 },
                    ]}
                  >
                    <Ionicons name="globe-outline" size={16} color={ACCENT} />
                    <Text style={[styles.previewBannerText, { color: theme.text }]}>
                      {roadmap.banner || t('scenarioGenericBanner')}
                    </Text>
                  </View>
                ) : null}
                <Text style={[styles.sectionHeader, { color: theme.text }]}>
                  {t('scenarioTimelineTitle')}
                </Text>
                {(roadmap.steps || []).map((item) => (
                  <View
                    key={`step-${item.stepNumber}`}
                    style={{
                      borderLeftWidth: 2,
                      borderLeftColor: ACCENT,
                      paddingLeft: 12,
                      marginBottom: 14,
                    }}
                  >
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      {item.stepNumber}. {item.title}
                    </Text>
                    <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 4 }]}>
                      {item.detail}
                    </Text>
                    {item.timeHint ? (
                      <View
                        style={{
                          alignSelf: 'flex-start',
                          borderWidth: 1,
                          borderColor: ACCENT,
                          borderRadius: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ color: ACCENT, fontSize: 11, fontWeight: '600' }}>
                          {item.timeHint}
                        </Text>
                      </View>
                    ) : null}
                    {item.docHint ? (
                      <Text style={[styles.sectionHint, { color: theme.subText }]}>
                        📎 {t('scenarioDocsChecklist')}: {item.docHint}
                      </Text>
                    ) : null}
                  </View>
                ))}

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: DANGER,
                    backgroundColor: 'rgba(255,59,92,0.08)',
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <Text style={[styles.settingLabel, { color: DANGER, marginBottom: 6 }]}>
                    {t('scenarioLawyerTitle')}
                  </Text>
                  <Text style={[styles.sectionHint, { color: theme.text, marginBottom: 0 }]}>
                    {roadmap.lawyerThreshold}
                  </Text>
                </View>

                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux16Disclaimer')}</Text>
                <Text style={[styles.chatDisclaimer, { color: theme.subText, marginBottom: 12 }]}>
                  {roadmap.disclaimer}
                </Text>

                <TouchableOpacity style={styles.primaryButton} onPress={handleCopy}>
                  <Text style={styles.primaryButtonText}>{t('scenarioCopyRoadmap')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare}>
                  <Text style={styles.secondaryBtnText}>{t('scenarioShareWhatsApp')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={handleAskAdvisor}>
                  <Text style={styles.secondaryBtnText}>{t('scenarioAskAdvisor')}</Text>
                </TouchableOpacity>
                {draftTemplateId && onOpenDraft ? (
                  <TouchableOpacity
                    style={[styles.secondaryBtn, { marginTop: 8, borderColor: ACCENT }]}
                    onPress={() => onOpenDraft(draftTemplateId)}
                  >
                    <Text style={styles.secondaryBtnText}>📝 {t('draftFromRoadmapCta')}</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          </KeyboardSafeSheet>

          <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={goBack}>
            <Text style={styles.secondaryBtnText}>
              {isResult || stepIndex > 0 ? t('scenarioBack') : t('scenarioClose')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
