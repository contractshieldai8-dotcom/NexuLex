// NexuLex Navigator — workflow registry (i18n keys only; no multilingual dumps).
// Step shape: { bodyKey, ctaKey, action?: { type, id } }. Every action type is handled in App.js
// (handleGuideAction); calculator / draft / scenario targets are gated by getAvailability first.

export const GUIDE_TABS = ['analyze', 'advisor', 'history', 'settings'];
export const GUIDE_SETTINGS_SECTIONS = ['account', 'seats', 'support', 'security', 'language', 'privacy', 'delete'];
export const GUIDE_ADVISOR_TOOLS = ['doc_explainer', 'case_files', 'legal_ask', 'process_guides', 'pro_tools', 'lawyer_handoff'];
export const GUIDE_ACTION_TYPES = [
  'openTab',
  'openCalculator',
  'openDraft',
  'openScenario',
  'openSettingsSection',
  'openAdvisorTool',
];

export const GUIDE_FAQ_CHIPS = [
  { id: 'faq_revise', chipKey: 'guideFaqRevise', workflowId: 'analyze_contract' },
  { id: 'faq_export', chipKey: 'guideFaqExport', workflowId: 'export_report' },
  { id: 'faq_diff', chipKey: 'guideFaqDiff', workflowId: 'diff_tool' },
  { id: 'faq_currency', chipKey: 'guideFaqCurrency', workflowId: 'jurisdiction_currency' },
  { id: 'faq_locked', chipKey: 'guideFaqLocked', workflowId: 'calculators' },
  { id: 'faq_documents', chipKey: 'guideFaqDocuments', workflowId: 'documents' },
  { id: 'faq_delete', chipKey: 'guideFaqDelete', workflowId: 'account_privacy' },
  { id: 'faq_report', chipKey: 'guideFaqReport', workflowId: 'report_ai' },
];

/** Newest last; the guide shows the last five. */
export const GUIDE_CHANGELOG = [
  { id: 'cl_scenarios', titleKey: 'guideNewScenarios', date: '2026-06-01', workflowId: 'scenarios' },
  { id: 'cl_keyboard', titleKey: 'guideNewKeyboard', date: '2026-09-10', workflowId: 'documents' },
  { id: 'cl_calculators', titleKey: 'guideNewCalculators', date: '2026-09-25', workflowId: 'calculators' },
  { id: 'cl_documents', titleKey: 'guideNewDocuments', date: '2026-09-25', workflowId: 'documents' },
  { id: 'cl_jurisdiction', titleKey: 'guideNewJurisdiction', date: '2026-09-25', workflowId: 'jurisdiction_currency' },
  { id: 'cl_guide', titleKey: 'guideNewGuide', date: '2026-09-25', workflowId: 'legal_advisor' },
  { id: 'cl_doc_explainer', titleKey: 'guideNewDocExplainer', date: '2026-09-26', workflowId: 'document_explainer' },
  { id: 'cl_case_files', titleKey: 'guideNewCaseFiles', date: '2026-09-27', workflowId: 'case_files' },
  { id: 'cl_legal_ask', titleKey: 'guideNewLegalAsk', date: '2026-09-28', workflowId: 'legal_ask' },
  { id: 'cl_process_guides', titleKey: 'guideNewProcessGuides', date: '2026-09-29', workflowId: 'process_guides' },
  { id: 'cl_professional', titleKey: 'guideNewProfessional', date: '2026-09-30', workflowId: 'pro_tools' },
  { id: 'cl_lawyer_handoff', titleKey: 'guideNewLawyer', date: '2026-10-01', workflowId: 'lawyer_handoff' },
  { id: 'cl_scan_dock', titleKey: 'guideNewDock', date: '2026-10-02', workflowId: 'scan_dock' },
  { id: 'cl_history_filters', titleKey: 'guideNewHistoryFilters', date: '2026-10-03', workflowId: 'history' },
  { id: 'cl_signed_scan', titleKey: 'guideNewSignedScan', date: '2026-10-04', workflowId: 'scan_dock' },
];

export function latestChangelog(count = 5) {
  return GUIDE_CHANGELOG.slice(-count).reverse();
}

