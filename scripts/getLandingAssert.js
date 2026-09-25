/** WAVE REL.5 — public get.html: 13 languages, Play only when baked, no invented Apple id. */

const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];

function blobOf(html, key) {
  const re = new RegExp(`var ${key} = \\{([\\s\\S]*?)\\};`);
  return (html.match(re) || ['', ''])[1];
}

function assertGetLanding(html) {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`getLanding: ${msg}`);
  };
  check(typeof html === 'string' && html.includes('NexuLex'), 'page names NexuLex');
  for (const lang of LANGS) {
    check(html.includes(`data-lang="${lang}"`), `lang button ${lang}`);
    check(new RegExp(`${lang}:\\s+'[^']+'`).test(blobOf(html, 'BODY')), `BODY ${lang}`);
    check(new RegExp(`${lang}:\\s+'[^']+'`).test(blobOf(html, 'APPSTORE')), `APPSTORE ${lang}`);
    check(new RegExp(`${lang}:\\s+'[^']+'`).test(blobOf(html, 'DISCLAIMER')), `DISCLAIMER ${lang}`);
    check(new RegExp(`${lang}:\\s+'[^']*NexuLex`).test(blobOf(html, 'DISCLAIMER')), `DISCLAIMER ${lang} names NexuLex`);
  }
  check(/URLSearchParams\(location\.search\)/.test(html) && /params\.get\('lang'\)/.test(html), 'honors ?lang=');
  check(/id="disclaimer"/.test(html) && /id="play-store"/.test(html) && /id="app-store-note"/.test(html), 'store honesty nodes');
  check(html.includes('__PLAY_STORE_HREF__'), 'Play href is a publish-time placeholder');
  check(!/play\.google\.com\/store\/apps\/details/.test(html), 'source must not hardcode the Play details path');
  check(!/itunes\.apple|apps\.apple\.com\/app\/id\d+|itms-apps/.test(html), 'must not invent an Apple app id');
  check(/nexulex:\/\//.test(html) && !/contract_text/.test(html), 'deep link stays; no contract leak');
  check(/href="privacy\.html"/.test(html) && /href="terms\.html"/.test(html) && /href="delete-account\.html"/.test(html), 'legal links');
  check(/id="disclaimer"[\s\S]*<\/main>/.test(html), 'disclaimer stays last in the page');
  check(/Apple app number|Apple uygulama numarası|Apple-App-Nummer|numero d app Apple|numero de app de Apple|رقم تطبيق Apple|numero app Apple|Apple 应用编号|номера приложения Apple|شماره برنامه اپل|Apple のアプリ番号|numero de app da Apple|Apple-appnummer/.test(html), 'every locale states there is no Apple number');
  for (const lang of ['ar', 'fa']) {
    const arFa = [blobOf(html, 'BODY'), blobOf(html, 'APPSTORE'), blobOf(html, 'DISCLAIMER')].join('\n');
    const slice = arFa.split(`${lang}:`)[1] || '';
    const line = slice.split('\n')[0] || '';
    check(!/→/.test(line), `${lang} must not use →`);
    check(!/[\u0600-\u06FF][^?]*\?(\s|$)/.test(line), `${lang} use ؟`);
  }
  return { cases, langs: LANGS.length };
}

module.exports = { LANGS, assertGetLanding };
