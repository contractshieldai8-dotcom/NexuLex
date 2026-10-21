// WAVE ST.3 — bake privacy.html and delete-account.html for 13 languages.
const fs = require('fs');
const path = require('path');
const { LANGS, assertLegalWebPages, assertLegalWebTerms, assertLegalWebCompliance } = require('./legalWebAssert');

const ROOT = path.join(__dirname, '..');
const RTL = new Set(['ar', 'fa']);

const load = (lang) => {
  const file = path.join(__dirname, 'l10n', `legalweb.${lang}.js`);
  delete require.cache[require.resolve(file)];
  return require(file);
};

const tables = {};
for (const lang of LANGS) {
  const row = load(lang);
  if (typeof row.privacy !== 'string' || !row.privacy.trim() || typeof row.deleteAccount !== 'string' || !row.deleteAccount.trim() || typeof row.terms !== 'string' || !row.terms.trim()) {
    console.error(`${lang}: privacy/deleteAccount/terms missing`);
    process.exit(1);
  }
  if (!/NexuLex/.test(row.privacy) || !/NexuLex/.test(row.deleteAccount) || !/NexuLex/.test(row.terms)) {
    console.error(`${lang}: must name NexuLex`);
    process.exit(1);
  }
  tables[lang] = row;
}

function shell(title, panels) {
  const buttons = LANGS.map((L) => `<button type="button" data-lang="${L}"${L === 'en' ? ' class="active"' : ''}>${L.toUpperCase()}</button>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>
body{margin:0;background:#0A0F1D;color:#F8FAFC;font-family:system-ui,-apple-system,sans-serif;line-height:1.55}
main{max-width:720px;margin:0 auto;padding:28px 20px 80px}
.accent{color:#D4B27A;letter-spacing:.08em;text-transform:uppercase;font-size:12px;font-weight:700}
h1{font-size:24px;margin:10px 0 8px;line-height:1.25}
h2{font-size:17px;color:#D4B27A;margin:28px 0 8px}
p,li{color:#CBD5E1;font-size:15px;margin:0 0 12px}
ol,ul{padding-left:1.2em;margin:0 0 14px}
.meta{color:#94A3B8;font-size:13px;margin-bottom:22px}
table{width:100%;border-collapse:collapse;margin:0 0 16px}
th,td{border-bottom:1px solid #1E293B;padding:9px 8px;text-align:start;vertical-align:top;font-size:14px;color:#CBD5E1}
th{color:#D4B27A;font-weight:600}
td:first-child{width:42%}
.warn{border:1px solid #E5484D;border-radius:10px;padding:12px 14px;margin:0 0 18px}
.lang{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}
.lang button{background:transparent;border:1px solid #1E293B;color:#94A3B8;border-radius:8px;padding:8px 12px;font-weight:600}
.lang button.active{border-color:#D4B27A;color:#D4B27A}
.panel{display:none}
.panel.active{display:block}
[dir=rtl]{text-align:right}
a{color:#D4B27A}
</style>
</head>
<body>
<main>
<p class="accent">NexuLex AI</p>
<div class="lang">
${buttons}
</div>
${panels}
</main>
<script>
(function () {
  var langs = ${JSON.stringify(LANGS)};
  var buttons = document.querySelectorAll('.lang button');
  function show(lang) {
    lang = langs.indexOf(lang) >= 0 ? lang : 'en';
    buttons.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-lang') === lang); });
    langs.forEach(function (key) {
      var el = document.getElementById(key);
      if (el) el.classList.toggle('active', key === lang);
    });
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar' || lang === 'fa') ? 'rtl' : 'ltr';
  }
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () { show(btn.getAttribute('data-lang')); });
  });
  var q = '';
  try { q = String(new URLSearchParams(location.search).get('lang') || '').slice(0, 2).toLowerCase(); } catch (e) {}
  if (q) show(q);
})();
</script>
</body>
</html>
`;
}

function panels(field) {
  return LANGS.map((L) => {
    const rtl = RTL.has(L) ? ' dir="rtl"' : '';
    const active = L === 'en' ? ' active' : '';
    return `<section id="${L}" class="panel${active}" lang="${L}"${rtl}>\n${tables[L][field]}\n</section>`;
  }).join('\n\n');
}

const privacyPath = path.join(ROOT, 'web', 'privacy.html');
const deletePath = path.join(ROOT, 'web', 'delete-account.html');
const termsPath = path.join(ROOT, 'web', 'terms.html');
fs.writeFileSync(privacyPath, shell('NexuLex AI — Privacy Policy', panels('privacy')), 'utf8');
fs.writeFileSync(deletePath, shell('NexuLex AI — Delete your account', panels('deleteAccount')), 'utf8');
fs.writeFileSync(termsPath, shell('NexuLex AI — Terms of Use', panels('terms')), 'utf8');

const listing = fs.readFileSync(path.join(ROOT, 'STORE_LISTING.md'), 'utf8');
try {
  const result = assertLegalWebPages(fs.readFileSync(privacyPath, 'utf8'), fs.readFileSync(deletePath, 'utf8'), listing);
  const terms = assertLegalWebTerms(fs.readFileSync(termsPath, 'utf8'));
  const compliance = assertLegalWebCompliance(fs.readFileSync(privacyPath, 'utf8'), fs.readFileSync(termsPath, 'utf8'));
  console.log('Wrote privacy.html + delete-account.html + terms.html ×', result.langs, 'fixtures=', result.cases + terms.cases + compliance.cases);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
