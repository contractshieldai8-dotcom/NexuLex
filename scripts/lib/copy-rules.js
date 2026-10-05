'use strict';
// Copy-consistency rules shared by scripts/normalize-copy.js (the fixer) and scripts/verify-ui.js (the guard).
//
// House style
//  - UI labels (titles, buttons, chips, badges, placeholders) use sentence case in every cased language:
//      "Taslak üret", "Karar kartı", "Giriş yap"  (never "Taslak Üret", "Karar Kartı").
//  - Brand / plan / store names keep their capitals: NexuLex, Pro, Professional, Google Play, WhatsApp, Word ...
//  - Full sentences (ending with a period) are left alone: they may quote UI names ("Ayarlar’a yapıştırın").
//  - German is excluded (nouns are always capitalised); scripts without case are excluded by construction.

const CASED_LANGS = ['tr', 'en', 'fr', 'es', 'it', 'pt', 'nl', 'ru'];

const PROTECTED = new Set([
  'NexuLex', 'NEXULEX', 'Pro', 'Professional', 'Plus', 'Google', 'Play', 'Apple', 'App', 'Store', 'WhatsApp',
  'Word', 'Excel', 'Calendar', 'Takvim', 'iCal', 'Supabase', 'Android', 'iOS', 'Türkiye', 'Turkiye', 'DiffTool',
  'I', 'DEV', 'PDF', 'Diff',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
  // translated plan names (NexuLex Professional)
  'Profesyonel', 'Professionnel', 'Profesional', 'Professionale', 'Profissional', 'Professioneel', 'Профессионал',
  'Gmail', 'Outlook', 'Telegram', 'Instagram', 'Facebook', 'LinkedIn', 'Bluetooth',
]);
const BRAND_PREFIX = new Set(['NexuLex', 'NEXULEX', 'Google', 'Apple']);

// Keys whose value is a proper name list or a fixed token (country / locale / language names).
const SKIP_KEY = /^(country[A-Z]{2}|locale[A-Za-z]*Pick[A-Z]{2}|lang[A-Z][a-z]+|language[A-Z][A-Za-z]*Name|pg[A-Za-z]*_.*|pgAskCta|lhLegalAidTitle|localeCountryHint|shieldOpenDiff|radarLiveHint|verifyPasteNewHint)$/;

const WORD = /^\p{Lu}\p{Ll}+$/u;
const MAX_WORDS = 9;

function lower(word, lang) {
  return lang === 'tr' ? word.toLocaleLowerCase('tr-TR') : word.toLowerCase();
}

// Returns the sentence-cased label, or the input untouched when it is not a label / already fine.
function sentenceCase(value, lang, key) {
  if (typeof value !== 'string' || !CASED_LANGS.includes(lang)) return value;
  if (key && SKIP_KEY.test(key)) return value;
  const lead = value.match(/^[^\p{L}\p{N}{]*/u)[0];
  const body = value.slice(lead.length);
  if (!body || /\n/.test(body)) return value;
  // sentences (end with a full stop / ellipsis-less period) and multi-sentence strings are not labels
  const core = body.trim().replace(/(\.{2,}|…)$/, '');
  if (/[.!?…]$/.test(core) || /[.!?]\s+\p{L}/u.test(core)) return value;
  const plain = body.replace(/\{\{[^}]*\}\}/g, 'X');
  if (plain.split(/\s+/).filter(Boolean).length > MAX_WORDS) return value;

  let first = true;
  let prevWord = '';
  let afterBreak = false;
  const out = body.replace(/\{\{[^}]*\}\}|(\p{L}[\p{L}]*)((?:['’]\p{L}+)?)|( - | · | — |: )/gu, (m, w, suffix, brk, offset) => {
    if (brk) { afterBreak = true; return m; }
    if (!w) { first = false; prevWord = ''; return m; } // placeholder counts as a word
    const keep = first || afterBreak;
    // "E-Posta" / "E-mail": a lone capital E glued to a hyphenated word
    if (!keep && w === 'E' && body[offset + 1] === '-') {
      first = false; afterBreak = false; prevWord = w;
      return lower(w, lang) + suffix;
    }
    const isTitleWord = WORD.test(w);
    let res = m;
    if (!keep && isTitleWord && !PROTECTED.has(w) && !BRAND_PREFIX.has(prevWord)) {
      res = lower(w, lang) + suffix;
    }
    first = false;
    afterBreak = false;
    prevWord = w;
    return res;
  });
  return lead + out;
}

// Language-specific vocabulary clean-up (loanwords that read badly once suffixed).
const TR_REPLACEMENTS = [
  [/\bBriefi\b/g, 'Özeti'], [/\bbriefi\b/g, 'özeti'],
  [/\bBrief[’']i\b/g, 'Özeti'], [/\bbrief[’']i\b/g, 'özeti'],
  [/\bBrief[’']ler\b/g, 'Özetler'], [/\bbrief[’']ler\b/g, 'özetler'],
  [/\bBriefleri\b/g, 'Özetleri'], [/\bbriefleri\b/g, 'özetleri'],
  [/\bBrief\b/g, 'Özet'], [/\bbrief\b/g, 'özet'],
  [/playbook[’']u\b/g, 'kontrol listesini'], [/Playbook[’']u\b/g, 'Kontrol listesini'],
  [/\bplaybook\b/g, 'kontrol listesi'], [/\bPlaybook\b/g, 'Kontrol listesi'],
  [/\bFreelancer\b/g, 'Serbest çalışan'], [/\bFreelance\b/g, 'Serbest çalışma'],
  [/paywall[’']da\b/g, 'abonelik ekranında'],
  [/\bRedline[’']dır\b/g, 'kırmızı çizgidir'], [/\bredline[’']dır\b/g, 'kırmızı çizgidir'],
  [/\bredline\b/g, 'kırmızı çizgi'], [/\bRedline\b/g, 'Kırmızı çizgi'],
];

// Exact-value repairs for machine-translation slips found during the copy audit.
const VALUE_FIXES = {
  it: { '{{count}} Paginae o Immaginei Selezionatae': '{{count}} pagine o immagini selezionate' },
  es: { '{{count}} Páginas/Imagenes Seleccionadas': '{{count}} páginas/imágenes seleccionadas' },
};

function vocabulary(value, lang) {
  if (typeof value !== 'string') return value;
  if (VALUE_FIXES[lang] && VALUE_FIXES[lang][value]) return VALUE_FIXES[lang][value];
  if (lang !== 'tr') return value;
  let v = value;
  for (const [re, to] of TR_REPLACEMENTS) v = v.replace(re, to);
  return v;
}

// Detect labels that are still Title Case (used by the verify guard). Returns the offending words.
function titleCaseOffenders(value, lang, key) {
  const fixed = sentenceCase(value, lang, key);
  return fixed === value ? [] : [fixed];
}

module.exports = { CASED_LANGS, sentenceCase, vocabulary, titleCaseOffenders, PROTECTED };
