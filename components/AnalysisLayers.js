import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';

import { ACCENT, DANGER, SUCCESS, WARNING, styles, toneText } from '../theme';
import { legalStatusKey, legalStatusIcon, hasHiddenCosts, integrityHasWarnings, safeDisplayText, buildAudioScript } from '../utils/analysis';
import { getPlaybook, playbookItemById, statuteFor } from '../constants/playbooks';
import { useFeedback } from '../context/FeedbackContext';
import { isSpeaking, isSpeakableText, speakAnalysisSummary, speechAvailable, stopBriefing } from '../services/voice';
import LockedSection from './LockedSection';
import LegalRef from './LegalRef';

const STATUS_TONE = {
  VOID: DANGER,
  PARTIALLY_VOID: DANGER,
  QUESTIONABLE: WARNING,
  VALID: SUCCESS,
};

const CRITICAL_TONE = {
  HIGH: DANGER,
  MEDIUM: WARNING,
  LOW: ACCENT,
};

function LayerCard({ theme, icon, title, children, borderColor }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: borderColor || theme.borderColor,
          marginBottom: 20,
        },
      ]}
    >
      <View style={styles.takeawayHeader}>
        <Ionicons name={icon} size={16} color={toneText(borderColor) || theme.accent} />
        <Text style={[styles.takeawayTitle, { color: theme.text, flexShrink: 1 }]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

export function ConversionHook({ theme, hook, onUnlock }) {
  const { t } = useTranslation();
  if (!hook) return null;

  const titleKey = `hook${hook[0].toUpperCase()}${hook.slice(1)}Title`;
  const bodyKey = `hook${hook[0].toUpperCase()}${hook.slice(1)}Body`;

  return (
    <TouchableOpacity accessibilityRole="button"
      activeOpacity={0.85}
      onPress={onUnlock}
      style={[styles.conversionHook, { backgroundColor: theme.cardBg, borderColor: theme.warning }]}
    >
      <Ionicons name="flash" size={18} color={theme.warning} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.conversionHookTitle, { color: theme.text }]}>{t(titleKey)}</Text>
        <Text style={[styles.conversionHookBody, { color: theme.subText }]}>{t(bodyKey)}</Text>
      </View>
      <Text style={[styles.lockedCtaText, { color: theme.accent }]}>{t('lockedCta')}</Text>
    </TouchableOpacity>
  );
}

export function ValidityLayer({ theme, items, extraCount = 0, onUnlock }) {
  const { t } = useTranslation();
  if (!items?.length && extraCount <= 0) return null;

  return (
    <LayerCard theme={theme} icon="scale-outline" title={t('validityTitle')}>
      {(items || []).map((item, index) => (
        <View key={`${item.clauseNumber}-${index}`} style={[styles.layerRow, { borderColor: theme.borderColor }]}>
          <View
            style={[
              styles.statusChip,
              { backgroundColor: STATUS_TONE[item.legalStatus] || WARNING, flexDirection: 'row', alignItems: 'center', gap: 4 },
            ]}
          >
            <Ionicons name={legalStatusIcon(item.legalStatus)} size={12} color="#080C14" />
            <Text style={styles.statusChipText}>{t(legalStatusKey(item.legalStatus))}</Text>
          </View>
          {item.clauseNumber ? (
            <Text style={[styles.deadlineLabel, { color: theme.subText }]}>{item.clauseNumber}</Text>
          ) : null}
          {item.originalText ? (
            <Text style={[styles.originalText, { color: theme.subText, marginTop: 6 }]}>
              "{safeDisplayText(item.originalText)}"
            </Text>
          ) : null}
            <Text style={[styles.deadlineMeta, { color: theme.text, marginTop: 6 }]}>
              {safeDisplayText(item.explanation, t('clauseGeneralFallback'))}
            </Text>
          {item.governingLawReference ? (
            <LegalRef theme={theme}>{item.governingLawReference}</LegalRef>
          ) : null}
          {(item.legalStatus === 'VOID' || item.legalStatus === 'PARTIALLY_VOID') && item.cancellationRight ? (
            <Text style={[styles.deadlineMeta, { color: theme.danger, marginTop: 6 }]}>
              {t('validityRemedyLabel')}: {safeDisplayText(item.cancellationRight)}
            </Text>
          ) : null}
        </View>
      ))}
      {extraCount > 0 ? (
        <TouchableOpacity accessibilityRole="button" onPress={onUnlock} activeOpacity={0.8}>
          <Text style={[styles.lockedMoreText, { color: theme.accent }]}>
            {t('lockedMoreClauses', { count: extraCount })}
          </Text>
        </TouchableOpacity>
      ) : null}
    </LayerCard>
  );
}

