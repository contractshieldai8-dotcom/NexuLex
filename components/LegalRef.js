import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { FONTS } from '../theme';

// Statute / law citation line. Uses the "tech blue" informational accent and an
// Ionicons book glyph instead of the old ⚖ emoji so it matches the icon system.
export default function LegalRef({ theme, children, label }) {
  const color = theme?.accentAlt || '#38BDF8';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 8 }}>
      <Ionicons name="book-outline" size={13} color={color} style={{ marginTop: 2 }} />
      <Text
        style={{
          flex: 1,
          color,
          fontFamily: FONTS.medium,
          fontSize: 11,
          lineHeight: 16,
          letterSpacing: 0.2,
        }}
      >
        {label ? `${label}: ` : ''}
        {children}
      </Text>
    </View>
  );
}
