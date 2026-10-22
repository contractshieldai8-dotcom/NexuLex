// NEXULEX AI - Hukuki Analiz Servisi (Anthropic Claude)
//
// GÜVENLİK: Bu dosya Anthropic'e ASLA doğrudan bağlanmaz ve hiçbir API anahtarı
// içermez. Tüm istekler Supabase `analyze-contract` Edge Function'ı üzerinden
// geçer; anahtar yalnızca sunucuda (ANTHROPIC_API_KEY secret) bulunur.

import { supabase } from './supabase';
import { AI_CONSENT_REQUIRED, ensureAiConsent } from './aiConsent';
import { getCachedAnalysis, setCachedAnalysis, documentCacheToken } from './analysisCache';
import { isAcceptableAnalysis, isPlaceholderText } from '../utils/analysis';
import { resolveAnalysisCategory } from '../utils/contractType';
import { statuteFor, getPlaybook, PLAYBOOKS } from '../constants/playbooks';
import { DOC_TYPES, isUsableExplanation, localIsoDate, normalizeExplanation } from '../utils/documentExplain';

const EDGE_FUNCTION_NAME = 'analyze-contract';
const REQUEST_TIMEOUT_MS = 145000;
const EXTRACT_TIMEOUT_MS = 120000;
const GENERATE_TIMEOUT_MS = 120000;
const MAX_ATTEMPTS = 1;

// Yanıt süresini kısaltan üretim parametreleri.
// Her sabit burada YALNIZCA bir kez tanımlanır (Metro SyntaxError / duplicate).
//
// NOT: "temperature" bu model ailesinde kullanımdan kaldırıldı; gönderildiğinde
// API 400 "`temperature` is deprecated for this model." döndürüyor. Bu yüzden
// istek gövdesi yalnızca model, max_tokens, system ve messages içerir.
const ANALYSIS_MAX_TOKENS = 8192;
const ANALYZE_MAX_TOKENS = ANALYSIS_MAX_TOKENS;
const EXTRACT_MAX_TOKENS = 8192;
const GENERATE_MAX_TOKENS = 16384;
const EXTRACT_MIN_CHARS = 200;
const CONTRACT_SLICE_CHARS = 24000;
const CHUNK_OVERLAP_CHARS = 800;
const ADVISOR_MAX_TOKENS = 1400;
const MAX_BASE64_CHARS = 2500000;
const MAX_REQUEST_CHARS = 2500000;
const EXTRACT_BATCH_SIZE = 2;

// Model kimlikleri artık Edge Function içinde tutulur; istemci yalnızca bir
// "mode" gönderir.
// default : günlük analizler için hız/kalite dengesi
// deep    : uzun ve karmaşık sözleşmelerde derin inceleme
// fast    : kısa metinler ve hızlı ön tarama
export const ANALYSIS_MODES = ['default', 'deep', 'fast'];

// Analiz çıktısının hangi dilde üretileceğini modele net biçimde bildirmek için kullanılır.
const LANGUAGE_NAMES = {
  tr: 'Turkish (Türkçe)',
  en: 'English',
  de: 'German (Deutsch)',
  fr: 'French (Français)',
  es: 'Spanish (Español)',
  ar: 'Arabic (العربية)',
  it: 'Italian (Italiano)',
  zh: 'Simplified Chinese (简体中文)',
  ru: 'Russian (Русский)',
  fa: 'Farsi / Persian (فارسی)',
  ja: 'Japanese (日本語)',
  pt: 'Portuguese (Português)',
  nl: 'Dutch (Nederlands)',
};

const resolveLanguage = (lang) => {
  const code = (lang || 'tr').split('-')[0].toLowerCase();
  return { code, name: LANGUAGE_NAMES[code] || LANGUAGE_NAMES.en };
};

export function buildTypographyDirective(lang) {
  const code = String(lang || 'en').split('-')[0].toLowerCase();
  const shared = `TYPOGRAPHY (generated fields only; originalText / verbatim quotes: copy the contract as-is, do not “fix” them):
- Full sentences in summary, explanation, issue, counterOffer, advisor answers, draft articles. End with . ! ? or the locale’s equivalent. No orphan comma before closing quotes.
- Never invent statute numbers. If citing: TR "TBK m. 621" (space after m.); DE "BGB § 280"; others official short form + article. No "TBK m.621" glued, no fake madde.
- Thousands: no space after the thousands separator ("30.000" not "30. 000"). No "30000TL" without a space before the currency code.
- JSON severity / riskLevel values stay RED, YELLOW, GREEN (English tokens). Titles and explanations are in the output language.`;

  let extra = '';
  if (code === 'tr') {
    extra = `Turkish extras:
- Dotted/dotless I as required (İşbu, iptal, Işık).
- Thousands "." decimals "," — "30.000 TL", "1.250,50 TL".`;
  } else if (code === 'en') {
    extra = `English extras:
- Thousands "," decimal "." — "$30,000", "USD 150,000".
- US spelling if country is US; British if GB; otherwise international legal English.`;
  } else if (code === 'de') {
    extra = `German extras:
- Capitalize nouns (Vertrag, Kündigung, Haftung).
- Thousands "." decimal "," — "30.000 €".`;
  } else if (code === 'fr') {
    extra = `French extras:
- Thousands space decimal "," — "30 000 €".
- Professional legal French; no English filler.`;
  } else if (code === 'es' || code === 'it' || code === 'pt' || code === 'nl') {
    extra = `Locale extras (${code}):
- Grouping/decimal of this locale (es/it/pt/nl: thousands "." or space, decimal "," — e.g. "30.000,50 €").
- Professional legal register; no anglicized filler.`;
  } else if (code === 'ar' || code === 'fa') {
    extra = `Locale extras (${code}):
- Native digits optional; if ASCII digits, still locale separators.
- No Latin/Arabic (or Latin/Persian) mixed in one sentence except statute codes.`;
  } else if (code === 'zh' || code === 'ja' || code === 'ru') {
    extra = `Locale extras (${code}):
- Native legal register. ASCII statute codes OK.
- No space-split thousands (never "30. 000").`;
  } else {
    extra = `English extras:
- Thousands "," decimal "." — "$30,000", "USD 150,000".
- International legal English.`;
  }

  return `${shared}\n${extra}`;
}

// Kullanıcının seçtiği ülke için modele verilecek somut mevzuat çerçevesi.
// "auto" seçilirse model yetkili hukuku sözleşmeden kendisi tespit eder.
const JURISDICTION_PROFILES = {
  TR: 'Türkiye. Apply Turkish law: 6098 sayılı Türk Borçlar Kanunu (m.18 genel işlem koşulları, m.27, m.112, m.115, m.179-182 cezai şart), 4721 sayılı Türk Medeni Kanunu, 4857 sayılı İş Kanunu, 6102 sayılı Türk Ticaret Kanunu, 6502 sayılı Tüketicinin Korunması Hakkında Kanun, 6698 sayılı KVKK.',
  US: 'United States. Apply US law: the Uniform Commercial Code (esp. UCC Article 2 for goods), the relevant State law (New York, Delaware General Corporation Law, California Bus. & Prof. Code §16600 for non-competes, California Labor Code), FTC and CFPB rules, and the restatements where relevant.',
  DE: 'Germany. Apply German law: BGB (§§305-310 AGB-Kontrolle, §138 Sittenwidrigkeit, §309 Klauselverbote, §622 Kündigungsfristen), HGB, Kündigungsschutzgesetz, and the GDPR/DSGVO.',
  GB: 'United Kingdom. Apply English law: common law of contract, Unfair Contract Terms Act 1977, Consumer Rights Act 2015, Employment Rights Act 1996, UK GDPR.',
  FR: 'France. Apply French law: Code civil (art. 1103, 1171 clauses abusives, 1231-5 clause pénale, 1240), Code de commerce (art. L442-1), Code du travail, RGPD.',
  ES: 'Spain. Apply Spanish law: Código Civil (art. 1255, 1152 cláusula penal), Ley de Condiciones Generales de la Contratación 7/1998, Estatuto de los Trabajadores, RGPD.',
  IT: 'Italy. Apply Italian law: Codice civile (art. 1341-1342 clausole vessatorie, art. 1382 clausola penale, art. 2043), Codice del Consumo, GDPR.',
  NL: 'Netherlands. Apply Dutch law: Burgerlijk Wetboek (Boek 6 art. 6:233 onredelijk bezwarende bedingen, art. 6:248 redelijkheid en billijkheid, Boek 7 employment), AVG/GDPR.',
  EU: 'European Union. Apply EU law: GDPR (Art. 6, 28, 44-49), Unfair Contract Terms Directive 93/13/EEC, Rome I Regulation 593/2008, Brussels I bis 1215/2012, Directive 2019/770 on digital content.',
  AE: 'United Arab Emirates. Apply UAE law: Federal Decree-Law No. 5/1985 Civil Transactions Law (art. 246 good faith, art. 390 agreed compensation), Federal Decree-Law No. 33/2021 Labour Law, Commercial Transactions Law.',
  SA: 'Saudi Arabia. Apply Saudi law: the Civil Transactions Law (2023), the Labor Law, the Commercial Courts Law, and applicable Sharia principles (gharar, riba prohibitions).',
  CN: "People's Republic of China. Apply PRC law: 中华人民共和国民法典 (Civil Code art. 496-498 standard clauses, art. 585 liquidated damages), 劳动合同法 (Labour Contract Law), 个人信息保护法 (PIPL).",
  RU: 'Russian Federation. Apply Russian law: Гражданский кодекс РФ (ст. 421 свобода договора, ст. 428 договор присоединения, ст. 330-333 неустойка), Трудовой кодекс РФ, ФЗ-152 о персональных данных.',
  IR: 'Islamic Republic of Iran. Apply Iranian law: قانون مدنی (Civil Code art. 10, 190, 219, 230 penalty clauses), قانون کار (Labour Code), قانون تجارت (Commercial Code).',
  IN: 'India. Apply Indian law: the Indian Contract Act 1872 (s.10 free consent and lawful object, s.23 unlawful object, s.27 restraint of trade, s.28 restraint of legal proceedings, s.73-74 damages and stipulated sums), the Specific Relief Act 1963, the Indian Stamp Act 1899 and the applicable State stamp law, the Arbitration and Conciliation Act 1996, the Information Technology Act 2000, the Digital Personal Data Protection Act 2023 and the Consumer Protection Act 2019. Cite a section number only when you are certain of it; never invent one. Report enforceability as a risk label, never as a final ruling.',
  CA: 'Canada. Apply Canadian law: the common law of contract of the relevant province (for example Ontario, British Columbia, Alberta), the Civil Code of Québec when Québec law governs (art. 1379 adhesion contracts, art. 1437 abusive clauses, art. 1623 penal clauses), the employment standards legislation of the relevant province, PIPEDA and provincial privacy laws. State in "summary" which province or Québec you assumed; if the province is unknown, say so and keep the answer at the level of shared principles. Cite an article number only when you are certain of it; never invent one. Report enforceability as a risk label, never as a final ruling.',
  AU: 'Australia. Apply Australian law: the common law of contract, the Australian Consumer Law (Schedule 2 to the Competition and Consumer Act 2010) including its unfair contract terms regime for consumer and small business contracts, the Fair Work Act 2009, the Privacy Act 1988 and the relevant State or Territory legislation. Cite a section number only when you are certain of it; never invent one. Report enforceability as a risk label, never as a final ruling.',
  AT: 'Austria. Apply Austrian law: the ABGB (§ 864a unusual clauses, § 879 contra bonos mores and grossly disadvantageous standard terms, § 1336 contractual penalty), the Konsumentenschutzgesetz (KSchG), the UGB, the Angestelltengesetz, the DSGVO and the Datenschutzgesetz. Cite a paragraph number only when you are certain of it; never invent one. Report enforceability as a risk label, never as a final ruling.',
  CH: 'Switzerland. Apply Swiss law: the Obligationenrecht (OR; art. 19-20 contract content, art. 21 over-reaching, art. 160-163 contractual penalty, art. 319 ff. employment, art. 340 ff. non-competition), the Zivilgesetzbuch (ZGB art. 2 good faith), the UWG (art. 8 unfair standard terms) and the revised Datenschutzgesetz (nDSG). Cite an article number only when you are certain of it; never invent one. Report enforceability as a risk label, never as a final ruling.',
};

