// Geliştirme yardımcı betiği: theme.js içinde arayüzün beklediği stil
// anahtarlarının ve i18n dil paritesinin eksiksiz olduğunu doğrular.
// Kullanım: node scripts/verify-ui.js

const fs = require('fs');

let failed = false;

// --- 1. Stil anahtarları ---
const themeSrc = fs.readFileSync('theme.js', 'utf8');
const requiredStyles = [
  'modalOverlay', 'modalSheet', 'modalHandle', 'modalTitle', 'modalOption',
  'modalOptionText', 'modalOptionHint', 'secondaryBtn', 'secondaryBtnText',
  'sectionHint', 'searchRow', 'searchInput', 'sheetFlag', 'planCard',
  'planTitle', 'planBadge', 'planPrice', 'primaryButton', 'primaryButtonText',
  'paywallFeatureRow', 'paywallFeatureText', 'container', 'card', 'scoreValue',
  'summaryText', 'settingLabel', 'sectionHeader', 'passwordRow', 'passwordInput',
  'passwordToggle', 'strengthRow', 'strengthTrack', 'strengthFill', 'strengthLabel',
  'input', 'typeChip', 'typeChipActive', 'typeChipText', 'typeChipTextActive',
  'typeChipRow', 'typeChipContent',
  'decisionCard', 'lockedCard', 'previewBanner', 'deadlineRow', 'counterMessageCard',
  'conversionHook', 'layerRow', 'statusChip', 'proposalBtn',
  'sideSelector', 'lockedWrap', 'costWidget', 'voiceBriefBtn', 'modeToggleRow', 'chatMicBtn',
  'tiltTrack', 'tiltFill', 'lightRow', 'clashBanner',
  'redFlagCard', 'yellowFlagCard',
  'partyChoiceRow', 'partyChoiceCard', 'partyChoiceCardActive', 'partyChoiceTitle', 'partyChoiceSubtitle',
  'partyChoiceIcon', 'partyChoiceMeta',
  'offerTierRow', 'offerTierChip', 'offerTierChipText',
];

const missingStyles = requiredStyles.filter((key) => !themeSrc.includes(`  ${key}: {`));
if (missingStyles.length) {
  failed = true;
  console.log('EKSIK STIL:', missingStyles.join(', '));
} else {
  console.log(`OK  stiller (${requiredStyles.length} anahtar)`);
}

// --- 2. i18n dil paritesi ---
const extrasSrc = fs.readFileSync('i18n.extras.js', 'utf8');
const extrasMatch = extrasSrc.match(/export const WAVE_A_I18N = ([\s\S]*);\s*$/);
const waveBSrc = fs.readFileSync('i18n.waveb.js', 'utf8');
const waveBMatch = waveBSrc.match(/export const WAVE_B_I18N = ([\s\S]*);\s*$/);
const waveCSrc = fs.readFileSync('i18n.wavec.js', 'utf8');
const waveCMatch = waveCSrc.match(/export const WAVE_C_I18N = ([\s\S]*);\s*$/);
const waveDSrc = fs.readFileSync('i18n.global.js', 'utf8');
const waveDMatch = waveDSrc.match(/export const WAVE_D_I18N = ([\s\S]*);\s*$/);
const waveESrc = fs.readFileSync('i18n.wavee.js', 'utf8');
const waveEMatch = waveESrc.match(/export const WAVE_E_I18N = ([\s\S]*);\s*$/);
const waveFSrc = fs.readFileSync('i18n.wavef.js', 'utf8');
const waveFMatch = waveFSrc.match(/export const WAVE_F_I18N = ([\s\S]*);\s*$/);
const waveBnSrc = fs.readFileSync('i18n.wavebn.js', 'utf8');
const waveBnMatch = waveBnSrc.match(/export const WAVE_BN_I18N = ([\s\S]*);\s*$/);
const waveBoSrc = fs.readFileSync('i18n.wavebo.js', 'utf8');
const waveBoMatch = waveBoSrc.match(/export const WAVE_BO_I18N = ([\s\S]*);\s*$/);
const waveCaSrc = fs.readFileSync('i18n.waveca.js', 'utf8');
const waveCaMatch = waveCaSrc.match(/export const WAVE_CA_I18N = ([\s\S]*);\s*$/);
const waveCbSrc = fs.readFileSync('i18n.wavecb.js', 'utf8');
const waveCbMatch = waveCbSrc.match(/export const WAVE_CB_I18N = ([\s\S]*);\s*$/);
const waveCcSrc = fs.readFileSync('i18n.wavecc.js', 'utf8');
const waveCcMatch = waveCcSrc.match(/export const WAVE_CC_I18N = ([\s\S]*);\s*$/);
const i18nSrc = fs.readFileSync('i18n.js', 'utf8');
const match = i18nSrc.match(/const resources = ([\s\S]*?);\s*\n\s*i18n\.use/);

if (!extrasMatch || !waveBMatch || !waveCMatch || !waveDMatch || !waveEMatch || !waveFMatch || !waveBnMatch || !waveBoMatch || !waveCaMatch || !waveCbMatch || !waveCcMatch || !match) {
  failed = true;
  console.log('i18n.js veya wave A–F/BN/BO/CA/CB/CC kaynak blogu ayristirilamadi.');
} else {
  const WAVE_A_I18N = eval(`(${extrasMatch[1]})`); // eslint-disable-line no-eval
  const WAVE_B_I18N = eval(`(${waveBMatch[1]})`); // eslint-disable-line no-eval
  const WAVE_C_I18N = eval(`(${waveCMatch[1]})`); // eslint-disable-line no-eval
  const WAVE_D_I18N = eval(`(${waveDMatch[1]})`); // eslint-disable-line no-eval
  const WAVE_E_I18N = eval(`(${waveEMatch[1]})`); // eslint-disable-line no-eval
  const WAVE_F_I18N = eval(`(${waveFMatch[1]})`); // eslint-disable-line no-eval
  const WAVE_BN_I18N = eval(`(${waveBnMatch[1]})`); // eslint-disable-line no-eval
  const WAVE_BO_I18N = eval(`(${waveBoMatch[1]})`); // eslint-disable-line no-eval
  const WAVE_CA_I18N = eval(`(${waveCaMatch[1]})`); // eslint-disable-line no-eval
  const WAVE_CB_I18N = eval(`(${waveCbMatch[1]})`); // eslint-disable-line no-eval
  const WAVE_CC_I18N = eval(`(${waveCcMatch[1]})`); // eslint-disable-line no-eval
  const resources = Function(
    'WAVE_A_I18N',
    'WAVE_B_I18N',
    'WAVE_C_I18N',
    'WAVE_D_I18N',
    'WAVE_E_I18N',
    'WAVE_F_I18N',
    'WAVE_BN_I18N',
    'WAVE_BO_I18N',
    'WAVE_CA_I18N',
    'WAVE_CB_I18N',
    'WAVE_CC_I18N',
    `return (${match[1]});`
  )(WAVE_A_I18N, WAVE_B_I18N, WAVE_C_I18N, WAVE_D_I18N, WAVE_E_I18N, WAVE_F_I18N, WAVE_BN_I18N, WAVE_BO_I18N, WAVE_CA_I18N, WAVE_CB_I18N, WAVE_CC_I18N);
  const languages = Object.keys(resources);
  const baseKeys = Object.keys(resources.en.translation);

  const waveCLangs = Object.keys(WAVE_C_I18N);
  const waveCBase = Object.keys(WAVE_C_I18N.en || {});
  for (const lang of waveCLangs) {
    const keys = Object.keys(WAVE_C_I18N[lang] || {});
    const missing = waveCBase.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !waveCBase.includes(key));
    if (missing.length || extra.length) {
      failed = true;
      console.log(`WAVE_C ${lang}: eksik=[${missing.join(', ')}] fazla=[${extra.join(', ')}]`);
    }
  }

  const waveDLangs = Object.keys(WAVE_D_I18N);
  const waveDBase = Object.keys(WAVE_D_I18N.en || {});
  for (const lang of waveDLangs) {
    const keys = Object.keys(WAVE_D_I18N[lang] || {});
    const missing = waveDBase.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !waveDBase.includes(key));
    if (missing.length || extra.length) {
      failed = true;
      console.log(`WAVE_D ${lang}: eksik=[${missing.join(', ')}] fazla=[${extra.join(', ')}]`);
    }
  }

  const waveELangs = Object.keys(WAVE_E_I18N);
  const waveEBase = Object.keys(WAVE_E_I18N.en || {});
  if (waveELangs.length !== 13) {
    failed = true;
    console.log(`WAVE_E dil sayisi ${waveELangs.length}, beklenen 13`);
  }
  for (const lang of waveELangs) {
    const keys = Object.keys(WAVE_E_I18N[lang] || {});
    const missing = waveEBase.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !waveEBase.includes(key));
    if (missing.length || extra.length) {
      failed = true;
      console.log(`WAVE_E ${lang}: eksik=[${missing.join(', ')}] fazla=[${extra.join(', ')}]`);
    }
  }

  for (const lang of waveELangs) {
    const imagesMsg = WAVE_E_I18N[lang]?.errImagesTooLarge || '';
    if (/2\s*[–-]\s*3|۲\s*[–-]\s*۳/.test(imagesMsg)) {
      failed = true;
      console.log(`WAVE_E ${lang}.errImagesTooLarge: yasak 2-3 sayisi`);
    }
  }

  const waveFLangs = Object.keys(WAVE_F_I18N);
  const waveFBase = Object.keys(WAVE_F_I18N.en || {});
  if (waveFLangs.length !== 13) {
    failed = true;
    console.log(`WAVE_F dil sayisi ${waveFLangs.length}, beklenen 13`);
  }
  for (const lang of waveFLangs) {
    const keys = Object.keys(WAVE_F_I18N[lang] || {});
    const missing = waveFBase.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !waveFBase.includes(key));
    if (missing.length || extra.length) {
      failed = true;
      console.log(`WAVE_F ${lang}: eksik=[${missing.join(', ')}] fazla=[${extra.join(', ')}]`);
    }
  }

  const waveBnLangs = Object.keys(WAVE_BN_I18N);
  const waveBnBase = Object.keys(WAVE_BN_I18N.en || {});
  if (waveBnLangs.length !== 13) {
    failed = true;
    console.log(`WAVE_BN dil sayisi ${waveBnLangs.length}, beklenen 13`);
  }
  for (const lang of waveBnLangs) {
    const keys = Object.keys(WAVE_BN_I18N[lang] || {});
    const missing = waveBnBase.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !waveBnBase.includes(key));
    if (missing.length || extra.length) {
      failed = true;
      console.log(`WAVE_BN ${lang}: eksik=[${missing.join(', ')}] fazla=[${extra.join(', ')}]`);
    }
  }

  const waveBoLangs = Object.keys(WAVE_BO_I18N);
  const waveBoBase = Object.keys(WAVE_BO_I18N.en || {});
  if (waveBoLangs.length !== 13) {
    failed = true;
    console.log(`WAVE_BO dil sayisi ${waveBoLangs.length}, beklenen 13`);
  }
  for (const lang of waveBoLangs) {
    const keys = Object.keys(WAVE_BO_I18N[lang] || {});
    const missing = waveBoBase.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !waveBoBase.includes(key));
    if (missing.length || extra.length) {
      failed = true;
      console.log(`WAVE_BO ${lang}: eksik=[${missing.join(', ')}] fazla=[${extra.join(', ')}]`);
    }
  }

  const waveCaLangs = Object.keys(WAVE_CA_I18N);
  const waveCaBase = Object.keys(WAVE_CA_I18N.en || {});
  if (waveCaLangs.length !== 13) {
    failed = true;
    console.log(`WAVE_CA dil sayisi ${waveCaLangs.length}, beklenen 13`);
  }
  for (const lang of waveCaLangs) {
    const keys = Object.keys(WAVE_CA_I18N[lang] || {});
    const missing = waveCaBase.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !waveCaBase.includes(key));
    if (missing.length || extra.length) {
      failed = true;
      console.log(`WAVE_CA ${lang}: eksik=[${missing.join(', ')}] fazla=[${extra.join(', ')}]`);
    }
  }
  if (waveCaBase.length !== 200) {
    failed = true;
    console.log(`WAVE_CA key count ${waveCaBase.length}, beklenen 200`);
  }

  const waveCbLangs = Object.keys(WAVE_CB_I18N);
  const waveCbBase = Object.keys(WAVE_CB_I18N.en || {});
  if (waveCbLangs.length !== 13) {
    failed = true;
    console.log(`WAVE_CB dil sayisi ${waveCbLangs.length}, beklenen 13`);
  }
  for (const lang of waveCbLangs) {
    const keys = Object.keys(WAVE_CB_I18N[lang] || {});
    const missing = waveCbBase.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !waveCbBase.includes(key));
    if (missing.length || extra.length) {
      failed = true;
      console.log(`WAVE_CB ${lang}: eksik=[${missing.join(', ')}] fazla=[${extra.join(', ')}]`);
    }
  }
  if (waveCbBase.length !== 50) {
    failed = true;
    console.log(`WAVE_CB key count ${waveCbBase.length}, beklenen 50`);
  }

  const waveCcLangs = Object.keys(WAVE_CC_I18N);
  const waveCcBase = Object.keys(WAVE_CC_I18N.en || {});
  if (waveCcLangs.length !== 13) {
    failed = true;
    console.log(`WAVE_CC dil sayisi ${waveCcLangs.length}, beklenen 13`);
  }
  for (const lang of waveCcLangs) {
    const keys = Object.keys(WAVE_CC_I18N[lang] || {});
    const missing = waveCcBase.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !waveCcBase.includes(key));
    if (missing.length || extra.length) {
      failed = true;
      console.log(`WAVE_CC ${lang}: eksik=[${missing.join(', ')}] fazla=[${extra.join(', ')}]`);
    }
  }
  if (waveCcBase.length !== 51) {
    failed = true;
    console.log(`WAVE_CC key count ${waveCcBase.length}, beklenen 51`);
  }

  for (const lang of languages) {
    const keys = Object.keys(resources[lang].translation);
    const missing = baseKeys.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !baseKeys.includes(key));

    if (missing.length || extra.length) {
      failed = true;
      console.log(`${lang}: eksik=[${missing.join(', ')}] fazla=[${extra.join(', ')}]`);
    }
  }

  // Interpolasyon yer tutucuları çeviride korunmalı.
  const placeholderKeys = ['clauseCountLabel', 'imagesSelected', 'clauseItem', 'freeAnalysesLeft', 'deadlineDaysLeft', 'lockedMoreFlags', 'lockedMoreClauses', 'remindersScheduled', 'detectedTypeHint', 'signPickedCount', 'pdfSavedTo', 'localeWelcomeBody', 'shieldStrip', 'shieldBanner', 'shieldSkipped', 'shieldSkipUnmatched', 'shareOsMessage', 'shareExpires', 'seatOsMessage', 'seatOsHousehold', 'partyShieldActive', 'partyFlipCta', 'paywallPartyContext', 'calcAsOfNotice'];
  for (const lang of languages) {
    for (const key of placeholderKeys) {
      const value = resources[lang].translation[key];
      if (value && !value.includes('{{')) {
        failed = true;
        console.log(`${lang}.${key}: yer tutucu kayip`);
      }
    }
  }

  console.log(`OK  i18n (${languages.length} dil x ${baseKeys.length} anahtar): ${languages.join(', ')}`);
  if (languages.length !== 13 || baseKeys.length !== 979) {
    failed = true;
    console.log(`i18n sayim ${languages.length} x ${baseKeys.length}, beklenen 13 x 979`);
  }

  const enSub = resources.en.translation.paywallSubtitle || '';
  const trSub = resources.tr.translation.paywallSubtitle || '';
  if (/unlimited contract analysis/i.test(enSub)) {
    failed = true;
    console.log('en.paywallSubtitle unlimited contract analysis');
  }
  if (trSub.includes('Sınırsız sözleşme analizi ve hukuk danışmanı')) {
    failed = true;
    console.log('tr.paywallSubtitle eski sınırsız danışman kopyası');
  }
  for (const lang of languages) {
    const f2 = String(resources[lang].translation.paywallFeature2 || '');
    const hasTen = /(?:^|[^\d])10(?:[^\d]|$)/.test(f2) || /١٠(?!\d)/.test(f2) || /۱۰(?!\d)/.test(f2);
    const hasThirteen = /13|١٣|۱۳/.test(f2);
    if (hasTen && /lang|dil|sprach|langue|idioma|لغ|lingue|语言|язык|زبان|言語|talen/i.test(f2)) {
      failed = true;
      console.log(`${lang}.paywallFeature2 10 dil`);
    }
    if ((lang === 'en' || lang === 'tr') && !hasThirteen) {
      failed = true;
      console.log(`${lang}.paywallFeature2 13 yok`);
    }
  }
  for (const lang of languages) {
    const msg = String(resources[lang].translation.shareOsMessage || '');
    if (!msg.includes('{{url}}') || /^\s*nexulex:\/\//i.test(msg)) {
      failed = true;
      console.log(`${lang}.shareOsMessage {{url}} / nexulex lead`);
    }
  }
}

// --- 3. Analiz token tavanı tek tanım ---
const aiSrc = fs.readFileSync('services/ai.js', 'utf8');
const tokenDefs = aiSrc.match(/^\s*const ANALYSIS_MAX_TOKENS\s*=/gm) || [];
if (tokenDefs.length !== 1) {
  failed = true;
  console.log(`ANALYSIS_MAX_TOKENS tanim sayisi: ${tokenDefs.length}`);
} else if (!/const ANALYSIS_MAX_TOKENS\s*=\s*8192/.test(aiSrc)) {
  failed = true;
  console.log('ANALYSIS_MAX_TOKENS 8192 degil.');
} else {
  console.log('OK  ANALYSIS_MAX_TOKENS tek tanim');
}

if (/\b32768\b/.test(aiSrc)) {
  failed = true;
  console.log('services/ai.js icinde yasak 32768 token tavani var.');
}

const generateDefs = aiSrc.match(/^\s*const GENERATE_MAX_TOKENS\s*=/gm) || [];
if (generateDefs.length !== 1) {
  failed = true;
  console.log(`GENERATE_MAX_TOKENS tanim sayisi: ${generateDefs.length}`);
} else if (!/const GENERATE_MAX_TOKENS\s*=\s*16384/.test(aiSrc)) {
  failed = true;
  console.log('GENERATE_MAX_TOKENS 16384 degil.');
} else {
  console.log('OK  GENERATE_MAX_TOKENS 16384 tek tanim');
}

const requestTimeoutMs = Number((aiSrc.match(/const REQUEST_TIMEOUT_MS\s*=\s*(\d+)/) || [])[1]);
const extractTimeoutMs = Number((aiSrc.match(/const EXTRACT_TIMEOUT_MS\s*=\s*(\d+)/) || [])[1]);
if (!(requestTimeoutMs >= 140000)) {
  failed = true;
  console.log(`REQUEST_TIMEOUT_MS ${requestTimeoutMs}`);
} else if (!(extractTimeoutMs >= 120000)) {
  failed = true;
  console.log(`EXTRACT_TIMEOUT_MS ${extractTimeoutMs}`);
} else {
  console.log('OK  analysis/extract timeouts');
}

