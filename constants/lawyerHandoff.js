/**
 * WAVE LR.6 — Lawyer hand-off: official bar / law-society directories, legal aid, and the packet a
 * user takes to a first meeting. NexuLex never recommends, ranks or refers individual lawyers.
 * Pure: no React, no i18n instance (t is passed in).
 */
import { OFFICIAL_BODIES, PG_EU_MEMBERS } from './processGuides';
import { daysBetween, formatCaseBrief, todayIso, upcomingAlerts } from '../utils/caseFiles';

const b = (name, url) => ({ name, url });

/** Root pages of the statutory bar / law-society bodies that keep the public register of lawyers. */
export const BAR_BODIES = {
  TR: [b('Türkiye Barolar Birliği', 'https://www.barobirlik.org.tr')],
  US: [b('American Bar Association', 'https://www.americanbar.org')],
  GB: [b('The Law Society – Find a Solicitor', 'https://solicitors.lawsociety.org.uk'), b('Bar Standards Board', 'https://www.barstandardsboard.org.uk')],
  DE: [b('Bundesrechtsanwaltskammer', 'https://www.brak.de')],
  FR: [b('Conseil national des barreaux', 'https://www.cnb.avocat.fr')],
  ES: [b('Consejo General de la Abogacía Española', 'https://www.abogacia.es')],
  IT: [b('Consiglio Nazionale Forense', 'https://www.consiglionazionaleforense.it')],
  NL: [b('Nederlandse orde van advocaten', 'https://www.advocatenorde.nl')],
  PT: [b('Ordem dos Advogados', 'https://portal.oa.pt')],
  BR: [b('Ordem dos Advogados do Brasil', 'https://www.oab.org.br')],
  AE: [b('Ministry of Justice', 'https://www.moj.gov.ae')],
  SA: [b('هيئة المحامين السعوديين', 'https://sba.gov.sa')],
  CN: [b('中华全国律师协会', 'https://www.acla.org.cn')],
  RU: [b('Федеральная палата адвокатов РФ', 'https://fparf.ru')],
  IR: [b('کانون وکلای دادگستری مرکز', 'https://icbar.ir')],
  JP: [b('日本弁護士連合会', 'https://www.nichibenren.or.jp')],
  EU: [b('European e-Justice Portal', 'https://e-justice.europa.eu'), b('CCBE – Council of Bars and Law Societies of Europe', 'https://www.ccbe.eu')],
};

/** Legal-aid bodies in addition to OFFICIAL_BODIES[code].legalAid (shared with the process guides). */
export const EXTRA_LEGAL_AID = {
  GB: [b('GOV.UK – Civil Legal Advice', 'https://www.gov.uk/civil-legal-advice')],
  IT: [b('Ministero della Giustizia', 'https://www.giustizia.it')],
  NL: [b('Raad voor Rechtsbijstand', 'https://www.rvr.org')],
  CN: [b('中国法律服务网 12348', 'https://www.12348.gov.cn')],
};

export const HANDOFF_QUESTIONS = ['experience', 'options', 'costs', 'timeline', 'deadlines', 'documents', 'risks', 'communication'];
export const DEFAULT_QUESTIONS = ['experience', 'options', 'costs', 'deadlines', 'documents'];
export const HANDOFF_PREP = ['fees_written', 'conflict', 'engagement', 'originals', 'deadline_first', 'honest'];
export const SUMMARY_MIN = 20;
export const SUMMARY_MAX = 1200;
export const GOAL_MAX = 300;

const clean = (value, max) => String(value || '').replace(/\s+\n/g, '\n').trim().slice(0, max);

/** Case country when set, otherwise the advisor's country, otherwise null (generic guidance). */
export function handoffJurisdiction(caseItem, resolved) {
  const own = String(caseItem?.country || '').toUpperCase();
  if (own && own !== 'AUTO') return own;
  return resolved ? String(resolved).toUpperCase() : null;
}

/** Official directories for a jurisdiction; EU members also get the EU-wide search. */
export function lawyerDirectoriesFor(jurisdiction) {
  const code = String(jurisdiction || '').toUpperCase();
  const eu = code === 'EU' || PG_EU_MEMBERS.includes(code);
  const uniq = (list) => {
    const seen = new Set();
    return list.filter((body) => {
      if (!body?.url || seen.has(body.url)) return false;
      seen.add(body.url);
      return true;
    });
  };
  const bar = uniq([...(code !== 'EU' ? BAR_BODIES[code] || [] : []), ...(eu ? BAR_BODIES.EU : [])]);
  const legalAid = uniq([...(OFFICIAL_BODIES[code]?.legalAid || []), ...(EXTRA_LEGAL_AID[code] || [])]);
  return { code: code || null, bar, legalAid, covered: bar.length > 0 };
}

