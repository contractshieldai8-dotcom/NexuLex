import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACCENT, alignStart, styles } from '../theme';
import { useKeyboardSafeSheet } from './KeyboardSafeSheet';

const SHEET_MAX = Math.round(Dimensions.get('window').height * 0.85);

// Bayrak + arama destekli alttan açılır seçici.
// options: [{ code, label, hint, flag, keywords }]
export default function SearchableSheet({
  visible,
  theme,
  title,
  searchPlaceholder,
  emptyLabel,
  closeLabel,
  options,
  selectedCode,
  onSelect,
  onClose,
}) {
  const insets = useSafeAreaInsets();
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX, bottomPadding: Math.max(insets.bottom, 0) + 16 });
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;

    return options.filter((option) =>
      [option.label, option.hint, option.code, ...(option.keywords || [])]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle))
    );
  }, [options, query]);

  const close = () => {
    setQuery('');
    onClose();
  };

  const renderOption = ({ item }) => {
    const isActive = item.code === selectedCode;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          onSelect(item.code);
          close();
        }}
        style={[
          styles.modalOption,
          {
            backgroundColor: isActive ? 'rgba(0, 245, 212, 0.1)' : theme.inputBg,
            borderColor: isActive ? ACCENT : theme.borderColor,
          },
        ]}
      >
        {item.flag ? <Text style={styles.sheetFlag}>{item.flag}</Text> : null}

        <View style={{ flex: 1 }}>
          <Text
            style={[styles.modalOptionText, { color: isActive ? ACCENT : theme.text }]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
          {item.hint ? (
            <Text style={[styles.modalOptionHint, { color: theme.subText }]} numberOfLines={1}>
              {item.hint}
            </Text>
          ) : null}
        </View>

        {isActive ? <Ionicons name="checkmark-circle" size={18} color={ACCENT} /> : null}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.modalOverlay}>
        {/* BL.3: backdrop Pressable is sibling of sheet — not a wrapping parent. */}
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.borderColor,
            },
            sheet.sheetStyle,
          ]}
        >
          <View style={styles.modalHandle} />
          <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>

          <View
            style={[
              styles.searchRow,
              { backgroundColor: theme.inputBg, borderColor: theme.borderColor },
            ]}
          >
            <Ionicons name="search" size={16} color={theme.subText} />
            <TextInput
              {...sheet.field('search')}
              style={[styles.searchInput, { color: theme.text, textAlign: alignStart }]}
              placeholder={searchPlaceholder}
              placeholderTextColor={theme.subText}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {query ? (
              <TouchableOpacity
                onPress={() => setQuery('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={16} color={theme.subText} />
              </TouchableOpacity>
            ) : null}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            renderItem={renderOption}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text
                style={[styles.sectionHint, { color: theme.subText, textAlign: 'center', marginTop: 16 }]}
              >
                {emptyLabel}
              </Text>
            }
          />

          <TouchableOpacity style={styles.secondaryBtn} onPress={close}>
            <Text style={styles.secondaryBtnText}>{closeLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