const buildJurisdictionDirective = (countryCode) => {
  const profile = JURISDICTION_PROFILES[countryCode];

  if (!profile) {
    return `AUTO-JURISDICTION DETECTION (do this first, silently):
1. Detect the language the contract is written in.
2. Detect the governing law / competent court from the contract itself (choice-of-law clause, jurisdiction clause, currency, party addresses, tax or registry numbers, statutory references).
3. If no explicit clause exists, infer the most likely jurisdiction from those signals and mark the confidence as "LOW".
Do not default to TBK or Turkish law unless the contract text itself governs under Turkish law.`;
  }

  return `JURISDICTION SELECTED BY THE USER (MANDATORY): ${profile}
Analyse the contract strictly under this legal system even if the contract names a different governing law. If the contract's own choice-of-law clause points somewhere else, say so inside "summary" and keep analysing under the user's selected jurisdiction. Set "jurisdiction.confidence" to "HIGH" and "jurisdiction.country" to the selected country. Still detect and report the contract's own language in "jurisdiction.detectedLanguage".`;
};

const PARTY_PROFILES = {
  tenant:
    'The user is the TENANT / lessee (buyer-side). Score, red flags, counter-offers and the decision card must protect the tenant. Clauses that favour the landlord (unilateral rent increases, harsh penalties, short notice, waiver of statutory tenant rights) are risks even if commercially common.',
  landlord:
    'The user is the LANDLORD / lessor (seller-side). Protect the landlord’s ability to recover the property, collect rent and limit damage liability, while flagging terms that would be unenforceable or that expose the landlord.',
  employee:
    'The user is the EMPLOYEE / worker (buyer-side). Protect pay, overtime, termination, non-compete duration/geography, IP assignment and garden leave. One-sided employer rights are risks.',
  employer:
    'The user is the EMPLOYER (seller-side). Protect confidentiality, IP, garden leave and lawful termination, but flag unenforceable non-competes and statutory employee rights the employer cannot contract out of.',
  buyer:
    'The user is the BUYER / purchaser / tenant / employee / service recipient (the typically weaker, adhering party). Protect title, delivery, warranties, hidden fees, limitation of seller liability, unfair cancellation, auto-renewal traps and waived statutory rights.',
  seller:
    'The user is the SELLER / landlord / employer / service provider. Protect payment, limitation of liability and acceptance, but flag terms that would be void or that expose this party to unlimited risk.',
  customer:
    'The user is the CUSTOMER / client receiving the service (SaaS, subscription, consulting). Protect price-change, auto-renewal, data, lock-in, SLA and termination rights.',
  client:
    'The user is the CUSTOMER / client receiving the service (SaaS, subscription, consulting). Protect price-change, auto-renewal, data, lock-in, SLA and termination rights.',
  provider:
    'The user is the SERVICE PROVIDER / freelancer / vendor. Protect scope creep, late payment, unlimited liability, IP overreach and termination for convenience without kill fees.',
  freelancer:
    'The user is the SERVICE PROVIDER / freelancer / vendor. Protect scope creep, late payment, unlimited liability, IP overreach and termination for convenience without kill fees.',
};

const PARTY_ROLE_LABELS = {
  tenant: 'weaker / protected party — tenant / lessee',
  landlord: 'stronger / drafting party — landlord / lessor',
  employee: 'weaker / protected party — employee / worker',
  employer: 'stronger / drafting party — employer',
  buyer: 'weaker / protected party — tenant, employee, buyer, contractor',
  seller: 'stronger / drafting party — landlord, employer, seller, provider',
  customer: 'weaker / protected party — customer / client',
  client: 'weaker / protected party — customer / client',
  provider: 'stronger / drafting party — service provider / freelancer',
  freelancer: 'stronger / drafting party — service provider / freelancer',
};

const buildPartyDirective = (partyCode) => {
  const profile = PARTY_PROFILES[partyCode];
  const roleLabel = PARTY_ROLE_LABELS[partyCode] || 'weaker / protected party (tenant, employee, buyer, contractor)';
  const hardOrder = `HARD PERSONA (OVERRIDES ALL OTHER TONE): You are a senior attorney whose sole duty is to defend ${roleLabel} (protected party code: ${partyCode || 'auto'}).
Expose every vague, flexible or unbalanced clause that favours the counterparty. Those items MUST be redFlags with severity RED. For each such clause write a revised, advice-grade counterOffer that protects this party. Do not write a "balanced for both sides" report. State the protected party code (${partyCode || 'auto'}) inside "summary".`;
  if (!profile) {
    return `PARTY TO PROTECT (AUTO): Infer which party the user is — normally the one about to sign, or the typically weaker/adhering party. State that inferred role inside "summary".
${hardOrder}`;
  }
  return `PARTY TO PROTECT (MANDATORY): ${profile}
${hardOrder}`;
};

function buildStatuteMapDirective(countryCode, category) {
  const code = String(countryCode || '').toUpperCase();
  if (!JURISDICTION_PROFILES[code]) {
    return `AUTHORITATIVE STATUTE MAP: jurisdiction is auto. Use the detected jurisdiction.country. missing_protections.statute must be "" unless the official short form for that country is certain. Never invent article numbers. Never default to TBK.`;
  }
  const seen = new Set();
  const lines = [];
  const addItem = (item) => {
    if (!item?.id || seen.has(item.id)) return;
    seen.add(item.id);
    lines.push(`${item.id}=${statuteFor(item, code)}`);
  };
  (getPlaybook(category).items || []).forEach(addItem);
  Object.values(PLAYBOOKS).forEach((book) => (book.items || []).forEach(addItem));
  return `AUTHORITATIVE STATUTE MAP (${code}):
${lines.join('\n')}
missing_protections.statute MUST copy this exact statute when playbookId matches. If the mapped value is empty, use "". Never invent article numbers.`;
}

const buildDraftDirective = (partyCode) => {
  const roleLabel = PARTY_ROLE_LABELS[partyCode] || PARTY_ROLE_LABELS.buyer;
  return `DRAFTING PERSONA (NOT AN AUDIT): You are a senior transactional lawyer writing a complete, ready-to-sign contract FOR ${roleLabel}.
Numbered articles must protect this party on notice, payment, liability, termination, data, deposit/refund and dispute.
Do NOT return an analysis report. Do NOT output redFlags, clauses[], decision, score, trap_calendar, counterOffer or validity_analysis.
Write clean Markdown only. Never leave the contract body empty.`;
};

const pickDraftText = (parsed, rawText = '') => {
  const prose = stripMarkdownFences(rawText);
  if (/^\s*#/.test(prose)) return prose;
  if (parsed && typeof parsed === 'object') {
    const keys = [
      'draft',
      'revised_text',
      'revisedText',
      'contract',
      'contract_text',
      'contractText',
      'body',
      'text',
      'content',
    ];
    for (const key of keys) {
      const value = String(parsed[key] || '').trim();
      if (value.length > 40) return value;
    }
    const looksLikeAudit =
      parsed.redFlags ||
      parsed.red_flags ||
      parsed.decision ||
      parsed.trap_calendar ||
      parsed.clauses;
    if (looksLikeAudit) return '';
  }
  if (prose.length > 80 && !/^\s*\{/.test(prose)) return prose;
  return '';
};

const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504, 529]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Arayüzün çevrilebilir mesaj gösterebilmesi için ham teknik hatalar kodlanır.
// Kod -> i18n anahtarı eşlemesi utils/errors.js içinde yapılır.
export const AI_ERROR_CODES = {
  CONFIG: 'AI_CONFIG',
  AUTH: 'AI_AUTH',
  RATE_LIMIT: 'AI_RATE_LIMIT',
  TIMEOUT: 'AI_TIMEOUT',
  NETWORK: 'AI_NETWORK',
  SERVICE: 'AI_SERVICE',
  PARSE: 'AI_PARSE',
  EMPTY_INPUT: 'AI_EMPTY_INPUT',
  PDF_TOO_LARGE: 'AI_PDF_TOO_LARGE',
  IMAGES_TOO_LARGE: 'AI_IMAGES_TOO_LARGE',
  HEAVY: 'AI_HEAVY',
  EXTRACT: 'AI_EXTRACT_FAILED',
  EXTRACT_TRUNCATED: 'AI_EXTRACT_TRUNCATED',
  DRAFT_TRUNCATED: 'AI_DRAFT_TRUNCATED',
  CONSENT: AI_CONSENT_REQUIRED,
};

// Ham hatayı kullanıcıya gösterilebilir, kodlanmış bir hataya dönüştürür.
// Teknik ayrıntı `detail` alanında saklanır ve yalnızca konsola yazılır.
const isAbortLike = (error) => {
  const name = String(error?.name || '');
  const message = String(error?.message || error?.detail || '');
  return name === 'AbortError' || /canceled|cancelled|aborted|AbortError/i.test(message);
};

function toFriendlyError(error, kind = 'pdf') {
  if (error?.code && String(error.code).startsWith('AI_')) return error;

  const status = error?.status;
  const detail = String(error?.message || error?.detail || error || '');
  let code = AI_ERROR_CODES.SERVICE;

  if (isAbortLike(error)) {
    code = AI_ERROR_CODES.TIMEOUT;
  } else if (status === 546) {
    code = AI_ERROR_CODES.HEAVY;
  } else if (status === 413 || /PAYLOAD_TOO_LARGE/i.test(detail)) {
    code = kind === 'images' ? AI_ERROR_CODES.IMAGES_TOO_LARGE : AI_ERROR_CODES.PDF_TOO_LARGE;
  } else if (error instanceof TypeError) {
    code = AI_ERROR_CODES.NETWORK;
  } else if (status === 401 || status === 403) {
    code = AI_ERROR_CODES.AUTH;
  } else if (status === 429) {
    code = AI_ERROR_CODES.RATE_LIMIT;
  }

  const friendly = new Error(code);
  friendly.code = code;
  friendly.status = status;
  friendly.detail = detail;
  return friendly;
}

const makeError = (code, detail) => {
  const error = new Error(code);
  error.code = code;
  if (detail) error.detail = detail;
  return error;
};

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Edge Function'ın kimlik doğrulamalı uç noktası.
// supabase.functions.invoke yerine doğrudan fetch kullanılır: böylece HTTP
// durum kodu, zaman aşımı ve yeniden deneme mantığı üzerinde tam kontrol olur.
async function buildRequestHeaders() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw makeError(
      AI_ERROR_CODES.CONFIG,
      'EXPO_PUBLIC_SUPABASE_URL veya EXPO_PUBLIC_SUPABASE_ANON_KEY tanımlı değil.'
    );
  }

  const { data } = await supabase.auth.getSession();
  const accessToken = data?.session?.access_token;

  if (!accessToken) {
    throw makeError(AI_ERROR_CODES.AUTH, 'Oturum bulunamadı.');
  }

  return {
    'content-type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
  };
}