/** The nearest upcoming deadline or hearing, with the days left (0 = today). */
export function nearestDate(caseItem, today = todayIso()) {
  if (!caseItem) return null;
  const next = upcomingAlerts(caseItem, today)[0];
  if (!next) return null;
  return { date: next.date, title: next.title, days: daysBetween(today, next.date) };
}

const areaLabel = (t, area) => t(`caseArea_${area || 'other'}`);

/**
 * First-contact message a user sends to a lawyer's office. Only what a lawyer needs to answer
 * "do you take this case?": area, a short summary, the other party (conflict check) and the next date.
 */
export function buildIntroMessage({ caseItem = null, summary = '', area = 'other', countryLabel = '' }, t, today = todayIso()) {
  const lines = [t('lhMsgGreeting'), ''];
  lines.push(t('lhMsgArea', { area: areaLabel(t, caseItem?.area || area), country: countryLabel || t('lhMsgCountryUnknown') }));
  const text = clean(summary, SUMMARY_MAX) || (caseItem ? caseItem.title : '');
  if (text) lines.push(t('lhMsgSummary', { summary: text }));
  if (caseItem?.counterparty) lines.push(t('lhMsgParty', { party: caseItem.counterparty }));
  const next = nearestDate(caseItem, today);
  if (next) lines.push(t('lhMsgDeadline', { date: next.date }));
  lines.push('', t('lhMsgAsk'), '', t('lhMsgThanks'));
  return lines.join('\n');
}

/** Plain-text packet for the first meeting. The disclaimer is always the last line. */
export function buildHandoffPacket(
  { caseItem = null, summary = '', area = 'other', goal = '', questions = DEFAULT_QUESTIONS, countryLabel = '' },
  t,
  { today = todayIso(), disclaimer = '' } = {}
) {
  const lines = [t('lhPacketHeader'), t('lhPacketPrepared', { date: today })];
  if (countryLabel) lines.push(t('lhPacketJurisdiction', { country: countryLabel }));
  const next = nearestDate(caseItem, today);
  if (next) {
    lines.push('', next.days === 0 ? t('lhPacketUrgentToday', { date: next.date, title: next.title }) : t('lhPacketUrgent', { date: next.date, title: next.title, count: next.days }));
  }
  lines.push('');
  if (caseItem) {
    lines.push(formatCaseBrief(caseItem, t, { today, includeEvidence: true }));
    if (caseItem.evidence.length) lines.push('', t('lhPacketFingerprintNote'));
  } else {
    lines.push(`${t('caseAreaLabel')}: ${areaLabel(t, area)}`);
  }
  const text = clean(summary, SUMMARY_MAX);
  if (text) lines.push('', `${t('lhPacketSummary')}:`, text);
  const aim = clean(goal, GOAL_MAX);
  if (aim) lines.push('', `${t('lhPacketGoal')}:`, aim);
  const picked = HANDOFF_QUESTIONS.filter((id) => questions.includes(id));
  if (picked.length) {
    lines.push('', `${t('lhPacketQuestions')}:`);
    picked.forEach((id, index) => lines.push(`${index + 1}. ${t(`lhQ_${id}`)}`));
  }
  if (disclaimer) lines.push('', disclaimer);
  return lines.join('\n');
}

/** A packet needs a case file or a short written summary. */
export const canBuildPacket = ({ caseItem, summary }) => !!caseItem || clean(summary, SUMMARY_MAX).length >= SUMMARY_MIN;

export function handoffKeys() {
  return [
    ...HANDOFF_QUESTIONS.map((id) => `lhQ_${id}`),
    ...HANDOFF_PREP.map((id) => `lhPrep_${id}`),
    'lhMsgGreeting', 'lhMsgArea', 'lhMsgCountryUnknown', 'lhMsgSummary', 'lhMsgParty', 'lhMsgDeadline', 'lhMsgAsk', 'lhMsgThanks',
    'lhPacketHeader', 'lhPacketPrepared', 'lhPacketJurisdiction', 'lhPacketUrgent', 'lhPacketUrgentToday',
    'lhPacketFingerprintNote', 'lhPacketSummary', 'lhPacketGoal', 'lhPacketQuestions',
  ];
}

