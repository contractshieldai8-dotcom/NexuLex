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
import { GUIDE_FAQ_CHIPS, GUIDE_WORKFLOWS, matchLegalIntent } from '../constants/appCapabilities';
import { useKeyboardSafeSheet } from './KeyboardSafeSheet';

const WIN_H = Dimensions.get('window').height;
const GUIDE_SHEET_MAX_HEIGHT = Math.round(WIN_H * 0.88);
const GUIDE_LIST_MAX_HEIGHT = Math.round(WIN_H * 0.52);

export default function NexuLexGuideSheet({ visible, theme, onClose, onOpenAdvisor }) {
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

  const workflows = useMemo(() => {
    const needle = String(query || '').trim().toLowerCase();
    if (!needle) return GUIDE_WORKFLOWS;
    return GUIDE_WORKFLOWS.filter((flow) => {
      const stepBodies = (flow.steps || []).map((step) => t(step.bodyKey));
      const hay = [
        t(flow.titleKey),
        t(flow.hintKey),
        t(flow.chipKey),
        flow.introKey ? t(flow.introKey) : '',
        ...stepBodies,
      ]
        .join(' ')
        .toLowerCase();
      const faqHit = GUIDE_FAQ_CHIPS.some(
        (faq) => faq.workflowId === flow.id && t(faq.chipKey).toLowerCase().includes(needle)
      );
      return hay.includes(needle) || faqHit;
    });
  }, [query, t, i18n.language]);

  const active = GUIDE_WORKFLOWS.find((flow) => flow.id === activeId) || null;

  const listData = useMemo(() => {
    if (legalHit) return [];
    if (active) {
      return (active.steps || []).map((step, index) => ({
        kind: 'step',
        key: `${active.id}-${step.bodyKey}`,
        step,
        index,
      }));
    }
    return workflows.map((flow) => ({
      kind: 'flow',
      key: flow.id,
      flow,
    }));
  }, [legalHit, active, workflows]);

  const close = () => {
    setQuery('');
    setActiveId(null);
    onClose?.();
  };

  const openAdvisor = () => {
    close();
    onOpenAdvisor?.();
  };

  const renderItem = ({ item }) => {
    if (item.kind === 'flow') {
      const flow = item.flow;
      return (
        <TouchableOpacity
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
            <Text style={[styles.modalOptionText, { color: theme.text }]}>{t(flow.titleKey)}</Text>
            <Text style={[styles.modalOptionHint, { color: theme.subText }]} numberOfLines={2}>
              {t(flow.hintKey)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.subText} />
        </TouchableOpacity>
      );
    }

    const { step, index } = item;
    return (
      <View
        style={[
          styles.layerRow,
          { borderColor: theme.borderColor, marginBottom: 10, paddingBottom: 10 },
        ]}
      >
        <Text style={[styles.deadlineLabel, { color: ACCENT, marginBottom: 4 }]}>{index + 1}.</Text>
        <Text style={[styles.summaryText, { color: theme.text, marginBottom: 6 }]}>
          {t(step.bodyKey)}
        </Text>
        <View
          style={[
            styles.statusChip,
            {
              alignSelf: 'flex-start',
              backgroundColor: 'rgba(0, 245, 212, 0.12)',
              borderWidth: 1,
              borderColor: ACCENT,
            },
          ]}
        >
          <Text style={[styles.statusChipText, { color: ACCENT }]} numberOfLines={1}>
            {t(step.ctaKey)}
          </Text>
        </View>
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
  ) : null;

  const listFooter = active && !legalHit ? (
    <View style={{ paddingBottom: 8 }}>
      {active.tab === 'advisor' ? (
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: ACCENT, marginTop: 4 }]}
          onPress={openAdvisor}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>{t('guideAskAdvisorCta')}</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 10 }]} onPress={() => setActiveId(null)}>
        <Text style={styles.secondaryBtnText}>{t('cancelButton')}</Text>
      </TouchableOpacity>
    </View>
  ) : null;

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
            <TouchableOpacity
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
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={t('guideSearchPlaceholder')}
              placeholderTextColor={theme.subText}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query ? (
              <TouchableOpacity
                onPress={() => setQuery('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                  borderColor: ACCENT,
                  marginBottom: 12,
                },
              ]}
            >
              <Text style={[styles.summaryText, { color: theme.text, marginBottom: 12 }]}>
                {t('guideAskAdvisor')}
              </Text>
              <TouchableOpacity
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
            {GUIDE_FAQ_CHIPS.map((faq) => {
              const selected = activeId === faq.workflowId;
              return (
                <TouchableOpacity
                  key={faq.id}
                  onPress={() => setActiveId(faq.workflowId)}
                  activeOpacity={0.85}
                  style={[
                    styles.typeChip,
                    selected && styles.typeChipActive,
                    {
                      flexShrink: 0,
                      backgroundColor: selected ? 'rgba(0, 245, 212, 0.18)' : theme.inputBg,
                      borderColor: selected ? ACCENT : theme.borderColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      selected && styles.typeChipTextActive,
                      { color: selected ? ACCENT : theme.text },
                    ]}
                    numberOfLines={1}
                  >
                    {t(faq.chipKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            style={{ flexGrow: 0, marginBottom: 10 }}
            contentContainerStyle={{ gap: 8, paddingRight: 8, alignItems: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            {GUIDE_WORKFLOWS.map((flow) => {
              const selected = activeId === flow.id;
              return (
                <TouchableOpacity
                  key={flow.id}
                  onPress={() => setActiveId(flow.id)}
                  activeOpacity={0.85}
                  style={[
                    styles.typeChip,
                    selected && styles.typeChipActive,
                    {
                      flexShrink: 0,
                      backgroundColor: selected ? 'rgba(0, 245, 212, 0.14)' : theme.inputBg,
                      borderColor: selected ? ACCENT : theme.borderColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      selected && styles.typeChipTextActive,
                      { color: selected ? ACCENT : theme.text },
                    ]}
                    numberOfLines={1}
                  >
                    {t(flow.chipKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
