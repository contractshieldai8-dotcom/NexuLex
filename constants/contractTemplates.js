/**
 * WAVE CL.1 - Contract Library.
 *
 * Attorney-drafted business contracts from General Legal's public template library (CC0-1.0, vendored by
 * scripts/sync-legal-templates.js, see constants/contractLibrary/source.js). The contract body is kept in the
 * binding English original; only the form (labels, guidance, disclaimers) is translated into the app languages.
 * Filling is 100% local and deterministic: no network, no LLM. Unanswered fields stay as visible "[ ... ]" blanks
 * (or underscored signature lines); nothing is invented.
 *
 * Each template declares:
 *   fields : ordered answer ids shown in the form (labels = i18n `clField_<id>`),
 *   required : ids that must be filled before the draft is considered complete,
 *   rules  : literal find/replace edits against the vendored Markdown (each `find` must exist exactly once unless
 *            `all: true`; scripts/test-contract-library.mjs enforces that),
 *   numbering : 'continuous' when the upstream Markdown restarts "1." after paragraphs (NDAs, advisor),
 *               'native' when the numbers in the source are meaningful (MSA, DPA).
 * Rule `apply(g)` helpers: g.val(id) value or "[ Blank ]", g.opt(id, fallback, format) value or the original text,
 * g.line(id) value or a signature underscore line.
 */

/** Free users read the first N blocks of the filled document; copy / share / DOCX are Pro. */
export const CONTRACT_FREE_PREVIEW_BLOCKS = 6;

export const CONTRACT_SIGNATURE_LINE = '____________________';

/** type: text | multiline | date | number | email. `blank` is the English name shown inside the document. */
export const CONTRACT_FIELDS = {
  companyName: { type: 'text', blank: 'Company name' },
  companyEntity: { type: 'text', blank: 'Company entity description' },
  counterpartyName: { type: 'text', blank: 'Other party name' },
  effectiveDate: { type: 'date', blank: 'Effective Date' },
  governingLaw: { type: 'text', blank: 'Governing law' },
  arbitrationSeat: { type: 'text', blank: 'Arbitration seat' },
  companyAddress: { type: 'multiline', blank: 'Company address' },
  counterpartyAddress: { type: 'multiline', blank: 'Other party address' },
  companyEmail: { type: 'email', blank: 'Company email' },
  companyContact: { type: 'text', blank: 'Data protection contact' },
  counterpartyContact: { type: 'text', blank: 'Customer data protection contact' },
  signerName: { type: 'text', blank: 'Signatory name' },
  signerTitle: { type: 'text', blank: 'Signatory title' },
  permittedUse: { type: 'text', blank: 'Permitted purpose' },
  riderName: { type: 'text', blank: 'Supplemental terms document' },
  userBlock: { type: 'number', blank: 'number of users' },
  services: { type: 'multiline', blank: 'describe services' },
  serviceDates: { type: 'text', blank: 'dates of services' },
  competingField: { type: 'text', blank: 'field of business' },
  optionShares: { type: 'number', blank: 'number of shares' },
  vestingYears: { type: 'number', blank: 'years' },
  vestingMonths: { type: 'number', blank: 'months' },
  agreementName: { type: 'text', blank: 'Customer Agreement' },
  agreementDate: { type: 'date', blank: 'Agreement date' },
  companyActivities: { type: 'multiline', blank: 'Provider activities' },
  subprocessorSite: { type: 'text', blank: 'Subprocessor website' },
  subprocessorList: { type: 'multiline', blank: 'Subprocessor list' },
  siteDomain: { type: 'text', blank: 'Website address' },
  privacyUrl: { type: 'text', blank: 'Privacy policy URL' },
  businessDescription: { type: 'text', blank: 'Business description' },
  companyPhone: { type: 'text', blank: 'Phone number' },
  courtVenue: { type: 'text', blank: 'Court location' },
};

