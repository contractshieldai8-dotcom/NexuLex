// WAVE LR.3 — Legal Q&A: answer normalizer, official-source allowlist, share text. Pure (harness-tested).

export const ASK_AUDIENCES = ['person', 'business', 'professional'];
export const ASK_CONFIDENCE = ['HIGH', 'MEDIUM', 'LOW'];
export const ASK_LIMITS = { rules: 5, steps: 6, deadlines: 4, documents: 6, risks: 4, sources: 4, missing: 4, followUps: 3 };
export const ASK_QUESTION_MIN = 8;
export const ASK_QUESTION_MAX = 2000;
export const ASK_FACTS_MAX = 4000;
export const MAX_SAVED_ANSWERS = 20;

// Mirrors supabase/functions/legal-ask OFFICIAL_DOMAINS; "*." allows any subdomain of the suffix.
export const OFFICIAL_SOURCES = {
  TR: { portal: 'https://www.mevzuat.gov.tr', domains: ['mevzuat.gov.tr', 'resmigazete.gov.tr', 'yargitay.gov.tr', 'anayasa.gov.tr', 'danistay.gov.tr', 'adalet.gov.tr', 'turkiye.gov.tr'] },
  US: { portal: 'https://uscode.house.gov', domains: ['uscode.house.gov', 'congress.gov', 'ecfr.gov', 'federalregister.gov', 'uscourts.gov', 'usa.gov', '*.gov'] },
  DE: { portal: 'https://www.gesetze-im-internet.de', domains: ['gesetze-im-internet.de', 'bundesgerichtshof.de', 'bundesverfassungsgericht.de', 'bmj.de', 'justiz.de', 'bund.de'] },
  GB: { portal: 'https://www.legislation.gov.uk', domains: ['legislation.gov.uk', 'gov.uk', 'judiciary.uk'] },
  FR: { portal: 'https://www.legifrance.gouv.fr', domains: ['legifrance.gouv.fr', 'service-public.fr', 'justice.fr', 'courdecassation.fr', '*.gouv.fr'] },
  ES: { portal: 'https://www.boe.es', domains: ['boe.es', 'poderjudicial.es', '*.gob.es'] },
  IT: { portal: 'https://www.normattiva.it', domains: ['normattiva.it', 'gazzettaufficiale.it', 'giustizia.it', 'cortedicassazione.it', '*.gov.it'] },
  NL: { portal: 'https://wetten.overheid.nl', domains: ['wetten.overheid.nl', 'rechtspraak.nl', 'rijksoverheid.nl', 'juridischloket.nl', '*.overheid.nl'] },
  EU: { portal: 'https://eur-lex.europa.eu', domains: ['eur-lex.europa.eu', 'curia.europa.eu', '*.europa.eu'] },
  AE: { portal: 'https://uaelegislation.gov.ae', domains: ['uaelegislation.gov.ae', 'moj.gov.ae', 'u.ae', '*.gov.ae'] },
  SA: { portal: 'https://laws.boe.gov.sa', domains: ['laws.boe.gov.sa', 'moj.gov.sa', '*.gov.sa'] },
  CN: { portal: 'https://flk.npc.gov.cn', domains: ['flk.npc.gov.cn', 'npc.gov.cn', 'court.gov.cn', '*.gov.cn'] },
  RU: { portal: 'http://pravo.gov.ru', domains: ['pravo.gov.ru', 'publication.pravo.gov.ru', 'supcourt.ru', '*.gov.ru'] },
  IR: { portal: 'https://qavanin.ir', domains: ['qavanin.ir', 'rc.majlis.ir', 'eadl.ir'] },
  JP: { portal: 'https://elaws.e-gov.go.jp', domains: ['elaws.e-gov.go.jp', 'e-gov.go.jp', 'courts.go.jp', 'moj.go.jp', '*.go.jp'] },
  PT: { portal: 'https://diariodarepublica.pt', domains: ['diariodarepublica.pt', 'dre.pt', '*.gov.pt'] },
  BR: { portal: 'https://www.planalto.gov.br', domains: ['planalto.gov.br', '*.gov.br', '*.jus.br'] },
  IN: { portal: 'https://indiacode.nic.in', domains: ['indiacode.nic.in', 'legislative.gov.in', 'egazette.gov.in', 'sci.gov.in', '*.gov.in'] },
  CA: { portal: 'https://laws-lois.justice.gc.ca', domains: ['laws-lois.justice.gc.ca', 'justice.gc.ca', 'canada.ca', 'scc-csc.ca', 'legisquebec.gouv.qc.ca', 'ontario.ca', 'gov.bc.ca', '*.gc.ca'] },
  AU: { portal: 'https://www.legislation.gov.au', domains: ['legislation.gov.au', 'hcourt.gov.au', 'ag.gov.au', 'accc.gov.au', 'fairwork.gov.au', '*.gov.au'] },
  AT: { portal: 'https://www.ris.bka.gv.at', domains: ['ris.bka.gv.at', 'justiz.gv.at', 'oesterreich.gv.at', '*.gv.at'] },
  CH: { portal: 'https://www.fedlex.admin.ch', domains: ['fedlex.admin.ch', 'bger.ch', 'admin.ch', 'ch.ch'] },
};
const EU_MEMBERS = ['DE', 'FR', 'ES', 'IT', 'NL', 'PT', 'AT'];

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

