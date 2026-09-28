import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
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
import HonestyFold from '../components/HonestyFold';
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

const filterFace = {
  includeFontPadding: false,
  textAlignVertical: 'center',
  fontSize: 12,
  fontWeight: '600',
  lineHeight: 16,
};

const SHORT_RISK_KEY = { RED: 'ux30High', YELLOW: 'ux30Mid', GREEN: 'ux30Low' };

function FilterButton({ theme, open, active, label, onToggle, buttonRef }) {
  return (
    <View ref={buttonRef} collapsable={false} style={{ flex: 1, minWidth: 0 }}>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          height: 40,
          borderWidth: 1,
          borderColor: active || open ? ACCENT : theme.borderColor,
          backgroundColor: active ? 'rgba(0, 245, 212, 0.12)' : theme.cardBg,
          borderRadius: 12,
          paddingHorizontal: 10,
        }}
      >
        <Text numberOfLines={1} style={[{ flex: 1, color: active || open ? ACCENT : theme.text }, filterFace]}>
          {label}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={active || open ? ACCENT : theme.subText} />
      </TouchableOpacity>
    </View>
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
  const [openMenu, setOpenMenu] = useState(null);
  const [menuBox, setMenuBox] = useState(null);
  const rootRef = useRef(null);
  const riskBtnRef = useRef(null);
  const lifeBtnRef = useRef(null);

  const closeMenu = useCallback(() => {
    setOpenMenu(null);
    setMenuBox(null);
  }, []);

  const toggleMenu = useCallback((which) => {
    if (openMenu === which) {
      setOpenMenu(null);
      setMenuBox(null);
      return;
    }
    const btn = which === 'risk' ? riskBtnRef.current : lifeBtnRef.current;
    const root = rootRef.current;
    if (!btn || !root || typeof btn.measureInWindow !== 'function' || typeof root.measureInWindow !== 'function') {
      setOpenMenu(null);
      setMenuBox(null);
      return;
    }
    const place = () => {
      root.measureInWindow((rx, ry) => {
        btn.measureInWindow((x, y, width, height) => {
          if (!width || !height) {
            setMenuBox(null);
            setOpenMenu(null);
            return;
          }
          setMenuBox({
            top: Math.round(y - ry + height + 4),
            left: Math.round(x - rx),
            width: Math.round(width),
          });
          setOpenMenu(which);
        });
      });
    };
    requestAnimationFrame(place);
  }, [openMenu]);

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

  const listData = history.length === 0 ? [] : visible;
  const showFirstSpinner = loading && history.length === 0;
  const riskChoices = HISTORY_RISK_FILTERS.filter((code) => code !== 'all');
  const lifeChoices = HISTORY_LIFECYCLE_FILTERS.filter((code) => code !== 'all');
  const riskMenuLabel = risk === 'all' ? t('ux30Risk') : t(SHORT_RISK_KEY[risk] || 'ux30Risk');
  const lifeMenuLabel = lifecycle === 'all' ? t('ux30Life') : t(lifecycleLabelKey(lifecycle));
  const menuOptions = openMenu === 'risk'
    ? riskChoices.map((code) => ({
        code,
        label: t(SHORT_RISK_KEY[code]),
        selected: risk === code,
      }))
    : openMenu === 'life'
      ? lifeChoices.map((code) => ({
          code,
          label: t(lifecycleLabelKey(code)),
          selected: lifecycle === code,
        }))
      : [];

  const listHeader = useMemo(() => (
    <View>
      <Text style={[styles.sectionHeader, { color: theme.text, marginBottom: 8 }]}>
        {t('historyTitle')}
      </Text>
      <HonestyFold theme={theme} label={t('foldLabel')} showLabel={t('foldShow')} hideLabel={t('foldHide')}>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux21Cloud')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux21Delete')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux21Share')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux21Preview')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux21Chat')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux21NoWin')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux21Guides')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 12 }]}>{t('ux21Disclaimer')}</Text>
      </HonestyFold>

      <RecentChatsList theme={theme} compact pinTitle onOpen={() => onOpenChat?.()} />

      <View style={{ marginTop: 8, marginBottom: 8 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder=""
          accessibilityLabel={t('ux23Search')}
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBg,
              color: theme.text,
              borderColor: theme.borderColor,
              marginTop: 0,
              marginBottom: 0,
            },
          ]}
        />
        {query ? null : (
          <Text
            pointerEvents="none"
            numberOfLines={1}
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              top: 0,
              height: 48,
              lineHeight: 48,
              color: theme.subText,
              fontSize: 14,
              includeFontPadding: false,
              textAlignVertical: 'center',
            }}
          >
            {t('ux23Search')}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 40, gap: 6 }}>
        <TouchableOpacity
          onPress={() => {
            setRisk('all');
            setLifecycle('all');
            closeMenu();
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: risk === 'all' && lifecycle === 'all' }}
          style={{
            flex: 1.15,
            minWidth: 0,
            height: 40,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: risk === 'all' && lifecycle === 'all' ? ACCENT : theme.borderColor,
            backgroundColor: risk === 'all' && lifecycle === 'all' ? 'rgba(0, 245, 212, 0.12)' : theme.cardBg,
            borderRadius: 12,
            paddingHorizontal: 10,
          }}
        >
          <Text numberOfLines={1} style={[{ flex: 1, color: risk === 'all' && lifecycle === 'all' ? ACCENT : theme.text }, filterFace]}>
            {t('ux23Filter')}
          </Text>
        </TouchableOpacity>
        <FilterButton
          theme={theme}
          buttonRef={riskBtnRef}
          open={openMenu === 'risk'}
          active={risk !== 'all'}
          label={riskMenuLabel}
          onToggle={() => toggleMenu('risk')}
        />
        <FilterButton
          theme={theme}
          buttonRef={lifeBtnRef}
          open={openMenu === 'life'}
          active={lifecycle !== 'all'}
          label={lifeMenuLabel}
          onToggle={() => toggleMenu('life')}
        />
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
      <HonestyFold theme={theme} label={t('foldLabel')} showLabel={t('foldShow')} hideLabel={t('foldHide')}>
        <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6, marginBottom: 6 }]}>{t('ux23Register')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux30Query')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('ux23Guides')}</Text>
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 12 }]}>{t('ux23Disclaimer')}</Text>
      </HonestyFold>
    </View>
  ), [
    closeMenu,
    exportRegister,
    exporting,
    history.length,
    lifeMenuLabel,
    lifecycle,
    onOpenChat,
    openMenu,
    query,
    risk,
    riskMenuLabel,
    t,
    theme,
    toggleMenu,
    visible.length,
  ]);

  return (
    <View ref={rootRef} collapsable={false} style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 4 }}>
      <FlatList
        style={{ flex: 1 }}
        data={listData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        onScrollBeginDrag={closeMenu}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          showFirstSpinner ? (
            <ActivityIndicator color="#00F5D4" size="large" style={{ marginTop: 40 }} />
          ) : history.length === 0 ? (
            sessions.length ? null : (
              <TouchableOpacity onPress={() => onOpenAnalyze?.()} accessibilityRole="button">
                <Text style={{ color: theme.subText, textAlign: 'center', marginTop: 40 }}>{t('noHistory')}</Text>
                <Text style={{ color: ACCENT, textAlign: 'center', marginTop: 8 }}>{t('ux23Empty')}</Text>
              </TouchableOpacity>
            )
          ) : (
            <Text style={{ color: theme.subText, textAlign: 'center', marginTop: 24 }}>{t('ux23Empty')}</Text>
          )
        }
      />
      </View>
      {openMenu && menuBox ? (
        <Pressable
          onPress={closeMenu}
          accessible={false}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20, elevation: 11 }}
        />
      ) : null}
      {openMenu && menuBox ? (
        <View
          style={{
            position: 'absolute',
            top: menuBox.top,
            left: menuBox.left,
            width: menuBox.width,
            zIndex: 30,
            elevation: 12,
            borderWidth: 1,
            borderColor: theme.borderColor,
            backgroundColor: theme.cardBg,
            borderRadius: 12,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOpacity: 0.28,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option.code}
              onPress={() => {
                if (openMenu === 'risk') setRisk(option.code);
                else setLifecycle(option.code);
                closeMenu();
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: option.selected }}
              style={{
                height: 40,
                paddingHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text numberOfLines={1} style={[{ flex: 1, color: option.selected ? ACCENT : theme.text }, filterFace]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}
