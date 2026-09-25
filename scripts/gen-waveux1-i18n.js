// WAVE UX.1 — Currency-true labels, generic calculator copy, release-clean notes, date validation.
// Run: node scripts/gen-waveux1-i18n.js
const fs = require('fs');
const path = require('path');

const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const T = {};
function set(key, byLang) {
  T[key] = byLang;
}
const ui = (tr, en, de, fr, es, ar, it, zh, ru, fa, ja, pt, nl) => ({
  tr, en, de, fr, es, ar, it, zh, ru, fa, ja, pt, nl,
});

// --- Money field labels when no currency can be resolved -------------------------
set('calcGrossSalaryNoCur', ui('Brüt aylık ücret', 'Gross monthly salary', 'Bruttomonatslohn', 'Salaire brut mensuel', 'Salario bruto mensual', 'الراتب الشهري الإجمالي', 'Stipendio lordo mensile', '月总薪', 'Валовая месячная зарплата', 'حقوق ناخالص ماهانه', '月額総支給', 'Salário bruto mensal', 'Bruto maandsalaris'));
set('calcCurrentRentNoCur', ui('Mevcut kira', 'Current rent', 'Aktuelle Miete', 'Loyer actuel', 'Renta actual', 'الإيجار الحالي', 'Affitto attuale', '当前租金', 'Текущая аренда', 'اجاره فعلی', '現行賃料', 'Renda atual', 'Huidige huur'));
set('calcProposedRentNoCur', ui('Önerilen yeni kira', 'Proposed new rent', 'Vorgeschlagene neue Miete', 'Nouveau loyer proposé', 'Nueva renta propuesta', 'الإيجار المقترح', 'Nuovo affitto proposto', '拟议新租金', 'Предложенная новая аренда', 'اجاره پیشنهادی جدید', '提案新賃料', 'Nova renda proposta', 'Voorgestelde nieuwe huur'));
set('calcPrincipalNoCur', ui('Anapara', 'Principal', 'Kapital', 'Capital', 'Capital', 'أصل المبلغ', 'Capitale', '本金', 'Основная сумма', 'اصل مبلغ', '元本', 'Capital', 'Hoofdsom'));

