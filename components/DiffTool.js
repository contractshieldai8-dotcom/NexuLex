import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { ACCENT, DANGER, SUCCESS, WARNING, alignStart, styles, toneText } from '../theme';
import { playbookItemById } from '../constants/playbooks';
import { compareContractVersions, reviseContractDraft } from '../services/ai';
import { describeError } from '../utils/errors';
import { normalizeDiffResult, safeDisplayText, conditionsForVerify, userSignConditions } from '../utils/analysis';
import { buildGroupedRedline, buildRedline } from '../utils/redline';
import { useFeedback } from '../context/FeedbackContext';
import { exportPlain, paginatePlainHtml } from '../utils/exportPlain';
import { readOwnedFile, writeOwnedBase64, cleanStaleExportCache } from '../utils/fileAccess';

const winnerColor = (winner) => {
  if (winner === 'USER') return SUCCESS;
  if (winner === 'OTHER') return DANGER;
  return WARNING;
};

const HEAVY_CHAR_THRESHOLD = 8000;

const localChangesFromRedline = (originalText, revisedText) => {
  let o = String(originalText || '');
  let r = String(revisedText || '');
  // Large texts: sample heads so change chips stay cheap (AI compare untouched).
  if (o.length + r.length > 25000) {
    o = o.slice(0, 12000);
    r = r.slice(0, 12000);
  }
  const tokens = buildRedline(o, r);
  const groups = [];
  let current = null;
  tokens.forEach((token) => {
    if (token.type === 'same') {
      current = null;
      return;
    }
    if (!current || current.kind !== token.type) {
      current = { kind: token.type, words: [] };
      groups.push(current);
    }
    current.words.push(token.text);
  });
  return groups.slice(0, 8).map((group, index) => {
    const text = group.words.join(' ');
    const added = group.kind === 'add';
    return {
      topic: text.slice(0, 80) || `Δ${index + 1}`,
      original: added ? '' : text,
      revised: added ? text : '',
      winner: added ? 'USER' : 'OTHER',
      worsened: !added,
      note: '',
    };
  });
};

const withLocalChanges = (normalized, originalText, revisedText) => {
  if ((normalized?.changes || []).length) return normalized;
  const changes = localChangesFromRedline(originalText, revisedText);
  if (!changes.length) return normalized;
  return { ...normalized, changes };
};

