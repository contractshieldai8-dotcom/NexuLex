import {
  analysisSourceText,
  extractAnchorEndDate,
  extractTrapDurations,
  isNoticeDurationSlot,
  noticeDateIso,
  trapBadgeFor,
} from './trapExtract';
import { foldTr } from './contractType';
import { ALL_PLAYBOOK_IDS, defaultSignConditionIds, playbookItemById, statuteFor } from '../constants/playbooks';

// Analiz nesnesi üzerinde çalışan saf yardımcılar.
// Hem App.js hem de ekranlar tarafından ortak kullanılır.
// Eski raporlarda yeni alanlar yoksa boş / varsayılan değerlerle doldurulur.

const parseMaybeJson = (value) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const asArray = (value) => {
  const parsed = parseMaybeJson(value);
  return Array.isArray(parsed) ? parsed : [];
};

const asObject = (value) => {
  const parsed = parseMaybeJson(value);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
};

const DECISION_ACTIONS = new Set(['SIGN', 'NEGOTIATE', 'WALK_AWAY']);
const LEGAL_STATUSES = new Set(['VOID', 'PARTIALLY_VOID', 'QUESTIONABLE', 'VALID']);
const EVENT_TYPES = new Set([
  'renewal_notice',
  'price_increase',
  'trial_end',
  'termination_window',
  'obligation',
  'confidentiality',
  'return_or_refund',
]);
const CRITICALITY = new Set(['HIGH', 'MEDIUM', 'LOW']);
const PROTECTION_STATUS = new Set(['PRESENT', 'WEAK', 'ABSENT']);
const LADDER_STEPS = new Set(['ASK', 'CONCEDE', 'WALK']);
const PLAYBOOK_ID_SET = new Set(ALL_PLAYBOOK_IDS);
const STATUTE_CITE = /[§]|m\.\s*\d|Art\.|المادة|ст\.|art\.\s*\d/i;
const AUTO_RENEW_TEXT = /auto-?renew|otomatik yenile|stillschweigend|tacite reconduction|renovación automática/i;

const clampPct = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
};

const looksLikeCite = (value) => STATUTE_CITE.test(String(value || ''));

export const normalizeDecisionAction = (action) => {
  const value = String(action || '').toUpperCase().replace(/[\s-]+/g, '_');
  if (value === 'WALKAWAY' || value === 'WALK' || value === 'ESCAPE') return 'WALK_AWAY';
  if (value === 'SIGN_IT' || value === 'ACCEPT') return 'SIGN';
  if (value === 'BARGAIN' || value === 'RENEGOTIATE') return 'NEGOTIATE';
  return DECISION_ACTIONS.has(value) ? value : 'NEGOTIATE';
};

export const decisionActionKey = (action) => {
  switch (normalizeDecisionAction(action)) {
    case 'SIGN':
      return 'decisionSign';
    case 'WALK_AWAY':
      return 'decisionWalkAway';
    default:
      return 'decisionNegotiate';
  }
};

export const legalStatusKey = (status) => {
  switch (String(status || '').toUpperCase()) {
    case 'VOID':
      return 'legalStatusVoid';
    case 'PARTIALLY_VOID':
      return 'legalStatusPartial';
    case 'VALID':
      return 'legalStatusValid';
    default:
      return 'legalStatusQuestionable';
  }
};

const normalizeDecision = (raw, card) => {
  const value = asObject(raw);
  const fromCard = asObject(card);
  const reasonsFromDecision = Array.isArray(value?.reasons)
    ? value.reasons.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 3)
    : [];
  const reasonsFromCard = Array.isArray(fromCard?.top_3_red_flags)
    ? fromCard.top_3_red_flags.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 3)
    : [];
  const action = normalizeDecisionAction(
    value?.action || fromCard?.verdict || 'NEGOTIATE'
  );
  const headline = String(value?.headline || fromCard?.one_sentence_summary || '').trim();
  const estimatedHarm = String(
    value?.estimatedHarm || value?.estimated_harm || fromCard?.estimated_financial_risk || ''
  ).trim();
  const actionAdvice = String(value?.actionAdvice || fromCard?.action_advice || '').trim();
  const reasons = reasonsFromDecision.length ? reasonsFromDecision : reasonsFromCard;

  if (!headline && !estimatedHarm && !reasons.length && !actionAdvice) return null;

  return {
    action,
    headline,
    reasons,
    estimatedHarm,
    actionAdvice,
  };
};

const normalizeDeadlineEntry = (entry) => {
  if (!entry || typeof entry !== 'object') return null;
  const label = String(entry.label || entry.event_title || '').trim();
  if (!label) return null;
  const dateOrOffset = String(entry.date || entry.event_date_or_offset || '').trim();
  const iso = /^\d{4}-\d{2}-\d{2}/.test(dateOrOffset) ? dateOrOffset.slice(0, 10) : '';
  return {
    label,
    date: iso,
    kind: String(entry.kind || entry.event_type || 'DEADLINE').toUpperCase(),
    note: iso ? String(entry.note || '').trim() : dateOrOffset,
    criticality: CRITICALITY.has(String(entry.criticality || '').toUpperCase())
      ? String(entry.criticality).toUpperCase()
      : '',
  };
};

const normalizeValidity = (entry) => {
  if (!entry || typeof entry !== 'object') return null;
  const originalText = String(entry.original_text || entry.originalText || '').trim();
  const explanation = String(entry.explanation || '').trim();
  if (!originalText && !explanation) return null;
  let status = String(entry.legal_status || entry.legalStatus || 'QUESTIONABLE').toUpperCase();
  if (!LEGAL_STATUSES.has(status)) status = 'QUESTIONABLE';
  const governingLawReference = String(
    entry.governing_law_reference || entry.legalReference || entry.legal_reference || ''
  ).trim();
  const confidence = String(entry.confidence || '').toUpperCase();
  const hollowVoid =
    (status === 'VOID' || status === 'PARTIALLY_VOID') &&
    (!governingLawReference || !looksLikeCite(governingLawReference) || confidence === 'LOW');
  if (hollowVoid) status = 'QUESTIONABLE';
  return {
    clauseNumber: String(entry.clause_number || entry.clauseNumber || '').trim(),
    originalText,
    legalStatus: status,
    governingLawReference,
    explanation,
    cancellationRight: hollowVoid
      ? ''
      : String(entry.cancellation_right || entry.cancellationRight || entry.remedy || '').trim(),
  };
};

const normalizeClause = (entry) => {
  if (!entry || typeof entry !== 'object') return null;
  const clauseTitle = String(entry.clauseTitle || entry.clause_title || '').trim();
  const issueRaw = String(entry.issue || entry.risk || entry.explanation || '').trim();
  const issue = isPlaceholderText(issueRaw) ? '' : issueRaw;
  if (!clauseTitle && !issue && !entry.originalText) return null;
  const status = String(entry.legalStatus || entry.legal_status || '').toUpperCase();
  let legalStatus = LEGAL_STATUSES.has(status) ? status : '';
  const legalReference = String(entry.legalReference || entry.legal_reference || '').trim();
  const confidence = String(entry.confidence || '').toUpperCase();
  if (
    (legalStatus === 'VOID' || legalStatus === 'PARTIALLY_VOID') &&
    (!legalReference || !looksLikeCite(legalReference) || confidence === 'LOW')
  ) {
    legalStatus = 'QUESTIONABLE';
  }
  return {
    clauseTitle: isPlaceholderText(clauseTitle) ? '' : clauseTitle,
    originalText: String(entry.originalText || entry.original_text || '').trim(),
    riskLevel: String(entry.riskLevel || entry.risk_level || 'YELLOW').toUpperCase(),
    issue,
    legalReference: isPlaceholderText(legalReference) ? '' : legalReference,
    ...normalizeCounterOfferFields(entry),
    legalStatus,
    cancellationRight:
      legalStatus === 'QUESTIONABLE'
        ? ''
        : String(entry.cancellationRight || entry.cancellation_right || '').trim(),
  };
};

