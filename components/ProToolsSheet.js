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
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';

import { ACCENT, DANGER, WARNING, styles } from '../theme';
import { PRO_TOOL_ERROR_CODES, fetchProToolQuota, runProTool } from '../services/proTools';
import { loadCases, noteEvidence, saveCases } from '../services/caseFileStore';
import { CASE_AREAS, CASE_AREA_ICONS, addEvent, addEvidence } from '../utils/caseFiles';
import {
  PLAN_LIMITS,
  PRO_MATERIAL_MAX,
  PRO_MATERIAL_MIN,
  PRO_POSITION_MAX,
  PRO_TOOLS,
  PRO_TOOL_ICONS,
  caseMaterial,
  chronologyToCaseEvents,
  formatToolText,
  isProfessionalPlan,
  toolNoteText,
} from '../utils/plan';
import { describeError } from '../utils/errors';
import { useFeedback } from '../context/FeedbackContext';
import { ReportAiButton } from './AiReportSheet';
import KeyboardSafeSheet, { useKeyboardSafeSheet } from './KeyboardSafeSheet';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.92);
const LOCKED_FEATURES = ['planProfessionalFeature2', 'planProfessionalFeature3', 'planProfessionalFeature4', 'planProfessionalFeature6'];

export default function ProToolsSheet({
  visible,
  theme,
  country = 'auto',
  plan = 'free',
  seed = null,
  onNeedPaywall,
  onClose,
}) {
  const { t, i18n } = useTranslation();
  const { showToast } = useFeedback();
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX });
  const appliedSeedRef = useRef(null);
  const professional = isProfessionalPlan(plan);

  const [tool, setTool] = useState('chronology');
  const [material, setMaterial] = useState('');
  const [position, setPosition] = useState('');
  const [area, setArea] = useState('other');
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState(null);
  const [quota, setQuota] = useState(null);
  const [result, setResult] = useState(null);
  const [runId, setRunId] = useState('');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;
    let alive = true;
    Promise.all([loadCases(), professional ? fetchProToolQuota() : Promise.resolve(null)]).then(([list, remote]) => {
      if (!alive) return;
      setCases(list);
      if (remote) setQuota(remote);
    });
    return () => {
      alive = false;
    };
  }, [visible, professional]);

  const pickCase = (item) => {
    if (!item) {
      setCaseId(null);
      return;
    }
    setCaseId(item.id);
    setArea(item.area);
    setMaterial(caseMaterial(item, t));
    setResult(null);
  };

  // Applied once per seed object, so a paywall round-trip keeps whatever the user typed since.
  useEffect(() => {
    if (!visible || !seed || appliedSeedRef.current === seed) return;
    appliedSeedRef.current = seed;
    if (PRO_TOOLS.includes(seed.tool)) setTool(seed.tool);
    if (seed.caseItem) {
      setCaseId(seed.caseItem.id);
      setArea(seed.caseItem.area);
      setMaterial(caseMaterial(seed.caseItem, t));
    }
    setResult(null);
  }, [visible, seed, t]);

  const attached = cases.find((item) => item.id === caseId) || null;
  const outOfQuota = !!quota && quota.remaining <= 0;
  const tooShort = material.trim().length < PRO_MATERIAL_MIN;

  const handleRun = async () => {
    if (!professional) {
      onNeedPaywall?.();
      return;
    }
    if (tooShort) {
      showToast(t('ptMaterialShort'), { type: 'warning' });
      return;
    }
    if (outOfQuota) {
      showToast(t('ptQuotaDone'), { type: 'warning', duration: 3200 });
      return;
    }
    setWorking(true);
    try {
      const out = await runProTool({ tool, material: material.trim(), position: position.trim(), area, country, lang: i18n.language });
      if (out.quota) setQuota(out.quota);
      setResult(out.result);
      setRunId(`pt${Date.now().toString(36)}`);
      sheet.scrollRef.current?.scrollTo?.({ y: 0, animated: false });
    } catch (error) {
      if (error?.quota) setQuota(error.quota);
      if (error?.code === PRO_TOOL_ERROR_CODES.PLAN) onNeedPaywall?.();
      else if (error?.code === PRO_TOOL_ERROR_CODES.QUOTA) showToast(t('ptQuotaDone'), { type: 'warning', duration: 3200 });
      else if (error?.code === PRO_TOOL_ERROR_CODES.UNAVAILABLE) showToast(t('ptUnavailable'), { type: 'warning', duration: 3200 });
      else if (error?.code === PRO_TOOL_ERROR_CODES.INVALID) showToast(t('ptMaterialShort'), { type: 'warning' });
      else showToast(`${describeError(t, error)} ${t('ptFailedNote')}`, { type: 'error', duration: 3600 });
    } finally {
      setWorking(false);
    }
  };

  const title = attached?.title || '';
  const fullText = () => formatToolText(result, t, { title, disclaimer: t('ptDisclaimer') });

  const handleCopy = async () => {
    await Clipboard.setStringAsync(fullText());
    showToast(t('ptCopied'), { type: 'success' });
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: fullText() });
    } catch {
      /* user cancelled */
    }
  };

  const updateCase = async (mutate) => {
    const list = await loadCases();
    const target = list.find((item) => item.id === caseId);
    if (!target) return null;
    const next = mutate(target);
    if (!next) return null;
    const saved = list.map((item) => (item.id === target.id ? next : item));
    await saveCases(saved);
    setCases(saved);
    return next;
  };

  const addToTimeline = async () => {
    let added = 0;
    await updateCase((target) => {
      let next = target;
      for (const event of chronologyToCaseEvents(result, target)) {
        const out = addEvent(next, event);
        if (!out) break;
        next = out.item;
        added += 1;
      }
      return added ? next : null;
    });
    showToast(added ? t('ptAddedToTimeline', { count: added }) : t('ptNothingToAdd'), { type: added ? 'success' : 'info' });
  };

  const saveNote = async () => {
    const note = toolNoteText(result, t, { title, disclaimer: t('ptDisclaimer') });
    const next = await updateCase((target) => addEvidence(target, noteEvidence({ label: t(`ptTool_${result.tool}`), note })));
    showToast(next ? t('ptSavedToCase') : t('ptSaveFailed'), { type: next ? 'success' : 'warning' });
  };

  const openUrl = (url) => {
    Linking.openURL(url).catch(() => showToast(t('askLinkFailed'), { type: 'error' }));
  };

  const bodyText = [styles.sectionHint, { color: theme.text, fontSize: 13, lineHeight: 19, marginBottom: 0 }];
  const box = { borderWidth: 1, borderColor: theme.borderColor, borderRadius: 12, padding: 12, marginBottom: 8 };
  const inputStyle = [
    styles.chatInput,
    { flex: 0, textAlignVertical: 'top', backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor, marginBottom: 10 },
  ];
  const sectionTitle = (key, icon, color = ACCENT) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, marginBottom: 6 }}>
      <Ionicons name={icon} size={15} color={color} />
      <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>{t(key)}</Text>
    </View>
  );
  const chip = (key, on, label, onPress, icon) => (
    <TouchableOpacity
      key={key}
      onPress={onPress}
      disabled={working}
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
  const bullets = (items, prefix) =>
    items.map((item, index) => (
      <Text key={`${prefix}-${index}`} style={[bodyText, { marginBottom: 4 }]}>
        • {item}
      </Text>
    ));
  const linkBtn = (icon, labelKey, onPress) => (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={16} color={ACCENT} />
      <Text style={[styles.label, { color: ACCENT, marginBottom: 0 }]}>{t(labelKey)}</Text>
    </TouchableOpacity>
  );

  const renderLocked = () => (
    <View>
      <View style={{ ...box, borderColor: ACCENT, backgroundColor: `${ACCENT}11` }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Ionicons name="ribbon-outline" size={18} color={ACCENT} />
          <Text style={[styles.settingLabel, { color: theme.text, flex: 1, fontSize: 15 }]}>{t('ptLockedTitle')}</Text>
        </View>
        <Text style={bodyText}>{t('ptLockedBody')}</Text>
      </View>
      {LOCKED_FEATURES.map((key) => (
        <View key={key} style={styles.paywallFeatureRow}>
          <Ionicons name="checkmark-circle" size={17} color={ACCENT} />
          <Text style={[styles.paywallFeatureText, { color: theme.text }]}>{t(key)}</Text>
        </View>
      ))}
    </View>
  );

  const renderIntake = () => (
    <View>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('ptHint')}</Text>
      {chipRow(PRO_TOOLS.map((value) => chip(value, tool === value, t(`ptTool_${value}`), () => setTool(value), PRO_TOOL_ICONS[value])))}
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t(`ptToolHint_${tool}`)}</Text>
      {cases.length ? (
        <>
          <Text style={[styles.label, { color: theme.subText }]}>{t('ptFromCase')}</Text>
          {chipRow([
            chip('none', !caseId, t('askNoCase'), () => pickCase(null), 'remove-circle-outline'),
            ...cases.map((item) => chip(item.id, caseId === item.id, item.title, () => pickCase(item), CASE_AREA_ICONS[item.area])),
          ])}
        </>
      ) : null}
      <Text style={[styles.label, { color: theme.subText }]}>{t('caseAreaLabel')}</Text>
      {chipRow(CASE_AREAS.map((value) => chip(value, area === value, t(`caseArea_${value}`), () => setArea(value), CASE_AREA_ICONS[value])))}
      <Text style={[styles.label, { color: theme.subText }]}>{t('ptMaterialLabel')}</Text>
      <TextInput
        {...sheet.field('ptMaterial', { multiline: true })}
        style={[inputStyle, { minHeight: 140 }]}
        value={material}
        onChangeText={setMaterial}
        placeholder={t('ptMaterialPlaceholder')}
        placeholderTextColor={theme.subText}
        multiline
        maxLength={PRO_MATERIAL_MAX}
        editable={!working}
      />
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: -6 }]}>
        {t('ptMaterialCount', { count: material.length, max: PRO_MATERIAL_MAX })}
      </Text>
      <Text style={[styles.label, { color: theme.subText }]}>{t('ptPositionLabel')}</Text>
      <TextInput
        {...sheet.field('ptPosition', { multiline: true })}
        style={[inputStyle, { minHeight: 60 }]}
        value={position}
        onChangeText={setPosition}
        placeholder={t('ptPositionPlaceholder')}
        placeholderTextColor={theme.subText}
        multiline
        maxLength={PRO_POSITION_MAX}
        editable={!working}
      />
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
        <Ionicons name="lock-closed-outline" size={13} color={theme.subText} />
        <Text style={[styles.sectionHint, { color: theme.subText, flex: 1, marginBottom: 0 }]}>{t('ptPrivacy')}</Text>
      </View>
      {quota ? (
        <Text style={[styles.sectionHint, { color: quota.remaining > 0 ? theme.subText : WARNING, marginTop: 6 }]}>
          {t('ptQuotaLeft', { count: quota.remaining, total: quota.limit })}
        </Text>
      ) : null}
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 8, marginBottom: 0 }]}>
        {t('ux14Quota', { toolsDaily: String(PLAN_LIMITS.professional.toolsDaily) })}
      </Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux14Server')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux14Plan')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux14Material')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux14Sources')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux14NoAdvice')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 0 }]}>{t('ux14Device')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 12 }]}>{t('ux14Disclaimer')}</Text>
    </View>
  );

  const renderChronology = () => (
    <>
      {sectionTitle('ptEvents', 'git-commit-outline')}
      {result.events.map((ev, index) => (
        <View key={`ev-${index}`} style={{ borderLeftWidth: 2, borderLeftColor: ev.certainty === 'EXACT' ? ACCENT : WARNING, paddingLeft: 12, marginBottom: 12 }}>
          <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>
            {ev.date || '—'} · {t(`ptCertainty_${ev.certainty}`)}
          </Text>
          <Text style={[styles.settingLabel, { color: theme.text, fontSize: 14, marginTop: 2 }]}>{ev.event}</Text>
          {ev.significance ? <Text style={[bodyText, { marginTop: 2 }]}>{ev.significance}</Text> : null}
          {ev.source ? (
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 2, marginBottom: 0 }]}>
              {t('ptSource')}: {ev.source}
            </Text>
          ) : null}
        </View>
      ))}
      {result.gaps.length ? sectionTitle('ptGaps', 'help-circle-outline', WARNING) : null}
      {bullets(result.gaps, 'gap')}
      {result.conflicts.length ? sectionTitle('ptConflicts', 'alert-circle-outline', DANGER) : null}
      {bullets(result.conflicts, 'conflict')}
      {caseId ? (
        <TouchableOpacity style={[styles.secondaryBtn, { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 12 }]} onPress={addToTimeline}>
          <Ionicons name="add-circle-outline" size={16} color={ACCENT} />
          <Text style={styles.secondaryBtnText}>{t('ptAddToTimeline')}</Text>
        </TouchableOpacity>
      ) : null}
    </>
  );

  const renderIssues = () => (
    <>
      {result.threshold.length ? sectionTitle('ptThreshold', 'flag-outline', WARNING) : null}
      {bullets(result.threshold, 'th')}
      {sectionTitle('ptIssues', 'git-compare-outline')}
      {result.issues.map((issue, index) => (
        <View key={`issue-${index}`} style={box}>
          <Text style={[styles.settingLabel, { color: theme.text, fontSize: 14 }]}>
            {index + 1}. {issue.question}
          </Text>
          {issue.position ? (
            <Text style={[bodyText, { marginTop: 6 }]}>
              <Text style={{ color: ACCENT, fontWeight: '700' }}>{t('ptPosition')}: </Text>
              {issue.position}
            </Text>
          ) : null}
          {issue.counter ? (
            <Text style={[bodyText, { marginTop: 6 }]}>
              <Text style={{ color: DANGER, fontWeight: '700' }}>{t('ptCounter')}: </Text>
              {issue.counter}
            </Text>
          ) : null}
          {issue.factsNeeded.length ? (
            <Text style={[bodyText, { marginTop: 6 }]}>
              <Text style={{ fontWeight: '700' }}>{t('ptFactsNeeded')}: </Text>
              {issue.factsNeeded.join('; ')}
            </Text>
          ) : null}
          {issue.evidence.length ? (
            <Text style={[bodyText, { marginTop: 6 }]}>
              <Text style={{ fontWeight: '700' }}>{t('ptEvidence')}: </Text>
              {issue.evidence.join('; ')}
            </Text>
          ) : null}
          {issue.burden ? (
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6, marginBottom: 0 }]}>
              {t('ptBurden')}: {issue.burden}
            </Text>
          ) : null}
        </View>
      ))}
      {result.levers.length ? sectionTitle('ptLevers', 'swap-horizontal-outline') : null}
      {bullets(result.levers, 'lever')}
    </>
  );

  const renderMemo = () => (
    <>
      {result.question ? (
        <Text style={[bodyText, { marginBottom: 8 }]}>
          <Text style={{ fontWeight: '700' }}>{t('ptQuestion')}: </Text>
          {result.question}
        </Text>
      ) : null}
      <View style={{ ...box, borderColor: ACCENT }}>
        <Text style={[styles.label, { color: theme.subText, marginBottom: 4 }]}>{t('ptShortAnswer')}</Text>
        <Text style={[bodyText, { fontSize: 14, lineHeight: 21 }]}>{result.shortAnswer}</Text>
      </View>
      {result.analysis.length ? sectionTitle('ptAnalysis', 'reader-outline') : null}
      {result.analysis.map((part, index) => (
        <View key={`an-${index}`} style={{ marginBottom: 10 }}>
          {part.heading ? <Text style={[styles.settingLabel, { color: theme.text, fontSize: 14 }]}>{part.heading}</Text> : null}
          <Text style={[bodyText, { marginTop: 2 }]}>{part.text}</Text>
        </View>
      ))}
      {result.authorities.length ? sectionTitle('ptAuthorities', 'library-outline', WARNING) : null}
      {result.authorities.map((item, index) => (
        <View key={`au-${index}`} style={{ ...box, borderColor: WARNING }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: WARNING, fontSize: 11, fontWeight: '800' }}>{t('ptVerifyBadge').toUpperCase()}</Text>
            <Text style={[styles.settingLabel, { color: theme.text, fontSize: 14, flex: 1 }]}>{item.title}</Text>
          </View>
          {item.why ? <Text style={[bodyText, { marginTop: 4 }]}>{item.why}</Text> : null}
          {item.url ? (
            <TouchableOpacity onPress={() => openUrl(item.url)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <Ionicons name="open-outline" size={14} color={ACCENT} />
              <Text style={[styles.sectionHint, { color: ACCENT, marginBottom: 0 }]} numberOfLines={1}>
                {item.host}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ))}
      {result.authorities.length ? <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('ptAuthoritiesHint')}</Text> : null}
      {result.openQuestions.length ? sectionTitle('ptOpenQuestions', 'help-circle-outline', WARNING) : null}
      {bullets(result.openQuestions, 'oq')}
      {result.nextSteps.length ? sectionTitle('ptNextSteps', 'footsteps-outline') : null}
      {result.nextSteps.map((step, index) => (
        <Text key={`ns-${index}`} style={[bodyText, { marginBottom: 6 }]}>
          {index + 1}. {step}
        </Text>
      ))}
    </>
  );

  const renderResult = () => (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Ionicons name={PRO_TOOL_ICONS[result.tool]} size={16} color={ACCENT} />
        <Text style={[styles.label, { color: ACCENT, marginBottom: 0, flex: 1 }]} numberOfLines={1}>
          {t(`ptTool_${result.tool}`)}
          {title ? ` · ${title}` : ''}
        </Text>
      </View>
      {result.jurisdictionNote ? <Text style={[styles.sectionHint, { color: theme.subText }]}>{result.jurisdictionNote}</Text> : null}
      {result.summary ? <Text style={[bodyText, { marginBottom: 6 }]}>{result.summary}</Text> : null}
      {result.tool === 'chronology' ? renderChronology() : result.tool === 'issues' ? renderIssues() : renderMemo()}

      {caseId ? (
        <TouchableOpacity style={[styles.secondaryBtn, { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 8 }]} onPress={saveNote}>
          <Ionicons name="folder-open-outline" size={16} color={ACCENT} />
          <Text style={styles.secondaryBtnText}>{t('ptSaveToCase')}</Text>
        </TouchableOpacity>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 16 }}>
        {linkBtn('copy-outline', 'ptCopy', handleCopy)}
        {linkBtn('share-outline', 'ptShare', handleShare)}
        <View style={{ flex: 1 }} />
        <ReportAiButton theme={theme} featureId="pro_tools" targetId={runId} country={country} context={fullText()} />
      </View>

      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 14, marginBottom: 0 }]}>{t('ux14Disclaimer')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('ptDisclaimer')}</Text>
    </View>
  );

  const footer = () => {
    if (working) return null;
    if (result) {
      return (
        <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={() => setResult(null)}>
          <Text style={styles.secondaryBtnText}>{t('ptNewRun')}</Text>
        </TouchableOpacity>
      );
    }
    if (!professional) {
      return (
        <TouchableOpacity style={[styles.primaryButton, { marginTop: 8 }]} onPress={() => onNeedPaywall?.()}>
          <Text style={styles.primaryButtonText}>{t('ptUpgrade')}</Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={[styles.primaryButton, { marginTop: 8 }, (tooShort || outOfQuota) && styles.buttonDisabled]}
        onPress={handleRun}
      >
        <Text style={styles.primaryButtonText}>{t('ptRun', { tool: t(`ptTool_${tool}`) })}</Text>
      </TouchableOpacity>
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
            <Ionicons name="ribbon-outline" size={20} color={ACCENT} />
            <Text style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]} numberOfLines={2}>
              {t('ptTitle')}
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
                <Text style={[styles.sectionHint, { color: theme.subText, textAlign: 'center' }]}>{t('ptRunning')}</Text>
              </View>
            ) : result ? (
              renderResult()
            ) : professional ? (
              renderIntake()
            ) : (
              renderLocked()
            )}
          </KeyboardSafeSheet>

          {footer()}
        </View>
      </View>
    </Modal>
  );
}
