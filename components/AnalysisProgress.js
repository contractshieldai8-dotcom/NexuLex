import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { styles } from '../theme';

const stageFor = (step) => {
  if (step === 'report') {
    return { percent: 100, labelKey: 'progressShield', doneExtract: true, clausePhase: false };
  }
  if (step === 'parsing') {
    return { percent: 30, labelKey: 'progressExtract', doneExtract: false, clausePhase: false };
  }
  if (step === 'clauses') {
    return { percent: 85, labelKey: 'progressClauses', doneExtract: true, clausePhase: true };
  }
  if (step === 'risks') {
    // Past 70% as soon as Flight A / CORE completes — clause cards may still be loading.
    return { percent: 78, labelKey: 'progressClauses', doneExtract: true, clausePhase: true };
  }
  // jurisdiction mid-flight
  return { percent: 55, labelKey: 'progressShield', doneExtract: true, clausePhase: false };
};

export default function AnalysisProgress({ theme, step }) {
  const { t } = useTranslation();
  const stage = stageFor(step);
  const progress = useRef(new Animated.Value(0.12)).current;
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: stage.percent / 100,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [stage.percent, progress]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const secondLabel = stage.clausePhase ? t('progressClauses') : t('progressShield');
  const secondActive = stage.percent >= 55 && stage.percent < 100;

  return (
    <View
      style={[
        styles.progressCard,
        { backgroundColor: theme.cardBg, borderColor: theme.borderColor },
      ]}
    >
      <View style={styles.takeawayHeader}>
        <ActivityIndicator size="small" color={theme.accent} />
        <Text style={[styles.takeawayTitle, { color: theme.text, flex: 1 }]} numberOfLines={1}>
          {t('progressTitle')}
        </Text>
        <Text style={[styles.progressStepActive, { color: theme.accent }]}>{stage.percent}%</Text>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: theme.inputBg }]}>
        <Animated.View style={[styles.progressFill, { width }]} />
      </View>

      <View style={styles.progressStepRow}>
        {stage.doneExtract ? (
          <Ionicons name="checkmark-circle" size={16} color={theme.accent} />
        ) : (
          <Animated.View style={{ opacity: pulse }}>
            <Ionicons name="ellipse" size={12} color={theme.accent} />
          </Animated.View>
        )}
        <Text
          style={[
            styles.progressStepText,
            !stage.doneExtract && styles.progressStepActive,
            { color: theme.text },
          ]}
          numberOfLines={2}
        >
          {t('progressExtract')}
        </Text>
      </View>

      <View style={styles.progressStepRow}>
        {stage.percent >= 100 ? (
          <Ionicons name="checkmark-circle" size={16} color={theme.accent} />
        ) : secondActive ? (
          <Animated.View style={{ opacity: pulse }}>
            <Ionicons name="ellipse" size={12} color={theme.accent} />
          </Animated.View>
        ) : (
          <Ionicons name="ellipse-outline" size={12} color={theme.subText} />
        )}
        <Text
          style={[
            styles.progressStepText,
            secondActive && styles.progressStepActive,
            { color: secondActive ? theme.text : theme.subText },
          ]}
          numberOfLines={2}
        >
          {secondLabel}
        </Text>
      </View>
    </View>
  );
}
