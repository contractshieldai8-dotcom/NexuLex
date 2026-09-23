// Sözleşme metninden tür tahmini. Kullanıcı chip seçmediyse analiz playbook'unu yönlendirir.

import { typeKeyFromCategory } from '../constants/options';

/** Turkish-aware fold: İ→i, I→ı, then lowercase. Regexes run on folded haystack. */
export function foldTr(text) {
  return String(text || '')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/Ş/g, 'ş')
    .replace(/Ğ/g, 'ğ')
    .replace(/Ü/g, 'ü')
    .replace(/Ö/g, 'ö')
    .replace(/Ç/g, 'ç')
    .toLowerCase();
}

const CATEGORY_PATTERNS = [
  {
    category: 'rent',
    typeKey: 'typeRent',
    patterns: [
      /kira\s*sözleş/, /kiracı/, /kiralayan/, /tahliye/, /depozito/, /kira bedeli/,
      /\blease\b/i, /\btenant\b/i, /\blandlord\b/i, /\brent\b/i, /\bmiete/i, /vermieter/i,
    ],
  },
  {
    category: 'labor',
    typeKey: 'typeLabor',
    patterns: [
      /iş\s*sözleş/, /\bişçi\b/, /kıdem/, /ihbar tazminat/, /rekabet yasağı/,
      /fazla\s*mesai/, /\bemployment\b/i, /\bemployee\b/i, /non-?compete/i, /arbeitsvertrag/i,
      // Note: bare işveren alone is not enough — construction uses işveren+yüklenici.
    ],
  },
  {
    category: 'nda',
    typeKey: 'typeNDA',
    patterns: [
      /\bnda\b/i, /gizlilik sözleş/, /confidential/i, /non-?disclosure/i, /ticari sır/,
      /geheimhaltung/i,
    ],
  },
  {
    category: 'saas',
    typeKey: 'typeSaaS',
    patterns: [
      // Software-only signals — bare yüklenici / lisanslama do NOT belong here.
      /\bsaas\b/i, /abonelik/, /\bsubscription\b/i, /\bsla\b/i, /hizmet seviyesi/,
      /yazılım hizmet/, /yazılım\s+lisans/, /kurumsal\s+yazılım/,
      /yazılım.{0,32}lisanslama|lisanslama.{0,32}yazılım/,
      /yazılım.{0,24}bakım|bakım.{0,24}yazılım/,
      /uygulama\s+ve\s+bakım/, /kabul\s+testi/, /canlıya\s+geçiş/, /teknik\s+destek/,
      /software\s+license/i, /acceptance\s+test/i,
    ],
  },
  {
    category: 'consumer',
    typeKey: 'typeConsumer',
    patterns: [
      /tüketici/, /mesafeli satış/, /cayma hakkı/, /\bconsumer\b/i, /iade politikası/,
      /haksız şart/,
    ],
  },
  {
    category: 'freelance',
    typeKey: 'typeFreelance',
    patterns: [
      /freelancer/i, /serbest meslek/, /danışmanlık sözleş/, /hizmet sözleşmesi/,
      /statement of work/i, /\bsow\b/i, /teslimat takvimi/,
    ],
  },
  {
    category: 'sales',
    typeKey: 'typeSales',
    patterns: [
      /satış sözleş/, /\balıcı\b/, /\bsatıcı\b/, /mal teslim/, /\bpurchase\b/i,
      /compraventa/i, /kaufvertrag/i,
      /satış\s+ve\s+tedarik/, /tedarik sözleş/, /mal satış/, /satış ve tedarik sözleş/,
      /ticari\s+mal\s+sat[ıi]ş/, /supply\s+(agreement|contract)/i,
      /sale\s+of\s+goods/i, /purchase\s+and\s+sale/i, /goods\s+and\s+services/i,
      /^\s*satıcı\b/m, /^\s*alıcı\b/m, /\bsatıcı\s*:/, /\balıcı\s*:/,
      /ekipman\s+tedarik/, /tedarik\s*,\s*kurulum/, /satış\s+sonrası\s+hizmet/,
      /tedarik[\s,].{0,48}sözleş/, /^\s*tedarikçi\b/m, /^\s*müşteri\b/m,
      /\btedarikçi\s*:/, /\bmüşteri\s*:/,
    ],
  },
];

