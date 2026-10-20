import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACCENT, styles } from '../theme';
import { PARTY_SIDES } from '../constants/options';

// Analiz ekranı ve Hukuk Danışmanı sekmesinde kullanılan şık seçici alan.
export function PartySideSelector({ theme, selected, onSelect, disabled, hideLabel = false }) {
  const { t } = useTranslation();

  return (
    <View>
      {hideLabel ? null : (
        <Text style={[styles.label, { color: theme.subText }]}>{t('partyLabel')}</Text>
      )}
      <View style={styles.sideSelector}>
        {(PARTY_SIDES || []).map((item) => {
          const active = selected === item.code;
          return (
            <TouchableOpacity accessibilityRole="button"
              key={item.code}
              onPress={() => onSelect(item.code)}
              disabled={disabled}
              activeOpacity={0.85}
              style={[
                styles.sideCard,
                {
                  backgroundColor: active ? 'rgba(212, 178, 122, 0.1)' : theme.inputBg,
                  borderColor: active ? theme.accent : theme.borderColor,
                  opacity: disabled ? 0.6 : 1,
                },
              ]}
            >
              <Ionicons
                name={item.icon || (item.code === 'buyer' ? 'shield-checkmark-outline' : 'scale-outline')}
                size={22}
                color={active ? theme.accent : theme.subText}
                style={{ marginBottom: 8 }}
              />
              <Text style={[styles.sideCardLabel, { color: active ? theme.accent : theme.text }]}>
                {t(item.labelKey)}
              </Text>
              <Text style={[styles.sideCardHint, { color: theme.subText }]}>{t(item.hintKey)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function SelectorField({ theme, icon, label, value, hint, onPress, disabled }) {
  return (
    <View>
      {label ? <Text style={[styles.label, { color: theme.subText }]}>{label}</Text> : null}

      <TouchableOpacity accessibilityRole="button"
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[
          styles.selectorRow,
          {
            backgroundColor: theme.inputBg,
            borderColor: theme.borderColor,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {icon ? <Ionicons name={icon} size={16} color={theme.accent} /> : null}

        <View style={{ flex: 1 }}>
          <Text style={[styles.selectorValue, { color: theme.text }]} numberOfLines={1}>
            {value}
          </Text>
          {hint ? (
            <Text style={[styles.selectorHint, { color: theme.subText }]} numberOfLines={1}>
              {hint}
            </Text>
          ) : null}
        </View>

        <Ionicons name="chevron-down" size={16} color={theme.subText} />
      </TouchableOpacity>
    </View>
  );
}

// Alttan açılan seçenek listesi (ülke mevzuatı / rapor dili).
export function OptionSheet({
  visible,
  theme,
  title,
  options,
  selectedCode,
  onSelect,
  onClose,
  closeLabel,
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* BL.3: backdrop Pressable is sibling of sheet — not a wrapping parent. */}
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.borderColor,
              paddingBottom: Math.max(insets.bottom, 0) + 16,
            },
          ]}
        >
          <View style={styles.modalHandle} />
          <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {(options || []).map((option) => {
              const isActive = option.code === selectedCode;

              return (
                <TouchableOpacity accessibilityRole="button"
                  key={option.code}
                  activeOpacity={0.8}
                  onPress={() => {
                    onSelect(option.code);
                    onClose();
                  }}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor: isActive ? 'rgba(212, 178, 122, 0.1)' : theme.inputBg,
                      borderColor: isActive ? theme.accent : theme.borderColor,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.modalOptionText,
                        { color: isActive ? theme.accent : theme.text },
                      ]}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                    {option.hint ? (
                      <Text
                        style={[styles.modalOptionHint, { color: theme.subText }]}
                        numberOfLines={1}
                      >
                        {option.hint}
                      </Text>
                    ) : null}
                  </View>

                  {isActive ? (
                    <Ionicons name="checkmark-circle" size={18} color={theme.accent} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity accessibilityRole="button" style={styles.secondaryBtn} onPress={onClose}>
            <Text style={styles.secondaryBtnText}>{closeLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
