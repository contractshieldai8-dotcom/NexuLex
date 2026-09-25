// WAVE CB — calculator i18n. Run: node scripts/gen-wavecb-i18n.js
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

set('calcSectionTitle', ui(
  'Hesaplayıcılar', 'Calculators', 'Rechner', 'Calculateurs', 'Calculadoras', 'حاسبات',
  'Calcolatori', '计算器', 'Калькуляторы', 'ماشین‌حساب‌ها', '計算機', 'Calculadoras', 'Rekenmachines'
));
set('calcSectionHint', ui(
  'Yerel formüller — ağ yok. Tahmini bilgilendirme.',
  'Local formulas — no network. Estimates only.',
  'Lokale Formeln — kein Netz. Nur Schätzungen.',
  'Formules locales — pas de réseau. Estimations.',
  'Fórmulas locales — sin red. Solo estimaciones.',
  'صيغ محلية — بلا شبكة. تقديرات فقط.',
  'Formule locali — senza rete. Solo stime.',
  '本地公式—无网络。仅供估算。',
  'Локальные формулы — без сети. Только оценки.',
  'فرمول محلی — بدون شبکه. فقط برآورد.',
  'ローカル計算・通信なし。概算のみ。',
  'Fórmulas locais — sem rede. Apenas estimativas.',
  'Lokale formules — geen netwerk. Alleen schattingen.'
));
set('calcSeveranceTitle', ui(
  'Kıdem / İhbar Hesaplayıcı', 'Severance / Notice Calculator', 'Abfindung / Kündigungsrechner',
  'Calculateur indemnité / préavis', 'Calculadora de indemnización', 'حاسبة مكافأة نهاية الخدمة',
  'Calcolo TFR / preavviso', '遣散/通知计算器', 'Калькулятор выходного пособия',
  'محاسبه سنوات/اخطار', '退職金/予告計算機', 'Calculadora de rescisão', 'Ontslagvergoeding-rekenmachine'
));
set('calcSeveranceDesc', ui(
  'Brüt ücret × yıl (tavanlı) − damga vergisi. İsteğe bağlı tahmini ihbar.',
  'Gross × years (capped) − stamp tax. Optional estimated notice.',
  'Brutto × Jahre (gedeckelt) − Stempelsteuer. Optionale Kündigungsabschätzung.',
  'Brut × années (plafonné) − droit de timbre. Préavis estimé optionnel.',
  'Bruto × años (con tope) − impuesto de timbre. Preaviso estimado opcional.',
  'الإجمالي × السنوات (بسقف) − ضريبة الدمغة. إنذار تقديري اختياري.',
  'Lordo × anni (con tetto) − imposta di bollo. Preavviso stimato opzionale.',
  '总额×年数（有上限）−印花税。可选估通知金。',
  'Брутто × годы (с потолком) − гербовый сбор. Опциональный оценённый срок.',
  'ناخالص × سال (سقف‌دار) − تمبر. اختیاری: اخطار برآوردی.',
  '総額×年数（上限）−印紙税。任意で予告概算。',
  'Bruto × anos (teto) − imposto de selo. Aviso estimado opcional.',
  'Bruto × jaren (plafond) − zegelrecht. Optionele opzegschatting.'
));
set('calcRentTitle', ui(
  'Kira Artış Tavanı', 'Rent Increase Cap', 'Mietsteigerungsdeckel', 'Plafond d’augmentation',
  'Tope de aumento de renta', 'سقف زيادة الإيجار', 'Tetto aumento affitto', '租金涨幅上限',
  'Потолок повышения аренды', 'سقف افزایش اجاره', '賃料値上げ上限', 'Teto de reajuste', 'Huurverhogingsplafond'
));
set('calcRentDesc', ui(
  'Önerilen artış ile TÜFE / yasal sınır karşılaştırması (yerel).',
  'Compare proposed increase vs TÜFE / statutory limit (local).',
  'Vergleicht Vorschlag mit TÜFE / gesetzlicher Grenze (lokal).',
  'Compare la hausse proposée au TÜFE / limite légale (local).',
  'Compara el aumento propuesto con TÜFE / límite legal (local).',
  'مقارنة الزيادة المقترحة مع TÜFE / الحد القانوني (محلي).',
  'Confronta l’aumento proposto con TÜFE / limite legale (locale).',
  '将拟议涨幅与TÜFE/法定上限比较（本地）。',
  'Сравнение предложенного роста с TÜFE / лимитом (локально).',
  'پیشنهاد افزایش در برابر TÜFE / سقف قانونی (محلی).',
  '提案値上げとTÜFE/法定上限を比較（ローカル）。',
  'Compara o reajuste proposto com TÜFE / limite legal (local).',
  'Vergelijk voorstel met TÜFE / wettelijke limiet (lokaal).'
));
set('calcInterestTitle', ui(
  'Yasal / Ticari Faiz (Tahmini)', 'Legal / Commercial Interest (Est.)', 'Gesetzliche / Handelszinsen (Schätzung)',
  'Intérêts légaux / commerciaux (est.)', 'Interés legal / comercial (est.)', 'فائدة قانونية/تجارية (تقدير)',
  'Interessi legali / commerciali (stima)', '法定/商业利息（估算）', 'Законный / коммерческий процент (оценка)',
  'بهره قانونی/تجاری (برآورد)', '法定/商事利息（概算）', 'Juros legais / comerciais (est.)', 'Wettelijke / handelsrente (schatting)'
));
set('calcInterestDesc', ui(
  'Basit gün hesabı. Tahmini — icra kesin tutarı değildir.',
  'Simple day-count. Estimated — not an enforcement exact figure.',
  'Einfache Tageszählung. Schätzung — kein exakter Vollstreckungsbetrag.',
  'Jours simples. Estimation — pas un montant d’exécution exact.',
  'Conteo simple de días. Estimación — no es cifra ejecutiva exacta.',
  'عدّ أيام بسيط. تقدير — ليس مبلغ تنفيذ دقيق.',
  'Conteggio giorni semplice. Stima — non cifra esecutiva esatta.',
  '简单日计。估算—非强制执行精确额。',
  'Простой подсчёт дней. Оценка — не точная исполнительная сумма.',
  'شمارش ساده روز. برآورد — رقم قطعی اجرا نیست.',
  '単純日数計算。概算—執行確定額ではありません。',
  'Contagem simples de dias. Estimativa — não é valor executivo exato.',
  'Eenvoudige dagtelling. Schatting — geen exacte executoriale som.'
));

