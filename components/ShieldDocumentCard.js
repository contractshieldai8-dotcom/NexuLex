import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ACCENT, WARNING, styles } from '../theme';
import { decodePlainText, exportPlain } from '../utils/exportPlain';
import { shareShieldDocx, shareShieldRedlinePdf } from '../utils/redlineExport';
import {
  listShieldPatches,
  fuzzyParagraph,
  replaceSlice,
  resolveSourceText,
  stitchShieldDocument,
} from '../utils/shieldDocument';
import { lifecycleAfterStitch, normalizeLifecycle } from '../utils/lifecycle';
import { isTruncatedExtract, looksIncompleteExtract } from '../services/ai';
import { useFeedback } from '../context/FeedbackContext';

export default function ShieldDocumentCard({
  theme,
  analysis,
  sourceText = '',
  lockPremium = false,
  onNeedPaywall,
  countryLabel = '',
  partyLabel = '',
  dateLabel = '',
  onPersist,
  onOpenDiff,
  placeSkipped,
  onShareBrief,
  offerTierById = null,
  preferredTier = 'balanced',
}) {
  const { t } = useTranslation();
  const { showToast, showModal } = useFeedback();
  const tierOpts = useMemo(
    () => ({
      preferredTier,
      tierById: offerTierById && typeof offerTierById === 'object' ? offerTierById : {},
    }),
    [preferredTier, offerTierById]
  );
  const patches = useMemo(() => listShieldPatches(analysis, tierOpts), [analysis, tierOpts]);
  const hasSourceText = useMemo(() => {
    const candidates = [
      resolveSourceText(analysis, sourceText),
      analysis?.contract_text,
      analysis?.contractText,
      sourceText,
    ]
      .map((item) => String(item || '').trim())
      .filter(Boolean);
    return candidates.length > 0;
  }, [analysis, sourceText]);
  // The key follows the report's content, not its database id. Saving an unsaved report
  // (signing it, applying the shield) assigns an id; that must not look like a new report,
  // or the open preview collapses and everything below it jumps.
  const identityRef = useRef(null);
  const contentSig = `${analysis?.score || 0}:${String(analysis?.summary || '').slice(0, 48)}`;
  const idNow = String(analysis?.id || '');
  const prevIdentity = identityRef.current;
  if (
    !prevIdentity ||
    prevIdentity.sig !== contentSig ||
    (prevIdentity.id && idNow && prevIdentity.id !== idNow)
  ) {
    identityRef.current = { sig: contentSig, id: idNow, key: idNow || contentSig };
  } else if (!prevIdentity.id && idNow) {
    identityRef.current = { ...prevIdentity, id: idNow };
  }
  const analysisKey = identityRef.current.key;
  const [selected, setSelected] = useState({});
  const [stitched, setStitched] = useState(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const next = {};
    listShieldPatches(analysis, tierOpts).forEach((item) => {
      next[item.id] = item.defaultSelected;
    });
    setSelected(next);
    setStitched(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisKey]);

  // Switching an offer tier keeps the user's picks and the open preview; the preview is
  // re-stitched in place instead of being thrown away (which shoved the page).
  const tierSeenRef = useRef(tierOpts);
  useEffect(() => {
    if (tierSeenRef.current === tierOpts) return;
    tierSeenRef.current = tierOpts;
    const fresh = listShieldPatches(analysis, tierOpts);
    const merged = {};
    fresh.forEach((item) => {
      merged[item.id] = Object.prototype.hasOwnProperty.call(selected, item.id)
        ? selected[item.id]
        : item.defaultSelected;
    });
    setSelected(merged);
    setStitched((prev) => {
      if (!prev) return prev;
      const source = [
        resolveSourceText(analysis, sourceText),
        analysis?.contract_text,
        analysis?.contractText,
        sourceText,
      ]
        .map((item) => String(item || '').trim())
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)[0];
      if (!source) return prev;
      const lockedFirst = lockPremium ? fresh.find((item) => item.defaultSelected)?.id : null;
      const ids = new Set(
        fresh
          .filter((item) => merged[item.id] && !(lockPremium && item.id !== lockedFirst))
          .map((item) => item.id)
      );
      if (lockedFirst) ids.add(lockedFirst);
      try {
        const doc = stitchShieldDocument({
          analysis,
          sourceText: source,
          selectedIds: ids,
          banner,
          preferredTier: tierOpts.preferredTier,
          tierById: tierOpts.tierById,
        });
        return { ...doc, cut: prev.cut };
      } catch {
        return prev;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tierOpts]);

  const firstRedId = patches.find((item) => item.defaultSelected)?.id;
  const banner = t('shieldBanner', {
    country: countryLabel || '—',
    party: partyLabel || '—',
    date: dateLabel || '—',
  });

  const isLockedPatch = (patch) => lockPremium && patch.id !== firstRedId;

  const togglePatch = (patch) => {
    if (isLockedPatch(patch)) {
      onNeedPaywall?.();
      return;
    }
    setSelected((prev) => ({ ...prev, [patch.id]: !prev[patch.id] }));
  };

  const selectedIds = () => {
    const ids = new Set(
      patches.filter((item) => selected[item.id] && !isLockedPatch(item)).map((item) => item.id)
    );
    if (lockPremium && firstRedId) ids.add(firstRedId);
    return ids;
  };

  const payloadText = (doc) => {
    const body = decodePlainText(String(doc?.text || '').trim());
    const head = decodePlainText(String(doc?.banner || banner).trim());
    if (!body) return '';
    return head ? `${head}\n\n${body}` : body;
  };

  const pickLongestSource = () => {
    const candidates = [
      resolveSourceText(analysis, sourceText),
      analysis?.contract_text,
      analysis?.contractText,
      sourceText,
    ]
      .map((item) => String(item || '').trim())
      .filter(Boolean);
    return candidates.sort((a, b) => b.length - a.length)[0] || '';
  };

  const lastMaddeNo = (text) => {
    let max = 0;
    const re =
      /(?:^|\n)\s*(?:MADDE|ARTICLE|ART(?:[IİÍ]CULO|IGO|IKEL|\.?)|CLAUSE|CL[AÁ]USULA)\s+(\d{1,2})\b/gi;
    let match = re.exec(text);
    while (match) {
      max = Math.max(max, Number(match[1]) || 0);
      match = re.exec(text);
    }
    return max;
  };

  const tailIsMidWord = (text) => {
    const tail = String(text || '').replace(/\s+$/g, '').slice(-40);
    const lastWord = (tail.match(/[^\s.,;:!?…"'»)\]]+$/) || [''])[0];
    return (
      lastWord.length >= 2 &&
      lastWord.length <= 8 &&
      /^[A-Za-zÀ-ÖØ-öø-ÿÇĞİÖŞÜçğıöşü]+$/.test(lastWord)
    );
  };

  const persistIfReady = (doc) => {
    if (lockPremium) return;
    const body = String(doc?.text || '').trim();
    if (body.length <= 200) return;
    const lifecycle = lifecycleAfterStitch(analysis?.lifecycle);
    onPersist?.({
      revised_contract_text: body,
      revisedContractText: body,
      lifecycle: normalizeLifecycle(analysis?.lifecycle) === 'draft' ? 'negotiating' : lifecycle,
    });
  };

  const handleApply = async () => {
    const source = pickLongestSource();
    if (!source) {
      showToast(t('shieldNeedSource'), { type: 'warning' });
      return;
    }
    const sourceCut = looksIncompleteExtract(source, { fromMedia: false }) || isTruncatedExtract(source);

    const doc = stitchShieldDocument({
      analysis,
      sourceText: source,
      selectedIds: selectedIds(),
      banner,
      preferredTier: tierOpts.preferredTier,
      tierById: tierOpts.tierById,
    });
    const ateTail =
      lastMaddeNo(source) > lastMaddeNo(doc.text) ||
      (source.length > String(doc.text || '').length + 80 && tailIsMidWord(doc.text));
    // Toast only when source is incomplete — truncated patches may skip without blocking Apply.
    setStitched({ ...doc, cut: sourceCut || ateTail });
    if (sourceCut) {
      showToast(t('errExtractTruncated'), { type: 'warning' });
      return;
    }
    persistIfReady(doc);

    const skipped = doc.skipped || [];
    const unmatched = skipped.filter((item) => item.reason === 'not_found');
    if (
      !lockPremium &&
      unmatched.length >= 1 &&
      unmatched.length <= 3 &&
      typeof placeSkipped === 'function'
    ) {
      const choice = await showModal({
        title: t('shieldDocTitle'),
        message: t('shieldSkipped', { count: unmatched.length }),
        confirmLabel: t('shieldApply'),
      });
      if (choice !== 'confirm') return;
      setPlacing(true);
      try {
        let nextText = doc.text;
        const still = [];
        for (const item of unmatched) {
          const slice = fuzzyParagraph(nextText, item.from) || fuzzyParagraph(source, item.from);
          if (!slice) {
            still.push(item);
            continue;
          }
          try {
            const revised = await placeSkipped({
              paragraph: slice,
              from: item.from,
              to: item.to,
            });
            if (revised && revised !== slice) {
              nextText = replaceSlice(nextText, slice, revised);
            } else {
              still.push(item);
            }
          } catch {
            still.push(item);
          }
        }
        const nextDoc = { ...doc, text: nextText, skipped: still };
        setStitched(nextDoc);
        persistIfReady(nextDoc);
      } finally {
        setPlacing(false);
      }
    }
  };

  const guardFull = () => {
    if (lockPremium) {
      onNeedPaywall?.();
      return false;
    }
    if (!String(stitched?.text || '').trim()) return false;
    if (stitched?.cut) {
      showToast(t('errExtractTruncated'), { type: 'warning' });
      return false;
    }
    return true;
  };

  const handleCopy = async () => {
    if (!guardFull()) return;
    try {
      const body = payloadText(stitched);
      await exportPlain(body, 'NexuLex-kalkan.txt', { shareAlways: true });
      showToast(`${t('shieldCopied')} · ${body.length}`, { type: 'success' });
    } catch {
      showToast(t('shieldShareFailed'), { type: 'error' });
    }
  };

  const appliedWithTitles = () =>
    (stitched?.applied || []).map((item) => {
      const patch = patches.find((entry) => entry.id === item.id);
      const title = patch?.titleKey ? t(patch.titleKey) : patch?.title || '';
      return { ...item, title };
    });

  const handleShare = async () => {
    if (!guardFull()) return;
    if (!patches.length) {
      showToast(t('shieldNoPatches'), { type: 'warning' });
      return;
    }
    const body = payloadText(stitched);
    if (!body.trim()) {
      showToast(t('shieldNeedSource'), { type: 'warning' });
      return;
    }
    try {
      const result = await shareShieldDocx(body);
      if (!result?.uri) showToast(t('shieldShareFailed'), { type: 'error' });
      else showToast(t('shieldShareOk'), { type: 'success' });
    } catch {
      showToast(t('shieldShareFailed'), { type: 'error' });
    }
  };

  const handlePdf = async () => {
    if (!guardFull()) return;
    if (!patches.length) {
      showToast(t('shieldNoPatches'), { type: 'warning' });
      return;
    }
    const source = pickLongestSource();
    if (!String(source || '').trim()) {
      showToast(t('shieldNeedSource'), { type: 'warning' });
      return;
    }
    const applied = appliedWithTitles();
    try {
      const result = await shareShieldRedlinePdf({
        source,
        applied,
        title: t('shieldDocTitle'),
        dateLabel,
        summaryTitle: t('shieldDocTitle'),
        summaryLines: applied
          .map((item) => item.title || String(item.to || '').replace(/\s+/g, ' ').slice(0, 80))
          .filter(Boolean),
      });
      if (!result?.uri) showToast(t('shieldShareFailed'), { type: 'error' });
      else showToast(t('shieldShareOk'), { type: 'success' });
    } catch {
      showToast(t('shieldShareFailed'), { type: 'error' });
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.borderColor, marginTop: 16 }]}>
      <Text style={[styles.takeawayTitle, { color: theme.text }]}>{t('shieldDocTitle')}</Text>
      <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('shieldDocHint')}</Text>
      {patches.length ? (
        <Text style={[styles.sectionHint, { color: theme.subText, marginBottom: 4 }]}>
          {t('shieldExportAfterApply')}
        </Text>
      ) : null}
      {!patches.length ? (
        <Text style={[styles.sectionHint, { color: theme.subText }]}>{t('shieldNoPatches')}</Text>
      ) : null}

      {patches.map((patch) => {
        const checked = Boolean(selected[patch.id]);
        const locked = isLockedPatch(patch);
        const label = patch.titleKey ? t(patch.titleKey) : patch.title;
        const fullTo = String(patch.to || patch.preview || '').trim();
        return (
          <View
            key={patch.id}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8 }}
          >
            <TouchableOpacity
              onPress={() => togglePatch(patch)}
              activeOpacity={0.85}
              hitSlop={12}
              accessibilityRole="checkbox"
              accessibilityLabel={String(label || '')}
              accessibilityState={{ checked, disabled: locked }}
            >
              <Ionicons
                name={locked ? 'lock-closed' : checked ? 'checkbox' : 'square-outline'}
                size={18}
                color={locked ? theme.subText : checked ? theme.accent : theme.subText}
                style={{ marginTop: 2 }}
              />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button"
              style={{ flex: 1 }}
              onPress={() => {
                if (fullTo) Alert.alert(String(label || ''), fullTo);
              }}
              activeOpacity={0.85}
            >
              <Text style={[styles.deadlineLabel, { color: theme.text }]} numberOfLines={1}>
                {label}
              </Text>
              <Text style={[styles.deadlineMeta, { color: theme.subText }]} numberOfLines={1}>
                {patch.preview}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 8, marginTop: 8 }}>
        <TouchableOpacity accessibilityRole="button"
          style={[
            styles.primaryButton,
            { flex: 1, marginTop: 0, marginBottom: 0, minHeight: 50, paddingVertical: 12 },
            (!patches.length || !hasSourceText) && styles.buttonDisabled,
          ]}
          onPress={() => {
            if (!patches.length) return;
            if (!hasSourceText) {
              showToast(t('shieldNeedSource'), { type: 'warning' });
              return;
            }
            handleApply().catch(() => {});
          }}
          disabled={!patches.length || !hasSourceText}
          activeOpacity={0.85}
        >
          {placing ? (
            <ActivityIndicator color="#080C14" />
          ) : (
            <Text style={styles.primaryButtonText} numberOfLines={1} adjustsFontSizeToFit>
              {t('shieldApply')}
            </Text>
          )}
        </TouchableOpacity>
        {typeof onShareBrief === 'function' ? (
          <TouchableOpacity accessibilityRole="button"
            style={{
              flex: 1,
              minHeight: 50,
              paddingVertical: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.accent,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
            }}
            onPress={() => onShareBrief()}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText} numberOfLines={1} adjustsFontSizeToFit>
              {t('shareBriefTitle')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {stitched?.text ? (
        <View style={{ marginTop: 12 }}>
          {(stitched.skipped || []).filter((item) => item.reason === 'not_found').length ? (
            <Text style={[styles.sectionHint, { color: theme.warning }]}>
              {t('shieldSkipUnmatched', {
                count: stitched.skipped.filter((item) => item.reason === 'not_found').length,
              })}
            </Text>
          ) : null}
          <ScrollView nestedScrollEnabled style={{ maxHeight: 280 }}>
            <Text style={[styles.summaryText, { color: theme.text }]}>
              {lockPremium
                ? String(stitched.applied?.[0]?.to || stitched.text || '').slice(0, 400)
                : payloadText(stitched)}
            </Text>
          </ScrollView>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            <TouchableOpacity accessibilityRole="button" style={[styles.proposalBtn, { borderColor: theme.accent }]} onPress={() => handleCopy().catch(() => {})}>
              <Ionicons name={lockPremium ? 'lock-closed' : 'copy-outline'} size={14} color={theme.accent} />
              <Text style={styles.proposalBtnText}>{t('copyDraft')}</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={[styles.proposalBtn, { borderColor: theme.accent }]} onPress={() => handleShare().catch(() => {})}>
              <Ionicons name={lockPremium ? 'lock-closed' : 'share-outline'} size={14} color={theme.accent} />
              <Text style={styles.proposalBtnText}>{t('shareDraft')}</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={[styles.proposalBtn, { borderColor: theme.accent }]} onPress={() => handlePdf().catch(() => {})}>
              <Ionicons name={lockPremium ? 'lock-closed' : 'document-outline'} size={14} color={theme.accent} />
              <Text style={styles.proposalBtnText}>{t('exportPdfShort')}</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button"
              style={[styles.proposalBtn, { borderColor: theme.accent }]}
              onPress={() => {
                if (lockPremium) {
                  onNeedPaywall?.();
                  return;
                }
                onOpenDiff?.(stitched.text);
              }}
            >
              <Ionicons name={lockPremium ? 'lock-closed' : 'git-compare-outline'} size={14} color={theme.accent} />
              <Text style={styles.proposalBtnText}>{t('shieldOpenDiff')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}
