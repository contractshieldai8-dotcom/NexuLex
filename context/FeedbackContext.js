import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACCENT, ACCENT_ALT, DANGER, SUCCESS, WARNING, darkTheme, styles as appStyles, toneText } from '../theme';

const FeedbackContext = createContext(null);

const TONE = {
  success: SUCCESS,
  error: DANGER,
  warning: WARNING,
  info: ACCENT_ALT,
};

export function FeedbackProvider({ children, theme = darkTheme }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef(null);

  const hideToast = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setToast(null);
    });
  }, [opacity]);

  const showToast = useCallback(
    (message, { type = 'info', duration = 2800 } = {}) => {
      const text = String(message || '').trim();
      if (!text) return;
      clearTimeout(hideTimer.current);
      setToast({ message: text, type });
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(hideToast, duration);
    },
    [hideToast, opacity]
  );

  const showModal = useCallback((options) => {
    const {
      title = '',
      message = '',
      confirmLabel,
      cancelLabel,
      destructive = false,
      actions,
    } = options || {};

    return new Promise((resolve) => {
      setDialog({
        title,
        message,
        destructive,
        actions: actions || [
          ...(cancelLabel === false
            ? []
            : [{ id: 'cancel', label: cancelLabel || t('cancelButton'), style: 'cancel' }]),
          {
            id: 'confirm',
            label: confirmLabel || t('toastOk'),
            style: destructive ? 'destructive' : 'primary',
          },
        ],
        resolve,
      });
    });
  }, [t]);

  const closeDialog = useCallback((result) => {
    const current = dialog;
    setDialog(null);
    current?.resolve?.(result);
  }, [dialog]);

  const value = useMemo(
    () => ({ showToast, showModal }),
    [showModal, showToast]
  );

  const toastBottom = Math.max(insets.bottom, 0) + 16;
  const sheetPadBottom = Math.max(insets.bottom, 0) + 16;

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            feedbackStyles.toastWrap,
            { opacity, bottom: toastBottom },
          ]}
        >
          <View
            style={[
              feedbackStyles.toast,
              {
                backgroundColor: theme.cardBg,
                borderColor: TONE[toast.type] || theme.accent,
              },
            ]}
          >
            <Ionicons
              name={toast.type === 'success' ? 'checkmark-circle' : toast.type === 'error' ? 'alert-circle' : 'information-circle'}
              size={18}
              color={toneText(TONE[toast.type]) || theme.accent}
            />
            <Text style={[feedbackStyles.toastText, { color: theme.text }]}>{toast.message}</Text>
          </View>
        </Animated.View>
      ) : null}

      <Modal visible={Boolean(dialog)} transparent animationType="fade" onRequestClose={() => closeDialog('cancel')}>
        <Pressable style={feedbackStyles.overlay} onPress={() => closeDialog('cancel')}>
          <Pressable
            style={[
              feedbackStyles.sheet,
              {
                backgroundColor: theme.cardBg,
                borderColor: theme.borderColor,
                paddingBottom: sheetPadBottom,
              },
            ]}
            onPress={() => {}}
          >
            {dialog?.title ? (
              <Text style={[appStyles.modalTitle, { color: theme.text, marginBottom: 8 }]}>
                {dialog.title}
              </Text>
            ) : null}
            {dialog?.message ? (
              <Text style={[feedbackStyles.body, { color: theme.subText }]}>{dialog.message}</Text>
            ) : null}
            <View style={feedbackStyles.actions}>
              {(dialog?.actions || []).map((action) => {
                const primary = action.style === 'primary' || action.style === 'destructive';
                const danger = action.style === 'destructive';
                return (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      feedbackStyles.actionBtn,
                      primary
                        ? { backgroundColor: danger ? DANGER : ACCENT }
                        : { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.borderColor },
                    ]}
                    onPress={() => closeDialog(action.id)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        feedbackStyles.actionText,
                        { color: primary ? '#080C14' : theme.text },
                        danger && primary ? { color: '#FFFFFF' } : null,
                      ]}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const value = useContext(FeedbackContext);
  if (!value) {
    throw new Error('useFeedback FeedbackProvider içinde kullanılmalıdır.');
  }
  return value;
}

const feedbackStyles = StyleSheet.create({
  toastWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    // bottom set dynamically via insets.bottom + 16
    zIndex: 80,
    elevation: 80,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 520,
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toastText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 8, 15, 0.78)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 88,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