// WAVE UX.1: money labels interpolate the resolved currency; *NoCur variants live in i18n.waveux1.js.
set('calcGrossSalary', ui('Brüt aylık ücret ({{currency}})', 'Gross monthly salary ({{currency}})', 'Bruttomonatslohn ({{currency}})', 'Salaire brut mensuel ({{currency}})', 'Salario bruto mensual ({{currency}})', 'الراتب الشهري الإجمالي ({{currency}})', 'Stipendio lordo mensile ({{currency}})', '月总薪（{{currency}}）', 'Валовая месячная зарплата ({{currency}})', 'حقوق ناخالص ماهانه ({{currency}})', '月額総支給（{{currency}}）', 'Salário bruto mensal ({{currency}})', 'Bruto maandsalaris ({{currency}})'));
set('calcWorkMonths', ui('Çalışılan ay sayısı', 'Months worked', 'Gearbeitete Monate', 'Mois travaillés', 'Meses trabajados', 'أشهر العمل', 'Mesi lavorati', '工作月数', 'Отработанные месяцы', 'ماه‌های کارکرد', '勤務月数', 'Meses trabalhados', 'Gewerkte maanden'));
set('calcIncludesNotice', ui('Tahmini ihbar ekle (1 ay)', 'Add estimated notice (1 month)', 'Geschätzte Kündigungsfrist (1 Monat)', 'Ajouter préavis estimé (1 mois)', 'Añadir preaviso estimado (1 mes)', 'إضافة إنذار تقديري (شهر)', 'Aggiungi preavviso stimato (1 mese)', '加入估通知（1个月）', 'Добавить оценённый срок (1 мес.)', 'افزودن اخطار برآوردی (۱ ماه)', '予告概算を加算（1か月）', 'Adicionar aviso estimado (1 mês)', 'Geschatte opzeg toevoegen (1 maand)'));
set('calcCurrentRent', ui('Mevcut kira ({{currency}})', 'Current rent ({{currency}})', 'Aktuelle Miete ({{currency}})', 'Loyer actuel ({{currency}})', 'Renta actual ({{currency}})', 'الإيجار الحالي ({{currency}})', 'Affitto attuale ({{currency}})', '当前租金（{{currency}}）', 'Текущая аренда ({{currency}})', 'اجاره فعلی ({{currency}})', '現行賃料（{{currency}}）', 'Renda atual ({{currency}})', 'Huidige huur ({{currency}})'));
set('calcProposedRent', ui('Önerilen yeni kira ({{currency}})', 'Proposed new rent ({{currency}})', 'Vorgeschlagene neue Miete ({{currency}})', 'Nouveau loyer proposé ({{currency}})', 'Nueva renta propuesta ({{currency}})', 'الإيجار المقترح ({{currency}})', 'Nuovo affitto proposto ({{currency}})', '拟议新租金（{{currency}}）', 'Предложенная новая аренда ({{currency}})', 'اجاره پیشنهادی جدید ({{currency}})', '提案新賃料（{{currency}}）', 'Nova renda proposta ({{currency}})', 'Voorgestelde nieuwe huur ({{currency}})'));
set('calcTufeRate', ui('TÜFE / tavan oran (%)', 'TÜFE / cap rate (%)', 'TÜFE / Deckel (%)', 'TÜFE / plafond (%)', 'TÜFE / tope (%)', 'TÜFE / سقف (%)', 'TÜFE / tetto (%)', 'TÜFE/上限(%)', 'TÜFE / потолок (%)', 'TÜFE / سقف (%)', 'TÜFE/上限(%)', 'TÜFE / teto (%)', 'TÜFE / plafond (%)'));
set('calcIsResidential', ui('Konut kirası', 'Residential lease', 'Wohnmiete', 'Bail d’habitation', 'Arrendamiento residencial', 'إيجار سكني', 'Locazione abitativa', '住宅租赁', 'Жилая аренда', 'مسکونی', '住居賃貸', 'Locação residencial', 'Woonhuur'));
set('calcPrincipal', ui('Anapara ({{currency}})', 'Principal ({{currency}})', 'Kapital ({{currency}})', 'Capital ({{currency}})', 'Capital ({{currency}})', 'أصل المبلغ ({{currency}})', 'Capitale ({{currency}})', '本金（{{currency}}）', 'Основная сумма ({{currency}})', 'اصل مبلغ ({{currency}})', '元本（{{currency}}）', 'Capital ({{currency}})', 'Hoofdsom ({{currency}})'));
set('calcStartDate', ui('Başlangıç (YYYY-AA-GG)', 'Start (YYYY-MM-DD)', 'Beginn (JJJJ-MM-TT)', 'Début (AAAA-MM-JJ)', 'Inicio (AAAA-MM-DD)', 'البداية (YYYY-MM-DD)', 'Inizio (AAAA-MM-GG)', '开始(YYYY-MM-DD)', 'Начало (ГГГГ-ММ-ДД)', 'شروع (YYYY-MM-DD)', '開始(YYYY-MM-DD)', 'Início (AAAA-MM-DD)', 'Start (JJJJ-MM-DD)'));
set('calcEndDate', ui('Bitiş (YYYY-AA-GG)', 'End (YYYY-MM-DD)', 'Ende (JJJJ-MM-TT)', 'Fin (AAAA-MM-JJ)', 'Fin (AAAA-MM-DD)', 'النهاية (YYYY-MM-DD)', 'Fine (AAAA-MM-GG)', '结束(YYYY-MM-DD)', 'Конец (ГГГГ-ММ-ДД)', 'پایان (YYYY-MM-DD)', '終了(YYYY-MM-DD)', 'Fim (AAAA-MM-DD)', 'Einde (JJJJ-MM-DD)'));
set('calcInterestTypeLegal', ui('Yasal faiz', 'Legal interest', 'Gesetzlicher Zins', 'Intérêt légal', 'Interés legal', 'فائدة قانونية', 'Interesse legale', '法定利息', 'Законный процент', 'بهره قانونی', '法定利息', 'Juros legais', 'Wettelijke rente'));
set('calcInterestTypeCommercial', ui('Ticari avans faizi', 'Commercial advance', 'Handelsvorschusszins', 'Intérêt commercial', 'Interés comercial', 'فائدة تجارية', 'Interesse commerciale', '商业利息', 'Коммерческий процент', 'بهره تجاری', '商事利息', 'Juros comerciais', 'Handelsrente'));

