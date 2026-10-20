import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { styles } from '../theme';
import { PLAN_LIMITS } from '../utils/plan';

// Small plan comparison for the daily / monthly legal-question limits. Numbers come from PLAN_LIMITS
// (the server still counts them); the free allowance is a sentence because it is not a daily rate.
export default function PlanQuotaTable({ theme, plan }) {
  const { t } = useTranslation();
  const rows = [
    { id: 'pro', label: t('planTabPro'), day: PLAN_LIMITS.pro.askDaily, month: PLAN_LIMITS.pro.askMonthly },
    { id: 'professional', label: t('planTabProfessional'), day: PLAN_LIMITS.professional.askDaily, month: PLAN_LIMITS.professional.askMonthly },
  ];
  const head = { color: theme.subText, fontSize: 12, fontWeight: '700', textAlign: 'center', flex: 1 };
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={[styles.label, { color: theme.text, marginBottom: 6 }]}>{t('st8TblTitle')}</Text>
      <View style={{ borderWidth: 1, borderColor: theme.borderColor, borderRadius: 12, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: theme.inputBg }}>
          <View style={{ flex: 1.6 }} />
          <Text style={head} maxFontSizeMultiplier={1.3}>{t('st8TblDay')}</Text>
          <Text style={head} maxFontSizeMultiplier={1.3}>{t('st8TblMonth')}</Text>
        </View>
        {rows.map((row) => {
          const current = plan === row.id;
          return (
            <View
              key={row.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderTopWidth: 1,
                borderTopColor: theme.borderColor,
                backgroundColor: current ? theme.accentSoft : 'transparent',
              }}
            >
              <Text style={{ flex: 1.6, color: current ? theme.accent : theme.text, fontSize: 14, fontWeight: '700' }} maxFontSizeMultiplier={1.3}>
                {row.label}
              </Text>
              <Text style={{ flex: 1, color: theme.text, fontSize: 15, fontWeight: '800', textAlign: 'center' }} maxFontSizeMultiplier={1.3}>
                {String(row.day)}
              </Text>
              <Text style={{ flex: 1, color: theme.text, fontSize: 15, fontWeight: '800', textAlign: 'center' }} maxFontSizeMultiplier={1.3}>
                {String(row.month)}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 8, marginBottom: 0 }]}>
        {t('st8TblFree', {
          freeAsk: String(PLAN_LIMITS.free.askLifetime),
          freeWeekly: String(PLAN_LIMITS.free.askWeekly),
        })}
      </Text>
    </View>
  );
}