const SALES_PREAMBLE_PATTERNS = [
  /satış\s+ve\s+tedarik/,
  /tedarik sözleş/,
  /mal satış/,
  /satış ve tedarik sözleş/,
  /ticari\s+mal\s+sat[ıi]ş/,
  /satış sözleş/,
  /supply\s+(agreement|contract)/i,
  /sale\s+of\s+goods/i,
  /purchase\s+and\s+sale/i,
  /^\s*satıcı\b/m,
  /^\s*alıcı\b/m,
  /ekipman\s+tedarik/,
  /tedarik\s*,\s*kurulum/,
  /satış\s+sonrası\s+hizmet/,
  /tedarik[\s,].{0,48}sözleş/,
  /^\s*tedarikçi\b/m,
  /^\s*müşteri\b/m,
  /\btedarikçi\s*:/,
  /\bmüşteri\s*:/,
];

/** True software-license / SaaS title signals only — no bare yüklenici or lisanslama. */
const STRONG_SOFTWARE_SAAS = [
  /\bsaas\b/i,
  /abonelik/,
  /\bsubscription\b/i,
  /\bsla\b/i,
  /hizmet seviyesi/,
  /yazılım\s+hizmet/,
  /yazılım\s+lisans/,
  /kurumsal\s+yazılım/,
  /software\s+license/i,
  /yazılım.{0,40}lisanslama/,
  /lisanslama.{0,40}yazılım/,
];

/** Weak confidentiality rows that must not outrank a sales/saas/franchise/tadilat title. */
const WEAK_NDA_BODY = [
  /gizlilik\s+süresi/,
  /madde\s*\d*\s*[:.\-]?\s*gizlilik/,
  /confidentiality\s+period/i,
];

function hasSupplierCustomerBlock(folded) {
  return /\btedarikçi\b/.test(folded) && /\bmüşteri\b/.test(folded);
}

/** Present for tooling; bare yüklenici+müşteri alone does NOT force SaaS. */
function hasContractorCustomerBlock(folded) {
  const contractor = /\b(yüklenici|contractor|vendor)\b/.test(folded);
  const customer = /\b(müşteri|musteri|customer)\b/.test(folded);
  return contractor && customer;
}

export function isFranchiseSignal(foldedOrText) {
  const folded = foldTr(foldedOrText);
  if (/\b(franchisor|franchisee|franchise)\b/.test(folded)) return true;
  if (/marka\s+lisanslama/.test(folded)) return true;
  if (/münhasır\s+dağıtım|munhasir\s+dagitim/.test(folded)) return true;
  if (/\broyalty\b/.test(folded)) return true;
  if (/\blisans\s+veren\b/.test(folded) && /\blisans\s+alan\b/.test(folded)) return true;
  if (/\blisans\s+veren\b/.test(folded) && /\b(franchise|marka)\b/.test(folded)) return true;
  return false;
}

export function isConstructionSignal(foldedOrText) {
  const folded = foldTr(foldedOrText);
  if (/\b(tadilat|dekorasyon|inşaat|renovasyon|insaat)\b/.test(folded)) return true;
  if (/gayrimenkul\s+tadilat/.test(folded)) return true;
  if (/\bişveren\b/.test(folded) && /\byüklenici\b/.test(folded)) return true;
  return false;
}

function isNonSaasDomain(folded) {
  return isFranchiseSignal(folded) || isConstructionSignal(folded);
}

/** Yüklenici/contractor only forces SaaS when software appears in the same preamble. */
function hasSoftwareContractorPair(folded) {
  if (!/\b(yüklenici|contractor|vendor)\b/.test(folded)) return false;
  return /yazılım|software/.test(folded);
}

function hasStrongSoftwareSaas(folded) {
  if (isNonSaasDomain(folded)) return false;
  if (STRONG_SOFTWARE_SAAS.some((pattern) => pattern.test(folded))) return true;
  if (hasSoftwareContractorPair(folded)) return true;
  return false;
}

export function isSalesPreamble(head) {
  const folded = foldTr(head);
  // Software SaaS preamble — bare MÜŞTERİ must not claim sales.
  if (hasStrongSoftwareSaas(folded) && !hasSupplierCustomerBlock(folded)) return false;
  if (isFranchiseSignal(folded) || isConstructionSignal(folded)) return false;
  if (SALES_PREAMBLE_PATTERNS.some((pattern) => pattern.test(folded))) return true;
  if (hasSupplierCustomerBlock(folded)) return true;
  const sales = CATEGORY_PATTERNS.find((entry) => entry.category === 'sales');
  return (sales?.patterns || []).some((pattern) => pattern.test(folded));
}

