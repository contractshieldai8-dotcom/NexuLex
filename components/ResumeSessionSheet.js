import React from 'react';
import { Dimensions, I18nManager, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ACCENT, styles } from '../theme';
import KeyboardSafeSheet, { useKeyboardSafeSheet } from './KeyboardSafeSheet';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.92);

export default function ResumeSessionSheet({ visible, theme, items = [], onPick, onSkip, onClose }) {
  const { t } = useTranslation();
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* BL.3: backdrop Pressable is sibling of sheet — not a wrapping parent. */}
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel={t('rsSkip')}
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
            <Ionicons name="return-down-back-outline" size={20} color={ACCENT} />
            <Text style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]} numberOfLines={2}>
              {t('rsTitle')}
            </Text>
            <TouchableOpacity onPress={onSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <KeyboardSafeSheet controller={sheet} style={{ maxHeight: Math.round(WIN_H * 0.7) }} contentContainerStyle={{ paddingBottom: 12 }}>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('rsHint')}</Text>
            {items.map((item) => (
              <TouchableOpacity
                key={item.kind}
                onPress={() => onPick?.(item)}
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
                <Ionicons name={item.icon} size={22} color={ACCENT} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: theme.text, fontSize: 15 }]}>{t(item.titleKey)}</Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0, marginTop: 2 }]}>{t(item.hintKey)}</Text>
                </View>
                <Ionicons name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={ACCENT} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={onSkip}>
              <Text style={styles.secondaryBtnText}>{t('rsSkip')}</Text>
            </TouchableOpacity>
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 14 }]}>{t('rsDisclaimer')}</Text>
          </KeyboardSafeSheet>
        </View>
      </View>
    </Modal>
  );
}
