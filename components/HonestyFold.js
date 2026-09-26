import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { styles } from '../theme';

/** Collapses a block of honesty notes. The notes stay in the tree when opened; callers keep disclaimer last. */
export default function HonestyFold({ theme, showLabel, hideLabel, children }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginTop: 8, marginBottom: 4 }}>
      <TouchableOpacity
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={open ? hideLabel : showLabel}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}
      >
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={theme.subText} />
        <Text style={[styles.sectionHint, { color: theme.subText, flex: 1, marginBottom: 0 }]}>
          {open ? hideLabel : showLabel}
        </Text>
      </TouchableOpacity>
      {open ? <View style={{ marginTop: 4 }}>{children}</View> : null}
    </View>
  );
}