set('calcCalculate', ui('Hesapla', 'Calculate', 'Berechnen', 'Calculer', 'Calcular', 'احسب', 'Calcola', '计算', 'Рассчитать', 'محاسبه', '計算', 'Calcular', 'Berekenen'));
set('calcCopy', ui('Kopyala', 'Copy', 'Kopieren', 'Copier', 'Copiar', 'نسخ', 'Copia', '复制', 'Копировать', 'کپی', 'コピー', 'Copiar', 'Kopiëren'));
set('calcShare', ui('WhatsApp ile Paylaş', 'Share via WhatsApp', 'Per WhatsApp teilen', 'Partager via WhatsApp', 'Compartir por WhatsApp', 'مشاركة عبر واتساب', 'Condividi su WhatsApp', '通过WhatsApp分享', 'Поделиться в WhatsApp', 'اشتراک با واتساپ', 'WhatsAppで共有', 'Partilhar no WhatsApp', 'Delen via WhatsApp'));
set('calcAskAdvisor', ui('Danışmana Soru Sor', 'Ask Legal Advisor', 'Berater fragen', 'Demander au conseiller', 'Preguntar al asesor', 'اسأل المستشار', 'Chiedi al consulente', '询问顾问', 'Спросить консультанта', 'از مشاور بپرس', 'アドバイザーに質問', 'Perguntar ao consultor', 'Vraag de adviseur'));
set('calcClose', ui('Kapat', 'Close', 'Schließen', 'Fermer', 'Cerrar', 'إغلاق', 'Chiudi', '关闭', 'Закрыть', 'بستن', '閉じる', 'Fechar', 'Sluiten'));
set('calcBreakdownTitle', ui('Hesap dökümü', 'Breakdown', 'Aufschlüsselung', 'Détail', 'Desglose', 'التفصيل', 'Dettaglio', '明细', 'Разбивка', 'جزئیات', '内訳', 'Detalhamento', 'Uitsplitsing'));
set('calcEstimatedNet', ui('Tahmini net / sonuç', 'Estimated net / result', 'Geschätztes Netto / Ergebnis', 'Net estimé / résultat', 'Neto estimado / resultado', 'صافي تقديري / نتيجة', 'Netto stimato / risultato', '估净额/结果', 'Оценочный нетто / итог', 'برآورد خالص / نتیجه', '概算ネット/結果', 'Líquido estimado / resultado', 'Geschat netto / resultaat'));
set('calcAsOfNotice', ui(
  'Mevzuat parametreleri: {{date}} itibarıyla günceldir (yerel tablo).',
  'Rate table as of {{date}} (local static table).',
  'Parametersatz Stand {{date}} (lokale Tabelle).',
  'Paramètres au {{date}} (table locale).',
  'Parámetros a {{date}} (tabla local).',
  'معاملات اعتباراً من {{date}} (جدول محلي).',
  'Parametri al {{date}} (tabella locale).',
  '参数截至{{date}}（本地表）。',
  'Параметры на {{date}} (локальная таблица).',
  'پارامترها از {{date}} (جدول محلی).',
  'パラメータ基準日 {{date}}（ローカル表）。',
  'Parâmetros em {{date}} (tabela local).',
  'Parameters per {{date}} (lokale tabel).'
));
set('calcRateTableSourceNote', ui(
  'P0 yer tutucu oranlar — mağaza yayını öncesi hukuki doğrulama gerekir.',
  'P0 placeholder rates — legal verification required before store release.',
  'P0-Platzhalter — vor Store-Release rechtlich prüfen.',
  'Taux P0 provisoire — vérification juridique avant publication.',
  'Tasas P0 provisionales — verificar legalmente antes de publicar.',
  'معدلات P0 مؤقتة — يلزم التحقق القانوني قبل النشر.',
  'Tassi P0 provvisori — verifica legale prima dello store.',
  'P0占位费率—上架前需法律核验。',
  'P0-заглушки — юридическая проверка перед релизом.',
  'نرخ‌های موقت P0 — قبل از انتشار تأیید حقوقی لازم است.',
  'P0仮レート—ストア公開前に法的確認が必要。',
  'Taxas P0 provisórias — verificação legal antes da loja.',
  'P0-plaats­houders — juridische check vóór store-release.'
));
set('calcDisclaimer', ui(
  'Bilgilendirme amaçlı hesaplamadır; resmi bordro/bilirkişi raporu yerine geçmez.',
  'For information only; not an official payroll or expert report.',
  'Nur zur Information; kein offizielles Gehalts-/Gutachten.',
  'À titre informatif ; ne remplace pas une fiche de paie / expertise.',
  'Solo informativo; no sustituye nómina oficial ni pericia.',
  'للمعلومات فقط؛ لا يحل محل كشف رواتب/تقرير خبير رسمي.',
  'Solo informativo; non sostituisce busta paga ufficiale o perizia.',
  '仅供参考；不能替代正式工资单或鉴定报告。',
  'Только для сведения; не заменяет официальный расчёт/экспертизу.',
  'فقط اطلاع‌رسانی؛ جایگزین فیش رسمی یا کارشناسی نیست.',
  '参考情報です。公式給与計算や鑑定の代替ではありません。',
  'Apenas informativo; não substitui folha oficial ou perícia.',
  'Alleen ter informatie; geen officieel loonstrookje of expertise.'
));
set('calcFootnoteSeverance', ui(
  'Kanuni dayanak (özet): 1475 s. İş K. m.14 / kıdem tavanı + damga vergisi oranı — yerel tablo.',
  'Türkiye: 1475 s. İş K. m.14 (Turkish Labour Act) — severance cap + stamp tax, local table.',
  'Türkiye: 1475 s. İş K. m.14 (türk. Arbeitsgesetz) — Abfindungsdeckel + Stempelsteuer, lokale Tabelle.',
  'Türkiye : 1475 s. İş K. m.14 (loi turque du travail) — plafond + droit de timbre, table locale.',
  'Türkiye: 1475 s. İş K. m.14 (ley laboral turca) — tope + timbre, tabla local.',
  'Türkiye: 1475 s. İş K. m.14 (قانون العمل التركي) — سقف + دمغة، جدول محلي.',
  'Türkiye: 1475 s. İş K. m.14 (legge turca sul lavoro) — tetto + bollo, tabella locale.',
  'Türkiye：1475 s. İş K. m.14（土耳其劳动法）—上限+印花税，本地表。',
  'Türkiye: 1475 s. İş K. m.14 (Закон о труде Турции) — потолок + гербовый сбор, локальная таблица.',
  'Türkiye: 1475 s. İş K. m.14 (قانون کار ترکیه) — سقف + تمبر، جدول محلی.',
  'Türkiye：1475 s. İş K. m.14（トルコ労働法）—上限＋印紙税、ローカル表。',
  'Türkiye: 1475 s. İş K. m.14 (lei laboral turca) — teto + selo, tabela local.',
  'Türkiye: 1475 s. İş K. m.14 (Turkse arbeidswet) — plafond + zegelrecht, lokale tabel.'
));
set('calcFootnoteRent', ui(
  'Kanuni dayanak (özet): konut kira artışında yasal/TÜFE tavanı — kullanıcı girdisi ile yerel karşılaştırma.',
  'Türkiye: residential rent increase vs TÜFE / statutory cap — local compare from your inputs.',
  'Türkiye: Wohnmietsteigerung vs TÜFE / gesetzlicher Deckel — lokaler Vergleich aus Ihren Eingaben.',
  'Türkiye : hausse de loyer d’habitation vs TÜFE / plafond légal — comparaison locale.',
  'Türkiye: aumento de alquiler residencial vs TÜFE / tope legal — comparación local.',
  'Türkiye: زيادة إيجار السكن مقابل TÜFE / السقف القانوني — مقارنة محلية.',
  'Türkiye: aumento affitto abitativo vs TÜFE / tetto legale — confronto locale.',
  'Türkiye：住宅租金涨幅对比 TÜFE / 法定上限—按输入本地比较。',
  'Türkiye: рост жилой аренды vs TÜFE / законный потолок — локальное сравнение.',
  'Türkiye: افزایش اجاره مسکونی در برابر TÜFE / سقف قانونی — مقایسه محلی.',
  'Türkiye：住居賃料の値上げと TÜFE／法定上限—入力でローカル比較。',
  'Türkiye: reajuste de renda residencial vs TÜFE / teto legal — comparação local.',
  'Türkiye: woonhuurverhoging vs TÜFE / wettelijk plafond — lokale vergelijking.'
));
set('calcFootnoteInterest', ui(
  'Formül notu (tahmini): (Anapara × Oran × Gün) / (365 × 100). İcra kesin tutarı değildir.',
  'Türkiye: statutory legal/commercial rate table; formula (estimated) (Principal × Rate × Days) / (365 × 100). Not an exact enforcement amount.',
  'Türkiye: gesetzliche Zins-/Handelszinstabelle; Formel (Schätzung) (Kapital × Satz × Tage) / (365 × 100). Kein exakter Vollstreckungsbetrag.',
  'Türkiye : table des taux légal/commercial ; formule (est.) (Capital × Taux × Jours) / (365 × 100). Pas un montant d’exécution exact.',
  'Türkiye: tabla de interés legal/comercial; fórmula (est.) (Capital × Tasa × Días) / (365 × 100). No es cifra ejecutiva exacta.',
  'Türkiye: جدول الفائدة القانونية/التجارية؛ الصيغة (تقدير) (الأصل × النسبة × الأيام) / (365 × 100). ليس مبلغ تنفيذ دقيق.',
  'Türkiye: tabella interessi legali/commerciali; formula (stima) (Capitale × Tasso × Giorni) / (365 × 100). Non cifra esecutiva esatta.',
  'Türkiye：法定/商事利率表；公式（估算）(本金×利率×天数)/(365×100)。非强制执行精确额。',
  'Türkiye: таблица законных/коммерческих ставок; формула (оценка) (Сумма × Ставка × Дни) / (365 × 100). Не точная исполнительная сумма.',
  'Türkiye: جدول نرخ بهره قانونی/تجاری؛ فرمول (برآورد) (اصل × نرخ × روز) / (۳۶۵ × ۱۰۰). رقم قطعی اجرا نیست.',
  'Türkiye：法定・商事利率表；計算式（概算）(元本×利率×日数)/(365×100)。執行確定額ではありません。',
  'Türkiye: tabela de juros legais/comerciais; fórmula (est.) (Principal × Taxa × Dias) / (365 × 100). Não é valor executivo exato.',
  'Türkiye: tabel wettelijke/handelsrente; formule (schatting) (Hoofdsom × Tarief × Dagen) / (365 × 100). Geen exacte executoriale som.'
));
set('calcRentOverCap', ui(
  'Önerilen kira, girilen tavan oranın üzerinde görünüyor.',
  'Proposed rent appears above the entered cap rate.',
  'Vorgeschlagene Miete scheint über dem Deckel.',
  'Le loyer proposé semble au-dessus du plafond.',
  'La renta propuesta parece superar el tope.',
  'الإيجار المقترح يبدو فوق السقف المدخل.',
  'L’affitto proposto sembra sopra il tetto.',
  '拟议租金似乎高于所填上限。',
  'Предложенная аренда выше введённого потолка.',
  'اجاره پیشنهادی بالاتر از سقف واردشده به نظر می‌رسد.',
  '提案賃料は入力上限を超えている可能性があります。',
  'A renda proposta parece acima do teto informado.',
  'Voorgestelde huur lijkt boven het ingevoerde plafond.'
));
set('calcAskAdvisorPrompt', ui(
  'Bu hesap dökümünü hukuki bağlamda yorumlar mısın? (Tahmini yerel hesap — kesin bordro değil.)',
  'Please comment on this calculation in legal context. (Local estimate — not official payroll.)',
  'Bitte kommentieren Sie diese Berechnung rechtlich. (Lokale Schätzung — keine offizielle Abrechnung.)',
  'Commentez ce calcul dans un contexte juridique. (Estimation locale — pas une fiche officielle.)',
  'Comente este cálculo en contexto legal. (Estimación local — no es nómina oficial.)',
  'علّق على هذا الحساب في سياق قانوني. (تقدير محلي — ليس كشف رواتب رسمي.)',
  'Commenta questo calcolo in contesto legale. (Stima locale — non busta paga ufficiale.)',
  '请从法律语境评论此计算。（本地估算—非正式工资单。）',
  'Прокомментируйте расчёт в правовом контексте. (Локальная оценка — не официальный расчёт.)',
  'این محاسبه را در بستر حقوقی توضیح بده. (برآورد محلی — فیش رسمی نیست.)',
  'この計算を法的文脈で解説してください。（ローカル概算・公式給与ではありません。）',
  'Comente este cálculo em contexto jurídico. (Estimativa local — não é folha oficial.)',
  'Geef juridische duiding bij deze berekening. (Lokale schatting — geen officieel loonstrookje.)'
));

