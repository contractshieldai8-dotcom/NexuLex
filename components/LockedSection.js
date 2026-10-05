import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ACCENT, styles } from '../theme';

export default function LockedSection({
  theme,
  title,
  subtitle,
  onUnlock,
  children,
  ctaKey = 'lockedUnlockAll',
}) {
  const { t } = useTranslation();
  const cta = t(ctaKey);

  const action = (
    <>
      <View style={styles.lockedIconWrap}>
        <Ionicons name="lock-closed" size={18} color={ACCENT} />
      </View>
      <Text style={[styles.lockedTitle, { color: children ? '#FFFFFF' : theme.text }]}>
        {title || t('lockedTitle')}
      </Text>
      <Text style={[styles.lockedSubtitle, { color: children ? '#CBD5E1' : theme.subText }]}>
        {subtitle || t('lockedSubtitle')}
      </Text>
      <TouchableOpacity accessibilityRole="button" style={styles.lockedCta} onPress={onUnlock} activeOpacity={0.85}>
        <Text style={styles.lockedCtaText}>{cta}</Text>
      </TouchableOpacity>
    </>
  );

  if (!children) {
    return (
      <View
        style={[
          styles.lockedCard,
          { backgroundColor: theme.cardBg, borderColor: theme.borderColor },
        ]}
      >
        {action}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.lockedWrap,
        { backgroundColor: theme.cardBg, borderColor: theme.borderColor },
      ]}
    >
      <View style={styles.lockedFrost} pointerEvents="none">
        {children}
      </View>
      <View style={styles.lockedOverlay}>{action}</View>
    </View>
  );
}
