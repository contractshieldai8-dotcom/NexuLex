// Sözleşme metninden fesih / gizlilik / iade sürelerini çıkarır.
// Yalnızca açık süre ifadesi bulunursa badge üretir; aksi halde belirsiz bırakılmaz.

/** Local TR fold (mirrors utils/contractType.foldTr) — kept inline for verify-ui Function eval. */
function foldTr(text) {
  return String(text || '')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/Ş/g, 'ş')
    .replace(/Ğ/g, 'ğ')
    .replace(/Ü/g, 'ü')
    .replace(/Ö/g, 'ö')
    .replace(/Ç/g, 'ç')
    .toLowerCase();
}

const DURATION_RE =
  /(\d{1,3})\s*(gün|gun|days|day|hafta|weeks|week|months|month|yıl|yil|years|year|ay)\b/gi;

const SLOT_NEEDLES = [
  {
    slot: 'termination',
    re: /fesih|ihbar|ihtar|düzeltme|duzeltme|termination|notice|kündig|préavis|opzeg|önceden|onceden|yazılı|yazili|auto-?renew|yenileme/gi,
  },
  { slot: 'confidentiality', re: /gizlilik|confidentiality|confidential|\bnda\b|sır\s*saklama|geheim|محرمان/gi },
  { slot: 'return_or_refund', re: /depozito|teminat|iade|deposit|refund|kaution|garanti/gi },
];

const UNIT_TR = {
  gün: 'gün',
  gun: 'gün',
  day: 'gün',
  days: 'gün',
  hafta: 'hafta',
  week: 'hafta',
  weeks: 'hafta',
  ay: 'ay',
  month: 'ay',
  months: 'ay',
  yıl: 'yıl',
  yil: 'yıl',
  year: 'yıl',
  years: 'yıl',
};

const UNIT_EN = {
  gün: 'days',
  gun: 'days',
  day: 'days',
  days: 'days',
  hafta: 'weeks',
  week: 'weeks',
  weeks: 'weeks',
  ay: 'months',
  month: 'months',
  months: 'months',
  yıl: 'years',
  yil: 'years',
  year: 'years',
  years: 'years',
};

function classifySlot(text, index) {
  let best = null;
  let bestScore = 80;
  for (const needle of SLOT_NEEDLES) {
    needle.re.lastIndex = 0;
    let match = needle.re.exec(text);
    while (match) {
      const offset = match.index - index;
      const before = offset <= 0 && -offset <= 72;
      const after = offset > 0 && offset <= 28;
      if (before || after) {
        const score = before ? -offset : offset + 40;
        if (score < bestScore) {
          bestScore = score;
          best = needle.slot;
        }
      }
      match = needle.re.exec(text);
    }
  }
  return best;
}

export function extractTrapDurations(source) {
  const text = String(source || '');
  const found = {
    termination: null,
    confidentiality: null,
    return_or_refund: null,
  };
  if (!text.trim()) return found;

  DURATION_RE.lastIndex = 0;
  let match = DURATION_RE.exec(text);
  while (match) {
    const amount = Number(match[1]);
    const unitRaw = String(match[2] || '').toLowerCase();
    const slot = classifySlot(text, match.index);
    if (slot && amount > 0 && !found[slot]) {
      found[slot] = {
        amount,
        unit: UNIT_TR[unitRaw] || 'gün',
        unitEn: UNIT_EN[unitRaw] || 'days',
        rule: `${amount} ${UNIT_TR[unitRaw] || 'gün'}`,
      };
    }
    match = DURATION_RE.exec(text);
  }
  return found;
}

