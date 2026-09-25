// WAVE LR.2 — Case files: pure model, timeline math, explainer import, lawyer brief and SHA-256 evidence fingerprints.

export const CASE_AREAS = [
  'labor',
  'rent',
  'consumer',
  'family',
  'inheritance',
  'traffic',
  'criminal',
  'debt',
  'enforcement',
  'administrative',
  'tax',
  'immigration',
  'contract',
  'other',
];

export const CASE_AREA_ICONS = {
  labor: 'briefcase-outline',
  rent: 'home-outline',
  consumer: 'cart-outline',
  family: 'people-outline',
  inheritance: 'git-network-outline',
  traffic: 'car-outline',
  criminal: 'shield-outline',
  debt: 'wallet-outline',
  enforcement: 'alert-circle-outline',
  administrative: 'business-outline',
  tax: 'calculator-outline',
  immigration: 'airplane-outline',
  contract: 'document-text-outline',
  other: 'folder-outline',
};

export const CASE_SIDES = ['claimant', 'respondent', 'undecided'];
export const CASE_STATUSES = ['preparing', 'active', 'waiting', 'closed'];
export const EVENT_KINDS = ['event', 'deadline', 'hearing', 'document', 'payment'];
export const EVENT_KIND_ICONS = {
  event: 'ellipse-outline',
  deadline: 'alarm-outline',
  hearing: 'people-circle-outline',
  document: 'document-attach-outline',
  payment: 'cash-outline',
};
export const EVIDENCE_KINDS = ['photo', 'pdf', 'note'];
export const DATED_ALERT_KINDS = ['deadline', 'hearing'];

export const FREE_CASE_LIMIT = 1;
export const MAX_EVENTS_PER_CASE = 200;
export const MAX_EVIDENCE_PER_CASE = 40;

const DOC_TYPE_AREA = {
  ENFORCEMENT_ORDER: 'enforcement',
  PAYMENT_ORDER: 'enforcement',
  DEBT_COLLECTION: 'debt',
  TAX_NOTICE: 'tax',
  FINE: 'administrative',
  ADMIN_DECISION: 'administrative',
  PROSECUTOR_POLICE: 'criminal',
  EMPLOYMENT_NOTICE: 'labor',
  EVICTION_NOTICE: 'rent',
  CONTRACT: 'contract',
};

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const clean = (value, max = 300) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

export function isIsoDate(value) {
  const match = ISO_RE.exec(String(value || ''));
  if (!match) return false;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  return y >= 1950 && y <= 2100 && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export function dmyToIso(value) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(value || '').trim());
  if (!match) return '';
  const iso = `${match[3]}-${match[2]}-${match[1]}`;
  return isIsoDate(iso) ? iso : '';
}

export function isoToDmy(iso) {
  const match = ISO_RE.exec(String(iso || ''));
  return match ? `${match[3]}.${match[2]}.${match[1]}` : '';
}

