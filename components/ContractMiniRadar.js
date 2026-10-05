import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ACCENT, styles } from '../theme';

const ROWS = [
  { key: 'parties', icon: 'people-outline', labelKey: 'radarParties', field: 'parties' },
  {
    key: 'law',
    icon: 'globe-outline',
    labelKey: 'radarJurisdiction',
    field: 'governingLawForum',
  },
  { key: 'notice', icon: 'time-outline', labelKey: 'radarNotice', field: 'noticePeriod' },
];

export default function ContractMiniRadar({ theme, radar, preview = false }) {
  const { t } = useTranslation();
  if (!radar || typeof radar !== 'object') return null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.borderColor,
          marginBottom: preview ? 10 : 12,
          paddingVertical: preview ? 10 : 12,
        },
      ]}
    >
      {preview ? (
        <Text style={[styles.deadlineMeta, { color: theme.subText, marginBottom: 6 }]}>
          {t('radarLiveHint')}
        </Text>
      ) : null}
      {ROWS.map((row, index) => {
        const value = String(radar[row.field] || '').trim() || '—';
        const label = t(row.labelKey);
        return (
          <Pressable accessibilityRole="button"
            key={row.key}
            onPress={() => {
              if (value && value !== '—') Alert.alert(label, value);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10,
              paddingVertical: preview ? 4 : 6,
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: theme.borderColor,
            }}
          >
            <Ionicons name={row.icon} size={16} color={ACCENT} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.deadlineMeta, { color: theme.subText, marginBottom: 2 }]}>
                {label}
              </Text>
              <Text
                style={[styles.deadlineLabel, { color: theme.text, flexShrink: 1 }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {value}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
