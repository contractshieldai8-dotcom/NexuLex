import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACCENT, styles } from '../theme';
import { GUIDE_FAQ_CHIPS, GUIDE_WORKFLOWS, latestChangelog, matchLegalIntent } from '../constants/appCapabilities';
import { withAvailability } from '../constants/jurisdictionPacks';
import { LEGAL_CALCULATORS, calculatorCopyKeys, getCalcPack } from '../constants/legalCalcRates';
import { DRAFT_CATALOG, resolveDraftVariant } from '../constants/draftTemplates';
import { LEGAL_SCENARIOS } from '../constants/legalScenarios';
import { resolveJurisdiction } from '../constants/jurisdiction';
import { useKeyboardSafeSheet } from './KeyboardSafeSheet';

const WIN_H = Dimensions.get('window').height;
const GUIDE_SHEET_MAX_HEIGHT = Math.round(WIN_H * 0.88);
const GUIDE_LIST_MAX_HEIGHT = Math.round(WIN_H * 0.52);
const WHATS_NEW = '__whats_new__';
const ACTION_FOR_REGISTRY = { calculator: 'openCalculator', draft: 'openDraft', scenario: 'openScenario' };

/** Registry items (with availability) that a guide workflow lists; 'none' is already dropped. */
export function guideRegistryItems(registry, { country, language }) {
  const ctx = { country, language };
  if (registry === 'calculator') {
    const pack = getCalcPack(country, language);
    return withAvailability('calculator', LEGAL_CALCULATORS, ctx).map((row) => ({
      ...row,
      titleKey: calculatorCopyKeys(row.item.id, pack).titleKey,
    }));
  }
  if (registry === 'draft') {
    const jurisdiction = resolveJurisdiction(country, language);
    return withAvailability('draft', DRAFT_CATALOG, ctx).map((row) => ({
      ...row,
      titleKey: (
        resolveDraftVariant(row.item, jurisdiction) ||
        resolveDraftVariant(row.item, 'TR') ||
        resolveDraftVariant(row.item, null)
      ).titleKey,
    }));
  }
  if (registry === 'scenario') {
    return withAvailability('scenario', LEGAL_SCENARIOS, ctx).map((row) => ({ ...row, titleKey: row.item.titleKey }));
  }
  return [];
}