export function todayIso(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const dayNumber = (iso) => {
  const match = ISO_RE.exec(String(iso || ''));
  return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86400000 : NaN;
};

export function daysBetween(fromIso, toIso) {
  const diff = dayNumber(toIso) - dayNumber(fromIso);
  return Number.isNaN(diff) ? null : Math.round(diff);
}

let idCounter = 0;
export function newId(prefix = 'x') {
  idCounter = (idCounter + 1) % 1296;
  return `${prefix}${Date.now().toString(36)}${idCounter.toString(36).padStart(2, '0')}`;
}

export function createCase({ title, area, side, counterparty = '', country = 'auto' } = {}, now = new Date()) {
  const stamp = now.toISOString();
  return {
    id: newId('c'),
    title: clean(title, 120),
    area: pick(area, CASE_AREAS, 'other'),
    side: pick(side, CASE_SIDES, 'undecided'),
    counterparty: clean(counterparty, 160),
    country: clean(country, 8) || 'auto',
    status: 'preparing',
    createdAt: stamp,
    updatedAt: stamp,
    events: [],
    evidence: [],
  };
}

export function normalizeCase(raw) {
  if (!raw || typeof raw !== 'object' || !raw.id) return null;
  const events = (Array.isArray(raw.events) ? raw.events : [])
    .filter((ev) => ev && ev.id && isIsoDate(ev.date) && clean(ev.title))
    .map((ev) => ({
      id: String(ev.id),
      date: ev.date,
      title: clean(ev.title, 160),
      note: clean(ev.note, 600),
      kind: pick(ev.kind, EVENT_KINDS, 'event'),
      createdAt: String(ev.createdAt || ''),
    }))
    .slice(0, MAX_EVENTS_PER_CASE);
  const evidence = (Array.isArray(raw.evidence) ? raw.evidence : [])
    .filter((item) => item && item.id && /^sha256:[0-9a-f]{64}$/.test(item.fingerprint || ''))
    .map((item) => ({
      id: String(item.id),
      label: clean(item.label, 120),
      kind: pick(item.kind, EVIDENCE_KINDS, 'note'),
      fingerprint: item.fingerprint,
      fileName: clean(item.fileName, 80),
      note: clean(item.note, 2000),
      size: Number(item.size) || 0,
      addedAt: String(item.addedAt || ''),
    }))
    .slice(0, MAX_EVIDENCE_PER_CASE);
  return {
    id: String(raw.id),
    title: clean(raw.title, 120) || '—',
    area: pick(raw.area, CASE_AREAS, 'other'),
    side: pick(raw.side, CASE_SIDES, 'undecided'),
    counterparty: clean(raw.counterparty, 160),
    country: clean(raw.country, 8) || 'auto',
    status: pick(raw.status, CASE_STATUSES, 'preparing'),
    createdAt: String(raw.createdAt || ''),
    updatedAt: String(raw.updatedAt || ''),
    events,
    evidence,
  };
}

const touch = (item, patch, now = new Date()) => ({ ...item, ...patch, updatedAt: now.toISOString() });

export function addEvent(item, { date, title, note = '', kind = 'event' } = {}, now = new Date()) {
  if (!isIsoDate(date) || !clean(title)) return null;
  if (item.events.length >= MAX_EVENTS_PER_CASE) return null;
  const event = {
    id: newId('e'),
    date,
    title: clean(title, 160),
    note: clean(note, 600),
    kind: pick(kind, EVENT_KINDS, 'event'),
    createdAt: now.toISOString(),
  };
  return { item: touch(item, { events: [...item.events, event] }, now), event };
}

export const removeEvent = (item, eventId, now) =>
  touch(item, { events: item.events.filter((ev) => ev.id !== eventId) }, now);

export const setStatus = (item, status, now) => touch(item, { status: pick(status, CASE_STATUSES, item.status) }, now);

export function addEvidence(item, evidence, now = new Date()) {
  if (item.evidence.length >= MAX_EVIDENCE_PER_CASE) return null;
  if (!/^sha256:[0-9a-f]{64}$/.test(evidence?.fingerprint || '')) return null;
  const entry = {
    id: evidence.id || newId('v'),
    label: clean(evidence.label, 120),
    kind: pick(evidence.kind, EVIDENCE_KINDS, 'note'),
    fingerprint: evidence.fingerprint,
    fileName: clean(evidence.fileName, 80),
    note: clean(evidence.note, 2000),
    size: Number(evidence.size) || 0,
    addedAt: now.toISOString(),
  };
  return touch(item, { evidence: [...item.evidence, entry] }, now);
}

export const removeEvidence = (item, evidenceId, now) =>
  touch(item, { evidence: item.evidence.filter((ev) => ev.id !== evidenceId) }, now);

export function sortedTimeline(item) {
  return [...item.events].sort((a, b) => (a.date === b.date ? a.createdAt.localeCompare(b.createdAt) : a.date.localeCompare(b.date)));
}

export function upcomingAlerts(item, today = todayIso()) {
  return sortedTimeline(item).filter((ev) => DATED_ALERT_KINDS.includes(ev.kind) && ev.date >= today);
}

export function nextAction(item, today = todayIso()) {
  if (item.status === 'closed') return { type: 'closed' };
  const next = upcomingAlerts(item, today)[0];
  if (!next) return { type: 'none' };
  return { type: next.kind, event: next, daysLeft: daysBetween(today, next.date) };
}

export function canCreateCase(cases, isPro) {
  return isPro || (cases || []).length < FREE_CASE_LIMIT;
}

export function areaForDocType(docType) {
  return DOC_TYPE_AREA[docType] || 'other';
}

// Explainer import: the document becomes a dated timeline entry; only deadlines with a stated date become alerts.
export function mergeExplanation(item, exp, today = todayIso(), now = new Date()) {
  if (!item || !exp?.title) return null;
  const ruleLines = exp.deadlines.filter((d) => !d.date && d.rule).map((d) => `${d.label}: ${d.rule}`);
  let next = addEvent(item, {
    date: today,
    title: exp.title,
    note: [exp.issuer, exp.summary, ...ruleLines].filter(Boolean).join(' · '),
    kind: 'document',
  }, now)?.item;
  if (!next) return null;
  for (const deadline of exp.deadlines) {
    if (!deadline.date) continue;
    const added = addEvent(next, { date: deadline.date, title: deadline.label, note: exp.title, kind: 'deadline' }, now);
    if (added) next = added.item;
  }
  return next;
}

export function caseFromExplanation(exp, { country = 'auto', today = todayIso(), now = new Date() } = {}) {
  const base = createCase({ title: exp?.title, area: areaForDocType(exp?.docType), side: 'undecided', counterparty: exp?.issuer, country }, now);
  return mergeExplanation(base, exp, today, now);
}

// Plain-text brief for a lawyer or the advisor chat; the disclaimer is always the last line.
export function formatCaseBrief(item, t, { disclaimer = '', today = todayIso(), includeEvidence = true } = {}) {
  const lines = [
    `${t('caseBriefHeader')}: ${item.title}`,
    `${t('caseAreaLabel')}: ${t(`caseArea_${item.area}`)}`,
    `${t('caseSideLabel')}: ${t(`caseSide_${item.side}`)}`,
    `${t('caseStatusLabel')}: ${t(`caseStatus_${item.status}`)}`,
  ];
  if (item.counterparty) lines.push(`${t('caseBriefParties')}: ${item.counterparty}`);
  const timeline = sortedTimeline(item);
  if (timeline.length) {
    lines.push('', `${t('caseBriefChronology')}:`);
    timeline.forEach((ev) => lines.push(`- ${ev.date} [${t(`caseKind_${ev.kind}`)}] ${ev.title}${ev.note ? ` — ${ev.note}` : ''}`));
  }
  const upcoming = upcomingAlerts(item, today);
  if (upcoming.length) {
    lines.push('', `${t('caseBriefUpcoming')}:`);
    upcoming.forEach((ev) => lines.push(`- ${ev.date}: ${ev.title}`));
  }
  if (includeEvidence && item.evidence.length) {
    lines.push('', `${t('caseBriefEvidenceList')}:`);
    item.evidence.forEach((ev) =>
      lines.push(`- ${ev.label || t(`caseEvidence${ev.kind === 'pdf' ? 'Pdf' : ev.kind === 'photo' ? 'Photo' : 'Note'}`)} (${ev.addedAt.slice(0, 10)}) ${ev.fingerprint}`)
    );
  }
  if (disclaimer) lines.push('', disclaimer);
  return lines.join('\n');
}

// --- SHA-256 (FIPS 180-4), pure JS: no native crypto module is bundled.
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

export function sha256Hex(bytes) {
  const len = bytes.length;
  const bitLenHi = Math.floor(len / 0x20000000);
  const bitLenLo = (len * 8) >>> 0;
  const padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, bitLenHi);
  view.setUint32(padded.length - 4, bitLenLo);
  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i += 1) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }
  return h.map((x) => x.toString(16).padStart(8, '0')).join('');
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const B64_LOOKUP = (() => {
  const table = new Int16Array(256).fill(-1);
  for (let i = 0; i < B64.length; i += 1) table[B64.charCodeAt(i)] = i;
  table['-'.charCodeAt(0)] = 62;
  table['_'.charCodeAt(0)] = 63;
  return table;
})();

