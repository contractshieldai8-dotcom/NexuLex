import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ACCENT, styles } from '../theme';
import { AI_REPORT_REASONS, submitAiReport } from '../services/aiReport';
import { useFeedback } from '../context/FeedbackContext';
import KeyboardSafeSheet, { useKeyboardSafeSheet } from './KeyboardSafeSheet';

const SHEET_MAX = Math.round(Dimensions.get('window').height * 0.75);

export default function AiReportSheet({
  visible,
  theme,
  featureId,
  targetId = '',
  country = '',
  context = '',
  onClose,
}) {
  const { t, i18n } = useTranslation();
  const sheet = useKeyboardSafeSheet({ maxHeight: SHEET_MAX });
  const { showToast } = useFeedback();
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState('');
  const [includeContext, setIncludeContext] = useState(false);
  const [sending, setSending] = useState(false);
  const hasContext = !!String(context || '').trim();

  const close = () => {
    if (sending) return;
    onClose?.();
  };

  const submit = async () => {
    if (sending) return;
    if (!reason) {
      showToast(t('aiReportPickReason'), { type: 'warning' });
      return;
    }
    setSending(true);
    try {
      await submitAiReport({
        featureId,
        reason,
        note,
        targetId,
        locale: i18n.language,
        country,
        includeContext: hasContext && includeContext,
        context,
      });
      showToast(t('aiReportSent'), { type: 'success', duration: 2000 });
      setSending(false);
      onClose?.();
    } catch {
      setSending(false);
      showToast(t('aiReportFailed'), { type: 'error' });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.modalOverlay}>
        {/* BL.3: backdrop Pressable is sibling of sheet — not a wrapping parent. */}
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={t('cancelButton')}
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Ionicons name="flag-outline" size={20} color={ACCENT} />
            <Text style={[styles.modalTitle, { color: theme.text, flex: 1, marginBottom: 0 }]}>
              {t('aiReportTitle')}
            </Text>
          </View>
          <KeyboardSafeSheet controller={sheet}>
            <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 10 }]}>
              {t('aiReportHint')}
            </Text>
            {AI_REPORT_REASONS.map((item) => {
              const active = reason === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => setReason(item.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.modalOption,
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      borderColor: active ? ACCENT : theme.borderColor,
                    },
                  ]}
                >
                  <Ionicons
                    name={active ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={active ? ACCENT : theme.subText}
                  />
                  <Text style={[styles.modalOptionText, { color: theme.text, flex: 1 }]}>{t(item.labelKey)}</Text>
                </TouchableOpacity>
              );
            })}
            <TextInput
              {...sheet.field('note', { multiline: true })}
              style={[
                styles.chatInput,
                {
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.borderColor,
                  minHeight: 72,
                  textAlignVertical: 'top',
                  marginTop: 10,
                },
              ]}
              value={note}
              onChangeText={setNote}
              placeholder={t('aiReportNotePlaceholder')}
              placeholderTextColor={theme.subText}
              maxLength={1000}
              multiline
            />
            {hasContext ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: theme.text, fontSize: 13 }]}>
                    {t('aiReportIncludeContext')}
                  </Text>
                  <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 0 }]}>
                    {t('aiReportIncludeContextHint')}
                  </Text>
                </View>
                <Switch
                  value={includeContext}
                  onValueChange={setIncludeContext}
                  thumbColor={includeContext ? ACCENT : '#f4f3f4'}
                />
              </View>
            ) : null}
          </KeyboardSafeSheet>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 14 }, sending && styles.buttonDisabled]}
            onPress={submit}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#080C14" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>{t('aiReportSubmit')}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={close} disabled={sending}>
            <Text style={styles.secondaryBtnText}>{t('cancelButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/** Small flag action that owns its sheet, so it also works inside other Modals (iOS stacking). */
export function ReportAiButton({ theme, featureId, targetId, country, context, showLabel = false, style }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel={t('aiReportAction')}
        style={[{ flexDirection: 'row', alignItems: 'center', gap: 4 }, style]}
      >
        <Ionicons name="flag-outline" size={15} color={theme.subText} />
        {showLabel ? (
          <Text style={{ color: theme.subText, fontSize: 12, fontWeight: '600' }} numberOfLines={1}>
            {t('aiReportAction')}
          </Text>
        ) : null}
      </TouchableOpacity>
      {open ? (
        <AiReportSheet
          visible
          theme={theme}
          featureId={featureId}
          targetId={targetId}
          country={country}
          context={context}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
