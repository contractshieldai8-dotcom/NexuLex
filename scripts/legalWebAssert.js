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

function assertLegalWebTerms(terms) {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`legalWebTerms: ${msg}`);
  };
  check(LANGS.length === 13, '13 terms languages');
  for (const lang of LANGS) {
    check(terms.includes(`id="${lang}"`) && terms.includes(`data-lang="${lang}"`), `terms panel ${lang}`);
    check(/NexuLex/.test(panelOf(terms, lang)), `terms ${lang} names NexuLex`);
    check(/Professional/.test(panelOf(terms, lang)) && /RevenueCat/.test(panelOf(terms, lang)), `terms ${lang} names Professional and RevenueCat`);
  }
  check(/does not recommend, rank or refer lawyers/.test(terms), 'EN lawyer-referral sentence stays');
  check(/avukat önermez, sıralamaz/.test(terms), 'TR lawyer-referral sentence stays');
  check(/NexuLex AI is not a law firm and does not provide legal advice/.test(terms), 'EN not-a-law-firm sentence stays');
  check(!/anonymi[sz]ed|hashed|anonimleştir|hashlen|win rate|en iyi avukat|best lawyer/i.test(terms), 'no overclaims');
  for (const lang of ['ar', 'fa']) {
    const blob = panelOf(terms, lang);
    check(!/→/.test(blob), `${lang} must not use →`);
    check(!/[\u0600-\u06FF][^?]*\?(\s|$)/.test(blob.replace(/https?:\/\/\S+/g, '').replace(/href="[^"]+"/g, '')), `${lang} use ؟`);
  }
  check(/dir="rtl"/.test(panelOf(terms, 'ar')) && /dir="rtl"/.test(panelOf(terms, 'fa')), 'RTL terms panels set dir');
  return { cases };
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

const PRIVACY_SECTIONS = ['signup', 'voice', 'transfer', 'rights', 'children', 'analytics', 'invite', 'controller', 'security', 'templates', 'retention', 'kvkk', 'ccpa', 'changes', 'language'];
const TERMS_SECTIONS = ['eligibility', 'renewal', 'ai', 'termin', 'templates', 'law', 'language'];
const EN_PRECEDENCE = 'In case of discrepancies, the English version shall prevail.';
const FRANKFURT = /Frankfurt|Francfort|Fráncfort|Francoforte|法兰克福|Франкфурт|فرانکفورت|فرانكفورت|フランクフルト/;
/** One section from its heading up to the next heading (or the panel end). */
const sectionOf = (panel, name) => (panel.match(new RegExp(`<h2[^>]*data-sec="${name}"[\\s\\S]*?(?=<h2|<\\/section>)`)) || [''])[0];
const lastSection = (panel) => panel.slice(panel.lastIndexOf('<h2'));
const STRIPPED = {
  fr: /(?<![\p{L}\p{M}'’])(d|l|n|s|c|j|t|m|qu) [aeiouyhàâéèêîôû]|\b(confidentialite|donnees|mise a jour|ecran|reglages|supprime|boutique ?:)\b/iu,
  es: /\b(politica|traduccion|informacion|analisis|pagina|cancelela|juridico|telefono|ingles|cortesia)\b/i,
  pt: /\b(politica|traducao|aplicacao|servico|conservacao|eliminacao|juridico|ingles|nao|sao)\b/i,
  it: /(?<![\p{L}\p{M}'’])(l|d|dell|nell|sull|all|c|quest) (app|account|analisi|avviso|eliminazione|accesso|output)\b|(?<![\p{L}\p{M}])(piu|puo|cosi|perche|responsabilita|proprieta|autorita)(?![\p{L}\p{M}])|(?<![\p{L}\p{M}])e (uno studio|un software)/iu,
};
const PICKER = {
  tr: /sistem seçicisinde/, en: /system picker/, de: /Systemwähler/, fr: /sélecteur système/, es: /selector del sistema/, ar: /منتقي النظام/,
  it: /selettore di sistema/, zh: /系统选择器/, ru: /системном меню/, fa: /انتخابگر سیستم/, ja: /システムの選択/, pt: /seletor do sistema/, nl: /systeemkiezer/,
};

/** WAVE C: every language carries the same compliance sections, a fresh date, no stripped accents. */
function assertLegalWebCompliance(privacy, terms) {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`legalWebCompliance: ${msg}`);
  };
  const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/\S+@\S+/g, ' ');
  for (const lang of LANGS) {
    const p = panelOf(privacy, lang);
    const t = panelOf(terms, lang);
    for (const sec of PRIVACY_SECTIONS) check(p.includes(`data-sec="${sec}"`), `privacy ${lang} section ${sec}`);
    for (const sec of TERMS_SECTIONS) check(t.includes(`data-sec="${sec}"`), `terms ${lang} section ${sec}`);
    check(/18/.test(panelOf(privacy, lang).match(/data-sec="children"[\s\S]*?<\/p>/)[0]), `privacy ${lang} states age 18`);
    check(/24/.test(t.match(/data-sec="renewal"[\s\S]*?<\/p>/)[0]), `terms ${lang} states the 24-hour renewal rule`);
    check(/nexulexai@gmail\.com/.test(p.match(/data-sec="rights"[\s\S]*?<\/p>/)[0]), `privacy ${lang} rights give the contact`);
    check(/\b21\b/.test(p.match(/<p class="meta">[^<]*<\/p>/)[0]) && !/\b25\b/.test(p.match(/<p class="meta">[^<]*<\/p>/)[0]), `privacy ${lang} dated 21 October 2026`);
    check(/\b21\b/.test(t.match(/<p class="meta">[^<]*<\/p>/)[0]), `terms ${lang} dated 21 October 2026`);
    check(/CC0-1\.0/.test(p.match(/data-sec="templates"[\s\S]*?<\/p>/)[0]) && /CC0-1\.0/.test(t.match(/data-sec="templates"[\s\S]*?<\/p>/)[0]), `${lang} templates sections name the CC0-1.0 licence`);
    check(/General Legal/.test(p.match(/data-sec="templates"[\s\S]*?<\/p>/)[0]) && /General Legal/.test(t.match(/data-sec="templates"[\s\S]*?<\/p>/)[0]), `${lang} templates sections credit General Legal`);
    check(/HTTPS/.test(p.match(/data-sec="security"[\s\S]*?<\/p>/)[0]), `privacy ${lang} security section names HTTPS`);
    check(/GDPR|DSGVO|RGPD|AVG/.test(p.match(/data-sec="controller"[\s\S]*?<\/p>/)[0]), `privacy ${lang} controller section names the GDPR`);
    check(PICKER[lang].test(p), `privacy ${lang} states the picker sentence in its own language`);
    // Controller identity, providers, retention, KVKK, CCPA, language precedence, governing law (approved parameters).
    const IDENTITY = /Doğancan Kara/;
    check(IDENTITY.test(p.match(/data-sec="controller"[\s\S]*?<\/p>/)[0]) && /Bağcılar/.test(p.match(/data-sec="controller"[\s\S]*?<\/p>/)[0]), `privacy ${lang} controller names Doğancan Kara, Bağcılar`);
    check(IDENTITY.test(lastSection(p)) && /Bağcılar/.test(lastSection(p)) && /nexulexai@gmail\.com/.test(lastSection(p)), `privacy ${lang} contact names the publisher, address and email`);
    const transfer = sectionOf(p, 'transfer');
    for (const name of ['Supabase', 'Anthropic', 'RevenueCat', 'Netlify', 'Apple', 'Google']) check(transfer.includes(name), `privacy ${lang} providers name ${name}`);
    check(FRANKFURT.test(transfer), `privacy ${lang} states the Frankfurt (EU) region`);
    check(!/Gemini/i.test(p + t), `${lang} must not name Gemini (not used)`);
    const retention = sectionOf(p, 'retention');
    check(/<table>/.test(retention) && retention.includes('24') && retention.includes('180'), `privacy ${lang} retention table states 24 months and 180 days`);
    const kvkk = sectionOf(p, 'kvkk');
    check(/6698/.test(kvkk) && IDENTITY.test(kvkk) && /nexulexai@gmail\.com/.test(kvkk) && /\b11\b/.test(kvkk) && /\b9\b/.test(kvkk), `privacy ${lang} KVKK section (Law 6698, Articles 9 and 11, controller, contact)`);
    const ccpa = sectionOf(p, 'ccpa');
    check(/CCPA\/CPRA/.test(ccpa) && /\b45\b/.test(ccpa) && /nexulexai@gmail\.com/.test(ccpa), `privacy ${lang} CCPA/CPRA section`);
    check(sectionOf(p, 'language').includes(EN_PRECEDENCE) && sectionOf(t, 'language').includes(EN_PRECEDENCE), `${lang} states English precedence`);
    check(/Çağlayan/.test(sectionOf(t, 'law')), `terms ${lang} names the Istanbul (Çağlayan) courts`);
    check(IDENTITY.test(lastSection(t)) && /Bağcılar/.test(lastSection(t)) && /nexulexai@gmail\.com/.test(lastSection(t)), `terms ${lang} contact names the publisher, address and email`);
    const h2 = p.match(/<h2[^>]*>\d+\./g) || [];
    const nums = h2.map((h) => Number(h.match(/(\d+)\./)[1]));
    check(nums.every((n, i) => n === i + 1), `privacy ${lang} section numbers run 1..${nums.length}`);
    const th2 = (t.match(/<h2[^>]*>\d+\./g) || []).map((h) => Number(h.match(/(\d+)\./)[1]));
    check(th2.every((n, i) => n === i + 1), `terms ${lang} section numbers run 1..${th2.length}`);
    if (STRIPPED[lang]) {
      const hit = (strip(p) + ' ' + strip(t)).match(STRIPPED[lang]);
      check(!hit, `${lang} legal text has stripped accents or apostrophes: "${hit && hit[0]}"`);
    }
  }
  return { cases };
}

module.exports = {
  assertLegalWebCompliance,
  LANGS,
  LOCKED_QUOTA,
  LOCKED_LAWYER,
  LOCKED_PHOTO,
  assertLegalWebPages,
  assertLegalWebTerms,
};