export function hostOf(url) {
  const match = /^https?:\/\/([^/?#:]+)(?::\d+)?(?:[/?#]|$)/i.exec(String(url || '').trim());
  return match ? match[1].toLowerCase().replace(/\.$/, '') : '';
}

const hostMatches = (host, rule) => {
  if (rule.startsWith('*.')) return host.endsWith(rule.slice(1));
  return host === rule || host.endsWith(`.${rule}`);
};

export function isOfficialUrl(url, jurisdiction) {
  const raw = String(url || '').trim();
  if (!/^https:\/\//i.test(raw) && !/^http:\/\/pravo\.gov\.ru(\/|$)/i.test(raw)) return false;
  if (/[\s"'<>]/.test(raw) || /@/.test(raw.split('/')[2] || '')) return false;
  const host = hostOf(raw);
  if (!host) return false;
  const codes = [jurisdiction, ...(EU_MEMBERS.includes(jurisdiction) ? ['EU'] : [])].filter((code) => OFFICIAL_SOURCES[code]);
  const pool = codes.length ? codes : Object.keys(OFFICIAL_SOURCES);
  return pool.some((code) => OFFICIAL_SOURCES[code].domains.some((rule) => hostMatches(host, rule)));
}

export function officialPortal(jurisdiction) {
  return OFFICIAL_SOURCES[jurisdiction]?.portal || '';
}

export function normalizeLegalAnswer(raw, { country = 'auto' } = {}) {
  if (!raw || typeof raw !== 'object') return null;
  const selected = OFFICIAL_SOURCES[String(country).toUpperCase()] ? String(country).toUpperCase() : '';
  const claimed = String(raw.jurisdiction || '').toUpperCase();
  const jurisdiction = selected || (OFFICIAL_SOURCES[claimed] ? claimed : 'OTHER');
  const seen = new Set();
  const sources = (Array.isArray(raw.sources) ? raw.sources : [])
    .map((item) => ({ title: clean(item?.title, 160), url: String(item?.url || '').trim().slice(0, 500) }))
    .filter((item) => {
      if (!isOfficialUrl(item.url, jurisdiction === 'OTHER' ? '' : jurisdiction) || seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    })
    .map((item) => ({ ...item, title: item.title || hostOf(item.url), host: hostOf(item.url) }))
    .slice(0, ASK_LIMITS.sources);
  return {
    jurisdiction,
    jurisdictionNote: clean(raw.jurisdiction_note, 300),
    shortAnswer: clean(raw.short_answer, 900),
    explanation: clean(raw.explanation, 1800),
    rules: (Array.isArray(raw.rules) ? raw.rules : [])
      .map((rule) => ({ title: clean(rule?.title, 200), detail: clean(rule?.detail, 600), citation: clean(rule?.citation, 160) }))
      .filter((rule) => rule.title)
      .slice(0, ASK_LIMITS.rules),
    steps: list(raw.steps, ASK_LIMITS.steps),
    deadlines: (Array.isArray(raw.deadlines) ? raw.deadlines : [])
      .map((d) => ({ label: clean(d?.label, 200), rule: clean(d?.rule, 300) }))
      .filter((d) => d.label && d.rule)
      .slice(0, ASK_LIMITS.deadlines),
    documents: list(raw.documents, ASK_LIMITS.documents, 200),
    risks: list(raw.risks, ASK_LIMITS.risks),
    sources,
    lawyerWhen: clean(raw.lawyer_when, 400),
    missingFacts: list(raw.missing_facts, ASK_LIMITS.missing, 200),
    followUps: list(raw.follow_ups, ASK_LIMITS.followUps, 200),
    confidence: ASK_CONFIDENCE.includes(String(raw.confidence).toUpperCase()) ? String(raw.confidence).toUpperCase() : 'MEDIUM',
  };
}

export const isUsableAnswer = (answer) => !!answer?.shortAnswer;

// Plain text for sharing, the advisor chat or a case-file note. The disclaimer is always last.
export function formatAnswerText(answer, t, { question = '', disclaimer = '' } = {}) {
  const lines = [];
  if (question) lines.push(`${t('askQuestionLabel')}: ${question}`, '');
  lines.push(answer.shortAnswer);
  if (answer.jurisdictionNote) lines.push(answer.jurisdictionNote);
  if (answer.explanation) lines.push('', answer.explanation);
  if (answer.rules.length) {
    lines.push('', `${t('askRules')}:`);
    answer.rules.forEach((rule) => lines.push(`- ${rule.title}${rule.citation ? ` (${rule.citation})` : ''}${rule.detail ? `: ${rule.detail}` : ''}`));
  }
  if (answer.steps.length) {
    lines.push('', `${t('askSteps')}:`);
    answer.steps.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
  }
  if (answer.deadlines.length) {
    lines.push('', `${t('askDeadlines')}:`);
    answer.deadlines.forEach((d) => lines.push(`- ${d.label}: ${d.rule}`));
  }
  if (answer.documents.length) {
    lines.push('', `${t('askDocuments')}:`);
    answer.documents.forEach((d) => lines.push(`- ${d}`));
  }
  if (answer.risks.length) {
    lines.push('', `${t('askRisks')}:`);
    answer.risks.forEach((r) => lines.push(`- ${r}`));
  }
  if (answer.sources.length) {
    lines.push('', `${t('askSources')}:`);
    answer.sources.forEach((s) => lines.push(`- ${s.title}: ${s.url}`));
  }
  if (answer.lawyerWhen) lines.push('', `${t('askLawyerWhen')}: ${answer.lawyerWhen}`);
  if (disclaimer) lines.push('', disclaimer);
  return lines.join('\n');
}

export function assertLegalAnswerFixtures() {
  const fail = [];
  if (!isOfficialUrl('https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4857', 'TR')) fail.push('TR official');
  if (isOfficialUrl('https://mevzuat.gov.tr.evil.com/x', 'TR')) fail.push('suffix spoof accepted');
  if (isOfficialUrl('https://evilmevzuat.gov.tr/x', 'TR')) fail.push('prefix spoof accepted');
  if (isOfficialUrl('https://www.some-lawfirm.com/blog', 'TR')) fail.push('law firm accepted');
  if (isOfficialUrl('http://www.mevzuat.gov.tr', 'TR')) fail.push('plain http accepted');
  if (isOfficialUrl('https://user@mevzuat.gov.tr/', 'TR')) fail.push('userinfo accepted');
  if (!isOfficialUrl('https://eur-lex.europa.eu/eli/reg/2016/679/oj', 'DE')) fail.push('EU source for member state');
  if (isOfficialUrl('https://eur-lex.europa.eu/x', 'TR')) fail.push('EU source for non-member');
  if (!isOfficialUrl('https://www.dol.gov/agencies/whd', 'US')) fail.push('US *.gov');
  if (isOfficialUrl('https://www.legislation.gov.uk/ukpga/1996/18', 'DE')) fail.push('foreign official host for another country');
  if (!isOfficialUrl('https://www.legislation.gov.uk/ukpga/1996/18', '')) fail.push('any official host when jurisdiction unknown');
  if (officialPortal('RU') !== 'http://pravo.gov.ru' || !isOfficialUrl('http://pravo.gov.ru/', 'RU')) fail.push('RU portal');
  if (Object.values(OFFICIAL_SOURCES).some((entry) => !isOfficialUrl(entry.portal, ''))) fail.push('every portal must pass the allowlist');

  const answer = normalizeLegalAnswer(
    {
      jurisdiction: 'DE',
      short_answer: '  Yes,  within limits. ',
      rules: [{ title: 'Notice period', detail: 'x', citation: '§ 622 BGB' }, { detail: 'no title' }],
      deadlines: [{ label: 'Sue', rule: '3 weeks from receipt' }, { label: 'No rule' }],
      sources: [
        { title: 'BGB', url: 'https://www.gesetze-im-internet.de/bgb/__622.html' },
        { title: 'Blog', url: 'https://anwalt-blog.de/622' },
        { title: 'dup', url: 'https://www.gesetze-im-internet.de/bgb/__622.html' },
      ],
      steps: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      confidence: 'weird',
    },
    { country: 'TR' }
  );
  if (answer.jurisdiction !== 'TR') fail.push('user-selected country wins');
  if (answer.sources.length !== 0) fail.push('German source must be dropped under TR');
  const auto = normalizeLegalAnswer({ jurisdiction: 'DE', short_answer: 'ok', sources: [{ title: 'BGB', url: 'https://www.gesetze-im-internet.de/bgb/__622.html' }, { url: 'https://anwalt-blog.de/622' }] });
  if (auto.jurisdiction !== 'DE' || auto.sources.length !== 1 || auto.sources[0].host !== 'www.gesetze-im-internet.de') fail.push('auto jurisdiction + blog filtered');
  if (answer.shortAnswer !== 'Yes, within limits.' || answer.rules.length !== 1 || answer.deadlines.length !== 1) fail.push('normalize lists');
  if (answer.steps.length !== ASK_LIMITS.steps || answer.confidence !== 'MEDIUM') fail.push('limits / confidence');
  if (normalizeLegalAnswer({ jurisdiction: 'XX', short_answer: 'x' }).jurisdiction !== 'OTHER') fail.push('unknown jurisdiction');
  if (isUsableAnswer(normalizeLegalAnswer({ short_answer: ' ' })) || normalizeLegalAnswer(null)) fail.push('usable');

  const text = formatAnswerText(auto, (k) => k, { question: 'Q?', disclaimer: 'DISCLAIMER' });
  if (!text.endsWith('DISCLAIMER') || !text.startsWith('askQuestionLabel: Q?') || !text.includes('https://www.gesetze-im-internet.de')) fail.push('share text');
  if (fail.length) throw new Error(`legal answer fixtures: ${fail.join('; ')}`);
  return { cases: 22 };
}
