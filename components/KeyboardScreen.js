import React from 'react';
import {
  findNodeHandle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  onScrollLayout,
  contentFlexGrow,
  keyboardInsets = true,
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
        automaticallyAdjustKeyboardInsets={keyboardInsets !== false}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={onContentSizeChange}
        onScroll={onScroll}
        onLayout={(event) => {
          onScrollLayout?.(Number(event?.nativeEvent?.layout?.height) || 0);
        }}
        scrollEventThrottle={16}
      >
        <View ref={containerRef} collapsable={false}>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
