// View-only brief: karar + kalkan + tuzaklar. Orijinal sözleşme ve originalText yok.

export const SHARE_AUDIENCES = ['household', 'advisor', 'counterparty'];
export const SHARE_CODE_RE = /^[0-9A-HJKMNP-TV-Z]{8}$/;
export const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const DISCLAIMERS = {
  tr: 'Genel bilgidir, hukuki tavsiye değildir.',
  en: 'General information, not legal advice.',
  de: 'Allgemeine Information, keine Rechtsberatung.',
  fr: 'Information générale, pas un conseil juridique.',
  es: 'Información general, no es asesoramiento jurídico.',
  ar: 'معلومات عامة وليست استشارة قانونية.',
  it: 'Informazione generale, non consulenza legale.',
  zh: '一般信息，并非法律意见。',
  ru: 'Общая информация, не юридическая консультация.',
  fa: 'اطلاعات عمومی است، مشاوره حقوقی نیست.',
  ja: '一般情報であり、法的助言ではありません。',
  pt: 'Informação geral, não é aconselhamento jurídico.',
  nl: 'Algemene informatie, geen juridisch advies.',
};

const asArray = (value) => (Array.isArray(value) ? value : []);
const asObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : null);

const clipSentences = (text, max = 3) => {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  const parts = [];
  let buf = '';
  for (let i = 0; i < raw.length; i += 1) {
    buf += raw[i];
    if (/[.!?…]/.test(raw[i])) {
      const piece = buf.trim();
      if (piece) parts.push(piece);
      buf = '';
      if (parts.length >= max) return parts.join(' ');
    }
  }
  if (buf.trim() && parts.length < max) parts.push(buf.trim());
  return parts.slice(0, max).join(' ');
};

const collapse = (text) =>
  String(text || '')
    .replace(/\s+/g, ' ')
    .trim();

