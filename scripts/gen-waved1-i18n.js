const fs = require('fs');
const path = require('path');
const T = {
  en: { wd1PerMonth: '≈ {{price}} per month', wd1Trial: 'Free trial included. The store shows the trial length and your first charge date before you confirm. After it ends, {{price}} is charged unless you cancel.' },
  tr: { wd1PerMonth: 'aylık ≈ {{price}}', wd1Trial: 'Ücretsiz deneme dahil. Mağaza, onaylamadan önce deneme süresini ve ilk ödeme tarihini gösterir. Deneme bitince, iptal etmezseniz {{price}} tahsil edilir.' },
  de: { wd1PerMonth: '≈ {{price}} pro Monat', wd1Trial: 'Kostenlose Testphase inklusive. Der Store zeigt vor der Bestätigung die Dauer und das erste Abbuchungsdatum. Danach werden {{price}} berechnet, sofern Sie nicht kündigen.' },
  fr: { wd1PerMonth: '≈ {{price}} par mois', wd1Trial: 'Essai gratuit inclus. La boutique affiche la durée de l’essai et la date du premier prélèvement avant votre confirmation. Ensuite, {{price}} sont facturés, sauf résiliation.' },
  es: { wd1PerMonth: '≈ {{price}} al mes', wd1Trial: 'Prueba gratuita incluida. La tienda muestra la duración de la prueba y la fecha del primer cobro antes de confirmar. Después se cobrarán {{price}}, salvo que cancele.' },
  ar: { wd1PerMonth: '≈ {{price}} شهريًا', wd1Trial: 'تجربة مجانية مشمولة. يعرض المتجر مدة التجربة وتاريخ أول خصم قبل التأكيد. بعد انتهائها يُخصم {{price}} ما لم تلغِ.' },
  it: { wd1PerMonth: '≈ {{price}} al mese', wd1Trial: 'Prova gratuita inclusa. Lo store mostra la durata della prova e la data del primo addebito prima della conferma. Al termine vengono addebitati {{price}}, salvo disdetta.' },
  zh: { wd1PerMonth: '约 {{price}} / 月', wd1Trial: '包含免费试用。确认前，商店会显示试用时长和首次扣款日期。试用结束后，除非您取消，否则将收取 {{price}}。' },
  ru: { wd1PerMonth: '≈ {{price}} в месяц', wd1Trial: 'Включён бесплатный пробный период. Магазин покажет его длительность и дату первого списания до подтверждения. После окончания будет списано {{price}}, если вы не отмените подписку.' },
  fa: { wd1PerMonth: '≈ {{price}} در ماه', wd1Trial: 'دوره آزمایشی رایگان شامل است. فروشگاه پیش از تأیید، طول دوره و تاریخ اولین پرداخت را نشان می‌دهد. پس از پایان آن، اگر لغو نکنید {{price}} کسر می‌شود.' },
  ja: { wd1PerMonth: '月あたり約 {{price}}', wd1Trial: '無料トライアルが含まれます。確認前に、ストアがトライアル期間と最初の請求日を表示します。終了後は、解約しない限り {{price}} が請求されます。' },
  pt: { wd1PerMonth: '≈ {{price}} por mês', wd1Trial: 'Teste gratuito incluído. A loja mostra a duração do teste e a data da primeira cobrança antes de confirmar. Depois, serão cobrados {{price}}, salvo cancelamento.' },
  nl: { wd1PerMonth: '≈ {{price}} per maand', wd1Trial: 'Gratis proefperiode inbegrepen. De winkel toont de duur en de eerste afschrijfdatum voordat u bevestigt. Daarna wordt {{price}} in rekening gebracht, tenzij u opzegt.' },
};
const en = T.en;
const keys = Object.keys(en);
const problems = [];
const ph = (s) => (s.match(/\{\{\w+\}\}/g) || []).sort().join();
for (const [lang, table] of Object.entries(T)) {
  for (const k of keys) {
    const v = table[k];
    if (typeof v !== 'string' || !v.trim()) { problems.push(`${lang}.${k} missing`); continue; }
    if (ph(v) !== ph(en[k])) problems.push(`${lang}.${k} placeholders`);
    if (lang !== 'en' && v === en[k]) problems.push(`${lang}.${k} identical to EN`);
  }
  if (Object.keys(table).length !== keys.length) problems.push(`${lang} key set`);
}
if (Object.keys(T).length !== 13) problems.push('13 languages required');
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
fs.writeFileSync(path.join(__dirname, '..', 'i18n.waved1.js'), `// WAVE D.1 - paywall conversion clarity: store monthly equivalent and honest free-trial line. Same key set in all 13 languages.\n\nexport const WAVE_D1_I18N = ${JSON.stringify(T, null, 2)};\n`, 'utf8');
console.log('Wrote i18n.waved1.js keys=', keys.length);