export const GUIDE_WORKFLOWS = [
  {
    id: 'analyze_contract',
    titleKey: 'guideFlowAnalyzeTitle',
    hintKey: 'guideFlowAnalyzeHint',
    introKey: 'guideFlowAnalyzeIntro',
    chipKey: 'guideChipAnalyze',
    tab: 'analyze',
    steps: [
      { bodyKey: 'guideStepAnalyzePaste', ctaKey: 'pasteLabel', action: { type: 'openTab', id: 'analyze' } },
      { bodyKey: 'guideStepAnalyzeUpload', ctaKey: 'pickPdfDocument' },
      { bodyKey: 'guideStepAnalyzeParty', ctaKey: 'selectPartyTitle' },
      { bodyKey: 'guideStepAnalyzeStart', ctaKey: 'btnStartAnalyze' },
      { bodyKey: 'guideStepAnalyzeDecision', ctaKey: 'securityScore' },
      { bodyKey: 'guideStepAnalyzeShield', ctaKey: 'shieldApply' },
      { bodyKey: 'guideStepAnalyzeReady', ctaKey: 'copyCounterMessage' },
    ],
  },
  {
    id: 'diff_tool',
    titleKey: 'guideFlowDiffTitle',
    hintKey: 'guideFlowDiffHint',
    introKey: 'guideFlowDiffIntro',
    chipKey: 'guideChipDiff',
    tab: 'analyze',
    steps: [
      { bodyKey: 'guideStepDiffOpen', ctaKey: 'workspaceCompare', action: { type: 'openTab', id: 'analyze' } },
      { bodyKey: 'guideStepDiffOriginal', ctaKey: 'workspaceAnalyze' },
      { bodyKey: 'guideStepDiffSplit', ctaKey: 'diffSplitView' },
      { bodyKey: 'guideStepDiffRedline', ctaKey: 'diffRedline' },
      { bodyKey: 'guideStepDiffAfter', ctaKey: 'verifyMode' },
    ],
  },
  {
    id: 'export_report',
    titleKey: 'guideFlowExportTitle',
    hintKey: 'guideFlowExportHint',
    introKey: 'guideFlowExportIntro',
    chipKey: 'guideChipExport',
    tab: 'analyze',
    steps: [
      { bodyKey: 'guideStepExportApply', ctaKey: 'shieldApply' },
      { bodyKey: 'guideStepExportPdf', ctaKey: 'downloadPdfReport' },
      { bodyKey: 'guideStepExportShare', ctaKey: 'exportPdfShort' },
      { bodyKey: 'guideStepExportDocx', ctaKey: 'shieldExportAfterApply' },
    ],
  },
  {
    id: 'legal_advisor',
    titleKey: 'guideFlowAdvisorTitle',
    hintKey: 'guideFlowAdvisorHint',
    introKey: 'guideFlowAdvisorIntro',
    chipKey: 'guideChipAdvisor',
    tab: 'advisor',
    steps: [
      { bodyKey: 'guideStepAdvisorVs', ctaKey: 'guideTitle' },
      { bodyKey: 'guideStepAdvisorOpen', ctaKey: 'tabAdvisor', action: { type: 'openTab', id: 'advisor' } },
      { bodyKey: 'guideStepAdvisorAsk', ctaKey: 'tabAdvisor' },
      { bodyKey: 'guideStepAdvisorWhen', ctaKey: 'guideAskAdvisorCta' },
    ],
  },
  {
    id: 'document_explainer',
    titleKey: 'guideFlowExplainTitle',
    hintKey: 'guideFlowExplainHint',
    introKey: 'guideFlowExplainIntro',
    chipKey: 'guideChipExplain',
    tab: 'advisor',
    steps: [
      { bodyKey: 'guideStepExplain1', ctaKey: 'docExplainOpen', action: { type: 'openAdvisorTool', id: 'doc_explainer' } },
      { bodyKey: 'guideStepExplain2', ctaKey: 'docExplainDeadlines' },
      { bodyKey: 'guideStepExplain3', ctaKey: 'docExplainRemind' },
      { bodyKey: 'guideStepExplain4', ctaKey: 'docExplainAskAdvisor' },
    ],
  },
  {
    id: 'case_files',
    titleKey: 'guideFlowCasesTitle',
    hintKey: 'guideFlowCasesHint',
    introKey: 'guideFlowCasesIntro',
    chipKey: 'guideChipCases',
    tab: 'advisor',
    steps: [
      { bodyKey: 'guideStepCases1', ctaKey: 'caseCardTitle', action: { type: 'openAdvisorTool', id: 'case_files' } },
      { bodyKey: 'guideStepCases2', ctaKey: 'caseAddEvent' },
      { bodyKey: 'guideStepCases3', ctaKey: 'caseAddEvidence' },
      { bodyKey: 'guideStepCases4', ctaKey: 'caseBrief' },
    ],
  },
  {
    id: 'legal_ask',
    titleKey: 'guideFlowAskTitle',
    hintKey: 'guideFlowAskHint',
    introKey: 'guideFlowAskIntro',
    chipKey: 'guideChipAsk',
    tab: 'advisor',
    steps: [
      { bodyKey: 'guideStepAsk1', ctaKey: 'askCardTitle', action: { type: 'openAdvisorTool', id: 'legal_ask' } },
      { bodyKey: 'guideStepAsk2', ctaKey: 'askFactsLabel' },
      { bodyKey: 'guideStepAsk3', ctaKey: 'askSources' },
      { bodyKey: 'guideStepAsk4', ctaKey: 'askSaveToCase' },
    ],
  },
  {
    id: 'process_guides',
    titleKey: 'guideFlowGuidesTitle',
    hintKey: 'guideFlowGuidesHint',
    introKey: 'guideFlowGuidesIntro',
    chipKey: 'guideChipGuides',
    tab: 'advisor',
    steps: [
      { bodyKey: 'guideStepGuides1', ctaKey: 'pgCardTitle', action: { type: 'openAdvisorTool', id: 'process_guides' } },
      { bodyKey: 'guideStepGuides2', ctaKey: 'pgLinksTitle' },
      { bodyKey: 'guideStepGuides3', ctaKey: 'pgAskCta' },
      { bodyKey: 'guideStepGuides4', ctaKey: 'pgCaseCta' },
    ],
  },
  {
    id: 'pro_tools',
    titleKey: 'guideFlowProTitle',
    hintKey: 'guideFlowProHint',
    introKey: 'guideFlowProIntro',
    chipKey: 'guideChipPro',
    tab: 'advisor',
    steps: [
      { bodyKey: 'guideStepPro1', ctaKey: 'ptCardTitle', action: { type: 'openAdvisorTool', id: 'pro_tools' } },
      { bodyKey: 'guideStepPro2', ctaKey: 'ptFromCase' },
      { bodyKey: 'guideStepPro3', ctaKey: 'ptAuthorities' },
      { bodyKey: 'guideStepPro4', ctaKey: 'ptAddToTimeline' },
    ],
  },
  {
    id: 'lawyer_handoff',
    titleKey: 'guideFlowLawyerTitle',
    hintKey: 'guideFlowLawyerHint',
    introKey: 'guideFlowLawyerIntro',
    chipKey: 'guideChipLawyer',
    tab: 'advisor',
    steps: [
      { bodyKey: 'guideStepLawyer1', ctaKey: 'lhCardTitle', action: { type: 'openAdvisorTool', id: 'lawyer_handoff' } },
      { bodyKey: 'guideStepLawyer2', ctaKey: 'lhFindCta' },
      { bodyKey: 'guideStepLawyer3', ctaKey: 'lhCopyIntro' },
      { bodyKey: 'guideStepLawyer4', ctaKey: 'lhSharePdf' },
    ],
  },
  {
    id: 'settings_and_lang',
    titleKey: 'guideFlowSettingsTitle',
    hintKey: 'guideFlowSettingsHint',
    introKey: 'guideFlowSettingsIntro',
    chipKey: 'guideChipSettings',
    tab: 'settings',
    steps: [
      { bodyKey: 'guideStepSettingsOpen', ctaKey: 'tabSettings', action: { type: 'openTab', id: 'settings' } },
      { bodyKey: 'guideStepSettingsLang', ctaKey: 'appLanguage', action: { type: 'openSettingsSection', id: 'language' } },
      { bodyKey: 'guideStepSettingsSecurity', ctaKey: 'securitySettings', action: { type: 'openSettingsSection', id: 'security' } },
    ],
  },
  {
    id: 'playbook_rules',
    titleKey: 'guideFlowPlaybookTitle',
    hintKey: 'guideFlowPlaybookHint',
    introKey: 'guideFlowPlaybookIntro',
    chipKey: 'guideChipPlaybook',
    tab: 'analyze',
    steps: [
      { bodyKey: 'guideStepPlaybookOpen', ctaKey: 'playbookTitle', action: { type: 'openTab', id: 'analyze' } },
      { bodyKey: 'guideStepPlaybookApply', ctaKey: 'btnStartAnalyze' },
      { bodyKey: 'guideStepPlaybookSeat', ctaKey: 'seatTitle', action: { type: 'openSettingsSection', id: 'seats' } },
    ],
  },
  {
    id: 'party_side',
    titleKey: 'guideFlowPartyTitle',
    hintKey: 'guideFlowPartyHint',
    introKey: 'guideFlowPartyIntro',
    chipKey: 'guideChipParty',
    tab: 'analyze',
    steps: [
      { bodyKey: 'guideStepParty1', ctaKey: 'selectPartyTitle', action: { type: 'openTab', id: 'analyze' } },
      { bodyKey: 'guideStepParty2', ctaKey: 'btnStartAnalyze' },
      { bodyKey: 'guideStepParty3', ctaKey: 'guideCtaFlipSide' },
    ],
  },
  {
    id: 'tiered_offers',
    titleKey: 'guideFlowOffersTitle',
    hintKey: 'guideFlowOffersHint',
    introKey: 'guideFlowOffersIntro',
    chipKey: 'guideChipOffers',
    tab: 'analyze',
    steps: [
      { bodyKey: 'guideStepOffers1', ctaKey: 'offerBalanced', action: { type: 'openTab', id: 'analyze' } },
      { bodyKey: 'guideStepOffers2', ctaKey: 'offerShield' },
      { bodyKey: 'guideStepOffers3', ctaKey: 'copyCounterMessage' },
    ],
  },
  {
    id: 'scenarios',
    titleKey: 'guideFlowScenariosTitle',
    hintKey: 'guideFlowScenariosHint',
    introKey: 'guideFlowScenariosIntro',
    chipKey: 'guideChipScenarios',
    tab: 'advisor',
    registry: 'scenario',
    steps: [
      { bodyKey: 'guideStepScenarios1', ctaKey: 'scenarioSectionTitle', action: { type: 'openTab', id: 'advisor' } },
      { bodyKey: 'guideStepScenarios2', ctaKey: 'guideCtaAnswer' },
      { bodyKey: 'guideStepScenarios3', ctaKey: 'draftSectionTitle' },
    ],
  },
  {
    id: 'calculators',
    titleKey: 'guideFlowCalcTitle',
    hintKey: 'guideFlowCalcHint',
    introKey: 'guideFlowCalcIntro',
    chipKey: 'guideChipCalc',
    tab: 'advisor',
    registry: 'calculator',
    steps: [
      { bodyKey: 'guideStepCalc1', ctaKey: 'calcSectionTitle', action: { type: 'openTab', id: 'advisor' } },
      { bodyKey: 'guideStepCalc2', ctaKey: 'availPendingBadge' },
      { bodyKey: 'guideStepCalc3', ctaKey: 'guideCtaShare' },
    ],
  },
  {
    id: 'documents',
    titleKey: 'guideFlowDocsTitle',
    hintKey: 'guideFlowDocsHint',
    introKey: 'guideFlowDocsIntro',
    chipKey: 'guideChipDocs',
    tab: 'advisor',
    registry: 'draft',
    steps: [
      { bodyKey: 'guideStepDocs1', ctaKey: 'draftSectionTitle', action: { type: 'openTab', id: 'advisor' } },
      { bodyKey: 'guideStepDocs2', ctaKey: 'guideCtaAnswer' },
      { bodyKey: 'guideStepDocs3', ctaKey: 'guideCtaExport' },
    ],
  },
  {
    id: 'jurisdiction_currency',
    titleKey: 'guideFlowJurisTitle',
    hintKey: 'guideFlowJurisHint',
    introKey: 'guideFlowJurisIntro',
    chipKey: 'guideChipJuris',
    tab: 'advisor',
    steps: [
      { bodyKey: 'guideStepJuris1', ctaKey: 'advisorCountryLabel', action: { type: 'openTab', id: 'advisor' } },
      { bodyKey: 'guideStepJuris2', ctaKey: 'appLanguage', action: { type: 'openSettingsSection', id: 'language' } },
      { bodyKey: 'guideStepJuris3', ctaKey: 'availPendingBadge' },
    ],
  },
  {
    id: 'trap_calendar',
    titleKey: 'guideFlowTrapTitle',
    hintKey: 'guideFlowTrapHint',
    introKey: 'guideFlowTrapIntro',
    chipKey: 'guideChipTrap',
    tab: 'analyze',
    steps: [
      { bodyKey: 'guideStepTrap1', ctaKey: 'btnStartAnalyze', action: { type: 'openTab', id: 'analyze' } },
      { bodyKey: 'guideStepTrap2', ctaKey: 'guideCtaReminder' },
      { bodyKey: 'guideStepTrap3', ctaKey: 'calendarExportAction' },
    ],
  },
  {
    id: 'share_brief',
    titleKey: 'guideFlowShareTitle',
    hintKey: 'guideFlowShareHint',
    introKey: 'guideFlowShareIntro',
    chipKey: 'guideChipShare',
    tab: 'history',
    steps: [
      { bodyKey: 'guideStepShare1', ctaKey: 'tabHistory', action: { type: 'openTab', id: 'history' } },
      { bodyKey: 'guideStepShare2', ctaKey: 'guideCtaShare' },
      { bodyKey: 'guideStepShare3', ctaKey: 'guideCtaOpenCode' },
    ],
  },
  {
    id: 'seats',
    titleKey: 'guideFlowSeatsTitle',
    hintKey: 'guideFlowSeatsHint',
    introKey: 'guideFlowSeatsIntro',
    chipKey: 'guideChipSeats',
    tab: 'settings',
    steps: [
      { bodyKey: 'guideStepSeats1', ctaKey: 'seatTitle', action: { type: 'openSettingsSection', id: 'seats' } },
      { bodyKey: 'guideStepSeats2', ctaKey: 'guideCtaShare' },
      { bodyKey: 'guideStepSeats3', ctaKey: 'guideCtaRevoke' },
    ],
  },
  {
    id: 'history',
    titleKey: 'guideFlowHistoryTitle',
    hintKey: 'guideFlowHistoryHint',
    introKey: 'guideFlowHistoryIntro',
    chipKey: 'guideChipHistory',
    tab: 'history',
    steps: [
      { bodyKey: 'guideStepHistory1', ctaKey: 'tabHistory', action: { type: 'openTab', id: 'history' } },
      { bodyKey: 'guideStepHistory2', ctaKey: 'guideCtaStatus' },
      { bodyKey: 'guideStepHistory3', ctaKey: 'guideCtaDelete' },
      { bodyKey: 'guideStepHistorySearch', ctaKey: 'ux23Search', action: { type: 'openTab', id: 'history' } },
      { bodyKey: 'guideStepHistoryRisk', ctaKey: 'ux30Risk', action: { type: 'openTab', id: 'history' } },
      { bodyKey: 'guideStepHistoryRegister', ctaKey: 'ux23Filter', action: { type: 'openTab', id: 'history' } },
      { bodyKey: 'guideStepHistoryExport', ctaKey: 'ux23Export' },
    ],
  },
  {
    id: 'scan_dock',
    titleKey: 'guideFlowDockTitle',
    hintKey: 'guideFlowDockHint',
    introKey: 'guideFlowDockIntro',
    chipKey: 'guideChipDock',
    tab: 'analyze',
    steps: [
      { bodyKey: 'guideStepDockReport', ctaKey: 'ux24Report', action: { type: 'openTab', id: 'analyze' } },
      { bodyKey: 'guideStepDockSetup', ctaKey: 'ux24Expand' },
      { bodyKey: 'guideStepDockSigned', ctaKey: 'lifecycleSigned', action: { type: 'openTab', id: 'analyze' } },
      { bodyKey: 'guideStepDockNew', ctaKey: 'ux24New', action: { type: 'openTab', id: 'analyze' } },
      { bodyKey: 'guideStepDockGuides', ctaKey: 'ux24Guides' },
    ],
  },
  {
    id: 'voice',
    titleKey: 'guideFlowVoiceTitle',
    hintKey: 'guideFlowVoiceHint',
    introKey: 'guideFlowVoiceIntro',
    chipKey: 'guideChipVoice',
    tab: 'advisor',
    steps: [
      { bodyKey: 'guideStepVoice1', ctaKey: 'guideCtaVoice', action: { type: 'openTab', id: 'advisor' } },
      { bodyKey: 'guideStepVoice2', ctaKey: 'guideCtaListen' },
      { bodyKey: 'guideStepVoice3', ctaKey: 'voicePermissionTitle' },
    ],
  },
  {
    id: 'report_ai',
    titleKey: 'guideFlowReportTitle',
    hintKey: 'guideFlowReportHint',
    introKey: 'guideFlowReportIntro',
    chipKey: 'guideChipReport',
    tab: 'advisor',
    steps: [
      { bodyKey: 'guideStepReport1', ctaKey: 'guideCtaReport', action: { type: 'openTab', id: 'advisor' } },
      { bodyKey: 'guideStepReport2', ctaKey: 'guideCtaReport' },
      { bodyKey: 'guideStepReport3', ctaKey: 'supportTitle', action: { type: 'openSettingsSection', id: 'support' } },
    ],
  },
  {
    id: 'account_privacy',
    titleKey: 'guideFlowAccountTitle',
    hintKey: 'guideFlowAccountHint',
    introKey: 'guideFlowAccountIntro',
    chipKey: 'guideChipAccount',
    tab: 'settings',
    steps: [
      { bodyKey: 'guideStepAccount1', ctaKey: 'privacyPolicy', action: { type: 'openSettingsSection', id: 'privacy' } },
      { bodyKey: 'guideStepAccount2', ctaKey: 'securitySettings', action: { type: 'openSettingsSection', id: 'security' } },
      { bodyKey: 'guideStepAccount3', ctaKey: 'accountDeleteTitle', action: { type: 'openSettingsSection', id: 'delete' } },
    ],
  },
];