// --- Generic (non-statutory) calculator copy: no country-specific terms ------------
set('calcRentTitleGeneric', ui('Kira artışı kontrolü', 'Rent increase check', 'Mieterhöhung prüfen', 'Vérification de hausse de loyer', 'Comprobación de aumento de renta', 'فحص زيادة الإيجار', 'Verifica aumento affitto', '租金涨幅核对', 'Проверка повышения аренды', 'بررسی افزایش اجاره', '賃料値上げチェック', 'Verificação de aumento de renda', 'Controle huurverhoging'));
set('calcRentDescGeneric', ui(
  'Önerilen artışı girdiğiniz oran/endeksle karşılaştırır.',
  'Compares the proposed increase with the rate or index you enter.',
  'Vergleicht die vorgeschlagene Erhöhung mit dem von Ihnen eingegebenen Satz oder Index.',
  'Compare la hausse proposée au taux ou à l’indice que vous saisissez.',
  'Compara el aumento propuesto con la tasa o el índice que introduzca.',
  'يقارن الزيادة المقترحة بالنسبة أو المؤشر الذي تدخله.',
  'Confronta l’aumento proposto con il tasso o l’indice che inserisci.',
  '将拟议涨幅与您输入的比率或指数进行比较。',
  'Сравнивает предложенное повышение с введённой вами ставкой или индексом.',
  'افزایش پیشنهادی را با نرخ یا شاخصی که وارد می‌کنید مقایسه می‌کند.',
  '提案された値上げを、入力した率または指数と比較します。',
  'Compara o aumento proposto com a taxa ou o índice que introduzir.',
  'Vergelijkt de voorgestelde verhoging met het tarief of de index die u invoert.'
));
set('calcIndexRateGeneric', ui('Artış oranı / endeks (%)', 'Increase rate / index (%)', 'Erhöhungssatz / Index (%)', 'Taux de hausse / indice (%)', 'Tasa de aumento / índice (%)', 'نسبة الزيادة / المؤشر (%)', 'Tasso di aumento / indice (%)', '涨幅比率/指数（%）', 'Ставка повышения / индекс (%)', 'نرخ افزایش / شاخص (%)', '値上げ率／指数（%）', 'Taxa de aumento / índice (%)', 'Verhogingspercentage / index (%)'));
set('calcLabelMaxAllowedGeneric', ui('Girdiğiniz orana göre azami kira', 'Maximum rent at your rate', 'Höchstmiete nach Ihrem Satz', 'Loyer maximal selon votre taux', 'Renta máxima según su tasa', 'الحد الأقصى للإيجار حسب نسبتك', 'Affitto massimo secondo il tuo tasso', '按您的比率计算的最高租金', 'Максимальная аренда по вашей ставке', 'حداکثر اجاره بر اساس نرخ شما', '入力した率での上限賃料', 'Renda máxima segundo a sua taxa', 'Maximale huur volgens uw tarief'));
set('calcInterestTitleGeneric', ui('Faiz hesaplayıcı (tahmini)', 'Interest calculator (est.)', 'Zinsrechner (geschätzt)', 'Calculateur d’intérêts (estim.)', 'Calculadora de intereses (estim.)', 'حاسبة الفائدة (تقديرية)', 'Calcolatore di interessi (stima)', '利息计算器（估算）', 'Калькулятор процентов (оценка)', 'محاسبه‌گر بهره (تخمینی)', '利息計算（概算）', 'Calculadora de juros (estim.)', 'Renteberekening (schatting)'));
set('calcInterestDescGeneric', ui(
  'Girdiğiniz yıllık oranla basit gün hesabı. Tahminidir; resmi tutar değildir.',
  'Simple day count at the annual rate you enter. An estimate, not an official amount.',
  'Einfache Tagesberechnung mit dem von Ihnen eingegebenen Jahressatz. Schätzung, kein amtlicher Betrag.',
  'Calcul simple au jour près avec le taux annuel saisi. Estimation, pas un montant officiel.',
  'Cálculo simple por días con la tasa anual que introduzca. Estimación, no un importe oficial.',
  'حساب بسيط بالأيام وفق النسبة السنوية التي تدخلها. تقدير وليس مبلغًا رسميًا.',
  'Calcolo semplice a giorni con il tasso annuo inserito. Stima, non un importo ufficiale.',
  '按您输入的年利率进行简单按日计算。仅为估算，并非官方金额。',
  'Простой расчёт по дням по введённой годовой ставке. Оценка, а не официальная сумма.',
  'محاسبه ساده روزشمار با نرخ سالانه‌ای که وارد می‌کنید. تخمینی است، نه مبلغ رسمی.',
  '入力した年率による単純な日数計算です。概算であり、公式な金額ではありません。',
  'Cálculo simples por dias com a taxa anual que introduzir. Estimativa, não um valor oficial.',
  'Eenvoudige dagberekening met het jaartarief dat u invoert. Een schatting, geen officieel bedrag.'
));
set('calcJurisdictionGeneric', ui('Genel', 'General', 'Allgemein', 'Général', 'General', 'عام', 'Generale', '通用', 'Общий', 'عمومی', '一般', 'Geral', 'Algemeen'));