const normalizeHiddenCosts = (raw) => {
  const base = asObject(raw) || {};
  const value = { ...base, ...(asObject(base.financial_exposure) || {}) };
  return {
    penaltyClauseAmount: isPlaceholderText(value.penalty_clause_amount ?? value.penaltyClauseAmount)
      ? ''
      : value.penalty_clause_amount ?? value.penaltyClauseAmount ?? '',
    depositRisk: isPlaceholderText(value.deposit_risk ?? value.depositRisk)
      ? ''
      : value.deposit_risk ?? value.depositRisk ?? '',
    autoRenewalCost: isPlaceholderText(value.auto_renewal_cost ?? value.autoRenewalCost)
      ? ''
      : value.auto_renewal_cost ?? value.autoRenewalCost ?? '',
    priceIncreaseCost: isPlaceholderText(value.price_increase_cost ?? value.priceIncreaseCost)
      ? ''
      : value.price_increase_cost ?? value.priceIncreaseCost ?? '',
    earlyTerminationFee: isPlaceholderText(value.early_termination_fee ?? value.earlyTerminationFee)
      ? ''
      : value.early_termination_fee ?? value.earlyTerminationFee ?? '',
    noticePeriodCost: isPlaceholderText(value.notice_period_cost ?? value.noticePeriodCost)
      ? ''
      : value.notice_period_cost ?? value.noticePeriodCost ?? '',
    interestOrDefault: isPlaceholderText(value.interest_or_default ?? value.interestOrDefault)
      ? ''
      : value.interest_or_default ?? value.interestOrDefault ?? '',
    horizonLabel: isPlaceholderText(value.horizon_label || value.horizonLabel)
      ? ''
      : String(value.horizon_label || value.horizonLabel || '').trim(),
    totalEstimatedLiability: isPlaceholderText(
      value.total_estimated_liability || value.totalEstimatedLiability
    )
      ? ''
      : String(value.total_estimated_liability || value.totalEstimatedLiability || '').trim(),
  };
};

const normalizeProposal = (entry) => {
  if (!entry || typeof entry !== 'object') return null;
  const rewritten = String(
    entry.rewritten_pro_user_text || entry.counterOffer || entry.rewritten || ''
  ).trim();
  const originalText = String(entry.original_text || entry.originalText || '').trim();
  if (!rewritten && !originalText) return null;
  const ready = asObject(entry.ready_to_send_message) || asObject(entry.readyToSendMessage) || {};
  return {
    riskClauseId: String(entry.risk_clause_id || entry.riskClauseId || '').trim(),
    originalText,
    rewrittenProUserText: rewritten,
    legalJustification: String(entry.legal_justification || entry.legalJustification || '').trim(),
    readyToSendMessage: {
      whatsapp: String(ready.whatsapp || '').trim(),
      email: String(ready.email || '').trim(),
    },
  };
};

const normalizeEvent = (entry) => {
  if (!entry || typeof entry !== 'object') return null;
  const title = String(entry.event_title || entry.label || '').trim();
  if (!title) return null;
  const typeRaw = String(entry.event_type || entry.kind || 'termination_window').toLowerCase();
  const criticality = String(entry.criticality || '').toUpperCase();
  return {
    eventTitle: title,
    eventDateOrOffset: String(entry.event_date_or_offset || entry.date || entry.note || '').trim(),
    eventType: EVENT_TYPES.has(typeRaw) ? typeRaw : 'termination_window',
    criticality: CRITICALITY.has(criticality) ? criticality : 'MEDIUM',
  };
};

const normalizeObligation = (entry) => {
  if (!entry || typeof entry !== 'object') return null;
  const task = String(entry.task || '').trim();
  if (!task) return null;
  const party = String(entry.party || 'USER').toUpperCase() === 'OTHER_PARTY' ? 'OTHER_PARTY' : 'USER';
  return {
    party,
    task,
    deadline: String(entry.deadline || '').trim(),
  };
};

const normalizeIntegrity = (raw) => {
  const value = asObject(raw) || {};
  const flags = Array.isArray(value.warning_flags || value.warningFlags)
    ? (value.warning_flags || value.warningFlags).map((item) => String(item || '').trim()).filter(Boolean)
    : [];
  return {
    missingSignatureLine: Boolean(value.missing_signature_line ?? value.missingSignatureLine),
    missingDates: Boolean(value.missing_dates ?? value.missingDates),
    suspiciousIbanOrPayment: Boolean(value.suspicious_iban_or_payment ?? value.suspiciousIbanOrPayment),
    unilateralAmendmentClause: Boolean(value.unilateral_amendment_clause ?? value.unilateralAmendmentClause),
    warningFlags: flags,
  };
};

const normalizeMissingProtection = (entry) => {
  if (!entry || typeof entry !== 'object') return null;
  const playbookId = String(entry.playbookId || entry.playbook_id || '').trim();
  if (!PLAYBOOK_ID_SET.has(playbookId)) return null;
  const status = String(entry.status || '').toUpperCase();
  const severity = String(entry.severity || 'MEDIUM').toUpperCase();
  return {
    playbookId,
    status: PROTECTION_STATUS.has(status) ? status : 'WEAK',
    statute: String(entry.statute || '').trim(),
    whyItHurts: String(entry.whyItHurts || entry.why_it_hurts || '').trim(),
    insertClause: String(entry.insertClause || entry.insert_clause || '').trim(),
    severity: CRITICALITY.has(severity) ? severity : 'MEDIUM',
  };
};

export function normalizePowerTilt(raw) {
  const value = asObject(raw);
  if (!value) return null;
  const hasUser = value.user != null && value.user !== '';
  const hasOther = value.other != null && value.other !== '';
  if (!hasUser && !hasOther) return null;
  let user = hasUser ? clampPct(value.user) : null;
  let other = hasOther ? clampPct(value.other) : null;
  if (user == null && other != null) user = 100 - other;
  if (other == null && user != null) other = 100 - user;
  const label = String(value.label || '').trim();
  if (!label && user === 0 && other === 0) return null;
  return { user, other, label };
}

const normalizeLadderStep = (entry, index) => {
  if (!entry || typeof entry !== 'object') return null;
  const fallback = ['ASK', 'CONCEDE', 'WALK'][index] || 'ASK';
  const step = String(entry.step || fallback).toUpperCase();
  const ask = String(entry.ask || '').trim();
  const theirLikelyReply = String(entry.theirLikelyReply || entry.their_likely_reply || '').trim();
  const counter = String(entry.counter || '').trim();
  if (!ask && !counter && !theirLikelyReply) return null;
  return {
    step: LADDER_STEPS.has(step) ? step : fallback,
    ask,
    theirLikelyReply,
    counter,
  };
};

export function normalizeGoverningLawConflict(raw, userCountry = 'auto') {
  const value = asObject(raw);
  if (!value) return null;
  const hasClash = Boolean(value.hasClash ?? value.has_clash);
  const effect = String(value.effect || '').trim();
  const contractLaw = String(value.contractLaw || value.contract_law || '').trim();
  const userLaw = String(value.userLaw || value.user_law || '').trim();
  const clauseRef = String(value.clauseRef || value.clause_ref || '').trim();
  if (!hasClash || !effect) return null;
  const autoWithoutForeign =
    String(userCountry || 'auto').toLowerCase() === 'auto' && !contractLaw;
  if (autoWithoutForeign) return null;
  return { hasClash: true, contractLaw, userLaw, clauseRef, effect };
}

export function normalizeSignConditions(raw, category, country) {
  const source = asArray(raw);
  const fromModel = source
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      return String(item?.id || item?.playbookId || item?.playbook_id || '').trim();
    })
    .filter((id) => PLAYBOOK_ID_SET.has(id));
  const unique = [...new Set(fromModel)];
  const byTitle = new Map();
  unique.forEach((id) => {
    const item = playbookItemById(id);
    const titleKey = String(item?.titleKey || id).trim().toLowerCase();
    if (!byTitle.has(titleKey)) byTitle.set(titleKey, id);
  });
  return [...byTitle.values()].slice(0, 3).map((id) => {
    const item = playbookItemById(id);
    return {
      id,
      titleKey: item?.titleKey || '',
      label: item?.titleKey || id,
      statute: statuteFor(item, country) || '',
      rule: item?.titleKey || '',
    };
  });
}

export function userSignConditions(analysis) {
  return normalizeSignConditions(
    analysis?.signConditions ?? analysis?.sign_conditions,
    analysis?.contractCategory,
    analysis?.jurisdiction?.country
  );
}

export function conditionsForVerify(analysis, category, country) {
  const pinned = userSignConditions(analysis);
  if (pinned.length) return pinned.slice(0, 3);
  return defaultSignConditionIds(category).map((id) => {
    const item = playbookItemById(id);
    return {
      id,
      titleKey: item?.titleKey || '',
      label: item?.titleKey || id,
      statute: statuteFor(item, country) || '',
      rule: item?.titleKey || '',
    };
  });
}

