import React, { useMemo, useState } from 'react';
import { Dimensions, Linking, Modal, Platform, Pressable, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';

import { ACCENT, styles } from '../theme';
import { useFeedback } from '../context/FeedbackContext';
import { buildInvitePayload, inviteUrl, rateUrl } from '../constants/shareLoop';
import { formatCode, withInviteCode } from '../utils/referralCore';
import { track } from '../services/telemetry';
import KeyboardSafeSheet, { useKeyboardSafeSheet } from './KeyboardSafeSheet';

const WIN_H = Dimensions.get('window').height;
const SHEET_MAX = Math.round(WIN_H * 0.92);

export default function ShareLoopSheet({ visible, theme, country, referralCode, onDone, onClose }) {
  const { t, i18n } = useTranslation();
  const { showToast } = useFeedback();
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX });
  const [busy, setBusy] = useState(false);
  // WAVE J: when signed in, the invite also carries the user's invite code (never any contract data).
  const payload = useMemo(() => {
    const base = buildInvitePayload(t, inviteUrl(i18n.language));
    if (!referralCode) return base;
    return { ...base, message: withInviteCode(base.message, t('refInviteLine', { code: formatCode(referralCode) })) };
  }, [t, i18n.language, referralCode]);

  const shareInvite = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await Share.share({ message: payload.message });
      track('invite_shared', { source: 'sheet' });
      onDone?.();
    } catch {
      onClose?.();
    } finally {
      setBusy(false);
    }
  };

  const copyInvite = async () => {
    try {
      await Clipboard.setStringAsync(payload.message);
      showToast(t('vlCopied'), { type: 'success' });
      track('invite_shared', { source: 'copy' });
      onDone?.();
    } catch {
      showToast(t('vlShareFailed'), { type: 'error' });
      onClose?.();
    }
  };

  const openStore = () => {
    Linking.openURL(rateUrl(Platform.OS, { language: i18n.language, country })).catch(() => showToast(t('vlRateFailed'), { type: 'error' }));
    onDone?.();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* BL.3: backdrop Pressable is sibling of sheet — not a wrapping parent. */}
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('vlSkip')}
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
            <Ionicons name="gift-outline" size={20} color={theme.accent} />
            <Text style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]} numberOfLines={2}>
              {t('vlTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel={t('closeButton')}>
              <Ionicons name="close" size={22} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <KeyboardSafeSheet controller={sheet} style={{ maxHeight: Math.round(WIN_H * 0.7) }} contentContainerStyle={{ paddingBottom: 12 }}>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('vlHint')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux17Get')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux17NoReport')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux17Once')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux17NoWin')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux17Store')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux17Device')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('ux17Guides')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('ux17Disclaimer')}</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: theme.borderColor,
                borderRadius: 14,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <Text style={[styles.settingLabel, { color: theme.text, fontSize: 15 }]}>{t('vlCardTitle')}</Text>
              <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 8 }]}>{t('vlCardBody')}</Text>
              <Text style={[styles.sectionHint, { color: theme.text, marginBottom: 0 }]}>{payload.message}</Text>
              <Text style={[styles.sectionHint, { color: theme.accent, marginTop: 8, marginBottom: 0 }]}>{t('vlLinkLabel')}</Text>
            </View>

            <TouchableOpacity style={[styles.secondaryBtn, { marginBottom: 8 }]} onPress={shareInvite} disabled={busy} accessibilityRole="button">
              <Text style={styles.secondaryBtnText}>{t('vlShare')}</Text>
            </TouchableOpacity>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>{t('vlShareHint')}</Text>

            <TouchableOpacity style={[styles.secondaryBtn, { marginBottom: 8 }]} onPress={copyInvite} accessibilityRole="button">
              <Text style={styles.secondaryBtnText}>{t('vlCopy')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.secondaryBtn, { marginBottom: 8 }]} onPress={openStore} accessibilityRole="button">
              <Text style={styles.secondaryBtnText}>{t('vlRate')}</Text>
            </TouchableOpacity>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('vlRateHint')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('gr7RateHint')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>
              {Platform.OS === 'android' ? t('gr7Play') : t('gr7Get')}
            </Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('gr7NoApple')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('gr7InviteHint')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('gr7Align')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 6 }]}>{t('gr7Country')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 8 }]}>{t('gr7Note')}</Text>

            <TouchableOpacity accessibilityRole="button" style={[styles.secondaryBtn, { marginTop: 4 }]} onPress={onClose}>
              <Text style={styles.secondaryBtnText}>{t('vlSkip')}</Text>
            </TouchableOpacity>
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 10, marginBottom: 0 }]}>{t('ux17Disclaimer')}</Text>
            <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 14 }]}>{t('vlDisclaimer')}</Text>
          </KeyboardSafeSheet>
        </View>
      </View>
    </Modal>
  );
}
