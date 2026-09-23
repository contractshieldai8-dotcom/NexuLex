import React from 'react';
import { Text, View } from 'react-native';
import { getRiskColor, styles } from '../theme';

// Risk Skoru Görsel Göstergesi
export default function RiskGauge({ theme, score, risk, label }) {
  const percent = Math.max(0, Math.min(100, Number(score) || 0));
  const color = getRiskColor(risk);

  return (
    <View style={styles.gaugeWrapper}>
      <View style={[styles.gaugeTrack, { backgroundColor: theme.inputBg }]}>
        <View style={[styles.gaugeFill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.gaugeLegend}>
        <Text style={[styles.gaugeLegendText, { color: theme.subText }]}>0</Text>
        <Text
          style={[styles.gaugeLegendText, { color, fontWeight: '700' }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        <Text style={[styles.gaugeLegendText, { color: theme.subText }]}>100</Text>
      </View>
    </View>
  );
}