const isRenewalCondition = (id) => /renew/i.test(String(id || '')) || id === 'saas_renewal';

const applyRenewalGuard = (light, revisedText) => {
  if (!light?.met || light.confidence === 'HIGH') return light;
  if (!isRenewalCondition(light.id) || !AUTO_RENEW_TEXT.test(String(revisedText || ''))) return light;
  return {
    ...light,
    met: false,
    unmetReason: light.unmetReason || 'not explicit in the text',
  };
};

export function normalizeSignLights(raw, revisedText = '') {
  const source = asArray(
    raw?.sign_conditions_eval || raw?.signConditionsEval || raw?.lights || raw
  );
  const lights = source
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const id = String(item.id || item.playbookId || '').trim();
      if (!id) return null;
      const confidence = String(item.confidence || 'MEDIUM').toUpperCase();
      return applyRenewalGuard(
        {
          id,
          met: Boolean(item.met),
          confidence: CRITICALITY.has(confidence) ? confidence : 'MEDIUM',
          evidence: String(item.evidence || '').trim(),
          unmetReason: String(item.unmetReason || item.unmet_reason || '').trim(),
        },
        revisedText
      );
    })
    .filter(Boolean)
    .slice(0, 3);

  if (!lights.length) return null;
  return {
    met: lights.filter((item) => item.met).length,
    total: lights.length,
    lights,
    updatedAt: String(raw?.updatedAt || raw?.updated_at || new Date().toISOString()),
  };
}

export function isSignBlocked(signStatus) {
  const lights = signStatus?.lights || [];
  if (!lights.length) return false;
  return lights.some((light) => light.confidence === 'HIGH' && light.met === false);
}

export function displayedDecisionAction(decision, signStatus) {
  const action = normalizeDecisionAction(decision?.action);
  if (action === 'SIGN' && isSignBlocked(signStatus)) return 'NEGOTIATE';
  return action;
}

export function buildAdvisorAnalysisContext(analysis, titleForId) {
  if (!analysis) return null;
  const hasBody =
    analysis.decision?.headline ||
    analysis.summary ||
    (analysis.redFlags || []).length ||
    (analysis.missingProtections || []).length;
  if (!hasBody) return null;
  const missingTitles = (analysis.missingProtections || [])
    .filter((item) => item.status === 'ABSENT' || item.status === 'WEAK')
    .slice(0, 3)
    .map((item) => titleForId?.(item.playbookId) || item.playbookId);
  const clash = analysis.governingLawConflict?.hasClash
    ? [analysis.governingLawConflict.contractLaw, analysis.governingLawConflict.userLaw]
        .filter(Boolean)
        .join(' · ')
    : '';
  return {
    party: analysis.partyRole || '',
    country: analysis.jurisdiction?.country || '',
    category: analysis.contractCategory || 'general',
    verdict: displayedDecisionAction(analysis.decision, analysis.signStatus),
    redFlagTitles: (analysis.redFlags || [])
      .map((flag) => String(flag.title || '').trim())
      .filter(Boolean)
      .slice(0, 3),
    missingTitles,
    powerTiltLabel: analysis.powerTilt?.label || '',
    clash,
    lawyerQuestions: (analysis.lawyerQuestions || []).slice(0, 3),
  };
}

const datesToEvents = (dates) =>
  (dates || []).map((item) => ({
    eventTitle: item.label,
    eventDateOrOffset: item.date || item.note,
    eventType:
      item.kind === 'RENEWAL'
        ? 'renewal_notice'
        : item.kind === 'TERMINATION_WINDOW'
          ? 'termination_window'
          : String(item.kind || '').toLowerCase().includes('trial')
            ? 'trial_end'
            : String(item.kind || '').toLowerCase().includes('price')
              ? 'price_increase'
              : 'termination_window',
    criticality: item.criticality || 'MEDIUM',
  }));

export function toDecisionCardPayload(decision) {
  if (!decision) return {};
  return {
    verdict: decision.action === 'WALK_AWAY' ? 'ESCAPE' : decision.action,
    one_sentence_summary: decision.headline || '',
    top_3_red_flags: decision.reasons || [],
    estimated_financial_risk: decision.estimatedHarm || '',
    action_advice: decision.actionAdvice || '',
  };
}

export function pickPaywallHook(analysis) {
  if (!analysis) return null;
  if (analysis.decision?.action === 'WALK_AWAY') return 'escape';
  const voids = (analysis.validityAnalysis || []).filter(
    (item) => item.legalStatus === 'VOID' || item.legalStatus === 'PARTIALLY_VOID'
  );
  if (voids.length) return 'validity';
  if (analysis.hiddenCosts?.totalEstimatedLiability) return 'costs';
  if (analysis.decision?.action === 'NEGOTIATE') return 'negotiate';
  const missingAbsent = (analysis.missingProtections || []).filter(
    (item) => item.status === 'ABSENT' || item.status === 'WEAK'
  ).length;
  if (missingAbsent) return 'missing';
  if ((analysis.batnaLadder || []).length) return 'ladder';
  if (analysis.governingLawConflict?.hasClash) return 'lawClash';
  return null;
}

export const legalStatusTone = (status) => {
  const value = String(status || '').toUpperCase();
  if (value === 'VALID') return 'GREEN';
  if (value === 'QUESTIONABLE') return 'YELLOW';
  return 'RED';
};

export const legalStatusEmoji = (status) => {
  const value = String(status || '').toUpperCase();
  if (value === 'VALID') return '🟢';
  if (value === 'QUESTIONABLE') return '🟡';
  return '🔴';
};

export function hasHiddenCosts(costs) {
  if (!costs) return false;
  return Boolean(
    costs.totalEstimatedLiability ||
      costs.penaltyClauseAmount ||
      costs.depositRisk ||
      costs.autoRenewalCost ||
      costs.priceIncreaseCost ||
      costs.earlyTerminationFee ||
      costs.noticePeriodCost ||
      costs.interestOrDefault
  );
}

export function buildAudioScript(analysis) {
  const provided = String(analysis?.audioScript || analysis?.audio_script || '').trim();
  const summary = String(analysis?.summary || '').trim();
  const decision = analysis?.decision;
  const card = analysis?.decisionCard || analysis?.decision_card;
  const headline = String(decision?.headline || card?.one_sentence_summary || '').trim();
  const harm = String(decision?.estimatedHarm || card?.estimated_financial_risk || '').trim();
  const reasons = [
    ...(decision?.reasons || []),
    ...(card?.top_3_red_flags || card?.top_3RedFlags || []),
  ]
    .map((item) => String(item || '').trim())
    .filter((item) => item && !isPlaceholderText(item));
  const order = { RED: 0, YELLOW: 1, GREEN: 2 };
  const clauseRisks = [...(analysis?.clauses || [])]
    .sort((a, b) => (order[a.riskLevel] ?? 3) - (order[b.riskLevel] ?? 3))
    .map((clause) => String(clause.issue || clause.clauseTitle || '').trim())
    .filter((item) => item && !isPlaceholderText(item));
  const flagRisks = [...(analysis?.redFlags || [])]
    .sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3))
    .map((flag) => String(flag.title || flag.explanation || '').trim())
    .filter((item) => item && !isPlaceholderText(item));

  const topRisks = [...reasons, ...flagRisks, ...clauseRisks]
    .filter((item, index, list) => item && list.indexOf(item) === index)
    .slice(0, 3);

  const asSpokenSentence = (value) => {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text || isPlaceholderText(text)) return '';
    return /[.!?…]$/.test(text) ? text : `${text}.`;
  };

  const built = [summary, headline, harm, ...topRisks]
    .map(asSpokenSentence)
    .filter((item, index, list) => item && list.indexOf(item) === index)
    .join(' ');

  if (built) return built.slice(0, 1200);
  const fallback = asSpokenSentence(provided);
  return isPlaceholderText(fallback) ? '' : fallback.slice(0, 1200);
}

