// WAVE LR.5 — Plans (free / Pro / Professional) and the Professional workbench: result normalizers,
// case-material builder, timeline import and share text. Pure (harness-tested).

import { formatCaseBrief, isIsoDate, sortedTimeline } from './caseFiles';
import { OFFICIAL_SOURCES, hostOf, isOfficialUrl } from './legalAnswer';

export const PLANS = ['free', 'pro', 'professional'];
// RevenueCat entitlement ids and the offering that sells Professional (Pro stays on the current offering).
export const ENTITLEMENT_IDS = { pro: 'pro', professional: 'professional' };
export const PROFESSIONAL_OFFERING_ID = 'professional';

// Mirrors legal-ask, pro-tools and advisor-seat; the server enforces these, the app only displays them.
// WAVE ECON.1: free = askLifetime questions to start, then askWeekly per rolling 7 days (per device, askDaily at most
// in one day); paid plans also have a monthly cap (askMonthly / toolsMonthly) on top of the daily one.
export const PLAN_LIMITS = {
  free: { askDaily: 3, askLifetime: 3, askWeekly: 1, askMonthly: 0, toolsDaily: 0, toolsMonthly: 0, advisorSeats: 0 },
  pro: { askDaily: 40, askMonthly: 300, toolsDaily: 0, toolsMonthly: 0, advisorSeats: 2 },
  professional: { askDaily: 150, askMonthly: 900, toolsDaily: 30, toolsMonthly: 300, advisorSeats: 10 },
};

export const PRO_TOOLS = ['chronology', 'issues', 'memo'];
export const PRO_TOOL_ICONS = {
  chronology: 'git-commit-outline',
  issues: 'git-compare-outline',
  memo: 'library-outline',
};
export const PRO_MATERIAL_MIN = 40;
export const PRO_MATERIAL_MAX = 12000;
export const PRO_POSITION_MAX = 400;
export const CERTAINTIES = ['EXACT', 'APPROXIMATE', 'UNKNOWN'];

const LIMITS = {
  events: 40,
  gaps: 6,
  conflicts: 6,
  issues: 8,
  issueLists: 4,
  threshold: 5,
  levers: 4,
  analysis: 5,
  authorities: 6,
  openQuestions: 5,
  nextSteps: 5,
};
const NOTE_MAX = 2000;

const clean = (value, max = 600) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const list = (value, max, itemMax = 400) =>
  (Array.isArray(value) ? value : [])
    .map((item) => clean(typeof item === 'string' ? item : item?.text || item?.title, itemMax))
    .filter(Boolean)
    .slice(0, max);

export function planOf(profile) {
  if (!profile) return 'free';
  if (profile.plan === 'professional') return 'professional';
  if (profile.plan === 'pro' || profile.is_pro) return 'pro';
  return 'free';
}

export const isProfessionalPlan = (plan) => plan === 'professional';
export const isPaidPlan = (plan) => plan === 'pro' || plan === 'professional';

export function planFromEntitlementIds(ids) {
  const active = new Set(Array.isArray(ids) ? ids : []);
  if (active.has(ENTITLEMENT_IDS.professional)) return 'professional';
  if (active.has(ENTITLEMENT_IDS.pro)) return 'pro';
  return 'free';
}

const jurisdictionOf = (country) => {
  const code = String(country || '').toUpperCase();
  return OFFICIAL_SOURCES[code] ? code : '';
};

function normalizeChronology(raw) {
  const events = (Array.isArray(raw.events) ? raw.events : [])
    .map((ev) => {
      const date = clean(ev?.date, 40);
      let certainty = CERTAINTIES.includes(String(ev?.certainty).toUpperCase()) ? String(ev.certainty).toUpperCase() : 'UNKNOWN';
      if (!date) certainty = 'UNKNOWN';
      if (certainty === 'EXACT' && !isIsoDate(date)) certainty = 'APPROXIMATE';
      return {
        date,
        certainty,
        event: clean(ev?.event, 300),
        source: clean(ev?.source, 160),
        significance: clean(ev?.significance, 300),
      };
    })
    .filter((ev) => ev.event)
    .slice(0, LIMITS.events);
  return {
    summary: clean(raw.summary, 900),
    events,
    gaps: list(raw.gaps, LIMITS.gaps),
    conflicts: list(raw.conflicts, LIMITS.conflicts),
  };
}

