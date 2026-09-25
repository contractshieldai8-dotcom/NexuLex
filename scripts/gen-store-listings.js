// WAVE REL.1 — validate store copy and write paste-ready JSON + STORE_LISTING.md (keeps Data Safety).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const LANG_HEAD = { tr: 'TR', en: 'EN', de: 'DE', fr: 'FR', es: 'ES', ar: 'AR', it: 'IT', zh: 'ZH', ru: 'RU', fa: 'FA', ja: 'JA', pt: 'PT', nl: 'NL' };

const load = (lang) => {
  const file = path.join(__dirname, 'l10n', `store.${lang}.js`);
  delete require.cache[require.resolve(file)];
  return require(file);
};

const tables = {};
for (const lang of langs) {
  if (!fs.existsSync(path.join(__dirname, 'l10n', `store.${lang}.js`))) {
    console.error(`${lang}: file missing`);
    process.exit(1);
  }
  tables[lang] = load(lang);
}

const { assertStoreListing, assertStoreAso, SCREENSHOT_IDS } = require('./cb1-harness').loadApp('en').api;
let result;
try {
  result = assertStoreListing(tables);
  result.aso = assertStoreAso(tables).cases;
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const outDir = path.join(ROOT, 'store', 'listings');
fs.mkdirSync(outDir, { recursive: true });
for (const lang of langs) {
  const row = tables[lang];
  const json = {
    locale: lang,
    apple: {
      name: row.name,
      subtitle: row.subtitle,
      promotionalText: row.promotionalText,
      description: row.description,
      keywords: row.keywords,
      whatsNew: row.whatsNew,
    },
    google: {
      title: row.name,
      shortDescription: row.shortDescription,
      fullDescription: row.description,
    },
    screenshots: Object.fromEntries(SCREENSHOT_IDS.map((id) => [id, row[`shot_${id}`]])),
  };
  fs.writeFileSync(path.join(outDir, `${lang}.json`), `${JSON.stringify(json, null, 2)}\n`, 'utf8');
}

const listingPath = path.join(ROOT, 'STORE_LISTING.md');
const prev = fs.readFileSync(listingPath, 'utf8').replace(/\r\n/g, '\n');
const keepFrom = prev.indexOf('\n## Gizlilik cümlesi');
if (keepFrom < 0) {
  console.error('STORE_LISTING.md: Gizlilik cümlesi section missing');
  process.exit(1);
}
const tail = prev.slice(keepFrom + 1).replace(/\n## Ekran görüntüsü sırası[\s\S]*$/, '\n');

const shortBlocks = langs.map((L) => `### ${LANG_HEAD[L]}\n${tables[L].shortDescription}\n`).join('\n');
const longBlocks = langs.map((L) => `### ${LANG_HEAD[L]}\n${tables[L].description}\n`).join('\n');
const shotBlocks = SCREENSHOT_IDS.map((id, i) => `${i + 1}. ${tables.tr[`shot_${id}`]} / ${tables.en[`shot_${id}`]}`).join('\n');
const keywordLine = langs.map((L) => `${LANG_HEAD[L]}: ${tables[L].keywords}`).join('\n');

const head = `# NexuLex AI — mağaza listeleri

Uygulama içi ekran değildir. App Store / Google Play metinleri. Runtime’a import etmeyin.
Kaynak: \`scripts/l10n/store.<lang>.js\` — yapıştırılacak JSON: \`store/listings/<lang>.json\` — \`node scripts/gen-store-listings.js\` ile üretin.

**Ad:** NexuLex AI

**Zorunlu uyarı (her dilde listede yer alır):** General legal information, not legal advice / lawyer representation.

**Yargı alanı paketleri (dürüst beyan):** Kanuni hesaplayıcılar (kıdem tazminatı, kira artışı, yasal faiz) yalnızca Türkiye tablolarıyla çalışır (tablo tarihi 1 Ocak 2026, resmî kaynakla doğrulanmalıdır). Diğer ülkelerde faiz ve kira hesaplayıcıları genel modda çalışır (oranı kullanıcı girer), kıdem hesaplayıcısı kapalıdır. Senaryo yol haritaları ve dilekçe/mektup taslakları Türkiye’ye özgüdür; diğer ülkelerde genel adımlar ve kanun atfı içermeyen genel mektup formatı gösterilir. Kazanma olasılığı, emsal karar veya mahkemede temsil iddiası yoktur; taslaklar şablondur. Avukat listesi, sıralama veya yönlendirme yoktur.

## Kısa açıklama (≤ 80 karakter)

${shortBlocks}
## Uzun açıklama

${longBlocks}
## Anahtar sözcükler

${keywordLine}

## Ekran görüntüsü sırası

${shotBlocks}

TR: Orijinal tuzak metni AI’ya ikinci kez gitmez; kalkan taslağı gider.
EN: The original trap wording is not sent to the AI again; the shield draft is.

`;

fs.writeFileSync(listingPath, `${head}${tail}`, 'utf8');
console.log('Wrote store/listings ×', langs.length, 'fixtures=', result.cases, 'aso=', result.aso);
