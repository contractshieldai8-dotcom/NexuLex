import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

import { ACCENT, DANGER, styles } from '../theme';
import { SHARE_AUDIENCES } from '../utils/shareSnapshot';
import { mintShare, revokeShare } from '../services/shareBrief';
import { listAdvisorSeats, pushAdvisorBrief } from '../services/advisorSeat';
import { useFeedback } from '../context/FeedbackContext';

const AUDIENCE_KEYS = {
  household: { label: 'shareAudienceHousehold', hint: 'shareAudienceHouseholdHint' },
  advisor: { label: 'shareAudienceAdvisor', hint: 'shareAudienceAdvisorHint' },
  counterparty: { label: 'shareAudienceCounterparty', hint: 'shareAudienceCounterpartyHint' },
};

const briefViewUrl = (code) => {
  const base = String(process.env.EXPO_PUBLIC_BRIEF_VIEW_BASE || '').replace(/\/+$/, '');
  if (!base || /supabase\.co/i.test(base)) return '';
  const token = encodeURIComponent(String(code || '').trim().toUpperCase());
  if (/\/index\.html$/i.test(base)) return `${base}?code=${token}`;
  return `${base}/?code=${token}`;
};

export default function ShareBriefSheet({
  visible,
  theme,
  analysis,
  locale = 'en',
  isPro = false,
  onClose,
  onNeedPaywall,
  onOpenCode,
  onEnsureSaved,
}) {
  const { t, i18n } = useTranslation();
  const { showToast } = useFeedback();
  const insets = useSafeAreaInsets();
  const [audience, setAudience] = useState('household');
  const [busy, setBusy] = useState(false);
  const [minted, setMinted] = useState(null);
  const [acceptedSeats, setAcceptedSeats] = useState([]);
  const [advisorMemberId, setAdvisorMemberId] = useState('');
  const [householdMemberId, setHouseholdMemberId] = useState('');

  const analysisId = analysis?.id;
  const lang = locale || i18n.language || 'en';

  const audienceLabel = useMemo(
    () => t(AUDIENCE_KEYS[audience]?.label || 'shareAudienceHousehold'),
    [audience, t]
  );

  const reset = () => {
    setMinted(null);
    setAudience('household');
    setBusy(false);
  };

  const close = () => {
    reset();
    onClose?.();
  };

  useEffect(() => {
    if (!visible || !isPro) {
      setAcceptedSeats([]);
      setAdvisorMemberId('');
      setHouseholdMemberId('');
      return undefined;
    }
    let cancelled = false;
    listAdvisorSeats()
      .then((data) => {
        if (cancelled) return;
        const rows = (data?.seats || []).filter((seat) => seat?.member_id);
        setAcceptedSeats(rows);
        const household = rows.find((seat) => seat.role === 'household');
        const advisor = rows.find((seat) => seat.role !== 'household');
        setHouseholdMemberId((prev) => prev || household?.member_id || '');
        setAdvisorMemberId((prev) => prev || advisor?.member_id || '');
      })
      .catch(() => {
        if (!cancelled) setAcceptedSeats([]);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, isPro]);

  const handleMint = async () => {
    setBusy(true);
    try {
      let id = analysisId;
      if (!id && onEnsureSaved) {
        id = await onEnsureSaved();
      }
      if (!id) {
        showToast(t('shareNeedSave'), { type: 'warning' });
        return;
      }
      const result = await mintShare({ analysisId: id, audience, locale: lang });
      setMinted(result);
      if (!briefViewUrl(result.code)) {
        showToast(t('shareUnavailable'), { type: 'warning' });
      } else {
        showToast(t('shareMinted'), { type: 'success' });
      }
    } catch (error) {
      if (error?.code === 'SHARE_LIMIT') {
        close();
        onNeedPaywall?.('share');
        showToast(t('shareLimitFree'), { type: 'warning' });
      } else if (error?.code === 'SHARE_LEAK') {
        showToast(t('shareLeakBlocked'), { type: 'error' });
      } else {
        showToast(t('shareUnavailable'), { type: 'error' });
      }
    } finally {
      setBusy(false);
    }
  };

  const shareUrl = minted ? briefViewUrl(minted.code) : '';
  const osMessage = minted && shareUrl
    ? t('shareOsMessage', {
        code: minted.code,
        audience: audienceLabel,
        url: shareUrl,
      })
    : '';

  const handleCopy = async () => {
    if (!osMessage) return;
    await Clipboard.setStringAsync(osMessage);
    showToast(t('shieldCopied'), { type: 'success' });
  };

  const handleShare = async () => {
    if (!osMessage) return;
    await Share.share(
      Platform.OS === 'ios' ? { message: osMessage, title: t('shareBriefTitle') } : { message: osMessage }
    );
  };

  const handleRevoke = async () => {
    if (!minted?.code) return;
    setBusy(true);
    try {
      await revokeShare(minted.code);
      setMinted(null);
      showToast(t('shareRevoked'), { type: 'success' });
    } catch {
      showToast(t('shareUnavailable'), { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handlePushSeat = async (memberId, sentKey) => {
    if (!isPro || !memberId) return;
    setBusy(true);
    try {
      let id = analysisId;
      if (!id && onEnsureSaved) id = await onEnsureSaved();
      if (!id) {
        showToast(t('seatNeedSave'), { type: 'warning' });
        return;
      }
      await pushAdvisorBrief({ analysisId: id, memberId, locale: lang });
      showToast(t(sentKey || 'seatSent'), { type: 'success' });
    } catch (error) {
      if (error?.code === 'SEAT_LIMIT') {
        close();
        onNeedPaywall?.('share');
      } else if (error?.code === 'SHARE_LEAK') showToast(t('shareLeakBlocked'), { type: 'error' });
      else showToast(t('shareUnavailable'), { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const householdSeats = acceptedSeats.filter((seat) => seat.role === 'household');
  const advisorSeats = acceptedSeats.filter((seat) => seat.role !== 'household');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.borderColor,
              paddingBottom: Math.max(insets.bottom, 0) + 16,
            },
          ]}
        >
          <View style={styles.modalHandle} />
          <Text style={[styles.modalTitle, { color: theme.text }]}>{t('shareBriefTitle')}</Text>
          <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 12 }]}>
            {t('shareBriefHint')}
          </Text>

          {!minted ? (
            <>
              <View style={styles.typeChipRow}>
                {SHARE_AUDIENCES.map((code) => {
                  const active = audience === code;
                  return (
                    <TouchableOpacity
                      key={code}
                      onPress={() => setAudience(code)}
                      style={[styles.typeChip, active && styles.typeChipActive]}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                        {t(AUDIENCE_KEYS[code].label)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 8 }]}>
                {t(AUDIENCE_KEYS[audience].hint)}
              </Text>
              <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 16 }, busy && styles.buttonDisabled]}
                onPress={() => handleMint().catch(() => {})}
                disabled={busy}
                activeOpacity={0.85}
              >
                {busy ? (
                  <ActivityIndicator color="#080C14" />
                ) : (
                  <Text style={styles.primaryButtonText}>{t('shareMint')}</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                {t('shareCodeLabel')}: {minted.code}
              </Text>
              <Text style={[styles.sectionHint, { color: theme.subText, marginTop: 6 }]}>
                {t('shareExpires', {
                  date: minted.expiresAt ? String(minted.expiresAt).slice(0, 10) : '—',
                })}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                <TouchableOpacity style={[styles.proposalBtn, { borderColor: ACCENT }]} onPress={() => handleShare().catch(() => {})}>
                  <Ionicons name="share-outline" size={14} color={ACCENT} />
                  <Text style={styles.proposalBtnText}>{t('genShare')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.proposalBtn, { borderColor: ACCENT }]} onPress={() => handleCopy().catch(() => {})}>
                  <Ionicons name="copy-outline" size={14} color={ACCENT} />
                  <Text style={styles.proposalBtnText}>{t('copyDraft')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.proposalBtn, { borderColor: ACCENT }]}
                  onPress={() => {
                    onOpenCode?.(minted.code);
                    close();
                  }}
                >
                  <Ionicons name="eye-outline" size={14} color={ACCENT} />
                  <Text style={styles.proposalBtnText}>{t('shareOpen')}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.secondaryBtn, { marginTop: 14, borderColor: DANGER }]}
                onPress={() => handleRevoke().catch(() => {})}
                disabled={busy}
              >
                <Text style={[styles.secondaryBtnText, { color: DANGER }]}>{t('shareRevoke')}</Text>
              </TouchableOpacity>
            </>
          )}

          {isPro && householdSeats.length ? (
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 8 }]}>{t('seatSendHousehold')}</Text>
              <View style={styles.typeChipRow}>
                {householdSeats.map((seat) => {
                  const active = householdMemberId === seat.member_id;
                  return (
                    <TouchableOpacity
                      key={seat.id || seat.member_id}
                      onPress={() => setHouseholdMemberId(seat.member_id)}
                      style={[styles.typeChip, active && styles.typeChipActive]}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                        {seat.code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 12 }, busy && styles.buttonDisabled]}
                onPress={() => handlePushSeat(householdMemberId, 'seatSendHousehold').catch(() => {})}
                disabled={busy}
                activeOpacity={0.85}
              >
                {busy ? (
                  <ActivityIndicator color="#080C14" />
                ) : (
                  <Text style={styles.primaryButtonText}>{t('seatSendHousehold')}</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          {isPro && advisorSeats.length ? (
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 8 }]}>{t('seatSend')}</Text>
              <View style={styles.typeChipRow}>
                {advisorSeats.map((seat) => {
                  const active = advisorMemberId === seat.member_id;
                  return (
                    <TouchableOpacity
                      key={seat.id || seat.member_id}
                      onPress={() => setAdvisorMemberId(seat.member_id)}
                      style={[styles.typeChip, active && styles.typeChipActive]}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                        {seat.code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 12 }, busy && styles.buttonDisabled]}
                onPress={() => handlePushSeat(advisorMemberId, 'seatSent').catch(() => {})}
                disabled={busy}
                activeOpacity={0.85}
              >
                {busy ? (
                  <ActivityIndicator color="#080C14" />
                ) : (
                  <Text style={styles.primaryButtonText}>{t('seatSend')}</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={close}>
            <Text style={styles.secondaryBtnText}>{t('closeButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