function normalizeIssues(raw) {
  return {
    summary: clean(raw.summary, 900),
    issues: (Array.isArray(raw.issues) ? raw.issues : [])
      .map((item) => ({
        question: clean(item?.question, 300),
        position: clean(item?.position, 600),
        counter: clean(item?.counter, 600),
        factsNeeded: list(item?.facts_needed, LIMITS.issueLists, 240),
        evidence: list(item?.evidence, LIMITS.issueLists, 240),
        burden: clean(item?.burden, 300),
      }))
      .filter((item) => item.question)
      .slice(0, LIMITS.issues),
    threshold: list(raw.threshold, LIMITS.threshold),
    levers: list(raw.levers, LIMITS.levers),
  };
}

function normalizeMemo(raw, jurisdiction) {
  const seen = new Set();
  return {
    question: clean(raw.question, 500),
    shortAnswer: clean(raw.short_answer, 900),
    analysis: (Array.isArray(raw.analysis) ? raw.analysis : [])
      .map((section) => ({ heading: clean(section?.heading, 160), text: clean(section?.text, 1200) }))
      .filter((section) => section.text)
      .slice(0, LIMITS.analysis),
    authorities: (Array.isArray(raw.authorities) ? raw.authorities : [])
      .map((item) => {
        const url = String(item?.url || '').trim().slice(0, 500);
        const official = url && isOfficialUrl(url, jurisdiction) && !seen.has(url);
        if (official) seen.add(url);
        return { title: clean(item?.title, 200), why: clean(item?.why, 300), url: official ? url : '', host: official ? hostOf(url) : '' };
      })
      .filter((item) => item.title)
      .slice(0, LIMITS.authorities),
    openQuestions: list(raw.open_questions, LIMITS.openQuestions),
    nextSteps: list(raw.next_steps, LIMITS.nextSteps),
  };
}

export function normalizeToolResult(tool, raw, { country = 'auto' } = {}) {
  if (!PRO_TOOLS.includes(tool) || !raw || typeof raw !== 'object') return null;
  const jurisdiction = jurisdictionOf(country);
  const body =
    tool === 'chronology' ? normalizeChronology(raw) : tool === 'issues' ? normalizeIssues(raw) : normalizeMemo(raw, jurisdiction);
  return { tool, jurisdictionNote: clean(raw.jurisdiction_note, 300), ...body };
}

export function isUsableToolResult(result) {
  if (!result) return false;
  if (result.tool === 'chronology') return result.events.length > 0;
  if (result.tool === 'issues') return result.issues.length > 0;
  return !!result.shortAnswer;
}

// Case file → plain material for the workbench. Evidence contributes its label and note, never fingerprints.
export function caseMaterial(item, t) {
  if (!item) return '';
  const brief = formatCaseBrief(item, t, { includeEvidence: false });
  const notes = (item.evidence || [])
    .filter((ev) => ev.note)
    .map((ev) => `- ${ev.label || t('caseEvidenceNote')}: ${ev.note}`);
  const text = notes.length ? `${brief}\n\n${t('caseEvidence')}:\n${notes.join('\n')}` : brief;
  return text.slice(0, PRO_MATERIAL_MAX);
}

// Only events with an exact, valid date that the case does not already hold (same date + title).
export function chronologyToCaseEvents(result, caseItem) {
  if (result?.tool !== 'chronology') return [];
  const existing = new Set(sortedTimeline(caseItem || { events: [] }).map((ev) => `${ev.date}|${ev.title.toLowerCase()}`));
  const out = [];
  for (const ev of result.events) {
    if (ev.certainty !== 'EXACT' || !isIsoDate(ev.date)) continue;
    const title = clean(ev.event, 160);
    const key = `${ev.date}|${title.toLowerCase()}`;
    if (existing.has(key)) continue;
    existing.add(key);
    out.push({ date: ev.date, title, note: clean([ev.source, ev.significance].filter(Boolean).join(' · '), 600), kind: 'event' });
  }
  return out;
}