export function assertHandoffFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`lawyerHandoff: ${msg}`);
  };
  const t = (key, opts) => (opts ? `${key}${JSON.stringify(opts)}` : key);
  const all = Object.values(BAR_BODIES).flat().concat(Object.values(EXTRA_LEGAL_AID).flat());
  check(all.every((body) => body.name && /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[\w./-]*)?$/i.test(body.url)), 'every body needs a name and an https url');
  check(Object.keys(OFFICIAL_BODIES).every((code) => (BAR_BODIES[code] || []).length > 0), 'every official-bodies country needs a bar body');

  const tr = lawyerDirectoriesFor('TR');
  check(tr.covered && tr.bar.length === 1 && tr.legalAid.length === 1, 'TR: legal aid runs through the bars, listed in both sections');
  const de = lawyerDirectoriesFor('de');
  check(de.bar[0].url === 'https://www.brak.de' && de.bar.some((x) => x.url === 'https://e-justice.europa.eu'), 'DE: national bar first, then EU search');
  const at = lawyerDirectoriesFor('AT');
  check(at.covered && at.bar.length === 2 && !at.legalAid.length, 'EU member without a national entry gets the EU search');
  const gb = lawyerDirectoriesFor('GB');
  check(gb.legalAid.length === 2 && !gb.bar.some((x) => /europa/.test(x.url)), 'GB: two legal-aid bodies, no EU search');
  check(!lawyerDirectoriesFor(null).covered && !lawyerDirectoriesFor('CA').covered, 'unknown jurisdictions stay uncovered (no invented links)');
  check(lawyerDirectoriesFor('EU').bar.length === 2, 'EU: EU-wide bodies only');

  check(handoffJurisdiction({ country: 'de' }, 'TR') === 'DE' && handoffJurisdiction({ country: 'auto' }, 'TR') === 'TR' && handoffJurisdiction(null, null) === null, 'jurisdiction order');

  const item = {
    id: 'c1', title: 'Deposit', area: 'rent', side: 'claimant', status: 'active', counterparty: 'ACME Ltd', country: 'auto',
    events: [
      { id: 'e1', date: '2026-01-10', title: 'Moved out', note: '', kind: 'event' },
      { id: 'e2', date: '2026-02-20', title: 'Reply deadline', note: '', kind: 'deadline' },
      { id: 'e3', date: '2026-03-01', title: 'Hearing', note: '', kind: 'hearing' },
    ],
    evidence: [{ id: 'v1', label: 'Lease', kind: 'pdf', fingerprint: `sha256:${'b'.repeat(64)}`, addedAt: '2026-01-11T00:00:00Z', note: '' }],
  };
  const next = nearestDate(item, '2026-02-15');
  check(next && next.date === '2026-02-20' && next.days === 5, 'nearest upcoming date');
  check(nearestDate(item, '2026-04-01') === null && nearestDate(null) === null, 'no upcoming date');

  const msg = buildIntroMessage({ caseItem: item, countryLabel: 'Germany' }, t, '2026-02-15');
  check(msg.includes('lhMsgParty{"party":"ACME Ltd"}') && msg.includes('lhMsgDeadline{"date":"2026-02-20"}'), 'intro names the other party and next date');
  check(!msg.includes('sha256') && !msg.includes('Moved out'), 'intro never carries evidence or the timeline');
  check(buildIntroMessage({ summary: '  x  ' }, t).includes('lhMsgCountryUnknown'), 'intro without a country');

  const packet = buildHandoffPacket({ caseItem: item, goal: 'Get the deposit back', questions: ['costs', 'experience', 'bogus'], countryLabel: 'Germany' }, t, { today: '2026-02-15', disclaimer: 'DISCLAIMER' });
  check(packet.endsWith('DISCLAIMER'), 'disclaimer last');
  check(packet.includes(`sha256:${'b'.repeat(64)}`) && packet.includes('lhPacketFingerprintNote'), 'packet keeps evidence fingerprints');
  check(packet.indexOf('lhQ_experience') < packet.indexOf('lhQ_costs') && !packet.includes('bogus'), 'questions in fixed order, unknown ids dropped');
  check(packet.includes('lhPacketUrgent{') && packet.indexOf('lhPacketUrgent') < packet.indexOf('caseBriefHeader'), 'urgent date first');
  check(buildHandoffPacket({ caseItem: item }, t, { today: '2026-02-20' }).includes('lhPacketUrgentToday'), 'today wording');
  const loose = buildHandoffPacket({ summary: 'Landlord keeps my deposit since January.', area: 'rent', questions: [] }, t, { disclaimer: 'D' });
  check(loose.includes('caseArea_rent') && loose.includes('lhPacketSummary') && !loose.includes('lhPacketQuestions') && loose.endsWith('D'), 'packet without a case');
  check(canBuildPacket({ caseItem: item }) && canBuildPacket({ summary: 'x'.repeat(SUMMARY_MIN) }) && !canBuildPacket({ summary: 'short' }), 'packet needs a case or a summary');
  check(DEFAULT_QUESTIONS.every((id) => HANDOFF_QUESTIONS.includes(id)), 'default questions are known');
  return { cases };
}