function weighContent(content) {
  if (typeof content === 'string') return content.length;
  if (!Array.isArray(content)) return 0;
  let total = 0;
  for (const block of content) {
    if (typeof block === 'string') {
      total += block.length;
    } else if (block && typeof block === 'object') {
      if (typeof block.source?.data === 'string') total += block.source.data.length;
      if (typeof block.text === 'string') total += block.text.length;
    }
  }
  return total;
}

function assertMediaBudget(base64Parts, kind = 'pdf') {
  let total = 0;
  for (const part of base64Parts || []) {
    total += String(part || '').length;
    if (total > MAX_BASE64_CHARS) {
      throw makeError(
        kind === 'images' ? AI_ERROR_CODES.IMAGES_TOO_LARGE : AI_ERROR_CODES.PDF_TOO_LARGE,
        'Payload exceeds 2.5M base64 chars.'
      );
    }
  }
}

function assertMessagesBudget(messages, kind = 'pdf') {
  let total = 0;
  for (const message of messages || []) {
    total += weighContent(message?.content);
    if (total > MAX_REQUEST_CHARS) {
      throw makeError(
        kind === 'images' ? AI_ERROR_CODES.IMAGES_TOO_LARGE : AI_ERROR_CODES.PDF_TOO_LARGE,
        'Payload exceeds 1.8M request chars.'
      );
    }
  }
}

// Ağ gecikmesi / kota hatalarına karşı sınırlı backoff. Abort / 413 / 546 asla zincirlenmez.
async function callClaudeProxy({
  system,
  messages,
  mode,
  maxTokens = ANALYSIS_MAX_TOKENS,
  timeoutMs = REQUEST_TIMEOUT_MS,
  maxAttempts = MAX_ATTEMPTS,
  expectJson = false,
  budgetKind = 'pdf',
} = {}) {
  assertMessagesBudget(messages, budgetKind);
  // Nothing leaves the device before the user has agreed to AI processing.
  await ensureAiConsent();
  const headers = await buildRequestHeaders();
  const endpoint = `${SUPABASE_URL.replace(/\/+$/, '')}/functions/v1/${EDGE_FUNCTION_NAME}`;
  const body = JSON.stringify({ mode, system, messages, maxTokens, expectJson });
  const attempts = Math.max(1, maxAttempts);

  let lastError;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers,
        body,
      });

      const payload = await response.json().catch(() => null);

      const emptyEdge =
        payload?.error === 'empty-edge-text' ||
        (response.status === 502 && /empty-edge-text/i.test(String(payload?.error || '')));

      if (!response.ok) {
        if (emptyEdge || response.status === 502) {
          console.warn('empty-edge-text');
          // Maps to errParseRetry on paste / PARSE toast path — do not silent-succeed.
          throw makeError(AI_ERROR_CODES.PARSE, String(payload?.error || 'empty-edge-text'));
        }
        const detail = payload?.error || `HTTP ${response.status}`;
        const error = new Error(`Analiz servisi ${response.status}: ${String(detail).slice(0, 300)}`);
        error.status = response.status;
        throw error;
      }

      const text = String(payload?.text || '');
      if (!text.trim()) {
        console.warn('empty-edge-text');
        throw makeError(AI_ERROR_CODES.PARSE, 'empty-edge-text');
      }

      return text;
    } catch (error) {
      lastError = error;

      const isTimeout = isAbortLike(error);
      const isNetwork = error instanceof TypeError && !isTimeout;
      const fatalStatus = error.status === 413 || error.status === 546;
      const isRetryable =
        !fatalStatus && (isTimeout || isNetwork || RETRYABLE_STATUS.has(error.status));

      if (!isRetryable || attempt >= attempts - 1) {
        const friendly = toFriendlyError(error, budgetKind);
        console.warn(`Analiz servisi hatası (${friendly.code}):`, friendly.detail);
        throw friendly;
      }

      const backoff = 1000 * 2 ** attempt + Math.floor(Math.random() * 400);
      console.warn(`Analiz isteği başarısız (${error.status || error.name}). ${backoff} ms sonra tekrar denenecek.`);
      await sleep(backoff);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw toFriendlyError(lastError, budgetKind);
}

const callClaude = ({ system, content, mode, maxTokens, timeoutMs, maxAttempts, expectJson, budgetKind }) =>
  callClaudeProxy({
    system,
    messages: [{ role: 'user', content }],
    mode,
    maxTokens,
    timeoutMs,
    maxAttempts,
    expectJson,
    budgetKind,
  });

function buildSystemPrompt(lang, countryCode, partyCode, category = 'general') {
  const { name: languageName } = resolveLanguage(lang);

  const knownJurisdiction = !!JURISDICTION_PROFILES[countryCode];
  const jurisdictionLead = knownJurisdiction
    ? 'Analyse ONLY under the jurisdiction directive below. Do not default to Turkish law.'
    : 'Do not default to Turkish law or TBK unless the contract text itself governs under Turkish law.';

  return `You are a senior contract auditor — NexuLex AI, the user's Global Pocket Lawyer.
${jurisdictionLead}
You never invent statute numbers. You never return truncated JSON. You never copy the contract into "summary".

${buildJurisdictionDirective(countryCode)}

${buildPartyDirective(partyCode)}

CONTRACT CATEGORY: ${category}.
${
  category === 'saas'
    ? `SAAS FOCUS: Prioritize SLA uptime, acceptance tests, go-live, maintenance periods, IP/license scope, unilateral price change, auto-renewal, and data processing. Prefer missing_protections playbookIds saas_sla, saas_acceptance, saas_ip_license, saas_renewal, saas_price, saas_data when topics match. detected_contract_category should be "saas" when the contract is software license / maintenance / YÜKLENİCİ–MÜŞTERİ SaaS — not nda merely because a confidentiality clause exists.`
    : ''
}

OUTPUT LANGUAGE (STRICT): ${languageName}. Write summary, decision, redFlags, clauses, trap_calendar and missing_protections entirely in ${languageName}.
${buildTypographyDirective(lang)}
"originalText" is the only field quoted verbatim from the contract.
originalText MUST be a contiguous verbatim substring of the contract (copy-paste), including the sub-clause number when present (e.g. '4.3. Sağlayıcı, piyasa…'). Do not paraphrase. Do not translate the quote. Max 180 characters.

CORE AUDIT:
- Toxic / one-sided clauses: hidden penalties, disproportionate termination, unilateral amendment, unlimited liability, unpaid overtime, excessive non-compete, auto-renewal traps, one-sided venue. Put these in "redFlags" (max 4).
- Decision: exactly one of SIGN, NEGOTIATE or WALK_AWAY. SIGN only if fair for the protected party. WALK_AWAY if signing as-is is dangerous. Otherwise NEGOTIATE. Headline + up to 3 non-empty reasons + estimatedHarm.
- summary: max 3 short sentences. NEVER paste or paraphrase long stretches of the contract. No N/A.
- clauses: min 3 max 5 cards. Each issue: max 3 short sentences (risk, scenario, next step). Never empty, never N/A.
- trap_calendar: termination, confidentiality, return_or_refund. Concrete rule if present; otherwise date_or_rule = "UNSPECIFIED" and note = "".
- missing_protections: max 5. status PRESENT, WEAK or ABSENT. Playbook statute map is authoritative for missing_protections.playbookId citations.
- Score 1–100 (never 0 when you actually read a contract).
- Every RED/YELLOW clause and every redFlag MUST include a paste-ready counterOffer (max 400 characters; GREEN clauses use "").
- Prefer counterOffers{balanced,shield,fast} (each ≤400 chars) for RED/YELLOW: balanced = fair protect; shield = stronger protect; fast = quick accept compromise. Set counterOffer = balanced for backward compat. If budget is tight (short path), a single counterOffer string is OK.

DO NOT OUTPUT: audio_script, glossary, batna_ladder, lawyer_questions, counter_proposals, hidden_costs_breakdown, financial_exposure, decision_card, obligations_checklist, integrity_checks, sign_conditions_eval, keyTakeaways, negotiationTips, contract_events, counterMessage.

RESPONSE FORMAT:
Return ONLY one complete JSON object. First character "{", last character "}".
No markdown fences. No preamble. Close the JSON. Hard limits: redFlags max 4, clauses min 3 max 5, missing_protections max 5, validity humility: if unsure a clause is void, omit legalStatus or use QUESTIONABLE — never guess VOID.`;
}