export function base64ToBytes(base64) {
  const src = String(base64 || '').replace(/^data:[^;]+;base64,/, '');
  const out = new Uint8Array(Math.floor((src.length * 3) / 4));
  let buffer = 0;
  let bits = 0;
  let n = 0;
  for (let i = 0; i < src.length; i += 1) {
    const v = B64_LOOKUP[src.charCodeAt(i)];
    if (v < 0) continue;
    buffer = (buffer << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[n] = (buffer >> bits) & 0xff;
      n += 1;
    }
  }
  return out.subarray(0, n);
}

export function utf8Bytes(text) {
  const str = String(text || '');
  const out = [];
  for (let i = 0; i < str.length; i += 1) {
    let code = str.codePointAt(i);
    if (code > 0xffff) i += 1;
    if (code < 0x80) out.push(code);
    else if (code < 0x800) out.push(0xc0 | (code >> 6), 0x80 | (code & 63));
    else if (code < 0x10000) out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
    else out.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 63), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
  }
  return Uint8Array.from(out);
}

export const fingerprintBytes = (bytes) => `sha256:${sha256Hex(bytes)}`;

export function assertCaseFixtures() {
  const fail = [];
  if (sha256Hex(utf8Bytes('abc')) !== 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad') fail.push('sha abc');
  if (sha256Hex(new Uint8Array(0)) !== 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') fail.push('sha empty');
  if (sha256Hex(utf8Bytes('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')) !== '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1') fail.push('sha 2-block');
  if (sha256Hex(utf8Bytes('ş')) !== sha256Hex(Uint8Array.from([0xc5, 0x9f]))) fail.push('utf8');
  if (fingerprintBytes(base64ToBytes('YWJj')) !== `sha256:${sha256Hex(utf8Bytes('abc'))}`) fail.push('base64');

  if (dmyToIso('29.02.2025') || dmyToIso('2025-02-01') || dmyToIso('31.04.2026')) fail.push('invalid dmy accepted');
  if (dmyToIso('29.02.2028') !== '2028-02-29' || isoToDmy('2026-10-05') !== '05.10.2026') fail.push('dmy round trip');

  const now = new Date('2026-09-25T10:00:00Z');
  let item = createCase({ title: '  Unpaid  wages ', area: 'nope', side: 'claimant' }, now);
  if (item.title !== 'Unpaid wages' || item.area !== 'other' || item.side !== 'claimant' || item.status !== 'preparing') fail.push('createCase');
  if (addEvent(item, { date: '2026-13-01', title: 'x' }) || addEvent(item, { date: '2026-10-01', title: ' ' })) fail.push('bad event accepted');
  item = addEvent(item, { date: '2026-10-20', title: 'Hearing', kind: 'hearing' }, now).item;
  item = addEvent(item, { date: '2026-09-01', title: 'Dismissal letter', kind: 'document' }, now).item;
  item = addEvent(item, { date: '2026-10-05', title: 'Objection deadline', kind: 'deadline' }, now).item;
  item = addEvent(item, { date: '2026-09-20', title: 'Old deadline', kind: 'deadline' }, now).item;
  if (sortedTimeline(item).map((ev) => ev.date).join() !== '2026-09-01,2026-09-20,2026-10-05,2026-10-20') fail.push('timeline order');
  const next = nextAction(item, '2026-09-25');
  if (next.type !== 'deadline' || next.daysLeft !== 10 || next.event.title !== 'Objection deadline') fail.push('nextAction');
  if (nextAction(setStatus(item, 'closed'), '2026-09-25').type !== 'closed') fail.push('closed');
  if (nextAction(createCase({ title: 'x' }), '2026-09-25').type !== 'none') fail.push('none');
  if (upcomingAlerts(item, '2026-09-25').length !== 2) fail.push('upcoming');

  if (canCreateCase([item], false) || !canCreateCase([], false) || !canCreateCase([item, item], true)) fail.push('limit');
  if (addEvidence(item, { label: 'x', fingerprint: 'md5:abc' })) fail.push('bad fingerprint accepted');
  item = addEvidence(item, { label: 'Wall photo', kind: 'photo', fingerprint: fingerprintBytes(utf8Bytes('img')), fileName: 'v1.jpg' }, now);
  if (item.evidence.length !== 1 || !normalizeCase(JSON.parse(JSON.stringify(item)))) fail.push('evidence/normalize');
  if (normalizeCase({ id: 'c1', events: [{ id: 'e', date: 'bad', title: 't' }] }).events.length !== 0) fail.push('normalize drops bad events');

  const exp = {
    docType: 'EVICTION_NOTICE',
    title: 'Eviction notice',
    issuer: 'Landlord Ltd',
    summary: 'You must leave.',
    deadlines: [
      { label: 'Leave the flat', date: '2026-11-30', rule: '' },
      { label: 'Object', date: '', rule: '7 days from service' },
    ],
  };
  const fromDoc = caseFromExplanation(exp, { today: '2026-09-25', now });
  if (fromDoc.area !== 'rent' || fromDoc.counterparty !== 'Landlord Ltd') fail.push('caseFromExplanation area/party');
  if (fromDoc.events.length !== 2 || !fromDoc.events.some((ev) => ev.kind === 'deadline' && ev.date === '2026-11-30')) fail.push('import dated deadline');
  if (!fromDoc.events[0].note.includes('7 days from service')) fail.push('rule kept as note, not as a computed date');

  const brief = formatCaseBrief(item, (k) => k, { disclaimer: 'DISCLAIMER', today: '2026-09-25' });
  if (!brief.endsWith('DISCLAIMER') || !brief.includes('sha256:') || !brief.includes('caseBriefUpcoming')) fail.push('brief');
  if (formatCaseBrief(item, (k) => k, { includeEvidence: false }).includes('sha256:')) fail.push('brief without evidence');
  if (fail.length) throw new Error(`case fixtures: ${fail.join('; ')}`);
  return { cases: 28 };
}
