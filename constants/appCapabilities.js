// NexuLex Navigator — workflow registry (i18n keys only; no multilingual dumps).

export const GUIDE_FAQ_CHIPS = [
  { id: 'faq_revise', chipKey: 'guideFaqRevise', workflowId: 'analyze_contract' },
  { id: 'faq_export', chipKey: 'guideFaqExport', workflowId: 'export_report' },
  { id: 'faq_diff', chipKey: 'guideFaqDiff', workflowId: 'diff_tool' },
];

export const GUIDE_WORKFLOWS = [
  {
    id: 'analyze_contract',
    titleKey: 'guideFlowAnalyzeTitle',
    hintKey: 'guideFlowAnalyzeHint',
    introKey: 'guideFlowAnalyzeIntro',
    chipKey: 'guideChipAnalyze',
    tab: 'analyze',
    steps: [
      { bodyKey: 'guideStepAnalyzePaste', ctaKey: 'pasteLabel' },
      { bodyKey: 'guideStepAnalyzeUpload', ctaKey: 'pickPdfDocument' },
      { bodyKey: 'guideStepAnalyzeImages', ctaKey: 'uploadImages' },
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
      { bodyKey: 'guideStepDiffOpen', ctaKey: 'workspaceCompare' },
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
      { bodyKey: 'guideStepAdvisorOpen', ctaKey: 'tabAdvisor' },
      { bodyKey: 'guideStepAdvisorAsk', ctaKey: 'tabAdvisor' },
      { bodyKey: 'guideStepAdvisorWhen', ctaKey: 'guideAskAdvisorCta' },
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
      { bodyKey: 'guideStepSettingsOpen', ctaKey: 'tabSettings' },
      { bodyKey: 'guideStepSettingsLang', ctaKey: 'appLanguage' },
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
      { bodyKey: 'guideStepPlaybookOpen', ctaKey: 'playbookTitle' },
      { bodyKey: 'guideStepPlaybookSeat', ctaKey: 'seatTitle' },
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
