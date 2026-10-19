import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ACCENT, SUCCESS, WARNING, styles } from '../theme';
import { LIFECYCLES, lifecycleLabelKey, normalizeLifecycle } from '../utils/lifecycle';

export function lifecycleColor(value, theme) {
  switch (normalizeLifecycle(value)) {
    case 'negotiating':
      return WARNING;
    case 'signed':
      return SUCCESS;
    case 'draft':
      return ACCENT;
    default:
      return ACCENT;
  }
}

export function lifecycleChipStyle(value, theme, { active = true } = {}) {
  const color = lifecycleColor(value, theme);
  const draft = normalizeLifecycle(value) === 'draft';
  if (draft) {
    return {
      backgroundColor: active ? 'rgba(212, 178, 122, 0.16)' : 'transparent',
      borderWidth: 1,
      borderColor: theme.accent,
      color: theme?.text || '#0F172A',
    };
  }
  return {
    backgroundColor: active ? color : 'transparent',
    borderWidth: 1,
    borderColor: color,
    color: active ? '#080C14' : color,
  };
}

export default function LifecycleChips({ theme, value, onSelect, hint = true }) {
  const { t } = useTranslation();
  const current = normalizeLifecycle(value);

  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {LIFECYCLES.map((code) => {
          const active = current === code;
          const chip = lifecycleChipStyle(code, theme, { active });
          return (
            <TouchableOpacity accessibilityRole="button"
              key={code}
              onPress={() => onSelect?.(code)}
              activeOpacity={0.85}
              style={[
                styles.statusChip,
                {
                  backgroundColor: chip.backgroundColor,
                  borderWidth: chip.borderWidth,
                  borderColor: chip.borderColor,
                  marginBottom: 0,
                },
              ]}
            >
              <Text style={[styles.statusChipText, { color: chip.color }]}>
                {t(lifecycleLabelKey(code))}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {hint ? (
        <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6, marginBottom: 0 }]}>
          {t('lifecycleHint')}
        </Text>
      ) : null}
    </View>
  );
}
