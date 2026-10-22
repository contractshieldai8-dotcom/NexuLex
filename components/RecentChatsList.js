import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { styles } from '../theme';
import { useAdvisorChat } from '../context/AdvisorChatContext';

export default function RecentChatsList({ theme, compact = false, onOpen, pinTitle = false }) {
  const { t } = useTranslation();
  const { sessions, openSession, sessionTitle, deleteSession, hydrated } = useAdvisorChat();
  const items = hydrated ? (sessions || []).slice(0, 5) : [];

  const confirmDelete = (session) => {
    Alert.alert(t('deleteChatTitle'), t('deleteChatMessage'), [
      { text: t('cancelButton'), style: 'cancel' },
      {
        text: t('confirmDelete'),
        style: 'destructive',
        onPress: () => deleteSession(session.id),
      },
    ]);
  };

  if (!items.length) {
    if (compact && pinTitle) {
      return (
        <View style={{ marginBottom: 8 }}>
          <Text style={[styles.takeawayTitle, { color: theme.text, marginBottom: 0 }]}>
            {t('recentChatsTitle')}
          </Text>
        </View>
      );
    }
    if (compact) return null;
    return (
      <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>
        {t('recentChatsEmpty')}
      </Text>
    );
  }

  return (
    <View style={{ marginBottom: compact ? 8 : 16 }}>
      <Text style={[styles.takeawayTitle, { color: theme.text, marginBottom: 8 }]}>
        {t('recentChatsTitle')}
      </Text>
      {items.map((session) => (
        <View
          key={session.id}
          style={[
            styles.historyCard,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.borderColor,
              marginBottom: 8,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            },
          ]}
        >
          <TouchableOpacity accessibilityRole="button"
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
            onPress={() => {
              openSession(session.id);
              onOpen?.(session);
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={15} color={theme.accent} />
            <Text style={[styles.historySummary, { color: theme.text, flex: 1, marginTop: 0 }]} numberOfLines={1}>
              {session.title || sessionTitle(session)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button"
            onPress={() => confirmDelete(session)}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            accessibilityLabel={t('deleteChatTitle')}
          >
            <Ionicons name="trash-outline" size={17} color={theme.danger} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
