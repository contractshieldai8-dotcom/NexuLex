import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/** Quiet section label that groups related Settings cards (Account / Preferences / Security / Support). */
export default function SettingsGroupHeader({ theme, icon, label, first = false }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: first ? 0 : 12,
        marginBottom: 10,
        paddingHorizontal: 2,
      }}
    >
      <Ionicons name={icon} size={16} color={theme.accent} />
      <Text
        accessibilityRole="header"
        maxFontSizeMultiplier={1.3}
        numberOfLines={1}
        style={{
          flex: 1,
          color: theme.subText,
          fontSize: 13,
          fontWeight: '700',
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
      <View style={{ height: 1, width: 36, backgroundColor: theme.borderColor }} />
    </View>
  );
}
