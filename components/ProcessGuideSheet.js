import React, { useEffect, useMemo, useState } from 'react';
import {
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
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';

import { ACCENT, DANGER, WARNING, styles } from '../theme';
import { JURISDICTIONS } from '../constants/options';
import { resolveJurisdiction } from '../constants/jurisdiction';
import {
  PG_BODY_ICONS,
  PG_GROUPS,
  PG_GROUP_ICONS,
  emergencyNumberFor,
  formatGuideText,
  getGuide,
  guidesInGroup,
  officialLinksFor,
  searchGuides,
} from '../constants/processGuides';
import { useFeedback } from '../context/FeedbackContext';
import KeyboardSafeSheet, { useKeyboardSafeSheet } from './KeyboardSafeSheet';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.92);

export default function ProcessGuideSheet({
  visible,
  theme,
  country = 'auto',
  openGuideId = null,
  onAsk,
  onStartCase,
  onOpenCalculator,
  onFindLawyer,
  onClose,
}) {
  const { t, i18n } = useTranslation();
  const { showToast } = useFeedback();
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX });

  const [query, setQuery] = useState('');
  const [group, setGroup] = useState(null);
  const [guideId, setGuideId] = useState(null);

  useEffect(() => {
    if (visible && openGuideId && getGuide(openGuideId)) setGuideId(openGuideId);
  }, [visible, openGuideId]);

  const jurisdiction = resolveJurisdiction(country, i18n.language);
  const countryLabel = useMemo(() => {
    const match = JURISDICTIONS.find((item) => item.code === jurisdiction);
    return match ? t(match.labelKey) : jurisdiction || '';
  }, [jurisdiction, t]);

  const list = useMemo(() => searchGuides(query, t, guidesInGroup(group)), [group, query, t]);
  const active = guideId ? getGuide(guideId) : null;
  const links = useMemo(() => (active ? officialLinksFor(active, jurisdiction) : []), [active, jurisdiction]);
  const emergency = emergencyNumberFor(jurisdiction);

  const openGuide = (id) => {
    setGuideId(id);
    sheet.scrollRef.current?.scrollTo?.({ y: 0, animated: false });
  };

  const openUrl = (url) => {
    Linking.openURL(url).catch(() => showToast(t('askLinkFailed'), { type: 'error' }));
  };

  const callEmergency = () => {
    const first = String(emergency || '').split('/')[0].trim();
    if (first) openUrl(`tel:${first}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: formatGuideText(active, t, { links, emergency, disclaimer: t('pgDisclaimer') }),
      });
    } catch {
      /* user cancelled */
    }
  };

  const bodyText = [styles.sectionHint, { color: theme.text, fontSize: 13, lineHeight: 19, marginBottom: 0 }];
  const box = { borderWidth: 1, borderColor: theme.borderColor, borderRadius: 12, padding: 12, marginBottom: 8 };
  const sectionTitle = (key, icon, params) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, marginBottom: 6 }}>
      <Ionicons name={icon} size={15} color={ACCENT} />
      <Text style={[styles.label, { color: theme.text, marginBottom: 0, flex: 1 }]}>{t(key, params)}</Text>
    </View>
  );
  const chip = (key, on, label, onPress, icon) => (
    <TouchableOpacity
      key={key}
      onPress={onPress}
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
      }}
    >
      {icon ? <Ionicons name={icon} size={14} color={on ? ACCENT : theme.subText} /> : null}
      <Text style={{ color: on ? ACCENT : theme.text, fontSize: 13, fontWeight: on ? '700' : '500' }} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderList = () => (
    <View>
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('pgHint')}</Text>
      <TextInput
        {...sheet.field('pgSearch')}
        style={[
          styles.chatInput,
          { flex: 0, backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.borderColor, marginBottom: 10 },
        ]}
        value={query}
        onChangeText={setQuery}
        placeholder={t('pgSearchPlaceholder')}
        placeholderTextColor={theme.subText}
        returnKeyType="search"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
        {chip('all', !group, t('pgAll'), () => setGroup(null), 'apps-outline')}
        {PG_GROUPS.map((value) =>
          chip(value, group === value, t(`pgGroup_${value}`), () => setGroup(value), PG_GROUP_ICONS[value])
        )}
      </ScrollView>
      {list.length ? (
        list.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() => openGuide(item.id)}
            style={{ ...box, flexDirection: 'row', alignItems: 'center', gap: 10 }}
          >
            <Ionicons name={item.icon} size={20} color={item.urgent ? DANGER : ACCENT} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: theme.text, fontSize: 14 }]} numberOfLines={2}>
                {t(item.titleKey)}
              </Text>
              <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]} numberOfLines={2}>
                {t(item.descKey)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.subText} />
          </TouchableOpacity>
        ))
      ) : (
        <Text style={[styles.sectionHint, { color: theme.subText, textAlign: 'center', marginVertical: 16 }]}>
          {t('pgNoResults')}
        </Text>
      )}
    </View>
  );

  const renderGuide = () => (
    <View>
      {active.urgent ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={emergency ? callEmergency : undefined}
          disabled={!emergency}
          style={{ ...box, borderColor: DANGER, backgroundColor: 'rgba(255,59,92,0.08)', flexDirection: 'row', gap: 8, alignItems: 'center' }}
        >
          <Ionicons name="call-outline" size={18} color={DANGER} />
          <Text style={[bodyText, { flex: 1, color: DANGER, fontWeight: '700' }]}>
            {emergency ? t('pgEmergency', { number: emergency }) : t('pgEmergencyGeneric')}
          </Text>
        </TouchableOpacity>
      ) : null}

      <Text style={[bodyText, { marginBottom: 8 }]}>{t(active.descKey)}</Text>

      <View style={{ ...box, borderColor: ACCENT }}>
        <Text style={[styles.label, { color: ACCENT, marginBottom: 4 }]}>{t('pgFocusTitle')}</Text>
        <Text style={bodyText}>{t(active.focusKey)}</Text>
      </View>
      <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('pgUniversalNote')}</Text>

      {sectionTitle('pgStepsTitle', 'footsteps-outline')}
      {active.stages.map((stage, index) => (
        <View key={stage} style={{ borderLeftWidth: 2, borderLeftColor: ACCENT, paddingLeft: 12, marginBottom: 12 }}>
          <Text style={[styles.settingLabel, { color: theme.text, fontSize: 14 }]}>
            {index + 1}. {t(`pgStage_${stage}_t`)}
          </Text>
          <Text style={[bodyText, { marginTop: 2 }]}>{t(`pgStage_${stage}_d`)}</Text>
          {stage === 'deadline' || stage === 'official_letter' ? (
            <TouchableOpacity
              onPress={() => onOpenCalculator?.('deadline_date')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}
            >
              <Ionicons name="calculator-outline" size={15} color={WARNING} />
              <Text style={[styles.label, { color: WARNING, marginBottom: 0 }]}>{t('pgDeadlineCta')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ))}

      {sectionTitle('pgDocsTitle', 'folder-open-outline')}
      {active.docKeys.map((key) => (
        <Text key={key} style={[bodyText, { marginBottom: 4 }]}>
          • {t(key)}
        </Text>
      ))}

      {sectionTitle(links.length ? 'pgLinksFor' : 'pgLinksTitle', 'globe-outline', { country: countryLabel })}
      {links.length ? (
        <>
          {links.map((link) => (
            <TouchableOpacity
              key={link.url}
              onPress={() => openUrl(link.url)}
              style={{ ...box, flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Ionicons name={PG_BODY_ICONS[link.type]} size={16} color={ACCENT} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>{t(`pgBody_${link.type}`)}</Text>
                <Text style={[styles.settingLabel, { color: ACCENT, fontSize: 14 }]} numberOfLines={2}>
                  {link.name}
                </Text>
              </View>
              <Ionicons name="open-outline" size={15} color={theme.subText} />
            </TouchableOpacity>
          ))}
          <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('pgLinksHint')}</Text>
        </>
      ) : (
        <Text style={[bodyText, { color: theme.subText }]}>{t('pgLinksNone')}</Text>
      )}

      <View style={{ ...box, borderColor: DANGER, backgroundColor: 'rgba(255,59,92,0.08)', marginTop: 12 }}>
        <Text style={[styles.label, { color: DANGER, marginBottom: 4 }]}>{t('pgLawyerTitle')}</Text>
        <Text style={bodyText}>{t(active.lawyerKey)}</Text>
        {onFindLawyer ? (
          <TouchableOpacity
            onPress={() => onFindLawyer({ area: active.area })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}
            accessibilityRole="button"
          >
            <Ionicons name="person-outline" size={15} color={ACCENT} />
            <Text style={[styles.label, { color: ACCENT, marginBottom: 0 }]}>{t('lhFindCta')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, { flexDirection: 'row', gap: 6, justifyContent: 'center' }]}
        onPress={() => onAsk?.({ area: active.area, question: t('pgAskTemplate', { title: t(active.titleKey) }) })}
      >
        <Ionicons name="help-buoy-outline" size={17} color="#080C14" />
        <Text style={styles.primaryButtonText}>{t('pgAskCta')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.secondaryBtn, { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 8 }]}
        onPress={() => onStartCase?.({ title: t(active.titleKey), area: active.area })}
      >
        <Ionicons name="folder-open-outline" size={16} color={ACCENT} />
        <Text style={styles.secondaryBtnText}>{t('pgCaseCta')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.secondaryBtn, { flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 8 }]}
        onPress={handleShare}
      >
        <Ionicons name="share-outline" size={16} color={ACCENT} />
        <Text style={styles.secondaryBtnText}>{t('pgShare')}</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 14 }]}>{t('pgDisclaimer')}</Text>
    </View>
  );

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
            <Ionicons name={active ? active.icon : 'map-outline'} size={20} color={active?.urgent ? DANGER : ACCENT} />
            <Text style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]} numberOfLines={2}>
              {active ? t(active.titleKey) : t('pgTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <KeyboardSafeSheet
            controller={sheet}
            style={{ maxHeight: Math.round(WIN_H * 0.7) }}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {active ? renderGuide() : renderList()}
          </KeyboardSafeSheet>

          <TouchableOpacity
            style={[styles.secondaryBtn, { marginTop: 8 }]}
            onPress={active ? () => openGuide(null) : onClose}
          >
            <Text style={styles.secondaryBtnText}>{active ? t('pgBack') : t('closeButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
