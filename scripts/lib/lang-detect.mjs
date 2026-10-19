// WAVE ECON.4: a small, dependency-free check that a model answered in the language it was asked to use.
// Not a general language identifier: it separates the 13 app languages from each other, which is all the A/B needs.
//  - non-Latin scripts are told apart by their characters (Arabic vs Persian by letters only Persian uses; Chinese vs
//    Japanese by kana);
//  - Latin-script languages are told apart by distinctive function words.

export const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];

const count = (text, re) => (text.match(re) || []).length;

const WORDS = {
  tr: 've bir bu için ile olarak olan daha gibi değil ancak çok veya ise sonra hakkı yok mı mu işveren sözleşme',
  en: 'the and of to is that for with are this you may should your not have which will can any',
  de: 'der die das und ist nicht mit für von ein eine den dem zu auf sie wird oder auch sich werden',
  fr: 'le les des est une pour dans que qui pas sur par vous avec ses ou mais être peut sont',
  es: 'el los las una por con para del como más pero sus puede son ser debe también mi tengo ahora debo dice han hacer primero está',
  it: 'il gli di che per con non sono una della delle del nel più può anche essere come suo',
  pt: 'os as uma não para com você pode são mais também seu sua dos das pelo pela deve ser meu meus minha tenho agora vou devo foi ainda isso está',
  nl: 'het een van niet voor met dat zijn wordt kan ook maar naar bij door heeft moet worden uw',
};
const STOP = Object.fromEntries(Object.entries(WORDS).map(([lang, list]) => [lang, new Set(list.split(' '))]));

// Returns { lang, scores } for a piece of text; lang is null when the text is too short to judge.
export function detectLanguage(raw) {
  const text = String(raw || '').replace(/https?:\/\/\S+/g, ' ').replace(/[0-9\s.,;:!?()[\]{}"'«»“”‘’\-–—/\\|*_#`<>=+%@&^~$]+/g, ' ').trim();
  const letters = count(text, /\p{L}/gu);
  if (letters < 12) return { lang: null, scores: {} };

  const han = count(text, /\p{Script=Han}/gu);
  const kana = count(text, /[\p{Script=Hiragana}\p{Script=Katakana}]/gu);
  const cyr = count(text, /\p{Script=Cyrillic}/gu);
  const arab = count(text, /\p{Script=Arabic}/gu);
  if (kana / letters > 0.04) return { lang: 'ja', scores: { ja: kana / letters } };
  if (han / letters > 0.3) return { lang: 'zh', scores: { zh: han / letters } };
  if (cyr / letters > 0.5) return { lang: 'ru', scores: { ru: cyr / letters } };
  if (arab / letters > 0.5) {
    const persianOnly = count(text, /[\u067E\u0686\u0698\u06AF\u06A9\u06CC]/g); // پ چ ژ گ ک ی
    const arabicOnly = count(text, /[\u0643\u064A\u0649\u0629]/g); // ك ي ى ة
    return persianOnly > arabicOnly ? { lang: 'fa', scores: { fa: persianOnly } } : { lang: 'ar', scores: { ar: arabicOnly } };
  }

  const tokens = text.toLowerCase().split(/\s+/).filter(Boolean);
  const scores = {};
  for (const lang of Object.keys(STOP)) scores[lang] = tokens.filter((token) => STOP[lang].has(token)).length / tokens.length;
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  // Turkish has letters no other app language uses; they break ties the stop words cannot.
  const turkishLetters = count(text, /[ğışİ]/gi) / letters;
  if (turkishLetters > 0.02 && scores.tr >= (ranked[0]?.[1] || 0) * 0.6) return { lang: 'tr', scores };
  return ranked[0] && ranked[0][1] > 0 ? { lang: ranked[0][0], scores } : { lang: null, scores };
}

export const matchesLanguage = (text, expected) => detectLanguage(text).lang === expected;
