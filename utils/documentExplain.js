// WAVE LR.1 — Document Explainer: pure normalizer, tier split, deadline math and share text.
// Model output is untrusted: every field is clamped to a known enum, a max length or an ISO date.

export const DOC_TYPES = [
  'LAWSUIT',
  'COURT_SUMMONS',
  'COURT_DECISION',
  'ENFORCEMENT_ORDER',
  'PAYMENT_ORDER',
  'FORMAL_NOTICE',
  'TAX_NOTICE',
  'FINE',
  'ADMIN_DECISION',
  'PROSECUTOR_POLICE',
  'EMPLOYMENT_NOTICE',
  'EVICTION_NOTICE',
  'DEBT_COLLECTION',
  'CONTRACT',
  'OTHER',
];

export const DOC_TYPE_ICONS = {
  LAWSUIT: 'hammer-outline',
  COURT_SUMMONS: 'people-outline',
  COURT_DECISION: 'ribbon-outline',
  ENFORCEMENT_ORDER: 'alert-circle-outline',
  PAYMENT_ORDER: 'cash-outline',
  FORMAL_NOTICE: 'mail-unread-outline',
  TAX_NOTICE: 'calculator-outline',
  FINE: 'receipt-outline',
  ADMIN_DECISION: 'business-outline',
  PROSECUTOR_POLICE: 'shield-outline',
  EMPLOYMENT_NOTICE: 'briefcase-outline',
  EVICTION_NOTICE: 'home-outline',
  DEBT_COLLECTION: 'wallet-outline',
  CONTRACT: 'document-text-outline',
  OTHER: 'document-outline',
};

export const URGENCY_LEVELS = ['HIGH', 'MEDIUM', 'LOW'];
export const CONFIDENCE_LEVELS = ['HIGH', 'MEDIUM', 'LOW'];

export const EXPLAIN_LIMITS = {
  deadlines: 4,
  amounts: 4,
  options: 4,
  steps: 5,
  documents: 6,
  unclear: 3,
};

export const FREE_EXPLAINS_PER_MONTH = 3;
export const MAX_EXPLAIN_PAGES = 4;
export const MAX_SAVED_EXPLAINS = 10;
export const REMINDER_OFFSETS_DAYS = [3, 1, 0];

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const clean = (value, max = 400) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const pickEnum = (value, allowed, fallback) => {
  const token = String(value || '').trim().toUpperCase();
  return allowed.includes(token) ? token : fallback;
};

const list = (value) => (Array.isArray(value) ? value : []);

