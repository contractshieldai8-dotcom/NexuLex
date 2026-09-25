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

/**
 * JP.2 — Universal letters: one neutral structure (parties / facts / request / deadline / signature),
 * offered in every country. No statutes, no institutions, no country-specific variants until a pack is verified.
 * `choice` questions store an option id; the letter shows that option's label.
 */
const universal = (id, icon, questions) => ({
  id,
  titleKey: `draftU_${id}_title`,
  descriptionKey: `draftU_${id}_desc`,
  icon,
  universal: true,
  jurisdictions: [],
  packs: {},
  generic: { bodyTemplateKey: `draftU_${id}_body` },
  disclaimerKey: DRAFT_DISCLAIMER_KEY,
  questions,
});

const Q = {
  from: { id: 'from', labelKey: 'draftQFrom', type: 'text', required: true },
  to: { id: 'to', labelKey: 'draftQTo', type: 'text', required: true },
};

export const UNIVERSAL_DRAFT_TEMPLATES = [
  universal('termination_notice', 'exit-outline', [
    Q.from,
    Q.to,
    {
      id: 'contractType',
      labelKey: 'draftQContractType',
      type: 'choice',
      required: true,
      options: [
        { id: 'lease', labelKey: 'draftOptContractLease' },
        { id: 'service', labelKey: 'draftOptContractService' },
        { id: 'employment', labelKey: 'draftOptContractEmployment' },
        { id: 'other', labelKey: 'draftOptContractOther' },
      ],
    },
    { id: 'contractRef', labelKey: 'draftQContractRef', type: 'text', required: true },
    { id: 'endDate', labelKey: 'draftQEndDate', type: 'date', required: true },
    { id: 'reason', labelKey: 'draftQReasonOptional', type: 'multiline', required: false },
  ]),
  universal('deposit_return_request', 'wallet-outline', [
    Q.from,
    Q.to,
    { id: 'property', labelKey: 'draftQProperty', type: 'text', required: true },
    { id: 'depositAmount', labelKey: 'draftQDepositAmount', type: 'text', required: true },
    { id: 'handoverDate', labelKey: 'draftQHandoverDate', type: 'date', required: true },
    { id: 'paymentDetails', labelKey: 'draftQPaymentDetails', type: 'text', required: false },
    { id: 'deadlineDays', labelKey: 'draftQDeadlineDays', type: 'number', required: false },
  ]),
  universal('repair_or_defect_notice', 'construct-outline', [
    Q.from,
    Q.to,
    { id: 'item', labelKey: 'draftQDefectItem', type: 'text', required: true },
    { id: 'problem', labelKey: 'draftQProblem', type: 'multiline', required: true },
    { id: 'noticedDate', labelKey: 'draftQNoticedDate', type: 'date', required: false },
    { id: 'deadlineDays', labelKey: 'draftQReplyDays', type: 'number', required: false },
  ]),
  universal('rent_increase_objection', 'home-outline', [
    Q.from,
    Q.to,
    { id: 'property', labelKey: 'draftQProperty', type: 'text', required: true },
    { id: 'currentRent', labelKey: 'draftQCurrentRent', type: 'text', required: true },
    { id: 'proposedRent', labelKey: 'draftQProposedRent', type: 'text', required: true },
    { id: 'noticeDate', labelKey: 'draftQIncreaseNoticeDate', type: 'date', required: false },
    { id: 'counterOffer', labelKey: 'draftQCounterOffer', type: 'text', required: false },
  ]),
  universal('unpaid_wages_request', 'cash-outline', [
    Q.from,
    Q.to,
    { id: 'period', labelKey: 'draftQWagePeriod', type: 'text', required: true },
    { id: 'unpaidAmount', labelKey: 'draftQUnpaidAmount', type: 'text', required: true },
    { id: 'details', labelKey: 'draftQWageDetails', type: 'multiline', required: true },
    { id: 'deadlineDays', labelKey: 'draftQDeadlineDays', type: 'number', required: false },
  ]),
  universal('personal_data_access_request', 'shield-checkmark-outline', [
    Q.from,
    { id: 'to', labelKey: 'draftQDataHolder', type: 'text', required: true },
    { id: 'accountRef', labelKey: 'draftQAccountRef', type: 'text', required: true },
    { id: 'replyTo', labelKey: 'draftQReplyTo', type: 'text', required: true },
    { id: 'scope', labelKey: 'draftQDataScope', type: 'multiline', required: false },
  ]),
  universal('cancellation_request', 'close-circle-outline', [
    Q.from,
    Q.to,
    { id: 'contractRef', labelKey: 'draftQOrderRef', type: 'text', required: true },
    { id: 'purchaseDate', labelKey: 'draftQPurchaseDate', type: 'date', required: false },
    { id: 'cancelDate', labelKey: 'draftQCancelDate', type: 'date', required: true },
    { id: 'request', labelKey: 'draftQCancelRequest', type: 'text', required: false },
  ]),
];

export const UNIVERSAL_DRAFT_IDS = UNIVERSAL_DRAFT_TEMPLATES.map((item) => item.id);

/** Every template the app knows (legacy jurisdiction-aware + universal). */
export const DRAFT_CATALOG = [...DRAFT_TEMPLATES, ...UNIVERSAL_DRAFT_TEMPLATES];

export function getDraftTemplateById(id) {
  return DRAFT_CATALOG.find((item) => item.id === id) || null;
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
    universal: !!template.universal,
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

/** Legacy offer list followed by the universal letters (same shape). */
export function listDraftCatalogFor({ country, language } = {}) {
  const jurisdiction = resolveJurisdiction(country, language);
  return [
    ...listDraftTemplatesFor({ country, language }),
    ...UNIVERSAL_DRAFT_TEMPLATES.map((template) => ({ template, variant: resolveDraftVariant(template, jurisdiction) })),
  ];
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