// --- Release-clean rate note (replaces the internal source note in production) -----
set('calcRatesAsOfPublic', ui(
  'Oranlar {{date}} itibarıyla yerel tablodan alınmıştır; resmi kaynaktan doğrulayın.',
  'Rates are from a local table as of {{date}}; verify them with an official source.',
  'Die Sätze stammen aus einer lokalen Tabelle, Stand {{date}}; prüfen Sie sie anhand einer amtlichen Quelle.',
  'Taux issus d’une table locale au {{date}} ; vérifiez-les auprès d’une source officielle.',
  'Tasas de una tabla local a {{date}}; verifíquelas con una fuente oficial.',
  'المعدلات مأخوذة من جدول محلي بتاريخ {{date}}؛ تحقّق منها من مصدر رسمي.',
  'Tassi da una tabella locale al {{date}}; verificali con una fonte ufficiale.',
  '费率取自截至{{date}}的本地表，请以官方来源核实。',
  'Ставки взяты из локальной таблицы на {{date}}; сверьте их с официальным источником.',
  'نرخ‌ها از جدول محلی به تاریخ {{date}} گرفته شده‌اند؛ آن‌ها را با منبع رسمی تطبیق دهید.',
  '料率は{{date}}時点のローカル表によるものです。公的な情報源でご確認ください。',
  'Taxas de uma tabela local em {{date}}; confirme-as numa fonte oficial.',
  'Tarieven uit een lokale tabel per {{date}}; controleer ze bij een officiële bron.'
));

// --- Date validation ---------------------------------------------------------------
set('calcInvalidDate', ui(
  'Geçerli tarihler girin (YYYY-AA-GG); bitiş tarihi başlangıçtan önce olamaz.',
  'Enter valid dates (YYYY-MM-DD); the end date cannot be before the start date.',
  'Geben Sie gültige Daten ein (JJJJ-MM-TT); das Enddatum darf nicht vor dem Startdatum liegen.',
  'Saisissez des dates valides (AAAA-MM-JJ) ; la date de fin ne peut pas précéder la date de début.',
  'Introduzca fechas válidas (AAAA-MM-DD); la fecha final no puede ser anterior a la inicial.',
  'أدخل تواريخ صحيحة (YYYY-MM-DD)؛ لا يمكن أن يسبق تاريخ الانتهاء تاريخ البدء.',
  'Inserisci date valide (AAAA-MM-GG); la data di fine non può precedere quella di inizio.',
  '请输入有效日期（YYYY-MM-DD）；结束日期不能早于开始日期。',
  'Введите корректные даты (ГГГГ-ММ-ДД); дата окончания не может быть раньше даты начала.',
  'تاریخ‌های معتبر وارد کنید (YYYY-MM-DD)؛ تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.',
  '有効な日付を入力してください（YYYY-MM-DD）。終了日は開始日より前にできません。',
  'Introduza datas válidas (AAAA-MM-DD); a data final não pode ser anterior à inicial.',
  'Voer geldige data in (JJJJ-MM-DD); de einddatum mag niet vóór de begindatum liggen.'
));
set('draftInvalidDate', ui(
  'Tarihi {{format}} biçiminde girin.',
  'Enter the date as {{format}}.',
  'Datum im Format {{format}} eingeben.',
  'Saisissez la date au format {{format}}.',
  'Introduzca la fecha con el formato {{format}}.',
  'أدخل التاريخ بالصيغة {{format}}.',
  'Inserisci la data nel formato {{format}}.',
  '请按{{format}}格式输入日期。',
  'Введите дату в формате {{format}}.',
  'تاریخ را به قالب {{format}} وارد کنید.',
  '日付は{{format}}の形式で入力してください。',
  'Introduza a data no formato {{format}}.',
  'Voer de datum in als {{format}}.'
));

const out = {};
for (const lang of langs) {
  out[lang] = {};
  for (const key of Object.keys(T)) {
    const value = T[key][lang];
    if (typeof value !== 'string' || !value.trim()) throw new Error(`missing ${lang}.${key}`);
    out[lang][key] = value;
  }
}
const file = `// WAVE UX.1 — Currency-true labels, generic calculator copy, release-clean notes. Same key set in all 13 languages.\n\nexport const WAVE_UX1_I18N = ${JSON.stringify(out, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'i18n.waveux1.js'), file, 'utf8');
console.log('Wrote i18n.waveux1.js keys=', Object.keys(T).length, 'langs=', langs.length);
