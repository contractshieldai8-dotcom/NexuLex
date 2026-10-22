import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';

import { styles } from '../theme';
import { SHARE_CODE_RE } from '../utils/shareSnapshot';
import { decisionActionKey } from '../utils/analysis';
import {
  listAdvisorSeats,
  mintAdvisorSeat,
  redeemAdvisorSeat,
  revokeAdvisorSeat,
} from '../services/advisorSeat';
import { useFeedback } from '../context/FeedbackContext';
import { inviteUrl } from '../constants/shareLoop';
import { buildSeatInvitePayload } from '../constants/seatInvite';

export default function AdvisorSeatCard({ theme, isPro, plan = 'free', onNeedPaywall, onOpenBrief }) {
  const { t, i18n } = useTranslation();
  const { showToast } = useFeedback();
  const [busy, setBusy] = useState(false);
  const [seats, setSeats] = useState([]);
  const [briefs, setBriefs] = useState([]);
  const [redeemCode, setRedeemCode] = useState('');

  const refresh = useCallback(async () => {
    const data = await listAdvisorSeats();
    setSeats(Array.isArray(data?.seats) ? data.seats : []);
    setBriefs(Array.isArray(data?.briefs) ? data.briefs : []);
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const householdSeats = (seats || []).filter((seat) => seat.role === 'household');
  const advisorSeats = (seats || []).filter((seat) => seat.role !== 'household');

  const handleMint = async (role) => {
    if (!isPro) {
      onNeedPaywall?.('share');
      return;
    }
    setBusy(true);
    try {
      await mintAdvisorSeat(role);
      showToast(role === 'household' ? t('seatMintHousehold') : t('seatMint'), { type: 'success' });
      setRedeemCode('');
      await refresh();
    } catch (error) {
      if (error?.code === 'SEAT_LIMIT') onNeedPaywall?.(plan === 'pro' && role !== 'household' ? 'professional' : 'share');
      else showToast(t('shareUnavailable'), { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const payloadFor = (seat) => buildSeatInvitePayload(t, seat, i18n.language);

  const handleShareCode = async (seat) => {
    const payload = payloadFor(seat);
    const title = seat?.role === 'household' ? t('seatHouseholdTitle') : t('seatTitle');
    await Share.share(Platform.OS === 'ios' ? { message: payload.message, title } : { message: payload.message });
  };

  const handleCopy = async (seat) => {
    await Clipboard.setStringAsync(payloadFor(seat).message);
    showToast(t('shieldCopied'), { type: 'success' });
  };

  const handleRevoke = async (code) => {
    setBusy(true);
    try {
      await revokeAdvisorSeat(code);
      showToast(t('seatRevoke'), { type: 'success' });
      await refresh();
    } catch {
      showToast(t('shareUnavailable'), { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleRedeem = async () => {
    const code = String(redeemCode || '').trim().toUpperCase();
    if (!SHARE_CODE_RE.test(code)) {
      showToast(t('shareEnterCodeHint'), { type: 'warning' });
      return;
    }
    setBusy(true);
    try {
      await redeemAdvisorSeat(code);
      setRedeemCode('');
      showToast(t('seatRedeem'), { type: 'success' });
      await refresh();
    } catch (error) {
      if (error?.code === 'SEAT_OWN' || error?.code === 'SEAT_TAKEN' || error?.code === 'SEAT_NOT_FOUND') {
        showToast(t('shareUnavailable'), { type: 'warning' });
      } else {
        showToast(t('shareUnavailable'), { type: 'error' });
      }
    } finally {
      setBusy(false);
    }
  };

  const renderSeatRow = (seat) => (
    <View key={seat.id || seat.code} style={{ marginTop: 12 }}>
      <Text style={[styles.settingLabel, { color: theme.text }]}>
        {t('seatCodeLabel')}: {seat.code}
      </Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>
        {seat.member_id ? t('seatAccepted') : t('seatPending')}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        <TouchableOpacity accessibilityRole="button" style={[styles.proposalBtn, { borderColor: theme.accent }]} onPress={() => handleShareCode(seat).catch(() => {})}>
          <Ionicons name="share-outline" size={14} color={theme.accent} />
          <Text style={styles.proposalBtnText}>{t('genShare')}</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={[styles.proposalBtn, { borderColor: theme.accent }]} onPress={() => handleCopy(seat).catch(() => {})}>
          <Ionicons name="copy-outline" size={14} color={theme.accent} />
          <Text style={styles.proposalBtnText}>{t('copyDraft')}</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button"
          style={[styles.proposalBtn, { borderColor: theme.danger }]}
          onPress={() => handleRevoke(seat.code).catch(() => {})}
          disabled={busy}
        >
          <Text style={[styles.proposalBtnText, { color: theme.danger }]}>{t('seatRevoke')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginBottom: 16 }]}>
      <Text style={[styles.settingLabel, { color: theme.text }]}>{t('seatHouseholdTitle')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('seatHouseholdHint')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('ux3Household')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('ux3InviteHint')}</Text>
      {householdSeats.map(renderSeatRow)}
      <TouchableOpacity accessibilityRole="button"
        style={[styles.secondaryBtn, { marginTop: 14 }, busy && styles.buttonDisabled]}
        onPress={() => handleMint('household').catch(() => {})}
        disabled={busy}
        activeOpacity={0.85}
      >
        {busy ? <ActivityIndicator color={theme.accent} /> : <Text style={styles.secondaryBtnText}>{t('seatMintHousehold')}</Text>}
      </TouchableOpacity>

      <Text style={[styles.settingLabel, { color: theme.text, marginTop: 20 }]}>{t('seatTitle')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('seatHint')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('ux3Advisor')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('ux3Get')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('ux3Install', { url: inviteUrl(i18n.language) })}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t('ux3Copy')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4 }]}>{t(plan === 'professional' ? 'seatLimitProfessional' : 'seatLimitPro')}</Text>
      {advisorSeats.map(renderSeatRow)}
      <TouchableOpacity accessibilityRole="button"
        style={[styles.secondaryBtn, { marginTop: 14 }, busy && styles.buttonDisabled]}
        onPress={() => handleMint('advisor').catch(() => {})}
        disabled={busy}
        activeOpacity={0.85}
      >
        {busy ? <ActivityIndicator color={theme.accent} /> : <Text style={styles.secondaryBtnText}>{t('seatMint')}</Text>}
      </TouchableOpacity>

      <Text style={[styles.settingLabel, { color: theme.text, marginTop: 18 }]}>{t('seatRedeem')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 4, marginBottom: 6 }]}>{t('ux3RedeemHint')}</Text>
      <TextInput accessibilityLabel={t('seatCodeLabel')}
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBg,
            color: theme.text,
            borderColor: theme.borderColor,
            borderWidth: 1,
          },
        ]}
        placeholder={t('seatCodeLabel')}
        placeholderTextColor={theme.subText}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={8}
        value={redeemCode}
        onChangeText={setRedeemCode}
      />
      <TouchableOpacity accessibilityRole="button"
        style={[styles.secondaryBtn, busy && styles.buttonDisabled]}
        onPress={() => handleRedeem().catch(() => {})}
        disabled={busy}
      >
        <Text style={styles.secondaryBtnText}>{t('seatRedeem')}</Text>
      </TouchableOpacity>

      <Text style={[styles.settingLabel, { color: theme.text, marginTop: 18 }]}>{t('seatInbox')}</Text>
      {briefs.length ? (
        briefs.map((item) => {
          const snapshot = item.snapshot || {};
          const decision = snapshot.decision || {};
          return (
            <TouchableOpacity accessibilityRole="button"
              key={item.id}
              style={[styles.deadlineRow, { borderColor: theme.borderColor, marginTop: 8 }]}
              onPress={() => onOpenBrief?.(snapshot)}
              activeOpacity={0.85}
            >
              <Text style={[styles.deadlineLabel, { color: theme.text }]}>
                {decision.action ? t(decisionActionKey(decision.action)) : '—'} · {snapshot.score ?? '—'}/100
              </Text>
              <Text style={[styles.deadlineMeta, { color: theme.subText }]}>
                {String(item.created_at || snapshot.dateISO || '').slice(0, 10)}
              </Text>
            </TouchableOpacity>
          );
        })
      ) : (
        <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>{t('seatEmpty')}</Text>
      )}
      <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 14 }]}>{t('ux3Disclaimer')}</Text>
    </View>
  );
}
