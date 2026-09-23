/**
 * WAVE CA′ — Scenario Legal Roadmaps (deterministic, local-only).
 * No LLM. No win-% / fake citations. Branches resolve by answer keys only.
 */

export const SCENARIO_IDS = [
  'labor_exit',
  'rent_arrears',
  'consumer_defect',
  'nda_breach_suspect',
  'unpaid_invoice_b2b',
];

const step = (n, titleKey, detailKey, timeHintKey, docHintKey) => ({
  stepNumber: n,
  titleKey,
  detailKey,
  ...(timeHintKey ? { timeHintKey } : {}),
  ...(docHintKey ? { docHintKey } : {}),
});

/** 3-step local template; docs reuse shared scenarioDoc* keys. */
const tpl = (prefix, lawyerKey, docs = []) => ({
  steps: [
    step(1, `${prefix}_s1_title`, `${prefix}_s1_detail`, 'scenarioTimeImmediate', docs[0] || 'scenarioDocMessages'),
    step(2, `${prefix}_s2_title`, `${prefix}_s2_detail`, 'scenarioTime7Days', docs[1] || 'scenarioDocContracts'),
    step(3, `${prefix}_s3_title`, `${prefix}_s3_detail`, 'scenarioTime30Days', docs[2] || 'scenarioDocId'),
  ],
  lawyerThresholdKey: lawyerKey,
  disclaimerKey: 'scenarioLegalDisclaimer',
});

/** Scenario content is jurisdiction-specific; other jurisdictions get the generic roadmap. */
export function isScenarioAvailableFor(scenario, jurisdiction) {
  return !!jurisdiction && (scenario?.jurisdictions || []).includes(jurisdiction);
}

export function resolveTemplateId(scenario, answers = {}) {
  const a = answers || {};
  const fn = scenario?.resolveBranch;
  if (typeof fn === 'function') {
    const key = fn(a);
    if (key && scenario.templates?.[key]) return key;
  }
  return 'default';
}