export function isSaasPreamble(head) {
  const folded = foldTr(head);
  if (hasSupplierCustomerBlock(folded)) return false;
  return hasStrongSoftwareSaas(folded);
}

export function detectContractType(text) {
  const sample = String(text || '').slice(0, 8000);
  const foldedSample = foldTr(sample);
  const foldedPreamble = foldedSample.slice(0, 500);
  if (sample.trim().length < 40) {
    return { category: 'general', typeKey: 'typeGeneral', confidence: 0 };
  }

  // TEDARİKÇİ+MÜŞTERİ / sales title wins over incidental NDA/saas noise.
  if (hasSupplierCustomerBlock(foldedPreamble) || isSalesPreamble(sample.slice(0, 500))) {
    return { category: 'sales', typeKey: typeKeyFromCategory('sales'), confidence: 1 };
  }

  // True software-license SaaS only — bare yüklenici / franchise / tadilat do not force.
  if (isSaasPreamble(sample.slice(0, 500))) {
    return { category: 'saas', typeKey: typeKeyFromCategory('saas'), confidence: 1 };
  }

  // Franchise / tadilat → general playbook (never NDA from Madde Gizlilik alone).
  if (isFranchiseSignal(foldedPreamble) || isFranchiseSignal(foldedSample.slice(0, 1600))) {
    return { category: 'general', typeKey: typeKeyFromCategory('general'), confidence: 1 };
  }
  if (isConstructionSignal(foldedPreamble) || isConstructionSignal(foldedSample.slice(0, 1600))) {
    return { category: 'general', typeKey: typeKeyFromCategory('general'), confidence: 1 };
  }

  const salesSignalInBody = (CATEGORY_PATTERNS.find((e) => e.category === 'sales')?.patterns || []).some(
    (pattern) => pattern.test(foldedSample)
  );
  const saasSignalInBody =
    !isNonSaasDomain(foldedSample) &&
    (CATEGORY_PATTERNS.find((e) => e.category === 'saas')?.patterns || []).some((pattern) =>
      pattern.test(foldedSample)
    );
  const domainSuppressNda = isFranchiseSignal(foldedSample) || isConstructionSignal(foldedSample);
  const weakNdaBodyOnly =
    (salesSignalInBody || saasSignalInBody || domainSuppressNda) &&
    WEAK_NDA_BODY.some((weak) => weak.test(foldedSample) && !weak.test(foldedPreamble));

  let best = { category: 'general', typeKey: 'typeGeneral', score: 0 };
  for (const entry of CATEGORY_PATTERNS) {
    let score = 0;
    for (const pattern of entry.patterns) {
      if (entry.category === 'saas' && isNonSaasDomain(foldedSample)) continue;
      if (entry.category === 'labor' && isConstructionSignal(foldedSample)) continue;
      if (pattern.test(foldedPreamble)) {
        score += entry.category === 'sales' || entry.category === 'saas' ? 5 : 3;
      } else if (pattern.test(foldedSample)) {
        if (
          entry.category === 'nda' &&
          (salesSignalInBody || saasSignalInBody || weakNdaBodyOnly || domainSuppressNda)
        ) {
          continue;
        }
        if (entry.category === 'freelance' && (salesSignalInBody || saasSignalInBody)) continue;
        score += entry.category === 'sales' || entry.category === 'saas' ? 2 : 1;
      }
    }
    if (score > best.score) {
      best = { category: entry.category, typeKey: typeKeyFromCategory(entry.category), score };
    }
  }

  if (best.score < 2) {
    return { category: 'general', typeKey: 'typeGeneral', confidence: best.score };
  }

  return {
    category: best.category,
    typeKey: best.typeKey,
    confidence: Math.min(1, best.score / 4),
  };
}

// Chip Kira kalsa bile NDA metni analiz/kalkan kategorisini ezmesin.
export function resolveAnalysisCategory(text, requested = 'general') {
  const asked = String(requested || 'general').toLowerCase() || 'general';
  const head = String(text || '').slice(0, 500);
  const foldedHead = foldTr(head);
  if (hasSupplierCustomerBlock(foldedHead) || isSalesPreamble(head)) return 'sales';
  if (isSaasPreamble(head)) return 'saas';
  if (isFranchiseSignal(foldedHead) || isConstructionSignal(foldedHead)) return 'general';
  const detected = detectContractType(text);
  const found = String(detected?.category || 'general').toLowerCase() || 'general';
  if (found !== 'general' && found !== asked) return found;
  return asked;
}
