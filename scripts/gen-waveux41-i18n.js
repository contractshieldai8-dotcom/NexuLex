// Generates i18n.waveux41.js — country labels for JP, BR, PT, MX and KR (13 languages, 5 keys each).
const fs = require('fs');
const path = require('path');

const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];

const LABELS = {
  tr: { JP: 'Japonya', BR: 'Brezilya', PT: 'Portekiz', MX: 'Meksika', KR: 'Güney Kore' },
  en: { JP: 'Japan', BR: 'Brazil', PT: 'Portugal', MX: 'Mexico', KR: 'South Korea' },
  de: { JP: 'Japan', BR: 'Brasilien', PT: 'Portugal', MX: 'Mexiko', KR: 'Südkorea' },
  fr: { JP: 'Japon', BR: 'Brésil', PT: 'Portugal', MX: 'Mexique', KR: 'Corée du Sud' },
  es: { JP: 'Japón', BR: 'Brasil', PT: 'Portugal', MX: 'México', KR: 'Corea del Sur' },
  ar: { JP: 'اليابان', BR: 'البرازيل', PT: 'البرتغال', MX: 'المكسيك', KR: 'كوريا الجنوبية' },
  it: { JP: 'Giappone', BR: 'Brasile', PT: 'Portogallo', MX: 'Messico', KR: 'Corea del Sud' },
  zh: { JP: '日本', BR: '巴西', PT: '葡萄牙', MX: '墨西哥', KR: '韩国' },
  ru: { JP: 'Япония', BR: 'Бразилия', PT: 'Португалия', MX: 'Мексика', KR: 'Южная Корея' },
  fa: { JP: 'ژاپن', BR: 'برزیل', PT: 'پرتغال', MX: 'مکزیک', KR: 'کره جنوبی' },
  ja: { JP: '日本', BR: 'ブラジル', PT: 'ポルトガル', MX: 'メキシコ', KR: '韓国' },
  pt: { JP: 'Japão', BR: 'Brasil', PT: 'Portugal', MX: 'México', KR: 'Coreia do Sul' },
  nl: { JP: 'Japan', BR: 'Brazilië', PT: 'Portugal', MX: 'Mexico', KR: 'Zuid-Korea' },
};

const CODES = ['JP', 'BR', 'PT', 'MX', 'KR'];
const out = {};
const problems = [];
for (const lang of langs) {
  out[lang] = {};
  for (const code of CODES) {
    const value = LABELS[lang]?.[code];
    if (typeof value !== 'string' || !value.trim()) problems.push(`${lang}.country${code} missing`);
    out[lang][`country${code}`] = value;
  }
}
if (Object.keys(LABELS).sort().join() !== [...langs].sort().join()) problems.push('exactly 13 languages are required');
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
fs.writeFileSync(
  path.join(__dirname, '..', 'i18n.waveux41.js'),
  `// WAVE UX.41 — country labels for JP, BR, PT, MX and KR. Same key set in all 13 languages.\n\nexport const WAVE_UX41_I18N = ${JSON.stringify(out, null, 2)};\n`,
);
console.log('Wrote i18n.waveux41.js keys=', CODES.length);
