// WAVE ECON.4: test inputs for the 13-language A/B (scripts/benchmark-models.mjs). Fixtures only: nothing here reaches
// the app. One scenario (two months of unpaid wages and a threatened dismissal) is asked in every app language, so any
// difference between models or languages comes from the model, not from the question.
import { LANGS } from './lang-detect.mjs';

export { LANGS };

// country = the jurisdiction code the legal-ask / pro-tools prompts know (OFFICIAL_DOMAINS), the way a user in that
// language would normally pick it.
export const LANG_CASES = {
  tr: { country: 'TR', question: 'İşverenim son iki aylık maaşımı ödemedi ve şimdi beni işten çıkaracağını söylüyor. Tazminat hakkım var mı, önce ne yapmalıyım?' },
  en: { country: 'US', question: 'My employer has not paid my last two months of wages and now says I will be dismissed. Do I have a right to compensation, and what should I do first?' },
  de: { country: 'DE', question: 'Mein Arbeitgeber hat mir die letzten zwei Monatsgehälter nicht gezahlt und kündigt mir nun an, dass ich entlassen werde. Habe ich Anspruch auf eine Abfindung und was sollte ich zuerst tun?' },
  fr: { country: 'FR', question: "Mon employeur ne m'a pas versé mes deux derniers mois de salaire et m'annonce maintenant que je vais être licencié. Ai-je droit à une indemnité et que dois-je faire en premier ?" },
  es: { country: 'ES', question: 'Mi empleador no me ha pagado los dos últimos meses de salario y ahora dice que me van a despedir. ¿Tengo derecho a una indemnización y qué debo hacer primero?' },
  ar: { country: 'AE', question: 'لم يدفع لي صاحب العمل راتب آخر شهرين ويقول الآن إنه سيفصلني من العمل. هل لي الحق في تعويض وماذا يجب أن أفعل أولاً؟' },
  it: { country: 'IT', question: 'Il mio datore di lavoro non mi ha pagato gli ultimi due stipendi e ora dice che sarò licenziato. Ho diritto a un risarcimento e cosa devo fare per prima cosa?' },
  zh: { country: 'CN', question: '我的雇主已经两个月没有发工资，现在又说要解雇我。我有权要求赔偿吗？我应该先做什么？' },
  ru: { country: 'RU', question: 'Работодатель не выплатил мне зарплату за последние два месяца, а теперь говорит, что меня уволят. Имею ли я право на компенсацию и что мне сделать в первую очередь?' },
  fa: { country: 'IR', question: 'کارفرمای من حقوق دو ماه آخر را نپرداخته و حالا می‌گوید مرا اخراج می‌کند. آیا حق دریافت غرامت دارم و ابتدا چه کاری باید انجام دهم؟' },
  ja: { country: 'JP', question: '雇用主が直近2か月分の給料を支払わず、今度は私を解雇すると言っています。補償を求める権利はありますか。まず何をすべきですか。' },
  pt: { country: 'BR', question: 'Meu empregador não pagou meus dois últimos meses de salário e agora diz que vou ser demitido. Tenho direito a uma indenização e o que devo fazer primeiro?' },
  nl: { country: 'NL', question: 'Mijn werkgever heeft mijn laatste twee maanden loon niet betaald en zegt nu dat ik ontslagen word. Heb ik recht op een vergoeding en wat moet ik eerst doen?' },
};

// Pro tools (Professional plan): the question above plus the same English case notes, because real case files mix languages.
const CASE_NOTES = [
  'Case notes:',
  '2023-03-01 Employment contract signed, monthly gross salary agreed in writing.',
  '2026-01-31 January salary not paid. 2026-02-28 February salary not paid.',
  '2026-03-10 Written reminder sent to the employer by e-mail, no reply.',
  '2026-03-15 Manager said in a meeting that the employee will be dismissed "next month".',
  'Evidence available: contract, pay slips up to December, the e-mail, two colleagues who attended the meeting.',
].join('\n');

export const toolMaterial = (lang) => `${LANG_CASES[lang].question}\n\n${CASE_NOTES}`;
export const TOOL_POSITION = 'I want to recover the unpaid wages and understand whether I can also claim severance.';

// A short residential lease with six deliberate traps: unilateral rent increase, three-month deposit returned at the
// landlord's discretion, one-sided penalty, tenant pays structural repairs, entry without notice, waiver of rights and
// one-sided venue. Under 6000 characters, so the app takes its single-call (short) path.
export const CONTRACT_TYPE = 'Kira Sözleşmesi';
export const CONTRACT_CATEGORY = 'rent';
export const CONTRACT_COUNTRY = 'TR';
export const CONTRACT_PARTY = 'tenant';
export const CONTRACT_TEXT = `KONUT KİRA SÖZLEŞMESİ

1. TARAFLAR
1.1. Kiraya Veren: Mehmet Yılmaz. Kiracı: Ayşe Demir.

2. KİRALANAN
2.1. Kiralanan, İstanbul ili Kadıköy ilçesi Moda Mahallesi'nde bulunan 3+1 daire olup konut olarak kullanılacaktır.

3. SÜRE
3.1. Kira süresi 01.11.2026 tarihinde başlar ve 31.10.2027 tarihinde sona erer.
3.2. Süre bitiminden en az 30 gün önce taraflardan biri yazılı bildirimde bulunmazsa sözleşme aynı şartlarla bir yıl uzar.

4. KİRA BEDELİ
4.1. Aylık kira bedeli 30.000 TL olup her ayın 5'ine kadar peşin ödenir.
4.2. Kiraya veren, kira bedelini enflasyon oranından bağımsız olarak tek taraflı bildirimle her 6 ayda bir artırabilir.

5. DEPOZİTO
5.1. Kiracı üç aylık kira bedeli tutarında, yani 90.000 TL depozito öder.
5.2. Depozito, tahliyeden sonra kiraya verenin takdirine göre ve 90 gün içinde iade edilir; bu süre için faiz işletilmez.

6. GECİKME
6.1. Kira ödemesinde 1 gün gecikme halinde kiracı, aylık kira bedelinin yüzde 10'u kadar cezai şart öder ve ayrıca günlük yüzde 1 gecikme faizi uygulanır.

7. BAKIM VE ONARIM
7.1. Yapısal arızalar dahil her türlü bakım, onarım ve tadilat kiracıya aittir.

8. ERKEN FESİH
8.1. Kiracı süre bitmeden taşınırsa kalan süreye ait kira bedelinin tamamını ve ayrıca 3 aylık kira tutarında cezai şartı ödemeyi kabul eder.
8.2. Kiraya veren, 15 gün önceden bildirimde bulunarak sözleşmeyi gerekçe göstermeksizin feshedebilir.

9. TAŞINMAZA GİRİŞ
9.1. Kiraya veren, önceden haber vermeksizin dilediği zaman taşınmaza girebilir.

10. YETKİ VE HAKLARDAN VAZGEÇME
10.1. Uyuşmazlıklarda yalnızca kiraya verenin yerleşim yeri mahkemeleri yetkilidir.
10.2. Kiracı, sözleşmeden doğan tüm yasal itiraz ve dava haklarından peşinen vazgeçtiğini kabul eder.

Taraflar bu sözleşmeyi okuyarak imzalamışlardır.
Kiraya Veren: ______________     Kiracı: ______________     Tarih: ____/____/______`;
