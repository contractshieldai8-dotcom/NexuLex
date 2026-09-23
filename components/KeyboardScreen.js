import React from 'react';
import {
  findNodeHandle,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export const KEYBOARD_BEHAVIOR = Platform.OS === 'ios' ? 'padding' : undefined;
export const KEYBOARD_OFFSET = Platform.OS === 'ios' ? 90 : 0;

export function scrollInputIntoView(inputRef, containerRef, scrollRef) {
  try {
    const input = inputRef?.current;
    if (input && typeof input.measureLayout === 'function') {
      const nodeHandle = findNodeHandle(containerRef?.current);
      if (nodeHandle) {
        input.measureLayout(
          nodeHandle,
          (_x, y) => {
            scrollRef?.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
          },
          () => {}
        );
      }
    }
  } catch (error) {
    console.log('Klavye kaydırma atlandı:', error?.message);
  }
}

export default function KeyboardScreen({
  children,
  style,
  contentContainerStyle,
  keyboardVerticalOffset = KEYBOARD_OFFSET,
  scrollRef,
  containerRef,
  onContentSizeChange,
  onScroll,
  contentFlexGrow,
}) {
  const grow = contentFlexGrow === 0 ? 0 : 1;
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={KEYBOARD_BEHAVIOR}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[{ flexGrow: grow }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        onContentSizeChange={onContentSizeChange}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View ref={containerRef} collapsable={false}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