// Plain text for sharing, copying or a case-file note. The disclaimer is always last.
export function formatToolText(result, t, { title = '', disclaimer = '' } = {}) {
  const lines = [`${t(`ptTool_${result.tool}`)}${title ? ` · ${title}` : ''}`];
  if (result.jurisdictionNote) lines.push(result.jurisdictionNote);
  const section = (key, items, render = (item) => `- ${item}`) => {
    if (!items.length) return;
    lines.push('', `${t(key)}:`);
    items.forEach((item, index) => lines.push(render(item, index)));
  };
  if (result.tool === 'chronology') {
    if (result.summary) lines.push('', result.summary);
    section('ptEvents', result.events, (ev) =>
      `- ${ev.date || t('ptCertainty_UNKNOWN')} [${t(`ptCertainty_${ev.certainty}`)}] ${ev.event}${ev.source ? ` (${t('ptSource')}: ${ev.source})` : ''}${ev.significance ? ` — ${ev.significance}` : ''}`
    );
    section('ptGaps', result.gaps);
    section('ptConflicts', result.conflicts);
  } else if (result.tool === 'issues') {
    if (result.summary) lines.push('', result.summary);
    section('ptThreshold', result.threshold);
    result.issues.forEach((issue, index) => {
      lines.push('', `${index + 1}. ${issue.question}`);
      if (issue.position) lines.push(`   ${t('ptPosition')}: ${issue.position}`);
      if (issue.counter) lines.push(`   ${t('ptCounter')}: ${issue.counter}`);
      if (issue.factsNeeded.length) lines.push(`   ${t('ptFactsNeeded')}: ${issue.factsNeeded.join('; ')}`);
      if (issue.evidence.length) lines.push(`   ${t('ptEvidence')}: ${issue.evidence.join('; ')}`);
      if (issue.burden) lines.push(`   ${t('ptBurden')}: ${issue.burden}`);
    });
    section('ptLevers', result.levers);
  } else {
    if (result.question) lines.push('', `${t('ptQuestion')}: ${result.question}`);
    lines.push('', `${t('ptShortAnswer')}: ${result.shortAnswer}`);
    result.analysis.forEach((part) => lines.push('', part.heading ? `${part.heading}:` : `${t('ptAnalysis')}:`, part.text));
    section('ptAuthorities', result.authorities, (item) =>
      `- [${t('ptVerifyBadge')}] ${item.title}${item.why ? `: ${item.why}` : ''}${item.url ? ` ${item.url}` : ''}`
    );
    section('ptOpenQuestions', result.openQuestions);
    section('ptNextSteps', result.nextSteps, (item, index) => `${index + 1}. ${item}`);
  }
  if (disclaimer) lines.push('', disclaimer);
  return lines.join('\n');
}

// A case-file note keeps at most NOTE_MAX characters; the disclaimer survives the cut.
export function toolNoteText(result, t, { title = '', disclaimer = '' } = {}) {
  const full = formatToolText(result, t, { title, disclaimer });
  if (full.length <= NOTE_MAX) return full;
  const tail = disclaimer ? `\n\n${disclaimer}` : '';
  const body = formatToolText(result, t, { title }).slice(0, Math.max(0, NOTE_MAX - tail.length - 1));
  return `${body}…${tail}`;
}