export function normalizeDiffResult(raw, revisedText = '') {
  const value = asObject(raw) || {};
  const winnerRaw = String(value.who_gained || value.whoGained || 'MIXED').toUpperCase();
  const winner = ['USER', 'OTHER', 'MIXED'].includes(winnerRaw) ? winnerRaw : 'MIXED';
  const changes = asArray(value.changes)
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const topic = String(item.topic || item.title || '').trim();
      const note = String(item.note || item.summary || '').trim();
      if (!topic && !note) return null;
      const side = String(item.winner || item.favours || 'NEUTRAL').toUpperCase();
      return {
        topic,
        original: String(item.original || '').trim(),
        revised: String(item.revised || '').trim(),
        winner: ['USER', 'OTHER', 'NEUTRAL'].includes(side) ? side : 'NEUTRAL',
        worsened: Boolean(item.worsened ?? item.got_worse),
        note,
      };
    })
    .filter(Boolean)
    .slice(0, 8);

  const revised = String(revisedText || value.revised_text || value.revisedText || '').trim();
  return {
    summary: String(value.summary || '').trim(),
    whoGained: winner,
    revisedText: revised,
    changes,
    signStatus: normalizeSignLights(value, revised),
  };
}

export const TRAP_SLOTS = [
  { key: 'termination', kind: 'TERMINATION_WINDOW', eventType: 'termination_window' },
  { key: 'confidentiality', kind: 'CONFIDENTIALITY', eventType: 'confidentiality' },
  { key: 'return_or_refund', kind: 'RETURN', eventType: 'return_or_refund' },
];

export function isPlaceholderText(value) {
  const text = String(value ?? '').replace(/\u0000/g, '').trim();
  if (!text) return true;
  return /^(n\/a|n\.a\.|na|none|null|undefined|-|—|–|\.|belirtilmedi|yok|yoktur|not specified|unspecified|bilinmiyor)$/i.test(
    text
  );
}

export function safeDisplayText(value, fallback = '') {
  if (isPlaceholderText(value)) return fallback;
  let text = String(value).replace(/\u0000/g, '').trim();

  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
  }

  const truncated = inString || escaped || /[,:\\]$/.test(text);
  if (!truncated) return text;
  return `${text.replace(/["\\]+$/g, '').trim()}...`;
}

export function isUnspecifiedTrap(value) {
  const text = String(value || '').trim();
  if (!text) return true;
  return /^(n\/a|na|none|null|undefined|-|—|belirtilmedi|yok|not specified|unspecified)$/i.test(text)
    || /sözleşmede süre belirtilmemiş|sözleşmede yok|belirsiz süre|sonsuz\/riskli|indefinite|no (date|term|period)/i.test(text);
}

/** Tier ids for paste-ready counter text (no extra LLM call). */
export const OFFER_TIERS = ['balanced', 'shield', 'fast'];

/**
 * Parse counterOffers / counter_offers; keep legacy counterOffer as primary.
 * Always sets counterOffer = balanced || legacy so UI never lacks a primary string.
 */
export function normalizeCounterOfferFields(entry) {
  const raw = entry && typeof entry === 'object' ? entry : {};
  const bag = asObject(raw.counterOffers ?? raw.counter_offers) || {};
  const balanced = String(bag.balanced || bag.Balanced || '').trim();
  const shield = String(bag.shield || bag.Shield || '').trim();
  const fast = String(bag.fast || bag.fastAccept || bag.fast_accept || bag['fast-accept'] || '').trim();
  const offers = {};
  if (balanced) offers.balanced = balanced;
  if (shield) offers.shield = shield;
  if (fast) offers.fast = fast;
  const legacy = String(raw.counterOffer || raw.counter_offer || '').trim();
  const counterOffer = offers.balanced || legacy;
  const out = { counterOffer };
  if (Object.keys(offers).length) out.counterOffers = offers;
  return out;
}

/** Active tier text, else primary counterOffer. */
export function pickCounterOffer(item, tier = 'balanced') {
  const key = String(tier || 'balanced').toLowerCase();
  const mapped = key === 'fastaccept' || key === 'fast-accept' ? 'fast' : key;
  const offers = item?.counterOffers || item?.counter_offers || null;
  const fromTier = offers ? String(offers[mapped] || '').trim() : '';
  if (fromTier) return fromTier;
  return String(item?.counterOffer || item?.counter_offer || '').trim();
}

export function countOfferTiers(item) {
  const offers = item?.counterOffers || item?.counter_offers || {};
  return OFFER_TIERS.filter((key) => String(offers[key] || '').trim()).length;
}

export function meaningfulRedFlags(flags) {
  return (Array.isArray(flags) ? flags : []).filter((flag) => {
    const title = String(flag?.title || flag?.clauseTitle || '').trim();
    const explanation = String(flag?.explanation || flag?.issue || flag?.risk || '').trim();
    return title.length > 1 || explanation.length > 1;
  });
}

const clauseFromText = (title, issue, riskLevel = 'YELLOW', legalReference = '') =>
  normalizeClause({
    clauseTitle: String(title || issue || '').trim().slice(0, 90),
    issue: String(issue || title || '').trim(),
    riskLevel,
    legalReference,
  });

export function synthesizeClauseCards(analysis) {
  const fromFlags = meaningfulRedFlags(analysis?.redFlags ?? analysis?.red_flags)
    .slice(0, 5)
    .map((flag) =>
      clauseFromText(
        flag.title,
        flag.explanation,
        flag.severity || 'RED',
        flag.legalReference || flag.legal_reference
      )
    )
    .filter((item) => item && !isPlaceholderText(item.issue) && !isPlaceholderText(item.clauseTitle));
  if (fromFlags.length) return fromFlags;

  const takeaways = asArray(analysis?.keyTakeaways ?? analysis?.key_takeaways)
    .map((item) => {
      const text =
        typeof item === 'string'
          ? item
          : String(item?.text || item?.title || item?.issue || '').trim();
      if (isPlaceholderText(text)) return null;
      return clauseFromText(text, text, 'YELLOW');
    })
    .filter(Boolean);
  if (takeaways.length) return takeaways.slice(0, 5);

  const reasons = [
    ...asArray(analysis?.decision?.reasons),
    ...asArray(analysis?.decisionCard?.top_3_red_flags ?? analysis?.decision_card?.top_3_red_flags),
  ]
    .map((item) => String(item || '').trim())
    .filter((item) => item && !isPlaceholderText(item))
    .map((item) =>
      clauseFromText(item, item, Number(analysis?.score) >= 70 ? 'GREEN' : 'YELLOW')
    )
    .filter(Boolean);
  if (reasons.length) return reasons.slice(0, 5);
  return [];
}

const SLOT_INFER = {
  termination: /fesih|ihbar|termination|notice period|kündigung|délai de préavis|opzeg/i,
  confidentiality: /gizlilik|confidential|nda|sır saklama|geheimhaltung|réservatezza|محرمان/i,
  return_or_refund: /depozito|teminat|iade|deposit|refund|kaution|garantie|ودیعه|押金/i,
};

const analysisHaystack = (analysis) =>
  [
    analysis?.summary,
    ...(analysis?.clauses || []).flatMap((item) => [item.clauseTitle, item.issue, item.originalText]),
    ...(analysis?.redFlags || []).flatMap((item) => [item.title, item.explanation]),
    ...(analysis?.importantDates || []).flatMap((item) => [item.label, item.note]),
  ]
    .filter(Boolean)
    .join(' \n ');

const inferTrapHint = (analysis, slot, fallback) => {
  const haystack = analysisHaystack(analysis);
  const pattern = SLOT_INFER[slot.key] || SLOT_INFER[slot.eventType];
  if (!pattern || !pattern.test(haystack)) return fallback;
  const clauses = analysis?.clauses || [];
  const hit = clauses.find((item) =>
    pattern.test(`${item.clauseTitle || ''} ${item.issue || ''} ${item.originalText || ''}`)
  );
  if (hit?.issue) return safeDisplayText(hit.issue, fallback);
  if (hit?.clauseTitle) return `${hit.clauseTitle}: ${fallback}`;
  return fallback;
};

const slotFromTrap = (slot, trap) => {
  const raw = asObject(trap?.[slot.key]) || asObject(trap?.[slot.eventType]) || {};
  return {
    dateOrRule: String(raw.date_or_rule || raw.dateOrRule || raw.date || '').trim(),
    note: String(raw.note || raw.explanation || '').trim(),
  };
};