const SIG = CONTRACT_SIGNATURE_LINE;
const DELAWARE_LAW = 'the State of Delaware';
/** Postal addresses sit inside single-line sentences / list items of the web documents. */
const oneLine = (value) => String(value).replace(/\s*\n+\s*/g, ', ');
const yearOf = (g) => (String(g.values.effectiveDate || '').match(/\b(\d{4})\b/) || [])[1] || '[ Year ]';

export const CONTRACT_LIBRARY = [
  {
    id: 'mutual_nda',
    slug: 'mutual-nda',
    icon: 'git-compare-outline',
    category: 'confidentiality',
    titleKey: 'clTitle_mutual_nda',
    descriptionKey: 'clDesc_mutual_nda',
    assumptionKey: 'clAssume_mutual_nda',
    documentTitle: 'Mutual Non-Disclosure Agreement',
    numbering: 'continuous',
    fields: [
      'companyName',
      'companyEntity',
      'counterpartyName',
      'effectiveDate',
      'governingLaw',
      'companyAddress',
      'companyEmail',
      'signerName',
      'signerTitle',
      'counterpartyAddress',
    ],
    required: ['companyName', 'counterpartyName', 'effectiveDate'],
    rules: [
      { find: '<mark>[Company</mark>]', apply: (g) => g.val('companyName') },
      { find: 'a Delaware corporation', apply: (g) => g.opt('companyEntity', 'a Delaware corporation') },
      { find: '<mark>__________, 2026__</mark>', apply: (g) => g.val('effectiveDate') },
      { find: DELAWARE_LAW, apply: (g) => g.opt('governingLaw', DELAWARE_LAW) },
      {
        find: '- [Company]\n- By:\n- Name:\n- Title:\n- Email:\n- []\n- Address:\n- [Address]',
        apply: (g) =>
          [
            `- ${g.val('companyName')}`,
            `- By: ${SIG}`,
            `- Name: ${g.line('signerName')}`,
            `- Title: ${g.line('signerTitle')}`,
            `- Email: ${g.line('companyEmail')}`,
            `- Address: ${g.line('companyAddress')}`,
          ].join('\n'),
      },
      {
        find: '- Name of Other Signatory (Please Print)\n- Signature\n- Title (if applicable)\n- Email:\n- Address:',
        apply: (g) =>
          [
            `- Name of Other Signatory: ${g.line('counterpartyName')}`,
            `- Signature: ${SIG}`,
            `- Title (if applicable): ${SIG}`,
            `- Email: ${SIG}`,
            `- Address: ${g.line('counterpartyAddress')}`,
          ].join('\n'),
      },
    ],
  },
  {
    id: 'one_way_nda',
    slug: 'one-way-nda',
    icon: 'arrow-forward-circle-outline',
    category: 'confidentiality',
    titleKey: 'clTitle_one_way_nda',
    descriptionKey: 'clDesc_one_way_nda',
    assumptionKey: 'clAssume_one_way_nda',
    documentTitle: 'Non-Disclosure Agreement (One-Way)',
    numbering: 'continuous',
    fields: ['companyName', 'counterpartyName', 'permittedUse', 'governingLaw', 'signerName', 'signerTitle'],
    required: ['companyName', 'counterpartyName'],
    rules: [
      { find: '**[<mark>___</mark>]**', apply: (g) => g.val('companyName') },
      {
        find: '[<mark>enable Recipient</mark> to <mark>evaluate or pursue a business relationship with the Company</mark>]',
        apply: (g) =>
          g.opt(
            'permittedUse',
            'enable Recipient to evaluate or pursue a business relationship with the Company',
            (v) => `enable Recipient to ${v}`
          ),
      },
      { find: DELAWARE_LAW, apply: (g) => g.opt('governingLaw', DELAWARE_LAW) },
      {
        find:
          '- [Company Name]\n- By:\n- Name:\n- Title (if any):\n**RECIPIENT**\n- Recipient Name (print)\n- Signature\n- Title (optional)',
        apply: (g) =>
          [
            `- ${g.val('companyName')}`,
            `- By: ${SIG}`,
            `- Name: ${g.line('signerName')}`,
            `- Title (if any): ${g.line('signerTitle')}`,
            '**RECIPIENT**',
            `- Recipient Name: ${g.line('counterpartyName')}`,
            `- Signature: ${SIG}`,
            `- Title (optional): ${SIG}`,
          ].join('\n'),
      },
    ],
  },
  {
    id: 'master_services_agreement',
    slug: 'master-services-agreement',
    icon: 'briefcase-outline',
    category: 'commercial',
    titleKey: 'clTitle_master_services_agreement',
    descriptionKey: 'clDesc_master_services_agreement',
    assumptionKey: 'clAssume_master_services_agreement',
    documentTitle: 'Master Services Agreement',
    numbering: 'native',
    fields: [
      'companyName',
      'counterpartyName',
      'effectiveDate',
      'governingLaw',
      'arbitrationSeat',
      'companyEmail',
      'companyAddress',
      'riderName',
      'userBlock',
    ],
    required: ['companyName', 'counterpartyName', 'effectiveDate', 'companyEmail'],
    rules: [
      { find: 'made and entered into on [<mark>__________</mark>]', apply: (g) => `made and entered into on ${g.val('effectiveDate')}` },
      { find: '<mark>[Company]</mark> (**"Company"**)', apply: (g) => `${g.val('companyName')} (**"Company"**)` },
      { find: '<mark>[Customer]</mark> ("**Customer**")', apply: (g) => `${g.val('counterpartyName')} ("**Customer**")` },
      { find: 'the State of [<mark>Delaware</mark>]', apply: (g) => g.opt('governingLaw', 'the State of Delaware') },
      { find: '[<mark>New Castle County, Delaware</mark>]', apply: (g) => g.opt('arbitrationSeat', 'New Castle County, Delaware') },
      { find: '<mark>[Company Email Address]</mark>', all: true, apply: (g) => g.val('companyEmail') },
      {
        find: '<mark>[Company]</mark>\t\t<mark>[Customer]</mark>',
        apply: (g) => `${g.val('companyName')}\t\t${g.val('counterpartyName')}`,
      },
      {
        find: '| [Company] Address:  Email Address: |',
        apply: (g) => `| ${g.val('companyName')} Address: ${g.line('companyAddress')} Email Address: ${g.line('companyEmail')} |`,
      },
      {
        find: '**Customer: <mark>________________________________</mark>** **Company: <mark>_____________________________</mark>**',
        apply: (g) => `**Customer: ${g.line('counterpartyName')}** **Company: ${g.line('companyName')}**`,
      },
      { find: '[User Number]', all: true, apply: (g) => g.val('userBlock') },
      { find: '<mark>[Rider to Form]</mark>', apply: (g) => g.val('riderName') },
    ],
  },
  {
    id: 'advisor_agreement',
    slug: 'advisor-agreement',
    icon: 'people-outline',
    category: 'equity',
    titleKey: 'clTitle_advisor_agreement',
    descriptionKey: 'clDesc_advisor_agreement',
    assumptionKey: 'clAssume_advisor_agreement',
    documentTitle: 'Advisor Agreement',
    numbering: 'continuous',
    nexulexAddedParts: true,
    fields: [
      'companyName',
      'counterpartyName',
      'effectiveDate',
      'services',
      'serviceDates',
      'competingField',
      'optionShares',
      'vestingYears',
      'vestingMonths',
      'signerName',
      'signerTitle',
    ],
    required: ['companyName', 'counterpartyName', 'effectiveDate', 'services', 'serviceDates'],
    // The upstream text starts at clause 1 and never names the parties or the Effective Date it relies on.
    // NexuLex adds only this neutral cover paragraph and a signature block; clauses 1-7 stay untouched.
    prefix: (g) =>
      `**ADVISOR AGREEMENT**\n\nThis Advisor Agreement (the "**Agreement**") is entered into as of ${g.val('effectiveDate')} (the "**Effective Date**") between ${g.val('companyName')} ("**Company**") and ${g.val('counterpartyName')} ("**Advisor**").\n\n`,
    suffix: (g) =>
      [
        '',
        '---',
        '**Signature Block**',
        '',
        '**COMPANY**',
        `- ${g.val('companyName')}`,
        `- By: ${SIG}`,
        `- Name: ${g.line('signerName')}`,
        `- Title: ${g.line('signerTitle')}`,
        `- Date: ${SIG}`,
        '',
        '**ADVISOR**',
        `- Name: ${g.val('counterpartyName')}`,
        `- Signature: ${SIG}`,
        `- Date: ${SIG}`,
        '',
      ].join('\n'),
    rules: [
      { find: '<mark>[(describe services)]</mark>', apply: (g) => g.val('services') },
      { find: '<mark>[(provide dates of services)]</mark>', apply: (g) => g.val('serviceDates') },
      { find: 'the field of <mark>___________</mark>', apply: (g) => `the field of ${g.val('competingField')}` },
      { find: 'purchase <mark>[__]</mark> shares', apply: (g) => `purchase ${g.val('optionShares')} shares` },
      { find: 'a <mark>_____</mark> year vesting schedule', apply: (g) => `a ${g.val('vestingYears')} year vesting schedule` },
      {
        find: 'in a series of <mark>_____</mark> successive',
        apply: (g) => `in a series of ${g.val('vestingMonths')} successive`,
      },
    ],
  },
  {
    id: 'dpa_global',
    slug: 'dpa-global',
    icon: 'lock-closed-outline',
    category: 'privacy',
    titleKey: 'clTitle_dpa_global',
    descriptionKey: 'clDesc_dpa_global',
    assumptionKey: 'clAssume_dpa_global',
    documentTitle: 'Data Processing Addendum',
    numbering: 'native',
    fields: [
      'companyName',
      'counterpartyName',
      'agreementName',
      'agreementDate',
      'companyAddress',
      'companyContact',
      'companyActivities',
      'counterpartyAddress',
      'counterpartyContact',
      'subprocessorSite',
      'subprocessorList',
    ],
    required: ['companyName', 'counterpartyName', 'agreementName', 'agreementDate', 'companyContact'],
    rules: [
      { find: '[<mark>CompanyName</mark>]', all: true, apply: (g) => g.val('companyName') },
      { find: '[CompanyName]', all: true, apply: (g) => g.val('companyName') },
      { find: '[Customer Name]', apply: (g) => g.val('counterpartyName') },
      {
        find: '**Name:** The entity or other person who is a counterparty to the Agreement',
        apply: (g) =>
          g.opt(
            'counterpartyName',
            '**Name:** The entity or other person who is a counterparty to the Agreement',
            (v) => `**Name:** ${v}`
          ),
      },
      { find: '[<mark>CUSTOMER AGREEMENT</mark>]', apply: (g) => g.val('agreementName') },
      { find: '[<mark>Effective Date of the Agreement</mark>]', apply: (g) => g.val('agreementDate') },
      { find: "**Address:** [<mark>INSERT</mark>]", apply: (g) => `**Address:** ${g.val('companyAddress')}` },
      {
        find: '**Contact Details for Data Protection:** [<mark>Role</mark>] [<mark>Email</mark>]',
        apply: (g) => `**Contact Details for Data Protection:** ${g.val('companyContact')}`,
      },
      { find: '[<mark>Brief Company description</mark>]', apply: (g) => g.val('companyActivities') },
      { find: "**Customer's address:** [<mark>INSERT</mark>]", apply: (g) => `**Customer's address:** ${g.line('counterpartyAddress')}` },
      {
        find: "**Customer's Contact Details for Data Protection:** [<mark>Role</mark>] [<mark>Email</mark>]",
        apply: (g) => `**Customer's Contact Details for Data Protection:** ${g.line('counterpartyContact')}`,
      },
      { find: '[WEBSITE]', apply: (g) => g.val('subprocessorSite') },
      {
        find: '[<mark>Name of Subprocessor | Location(s) | Description of Processing / Services Performed</mark>]',
        apply: (g) => g.opt('subprocessorList', 'Name of Subprocessor | Location(s) | Description of Processing / Services Performed'),
      },
    ],
  },
  // --- Web / app governance (US-style; strong "must be customised and reviewed" notes live in clAssume_*) ---
  {
    id: 'terms_of_use',
    slug: 'terms-of-use',
    icon: 'globe-outline',
    category: 'web',
    titleKey: 'clTitle_terms_of_use',
    descriptionKey: 'clDesc_terms_of_use',
    assumptionKey: 'clAssume_terms_of_use',
    documentTitle: 'Website Terms of Use',
    numbering: 'native',
    fields: [
      'companyName',
      'siteDomain',
      'effectiveDate',
      'privacyUrl',
      'companyAddress',
      'companyEmail',
      'governingLaw',
      'courtVenue',
    ],
    required: ['companyName', 'siteDomain', 'effectiveDate', 'companyEmail'],
    rules: [
      { find: '<mark>Date</mark>, 202<mark>[_]</mark>', apply: (g) => g.val('effectiveDate') },
      { find: '<mark>[DOMAIN NAME]</mark>', apply: (g) => g.val('siteDomain') },
      { find: 'Copyright © 202<mark>[_][Company]</mark>', apply: (g) => `Copyright © ${yearOf(g)} ${g.val('companyName')}` },
      { find: '<mark>[Company]</mark>', apply: (g) => g.val('companyName') },
      { find: '<mark>[INSERT PRIVACY POLICY URL -- hyperlink]</mark>', all: true, apply: (g) => g.val('privacyUrl') },
      { find: '<mark>[Cookie Policy / Privacy Policy -- hyperlink]</mark>', apply: (g) => g.val('privacyUrl') },
      {
        find: '<mark>[Company Name]</mark>, <mark>[Address]</mark>',
        apply: (g) => `${g.val('companyName')}, ${oneLine(g.val('companyAddress'))}`,
      },
      { find: '<mark>[Email]</mark>', apply: (g) => g.val('companyEmail') },
      { find: '<mark>[CONTACT EMAIL]</mark>', apply: (g) => g.val('companyEmail') },
      { find: '<mark>[ACCESSIBILITY CONTACT EMAIL / PHONE]</mark>', apply: (g) => g.val('companyEmail') },
      { find: '<mark>[Contact]</mark>', apply: (g) => g.val('companyEmail') },
      { find: '<mark>[Insert Email or Address]</mark>', apply: (g) => g.val('companyEmail') },
      {
        find: '<mark>[Address]</mark>, California <mark>[ZIP]</mark> or <mark>email@email.com</mark>',
        apply: (g) => `${oneLine(g.val('companyAddress'))} or ${g.val('companyEmail')}`,
      },
      {
        find: '<mark>disputes@company.com</mark> or <mark>[address]</mark>, California <mark>[ZIP]</mark>',
        apply: (g) => `${g.val('companyEmail')} or ${oneLine(g.val('companyAddress'))}`,
      },
      {
        find: 'the laws of the State of <mark>[California]</mark>',
        apply: (g) => g.opt('governingLaw', 'the laws of the State of California', (v) => `the laws of ${v}`),
      },
      {
        find: 'located in <mark>[County]</mark>, <mark>[California]</mark>',
        apply: (g) => g.opt('courtVenue', 'located in [County], California', (v) => `located in ${v}`),
      },
      {
        find: 'court in <mark>[California]</mark>',
        apply: (g) => g.opt('courtVenue', 'court in California', (v) => `court in ${v}`),
      },
    ],
  },
  {
    id: 'privacy_policy_gdpr',
    slug: 'privacy-policy-gdpr',
    icon: 'shield-checkmark-outline',
    category: 'web',
    titleKey: 'clTitle_privacy_policy_gdpr',
    descriptionKey: 'clDesc_privacy_policy_gdpr',
    assumptionKey: 'clAssume_privacy_policy_gdpr',
    documentTitle: 'Privacy Policy',
    numbering: 'native',
    fields: ['companyName', 'businessDescription', 'effectiveDate', 'companyEmail', 'companyAddress', 'companyPhone'],
    required: ['companyName', 'businessDescription', 'effectiveDate', 'companyEmail'],
    rules: [
      // Upstream drafting banner ("TEMPLATE PRIVACY POLICY ...") - the in-app notes replace it.
      {
        find: '| Last Updated: [DATE] TEMPLATE PRIVACY POLICY AND COOKIE NOTICE (GDPR compliant for U.S. Company with no "establishment" in the EEA or UK) |\n| --- |\n\n',
        apply: () => '',
      },
      { find: 'Effective as of <mark>[DATE]</mark>.', apply: (g) => `Effective as of ${g.val('effectiveDate')}.` },
      { find: '[<mark>Full Company Name</mark>]', apply: (g) => g.val('companyName') },
      { find: '[**<mark>CompanyName</mark>**]', apply: (g) => g.val('companyName') },
      { find: '[<mark>DESCRIPTION OF BUSINESS</mark>]', apply: (g) => g.val('businessDescription') },
      { find: '[<mark>CompanyName</mark>]', all: true, apply: (g) => g.val('companyName') },
      { find: '[CompanyName]', all: true, apply: (g) => g.val('companyName') },
      { find: '<mark>[Company E-mail]</mark>', apply: (g) => g.val('companyEmail') },
      { find: '<mark>[Company Address]</mark>', apply: (g) => oneLine(g.val('companyAddress')) },
      { find: '<mark>: [Phone Number]</mark>', apply: (g) => `: ${g.val('companyPhone')}` },
      { find: '[<mark>NUMBER</mark>]', apply: (g) => g.val('companyPhone') },
      { find: '[1-XXX-XXX-XXXX]', apply: (g) => g.val('companyPhone') },
      { find: '[<mark>EMAIL</mark>]', all: true, apply: (g) => g.val('companyEmail') },
      { find: '[EMAIL]', all: true, apply: (g) => g.val('companyEmail') },
      { find: '[email for data requests]', apply: (g) => g.val('companyEmail') },
      // The California "sell/share" disclosure table is left open on purpose: only the business knows its data flows.
      { find: '[INSERT]', all: true, apply: () => '[ to be completed ]' },
    ],
  },
  {
    id: 'cookie_notice',
    slug: 'cookie-notice',
    icon: 'finger-print-outline',
    category: 'web',
    titleKey: 'clTitle_cookie_notice',
    descriptionKey: 'clDesc_cookie_notice',
    assumptionKey: 'clAssume_cookie_notice',
    documentTitle: 'Cookie Notice',
    numbering: 'native',
    fields: ['companyName', 'siteDomain', 'companyEmail', 'effectiveDate'],
    required: ['companyName', 'siteDomain', 'companyEmail', 'effectiveDate'],
    rules: [
      { find: '[<mark>CompanyName</mark>]', all: true, apply: (g) => g.val('companyName') },
      { find: '[<mark>website</mark>]', apply: (g) => g.val('siteDomain') },
      { find: '<mark>[EMAIL].</mark>', apply: (g) => `${g.val('companyEmail')}.` },
      { find: '<mark>[INSERT DATE]</mark>', apply: (g) => g.val('effectiveDate') },
      // Cookie names, providers and durations must match what the site really sets.
      { find: '[ADD]', all: true, apply: () => '[ to be completed ]' },
    ],
  },
];

export function getContractTemplateById(id) {
  return CONTRACT_LIBRARY.find((item) => item.id === id) || null;
}

export const CONTRACT_CATEGORIES = ['confidentiality', 'commercial', 'equity', 'privacy', 'web'];
