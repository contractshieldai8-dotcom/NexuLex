import React from 'react';
import { Image, View } from 'react-native';

// Champagne shield mark. On the dark theme it sits straight on the ink navy background. On the light
// (pearl) theme it sits on a rounded ink-navy tile, like the app icon, so the gold gradient keeps its
// full brightness and contrast is guaranteed (no recoloured, flat variant needed).
const MARK = require('../assets/brand-mark.png');
const INK = '#0A0F1D';
const INK_EDGE = 'rgba(212, 178, 122, 0.28)';

export default function BrandMark({ size = 26, isDarkMode = true, style }) {
  if (isDarkMode) {
    return <Image source={MARK} style={[{ width: size, height: size }, style]} resizeMode="contain" accessible={false} />;
  }
  const inner = Math.round(size * 0.68);
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          backgroundColor: INK,
          borderWidth: size >= 48 ? 1 : 0,
          borderColor: INK_EDGE,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: INK,
          shadowOpacity: 0.22,
          shadowRadius: size >= 48 ? 10 : 3,
          shadowOffset: { width: 0, height: size >= 48 ? 4 : 1 },
          elevation: size >= 48 ? 4 : 1,
        },
        style,
      ]}
    >
      <Image source={MARK} style={{ width: inner, height: inner }} resizeMode="contain" accessible={false} />
    </View>
  );
}