export function isValidIsoDate(value) {
  const match = ISO_RE.exec(String(value || '').trim());
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    year >= 1990 &&
    year <= 2100 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const cleanList = (value, max, len = 300) =>
  list(value)
    .map((item) => clean(typeof item === 'string' ? item : item?.text || item?.title || '', len))
    .filter(Boolean)
    .slice(0, max);

export function normalizeExplanation(raw) {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const deadlines = list(src.deadlines)
    .map((item) => {
      const date = clean(item?.date, 10);
      return {
        label: clean(item?.label, 160),
        date: isValidIsoDate(date) ? date : '',
        rule: clean(item?.rule, 200),
        fromService: item?.from_service === true || item?.fromService === true,
      };
    })
    .filter((item) => item.label && (item.date || item.rule))
    .slice(0, EXPLAIN_LIMITS.deadlines);
  const amounts = list(src.amounts)
    .map((item) => ({ label: clean(item?.label, 120), value: clean(item?.value ?? item?.amount, 60) }))
    .filter((item) => item.label && item.value)
    .slice(0, EXPLAIN_LIMITS.amounts);
  const options = list(src.options)
    .map((item) => ({ title: clean(item?.title, 120), detail: clean(item?.detail, 320) }))
    .filter((item) => item.title)
    .slice(0, EXPLAIN_LIMITS.options);

  return {
    docType: pickEnum(src.document_type ?? src.docType, DOC_TYPES, 'OTHER'),
    title: clean(src.title, 120),
    issuer: clean(src.issuer, 160),
    summary: clean(src.plain_summary ?? src.summary, 700),
    urgency: pickEnum(src.urgency, URGENCY_LEVELS, 'MEDIUM'),
    deadlines,
    amounts,
    respondTo: clean(src.respond_to ?? src.respondTo, 200),
    steps: cleanList(src.next_steps ?? src.steps, EXPLAIN_LIMITS.steps),
    options,
    documents: cleanList(src.documents_needed ?? src.documents, EXPLAIN_LIMITS.documents, 160),
    legalBasis: clean(src.legal_basis ?? src.legalBasis, 240),
    lawyerWhen: clean(src.lawyer_threshold ?? src.lawyerWhen, 320),
    unclear: cleanList(src.unclear, EXPLAIN_LIMITS.unclear, 200),
    confidence: pickEnum(src.confidence, CONFIDENCE_LEVELS, 'LOW'),
  };
}

export function isUsableExplanation(exp) {
  return !!(exp && exp.title && exp.summary && exp.steps.length > 0);
}

// Safety-critical facts (what it is, who sent it, deadlines, amounts, where to respond, the first step)
// are always free; the full plan is Pro.
export function splitForTier(exp, isPro) {
  if (!exp) return { visible: null, lockedCount: 0 };
  if (isPro) return { visible: exp, lockedCount: 0 };
  const lockedCount =
    Math.max(0, exp.steps.length - 1) +
    exp.options.length +
    exp.documents.length +
    (exp.legalBasis ? 1 : 0) +
    (exp.lawyerWhen ? 1 : 0);
  return {
    visible: {
      ...exp,
      steps: exp.steps.slice(0, 1),
      options: [],
      documents: [],
      legalBasis: '',
      lawyerWhen: '',
    },
    lockedCount,
  };
}

const utcDay = (iso) => {
  const match = ISO_RE.exec(String(iso || ''));
  return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : NaN;
};

export function localIsoDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function daysUntil(iso, todayIso = localIsoDate()) {
  const target = utcDay(iso);
  const today = utcDay(todayIso);
  if (Number.isNaN(target) || Number.isNaN(today)) return null;
  return Math.round((target - today) / 86400000);
}

export function reminderDates(iso, todayIso = localIsoDate()) {
  const left = daysUntil(iso, todayIso);
  if (left === null || left < 0) return [];
  const target = utcDay(iso);
  return REMINDER_OFFSETS_DAYS.filter((offset) => offset <= left).map((offset) => {
    const d = new Date(target - offset * 86400000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  });
}

export function monthKey(date = new Date()) {
  return localIsoDate(date).slice(0, 7);
}

export function freeExplainsLeft(usage, date = new Date()) {
  const used = usage && usage.month === monthKey(date) ? Number(usage.count) || 0 : 0;
  return Math.max(0, FREE_EXPLAINS_PER_MONTH - used);
}

export function nextUsage(usage, date = new Date()) {
  const month = monthKey(date);
  const count = usage && usage.month === month ? Number(usage.count) || 0 : 0;
  return { month, count: count + 1 };
}

// Plain-text brief for sharing or pasting into the advisor chat; the disclaimer is always the last line.
export function formatExplanationText(exp, t, { includeLocked = true, disclaimer = '' } = {}) {
  if (!exp) return '';
  const lines = [exp.title, exp.issuer ? `${t('docExplainIssuer')}: ${exp.issuer}` : '', '', exp.summary];
  if (exp.deadlines.length) {
    lines.push('', `${t('docExplainDeadlines')}:`);
    exp.deadlines.forEach((item) => {
      lines.push(`- ${item.label}: ${[item.date, item.rule].filter(Boolean).join(' · ')}`);
    });
  }
  if (exp.amounts.length) {
    lines.push('', `${t('docExplainAmounts')}:`);
    exp.amounts.forEach((item) => lines.push(`- ${item.label}: ${item.value}`));
  }
  if (exp.respondTo) lines.push('', `${t('docExplainRespondTo')}: ${exp.respondTo}`);
  const steps = includeLocked ? exp.steps : exp.steps.slice(0, 1);
  if (steps.length) {
    lines.push('', `${t('docExplainSteps')}:`);
    steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
  }
  if (includeLocked && exp.options.length) {
    lines.push('', `${t('docExplainOptions')}:`);
    exp.options.forEach((item) => lines.push(`- ${item.title}${item.detail ? `: ${item.detail}` : ''}`));
  }
  if (includeLocked && exp.documents.length) {
    lines.push('', `${t('docExplainDocuments')}:`);
    exp.documents.forEach((item) => lines.push(`- ${item}`));
  }
  if (includeLocked && exp.lawyerWhen) lines.push('', `${t('docExplainLawyerWhen')}: ${exp.lawyerWhen}`);
  if (disclaimer) lines.push('', disclaimer);
  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function assertExplainFixtures() {
  const fail = [];
  const garbage = normalizeExplanation({
    document_type: 'alien',
    title: '  Payment order ',
    plain_summary: 'You received a payment order.',
    urgency: 'extreme',
    deadlines: [
      { label: 'Objection', date: '2026-02-30', rule: '7 days from service', from_service: true },
      { label: 'Hearing', date: '2026-10-12' },
      { label: '', date: '2026-10-12' },
      { label: 'Empty' },
    ],
    next_steps: ['Write down the service date', '', { text: 'File an objection' }],
    options: [{ title: 'Object' }, { detail: 'no title' }],
    confidence: 'sure',
  });
  if (garbage.docType !== 'OTHER') fail.push('docType enum');
  if (garbage.urgency !== 'MEDIUM' || garbage.confidence !== 'LOW') fail.push('urgency/confidence enum');
  if (garbage.deadlines.length !== 2) fail.push(`deadlines ${garbage.deadlines.length}`);
  if (garbage.deadlines[0].date !== '' || !garbage.deadlines[0].fromService) fail.push('invalid date kept');
  if (garbage.steps.length !== 2 || garbage.options.length !== 1) fail.push('lists');
  if (!isUsableExplanation(garbage)) fail.push('usable');
  if (isUsableExplanation(normalizeExplanation({ title: 'x' }))) fail.push('empty usable');
  if (isUsableExplanation(normalizeExplanation(null))) fail.push('null usable');

  const full = normalizeExplanation({
    document_type: 'payment_order',
    title: 'T',
    plain_summary: 'S',
    next_steps: ['a', 'b', 'c'],
    options: [{ title: 'o' }],
    documents_needed: ['d'],
    legal_basis: 'Act',
    lawyer_threshold: 'Now',
    deadlines: [{ label: 'L', rule: '7 days' }],
    amounts: [{ label: 'Total', value: '1.000' }],
    respond_to: 'Office',
  });
  const free = splitForTier(full, false);
  if (free.visible.steps.length !== 1 || free.visible.options.length || free.visible.legalBasis) fail.push('free hides plan');
  if (!free.visible.deadlines.length || !free.visible.amounts.length || !free.visible.respondTo) fail.push('free keeps safety facts');
  if (free.lockedCount !== 6) fail.push(`lockedCount ${free.lockedCount}`);
  if (splitForTier(full, true).lockedCount !== 0) fail.push('pro locked');

  if (daysUntil('2026-10-05', '2026-09-25') !== 10) fail.push('daysUntil');
  if (daysUntil('2026-09-20', '2026-09-25') !== -5) fail.push('daysUntil past');
  if (reminderDates('2026-10-05', '2026-09-25').join() !== '2026-10-02,2026-10-04,2026-10-05') fail.push('reminders');
  if (reminderDates('2026-09-26', '2026-09-25').join() !== '2026-09-25,2026-09-26') fail.push('reminders near');
  if (reminderDates('2026-09-20', '2026-09-25').length) fail.push('reminders past');
  if (reminderDates('2026-03-01', '2026-02-26').join() !== '2026-02-26,2026-02-28,2026-03-01') fail.push('reminders month edge');

  const sept = new Date(2026, 8, 25);
  if (freeExplainsLeft(null, sept) !== FREE_EXPLAINS_PER_MONTH) fail.push('usage fresh');
  if (freeExplainsLeft({ month: '2026-09', count: 3 }, sept) !== 0) fail.push('usage spent');
  if (freeExplainsLeft({ month: '2026-08', count: 3 }, sept) !== FREE_EXPLAINS_PER_MONTH) fail.push('usage resets monthly');
  if (nextUsage({ month: '2026-08', count: 3 }, sept).count !== 1) fail.push('nextUsage reset');

  const text = formatExplanationText(full, (k) => k, { includeLocked: false, disclaimer: 'DISCLAIMER' });
  if (!text.endsWith('DISCLAIMER')) fail.push('disclaimer last');
  if (text.includes('docExplainOptions') || text.includes('\n2. ')) fail.push('free share leaks plan');
  if (fail.length) throw new Error(`explain fixtures: ${fail.join('; ')}`);
  return { cases: 24 };
}
