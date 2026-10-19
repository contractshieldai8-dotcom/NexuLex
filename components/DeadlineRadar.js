import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ACCENT, DANGER, WARNING, styles } from '../theme';
import { useFeedback } from '../context/FeedbackContext';
import { daysUntil, kindIcon, kindLabelKey, parseIsoDate } from '../utils/deadlines';
import { isUnspecifiedTrap, safeDisplayText } from '../utils/analysis';

export default function DeadlineRadar({
  theme,
  dates = [],
  title,
  emptyLabel: _emptyLabel,
  compact = false,
  onRemind = undefined,
}) {
  const { t, i18n } = useTranslation();
  const { showToast } = useFeedback();
  const items = Array.isArray(dates) ? dates : [];
  const canRemind = items.some((item) => !!parseIsoDate(item?.date));

  const formatDate = (value) => {
    if (!value || isUnspecifiedTrap(value)) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    try {
      return date.toLocaleDateString(i18n.language);
    } catch {
      return date.toLocaleDateString();
    }
  };

  const remindButton = typeof onRemind === 'function' ? (
    <TouchableOpacity accessibilityRole="button"
      style={[styles.primaryButton, { marginTop: 12 }, !canRemind && styles.buttonDisabled]}
      onPress={() => {
        if (!canRemind) {
          showToast(t('reminderNeedEndDate'), { type: 'info' });
          return;
        }
        onRemind();
      }}
      activeOpacity={0.85}
    >
      <Text style={styles.primaryButtonText}>{t('reminderSave')}</Text>
    </TouchableOpacity>
  ) : null;

  if (!items.length) {
    if (compact) return null;
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginBottom: 20 },
        ]}
      >
        <View style={styles.takeawayHeader}>
          <Ionicons name="calendar-outline" size={16} color={theme.accent} />
          <Text style={[styles.takeawayTitle, { color: theme.text, flexShrink: 1 }]}>
            {title || t('deadlinesTitle')}
          </Text>
        </View>
        {remindButton}
      </View>
    );
  }

  return (
    <View
      style={[
        compact ? styles.upcomingCard : styles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.borderColor,
          marginBottom: compact ? 14 : 20,
        },
      ]}
    >
      <View style={styles.takeawayHeader}>
        <Ionicons name="calendar-outline" size={16} color={theme.accent} />
        <Text style={[styles.takeawayTitle, { color: theme.text, flexShrink: 1 }]}>
          {title || t('deadlinesTitle')}
        </Text>
      </View>

      {(items || []).map((item, index) => {
        const days = daysUntil(item.date);
        const overdue = typeof days === 'number' && days < 0;
        const urgent = typeof days === 'number' && days >= 0 && days <= 14;
        const silent = !item.badge && (item.placeholder || isUnspecifiedTrap(item.date));
        const tone = silent || overdue
          ? DANGER
          : item.criticality === 'HIGH'
            ? DANGER
            : urgent
              ? WARNING
              : ACCENT;
        const kindText = t(kindLabelKey(item.kind));
        const rawLabel = item.placeholder || item.label === item.kind
          ? kindText
          : safeDisplayText(item.label, kindText);
        const note = silent ? '' : safeDisplayText(item.note, '');
        const formatted = formatDate(item.date);
        const meta = [formatted, note && note !== rawLabel && note !== kindText ? note : null]
          .filter(Boolean)
          .join(' · ');

        return (
          <View
            key={`${item.date}-${item.label}-${index}`}
            style={[styles.deadlineRow, { borderColor: theme.borderColor }]}
          >
            <Ionicons name={kindIcon(item.kind)} size={16} color={tone} />
            <View style={{ flex: 1, flexShrink: 1 }}>
              <Text style={[styles.deadlineLabel, { color: theme.text }]}>{rawLabel}</Text>
              {meta ? (
                <Text style={[styles.deadlineMeta, { color: theme.subText }]}>{meta}</Text>
              ) : null}
            </View>
            {item.badge ? (
              <View
                style={[
                  styles.unspecifiedBadge,
                  theme.bg === '#0A0F1D'
                    ? { backgroundColor: 'rgba(255, 214, 102, 0.28)', borderColor: 'rgba(255, 214, 102, 0.7)' }
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.unspecifiedBadgeText,
                    theme.bg === '#0A0F1D' ? { color: '#FFE08A' } : null,
                  ]}
                >
                  {item.badge}
                </Text>
              </View>
            ) : silent ? (
              <View
                style={[
                  styles.unspecifiedBadge,
                  theme.bg === '#0A0F1D'
                    ? { backgroundColor: 'rgba(255, 214, 102, 0.28)', borderColor: 'rgba(255, 214, 102, 0.7)' }
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.unspecifiedBadgeText,
                    theme.bg === '#0A0F1D' ? { color: '#FFE08A' } : null,
                  ]}
                >
                  ⚠️ {t('trapUnspecifiedBadge')}
                </Text>
              </View>
            ) : typeof days === 'number' ? (
              <Text style={[styles.deadlineDays, { color: tone }]}>
                {overdue ? t('deadlineOverdue') : t('deadlineDaysLeft', { count: days })}
              </Text>
            ) : null}
          </View>
        );
      })}

      {remindButton}
    </View>
  );
}