// Localised duration badge ("60 days · Notice"). One table per app language so a German,
// Arabic or Japanese reader never sees an English-only chip. Kept inline (no imports)
// because verify-ui evaluates this file with Function().
// unit forms: [day, week, month, year] -> [one, other] (ru/ar use their own plural rules below).
const BADGE_UNITS = {
  tr: { d: ['gün', 'gün'], w: ['hafta', 'hafta'], m: ['ay', 'ay'], y: ['yıl', 'yıl'] },
  en: { d: ['day', 'days'], w: ['week', 'weeks'], m: ['month', 'months'], y: ['year', 'years'] },
  de: { d: ['Tag', 'Tage'], w: ['Woche', 'Wochen'], m: ['Monat', 'Monate'], y: ['Jahr', 'Jahre'] },
  fr: { d: ['jour', 'jours'], w: ['semaine', 'semaines'], m: ['mois', 'mois'], y: ['an', 'ans'] },
  es: { d: ['día', 'días'], w: ['semana', 'semanas'], m: ['mes', 'meses'], y: ['año', 'años'] },
  it: { d: ['giorno', 'giorni'], w: ['settimana', 'settimane'], m: ['mese', 'mesi'], y: ['anno', 'anni'] },
  pt: { d: ['dia', 'dias'], w: ['semana', 'semanas'], m: ['mês', 'meses'], y: ['ano', 'anos'] },
  nl: { d: ['dag', 'dagen'], w: ['week', 'weken'], m: ['maand', 'maanden'], y: ['jaar', 'jaar'] },
  fa: { d: ['روز', 'روز'], w: ['هفته', 'هفته'], m: ['ماه', 'ماه'], y: ['سال', 'سال'] },
  zh: { d: ['天', '天'], w: ['周', '周'], m: ['个月', '个月'], y: ['年', '年'] },
  ja: { d: ['日', '日'], w: ['週間', '週間'], m: ['か月', 'か月'], y: ['年', '年'] },
  ru: {
    d: ['день', 'дня', 'дней'],
    w: ['неделя', 'недели', 'недель'],
    m: ['месяц', 'месяца', 'месяцев'],
    y: ['год', 'года', 'лет'],
  },
  ar: {
    d: ['يوم', 'يومان', 'أيام', 'يومًا'],
    w: ['أسبوع', 'أسبوعان', 'أسابيع', 'أسبوعًا'],
    m: ['شهر', 'شهران', 'أشهر', 'شهرًا'],
    y: ['سنة', 'سنتان', 'سنوات', 'سنة'],
  },
};

const BADGE_KINDS = {
  tr: { n: 'İhbar', t: 'Süre', r: 'İade' },
  en: { n: 'Notice', t: 'Term', r: 'Refund' },
  de: { n: 'Kündigungsfrist', t: 'Laufzeit', r: 'Rückerstattung' },
  fr: { n: 'Préavis', t: 'Durée', r: 'Remboursement' },
  es: { n: 'Preaviso', t: 'Plazo', r: 'Reembolso' },
  it: { n: 'Preavviso', t: 'Durata', r: 'Rimborso' },
  pt: { n: 'Aviso prévio', t: 'Prazo', r: 'Reembolso' },
  nl: { n: 'Opzegtermijn', t: 'Looptijd', r: 'Terugbetaling' },
  fa: { n: 'اخطار', t: 'مدت', r: 'بازپرداخت' },
  zh: { n: '通知期', t: '期限', r: '退款' },
  ja: { n: '通知期間', t: '期間', r: '返金' },
  ru: { n: 'Уведомление', t: 'Срок', r: 'Возврат' },
  ar: { n: 'إشعار', t: 'مدة', r: 'استرداد' },
};

const BADGE_UNIT_KEY = { days: 'd', weeks: 'w', months: 'm', years: 'y' };

function badgeLang(lang) {
  const code = String(lang || 'tr').slice(0, 2).toLowerCase();
  return BADGE_UNITS[code] ? code : 'en';
}

function badgeUnitLabel(code, unitKey, amount) {
  const forms = BADGE_UNITS[code][unitKey];
  const n = Math.abs(Number(amount) || 0);
  if (code === 'ru') {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
    return forms[2];
  }
  if (code === 'ar') {
    if (n === 1) return forms[0];
    if (n === 2) return forms[1];
    if (n >= 3 && n <= 10) return forms[2];
    return forms[3];
  }
  return n === 1 ? forms[0] : forms[1];
}

export function trapBadgeFor(slotKey, duration, lang = 'tr') {
  if (!duration) return '';
  const code = badgeLang(lang);
  const unitKey = BADGE_UNIT_KEY[duration.unitEn] || 'd';
  const unit = badgeUnitLabel(code, unitKey, duration.amount);
  const kinds = BADGE_KINDS[code];
  let kind = '';
  if (slotKey === 'termination' || slotKey === 'TERMINATION_WINDOW') kind = kinds.n;
  else if (slotKey === 'confidentiality' || slotKey === 'CONFIDENTIALITY') kind = kinds.t;
  else if (slotKey === 'return_or_refund' || slotKey === 'RETURN') kind = kinds.r;
  const span = `${duration.amount} ${unit}`;
  return kind ? `${span} · ${kind}` : span;
}

export function analysisSourceText(analysis) {
  return [
    analysis?.summary,
    analysis?.originalText,
    analysis?.contract_text,
    ...(analysis?.clauses || []).flatMap((item) => [item.clauseTitle, item.issue, item.originalText]),
    ...(analysis?.redFlags || []).flatMap((item) => [item.title, item.explanation]),
    ...(analysis?.importantDates || []).flatMap((item) => [item.label, item.note]),
  ]
    .filter(Boolean)
    .join('\n');
}

