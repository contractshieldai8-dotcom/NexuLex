import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from '../theme';

/** Collapses a block of honesty notes. The visible word stays short; show/hide stays on the accessibility label. */
export default function HonestyFold({ theme, label, showLabel, hideLabel, children }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginTop: 4, marginBottom: 2 }}>
      <TouchableOpacity
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={open ? hideLabel : showLabel}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2, opacity: open ? 1 : 0.8 }}
      >
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={theme.subText} />
        <Text style={[styles.sectionHint, { color: theme.subText, flex: 1, marginBottom: 0, fontSize: 12, fontWeight: '600' }]}>
          {label || showLabel}
        </Text>
      </TouchableOpacity>
      {open ? <View style={{ marginTop: 4 }}>{children}</View> : null}
    </View>
  );
}
