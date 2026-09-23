/**
 * WAVE CC — Guided Draft registry (local templates, no LLM).
 * Body strings live in i18n.wavecc.js and use {{questionId}} placeholders.
 * fixedReferenceKey strings are the ONLY statute references a draft may carry;
 * they are reviewed here and must not be generated.
 */

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
    bodyTemplateKey: 'draftNoticeBody',
    fixedReferenceKey: 'draftNoticeRef',
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
    bodyTemplateKey: 'draftMediationBody',
    fixedReferenceKey: 'draftMediationRef',
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
    bodyTemplateKey: 'draftConsumerBody',
    fixedReferenceKey: 'draftConsumerRef',
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

export function draftForScenario(scenarioId, templateId) {
  if (!scenarioId) return null;
  return (
    SCENARIO_DRAFT_MAP[`${scenarioId}:${templateId || 'default'}`] ||
    SCENARIO_DRAFT_MAP[`${scenarioId}:*`] ||
    null
  );
}