function DraftToolbar({ theme, onCopy, onShare, view, onView }) {
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 }}>
      <TouchableOpacity accessibilityRole="button"
        style={[styles.proposalBtn, { borderColor: theme.accent }]}
        onPress={() => {
          onCopy().catch(() => {});
        }}
      >
        <Ionicons name="copy-outline" size={14} color={theme.accent} />
        <Text style={styles.proposalBtnText}>{t('copyDraft')}</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button"
        style={[styles.proposalBtn, { borderColor: theme.accent }]}
        onPress={() => {
          onShare().catch(() => {});
        }}
      >
        <Ionicons name="share-outline" size={14} color={theme.accent} />
        <Text style={styles.proposalBtnText}>{t('genShare')}</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button"
        style={[styles.proposalBtn, { borderColor: view === 'split' ? theme.accent : theme.borderColor }]}
        onPress={() => onView(view === 'split' ? 'full' : 'split')}
      >
        <Ionicons name="git-compare-outline" size={14} color={theme.accent} />
        <Text style={styles.proposalBtnText}>{t('diffSplitView')}</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button"
        style={[styles.proposalBtn, { borderColor: view === 'redline' ? theme.accent : theme.borderColor }]}
        onPress={() => onView(view === 'redline' ? 'full' : 'redline')}
      >
        <Ionicons name="color-wand-outline" size={14} color={theme.accent} />
        <Text style={styles.proposalBtnText}>{t('diffRedline')}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DiffTool({
  theme,
  lang,
  country,
  party,
  category,
  disabled,
  sourceText = '',
  seedRevised = '',
  seedNonce = 0,
  seedMode = '',
  analysis = null,
  lockPremium = false,
  onUnlock,
  onSignStatus,
}) {
  const { t } = useTranslation();
  const { showToast } = useFeedback();
  const [mode, setMode] = useState(null);
  const [original, setOriginal] = useState('');
  const [revised, setRevised] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [view, setView] = useState('full');
  const [origSel, setOrigSel] = useState({ start: 0, end: 0 });
  const [revSel, setRevSel] = useState({ start: 0, end: 0 });
  const [pinCaret, setPinCaret] = useState(false);
  const [redlineBusy, setRedlineBusy] = useState(false);
  const [redlineDeferred, setRedlineDeferred] = useState(null);

  const pinStart = () => {
    setOrigSel({ start: 0, end: 0 });
    setRevSel({ start: 0, end: 0 });
    setPinCaret(true);
  };

  useEffect(() => {
    const stored = String(analysis?.revised_contract_text || analysis?.revisedContractText || '').trim();
    if (stored) setRevised(stored);
  }, [analysis?.id]);

  useEffect(() => {
    if (!seedNonce) return;
    const source = String(sourceText || analysis?.contract_text || analysis?.contractText || '').trim();
    if (seedMode === 'verify') {
      if (lockPremium) {
        onUnlock?.();
        return;
      }
      setMode('verify');
      setOriginal(source);
      setRevised('');
      setResult(null);
      setView('full');
      pinStart();
      return;
    }
    const nextRevised = String(seedRevised || '').trim();
    setMode('manual');
    setOriginal(source);
    setRevised(nextRevised && nextRevised !== source ? nextRevised : '');
    setResult(null);
    setView('split');
    pinStart();
  }, [seedNonce]);

  const draftText = result?.revisedText || revised;
  const originalText = sourceText || original;

  // Light path: sync memo. Heavy path deferred below (InteractionManager).
  const redlineMemo = useMemo(() => {
    if (view !== 'redline' || !draftText) return null;
    const chars = String(originalText || '').length + String(draftText || '').length;
    if (chars > HEAVY_CHAR_THRESHOLD) return null;
    return buildGroupedRedline(originalText, draftText);
  }, [view, originalText, draftText]);

  useEffect(() => {
    if (view !== 'redline' || !draftText) {
      setRedlineBusy(false);
      setRedlineDeferred(null);
      return undefined;
    }
    const chars = String(originalText || '').length + String(draftText || '').length;
    if (chars <= HEAVY_CHAR_THRESHOLD) {
      setRedlineBusy(false);
      setRedlineDeferred(null);
      return undefined;
    }
    let cancelled = false;
    setRedlineBusy(true);
    setRedlineDeferred(null);
    const task = InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        if (cancelled) return;
        try {
          const next = buildGroupedRedline(originalText, draftText);
          if (!cancelled) setRedlineDeferred(next);
        } finally {
          if (!cancelled) setRedlineBusy(false);
        }
      }, 0);
    });
    return () => {
      cancelled = true;
      if (typeof task?.cancel === 'function') task.cancel();
    };
  }, [view, originalText, draftText]);

  const redlineModel = redlineMemo || redlineDeferred;

  const enterMode = (next) => {
    if (next === 'verify' && lockPremium) {
      onUnlock?.();
      return;
    }
    setMode(next);
    setResult(null);
    const source = String(sourceText || analysis?.contract_text || analysis?.contractText || '').trim();
    if (source) setOriginal(source);
    if (next === 'verify') {
      // Verify must start with empty revised — never auto-fill stitch/revised_contract_text.
      setRevised('');
    } else {
      setRevised((prev) => {
        const kept = String(prev || '').trim();
        return kept && kept !== source ? kept : '';
      });
    }
    if (next === 'auto' || next === 'manual') setView('split');
    pinStart();
  };

  const diffArea = { minHeight: 180, maxHeight: 220, height: undefined };

  const lightColor = (light) => {
    if (light?.confidence === 'LOW') return WARNING;
    if (light?.met) return SUCCESS;
    return DANGER;
  };

  const lightLabel = (light) => {
    if (light?.confidence === 'LOW') return t('verifyUnclear');
    if (light?.met) return t('verifyMet');
    return t('verifyUnmet');
  };

  const copyUnmetFix = async (light) => {
    try {
      if (!light || light.met || light.confidence !== 'HIGH') return;
      const ask = (analysis?.batnaLadder || []).find((step) => step.step === 'ASK')?.ask;
      const clause = (analysis?.missingProtections || []).find((item) => item.playbookId === light.id)?.insertClause;
      const text = String(ask || clause || '').trim();
      if (!text) return;
      await Clipboard.setStringAsync(text);
      showToast(t('copiedToClipboard'), { type: 'success' });
    } catch {
      showToast(t('genShareFailed'), { type: 'error' });
    }
  };

  const handleCopy = async () => {
    try {
      if (!draftText) {
        showToast(t('diffEmpty'), { type: 'warning' });
        return;
      }
      const { text } = await exportPlain(draftText, 'NexuLex-taslak.txt');
      showToast(`${t('copiedToClipboard')} · ${text.length}`, { type: 'success' });
    } catch {
      showToast(t('genShareFailed'), { type: 'error' });
    }
  };

  const handleShare = async () => {
    if (!draftText) return;
    try {
      const html = paginatePlainHtml(draftText);
      const printed = await Print.printToFileAsync({ html, base64: true });
      let payload = String(printed?.base64 || '').replace(/^data:[^;]+;base64,/, '');
      if (!payload && printed?.uri) {
        try {
          payload = await readOwnedFile(printed.uri, { asBase64: true });
        } catch {
          /* Print URI */
        }
      }
      const ownedUri = payload ? await writeOwnedBase64(payload, 'NexuLex-taslak.pdf') : '';
      if (!ownedUri || !(await Sharing.isAvailableAsync())) {
        await exportPlain(draftText, 'NexuLex-taslak.txt', { shareAlways: true });
        return;
      }
      await Sharing.shareAsync(ownedUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
      showToast(t('draftShared'), { type: 'success' });
      cleanStaleExportCache().catch(() => {});
    } catch {
      try {
        await exportPlain(draftText, 'NexuLex-taslak.txt', { shareAlways: true });
      } catch {
        showToast(t('copiedToClipboard'), { type: 'success' });
      }
    }
  };

  const renderDraftBody = () => {
    if (!draftText) return null;
    if (view === 'split') {
      return (
        <View style={{ flexDirection: 'column', gap: 12 }}>
          <View>
            <Text style={[styles.counterTitle, { marginBottom: 6 }]}>{t('diffOriginal')}</Text>
            <Text style={[styles.counterText, { color: theme.subText }]}>{safeDisplayText(originalText)}</Text>
          </View>
          <View>
            <Text style={[styles.counterTitle, { marginBottom: 6 }]}>{t('diffAutoDraftLabel')}</Text>
            <Text style={styles.counterText}>{safeDisplayText(draftText)}</Text>
          </View>
        </View>
      );
    }
    if (view === 'redline') {
      if (redlineBusy || !redlineModel) {
        return (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator color={theme.accent} />
          </View>
        );
      }
      const runs = redlineModel.runs || [];
      return (
        <View>
          {redlineModel.truncated ? (
            <Text style={[styles.sectionHint, { color: theme.warning, marginBottom: 8 }]}>
              {`Performance Mode: Showing first ${runs.length} runs`}
            </Text>
          ) : null}
          <Text style={{ flexWrap: 'wrap' }}>
            {runs.map((run, index) => (
              <Text
                key={`${run.type}-${index}`}
                style={{
                  color: run.type === 'del' ? theme.danger : run.type === 'add' ? theme.success : theme.text,
                  textDecorationLine: run.type === 'del' ? 'line-through' : 'none',
                  fontWeight: run.type === 'add' ? '700' : '400',
                  fontSize: 13,
                  lineHeight: 20,
                }}
              >
                {run.text}{' '}
              </Text>
            ))}
          </Text>
        </View>
      );
    }
    return <Text style={styles.counterText}>{safeDisplayText(draftText)}</Text>;
  };

  const renderLights = () => {
    const status = result?.signStatus;
    if (!status?.lights?.length) return null;
    const firstOpen = (status.lights || []).find((item) => !item.met);
    return (
      <View style={{ marginBottom: 12 }}>
        <Text style={[styles.takeawayTitle, { color: theme.text }]}>{t('verifyLightsTitle')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText }]}>
          {status.met}/{status.total}
          {firstOpen?.unmetReason ? ` · ${safeDisplayText(firstOpen.unmetReason)}` : ''}
        </Text>
        {(status.lights || []).map((light) => (
          <TouchableOpacity accessibilityRole="button"
            key={light.id}
            style={[styles.lightRow, { borderColor: theme.borderColor }]}
            onPress={() => {
              copyUnmetFix(light).catch(() => {});
            }}
            activeOpacity={0.85}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                marginTop: 4,
                backgroundColor: lightColor(light),
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.deadlineLabel, { color: theme.text }]}>
              {playbookItemById(light.id) ? t(playbookItemById(light.id).titleKey) : light.id} · {lightLabel(light)}
            </Text>
              {light.evidence ? (
                <Text style={[styles.deadlineMeta, { color: theme.subText }]}>
                  {safeDisplayText(light.evidence)}
                </Text>
              ) : null}
              {!light.met && light.unmetReason ? (
                <Text style={[styles.deadlineMeta, { color: toneText(lightColor(light)) }]}>
                  {safeDisplayText(light.unmetReason)}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderResult = () => {
    if (!result) return null;
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginTop: 12 },
        ]}
      >
        <View style={styles.takeawayHeader}>
          <Ionicons name="git-compare-outline" size={16} color={theme.accent} />
          <Text style={[styles.takeawayTitle, { color: theme.text, flexShrink: 1 }]}>
            {t('diffWhatChanged')}
          </Text>
        </View>
        {renderLights()}
        <DraftToolbar theme={theme} onCopy={handleCopy} onShare={handleShare} view={view} onView={setView} />
        {result.summary ? (
          <Text style={[styles.summaryText, { color: theme.text, textAlign: alignStart }]}>
            {safeDisplayText(result.summary)}
          </Text>
        ) : null}
        <View
          style={[
            styles.statusChip,
            { backgroundColor: winnerColor(result.whoGained), marginBottom: 12 },
          ]}
        >
          <Text style={styles.statusChipText}>
            {t('diffWhoWon')}: {t(`diffWinner${result.whoGained === 'USER' ? 'User' : result.whoGained === 'OTHER' ? 'Other' : 'Mixed'}`)}
          </Text>
        </View>

        {(() => {
          const changes = result.changes || [];
          const forUser = changes.filter((item) => item.winner === 'USER' && !item.worsened).length;
          const against = changes.filter((item) => item.winner === 'OTHER' || item.worsened).length;
          const mixed = Math.max(0, changes.length - forUser - against);
          if (!changes.length) return null;
          return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <Text style={[styles.deadlineLabel, { color: theme.text, width: '100%' }]}>{t('diffRiskMatrix')}</Text>
              <View style={[styles.statusChip, { backgroundColor: SUCCESS }]}>
                <Text style={styles.statusChipText}>{t('diffFavoursUser')} · {forUser}</Text>
              </View>
              <View style={[styles.statusChip, { backgroundColor: DANGER }]}>
                <Text style={styles.statusChipText}>{t('diffFavoursOther')} · {against}</Text>
              </View>
              {mixed ? (
                <View style={[styles.statusChip, { backgroundColor: WARNING }]}>
                  <Text style={styles.statusChipText}>{t('diffWinnerMixed')} · {mixed}</Text>
                </View>
              ) : null}
            </View>
          );
        })()}

        <View style={[styles.counterBox, { marginBottom: 10 }]}>
          <Text style={styles.counterTitle}>{t('diffAutoDraftLabel')}</Text>
          {renderDraftBody()}
        </View>
        <DraftToolbar theme={theme} onCopy={handleCopy} onShare={handleShare} view={view} onView={setView} />

        {(result.changes || []).map((item, index) => (
          <View key={`${item.topic}-${index}`} style={[styles.layerRow, { borderColor: theme.borderColor }]}>
            <Text style={[styles.deadlineLabel, { color: theme.text, flexShrink: 1 }]} numberOfLines={2}>
              {safeDisplayText(item.topic)}
            </Text>
            <Text style={[styles.deadlineMeta, { color: toneText(winnerColor(item.winner)), marginTop: 4 }]}>
              {item.worsened ? t('diffWorsened') : item.winner === 'USER' ? t('diffImproved') : t('diffNeutral')}
              {' · '}
              {t(`diffWinner${item.winner === 'USER' ? 'User' : item.winner === 'OTHER' ? 'Other' : 'Mixed'}`)}
            </Text>
            {item.original ? (
              <Text style={[styles.deadlineMeta, { color: theme.danger, textDecorationLine: 'line-through', marginTop: 6 }]}>
                {safeDisplayText(item.original)}
              </Text>
            ) : null}
            {item.revised ? (
              <Text style={[styles.deadlineMeta, { color: theme.success, marginTop: 4 }]}>
                {safeDisplayText(item.revised)}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    );
  };

  const handleAutoRevise = async () => {
    if (loading) return;
    const source = String(
      sourceText || analysis?.contract_text || analysis?.contractText || original || ''
    ).trim();
    if (!source) {
      showToast(t('diffNeedOriginal'), { type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const raw = await reviseContractDraft({
        originalText: source,
        redFlags: analysis?.redFlags,
        clauses: analysis?.clauses,
        lang,
        country,
        party,
        category,
      });
      const parsed = normalizeDiffResult(raw);
      const revisedOut = String(parsed.revisedText || '').trim();
      const normalized = withLocalChanges(parsed, source, revisedOut || source);
      setResult(normalized);
      setView('split');
      if (normalized.revisedText) setRevised(normalized.revisedText);
    } catch (error) {
      showToast(describeError(t, error), { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleManualCompare = async () => {
    if (loading) return;
    if (!original.trim() || !revised.trim()) {
      showToast(t('diffEmpty'), { type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const raw = await compareContractVersions({
        originalText: original,
        revisedText: revised,
        lang,
        country,
        party,
        category,
      });
      const next = revised.trim();
      const normalized = withLocalChanges(normalizeDiffResult(raw, next), original.trim(), next);
      setResult({ ...normalized, revisedText: next });
      setView('split');
    } catch (error) {
      showToast(describeError(t, error), { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (lockPremium) {
      onUnlock?.();
      return;
    }
    if (loading) return;
    const source = String(
      sourceText || analysis?.contract_text || analysis?.contractText || original || ''
    ).trim();
    const next = String(revised || '').trim();
    if (!next) {
      showToast(t('verifyNeedRevised'), { type: 'warning' });
      return;
    }
    if (!source) {
      showToast(t('diffNeedOriginal'), { type: 'warning' });
      return;
    }

    const pinned = userSignConditions(analysis);
    if (!pinned.length) {
      showToast(t('verifyUsingDefaults'), { type: 'info' });
    }
    const conditions = conditionsForVerify(analysis, category, country);

    setLoading(true);
    try {
      const raw = await compareContractVersions({
        originalText: source,
        revisedText: next,
        lang,
        country,
        party,
        category,
        signConditions: conditions,
      });
      const normalized = withLocalChanges(normalizeDiffResult(raw, next), source, next);
      setResult({ ...normalized, revisedText: next });
      setView('split');
      onSignStatus?.(normalized.signStatus);
    } catch (error) {
      showToast(describeError(t, error), { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!mode) {
    return (
      <View>
        <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('diffModeHint')}</Text>
        <View style={styles.sideSelector}>
          <TouchableOpacity accessibilityRole="button"
            style={[styles.sideCard, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}
            onPress={() => enterMode('auto')}
            disabled={disabled}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles-outline" size={22} color={theme.accent} style={{ marginBottom: 8 }} />
            <Text style={[styles.sideCardLabel, { color: theme.text }]}>{t('diffAutoRevise')}</Text>
            <Text style={[styles.sideCardHint, { color: theme.subText }]}>{t('diffAutoReviseHint')}</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button"
            style={[styles.sideCard, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}
            onPress={() => enterMode('manual')}
            disabled={disabled}
            activeOpacity={0.85}
          >
            <Ionicons name="git-compare-outline" size={22} color={theme.subText} style={{ marginBottom: 8 }} />
            <Text style={[styles.sideCardLabel, { color: theme.text }]}>{t('diffManualCompare')}</Text>
            <Text style={[styles.sideCardHint, { color: theme.subText }]}>{t('diffManualCompareHint')}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity accessibilityRole="button"
          style={[
            styles.sideCard,
            { backgroundColor: theme.cardBg, borderColor: theme.accent, marginTop: 8 },
          ]}
          onPress={() => enterMode('verify')}
          disabled={disabled}
          activeOpacity={0.85}
        >
          <Ionicons
            name={lockPremium ? 'lock-closed-outline' : 'shield-checkmark-outline'}
            size={22}
            color={theme.accent}
            style={{ marginBottom: 8 }}
          />
          <Text style={[styles.sideCardLabel, { color: theme.text }]}>{t('verifyMode')}</Text>
          <Text style={[styles.sideCardHint, { color: theme.subText }]}>{t('verifyModeHint')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity accessibilityRole="button"
        onPress={() => {
          setMode(null);
          setResult(null);
        }}
        style={{ marginBottom: 10 }}
      >
        <Text style={{ color: theme.accent, fontWeight: '700' }}>{t('diffChangeMode')}</Text>
      </TouchableOpacity>

      {mode === 'auto' ? (
        <>
          <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('diffAutoReviseHint')}</Text>
          {String(sourceText || original || '').trim() ? (
            <ScrollView nestedScrollEnabled style={{ maxHeight: 140, marginBottom: 10 }}>
              <Text style={[styles.counterText, { color: theme.subText }]}>
                {safeDisplayText(sourceText || original)}
              </Text>
            </ScrollView>
          ) : null}
          <TouchableOpacity accessibilityRole="button"
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleAutoRevise}
            disabled={disabled || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#080C14" />
            ) : (
              <Text style={styles.primaryButtonText}>{t('diffAutoReviseAction')}</Text>
            )}
          </TouchableOpacity>
        </>
      ) : mode === 'verify' ? (
        <>
          <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('verifyModeHint')}</Text>
          <Text style={[styles.label, { color: theme.subText }]}>{t('diffRevised')}</Text>
          <TextInput accessibilityLabel={t('verifyPasteNewHint')}
            style={[
              styles.input,
              styles.textArea,
              diffArea,
              { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor },
            ]}
            placeholder={t('verifyPasteNewHint')}
            placeholderTextColor={theme.subText}
            value={revised}
            onChangeText={setRevised}
            selection={pinCaret ? revSel : undefined}
            onSelectionChange={() => {
              if (pinCaret) setPinCaret(false);
            }}
            multiline
            editable={!disabled && !loading}
          />
          {!String(revised || '').trim() ? (
            <Text style={[styles.sectionHint, { color: theme.accent, marginTop: 4 }]}>
              {t('verifyPasteNewHint')}
            </Text>
          ) : (
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: -8 }]}>
              {revised.length}
            </Text>
          )}
          <TouchableOpacity accessibilityRole="button"
            style={[
              styles.primaryButton,
              (loading || !String(revised || '').trim()) && styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            disabled={disabled || loading || !String(revised || '').trim()}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#080C14" />
            ) : (
              <Text style={styles.primaryButtonText}>{t('verifyAction')}</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('diffHint')}</Text>
          <Text style={[styles.label, { color: theme.subText }]}>{t('diffOriginal')}</Text>
          <TextInput accessibilityLabel={t('diffOriginal')}
            style={[
              styles.input,
              styles.textArea,
              diffArea,
              { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor },
            ]}
            placeholder={t('diffOriginal')}
            placeholderTextColor={theme.subText}
            value={original}
            onChangeText={setOriginal}
            selection={pinCaret ? origSel : undefined}
            onSelectionChange={() => {
              if (pinCaret) setPinCaret(false);
            }}
            multiline
            editable={!disabled && !loading}
          />
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: -8 }]}>
            {original.length}
          </Text>

          <Text style={[styles.label, { color: theme.subText }]}>{t('diffRevised')}</Text>
          <TextInput accessibilityLabel={t('diffRevised')}
            style={[
              styles.input,
              styles.textArea,
              diffArea,
              { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor },
            ]}
            placeholder={t('diffRevised')}
            placeholderTextColor={theme.subText}
            value={revised}
            onChangeText={setRevised}
            selection={pinCaret ? revSel : undefined}
            onSelectionChange={() => {
              if (pinCaret) setPinCaret(false);
            }}
            multiline
            editable={!disabled && !loading}
          />
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: -8 }]}>
            {revised.length}
          </Text>

          <TouchableOpacity accessibilityRole="button"
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleManualCompare}
            disabled={disabled || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#080C14" />
            ) : (
              <Text style={styles.primaryButtonText}>{t('diffCompare')}</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {renderResult()}
    </View>
  );
}
