// WAVE BO — tiered counter-offers. Run: node scripts/gen-wavebo-i18n.js
const fs = require('fs');
const path = require('path');

const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const T = {};
function set(key, byLang) {
  T[key] = byLang;
}

set('offerBalanced', {
  tr: 'Dengeli',
  en: 'Balanced',
  de: 'Ausgewogen',
  fr: 'Équilibré',
  es: 'Equilibrado',
  ar: 'متوازن',
  it: 'Equilibrato',
  zh: '均衡',
  ru: 'Сбалансировано',
  fa: 'متعادل',
  ja: 'バランス',
  pt: 'Equilibrado',
  nl: 'Gebalanceerd',
});

set('offerShield', {
  tr: 'Sert Kalkan',
  en: 'Shield',
  de: 'Harter Schild',
  fr: 'Bouclier fort',
  es: 'Escudo fuerte',
  ar: 'درع قوي',
  it: 'Scudo forte',
  zh: '强盾',
  ru: 'Жёсткий щит',
  fa: 'سپر سخت',
  ja: '強シールド',
  pt: 'Escudo forte',
  nl: 'Hard schild',
});

set('offerFast', {
  tr: 'Hızlı Uzlaşı',
  en: 'Fast-Accept',
  de: 'Schnell-Deal',
  fr: 'Accord rapide',
  es: 'Acuerdo rápido',
  ar: 'قبول سريع',
  it: 'Accordo rapido',
  zh: '快速妥协',
  ru: 'Быстрый компромисс',
  fa: 'توافق سریع',
  ja: '即妥結',
  pt: 'Acordo rápido',
  nl: 'Snel akkoord',
});

set('offerBalancedHint', {
  tr: 'Adil koruma — varsayılan ton',
  en: 'Fair protect — default tone',
  de: 'Faire Absicherung — Standardton',
  fr: 'Protection équitable — ton par défaut',
  es: 'Protección justa — tono por defecto',
  ar: 'حماية عادلة — النبرة الافتراضية',
  it: 'Tutela equa — tono predefinito',
  zh: '公平保护 — 默认语气',
  ru: 'Справедливая защита — тон по умолчанию',
  fa: 'حفاظت منصفانه — لحن پیش‌فرض',
  ja: '公平な保護 — デフォルト',
  pt: 'Proteção justa — tom padrão',
  nl: 'Eerlijke bescherming — standaardtoon',
});

set('offerShieldHint', {
  tr: 'Daha güçlü koruma — sert müzakere',
  en: 'Stronger protect — hard negotiate',
  de: 'Stärkerer Schutz — harte Verhandlung',
  fr: 'Protection plus forte — négociation dure',
  es: 'Protección más fuerte — negociación dura',
  ar: 'حماية أقوى — تفاوض صارم',
  it: 'Tutela più forte — negoziazione dura',
  zh: '更强保护 — 强硬谈判',
  ru: 'Более сильная защита — жёсткий торг',
  fa: 'حفاظت قوی‌تر — مذاکره سخت',
  ja: 'より強い保護 — 強硬交渉',
  pt: 'Proteção mais forte — negociação dura',
  nl: 'Sterkere bescherming — harde onderhandeling',
});

set('offerFastHint', {
  tr: 'Hızlı kabul — uzlaşı odaklı',
  en: 'Quick accept — deal-focused',
  de: 'Schnelle Annahme — dealorientiert',
  fr: 'Acceptation rapide — orienté deal',
  es: 'Aceptación rápida — centrado en el acuerdo',
  ar: 'قبول سريع — يركز على الصفقة',
  it: 'Accettazione rapida — orientata all’accordo',
  zh: '快速接受 — 成交导向',
  ru: 'Быстрое принятие — акцент на сделку',
  fa: 'پذیرش سریع — تمرکز روی توافق',
  ja: '即受諾 — 成約重視',
  pt: 'Aceitação rápida — foco no acordo',
  nl: 'Snel accepteren — dealgericht',
});

const out = {};
for (const lang of langs) {
  out[lang] = {};
  for (const key of Object.keys(T)) {
    out[lang][key] = T[key][lang] || T[key].en;
  }
}

const file = `// WAVE BO — Tiered Counter-Offers. Same key set in all 13 languages.\n\nexport const WAVE_BO_I18N = ${JSON.stringify(out, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'i18n.wavebo.js'), file, 'utf8');
console.log('Wrote i18n.wavebo.js keys=', Object.keys(T).length, 'langs=', langs.length);