export function LawyerQuestions({ theme, questions = [], extraCount = 0, onUnlock }) {
  const { t } = useTranslation();
  const { showToast } = useFeedback();
  const list = (questions || []).filter(Boolean).slice(0, 5);
  if (!list.length && extraCount <= 0) return null;

  if (extraCount > 0 && !list.length) {
    return (
      <LockedSection
        theme={theme}
        title={t('lawyerQuestionsTitle')}
        subtitle={t('lawyerQuestionsHint')}
        onUnlock={onUnlock}
      />
    );
  }

  const copyAll = async () => {
    const text = list
      .map((item, index) => {
        const line = typeof item === 'string' ? item : String(item?.text || item?.question || item || '');
        return `${index + 1}. ${line}`;
      })
      .join('\n');
    if (!text.trim()) return;
    await Clipboard.setStringAsync(text);
    showToast(t('copiedToClipboard'), { type: 'success' });
  };

  return (
    <LayerCard theme={theme} icon="help-circle-outline" title={t('lawyerQuestionsTitle')}>
      <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('lawyerQuestionsHint')}</Text>
      {list.map((item, index) => {
        const text = typeof item === 'string' ? item : String(item?.text || item?.question || item || '');
        return (
          <Text key={`${index}-${text.slice(0, 12)}`} style={[styles.deadlineMeta, { color: theme.text, marginTop: 8 }]}>
            {index + 1}. {safeDisplayText(text)}
          </Text>
        );
      })}
      <TouchableOpacity accessibilityRole="button"
        style={[styles.proposalBtn, { borderColor: theme.accent, marginTop: 12, alignSelf: 'flex-start' }]}
        onPress={() => {
          copyAll().catch(() => {});
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="copy-outline" size={14} color={theme.accent} />
        <Text style={styles.proposalBtnText}>{t('ladderCopy')}</Text>
      </TouchableOpacity>
    </LayerCard>
  );
}

export function HiddenCostsCard({ theme, costs, locked, onUnlock }) {
  const { t } = useTranslation();
  if (!hasHiddenCosts(costs) && !locked) return null;

  const rows = [
    { key: 'penalty', label: t('hiddenCostPenalty'), value: costs?.penaltyClauseAmount },
    { key: 'deposit', label: t('hiddenCostDeposit'), value: costs?.depositRisk },
    { key: 'renewal', label: t('hiddenCostRenewal'), value: costs?.autoRenewalCost },
    { key: 'increase', label: t('hiddenCostIncrease'), value: costs?.priceIncreaseCost },
    { key: 'exit', label: t('hiddenCostEarlyExit'), value: costs?.earlyTerminationFee },
    { key: 'notice', label: t('hiddenCostNotice'), value: costs?.noticePeriodCost },
    { key: 'interest', label: t('hiddenCostInterest'), value: costs?.interestOrDefault },
  ].filter((row) => row.value !== '' && row.value != null);

  return (
    <LayerCard theme={theme} icon="cash-outline" title={t('hiddenCostsTitle')} borderColor={WARNING}>
      {(rows || []).map((row) => (
        <View key={row.key} style={styles.costRow}>
          <Text style={[styles.deadlineMeta, { color: theme.subText, flex: 1 }]}>{row.label}</Text>
          <Text style={[styles.deadlineLabel, { color: theme.text }]}>{String(safeDisplayText(row.value))}</Text>
        </View>
      ))}
      {costs?.totalEstimatedLiability ? (
        <View style={[styles.decisionHarmBox, { backgroundColor: theme.inputBg, marginTop: 8 }]}>
          <Text style={[styles.decisionHarmLabel, { color: theme.warning }]}>{t('hiddenCostTotal')}</Text>
          <Text style={[styles.decisionHarmText, { color: theme.text }]}>
            {costs.totalEstimatedLiability}
          </Text>
        </View>
      ) : null}
      {locked ? (
        <TouchableOpacity accessibilityRole="button" onPress={onUnlock} activeOpacity={0.8} style={{ marginTop: 10 }}>
          <Text style={[styles.lockedMoreText, { color: theme.accent }]}>{t('hookCostsTitle')}</Text>
        </TouchableOpacity>
      ) : null}
    </LayerCard>
  );
}

export function CounterProposals({ theme, items, onCopied, country }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(null);
  if (!items?.length) return null;

  const copy = async (key, value) => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    setCopied(key);
    onCopied?.(key);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <LayerCard theme={theme} icon="create-outline" title={t('counterProposalsTitle')}>
      {(items || []).map((item, index) => (
        <View key={`${item.riskClauseId}-${index}`} style={[styles.layerRow, { borderColor: theme.borderColor }]}>
          {item.originalText ? (
            <Text style={[styles.originalText, { color: theme.subText }]}>
              "{safeDisplayText(item.originalText)}"
            </Text>
          ) : null}
          {item.rewrittenProUserText ? (
            <>
              <Text style={[styles.issueTitle, { marginTop: 8 }]}>{t('counterRewriteLabel')}</Text>
              <Text style={[styles.counterText, { color: theme.text }]}>
                {safeDisplayText(item.rewrittenProUserText)}
              </Text>
            </>
          ) : null}
          {(() => {
            const direct = String(item.legalJustification || '').trim();
            const pb = playbookItemById(item.playbookId || item.riskClauseId);
            const fallback = pb ? statuteFor(pb, country) : '';
            const cite = direct || fallback;
            return cite ? <LegalRef theme={theme}>{cite}</LegalRef> : null;
          })()}
          <View style={styles.proposalActions}>
            {item.readyToSendMessage?.whatsapp ? (
              <TouchableOpacity accessibilityRole="button"
                style={styles.proposalBtn}
                onPress={() => copy(`wa-${index}`, item.readyToSendMessage.whatsapp)}
              >
                <Ionicons
                  name={copied === `wa-${index}` ? 'checkmark-circle' : 'logo-whatsapp'}
                  size={14}
                  color={theme.accent}
                />
                <Text style={styles.proposalBtnText}>{t('sendViaWhatsApp')}</Text>
              </TouchableOpacity>
            ) : null}
            {item.readyToSendMessage?.email ? (
              <TouchableOpacity accessibilityRole="button"
                style={styles.proposalBtn}
                onPress={() => copy(`em-${index}`, item.readyToSendMessage.email)}
              >
                <Ionicons
                  name={copied === `em-${index}` ? 'checkmark-circle' : 'mail-outline'}
                  size={14}
                  color={theme.accent}
                />
                <Text style={styles.proposalBtnText}>{t('sendViaEmail')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ))}
    </LayerCard>
  );
}

export function ObligationsChecklist({ theme, items }) {
  const { t } = useTranslation();
  if (!items?.length) return null;

  return (
    <LayerCard theme={theme} icon="checkbox-outline" title={t('obligationsTitle')}>
      {(items || []).map((item, index) => (
        <View key={`${item.task}-${index}`} style={[styles.deadlineRow, { borderColor: theme.borderColor }]}>
          <Ionicons
            name={item.party === 'USER' ? 'person-outline' : 'people-outline'}
            size={16}
            color={item.party === 'USER' ? theme.accent : theme.subText}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.deadlineLabel, { color: theme.text }]}>{safeDisplayText(item.task)}</Text>
            <Text style={[styles.deadlineMeta, { color: theme.subText }]}>
              {[item.party === 'USER' ? t('obligationUser') : t('obligationOther'), safeDisplayText(item.deadline)]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>
        </View>
      ))}
    </LayerCard>
  );
}

export function IntegrityChecks({ theme, checks }) {
  const { t } = useTranslation();
  if (!checks) return null;
  if (!integrityHasWarnings(checks)) return null;

  const rows = [
    { on: checks?.missingSignatureLine, label: t('integritySignature'), icon: 'pencil-outline' },
    { on: checks?.missingDates, label: t('integrityDates'), icon: 'calendar-outline' },
    { on: checks?.suspiciousIbanOrPayment, label: t('integrityPayment'), icon: 'card-outline' },
    { on: checks?.unilateralAmendmentClause, label: t('integrityUnilateral'), icon: 'alert-circle-outline' },
  ].filter((row) => row.on);

  return (
    <LayerCard theme={theme} icon="warning-outline" title={t('integrityTitle')} borderColor={DANGER}>
      {(rows || []).map((row) => (
        <View key={row.label} style={[styles.deadlineRow, { borderColor: theme.borderColor }]}>
          <Ionicons name={row.icon} size={16} color={theme.danger} />
          <Text style={[styles.deadlineLabel, { color: theme.text, flex: 1 }]}>{row.label}</Text>
        </View>
      ))}
      {(checks?.warningFlags || []).map((flag, index) => (
        <Text key={index} style={[styles.deadlineMeta, { color: theme.subText, marginTop: 8 }]}>
          • {flag}
        </Text>
      ))}
    </LayerCard>
  );
}

export function PlaybookCard({
  theme,
  category,
  country,
  analysis,
  locked = false,
  lockedCounts = {},
  onUnlock,
  signConditions = [],
  onToggleCondition,
  onAppendClause,
}) {
  const { t } = useTranslation();
  const { showToast } = useFeedback();
  const playbook = getPlaybook(category);
  if (!playbook?.items?.length) return null;

  const byId = new Map(
    (analysis?.missingProtections || []).map((item) => [item.playbookId, item])
  );
  const selectedIds = new Set((signConditions || []).map((item) => item.id || item.playbookId));
  const missingCount = lockedCounts.missingAbsent || 0;

  const statusMeta = (status) => {
    if (status === 'PRESENT') return { color: theme.success, label: t('missingPresent') };
    if (status === 'WEAK') return { color: theme.warning, label: t('missingWeak') };
    if (status === 'ABSENT') return { color: theme.danger, label: t('missingAbsent') };
    return null;
  };

  const copyClause = async (text, append) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    if (append) onAppendClause?.(text);
    showToast(t('copiedToClipboard'), { type: 'success' });
  };

  return (
    <LayerCard theme={theme} icon="book-outline" title={t('playbookTitle')}>
      <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('playbookHint')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('signPickHint')}</Text>
      <Text style={[styles.deadlineMeta, { color: theme.accent, marginBottom: 8 }]}>
        {t('signPickedCount', { count: selectedIds.size })}
      </Text>
      {missingCount > 0 ? (
        <TouchableOpacity accessibilityRole="button" onPress={onUnlock} activeOpacity={0.8} style={{ marginBottom: 8 }}>
          <Text style={[styles.lockedMoreText, { color: theme.accent }]}>
            +{missingCount} {t('missingAbsent')}
          </Text>
        </TouchableOpacity>
      ) : null}

      {(playbook.items || []).map((item) => {
        const model = byId.get(item.id);
        const citation = (model?.statute && /[§]|m\.\s*\d|Art\.|المادة|ст\./i.test(model.statute)
          ? model.statute
          : statuteFor(item, country)) || statuteFor(item, country);
        const hint = item.hintKey ? t(item.hintKey) : '';
        const badge = statusMeta(model?.status);
        const selected = selectedIds.has(item.id);
        const showDetails = !locked && model && (model.status === 'ABSENT' || model.status === 'WEAK');

        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.deadlineRow, { borderColor: selected ? theme.accent : theme.borderColor }]}
            onPress={() => onToggleCondition?.(item)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Ionicons
              name={selected ? 'checkmark-circle' : 'square-outline'}
              size={16}
              color={selected ? theme.success : theme.danger}
            />
            <View style={{ flex: 1, flexShrink: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={[styles.deadlineLabel, { color: theme.text, flexShrink: 1 }]}>
                  {t(item.titleKey)}
                </Text>
                {badge ? (
                  <View style={[styles.statusChip, { backgroundColor: badge.color, paddingVertical: 2 }]}>
                    <Text style={styles.statusChipText}>{badge.label}</Text>
                  </View>
                ) : null}
              </View>
              {hint && hint !== t(item.titleKey) ? (
                <Text style={[styles.deadlineMeta, { color: theme.subText }]}>{hint}</Text>
              ) : null}
              {citation ? (
                <LegalRef theme={theme}>{citation}</LegalRef>
              ) : null}
              {showDetails && model.whyItHurts ? (
                <Text style={[styles.deadlineMeta, { color: theme.text, marginTop: 6 }]}>
                  {t('missingWhy')}: {safeDisplayText(model.whyItHurts)}
                </Text>
              ) : null}
              {showDetails && model.insertClause ? (
                <View style={{ marginTop: 8, gap: 8 }}>
                  <Text style={[styles.deadlineMeta, { color: theme.subText }]}>
                    {t('missingInsert')}: {safeDisplayText(model.insertClause)}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    <TouchableOpacity accessibilityRole="button"
                      style={[styles.proposalBtn, { borderColor: theme.accent }]}
                      onPress={() => {
                        copyClause(model.insertClause, false).catch(() => {});
                      }}
                    >
                      <Ionicons name="copy-outline" size={14} color={theme.accent} />
                      <Text style={styles.proposalBtnText}>{t('ladderCopy')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button"
                      style={[styles.proposalBtn, { borderColor: theme.accent }]}
                      onPress={() => {
                        copyClause(model.insertClause, true).catch(() => {});
                      }}
                    >
                      <Ionicons name="add-outline" size={14} color={theme.accent} />
                      <Text style={styles.proposalBtnText}>{t('missingAddToMessage')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
              {locked && model && (model.status === 'ABSENT' || model.status === 'WEAK') ? (
                <TouchableOpacity accessibilityRole="button" onPress={onUnlock} activeOpacity={0.8} style={{ marginTop: 6 }}>
                  <Text style={[styles.lockedMoreText, { color: theme.accent }]}>{t('hookMissingTitle')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </LayerCard>
  );
}

export function eventCriticalityColor(value) {
  return CRITICAL_TONE[String(value || '').toUpperCase()] || ACCENT;
}

export function CostWidget({ theme, costs }) {
  const { t } = useTranslation();
  if (!costs?.totalEstimatedLiability) return null;

  return (
    <View
      style={[
        styles.costWidget,
        { backgroundColor: theme.cardBg, borderColor: theme.warning },
      ]}
    >
      <View style={styles.takeawayHeader}>
        <Ionicons name="calculator-outline" size={16} color={theme.warning} />
        <Text style={[styles.takeawayTitle, { color: theme.text, flexShrink: 1 }]}>
          {costs.horizonLabel || t('costWidgetTitle')}
        </Text>
      </View>
      <Text style={[styles.costWidgetValue, { color: theme.warning }]}>
        {safeDisplayText(costs.totalEstimatedLiability)}
      </Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>
        {t('costWidgetHint')}
      </Text>
    </View>
  );
}

export function VoiceBriefButton({ theme, analysis, lang }) {
  const { t } = useTranslation();
  const { showToast } = useFeedback();
  const [speaking, setSpeaking] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!speaking) {
      setElapsedSec(0);
      return undefined;
    }
    const startedAt = Date.now();
    const timer = setInterval(() => {
      setElapsedSec(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    }, 250);
    return () => clearInterval(timer);
  }, [speaking]);

  const formatElapsed = (total) => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePress = async () => {
    try {
      if (speaking || (await isSpeaking())) {
        await stopBriefing();
        setSpeaking(false);
        setElapsedSec(0);
        return;
      }

      const script = buildAudioScript(analysis);
      if (!isSpeakableText(script)) {
        showToast(t('voiceSpeakEmpty'), { type: 'warning' });
        return;
      }
      if (!speechAvailable()) {
        showToast(t('nativeAudioMissing'), { type: 'error' });
        return;
      }

      setSpeaking(true);
      const fallbackCopy = async () => {
        try {
          await Clipboard.setStringAsync(script);
          showToast(t('voiceSpeakRetry'), { type: 'warning' });
        } catch {
          showToast(t('voiceSpeakError'), { type: 'error' });
        }
      };
      const started = await speakAnalysisSummary(script, lang, {
        onDone: () => {
          setSpeaking(false);
          setElapsedSec(0);
        },
        onError: () => {
          setSpeaking(false);
          setElapsedSec(0);
          fallbackCopy().catch(() => showToast(t('voiceSpeakError'), { type: 'error' }));
        },
      });
      if (!started) {
        setSpeaking(false);
        setElapsedSec(0);
        await fallbackCopy();
      }
    } catch {
      setSpeaking(false);
      setElapsedSec(0);
      showToast(t('voiceSpeakError'), { type: 'error' });
    }
  };

  return (
    <View style={{ alignSelf: 'stretch' }}>
      <TouchableOpacity
        style={[
          styles.voiceBriefBtn,
          {
            borderColor: theme.borderColor,
            minHeight: 44,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          },
        ]}
        onPress={() => {
          handlePress().catch(() => {
            setSpeaking(false);
            setElapsedSec(0);
            showToast(t('voiceSpeakError'), { type: 'error' });
          });
        }}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ busy: speaking }}
        accessibilityLabel={speaking ? t('stopBriefing') : t('listenBriefing')}
      >
        <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={speaking ? 'stop-circle' : 'volume-high-outline'} size={16} color={theme.accent} />
        </View>
        <Text
          style={[
            styles.decisionShareText,
            {
              lineHeight: 16,
              includeFontPadding: false,
              textAlignVertical: 'center',
            },
          ]}
        >
          {speaking ? t('stopBriefing') : t('listenBriefing')}
        </Text>
        <Text
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: 12,
            color: theme.accent,
            fontSize: 12,
            lineHeight: 16,
            includeFontPadding: false,
            textAlignVertical: 'center',
            opacity: speaking ? 1 : 0,
          }}
        >
          {formatElapsed(elapsedSec)}
        </Text>
      </TouchableOpacity>
      <View
        style={[
          styles.gaugeTrack,
          {
            backgroundColor: theme.inputBg,
            marginTop: 10,
            marginBottom: 14,
            height: 4,
            borderRadius: 999,
            opacity: speaking ? 1 : 0,
          },
        ]}
      >
        <View
          style={[
            styles.gaugeFill,
            {
              width: `${Math.min(100, 12 + (elapsedSec % 20) * 4)}%`,
              backgroundColor: ACCENT,
              height: 4,
              borderRadius: 999,
            },
          ]}
        />
      </View>
    </View>
  );
}

export function RiskSummary({ theme, clauses = [], redFlags = [] }) {
  const { t } = useTranslation();
  const list = Array.isArray(clauses) ? clauses : [];
  const highFromClauses = list.filter((item) => String(item?.riskLevel || '').toUpperCase() === 'RED').length;
  const high = highFromClauses || (Array.isArray(redFlags) ? redFlags.length : 0);
  const medium = list.filter((item) => String(item?.riskLevel || '').toUpperCase() === 'YELLOW').length;
  const low = list.filter((item) => String(item?.riskLevel || '').toUpperCase() === 'GREEN').length;
  const total = Math.max(1, high + medium + low);
  const rows = [
    { key: 'high', label: t('riskHigh'), count: high, color: theme.danger },
    { key: 'medium', label: t('riskMedium'), count: medium, color: theme.warning },
    { key: 'low', label: t('riskLow'), count: low, color: theme.success },
  ];

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginBottom: 16 }]}>
      <Text style={[styles.takeawayTitle, { color: theme.text, marginBottom: 10 }]}>{t('riskSummaryTitle')}</Text>
      {rows.map((row) => (
        <View key={row.key} style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={[styles.deadlineMeta, { color: theme.subText }]}>{row.label}</Text>
            <Text style={[styles.deadlineLabel, { color: row.color }]}>{row.count}</Text>
          </View>
          <View style={[styles.gaugeTrack, { backgroundColor: theme.inputBg }]}>
            <View style={[styles.gaugeFill, { width: `${Math.round((row.count / total) * 100)}%`, backgroundColor: row.color }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ClauseNavigator({ theme, clauses = [], renderCard, contentRef, onClausePin }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('ALL');
  const rowRef = useRef(null);
  const pinWaitRef = useRef(false);
  const items = Array.isArray(clauses) ? clauses : [];
  const clauseSignature = items
    .map((item) => item?.clauseTitle || item?.issue || '')
    .join('\u0001');

  useEffect(() => {
    setFilter('ALL');
  }, [clauseSignature]);

  const visible = filter === 'ALL'
    ? items
    : items.filter((item) => String(item.riskLevel || '').toUpperCase() === filter);

  const measureRow = (done) => {
    const row = rowRef.current;
    const relative = contentRef?.current;
    if (!row || !relative || typeof row.measureLayout !== 'function') {
      done(null);
      return;
    }
    try {
      row.measureLayout(
        relative,
        (_x, y) => done(Number(y) || 0),
        () => done(null)
      );
    } catch {
      done(null);
    }
  };

  const chooseFilter = (code) => {
    if (code === filter) return;
    measureRow((contentY) => {
      if (contentY == null) {
        setFilter(code);
        return;
      }
      pinWaitRef.current = true;
      onClausePin?.({ phase: 'start', contentY });
      setFilter(code);
    });
  };

  useEffect(() => {
    if (!pinWaitRef.current) return undefined;
    let cancelled = false;
    const settle = () => {
      if (cancelled || !pinWaitRef.current) return;
      measureRow((contentY) => {
        if (cancelled || !pinWaitRef.current || contentY == null) return;
        pinWaitRef.current = false;
        onClausePin?.({ phase: 'settle', contentY });
      });
    };
    requestAnimationFrame(() => requestAnimationFrame(settle));
    return () => {
      cancelled = true;
    };
  }, [filter, visible.length, onClausePin]);

  if (!items.length) {
    return (
      <View style={[styles.deadlineRow, { borderColor: theme.borderColor }]}>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>
          {t('clausesEmpty')}
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View
        ref={rowRef}
        collapsable={false}
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}
      >
        {['ALL', 'RED', 'YELLOW', 'GREEN'].map((code) => {
          const active = filter === code;
          const label = code === 'ALL' ? t('clauseFilterAll') : code === 'RED' ? t('riskHigh') : code === 'YELLOW' ? t('riskMedium') : t('riskLow');
          return (
            <TouchableOpacity accessibilityRole="button"
              key={code}
              onPress={() => chooseFilter(code)}
              style={[
                styles.statusChip,
                {
                  backgroundColor: active ? ACCENT : theme.inputBg,
                  marginBottom: 0,
                },
              ]}
            >
              <Text style={[styles.statusChipText, { color: active ? '#080C14' : theme.subText }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {visible.map((item, index) => renderCard(item, items.indexOf(item)))}
    </View>
  );
}