export const LEGAL_SCENARIOS = [
  {
    id: 'labor_exit',
    titleKey: 'scenarioLaborTitle',
    descriptionKey: 'scenarioLaborDesc',
    icon: 'briefcase-outline',
    jurisdictions: ['TR'],
    questions: [
      {
        id: 'tenure',
        labelKey: 'scenarioLaborQTenure',
        options: [
          { value: 'under1', labelKey: 'scenarioLaborOptUnder1' },
          { value: '1to5', labelKey: 'scenarioLaborOpt1to5' },
          { value: 'over5', labelKey: 'scenarioLaborOptOver5' },
        ],
      },
      {
        id: 'severance',
        labelKey: 'scenarioLaborQSeverance',
        options: [
          { value: 'paid', labelKey: 'scenarioLaborOptPaid' },
          { value: 'unpaid', labelKey: 'scenarioLaborOptUnpaid' },
          { value: 'partial', labelKey: 'scenarioLaborOptPartial' },
        ],
      },
      {
        id: 'notice',
        labelKey: 'scenarioLaborQNotice',
        options: [
          { value: 'yes', labelKey: 'scenarioLaborOptNoticeYes' },
          { value: 'no', labelKey: 'scenarioLaborOptNoticeNo' },
          { value: 'unknown', labelKey: 'scenarioLaborOptNoticeUnknown' },
        ],
      },
    ],
    resolveBranch: (a) => {
      if (a.severance === 'unpaid' && a.notice === 'no') return 'unpaid_no_notice';
      if (a.severance === 'unpaid' || a.severance === 'partial') return 'unpaid_claim';
      if (a.severance === 'paid') return 'paid_review';
      return 'default';
    },
    templates: {
      unpaid_no_notice: tpl('scenarioLaborUnpaidNoNotice', 'scenarioLaborLawyerUnpaid', [
        'scenarioDocPayslips',
        'scenarioDocContracts',
        'scenarioDocMessages',
      ]),
      unpaid_claim: tpl('scenarioLaborUnpaidClaim', 'scenarioLaborLawyerUnpaid', [
        'scenarioDocPayslips',
        'scenarioDocContracts',
        'scenarioDocBank',
      ]),
      paid_review: tpl('scenarioLaborPaidReview', 'scenarioLaborLawyerPaid', [
        'scenarioDocPayslips',
        'scenarioDocContracts',
        'scenarioDocMessages',
      ]),
      default: tpl('scenarioLaborDefault', 'scenarioLaborLawyerDefault', [
        'scenarioDocPayslips',
        'scenarioDocContracts',
        'scenarioDocId',
      ]),
    },
  },
  {
    id: 'rent_arrears',
    titleKey: 'scenarioRentTitle',
    descriptionKey: 'scenarioRentDesc',
    icon: 'home-outline',
    jurisdictions: ['TR'],
    questions: [
      {
        id: 'role',
        labelKey: 'scenarioRentQRole',
        options: [
          { value: 'tenant', labelKey: 'scenarioRentOptTenant' },
          { value: 'landlord', labelKey: 'scenarioRentOptLandlord' },
        ],
      },
      {
        id: 'months',
        labelKey: 'scenarioRentQMonths',
        options: [
          { value: '1', labelKey: 'scenarioRentOpt1m' },
          { value: '2to3', labelKey: 'scenarioRentOpt2to3' },
          { value: '4plus', labelKey: 'scenarioRentOpt4plus' },
        ],
      },
      {
        id: 'writtenNotice',
        labelKey: 'scenarioRentQNotice',
        options: [
          { value: 'yes', labelKey: 'scenarioRentOptNoticeYes' },
          { value: 'no', labelKey: 'scenarioRentOptNoticeNo' },
        ],
      },
    ],
    resolveBranch: (a) => {
      if (a.role === 'landlord') return a.months === '4plus' ? 'landlord_severe' : 'landlord_claim';
      return a.writtenNotice === 'yes' ? 'tenant_noticed' : 'tenant_protect';
    },
    templates: {
      landlord_severe: tpl('scenarioRentLandSevere', 'scenarioRentLawyerLand', [
        'scenarioDocLease',
        'scenarioDocBank',
        'scenarioDocMessages',
      ]),
      landlord_claim: tpl('scenarioRentLandClaim', 'scenarioRentLawyerLand', [
        'scenarioDocLease',
        'scenarioDocBank',
        'scenarioDocMessages',
      ]),
      tenant_noticed: tpl('scenarioRentTenantNoticed', 'scenarioRentLawyerTenant', [
        'scenarioDocLease',
        'scenarioDocMessages',
        'scenarioDocBank',
      ]),
      tenant_protect: tpl('scenarioRentTenantProtect', 'scenarioRentLawyerTenant', [
        'scenarioDocLease',
        'scenarioDocBank',
        'scenarioDocMessages',
      ]),
      default: tpl('scenarioRentTenantProtect', 'scenarioRentLawyerTenant', [
        'scenarioDocLease',
        'scenarioDocBank',
        'scenarioDocMessages',
      ]),
    },
  },
  {
    id: 'consumer_defect',
    titleKey: 'scenarioConsumerTitle',
    descriptionKey: 'scenarioConsumerDesc',
    icon: 'cart-outline',
    jurisdictions: ['TR'],
    questions: [
      {
        id: 'kind',
        labelKey: 'scenarioConsumerQKind',
        options: [
          { value: 'goods', labelKey: 'scenarioConsumerOptGoods' },
          { value: 'service', labelKey: 'scenarioConsumerOptService' },
        ],
      },
      {
        id: 'warranty',
        labelKey: 'scenarioConsumerQWarranty',
        options: [
          { value: 'yes', labelKey: 'scenarioConsumerOptWarrantyYes' },
          { value: 'no', labelKey: 'scenarioConsumerOptWarrantyNo' },
          { value: 'unknown', labelKey: 'scenarioConsumerOptWarrantyUnk' },
        ],
      },
      {
        id: 'seller',
        labelKey: 'scenarioConsumerQSeller',
        options: [
          { value: 'ignored', labelKey: 'scenarioConsumerOptIgnored' },
          { value: 'refused', labelKey: 'scenarioConsumerOptRefused' },
          { value: 'partial', labelKey: 'scenarioConsumerOptPartial' },
        ],
      },
    ],
    resolveBranch: (a) => {
      if (a.seller === 'ignored' || a.seller === 'refused') return 'escalate';
      return 'negotiate';
    },
    templates: {
      escalate: tpl('scenarioConsumerEscalate', 'scenarioConsumerLawyer', [
        'scenarioDocInvoice',
        'scenarioDocPhotos',
        'scenarioDocMessages',
      ]),
      negotiate: tpl('scenarioConsumerNegotiate', 'scenarioConsumerLawyer', [
        'scenarioDocInvoice',
        'scenarioDocPhotos',
        'scenarioDocMessages',
      ]),
      default: tpl('scenarioConsumerNegotiate', 'scenarioConsumerLawyer', [
        'scenarioDocInvoice',
        'scenarioDocPhotos',
        'scenarioDocMessages',
      ]),
    },
  },
  {
    id: 'nda_breach_suspect',
    titleKey: 'scenarioNdaTitle',
    descriptionKey: 'scenarioNdaDesc',
    icon: 'lock-closed-outline',
    jurisdictions: ['TR'],
    questions: [
      {
        id: 'evidence',
        labelKey: 'scenarioNdaQEvidence',
        options: [
          { value: 'strong', labelKey: 'scenarioNdaOptStrong' },
          { value: 'weak', labelKey: 'scenarioNdaOptWeak' },
          { value: 'none', labelKey: 'scenarioNdaOptNone' },
        ],
      },
      {
        id: 'stillBound',
        labelKey: 'scenarioNdaQBound',
        options: [
          { value: 'yes', labelKey: 'scenarioNdaOptBoundYes' },
          { value: 'no', labelKey: 'scenarioNdaOptBoundNo' },
        ],
      },
      {
        id: 'urgency',
        labelKey: 'scenarioNdaQUrgency',
        options: [
          { value: 'ongoing', labelKey: 'scenarioNdaOptOngoing' },
          { value: 'past', labelKey: 'scenarioNdaOptPast' },
        ],
      },
    ],
    resolveBranch: (a) => {
      if (a.evidence === 'strong' && a.urgency === 'ongoing') return 'preserve_urgent';
      if (a.evidence === 'none') return 'preserve_first';
      return 'notice_path';
    },
    templates: {
      preserve_urgent: tpl('scenarioNdaUrgent', 'scenarioNdaLawyer', [
        'scenarioDocEvidence',
        'scenarioDocContracts',
        'scenarioDocMessages',
      ]),
      preserve_first: tpl('scenarioNdaPreserve', 'scenarioNdaLawyer', [
        'scenarioDocEvidence',
        'scenarioDocContracts',
        'scenarioDocMessages',
      ]),
      notice_path: tpl('scenarioNdaNotice', 'scenarioNdaLawyer', [
        'scenarioDocContracts',
        'scenarioDocEvidence',
        'scenarioDocMessages',
      ]),
      default: tpl('scenarioNdaPreserve', 'scenarioNdaLawyer', [
        'scenarioDocEvidence',
        'scenarioDocContracts',
        'scenarioDocMessages',
      ]),
    },
  },
  {
    id: 'unpaid_invoice_b2b',
    titleKey: 'scenarioInvoiceTitle',
    descriptionKey: 'scenarioInvoiceDesc',
    icon: 'receipt-outline',
    jurisdictions: ['TR'],
    questions: [
      {
        id: 'amount',
        labelKey: 'scenarioInvoiceQAmount',
        options: [
          { value: 'small', labelKey: 'scenarioInvoiceOptSmall' },
          { value: 'medium', labelKey: 'scenarioInvoiceOptMedium' },
          { value: 'large', labelKey: 'scenarioInvoiceOptLarge' },
        ],
      },
      {
        id: 'demand',
        labelKey: 'scenarioInvoiceQDemand',
        options: [
          { value: 'yes', labelKey: 'scenarioInvoiceOptDemandYes' },
          { value: 'no', labelKey: 'scenarioInvoiceOptDemandNo' },
        ],
      },
      {
        id: 'disputed',
        labelKey: 'scenarioInvoiceQDisputed',
        options: [
          { value: 'yes', labelKey: 'scenarioInvoiceOptDisputedYes' },
          { value: 'no', labelKey: 'scenarioInvoiceOptDisputedNo' },
        ],
      },
    ],
    resolveBranch: (a) => {
      if (a.disputed === 'yes') return 'disputed';
      if (a.demand === 'no') return 'demand_first';
      return a.amount === 'large' ? 'formal_large' : 'formal_std';
    },
    templates: {
      disputed: tpl('scenarioInvoiceDisputed', 'scenarioInvoiceLawyer', [
        'scenarioDocInvoice',
        'scenarioDocContracts',
        'scenarioDocMessages',
      ]),
      demand_first: tpl('scenarioInvoiceDemand', 'scenarioInvoiceLawyer', [
        'scenarioDocInvoice',
        'scenarioDocBank',
        'scenarioDocContracts',
      ]),
      formal_large: tpl('scenarioInvoiceLarge', 'scenarioInvoiceLawyer', [
        'scenarioDocInvoice',
        'scenarioDocContracts',
        'scenarioDocBank',
      ]),
      formal_std: tpl('scenarioInvoiceStd', 'scenarioInvoiceLawyer', [
        'scenarioDocInvoice',
        'scenarioDocContracts',
        'scenarioDocBank',
      ]),
      default: tpl('scenarioInvoiceDemand', 'scenarioInvoiceLawyer', [
        'scenarioDocInvoice',
        'scenarioDocBank',
        'scenarioDocContracts',
      ]),
    },
  },
];

export function getScenarioById(id) {
  return (LEGAL_SCENARIOS || []).find((item) => item.id === id) || null;
}