export function ensureTrapCalendar(analysis, unspecifiedLabel = '', lang = 'tr') {
  const extracted = extractTrapDurations(analysisSourceText(analysis));
  const anchor =
    extractAnchorEndDate(analysis?.contract_text || analysis?.contractText || '') ||
    extractAnchorEndDate(analysisSourceText(analysis));
  const resolveIso = (kind, dateOrRule, duration) => {
    const raw = String(dateOrRule || '').trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
    if (duration && anchor && isNoticeDurationSlot(kind)) return noticeDateIso(anchor, duration);
    return '';
  };
  const dates = [...(analysis?.importantDates || [])].map((item) => {
    const slotKey = String(item.kind || item.eventType || '').toLowerCase();
    const mapped =
      slotKey.includes('termin') ? extracted.termination
      : slotKey.includes('confid') ? extracted.confidentiality
      : slotKey.includes('return') || slotKey.includes('refund') ? extracted.return_or_refund
      : null;
    const badge = trapBadgeFor(item.kind, mapped, lang);
    const iso = resolveIso(item.kind || item.eventType, item.date, mapped);
    const silent = !badge && !iso && isUnspecifiedTrap(item.date) && isUnspecifiedTrap(item.note);
    return {
      ...item,
      date: iso || item.date,
      label: safeDisplayText(item.label, item.kind),
      note: silent ? '' : safeDisplayText(item.note || mapped?.rule, ''),
      badge,
      placeholder: silent,
      criticality: item.criticality || (silent ? 'HIGH' : item.criticality),
    };
  });
  const trap = asObject(analysis?.trapCalendar || analysis?.trap_calendar) || {};

  for (const slot of TRAP_SLOTS) {
    const already = dates.some(
      (item) =>
        String(item.kind || '').toUpperCase() === slot.kind ||
        String(item.eventType || '').toLowerCase() === slot.eventType
    );
    if (already) continue;

    const fromEvent = (analysis?.contractEvents || []).find(
      (item) => item.eventType === slot.eventType
    );
    const fromTrap = slotFromTrap(slot, trap);
    const duration = extracted[slot.key];
    const dateOrRule = fromEvent?.eventDateOrOffset || fromTrap.dateOrRule || duration?.rule || '';
    const iso = resolveIso(slot.kind, dateOrRule, duration);
    const badge = trapBadgeFor(slot.key, duration, lang);
    const silent = !badge && !iso && isUnspecifiedTrap(dateOrRule) && isUnspecifiedTrap(fromTrap.note);

    dates.push({
      label: slot.kind,
      date: iso,
      kind: slot.kind,
      note: silent ? '' : safeDisplayText(fromTrap.note || dateOrRule, ''),
      badge,
      placeholder: silent,
      criticality: silent ? 'HIGH' : fromEvent?.criticality || 'MEDIUM',
    });
  }

  if (!dates.length) {
    return TRAP_SLOTS.map((slot) => {
      const duration = extracted[slot.key];
      const iso = resolveIso(slot.kind, '', duration);
      return {
        label: slot.kind,
        date: iso,
        kind: slot.kind,
        note: '',
        badge: trapBadgeFor(slot.key, duration, lang),
        placeholder: !duration && !iso,
        criticality: 'HIGH',
      };
    });
  }

  return dates;
}

export function integrityHasWarnings(checks) {
  if (!checks) return false;
  return Boolean(
    checks.missingSignatureLine ||
      checks.missingDates ||
      checks.suspiciousIbanOrPayment ||
      checks.unilateralAmendmentClause ||
      (checks.warningFlags || []).length
  );
}

// CORE omits counterMessage; stitch paste-ready text from existing counterOffers only.
// options.tierById: { 'flag:0'|'clause:0': 'balanced'|'shield'|'fast' }
// options.preferredTier: default tier when no per-item selection.
export function buildReadyToSendMessage(analysis, options = {}) {
  if (!analysis || typeof analysis !== 'object') return '';

  const preferredTier = String(options.preferredTier || 'balanced').toLowerCase();
  const tierById = options.tierById && typeof options.tierById === 'object' ? options.tierById : {};

  const items = [];
  const seen = new Set();
  const seenTitles = new Set();
  const pushOffer = (title, offer) => {
    if (items.length >= 4) return;
    const counter = String(offer || '').replace(/\s+/g, ' ').trim();
    if (!counter || isPlaceholderText(counter) || seen.has(counter)) return;
    const label = String(title || '').replace(/\s+/g, ' ').trim();
    const titleKey = label.toLowerCase();
    if (titleKey && seenTitles.has(titleKey)) return;
    seen.add(counter);
    if (titleKey) seenTitles.add(titleKey);
    items.push({
      title: label && !isPlaceholderText(label) ? label : '',
      counter,
    });
  };

  meaningfulRedFlags(analysis.redFlags).forEach((flag, index) => {
    const severity = String(flag?.severity || flag?.severity_level || '').toUpperCase();
    if (severity && severity !== 'RED' && severity !== 'YELLOW') return;
    const tier = tierById[`flag:${index}`] || preferredTier;
    pushOffer(flag?.title || flag?.clauseTitle, pickCounterOffer(flag, tier));
  });
  (Array.isArray(analysis.clauses) ? analysis.clauses : []).forEach((clause, index) => {
    const risk = String(clause?.riskLevel || clause?.risk_level || '').toUpperCase();
    if (risk !== 'RED' && risk !== 'YELLOW') return;
    const tier = tierById[`clause:${index}`] || preferredTier;
    pushOffer(clause?.clauseTitle || clause?.clause_title, pickCounterOffer(clause, tier));
  });
  if (!items.length) return '';

  const decision = analysis.decision || null;
  const headline = String(decision?.headline || '').replace(/\s+/g, ' ').trim();
  const advice = String(decision?.actionAdvice || '').replace(/\s+/g, ' ').trim();
  const lead =
    headline && !isPlaceholderText(headline)
      ? headline
      : advice && !isPlaceholderText(advice)
        ? advice
        : '';
  const usedAdviceAsLead = Boolean(lead && advice && lead === advice);

  const lines = [];
  if (lead) lines.push(lead);
  items.forEach((item, index) => {
    lines.push(item.title ? `${index + 1}. ${item.title}: ${item.counter}` : `${index + 1}. ${item.counter}`);
  });
  if (!usedAdviceAsLead && advice && !isPlaceholderText(advice)) {
    lines.push(advice);
  }

  return cutReadyMessage(lines.join('\n').trim(), 1200);
}

function cutReadyMessage(text, limit = 1200) {
  const full = String(text || '').trim();
  if (full.length <= limit) return full;
  const cut = full.slice(0, limit);
  const lastNl = cut.lastIndexOf('\n');
  const lastSp = cut.lastIndexOf(' ');
  const at = Math.max(lastNl, lastSp);
  if (at > 0) return cut.slice(0, at).trimEnd();
  return cut.trimEnd();
}

const radarClean = (value) => {
  const text = String(value || '').trim();
  if (!text || isPlaceholderText(text)) return '';
  if (/^UNSPECIFIED$/i.test(text)) return '';
  return text;
};

const escapeRegExp = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Company-like line: Ltd / A.Ş. / Inc / GmbH or a short proper name — never bullets/section/duty prose. */
export function looksLikeCompanyName(line) {
  const raw = String(line || '').replace(/\s+/g, ' ').trim();
  if (!raw || raw.length < 3 || raw.length > 100) return false;
  if (/^[-•*·]\s/.test(raw)) return false;
  const folded = foldTr(raw);
  if (/^(ödeme|odeme|gerekli bilgi|payment)\b/.test(folded)) return false;
  if (/[:：]\s*$/.test(raw) && /ödeme|odeme|payment/.test(folded)) return false;
  // Section titles: "2. SÖZLEŞMENİN KONUSU", "1. Ödeme"
  if (
    /^\d+(\.\d+)*\.?\s+/.test(raw) &&
    /(sözleşme|sozlesme|konusu|taraflar|ödeme|odeme|genel|hüküm|yükümlül)/.test(folded)
  ) {
    return false;
  }
  // Prose / duty lines that start with a role word
  if (
    /^(tedarikçi|musteri|müşteri|satıcı|alıcı|hizmet saglayici|hizmet sağlayıcı)\b/.test(folded) &&
    /\b(ve|ödemeleri|odemeleri|ödemeler|nin|nın|nun|nün|yükümlül|;|,)\b/.test(folded)
  ) {
    return false;
  }
  if (/^(tedarikçi|müşteri|musteri|satıcı|alıcı|hizmet sağlayıcı|hizmet saglayici)\s*;/.test(folded)) {
    return false;
  }
  if (/(yükümlül|taahhüt|sorumludur|sağlar|edinir|ödemeleri|odemeleri)/.test(folded)) return false;

  // Explicit company markers
  if (
    /\b(ltd\.?|l\.?t\.?d\.?|a\.?\s*[şs]\.?|a\.s\.?|inc\.?|gmbh|llc|plc|corp\.?|co\.|şirketi|sirketi)\b/i.test(
      raw
    )
  ) {
    return true;
  }

  // Proper name / person (2–4 Title-Case tokens) or short company line
  if (/[.!?]{2,}|[.!?]\s+[a-zçğıöşü]/.test(raw)) return false;
  if (!/^[A-ZÇĞİÖŞÜÄÖÜ]/.test(raw)) return false;
  const words = raw.split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 10) return false;
  // Reject ALL-CAPS section banners with contract keywords
  if (words.length <= 4 && /^(SÖZLEŞME|KONUSU|TARAFLAR|ÖDEME)/.test(raw)) return false;
  // Person-style: 2–4 capitalized tokens (Ahmet Demir, ABC Marka Ltd. already matched above)
  if (
    words.length >= 2 &&
    words.length <= 4 &&
    words.every((w) => /^[A-ZÇĞİÖŞÜÄÖÜ][A-Za-zÇĞİÖŞÜçğıöşüÄÖÜäöü.''-]*$/.test(w))
  ) {
    return true;
  }
  return true;
}

