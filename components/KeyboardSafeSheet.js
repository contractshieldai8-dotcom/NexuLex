import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useKeyboardInset from '../hooks/useKeyboardInset';

const FIELD_TOP_GAP = 24;
const SHEET_TOP_GAP = 24;
const SHOWN_SETTLE_MS = 80;
// Android Modal dialogs do not always receive keyboard events; after this delay without one,
// an estimated scroll spacer keeps the focused field reachable above the keyboard.
const NO_EVENT_FALLBACK_MS = 350;
const ESTIMATED_KEYBOARD_RATIO = 0.45;

/**
 * Controller for a bottom sheet with text inputs. The sheet container keeps its BL.3 layout and
 * spreads `sheetStyle`; inputs spread `field(key)`; the scroll body is <KeyboardSafeSheet controller />.
 */
export function useKeyboardSafeSheet({ maxHeight, bottomPadding } = {}) {
  const keyboard = useKeyboardInset();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const inputRefs = useRef({});
  const refSetters = useRef({});
  const focusedRef = useRef(null);
  const pendingRef = useRef(null);
  const timersRef = useRef([]);
  const renderOrderRef = useRef([]);
  const orderRef = useRef([]);
  const [order, setOrder] = useState([]);
  const [estimated, setEstimated] = useState(false);

  renderOrderRef.current = [];

  useEffect(() => {
    const next = renderOrderRef.current.slice();
    orderRef.current = next;
    if (next.join('|') !== order.join('|')) setOrder(next);
  });

  const later = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    },
    []
  );

  const scrollToField = useCallback((key) => {
    const input = inputRefs.current[key];
    const content = contentRef.current;
    const scroll = scrollRef.current;
    if (!input?.measureLayout || !content || !scroll) return;
    input.measureLayout(
      content,
      (_x, y) => scroll.scrollTo({ y: Math.max(0, y - FIELD_TOP_GAP), animated: true }),
      () => {}
    );
  }, []);

  useEffect(() => {
    if (!keyboard.visible) return;
    setEstimated(false);
    const key = pendingRef.current || focusedRef.current;
    pendingRef.current = null;
    if (key) later(() => scrollToField(key), SHOWN_SETTLE_MS);
  }, [keyboard.visible, keyboard.shownAt, later, scrollToField]);

  const handleFocus = useCallback(
    (key) => {
      focusedRef.current = key;
      if (keyboard.visible) {
        later(() => scrollToField(key), SHOWN_SETTLE_MS);
        return;
      }
      pendingRef.current = key;
      later(() => {
        if (pendingRef.current !== key || focusedRef.current !== key) return;
        pendingRef.current = null;
        if (Platform.OS === 'android') setEstimated(true);
        later(() => scrollToField(key), SHOWN_SETTLE_MS);
      }, NO_EVENT_FALLBACK_MS);
    },
    [keyboard.visible, later, scrollToField]
  );

  const handleBlur = useCallback(
    (key) => {
      if (focusedRef.current === key) focusedRef.current = null;
      later(() => {
        if (!focusedRef.current) setEstimated(false);
      }, 60);
    },
    [later]
  );

  const focusNext = useCallback((key) => {
    const list = orderRef.current;
    const next = list[list.indexOf(key) + 1];
    if (next) inputRefs.current[next]?.focus?.();
  }, []);

  const refFor = useCallback((key) => {
    if (!refSetters.current[key]) {
      refSetters.current[key] = (node) => {
        if (node) inputRefs.current[key] = node;
        else delete inputRefs.current[key];
      };
    }
    return refSetters.current[key];
  }, []);

  const field = (key, { multiline = false } = {}) => {
    if (!renderOrderRef.current.includes(key)) renderOrderRef.current.push(key);
    const index = order.indexOf(key);
    const isLast = index < 0 || index === order.length - 1;
    const props = {
      ref: refFor(key),
      onFocus: () => handleFocus(key),
      onBlur: () => handleBlur(key),
    };
    if (multiline) return props;
    return {
      ...props,
      returnKeyType: isLast ? 'done' : 'next',
      submitBehavior: isLast ? 'blurAndSubmit' : 'submit',
      onSubmitEditing: () => (isLast ? null : focusNext(key)),
    };
  };

  const lift = keyboard.visible ? keyboard.height + (Platform.OS === 'android' ? insets.bottom : 0) : 0;
  const basePadding = bottomPadding ?? Math.max(insets.bottom, 0) + 16;
  const windowCap = windowHeight - insets.top - SHEET_TOP_GAP;
  const sheetStyle = useMemo(
    () => ({
      maxHeight: Math.min(maxHeight ?? windowCap, windowCap),
      paddingBottom: lift ? lift + 12 : basePadding,
    }),
    [basePadding, lift, maxHeight, windowCap]
  );

  return {
    field,
    sheetStyle,
    keyboard,
    scrollRef,
    contentRef,
    estimatedPad: estimated ? Math.round(windowHeight * ESTIMATED_KEYBOARD_RATIO) : 0,
  };
}

/** Scroll body of a keyboard-safe sheet. Shrinks to the space left above the keyboard. */
export default function KeyboardSafeSheet({ controller, children, style, contentContainerStyle, ...rest }) {
  return (
    <ScrollView
      ref={controller.scrollRef}
      style={[{ flexShrink: 1 }, style]}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      showsVerticalScrollIndicator={false}
      {...rest}
    >
      <View ref={controller.contentRef} collapsable={false}>
        {children}
      </View>
      {controller.estimatedPad ? <View style={{ height: controller.estimatedPad }} /> : null}
    </ScrollView>
  );
}
