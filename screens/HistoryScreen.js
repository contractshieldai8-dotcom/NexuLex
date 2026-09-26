import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Sharing from 'expo-sharing';

import { DANGER, ACCENT, getRiskColor, styles } from '../theme';
import { typeKeyFromCategory } from '../constants/options';
import { normalizeAnalysis, buildLocalRadarPreview } from '../utils/analysis';
import { lifecycleLabelKey } from '../utils/lifecycle';
import { lifecycleChipStyle } from '../components/LifecycleChips';
import { supabase } from '../services/supabase';
import RiskGauge from '../components/RiskGauge';
import RecentChatsList from '../components/RecentChatsList';
import { useAdvisorChat } from '../context/AdvisorChatContext';
import { writeOwnedUtf8 } from '../utils/fileAccess';
import {
  HISTORY_LIFECYCLE_FILTERS,
  HISTORY_RISK_FILTERS,
  filterHistoryRows,
  formatHistoryRegisterCsv,
} from '../utils/historyRegister';

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

function FilterChip({ label, active, theme, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        borderWidth: 1,
        borderColor: active ? ACCENT : theme.borderColor,
        backgroundColor: active ? 'rgba(0, 245, 212, 0.12)' : theme.cardBg,
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      <Text style={{ color: active ? ACCENT : theme.text, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}

// Geçmiş analizler: kart açma + sağ alt köşede minimal silme ikonu.
export default function HistoryScreen({
  theme,
  history,
  loading,
  onOpenItem,
  onDeleted,
  onOpenChat,
  onOpenAnalyze,
  getRiskLabel,
  formatDate,
  onLifecyclePress,
  onShareItem,
}) {
  const { t } = useTranslation();
  const { sessions } = useAdvisorChat();
  const [deletingId, setDeletingId] = useState(null);
  const [query, setQuery] = useState('');
  const [risk, setRisk] = useState('all');
  const [lifecycle, setLifecycle] = useState('all');
  const [exporting, setExporting] = useState(false);

  const visible = useMemo(
    () =>
      filterHistoryRows(history, {
        query,
        risk,
        lifecycle,
        extra: (item) => {
          const meta = historyRadarMeta(item, normalizeAnalysis(item));
          return `${meta.parties} ${t(meta.typeKey)} ${meta.notice}`;
        },
      }),
    [history, query, risk, lifecycle, t]
  );

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

  const exportRegister = useCallback(async () => {
    if (!visible.length || exporting) return;
    setExporting(true);
    try {
      const rows = visible.map((item) => {
        const meta = historyRadarMeta(item, normalizeAnalysis(item));
        return {
          id: item.id,
          created_at: item.created_at,
          score: item.score,
          overall_risk: item.overall_risk,
          lifecycle: item.lifecycle,
          contract_category: item.contract_category || item.contractCategory,
          parties: meta.parties,
          summary: item.summary,
        };
      });
      const csv = formatHistoryRegisterCsv(rows);
      const uri = await writeOwnedUtf8(csv, 'nexulex-history-register.csv');
      if (!uri || !(await Sharing.isAvailableAsync())) {
        Alert.alert(t('errorTitle'), t('shareUnavailable'));
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'text/csv',
        dialogTitle: t('ux23Export'),
        UTI: 'public.comma-separated-values-text',
      });
    } catch (error) {
      console.warn('history register export', error);
      Alert.alert(t('errorTitle'), t('shareUnavailable'));
    } finally {
      setExporting(false);
    }
  }, [exporting, t, visible]);

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
      <Text style={[styles.sectionHeader, { color: theme.text, marginBottom: 8 }]}>
        {t('historyTitle')}
      </Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux21Cloud')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux21Delete')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux21Share')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux21Preview')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux21Chat')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux21NoWin')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux21Guides')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 12 }]}>{t('ux21Disclaimer')}</Text>

      <RecentChatsList theme={theme} compact onOpen={() => onOpenChat?.()} />

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('ux23Search')}
        placeholderTextColor={theme.subText}
        accessibilityLabel={t('ux23Search')}
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBg,
            color: theme.text,
            borderColor: theme.borderColor,
            marginTop: 8,
            marginBottom: 8,
          },
        ]}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {HISTORY_RISK_FILTERS.map((code) => (
          <FilterChip
            key={`risk-${code}`}
            theme={theme}
            active={risk === code}
            label={code === 'all' ? t('ux23Filter') : getRiskLabel(code)}
            onPress={() => setRisk(code)}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {HISTORY_LIFECYCLE_FILTERS.map((code) => (
          <FilterChip
            key={`life-${code}`}
            theme={theme}
            active={lifecycle === code}
            label={code === 'all' ? t('ux23Filter') : t(lifecycleLabelKey(code))}
            onPress={() => setLifecycle(code)}
          />
        ))}
      </View>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 6 }]}>
        {t('ux23Count', { visible: String(visible.length), total: String(history.length) })}
      </Text>
      <TouchableOpacity
        style={[styles.secondaryBtn, { marginTop: 0 }, (!visible.length || exporting) && styles.buttonDisabled]}
        onPress={() => exportRegister().catch(() => {})}
        disabled={!visible.length || exporting}
        accessibilityRole="button"
        accessibilityLabel={t('ux23Export')}
      >
        {exporting ? (
          <ActivityIndicator color={ACCENT} />
        ) : (
          <Text style={styles.secondaryBtnText}>{t('ux23Export')}</Text>
        )}
      </TouchableOpacity>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6, marginBottom: 6 }]}>{t('ux23Register')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux23Guides')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 12 }]}>{t('ux23Disclaimer')}</Text>

      {loading ? (
        <ActivityIndicator color="#00F5D4" size="large" style={{ marginTop: 40 }} />
      ) : history.length === 0 ? (
        sessions.length ? null : (
          <TouchableOpacity onPress={() => onOpenAnalyze?.()} accessibilityRole="button">
            <Text style={{ color: theme.subText, textAlign: 'center', marginTop: 40 }}>{t('noHistory')}</Text>
            <Text style={{ color: ACCENT, textAlign: 'center', marginTop: 8 }}>{t('ux23Empty')}</Text>
          </TouchableOpacity>
        )
      ) : visible.length === 0 ? (
        <Text style={{ color: theme.subText, textAlign: 'center', marginTop: 24 }}>{t('ux23Empty')}</Text>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}