function matchRoleHeading(foldedLine, labels) {
  for (const lab of labels) {
    const re = new RegExp(
      `^(?:\\d+(?:\\.\\d+)*\\.?\\s+)?${escapeRegExp(lab)}\\s*(?:\\([^)]*\\))?\\s*(?:[:：]\\s*(.*))?$`
    );
    const m = foldedLine.match(re);
    if (!m) continue;
    const rest = String(m[1] || '').trim();
    // "Tedarikçi ve Müşteri…" / "Müşteri ödemeleri…" — not a heading
    if (rest && /^(ve|ile|ödemeleri|odemeleri|ödemeler|odemeler|;|,)/.test(rest)) continue;
    if (rest && /^(nin|nın|nun|nün|yükümlül)/.test(rest)) continue;
    return { label: lab, rest };
  }
  return null;
}

/**
 * First company line under numbered role headings (1.1. TEDARİKÇİ / MÜŞTERİ / HİZMET SAĞLAYICI…).
 * Never invent names; reject bullets, section titles, payment lines, and duty prose.
 */
export function extractRadarPartiesFromText(source) {
  const text = String(source || '');
  if (!text.trim()) return '';
  const lines = text.split(/\r?\n/);
  // Longer labels first so "hizmet sağlayıcı" / "lisans veren" win over partials.
  const supplierLabels = [
    'hizmet sağlayıcı',
    'lisans veren',
    'franchisor',
    'yüklenici',
    'contractor',
    'vendor',
    'tedarikçi',
    'satıcı',
  ];
  const customerLabels = [
    'hizmet alan',
    'lisans alan',
    'franchisee',
    'işveren',
    'müşteri',
    'alıcı',
    'customer',
  ];

  const pickAfter = (labels) => {
    for (let i = 0; i < lines.length; i += 1) {
      const folded = foldTr(lines[i]).trim();
      const hit = matchRoleHeading(folded, labels);
      if (!hit) continue;

      if (hit.rest) {
        // Same-line name after colon — person or company ("İşveren: Ahmet Demir")
        const same = String(lines[i].split(/[:：]/).slice(1).join(':') || '').trim();
        if (same && looksLikeCompanyName(same)) return same.replace(/\s+/g, ' ').slice(0, 90);
      }

      for (let j = i + 1; j < Math.min(i + 6, lines.length); j += 1) {
        const next = String(lines[j] || '').trim();
        if (!next) continue;
        const nf = foldTr(next);
        if (matchRoleHeading(nf, [...supplierLabels, ...customerLabels])) break;
        if (/^(madde|article|ek\b)/.test(nf)) break;

        // "Ticaret Unvanı: Apex A.Ş." under a role heading
        const unvanM = nf.match(/^(ticaret\s+unvanı|unvanı|unvan)\s*:\s*(.*)$/);
        if (unvanM) {
          const rawValue = String(next.split(/[:：]/).slice(1).join(':') || '').trim();
          if (rawValue && looksLikeCompanyName(rawValue)) {
            return rawValue.replace(/\s+/g, ' ').slice(0, 90);
          }
          continue;
        }

        if (looksLikeCompanyName(next)) return next.replace(/\s+/g, ' ').slice(0, 90);
        // Non-company non-empty line under the heading — stop (don't grab prose).
        break;
      }
    }
    return '';
  };

  const a = pickAfter(supplierLabels);
  const b = pickAfter(customerLabels);
  if (a && b) {
    // Construction convention: İşveren vs Yüklenici (employer / customer first).
    if (/\bişveren\b/.test(foldTr(text))) return `${b} vs ${a}`;
    return `${a} vs ${b}`;
  }
  if (a) return a;
  if (b) return b;
  return '';
}

function partiesStringLooksValid(partiesStr) {
  const raw = String(partiesStr || '').trim();
  if (!raw) return false;
  const parts = raw.split(/\s+vs\s+/i).map((item) => item.trim()).filter(Boolean);
  if (!parts.length) return false;
  return parts.every((part) => looksLikeCompanyName(part));
}

export function extractLawPhraseFromText(source) {
  const text = String(source || '');
  const m =
    text.match(/Türk\s+hukuku/i) ||
    text.match(/Turkish\s+law/i) ||
    text.match(/yetkili\s+mahkeme(?:si)?[^.\n]{0,48}/i) ||
    text.match(/İstanbul[^.\n]{0,48}mahkeme(?:si|ler[ii])?/i) ||
    text.match(/[A-ZÇĞİÖŞÜ][\wçğıöşüÇĞİÖŞÜ.''-]*(?:\s+[A-ZÇĞİÖŞÜ][\wçğıöşüÇĞİÖŞÜ.''-]*){0,3}\s+Mahkemesi/i);
  return m ? String(m[0]).trim().replace(/\s+/g, ' ').slice(0, 80) : '';
}

/**
 * Pre-analyze live strip: same shape as normalizeContractRadar, local extractors only.
 * Empty fields stay ''; never invent parties/law/notice.
 */
export function buildLocalRadarPreview(text) {
  const sourceText = String(text || '');
  if (!sourceText.trim()) {
    return { parties: '', governingLawForum: '', noticePeriod: '' };
  }
  const parties = radarClean(extractRadarPartiesFromText(sourceText));
  let governingLawForum = radarClean(extractLawPhraseFromText(sourceText));
  governingLawForum = sanitizeGoverningLawForum(governingLawForum, sourceText);
  const durations = extractTrapDurations(sourceText);
  const noticePeriod = radarClean(durations?.termination?.rule);
  return {
    parties: parties || '',
    governingLawForum: governingLawForum || '',
    noticePeriod: noticePeriod || '',
  };
}

/** If law cites Madde N but the Türk hukuku / Turkish law sentence lacks N, keep only the short phrase. */
function sanitizeGoverningLawForum(law, sourceText) {
  const cleaned = radarClean(law);
  const phrase = radarClean(extractLawPhraseFromText(sourceText));
  if (!cleaned) return phrase || '';
  const madde = cleaned.match(/\bmadde\s*(\d+)\b/i) || cleaned.match(/\bart\.?\s*(\d+)\b/i);
  if (!madde) return cleaned;
  const n = madde[1];
  const sentenceMatch =
    String(sourceText || '').match(/[^.!\n]*Türk\s+hukuku[^.!\n]*/i) ||
    String(sourceText || '').match(/[^.!\n]*Turkish\s+law[^.!\n]*/i);
  const sentence = sentenceMatch ? sentenceMatch[0] : '';
  if (sentence && !new RegExp(`(?:madde|art\\.?)\\s*${n}\\b`, 'i').test(sentence)) {
    return phrase || '';
  }
  // No law sentence in text but Madde N claimed — prefer short phrase when present
  if (!sentence && phrase) return phrase;
  return cleaned;
}

function firstSentences(text, count = 2) {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw || isPlaceholderText(raw)) return '';
  const parts = raw.split(/(?<=[.!?])\s+/).filter(Boolean);
  const picked = (parts.length ? parts : [raw]).slice(0, count).join(' ').trim();
  return picked || raw;
}

