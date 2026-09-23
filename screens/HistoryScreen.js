import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { DANGER, ACCENT, getRiskColor, styles } from '../theme';
import { typeKeyFromCategory } from '../constants/options';
import { normalizeAnalysis, buildLocalRadarPreview } from '../utils/analysis';
import { lifecycleLabelKey } from '../utils/lifecycle';
import { lifecycleChipStyle } from '../components/LifecycleChips';
import { supabase } from '../services/supabase';
import RiskGauge from '../components/RiskGauge';
import RecentChatsList from '../components/RecentChatsList';
import { useAdvisorChat } from '../context/AdvisorChatContext';

function historyRadarMeta(item, normalized) {
  const radar = normalized?.contractRadar || {};
  let parties = String(radar.parties || '').trim();
  let notice = String(radar.noticePeriod || '').trim();
  const source = String(
    item?.contract_text ||
      item?.contractText ||
      normalized?.contract_text ||
      normalized?.contractText ||
      ''
  ).trim();
  if ((!parties || !notice) && source.length >= 40) {
    const preview = buildLocalRadarPreview(source);
    if (!parties) parties = String(preview.parties || '').trim();
    if (!notice) notice = String(preview.noticePeriod || '').trim();
  }
  const category = String(
    item?.contract_category ||
      item?.contractCategory ||
      normalized?.contract_category ||
      normalized?.contractCategory ||
      normalized?.detected_contract_category ||
      normalized?.detectedContractCategory ||
      'general'
  ).toLowerCase();
  return {
    parties: parties || '—',
    typeKey: typeKeyFromCategory(category),
    notice: notice || '',
  };
}

// Geçmiş analizler: kart açma + sağ alt köşede minimal silme ikonu.
export default function HistoryScreen({
  theme,
  history,
  loading,
  onOpenItem,
  onDeleted,
  onOpenChat,
  getRiskLabel,
  formatDate,
  onLifecyclePress,
  onShareItem,
}) {
  const { t } = useTranslation();
  const { sessions } = useAdvisorChat();
  const [deletingId, setDeletingId] = useState(null);

  const deleteAnalysis = useCallback(
    async (item) => {
      setDeletingId(item.id);

      try {
        const { error } = await supabase.from('analyses').delete().eq('id', item.id);
        if (error) throw error;

        onDeleted(item.id);
        Alert.alert(t('successTitle'), t('deleteSuccess'));
      } catch (error) {
        console.error('Analiz silme hatası:', error);
        Alert.alert(t('errorTitle'), `${t('deleteError')}\n${error.message}`);
      } finally {
        setDeletingId(null);
      }
    },
    [onDeleted, t]
  );

  const confirmDelete = useCallback(
    (item) => {
      Alert.alert(t('deleteAnalysisTitle'), t('deleteAnalysisMessage'), [
        { text: t('cancelButton'), style: 'cancel' },
        { text: t('confirmDelete'), style: 'destructive', onPress: () => deleteAnalysis(item) },
      ]);
    },
    [deleteAnalysis, t]
  );

  const renderItem = ({ item }) => {
    const normalized = normalizeAnalysis(item);
    const isDeleting = deletingId === item.id;
    const meta = historyRadarMeta(item, normalized);

    return (
      <TouchableOpacity
        style={[
          styles.historyCard,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.borderColor,
            opacity: isDeleting ? 0.5 : 1,
          },
        ]}
        onPress={() => onOpenItem(item)}
        disabled={isDeleting}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={[styles.historyScore, { color: getRiskColor(item.overall_risk), flexShrink: 1 }]}
            numberOfLines={1}
          >
            {t('scoreText')}: {item.score}/100 · {getRiskLabel(item.overall_risk)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <TouchableOpacity
              onPress={() => onLifecyclePress?.(item)}
              activeOpacity={0.85}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {(() => {
                const chip = lifecycleChipStyle(item.lifecycle, theme, { active: true });
                return (
                  <View
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: chip.backgroundColor,
                        borderWidth: chip.borderWidth,
                        borderColor: chip.borderColor,
                        marginBottom: 0,
                      },
                    ]}
                  >
                    <Text style={[styles.statusChipText, { color: chip.color }]}>
                      {t(lifecycleLabelKey(item.lifecycle))}
                    </Text>
                  </View>
                );
              })()}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.historyDeleteBtn}
              onPress={() => confirmDelete(item)}
              disabled={isDeleting}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              accessibilityLabel={t('deleteAnalysisTitle')}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={DANGER} />
              ) : (
                <Ionicons name="trash-outline" size={17} color={DANGER} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.historyMeta, { color: theme.subText, marginTop: 4 }]}>
          {formatDate(item.created_at)}
        </Text>
        <Text
          style={[styles.historyMeta, { color: theme.text, marginTop: 4 }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {meta.parties}
        </Text>
        <Text
          style={[styles.historyMeta, { color: theme.subText, marginTop: 2 }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {t(meta.typeKey)}
          {meta.notice ? ` · ${meta.notice}` : ''}
        </Text>

        <RiskGauge
          theme={theme}
          score={item.score}
          risk={item.overall_risk}
          label={getRiskLabel(item.overall_risk)}
        />

        <Text style={[styles.historySummary, { color: theme.text }]} numberOfLines={2}>
          {item.summary}
        </Text>

        <View style={styles.historyFooter}>
          <Text style={[styles.historyMeta, { color: theme.subText, flex: 1 }]}>
            {t('clauseCountLabel', { count: normalized.clauses.length })}
          </Text>

          <TouchableOpacity
            style={styles.historyDeleteBtn}
            onPress={() => onShareItem?.(item)}
            disabled={isDeleting}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel={t('shareBriefTitle')}
          >
            <Ionicons name="share-social-outline" size={17} color={ACCENT} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
      <Text style={[styles.sectionHeader, { color: theme.text, marginBottom: 16 }]}>
        {t('historyTitle')}
      </Text>

      <RecentChatsList theme={theme} compact onOpen={() => onOpenChat?.()} />

      {loading ? (
        <ActivityIndicator color="#00F5D4" size="large" style={{ marginTop: 40 }} />
      ) : history.length === 0 ? (
        sessions.length ? null : (
          <Text style={{ color: theme.subText, textAlign: 'center', marginTop: 40 }}>
            {t('noHistory')}
          </Text>
        )
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}
