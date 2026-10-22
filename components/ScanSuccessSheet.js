import React from 'react';
import { Dimensions, I18nManager, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { styles } from '../theme';
import { SCAN_SUCCESS_JOBS } from '../constants/scanSuccess';
import { scanSuccessInviteUrl } from '../constants/scanSuccessLocale';
import KeyboardSafeSheet, { useKeyboardSafeSheet } from './KeyboardSafeSheet';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.92);

export default function ScanSuccessSheet({ visible, theme, countryLabel, onPick, onSkip, onClose }) {
  const { t, i18n } = useTranslation();
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* BL.3: backdrop Pressable is sibling of sheet — not a wrapping parent. */}
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel={t('ssSkip')}
        />
        <View
          style={[
            styles.modalSheet,
            { backgroundColor: theme.cardBg, borderColor: theme.borderColor },
            sheet.sheetStyle,
          ]}
        >
          <View style={styles.modalHandle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.accent} />
            <Text style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]} numberOfLines={2}>
              {t('ssTitle')}
            </Text>
            <TouchableOpacity onPress={onSkip} hitSlop={{ top: 13, bottom: 13, left: 13, right: 13 }} accessibilityRole="button" accessibilityLabel={t('closeButton')}>
              <Ionicons name="close" size={22} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <KeyboardSafeSheet controller={sheet} style={{ maxHeight: Math.round(WIN_H * 0.7) }} contentContainerStyle={{ paddingBottom: 12 }}>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('ssHint')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux15Once')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux15Country', { country: countryLabel })}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux15Free')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux15Jobs')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux15Invite')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux15Pause')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux15Guides')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux15Disclaimer')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('gr8Country', { country: countryLabel })}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('gr8Lang')}</Text>
            <Text style={[styles.settingLabel, { color: theme.text, fontSize: 15, marginBottom: 8 }]}>{t('ssLead')}</Text>
            {SCAN_SUCCESS_JOBS.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => onPick?.(item.id)}
                accessibilityRole="button"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderWidth: 1,
                  borderColor: theme.borderColor,
                  backgroundColor: theme.cardBg,
                  borderRadius: 14,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <Ionicons name={item.icon} size={22} color={theme.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: theme.text, fontSize: 15 }]}>{t(item.titleKey)}</Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 2 }]}>{t(item.hintKey)}</Text>
                </View>
                <Ionicons name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.accent} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity accessibilityRole="button" style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={onSkip}>
              <Text style={styles.secondaryBtnText}>{t('ssSkip')}</Text>
            </TouchableOpacity>
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 10 }]}>{t('gr8Case')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('gr8Ask')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('gr8Invite')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('gr8Get')}</Text>
            <Text style={[styles.sectionHint, { color: theme.accent, marginTop: 6 }]}>{scanSuccessInviteUrl(i18n.language)}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('gr8NoWin')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('gr8Note')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 10, marginBottom: 0 }]}>{t('ssTail')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 10, marginBottom: 0 }]}>{t('ux15Disclaimer')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 14 }]}>{t('ssDisclaimer')}</Text>
          </KeyboardSafeSheet>
        </View>
      </View>
    </Modal>
  );
}