const MONTH_INDEX = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  ocak: 1,
  subat: 2,
  şubat: 2,
  mart: 3,
  nisan: 4,
  mayis: 5,
  mayıs: 5,
  haziran: 6,
  temmuz: 7,
  agustos: 8,
  ağustos: 8,
  eylul: 9,
  eylül: 9,
  ekim: 10,
  kasim: 11,
  kasım: 11,
  aralik: 12,
  aralık: 12,
};

const MONTH_NAME_RE =
  'January|February|March|April|May|June|July|August|September|October|November|December|Ocak|Şubat|Subat|Mart|Nisan|Mayıs|Mayis|Haziran|Temmuz|Ağustos|Agustos|Eylül|Eylul|Ekim|Kasım|Kasim|Aralık|Aralik';

/** Folded lowercase month names for TR date labels after foldTr(). */
const MONTH_NAME_FOLDED =
  'january|february|march|april|may|june|july|august|september|october|november|december|ocak|şubat|subat|mart|nisan|mayıs|mayis|haziran|temmuz|ağustos|agustos|eylül|eylul|ekim|kasım|kasim|aralık|aralik';

const toIsoLocal = (year, month, day) => {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return '';
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return '';
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

const monthIndex = (name) => MONTH_INDEX[String(name || '').toLowerCase()] || 0;

export function isNoticeDurationSlot(kind) {
  const key = String(kind || '').toUpperCase();
  return /TERMIN|RENEW|NOTICE|WINDOW|IHBAR/.test(key);
}

export function durationToDays(duration) {
  if (!duration) return 0;
  const amount = Number(duration.amount) || 0;
  if (amount <= 0) return 0;
  const unit = String(duration.unit || duration.unitEn || '').toLowerCase();
  if (unit === 'hafta' || unit === 'week' || unit === 'weeks') return amount * 7;
  if (unit === 'ay' || unit === 'month' || unit === 'months') return amount * 30;
  if (unit === 'yıl' || unit === 'yil' || unit === 'year' || unit === 'years') return amount * 365;
  return amount;
}

export function noticeDateIso(anchorIso, duration) {
  const raw = String(anchorIso || '').trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const days = durationToDays(duration);
  if (!match || !days) return '';
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  date.setDate(date.getDate() - days);
  return toIsoLocal(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function extractAnchorEndDate(source) {
  const text = String(source || '');
  if (!text.trim()) return '';
  // Fold TR so "Bitiş" / "Sözleşme" labels match reliably.
  const folded = foldTr(text);

  const namedMdY = new RegExp(
    `\\b(?:through|ending(?:\\s+on)?|term\\s+ends?(?:\\s+on)?|until|renews?(?:\\s+on)?)\\s+(${MONTH_NAME_RE})\\s+(\\d{1,2}),?\\s+(\\d{4})\\b`,
    'i'
  );
  const namedHit = text.match(namedMdY) || folded.match(namedMdY);
  if (namedHit) {
    const iso = toIsoLocal(namedHit[3], monthIndex(namedHit[1]), namedHit[2]);
    if (iso) return iso;
  }

  const namedDmy = new RegExp(
    `\\b(?:through|ending(?:\\s+on)?|term\\s+ends?(?:\\s+on)?|until)\\s+(\\d{1,2})\\s+(${MONTH_NAME_RE})\\s+(\\d{4})\\b`,
    'i'
  );
  const dmyHit = text.match(namedDmy) || folded.match(namedDmy);
  if (dmyHit) {
    const iso = toIsoLocal(dmyHit[3], monthIndex(dmyHit[2]), dmyHit[1]);
    if (iso) return iso;
  }

  // "Sözleşme Bitiş Tarihi: 31 Aralık 2027" (day + month-name + year)
  const bitisDmyNamed = new RegExp(
    `(?:sözleşme\\s+)?biti[sş](?:\\s*tarihi|\\s*i)?\\s*[:|：]?\\s*(\\d{1,2})\\s+(${MONTH_NAME_FOLDED})\\s+(\\d{4})`,
    'i'
  );
  const bitisDmyHit = folded.match(bitisDmyNamed);
  if (bitisDmyHit) {
    const iso = toIsoLocal(bitisDmyHit[3], monthIndex(bitisDmyHit[2]), bitisDmyHit[1]);
    if (iso) return iso;
  }

  // English-order month first: "bitiş tarihi: December 31, 2027"
  const bitisNamed = new RegExp(
    `biti[sş]\\s*tarihi\\s*[:：]?\\s*(${MONTH_NAME_FOLDED})\\s+(\\d{1,2}),?\\s+(\\d{4})`,
    'i'
  );
  const bitisNamedHit = folded.match(bitisNamed);
  if (bitisNamedHit) {
    const iso = toIsoLocal(bitisNamedHit[3], monthIndex(bitisNamedHit[1]), bitisNamedHit[2]);
    if (iso) return iso;
  }

  // "Sözleşme bitişi| 31.12.2027" / "bitiş: 31.12.2027" / "bitiş tarihi: 31.12.2027"
  const bitisNumeric = folded.match(
    /(?:sözleşme\s+)?biti[sş](?:\s*tarihi|\s*i)?\s*[:|：]?\s*(\d{1,2})[./-](\d{1,2})[./-](\d{4})/i
  );
  if (bitisNumeric) {
    const iso = toIsoLocal(bitisNumeric[3], bitisNumeric[2], bitisNumeric[1]);
    if (iso) return iso;
  }

  const labeledIso = folded.match(
    /\b(?:through|ending(?:\s+on)?|term\s+ends?(?:\s+on)?|until|renews?(?:\s+on)?|biti[sş]\s*tarihi\s*[:：]?)\s+(\d{4}-\d{2}-\d{2})\b/i
  );
  if (labeledIso && toIsoLocal(...labeledIso[1].split('-'))) return labeledIso[1];

  return '';
}

export function fireDateForIso(eventDate) {
  const raw = String(eventDate || '').trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const when = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 9, 0, 0, 0);
  if (when.getTime() <= Date.now() + 60 * 1000) return null;
  return when;
}

const isDummyTrapItem = (item) => {
  if (!item || item.placeholder) return true;
  const dateRaw = String(item.eventDateOrOffset || item.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(dateRaw)) return true;
  return !fireDateForIso(dateRaw);
};

export function reminderItems(events = [], dates = []) {
  const seen = new Set();
  const items = [];
  for (const item of [...(events || []), ...(dates || [])]) {
    if (isDummyTrapItem(item)) continue;
    const dateRaw = item?.eventDateOrOffset || item?.date;
    const when = fireDateForIso(dateRaw);
    const label = String(item?.eventTitle || item?.label || item?.note || item?.badge || '').trim();
    if (!when || !label) continue;
    const key = `${when.getFullYear()}-${String(when.getMonth() + 1).padStart(2, '0')}-${String(when.getDate()).padStart(2, '0')}:${label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      when,
      label,
      kind: item.eventType || item.kind || 'deadline',
    });
  }
  return items;
}

export function assertTrapFixtures() {
  const fail = [];
  const text = `SaaS Agreement. Initial term is 12 months with 24-month support.
The subscription continues through September 30, 2028.
Either party may terminate for convenience with 60 days prior written notice.
Confidentiality survives. Deposit is unspecified.`;
  const anchor = extractAnchorEndDate(text);
  if (anchor !== '2028-09-30') fail.push(`anchor ${anchor}`);
  if (extractAnchorEndDate('The initial term is 12 months and a 24-month commitment.')) {
    fail.push('invented from months');
  }
  const extracted = extractTrapDurations(text);
  if (extracted.termination?.amount !== 60) fail.push('60 day duration');
  const notice = noticeDateIso(anchor, extracted.termination);
  if (notice !== '2028-08-01') fail.push(`notice ${notice}`);
  const items = reminderItems([], [
    { label: 'TERMINATION_WINDOW', date: notice, badge: '60 gün · İhbar', kind: 'TERMINATION_WINDOW' },
    { label: 'CONFIDENTIALITY', date: '', badge: '', note: 'Belirsiz', placeholder: true, kind: 'CONFIDENTIALITY' },
    { label: 'RETURN', date: '', badge: '', note: 'Belirsiz', placeholder: true, kind: 'RETURN' },
  ]);
  if (items.length !== 1) fail.push(`items ${items.length}`);
  const when = items[0]?.when;
  if (!when || when.getFullYear() !== 2028 || when.getMonth() !== 7 || when.getDate() !== 1) {
    fail.push(`when ${when && when.toISOString ? when.toISOString() : when}`);
  }
  const noAnchor = reminderItems([], [
    { label: 'TERMINATION_WINDOW', date: '', badge: '60 gün · İhbar', kind: 'TERMINATION_WINDOW' },
  ]);
  if (noAnchor.length !== 0) fail.push('no-anchor scheduled');
  if (fail.length) {
    const err = new Error(`trap fixtures: ${fail.join('; ')}`);
    err.detail = { fail };
    throw err;
  }
  const trAnchor = extractAnchorEndDate('Sözleşme Bitiş Tarihi: 31 Aralık 2027. Fesih ihbar 60 gün.');
  if (trAnchor !== '2027-12-31') {
    const err = new Error(`trap fixtures: TR named end ${trAnchor}`);
    err.detail = { trAnchor };
    throw err;
  }
  return { anchor, notice, items, trAnchor };
}
