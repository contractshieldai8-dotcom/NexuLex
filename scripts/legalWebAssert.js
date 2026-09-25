/** WAVE ST.3 — privacy / delete pages × 13. Photo Data Safety sentence stays in STORE_LISTING.md. */

const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];

const LOCKED_QUOTA =
  'device identifier and phone number used to claim the free quota are retained without any link to your account, solely to prevent repeated free-quota abuse';

const LOCKED_LAWYER =
  'Find a lawyer: the first message and the case packet are created on your device without AI and are not sent to our servers or to any lawyer';

const LOCKED_PHOTO =
  "Selected by the user via the system picker. Sent to our server and AI provider solely to analyze the contract; analysis results are stored in the user's account until deleted by the user or upon account deletion. Never accessed in the background.";

function panelOf(html, lang) {
  const re = new RegExp(`<section id="${lang}"[\\s\\S]*?<\\/section>`);
  return (html.match(re) || [''])[0];
}

function assertLegalWebPages(privacy, del, listing) {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`legalWeb: ${msg}`);
  };
  check(LANGS.length === 13, '13 legal-web languages');
  for (const lang of LANGS) {
    check(privacy.includes(`id="${lang}"`) && privacy.includes(`data-lang="${lang}"`), `privacy panel ${lang}`);
    check(del.includes(`id="${lang}"`) && del.includes(`data-lang="${lang}"`), `delete panel ${lang}`);
    check(/NexuLex/.test(panelOf(privacy, lang)), `privacy ${lang} names NexuLex`);
    check(/NexuLex/.test(panelOf(del, lang)), `delete ${lang} names NexuLex`);
  }
  check(privacy.includes(LOCKED_QUOTA), 'EN free-quota sentence stays');
  check(privacy.includes(LOCKED_LAWYER), 'EN lawyer-on-device sentence stays');
  check(/Professional tools/i.test(privacy) && /daily (run )?count/i.test(privacy), 'EN daily count for Professional tools');
  check(/href="delete-account\.html"/.test(privacy), 'privacy links delete-account.html');
  check(/Avukat bul: [^<]*cihazınızda oluşturulur/.test(privacy), 'TR lawyer packet stays on device');
  check(/system picker|sistem seçicisinde|Systemwähler|selecteur systeme|selector del sistema|منتقي النظام|selettore di sistema|系统选择器|системном меню|انتخابگر سیستم|システムの選択|seletor do sistema|systeemkiezer/i.test(privacy), 'picker clarification is present');
  check(/nexulexai@gmail\.com/.test(del), 'delete page has support email');
  check(/apps\.apple\.com\/account\/subscriptions/.test(del) && /play\.google\.com\/store\/account\/subscriptions/.test(del), 'store subscription links');
  check(/30/.test(del), 'web deletion still completes within 30 days');
  check(!/anonymi[sz]ed|hashed|anonimleştir|hashlen/i.test(privacy + del), 'no anonymized/hashed overclaim');
  check((listing || '').includes(LOCKED_PHOTO), 'STORE_LISTING photo-picker sentence stays');
  for (const lang of ['ar', 'fa']) {
    const blob = panelOf(privacy, lang) + panelOf(del, lang);
    check(!/→/.test(blob), `${lang} must not use →`);
    check(!/[\u0600-\u06FF][^?]*\?(\s|$)/.test(blob.replace(/https?:\/\/\S+/g, '').replace(/href="[^"]+"/g, '')), `${lang} use ؟`);
  }
  check(/dir="rtl"/.test(panelOf(privacy, 'ar')) && /dir="rtl"/.test(panelOf(privacy, 'fa')), 'RTL panels set dir');
  return { cases, langs: LANGS.length };
}

module.exports = {
  LANGS,
  LOCKED_QUOTA,
  LOCKED_LAWYER,
  LOCKED_PHOTO,
  assertLegalWebPages,
};