/** Matching-only legal-advice intent tokens (not rendered as UI copy). */
export const LEGAL_INTENT_KEYWORDS = {
  tr: ['kanun', 'tazminat', 'ihbar', 'mahkeme', 'dava', 'avukat', 'hukuk danış'],
  en: ['statute', 'lawsuit', 'damages', 'court', 'lawyer', 'liability', 'legal advice'],
  de: ['gesetz', 'klage', 'schadenersatz', 'gericht', 'anwalt'],
  fr: ['loi', 'procès', 'dommages', 'tribunal', 'avocat'],
  es: ['ley', 'demanda', 'indemnización', 'tribunal', 'abogado'],
  ar: ['قانون', 'دعوى', 'تعويض', 'محكمة', 'محام'],
  it: ['legge', 'causa', 'risarcimento', 'tribunale', 'avvocato'],
  zh: ['法规', '诉讼', '赔偿', '法院', '律师'],
  ru: ['закон', 'иск', 'убытки', 'суд', 'адвокат'],
  fa: ['قانون', 'شکایت', 'خسارت', 'دادگاه', 'وکیل'],
  ja: ['法令', '訴訟', '損害賠償', '裁判所', '弁護士'],
  pt: ['lei', 'ação', 'indenização', 'tribunal', 'advogado'],
  nl: ['wet', 'rechtszaak', 'schadevergoeding', 'rechtbank', 'advocaat'],
};

export function matchLegalIntent(query, langCode) {
  const raw = String(query || '').trim().toLowerCase();
  if (raw.length < 3) return false;
  const code = String(langCode || 'en').slice(0, 2).toLowerCase();
  const list = LEGAL_INTENT_KEYWORDS[code] || LEGAL_INTENT_KEYWORDS.en;
  const en = LEGAL_INTENT_KEYWORDS.en;
  const pool = code === 'en' ? en : [...list, ...en];
  return pool.some((kw) => raw.includes(String(kw).toLowerCase()));
}