function buildMinimalDecision({ score, risk, redFlags, summary, keyTakeaways }) {
  const flags = meaningfulRedFlags(redFlags);
  const reasons = [];
  const seen = new Set();
  for (const flag of flags) {
    if (reasons.length >= 3) break;
    const title = String(flag?.title || flag?.clauseTitle || '').replace(/\s+/g, ' ').trim();
    const issue = String(flag?.issue || flag?.explanation || flag?.description || '')
      .replace(/\s+/g, ' ')
      .trim();
    const issueOk = issue && !isPlaceholderText(issue) ? issue : '';
    const titleOk = title && !isPlaceholderText(title) ? title : '';
    const line = titleOk && issueOk ? `${titleOk}: ${issueOk}` : issueOk || titleOk;
    if (!line) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    reasons.push(line);
  }

  const summaryLead = firstSentences(summary, 2);
  const takeawayList = Array.isArray(keyTakeaways) ? keyTakeaways : [];
  const takeaway =
    takeawayList
      .map((item) =>
        (typeof item === 'string' ? item : String(item?.text || item?.title || '')).replace(/\s+/g, ' ').trim()
      )
      .find((item) => item && !isPlaceholderText(item)) || '';
  const flagIssue =
    flags
      .map((flag) =>
        String(flag?.issue || flag?.explanation || flag?.description || '').replace(/\s+/g, ' ').trim()
      )
      .find((item) => item && !isPlaceholderText(item)) || '';

  const scoreNum = Number(score) || 0;
  const riskLabel = String(risk || '').trim().toUpperCase();
  const scoreChip = [
    scoreNum > 0 ? `${scoreNum}/100` : '',
    /^(RED|YELLOW|GREEN)$/.test(riskLabel) ? riskLabel : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const headline = summaryLead || takeaway || flagIssue || scoreChip || reasons[0] || '';
  if (!headline && !reasons.length) return null;

  let estimatedHarm = '';
  if (scoreNum >= 0 && summaryLead) {
    const full = String(summary || '').replace(/\s+/g, ' ').trim();
    const rest = full.startsWith(summaryLead) ? full.slice(summaryLead.length).trim() : '';
    if (rest && !isPlaceholderText(rest)) estimatedHarm = firstSentences(rest, 1);
  }

  return {
    action: 'NEGOTIATE',
    headline,
    reasons,
    estimatedHarm,
    actionAdvice: '',
  };
}

export function normalizeContractRadar(raw, analysis = {}) {
  const src = asObject(raw?.contract_radar ?? raw?.contractRadar ?? analysis?.contractRadar) || {};
  const jurisdiction = asObject(analysis?.jurisdiction ?? raw?.jurisdiction);
  const trap = asObject(analysis?.trapCalendar ?? analysis?.trap_calendar ?? raw?.trap_calendar ?? raw?.trapCalendar);
  const termination = radarClean(
    trap?.termination?.date_or_rule ?? trap?.termination?.dateOrRule ?? trap?.termination
  );
  const hiddenNotice = radarClean(
    analysis?.hiddenCosts?.noticePeriodCost ??
      analysis?.hidden_costs?.notice_period_cost ??
      raw?.hiddenCosts?.noticePeriodCost
  );

  const sourceText =
    analysis?.contract_text ||
    analysis?.contractText ||
    raw?.contract_text ||
    raw?.contractText ||
    '';

  let parties = radarClean(src.parties);
  if (!partiesStringLooksValid(parties)) {
    parties = radarClean(extractRadarPartiesFromText(sourceText));
  }

  const fromRadarLaw = radarClean(src.governing_law_forum ?? src.governingLawForum);
  const lawParts = [radarClean(jurisdiction?.governingLaw), radarClean(jurisdiction?.country)].filter(
    Boolean
  );
  let governingLawForum = fromRadarLaw || lawParts.join(' · ');
  if (!governingLawForum) governingLawForum = radarClean(extractLawPhraseFromText(sourceText));
  governingLawForum = sanitizeGoverningLawForum(governingLawForum, sourceText);

  const durations = extractTrapDurations(sourceText || analysisSourceText(analysis));
  const durationNotice = radarClean(durations?.termination?.rule);

  const noticePeriod =
    radarClean(src.notice_period ?? src.noticePeriod) ||
    hiddenNotice ||
    termination ||
    durationNotice ||
    '';

  // Single-line forum only — never invent missing jurisdiction details.
  const forumLine = String(governingLawForum || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);

  return {
    parties: parties || '',
    governingLawForum: forumLine || '',
    noticePeriod: noticePeriod || '',
  };
}

// Supabase jsonb sütunu bazı kurulumlarda metin döndürebiliyor.
export function normalizeAnalysis(analysis) {
  if (!analysis) return null;

  const takeaways = parseMaybeJson(analysis.keyTakeaways ?? analysis.key_takeaways);
  const jurisdiction = asObject(analysis.jurisdiction);
  const decisionCard = asObject(analysis.decision_card ?? analysis.decisionCard);
  let decision = normalizeDecision(analysis.decision, decisionCard);
  const importantDates = asArray(analysis.importantDates ?? analysis.important_dates)
    .map(normalizeDeadlineEntry)
    .filter(Boolean);
  const contractEventsRaw = asArray(analysis.contract_events ?? analysis.contractEvents)
    .map(normalizeEvent)
    .filter(Boolean);
  const contractEvents = contractEventsRaw.length ? contractEventsRaw : datesToEvents(importantDates);
  const datesFromEvents = contractEvents.map(normalizeDeadlineEntry).filter(Boolean);
  let clauses = asArray(analysis.clauses).map(normalizeClause).filter(Boolean);
  if (!clauses.length) {
    clauses = synthesizeClauseCards(analysis).slice(0, 5);
  }
  const redFlags = asArray(analysis.redFlags ?? analysis.red_flags)
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return entry;
      return { ...entry, ...normalizeCounterOfferFields(entry) };
    })
    .filter(Boolean);
  const scoreNum = Number.isFinite(Number(analysis.score)) ? Number(analysis.score) : 0;
  const riskRaw = analysis.overallRisk || analysis.overall_risk || '';
  if (!decision) {
    decision = buildMinimalDecision({
      score: scoreNum,
      risk: riskRaw,
      redFlags,
      summary: analysis.summary,
      keyTakeaways: takeaways,
    });
  }
  const validityFromNew = asArray(analysis.validity_analysis ?? analysis.validityAnalysis)
    .map(normalizeValidity)
    .filter(Boolean);
  const validityFromInvalid = asArray(analysis.invalid_clauses ?? analysis.invalidClauses)
    .map(normalizeValidity)
    .filter(Boolean);
  const validityAnalysis = validityFromNew.length ? validityFromNew : validityFromInvalid;
  const proposals = asArray(analysis.counter_proposals ?? analysis.counterProposals)
    .map(normalizeProposal)
    .filter(Boolean);
  const counterMessage = String(analysis.counterMessage ?? analysis.counter_message ?? '').trim();
  const firstReady =
    proposals[0]?.readyToSendMessage?.whatsapp || proposals[0]?.readyToSendMessage?.email || '';
  const readyFallback = buildReadyToSendMessage({ decision, redFlags, clauses });
  const category =
    analysis.contractCategory ||
    analysis.contract_category ||
    analysis.detected_contract_category ||
    'general';
  const userCountry =
    analysis.analysisCountry ||
    analysis.jurisdiction?.country ||
    jurisdiction?.country ||
    'auto';
  const missingProtections = asArray(analysis.missing_protections ?? analysis.missingProtections)
    .map(normalizeMissingProtection)
    .filter(Boolean)
    .slice(0, 5);
  const lawyerQuestions = asArray(analysis.lawyer_questions ?? analysis.lawyerQuestions)
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 5);

  const base = {
    ...analysis,
    summary: String(analysis.summary || '').trim(),
    score: scoreNum,
    risk: riskRaw,
    clauses,
    redFlags,
    negotiationTips: asArray(analysis.negotiationTips ?? analysis.negotiation_tips),
    glossary: asArray(analysis.glossary),
    jurisdiction,
    keyTakeaways: Array.isArray(takeaways) ? takeaways : null,
    decision,
    decisionCard,
    counterMessage: counterMessage || firstReady || readyFallback,
    importantDates: importantDates.length ? importantDates : datesFromEvents,
    contractEvents,
    trapCalendar: asObject(analysis.trap_calendar ?? analysis.trapCalendar) || {},
    validityAnalysis,
    hiddenCosts: normalizeHiddenCosts(
      analysis.hidden_costs ?? analysis.hiddenCosts ?? analysis.hidden_costs_breakdown ?? analysis.financial_exposure
    ),
    counterProposals: proposals,
    obligations: asArray(analysis.obligations ?? analysis.obligations_checklist)
      .map(normalizeObligation)
      .filter(Boolean),
    integrityChecks: normalizeIntegrity(analysis.integrity_checks ?? analysis.integrityChecks),
    partyRole: analysis.partyRole || analysis.party_role || analysis.user_party_role || 'auto',
    contractCategory: category,
    audioScript: String(analysis.audio_script || analysis.audioScript || '').trim(),
    missingProtections,
    powerTilt: normalizePowerTilt(analysis.power_tilt ?? analysis.powerTilt),
    batnaLadder: asArray(analysis.batna_ladder ?? analysis.batnaLadder)
      .map(normalizeLadderStep)
      .filter(Boolean)
      .slice(0, 3),
    governingLawConflict: normalizeGoverningLawConflict(
      analysis.governing_law_conflict ?? analysis.governingLawConflict,
      userCountry
    ),
    lawyerQuestions,
    signConditions: normalizeSignConditions(
      analysis.sign_conditions ?? analysis.signConditions,
      category,
      userCountry
    ),
    signStatus: normalizeSignLights(analysis.sign_status ?? analysis.signStatus),
    contract_text: String(analysis.contract_text || analysis.contractText || '').trim(),
    contractText: String(analysis.contract_text || analysis.contractText || '').trim(),
    revised_contract_text: String(analysis.revised_contract_text || analysis.revisedContractText || '').trim(),
    revisedContractText: String(analysis.revised_contract_text || analysis.revisedContractText || '').trim(),
    lifecycle: analysis.lifecycle || 'draft',
    isPreview: false,
    lockedCounts: {
      redFlags: 0,
      clauses: 0,
      dates: 0,
      takeaways: 0,
      reasons: 0,
      validity: 0,
      proposals: 0,
      obligations: 0,
      hasCounterMessage: false,
      hasNegotiation: false,
      hasGlossary: false,
      hasHiddenCosts: false,
      hasIntegrity: false,
      missingAbsent: 0,
      ladder: 0,
      lawClash: 0,
      lawyerQuestions: 0,
      signLights: 0,
    },
  };

  return {
    ...base,
    contractRadar: normalizeContractRadar(analysis, base),
  };
}