set('calcLabelMonthlyBase', ui('Aylık matrah (tavanlı)', 'Monthly base (capped)', 'Monatsbasis (gedeckelt)', 'Base mensuelle (plafonnée)', 'Base mensual (con tope)', 'الأساس الشهري (بسقف)', 'Base mensile (con tetto)', '月基数（上限后）', 'Месячная база (с потолком)', 'پایه ماهانه (سقف‌دار)', '月額基礎（上限後）', 'Base mensal (com teto)', 'Maandbasis (met plafond)'));
set('calcLabelCapApplied', ui('Uygulanan kıdem tavanı', 'Severance cap applied', 'Abfindungsdeckel angewendet', 'Plafond appliqué', 'Tope aplicado', 'السقف المُطبَّق', 'Tetto applicato', '已用上限', 'Применён потолок', 'سقف اعمال‌شده', '適用上限', 'Teto aplicado', 'Plafond toegepast'));
set('calcLabelGrossSeverance', ui('Brüt kıdem', 'Gross severance', 'Brutto-Abfindung', 'Indemnité brute', 'Indemnización bruta', 'المكافأة الإجمالية', 'Indennità lorda', '税前遣散', 'Валовое пособие', 'سنوات ناخالص', '総遣散額', 'Rescisão bruta', 'Bruto ontslagvergoeding'));
set('calcLabelStampTax', ui('Damga vergisi', 'Stamp tax', 'Stempelsteuer', 'Droit de timbre', 'Impuesto de timbre', 'ضريبة الدمغة', 'Imposta di bollo', '印花税', 'Гербовый сбор', 'مالیات تمبر', '印紙税', 'Imposto de selo', 'Zegelrecht'));
set('calcLabelNetSeverance', ui('Net kıdem (tahmini)', 'Net severance (est.)', 'Netto-Abfindung (Schätzung)', 'Indemnité nette (est.)', 'Indemnización neta (est.)', 'صافي المكافأة (تقدير)', 'Indennità netta (stima)', '税后遣散（估）', 'Чистое пособие (оценка)', 'سنوات خالص (برآورد)', '手取り遣散（概算）', 'Rescisão líquida (est.)', 'Netto ontslagvergoeding (schatting)'));
set('calcLabelNoticePay', ui('Tahmini ihbar (1 ay)', 'Estimated notice (1 mo)', 'Geschätzte Kündigungsfrist (1 Mon.)', 'Préavis estimé (1 mois)', 'Preaviso estimado (1 mes)', 'إنذار تقديري (شهر)', 'Preavviso stimato (1 mese)', '估通知（1个月）', 'Оценённый срок (1 мес.)', 'اخطار برآوردی (۱ ماه)', '予告概算（1か月）', 'Aviso estimado (1 mês)', 'Geschatte opzeg (1 mnd)'));
set('calcLabelCurrentRent', ui('Mevcut kira', 'Current rent', 'Aktuelle Miete', 'Loyer actuel', 'Renta actual', 'الإيجار الحالي', 'Affitto attuale', '当前租金', 'Текущая аренда', 'اجاره فعلی', '現行賃料', 'Renda atual', 'Huidige huur'));
set('calcLabelProposedRent', ui('Önerilen kira', 'Proposed rent', 'Vorgeschlagene Miete', 'Loyer proposé', 'Renta propuesta', 'الإيجار المقترح', 'Affitto proposto', '拟议租金', 'Предложенная аренда', 'اجاره پیشنهادی', '提案賃料', 'Renda proposta', 'Voorgestelde huur'));
set('calcLabelMaxAllowed', ui('Tavanlı azami kira', 'Max allowed rent', 'Maximal erlaubte Miete', 'Loyer max autorisé', 'Renta máxima permitida', 'أقصى إيجار مسموح', 'Affitto massimo consentito', '允许最高租金', 'Макс. допустимая аренда', 'حداکثر اجاره مجاز', '許容上限賃料', 'Renda máxima permitida', 'Maximaal toegestane huur'));
set('calcLabelDifference', ui('Fark (önerilen − azami)', 'Difference (proposed − max)', 'Differenz (Vorschlag − Max)', 'Écart (proposé − max)', 'Diferencia (propuesta − máx)', 'الفرق (مقترح − أقصى)', 'Differenza (proposto − max)', '差额（拟议−上限）', 'Разница (предл. − макс.)', 'تفاوت (پیشنهاد − حداکثر)', '差額（提案−上限）', 'Diferença (proposta − máx)', 'Verschil (voorstel − max)'));
set('calcLabelPrincipal', ui('Anapara', 'Principal', 'Kapital', 'Capital', 'Capital', 'أصل المبلغ', 'Capitale', '本金', 'Основная сумма', 'اصل', '元本', 'Principal', 'Hoofdsom'));
set('calcLabelDays', ui('Gün sayısı', 'Day count', 'Anzahl Tage', 'Nombre de jours', 'Número de días', 'عدد الأيام', 'Numero di giorni', '天数', 'Число дней', 'تعداد روز', '日数', 'Número de dias', 'Aantal dagen'));
set('calcLabelInterestRate', ui('Yıllık oran', 'Annual rate', 'Jahreszins', 'Taux annuel', 'Tasa anual', 'النسبة السنوية', 'Tasso annuo', '年利率', 'Годовая ставка', 'نرخ سالانه', '年利率', 'Taxa anual', 'Jaarlijks tarief'));
set('calcLabelInterest', ui('Tahmini faiz', 'Estimated interest', 'Geschätzte Zinsen', 'Intérêts estimés', 'Interés estimado', 'فائدة تقديرية', 'Interessi stimati', '估利息', 'Оценочный процент', 'بهره برآوردی', '概算利息', 'Juros estimados', 'Geschatte rente'));
set('calcLabelTotal', ui('Tahmini toplam', 'Estimated total', 'Geschätzte Summe', 'Total estimé', 'Total estimado', 'الإجمالي التقديري', 'Totale stimato', '估合计', 'Оценочный итог', 'جمع برآوردی', '概算合計', 'Total estimado', 'Geschat totaal'));

const out = {};
for (const lang of langs) {
  out[lang] = {};
  for (const key of Object.keys(T)) {
    out[lang][key] = T[key][lang] || T[key].en;
  }
}
const file = `// WAVE CB — Deterministic calculators. Same key set in all 13 languages.\n\nexport const WAVE_CB_I18N = ${JSON.stringify(out, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'i18n.wavecb.js'), file, 'utf8');
console.log('Wrote i18n.wavecb.js keys=', Object.keys(T).length, 'langs=', langs.length);