export function parseShareCode(url) {
  const raw = String(url || '');
  if (!raw) return '';
  const patterns = [
    /(?:nexulex|contractshield):\/\/share\/([0-9A-HJKMNP-TV-Z]{8})\b/i,
    /\/--\/share\/([0-9A-HJKMNP-TV-Z]{8})\b/i,
    /brief-web\/index\.html(?:\?|&)(?:[^#]*?[?&])?code=([0-9A-HJKMNP-TV-Z]{8})\b/i,
    /open-share(?:\?|&)(?:[^#]*?[?&])?code=([0-9A-HJKMNP-TV-Z]{8})\b/i,
    /[?&]code=([0-9A-HJKMNP-TV-Z]{8})\b/i,
  ];
  for (const re of patterns) {
    const match = raw.match(re);
    if (match) return match[1].toUpperCase();
  }
  return '';
}

export function normalizeAudience(value) {
  const code = String(value || '').toLowerCase().trim();
  return SHARE_AUDIENCES.includes(code) ? code : '';
}

const pickFlags = (analysis) => {
  const flags = asArray(analysis?.redFlags || analysis?.red_flags);
  return flags
    .map((flag) => ({
      title: String(flag?.title || flag?.clauseTitle || '').trim(),
      severity: String(flag?.severity || flag?.riskLevel || 'RED').toUpperCase(),
      explanation: String(flag?.explanation || flag?.issue || '').trim(),
      counterOffer: String(flag?.counterOffer || flag?.counter_offer || '').trim(),
    }))
    .filter((flag) => flag.title || flag.explanation || flag.counterOffer)
    .slice(0, 4);
};

const pickMissing = (analysis) => {
  const items = asArray(analysis?.missingProtections || analysis?.missing_protections);
  return items
    .map((item) => ({
      playbookId: String(item?.playbookId || item?.playbook_id || '').trim(),
      status: String(item?.status || '').toUpperCase(),
      whyItHurts: String(item?.whyItHurts || item?.why_it_hurts || '').trim(),
      insertClause: String(item?.insertClause || item?.insert_clause || '').trim(),
    }))
    .filter((item) => item.playbookId || item.whyItHurts || item.insertClause)
    .slice(0, 5);
};

const pickTrap = (analysis) => {
  const calendar = asObject(analysis?.trapCalendar || analysis?.trap_calendar);
  if (calendar && Object.keys(calendar).length) {
    const trap = {};
    Object.keys(calendar).forEach((key) => {
      const slot = asObject(calendar[key]) || {};
      trap[key] = {
        date_or_rule: String(slot.date_or_rule || slot.dateOrRule || slot.date || '').trim(),
        note: String(slot.note || '').trim(),
      };
    });
    return trap;
  }
  const dates = asArray(analysis?.importantDates || analysis?.important_dates || analysis?.contractEvents);
  return dates
    .map((item) => ({
      label: String(item?.label || item?.eventTitle || item?.kind || '').trim(),
      date: String(item?.date || item?.eventDateOrOffset || item?.date_or_rule || '').trim(),
      note: String(item?.note || '').trim(),
      kind: String(item?.kind || item?.eventType || '').trim(),
    }))
    .filter((item) => item.label || item.date || item.note)
    .slice(0, 8);
};

const pickDecision = (analysis) => {
  const decision = asObject(analysis?.decision) || {};
  const reasons = asArray(decision.reasons)
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 3);
  return {
    action: String(decision.action || '').toUpperCase() || 'NEGOTIATE',
    headline: String(decision.headline || '').trim(),
    reasons: reasons.slice(0, 3),
    estimatedHarm: String(decision.estimatedHarm || decision.estimated_harm || '').trim(),
  };
};

const leakHaystack = (snapshot) => {
  const clone = JSON.parse(JSON.stringify(snapshot || {}));
  clone.shieldText = '';
  (clone.flags || []).forEach((flag) => {
    if (flag) flag.counterOffer = '';
  });
  (clone.missing || []).forEach((item) => {
    if (item) item.insertClause = '';
  });
  return JSON.stringify(clone);
};

export function assertNoSourceLeak(snapshot, sourceText = '') {
  const packed = JSON.stringify(snapshot || {});
  if (/"contract_text"|"contractText"|"originalText"|"original_text"/.test(packed)) {
    throw new Error('SHARE_LEAK');
  }
  const source = collapse(sourceText);
  if (source.length < 40) return snapshot;
  const hay = leakHaystack(snapshot);
  for (let i = 0; i <= source.length - 40; i += 23) {
    const slice = source.slice(i, i + 40);
    if (slice.length < 40) continue;
    let count = 0;
    let at = 0;
    while (at >= 0 && count < 3) {
      const found = source.indexOf(slice, at);
      if (found < 0) break;
      count += 1;
      at = found + 1;
    }
    if (count !== 1) continue;
    if (hay.includes(slice)) throw new Error('SHARE_LEAK');
  }
  return snapshot;
}

export function buildShareSnapshot(analysis, { audience, locale, countryLabel = '', partyLabel = '' } = {}) {
  const audienceCode = normalizeAudience(audience);
  if (!audienceCode) throw new Error('SHARE_AUDIENCE');
  const lang = String(locale || 'en').slice(0, 2).toLowerCase();
  const row = analysis || {};
  const snapshot = {
    audience: audienceCode,
    locale: lang,
    countryLabel: String(countryLabel || row.jurisdiction?.country || '').trim(),
    partyLabel: String(partyLabel || row.partyRole || row.party_role || '').trim(),
    dateISO: String(row.created_at || row.dateISO || new Date().toISOString()).slice(0, 10),
    lifecycle: String(row.lifecycle || 'draft').toLowerCase(),
    score: Number.isFinite(Number(row.score)) ? Number(row.score) : 0,
    overallRisk: String(row.overallRisk || row.overall_risk || row.risk || '').toUpperCase(),
    decision: pickDecision(row),
    summary: clipSentences(row.summary, 3),
    flags: pickFlags(row),
    missing: pickMissing(row),
    trap: pickTrap(row),
    shieldText: String(row.revised_contract_text || row.revisedContractText || '').trim(),
    disclaimer: DISCLAIMERS[lang] || DISCLAIMERS.en,
  };
  const source = row.contract_text || row.contractText || '';
  return assertNoSourceLeak(snapshot, source);
}