export default function NexuLexGuideSheet({ visible, theme, onClose, onOpenAdvisor, onAction, country = 'auto' }) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const sheet = useKeyboardSafeSheet({
    maxHeight: GUIDE_SHEET_MAX_HEIGHT,
    bottomPadding: Math.max(insets.bottom, 0) + 16,
  });
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setActiveId(null);
    }
  }, [visible]);

  const legalHit = useMemo(
    () => matchLegalIntent(query, i18n.language),
    [query, i18n.language]
  );

  const registryItems = useMemo(() => {
    const ctx = { country, language: i18n.language };
    return {
      calculator: guideRegistryItems('calculator', ctx),
      draft: guideRegistryItems('draft', ctx),
      scenario: guideRegistryItems('scenario', ctx),
    };
  }, [country, i18n.language]);

  const workflows = useMemo(() => {
    const needle = String(query || '').trim().toLowerCase();
    if (!needle) return GUIDE_WORKFLOWS;
    return GUIDE_WORKFLOWS.filter((flow) => {
      const stepBodies = (flow.steps || []).map((step) => t(step.bodyKey));
      const itemTitles = flow.registry ? (registryItems[flow.registry] || []).map((row) => t(row.titleKey)) : [];
      const hay = [
        t(flow.titleKey),
        t(flow.hintKey),
        t(flow.chipKey),
        flow.introKey ? t(flow.introKey) : '',
        ...stepBodies,
        ...itemTitles,
      ]
        .join(' ')
        .toLowerCase();
      const faqHit = GUIDE_FAQ_CHIPS.some(
        (faq) => faq.workflowId === flow.id && t(faq.chipKey).toLowerCase().includes(needle)
      );
      return hay.includes(needle) || faqHit;
    });
  }, [query, t, i18n.language, registryItems]);

  const active = GUIDE_WORKFLOWS.find((flow) => flow.id === activeId) || null;
  const news = useMemo(() => latestChangelog(5), []);

  const listData = useMemo(() => {
    if (legalHit) return [];
    if (activeId === WHATS_NEW) {
      return news.map((entry) => ({ kind: 'news', key: entry.id, entry }));
    }
    if (active) {
      const rows = (active.steps || []).map((step, index) => ({
        kind: 'step',
        key: `${active.id}-${step.bodyKey}-${index}`,
        step,
        index,
      }));
      const items = active.registry ? registryItems[active.registry] || [] : [];
      if (items.length) {
        const availableCount = items.filter((row) => row.availability === 'available').length;
        rows.push({ kind: 'itemsHeader', key: `${active.id}-items`, count: availableCount });
        items.forEach((row) => rows.push({ kind: 'item', key: `${active.id}-${row.item.id}`, row, registry: active.registry }));
      }
      return rows;
    }
    return workflows.map((flow) => ({
      kind: 'flow',
      key: flow.id,
      flow,
    }));
  }, [legalHit, activeId, active, workflows, registryItems, news]);

  const close = () => {
    setQuery('');
    setActiveId(null);
    onClose?.();
  };

  const openAdvisor = () => {
    close();
    onOpenAdvisor?.();
  };

  const runAction = (action) => {
    if (!action) return;
    close();
    onAction?.(action);
  };

  const renderItem = ({ item }) => {
    if (item.kind === 'flow' || item.kind === 'news') {
      const flow = item.kind === 'flow' ? item.flow : GUIDE_WORKFLOWS.find((f) => f.id === item.entry.workflowId);
      if (!flow) return null;
      return (
        <TouchableOpacity accessibilityRole="button"
          onPress={() => setActiveId(flow.id)}
          activeOpacity={0.85}
          style={[
            styles.modalOption,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.borderColor,
              marginBottom: 8,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.modalOptionText, { color: theme.text }]}>
              {item.kind === 'news' ? t(item.entry.titleKey) : t(flow.titleKey)}
            </Text>
            <Text style={[styles.modalOptionHint, { color: theme.subText }]} numberOfLines={2}>
              {item.kind === 'news' ? `${item.entry.date} · ${t(flow.titleKey)}` : t(flow.hintKey)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.subText} />
        </TouchableOpacity>
      );
    }

    if (item.kind === 'itemsHeader') {
      return (
        <Text style={[styles.label, { color: theme.subText, marginTop: 4, marginBottom: 8 }]}>
          {t('guideItemsHeader', { count: item.count })}
        </Text>
      );
    }

    if (item.kind === 'item') {
      const { row, registry } = item;
      const pending = row.availability === 'pending';
      return (
        <TouchableOpacity accessibilityRole="button"
          onPress={() => runAction({ type: ACTION_FOR_REGISTRY[registry], id: row.item.id })}
          activeOpacity={0.85}
          accessibilityState={{ disabled: pending }}
          style={[
            styles.modalOption,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.borderColor,
              marginBottom: 8,
              opacity: pending ? 0.55 : 1,
            },
          ]}
        >
          <Ionicons
            name={pending ? 'lock-closed-outline' : row.item.icon || 'chevron-forward'}
            size={16}
            color={pending ? theme.subText : theme.accent}
            style={{ marginRight: 8 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.modalOptionText, { color: theme.text }]} numberOfLines={2}>
              {t(row.titleKey)}
            </Text>
            {pending ? (
              <Text style={[styles.modalOptionHint, { color: theme.subText }]}>{t('availPendingBadge')}</Text>
            ) : null}
          </View>
          {row.universal ? (
            <Ionicons name="globe-outline" size={14} color={theme.subText} accessibilityLabel={t('availUniversal')} />
          ) : null}
        </TouchableOpacity>
      );
    }

    const { step, index } = item;
    const chipStyle = [
      styles.statusChip,
      {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(212, 178, 122, 0.12)',
        borderWidth: 1,
        borderColor: theme.accent,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      },
    ];
    return (
      <View
        style={[
          styles.layerRow,
          { borderColor: theme.borderColor, marginBottom: 10, paddingBottom: 10 },
        ]}
      >
        <Text style={[styles.deadlineLabel, { color: theme.accent, marginBottom: 4 }]}>{index + 1}.</Text>
        <Text style={[styles.summaryText, { color: theme.text, marginBottom: 6 }]}>
          {t(step.bodyKey)}
        </Text>
        {step.action ? (
          <TouchableOpacity
            onPress={() => runAction(step.action)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityHint={t('guideStepGo')}
            style={chipStyle}
          >
            <Text style={[styles.statusChipText, { color: theme.accent }]} numberOfLines={1}>
              {t(step.ctaKey)}
            </Text>
            <Ionicons name="arrow-forward" size={12} color={theme.accent} />
          </TouchableOpacity>
        ) : (
          <View style={chipStyle}>
            <Text style={[styles.statusChipText, { color: theme.accent }]} numberOfLines={1}>
              {t(step.ctaKey)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const listHeader = active && !legalHit ? (
    <View style={{ marginBottom: 8 }}>
      <Text style={[styles.takeawayTitle, { color: theme.text, marginBottom: 4 }]}>
        {t(active.titleKey)}
      </Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>
        {t(active.hintKey)}
      </Text>
      {active.introKey ? (
        <Text style={[styles.summaryText, { color: theme.text, marginBottom: 10 }]}>
          {t(active.introKey)}
        </Text>
      ) : null}
    </View>
  ) : activeId === WHATS_NEW && !legalHit ? (
    <Text style={[styles.takeawayTitle, { color: theme.text, marginBottom: 8 }]}>{t('guideWhatsNew')}</Text>
  ) : null;

  const listFooter = (active || activeId === WHATS_NEW) && !legalHit ? (
    <View style={{ paddingBottom: 8 }}>
      {active?.tab === 'advisor' ? (
        <TouchableOpacity accessibilityRole="button"
          style={[styles.primaryButton, { backgroundColor: ACCENT, marginTop: 4 }]}
          onPress={openAdvisor}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>{t('guideAskAdvisorCta')}</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity accessibilityRole="button" style={[styles.secondaryBtn, { marginTop: 10 }]} onPress={() => setActiveId(null)}>
        <Text style={styles.secondaryBtnText}>{t('cancelButton')}</Text>
      </TouchableOpacity>
    </View>
  ) : null;

  const chip = (key, label, selected, onPress, icon) => (
    <TouchableOpacity accessibilityRole="button"
      key={key}
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.typeChip,
        selected && styles.typeChipActive,
        {
          flexShrink: 0,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: selected ? 'rgba(212, 178, 122, 0.18)' : theme.inputBg,
          borderColor: selected ? theme.accent : theme.borderColor,
        },
      ]}
    >
      {icon ? <Ionicons name={icon} size={12} color={selected ? theme.accent : theme.text} /> : null}
      <Text
        style={[
          styles.typeChipText,
          selected && styles.typeChipTextActive,
          { color: selected ? theme.accent : theme.text },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.modalOverlay}>
        {/* Backdrop only — sibling of sheet so list pans never become close(). */}
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={t('cancelButton')}
        />
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.borderColor,
              flexDirection: 'column',
            },
            sheet.sheetStyle,
          ]}
        >
          <View style={styles.modalHandle} />

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, { color: theme.text, marginBottom: 4 }]}>
                {t('guideTitle')}
              </Text>
              <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>
                {t('guideSubtitle')}
              </Text>
            </View>
            <TouchableOpacity accessibilityRole="button"
              onPress={close}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel={t('cancelButton')}
            >
              <Ionicons name="close" size={22} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.searchRow,
              { backgroundColor: theme.inputBg, borderColor: theme.borderColor, marginBottom: 12 },
            ]}
          >
            <Ionicons name="search" size={16} color={theme.subText} />
            <TextInput accessibilityLabel={t('guideSearchPlaceholder')}
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={t('guideSearchPlaceholder')}
              placeholderTextColor={theme.subText}
              value={query}
              onChangeText={(value) => {
                setQuery(value);
                if (value) setActiveId(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query ? (
              <TouchableOpacity
            onPress={() => setQuery('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={t('a11yClearSearch')}
          >
                <Ionicons name="close-circle" size={16} color={theme.subText} />
              </TouchableOpacity>
            ) : null}
          </View>

          {legalHit ? (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.accent,
                  marginBottom: 12,
                },
              ]}
            >
              <Text style={[styles.summaryText, { color: theme.text, marginBottom: 12 }]}>
                {t('guideAskAdvisor')}
              </Text>
              <TouchableOpacity accessibilityRole="button"
                style={[styles.primaryButton, { backgroundColor: ACCENT }]}
                onPress={openAdvisor}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>{t('guideAskAdvisorCta')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            style={{ flexGrow: 0, marginBottom: 6 }}
            contentContainerStyle={{ gap: 8, paddingRight: 8, alignItems: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            {chip(WHATS_NEW, t('guideWhatsNew'), activeId === WHATS_NEW, () => setActiveId(WHATS_NEW), 'sparkles-outline')}
            {GUIDE_FAQ_CHIPS.map((faq) =>
              chip(faq.id, t(faq.chipKey), activeId === faq.workflowId, () => setActiveId(faq.workflowId))
            )}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            style={{ flexGrow: 0, marginBottom: 10 }}
            contentContainerStyle={{ gap: 8, paddingRight: 8, alignItems: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            {GUIDE_WORKFLOWS.map((flow) =>
              chip(flow.id, t(flow.chipKey), activeId === flow.id, () => setActiveId(flow.id))
            )}
          </ScrollView>

          <FlatList
            data={listData}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            style={{ height: GUIDE_LIST_MAX_HEIGHT }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator
            ListHeaderComponent={listHeader}
            ListFooterComponent={listFooter}
            ListEmptyComponent={
              !legalHit && !active ? (
                <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 8 }]}>
                  {t('guideEmpty')}
                </Text>
              ) : null
            }
          />
        </View>
      </View>
    </Modal>
  );
}