function buildTaskPrompt(contractType, sourceInstruction) {
  return `${sourceInstruction}

Contract type declared by the user: ${contractType}

Return JSON matching exactly this CORE schema and nothing else:

{
  "summary": "Max 3 sentences: exposure and recommended posture. Do not copy the contract.",
  "overallRisk": "RED",
  "score": 65,
  "jurisdiction": {
    "country": "Detected country or region",
    "governingLaw": "Detected governing law / court",
    "detectedLanguage": "Language of the contract",
    "confidence": "HIGH"
  },
  "detected_contract_category": "rent",
  "redFlags": [
    {
      "title": "Short name of the toxic clause",
      "severity": "RED",
      "explanation": "Why it is unfair and what it costs the protected party",
      "legalReference": "Statute name; article only if certain",
      "originalText": "Quoted verbatim substring max 180 chars, include sub-clause number when present (e.g. '4.3. Sağlayıcı, piyasa…'). Do not paraphrase.",
      "counterOffer": "Same as counterOffers.balanced (backward compat)",
      "counterOffers": {
        "balanced": "Fair protect, paste-ready, max 400 chars",
        "shield": "Stronger protect for this party, max 400 chars",
        "fast": "Quick-accept compromise, max 400 chars"
      }
    }
  ],
  "clauses": [
    {
      "clauseTitle": "Clause heading",
      "originalText": "Contiguous verbatim substring of the contract, max 180 characters, include '4.3. …' when present. Do not paraphrase. Do not translate the quote.",
      "riskLevel": "RED",
      "issue": "Risk, scenario, next step. Never empty. Never N/A.",
      "legalReference": "Statute name or empty string",
      "counterOffer": "Same as counterOffers.balanced (or \"\" if GREEN)",
      "counterOffers": {
        "balanced": "Fair protect overwrite, max 400 chars",
        "shield": "Stronger protect overwrite, max 400 chars",
        "fast": "Quick-accept overwrite, max 400 chars"
      }
    }
  ],
  "decision": {
    "action": "NEGOTIATE",
    "headline": "One-sentence verdict",
    "reasons": ["First reason", "Second reason", "Third reason"],
    "estimatedHarm": "What signing as-is costs in practice"
  },
  "trap_calendar": {
    "termination": { "date_or_rule": "30 days written notice", "note": "" },
    "confidentiality": { "date_or_rule": "UNSPECIFIED", "note": "" },
    "return_or_refund": { "date_or_rule": "UNSPECIFIED", "note": "" }
  },
  "missing_protections": [
    {
      "playbookId": "rent_deposit",
      "status": "ABSENT",
      "statute": "",
      "whyItHurts": "One short sentence",
      "insertClause": "Ready-to-propose clause",
      "severity": "HIGH"
    }
  ],
  "contract_radar": {
    "parties": "Party A vs Party B from the contract only, or empty string",
    "governing_law_forum": "Governing law + competent court/forum if stated, or empty string",
    "notice_period": "Key notice/termination window if stated, or empty string"
  }
}

Rules:
- "overallRisk", "riskLevel" and "severity" accept only "RED", "YELLOW" or "GREEN".
- "decision.action" accepts only "SIGN", "NEGOTIATE" or "WALK_AWAY".
- "confidence" accepts only "HIGH", "MEDIUM" or "LOW".
- "missing_protections.status" accepts only "PRESENT", "WEAK" or "ABSENT".
- redFlags max 4. clauses min 3 max 5. missing_protections max 5.
- Each counterOffer / counterOffers.* max 400 characters. GREEN clauses: counterOffer "" and omit or empty counterOffers. If JSON would not close, shorten counterOffers — never add glossary.
- Prefer counterOffers{balanced,shield,fast} for RED/YELLOW; counterOffer must equal balanced. Short path may return only counterOffer.
- summary max 3 sentences. Never copy the contract body into summary. Never write N/A.
- decision.reasons: up to 3 non-empty strings. Do not invent empty reasons to reach 3.
- contract_radar: optional. Empty strings if unknown. Never invent parties, courts or notice windows.
- LEGAL CITES: For redFlags[].legalReference and clauses[].legalReference, when jurisdiction/country is TR (or the user-selected country), cite a real statute article (TBK, TTK, İş Kanunu, etc.) only if you are certain it applies to that flag. If unsure, use "". Never invent madde numbers. Prefer empty over a guessed cite.
- Output ONLY this CORE object. No extra keys beyond the schema above.`;
}

// Model bazen JSON'u markdown bloğu içinde döndürür. Tamir denemesi
// yalnızca CORE alanlar doluysa kabul edilir; aksi halde AI_PARSE fırlatılır.
const EMPTY_ANALYSIS = {
  summary: '',
  overallRisk: 'YELLOW',
  score: 0,
  clauses: [],
  redFlags: [],
  negotiationTips: [],
  glossary: [],
  keyTakeaways: [],
  decision: {
    action: 'NEGOTIATE',
    headline: '',
    reasons: [],
    estimatedHarm: '',
  },
  counterMessage: '',
  importantDates: [],
  decision_card: {
    verdict: 'NEGOTIATE',
    one_sentence_summary: '',
    top_3_red_flags: [],
    estimated_financial_risk: '',
    action_advice: '',
  },
  validity_analysis: [],
  hidden_costs_breakdown: {
    penalty_clause_amount: '',
    deposit_risk: '',
    auto_renewal_cost: '',
    price_increase_cost: '',
    early_termination_fee: '',
    notice_period_cost: '',
    interest_or_default: '',
    horizon_label: '',
    total_estimated_liability: '',
  },
  financial_exposure: {
    total_estimated_liability: '',
    horizon_label: '',
  },
  audio_script: '',
  detected_contract_category: 'general',
  counter_proposals: [],
  contract_events: [],
  trap_calendar: {
    termination: { date_or_rule: 'UNSPECIFIED', note: '' },
    confidentiality: { date_or_rule: 'UNSPECIFIED', note: '' },
    return_or_refund: { date_or_rule: 'UNSPECIFIED', note: '' },
  },
  obligations_checklist: [],
  integrity_checks: {
    missing_signature_line: false,
    missing_dates: false,
    suspicious_iban_or_payment: false,
    unilateral_amendment_clause: false,
    warning_flags: [],
  },
  jurisdiction: {
    country: '',
    governingLaw: '',
    detectedLanguage: '',
    confidence: 'LOW',
  },
  missing_protections: [],
  power_tilt: null,
  batna_ladder: [],
  governing_law_conflict: null,
  lawyer_questions: [],
  sign_conditions: [],
  sign_status: null,
};

function stripMarkdownFences(text) {
  return String(text || '')
    .replace(/^\uFEFF/, '')
    .replace(/```(?:json|JSON)?\s*/gi, '')
    .replace(/```/g, '')
    .trim();
}

function tryParseJson(value) {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  } catch {
    /* bir sonraki tamir denemesine geçilir */
  }
  return null;
}

function extractJsonCandidate(text) {
  const cleaned = stripMarkdownFences(text);
  const start = cleaned.indexOf('{');
  return start === -1 ? cleaned : cleaned.slice(start);
}

function scanJsonState(text) {
  let inString = false;
  let escaped = false;
  const stack = [];

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
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if ((ch === '}' || ch === ']') && stack[stack.length - 1] === ch) {
      stack.pop();
    }
  }

  return { inString, escaped, stack };
}

function stripTrailingComma(text) {
  return text.replace(/,(\s*)$/, '$1');
}

// Token limiti yüzünden yarım kesilen JSON'u kapatır: açık string, dizi ve nesne.
function repairTruncatedJson(rawText) {
  let text = extractJsonCandidate(rawText);
  if (!text) return text;

  // Sonda yarım kalan kaçış dizisi (\ veya \u12) parse'ı bozar.
  text = text.replace(/\\u[0-9a-fA-F]{0,3}$/, '');
  text = text.replace(/\\$/, '');

  let state = scanJsonState(text);
  if (state.escaped) {
    text = text.slice(0, -1);
    state = scanJsonState(text);
  }
  if (state.inString) text += '"';

  text = stripTrailingComma(text);
  state = scanJsonState(text);
  while (state.stack.length) {
    text += state.stack.pop();
  }

  return text;
}

function dropIncompleteTail(text) {
  const lastComma = text.lastIndexOf(',');
  const lastColon = text.lastIndexOf(':');
  const cutAt = Math.max(lastComma, lastColon);
  if (cutAt <= 0) return text;
  return repairTruncatedJson(text.slice(0, cutAt));
}

function stripInnerTrailingCommas(text) {
  return String(text || '').replace(/,(\s*[}\]])/g, '$1');
}

