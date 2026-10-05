import React, { useRef, useState } from 'react';
import { Alert, Platform, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

import { ACCENT, DANGER, SUCCESS, WARNING, styles } from '../theme';
import {
  decisionActionKey,
  displayedDecisionAction,
  isSignBlocked,
  safeDisplayText,
} from '../utils/analysis';
import { useFeedback } from '../context/FeedbackContext';

const READY_MESSAGE_BOX_H = 152;

const ACTION_TONE = {
  SIGN: { color: SUCCESS, icon: 'checkmark-circle' },
  NEGOTIATE: { color: WARNING, icon: 'swap-horizontal' },
  WALK_AWAY: { color: DANGER, icon: 'close-circle' },
};

const LADDER_KEY = {
  ASK: 'ladderAsk',
  CONCEDE: 'ladderConcede',
  WALK: 'ladderWalk',
};

let ViewShot = View;
try {
  ViewShot = require('react-native-view-shot').default || View;
} catch {
  ViewShot = View;
}

export default function DecisionCard({
  theme,
  decision,
  score,
  risk,
  extraReasons = 0,
  onUnlock,
  onCopied,
  powerTilt = null,
  batnaLadder = [],
  signStatus = null,
  locked = false,
  onShareBrief,
  counterMessage = '',
  onCopyCounterMessage,
  onVerifyRevision,
}) {
  const { t } = useTranslation();
  const { showToast } = useFeedback();
  const shotRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [counterCopied, setCounterCopied] = useState(false);

  if (
    !decision?.headline &&
    !decision?.estimatedHarm &&
    !decision?.actionAdvice &&
    !(decision?.reasons || []).length
  ) {
    return null;
  }

  const action = displayedDecisionAction(decision, signStatus);
  const blocked = isSignBlocked(signStatus);
  const tone = ACTION_TONE[action] || ACTION_TONE.NEGOTIATE;
  const reasons = decision.reasons || [];
  const userPct = Math.max(0, Math.min(100, Number(powerTilt?.user) || 0));
  const otherPct = Math.max(0, Math.min(100, Number(powerTilt?.other) || 0));
  const readyMessage = String(counterMessage || '').trim();
  const showReadyBlock = !locked && !!readyMessage;
  const showNegotiateCta = typeof onUnlock === 'function' && (locked || extraReasons > 0);

  const copyText = async (value) => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    showToast(t('copiedToClipboard'), { type: 'success' });
  };

  const handleCopyCounter = async () => {
    if (!readyMessage) return;
    try {
      if (typeof onCopyCounterMessage === 'function') {
        await onCopyCounterMessage(readyMessage);
      } else {
        await copyText(readyMessage);
      }
      setCounterCopied(true);
      showToast(t('copiedToClipboard'), { type: 'success' });
    } catch {
      /* copy failed silently */
    }
  };

  const buildShareText = () =>
    [
      `NexuLex AI — ${t('decisionTitle')}`,
      `${t(decisionActionKey(action))} · ${score}/100 · ${t(
        risk === 'RED' ? 'riskHigh' : risk === 'GREEN' ? 'riskLow' : 'riskMedium'
      )}`,
      powerTilt
        ? `${t('tiltTitle')}: ${t('tiltUser')} ${userPct}% · ${t('tiltOther')} ${otherPct}%`
        : null,
      decision.headline,
      ...(reasons || []).map((item, index) => `${index + 1}. ${item}`),
      decision.estimatedHarm ? `${t('decisionHarmLabel')}: ${decision.estimatedHarm}` : null,
      blocked ? t('signBlockedReason') : null,
      t('decisionDisclaimer'),
    ]
      .filter(Boolean)
      .join('\n');

  const shareAsText = async () => {
    const result = await Share.share({ message: buildShareText() });
    if (result.action === Share.sharedAction) onCopied?.();
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      if (Platform.OS !== 'web' && typeof shotRef.current?.capture === 'function') {
        const uri = await shotRef.current.capture();
        if (uri && (await Sharing.isAvailableAsync())) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: t('decisionShare'),
            UTI: 'public.png',
          });
          onCopied?.();
          return;
        }
      }
      await shareAsText();
    } catch (error) {
      console.warn('Karar kartı paylaşılamadı:', error?.message);
      try {
        await shareAsText();
      } catch (fallbackError) {
        Alert.alert(t('errorTitle'), t('shareDecisionError'));
        console.warn('Karar kartı metin paylaşımı da başarısız:', fallbackError?.message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View
      style={[
        styles.decisionCard,
        { backgroundColor: theme.cardBg, borderColor: tone.color, overflow: 'visible', padding: 0 },
      ]}
    >
      <ViewShot
        ref={shotRef}
        options={{ format: 'png', quality: 1, pixelRatio: 2, result: 'tmpfile' }}
        style={{ padding: 16, paddingBottom: 24, backgroundColor: theme.cardBg, overflow: 'visible' }}
        collapsable={false}
      >
        <View style={styles.decisionHeader} collapsable={false}>
          <View style={[styles.decisionBadge, { backgroundColor: tone.color }]}>
            <Ionicons name={tone.icon} size={14} color="#080C14" />
            <Text style={styles.decisionBadgeText}>{t(decisionActionKey(action))}</Text>
          </View>
          <Text style={[styles.decisionKicker, { color: theme.subText }]}>{t('decisionTitle')}</Text>
        </View>

        {decision.headline ? (
          <Text style={[styles.decisionHeadline, { color: theme.text }]}>
            {safeDisplayText(decision.headline)}
          </Text>
        ) : null}

        {(reasons || []).map((item, index) => (
          <View key={index} style={styles.decisionReasonRow}>
            <Text style={[styles.decisionReasonIndex, { color: tone.color }]}>{index + 1}</Text>
            <Text style={[styles.decisionReasonText, { color: theme.subText }]}>
              {safeDisplayText(item)}
            </Text>
          </View>
        ))}

        {decision.estimatedHarm ? (
          <View style={[styles.decisionHarmBox, { backgroundColor: theme.inputBg }]}>
            <Text style={[styles.decisionHarmLabel, { color: tone.color }]}>
              {t('decisionHarmLabel')}
            </Text>
            <Text style={[styles.decisionHarmText, { color: theme.text }]}>
              {safeDisplayText(decision.estimatedHarm)}
            </Text>
          </View>
        ) : null}

        {powerTilt ? (
          <View
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${t('tiltUser')} ${userPct}, ${t('tiltOther')} ${otherPct}`}
            style={{ marginTop: 10 }}
          >
            <Text style={[styles.decisionHarmLabel, { color: theme.subText }]}>{t('tiltTitle')}</Text>
            <View style={[styles.tiltTrack, { backgroundColor: theme.inputBg }]}>
              <View style={[styles.tiltFill, { flex: Math.max(userPct, 0), backgroundColor: ACCENT }]} />
              <View style={[styles.tiltFill, { flex: Math.max(otherPct, 0), backgroundColor: DANGER }]} />
            </View>
            <Text style={[styles.decisionDisclaimer, { color: theme.subText, marginTop: 0 }]}>
              {t('tiltUser')} {userPct}% · {t('tiltOther')} {otherPct}%
            </Text>
            {powerTilt.label ? (
              <Text style={[styles.decisionAdvice, { color: theme.subText, marginBottom: 4 }]}>
                {safeDisplayText(powerTilt.label)}
              </Text>
            ) : null}
          </View>
        ) : null}

        {!locked && (batnaLadder || []).length ? (
          <View style={{ marginTop: 8 }}>
            <Text style={[styles.decisionHarmLabel, { color: theme.subText }]}>{t('ladderTitle')}</Text>
            {(batnaLadder || []).filter(Boolean).map((step, index) => (
              <View key={`${step?.step || index}-${index}`} style={{ marginTop: 8 }}>
                <Text style={[styles.deadlineLabel, { color: theme.text }]}>
                  {t(LADDER_KEY[step?.step] || 'ladderAsk')}
                </Text>
                {step?.ask ? (
                  <TouchableOpacity onPress={() => copyText(step.ask).catch(() => {})} activeOpacity={0.8}>
                    <Text style={[styles.decisionReasonText, { color: theme.subText }]}>
                      {safeDisplayText(step.ask)}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {step?.theirLikelyReply ? (
                  <Text style={[styles.deadlineMeta, { color: theme.subText, marginTop: 4 }]}>
                    {t('ladderTheirReply')}: {safeDisplayText(step.theirLikelyReply)}
                  </Text>
                ) : null}
                {step?.counter ? (
                  <TouchableOpacity onPress={() => copyText(step.counter).catch(() => {})} activeOpacity={0.8}>
                    <Text style={[styles.deadlineMeta, { color: ACCENT, marginTop: 4 }]}>
                      {t('ladderCounter')}: {safeDisplayText(step.counter)}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {blocked ? (
          <Text style={[styles.decisionAdvice, { color: WARNING, marginTop: 8, marginBottom: 4 }]}>
            {t('signBlockedReason')}
          </Text>
        ) : null}

        <Text style={[styles.decisionDisclaimer, { color: theme.subText, marginTop: 8 }]}>
          {t('disclaimerShort')}
        </Text>
      </ViewShot>

      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      {decision.actionAdvice ? (
        <Text style={[styles.decisionAdvice, { color: theme.subText }]}>
          {safeDisplayText(decision.actionAdvice)}
        </Text>
      ) : null}

      {showNegotiateCta ? (
        <View style={{ width: '100%', marginTop: 8 }}>
          <TouchableOpacity
            style={[styles.primaryButton, { width: '100%' }]}
            onPress={onUnlock}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText} numberOfLines={1}>
              {t('hookNegotiateTitle')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.decisionDisclaimer, { color: theme.subText, marginTop: 6 }]}>
            {t('hookNegotiateBody')}
          </Text>
        </View>
      ) : extraReasons > 0 ? (
        <TouchableOpacity onPress={onUnlock} activeOpacity={0.8}>
          <Text style={[styles.lockedMoreText, { color: ACCENT }]}>{t('lockedUnlockAll')}</Text>
        </TouchableOpacity>
      ) : null}

      {showReadyBlock ? (
        <View
          style={[
            styles.counterMessageCard,
            {
              backgroundColor: theme.inputBg || theme.cardBg,
              borderColor: theme.borderColor,
              marginTop: 10,
              marginBottom: 0,
              width: '100%',
            },
          ]}
        >
          <View style={styles.takeawayHeader}>
            <Ionicons name="send-outline" size={16} color={ACCENT} />
            <Text style={[styles.takeawayTitle, { color: theme.text, flex: 1 }]} numberOfLines={1}>
              {t('counterMessageTitle')}
            </Text>
            <TouchableOpacity
              onPress={() => handleCopyCounter().catch(() => {})}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={t('copyCounterMessage')}
            >
              <Ionicons
                name={counterCopied ? 'checkmark-circle' : 'copy-outline'}
                size={18}
                color={counterCopied ? '#00E676' : ACCENT}
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('counterMessageHint')}</Text>
          {/* Fixed-height box: the message changes with every offer tier the user taps further
              down the report, and a growing/shrinking card here would shove the whole page. */}
          <View style={{ height: READY_MESSAGE_BOX_H }}>
            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.decisionReasonText, { color: theme.text, flex: 0, flexWrap: 'wrap' }]}>
                {safeDisplayText(readyMessage)}
              </Text>
            </ScrollView>
          </View>
        </View>
      ) : null}

      {typeof onVerifyRevision === 'function' ? (
        <View style={{ width: '100%', marginTop: 10 }}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { width: '100%', marginTop: 0 }]}
            onPress={() => onVerifyRevision()}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText} numberOfLines={1}>
              {t('verifyMode')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.decisionDisclaimer, { color: theme.subText, marginTop: 6 }]}>
            {t('verifyModeHint')}
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: 'column', width: '100%', gap: 8, marginTop: 8 }}>
        <TouchableOpacity
          style={[styles.decisionShareBtn, { borderColor: theme.borderColor, width: '100%' }]}
          onPress={handleShare}
          disabled={busy}
          activeOpacity={0.85}
        >
          <Ionicons name="logo-whatsapp" size={16} color={ACCENT} />
          <Text style={styles.decisionShareText} numberOfLines={1}>{t('decisionShare')}</Text>
        </TouchableOpacity>
        {typeof onShareBrief === 'function' ? (
          <TouchableOpacity
            style={[styles.decisionShareBtn, { borderColor: theme.borderColor, width: '100%' }]}
            onPress={() => onShareBrief()}
            activeOpacity={0.85}
          >
            <Ionicons name="link-outline" size={16} color={ACCENT} />
            <Text style={styles.decisionShareText} numberOfLines={1}>{t('shareBriefTitle')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {typeof onShareBrief === 'function' ? (
        <Text style={[styles.decisionDisclaimer, { color: theme.subText, marginTop: 6 }]}>
          {t('shareBriefHint')}
        </Text>
      ) : null}
      <Text style={[styles.decisionDisclaimer, { color: theme.subText, marginTop: 8 }]}>
        {t('disclaimerCounsel')}
      </Text>
      </View>
    </View>
  );
}