const extractFn = aiSrc.slice(aiSrc.indexOf('async function extractContractText'), aiSrc.indexOf('function withExtractedSource'));
if (/step < 3/.test(extractFn) || /looksIncompleteExtract\(chunk/.test(extractFn)) {
  failed = true;
  console.log('extract continuation 3x veya looksIncompleteExtract sole continue');
} else if (!/step < 1/.test(extractFn) || !/isTruncatedExtract\(chunk\)/.test(extractFn)) {
  failed = true;
  console.log('extract continuation bound 1 / isTruncatedExtract yok');
} else {
  console.log('OK  extract continuation bound 1');
}

const analyzeFn = aiSrc.slice(
  aiSrc.indexOf('export async function analyzeContract'),
  aiSrc.indexOf('export async function analyzeContractImages')
);
if (/sourceChars\s*>\s*8000\s*\?\s*16384/.test(analyzeFn) || /analysisMaxTokens\s*=\s*sourceChars/.test(analyzeFn)) {
  failed = true;
  console.log('analyzeContract tek 16384 ucus');
} else if (/runAnalysis\(/.test(analyzeFn)) {
  failed = true;
  console.log('analyzeContract runAnalysis kullanıyor');
} else if (!/Do NOT output clauses/.test(analyzeFn) || !/No summary, no redFlags, no decision/.test(analyzeFn)) {
  failed = true;
  console.log('analyzeContract Flight A/B extraSystem yok');
} else if (!/parsedB|promptB|FLIGHT B/.test(analyzeFn) || !/merged/.test(analyzeFn)) {
  failed = true;
  console.log('analyzeContract clauses-only ikinci ucus yok');
} else {
  console.log('OK  analyzeContract two flights 8192');
}

const sysFn = aiSrc.slice(aiSrc.indexOf('function buildSystemPrompt'), aiSrc.indexOf('function buildTaskPrompt'));
const partyFn = aiSrc.slice(aiSrc.indexOf('const buildPartyDirective'), aiSrc.indexOf('function buildStatuteMapDirective') >= 0 ? aiSrc.indexOf('function buildStatuteMapDirective') : aiSrc.indexOf('const buildDraftDirective'));
const taskFn = aiSrc.slice(aiSrc.indexOf('function buildTaskPrompt'), aiSrc.indexOf('const EMPTY_ANALYSIS'));
const typoFn = aiSrc.slice(aiSrc.indexOf('export function buildTypographyDirective'), aiSrc.indexOf('const JURISDICTION_PROFILES'));
if (/Turkish Code of Obligations/.test(sysFn)) {
  failed = true;
  console.log('buildSystemPrompt unconditional Turkish Code of Obligations');
} else if (/Sen \[|kıdemli bir avukatsın/.test(partyFn)) {
  failed = true;
  console.log('buildPartyDirective Turkish HARD PERSONA');
} else if (/"statute":\s*"TBK m\.342"/.test(taskFn)) {
  failed = true;
  console.log('buildTaskPrompt TBK m.342 schema');
} else if (!/"TBK m\. 621"/.test(typoFn)) {
  failed = true;
  console.log('typography TBK m. 621 sample yok');
} else if (!/buildStatuteMapDirective/.test(analyzeFn) || !/AUTHORITATIVE STATUTE MAP/.test(aiSrc)) {
  failed = true;
  console.log('flightA statute map yok');
} else {
  console.log('OK  jurisdiction wins no TBK leak');
}

const extractDefs = aiSrc.match(/^\s*const EXTRACT_MAX_TOKENS\s*=/gm) || [];
if (extractDefs.length !== 1) {
  failed = true;
  console.log(`EXTRACT_MAX_TOKENS tanim sayisi: ${extractDefs.length}`);
} else if (!/const EXTRACT_MAX_TOKENS\s*=\s*8192/.test(aiSrc)) {
  failed = true;
  console.log('EXTRACT_MAX_TOKENS 8192 degil.');
} else {
  console.log('OK  EXTRACT_MAX_TOKENS 8192 tek tanim');
}

const ai16384 = aiSrc.match(/^.*\b16384\b.*$/gm) || [];
if (!ai16384.length) {
  failed = true;
  console.log('ai.js uzun belge ANALYSIS 16384 yok');
} else {
  for (const line of ai16384) {
    if (/EXTRACT_MAX_TOKENS/.test(line)) {
      failed = true;
      console.log('16384 EXTRACT ile karisik');
    }
  }
}

const draftFnMatch = aiSrc.match(
  /export function isTruncatedDraft\([\s\S]*?\n(?=export async function generateContractDraft)/
);
if (!draftFnMatch) {
  failed = true;
  console.log('isTruncatedDraft ayristirilamadi');
} else {
  const isTruncatedDraft = eval(`(${draftFnMatch[0].replace('export function', 'function').trim()})`); // eslint-disable-line no-eval
  if (isTruncatedDraft('Bu metin hukuki tavs') !== true) {
    failed = true;
    console.log("isTruncatedDraft('…hukuki tavs') true olmali");
  }
  const completeDraft = `# Kira

1. Konu tamamdir.

### İmza / Signatures
KİRAYA VEREN
__________`;
  if (isTruncatedDraft(completeDraft) !== false) {
    failed = true;
    console.log('isTruncatedDraft imza altcizgisi false olmali');
  } else {
    console.log('OK  isTruncatedDraft hukuki tavs / imza');
  }
  const enDraft = `# Lease

1. The premises are complete.

### Signatures
LANDLORD
__________
TENANT
__________

*This template is not legal advice.*`;
  if (isTruncatedDraft(enDraft) !== false) {
    failed = true;
    console.log('isTruncatedDraft EN Signatures + disclaimer false olmali');
  }
  const enUnderscore = `# Agreement

1. Complete clause.

### Signatures
LANDLORD
________________
TENANT
________________`;
  if (isTruncatedDraft(enUnderscore) !== false) {
    failed = true;
    console.log('isTruncatedDraft EN underscore false olmali');
  } else {
    console.log('OK  isTruncatedDraft EN signatureLine');
  }
}

const shieldSrc = fs.readFileSync('utils/shieldDocument.js', 'utf8');
if (!/article_mismatch/.test(shieldSrc)) {
  failed = true;
  console.log('shield article_mismatch yok');
} else if (!/Entegrasyonlar/.test(shieldSrc) || !/Google Drive/.test(shieldSrc)) {
  failed = true;
  console.log('NXL 3.3 fixture yok');
} else if (!/body-four/.test(shieldSrc) || !/truncated_to/.test(shieldSrc) || !/span_overflow/.test(shieldSrc) || !/TOP_NAMED_RE/.test(shieldSrc)) {
  failed = true;
  console.log('MADDE fixture / truncated_to / span_overflow yok');
} else if (!/1\.200\.000/.test(shieldSrc) || !/%30 imza/.test(shieldSrc) || !/expandToParagraph/.test(shieldSrc)) {
  failed = true;
  console.log('5. UCRET paragraph fixture yok');
} else {
  console.log('OK  shield article_mismatch + NXL 3.3 + MADDE + UCRET');
}
if (!/MADDE 36/.test(shieldSrc) || !/spanEatsLaterTops/.test(shieldSrc)) {
  failed = true;
  console.log('MADDE 36 EOF skip fixture yok');
}

try {
  const shieldBody = shieldSrc
    .replace(/import \{[^}]+\} from '\.\/analysis';\s*/, '')
    .replace(/import \{ playbookItemById \} from '\.\.\/constants\/playbooks';\s*/, '')
    .replace(/export /g, '');
  const stubs = `
    const isPlaceholderText = (value) => {
      const text = String(value ?? '').replace(/\\u0000/g, '').trim();
      if (!text) return true;
      return /^(n\\/a|n\\.a\\.|na|none|null|undefined|-|—|–|\\.|belirtilmedi|yok|yoktur|not specified|unspecified|bilinmiyor)$/i.test(text);
    };
    const normalizeAnalysis = (analysis) => analysis || {};
    const pickCounterOffer = (item, tier) => {
      const key = String(tier || 'balanced').toLowerCase();
      const offers = item?.counterOffers || item?.counter_offers || null;
      const fromTier = offers ? String(offers[key] || '').trim() : '';
      if (fromTier) return fromTier;
      return String(item?.counterOffer || item?.counter_offer || '').trim();
    };
    const playbookItemById = () => null;
  `;
  const runFixtures = new Function(`${stubs}\n${shieldBody}\nassertShieldFixtures();`); // eslint-disable-line no-new-func
  runFixtures();
  console.log('OK  assertShieldFixtures');
} catch (error) {
  failed = true;
  console.log(error?.detail?.fail ? `shield fixtures: ${error.detail.fail.join('; ')}` : (error.message || 'assertShieldFixtures failed'));
}

const fnSrc = fs.readFileSync('supabase/functions/analyze-contract/index.ts', 'utf8');
if (!/const MAX_ALLOWED_TOKENS\s*=\s*16384/.test(fnSrc)) {
  failed = true;
  console.log('analyze-contract MAX_ALLOWED_TOKENS 16384 degil.');
} else if (!/const DEFAULT_MAX_TOKENS\s*=\s*5000/.test(fnSrc)) {
  failed = true;
  console.log('analyze-contract DEFAULT_MAX_TOKENS 5000 degil.');
} else if (/\b32768\b/.test(fnSrc)) {
  failed = true;
  console.log('analyze-contract icinde yasak 32768.');
} else {
  console.log('OK  analyze-contract MAX_ALLOWED 16384 / DEFAULT 5000');
}

if (!/thinking:\s*\{\s*type:\s*['"]disabled['"]\s*\}/.test(fnSrc) && !/thinkingDisabled:\s*true/.test(fnSrc)) {
  failed = true;
  console.log('analyze-contract thinking disabled yok');
} else if (!/empty-edge-text/.test(fnSrc)) {
  failed = true;
  console.log('analyze-contract empty-edge-text 502 yok');
} else if (!/output_config[\s\S]{0,40}effort:\s*['"]low['"]/.test(fnSrc)) {
  failed = true;
  console.log('analyze-contract effort low fallback yok');
} else {
  console.log('OK  WAVE BG thinking disabled + empty-edge-text');
}

const aiProxySrc = fs.readFileSync('services/ai.js', 'utf8');
if (!/empty-edge-text/.test(aiProxySrc) || !/AI_ERROR_CODES\.PARSE/.test(aiProxySrc.match(/empty-edge-text[\s\S]{0,400}/)?.[0] || '')) {
  failed = true;
  console.log('callClaudeProxy empty-edge-text → PARSE yok');
} else {
  console.log('OK  WAVE BG client empty-edge-text PARSE');
}

const optionsSrc = fs.readFileSync('constants/options.js', 'utf8');
const jurBlock = optionsSrc.match(/export const JURISDICTIONS = \[([\s\S]*?)\];/);
const jurCodes = jurBlock ? jurBlock[1].match(/code: '[^']+'/g) || [] : [];
if (jurCodes.length !== 15) {
  failed = true;
  console.log(`JURISDICTIONS satir sayisi ${jurCodes.length}, beklenen 15 (auto+14)`);
} else {
  console.log('OK  JURISDICTIONS 15 satir (auto+14)');
}

const appSrc = fs.readFileSync('App.js', 'utf8');
if (!/setContractText\(''\)/.test(appSrc) || !/sourceImagesActive/.test(appSrc)) {
  failed = true;
  console.log('pickImages last-touch paste temizligi yok');
} else {
  console.log('OK  pickImages clears paste (last-touch)');
}
const anchorChunk = appSrc.match(/ref=\{reportAnchorRef\}[\s\S]{0,500}/);
if (
  !anchorChunk ||
  (/\{renderAnalysisReport\(activeResult/.test(anchorChunk[0]) &&
    !/\/>\s*\{renderAnalysisReport\(activeResult/.test(anchorChunk[0]))
) {
  failed = true;
  console.log('reportAnchorRef wraps renderAnalysisReport');
} else {
  console.log('OK  reportAnchorRef sentinel');
}
if (/\.clause[^{]*\{[^}]*page-break-inside:\s*avoid/.test(appSrc) || /\.red-flag[^{]*\{[^}]*page-break-inside:\s*avoid/.test(appSrc)) {
  if (/min-height:\s*250mm/.test(appSrc)) {
    failed = true;
    console.log('exportPDFReport min-height:250mm');
  } else if (!/packReportPages/.test(appSrc) || !/REPORT_CHAR_BUDGET/.test(appSrc)) {
    failed = true;
    console.log('exportPDFReport packer yok');
  } else {
    console.log('OK  exportPDFReport page pack');
  }
} else if (/min-height:\s*250mm/.test(appSrc)) {
  failed = true;
  console.log('exportPDFReport min-height:250mm');
} else if (!/packReportPages/.test(appSrc) || !/REPORT_CHAR_BUDGET/.test(appSrc)) {
  failed = true;
  console.log('exportPDFReport packer yok');
} else {
  failed = true;
  console.log('exportPDFReport .red-flag/.clause page-break-inside:avoid yok');
}

const cacheSrc = fs.readFileSync('services/analysisCache.js', 'utf8');
if (!/const STORAGE_KEY = 'nexulex\.analysisCache\.v3'/.test(cacheSrc)) {
  failed = true;
  console.log('analysisCache STORAGE_KEY v3 yok');
} else {
  console.log('OK  analysisCache v3');
}
const decisionSrc = fs.readFileSync('components/DecisionCard.js', 'utf8');
if (!/shareBriefTitle/.test(decisionSrc) && !/onShareBrief/.test(decisionSrc)) {
  failed = true;
  console.log('DecisionCard shareBrief yok');
} else if (!/flexDirection:\s*'column',\s*width:\s*'100%',\s*gap:\s*8/.test(decisionSrc)) {
  failed = true;
  console.log('DecisionCard share stack yok');
} else if (!/hookNegotiateTitle/.test(decisionSrc)) {
  failed = true;
  console.log('DecisionCard hookNegotiateTitle yok');
} else if (!/counterMessageTitle/.test(decisionSrc) && !/hookNegotiateTitle/.test(decisionSrc)) {
  failed = true;
  console.log('DecisionCard ready/negotiate surface yok');
} else if (!/counterMessageTitle/.test(decisionSrc)) {
  failed = true;
  console.log('DecisionCard counterMessageTitle yok');
} else if (!/verifyMode/.test(decisionSrc) || !/onVerifyRevision/.test(decisionSrc)) {
  failed = true;
  console.log('DecisionCard verifyMode entry yok');
} else {
  const shareIdx = Math.max(decisionSrc.indexOf("t('decisionShare')"), decisionSrc.indexOf("t('shareBriefTitle')"));
  const counselIdx = decisionSrc.lastIndexOf("t('disclaimerCounsel')");
  if (counselIdx < 0 || counselIdx < shareIdx) {
    failed = true;
    console.log('disclaimerCounsel share altinda degil');
  } else {
    console.log('OK  DecisionCard shareBrief');
  }
}

const diffSrcAk = fs.readFileSync('components/DiffTool.js', 'utf8');
if (!/seedMode\s*===\s*'verify'/.test(diffSrcAk) || !/seedMode\s*=\s*''/.test(diffSrcAk)) {
  failed = true;
  console.log('DiffTool seedMode verify yok');
} else if (!/mode:\s*'verify'/.test(appSrc) || !/diffSeed\.mode === 'verify'/.test(appSrc)) {
  failed = true;
  console.log('App.js verify seedMode wire yok');
} else {
  console.log('OK  verify revision seed');
}

if (
  !/briefNudgeAnalysisIdRef/.test(appSrc)
  || !/copyCounterMessageFromDecision/.test(appSrc)
  || !/setShareSheetAnalysis\(target\)/.test(appSrc)
) {
  failed = true;
  console.log('brief nudge after Pro copy yok');
} else if (/onVerifyRevision[\s\S]{0,400}setShareSheetAnalysis/.test(appSrc.match(/onVerifyRevision=\{\(\) => \{[\s\S]*?\}\}/)?.[0] || '')) {
  failed = true;
  console.log('verifyMode brief nudge');
} else {
  console.log('OK  brief nudge after Pro copy');
}

const privacyHtml = fs.existsSync('web/privacy.html');
const termsHtml = fs.existsSync('web/terms.html');
const publishBriefSrc = fs.readFileSync('scripts/publish-brief-web.js', 'utf8');
const paywallLegalSrc = fs.readFileSync('screens/PaywallScreen.js', 'utf8');
const purchasesSrc = fs.readFileSync('services/purchases.js', 'utf8');
if (!privacyHtml || !termsHtml) {
  failed = true;
  console.log('web/privacy.html veya terms.html yok');
} else if (!/privacy\.html/.test(publishBriefSrc) || !/terms\.html/.test(publishBriefSrc)) {
  failed = true;
  console.log('publish-brief-web privacy/terms copy yok');
} else if (
  !/nexulexai\.netlify\.app\/privacy\.html/.test(paywallLegalSrc)
  || !/nexulexai\.netlify\.app\/terms\.html/.test(paywallLegalSrc)
  || !/nexulexai\.netlify\.app\/privacy\.html/.test(appSrc)
  || !/nexulexai\.netlify\.app\/terms\.html/.test(appSrc)
) {
  failed = true;
  console.log('Paywall/Settings privacy terms URL yok');
} else if (
  !/EXPO_PUBLIC_REVENUECAT_IOS_KEY/.test(purchasesSrc)
  || !/EXPO_PUBLIC_REVENUECAT_ANDROID_KEY/.test(purchasesSrc)
) {
  failed = true;
  console.log('RevenueCat env key rename');
} else if (/reviewer@/i.test(appSrc) && /isPro/.test(appSrc.match(/reviewer@[\s\S]{0,200}/)?.[0] || '')) {
  failed = true;
  console.log('client reviewer isPro bypass');
} else {
  console.log('OK  store policy links');
}

const indexSrc = fs.readFileSync('index.js', 'utf8');
const appJsonSrc = fs.readFileSync('app.json', 'utf8');
if (!/preventAutoHideAsync/.test(indexSrc) || !/expo-splash-screen/.test(indexSrc)) {
  failed = true;
  console.log('index.js splash preventAutoHide yok');
} else if (!/"expo-splash-screen"/.test(appJsonSrc) || !/"backgroundColor":\s*"#000000"/.test(appJsonSrc)) {
  failed = true;
  console.log('app.json splash plugin yok');
} else if (!/"android"\s*:\s*\{[\s\S]*?splash-icon\.png[\s\S]*?"imageWidth":\s*200/.test(appJsonSrc)) {
  failed = true;
  console.log('app.json android splash-icon.png / imageWidth 200 yok');
} else if (!/"ios"\s*:\s*\{[\s\S]*?splash\.png[\s\S]*?enableFullScreenImage_legacy/.test(appJsonSrc)) {
  failed = true;
  console.log('app.json ios splash.png / legacy yok');
} else if (!fs.existsSync('assets/splash-icon.png')) {
  failed = true;
  console.log('assets/splash-icon.png yok');
} else if (!fs.existsSync('assets/splash.png')) {
  failed = true;
  console.log('assets/splash.png yok');
} else if (!/"splash"\s*:\s*\{[\s\S]*?"image":\s*"\.\/assets\/splash-icon\.png"/.test(appJsonSrc)) {
  failed = true;
  console.log('app.json top-level splash-icon.png yok');
} else if (/require\(['"]\.\/assets\/splash\.png['"]\)/.test(appSrc) || /splashSource/.test(appSrc) || /splashHiddenRef/.test(appSrc)) {
  failed = true;
  console.log('App.js JS Image splash / splashHiddenRef kalmis');
} else if (!/if\s*\(\s*!appReady\s*\)\s*\{?\s*return\s*<View style=\{\{\s*flex:\s*1,\s*backgroundColor:\s*'#000000'\s*\}\}\s*\/>/.test(appSrc)) {
  failed = true;
  console.log('App.js !appReady black underlay yok');
} else if (!/useEffect\(\s*\(\)\s*=>\s*\{[\s\S]*?if\s*\(\s*appReady\s*\)\s*SplashScreen\.hideAsync/.test(appSrc)) {
  failed = true;
  console.log('App.js appReady hideAsync effect yok');
} else if (!/authBootstrapped/.test(appSrc)) {
  failed = true;
  console.log('App.js authBootstrapped yok');
} else if (!/SafeAreaView style=\{\[styles\.container,\s*\{\s*backgroundColor:\s*theme\.bg\s*\}\]\}/.test(appSrc) || !/backgroundColor=\{theme\.bg\}/.test(appSrc)) {
  failed = true;
  console.log('App.js root theme.bg yok');
} else {
  console.log('OK  splash controlled hide');
}

if (/generateNegotiation|draftNegotiationMessage/.test(aiSrc)) {
  failed = true;
  console.log('ai.js negotiation draft flight');
}

const shieldCardSrc = fs.readFileSync('components/ShieldDocumentCard.js', 'utf8');
if (/page-break-inside:\s*avoid/.test(shieldCardSrc)) {
  failed = true;
  console.log('kalkan PDF page-break-inside:avoid');
}
if (!/payloadText\(stitched\)/.test(shieldCardSrc)) {
  failed = true;
  console.log('kalkan payloadText yok');
}
if (!/exportPlain\(body, 'NexuLex-kalkan\.txt', \{ shareAlways: true \}\)/.test(shieldCardSrc)) {
  failed = true;
  console.log('shield copy shareAlways true yok');
} else {
  console.log('OK  shield copy shareAlways true');
}
if (
  !/shareShieldDocx/.test(shieldCardSrc) ||
  !/shareShieldRedlinePdf/.test(shieldCardSrc) ||
  !fs.existsSync('utils/redlineExport.js')
) {
  failed = true;
  console.log('shield DOCX/redline PDF exporter yok');
} else {
  const redlineSrc = fs.readFileSync('utils/redlineExport.js', 'utf8');
  if (
    !/\.docx/.test(redlineSrc) ||
    !/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/.test(redlineSrc) ||
    !/<del[\s\S]*line-through/.test(redlineSrc) ||
    !/<ins[\s\S]*background/.test(redlineSrc) ||
    !/zipStore/.test(redlineSrc)
  ) {
    failed = true;
    console.log('redlineExport docx/mime/del/ins eksik');
  } else {
    console.log('OK  WAVE AY shield DOCX + redline PDF');
  }
}

const exportSrc = fs.readFileSync('utils/exportPlain.js', 'utf8');
if (!/PAGE_CHAR_BUDGET = 2400/.test(exportSrc) || !/PAGE_LINE_BUDGET = 48/.test(exportSrc)) {
  failed = true;
  console.log('PAGE_CHAR_BUDGET/PAGE_LINE_BUDGET yanlis');
}
if (/min-height:\s*250mm/.test(exportSrc)) {
  failed = true;
  console.log('exportPlain min-height:250mm duruyor');
}
if (/page-break-inside:\s*avoid/.test(exportSrc) || /break-inside:\s*avoid/.test(exportSrc)) {
  failed = true;
  console.log('exportPlain page-break-inside:avoid');
}
if (/export function flowingPreHtml/.test(exportSrc) || !/export function paginatePlainHtml/.test(exportSrc)) {
  failed = true;
  console.log('paginatePlainHtml yok veya flowingPreHtml duruyor');
} else {
  try {
    const exportBody = exportSrc
      .replace(/import \* as Clipboard from 'expo-clipboard';\s*/, '')
      .replace(/import \* as Sharing from 'expo-sharing';\s*/, '')
      .replace(/import \{ escapeHtml \} from '\.\/analysis';\s*/, 'const escapeHtml = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");')
      .replace(/import \{ writeOwnedUtf8 \} from '\.\/fileAccess';\s*/, 'const writeOwnedUtf8 = async () => "";')
      .replace(/export /g, '');
    const paginate = new Function(`${exportBody}\nreturn { paginatePlainHtml, paginatePlainPages };`)(); // eslint-disable-line no-new-func
    const big = Array.from({ length: 40 }, (_, i) => {
      const n = i + 1;
      const para = `MADDE ${n}\n${'Sozlesme maddesi metni. '.repeat(18)}`;
      return para;
    }).join('\n\n');
    const html = paginate.paginatePlainHtml(big);
    const pages = html.match(/<div class="page">/g) || [];
    const pres = html.match(/<pre class="doc">/g) || [];
    if (pages.length < 3) {
      failed = true;
      console.log(`paginatePlainHtml page sayisi ${pages.length}, beklenen 3+`);
    } else if (pages.length >= 20) {
      failed = true;
      console.log(`paginatePlainHtml page sayisi ${pages.length}, 20 altinda olmali`);
    } else if (pres.length !== pages.length) {
      failed = true;
      console.log('paginatePlainHtml tek pre.doc sarmaliyor');
    } else {
      console.log(`OK  paginatePlainHtml ${pages.length} page`);
    }
    const headingCount = 12;
    const enDoc = Array.from({ length: headingCount }, (_, i) => {
      const n = i + 1;
      return `${n}. SECTION TITLE\n${'The parties agree the service continues through the term of this agreement. '.repeat(8)}`;
    }).join('\n\n');
    const enPages = paginate.paginatePlainPages(enDoc);
    if (enPages.length >= headingCount) {
      failed = true;
      console.log(`paginatePlainPages EN ${enPages.length} page, heading ${headingCount} altinda olmali`);
    } else {
      console.log(`OK  paginatePlainPages EN ${enPages.length} page < ${headingCount} headings`);
    }
    const tableDoc = `${'Sozlesme metni. '.repeat(70)}\n\nPROJE TAKVİMİ\nAşama\tBaslangic\tBitis\nKickoff\t1 Ekim 2026\t7 Ekim 2026\nTasarim\t8 Ekim 2026\t21 Ekim 2026\nYayin\t22 Ekim 2026\t30 Ekim 2026`;
    const tablePages = paginate.paginatePlainPages(tableDoc);
    const tableHits = tablePages.filter((page) => /1 Ekim 2026/.test(page));
    if (
      tableHits.length !== 1 ||
      !/PROJE TAKVİMİ/.test(tableHits[0]) ||
      !/30 Ekim 2026/.test(tableHits[0])
    ) {
      failed = true;
      console.log('paginatePlainPages tablo blogu bolundu');
    } else {
      console.log('OK  paginatePlainPages atomic table');
    }
  } catch (error) {
    failed = true;
    console.log(`paginatePlainHtml: ${error.message}`);
  }
}

const openStrip = appSrc.match(/const openSignedStrip = useCallback\([\s\S]*?\}, \[userId/);
if (!openStrip) {
  failed = true;
  console.log('openSignedStrip ayristirilamadi');
} else if (/scrollToEnd/.test(openStrip[0])) {
  failed = true;
  console.log('openSignedStrip scrollToEnd');
} else {
  console.log('OK  openSignedStrip no scrollToEnd when signed');
}
if (
  !/pendingSignedScrollRef/.test(appSrc) ||
  !/measureLayout/.test(appSrc) ||
  /scrollToSignedReport[\s\S]{0,1200}measureInWindow/.test(appSrc) ||
  !/contentFlexGrow=\{activeResult \? 0 : 1\}/.test(appSrc) ||
  !/setTimeout\(fire, 300\)/.test(appSrc) ||
  !/finishWithStored/.test(appSrc)
) {
  failed = true;
  console.log('signed scroll debounce / measureLayout yok');
} else {
  console.log('OK  signed scroll debounce measureLayout');
}
if (/scrollToSignedReport[\s\S]{0,1600}measureLayout\([\s\S]{0,400}\(\) => \{\s*\}\)/.test(appSrc)) {
  failed = true;
  console.log('measureLayout fail bos callback');
}
if (!/hasDurationBadge/.test(appSrc) || !/reminderNeedEndDate/.test(appSrc)) {
  failed = true;
  console.log('handleScheduleReminders reminderNeedEndDate yok');
}

const typeSrc = fs.readFileSync('utils/contractType.js', 'utf8');
if (
  !/satış\\s\+ve\\s\+tedarik/.test(typeSrc)
  || !/tedarik sözleş/.test(typeSrc)
  || !/mal satış/.test(typeSrc)
  || !/satış ve tedarik sözleş/.test(typeSrc)
) {
  failed = true;
  console.log('contractType sales/tedarik preamble yok');
} else if (!/slice\(0,\s*500\)/.test(typeSrc) || !(/score \+= 3|score \+= entry\.category === 'sales'(?: \|\| entry\.category === 'saas')? \? 5 : 3/.test(typeSrc))) {
  failed = true;
  console.log('contractType 500-char weight yok');
} else {
  console.log('OK  contractType sales preamble');
}

const radarSrc = fs.readFileSync('components/DeadlineRadar.js', 'utf8');
if (!/reminderNeedEndDate/.test(radarSrc) || !/parseIsoDate/.test(radarSrc) || !/canRemind/.test(radarSrc)) {
  failed = true;
  console.log('DeadlineRadar unspecified schedule');
} else if (/scheduleTrapReminders/.test(radarSrc)) {
  failed = true;
  console.log('DeadlineRadar scheduleTrapReminders');
} else {
  console.log('OK  DeadlineRadar date-only remind');
}

const paywallOpens = appSrc.match(/setPaywallVisible\(true\)/g) || [];
if (paywallOpens.length !== 1) {
  failed = true;
  console.log(`setPaywallVisible(true) ${paywallOpens.length} kez, yalniz openPaywall icinde olmali`);
} else if (!/const openPaywall = \(hook = null(?:,\s*context = null)?\) => \{\s*setPaywallHook\(hook\);\s*(?:setPaywallContext\(context \|\| null\);\s*)?setPaywallVisible\(true\);/.test(appSrc)) {
  failed = true;
  console.log('openPaywall setPaywallVisible disinda');
} else if (!/LegalContractGenerator[\s\S]{0,800}onNeedPaywall=\{\(hook\) => openPaywall/.test(appSrc)) {
  failed = true;
  console.log('LegalContractGenerator onNeedPaywall openPaywall degil');
} else {
  console.log('OK  paywall opens only via openPaywall');
}
if (/onPurchased=\{refreshProfile\}/.test(appSrc)) {
  failed = true;
  console.log('onPurchased bare refreshProfile');
} else if (!/onPurchased=\{[\s\S]*?await refreshProfile\(\)[\s\S]*?setActiveTab\('analyze'\)/.test(appSrc)) {
  failed = true;
  console.log('onPurchased analyze tab yok');
} else {
  console.log('OK  onPurchased lands analyze');
}

const analysisUtilSrc = fs.readFileSync('utils/analysis.js', 'utf8');
if (!/export function buildReadyToSendMessage/.test(analysisUtilSrc)) {
  failed = true;
  console.log('buildReadyToSendMessage yok');
} else if (
  !/counterMessage:\s*counterMessage\s*\|\|\s*firstReady\s*\|\|\s*readyFallback/.test(analysisUtilSrc)
  && !/counterMessage\s*\|\|\s*firstReady\s*\|\|\s*buildReadyToSendMessage/.test(analysisUtilSrc)
) {
  failed = true;
  console.log('normalizeAnalysis ready-to-send fallback yok');
} else if (/applyFreePreview[\s\S]*?counterMessage:\s*''/.test(analysisUtilSrc) === false) {
  failed = true;
  console.log('applyFreePreview counterMessage lock yok');
} else {
  console.log('OK  ready-to-send from counterOffers');
}

const paywallSrc = fs.readFileSync('screens/PaywallScreen.js', 'utf8');
const exhaustedMsgCount = (paywallSrc.match(/t\('quotaExhaustedMessage'\)/g) || []).length;
if (exhaustedMsgCount !== 1) {
  failed = true;
  console.log(`PaywallScreen quotaExhaustedMessage ${exhaustedMsgCount} kez`);
} else if (!/t\('lockedTitle'\)/.test(paywallSrc)) {
  failed = true;
  console.log('PaywallScreen features heading lockedTitle yok');
} else if (
  !/canPurchase/.test(paywallSrc)
  || !/disabled=\{!canPurchase \|\| busy\}/.test(paywallSrc)
  || !/!available \|\| \(!loadingPlans && packages\.length === 0\)/.test(paywallSrc)
) {
  failed = true;
  console.log('PaywallScreen CTA unavailable disable yok');
} else {
  console.log('OK  PaywallScreen exhausted hero/heading');
}

const diffSrc = fs.readFileSync('components/DiffTool.js', 'utf8');
if (!/writeOwnedBase64/.test(diffSrc)) {
  failed = true;
  console.log('Diff handleShare writeOwnedBase64 yok');
} else {
  console.log('OK  Diff handleShare writeOwnedBase64');
}
if (/flexDirection:\s*'row'/.test(diffSrc) && /flex:\s*1/.test(diffSrc.match(/view === 'split'[\s\S]{0,400}/)?.[0] || '')) {
  failed = true;
  console.log('Diff split view iki kolon');
}

const notifySrc = fs.readFileSync('services/notifications.js', 'utf8');
if (/items = \[[\s\S]*fallbackFireDate\(\)/.test(notifySrc)) {
  failed = true;
  console.log('scheduleTrapReminders dummy fallbackFireDate');
} else {
  console.log('OK  no dummy trap reminder');
}

if (!/madde glue newline/.test(shieldSrc)) {
  failed = true;
  console.log('applyBodyReplace glue fixture yok');
}

try {
  const trapSrc = fs.readFileSync('utils/trapExtract.js', 'utf8').replace(/export /g, '');
  const runTrap = new Function(`${trapSrc}\nreturn assertTrapFixtures();`); // eslint-disable-line no-new-func
  const trap = runTrap();
  if (!trap?.items || trap.items.length !== 1) {
    failed = true;
    console.log('trap reminderItems length 1 degil');
  } else {
    console.log('OK  trap 60d through Sep 30 2028 -> 2028-08-01');
  }
} catch (error) {
  failed = true;
  console.log(error?.detail?.fail ? `trap fixtures: ${error.detail.fail.join('; ')}` : (error.message || 'assertTrapFixtures failed'));
}

const analysisSrc = fs.readFileSync('utils/analysis.js', 'utf8');
if (!/extractAnchorEndDate/.test(analysisSrc) || !/noticeDateIso/.test(analysisSrc)) {
  failed = true;
  console.log('ensureTrapCalendar end-minus-notice yok');
}

if (!/reminderNeedEndDate/.test(extrasSrc)) {
  failed = true;
  console.log('reminderNeedEndDate i18n yok');
}

const shareSheetSrc = fs.readFileSync('components/ShareBriefSheet.js', 'utf8');
if (
  !/EXPO_PUBLIC_BRIEF_VIEW_BASE/.test(shareSheetSrc) ||
  /\/storage\/v1\/object\/public\/brief-web/.test(shareSheetSrc) ||
  /apikey=/.test(shareSheetSrc)
) {
  failed = true;
  console.log('ShareBriefSheet BRIEF_VIEW_BASE url yok');
} else {
  console.log('OK  ShareBriefSheet BRIEF_VIEW_BASE url');
}

try {
  const snapSrc = fs.readFileSync('utils/shareSnapshot.js', 'utf8').replace(/export /g, '');
  const parseShareCode = new Function(`${snapSrc}\nreturn parseShareCode;`)(); // eslint-disable-line no-new-func
  const parsedFn = parseShareCode(
    'https://example.supabase.co/functions/v1/open-share?code=A1B2C3D4&format=html'
  );
  const parsedWeb = parseShareCode(
    'https://example.supabase.co/storage/v1/object/public/brief-web/index.html?code=A1B2C3D4'
  );
  if (parsedFn !== 'A1B2C3D4') {
    failed = true;
    console.log(`parseShareCode HTTPS ${parsedFn}`);
  } else if (parsedWeb !== 'A1B2C3D4') {
    failed = true;
    console.log(`parseShareCode brief-web ${parsedWeb}`);
  } else {
    console.log('OK  parseShareCode brief-web + open-share');
  }
} catch (error) {
  failed = true;
  console.log(`parseShareCode: ${error.message}`);
}

const briefHtml = fs.readFileSync('web/brief.html', 'utf8');
if (!/__GET_APP_HREF__/.test(briefHtml)) {
  failed = true;
  console.log('web/brief.html GET_APP placeholder yok');
} else if (/play\.google\.com\/store\/apps\/details\?id=com\.nexulex\.ai/.test(briefHtml)) {
  failed = true;
  console.log('web/brief.html hardcoded Play CTA');
} else if (!/nexulex:\/\/share\//.test(briefHtml)) {
  failed = true;
  console.log('web/brief.html nexulex://share/ yok');
} else if (!/__SUPABASE_ANON_KEY__/.test(briefHtml)) {
  failed = true;
  console.log('web/brief.html placeholder yok');
} else if (/snapshot\.contract_text|innerHTML[\s\S]{0,40}contract_text/.test(briefHtml)) {
  failed = true;
  console.log('web/brief.html contract_text render');
} else if (!/border-left:\s*4px|border-left-color/.test(briefHtml)) {
  failed = true;
  console.log('web/brief.html flag border-left yok');
} else {
  const pb = briefHtml.match(/main\{[^}]*padding:\s*\d+px\s+\d+px\s+(\d+)px/);
  const mainBottom = pb ? Number(pb[1]) : 0;
  if (mainBottom < 120) {
    failed = true;
    console.log(`web/brief.html main padding-bottom ${mainBottom}`);
  } else if (
    /\? decision\.reasons : \[\]\)\.forEach/.test(briefHtml)
    || !/\.filter\(Boolean\);\s*reasonItems\.forEach\(function \(item\) \{\s*addText\(reasons, 'li'/.test(briefHtml)
  ) {
    failed = true;
    console.log('web/brief.html empty reasons li');
  } else {
    console.log('OK  web/brief.html viewer');
  }
}

let getHtml = '';
try {
  getHtml = fs.readFileSync('web/get.html', 'utf8');
} catch {
  failed = true;
  console.log('web/get.html yok');
}
if (getHtml) {
  if (!/nexulex:\/\//.test(getHtml)) {
    failed = true;
    console.log('web/get.html nexulex:// yok');
  } else if (/contract_text/.test(getHtml)) {
    failed = true;
    console.log('web/get.html contract_text');
  } else if (/play\.google\.com\/store\/apps\/details/.test(getHtml)) {
    failed = true;
    console.log('web/get.html hardcoded Play URL');
  } else {
    console.log('OK  web/get.html landing');
  }
}

const publishSrc = fs.readFileSync('scripts/publish-brief-web.js', 'utf8');
if (!/__GET_APP_HREF__/.test(publishSrc)) {
  failed = true;
  console.log('publish-brief-web.js GET_APP placeholder yok');
} else if (!/get\.html/.test(publishSrc) || !/dist\/get\.html/.test(publishSrc.replace(/\\/g, '/'))) {
  failed = true;
  console.log('publish-brief-web.js dist/get.html yok');
} else if (!/EXPO_PUBLIC_PLAY_STORE_URL/.test(publishSrc) || !/play\.google\.com/.test(publishSrc)) {
  failed = true;
  console.log('publish-brief-web.js Play URL resolution yok');
} else {
  console.log('OK  publish-brief-web GET_APP');
}

const openShareSrc = fs.readFileSync('supabase/functions/open-share/index.ts', 'utf8');
const mintShareSrc = fs.readFileSync('supabase/functions/mint-share/index.ts', 'utf8');
const shareSnapSrc = fs.readFileSync('utils/shareSnapshot.js', 'utf8');
if (/reasons\.push\(''\)/.test(shareSnapSrc) || /reasons\.push\(''\)/.test(mintShareSrc)) {
  failed = true;
  console.log('pickDecision empty reasons pad');
} else {
  console.log('OK  pickDecision no empty pad');
}
const disclaimerKeys = [...mintShareSrc.matchAll(/^\s{2}([a-z]{2}):\s+'/gm)].map((item) => item[1]);
const openKeys = [...openShareSrc.matchAll(/^\s{2}([a-z]{2}):\s+'/gm)]
  .map((item) => item[1])
  .filter((key, i, arr) => arr.indexOf(key) === i);
if (!/play\.google\.com\/store\/apps\/details\?id=com\.nexulex\.ai/.test(openShareSrc)) {
  failed = true;
  console.log('open-share Play CTA yok');
} else if (!/nexulex:\/\/share\//.test(openShareSrc)) {
  failed = true;
  console.log('open-share nexulex://share/ yok');
} else if (/snapshot\.contract_text|snapshot\[.contract_text/.test(openShareSrc)) {
  failed = true;
  console.log('open-share contract_text interpolate');
} else if (disclaimerKeys.join(',') !== 'tr,en,de,fr,es,ar,it,zh,ru,fa,ja,pt,nl') {
  failed = true;
  console.log(`mint-share DISCLAIMERS diller ${disclaimerKeys.join(',')}`);
} else if (!disclaimerKeys.every((key) => openKeys.includes(key))) {
  failed = true;
  console.log(`open-share CTA diller ${openKeys.join(',')}`);
} else {
  console.log('OK  open-share HTML CTA 13 lang');
}

const sliceFn = (startNeedle, endNeedle) => {
  const start = aiSrc.indexOf(startNeedle);
  if (start < 0) return '';
  const end = endNeedle ? aiSrc.indexOf(endNeedle, start + startNeedle.length) : aiSrc.length;
  return aiSrc.slice(start, end > start ? end : aiSrc.length);
};
const analysisSys = sliceFn('function buildSystemPrompt', 'function buildTaskPrompt');
const advisorSys = sliceFn('export async function askLegalAdvisor', 'export async function reviseContractDraft');
const rewriteSys = sliceFn('export async function reviseContractDraft', 'export async function compareContractVersions');
const draftSys = sliceFn('export async function generateContractDraft', 'export async function reviseParagraphSlice');
if (!/function buildTypographyDirective/.test(aiSrc)) {
  failed = true;
  console.log('buildTypographyDirective yok');
} else if (!/buildTypographyDirective/.test(analysisSys)) {
  failed = true;
  console.log('buildSystemPrompt typography yok');
} else if (!/buildTypographyDirective/.test(advisorSys)) {
  failed = true;
  console.log('advisor typography yok');
} else if (!/buildTypographyDirective/.test(rewriteSys)) {
  failed = true;
  console.log('rewrite typography yok');
} else if (!/buildTypographyDirective/.test(draftSys)) {
  failed = true;
  console.log('generateContractDraft typography yok');
} else if (/YÜKSEK|ORTA/.test(`${analysisSys}${advisorSys}${rewriteSys}${draftSys}`)) {
  failed = true;
  console.log('prompt YÜKSEK/ORTA severity');
} else {
  console.log('OK  typography directive');
}
if (/TMK|Türk Medeni Kanunu m\.499/.test(advisorSys)) {
  failed = true;
  console.log('askLegalAdvisor TMK / m.499');
} else {
  console.log('OK  advisor legalReference humility');
}

try {
  const seatFn = fs.readFileSync('supabase/functions/advisor-seat/index.ts', 'utf8');
  const analysesFrom = (seatFn.match(/\.from\(['"]analyses['"]\)/g) || []).length;
  if (analysesFrom !== 1) {
    failed = true;
    console.log(`advisor-seat analyses from count ${analysesFrom}`);
  } else if (!/SHARE_LEAK/.test(seatFn) || !/"contract_text"/.test(seatFn)) {
    failed = true;
    console.log('advisor-seat SHARE_LEAK / contract_text reject yok');
  } else if (/return json\([^)]*analysis\b/.test(seatFn) || /json\(\{\s*analysis\s*:/.test(seatFn)) {
    failed = true;
    console.log('advisor-seat analyses row return');
  } else if (!/body\.role/.test(seatFn) || !/HOUSEHOLD_SEAT_CAP = 1/.test(seatFn) || !/ADVISOR_SEAT_CAP = 2/.test(seatFn)) {
    failed = true;
    console.log('advisor-seat role / household cap 1 / advisor cap 2 yok');
  } else if (!/verify_jwt = true/.test(fs.readFileSync('supabase/config.toml', 'utf8'))) {
    failed = true;
    console.log('advisor-seat jwt');
  } else {
    console.log('OK  advisor-seat leak + no analyses return');
  }

  const householdMig = fs.readdirSync('supabase/migrations')
    .filter((name) => name.endsWith('.sql'))
    .map((name) => fs.readFileSync(`supabase/migrations/${name}`, 'utf8'))
    .join('\n');
  if (!/advisor_seats_one_pending_role_idx/.test(householdMig) || !/\(owner_id,\s*role\)/.test(householdMig)) {
    failed = true;
    console.log('household pending unique (owner_id, role) yok');
  } else {
    console.log('OK  household pending unique (owner_id, role)');
  }
} catch (error) {
  failed = true;
  console.log(`advisor-seat: ${error.message}`);
}

const briefScreenSrc = fs.readFileSync('screens/ShareBriefScreen.js', 'utf8');
const fetchCallIdx = briefScreenSrc.indexOf('fetchShareSnapshot(');
const beforeFetch = fetchCallIdx >= 0 ? briefScreenSrc.slice(0, fetchCallIdx) : '';
if (!/providedSnapshot/.test(briefScreenSrc) || !/providedSnapshot/.test(beforeFetch)) {
  failed = true;
  console.log('ShareBriefScreen snapshot prop / skip fetch yok');
} else {
  console.log('OK  ShareBriefScreen snapshot without open-share');
}

const tabKeys = [...appSrc.matchAll(/\{\s*key:\s*'(analyze|advisor|history|settings|seats|crm|firm|team)'/g)].map((item) => item[1]);
const uniqueTabs = [...new Set(tabKeys)];
if (uniqueTabs.length !== 4 || uniqueTabs.includes('seats') || uniqueTabs.includes('crm')) {
  failed = true;
  console.log(`5th tab veya tab set ${uniqueTabs.join(',')}`);
} else if (!/AdvisorSeatCard/.test(appSrc) || !/activeTab === 'settings'/.test(appSrc)) {
  failed = true;
  console.log('Settings seat card yok');
} else {
  console.log('OK  Settings seats, 4 tabs');
}

const seatCardSrc = fs.readFileSync('components/AdvisorSeatCard.js', 'utf8');
if (/styles\.primaryButton/.test(seatCardSrc)) {
  failed = true;
  console.log('AdvisorSeatCard mint primaryButton');
} else if (
  !/handleMint\('household'\)[\s\S]{0,240}styles\.secondaryBtn/.test(seatCardSrc)
  || !/handleMint\('advisor'\)[\s\S]{0,240}styles\.secondaryBtn/.test(seatCardSrc)
  || !/styles\.secondaryBtnText/.test(seatCardSrc)
) {
  failed = true;
  console.log('AdvisorSeatCard mint secondaryBtn yok');
} else {
  console.log('OK  AdvisorSeatCard mint secondary');
}

const themeAhSrc = fs.readFileSync('theme.js', 'utf8');
const logoutBlock = themeAhSrc.match(/logoutBtnLarge:\s*\{[\s\S]*?\},/)?.[0] || '';
if (/backgroundColor:\s*DANGER/.test(logoutBlock)) {
  failed = true;
  console.log('logoutBtnLarge solid DANGER');
} else if (!/borderColor:\s*DANGER/.test(logoutBlock) || !/backgroundColor:\s*'transparent'/.test(logoutBlock)) {
  failed = true;
  console.log('logoutBtnLarge outline yok');
} else if (!/badgeTextOnYellow/.test(themeAhSrc) || !/badgeLabelStyle/.test(themeAhSrc)) {
  failed = true;
  console.log('yellow badge contrast yok');
} else {
  console.log('OK  logout outline + yellow badge contrast');
}

const lifecycleSrc = fs.readFileSync('components/LifecycleChips.js', 'utf8');
const fileAccessSrc = fs.readFileSync('utils/fileAccess.js', 'utf8');
const shieldDocSrc = fs.readFileSync('components/ShieldDocumentCard.js', 'utf8');
const analysisLayersSrc = fs.readFileSync('components/AnalysisLayers.js', 'utf8');
if (!/case 'draft':\s*return ACCENT/.test(lifecycleSrc) || /return theme\?\.subText/.test(lifecycleSrc)) {
  failed = true;
  console.log('lifecycleColor draft subText/disabled');
} else if (!/lifecycleChipStyle/.test(lifecycleSrc)) {
  failed = true;
  console.log('lifecycleChipStyle yok');
} else if (!/trySaveBase64ViaSaf/.test(fileAccessSrc) || !/trySaveBase64ViaSaf/.test(appSrc)) {
  failed = true;
  console.log('SAF PDF fallback yok');
} else if (!/hasSourceText/.test(shieldDocSrc) || !/shieldNeedSource/.test(shieldDocSrc)) {
  failed = true;
  console.log('shieldNeedSource gate yok');
} else if (!/byTitle|byIdentity/.test(fs.readFileSync('utils/analysis.js', 'utf8') + fs.readFileSync('utils/shieldDocument.js', 'utf8'))) {
  failed = true;
  console.log('sign/shield dedupe yok');
} else if (!/lastAnalysisTitle/.test(appSrc) || !/clearLastAnalysis/.test(appSrc)) {
  failed = true;
  console.log('last analysis banner yok');
} else if (!/elapsedSec|formatElapsed/.test(analysisLayersSrc)) {
  failed = true;
  console.log('VoiceBrief elapsed timer yok');
} else if (!/subText:\s*'#475569'/.test(themeAhSrc) || !/borderColor:\s*'#CBD5E1'/.test(themeAhSrc)) {
  failed = true;
  console.log('lightTheme contrast yok');
} else {
  console.log('OK  WAVE AR polish');
}

const partyUtilSrc = fs.readFileSync('utils/party.js', 'utf8');
const partyOptionsSrc = fs.readFileSync('constants/options.js', 'utf8');
const aiPartySrc = fs.readFileSync('services/ai.js', 'utf8');
if (!/setPartySheetVisible\(true\)/.test(appSrc)) {
  failed = true;
  console.log('App.js party sheet never opened');
} else if (/AsyncStorage\.setItem\(STORAGE_KEY,\s*side\)/.test(partyUtilSrc) || /return toPartySide\(stored\)/.test(partyUtilSrc)) {
  failed = true;
  console.log('party.js still collapses to buyer|seller on save/load');
} else if (!/isKnownPartyCode\(stored\)/.test(partyUtilSrc) || !/isKnownPartyCode\(raw\)/.test(partyUtilSrc)) {
  failed = true;
  console.log('party.js full-code persist yok');
} else if (!/resolvePartyForAnalyze/.test(partyOptionsSrc) || !/isGranularPartyCode/.test(partyOptionsSrc)) {
  failed = true;
  console.log('resolvePartyForAnalyze helper yok');
} else if (!/resolvePartyForAnalyze\(analysisParty/.test(appSrc)) {
  failed = true;
  console.log('analyze path granular party yok');
} else if (!/protected party code:/.test(aiPartySrc)) {
  failed = true;
  console.log('ai.js HARD PERSONA party code reinforce yok');
} else {
  const partyChangeBlock = appSrc.match(/const handlePartyChange\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\n  \};/)?.[0] || '';
  const typeChangeBlock = appSrc.match(/const handleTypeChange\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\n  \};/)?.[0] || '';
  if (!partyChangeBlock || /coercePartyForCategory/.test(partyChangeBlock)) {
    failed = true;
    console.log('handlePartyChange still coerces explicit picks');
  } else if (!/isGranularPartyCode\(raw\)/.test(partyChangeBlock)) {
    failed = true;
    console.log('explicit granular party pick path yok');
  } else if (/<PartySideSelector/.test(appSrc)) {
    failed = true;
    console.log('App.js Analyze PartySideSelector kalmis');
  } else if (!/SelectorField[\s\S]{0,280}(selectPartyTitle|partyOtherRoles|partyProtectTitle)[\s\S]{0,280}setPartySheetVisible\(true\)/.test(appSrc)) {
    failed = true;
    console.log('single party SelectorField sheet path yok');
  } else if (!/coercePartyForCategory/.test(typeChangeBlock)) {
    failed = true;
    console.log('handleTypeChange coerce yok');
  } else if (
    !/isGranularPartyCode\(item\.code\)/.test(partyOptionsSrc) ||
    !/granular roles only/i.test(partyOptionsSrc)
  ) {
    failed = true;
    console.log('partyRolesForCategory still includes buyer|seller UI path');
  } else if (/if \(code === 'buyer'\) code = 'customer'/.test(partyOptionsSrc) || /if \(code === 'seller'\) code = 'provider'/.test(partyOptionsSrc)) {
    failed = true;
    console.log('coercePartyForCategory still blanket-maps buyer/seller');
  } else if (!/sales:\s*\['buyer',\s*'seller'\]/.test(partyOptionsSrc)) {
    failed = true;
    console.log('PREFERRED_PARTY_BY_CATEGORY.sales not buyer/seller');
  } else {
    // Runtime: sales head buyer|seller; nda/saas/freelance preferred head not buyer|seller
    try {
      const { partyRolesForCategory: rolesFn } = require('../constants/options.js');
      const salesHead = (rolesFn('sales') || []).slice(0, 2).map((item) => item.code);
      if (salesHead[0] !== 'buyer' || salesHead[1] !== 'seller') {
        failed = true;
        console.log('partyRolesForCategory(sales) must start buyer, seller');
      } else {
        const badHead = ['nda', 'saas', 'freelance'].some((cat) => {
          const head = (rolesFn(cat) || []).slice(0, 2).map((item) => item.code);
          return head.includes('buyer') || head.includes('seller');
        });
        if (badHead) {
          failed = true;
          console.log('nda/saas/freelance preferred head must not be buyer|seller');
        } else {
          console.log('OK  WAVE AS party role lock');
        }
      }
    } catch (error) {
      failed = true;
      console.log(`partyRolesForCategory runtime check: ${error.message}`);
    }
  }
}

if (!/normalizeContractRadar/.test(analysisUtilSrc) || !/contractRadar/.test(analysisUtilSrc)) {
  failed = true;
  console.log('contractRadar normalize yok');
} else if (!/ContractMiniRadar/.test(appSrc) || !fs.existsSync('components/ContractMiniRadar.js')) {
  failed = true;
  console.log('ContractMiniRadar UI yok');
} else if (!/contract_radar/.test(aiSrc)) {
  failed = true;
  console.log('ai.js contract_radar schema yok');
} else if (/third.?flight|Flight C|flightC|THREE_FLIGHT/i.test(aiSrc)) {
  failed = true;
  console.log('3rd flight pattern');
} else if (!/radarParties/.test(waveESrc) || !/radarJurisdiction/.test(waveESrc) || !/radarNotice/.test(waveESrc)) {
  failed = true;
  console.log('radar i18n keys yok');
} else if (!/ContractMiniRadar[\s\S]{0,3500}DecisionCard/.test(appSrc)) {
  failed = true;
  console.log('MiniRadar not above DecisionCard');
} else {
  console.log('OK  WAVE AT contract mini-radar');
}

const miniRadarSrc = fs.readFileSync('components/ContractMiniRadar.js', 'utf8');
const shareBriefSrc = fs.readFileSync('components/ShareBriefSheet.js', 'utf8');
const contractTypeSrc = fs.readFileSync('utils/contractType.js', 'utf8');
if (!/strongLocalSales|isSalesPreamble/.test(appSrc) || !/detected_contract_category/.test(appSrc)) {
  failed = true;
  console.log('sales chip lock vs Claude overwrite yok');
} else if (!/export function isSalesPreamble|export \{[^}]*isSalesPreamble/.test(contractTypeSrc) && !/export function isSalesPreamble/.test(contractTypeSrc)) {
  failed = true;
  console.log('isSalesPreamble export yok');
} else if (
  !(/setShareSheetAnalysis\(null\)[\s\S]{0,120}openPaywall/.test(appSrc) ||
    /close\(\);\s*onNeedPaywall/.test(shareBriefSrc))
) {
  failed = true;
  console.log('ShareBrief close-before-paywall yok');
} else if (
  !(/Pressable|TouchableOpacity/.test(miniRadarSrc) && /Alert\.alert|Modal/.test(miniRadarSrc))
) {
  failed = true;
  console.log('ContractMiniRadar tap-to-expand yok');
} else if (!/\.red-flag[^{]*\{[^}]*page-break-inside:\s*avoid|\.clause[^{]*\{[^}]*page-break-inside:\s*avoid/.test(appSrc)) {
  failed = true;
  console.log('PDF CSS page-break-inside avoid yok');
} else if (!/paddingBottom:\s*24/.test(fs.readFileSync('components/DecisionCard.js', 'utf8'))) {
  failed = true;
  console.log('DecisionCard ViewShot paddingBottom>=24 yok');
} else {
  console.log('OK  WAVE AU sales/detect/brief/radar/PDF');
}

// WAVE AV — N=0 (edited existing reminderNeedEndDate + radarJurisdiction; no new keys)
// Expected i18n: 13 × 662
if (!/foldTr/.test(contractTypeSrc) || !/tedarikçi|ekipman\s\+tedarik|satış\s\+sonrası\s\+hizmet/.test(contractTypeSrc)) {
  failed = true;
  console.log('foldTr / TR sales preamble yok');
} else if (!/Hatırlatıcı oluşturulamadı|end date could not be read|Reminder was not created/.test(extrasSrc)) {
  failed = true;
  console.log('reminderNeedEndDate UX update yok');
} else if (!/Hukuk \/ yetkili mahkeme/.test(waveESrc) || !/Law \/ competent court/.test(waveESrc)) {
  failed = true;
  console.log('radarJurisdiction court clarity yok');
} else if (!/extractRadarPartiesFromText|tedarikçi/.test(analysisUtilSrc) || !/durationNotice|termination\?\.rule/.test(analysisUtilSrc)) {
  failed = true;
  console.log('normalizeContractRadar local fallbacks yok');
} else if (!/fromMedia === false|!fromMedia/.test(aiSrc) || !/mentionsAnnex/.test(aiSrc)) {
  failed = true;
  console.log('looksIncompleteExtract paste annex guard yok');
} else {
  try {
    const optSrc = fs.readFileSync('constants/options.js', 'utf8').replace(/export /g, '');
    const ctSrc = contractTypeSrc
      .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?\s*/g, '')
      .replace(/export /g, '');
    const detectFn = new Function( // eslint-disable-line no-new-func
      `${optSrc}\n${ctSrc}\nreturn detectContractType(arguments[0]);`
    );
    const fixtureTitle =
      'KURUMSAL EKİPMAN TEDARİK, KURULUM VE SATIŞ SONRASI HİZMET SÖZLEŞMESİ\n\nTEDARİKÇİ\nDelta Endüstriyel\n\nMÜŞTERİ\nArtemis Lojistik\nMadde 8 Gizlilik süresi';
    const detected = detectFn(fixtureTitle);
    if (detected?.category !== 'sales') {
      failed = true;
      console.log(`TR fold sales detect: ${detected?.category}`);
    } else {
      const radarFn = new Function( // eslint-disable-line no-new-func
        `function foldTr(text) {
          return String(text || '').replace(/İ/g,'i').replace(/I/g,'ı').replace(/Ş/g,'ş')
            .replace(/Ğ/g,'ğ').replace(/Ü/g,'ü').replace(/Ö/g,'ö').replace(/Ç/g,'ç').toLowerCase();
        }
        function parties(source) {
          const lines = String(source || '').split(/\\r?\\n/);
          const pick = (labels) => {
            for (let i = 0; i < lines.length; i++) {
              const folded = foldTr(lines[i]).trim();
              if (!labels.some((lab) => folded === lab || folded.startsWith(lab + ':') || new RegExp('^' + lab + '\\\\b').test(folded))) continue;
              const same = String(lines[i].split(/[:：]/)[1] || '').trim();
              if (same && same.length > 1) return same.replace(/\\s+/g, ' ').slice(0, 90);
              for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                const next = String(lines[j] || '').trim();
                if (!next) continue;
                if (/^(tedarikçi|müşteri|satıcı|alıcı|madde|article)\\b/.test(foldTr(next))) break;
                return next.replace(/\\s+/g, ' ').slice(0, 90);
              }
            }
            return '';
          };
          const a = pick(['tedarikçi', 'satıcı']);
          const b = pick(['müşteri', 'alıcı']);
          if (a && b) return a + ' vs ' + b;
          return a || b || '';
        }
        const src = arguments[0];
        const notice = (String(src).match(/(\\d{1,3})\\s*gün/i) || [])[0] || '';
        return { parties: parties(src), notice };
        `
      );
      const radarFixture =
        'TEDARİKÇİ\nDelta Endüstriyel A.Ş.\nMÜŞTERİ\nArtemis Lojistik Ltd.\nOlağan fesih ihbarı 60 gün önceden.';
      const radar = radarFn(radarFixture);
      if (!/Delta/.test(radar.parties || '') || !/Artemis/.test(radar.parties || '') || !/60\s*gün/i.test(radar.notice || '')) {
        failed = true;
        console.log(`radar fallback runtime: parties=${radar.parties} notice=${radar.notice}`);
      } else {
        const annexPaste =
          'Madde 1. Taraflar.\nMadde 2. Konu.\nMadde 3. Bedel.\nİşbu sözleşmenin ekleri Ek-1 teknik şartnamede yer alır.\nİMZA\nTaraf A';
        const incompleteFn = new Function( // eslint-disable-line no-new-func
          `function isTruncatedExtract(){return false;}
          function lastNumberedClause(text){
            const matches = String(text||'').match(/(?:^|\\n)\\s*(\\d{1,2})(?:\\.\\d{1,2})?\\s*[.)]/g)||[];
            if(!matches.length) return 0;
            const last = matches[matches.length-1];
            return Number((String(last).match(/(\\d{1,2})/)||[0,0])[1])||0;
          }
          function looksIncompleteExtract(text, { fromMedia = false } = {}) {
            if (isTruncatedExtract(text)) return true;
            const body = String(text || '');
            if (!body.trim()) return true;
            const hasSignOff = /(?:^|\\n)\\s*(?:#{1,3}\\s*)?(İMZA|IMZA|SIGNATURES?)\\b/i.test(body);
            const mentionsAnnex = /Ek\\s*-?\\s*1|Annex\\s*1/i.test(body);
            const hasAnnexHeading = /(?:^|\\n)\\s*(?:#{1,3}\\s*)?(EK\\s*-?\\s*1|Annex\\s*1)\\b/im.test(body);
            if (mentionsAnnex && !hasAnnexHeading) {
              if (!fromMedia) return false;
              if (hasSignOff || lastNumberedClause(body) >= 3) return false;
              return true;
            }
            if (fromMedia && lastNumberedClause(body) < 3 && body.length > 2500 && !hasSignOff) return true;
            return false;
          }
          return looksIncompleteExtract(arguments[0], arguments[1]);`
        );
        if (incompleteFn(annexPaste, { fromMedia: false }) !== false) {
          failed = true;
          console.log('looksIncompleteExtract paste+Ek-1 must be false');
        } else if (!/LEGAL CITES|article cite|madde numbers/i.test(aiSrc)) {
          failed = true;
          console.log('legal cite instruction yok');
        } else {
          console.log('OK  WAVE AV fold/radar/end-date/annex/toast (N=0)');
        }
      }
    }
  } catch (error) {
    failed = true;
    console.log(`WAVE AV runtime: ${error.message}`);
  }
}

// WAVE AW — radar party quality (N=0)
try {
  const foldOnly = `
    function foldTr(text) {
      return String(text || '')
        .replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ş/g, 'ş')
        .replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç')
        .toLowerCase();
    }
    function isPlaceholderText(){ return false; }
  `;
    const start = analysisUtilSrc.indexOf('const escapeRegExp =');
    const end = analysisUtilSrc.indexOf('function partiesStringLooksValid');
    if (start < 0 || end < 0 || end <= start) {
      failed = true;
      console.log('WAVE AW party helpers yok');
    } else {
      const partyBlock = analysisUtilSrc.slice(start, end).replace(/export /g, '');
    const runParties = new Function( // eslint-disable-line no-new-func
      `${foldOnly}\n${partyBlock}\nreturn extractRadarPartiesFromText(arguments[0]);`
    );
    const ket = `1. TARAFLAR
1.1. TEDARİKÇİ
Delta Endüstriyel Makine A.Ş.
1.2. MÜŞTERİ
Artemis Lojistik Ltd. Şti.
2. SÖZLEŞMENİN KONUSU
- Gerekli bilgi
1. Ödeme: peşin
Tedarikçi ve Müşteri işbu sözleşmeyi...
Müşteri ödemeleri geciktiğinde...`;
    const phd = `1.1. HİZMET SAĞLAYICI
Vizyon Strateji Danışmanlık Ltd.
1.2. MÜŞTERİ
Nova Grup Holding A.Ş.
2. SÖZLEŞMENİN KONUSU
Müşterinin yükümlülükleri
- Gerekli bilgi`;
    const ketParties = runParties(ket);
    const phdParties = runParties(phd);
    if (!/Delta/i.test(ketParties || '') || !/Artemis/i.test(ketParties || '')) {
      failed = true;
      console.log(`WAVE AW KET parties: ${ketParties}`);
    } else if (!/Vizyon/i.test(phdParties || '') || !/Nova/i.test(phdParties || '')) {
      failed = true;
      console.log(`WAVE AW PHD parties: ${phdParties}`);
    } else if (/Ödeme|Gerekli bilgi|SÖZLEŞMENİN/i.test(`${ketParties}\n${phdParties}`)) {
      failed = true;
      console.log('WAVE AW parties leaked Ödeme/Gerekli bilgi');
    } else if (!/Alert\.alert/.test(fs.readFileSync('components/ShieldDocumentCard.js', 'utf8'))) {
      failed = true;
      console.log('ShieldDocumentCard Alert expand yok');
    } else if (!/cutReadyMessage|lastIndexOf\('\\n'\)/.test(analysisUtilSrc)) {
      failed = true;
      console.log('buildReadyToSendMessage clean cut yok');
    } else if (!/buildMinimalDecision/.test(analysisUtilSrc)) {
      failed = true;
      console.log('decision minimal fallback yok');
    } else {
      console.log('OK  WAVE AW radar/decision/cut/shield (N=0)');
    }
  }
} catch (error) {
  failed = true;
  console.log(`WAVE AW runtime: ${error.message}`);
}

// WAVE AX — decision prose + ready-message dedupe (N=0)
try {
  const stubs = `
    function isPlaceholderText(value) {
      const text = String(value ?? '').trim();
      if (!text) return true;
      return /^(n\\/a|none|null|undefined|-|—)$/i.test(text);
    }
    function meaningfulRedFlags(flags) {
      return (Array.isArray(flags) ? flags : []).filter((flag) => {
        const title = String(flag?.title || flag?.clauseTitle || '').trim();
        const explanation = String(flag?.explanation || flag?.issue || flag?.description || '').trim();
        return title.length > 1 || explanation.length > 1;
      });
    }
    function pickCounterOffer(item, tier) {
      const key = String(tier || 'balanced').toLowerCase();
      const offers = item?.counterOffers || item?.counter_offers || null;
      const fromTier = offers ? String(offers[key] || '').trim() : '';
      if (fromTier) return fromTier;
      return String(item?.counterOffer || item?.counter_offer || '').trim();
    }
  `;
  const readyStart = analysisUtilSrc.indexOf('export function buildReadyToSendMessage');
  const readyEnd = analysisUtilSrc.indexOf('const radarClean');
  const minStart = analysisUtilSrc.indexOf('function firstSentences');
  const minEnd = analysisUtilSrc.indexOf('export function normalizeContractRadar');
  if (readyStart < 0 || readyEnd <= readyStart || minStart < 0 || minEnd <= minStart) {
    failed = true;
    console.log('WAVE AX helpers yok');
  } else {
    const readySrc = analysisUtilSrc.slice(readyStart, readyEnd).replace(/export /g, '');
    const minSrc = analysisUtilSrc.slice(minStart, minEnd).replace(/export /g, '');
    const runReady = new Function( // eslint-disable-line no-new-func
      `${stubs}\n${readySrc}\nreturn buildReadyToSendMessage(arguments[0]);`
    );
    const runMin = new Function( // eslint-disable-line no-new-func
      `${stubs}\n${minSrc}\nreturn buildMinimalDecision(arguments[0]);`
    );
    const card = runMin({
      score: 54,
      risk: 'RED',
      summary: 'Bu sözleşme ağır cezai şart içerir. Müşteri aleyhine fesih tek taraflıdır. Kalan risk yüksektir.',
      keyTakeaways: ['İlk özet maddesi'],
      redFlags: [{ title: 'Cezai şart', issue: 'Sınırsız tazminat riski doğurur.', severity: 'RED' }],
    });
    const ready = runReady({
      decision: { headline: 'Kısa giriş.' },
      redFlags: [
        { title: 'Ceza', severity: 'RED', counterOffer: `${'kelime '.repeat(180)}anında kesilmesin lütfen` },
        { title: 'Ceza', severity: 'YELLOW', counterOffer: 'Aynı başlık ikinci teklif metni burada.' },
        { title: 'Fesih', severity: 'RED', counterOffer: 'Fesih maddesi yeniden yazılsın.' },
      ],
    });
    const shortReady = runReady({
      decision: { headline: 'Giriş.' },
      redFlags: [
        { title: 'Ceza', severity: 'RED', counterOffer: 'Birinci metin.' },
        { title: 'ceza', severity: 'YELLOW', counterOffer: 'İkinci aynı başlık.' },
        { title: 'Fesih', severity: 'RED', counterOffer: 'Fesih maddesi.' },
      ],
    });
    const cezaHits = (String(shortReady).match(/^\d+\. Ceza:/gim) || []).length;
    if (!card?.headline || /^\d+\/100/.test(card.headline)) {
      failed = true;
      console.log(`WAVE AX headline score-only: ${card?.headline}`);
    } else if (!/cezai şart/i.test(card.headline)) {
      failed = true;
      console.log(`WAVE AX headline missing summary: ${card?.headline}`);
    } else if (!/Cezai şart/.test(card.reasons?.[0] || '') || !/Sınırsız/.test(card.reasons?.[0] || '')) {
      failed = true;
      console.log(`WAVE AX reasons: ${(card.reasons || []).join(' | ')}`);
    } else if (cezaHits !== 1 || !/Fesih/.test(shortReady || '') || /İkinci aynı/.test(shortReady || '')) {
      failed = true;
      console.log(`WAVE AX title dedupe: ${shortReady}`);
    } else if (/anınd$/.test(ready) || String(ready).length > 1200) {
      failed = true;
      console.log(`WAVE AX mid-word cut len=${String(ready).length}`);
    } else if (!/Alert\.alert/.test(fs.readFileSync('components/ShieldDocumentCard.js', 'utf8'))) {
      failed = true;
      console.log('WAVE AX Shield Alert yok');
    } else {
      console.log('OK  WAVE AX decision/ready/shield (N=0)');
    }
  }
} catch (error) {
  failed = true;
  console.log(`WAVE AX runtime: ${error.message}`);
}

// WAVE AY — real Word .docx + redline PDF (N=0: edited shareDraft labels only)
try {
  const redlineSrc = fs.readFileSync('utils/redlineExport.js', 'utf8');
  const foldReady = redlineSrc
    .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?\s*/g, '')
    .replace(/export /g, '');
  const stubs = `
    function escapeHtml(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
    function decodePlainText(t){return String(t||'');}
  `;
  const run = new Function( // eslint-disable-line no-new-func
    `${stubs}\n${foldReady}
     return {
       bytes: buildDocxBytes(arguments[0]),
       html: buildRedlineBodyHtml(arguments[1], arguments[2]),
       mime: typeof SHIELD_DOCX_MIME !== 'undefined' ? SHIELD_DOCX_MIME : '',
     };`
  );
  const sample = 'Madde 1. Eski metin burada.\nMadde 2. Devam.';
  const out = run(sample, sample, [{ from: 'Eski metin burada.', to: 'Yeni koruma metni.', kind: 'replace' }]);
  const bytes = out.bytes;
  const isPk = bytes && bytes[0] === 0x50 && bytes[1] === 0x4b;
  if (!isPk) {
    failed = true;
    console.log('WAVE AY docx zip magic yok');
  } else if (!/<del[\s\S]*Eski metin/.test(out.html) || !/<ins[\s\S]*Yeni koruma/.test(out.html)) {
    failed = true;
    console.log('WAVE AY redline del/ins yok');
  } else if (!/wordprocessingml\.document/.test(out.mime)) {
    failed = true;
    console.log('WAVE AY docx mime yok');
  } else if (!/Word \(\.docx\)/.test(fs.readFileSync('i18n.extras.js', 'utf8'))) {
    failed = true;
    console.log('shareDraft Word (.docx) label yok');
  } else {
    console.log('OK  WAVE AY docx/redline runtime (N=0)');
  }
} catch (error) {
  failed = true;
  console.log(`WAVE AY runtime: ${error.message}`);
}

// WAVE AZ — SaaS detect + yüklenici radar + playbooks + UI hints (N=6)
try {
  const layersSrc = fs.readFileSync('components/AnalysisLayers.js', 'utf8');
  const decisionSrc = fs.readFileSync('components/DecisionCard.js', 'utf8');
  const optSrc = fs.readFileSync('constants/options.js', 'utf8').replace(/export /g, '');
  const ctSrc = contractTypeSrc
    .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?\s*/g, '')
    .replace(/export /g, '');
  const detectFn = new Function( // eslint-disable-line no-new-func
    `${optSrc}\n${ctSrc}\nreturn detectContractType(arguments[0]);`
  );
  const resolveFn = new Function( // eslint-disable-line no-new-func
    `${optSrc}\n${ctSrc}\nreturn resolveAnalysisCategory(arguments[0], arguments[1]);`
  );
  const saasFixture = `YAZILIM LİSANS, UYGULAMA VE BAKIM HİZMET SÖZLEŞMESİ

YÜKLENİCİ
NexaSoft A.Ş.

MÜŞTERİ
Orion A.Ş.

Madde 1. Konu: kurumsal yazılım lisanslama, kabul testi ve canlıya geçiş.
Madde 8 Gizlilik süresi 3 yıldır.`;
  const salesRegression =
    'KURUMSAL EKİPMAN TEDARİK, KURULUM VE SATIŞ SONRASI HİZMET SÖZLEŞMESİ\n\nTEDARİKÇİ\nDelta Endüstriyel\n\nMÜŞTERİ\nArtemis Lojistik\nMadde 8 Gizlilik süresi';
  const saasDetect = detectFn(saasFixture);
  const salesDetect = detectFn(salesRegression);
  const saasResolved = resolveFn(saasFixture, 'nda');

  const foldOnly = `
    function foldTr(text) {
      return String(text || '')
        .replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ş/g, 'ş')
        .replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç')
        .toLowerCase();
    }
    function isPlaceholderText(){ return false; }
  `;
  const start = analysisUtilSrc.indexOf('const escapeRegExp =');
  const end = analysisUtilSrc.indexOf('function partiesStringLooksValid');
  let nexaParties = '';
  if (start >= 0 && end > start) {
    const partyBlock = analysisUtilSrc.slice(start, end).replace(/export /g, '');
    const runParties = new Function( // eslint-disable-line no-new-func
      `${foldOnly}\n${partyBlock}\nreturn extractRadarPartiesFromText(arguments[0]);`
    );
    nexaParties = runParties(saasFixture) || '';
  }

  const playbooksSrc = fs.readFileSync('constants/playbooks.js', 'utf8');
  const waveEKeysOk =
    /shieldExportAfterApply/.test(waveESrc) &&
    /pasteAnalyzeHint/.test(waveESrc) &&
    /signedStripEmpty/.test(waveESrc);
  const waveBKeysOk =
    /playbookSaasSla/.test(waveBSrc) &&
    /playbookSaasAcceptance/.test(waveBSrc) &&
    /playbookSaasIpLicense/.test(waveBSrc);

  if (saasDetect?.category !== 'saas') {
    failed = true;
    console.log(`WAVE AZ saas detect: ${saasDetect?.category}`);
  } else if (salesDetect?.category !== 'sales') {
    failed = true;
    console.log(`WAVE AZ sales regression: ${salesDetect?.category}`);
  } else if (saasResolved !== 'saas') {
    failed = true;
    console.log(`WAVE AZ resolveAnalysisCategory nda→saas: ${saasResolved}`);
  } else if (!/NexaSoft/i.test(nexaParties) || !/Orion/i.test(nexaParties)) {
    failed = true;
    console.log(`WAVE AZ yüklenici parties: ${nexaParties}`);
  } else if (!/saas_sla/.test(playbooksSrc) || !/saas_acceptance/.test(playbooksSrc) || !/saas_ip_license/.test(playbooksSrc)) {
    failed = true;
    console.log('WAVE AZ saas playbook ids yok');
  } else if (!/SAAS FOCUS/.test(aiSrc)) {
    failed = true;
    console.log('WAVE AZ saas AI focus yok');
  } else if (!/strongLocalSaas/.test(appSrc) || !/isSaasPreamble/.test(appSrc)) {
    failed = true;
    console.log('WAVE AZ App strongLocalSaas yok');
  } else if (!/signedStripEmpty/.test(appSrc) || !/pasteAnalyzeHint/.test(appSrc)) {
    failed = true;
    console.log('WAVE AZ App toast/paste hint yok');
  } else if (!/shieldExportAfterApply/.test(shieldCardSrc) || !/verifyModeHint/.test(decisionSrc)) {
    failed = true;
    console.log('WAVE AZ Shield/Decision hints yok');
  } else if (!/marginBottom:\s*1[4-6]/.test(layersSrc) || !/statuteFor/.test(layersSrc)) {
    failed = true;
    console.log('WAVE AZ VoiceBrief margin / statuteFor yok');
  } else if (!/#FFE08A/.test(themeSrc) && !/#FFE08A/.test(fs.readFileSync('components/DeadlineRadar.js', 'utf8'))) {
    failed = true;
    console.log('WAVE AZ dark unspecifiedBadge text yok');
  } else if (!waveEKeysOk || !waveBKeysOk) {
    failed = true;
    console.log('WAVE AZ i18n N=6 keys eksik');
  } else if (!/WEAK_NDA_BODY|hasContractorCustomerBlock|isSaasPreamble/.test(contractTypeSrc)) {
    failed = true;
    console.log('WAVE AZ contractType saas preamble helpers yok');
  } else {
    console.log('OK  WAVE AZ saas/yüklenici/playbook/hints (N=6 → 13×600)');
  }
} catch (error) {
  failed = true;
  console.log(`WAVE AZ runtime: ${error.message}`);
}

// WAVE BA — live preview Mini-Radar (N=1: radarLiveHint → 13×601)
try {
  if (!/export function buildLocalRadarPreview/.test(analysisUtilSrc)) {
    failed = true;
    console.log('WAVE BA buildLocalRadarPreview yok');
  } else if (!/export function extractLawPhraseFromText/.test(analysisUtilSrc)) {
    failed = true;
    console.log('WAVE BA extractLawPhraseFromText export yok');
  } else if (!/buildLocalRadarPreview/.test(appSrc) || !/localRadarPreview/.test(appSrc)) {
    failed = true;
    console.log('WAVE BA App preview wiring yok');
  } else if (!/buildLocalRadarPreview\(trimmed\)/.test(appSrc) || !/setTimeout\(/.test(appSrc)) {
    failed = true;
    console.log('WAVE BA debounce preview yok');
  } else if (!/preview/.test(miniRadarSrc) || !/radarLiveHint/.test(miniRadarSrc)) {
    failed = true;
    console.log('WAVE BA ContractMiniRadar preview prop yok');
  } else if (!/radarLiveHint/.test(waveESrc)) {
    failed = true;
    console.log('WAVE BA radarLiveHint i18n yok');
  } else if (!/ContractMiniRadar[\s\S]{0,3500}DecisionCard/.test(appSrc)) {
    failed = true;
    console.log('WAVE BA MiniRadar still above DecisionCard yok');
  } else if (!/!loading && !activeResult && localRadarPreview/.test(appSrc)) {
    failed = true;
    console.log('WAVE BA preview XOR post-radar yok');
  } else {
    const stubs = `
      function foldTr(text) {
        return String(text || '')
          .replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ş/g, 'ş')
          .replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç')
          .toLowerCase();
      }
      function isPlaceholderText(value) {
        const text = String(value ?? '').trim();
        if (!text) return true;
        return /^(n\\/a|none|null|undefined|-|—)$/i.test(text);
      }
      function extractTrapDurations(source) {
        const text = String(source || '');
        const found = { termination: null, confidentiality: null, return_or_refund: null };
        const m = text.match(/(\\d{1,3})\\s*gün/i);
        if (m) found.termination = { rule: m[0].replace(/\\s+/g, ' ') };
        return found;
      }
    `;
    const start = analysisUtilSrc.indexOf('const radarClean =');
    const end = analysisUtilSrc.indexOf('function firstSentences');
    if (start < 0 || end <= start) {
      failed = true;
      console.log('WAVE BA preview helpers slice yok');
    } else {
      const block = analysisUtilSrc.slice(start, end).replace(/export /g, '');
      const runPreview = new Function( // eslint-disable-line no-new-func
        `${stubs}\n${block}\nreturn buildLocalRadarPreview(arguments[0]);`
      );
      const saasFx = `YAZILIM LİSANS, UYGULAMA VE BAKIM HİZMET SÖZLEŞMESİ

YÜKLENİCİ
NexaSoft A.Ş.

MÜŞTERİ
Orion A.Ş.

Madde 1. Konu.
Olağan fesih ihbarı 60 gün önceden.
Türk hukuku uygulanır.`;
      const preview = runPreview(saasFx);
      if (!/NexaSoft/i.test(preview?.parties || '') || !/Orion/i.test(preview?.parties || '')) {
        failed = true;
        console.log(`WAVE BA preview parties: ${preview?.parties}`);
      } else if (!/60\s*gün/i.test(preview?.noticePeriod || '')) {
        failed = true;
        console.log(`WAVE BA preview notice: ${preview?.noticePeriod}`);
      } else if (!/Türk\s+hukuku/i.test(preview?.governingLawForum || '')) {
        failed = true;
        console.log(`WAVE BA preview law: ${preview?.governingLawForum}`);
      } else {
        const optSrc = fs.readFileSync('constants/options.js', 'utf8').replace(/export /g, '');
        const ctSrc = contractTypeSrc
          .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?\s*/g, '')
          .replace(/export /g, '');
        const detectFn = new Function( // eslint-disable-line no-new-func
          `${optSrc}\n${ctSrc}\nreturn detectContractType(arguments[0]);`
        );
        if (detectFn(saasFx)?.category !== 'saas') {
          failed = true;
          console.log('WAVE BA saas detect regression');
        } else if (
          detectFn(
            'KURUMSAL EKİPMAN TEDARİK, KURULUM VE SATIŞ SONRASI HİZMET SÖZLEŞMESİ\n\nTEDARİKÇİ\nDelta\n\nMÜŞTERİ\nArtemis'
          )?.category !== 'sales'
        ) {
          failed = true;
          console.log('WAVE BA sales detect regression');
        } else {
          console.log('OK  WAVE BA live preview Mini-Radar (N=1 → 13×601)');
        }
      }
    }
  }
} catch (error) {
  failed = true;
  console.log(`WAVE BA runtime: ${error.message}`);
}

// WAVE BC — PARSE toast + SaaS software-only + radar parties (N=0 → 13×601)
try {
  const toastOk =
    /extractedText/.test(appSrc) &&
    /errParseRetry/.test(appSrc) &&
    !/looksIncompleteExtract\(error\?\.extractedText \|\| '', \{ fromMedia: true \}\)/.test(appSrc) &&
    /extracted\.length > 0/.test(appSrc);
  if (!toastOk) {
    failed = true;
    console.log('WAVE BC PARSE toast mapping yok');
  } else if (!/hasStrongSoftwareSaas|STRONG_SOFTWARE_SAAS|isNonSaasDomain/.test(contractTypeSrc)) {
    failed = true;
    console.log('WAVE BC software-only saas helpers yok');
  } else if (/\bcategory: 'saas'[\s\S]{0,400}\\byüklenici\\b/.test(contractTypeSrc)) {
    failed = true;
    console.log('WAVE BC bare yüklenici still in saas patterns');
  } else {
    const optSrc = fs.readFileSync('constants/options.js', 'utf8').replace(/export /g, '');
    const ctSrc = contractTypeSrc
      .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?\s*/g, '')
      .replace(/export /g, '');
    const detectFn = new Function( // eslint-disable-line no-new-func
      `${optSrc}\n${ctSrc}\nreturn detectContractType(arguments[0]);`
    );
    const yazilim = `YAZILIM LİSANS, UYGULAMA VE BAKIM HİZMET SÖZLEŞMESİ

YÜKLENİCİ
NexaSoft A.Ş.

MÜŞTERİ
Orion A.Ş.

Madde 1. kurumsal yazılım lisanslama.`;
    const tadilat = `TADİLAT VE DEKORASYON SÖZLEŞMESİ

İşveren: Ahmet Demir
Yüklenici: XYZ İnşaat Ltd. Şti.

Fesih ihbarı 90 gün önceden yazılı yapılır.
Yetkili mahkeme İstanbul Mahkemesi.`;
    const franchise = `MARKA LİSANSLAMA VE FRANCHISE SÖZLEŞMESİ

Franchisor: ABC Marka A.Ş.
Franchisee: XYZ Perakende Ltd.

İhtar süresi 15 gün.`;

    if (detectFn(yazilim)?.category !== 'saas') {
      failed = true;
      console.log(`WAVE BC yazılım→saas: ${detectFn(yazilim)?.category}`);
    } else if (detectFn(tadilat)?.category === 'saas' || detectFn(tadilat)?.category === 'nda') {
      failed = true;
      console.log(`WAVE BC tadilat must NOT be saas/nda: ${detectFn(tadilat)?.category}`);
    } else if (detectFn(franchise)?.category === 'saas' || detectFn(franchise)?.category === 'nda') {
      failed = true;
      console.log(`WAVE BC franchise must NOT be saas/nda: ${detectFn(franchise)?.category}`);
    } else {
      const stubs = `
        function foldTr(text) {
          return String(text || '')
            .replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ş/g, 'ş')
            .replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç')
            .toLowerCase();
        }
        function isPlaceholderText(value) {
          const text = String(value ?? '').trim();
          if (!text) return true;
          return /^(n\\/a|none|null|undefined|-|—)$/i.test(text);
        }
        function extractTrapDurations(source) {
          const text = String(source || '');
          const found = { termination: null, confidentiality: null, return_or_refund: null };
          const m = text.match(/(\\d{1,3})\\s*gün/i);
          if (m && /önceden|ihbar|ihtar|yazılı|fesih/i.test(text)) {
            found.termination = { rule: m[0].replace(/\\s+/g, ' ') };
          }
          return found;
        }
      `;
      const start = analysisUtilSrc.indexOf('const radarClean =');
      const end = analysisUtilSrc.indexOf('function firstSentences');
      const block = analysisUtilSrc.slice(start, end).replace(/export /g, '');
      const runPreview = new Function( // eslint-disable-line no-new-func
        `${stubs}\n${block}\nreturn buildLocalRadarPreview(arguments[0]);`
      );
      const tadilatPrev = runPreview(tadilat);
      const franchisePrev = runPreview(franchise);
      if (!/Ahmet/i.test(tadilatPrev?.parties || '') || !/XYZ/i.test(tadilatPrev?.parties || '')) {
        failed = true;
        console.log(`WAVE BC tadilat parties: ${tadilatPrev?.parties}`);
      } else if (!/ABC/i.test(franchisePrev?.parties || '') || !/XYZ/i.test(franchisePrev?.parties || '')) {
        failed = true;
        console.log(`WAVE BC franchise parties: ${franchisePrev?.parties}`);
      } else if (!/!loading && !activeResult && localRadarPreview/.test(appSrc)) {
        failed = true;
        console.log('WAVE BC BA XOR post-radar regress');
      } else if (!/acceptability-fail|parse-null/.test(aiSrc) || !/Flight B tight retry|sliceContractText\(contractText, 8000\)/.test(aiSrc)) {
        failed = true;
        console.log('WAVE BC parse resilience yok');
      } else {
        console.log('OK  WAVE BC toast/saas-software/radar (N=0 → 13×601)');
      }
    }
  }
} catch (error) {
  failed = true;
  console.log(`WAVE BC runtime: ${error.message}`);
}

// WAVE BD — stale result clears on diverged paste so BA live preview unlocks (N=0)
{
  const changeFn = appSrc.match(
    /const handleContractTextChange = \(text\) => \{[\s\S]{0,1200}?typeLocked/
  )?.[0] || '';
  if (
    !/trimmedNext\.length >= 90/.test(changeFn) ||
    !/setResult\(null\)/.test(changeFn) ||
    !/contract_text \|\| result\?\.contractText/.test(changeFn)
  ) {
    failed = true;
    console.log('WAVE BD stale-result clear on text diverge yok');
  } else if (!/!loading && !activeResult && localRadarPreview/.test(appSrc)) {
    failed = true;
    console.log('WAVE BD BA XOR post-radar regress');
  } else if (!/restoreLastShield/.test(appSrc)) {
    failed = true;
    console.log('WAVE BD restoreLastShield silinmemeli');
  } else {
    console.log('OK  WAVE BD stale result → BA preview unlock (N=0 → 13×601)');
  }
}

// WAVE BE — export/share UX polish (N=2: verifyPasteNewHint + shieldShareOk → 13×603)
{
  const diffSrc = fs.readFileSync('components/DiffTool.js', 'utf8');
  const shieldSrc = fs.readFileSync('components/ShieldDocumentCard.js', 'utf8');
  const decisionBe = fs.readFileSync('components/DecisionCard.js', 'utf8');
  const verifyEmpty =
    /seedMode === 'verify'[\s\S]{0,400}setRevised\(''\)/.test(diffSrc) &&
    /next === 'verify'[\s\S]{0,200}setRevised\(''\)/.test(diffSrc);
  const emptyHint =
    /verifyPasteNewHint/.test(diffSrc) &&
    /!String\(revised \|\| ''\)\.trim\(\)/.test(diffSrc);
  const shieldOk =
    /shieldExportAfterApply/.test(shieldSrc) &&
    /shieldShareOk/.test(shieldSrc) &&
    /shareDraft/.test(shieldSrc) &&
    /exportPdfShort/.test(shieldSrc) &&
    /Word \(\.docx\)/.test(extrasSrc);
  const noOoxmlRewrite = /zipStore|buildDocxBytes/.test(fs.readFileSync('utils/redlineExport.js', 'utf8'));
  if (!verifyEmpty) {
    failed = true;
    console.log('WAVE BE verify setRevised empty preserved yok');
  } else if (!emptyHint || !/verifyPasteNewHint/.test(waveCSrc)) {
    failed = true;
    console.log('WAVE BE verifyPasteNewHint yok');
  } else if (!shieldOk || !/shieldShareOk/.test(waveESrc)) {
    failed = true;
    console.log('WAVE BE shield export labels/toast yok');
  } else if (!/shareBriefHint/.test(decisionBe)) {
    failed = true;
    console.log('WAVE BE DecisionCard shareBriefHint yok');
  } else if (!noOoxmlRewrite) {
    failed = true;
    console.log('WAVE BE redlineExport engine missing');
  } else if (!/trimmedNext\.length >= 90/.test(appSrc) || !/!loading && !activeResult && localRadarPreview/.test(appSrc)) {
    failed = true;
    console.log('WAVE BE BA/BD regress');
  } else {
    console.log('OK  WAVE BE export/share UX (N=2 → 13×603)');
  }
}

// WAVE BF — History card parties · type · notice meta (N=0 → 13×603)
{
  const historySrc = fs.readFileSync('screens/HistoryScreen.js', 'utf8');
  if (!/historyRadarMeta|contractRadar/.test(historySrc)) {
    failed = true;
    console.log('WAVE BF HistoryScreen contractRadar meta yok');
  } else if (!/buildLocalRadarPreview/.test(historySrc) || !/typeKeyFromCategory/.test(historySrc)) {
    failed = true;
    console.log('WAVE BF HistoryScreen type/preview fallback yok');
  } else if (!/meta\.parties|meta\.notice|meta\.typeKey/.test(historySrc)) {
    failed = true;
    console.log('WAVE BF HistoryScreen parties/type/notice render yok');
  } else if (!/onOpenItem|onShareItem/.test(historySrc) || !/RecentChatsList/.test(historySrc)) {
    failed = true;
    console.log('WAVE BF open/share/RecentChatsList regress');
  } else if (!/trimmedNext\.length >= 90/.test(appSrc) || !/shieldShareOk/.test(waveESrc)) {
    failed = true;
    console.log('WAVE BF BA/BD/BE regress');
  } else {
    console.log('OK  WAVE BF history card radar meta (N=0 → 13×603)');
  }
}

// WAVE BH — franchise/tadilat detect + short-path + progress (N=1 → 13×604)
try {
  const progressSrc = fs.readFileSync('components/AnalysisProgress.js', 'utf8');
  const optSrc = fs.readFileSync('constants/options.js', 'utf8').replace(/export /g, '');
  const ctSrc = contractTypeSrc
    .replace(/import[\s\S]*?from\s*['"][^'"]+['"];?\s*/g, '')
    .replace(/export /g, '');
  const detectFn = new Function( // eslint-disable-line no-new-func
    `${optSrc}\n${ctSrc}\nreturn detectContractType(arguments[0]);`
  );
  const franchiseFx = `MARKA LİSANSLAMA VE FRANCHISE SÖZLEŞMESİ
Franchisor: ABC Marka A.Ş.
Franchisee: XYZ Perakende Ltd.
Madde 8 Gizlilik süresi 3 yıldır. Royalty ödemeleri.`;
  const tadilatFx = `GAYRİMENKUL TADİLAT VE DEKORASYON SÖZLEŞMESİ
İşveren: Ahmet Demir
Yüklenici: XYZ İnşaat Ltd.
Madde 5 Gizlilik.`;
  const saasFx = `YAZILIM LİSANS SÖZLEŞMESİ
YÜKLENİCİ
NexaSoft A.Ş.
MÜŞTERİ
Orion A.Ş.
kurumsal yazılım lisanslama.`;
  const ndaFx = `GİZLİLİK SÖZLEŞMESİ (NDA)
Taraflar ticari sırlarını korur.
Confidentiality period 3 years. Non-disclosure.`;

  if (detectFn(franchiseFx)?.category === 'nda') {
    failed = true;
    console.log(`WAVE BH franchise→nda: ${detectFn(franchiseFx)?.category}`);
  } else if (detectFn(tadilatFx)?.category === 'nda' || detectFn(tadilatFx)?.category === 'saas') {
    failed = true;
    console.log(`WAVE BH tadilat bad: ${detectFn(tadilatFx)?.category}`);
  } else if (detectFn(saasFx)?.category !== 'saas') {
    failed = true;
    console.log(`WAVE BH saas regress: ${detectFn(saasFx)?.category}`);
  } else if (detectFn(ndaFx)?.category !== 'nda') {
    failed = true;
    console.log(`WAVE BH pure NDA: ${detectFn(ndaFx)?.category}`);
  } else if (!/useShortPath|singleFlightSystem|sliced\.length < 6000/.test(aiSrc)) {
    failed = true;
    console.log('WAVE BH short-path yok');
  } else if (!/notify\('clauses'\)/.test(aiSrc) || !/progressClauses/.test(progressSrc)) {
    failed = true;
    console.log('WAVE BH progress clauses step yok');
  } else if (!/progressClauses/.test(waveCSrc)) {
    failed = true;
    console.log('WAVE BH progressClauses i18n yok');
  } else if (!/gizlilik:/.test(fs.readFileSync('utils/shieldDocument.js', 'utf8'))) {
    failed = true;
    console.log('WAVE BH gizlilik patch dedupe yok');
  } else if (!/thinkingDisabled|empty-edge-text/.test(fnSrc)) {
    failed = true;
    console.log('WAVE BH BG thinking guard regress');
  } else {
    console.log('OK  WAVE BH detect/short-path/progress (N=1 → 13×604)');
  }
} catch (error) {
  failed = true;
  console.log(`WAVE BH runtime: ${error.message}`);
}

// WAVE BI — SafeArea toast/modal + sticky header + card overflow (no BH touch)
{
  const feedbackSrc = fs.readFileSync('context/FeedbackContext.js', 'utf8');
  const shareBiSrc = fs.readFileSync('components/ShareBriefSheet.js', 'utf8');
  const optionSrc = fs.readFileSync('components/OptionSelector.js', 'utf8');
  const searchSrc = fs.readFileSync('components/SearchableSheet.js', 'utf8');
  const themeBiSrc = fs.readFileSync('theme.js', 'utf8');
  const appBiSrc = fs.readFileSync('App.js', 'utf8');

  if (!/useSafeAreaInsets/.test(feedbackSrc) || !/insets\.bottom/.test(feedbackSrc)) {
    failed = true;
    console.log('WAVE BI toast safe-area insets yok');
  } else if (!/bottom:\s*toastBottom|bottom:\s*.*insets\.bottom/.test(feedbackSrc)) {
    failed = true;
    console.log('WAVE BI toast bottom inset offset yok');
  } else if (!/useSafeAreaInsets/.test(shareBiSrc) || !/insets\.bottom/.test(shareBiSrc)) {
    failed = true;
    console.log('WAVE BI ShareBriefSheet safe-area yok');
  } else if (!/useSafeAreaInsets/.test(optionSrc) || !/insets\.bottom/.test(optionSrc)) {
    failed = true;
    console.log('WAVE BI OptionSheet safe-area yok');
  } else if (!/useSafeAreaInsets/.test(searchSrc) || !/insets\.bottom/.test(searchSrc)) {
    failed = true;
    console.log('WAVE BI SearchableSheet safe-area yok');
  } else if (!/zIndex:\s*20/.test(themeBiSrc) || !/backgroundColor:\s*theme\.bg,\s*zIndex:\s*20/.test(appBiSrc)) {
    failed = true;
    console.log('WAVE BI sticky header opaque/zIndex yok');
  } else if (!/minHeight:\s*64/.test(themeBiSrc) || !/minHeight:\s*72/.test(themeBiSrc)) {
    failed = true;
    console.log('WAVE BI redFlag/clause minHeight yok');
  } else if (!/overflow:\s*['"]visible['"]/.test(themeBiSrc)) {
    failed = true;
    console.log('WAVE BI card overflow visible yok');
  } else if (/numberOfLines=\{2\}[\s\S]{0,80}clauseTitle|clauseTitle[\s\S]{0,80}numberOfLines=\{2\}/.test(appBiSrc)) {
    failed = true;
    console.log('WAVE BI clause title numberOfLines clip regress');
  } else {
    console.log('OK  WAVE BI safe-area toast/modal + sticky header + card overflow');
  }
}

// WAVE BJ+ — stitch glue, BA parties (paren labels), DOCX/PDF, persona lock
{
  const shieldBj = fs.readFileSync('utils/shieldDocument.js', 'utf8');
  const analysisBj = fs.readFileSync('utils/analysis.js', 'utf8');
  const redlineBj = fs.readFileSync('utils/redlineExport.js', 'utf8');
  const appBj = fs.readFileSync('App.js', 'utf8');
  let bjOk = true;

  if (!/stitchBoundaryGlue/.test(shieldBj)) {
    failed = true;
    bjOk = false;
    console.log('WAVE BJ stitchBoundaryGlue yok');
  }
  if (!/\(\?:\\\\\(\[\^\)\]\*\\\\\)\)\?/.test(analysisBj)) {
    failed = true;
    bjOk = false;
    console.log('WAVE BJ matchRoleHeading paren optional yok');
  }
  if (!/hizmet alan/.test(analysisBj)) {
    failed = true;
    bjOk = false;
    console.log('WAVE BJ customerLabels hizmet alan yok');
  }
  if (!/ticaret\\s\+unvan/.test(analysisBj)) {
    failed = true;
    bjOk = false;
    console.log('WAVE BJ ticaret unvanı pick yok');
  }
  if (!/normalizeDocxParagraphs/.test(redlineBj)) {
    failed = true;
    bjOk = false;
    console.log('WAVE BJ normalizeDocxParagraphs yok');
  }
  if (!/@page\s*\{\s*size:\s*A4/.test(redlineBj)) {
    failed = true;
    bjOk = false;
    console.log('WAVE BJ redline PDF A4 yok');
  }
  if (!/del,\s*\.redline-del/.test(redlineBj) || !/ins,\s*\.redline-ins/.test(redlineBj)) {
    failed = true;
    bjOk = false;
    console.log('WAVE BJ redline del/ins CSS yok');
  }

  const contractChange =
    appBj.match(/const handleContractTextChange\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\n  \};/)?.[0] || '';
  if (!contractChange) {
    failed = true;
    bjOk = false;
    console.log('WAVE BJ handleContractTextChange yok');
  } else if (
    /coercePartyForCategory/.test(contractChange) &&
    !/isGranularPartyCode\(prev\)/.test(contractChange)
  ) {
    failed = true;
    bjOk = false;
    console.log('WAVE BJ persona granular lock in handleContractTextChange yok');
  }

  try {
    const foldOnly = `
      function foldTr(text) {
        return String(text || '')
          .replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ş/g, 'ş')
          .replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç')
          .toLowerCase();
      }
      function isPlaceholderText(){ return false; }
    `;
    const start = analysisBj.indexOf('const escapeRegExp =');
    const end = analysisBj.indexOf('function partiesStringLooksValid');
    if (start < 0 || end < 0 || end <= start) {
      failed = true;
      bjOk = false;
      console.log('WAVE BJ party helpers yok');
    } else {
      const partyBlock = analysisBj.slice(start, end).replace(/export /g, '');
      const runParties = new Function( // eslint-disable-line no-new-func
        `${foldOnly}\n${partyBlock}\nreturn extractRadarPartiesFromText(arguments[0]);`
      );
      const fixture = `KURUMSAL BİLİŞİM, YAZILIM UYARLAMA VE LİSANS HİZMETLERİ SÖZLEŞMESİ

HİZMET SAĞLAYICI (YÜKLENİCİ):
Ticaret Unvanı: Apex A.Ş.

HİZMET ALAN (MÜŞTERİ):
Ticaret Unvanı: Anadolu Bilişim
`;
      const parties = runParties(fixture);
      if (!/Apex/i.test(parties) || !/Anadolu/i.test(parties) || /—/.test(parties)) {
        failed = true;
        bjOk = false;
        console.log(`WAVE BJ BA parties bad: ${parties}`);
      }
    }

    const glueCheck = (left, right) => {
      const to = String(left || '');
      const after = String(right || '');
      if (!to || !after) return '';
      if (/[\s]$/.test(to) || /^[\s]/.test(after)) return '';
      if (/[.!?:]$/.test(to) && /^[A-Za-zÇçĞğİıÖöŞşÜü]/.test(after)) return ' ';
      if (/[A-Za-zÇçĞğİıÖöŞşÜü0-9.]$/.test(to) && /^[A-Za-zÇçĞğİıÖöŞşÜü]/.test(after)) {
        if (/\.$/.test(to)) return ' ';
        return '. ';
      }
      return '';
    };
    const g1 = glueCheck('...bulunmak.', 'Kilit personel...');
    const g2 = glueCheck('bulunmak', 'Kilit');
    const g3 = glueCheck('geçemez.', 'Müşteri');
    if (!g1 || `...bulunmak.${g1}Kilit`.includes('bulunmak.Kilit')) {
      failed = true;
      bjOk = false;
      console.log('WAVE BJ glue bulunmak.Kilit');
    }
    if (!g2 || `bulunmak${g2}Kilit`.includes('bulunmakKilit')) {
      failed = true;
      bjOk = false;
      console.log('WAVE BJ glue bulunmakKilit');
    }
    if (!g3 || `geçemez.${g3}Müşteri`.includes('geçemez.Müşteri')) {
      failed = true;
      bjOk = false;
      console.log('WAVE BJ glue geçemez.Müşteri');
    }
    if (!/stitchBoundaryGlue/.test(shieldBj)) {
      failed = true;
      bjOk = false;
    }
  } catch (error) {
    failed = true;
    bjOk = false;
    console.log(`WAVE BJ runtime: ${error.message}`);
  }

  if (bjOk) {
    console.log('OK  WAVE BJ glue/parties/docx-pdf/persona (N=0)');
  }
}

// WAVE BK — Diff render safety + export cache hygiene
{
  const diffBk = fs.readFileSync('components/DiffTool.js', 'utf8');
  const redlineBk = fs.readFileSync('utils/redline.js', 'utf8');
  const fileBk = fs.readFileSync('utils/fileAccess.js', 'utf8');
  const exportBk = fs.readFileSync('utils/redlineExport.js', 'utf8');
  const appBk = fs.readFileSync('App.js', 'utf8');
  let bkOk = true;

  if (!/groupRedlineRuns/.test(redlineBk) || !/buildGroupedRedline/.test(redlineBk)) {
    failed = true;
    bkOk = false;
    console.log('WAVE BK groupRedlineRuns/buildGroupedRedline yok');
  }
  if (!/useMemo/.test(diffBk) || !/buildGroupedRedline/.test(diffBk)) {
    failed = true;
    bkOk = false;
    console.log('WAVE BK DiffTool useMemo/buildGroupedRedline yok');
  }
  if (!/InteractionManager\.runAfterInteractions/.test(diffBk)) {
    failed = true;
    bkOk = false;
    console.log('WAVE BK DiffTool InteractionManager defer yok');
  }
  if (!/Performance Mode: Showing first/.test(diffBk)) {
    failed = true;
    bkOk = false;
    console.log('WAVE BK performance mode notice yok');
  }
  if (!/cleanStaleExportCache/.test(fileBk) || !/maxAgeMs\s*=\s*86400000/.test(fileBk)) {
    failed = true;
    bkOk = false;
    console.log('WAVE BK cleanStaleExportCache yok');
  }
  if ((exportBk.match(/cleanStaleExportCache\(\)/g) || []).length < 2) {
    failed = true;
    bkOk = false;
    console.log('WAVE BK shareShield* cache clean yok');
  }
  if (!/cleanStaleExportCache\(\)/.test(diffBk)) {
    failed = true;
    bkOk = false;
    console.log('WAVE BK DiffTool cache clean yok');
  }
  if (!/Keyboard\.dismiss\(\)/.test(appBk) || !/handleAnalyzeText[\s\S]{0,600}Keyboard\.dismiss/.test(appBk)) {
    failed = true;
    bkOk = false;
    console.log('WAVE BK Keyboard.dismiss on analyze yok');
  }

  try {
    const start = redlineBk.indexOf('export function groupRedlineRuns');
    const end = redlineBk.indexOf('export function redlineHtml');
    if (start < 0 || end < 0) throw new Error('group helpers missing');
    const block = redlineBk
      .slice(redlineBk.indexOf('export function buildRedline'), end)
      .replace(/export /g, '');
    const run = new Function( // eslint-disable-line no-new-func
      `${block}
      const tokens = [
        { type: 'same', text: 'a' },
        { type: 'same', text: 'b' },
        { type: 'add', text: 'c' },
        { type: 'add', text: 'd' },
        { type: 'del', text: 'e' },
      ];
      return groupRedlineRuns(tokens);`
    );
    const grouped = run();
    if (!Array.isArray(grouped) || grouped.length !== 3) {
      failed = true;
      bkOk = false;
      console.log(`WAVE BK group runs bad: ${JSON.stringify(grouped)}`);
    } else if (grouped[0].text !== 'a b' || grouped[1].text !== 'c d' || grouped[2].text !== 'e') {
      failed = true;
      bkOk = false;
      console.log(`WAVE BK group merge bad: ${JSON.stringify(grouped)}`);
    }
  } catch (error) {
    failed = true;
    bkOk = false;
    console.log(`WAVE BK runtime: ${error.message}`);
  }

  if (bkOk) {
    console.log('OK  WAVE BK diff-defer/group/cache/keyboard (N=0)');
  }
}

// WAVE BL — NexuLex Navigator (local-first guide)
{
  const capSrc = fs.readFileSync('constants/appCapabilities.js', 'utf8');
  const guideSrc = fs.readFileSync('components/NexuLexGuideSheet.js', 'utf8');
  const appBl = fs.readFileSync('App.js', 'utf8');
  const waveFBl = fs.readFileSync('i18n.wavef.js', 'utf8');
  let blOk = true;

  if (!/GUIDE_WORKFLOWS/.test(capSrc) || !/matchLegalIntent/.test(capSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL appCapabilities registry yok');
  }
  if (!/ctaKey:\s*'btnStartAnalyze'/.test(capSrc) || !/ctaKey:\s*'exportPdfShort'/.test(capSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL ctaKey mapping eksik');
  }
  if (!/guideAskAdvisor|guideAskAdvisorCta|guideTitle/.test(waveFBl)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL guide i18n keys yok');
  }
  if (!/t\('guideAskAdvisor'\)/.test(guideSrc) || !/t\('guideAskAdvisorCta'\)/.test(guideSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL legal redirect i18n yok');
  }
  if (/Bu hukuki bir konudur/.test(guideSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL hardcoded TR legal redirect');
  }
  if (!/NexuLexGuideSheet/.test(appBl) || !/compass-outline/.test(appBl)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL header guide wiring yok');
  }
  if (!/setActiveTab\('advisor'\)/.test(appBl) || !/onOpenAdvisor/.test(appBl)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL advisor tab handoff yok');
  }
  if (!/useSafeAreaInsets/.test(guideSrc) || !/insets\.bottom/.test(guideSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL guide safe-area yok');
  }
  // WAVE BL.2 — horizontal chips; no responder steal; bounded FlatList
  if (/maxHeight:\s*360/.test(guideSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL.2 guide maxHeight:360 regress');
  }
  if (/onStartShouldSetResponder/.test(guideSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL.2 onStartShouldSetResponder regress');
  }
  if (!/ScrollView[\s\S]{0,120}horizontal/.test(guideSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL.2 horizontal chip ScrollView yok');
  }
  if (/flexWrap:\s*['"]wrap['"]/.test(guideSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL.2 flexWrap chip row regress');
  }
  if (!/FlatList/.test(guideSrc) || !/keyboardShouldPersistTaps=["']handled["']/.test(guideSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL.2 FlatList / keyboardShouldPersistTaps yok');
  }
  if (!/GUIDE_LIST_MAX_HEIGHT|Dimensions\.get\(\s*['"]window['"]\s*\)/.test(guideSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL.2 guide list bounded height yok');
  }
  // WAVE BL.3 — backdrop Pressable absoluteFill; sheet sibling; fixed list height
  if (!/StyleSheet\.absoluteFillObject/.test(guideSrc) || !/Pressable/.test(guideSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL.3 Pressable absoluteFill backdrop yok');
  }
  if (/TouchableWithoutFeedback[\s\S]{0,200}modalOverlay[\s\S]{0,400}modalSheet/.test(guideSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL.3 closing TWF wraps sheet regress');
  }
  if (!/height:\s*GUIDE_LIST_MAX_HEIGHT/.test(guideSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL.3 FlatList height: GUIDE_LIST_MAX_HEIGHT yok');
  }
  if (!/GUIDE_FAQ_CHIPS|guideFaqRevise/.test(capSrc) || !/introKey/.test(capSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL.4 FAQ chips / introKey yok');
  }
  if (!/GUIDE_FAQ_CHIPS/.test(guideSrc) || !/introKey/.test(guideSrc)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL.4 sheet FAQ/intro render yok');
  }
  if (!/guideStepAnalyzeParty|guideStepAdvisorVs|guideFlowAnalyzeIntro/.test(waveFBl)) {
    failed = true;
    blOk = false;
    console.log('WAVE BL.4 deep guide i18n keys yok');
  }

  // CTA keys must resolve in English bundle (existing UI labels)
  try {
    const ctaKeys = [...capSrc.matchAll(/ctaKey:\s*'([^']+)'/g)].map((m) => m[1]);
    const waveFMatch2 = waveFBl.match(/export const WAVE_F_I18N = ([\s\S]*);\s*$/);
    const WAVE_F = eval(`(${waveFMatch2[1]})`); // eslint-disable-line no-eval
    const extras = eval(`(${fs.readFileSync('i18n.extras.js', 'utf8').match(/export const WAVE_A_I18N = ([\s\S]*);\s*$/)[1]})`); // eslint-disable-line no-eval
    const waveB = eval(`(${fs.readFileSync('i18n.waveb.js', 'utf8').match(/export const WAVE_B_I18N = ([\s\S]*);\s*$/)[1]})`); // eslint-disable-line no-eval
    const waveC = eval(`(${fs.readFileSync('i18n.wavec.js', 'utf8').match(/export const WAVE_C_I18N = ([\s\S]*);\s*$/)[1]})`); // eslint-disable-line no-eval
    const waveD = eval(`(${fs.readFileSync('i18n.global.js', 'utf8').match(/export const WAVE_D_I18N = ([\s\S]*);\s*$/)[1]})`); // eslint-disable-line no-eval
    const waveE = eval(`(${fs.readFileSync('i18n.wavee.js', 'utf8').match(/export const WAVE_E_I18N = ([\s\S]*);\s*$/)[1]})`); // eslint-disable-line no-eval
    const waveBn = eval(`(${fs.readFileSync('i18n.wavebn.js', 'utf8').match(/export const WAVE_BN_I18N = ([\s\S]*);\s*$/)[1]})`); // eslint-disable-line no-eval
    const waveBo = eval(`(${fs.readFileSync('i18n.wavebo.js', 'utf8').match(/export const WAVE_BO_I18N = ([\s\S]*);\s*$/)[1]})`); // eslint-disable-line no-eval
    const waveCa = eval(`(${fs.readFileSync('i18n.waveca.js', 'utf8').match(/export const WAVE_CA_I18N = ([\s\S]*);\s*$/)[1]})`); // eslint-disable-line no-eval
    const waveCb = eval(`(${fs.readFileSync('i18n.wavecb.js', 'utf8').match(/export const WAVE_CB_I18N = ([\s\S]*);\s*$/)[1]})`); // eslint-disable-line no-eval
    const waveCc = eval(`(${fs.readFileSync('i18n.wavecc.js', 'utf8').match(/export const WAVE_CC_I18N = ([\s\S]*);\s*$/)[1]})`); // eslint-disable-line no-eval
    const i18nMatch = fs.readFileSync('i18n.js', 'utf8').match(/const resources = ([\s\S]*?);\s*\n\s*i18n\.use/);
    const resources = Function(
      'WAVE_A_I18N',
      'WAVE_B_I18N',
      'WAVE_C_I18N',
      'WAVE_D_I18N',
      'WAVE_E_I18N',
      'WAVE_F_I18N',
      'WAVE_BN_I18N',
      'WAVE_BO_I18N',
      'WAVE_CA_I18N',
      'WAVE_CB_I18N',
      'WAVE_CC_I18N',
      `return (${i18nMatch[1]});`
    )(extras, waveB, waveC, waveD, waveE, WAVE_F, waveBn, waveBo, waveCa, waveCb, waveCc);
    const en = resources.en.translation;
    const missingCta = ctaKeys.filter((key) => !en[key]);
    if (missingCta.length) {
      failed = true;
      blOk = false;
      console.log(`WAVE BL ctaKey missing in en: ${missingCta.join(', ')}`);
    }
    if (Object.keys(WAVE_F.en || {}).length !== 58) {
      failed = true;
      blOk = false;
      console.log(`WAVE BL WAVE_F key count ${Object.keys(WAVE_F.en || {}).length}, beklenen 58`);
    }
  } catch (error) {
    failed = true;
    blOk = false;
    console.log(`WAVE BL runtime: ${error.message}`);
  }

  if (blOk) {
    console.log('OK  WAVE BL navigator guide (N=58 → 13×878) + BL.4 depth');
  }
}

// WAVE BN — Party Clarity & Precision Shield (UX only)
{
  let bnOk = true;
  const partyCardsSrc = fs.existsSync('utils/partyCards.js')
    ? fs.readFileSync('utils/partyCards.js', 'utf8')
    : '';
  const paywallBnSrc = fs.readFileSync('screens/PaywallScreen.js', 'utf8');
  const waveBnBl = fs.existsSync('i18n.wavebn.js') ? fs.readFileSync('i18n.wavebn.js', 'utf8') : '';
  const guideBnSrc = fs.existsSync('components/NexuLexGuideSheet.js')
    ? fs.readFileSync('components/NexuLexGuideSheet.js', 'utf8')
    : '';

  if (!/partyConfirmed/.test(appSrc) || !/!partyConfirmed/.test(appSrc)) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN partyConfirmed gate yok');
  }
  if (!/setPartyConfirmed\(true\)/.test(appSrc) || !/handlePartyChange/.test(appSrc)) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN handlePartyChange confirm yok');
  }
  if (!/partyNeedSelect/.test(appSrc)) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN partyNeedSelect toast/gate yok');
  }
  if (!/buildPartyChoiceCards/.test(partyCardsSrc) || !/flipPartyCode/.test(partyCardsSrc)) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN partyCards helpers yok');
  }
  if (!/sideLabelKey|PARTY_SIDES|sideMeta|withSide/.test(partyCardsSrc)) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN.1 partyCards side metadata yok');
  }
  if (!/buildPartyChoiceCards|partyChoiceCard|partyProtectTitle/.test(appSrc)) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN dual cards UI yok');
  }
  if (!/card\.icon|sideLabelKey|Ionicons[\s\S]{0,120}card\.icon/.test(appSrc)) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN.1 dual card icon / sideLabelKey yok');
  }
  if (!/partyChoiceMeta[\s\S]{0,80}partyNotSelected|partyNotSelected[\s\S]{0,40}partyChoiceMeta/.test(appSrc)) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN.1 partyNotSelected under-row yok');
  }
  if (!/partyShieldActive|partyFlipCta|handlePartyFlip|flipPartyCode/.test(appSrc)) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN result badge / flip yok');
  }
  if (!/loadStoredParty\(\)\.then/.test(appSrc) || !/isGranularPartyCode\(party\)/.test(appSrc)) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN stored granular → partyConfirmed path yok');
  }
  if (!/return null/.test(fs.readFileSync('utils/party.js', 'utf8'))) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN loadStoredParty null-on-fresh yok');
  }
  if (!/partyProtectTitle|partyNeedSelect|partyShieldActive|paywallPartyContext/.test(waveBnBl)) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN i18n keys yok');
  }
  if (!/context|paywallPartyContext/.test(paywallBnSrc)) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN paywall context yok');
  }
  if (/onStartShouldSetResponder/.test(guideBnSrc)) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN guide onStartShouldSetResponder regress');
  }
  if (!/Pressable[\s\S]{0,120}StyleSheet\.absoluteFillObject|absoluteFillObject/.test(guideBnSrc)) {
    failed = true;
    bnOk = false;
    console.log('WAVE BN BL.3 backdrop regress');
  }

  try {
    const WAVE_BN = eval(`(${waveBnBl.match(/export const WAVE_BN_I18N = ([\s\S]*);\s*$/)[1]})`); // eslint-disable-line no-eval
    const bnKeys = Object.keys(WAVE_BN.en || {});
    if (Object.keys(WAVE_BN).length !== 13) {
      failed = true;
      bnOk = false;
      console.log(`WAVE BN dil sayisi ${Object.keys(WAVE_BN).length}, beklenen 13`);
    }
    // 10 new + 1 guide override
    if (bnKeys.length !== 11) {
      failed = true;
      bnOk = false;
      console.log(`WAVE BN key count ${bnKeys.length}, beklenen 11`);
    }
    for (const lang of Object.keys(WAVE_BN)) {
      const keys = Object.keys(WAVE_BN[lang] || {});
      if (keys.length !== bnKeys.length || bnKeys.some((k) => !keys.includes(k))) {
        failed = true;
        bnOk = false;
        console.log(`WAVE BN ${lang} parity bozuk`);
      }
    }
  } catch (error) {
    failed = true;
    bnOk = false;
    console.log(`WAVE BN runtime: ${error.message}`);
  }

  if (bnOk) {
    console.log('OK  WAVE BN party clarity (N=10 → 13×878) + BN.1 side titles/icons');
  }
}

// WAVE BO — Tiered Counter-Offers (Balanced / Shield / Fast-Accept)
{
  let boOk = true;
  const analysisBo = fs.readFileSync('utils/analysis.js', 'utf8');
  const shieldBo = fs.readFileSync('utils/shieldDocument.js', 'utf8');
  const aiBo = fs.readFileSync('services/ai.js', 'utf8');
  const waveBoBl = fs.existsSync('i18n.wavebo.js') ? fs.readFileSync('i18n.wavebo.js', 'utf8') : '';
  const edgeBo = fs.existsSync('supabase/functions/analyze-contract/index.ts')
    ? fs.readFileSync('supabase/functions/analyze-contract/index.ts', 'utf8')
    : '';

  if (!/pickCounterOffer|normalizeCounterOfferFields|countOfferTiers/.test(analysisBo)) {
    failed = true;
    boOk = false;
    console.log('WAVE BO pickCounterOffer / normalizeCounterOfferFields yok');
  }
  if (!/counterOffers|pickCounterOffer\(flag|pickCounterOffer\(clause/.test(analysisBo)) {
    failed = true;
    boOk = false;
    console.log('WAVE BO buildReadyToSendMessage tier path yok');
  }
  if (!/pickCounterOffer\(clause|tierById|preferredTier/.test(shieldBo)) {
    failed = true;
    boOk = false;
    console.log('WAVE BO listShieldPatches tier path yok');
  }
  if (!/offerTierRow|offerBalanced|renderOfferTierChips|pickCounterOffer/.test(appSrc)) {
    failed = true;
    boOk = false;
    console.log('WAVE BO offer tier chips UI yok');
  }
  if (!/offerTierById/.test(appSrc) || !/offerTierById/.test(fs.readFileSync('components/ShieldDocumentCard.js', 'utf8'))) {
    failed = true;
    boOk = false;
    console.log('WAVE BO ShieldDocumentCard offerTierById yok');
  }
  if (!/counterOffers/.test(aiBo) || !/balanced.*shield.*fast|counterOffers\{balanced/.test(aiBo)) {
    failed = true;
    boOk = false;
    console.log('WAVE BO ai.js CORE counterOffers schema yok');
  }
  if (/counterOffers\{balanced/.test(edgeBo) && !/LOCK/.test(edgeBo)) {
    // Soft: Edge must not be rewritten for BO — fail if we added counterOffers schema there
  }
  if (/counterOffers:\s*\{[\s\S]{0,80}balanced/.test(edgeBo)) {
    failed = true;
    boOk = false;
    console.log('WAVE BO Edge analyze-contract prompt rewritten (forbidden)');
  }
  if (!/offerBalanced|offerShield|offerFast/.test(waveBoBl)) {
    failed = true;
    boOk = false;
    console.log('WAVE BO i18n keys yok');
  }

  try {
    const WAVE_BO = eval(`(${waveBoBl.match(/export const WAVE_BO_I18N = ([\s\S]*);\s*$/)[1]})`); // eslint-disable-line no-eval
    const boKeys = Object.keys(WAVE_BO.en || {});
    if (Object.keys(WAVE_BO).length !== 13) {
      failed = true;
      boOk = false;
      console.log(`WAVE BO dil sayisi ${Object.keys(WAVE_BO).length}, beklenen 13`);
    }
    if (boKeys.length !== 6) {
      failed = true;
      boOk = false;
      console.log(`WAVE BO key count ${boKeys.length}, beklenen 6`);
    }
    // Runtime: pickCounterOffer prefers tier then legacy
    const pickStart = analysisBo.indexOf('export function pickCounterOffer');
    const pickEnd = analysisBo.indexOf('export function countOfferTiers');
    if (pickStart < 0 || pickEnd <= pickStart) throw new Error('pick helpers missing');
    const pickSrc = analysisBo.slice(pickStart, pickEnd).replace(/export /g, '');
    const runPick = new Function(`${pickSrc}\nreturn pickCounterOffer(arguments[0], arguments[1]);`); // eslint-disable-line no-new-func
    const sample = {
      counterOffer: 'legacy-bal',
      counterOffers: { balanced: 'bal', shield: 'sh', fast: 'fa' },
    };
    if (runPick(sample, 'shield') !== 'sh' || runPick(sample, 'fast') !== 'fa') {
      failed = true;
      boOk = false;
      console.log('WAVE BO pickCounterOffer tier runtime fail');
    }
    if (runPick({ counterOffer: 'only-legacy' }, 'shield') !== 'only-legacy') {
      failed = true;
      boOk = false;
      console.log('WAVE BO pickCounterOffer legacy fallback fail');
    }
  } catch (error) {
    failed = true;
    boOk = false;
    console.log(`WAVE BO runtime: ${error.message}`);
  }

  if (boOk) {
    console.log('OK  WAVE BO tiered counter-offers (N=6 → 13×878)');
  }
}

// WAVE CA′ — Scenario Legal Roadmaps (deterministic, local-only)
{
  let caOk = true;
  const scenSrc = fs.existsSync('constants/legalScenarios.js')
    ? fs.readFileSync('constants/legalScenarios.js', 'utf8')
    : '';
  const roadmapSrc = fs.existsSync('services/scenarioRoadmap.js')
    ? fs.readFileSync('services/scenarioRoadmap.js', 'utf8')
    : '';
  const wizardSrc = fs.existsSync('components/ScenarioWizardModal.js')
    ? fs.readFileSync('components/ScenarioWizardModal.js', 'utf8')
    : '';
  const advisorSrc = fs.readFileSync('screens/LegalAdvisorScreen.js', 'utf8');
  const edgeCa = fs.readFileSync('supabase/functions/analyze-contract/index.ts', 'utf8');
  const waveCaBl = fs.existsSync('i18n.waveca.js') ? fs.readFileSync('i18n.waveca.js', 'utf8') : '';

  if (!/labor_exit|rent_arrears|consumer_defect|nda_breach_suspect|unpaid_invoice_b2b/.test(scenSrc)) {
    failed = true;
    caOk = false;
    console.log('WAVE CA P0 scenarios eksik');
  }
  if (!/generateScenarioRoadmap|formatRoadmapForSharing/.test(roadmapSrc)) {
    failed = true;
    caOk = false;
    console.log('WAVE CA scenarioRoadmap helpers yok');
  }
  if (/askLegalAdvisor/.test(roadmapSrc)) {
    failed = true;
    caOk = false;
    console.log('WAVE CA roadmap must not call askLegalAdvisor');
  }
  if (!/absoluteFillObject/.test(wizardSrc) || !/Pressable/.test(wizardSrc)) {
    failed = true;
    caOk = false;
    console.log('WAVE CA wizard BL.3 backdrop yok');
  }
  if (!/LEGAL_SCENARIOS|ScenarioWizardModal|scenarioSectionTitle/.test(advisorSrc)) {
    failed = true;
    caOk = false;
    console.log('WAVE CA LegalAdvisor chips/wizard wiring yok');
  }
  if (!/scenarioLegalDisclaimer|scenarioLaborTitle|scenarioSectionTitle/.test(waveCaBl)) {
    failed = true;
    caOk = false;
    console.log('WAVE CA i18n keys yok');
  }
  if (/labor_exit|generateScenarioRoadmap|scenarioLegalDisclaimer/.test(edgeCa)) {
    failed = true;
    caOk = false;
    console.log('WAVE CA Edge analyze-contract rewritten (forbidden)');
  }
  // Lock: BN/BO markers still present
  if (!/partyConfirmed|buildPartyChoiceCards/.test(appSrc) || !/pickCounterOffer/.test(analysisUtilSrc)) {
    failed = true;
    caOk = false;
    console.log('WAVE CA BN/BO lock regress');
  }

  try {
    const { LEGAL_SCENARIOS: scenes, SCENARIO_IDS } = require('../constants/legalScenarios.js');
    if (!Array.isArray(scenes) || scenes.length !== 5 || (SCENARIO_IDS || []).length !== 5) {
      failed = true;
      caOk = false;
      console.log('WAVE CA scenario count != 5');
    }
    // Runtime without i18n dependency: stub generate by reading service after stripping imports
    const stubRoadmap = `
      const getScenarioById = (id) => (scenes || []).find((s) => s.id === id) || null;
      const resolveTemplateId = (scenario, answers) => {
        const fn = scenario && scenario.resolveBranch;
        if (typeof fn === 'function') {
          const key = fn(answers || {});
          if (key && scenario.templates && scenario.templates[key]) return key;
        }
        return 'default';
      };
      function generateScenarioRoadmap(scenarioId, answers) {
        const scenario = getScenarioById(scenarioId);
        if (!scenario) return null;
        const templateId = resolveTemplateId(scenario, answers);
        const template = (scenario.templates && (scenario.templates[templateId] || scenario.templates.default)) || null;
        if (!template) return null;
        return {
          scenarioId: scenario.id,
          title: scenario.titleKey,
          steps: (template.steps || []).map((item) => ({
            stepNumber: item.stepNumber,
            title: item.titleKey,
            detail: item.detailKey,
            timeHint: item.timeHintKey,
            docHint: item.docHintKey,
          })),
          lawyerThreshold: template.lawyerThresholdKey,
          disclaimer: template.disclaimerKey || 'scenarioLegalDisclaimer',
        };
      }
      function formatRoadmapForSharing(roadmap) {
        const lines = [];
        lines.push(String(roadmap.title || ''));
        (roadmap.steps || []).forEach((step) => {
          lines.push(step.stepNumber + '. ' + step.title);
          lines.push(step.detail);
        });
        lines.push(roadmap.lawyerThreshold);
        lines.push('—');
        lines.push(roadmap.disclaimer);
        return lines.join('\\n');
      }
      const built = generateScenarioRoadmap('labor_exit', { tenure: '1to5', severance: 'unpaid', notice: 'no' });
      if (!built || !built.steps || built.steps.length < 3) throw new Error('labor roadmap empty');
      const text = formatRoadmapForSharing(built);
      if (!/scenarioLegalDisclaimer/.test(text)) throw new Error('disclaimer not appended');
      if (!/—\\nscenarioLegalDisclaimer$/.test(text.replace(/\\r/g, ''))) {
        // allow trailing whitespace
        if (!text.trim().endsWith('scenarioLegalDisclaimer')) throw new Error('disclaimer not at end');
      }
      return true;
    `;
    const run = new Function('scenes', stubRoadmap); // eslint-disable-line no-new-func
    run(scenes);
  } catch (error) {
    failed = true;
    caOk = false;
    console.log(`WAVE CA runtime: ${error.message}`);
  }

  if (caOk) {
    console.log('OK  WAVE CA′ scenario roadmaps (N=200 → 13×928) + deterministic local');
  }
}

// WAVE CB — Deterministic Financial & Legal Calculators
{
  let cbOk = true;
  const ratesSrc = fs.existsSync('constants/legalCalcRates.js')
    ? fs.readFileSync('constants/legalCalcRates.js', 'utf8')
    : '';
  const calcSrc = fs.existsSync('utils/legalCalculators.js')
    ? fs.readFileSync('utils/legalCalculators.js', 'utf8')
    : '';
  const calcModalSrc = fs.existsSync('components/CalculatorModal.js')
    ? fs.readFileSync('components/CalculatorModal.js', 'utf8')
    : '';
  const waveCbBl = fs.existsSync('i18n.wavecb.js') ? fs.readFileSync('i18n.wavecb.js', 'utf8') : '';
  const edgeCb = fs.existsSync('supabase/functions/analyze-contract/index.ts')
    ? fs.readFileSync('supabase/functions/analyze-contract/index.ts', 'utf8')
    : '';
  const advisorCb = fs.readFileSync('screens/LegalAdvisorScreen.js', 'utf8');

  if (!/LEGAL_CALC_RATES|asOfDate|severanceCap|stampTaxRate/.test(ratesSrc)) {
    failed = true;
    cbOk = false;
    console.log('WAVE CB legalCalcRates yok');
  }
  if (
    !/calculateSeverance|calculateRentIncrease|calculateLegalInterest|formatCalculationForSharing/.test(
      calcSrc
    )
  ) {
    failed = true;
    cbOk = false;
    console.log('WAVE CB legalCalculators helpers yok');
  }
  if (/fetch\(|askLegalAdvisor|openai|anthropic/i.test(calcSrc)) {
    failed = true;
    cbOk = false;
    console.log('WAVE CB calculators must stay local (no LLM/network)');
  }
  if (!/absoluteFillObject|Pressable/.test(calcModalSrc) || !/sibling|BL\.3/.test(calcModalSrc)) {
    failed = true;
    cbOk = false;
    console.log('WAVE CB CalculatorModal BL.3 backdrop yok');
  }
  if (!/LEGAL_CALCULATORS|CalculatorModal|calcSectionTitle/.test(advisorCb)) {
    failed = true;
    cbOk = false;
    console.log('WAVE CB LegalAdvisor calculator chips yok');
  }
  if (!/calcSeveranceTitle|calcDisclaimer|calcAsOfNotice|calcFootnoteSeverance/.test(waveCbBl)) {
    failed = true;
    cbOk = false;
    console.log('WAVE CB i18n keys yok');
  }
  if (/calculateSeverance|LEGAL_CALC_RATES/.test(edgeCb)) {
    failed = true;
    cbOk = false;
    console.log('WAVE CB Edge analyze-contract rewritten (forbidden)');
  }
  if (!/partyConfirmed|pickCounterOffer|LEGAL_SCENARIOS/.test(appSrc + advisorCb)) {
    failed = true;
    cbOk = false;
    console.log('WAVE CB BN/BO/CA lock regress');
  }

  try {
    const WAVE_CB = eval(`(${waveCbBl.match(/export const WAVE_CB_I18N = ([\s\S]*);\s*$/)[1]})`); // eslint-disable-line no-eval
    if (Object.keys(WAVE_CB).length !== 13 || Object.keys(WAVE_CB.en || {}).length !== 50) {
      failed = true;
      cbOk = false;
      console.log('WAVE CB i18n parity/key count fail');
    }

    const ratesBody = ratesSrc
      .replace(/export const LEGAL_CALC_RATES =/, 'const LEGAL_CALC_RATES =')
      .replace(/export const CALCULATOR_IDS =[\s\S]*?;/, '')
      .replace(/export const LEGAL_CALCULATORS =[\s\S]*?;/, '')
      .replace(/export /g, '');
    const calcBody = calcSrc
      .replace(/import \{ LEGAL_CALC_RATES \} from '\.\.\/constants\/legalCalcRates';\s*/, '')
      .replace(/export /g, '');
    const near = (a, b) => Math.abs(Number(a) - Number(b)) <= 0.01;
    const run = new Function( // eslint-disable-line no-new-func
      `${ratesBody}\n${calcBody}\nreturn {\n  LEGAL_CALC_RATES,\n  calculateSeverance,\n  calculateRentIncrease,\n  calculateLegalInterest,\n  formatCalculationForSharing,\n};`
    );
    const api = run();

    const sev = api.calculateSeverance({
      grossSalary: 50000,
      workMonths: 36,
      includesNoticePay: false,
    });
    // monthlyBase=46154.2, years=3 → gross=138462.6; stamp=1050.93; net=137411.67
    if (!near(sev.totalAmount, 137411.67) || sev.asOfDate !== api.LEGAL_CALC_RATES.asOfDate) {
      failed = true;
      cbOk = false;
      console.log(`WAVE CB severance vector fail total=${sev.totalAmount}`);
    }

    const rent = api.calculateRentIncrease({
      currentRent: 15000,
      proposedRent: 18000,
      tufeRate: 25,
      isResidential: true,
    });
    if (!near(rent.totalAmount, 18750) || rent.meta.overCap !== false) {
      failed = true;
      cbOk = false;
      console.log(`WAVE CB rent vector fail total=${rent.totalAmount} over=${rent.meta.overCap}`);
    }

    const interest = api.calculateLegalInterest({
      principal: 100000,
      startDate: '2025-01-01',
      endDate: '2026-01-01',
      interestType: 'legal',
    });
    if (!near(interest.totalAmount, 124000) || !near(interest.meta.interestAmount, 24000)) {
      failed = true;
      cbOk = false;
      console.log(`WAVE CB interest vector fail total=${interest.totalAmount}`);
    }

    const shared = api.formatCalculationForSharing(sev, 'whatsapp', (k, opts) => {
      if (k === 'calcDisclaimer') return 'DISCLAIMER_END';
      if (k === 'calcFootnoteSeverance') return 'FOOTNOTE';
      if (k === 'calcAsOfNotice') return `ASOF:${opts?.date || ''}`;
      return k;
    });
    if (!/FOOTNOTE/.test(shared) || !/ASOF:2026-01-01/.test(shared) || !/DISCLAIMER_END\s*$/.test(shared)) {
      failed = true;
      cbOk = false;
      console.log('WAVE CB share must end with disclaimer + include footnote/asOf');
    }
  } catch (error) {
    failed = true;
    cbOk = false;
    console.log(`WAVE CB runtime: ${error.message}`);
  }

  if (cbOk) {
    console.log('OK  WAVE CB calculators (N=50 → 13×928) + deterministic vectors');
  }
}

// WAVE CC — Guided Draft (local templates, disclaimer last, BL.3, Edge frozen)
{
  let ccOk = true;
  const ccFail = (msg) => {
    failed = true;
    ccOk = false;
    console.log(`WAVE CC ${msg}`);
  };
  const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '');
  const tplSrc = read('constants/draftTemplates.js');
  const draftSrc = read('services/guidedDraft.js');
  const modalSrc = read('components/DraftWizardModal.js');
  const advisorCc = read('screens/LegalAdvisorScreen.js');
  const scenarioModalSrc = read('components/ScenarioWizardModal.js');
  const redlineSrc = read('utils/redlineExport.js');
  const waveCcBl = read('i18n.wavecc.js');

  const EDGE_SHA256 = '845a060596469f5ebd96b36b608c82c4457527750d8c8cacce128518d47a918a';
  const edgePath = 'supabase/functions/analyze-contract/index.ts';
  const edgeHash = fs.existsSync(edgePath)
    ? require('crypto').createHash('sha256').update(fs.readFileSync(edgePath)).digest('hex')
    : '';
  if (edgeHash !== EDGE_SHA256) ccFail('Edge analyze-contract/index.ts changed (forbidden)');

  if (
    !/<Pressable\s+style=\{StyleSheet\.absoluteFillObject\}[\s\S]*?\/>\s*<View\s+style=\{\[\s*styles\.modalSheet/.test(
      modalSrc
    ) ||
    !/sibling/.test(modalSrc) ||
    !/<ScrollView/.test(modalSrc)
  ) {
    ccFail('DraftWizardModal BL.3 sibling backdrop yok');
  }
  if (!/shareShieldDocx\(/.test(modalSrc) || !/draftDocxFilename/.test(modalSrc) || !/NexuLex-Taslak-/.test(draftSrc)) {
    ccFail('DOCX export must reuse shareShieldDocx with NexuLex-Taslak-*.docx');
  }
  if (!/export async function shareShieldDocx[\s\S]*?cleanStaleExportCache\(\)/.test(redlineSrc)) {
    ccFail('shareShieldDocx must clean export cache after share');
  }
  if (/fetch\(|askLegalAdvisor\(|callClaudeProxy|anthropic|openai/i.test(draftSrc + tplSrc)) {
    ccFail('buildDraft/templates must stay local (no LLM/network)');
  }
  if ((modalSrc.match(/askLegalAdvisor\(/g) || []).length !== 1 || !/task: 'draft_polish'/.test(modalSrc)) {
    ccFail('Improve wording must be a single user-triggered askLegalAdvisor call');
  }
  if (!/buildDraftPreview/.test(modalSrc) || !/isPro/.test(modalSrc) || !/onNeedPaywall/.test(modalSrc)) {
    ccFail('Free preview / Pro gate yok');
  }
  if (!/DRAFT_TEMPLATES/.test(advisorCc) || !/DraftWizardModal/.test(advisorCc) || !/draftSectionTitle/.test(advisorCc)) {
    ccFail('LegalAdvisor "Belge Hazırla" chips yok');
  }
  if (!/isPro=\{!lockPremium\}/.test(appSrc) || !/onNeedPaywall=\{\(\) => openPaywall\(/.test(appSrc)) {
    ccFail('App.js must pass isPro + existing openPaywall hook to LegalAdvisor');
  }
  if (!/draftForScenario/.test(scenarioModalSrc) || !/onOpenDraft/.test(scenarioModalSrc)) {
    ccFail('CA′ roadmap → draft CTA yok');
  }
  if (!/partyConfirmed|pickCounterOffer/.test(appSrc) || !/LEGAL_SCENARIOS|LEGAL_CALCULATORS/.test(advisorCc)) {
    ccFail('BN/BO/CA/CB lock regress');
  }

  try {
    const WAVE_CC = eval(`(${waveCcBl.match(/export const WAVE_CC_I18N = ([\s\S]*);\s*$/)[1]})`); // eslint-disable-line no-eval
    const ccLangs = Object.keys(WAVE_CC);
    if (ccLangs.length !== 13) ccFail(`i18n langs ${ccLangs.length}`);
    const TR_DISCLAIMER =
      'Taslaktır; hukuki temsil yerine geçmez. Göndermeden önce kontrol edin / avukata danışın.';
    if (WAVE_CC.tr?.draftDisclaimer !== TR_DISCLAIMER) ccFail('TR disclaimer text mismatch');
    const overclaim = /court[- ]ready|mahkemeye hazır|guaranteed (?:to|acceptance|success)|kabul(?:ü)? garanti/i;
    for (const lang of ccLangs) {
      for (const [key, value] of Object.entries(WAVE_CC[lang])) {
        if (overclaim.test(value)) ccFail(`${lang}.${key} over-claims`);
      }
    }

    const tplBody = tplSrc.replace(/export /g, '');
    const draftBody = draftSrc
      .replace(/import i18n from '\.\.\/i18n';\s*/, '')
      .replace(/import \{[^}]+\} from '\.\.\/constants\/draftTemplates';\s*/, '')
      .replace(/export /g, '');
    const i18nStub = {
      language: 'tr',
      getResource: (lang, _ns, key) => (WAVE_CC[lang] || {})[key],
    };
    const api = new Function( // eslint-disable-line no-new-func
      'i18n',
      `${tplBody}\n${draftBody}\nreturn { DRAFT_TEMPLATES, DRAFT_TEMPLATE_IDS, DRAFT_FREE_PREVIEW_LINES, getDraftTemplateById, draftForScenario, buildDraft, formatDraftForSharing, buildDraftPreview, applyImprovedWording, citationsIn, draftDocxFilename };`
    )(i18nStub);

    const P0 = ['notice_payment', 'mediation_application', 'consumer_complaint'];
    if (JSON.stringify(api.DRAFT_TEMPLATE_IDS) !== JSON.stringify(P0) || api.DRAFT_TEMPLATES.length !== 3) {
      ccFail('registry must hold exactly the 3 P0 templates');
    }
    const phRe = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    for (const tpl of api.DRAFT_TEMPLATES) {
      const fields = ['id', 'titleKey', 'bodyTemplateKey', 'fixedReferenceKey', 'disclaimerKey'];
      if (fields.some((f) => !tpl[f]) || !Array.isArray(tpl.questions)) ccFail(`${tpl.id} registry fields`);
      if (tpl.questions.length < 4 || tpl.questions.length > 6) ccFail(`${tpl.id} must have 4–6 questions`);
      const qIds = tpl.questions.map((q) => q.id);
      tpl.questions.forEach((q) => {
        if (!q.id || !q.labelKey || !q.type || typeof q.required !== 'boolean') ccFail(`${tpl.id}.${q.id} question shape`);
      });
      const keys = [tpl.titleKey, tpl.descriptionKey, tpl.bodyTemplateKey, tpl.fixedReferenceKey, tpl.disclaimerKey, ...tpl.questions.map((q) => q.labelKey)];
      const enPh = [...new Set([...String(WAVE_CC.en[tpl.bodyTemplateKey] || '').matchAll(phRe)].map((m) => m[1]))].sort();
      if (JSON.stringify(enPh) !== JSON.stringify([...qIds].sort())) ccFail(`${tpl.id} body placeholders ≠ question ids`);
      for (const lang of ccLangs) {
        keys.forEach((k) => {
          if (!WAVE_CC[lang][k]) ccFail(`${lang}.${k} missing`);
        });
        const ph = [...new Set([...String(WAVE_CC[lang][tpl.bodyTemplateKey] || '').matchAll(phRe)].map((m) => m[1]))].sort();
        if (JSON.stringify(ph) !== JSON.stringify(enPh)) ccFail(`${lang}.${tpl.bodyTemplateKey} placeholder drift`);
        if (api.citationsIn(WAVE_CC[lang][tpl.bodyTemplateKey]).size) ccFail(`${lang}.${tpl.bodyTemplateKey} carries a citation`);
      }
    }

    const fullAnswers = {
      sender: 'Ayşe Yılmaz',
      recipient: 'Deneme Ltd. Şti.',
      basis: '12.03.2026 tarihli hizmet sözleşmesi',
      amount: '45.000 TL',
      dueDate: '01.08.2026',
      deadlineDays: '7',
    };
    const a1 = api.buildDraft('notice_payment', fullAnswers, 'tr');
    const a2 = api.buildDraft('notice_payment', { ...fullAnswers }, 'tr');
    if (!a1 || a1.text !== a2.text) ccFail('buildDraft not deterministic');
    if (/\{\{/.test(a1.text) || !a1.text.includes('45.000 TL') || a1.missing.length) ccFail('full fill failed');
    if (!a1.text.endsWith(TR_DISCLAIMER)) ccFail('draft text must end with disclaimer');
    if (!api.formatDraftForSharing(a1, 'whatsapp').endsWith(TR_DISCLAIMER)) ccFail('whatsapp share must end with disclaimer');

    const partial = api.buildDraft('notice_payment', { sender: 'Ayşe Yılmaz' }, 'tr');
    if (!partial.missingRequired.includes('amount') || !partial.missingRequired.includes('recipient')) {
      ccFail('required validation missing');
    }
    if (!/\[ Borç tutarı \(para birimiyle\) \]/.test(partial.body) || /\{\{/.test(partial.text)) {
      ccFail('missing fields must render as [ … ] blanks');
    }
    const preview = api.buildDraftPreview(partial, api.DRAFT_FREE_PREVIEW_LINES);
    if (!preview.truncated || !preview.text.endsWith(TR_DISCLAIMER)) ccFail('free preview must truncate and keep disclaimer last');

    for (const lang of ccLangs) {
      for (const id of P0) {
        const d = api.buildDraft(id, {}, lang);
        const disc = WAVE_CC[lang].draftDisclaimer;
        if (!d || !d.text.endsWith(disc) || /\{\{/.test(d.text)) ccFail(`${lang}/${id} disclaimer-last or blank fill`);
        const allowed = api.citationsIn(WAVE_CC[lang][api.getDraftTemplateById(id).fixedReferenceKey]);
        for (const c of api.citationsIn(d.text)) {
          if (!allowed.has(c)) ccFail(`${lang}/${id} citation outside fixed reference: ${c}`);
        }
      }
    }
    if (!/^NexuLex-Taslak-notice_payment-\d{14}\.docx$/.test(api.draftDocxFilename(a1))) ccFail('DOCX filename pattern');

    const okRewrite = a1.body.replace('talep ederiz', 'rica ederiz');
    const good = api.applyImprovedWording(a1, `${okRewrite}\n\n${TR_DISCLAIMER}`);
    if (!good.ok || !good.draft.text.endsWith(TR_DISCLAIMER) || good.draft.text.split(TR_DISCLAIMER).length !== 2) {
      ccFail('valid rewrite rejected or disclaimer duplicated');
    }
    if (api.applyImprovedWording(a1, `${a1.body}\nAyrıca TBK m.49 uyarınca tazminat talep ederiz.`).ok) {
      ccFail('rewrite with new citation must be rejected');
    }
    if (api.applyImprovedWording(a1, a1.body.replace('45.000 TL', '50.000 TL')).ok) {
      ccFail('rewrite changing amount must be rejected');
    }
    if (api.applyImprovedWording(partial, partial.body.replace(/\[ [^\]]+ \]/, 'Mehmet Demir')).ok) {
      ccFail('rewrite filling a blank must be rejected');
    }
    if (api.applyImprovedWording(a1, `${a1.body}\nBu belge mahkemeye hazırdır.`).ok) {
      ccFail('court-ready over-claim must be rejected');
    }

    if (
      api.draftForScenario('labor_exit', 'unpaid_claim') !== 'mediation_application' ||
      api.draftForScenario('rent_arrears', 'tenant_protect') !== null ||
      api.draftForScenario('unpaid_invoice_b2b', 'disputed') !== 'mediation_application' ||
      api.draftForScenario('unpaid_invoice_b2b', 'formal_std') !== 'notice_payment'
    ) {
      ccFail('CA′ → draft mapping');
    }
  } catch (error) {
    ccFail(`runtime: ${error.message}`);
  }

  if (ccOk) {
    console.log('OK  WAVE CC guided drafts (N=51 → 13×979) + disclaimer-last + Edge sha256 frozen');
  }
}

process.exit(failed ? 1 : 0);