function headingFromMarkdown(text) {
  const match = String(text || '').match(/^\s{0,3}#{1,3}\s+(.+)$/m);
  return match ? String(match[1] || '').trim().slice(0, 120) : '';
}

function safeParseJSON(rawText) {
  if (!rawText || !String(rawText).trim()) return null;
  const cleaned = stripMarkdownFences(rawText);
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const sliced = start !== -1 && end > start ? cleaned.slice(start, end + 1) : '';
  const candidates = [
    sliced,
    stripInnerTrailingCommas(sliced),
    repairTruncatedJson(cleaned),
    stripInnerTrailingCommas(repairTruncatedJson(cleaned)),
    dropIncompleteTail(extractJsonCandidate(cleaned)),
    repairTruncatedJson(rawText),
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const parsed = tryParseJson(candidate);
    if (parsed) return parsed;
  }
  return null;
}

function parseAnalysisResponse(rawText, { complete = false, contractText = '' } = {}) {
  const parsed = safeParseJSON(rawText);
  if (!parsed) {
    console.warn('parse-null: Ayrıştırılamayan Claude yanıtı.');
    throw makeError(AI_ERROR_CODES.PARSE, 'Ayrıştırılamayan Claude yanıtı.');
  }
  delete parsed.__parseFailed;
  delete parsed.__parsePartial;
  if (complete && !isAcceptableAnalysis(parsed, contractText || parsed.contract_text || parsed.contractText)) {
    console.warn('acceptability-fail: Analiz JSON eksik veya kesik.');
    throw makeError(AI_ERROR_CODES.PARSE, 'Analiz JSON eksik veya kesik.');
  }
  return parsed;
}

// Analiz adımlarını arayüze bildiren yardımcı.
// Adım anahtarları: parsing -> jurisdiction -> risks -> report
export const ANALYSIS_STEPS = ['parsing', 'jurisdiction', 'risks', 'clauses', 'report'];

const SHORT_SCHEMA_ADDENDUM = `
CORE JSON only. Do not add audio_script, glossary, batna_ladder, lawyer_questions, hidden_costs, decision_card, counter_proposals, obligations or integrity_checks.
Short path: prefer counterOffers{balanced,shield,fast} when they fit; a single counterOffer string is OK if budget is tight.`;

function sliceContractText(text, limit = CONTRACT_SLICE_CHARS) {
  const raw = String(text || '').trim();
  const cap = Number(limit) > 0 ? Number(limit) : CONTRACT_SLICE_CHARS;
  if (raw.length <= cap) return raw;
  const head = Math.floor(cap * 0.7);
  const tail = cap - head;
  const tailStart = Math.max(head - CHUNK_OVERLAP_CHARS, raw.length - tail);
  return `${raw.slice(0, head)}\n\n[...]\n\n${raw.slice(tailStart)}`;
}

function partialFromExtract(extract) {
  const contract_text = String(extract || '').trim();
  return {
    ...EMPTY_ANALYSIS,
    summary: contract_text.slice(0, 1200),
    contract_text,
    contractText: contract_text,
    __extractFallback: true,
    __parsePartial: true,
  };
}

async function runAnalysis({
  content,
  lang,
  mode,
  country,
  party,
  category,
  onProgress,
  maxTokens = ANALYZE_MAX_TOKENS,
  extraSystem = '',
  skipParsingNotify = false,
  timeoutMs = REQUEST_TIMEOUT_MS,
  maxAttempts = MAX_ATTEMPTS,
  contractText = '',
}) {
  const notify = (step) => {
    if (typeof onProgress === 'function') onProgress(step);
  };

  if (!skipParsingNotify) notify('parsing');
  else notify('jurisdiction');

  const midFlightTimers = skipParsingNotify
    ? [setTimeout(() => notify('risks'), 4000)]
    : [
        setTimeout(() => notify('jurisdiction'), 1500),
        setTimeout(() => notify('risks'), 7000),
      ];

  try {
    const rawText = await callClaude({
      system: `${buildSystemPrompt(lang, country, party, category)}${extraSystem}`,
      content,
      mode,
      maxTokens,
      timeoutMs,
      maxAttempts,
      expectJson: 'analysis',
    });

    notify('report');
    return parseAnalysisResponse(rawText, { complete: true, contractText });
  } finally {
    midFlightTimers.forEach(clearTimeout);
  }
}

function joinExtractParts(base, extra) {
  const a = String(base || '').replace(/\s+$/g, '');
  const b = String(extra || '').replace(/^\s+/g, '');
  if (!a) return b;
  if (!b) return a;
  const tail = a.slice(-Math.min(80, a.length));
  const idx = b.indexOf(tail);
  if (idx >= 0) return `${a}${b.slice(idx + tail.length)}`;
  const max = Math.min(160, a.length, b.length);
  for (let n = max; n >= 12; n -= 1) {
    if (b.slice(0, n) === a.slice(-n)) return `${a}${b.slice(n)}`;
  }
  return `${a}\n${b}`;
}

export function isTruncatedExtract(text) {
  const body = String(text || '').replace(/\s+$/g, '');
  if (!body) return true;
  const lastLine = (body.split('\n').filter((line) => line.trim()).pop() || '').trim();
  if (/^(#{1,6}|Madde\s+\d+|\d+(?:\.\d+)*)[.)]?\s*$/i.test(lastLine)) return true;
  const tail = body.slice(-40);
  if (tail.length >= 12 && !/\s/.test(tail)) return true;
  const lastWord = (tail.match(/[^\s.,;:!?…"'»)\]]+$/) || [''])[0];
  const endsPunct = /[.!?…"')\]}:;]$/.test(body);
  if (
    !endsPunct &&
    lastWord.length >= 2 &&
    lastWord.length <= 8 &&
    /^[A-Za-zÀ-ÖØ-öø-ÿÇĞİÖŞÜçğıöşü]+$/.test(lastWord)
  ) {
    return true;
  }
  return false;
}

function lastNumberedClause(text) {
  const matches = String(text || '').match(/(?:^|\n)\s*(\d{1,2})(?:\.\d{1,2})?\s*[.)]/g) || [];
  if (!matches.length) return 0;
  const last = matches[matches.length - 1];
  const num = Number((String(last).match(/(\d{1,2})/) || [0, 0])[1]);
  return Number.isFinite(num) ? num : 0;
}

export function looksIncompleteExtract(text, { fromMedia = false } = {}) {
  if (isTruncatedExtract(text)) return true;
  const body = String(text || '');
  if (!body.trim()) return true;
  const hasSignOff =
    /(?:^|\n)\s*(?:#{1,3}\s*)?(İMZA|IMZA|SIGNATURES?|IN\s+WITNESS|İmza\s*:|Kiracı\s+İmza|Taraf\s+[AB])\b/i.test(
      body
    );
  const mentionsAnnex = /Ek\s*-?\s*1|Annex\s*1/i.test(body);
  const hasAnnexHeading = /(?:^|\n)\s*(?:#{1,3}\s*)?(EK\s*-?\s*1|Annex\s*1)\b/im.test(body);
  // Annex mention without annex body: warning only for paste; hard-cut only for OCR/PDF when body looks cut.
  if (mentionsAnnex && !hasAnnexHeading) {
    if (!fromMedia) return false;
    if (hasSignOff || lastNumberedClause(body) >= 3) return false;
    return true;
  }
  if (fromMedia && lastNumberedClause(body) < 3 && body.length > 2500 && !hasSignOff) return true;
  return false;
}

async function extractContractText({ blocks, budgetKind = 'pdf' }) {
  const items = Array.isArray(blocks) ? blocks.filter(Boolean) : [];
  if (!items.length) return '';

  const batches = [];
  for (let i = 0; i < items.length; i += EXTRACT_BATCH_SIZE) {
    batches.push(items.slice(i, i + EXTRACT_BATCH_SIZE));
  }

  const transcribe = ({ batch, mode, prompt, timeoutMs }) =>
    callClaude({
      system: 'You are a precise OCR / document transcription engine.',
      content: [...batch, { type: 'text', text: prompt }],
      mode,
      maxTokens: EXTRACT_MAX_TOKENS,
      timeoutMs,
      maxAttempts: MAX_ATTEMPTS,
      budgetKind,
    }).then(stripMarkdownFences);

  const firstPrompt =
    'Transcribe the FULL contract verbatim, every clause, numbers, dates, stamps, headers. Preserve reading order. Output ONLY the contract text. No JSON, no markdown fences, no commentary.';

  const parts = [];
  for (const batch of batches) {
    assertMediaBudget(
      batch.map((item) => item.source?.data).filter(Boolean),
      budgetKind
    );
    let chunk = await transcribe({
      batch,
      mode: 'fast',
      prompt: firstPrompt,
      timeoutMs: EXTRACT_TIMEOUT_MS,
    });
    for (let step = 0; step < 1 && chunk && isTruncatedExtract(chunk); step += 1) {
      const tail = chunk.slice(-120);
      const cont = await transcribe({
        batch,
        mode: 'default',
        prompt: `Continue verbatim from this tail, do not restart:\n${tail}\nOutput ONLY the continuation of the contract text. No JSON, no markdown, no commentary.`,
        timeoutMs: EXTRACT_TIMEOUT_MS,
      });
      if (String(cont || '').length < 100) break;
      const joined = joinExtractParts(chunk, cont);
      if (joined.length < chunk.length + 40) break;
      chunk = joined;
    }
    if (chunk) parts.push(chunk);
  }
  return parts.join('\n\n');
}

function withExtractedSource(parsed, text, extractFallback = false) {
  const contract_text = String(text || '').trim();
  return {
    ...parsed,
    contract_text,
    contractText: contract_text,
    ...(extractFallback ? { __extractFallback: true } : {}),
    ...(looksIncompleteExtract(contract_text, { fromMedia: true }) ? { __extractTruncated: true } : {}),
  };
}

// 1. Metin Tabanlı Sözleşme Analizi
export async function analyzeContract(
  contractText,
  contractType = 'Genel Hukuk',
  lang = 'tr',
  mode = 'default',
  {
    country = 'auto',
    party = 'auto',
    category = 'general',
    onProgress,
    skipParsingNotify = false,
    recoverOnParse = false,
    allowPartial = false,
    timeoutMs,
  } = {}
) {
  if (!contractText || !contractText.trim()) {
    throw makeError(AI_ERROR_CODES.EMPTY_INPUT, 'Sözleşme metni boş.');
  }

  const resolvedCategory = resolveAnalysisCategory(contractText, category);
  const sliced = sliceContractText(contractText, 24000);
  const analysisTimeout = timeoutMs || REQUEST_TIMEOUT_MS;
  const analysisMode = mode || 'default';
  const useShortPath = analysisMode === 'fast' || sliced.length < 6000;
  const baseSystem = `${buildSystemPrompt(lang, country, party, resolvedCategory)}${SHORT_SCHEMA_ADDENDUM}`;
  const legalRefHumility = `LEGAL REFERENCE HUMILITY: redFlags[].legalReference, clauses[].legalReference, and missing_protections[].statute MUST copy the AUTHORITATIVE STATUTE MAP or a law the contract itself cites. When country/jurisdiction is TR (or the selected country), include a real article cite (TBK/TTK/etc.) only if certain it applies; if unsure use "". NEVER invent madde numbers. NEVER invent or default to TBK unless the target country is explicitly TR or the contract itself explicitly cites TBK.`;
  const flightASystem = `${baseSystem}
FLIGHT A: CORE keys ONLY — summary, overallRisk, score, jurisdiction, detected_contract_category, redFlags (max 4), decision, trap_calendar, missing_protections (max 5). Do NOT output clauses.
${buildStatuteMapDirective(country, resolvedCategory)}
${legalRefHumility}`;
  const flightBSystem = `${baseSystem}
FLIGHT B: Output ONLY { "clauses": [ ... min 3 max 5 ... ] } with clauseTitle, originalText, riskLevel, issue, legalReference, counterOffer, and when possible counterOffers{balanced,shield,fast}. No summary, no redFlags, no decision.
${buildStatuteMapDirective(country, resolvedCategory)}
${legalRefHumility}`;
  const singleFlightSystem = `${baseSystem}
SINGLE CORE FLIGHT: Output ONE complete JSON with summary, overallRisk, score, jurisdiction, detected_contract_category, redFlags (max 4), decision, trap_calendar, missing_protections (max 5), AND clauses (min 3 max 5) each with clauseTitle, originalText, riskLevel, issue, legalReference, counterOffer (+ counterOffers when possible). Close all braces.
${buildStatuteMapDirective(country, resolvedCategory)}
${legalRefHumility}`;

  const notify = (step) => {
    if (typeof onProgress === 'function') onProgress(step);
  };

  const contractBlock = (slice) => `CONTRACT TEXT:
"""
${slice}
"""`;

  const promptA = (slice) => `${buildTaskPrompt(contractType, 'Analyze the contract text provided below in detail.')}

Do NOT output clauses.

${contractBlock(slice)}`;

  const promptSingle = (slice) => `${buildTaskPrompt(contractType, 'Analyze the contract text provided below in detail.')}

Include clauses (min 3 max 5) in the same JSON response.

${contractBlock(slice)}`;

  const promptB = (slice, digest) => `Write clause cards only for this contract. No summary, no redFlags, no decision.

FLIGHT A DIGEST (action / score / redFlag titles only):
${digest}

${contractBlock(slice)}`;

  const runFlight = async (system, buildPrompt) => {
    const invoke = async (slice) => {
      const raw = await callClaude({
        system,
        content: [{ type: 'text', text: buildPrompt(slice) }],
        mode: analysisMode,
        maxTokens: ANALYSIS_MAX_TOKENS,
        timeoutMs: analysisTimeout,
        maxAttempts: MAX_ATTEMPTS,
        expectJson: 'analysis',
      });
      return parseAnalysisResponse(raw, { complete: false, contractText: slice });
    };
    try {
      return await invoke(sliced);
    } catch (error) {
      if (error?.code === AI_ERROR_CODES.PARSE) {
        return invoke(sliceContractText(contractText, 12000));
      }
      throw error;
    }
  };

  const runFlightBFallback = async (digest, existingClauses) => {
    let parsedB = { clauses: existingClauses };
    try {
      parsedB = await runFlight(flightBSystem, (slice) => promptB(slice, digest));
    } catch (error) {
      if (error?.code !== AI_ERROR_CODES.PARSE) throw error;
      parsedB = { clauses: existingClauses };
    }
    const clauseN = Array.isArray(parsedB?.clauses) ? parsedB.clauses.length : 0;
    if (clauseN < 3) {
      try {
        const tight = sliceContractText(contractText, 8000);
        const rawB = await callClaude({
          system: `${flightBSystem}\nReturn ONLY a complete JSON object with "clauses" (min 3 max 5). Close all braces.`,
          content: [{ type: 'text', text: promptB(tight, digest) }],
          mode: analysisMode,
          maxTokens: ANALYSIS_MAX_TOKENS,
          timeoutMs: analysisTimeout,
          maxAttempts: MAX_ATTEMPTS,
          expectJson: 'analysis',
        });
        const retried = parseAnalysisResponse(rawB, { complete: false, contractText: tight });
        if (Array.isArray(retried?.clauses) && retried.clauses.length >= clauseN) {
          parsedB = retried;
        }
      } catch (retryErr) {
        console.warn(
          retryErr?.code === AI_ERROR_CODES.PARSE
            ? 'parse-null: Flight B tight retry failed'
            : `Flight B tight retry: ${retryErr?.message || retryErr}`
        );
      }
    }
    return parsedB;
  };

  try {
    const cached = await getCachedAnalysis(sliced, { lang, country, party, category: resolvedCategory });
    if (cached) {
      notify('report');
      return { ...cached, __fromCache: true };
    }

    if (!skipParsingNotify) notify('parsing');
    notify('jurisdiction');
    const midFlightTimers = [setTimeout(() => notify('risks'), skipParsingNotify ? 4000 : 7000)];

    let merged;
    try {
      if (useShortPath) {
        const parsed = await runFlight(singleFlightSystem, promptSingle);
        midFlightTimers.forEach(clearTimeout);
        // Past 70% as soon as CORE+clauses return (or before B fallback).
        notify('risks');
        notify('clauses');
        if (!(Number(parsed?.score) > 0) || isPlaceholderText(parsed?.summary)) {
          throw makeError(AI_ERROR_CODES.PARSE, 'Short-path parse failed.');
        }
        let clauses = Array.isArray(parsed?.clauses) ? parsed.clauses : [];
        if (clauses.length < 3) {
          const flagTitles = (Array.isArray(parsed.redFlags) ? parsed.redFlags : [])
            .map((flag) => String(flag?.title || '').trim())
            .filter(Boolean)
            .slice(0, 4)
            .join(' | ');
          const digest = [
            `action: ${String(parsed.decision?.action || '').trim()}`,
            `headline: ${String(parsed.decision?.headline || '').trim()}`,
            `score: ${parsed.score}`,
            `redFlags: ${flagTitles}`,
          ].join('\n');
          const parsedB = await runFlightBFallback(digest, clauses);
          clauses = Array.isArray(parsedB?.clauses) ? parsedB.clauses : clauses;
        }
        merged = { ...parsed, clauses };
      } else {
        const parsedA = await runFlight(flightASystem, promptA);
        midFlightTimers.forEach(clearTimeout);
        // Flight A done → advance past 70% into clause-card stage.
        notify('risks');
        notify('clauses');
        if (!(Number(parsedA?.score) > 0) || isPlaceholderText(parsedA?.summary)) {
          throw makeError(AI_ERROR_CODES.PARSE, 'Flight A parse failed.');
        }
        const flagTitles = (Array.isArray(parsedA.redFlags) ? parsedA.redFlags : [])
          .map((flag) => String(flag?.title || '').trim())
          .filter(Boolean)
          .slice(0, 4)
          .join(' | ');
        const digest = [
          `action: ${String(parsedA.decision?.action || '').trim()}`,
          `headline: ${String(parsedA.decision?.headline || '').trim()}`,
          `score: ${parsedA.score}`,
          `redFlags: ${flagTitles}`,
        ].join('\n');
        const parsedB = await runFlightBFallback(digest, []);
        merged = {
          ...parsedA,
          clauses: Array.isArray(parsedB?.clauses) ? parsedB.clauses : [],
        };
      }
    } finally {
      midFlightTimers.forEach(clearTimeout);
    }

    if (!isAcceptableAnalysis(merged, sliced)) {
      console.warn('acceptability-fail: merged clauses < 3 or incomplete CORE');
      throw makeError(AI_ERROR_CODES.PARSE, 'Analiz JSON eksik veya kesik.');
    }
    notify('report');
    await setCachedAnalysis(sliced, { lang, country, party, category: resolvedCategory }, merged);
    return merged;
  } catch (error) {
    console.warn('Claude Metin Analiz Hatası:', error?.code || error?.message);
    throw error;
  }
}

// 2. Görsel / Fotoğraf Tabanlı Sözleşme Analizi (Çoklu Görsel Destekli)
export async function analyzeContractImages(
  images,
  contractType = 'Genel Hukuk',
  lang = 'tr',
  mode = 'default',
  { country = 'auto', party = 'auto', category = 'general', onProgress } = {}
) {
  const imageBlocks = (images || [])
    .filter((img) => img.base64)
    .map((img) => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: img.mimeType || 'image/jpeg',
        data: img.base64,
      },
    }));

  if (!imageBlocks.length) {
    throw makeError(AI_ERROR_CODES.EMPTY_INPUT, 'Okunabilir görsel bulunamadı.');
  }

  const cacheMeta = { lang, country, party, category };
  const cacheToken = documentCacheToken(
    'img',
    imageBlocks.map((block) => block.source?.data || '').join('|')
  );

  try {
    const cached = await getCachedAnalysis(cacheToken, cacheMeta);
    if (cached) {
      if (typeof onProgress === 'function') onProgress('report');
      return { ...cached, __fromCache: true };
    }

    if (typeof onProgress === 'function') onProgress('parsing');
    let extracted = '';
    try {
      extracted = await extractContractText({ blocks: imageBlocks, budgetKind: 'images' });
    } catch (extractError) {
      console.warn('Görsel metin çıkarımı başarısız:', extractError?.code || extractError?.message);
      throw extractError;
    }

    if (extracted.length >= EXTRACT_MIN_CHARS) {
      try {
        const parsed = await analyzeContract(extracted, contractType, lang, mode, {
          country,
          party,
          category: resolveAnalysisCategory(extracted, category),
          onProgress,
          skipParsingNotify: true,
          recoverOnParse: false,
          allowPartial: false,
          timeoutMs: REQUEST_TIMEOUT_MS,
        });
        const result = withExtractedSource(parsed, extracted, false);
        if (!parsed?.__fromCache) {
          await setCachedAnalysis(cacheToken, cacheMeta, result);
        }
        return result;
      } catch (analyzeError) {
        analyzeError.extractedText = extracted;
        if (looksIncompleteExtract(extracted, { fromMedia: true })) analyzeError.__extractTruncated = true;
        throw analyzeError;
      }
    }

    console.warn('OCR çıktısı yetersiz, görseller ikinci geçişe gönderilmedi.');
    throw makeError(AI_ERROR_CODES.EXTRACT, 'Extracted image text too short.');
  } catch (error) {
    console.warn('Claude Görsel Analiz Hatası:', error?.code || error?.message);
    throw error;
  }
}

// 3. PDF / Belge Tabanlı Sözleşme Analizi
// PDF metne çevrilmez; Claude belgeyi doğrudan kendisi okur.
export async function analyzeContractDocument(
  { base64, mimeType } = {},
  contractType = 'Genel Hukuk',
  lang = 'tr',
  mode = 'default',
  { country = 'auto', party = 'auto', category = 'general', onProgress } = {}
) {
  if (!base64) {
    throw makeError(AI_ERROR_CODES.EMPTY_INPUT, 'Belge içeriği okunamadı.');
  }

  assertMediaBudget([base64]);
  const cacheMeta = { lang, country, party, category };
  const cacheToken = documentCacheToken('pdf', base64, mimeType || 'application/pdf');

  const documentBlock = {
    type: 'document',
    source: {
      type: 'base64',
      media_type: mimeType || 'application/pdf',
      data: base64,
    },
  };

  try {
    const cached = await getCachedAnalysis(cacheToken, cacheMeta);
    if (cached) {
      if (typeof onProgress === 'function') onProgress('report');
      return { ...cached, __fromCache: true };
    }

    if (typeof onProgress === 'function') onProgress('parsing');
    let extracted = '';
    try {
      extracted = await extractContractText({ blocks: [documentBlock] });
    } catch (extractError) {
      console.warn('PDF metin çıkarımı başarısız:', extractError?.code || extractError?.message);
      throw extractError;
    }

    if (extracted.length >= EXTRACT_MIN_CHARS) {
      try {
        const parsed = await analyzeContract(extracted, contractType, lang, mode, {
          country,
          party,
          category: resolveAnalysisCategory(extracted, category),
          onProgress,
          skipParsingNotify: true,
          recoverOnParse: false,
          allowPartial: false,
          timeoutMs: REQUEST_TIMEOUT_MS,
        });
        const result = withExtractedSource(parsed, extracted, false);
        if (!parsed?.__fromCache) {
          await setCachedAnalysis(cacheToken, cacheMeta, result);
        }
        return result;
      } catch (analyzeError) {
        analyzeError.extractedText = extracted;
        if (looksIncompleteExtract(extracted, { fromMedia: true })) analyzeError.__extractTruncated = true;
        throw analyzeError;
      }
    }

    console.warn('OCR çıktısı yetersiz, PDF ikinci geçişe gönderilmedi.');
    throw makeError(AI_ERROR_CODES.EXTRACT, 'Extracted PDF text too short.');
  } catch (error) {
    console.warn('Claude Belge Analiz Hatası:', error?.code || error?.message);
    throw error;
  }
}

// 4. Hukuk Danışmanı Sohbeti
// Seçilen ülkenin mevzuatına doğrudan atıf yapan serbest metin yanıtı üretir.
export async function askLegalAdvisor({
  question,
  history = [],
  country = 'auto',
  lang = 'tr',
  mode = 'default',
  analysisContext = null,
  task = 'chat',
} = {}) {
  if (!question || !question.trim()) {
    throw makeError(AI_ERROR_CODES.EMPTY_INPUT, 'Soru boş.');
  }

  const { name: languageName } = resolveLanguage(lang);

  if (task === 'draft_polish') {
    const polishSystem = `You are an editor polishing the wording of a user's letter draft.
Rewrite for clarity and a firm, polite tone. Never add facts, dates, amounts, names, demands, statutes, article numbers, case law or citations. Keep every "[ … ]" blank unchanged. Never claim the document is court-ready or guaranteed. Output only the rewritten body in ${languageName}, plain text, no markdown.`;
    const polished = (
      await callClaudeProxy({
        system: polishSystem,
        messages: [{ role: 'user', content: question.trim() }],
        mode,
        maxTokens: ADVISOR_MAX_TOKENS,
      })
    ).trim();
    if (!polished) throw makeError(AI_ERROR_CODES.PARSE, 'Danışman boş yanıt döndürdü.');
    return polished;
  }
  const profile = JURISDICTION_PROFILES[country];

  const jurisdictionLine = profile
    ? `JURISDICTION (MANDATORY): ${profile}
Answer strictly under this legal system. Do not mandate exact article numbers. If the exact article is not certain, state the law/act name only or leave the legal reference empty.`
    : `JURISDICTION: The user did not pick a country. Infer the most likely jurisdiction from the question and any contract snapshot, state your assumption in the first sentence, and ask for the country if it materially changes the answer. Do not default to TBK or Turkish law unless the user query or contract text is explicitly Turkish law.`;

  const snapshot = analysisContext && typeof analysisContext === 'object'
    ? [
        analysisContext.party ? `Protected party: ${analysisContext.party}` : '',
        analysisContext.country ? `User jurisdiction: ${analysisContext.country}` : '',
        analysisContext.category ? `Category: ${analysisContext.category}` : '',
        analysisContext.verdict ? `Current verdict: ${analysisContext.verdict}` : '',
        (analysisContext.redFlagTitles || []).length
          ? `Top red flags: ${(analysisContext.redFlagTitles || []).join(' | ')}`
          : '',
        (analysisContext.missingTitles || []).length
          ? `Missing / weak protections: ${(analysisContext.missingTitles || []).join(' | ')}`
          : '',
        analysisContext.powerTiltLabel ? `Power tilt: ${analysisContext.powerTiltLabel}` : '',
        analysisContext.clash ? `Governing-law clash: ${analysisContext.clash}` : '',
        (analysisContext.lawyerQuestions || []).length
          ? `Open lawyer questions: ${(analysisContext.lawyerQuestions || []).join(' | ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  const contextBlock = snapshot
    ? `THIS CONTRACT SNAPSHOT (do not ignore it; do not invent clauses that are not listed):
${snapshot}
If the user asks something outside this snapshot, say so and answer generally.`
    : '';

  const system = `You are an experienced practising lawyer answering a member of the public in a chat interface.

${jurisdictionLine}

${contextBlock}

HOW TO ANSWER:
- Start with a direct, practical answer in one or two sentences.
- Then give the legal basis. Notation format samples only (never default citations): "BGB §", "UCC §", "TBK m.". If the exact article is not certain, state the law/act name only or leave the legal reference empty. NEVER invent fake article numbers.
- Then list the concrete steps the person should take, and note any deadline or limitation period that applies.
- Close with one short sentence reminding them that this is general information, not a substitute for a lawyer who has seen their file.
- Keep the whole answer under 300 words. Use short paragraphs and simple "-" bullets. Never use markdown headings, tables, bold or code fences.

${buildStatuteMapDirective(country, analysisContext?.category || 'general')}
Prefer those mapping strings when playbook topics match. NEVER invent fake article numbers.

OUTPUT LANGUAGE (STRICT): write the entire answer in ${languageName}, regardless of the language of the question. Statute names may keep their original official form.
${buildTypographyDirective(lang)}`;

  // Son turlar bağlam olarak taşınır; istek boyutunu küçük tutmak için sınırlanır.
  const trimmedHistory = (history || [])
    .filter((msg) => msg && msg.text && (msg.role === 'user' || msg.role === 'assistant'))
    .slice(-6)
    .map((msg) => ({ role: msg.role, content: msg.text }));

  // Konuşma her zaman bir "user" mesajı ile bitmelidir.
  if (trimmedHistory.length && trimmedHistory[trimmedHistory.length - 1].role === 'user') {
    trimmedHistory.pop();
  }

  try {
    const answer = (
      await callClaudeProxy({
        system,
        messages: [...trimmedHistory, { role: 'user', content: question.trim() }],
        mode,
        maxTokens: ADVISOR_MAX_TOKENS,
      })
    ).trim();

    if (!answer) {
      throw makeError(AI_ERROR_CODES.PARSE, 'Danışman boş yanıt döndürdü.');
    }

    return answer;
  } catch (error) {
    console.warn('Claude Danışman Hatası:', error?.code || error?.message);
    throw error;
  }
}

const EXPLAIN_MAX_TOKENS = 3000;
const EXPLAIN_TIMEOUT_MS = 120000;
const EXPLAIN_TEXT_CHARS = 20000;

export function buildExplainSystemPrompt(lang, countryCode, todayIso = localIsoDate()) {
  const { name: languageName } = resolveLanguage(lang);
  const profile = JURISDICTION_PROFILES[countryCode];
  const jurisdictionLine = profile
    ? `JURISDICTION SELECTED BY THE USER: ${profile}
If the document clearly comes from another country, say so in "plain_summary" and explain it under the document's own country.`
    : `JURISDICTION: infer the issuing country from the letterhead, court or authority name, language, currency and addresses. Name it in "plain_summary". Do not default to Turkish law.`;

  return `You are NexuLex AI explaining an official or legal document that a member of the public has just received.
Explain what it is, who sent it, what it demands, every deadline, and the safest next steps — in plain language.

${jurisdictionLine}

TODAY: ${todayIso}.

HARD RULES:
- Never invent statute or article numbers, case numbers, courts, amounts, names or dates. Quote only what the document says.
- Deadlines: put a calendar date in "date" (YYYY-MM-DD) ONLY when the document itself states that date. If the document states a period (e.g. "within 7 days of service"), leave "date" empty, copy the period into "rule", and set "from_service": true when the period runs from the day the person received it. Never compute a date from a period.
- If the document is illegible, cut off or not a legal/official document, say so in "plain_summary", list what is unreadable in "unclear" and set "confidence" to "LOW".
- No chances of winning, no percentages, no guarantees. Never promise an outcome. You do not represent anyone in court.
- "legal_basis": official act names only, and only when the document cites them or you are certain; otherwise "".
- If there is any deadline under 14 days, a court or enforcement step, or a risk of losing money, housing or liberty, set "urgency" to "HIGH".
- "lawyer_threshold": one sentence on when the person should see a lawyer or a free legal-aid office.

OUTPUT LANGUAGE (STRICT): ${languageName}. Enum values stay in English.
${buildTypographyDirective(lang)}

Return ONLY one JSON object, first character "{", last character "}":
{
  "document_type": "${DOC_TYPES.join('|')}",
  "title": "Short name of the document",
  "issuer": "Who sent it (court, office, company, lawyer) as written",
  "plain_summary": "Max 3 sentences: what it is and what it wants from the person",
  "urgency": "HIGH|MEDIUM|LOW",
  "deadlines": [{ "label": "What must be done", "date": "", "rule": "Period as written", "from_service": false }],
  "amounts": [{ "label": "What the amount is", "value": "Amount with currency as written" }],
  "respond_to": "Where or to whom the person must respond, as written, or empty",
  "next_steps": ["Concrete step 1", "Step 2", "Step 3"],
  "options": [{ "title": "Option", "detail": "What happens if they choose it" }],
  "documents_needed": ["Document to gather"],
  "legal_basis": "",
  "lawyer_threshold": "",
  "unclear": [],
  "confidence": "HIGH|MEDIUM|LOW"
}
Limits: deadlines max 4, amounts max 4, next_steps 3-5, options max 4, documents_needed max 6, unclear max 3.`;
}

// LR.1 — Explain a received legal document (photos, PDF or pasted text) in one call.
export async function explainLegalDocument({
  text = '',
  images = [],
  pdf = null,
  country = 'auto',
  lang = 'tr',
  mode = 'default',
} = {}) {
  const blocks = [];
  let budgetKind = 'pdf';
  const imageBlocks = (images || [])
    .filter((img) => img?.base64)
    .map((img) => ({
      type: 'image',
      source: { type: 'base64', media_type: img.mimeType || 'image/jpeg', data: img.base64 },
    }));
  if (imageBlocks.length) {
    budgetKind = 'images';
    assertMediaBudget(imageBlocks.map((block) => block.source.data), 'images');
    blocks.push(...imageBlocks);
  }
  if (pdf?.base64) {
    assertMediaBudget([pdf.base64]);
    blocks.push({
      type: 'document',
      source: { type: 'base64', media_type: pdf.mimeType || 'application/pdf', data: pdf.base64 },
    });
  }
  const pasted = String(text || '').trim().slice(0, EXPLAIN_TEXT_CHARS);
  if (!blocks.length && !pasted) {
    throw makeError(AI_ERROR_CODES.EMPTY_INPUT, 'Belge boş.');
  }
  blocks.push({
    type: 'text',
    text: pasted
      ? `Explain this document.\n\nDOCUMENT TEXT:\n"""\n${pasted}\n"""`
      : 'Explain the attached document.',
  });

  try {
    const raw = await callClaude({
      system: buildExplainSystemPrompt(lang, country),
      content: blocks,
      mode,
      maxTokens: EXPLAIN_MAX_TOKENS,
      timeoutMs: EXPLAIN_TIMEOUT_MS,
      maxAttempts: MAX_ATTEMPTS,
      expectJson: 'explain',
      budgetKind,
    });
    const explanation = normalizeExplanation(safeParseJSON(raw));
    if (!isUsableExplanation(explanation)) {
      throw makeError(AI_ERROR_CODES.PARSE, 'Belge açıklaması eksik.');
    }
    return explanation;
  } catch (error) {
    console.warn('Claude Belge Açıklama Hatası:', error?.code || error?.message);
    throw error;
  }
}

export async function reviseContractDraft({
  originalText,
  redFlags = [],
  clauses = [],
  lang = 'tr',
  country = 'auto',
  party = 'auto',
  category = 'general',
  mode = 'default',
} = {}) {
  const source = String(originalText || '').trim();
  if (!source) {
    throw makeError(AI_ERROR_CODES.EMPTY_INPUT, 'Revize için sözleşme metni gerekli.');
  }

  const { name: languageName } = resolveLanguage(lang);
  const flags = (redFlags || [])
    .map((item) => item?.title || item?.explanation)
    .filter(Boolean)
    .slice(0, 6)
    .join(' | ');
  const risks = (clauses || [])
    .filter((item) => String(item?.riskLevel || '').toUpperCase() === 'RED')
    .map((item) => item.clauseTitle)
    .filter(Boolean)
    .slice(0, 5)
    .join(' | ');

  const system = `You are a senior transactional lawyer rewriting the riskiest clauses for the protected party.
${buildJurisdictionDirective(country)}
${buildPartyDirective(party)}
CONTRACT CATEGORY: ${category}.
OUTPUT LANGUAGE (STRICT): ${languageName}.
${buildTypographyDirective(lang)}
Return ONLY one complete JSON object. No markdown.
Do not reprint the whole contract. Rewrite only the 1–3 riskiest clauses in full, clearly labeled, ready to paste. Short joining notes are allowed.`;

  const prompt = `Rewrite the 1–3 riskiest clauses (not the entire agreement) so they protect the selected party.
Do not invent parties or commercial terms that are not in the original.

Known red flags: ${flags || 'infer from the original'}
Risky clauses: ${risks || 'infer from the original'}

Return JSON:
{
  "revised_text": "Labeled rewritten clauses only, ready to paste. Not the full agreement.",
  "summary": "What you changed and why, in 3-5 sentences.",
  "who_gained": "USER",
  "changes": [
    {
      "topic": "Clause topic",
      "original": "What it said",
      "revised": "What you wrote",
      "winner": "USER",
      "worsened": false,
      "note": "Why this protects the selected party."
    }
  ]
}

Rules:
- "who_gained" accepts only "USER", "OTHER" or "MIXED".
- "winner" accepts only "USER", "OTHER" or "NEUTRAL".
- "changes" max 8 items.
- "revised_text" is the rewritten clauses plus short joining notes. Do not reprint the whole contract.

ORIGINAL:
"""
${source.slice(0, 20000)}
"""`;

  try {
    const raw = await callClaudeProxy({
      system,
      messages: [{ role: 'user', content: prompt }],
      mode,
      maxTokens: ANALYSIS_MAX_TOKENS,
      timeoutMs: REQUEST_TIMEOUT_MS,
      maxAttempts: MAX_ATTEMPTS,
      expectJson: 'revise',
    });
    return parseAnalysisResponse(raw);
  } catch (error) {
    console.warn('Claude Revize Hatası:', error?.code || error?.message);
    throw error;
  }
}

export async function compareContractVersions({
  originalText,
  revisedText,
  lang = 'tr',
  country = 'auto',
  party = 'auto',
  category = 'general',
  mode = 'default',
  signConditions = [],
} = {}) {
  if (!String(originalText || '').trim() || !String(revisedText || '').trim()) {
    throw makeError(AI_ERROR_CODES.EMPTY_INPUT, 'Karşılaştırma için iki metin de gerekli.');
  }

  const { name: languageName } = resolveLanguage(lang);
  const conditions = (signConditions || [])
    .map((item) => {
      const id = item?.id || item?.playbookId || '';
      if (!id) return '';
      return `${id} | ${item.label || item.rule || ''} | ${item.statute || ''}`.trim();
    })
    .filter(Boolean)
    .slice(0, 3);

  const system = `You compare two versions of the same contract for the protected party.
${buildJurisdictionDirective(country)}
${buildPartyDirective(party)}
CONTRACT CATEGORY: ${category}.
OUTPUT LANGUAGE (STRICT): ${languageName}.
${buildTypographyDirective(lang)}
Return ONLY one complete JSON object. No markdown.
Keep every string to 2 short sentences max. "changes" max 6 items.
HUMILITY: if unsure whether a red-line condition is met, met must not be true; use confidence LOW and unmetReason "not explicit in the text". Never fake a green light.`;

  const conditionBlock = conditions.length
    ? `Evaluate these user red-line conditions against the REVISED text only:
${conditions.map((line, index) => `${index + 1}. ${line}`).join('\n')}
Fill sign_conditions_eval with one object per condition id.`
    : 'If no red-line conditions are listed, return "sign_conditions_eval": [].';

  const prompt = `Compare ORIGINAL vs REVISED from the protected party's perspective.

${conditionBlock}

Return JSON:
{
  "summary": "What changed overall, in two sentences.",
  "who_gained": "USER",
  "changes": [
    {
      "topic": "Short clause topic",
      "original": "What it said before (short)",
      "revised": "What it says now (short)",
      "winner": "USER",
      "worsened": false,
      "note": "Why this helps or hurts the protected party."
    }
  ],
  "sign_conditions_eval": [
    {
      "id": "rent_deposit",
      "met": true,
      "confidence": "HIGH",
      "evidence": "Clause 5: two months' rent",
      "unmetReason": null
    }
  ]
}

Rules:
- "who_gained" accepts only "USER", "OTHER" or "MIXED".
- "winner" accepts only "USER", "OTHER" or "NEUTRAL".
- "worsened": true if the revised text is worse for the protected party.
- "sign_conditions_eval" max 3. "confidence" accepts only "HIGH", "MEDIUM" or "LOW". "id" must match the listed condition ids.

ORIGINAL:
"""
${String(originalText).slice(0, 12000)}
"""

REVISED:
"""
${String(revisedText).slice(0, 12000)}
"""`;

  try {
    const raw = await callClaudeProxy({
      system,
      messages: [{ role: 'user', content: prompt }],
      mode,
      maxTokens: 2500,
      expectJson: 'compare',
    });
    return parseAnalysisResponse(raw);
  } catch (error) {
    console.warn('Claude Diff Hatası:', error?.code || error?.message);
    throw error;
  }
}

export function isTruncatedDraft(text) {
  const draft = String(text || '').replace(/\s+$/g, '');
  if (!draft) return true;

  const lines = draft.split('\n').filter((line) => line.trim());
  const lastLine = (lines[lines.length - 1] || '').trim();
  const last12 = lines.slice(-12).join('\n');
  const tail = draft.slice(-40);
  const lastWord = (tail.match(/[^\s.,;:!?…"'»)\]]+$/) || [''])[0];

  if (/hukuki\s+[A-Za-zÇĞİÖŞÜçğıöşü]{2,}$/i.test(draft)) return true;
  if (tail.length >= 12 && !/\s/.test(tail)) return true;
  if (/^(#{1,6}|[-*+]|\d+[.)])\s*$/.test(lastLine)) return true;
  if ((lastLine.match(/```/g) || []).length % 2 === 1) return true;
  if ((lastLine.match(/\*\*/g) || []).length % 2 === 1) return true;
  if (/\[[^\]]*$/.test(lastLine) || /\([^)]*$/.test(lastLine)) return true;

  const signatureLine =
    /(?:^|\n)\s*#{0,3}\s*(İmza|Imza|Signatures?)\b/im.test(draft) ||
    /(?:^|\n)\s*#{0,3}\s*(İmza|Imza|Signatures?)\b/im.test(last12);
  const underscoreLine = /^[_—\-.\s]{6,}$/.test(lastLine);
  const partyLine =
    /^(KİRAYA\s+VEREN|KIRAYA\s+VEREN|KİRACI|KIRACI|MÜŞTERİ|MUSTERI|HİZMET\s+SAĞLAYICI|HIZMET\s+SAGLAYICI|LANDLORD|TENANT|LESSOR|LESSEE|PARTY\s+[AB]|WITNESS)\b/i.test(
      lastLine
    );
  const dateLine =
    /^(Tarih|Date)\s*[:.]/i.test(lastLine) || /\b\d{1,2}[./]\d{1,2}[./]\d{2,4}\s*$/.test(lastLine);
  const hasSignatureBlock =
    signatureLine ||
    /(?:^|\n)\s*(LANDLORD|TENANT|LESSOR|LESSEE|PARTY\s+[AB]|WITNESS)\b/im.test(draft) ||
    /(?:^|\n)\s*[_—\-.]{6,}\s*(?:\n|$)/m.test(draft);
  const trailingDisclaimer =
    /^[_*]/.test(lastLine) ||
    /\b(not legal advice|hukuki tavsiye değildir|template)\b/i.test(lastLine);

  if (underscoreLine || partyLine || dateLine) return false;
  if (hasSignatureBlock && trailingDisclaimer) return false;

  const lastWordComplete =
    !lastWord ||
    /[.!?…"')\]}:;_*]$/.test(draft) ||
    underscoreLine ||
    partyLine ||
    dateLine;

  if (hasSignatureBlock && lastWordComplete) return false;

  const endsPunct = /[.!?…"')\]}:;]$/.test(draft);
  if (
    !endsPunct &&
    lastWord.length >= 2 &&
    lastWord.length <= 8 &&
    /^[A-Za-zÀ-ÖØ-öø-ÿÇĞİÖŞÜçğıöşü]+$/.test(lastWord)
  ) {
    return true;
  }

  if (!hasSignatureBlock && !underscoreLine && !partyLine && !dateLine) return true;
  return false;
}

export async function generateContractDraft({
  topic,
  country = 'auto',
  party = 'buyer',
  category = 'general',
  lang = 'tr',
  mode = 'default',
} = {}) {
  const subject = String(topic || '').trim();
  if (!subject) {
    throw makeError(AI_ERROR_CODES.EMPTY_INPUT, 'Konu boş.');
  }

  const { name: languageName } = resolveLanguage(lang);
  const system = `You are NexuLex AI, a senior transactional lawyer drafting a protective contract.
${buildJurisdictionDirective(country)}
${buildDraftDirective(party)}
CONTRACT CATEGORY: ${category}.
OUTPUT LANGUAGE (STRICT): ${languageName}.
${buildTypographyDirective(lang)}
Return ONLY the contract as clean Markdown. Do NOT return JSON. Do NOT return redFlags, decision, score, clauses, trap_calendar or any analysis schema.
Start with a level-1 heading for the title, then numbered articles. This is a draft template, not legal advice. Do not invent statute numbers.`;

  const prompt = `Draft a complete, protective contract on this topic: ${subject}

Write Markdown only:
# Title
## Taraflar / Parties
Numbered articles (at least 8). Close force-majeure and every article with a complete sentence — never stop mid-word.
### İmza / Signatures
Two parties, date, place.

Rules:
- Write the entire draft in ${languageName}.
- Protect the selected party with notice, payment, liability, termination, data, deposit/refund, force majeure and dispute clauses that fit the category.
- At least 8 numbered articles. Finish every article. Finish the signatures block.
- No commentary, no JSON, no analysis headings.`;

  const requestDraft = async (extra = '') => {
    const raw = await callClaudeProxy({
      system,
      messages: [{ role: 'user', content: `${prompt}${extra}` }],
      mode,
      maxTokens: GENERATE_MAX_TOKENS,
      timeoutMs: GENERATE_TIMEOUT_MS,
      maxAttempts: MAX_ATTEMPTS,
      expectJson: 'generate',
    });
    const parsed = safeParseJSON(raw);
    const draft = pickDraftText(parsed, raw);
    const protections = Array.isArray(parsed?.key_protections)
      ? parsed.key_protections
      : Array.isArray(parsed?.keyProtections)
        ? parsed.keyProtections
        : [];
    if (!draft) {
      throw makeError(AI_ERROR_CODES.PARSE, 'Taslak metni boş döndü.');
    }
    return {
      title: String(parsed?.title || headingFromMarkdown(draft) || '').trim(),
      draft,
      summary: String(parsed?.summary || '').trim(),
      keyProtections: protections.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 5),
    };
  };

  try {
    let result = await requestDraft();
    if (isTruncatedDraft(result.draft)) {
      result = await requestDraft(
        '\nThe previous draft was cut mid-sentence. Finish every article including force majeure. Close with ### İmza / Signatures for both parties, date and place. Do not stop mid-word.'
      );
    }
    if (isTruncatedDraft(result.draft)) {
      throw makeError(AI_ERROR_CODES.DRAFT_TRUNCATED, 'Taslak kesik bitti.');
    }
    return result;
  } catch (error) {
    console.warn('Claude Taslak Hatası:', error?.code || error?.message);
    throw error;
  }
}

// Dar kalkan yaması: yalnızca bir paragraf, tam sözleşme değil. CORE analiz şemasına dokunmaz.
export async function reviseParagraphSlice({
  paragraph,
  from,
  to,
  lang = 'tr',
  country = 'auto',
} = {}) {
  const slice = String(paragraph || '').trim().slice(0, 4000);
  if (!slice) return null;
  const { name: languageName } = resolveLanguage(lang);
  const system = `You revise one contract paragraph so a replacement clause fits.
${buildJurisdictionDirective(country)}
OUTPUT LANGUAGE (STRICT): ${languageName}.
${buildTypographyDirective(lang)}
Return ONLY one complete JSON object. Do not reprint a full agreement.`;
  const prompt = `Replace the matched wording with the proposed clause. Keep surrounding sentences that do not conflict. Do not invent parties, dates or amounts.

FROM:
"""
${String(from || '').slice(0, 1500)}
"""

TO:
"""
${String(to || '').slice(0, 1500)}
"""

PARAGRAPH (not the full contract):
"""
${slice}
"""

Return JSON:
{ "revised_text": "the revised paragraph only" }`;

  try {
    const raw = await callClaudeProxy({
      system,
      messages: [{ role: 'user', content: prompt }],
      mode: 'revise',
      maxTokens: 2500,
      timeoutMs: 45000,
      maxAttempts: 1,
      expectJson: 'revise',
    });
    const parsed = parseAnalysisResponse(raw);
    const revised = String(parsed?.revised_text || parsed?.revisedText || '').trim();
    return revised || null;
  } catch (error) {
    console.warn('Kalkan paragraf yaması atlandı:', error?.code || error?.message);
    return null;
  }
}

