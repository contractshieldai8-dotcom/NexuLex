// WAVE G: last line of defence. A render crash shows a calm, translated screen with a retry button
// instead of a blank window, and sends one anonymous, scrubbed error report (if the user allows it).

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n';
import { trackError, flushTelemetry } from '../services/telemetry';

const NAVY = '#0A0F1D';
const ACCENT = '#D4B27A';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    trackError(error, 'render');
    flushTelemetry();
  }

  retry = () => {
    this.setState({ failed: false });
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={styles.wrap} accessibilityViewIsModal>
        <Ionicons name="alert-circle-outline" size={56} color={ACCENT} />
        <Text style={styles.title} accessibilityRole="header">
          {i18n.t('errBoundaryTitle')}
        </Text>
        <Text style={styles.body}>{i18n.t('errBoundaryBody')}</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={this.retry}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('errBoundaryRetry')}
        >
          <Text style={styles.btnText}>{i18n.t('errBoundaryRetry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  title: { color: '#F8FAFC', fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 16 },
  body: { color: '#94A3B8', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 10, marginBottom: 24 },
  btn: {
    minHeight: 48,
    paddingHorizontal: 28,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: NAVY, fontSize: 16, fontWeight: '700' },
});
