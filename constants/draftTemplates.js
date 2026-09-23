/**
 * WAVE CC / CB.1 — Guided Draft registry (local templates, no LLM).
 * Body strings live in i18n and use {{questionId}} placeholders.
 * Statute references exist only under a reviewed jurisdiction pack (packs.TR.fixedReferenceKey);
 * other jurisdictions get the neutral `generic` letter (no statutes, no local institutions)
 * or nothing at all when `generic` is null.
 */

import { resolveJurisdiction } from './jurisdiction';

export const DRAFT_TEMPLATE_IDS = ['notice_payment', 'mediation_application', 'consumer_complaint'];

/** Free tier sees only this many body lines before the Pro lock. */
export const DRAFT_FREE_PREVIEW_LINES = 8;

export const DRAFT_DISCLAIMER_KEY = 'draftDisclaimer';

export const DRAFT_TEMPLATES = [
  {
    id: 'notice_payment',
    titleKey: 'draftNoticeTitle',
    descriptionKey: 'draftNoticeDesc',
    icon: 'mail-unread-outline',
    jurisdictions: ['TR'],
    packs: {
      TR: { bodyTemplateKey: 'draftNoticeBody', fixedReferenceKey: 'draftNoticeRef' },
    },
    generic: { bodyTemplateKey: 'draftNoticeGenericBody' },
    disclaimerKey: DRAFT_DISCLAIMER_KEY,
    questions: [
      { id: 'sender', labelKey: 'draftQSender', type: 'text', required: true },
      { id: 'recipient', labelKey: 'draftQRecipient', type: 'text', required: true },
      { id: 'basis', labelKey: 'draftQBasis', type: 'multiline', required: true },
      { id: 'amount', labelKey: 'draftQAmount', type: 'number', required: true },
      { id: 'dueDate', labelKey: 'draftQDueDate', type: 'date', required: false },
      { id: 'deadlineDays', labelKey: 'draftQDeadlineDays', type: 'number', required: false },
    ],
  },
  {
    id: 'mediation_application',
    titleKey: 'draftMediationTitle',
    descriptionKey: 'draftMediationDesc',
    icon: 'people-outline',
    jurisdictions: ['TR'],
    packs: {
      TR: { bodyTemplateKey: 'draftMediationBody', fixedReferenceKey: 'draftMediationRef' },
    },
    generic: null,
    disclaimerKey: DRAFT_DISCLAIMER_KEY,
    questions: [
      { id: 'applicant', labelKey: 'draftQApplicant', type: 'text', required: true },
      { id: 'respondent', labelKey: 'draftQRespondent', type: 'text', required: true },
      { id: 'disputeType', labelKey: 'draftQDisputeType', type: 'text', required: true },
      { id: 'summary', labelKey: 'draftQSummary', type: 'multiline', required: true },
      { id: 'amount', labelKey: 'draftQAmountOptional', type: 'number', required: false },
      { id: 'city', labelKey: 'draftQCity', type: 'text', required: false },
    ],
  },
  {
    id: 'consumer_complaint',
    titleKey: 'draftConsumerTitle',
    descriptionKey: 'draftConsumerDesc',
    icon: 'cart-outline',
    jurisdictions: ['TR'],
    packs: {
      TR: { bodyTemplateKey: 'draftConsumerBody', fixedReferenceKey: 'draftConsumerRef' },
    },
    generic: {
      titleKey: 'draftGenericSettlementTitle',
      descriptionKey: 'draftGenericSettlementDesc',
      bodyTemplateKey: 'draftConsumerGenericBody',
    },
    disclaimerKey: DRAFT_DISCLAIMER_KEY,
    questions: [
      { id: 'consumer', labelKey: 'draftQConsumer', type: 'text', required: true },
      { id: 'seller', labelKey: 'draftQSeller', type: 'text', required: true },
      { id: 'product', labelKey: 'draftQProduct', type: 'text', required: true },
      { id: 'purchaseDate', labelKey: 'draftQPurchaseDate', type: 'date', required: false },
      { id: 'problem', labelKey: 'draftQProblem', type: 'multiline', required: true },
      { id: 'request', labelKey: 'draftQRequest', type: 'text', required: true },
    ],
  },
];

export function getDraftTemplateById(id) {
  return DRAFT_TEMPLATES.find((item) => item.id === id) || null;
}

/**
 * Which variant of a template applies for a resolved jurisdiction.
 * @returns {{ generic: boolean, jurisdiction: string|null, titleKey: string, descriptionKey: string,
 *   bodyTemplateKey: string, fixedReferenceKey: string|null } | null} null → not offered here.
 */
export function resolveDraftVariant(template, jurisdiction) {
  if (!template) return null;
  const pack = jurisdiction && (template.jurisdictions || []).includes(jurisdiction)
    ? template.packs?.[jurisdiction]
    : null;
  if (pack) {
    return {
      generic: false,
      jurisdiction,
      titleKey: template.titleKey,
      descriptionKey: template.descriptionKey,
      bodyTemplateKey: pack.bodyTemplateKey,
      fixedReferenceKey: pack.fixedReferenceKey || null,
    };
  }
  if (!template.generic) return null;
  return {
    generic: true,
    jurisdiction: jurisdiction || null,
    titleKey: template.generic.titleKey || template.titleKey,
    descriptionKey: template.generic.descriptionKey || template.descriptionKey,
    bodyTemplateKey: template.generic.bodyTemplateKey,
    fixedReferenceKey: null,
  };
}

export function isDraftAvailable(templateId, jurisdiction) {
  return !!resolveDraftVariant(getDraftTemplateById(templateId), jurisdiction);
}

/** Templates offered for a country/language pair, each with its resolved variant. */
export function listDraftTemplatesFor({ country, language } = {}) {
  const jurisdiction = resolveJurisdiction(country, language);
  return DRAFT_TEMPLATES.map((template) => ({ template, variant: resolveDraftVariant(template, jurisdiction) }))
    .filter((item) => !!item.variant);
}

/**
 * CA′ roadmap → matching draft. Keys are `${scenarioId}:${templateId}` or `${scenarioId}:*`.
 * Branches without a sensible document (e.g. tenant defence) return null.
 */
const SCENARIO_DRAFT_MAP = {
  'labor_exit:*': 'mediation_application',
  'rent_arrears:landlord_severe': 'notice_payment',
  'rent_arrears:landlord_claim': 'notice_payment',
  'consumer_defect:*': 'consumer_complaint',
  'unpaid_invoice_b2b:disputed': 'mediation_application',
  'unpaid_invoice_b2b:*': 'notice_payment',
};

/** Only returns a draft that is actually offered for the resolved jurisdiction. */
export function draftForScenario(scenarioId, templateId, jurisdiction) {
  if (!scenarioId) return null;
  const id =
    SCENARIO_DRAFT_MAP[`${scenarioId}:${templateId || 'default'}`] ||
    SCENARIO_DRAFT_MAP[`${scenarioId}:*`] ||
    null;
  return id && isDraftAvailable(id, jurisdiction) ? id : null;
}