// AI "keyTakeaways" döndürmezse en riskli 3 maddeden özet üretilir.
export function getKeyTakeaways(analysis) {
  const fromModel = (analysis?.keyTakeaways || [])
    .map((item) => (typeof item === 'string' ? item : String(item?.text || item?.title || '').trim()))
    .map((item) => String(item || '').trim())
    .filter((item) => item && !isPlaceholderText(item));
  if (fromModel.length) return fromModel.slice(0, 3);

  const order = { RED: 0, YELLOW: 1, GREEN: 2 };
  return [...(analysis?.clauses || [])]
    .sort((a, b) => (order[a.riskLevel] ?? 3) - (order[b.riskLevel] ?? 3))
    .map((clause) => String(clause.issue || clause.clauseTitle || '').trim())
    .filter((item) => item && !isPlaceholderText(item))
    .slice(0, 3);
}

export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const FROST_TRAP_DATES = [
  { label: '••••••••', date: '', kind: 'TERMINATION_WINDOW', note: '••••', placeholder: true },
  { label: '••••••••', date: '', kind: 'RENEWAL', note: '••••', placeholder: true },
  { label: '••••••••', date: '', kind: 'TRIAL_END', note: '••••', placeholder: true },
];

// Ücretsiz önizleme: karar kartı + 1 kırmızı bayrak açık kalır.
// Tuzak takvimi, kalan riskler ve hazır karşı teklif Pro'dadır.
export function applyFreePreview(analysis, isPro) {
  const full = normalizeAnalysis(analysis);
  if (!full || isPro) return full;

  const takeaways = getKeyTakeaways(full);
  const flags = meaningfulRedFlags(full.redFlags);
  const missingAbsent = (full.missingProtections || []).filter(
    (item) => item.status === 'ABSENT' || item.status === 'WEAK'
  ).length;
  const clash = full.governingLawConflict;

  return {
    ...full,
    isPreview: true,
    keyTakeaways: [],
    redFlags: flags.slice(0, 1),
    clauses: [],
    negotiationTips: [],
    glossary: [],
    counterMessage: '',
    importantDates: [],
    contractEvents: [],
    trapCalendar: {},
    validityAnalysis: [],
    counterProposals: [],
    obligations: [],
    hiddenCosts: {
      penaltyClauseAmount: '',
      depositRisk: '',
      autoRenewalCost: '',
      priceIncreaseCost: '',
      earlyTerminationFee: '',
      noticePeriodCost: '',
      interestOrDefault: '',
      horizonLabel: full.hiddenCosts?.horizonLabel || '',
      totalEstimatedLiability: full.hiddenCosts?.totalEstimatedLiability || '',
    },
    integrityChecks: null,
    integrity_checks: null,
    decision: full.decision,
    powerTilt: full.powerTilt,
    batnaLadder: [],
    missingProtections: (full.missingProtections || []).map((item) => ({
      playbookId: item.playbookId,
      status: item.status,
      statute: item.statute,
      severity: item.severity,
      whyItHurts: '',
      insertClause: '',
    })),
    lawyerQuestions: [],
    governingLawConflict: clash
      ? {
          hasClash: true,
          contractLaw: clash.contractLaw,
          userLaw: clash.userLaw,
          clauseRef: clash.clauseRef,
          effect: '',
        }
      : null,
    signConditions: full.signConditions,
    signStatus: null,
    lockedCounts: {
      redFlags: Math.max(0, flags.length - 1),
      clauses: (full.clauses || []).length,
      dates: Math.max((full.importantDates || []).length, (full.contractEvents || []).length, 3),
      takeaways: takeaways.length,
      reasons: 0,
      validity: (full.validityAnalysis || []).length,
      proposals: (full.counterProposals || []).length,
      obligations: (full.obligations || []).length,
      hasCounterMessage: Boolean(full.counterMessage || (full.counterProposals || []).length),
      hasNegotiation: (full.negotiationTips || []).length > 0,
      hasGlossary: (full.glossary || []).length > 0,
      hasHiddenCosts: hasHiddenCosts(full.hiddenCosts),
      hasIntegrity: integrityHasWarnings(full.integrityChecks),
      missingAbsent,
      ladder: (full.batnaLadder || []).length,
      lawClash: clash ? 1 : 0,
      lawyerQuestions: (full.lawyerQuestions || []).length,
      signLights: (full.signStatus?.lights || []).length,
    },
  };
}

export function summaryCopiesContract(summary, contractText) {
  const s = String(summary || '').replace(/\s+/g, ' ').trim();
  const c = String(contractText || '').replace(/\s+/g, ' ').trim();
  if (!s || s.length < 40 || !c) return false;
  const needle = s.slice(0, Math.min(160, s.length));
  if (c.slice(0, Math.max(s.length, 400)).startsWith(s.slice(0, Math.min(120, s.length)))) return true;
  if (s.length > 200 && c.slice(0, 1800).includes(needle)) return true;
  return false;
}

const realClauseCount = (parsed) =>
  (Array.isArray(parsed?.clauses) ? parsed.clauses : []).filter((item) => {
    const title = String(item?.clauseTitle || item?.clause_title || '').trim();
    const issue = String(item?.issue || item?.explanation || '').trim();
    if (isPlaceholderText(title) && isPlaceholderText(issue)) return false;
    return Boolean(title || issue);
  }).length;

export function isAcceptableAnalysis(parsed, contractText = '') {
  if (!parsed || typeof parsed !== 'object') return false;
  if (parsed.__parsePartial || parsed.__extractFallback) return false;
  const score = Number(parsed.score);
  if (!(score > 0)) return false;
  if (realClauseCount(parsed) < 3) return false;
  const summary = String(parsed.summary || '').trim();
  if (isPlaceholderText(summary) || summary.length < 24) return false;
  const source = contractText || parsed.contract_text || parsed.contractText || '';
  if (summaryCopiesContract(summary, source)) return false;
  return true;
}

export function isBillableAnalysis(data) {
  if (!data || typeof data !== 'object') return false;
  if (data.__parsePartial || data.__extractFallback || data.__fromCache) return false;
  return isAcceptableAnalysis(data, data.contract_text || data.contractText);
}