export function assertPlanFixtures() {
  const fail = [];
  if (planOf(null) !== 'free' || planOf({ is_pro: true }) !== 'pro' || planOf({ is_pro: true, plan: 'professional' }) !== 'professional') fail.push('planOf');
  if (planOf({ plan: 'free', is_pro: false }) !== 'free' || planOf({ plan: 'pro', is_pro: false }) !== 'pro') fail.push('planOf plan column');
  if (planFromEntitlementIds(['pro', 'professional']) !== 'professional' || planFromEntitlementIds(['pro']) !== 'pro' || planFromEntitlementIds([]) !== 'free') fail.push('entitlements');
  if (!isProfessionalPlan('professional') || isProfessionalPlan('pro') || !isPaidPlan('pro') || isPaidPlan('free')) fail.push('plan predicates');
  if (PLAN_LIMITS.professional.askDaily <= PLAN_LIMITS.pro.askDaily || PLAN_LIMITS.pro.toolsDaily !== 0) fail.push('limits');
  if (PLAN_LIMITS.professional.askMonthly <= PLAN_LIMITS.pro.askMonthly || PLAN_LIMITS.pro.askMonthly < PLAN_LIMITS.pro.askDaily || PLAN_LIMITS.professional.toolsMonthly < PLAN_LIMITS.professional.toolsDaily) fail.push('monthly limits');
  if (PLAN_LIMITS.free.askLifetime < 1 || PLAN_LIMITS.free.askWeekly < 1 || PLAN_LIMITS.free.askDaily < PLAN_LIMITS.free.askLifetime) fail.push('free limits');

  const chrono = normalizeToolResult('chronology', {
    jurisdiction_note: 'TR law',
    events: [
      { date: '2026-02-30', certainty: 'EXACT', event: 'Bad date' },
      { date: '2026-03-01', certainty: 'EXACT', event: 'Notice received', source: 'note' },
      { date: '', certainty: 'EXACT', event: 'Undated' },
      { date: 'March 2026', certainty: 'weird', event: 'Talks' },
      { event: '' },
    ],
    gaps: ['g1', '', 'g2'],
  });
  if (chrono.events.length !== 4 || chrono.events[0].certainty !== 'APPROXIMATE' || chrono.events[2].certainty !== 'UNKNOWN' || chrono.events[3].certainty !== 'UNKNOWN') fail.push('chronology certainty');
  if (chrono.gaps.length !== 2 || !isUsableToolResult(chrono)) fail.push('chronology lists');
  const caseItem = { events: [{ id: 'e1', date: '2026-03-01', title: 'Notice received', note: '', kind: 'event', createdAt: '' }], evidence: [] };
  const withNew = { ...chrono, events: [...chrono.events, { date: '2026-04-02', certainty: 'EXACT', event: 'Hearing set', source: '', significance: 'x' }] };
  const imported = chronologyToCaseEvents(withNew, caseItem);
  if (imported.length !== 1 || imported[0].date !== '2026-04-02' || imported[0].kind !== 'event') fail.push('timeline import: exact, new only');

  const issues = normalizeToolResult('issues', { issues: [{ question: 'Was notice valid?', facts_needed: ['a', 'b', 'c', 'd', 'e'] }, { position: 'no question' }] });
  if (issues.issues.length !== 1 || issues.issues[0].factsNeeded.length !== 4 || !isUsableToolResult(issues)) fail.push('issues');

  const memo = normalizeToolResult(
    'memo',
    {
      short_answer: 'Likely a notice issue.',
      authorities: [
        { title: 'Labour Act', url: 'https://www.mevzuat.gov.tr/x' },
        { title: 'Blog', url: 'https://lawfirm.example.com/x' },
        { title: 'Dup', url: 'https://www.mevzuat.gov.tr/x' },
        { url: 'https://www.mevzuat.gov.tr/y' },
      ],
    },
    { country: 'TR' }
  );
  if (memo.authorities.length !== 3 || memo.authorities[0].host !== 'www.mevzuat.gov.tr' || memo.authorities[1].url || memo.authorities[2].url) fail.push('memo authorities: official + de-duplicated');
  const deMemo = normalizeToolResult('memo', { short_answer: 'x', authorities: [{ title: 'TR act', url: 'https://www.mevzuat.gov.tr/x' }] }, { country: 'DE' });
  if (deMemo.authorities[0].url) fail.push('foreign official host dropped under another jurisdiction');
  if (normalizeToolResult('other', { short_answer: 'x' }) || normalizeToolResult('memo', null) || isUsableToolResult(normalizeToolResult('memo', { short_answer: ' ' }))) fail.push('invalid inputs');

  const t = (k) => k;
  const text = formatToolText(memo, t, { title: 'Case', disclaimer: 'DISCLAIMER' });
  if (!text.startsWith('ptTool_memo · Case') || !text.endsWith('DISCLAIMER') || !text.includes('[ptVerifyBadge] Labour Act')) fail.push('memo text');
  if (!formatToolText(chrono, t, { disclaimer: 'D' }).endsWith('D') || !formatToolText(issues, t, { disclaimer: 'D' }).endsWith('D')) fail.push('disclaimer last');
  const long = normalizeToolResult('chronology', { events: Array.from({ length: 40 }, (_, i) => ({ date: '2026-01-01', certainty: 'EXACT', event: `Event ${i} ${'x'.repeat(200)}` })) });
  const note = toolNoteText(long, t, { disclaimer: 'DISCLAIMER' });
  if (note.length > NOTE_MAX || !note.endsWith('DISCLAIMER')) fail.push('note clipped with disclaimer kept');

  const material = caseMaterial(
    {
      title: 'Deposit',
      area: 'rent',
      side: 'claimant',
      status: 'active',
      counterparty: '',
      events: [],
      evidence: [{ id: 'v1', label: 'Letter', kind: 'note', note: 'Landlord refused', fingerprint: `sha256:${'a'.repeat(64)}`, addedAt: '2026-01-01T00:00:00Z' }],
    },
    t
  );
  if (!material.includes('Landlord refused') || material.includes('sha256:')) fail.push('case material: notes without fingerprints');
  if (fail.length) throw new Error(`plan fixtures: ${fail.join('; ')}`);
  return { cases: 16 };
}
