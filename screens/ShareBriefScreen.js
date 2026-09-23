import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ACCENT, DANGER, SUCCESS, WARNING, getRiskColor, styles } from '../theme';
import { fetchShareSnapshot } from '../services/shareBrief';
import { SHARE_CODE_RE } from '../utils/shareSnapshot';

const trapItems = (trap) => {
  if (Array.isArray(trap)) return trap;
  if (trap && typeof trap === 'object') {
    return Object.entries(trap).map(([key, value]) => ({
      label: key,
      date: value?.date_or_rule || value?.date || '',
      note: value?.note || '',
    }));
  }
  return [];
};

const ACTION_TONE = {
  SIGN: SUCCESS,
  NEGOTIATE: WARNING,
  WALK_AWAY: DANGER,
};

export default function ShareBriefScreen({ theme, code, snapshot: providedSnapshot, onClose, onScanOwn }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (providedSnapshot && typeof providedSnapshot === 'object') {
      const packed = JSON.stringify(providedSnapshot);
      if (/contract_text|contractText|originalText/.test(packed)) {
        setSnapshot(null);
        setMissing(true);
        setLoading(false);
        return undefined;
      }
      setSnapshot(providedSnapshot);
      setMissing(false);
      setLoading(false);
      return undefined;
    }
    const trimmed = String(code || '').trim().toUpperCase();
    if (!SHARE_CODE_RE.test(trimmed)) {
      setMissing(true);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setMissing(false);
    fetchShareSnapshot(trimmed)
      .then((data) => {
        if (!cancelled) setSnapshot(data);
      })
      .catch(() => {
        if (!cancelled) {
          setSnapshot(null);
          setMissing(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code, providedSnapshot]);

  const decision = snapshot?.decision || {};
  const riskColor = getRiskColor(snapshot?.overallRisk);
  const actionColor = ACTION_TONE[decision.action] || WARNING;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 }}>
        <Text style={[styles.sectionHeader, { color: theme.text, flex: 1, marginBottom: 0 }]}>
          {t('shareBriefTitle')}
        </Text>
        {onClose ? (
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={22} color={theme.subText} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator color={ACCENT} size="large" style={{ marginTop: 40 }} />
      ) : missing || !snapshot ? (
        <Text style={[styles.summaryText, { color: theme.subText, margin: 20 }]}>{t('shareUnavailable')}</Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={[styles.decisionCard, { backgroundColor: theme.cardBg, borderColor: riskColor }]}>
            <Text style={[styles.decisionHeadline, { color: actionColor }]}>
              {decision.action} · {snapshot.score}/100
            </Text>
            {decision.headline ? (
              <Text style={[styles.summaryText, { color: theme.text, marginTop: 8 }]}>{decision.headline}</Text>
            ) : null}
            {(decision.reasons || []).filter(Boolean).map((reason, index) => (
              <Text key={index} style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>
                {index + 1}. {reason}
              </Text>
            ))}
            {decision.estimatedHarm ? (
              <Text style={[styles.sectionHint, { color: theme.text, marginTop: 8 }]}>{decision.estimatedHarm}</Text>
            ) : null}
          </View>

          {snapshot.summary ? (
            <Text style={[styles.summaryText, { color: theme.text, marginTop: 16 }]}>{snapshot.summary}</Text>
          ) : null}

          {(snapshot.flags || []).map((flag, index) => {
            const risk = String(flag.risk || flag.severity || 'RED').toUpperCase();
            const tone = getRiskColor(risk);
            const tinted = risk === 'YELLOW' ? 'rgba(255, 184, 0, 0.12)' : 'rgba(255, 59, 92, 0.12)';
            const chrome = risk === 'YELLOW' ? styles.yellowFlagCard : styles.redFlagCard;
            return (
              <View
                key={`${flag.title}-${index}`}
                style={[
                  chrome,
                  {
                    backgroundColor: tinted,
                    borderLeftWidth: 4,
                    borderLeftColor: tone,
                    marginTop: 12,
                    marginBottom: 0,
                  },
                ]}
              >
                <Text style={[styles.deadlineLabel, { color: tone }]}>
                  {flag.title} · {flag.severity}
                </Text>
                {flag.explanation ? (
                  <Text style={[styles.deadlineMeta, { color: theme.subText, marginTop: 6 }]}>{flag.explanation}</Text>
                ) : null}
                {flag.counterOffer ? (
                  <Text style={[styles.deadlineMeta, { color: ACCENT, marginTop: 6 }]}>{flag.counterOffer}</Text>
                ) : null}
              </View>
            );
          })}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {(snapshot.missing || []).map((item, index) => (
              <View key={`${item.playbookId}-${index}`} style={[styles.statusChip, { backgroundColor: theme.inputBg }]}>
                <Text style={[styles.statusChipText, { color: ACCENT }]}>
                  {item.playbookId} · {item.status}
                </Text>
              </View>
            ))}
          </View>

          {trapItems(snapshot.trap).map((item, index) => (
            <View key={`${item.label}-${index}`} style={[styles.deadlineRow, { borderColor: theme.borderColor }]}>
              <Text style={[styles.deadlineLabel, { color: theme.text }]}>{item.label}</Text>
              <Text style={[styles.deadlineMeta, { color: theme.subText }]}>
                {item.date} {item.note}
              </Text>
            </View>
          ))}

          {snapshot.shieldText ? (
            <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginTop: 16 }]}>
              <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 8 }]}>{t('shieldDocTitle')}</Text>
              <ScrollView nestedScrollEnabled style={{ maxHeight: 280 }}>
                <Text style={[styles.summaryText, { color: theme.subText }]}>{snapshot.shieldText}</Text>
              </ScrollView>
            </View>
          ) : null}

          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 16 }]}>
            {snapshot.disclaimer}
          </Text>
          <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>
            NexuLex AI — {t('disclaimerShort')}
          </Text>

          <TouchableOpacity style={[styles.primaryButton, { marginTop: 20 }]} onPress={onScanOwn} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>{t('shareViewerCta')}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
