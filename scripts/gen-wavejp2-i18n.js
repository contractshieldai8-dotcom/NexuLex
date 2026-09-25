// WAVE JP.2 — Jurisdiction availability, universal calculators, universal letters.
// Run: node scripts/gen-wavejp2-i18n.js
const fs = require('fs');
const path = require('path');

const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const T = {};
function set(key, byLang) {
  if (T[key]) throw new Error(`duplicate key ${key}`);
  T[key] = byLang;
}
const ui = (tr, en, de, fr, es, ar, it, zh, ru, fa, ja, pt, nl) => ({
  tr, en, de, fr, es, ar, it, zh, ru, fa, ja, pt, nl,
});

// --- Availability ----------------------------------------------------------------
set('availPendingBadge', ui('Doğrulama bekliyor', 'Awaiting verification', 'Prüfung ausstehend', 'Vérification en cours', 'Pendiente de verificación', 'بانتظار التحقق', 'In attesa di verifica', '等待核实', 'Ожидает проверки', 'در انتظار تأیید', '確認待ち', 'A aguardar verificação', 'Wacht op controle'));
set('availPendingToast', ui(
  'Bu araç bu ülke için doğrulanıyor; hazır olduğunda açılacak.',
  'This tool is being verified for this country. It will open once it is ready.',
  'Dieses Werkzeug wird für dieses Land geprüft und öffnet sich, sobald es bereit ist.',
  'Cet outil est en cours de vérification pour ce pays. Il s’ouvrira dès qu’il sera prêt.',
  'Esta herramienta se está verificando para este país. Se abrirá cuando esté lista.',
  'يجري التحقق من هذه الأداة لهذا البلد، وستُفتح عندما تصبح جاهزة.',
  'Questo strumento è in fase di verifica per questo paese. Si aprirà quando sarà pronto.',
  '该工具正在针对此国家进行核实，准备就绪后即可打开。',
  'Этот инструмент проверяется для данной страны и откроется, когда будет готов.',
  'این ابزار برای این کشور در حال بررسی است و پس از آماده شدن باز می‌شود.',
  'このツールはこの国向けに確認中です。準備が整い次第ご利用いただけます。',
  'Esta ferramenta está a ser verificada para este país. Abrirá quando estiver pronta.',
  'Deze tool wordt voor dit land gecontroleerd en opent zodra hij klaar is.'
));
set('availPendingLine', ui(
  '{{country}} için özel araçlar hazırlanıyor.',
  'Tools specific to {{country}} are being prepared.',
  'Spezielle Werkzeuge für {{country}} werden vorbereitet.',
  'Des outils propres à {{country}} sont en préparation.',
  'Se están preparando herramientas específicas para {{country}}.',
  'يجري إعداد أدوات خاصة بـ {{country}}.',
  'Sono in preparazione strumenti specifici per {{country}}.',
  '针对{{country}}的专属工具正在准备中。',
  'Инструменты для страны {{country}} готовятся.',
  'ابزارهای ویژه {{country}} در حال آماده‌سازی است.',
  '{{country}}向けの専用ツールを準備中です。',
  'Estão a ser preparadas ferramentas específicas para {{country}}.',
  'Er worden speciale tools voor {{country}} voorbereid.'
));
set('availUniversal', ui('Evrensel', 'Universal', 'Universell', 'Universel', 'Universal', 'عالمي', 'Universale', '通用', 'Универсальный', 'جهانی', '汎用', 'Universal', 'Universeel'));
set('jpSourceOfficialPortal', ui(
  'Resmî mevzuat portalı',
  'Official legislation portal',
  'Amtliches Gesetzesportal',
  'Portail officiel de la législation',
  'Portal oficial de legislación',
  'البوابة الرسمية للتشريعات',
  'Portale ufficiale della normativa',
  '官方法规门户',
  'Официальный портал законодательства',
  'درگاه رسمی قوانین',
  '公式法令ポータル',
  'Portal oficial de legislação',
  'Officieel wetgevingsportaal'
));

// --- Universal calculators: titles --------------------------------------------------
set('calcDeadlineTitle', ui('Süre / son gün', 'Deadline date', 'Fristende', 'Date d’échéance', 'Fecha límite', 'تاريخ انتهاء المهلة', 'Data di scadenza', '期限日期', 'Дата окончания срока', 'تاریخ پایان مهلت', '期限日', 'Data-limite', 'Einddatum termijn'));
set('calcDeadlineDesc', ui(
  'Bir tarihe gün, hafta veya ay ekler; isterseniz yalnızca iş günü sayar.',
  'Adds days, weeks or months to a date; can count business days only.',
  'Addiert Tage, Wochen oder Monate zu einem Datum; auf Wunsch nur Werktage.',
  'Ajoute des jours, semaines ou mois à une date ; option jours ouvrés.',
  'Suma días, semanas o meses a una fecha; opción de solo días hábiles.',
  'يضيف أيامًا أو أسابيع أو أشهرًا إلى تاريخ، مع خيار أيام العمل فقط.',
  'Aggiunge giorni, settimane o mesi a una data; opzione solo giorni lavorativi.',
  '在日期上加上天、周或月；可选仅计工作日。',
  'Прибавляет дни, недели или месяцы к дате; можно считать только рабочие дни.',
  'روز، هفته یا ماه را به یک تاریخ اضافه می‌کند؛ امکان شمارش فقط روزهای کاری.',
  '日付に日・週・月を加算します。営業日のみの計算も可能です。',
  'Soma dias, semanas ou meses a uma data; opção só dias úteis.',
  'Telt dagen, weken of maanden op bij een datum; optioneel alleen werkdagen.'
));
set('calcProRataTitle', ui('Kıst (orantılı) tutar', 'Pro-rata amount', 'Anteiliger Betrag', 'Montant au prorata', 'Importe prorrateado', 'المبلغ النسبي', 'Importo pro rata', '按比例金额', 'Пропорциональная сумма', 'مبلغ تناسبی', '日割り金額', 'Montante proporcional', 'Naar rato bedrag'));
set('calcProRataDesc', ui(
  'Bir dönem tutarını kullanılan gün sayısına göre böler.',
  'Splits a period amount by the number of days used.',
  'Teilt einen Periodenbetrag nach den genutzten Tagen auf.',
  'Répartit le montant d’une période selon les jours utilisés.',
  'Reparte el importe de un periodo según los días utilizados.',
  'يقسم مبلغ الفترة حسب عدد الأيام المستخدمة.',
  'Ripartisce l’importo di un periodo in base ai giorni utilizzati.',
  '按实际使用天数分摊一个周期的金额。',
  'Делит сумму за период по числу использованных дней.',
  'مبلغ یک دوره را بر اساس روزهای استفاده‌شده تقسیم می‌کند.',
  '期間の金額を利用日数で按分します。',
  'Reparte o montante de um período pelos dias utilizados.',
  'Verdeelt het bedrag van een periode naar het aantal gebruikte dagen.'
));
set('calcPercentTitle', ui('Yüzde değişim', 'Percentage change', 'Prozentuale Änderung', 'Variation en pourcentage', 'Variación porcentual', 'التغير بالنسبة المئوية', 'Variazione percentuale', '百分比变化', 'Изменение в процентах', 'تغییر درصدی', '変化率', 'Variação percentual', 'Procentuele wijziging'));
set('calcPercentDesc', ui(
  'Eski ve yeni değer arasındaki yüzdeyi bulur veya bir yüzdeyi uygular.',
  'Finds the percentage between two values, or applies a percentage.',
  'Ermittelt den Prozentsatz zwischen zwei Werten oder wendet einen Prozentsatz an.',
  'Calcule le pourcentage entre deux valeurs ou applique un pourcentage.',
  'Calcula el porcentaje entre dos valores o aplica un porcentaje.',
  'يحسب النسبة المئوية بين قيمتين أو يطبّق نسبة مئوية.',
  'Calcola la percentuale tra due valori o applica una percentuale.',
  '计算两个数值之间的百分比，或按百分比推算新值。',
  'Находит процент между двумя значениями или применяет процент.',
  'درصد بین دو مقدار را محاسبه می‌کند یا یک درصد را اعمال می‌کند.',
  '2つの値の変化率を求めるか、率を適用して新しい値を出します。',
  'Calcula a percentagem entre dois valores ou aplica uma percentagem.',
  'Berekent het percentage tussen twee waarden of past een percentage toe.'
));
set('calcInstallmentTitle', ui('Taksit planı', 'Installment plan', 'Ratenplan', 'Échéancier', 'Plan de pagos', 'خطة التقسيط', 'Piano rateale', '分期计划', 'План рассрочки', 'برنامه اقساط', '分割払い計画', 'Plano de prestações', 'Afbetalingsplan'));
set('calcInstallmentDesc', ui(
  'Toplam tutarı haftalık veya aylık taksitlere böler; uzlaşma önerisi olarak paylaşılabilir.',
  'Splits a total into weekly or monthly payments; shareable as a payment proposal.',
  'Teilt einen Gesamtbetrag in wöchentliche oder monatliche Raten; als Zahlungsvorschlag teilbar.',
  'Divise un total en versements hebdomadaires ou mensuels ; partageable comme proposition.',
  'Divide un total en pagos semanales o mensuales; se puede compartir como propuesta.',
  'يقسم المبلغ الإجمالي إلى دفعات أسبوعية أو شهرية، ويمكن مشاركته كعرض سداد.',
  'Divide un totale in rate settimanali o mensili; condivisibile come proposta di pagamento.',
  '将总额拆分为每周或每月付款，可作为还款方案分享。',
  'Делит общую сумму на еженедельные или ежемесячные платежи; можно отправить как предложение.',
  'مبلغ کل را به اقساط هفتگی یا ماهانه تقسیم می‌کند؛ قابل ارسال به‌عنوان پیشنهاد پرداخت.',
  '総額を毎週または毎月の支払いに分割し、支払い提案として共有できます。',
  'Divide um total em pagamentos semanais ou mensais; partilhável como proposta.',
  'Verdeelt een totaal in wekelijkse of maandelijkse termijnen; te delen als betalingsvoorstel.'
));
set('calcPenaltyTitle', ui('Cezai şart oranı', 'Penalty ratio', 'Vertragsstrafe im Verhältnis', 'Ratio de pénalité', 'Proporción de la penalización', 'نسبة الغرامة', 'Rapporto della penale', '违约金比例', 'Доля неустойки', 'نسبت وجه التزام', '違約金の割合', 'Rácio da penalização', 'Verhouding boete'));
set('calcPenaltyDesc', ui(
  'Cezanın sözleşme bedeline oranını gösterir; geçerlilik değerlendirmesi yapmaz.',
  'Shows a penalty as a share of the contract value; no enforceability judgement.',
  'Zeigt die Strafe als Anteil am Vertragswert; keine Bewertung der Wirksamkeit.',
  'Indique la pénalité en part de la valeur du contrat ; sans avis sur sa validité.',
  'Muestra la penalización como parte del valor del contrato; sin valorar su validez.',
  'يعرض الغرامة كنسبة من قيمة العقد، دون تقييم لمدى نفاذها.',
  'Mostra la penale come quota del valore del contratto; nessun giudizio di validità.',
  '显示违约金占合同金额的比例，不评估其是否有效。',
  'Показывает неустойку как долю от цены договора, без оценки её действительности.',
  'نسبت جریمه به ارزش قرارداد را نشان می‌دهد؛ درباره اعتبار آن نظر نمی‌دهد.',
  '違約金が契約金額に占める割合を示します。有効性の判断は行いません。',
  'Mostra a penalização como parte do valor do contrato; sem juízo sobre validade.',
  'Toont de boete als aandeel van de contractwaarde; geen oordeel over afdwingbaarheid.'
));

// --- Universal calculators: inputs ---------------------------------------------------
set('calcDeadlineAmount', ui('Eklenecek süre', 'Amount of time to add', 'Hinzuzufügende Zeit', 'Durée à ajouter', 'Tiempo que se suma', 'المدة المراد إضافتها', 'Tempo da aggiungere', '要加上的时长', 'Сколько прибавить', 'مدتی که اضافه می‌شود', '加算する期間', 'Tempo a somar', 'Toe te voegen tijd'));
set('calcUnitDays', ui('Gün', 'Days', 'Tage', 'Jours', 'Días', 'أيام', 'Giorni', '天', 'Дни', 'روز', '日', 'Dias', 'Dagen'));
set('calcUnitWeeks', ui('Hafta', 'Weeks', 'Wochen', 'Semaines', 'Semanas', 'أسابيع', 'Settimane', '周', 'Недели', 'هفته', '週', 'Semanas', 'Weken'));
set('calcUnitMonths', ui('Ay', 'Months', 'Monate', 'Mois', 'Meses', 'أشهر', 'Mesi', '月', 'Месяцы', 'ماه', '月', 'Meses', 'Maanden'));
set('calcBusinessDays', ui(
  'Yalnızca iş günleri (Cumartesi–Pazar hariç)',
  'Business days only (skip Saturday and Sunday)',
  'Nur Werktage (ohne Samstag und Sonntag)',
  'Jours ouvrés uniquement (sans samedi ni dimanche)',
  'Solo días hábiles (sin sábado ni domingo)',
  'أيام العمل فقط (باستثناء السبت والأحد)',
  'Solo giorni lavorativi (esclusi sabato e domenica)',
  '仅工作日（跳过周六、周日）',
  'Только рабочие дни (без субботы и воскресенья)',
  'فقط روزهای کاری (بدون شنبه و یکشنبه)',
  '営業日のみ（土日を除く）',
  'Só dias úteis (sem sábado e domingo)',
  'Alleen werkdagen (zonder zaterdag en zondag)'
));
set('calcProRataAmount', ui('Tam dönem tutarı ({{currency}})', 'Amount for the full period ({{currency}})', 'Betrag für den ganzen Zeitraum ({{currency}})', 'Montant de la période complète ({{currency}})', 'Importe del periodo completo ({{currency}})', 'مبلغ الفترة الكاملة ({{currency}})', 'Importo per l’intero periodo ({{currency}})', '整个周期的金额（{{currency}}）', 'Сумма за весь период ({{currency}})', 'مبلغ کل دوره ({{currency}})', '期間全体の金額（{{currency}}）', 'Montante do período completo ({{currency}})', 'Bedrag voor de hele periode ({{currency}})'));
set('calcProRataAmountNoCur', ui('Tam dönem tutarı', 'Amount for the full period', 'Betrag für den ganzen Zeitraum', 'Montant de la période complète', 'Importe del periodo completo', 'مبلغ الفترة الكاملة', 'Importo per l’intero periodo', '整个周期的金额', 'Сумма за весь период', 'مبلغ کل دوره', '期間全体の金額', 'Montante do período completo', 'Bedrag voor de hele periode'));
set('calcProRataDaysUsed', ui('Kullanılan gün', 'Days used', 'Genutzte Tage', 'Jours utilisés', 'Días utilizados', 'الأيام المستخدمة', 'Giorni utilizzati', '已使用天数', 'Использовано дней', 'روزهای استفاده‌شده', '利用日数', 'Dias utilizados', 'Gebruikte dagen'));
set('calcProRataDaysInPeriod', ui('Dönemdeki gün sayısı', 'Days in the period', 'Tage im Zeitraum', 'Jours dans la période', 'Días del periodo', 'عدد أيام الفترة', 'Giorni del periodo', '周期总天数', 'Дней в периоде', 'تعداد روزهای دوره', '期間の日数', 'Dias do período', 'Dagen in de periode'));
set('calcPercentModeDiff', ui('İki değeri karşılaştır', 'Compare two values', 'Zwei Werte vergleichen', 'Comparer deux valeurs', 'Comparar dos valores', 'مقارنة قيمتين', 'Confronta due valori', '比较两个数值', 'Сравнить два значения', 'مقایسه دو مقدار', '2つの値を比較', 'Comparar dois valores', 'Twee waarden vergelijken'));
set('calcPercentModeApply', ui('Yüzde uygula', 'Apply a percentage', 'Prozentsatz anwenden', 'Appliquer un pourcentage', 'Aplicar un porcentaje', 'تطبيق نسبة مئوية', 'Applica una percentuale', '按百分比计算', 'Применить процент', 'اعمال درصد', '率を適用', 'Aplicar uma percentagem', 'Percentage toepassen'));
set('calcPercentOld', ui('Eski değer', 'Old value', 'Alter Wert', 'Ancienne valeur', 'Valor anterior', 'القيمة القديمة', 'Valore precedente', '原数值', 'Старое значение', 'مقدار قبلی', '変更前の値', 'Valor anterior', 'Oude waarde'));
set('calcPercentNew', ui('Yeni değer', 'New value', 'Neuer Wert', 'Nouvelle valeur', 'Valor nuevo', 'القيمة الجديدة', 'Nuovo valore', '新数值', 'Новое значение', 'مقدار جدید', '変更後の値', 'Valor novo', 'Nieuwe waarde'));
set('calcPercentRate', ui('Yüzde (%)', 'Percentage (%)', 'Prozentsatz (%)', 'Pourcentage (%)', 'Porcentaje (%)', 'النسبة المئوية (%)', 'Percentuale (%)', '百分比（%）', 'Процент (%)', 'درصد (%)', '率（%）', 'Percentagem (%)', 'Procent (%)'));
set('calcInstallmentTotalInput', ui('Toplam tutar ({{currency}})', 'Total amount ({{currency}})', 'Gesamtbetrag ({{currency}})', 'Montant total ({{currency}})', 'Importe total ({{currency}})', 'المبلغ الإجمالي ({{currency}})', 'Importo totale ({{currency}})', '总金额（{{currency}}）', 'Общая сумма ({{currency}})', 'مبلغ کل ({{currency}})', '総額（{{currency}}）', 'Montante total ({{currency}})', 'Totaalbedrag ({{currency}})'));
set('calcInstallmentTotalInputNoCur', ui('Toplam tutar', 'Total amount', 'Gesamtbetrag', 'Montant total', 'Importe total', 'المبلغ الإجمالي', 'Importo totale', '总金额', 'Общая сумма', 'مبلغ کل', '総額', 'Montante total', 'Totaalbedrag'));
set('calcInstallmentCount', ui('Taksit sayısı', 'Number of installments', 'Anzahl der Raten', 'Nombre de versements', 'Número de pagos', 'عدد الأقساط', 'Numero di rate', '分期数', 'Количество платежей', 'تعداد اقساط', '支払回数', 'Número de prestações', 'Aantal termijnen'));
set('calcInstallmentFirstDate', ui('İlk ödeme (YYYY-AA-GG)', 'First payment (YYYY-MM-DD)', 'Erste Zahlung (JJJJ-MM-TT)', 'Premier versement (AAAA-MM-JJ)', 'Primer pago (AAAA-MM-DD)', 'الدفعة الأولى (YYYY-MM-DD)', 'Prima rata (AAAA-MM-GG)', '首次付款（YYYY-MM-DD）', 'Первый платёж (ГГГГ-ММ-ДД)', 'پرداخت اول (YYYY-MM-DD)', '初回支払日（YYYY-MM-DD）', 'Primeiro pagamento (AAAA-MM-DD)', 'Eerste betaling (JJJJ-MM-DD)'));
set('calcIntervalWeekly', ui('Haftalık', 'Weekly', 'Wöchentlich', 'Hebdomadaire', 'Semanal', 'أسبوعي', 'Settimanale', '每周', 'Еженедельно', 'هفتگی', '毎週', 'Semanal', 'Wekelijks'));
set('calcIntervalMonthly', ui('Aylık', 'Monthly', 'Monatlich', 'Mensuel', 'Mensual', 'شهري', 'Mensile', '每月', 'Ежемесячно', 'ماهانه', '毎月', 'Mensal', 'Maandelijks'));
set('calcPenaltyAmountInput', ui('Ceza tutarı ({{currency}})', 'Penalty amount ({{currency}})', 'Höhe der Strafe ({{currency}})', 'Montant de la pénalité ({{currency}})', 'Importe de la penalización ({{currency}})', 'مبلغ الغرامة ({{currency}})', 'Importo della penale ({{currency}})', '违约金金额（{{currency}}）', 'Размер неустойки ({{currency}})', 'مبلغ جریمه ({{currency}})', '違約金額（{{currency}}）', 'Valor da penalização ({{currency}})', 'Hoogte van de boete ({{currency}})'));
set('calcPenaltyAmountInputNoCur', ui('Ceza tutarı', 'Penalty amount', 'Höhe der Strafe', 'Montant de la pénalité', 'Importe de la penalización', 'مبلغ الغرامة', 'Importo della penale', '违约金金额', 'Размер неустойки', 'مبلغ جریمه', '違約金額', 'Valor da penalização', 'Hoogte van de boete'));
set('calcContractValueInput', ui('Sözleşme bedeli ({{currency}})', 'Contract value ({{currency}})', 'Vertragswert ({{currency}})', 'Valeur du contrat ({{currency}})', 'Valor del contrato ({{currency}})', 'قيمة العقد ({{currency}})', 'Valore del contratto ({{currency}})', '合同金额（{{currency}}）', 'Цена договора ({{currency}})', 'ارزش قرارداد ({{currency}})', '契約金額（{{currency}}）', 'Valor do contrato ({{currency}})', 'Contractwaarde ({{currency}})'));
set('calcContractValueInputNoCur', ui('Sözleşme bedeli', 'Contract value', 'Vertragswert', 'Valeur du contrat', 'Valor del contrato', 'قيمة العقد', 'Valore del contratto', '合同金额', 'Цена договора', 'ارزش قرارداد', '契約金額', 'Valor do contrato', 'Contractwaarde'));
set('calcInvalidDateSingle', ui(
  'Geçerli bir tarih girin (YYYY-AA-GG).',
  'Enter a valid date (YYYY-MM-DD).',
  'Geben Sie ein gültiges Datum ein (JJJJ-MM-TT).',
  'Saisissez une date valide (AAAA-MM-JJ).',
  'Introduzca una fecha válida (AAAA-MM-DD).',
  'أدخل تاريخًا صحيحًا (YYYY-MM-DD).',
  'Inserisci una data valida (AAAA-MM-GG).',
  '请输入有效日期（YYYY-MM-DD）。',
  'Введите корректную дату (ГГГГ-ММ-ДД).',
  'یک تاریخ معتبر وارد کنید (YYYY-MM-DD).',
  '有効な日付を入力してください（YYYY-MM-DD）。',
  'Introduza uma data válida (AAAA-MM-DD).',
  'Voer een geldige datum in (JJJJ-MM-DD).'
));

// --- Universal calculators: result rows ----------------------------------------------
set('calcLabelStartDate', ui('Başlangıç tarihi', 'Start date', 'Startdatum', 'Date de départ', 'Fecha de inicio', 'تاريخ البدء', 'Data di inizio', '起始日期', 'Дата начала', 'تاریخ شروع', '開始日', 'Data de início', 'Begindatum'));
set('calcLabelAdded', ui('Eklenen süre', 'Added', 'Hinzugefügt', 'Ajouté', 'Añadido', 'المدة المضافة', 'Aggiunto', '加上', 'Прибавлено', 'اضافه‌شده', '加算', 'Somado', 'Toegevoegd'));
set('calcLabelEndDate', ui('Son gün', 'End date', 'Enddatum', 'Date de fin', 'Fecha final', 'تاريخ الانتهاء', 'Data finale', '截止日期', 'Дата окончания', 'تاریخ پایان', '期限日', 'Data final', 'Einddatum'));
set('calcLabelWeekday', ui('Haftanın günü', 'Weekday', 'Wochentag', 'Jour de la semaine', 'Día de la semana', 'يوم الأسبوع', 'Giorno della settimana', '星期', 'День недели', 'روز هفته', '曜日', 'Dia da semana', 'Weekdag'));
set('calcAddedDays', ui('{{count}} gün', '{{count}} days', '{{count}} Tage', '{{count}} jours', '{{count}} días', '{{count}} يوم', '{{count}} giorni', '{{count}} 天', '{{count}} дн.', '{{count}} روز', '{{count}} 日', '{{count}} dias', '{{count}} dagen'));
set('calcAddedBusinessDays', ui('{{count}} iş günü', '{{count}} business days', '{{count}} Werktage', '{{count}} jours ouvrés', '{{count}} días hábiles', '{{count}} يوم عمل', '{{count}} giorni lavorativi', '{{count}} 个工作日', '{{count}} раб. дн.', '{{count}} روز کاری', '{{count}} 営業日', '{{count}} dias úteis', '{{count}} werkdagen'));
set('calcAddedWeeks', ui('{{count}} hafta', '{{count}} weeks', '{{count}} Wochen', '{{count}} semaines', '{{count}} semanas', '{{count}} أسبوع', '{{count}} settimane', '{{count}} 周', '{{count}} нед.', '{{count}} هفته', '{{count}} 週間', '{{count}} semanas', '{{count}} weken'));
set('calcAddedMonths', ui('{{count}} ay', '{{count}} months', '{{count}} Monate', '{{count}} mois', '{{count}} meses', '{{count}} شهر', '{{count}} mesi', '{{count}} 个月', '{{count}} мес.', '{{count}} ماه', '{{count}} か月', '{{count}} meses', '{{count}} maanden'));
set('calcLabelPeriodAmount', ui('Tam dönem tutarı', 'Full-period amount', 'Betrag ganzer Zeitraum', 'Montant période complète', 'Importe del periodo', 'مبلغ الفترة كاملة', 'Importo intero periodo', '整期金额', 'Сумма за период', 'مبلغ کل دوره', '期間全体の金額', 'Montante do período', 'Bedrag hele periode'));
set('calcLabelDaysUsed', ui('Kullanılan gün', 'Days used', 'Genutzte Tage', 'Jours utilisés', 'Días utilizados', 'الأيام المستخدمة', 'Giorni utilizzati', '已使用天数', 'Использовано дней', 'روزهای استفاده‌شده', '利用日数', 'Dias utilizados', 'Gebruikte dagen'));
set('calcLabelDaysInPeriod', ui('Dönem gün sayısı', 'Days in period', 'Tage im Zeitraum', 'Jours de la période', 'Días del periodo', 'أيام الفترة', 'Giorni del periodo', '周期天数', 'Дней в периоде', 'روزهای دوره', '期間の日数', 'Dias do período', 'Dagen in periode'));
set('calcLabelProRata', ui('Orantılı tutar', 'Pro-rata amount', 'Anteiliger Betrag', 'Montant au prorata', 'Importe prorrateado', 'المبلغ النسبي', 'Importo pro rata', '按比例金额', 'Пропорциональная сумма', 'مبلغ تناسبی', '日割り金額', 'Montante proporcional', 'Naar rato bedrag'));
set('calcLabelOldValue', ui('Eski değer', 'Old value', 'Alter Wert', 'Ancienne valeur', 'Valor anterior', 'القيمة القديمة', 'Valore precedente', '原数值', 'Старое значение', 'مقدار قبلی', '変更前', 'Valor anterior', 'Oude waarde'));
set('calcLabelNewValue', ui('Yeni değer', 'New value', 'Neuer Wert', 'Nouvelle valeur', 'Valor nuevo', 'القيمة الجديدة', 'Nuovo valore', '新数值', 'Новое значение', 'مقدار جدید', '変更後', 'Valor novo', 'Nieuwe waarde'));
set('calcLabelChangeAbs', ui('Fark', 'Change', 'Differenz', 'Écart', 'Diferencia', 'الفرق', 'Differenza', '差额', 'Разница', 'تفاوت', '差額', 'Diferença', 'Verschil'));
set('calcLabelChangePct', ui('Değişim (%)', 'Change (%)', 'Änderung (%)', 'Variation (%)', 'Variación (%)', 'التغير (%)', 'Variazione (%)', '变化（%）', 'Изменение (%)', 'تغییر (%)', '変化率（%）', 'Variação (%)', 'Wijziging (%)'));
set('calcLabelInstallmentTotal', ui('Toplam', 'Total', 'Gesamt', 'Total', 'Total', 'الإجمالي', 'Totale', '总额', 'Итого', 'مجموع', '合計', 'Total', 'Totaal'));
set('calcLabelInstallmentCount', ui('Taksit sayısı', 'Installments', 'Raten', 'Versements', 'Pagos', 'الأقساط', 'Rate', '期数', 'Платежей', 'اقساط', '回数', 'Prestações', 'Termijnen'));
set('calcLabelInstallmentRow', ui('{{n}}. taksit · {{date}}', 'Installment {{n}} · {{date}}', 'Rate {{n}} · {{date}}', 'Versement {{n}} · {{date}}', 'Pago {{n}} · {{date}}', 'القسط {{n}} · {{date}}', 'Rata {{n}} · {{date}}', '第{{n}}期 · {{date}}', 'Платёж {{n}} · {{date}}', 'قسط {{n}} · {{date}}', '第{{n}}回 · {{date}}', 'Prestação {{n}} · {{date}}', 'Termijn {{n}} · {{date}}'));
set('calcLabelPenalty', ui('Ceza', 'Penalty', 'Strafe', 'Pénalité', 'Penalización', 'الغرامة', 'Penale', '违约金', 'Неустойка', 'جریمه', '違約金', 'Penalização', 'Boete'));
set('calcLabelContractValue', ui('Sözleşme bedeli', 'Contract value', 'Vertragswert', 'Valeur du contrat', 'Valor del contrato', 'قيمة العقد', 'Valore del contratto', '合同金额', 'Цена договора', 'ارزش قرارداد', '契約金額', 'Valor do contrato', 'Contractwaarde'));
set('calcLabelPenaltyRatio', ui('Ceza / sözleşme bedeli', 'Penalty / contract value', 'Strafe / Vertragswert', 'Pénalité / valeur du contrat', 'Penalización / valor del contrato', 'الغرامة / قيمة العقد', 'Penale / valore del contratto', '违约金 / 合同金额', 'Неустойка / цена договора', 'جریمه / ارزش قرارداد', '違約金 / 契約金額', 'Penalização / valor do contrato', 'Boete / contractwaarde'));

// --- Universal calculators: footnotes ------------------------------------------------
set('calcFootnoteDeadline', ui(
  'Resmî tatiller dahil değildir. Son gün tatile denk gelirse sürenin uzayıp uzamadığını kontrol edin.',
  'Public holidays are not included. Check whether the deadline moves if it falls on a holiday.',
  'Feiertage sind nicht berücksichtigt. Prüfen Sie, ob sich die Frist verschiebt, wenn sie auf einen Feiertag fällt.',
  'Les jours fériés ne sont pas pris en compte. Vérifiez si le délai est reporté quand il tombe un jour férié.',
  'No se incluyen los festivos. Compruebe si el plazo se traslada cuando cae en festivo.',
  'العطل الرسمية غير محتسبة. تحقّق مما إذا كانت المهلة تُمدّد إذا صادف آخر يوم عطلة.',
  'Le festività non sono considerate. Verifica se il termine slitta quando cade in un giorno festivo.',
  '未计入公共假日。若截止日为假日，请核实期限是否顺延。',
  'Праздничные дни не учитываются. Проверьте, переносится ли срок, если он выпадает на праздник.',
  'تعطیلات رسمی لحاظ نشده است. بررسی کنید اگر روز آخر تعطیل باشد، مهلت تمدید می‌شود یا نه.',
  '祝日は考慮していません。期限日が祝日にあたる場合に延長されるかをご確認ください。',
  'Os feriados não estão incluídos. Verifique se o prazo passa para o dia seguinte quando calha num feriado.',
  'Feestdagen zijn niet meegerekend. Controleer of de termijn verschuift als die op een feestdag valt.'
));
set('calcFootnoteProRata', ui(
  'Günlere göre doğrusal bölüşümdür; sözleşme farklı bir yöntem öngörebilir.',
  'Straight-line split by days; your contract may set a different method.',
  'Lineare Aufteilung nach Tagen; Ihr Vertrag kann eine andere Methode vorsehen.',
  'Répartition linéaire par jours ; votre contrat peut prévoir une autre méthode.',
  'Reparto lineal por días; su contrato puede fijar otro método.',
  'تقسيم خطي حسب الأيام؛ قد ينص عقدك على طريقة مختلفة.',
  'Ripartizione lineare a giorni; il contratto può prevedere un metodo diverso.',
  '按天数直线分摊；合同可能约定了不同的方法。',
  'Линейный расчёт по дням; договор может предусматривать иной порядок.',
  'تقسیم خطی بر اساس روز است؛ ممکن است قرارداد روش دیگری تعیین کرده باشد.',
  '日数による単純按分です。契約で別の方法が定められている場合があります。',
  'Divisão linear por dias; o seu contrato pode prever outro método.',
  'Lineaire verdeling per dag; uw contract kan een andere methode voorschrijven.'
));
set('calcFootnotePercent', ui(
  'Yalnızca aritmetik hesaptır; değişikliğin hukuken izinli olup olmadığını söylemez.',
  'Arithmetic only; it does not say whether the change is allowed.',
  'Reine Rechnung; sie sagt nichts darüber, ob die Änderung zulässig ist.',
  'Calcul arithmétique uniquement ; il ne dit pas si la variation est autorisée.',
  'Solo cálculo aritmético; no indica si el cambio está permitido.',
  'حساب رياضي فقط؛ لا يبيّن ما إذا كان التغيير مسموحًا به.',
  'Solo calcolo aritmetico; non indica se la variazione è consentita.',
  '仅为算术计算，不代表该变化是否被允许。',
  'Только арифметика; расчёт не говорит, допустимо ли изменение.',
  'فقط محاسبه ریاضی است و مجاز بودن تغییر را نشان نمی‌دهد.',
  '算術計算のみです。その変更が認められるかどうかは示しません。',
  'Apenas cálculo aritmético; não indica se a alteração é permitida.',
  'Alleen een rekensom; zegt niet of de wijziging is toegestaan.'
));
set('calcFootnoteInstallment', ui(
  'Kuruş farkı son taksite eklenir. Bu planı ödeme/uzlaşma önerisi olarak paylaşabilirsiniz.',
  'Rounding is absorbed by the last installment. You can share this plan as a payment proposal.',
  'Rundungsdifferenzen trägt die letzte Rate. Sie können den Plan als Zahlungsvorschlag teilen.',
  'L’arrondi est reporté sur le dernier versement. Vous pouvez partager ce plan comme proposition de paiement.',
  'El redondeo se ajusta en el último pago. Puede compartir este plan como propuesta de pago.',
  'تُضاف فروق التقريب إلى القسط الأخير. يمكنك مشاركة هذه الخطة كعرض سداد.',
  'L’arrotondamento è assorbito dall’ultima rata. Puoi condividere il piano come proposta di pagamento.',
  '尾差计入最后一期。您可以将此计划作为还款方案分享。',
  'Разница от округления входит в последний платёж. План можно отправить как предложение об оплате.',
  'اختلاف گرد کردن در قسط آخر لحاظ می‌شود. می‌توانید این برنامه را به‌عنوان پیشنهاد پرداخت ارسال کنید.',
  '端数は最終回で調整します。この計画は支払い提案として共有できます。',
  'O arredondamento fica na última prestação. Pode partilhar este plano como proposta de pagamento.',
  'Afrondingsverschillen komen in de laatste termijn. U kunt dit plan delen als betalingsvoorstel.'
));
set('calcFootnotePenalty', ui(
  'Yalnızca aritmetik orandır; cezanın geçerli veya uygulanabilir olup olmadığını değerlendirmez.',
  'Arithmetic ratio only; it is not an assessment of whether the penalty is valid or enforceable.',
  'Reines Rechenverhältnis; keine Bewertung, ob die Strafe wirksam oder durchsetzbar ist.',
  'Simple ratio arithmétique ; ce n’est pas une appréciation de la validité de la pénalité.',
  'Solo una proporción aritmética; no valora si la penalización es válida o exigible.',
  'نسبة حسابية فقط؛ لا تقيّم ما إذا كانت الغرامة صحيحة أو قابلة للتنفيذ.',
  'Solo un rapporto aritmetico; non valuta se la penale sia valida o esigibile.',
  '仅为算术比例，不评估违约金是否有效或可执行。',
  'Только арифметическое соотношение; это не оценка действительности неустойки.',
  'فقط نسبت ریاضی است و اعتبار یا قابلیت اجرای جریمه را ارزیابی نمی‌کند.',
  '算術上の割合のみで、違約金が有効か執行可能かの判断ではありません。',
  'Apenas um rácio aritmético; não avalia se a penalização é válida ou exigível.',
  'Alleen een rekenkundige verhouding; geen oordeel of de boete geldig of afdwingbaar is.'
));

// --- Universal letters: banner + question labels -------------------------------------
set('draftUniversalBanner', ui(
  'Evrensel mektup: her ülkede kullanılabilen tarafsız metin. Kanun atfı içermez; göndermeden önce yerel kuralları kontrol edin.',
  'Universal letter: neutral wording you can use in any country. It cites no law; check local rules before sending.',
  'Universeller Brief: neutraler Text für jedes Land. Er nennt keine Gesetze; prüfen Sie vor dem Versand die örtlichen Regeln.',
  'Lettre universelle : formulation neutre utilisable dans tout pays. Elle ne cite aucune loi ; vérifiez les règles locales avant l’envoi.',
  'Carta universal: redacción neutral válida en cualquier país. No cita leyes; revise las normas locales antes de enviarla.',
  'رسالة عامة: صياغة محايدة تصلح لأي بلد. لا تستشهد بأي قانون؛ راجع القواعد المحلية قبل الإرسال.',
  'Lettera universale: testo neutro utilizzabile in ogni paese. Non cita leggi; verifica le regole locali prima dell’invio.',
  '通用信函：措辞中立，适用于任何国家。不引用任何法律；发送前请核对当地规定。',
  'Универсальное письмо: нейтральный текст для любой страны. Без ссылок на законы; перед отправкой проверьте местные правила.',
  'نامه جهانی: متن بی‌طرف و قابل استفاده در هر کشور. به هیچ قانونی استناد نمی‌کند؛ پیش از ارسال قواعد محلی را بررسی کنید.',
  '汎用レター：どの国でも使える中立的な文面です。法令は引用していません。送付前に現地のルールをご確認ください。',
  'Carta universal: redação neutra utilizável em qualquer país. Não cita leis; verifique as regras locais antes de enviar.',
  'Universele brief: neutrale tekst voor elk land. Er wordt geen wet geciteerd; controleer vóór verzending de lokale regels.'
));
set('draftQFrom', ui('Adınız (gönderen)', 'Your name (sender)', 'Ihr Name (Absender)', 'Votre nom (expéditeur)', 'Su nombre (remitente)', 'اسمك (المرسل)', 'Il tuo nome (mittente)', '您的姓名（发件人）', 'Ваше имя (отправитель)', 'نام شما (فرستنده)', 'あなたの氏名（差出人）', 'O seu nome (remetente)', 'Uw naam (afzender)'));
set('draftQTo', ui('Alıcı (ad soyad / unvan)', 'Recipient (name / company)', 'Empfänger (Name / Firma)', 'Destinataire (nom / société)', 'Destinatario (nombre / empresa)', 'المستلم (الاسم / الشركة)', 'Destinatario (nome / società)', '收件人（姓名 / 公司）', 'Получатель (имя / компания)', 'گیرنده (نام / شرکت)', '宛先（氏名・会社名）', 'Destinatário (nome / empresa)', 'Ontvanger (naam / bedrijf)'));
set('draftQContractType', ui('Sözleşme türü', 'Contract type', 'Vertragsart', 'Type de contrat', 'Tipo de contrato', 'نوع العقد', 'Tipo di contratto', '合同类型', 'Тип договора', 'نوع قرارداد', '契約の種類', 'Tipo de contrato', 'Soort contract'));
set('draftOptContractLease', ui('Kira', 'Lease', 'Mietvertrag', 'Bail', 'Arrendamiento', 'إيجار', 'Locazione', '租赁', 'Аренда', 'اجاره', '賃貸借', 'Arrendamento', 'Huur'));
set('draftOptContractService', ui('Abonelik / hizmet', 'Subscription / service', 'Abo / Dienstleistung', 'Abonnement / service', 'Suscripción / servicio', 'اشتراك / خدمة', 'Abbonamento / servizio', '订阅 / 服务', 'Подписка / услуга', 'اشتراک / خدمت', 'サブスク・サービス', 'Subscrição / serviço', 'Abonnement / dienst'));
set('draftOptContractEmployment', ui('İş (istifa)', 'Employment (resignation)', 'Arbeit (Eigenkündigung)', 'Emploi (démission)', 'Empleo (dimisión)', 'عمل (استقالة)', 'Lavoro (dimissioni)', '雇佣（辞职）', 'Работа (увольнение)', 'کار (استعفا)', '雇用（退職）', 'Emprego (demissão)', 'Werk (ontslag nemen)'));
set('draftOptContractOther', ui('Diğer', 'Other', 'Sonstiges', 'Autre', 'Otro', 'أخرى', 'Altro', '其他', 'Другое', 'سایر', 'その他', 'Outro', 'Overig'));
set('draftQContractRef', ui('Sözleşme / hesap no', 'Contract / account reference', 'Vertrags- / Kundennummer', 'Référence du contrat / compte', 'Referencia del contrato / cuenta', 'مرجع العقد / الحساب', 'Riferimento contratto / conto', '合同 / 账户编号', 'Номер договора / счёта', 'شماره قرارداد / حساب', '契約・アカウント番号', 'Referência do contrato / conta', 'Contract- / klantnummer'));
set('draftQEndDate', ui('Talep edilen bitiş tarihi', 'Requested end date', 'Gewünschtes Enddatum', 'Date de fin souhaitée', 'Fecha de finalización solicitada', 'تاريخ الانتهاء المطلوب', 'Data di cessazione richiesta', '要求的终止日期', 'Желаемая дата окончания', 'تاریخ پایان درخواستی', '希望する終了日', 'Data de fim pretendida', 'Gewenste einddatum'));
set('draftQReasonOptional', ui('Gerekçe (isteğe bağlı)', 'Reason (optional)', 'Grund (optional)', 'Motif (facultatif)', 'Motivo (opcional)', 'السبب (اختياري)', 'Motivo (facoltativo)', '原因（可选）', 'Причина (необязательно)', 'دلیل (اختیاری)', '理由（任意）', 'Motivo (opcional)', 'Reden (optioneel)'));
set('draftQProperty', ui('Taşınmaz adresi', 'Property address', 'Adresse der Wohnung', 'Adresse du logement', 'Dirección del inmueble', 'عنوان العقار', 'Indirizzo dell’immobile', '房产地址', 'Адрес объекта', 'نشانی ملک', '物件の住所', 'Morada do imóvel', 'Adres van de woning'));
set('draftQDepositAmount', ui('Depozito tutarı (para birimiyle)', 'Deposit amount (with currency)', 'Kautionsbetrag (mit Währung)', 'Montant du dépôt (avec devise)', 'Importe de la fianza (con moneda)', 'مبلغ التأمين (مع العملة)', 'Importo del deposito (con valuta)', '押金金额（含币种）', 'Сумма залога (с валютой)', 'مبلغ ودیعه (با واحد پول)', '敷金・保証金の額（通貨付き）', 'Valor da caução (com moeda)', 'Borgbedrag (met valuta)'));
set('draftQHandoverDate', ui('Taşınmazın teslim edildiği tarih', 'Date the property was handed back', 'Datum der Rückgabe', 'Date de restitution du logement', 'Fecha de entrega del inmueble', 'تاريخ تسليم العقار', 'Data di riconsegna dell’immobile', '房产交还日期', 'Дата возврата объекта', 'تاریخ تحویل ملک', '物件を明け渡した日', 'Data de entrega do imóvel', 'Datum van teruggave'));
set('draftQPaymentDetails', ui('Ödeme bilgileri (IBAN / hesap)', 'Payment details (IBAN / account)', 'Bankverbindung (IBAN / Konto)', 'Coordonnées bancaires (IBAN / compte)', 'Datos de pago (IBAN / cuenta)', 'بيانات الدفع (IBAN / الحساب)', 'Dati di pagamento (IBAN / conto)', '收款信息（IBAN / 账户）', 'Реквизиты (IBAN / счёт)', 'اطلاعات پرداخت (IBAN / حساب)', '振込先（IBAN・口座）', 'Dados de pagamento (IBAN / conta)', 'Betaalgegevens (IBAN / rekening)'));
set('draftQDefectItem', ui('Ayıplı ürün veya taşınmaz', 'Item or property with the defect', 'Mangelhafte Sache oder Wohnung', 'Bien ou logement défectueux', 'Bien o inmueble con el defecto', 'الشيء أو العقار المعيب', 'Bene o immobile difettoso', '存在缺陷的物品或房产', 'Вещь или объект с дефектом', 'کالا یا ملک معیوب', '不具合のある物・物件', 'Bem ou imóvel com defeito', 'Product of woning met het gebrek'));
set('draftQNoticedDate', ui('İlk fark edilen tarih', 'Date first noticed', 'Zuerst bemerkt am', 'Date de constatation', 'Fecha en que se detectó', 'تاريخ ملاحظة العيب', 'Data in cui è stato notato', '首次发现日期', 'Дата обнаружения', 'تاریخ مشاهده عیب', '最初に気づいた日', 'Data em que foi detetado', 'Datum eerst opgemerkt'));
set('draftQReplyDays', ui('Yanıt için verilen süre (gün)', 'Days given to reply', 'Frist für die Antwort (Tage)', 'Délai de réponse (jours)', 'Días para responder', 'مهلة الرد (أيام)', 'Giorni per rispondere', '答复期限（天）', 'Срок ответа (дней)', 'مهلت پاسخ (روز)', '回答期限（日）', 'Dias para responder', 'Dagen om te reageren'));
set('draftQCurrentRent', ui('Mevcut kira (para birimiyle)', 'Current rent (with currency)', 'Aktuelle Miete (mit Währung)', 'Loyer actuel (avec devise)', 'Renta actual (con moneda)', 'الإيجار الحالي (مع العملة)', 'Affitto attuale (con valuta)', '当前租金（含币种）', 'Текущая аренда (с валютой)', 'اجاره فعلی (با واحد پول)', '現行賃料（通貨付き）', 'Renda atual (com moeda)', 'Huidige huur (met valuta)'));
set('draftQProposedRent', ui('Önerilen kira (para birimiyle)', 'Proposed rent (with currency)', 'Verlangte Miete (mit Währung)', 'Loyer proposé (avec devise)', 'Renta propuesta (con moneda)', 'الإيجار المقترح (مع العملة)', 'Affitto proposto (con valuta)', '拟议租金（含币种）', 'Предложенная аренда (с валютой)', 'اجاره پیشنهادی (با واحد پول)', '提案賃料（通貨付き）', 'Renda proposta (com moeda)', 'Voorgestelde huur (met valuta)'));
set('draftQIncreaseNoticeDate', ui('Artış bildiriminin tarihi', 'Date of the increase notice', 'Datum des Erhöhungsschreibens', 'Date de l’avis de hausse', 'Fecha del aviso de aumento', 'تاريخ إشعار الزيادة', 'Data della comunicazione di aumento', '涨租通知日期', 'Дата уведомления о повышении', 'تاریخ اطلاعیه افزایش', '値上げ通知の日付', 'Data do aviso de aumento', 'Datum van de verhogingsbrief'));
set('draftQCounterOffer', ui('Karşı teklifiniz (isteğe bağlı)', 'Your counter-offer (optional)', 'Ihr Gegenvorschlag (optional)', 'Votre contre-proposition (facultatif)', 'Su contraoferta (opcional)', 'عرضك المقابل (اختياري)', 'La tua controproposta (facoltativa)', '您的还价（可选）', 'Ваше встречное предложение (необязательно)', 'پیشنهاد متقابل شما (اختیاری)', 'あなたの対案（任意）', 'A sua contraproposta (opcional)', 'Uw tegenvoorstel (optioneel)'));
set('draftQWagePeriod', ui('Ödenmeyen dönem (ör. Mayıs–Haziran 2026)', 'Unpaid period (e.g. May–June 2026)', 'Offener Zeitraum (z. B. Mai–Juni 2026)', 'Période impayée (ex. mai–juin 2026)', 'Periodo impagado (p. ej. mayo–junio 2026)', 'الفترة غير المدفوعة (مثل مايو–يونيو 2026)', 'Periodo non pagato (es. maggio–giugno 2026)', '未付期间（如 2026 年 5–6 月）', 'Неоплаченный период (напр. май–июнь 2026)', 'دوره پرداخت‌نشده (مثلاً اردیبهشت–خرداد ۱۴۰۵)', '未払い期間（例：2026年5〜6月）', 'Período em atraso (ex. maio–junho 2026)', 'Onbetaalde periode (bijv. mei–juni 2026)'));
set('draftQUnpaidAmount', ui('Ödenmeyen tutar (para birimiyle)', 'Unpaid amount (with currency)', 'Offener Betrag (mit Währung)', 'Montant impayé (avec devise)', 'Importe impagado (con moneda)', 'المبلغ غير المدفوع (مع العملة)', 'Importo non pagato (con valuta)', '未付金额（含币种）', 'Невыплаченная сумма (с валютой)', 'مبلغ پرداخت‌نشده (با واحد پول)', '未払い額（通貨付き）', 'Valor em atraso (com moeda)', 'Onbetaald bedrag (met valuta)'));
set('draftQWageDetails', ui('Ayrıntılar (ne ödenmedi, saatler, primler)', 'Details (what was not paid, hours, bonuses)', 'Einzelheiten (was fehlt, Stunden, Zulagen)', 'Détails (ce qui manque, heures, primes)', 'Detalles (qué no se pagó, horas, primas)', 'التفاصيل (ما لم يُدفع، الساعات، المكافآت)', 'Dettagli (cosa manca, ore, premi)', '详情（未付内容、工时、奖金）', 'Подробности (что не выплачено, часы, премии)', 'جزئیات (چه چیزی پرداخت نشده، ساعت‌ها، پاداش‌ها)', '詳細（未払いの内容・時間・賞与）', 'Detalhes (o que falta, horas, prémios)', 'Details (wat niet is betaald, uren, bonussen)'));
set('draftQDataHolder', ui('Verilerinizi tutan şirket', 'Company holding your data', 'Unternehmen, das Ihre Daten hat', 'Société qui détient vos données', 'Empresa que tiene sus datos', 'الشركة التي تحتفظ ببياناتك', 'Azienda che detiene i tuoi dati', '持有您数据的公司', 'Компания, хранящая ваши данные', 'شرکتی که داده‌های شما را نگه می‌دارد', 'データを保有する会社', 'Empresa que detém os seus dados', 'Bedrijf dat uw gegevens heeft'));
set('draftQAccountRef', ui('Hesap / müşteri no', 'Account / customer reference', 'Konto- / Kundennummer', 'Référence compte / client', 'Referencia de cuenta / cliente', 'مرجع الحساب / العميل', 'Riferimento conto / cliente', '账户 / 客户编号', 'Номер аккаунта / клиента', 'شماره حساب / مشتری', 'アカウント・顧客番号', 'Referência de conta / cliente', 'Account- / klantnummer'));
set('draftQReplyTo', ui('Yanıtın gönderileceği adres (e-posta / posta)', 'Where to send the reply (e-mail / address)', 'Antwort an (E-Mail / Anschrift)', 'Adresse de réponse (e-mail / postale)', 'Dónde enviar la respuesta (e-mail / dirección)', 'عنوان إرسال الرد (بريد إلكتروني / عنوان)', 'Dove inviare la risposta (e-mail / indirizzo)', '答复发送至（邮箱 / 地址）', 'Куда направить ответ (e-mail / адрес)', 'نشانی ارسال پاسخ (ایمیل / آدرس)', '回答の送付先（メール・住所）', 'Onde enviar a resposta (e-mail / morada)', 'Waar het antwoord heen moet (e-mail / adres)'));
set('draftQDataScope', ui('Hangi veriler (isteğe bağlı)', 'Which data (optional)', 'Welche Daten (optional)', 'Quelles données (facultatif)', 'Qué datos (opcional)', 'أي بيانات (اختياري)', 'Quali dati (facoltativo)', '涉及哪些数据（可选）', 'Какие данные (необязательно)', 'کدام داده‌ها (اختیاری)', '対象のデータ（任意）', 'Que dados (opcional)', 'Welke gegevens (optioneel)'));
set('draftQOrderRef', ui('Sipariş / sözleşme no', 'Order / contract reference', 'Bestell- / Vertragsnummer', 'Référence commande / contrat', 'Referencia del pedido / contrato', 'مرجع الطلب / العقد', 'Riferimento ordine / contratto', '订单 / 合同编号', 'Номер заказа / договора', 'شماره سفارش / قرارداد', '注文・契約番号', 'Referência da encomenda / contrato', 'Bestel- / contractnummer'));
set('draftQCancelDate', ui('İptalin geçerli olacağı tarih', 'Cancel with effect from', 'Stornierung wirksam ab', 'Annulation à compter du', 'Cancelar con efecto desde', 'الإلغاء اعتبارًا من', 'Annullamento con effetto dal', '取消生效日期', 'Отменить с даты', 'لغو از تاریخ', 'キャンセルの効力発生日', 'Cancelar com efeito a partir de', 'Annuleren met ingang van'));
set('draftQCancelRequest', ui('Ek talep (ör. para iadesi)', 'Additional request (e.g. refund)', 'Weitere Bitte (z. B. Erstattung)', 'Demande complémentaire (ex. remboursement)', 'Petición adicional (p. ej. reembolso)', 'طلب إضافي (مثل استرداد المبلغ)', 'Richiesta aggiuntiva (es. rimborso)', '其他请求（如退款）', 'Дополнительная просьба (напр. возврат денег)', 'درخواست تکمیلی (مثلاً بازپرداخت)', '追加の要望（例：返金）', 'Pedido adicional (ex. reembolso)', 'Aanvullend verzoek (bijv. terugbetaling)'));

// --- Universal letters: titles + descriptions ----------------------------------------
const UNIVERSAL_IDS = [
  'termination_notice',
  'deposit_return_request',
  'repair_or_defect_notice',
  'rent_increase_objection',
  'unpaid_wages_request',
  'personal_data_access_request',
  'cancellation_request',
];

const TITLES = {
  tr: ['Fesih bildirimi', 'Depozito iade talebi', 'Ayıp bildirimi ve onarım talebi', 'Kira artışına itiraz', 'Ödenmemiş ücret talebi', 'Kişisel verilere erişim talebi', 'İptal talebi'],
  en: ['Termination notice', 'Deposit return request', 'Defect notice and repair request', 'Rent increase objection', 'Unpaid wages request', 'Personal data access request', 'Cancellation request'],
  de: ['Kündigungsschreiben', 'Rückforderung der Kaution', 'Mängelanzeige und Reparaturbitte', 'Einwand gegen Mieterhöhung', 'Forderung ausstehenden Lohns', 'Auskunftsersuchen zu meinen Daten', 'Stornierungsanfrage'],
  fr: ['Lettre de résiliation', 'Demande de restitution du dépôt', 'Signalement de défaut et demande de réparation', 'Contestation de la hausse de loyer', 'Réclamation de salaires impayés', 'Demande d’accès aux données personnelles', 'Demande d’annulation'],
  es: ['Notificación de terminación', 'Solicitud de devolución de la fianza', 'Aviso de defecto y solicitud de reparación', 'Oposición al aumento de renta', 'Reclamación de salarios impagados', 'Solicitud de acceso a datos personales', 'Solicitud de cancelación'],
  ar: ['إشعار إنهاء', 'طلب استرداد مبلغ التأمين', 'إشعار بعيب وطلب إصلاح', 'اعتراض على زيادة الإيجار', 'طلب دفع أجور متأخرة', 'طلب الاطلاع على البيانات الشخصية', 'طلب إلغاء'],
  it: ['Lettera di disdetta', 'Richiesta di restituzione del deposito', 'Segnalazione di difetto e richiesta di riparazione', 'Contestazione dell’aumento dell’affitto', 'Richiesta di retribuzioni non pagate', 'Richiesta di accesso ai dati personali', 'Richiesta di annullamento'],
  zh: ['终止通知', '押金退还请求', '缺陷通知及维修请求', '租金上涨异议', '欠薪支付请求', '个人数据访问请求', '取消请求'],
  ru: ['Уведомление о расторжении', 'Требование о возврате залога', 'Уведомление о дефекте и просьба о ремонте', 'Возражение против повышения аренды', 'Требование о выплате зарплаты', 'Запрос на доступ к персональным данным', 'Заявление об отмене'],
  fa: ['اعلام فسخ', 'درخواست استرداد ودیعه', 'اعلام عیب و درخواست تعمیر', 'اعتراض به افزایش اجاره', 'درخواست پرداخت دستمزد معوق', 'درخواست دسترسی به داده‌های شخصی', 'درخواست لغو'],
  ja: ['解約通知', '敷金・保証金の返還請求', '不具合の通知と修理のお願い', '賃料値上げへの異議', '未払い賃金の支払請求', '個人データの開示請求', 'キャンセルの申し入れ'],
  pt: ['Carta de rescisão', 'Pedido de devolução da caução', 'Aviso de defeito e pedido de reparação', 'Oposição ao aumento da renda', 'Pedido de salários em atraso', 'Pedido de acesso a dados pessoais', 'Pedido de cancelamento'],
  nl: ['Opzeggingsbrief', 'Verzoek om terugbetaling van de borg', 'Melding van gebrek en verzoek om herstel', 'Bezwaar tegen huurverhoging', 'Verzoek om achterstallig loon', 'Verzoek om inzage in persoonsgegevens', 'Verzoek tot annulering'],
};

const DESCS = {
  tr: [
    'Kira, abonelik, hizmet veya işi yazılı olarak sonlandırın ve onay isteyin.',
    'Depozitonuzu ya da kalem kalem kesinti listesini isteyin.',
    'Ayıbı bildirin ve belirli bir süre içinde onarım isteyin.',
    'Önerilen artışı kabul etmeyin ve hesaplamayı isteyin.',
    'İşvereninizden ödenmemiş ücreti dökümüyle birlikte isteyin.',
    'Bir şirketten verilerinizin kopyasını, amaçlarını, alıcılarını ve saklama süresini isteyin.',
    'Bir siparişi veya sözleşmeyi iptal edin ve yeni ücretlerin durdurulmasını isteyin.',
  ],
  en: [
    'End a lease, subscription, service or job in writing and ask for confirmation.',
    'Ask for your deposit back, or an itemised list of any deductions.',
    'Report a defect and ask for a repair within a set time.',
    'Decline a proposed increase and ask for the calculation behind it.',
    'Ask your employer to pay outstanding wages with a breakdown.',
    'Ask a company for a copy of your data, its purposes, recipients and retention.',
    'Ask to cancel an order or contract and stop further charges.',
  ],
  de: [
    'Miete, Abo, Dienstleistung oder Job schriftlich beenden und Bestätigung verlangen.',
    'Kaution zurückfordern oder eine Aufstellung der Abzüge verlangen.',
    'Mangel melden und Reparatur innerhalb einer Frist verlangen.',
    'Vorgeschlagene Erhöhung ablehnen und die Berechnung anfordern.',
    'Ausstehenden Lohn mit Abrechnung vom Arbeitgeber verlangen.',
    'Kopie Ihrer Daten, Zwecke, Empfänger und Speicherdauer anfordern.',
    'Bestellung oder Vertrag stornieren und weitere Abbuchungen stoppen.',
  ],
  fr: [
    'Mettez fin par écrit à un bail, abonnement, service ou emploi et demandez une confirmation.',
    'Demandez la restitution du dépôt ou la liste détaillée des retenues.',
    'Signalez un défaut et demandez une réparation dans un délai fixé.',
    'Refusez la hausse proposée et demandez le détail du calcul.',
    'Demandez à l’employeur de payer les salaires dus avec un décompte.',
    'Demandez une copie de vos données, leurs finalités, destinataires et durée de conservation.',
    'Demandez l’annulation d’une commande ou d’un contrat et l’arrêt des prélèvements.',
  ],
  es: [
    'Ponga fin por escrito a un alquiler, suscripción, servicio o empleo y pida confirmación.',
    'Pida la devolución de la fianza o una lista detallada de descuentos.',
    'Comunique un defecto y pida la reparación en un plazo fijado.',
    'Rechace el aumento propuesto y pida el cálculo que lo justifica.',
    'Pida a su empleador los salarios pendientes con un desglose.',
    'Pida a una empresa copia de sus datos, fines, destinatarios y plazo de conservación.',
    'Pida cancelar un pedido o contrato y detener nuevos cargos.',
  ],
  ar: [
    'أنهِ إيجارًا أو اشتراكًا أو خدمة أو عملًا كتابيًا واطلب التأكيد.',
    'اطلب استرداد مبلغ التأمين أو قائمة مفصلة بأي خصومات.',
    'أبلغ عن عيب واطلب الإصلاح خلال مدة محددة.',
    'ارفض الزيادة المقترحة واطلب طريقة حسابها.',
    'اطلب من صاحب العمل دفع الأجور المتأخرة مع كشف تفصيلي.',
    'اطلب من شركة نسخة من بياناتك وأغراض معالجتها والجهات المتلقية ومدة الاحتفاظ.',
    'اطلب إلغاء طلب أو عقد وإيقاف أي رسوم لاحقة.',
  ],
  it: [
    'Chiudi per iscritto un affitto, abbonamento, servizio o lavoro e chiedi conferma.',
    'Chiedi la restituzione del deposito o l’elenco dettagliato delle trattenute.',
    'Segnala un difetto e chiedi la riparazione entro un termine.',
    'Rifiuta l’aumento proposto e chiedi il calcolo che lo giustifica.',
    'Chiedi al datore di lavoro le retribuzioni arretrate con un prospetto.',
    'Chiedi a un’azienda copia dei tuoi dati, finalità, destinatari e tempi di conservazione.',
    'Chiedi di annullare un ordine o contratto e di bloccare ulteriori addebiti.',
  ],
  zh: [
    '以书面形式终止租赁、订阅、服务或工作，并要求对方确认。',
    '要求退还押金，或提供逐项扣款清单。',
    '通知缺陷并要求在规定时间内维修。',
    '不接受拟议涨租，并要求提供计算依据。',
    '要求雇主支付欠薪并提供明细。',
    '要求公司提供您的数据副本、处理目的、接收方和保存期限。',
    '要求取消订单或合同并停止后续扣费。',
  ],
  ru: [
    'Письменно прекратите аренду, подписку, услугу или работу и попросите подтверждение.',
    'Потребуйте вернуть залог или дать перечень удержаний.',
    'Сообщите о дефекте и попросите ремонт в установленный срок.',
    'Не соглашайтесь с повышением и запросите расчёт.',
    'Потребуйте у работодателя выплатить долг по зарплате с расчётом.',
    'Запросите у компании копию данных, цели, получателей и срок хранения.',
    'Попросите отменить заказ или договор и прекратить списания.',
  ],
  fa: [
    'اجاره، اشتراک، خدمت یا کار را کتبی خاتمه دهید و تأیید بخواهید.',
    'استرداد ودیعه یا فهرست جزئی کسورات را درخواست کنید.',
    'عیب را اعلام کنید و تعمیر در مهلت مشخص بخواهید.',
    'افزایش پیشنهادی را نپذیرید و نحوه محاسبه را بخواهید.',
    'پرداخت دستمزد معوق را همراه با ریز حساب از کارفرما بخواهید.',
    'از شرکت نسخه داده‌ها، اهداف، گیرندگان و مدت نگهداری را بخواهید.',
    'لغو سفارش یا قرارداد و توقف هزینه‌های بعدی را درخواست کنید.',
  ],
  ja: [
    '賃貸・サブスク・サービス・仕事を書面で終了し、確認を求めます。',
    '敷金の返還、または控除の明細を求めます。',
    '不具合を伝え、期限内の修理を求めます。',
    '提案された値上げに同意せず、計算根拠を求めます。',
    '雇用主に未払い賃金の支払いと明細を求めます。',
    '会社に自分のデータの写し、利用目的、提供先、保存期間を求めます。',
    '注文や契約のキャンセルと今後の請求停止を求めます。',
  ],
  pt: [
    'Termine por escrito um arrendamento, subscrição, serviço ou emprego e peça confirmação.',
    'Peça a devolução da caução ou a lista detalhada de descontos.',
    'Comunique um defeito e peça a reparação num prazo definido.',
    'Recuse o aumento proposto e peça o cálculo que o fundamenta.',
    'Peça ao empregador os salários em atraso com discriminação.',
    'Peça a uma empresa cópia dos seus dados, finalidades, destinatários e prazo de conservação.',
    'Peça o cancelamento de uma encomenda ou contrato e o fim de novas cobranças.',
  ],
  nl: [
    'Zeg schriftelijk een huur, abonnement, dienst of baan op en vraag om bevestiging.',
    'Vraag uw borg terug of een gespecificeerde lijst van inhoudingen.',
    'Meld een gebrek en vraag om herstel binnen een termijn.',
    'Wijs de voorgestelde verhoging af en vraag om de berekening.',
    'Vraag uw werkgever achterstallig loon te betalen met specificatie.',
    'Vraag een bedrijf om een kopie van uw gegevens, doelen, ontvangers en bewaartermijn.',
    'Vraag om annulering van een bestelling of contract en stop verdere kosten.',
  ],
};

// --- Universal letters: bodies -------------------------------------------------------
// Section labels match the existing generic consumer letter in every language.
const H = {
  tr: { sep: ': ', from: 'GÖNDEREN', to: 'ALICI', subject: 'KONU', facts: 'OLAYLAR', request: 'TALEP', deadline: 'SÜRE', attach: 'EKLER', date: 'Tarih: [ gün.ay.yıl ]', sign: 'İmza' },
  en: { sep: ': ', from: 'FROM', to: 'TO', subject: 'SUBJECT', facts: 'FACTS', request: 'REQUEST', deadline: 'DEADLINE', attach: 'ATTACHMENTS', date: 'Date: [ dd.mm.yyyy ]', sign: 'Signature' },
  de: { sep: ': ', from: 'VON', to: 'AN', subject: 'BETREFF', facts: 'SACHVERHALT', request: 'ANLIEGEN', deadline: 'FRIST', attach: 'ANLAGEN', date: 'Datum: [ TT.MM.JJJJ ]', sign: 'Unterschrift' },
  fr: { sep: ' : ', from: 'DE', to: 'À', subject: 'OBJET', facts: 'FAITS', request: 'DEMANDE', deadline: 'DÉLAI', attach: 'PIÈCES JOINTES', date: 'Date : [ jj.mm.aaaa ]', sign: 'Signature' },
  es: { sep: ': ', from: 'DE', to: 'PARA', subject: 'ASUNTO', facts: 'HECHOS', request: 'PETICIÓN', deadline: 'PLAZO', attach: 'ANEXOS', date: 'Fecha: [ dd.mm.aaaa ]', sign: 'Firma' },
  ar: { sep: ': ', from: 'من', to: 'إلى', subject: 'الموضوع', facts: 'الوقائع', request: 'الطلب', deadline: 'المهلة', attach: 'المرفقات', date: 'التاريخ: [ يوم.شهر.سنة ]', sign: 'التوقيع' },
  it: { sep: ': ', from: 'DA', to: 'A', subject: 'OGGETTO', facts: 'FATTI', request: 'RICHIESTA', deadline: 'TERMINE', attach: 'ALLEGATI', date: 'Data: [ gg.mm.aaaa ]', sign: 'Firma' },
  zh: { sep: '：', from: '发件人', to: '收件人', subject: '事由', facts: '事实', request: '请求', deadline: '期限', attach: '附件', date: '日期：[ 日.月.年 ]', sign: '签名' },
  ru: { sep: ': ', from: 'ОТ', to: 'КОМУ', subject: 'ТЕМА', facts: 'ОБСТОЯТЕЛЬСТВА', request: 'ТРЕБОВАНИЕ', deadline: 'СРОК', attach: 'ПРИЛОЖЕНИЯ', date: 'Дата: [ дд.мм.гггг ]', sign: 'Подпись' },
  fa: { sep: ': ', from: 'از', to: 'به', subject: 'موضوع', facts: 'شرح ماجرا', request: 'درخواست', deadline: 'مهلت', attach: 'پیوست‌ها', date: 'تاریخ: [ روز.ماه.سال ]', sign: 'امضا' },
  ja: { sep: '：', from: '差出人', to: '宛先', subject: '件名', facts: '経緯', request: '要望', deadline: '期限', attach: '添付書類', date: '日付：[ 年.月.日 ]', sign: '署名' },
  pt: { sep: ': ', from: 'DE', to: 'PARA', subject: 'ASSUNTO', facts: 'FACTOS', request: 'PEDIDO', deadline: 'PRAZO', attach: 'ANEXOS', date: 'Data: [ dd.mm.aaaa ]', sign: 'Assinatura' },
  nl: { sep: ': ', from: 'VAN', to: 'AAN', subject: 'BETREFT', facts: 'FEITEN', request: 'VERZOEK', deadline: 'TERMIJN', attach: 'BIJLAGEN', date: 'Datum: [ dd.mm.jjjj ]', sign: 'Handtekening' },
};

/** [subject, facts, request, deadline, attachments] per template, in UNIVERSAL_IDS order. */
const B = {
  en: [
    ['Notice of termination', 'I hereby give notice to end the following contract: {{contractType}}, reference {{contractRef}}.\nRequested end date: {{endDate}}.\nReason: {{reason}}', 'Please confirm in writing that you have received this notice and the end date, and tell me about any final settlement or items to return.', 'Please reply within [ number of days ] days of receiving this letter.', '[ copy of the contract, previous correspondence ]'],
    ['Request to return the deposit', 'Property: {{property}}\nDeposit paid: {{depositAmount}}\nThe property was handed back on {{handoverDate}}.', 'Please return the deposit in full, or send me a written, itemised list of any deductions with supporting evidence.\nPayment details: {{paymentDetails}}', 'Please pay or reply within {{deadlineDays}} days of receiving this letter.', '[ deposit receipt, handover record, photos ]'],
    ['Notice of defect and request for repair', 'Item / property: {{item}}\nFirst noticed on: {{noticedDate}}\nProblem:\n{{problem}}', 'Please repair or otherwise remedy the defect and confirm a date for the work in writing.', 'Please reply within {{deadlineDays}} days of receiving this letter.', '[ photos, videos, invoices, previous messages ]'],
    ['Objection to the proposed rent increase', 'Property: {{property}}\nCurrent rent: {{currentRent}}\nProposed rent: {{proposedRent}}\nIncrease notice received on: {{noticeDate}}', 'I do not accept the increase as proposed. Please send me, in writing, how the new amount was calculated and what it is based on.\nI am open to discussing this alternative: {{counterOffer}}', 'Please reply within [ number of days ] days of receiving this letter.', '[ copy of the lease, the increase notice ]'],
    ['Request for payment of outstanding wages', 'Period: {{period}}\nOutstanding amount: {{unpaidAmount}}\nDetails:\n{{details}}', 'Please pay the outstanding amount and send me a written breakdown (payslip) for the period above.', 'Please pay or reply within {{deadlineDays}} days of receiving this letter.', '[ employment contract, payslips, bank statements, timesheets ]'],
    ['Request for access to my personal data', 'Account / customer reference: {{accountRef}}\nData concerned: {{scope}}', 'Please send me:\n1. a copy of the personal data you hold about me;\n2. the purposes for which it is used;\n3. who it has been shared with, or the categories of recipients;\n4. how long it will be kept, or how that period is decided.\nPlease send your reply to: {{replyTo}}', 'Please reply within the time required by the rules that apply to you, and no later than [ number of days ] days.', '[ proof of identity, if you ask for it ]'],
    ['Request to cancel', 'Order / contract reference: {{contractRef}}\nPurchase / start date: {{purchaseDate}}\nI wish to cancel with effect from: {{cancelDate}}', 'Please cancel the order / contract above, confirm the cancellation in writing and stop any further charges.\nAdditional request: {{request}}', 'Please reply within [ number of days ] days of receiving this letter.', '[ order confirmation, invoice, previous messages ]'],
  ],
  tr: [
    ['Fesih bildirimi', 'Aşağıdaki sözleşmeyi sona erdirdiğimi bildiririm: {{contractType}}, referans {{contractRef}}.\nTalep edilen bitiş tarihi: {{endDate}}.\nGerekçe: {{reason}}', 'Bu bildirimi ve bitiş tarihini aldığınızı yazılı olarak teyit etmenizi; varsa son hesaplaşma veya iade edilecek eşyalar hakkında bilgi vermenizi rica ederim.', 'Lütfen bu mektubu aldığınız tarihten itibaren [ gün sayısı ] gün içinde yanıt verin.', '[ sözleşme sureti, önceki yazışmalar ]'],
    ['Depozito iade talebi', 'Taşınmaz: {{property}}\nÖdenen depozito: {{depositAmount}}\nTaşınmaz {{handoverDate}} tarihinde teslim edilmiştir.', 'Depozitonun tamamını iade etmenizi ya da varsa kesintilerin kalem kalem yazılı listesini belgeleriyle birlikte göndermenizi rica ederim.\nÖdeme bilgileri: {{paymentDetails}}', 'Lütfen bu mektubu aldığınız tarihten itibaren {{deadlineDays}} gün içinde ödeme yapın veya yanıt verin.', '[ depozito makbuzu, teslim tutanağı, fotoğraflar ]'],
    ['Ayıp bildirimi ve onarım talebi', 'Ürün / taşınmaz: {{item}}\nİlk fark edilen tarih: {{noticedDate}}\nSorun:\n{{problem}}', 'Ayıbın onarılmasını veya başka bir şekilde giderilmesini ve iş için bir tarihi yazılı olarak bildirmenizi rica ederim.', 'Lütfen bu mektubu aldığınız tarihten itibaren {{deadlineDays}} gün içinde yanıt verin.', '[ fotoğraflar, videolar, faturalar, önceki mesajlar ]'],
    ['Kira artışına itiraz', 'Taşınmaz: {{property}}\nMevcut kira: {{currentRent}}\nÖnerilen kira: {{proposedRent}}\nArtış bildiriminin alındığı tarih: {{noticeDate}}', 'Önerilen artışı bu haliyle kabul etmiyorum. Yeni tutarın nasıl hesaplandığını ve neye dayandığını yazılı olarak göndermenizi rica ederim.\nŞu alternatifi görüşmeye açığım: {{counterOffer}}', 'Lütfen bu mektubu aldığınız tarihten itibaren [ gün sayısı ] gün içinde yanıt verin.', '[ kira sözleşmesi sureti, artış bildirimi ]'],
    ['Ödenmemiş ücret talebi', 'Dönem: {{period}}\nÖdenmeyen tutar: {{unpaidAmount}}\nAyrıntılar:\n{{details}}', 'Ödenmeyen tutarı ödemenizi ve yukarıdaki dönem için yazılı döküm (bordro) göndermenizi rica ederim.', 'Lütfen bu mektubu aldığınız tarihten itibaren {{deadlineDays}} gün içinde ödeme yapın veya yanıt verin.', '[ iş sözleşmesi, bordrolar, banka dökümleri, puantaj kayıtları ]'],
    ['Kişisel verilerime erişim talebi', 'Hesap / müşteri no: {{accountRef}}\nİlgili veriler: {{scope}}', 'Lütfen bana şunları gönderin:\n1. hakkımda tuttuğunuz kişisel verilerin bir kopyası;\n2. bu verilerin hangi amaçlarla kullanıldığı;\n3. kimlerle veya hangi alıcı gruplarıyla paylaşıldığı;\n4. ne kadar süre saklanacağı ya da bu sürenin nasıl belirlendiği.\nYanıtınızı şu adrese gönderin: {{replyTo}}', 'Lütfen size uygulanan kurallarda öngörülen süre içinde ve en geç [ gün sayısı ] gün içinde yanıt verin.', '[ talep ederseniz kimlik belgesi ]'],
    ['İptal talebi', 'Sipariş / sözleşme no: {{contractRef}}\nSatın alma / başlangıç tarihi: {{purchaseDate}}\nİptalin geçerli olacağı tarih: {{cancelDate}}', 'Yukarıdaki sipariş / sözleşmeyi iptal etmenizi, iptali yazılı olarak teyit etmenizi ve yeni ücret tahsilatını durdurmanızı rica ederim.\nEk talep: {{request}}', 'Lütfen bu mektubu aldığınız tarihten itibaren [ gün sayısı ] gün içinde yanıt verin.', '[ sipariş onayı, fatura, önceki mesajlar ]'],
  ],
  de: [
    ['Kündigung', 'Hiermit kündige ich folgenden Vertrag: {{contractType}}, Referenz {{contractRef}}.\nGewünschtes Vertragsende: {{endDate}}.\nGrund: {{reason}}', 'Bitte bestätigen Sie mir schriftlich den Eingang dieser Kündigung und das Vertragsende und informieren Sie mich über eine etwaige Schlussabrechnung oder Rückgaben.', 'Bitte antworten Sie innerhalb von [ Anzahl Tage ] Tagen nach Erhalt dieses Schreibens.', '[ Vertragskopie, bisheriger Schriftverkehr ]'],
    ['Rückzahlung der Kaution', 'Wohnung / Objekt: {{property}}\nGezahlte Kaution: {{depositAmount}}\nDie Rückgabe erfolgte am {{handoverDate}}.', 'Bitte zahlen Sie die Kaution vollständig zurück oder senden Sie mir eine schriftliche, einzeln aufgeschlüsselte Aufstellung etwaiger Abzüge mit Belegen.\nBankverbindung: {{paymentDetails}}', 'Bitte zahlen oder antworten Sie innerhalb von {{deadlineDays}} Tagen nach Erhalt dieses Schreibens.', '[ Kautionsnachweis, Übergabeprotokoll, Fotos ]'],
    ['Mängelanzeige und Bitte um Reparatur', 'Sache / Objekt: {{item}}\nZuerst bemerkt am: {{noticedDate}}\nProblem:\n{{problem}}', 'Bitte beheben Sie den Mangel durch Reparatur oder auf andere Weise und nennen Sie mir schriftlich einen Termin.', 'Bitte antworten Sie innerhalb von {{deadlineDays}} Tagen nach Erhalt dieses Schreibens.', '[ Fotos, Videos, Rechnungen, bisherige Nachrichten ]'],
    ['Einwand gegen die verlangte Mieterhöhung', 'Objekt: {{property}}\nAktuelle Miete: {{currentRent}}\nVerlangte Miete: {{proposedRent}}\nErhöhungsschreiben erhalten am: {{noticeDate}}', 'Der Erhöhung in der vorgeschlagenen Form stimme ich nicht zu. Bitte teilen Sie mir schriftlich mit, wie der neue Betrag berechnet wurde und worauf er beruht.\nGerne bespreche ich folgende Alternative: {{counterOffer}}', 'Bitte antworten Sie innerhalb von [ Anzahl Tage ] Tagen nach Erhalt dieses Schreibens.', '[ Mietvertragskopie, Erhöhungsschreiben ]'],
    ['Zahlung ausstehenden Lohns', 'Zeitraum: {{period}}\nOffener Betrag: {{unpaidAmount}}\nEinzelheiten:\n{{details}}', 'Bitte zahlen Sie den offenen Betrag und senden Sie mir eine schriftliche Abrechnung für den genannten Zeitraum.', 'Bitte zahlen oder antworten Sie innerhalb von {{deadlineDays}} Tagen nach Erhalt dieses Schreibens.', '[ Arbeitsvertrag, Lohnabrechnungen, Kontoauszüge, Stundenzettel ]'],
    ['Auskunft über meine personenbezogenen Daten', 'Konto- / Kundennummer: {{accountRef}}\nBetroffene Daten: {{scope}}', 'Bitte senden Sie mir:\n1. eine Kopie der personenbezogenen Daten, die Sie über mich speichern;\n2. die Zwecke, für die sie verwendet werden;\n3. an wen sie weitergegeben wurden oder die Kategorien von Empfängern;\n4. wie lange sie gespeichert werden oder wie diese Dauer festgelegt wird.\nBitte senden Sie Ihre Antwort an: {{replyTo}}', 'Bitte antworten Sie innerhalb der für Sie geltenden Frist, spätestens aber innerhalb von [ Anzahl Tage ] Tagen.', '[ Identitätsnachweis, falls Sie ihn verlangen ]'],
    ['Stornierung', 'Bestell- / Vertragsnummer: {{contractRef}}\nKauf- / Beginndatum: {{purchaseDate}}\nStornierung wirksam ab: {{cancelDate}}', 'Bitte stornieren Sie die genannte Bestellung / den Vertrag, bestätigen Sie die Stornierung schriftlich und stellen Sie weitere Abbuchungen ein.\nWeitere Bitte: {{request}}', 'Bitte antworten Sie innerhalb von [ Anzahl Tage ] Tagen nach Erhalt dieses Schreibens.', '[ Bestellbestätigung, Rechnung, bisherige Nachrichten ]'],
  ],
  fr: [
    ['Résiliation', 'Je vous informe par la présente que je mets fin au contrat suivant : {{contractType}}, référence {{contractRef}}.\nDate de fin souhaitée : {{endDate}}.\nMotif : {{reason}}', 'Merci de me confirmer par écrit la réception de ce courrier et la date de fin, et de m’indiquer tout solde final ou élément à restituer.', 'Merci de répondre dans les [ nombre de jours ] jours suivant la réception de cette lettre.', '[ copie du contrat, échanges précédents ]'],
    ['Demande de restitution du dépôt de garantie', 'Logement : {{property}}\nDépôt versé : {{depositAmount}}\nLe logement a été restitué le {{handoverDate}}.', 'Merci de me restituer l’intégralité du dépôt, ou de m’adresser par écrit la liste détaillée des retenues avec justificatifs.\nCoordonnées bancaires : {{paymentDetails}}', 'Merci de payer ou de répondre dans les {{deadlineDays}} jours suivant la réception de cette lettre.', '[ reçu du dépôt, état des lieux de sortie, photos ]'],
    ['Signalement de défaut et demande de réparation', 'Bien / logement : {{item}}\nConstaté pour la première fois le : {{noticedDate}}\nProblème :\n{{problem}}', 'Merci de réparer ou de remédier au défaut et de me confirmer par écrit une date d’intervention.', 'Merci de répondre dans les {{deadlineDays}} jours suivant la réception de cette lettre.', '[ photos, vidéos, factures, messages précédents ]'],
    ['Contestation de la hausse de loyer proposée', 'Logement : {{property}}\nLoyer actuel : {{currentRent}}\nLoyer proposé : {{proposedRent}}\nAvis de hausse reçu le : {{noticeDate}}', 'Je n’accepte pas la hausse telle que proposée. Merci de m’indiquer par écrit comment le nouveau montant a été calculé et sur quoi il repose.\nJe suis ouvert(e) à discuter de l’alternative suivante : {{counterOffer}}', 'Merci de répondre dans les [ nombre de jours ] jours suivant la réception de cette lettre.', '[ copie du bail, avis de hausse ]'],
    ['Demande de paiement de salaires impayés', 'Période : {{period}}\nMontant dû : {{unpaidAmount}}\nDétails :\n{{details}}', 'Merci de régler le montant dû et de m’adresser un décompte écrit (bulletin de paie) pour la période indiquée.', 'Merci de payer ou de répondre dans les {{deadlineDays}} jours suivant la réception de cette lettre.', '[ contrat de travail, bulletins de paie, relevés bancaires, relevés d’heures ]'],
    ['Demande d’accès à mes données personnelles', 'Référence compte / client : {{accountRef}}\nDonnées concernées : {{scope}}', 'Merci de m’envoyer :\n1. une copie des données personnelles que vous détenez à mon sujet ;\n2. les finalités pour lesquelles elles sont utilisées ;\n3. les destinataires ou catégories de destinataires à qui elles ont été communiquées ;\n4. leur durée de conservation, ou les critères qui la déterminent.\nMerci d’adresser votre réponse à : {{replyTo}}', 'Merci de répondre dans le délai prévu par les règles qui vous sont applicables, et au plus tard sous [ nombre de jours ] jours.', '[ justificatif d’identité, si vous le demandez ]'],
    ['Demande d’annulation', 'Référence commande / contrat : {{contractRef}}\nDate d’achat / de début : {{purchaseDate}}\nAnnulation souhaitée à compter du : {{cancelDate}}', 'Merci d’annuler la commande / le contrat ci-dessus, de confirmer l’annulation par écrit et de cesser tout prélèvement.\nDemande complémentaire : {{request}}', 'Merci de répondre dans les [ nombre de jours ] jours suivant la réception de cette lettre.', '[ confirmation de commande, facture, messages précédents ]'],
  ],
  es: [
    ['Notificación de terminación', 'Por la presente comunico que doy por terminado el siguiente contrato: {{contractType}}, referencia {{contractRef}}.\nFecha de finalización solicitada: {{endDate}}.\nMotivo: {{reason}}', 'Le ruego que confirme por escrito la recepción de esta notificación y la fecha de finalización, e indique cualquier liquidación final o bienes que deban devolverse.', 'Responda dentro de los [ número de días ] días siguientes a la recepción de esta carta.', '[ copia del contrato, correspondencia anterior ]'],
    ['Solicitud de devolución de la fianza', 'Inmueble: {{property}}\nFianza pagada: {{depositAmount}}\nEl inmueble se entregó el {{handoverDate}}.', 'Le ruego que devuelva la fianza íntegra o me envíe por escrito una lista detallada de los descuentos con sus justificantes.\nDatos de pago: {{paymentDetails}}', 'Pague o responda dentro de los {{deadlineDays}} días siguientes a la recepción de esta carta.', '[ recibo de la fianza, acta de entrega, fotos ]'],
    ['Aviso de defecto y solicitud de reparación', 'Bien / inmueble: {{item}}\nDetectado por primera vez el: {{noticedDate}}\nProblema:\n{{problem}}', 'Le ruego que repare o subsane el defecto y me confirme por escrito una fecha para los trabajos.', 'Responda dentro de los {{deadlineDays}} días siguientes a la recepción de esta carta.', '[ fotos, vídeos, facturas, mensajes anteriores ]'],
    ['Oposición al aumento de renta propuesto', 'Inmueble: {{property}}\nRenta actual: {{currentRent}}\nRenta propuesta: {{proposedRent}}\nAviso de aumento recibido el: {{noticeDate}}', 'No acepto el aumento tal como se propone. Le ruego que me indique por escrito cómo se ha calculado el nuevo importe y en qué se basa.\nEstoy dispuesto/a a hablar de esta alternativa: {{counterOffer}}', 'Responda dentro de los [ número de días ] días siguientes a la recepción de esta carta.', '[ copia del contrato de alquiler, aviso de aumento ]'],
    ['Reclamación de salarios pendientes', 'Periodo: {{period}}\nImporte pendiente: {{unpaidAmount}}\nDetalles:\n{{details}}', 'Le ruego que abone el importe pendiente y me envíe un desglose por escrito (nómina) del periodo indicado.', 'Pague o responda dentro de los {{deadlineDays}} días siguientes a la recepción de esta carta.', '[ contrato de trabajo, nóminas, extractos bancarios, registros de horas ]'],
    ['Solicitud de acceso a mis datos personales', 'Referencia de cuenta / cliente: {{accountRef}}\nDatos afectados: {{scope}}', 'Le ruego que me envíe:\n1. una copia de los datos personales que conserva sobre mí;\n2. los fines para los que se utilizan;\n3. con quién se han compartido o las categorías de destinatarios;\n4. cuánto tiempo se conservarán o cómo se decide ese plazo.\nEnvíe su respuesta a: {{replyTo}}', 'Responda dentro del plazo que exijan las normas que le sean aplicables y, a más tardar, en [ número de días ] días.', '[ documento de identidad, si lo solicita ]'],
    ['Solicitud de cancelación', 'Referencia del pedido / contrato: {{contractRef}}\nFecha de compra / inicio: {{purchaseDate}}\nDeseo cancelar con efecto desde: {{cancelDate}}', 'Le ruego que cancele el pedido / contrato indicado, confirme la cancelación por escrito y detenga cualquier cargo posterior.\nPetición adicional: {{request}}', 'Responda dentro de los [ número de días ] días siguientes a la recepción de esta carta.', '[ confirmación del pedido, factura, mensajes anteriores ]'],
  ],
  ar: [
    ['إشعار إنهاء', 'أُبلغكم بموجب هذا بإنهاء العقد التالي: {{contractType}}، المرجع {{contractRef}}.\nتاريخ الانتهاء المطلوب: {{endDate}}.\nالسبب: {{reason}}', 'يرجى تأكيد استلام هذا الإشعار وتاريخ الانتهاء كتابيًا، وإبلاغي بأي تسوية نهائية أو أشياء يجب إعادتها.', 'يرجى الرد خلال [ عدد الأيام ] يومًا من استلام هذه الرسالة.', '[ نسخة من العقد، المراسلات السابقة ]'],
    ['طلب استرداد مبلغ التأمين', 'العقار: {{property}}\nمبلغ التأمين المدفوع: {{depositAmount}}\nتم تسليم العقار بتاريخ {{handoverDate}}.', 'يرجى رد مبلغ التأمين كاملًا، أو إرسال قائمة مكتوبة ومفصلة بأي خصومات مع ما يثبتها.\nبيانات الدفع: {{paymentDetails}}', 'يرجى الدفع أو الرد خلال {{deadlineDays}} يومًا من استلام هذه الرسالة.', '[ إيصال التأمين، محضر التسليم، صور ]'],
    ['إشعار بعيب وطلب إصلاح', 'الشيء / العقار: {{item}}\nتاريخ ملاحظة العيب لأول مرة: {{noticedDate}}\nالمشكلة:\n{{problem}}', 'يرجى إصلاح العيب أو معالجته بطريقة أخرى وتأكيد موعد العمل كتابيًا.', 'يرجى الرد خلال {{deadlineDays}} يومًا من استلام هذه الرسالة.', '[ صور، مقاطع فيديو، فواتير، رسائل سابقة ]'],
    ['اعتراض على زيادة الإيجار المقترحة', 'العقار: {{property}}\nالإيجار الحالي: {{currentRent}}\nالإيجار المقترح: {{proposedRent}}\nتاريخ استلام إشعار الزيادة: {{noticeDate}}', 'لا أقبل الزيادة بالصيغة المقترحة. يرجى إرسال طريقة حساب المبلغ الجديد والأساس الذي يستند إليه كتابيًا.\nأنا مستعد لمناقشة البديل التالي: {{counterOffer}}', 'يرجى الرد خلال [ عدد الأيام ] يومًا من استلام هذه الرسالة.', '[ نسخة من عقد الإيجار، إشعار الزيادة ]'],
    ['طلب دفع الأجور المتأخرة', 'الفترة: {{period}}\nالمبلغ المستحق: {{unpaidAmount}}\nالتفاصيل:\n{{details}}', 'يرجى دفع المبلغ المستحق وإرسال كشف مكتوب (قسيمة راتب) عن الفترة المذكورة.', 'يرجى الدفع أو الرد خلال {{deadlineDays}} يومًا من استلام هذه الرسالة.', '[ عقد العمل، قسائم الرواتب، كشوف الحساب البنكي، سجلات الدوام ]'],
    ['طلب الاطلاع على بياناتي الشخصية', 'مرجع الحساب / العميل: {{accountRef}}\nالبيانات المعنية: {{scope}}', 'يرجى إرسال ما يلي:\n1. نسخة من البيانات الشخصية التي تحتفظون بها عني؛\n2. الأغراض التي تُستخدم من أجلها؛\n3. الجهات التي شوركت معها أو فئات المتلقين؛\n4. مدة الاحتفاظ بها أو كيفية تحديد هذه المدة.\nيرجى إرسال الرد إلى: {{replyTo}}', 'يرجى الرد خلال المدة التي تفرضها القواعد المطبقة عليكم، وفي موعد أقصاه [ عدد الأيام ] يومًا.', '[ إثبات الهوية، إذا طلبتموه ]'],
    ['طلب إلغاء', 'مرجع الطلب / العقد: {{contractRef}}\nتاريخ الشراء / البدء: {{purchaseDate}}\nأرغب في الإلغاء اعتبارًا من: {{cancelDate}}', 'يرجى إلغاء الطلب / العقد المذكور، وتأكيد الإلغاء كتابيًا، وإيقاف أي رسوم لاحقة.\nطلب إضافي: {{request}}', 'يرجى الرد خلال [ عدد الأيام ] يومًا من استلام هذه الرسالة.', '[ تأكيد الطلب، الفاتورة، الرسائل السابقة ]'],
  ],
  it: [
    ['Disdetta', 'Con la presente comunico la disdetta del seguente contratto: {{contractType}}, riferimento {{contractRef}}.\nData di cessazione richiesta: {{endDate}}.\nMotivo: {{reason}}', 'Vi prego di confermare per iscritto la ricezione di questa comunicazione e la data di cessazione, indicando eventuali conguagli finali o beni da restituire.', 'Vi prego di rispondere entro [ numero di giorni ] giorni dal ricevimento di questa lettera.', '[ copia del contratto, corrispondenza precedente ]'],
    ['Richiesta di restituzione del deposito cauzionale', 'Immobile: {{property}}\nDeposito versato: {{depositAmount}}\nL’immobile è stato riconsegnato il {{handoverDate}}.', 'Vi prego di restituire l’intero deposito, oppure di inviarmi per iscritto l’elenco dettagliato delle trattenute con i relativi giustificativi.\nDati di pagamento: {{paymentDetails}}', 'Vi prego di pagare o rispondere entro {{deadlineDays}} giorni dal ricevimento di questa lettera.', '[ ricevuta del deposito, verbale di riconsegna, foto ]'],
    ['Segnalazione di difetto e richiesta di riparazione', 'Bene / immobile: {{item}}\nNotato per la prima volta il: {{noticedDate}}\nProblema:\n{{problem}}', 'Vi prego di riparare o comunque eliminare il difetto e di confermarmi per iscritto una data per l’intervento.', 'Vi prego di rispondere entro {{deadlineDays}} giorni dal ricevimento di questa lettera.', '[ foto, video, fatture, messaggi precedenti ]'],
    ['Contestazione dell’aumento dell’affitto proposto', 'Immobile: {{property}}\nAffitto attuale: {{currentRent}}\nAffitto proposto: {{proposedRent}}\nComunicazione di aumento ricevuta il: {{noticeDate}}', 'Non accetto l’aumento così come proposto. Vi prego di indicarmi per iscritto come è stato calcolato il nuovo importo e su cosa si basa.\nSono disponibile a discutere questa alternativa: {{counterOffer}}', 'Vi prego di rispondere entro [ numero di giorni ] giorni dal ricevimento di questa lettera.', '[ copia del contratto di locazione, comunicazione di aumento ]'],
    ['Richiesta di pagamento delle retribuzioni arretrate', 'Periodo: {{period}}\nImporto dovuto: {{unpaidAmount}}\nDettagli:\n{{details}}', 'Vi prego di pagare l’importo dovuto e di inviarmi un prospetto scritto (busta paga) per il periodo indicato.', 'Vi prego di pagare o rispondere entro {{deadlineDays}} giorni dal ricevimento di questa lettera.', '[ contratto di lavoro, buste paga, estratti conto, fogli presenze ]'],
    ['Richiesta di accesso ai miei dati personali', 'Riferimento conto / cliente: {{accountRef}}\nDati interessati: {{scope}}', 'Vi prego di inviarmi:\n1. una copia dei dati personali che conservate su di me;\n2. le finalità per cui sono utilizzati;\n3. a chi sono stati comunicati o le categorie di destinatari;\n4. per quanto tempo saranno conservati o come viene stabilito tale periodo.\nInviate la risposta a: {{replyTo}}', 'Vi prego di rispondere entro il termine previsto dalle regole a voi applicabili e comunque entro [ numero di giorni ] giorni.', '[ documento d’identità, se richiesto ]'],
    ['Richiesta di annullamento', 'Riferimento ordine / contratto: {{contractRef}}\nData di acquisto / inizio: {{purchaseDate}}\nDesidero annullare con effetto dal: {{cancelDate}}', 'Vi prego di annullare l’ordine / il contratto indicato, di confermare l’annullamento per iscritto e di bloccare ulteriori addebiti.\nRichiesta aggiuntiva: {{request}}', 'Vi prego di rispondere entro [ numero di giorni ] giorni dal ricevimento di questa lettera.', '[ conferma d’ordine, fattura, messaggi precedenti ]'],
  ],
  zh: [
    ['终止通知', '本人特此通知终止以下合同：{{contractType}}，编号 {{contractRef}}。\n要求的终止日期：{{endDate}}。\n原因：{{reason}}', '请书面确认已收到本通知及终止日期，并告知任何最终结算或需归还的物品。', '请在收到本函之日起[ 天数 ]日内答复。', '[ 合同副本、此前往来记录 ]'],
    ['押金退还请求', '房产：{{property}}\n已付押金：{{depositAmount}}\n房产已于 {{handoverDate}} 交还。', '请全额退还押金，或书面提供逐项扣款清单及相关凭证。\n收款信息：{{paymentDetails}}', '请在收到本函之日起 {{deadlineDays}} 日内付款或答复。', '[ 押金收据、交接记录、照片 ]'],
    ['缺陷通知及维修请求', '物品 / 房产：{{item}}\n首次发现日期：{{noticedDate}}\n问题：\n{{problem}}', '请维修或以其他方式消除缺陷，并书面确认施工日期。', '请在收到本函之日起 {{deadlineDays}} 日内答复。', '[ 照片、视频、发票、此前消息 ]'],
    ['对拟议涨租的异议', '房产：{{property}}\n当前租金：{{currentRent}}\n拟议租金：{{proposedRent}}\n收到涨租通知日期：{{noticeDate}}', '本人不接受按所提方案涨租。请书面说明新金额的计算方式及依据。\n本人愿意商讨以下替代方案：{{counterOffer}}', '请在收到本函之日起[ 天数 ]日内答复。', '[ 租赁合同副本、涨租通知 ]'],
    ['欠薪支付请求', '期间：{{period}}\n欠付金额：{{unpaidAmount}}\n详情：\n{{details}}', '请支付欠付金额，并提供上述期间的书面工资明细（工资单）。', '请在收到本函之日起 {{deadlineDays}} 日内付款或答复。', '[ 劳动合同、工资单、银行流水、考勤记录 ]'],
    ['个人数据访问请求', '账户 / 客户编号：{{accountRef}}\n涉及数据：{{scope}}', '请向本人提供：\n1. 贵方持有的本人个人数据副本；\n2. 这些数据的使用目的；\n3. 已向哪些人或哪类接收方提供；\n4. 保存期限或确定期限的方式。\n请将答复发送至：{{replyTo}}', '请在适用于贵方的规则所要求的期限内答复，最迟不超过[ 天数 ]日。', '[ 身份证明（如贵方要求） ]'],
    ['取消请求', '订单 / 合同编号：{{contractRef}}\n购买 / 开始日期：{{purchaseDate}}\n希望取消的生效日期：{{cancelDate}}', '请取消上述订单 / 合同，书面确认取消，并停止任何后续扣费。\n其他请求：{{request}}', '请在收到本函之日起[ 天数 ]日内答复。', '[ 订单确认、发票、此前消息 ]'],
  ],
  ru: [
    ['Уведомление о расторжении', 'Настоящим уведомляю о прекращении следующего договора: {{contractType}}, номер {{contractRef}}.\nЖелаемая дата окончания: {{endDate}}.\nПричина: {{reason}}', 'Прошу письменно подтвердить получение уведомления и дату окончания, а также сообщить об окончательном расчёте или вещах, которые нужно вернуть.', 'Пожалуйста, ответьте в течение [ число дней ] дней с момента получения письма.', '[ копия договора, предыдущая переписка ]'],
    ['Требование о возврате залога', 'Объект: {{property}}\nВнесённый залог: {{depositAmount}}\nОбъект возвращён {{handoverDate}}.', 'Прошу вернуть залог полностью или направить мне письменный перечень удержаний по пунктам с подтверждающими документами.\nРеквизиты: {{paymentDetails}}', 'Пожалуйста, оплатите или ответьте в течение {{deadlineDays}} дней с момента получения письма.', '[ расписка о залоге, акт возврата, фото ]'],
    ['Уведомление о дефекте и просьба о ремонте', 'Вещь / объект: {{item}}\nВпервые обнаружено: {{noticedDate}}\nПроблема:\n{{problem}}', 'Прошу отремонтировать или иным образом устранить дефект и письменно подтвердить дату работ.', 'Пожалуйста, ответьте в течение {{deadlineDays}} дней с момента получения письма.', '[ фото, видео, счета, предыдущие сообщения ]'],
    ['Возражение против предложенного повышения аренды', 'Объект: {{property}}\nТекущая аренда: {{currentRent}}\nПредложенная аренда: {{proposedRent}}\nУведомление о повышении получено: {{noticeDate}}', 'Я не согласен(на) с повышением в предложенном виде. Прошу письменно сообщить, как рассчитана новая сумма и на чём она основана.\nГотов(а) обсудить следующий вариант: {{counterOffer}}', 'Пожалуйста, ответьте в течение [ число дней ] дней с момента получения письма.', '[ копия договора аренды, уведомление о повышении ]'],
    ['Требование о выплате задолженности по зарплате', 'Период: {{period}}\nСумма задолженности: {{unpaidAmount}}\nПодробности:\n{{details}}', 'Прошу выплатить задолженность и направить письменный расчёт (расчётный листок) за указанный период.', 'Пожалуйста, оплатите или ответьте в течение {{deadlineDays}} дней с момента получения письма.', '[ трудовой договор, расчётные листки, банковские выписки, табели ]'],
    ['Запрос на доступ к моим персональным данным', 'Номер аккаунта / клиента: {{accountRef}}\nКакие данные: {{scope}}', 'Прошу направить мне:\n1. копию персональных данных обо мне, которые вы храните;\n2. цели, для которых они используются;\n3. кому они были переданы или категории получателей;\n4. срок их хранения или порядок его определения.\nОтвет прошу направить: {{replyTo}}', 'Пожалуйста, ответьте в срок, установленный применимыми к вам правилами, но не позднее [ число дней ] дней.', '[ документ, удостоверяющий личность, если вы его запросите ]'],
    ['Заявление об отмене', 'Номер заказа / договора: {{contractRef}}\nДата покупки / начала: {{purchaseDate}}\nПрошу отменить с даты: {{cancelDate}}', 'Прошу отменить указанный заказ / договор, письменно подтвердить отмену и прекратить дальнейшие списания.\nДополнительная просьба: {{request}}', 'Пожалуйста, ответьте в течение [ число дней ] дней с момента получения письма.', '[ подтверждение заказа, счёт, предыдущие сообщения ]'],
  ],
  fa: [
    ['اعلام فسخ', 'بدین‌وسیله خاتمه قرارداد زیر را اعلام می‌کنم: {{contractType}}، شماره {{contractRef}}.\nتاریخ پایان درخواستی: {{endDate}}.\nدلیل: {{reason}}', 'لطفاً دریافت این اعلامیه و تاریخ پایان را کتبی تأیید کنید و درباره تسویه نهایی یا اقلامی که باید بازگردانده شود اطلاع دهید.', 'لطفاً ظرف [ تعداد روز ] روز از دریافت این نامه پاسخ دهید.', '[ نسخه قرارداد، مکاتبات قبلی ]'],
    ['درخواست استرداد ودیعه', 'ملک: {{property}}\nودیعه پرداخت‌شده: {{depositAmount}}\nملک در تاریخ {{handoverDate}} تحویل داده شد.', 'لطفاً کل ودیعه را بازگردانید یا فهرست کتبی و جزءبه‌جزء کسورات را همراه با مدارک ارسال کنید.\nاطلاعات پرداخت: {{paymentDetails}}', 'لطفاً ظرف {{deadlineDays}} روز از دریافت این نامه پرداخت کنید یا پاسخ دهید.', '[ رسید ودیعه، صورت‌جلسه تحویل، عکس‌ها ]'],
    ['اعلام عیب و درخواست تعمیر', 'کالا / ملک: {{item}}\nتاریخ اولین مشاهده: {{noticedDate}}\nمشکل:\n{{problem}}', 'لطفاً عیب را تعمیر یا به روش دیگری برطرف کنید و تاریخ انجام کار را کتبی اعلام کنید.', 'لطفاً ظرف {{deadlineDays}} روز از دریافت این نامه پاسخ دهید.', '[ عکس‌ها، ویدیوها، فاکتورها، پیام‌های قبلی ]'],
    ['اعتراض به افزایش پیشنهادی اجاره', 'ملک: {{property}}\nاجاره فعلی: {{currentRent}}\nاجاره پیشنهادی: {{proposedRent}}\nتاریخ دریافت اطلاعیه افزایش: {{noticeDate}}', 'افزایش را به شکل پیشنهادی نمی‌پذیرم. لطفاً نحوه محاسبه مبلغ جدید و مبنای آن را کتبی ارسال کنید.\nآماده گفت‌وگو درباره این گزینه هستم: {{counterOffer}}', 'لطفاً ظرف [ تعداد روز ] روز از دریافت این نامه پاسخ دهید.', '[ نسخه قرارداد اجاره، اطلاعیه افزایش ]'],
    ['درخواست پرداخت دستمزد معوق', 'دوره: {{period}}\nمبلغ معوق: {{unpaidAmount}}\nجزئیات:\n{{details}}', 'لطفاً مبلغ معوق را پرداخت کنید و ریز حساب کتبی (فیش حقوقی) دوره فوق را ارسال کنید.', 'لطفاً ظرف {{deadlineDays}} روز از دریافت این نامه پرداخت کنید یا پاسخ دهید.', '[ قرارداد کار، فیش‌های حقوقی، صورت‌حساب بانکی، کارت ساعت ]'],
    ['درخواست دسترسی به داده‌های شخصی من', 'شماره حساب / مشتری: {{accountRef}}\nداده‌های مورد نظر: {{scope}}', 'لطفاً موارد زیر را برایم ارسال کنید:\n1. نسخه‌ای از داده‌های شخصی که از من نگه می‌دارید؛\n2. اهدافی که این داده‌ها برای آن استفاده می‌شوند؛\n3. اشخاص یا دسته‌های گیرندگانی که داده‌ها با آن‌ها به اشتراک گذاشته شده؛\n4. مدت نگهداری یا نحوه تعیین این مدت.\nپاسخ را به این نشانی بفرستید: {{replyTo}}', 'لطفاً در مهلتی که قواعد حاکم بر شما تعیین کرده و حداکثر ظرف [ تعداد روز ] روز پاسخ دهید.', '[ مدرک شناسایی، در صورت درخواست شما ]'],
    ['درخواست لغو', 'شماره سفارش / قرارداد: {{contractRef}}\nتاریخ خرید / شروع: {{purchaseDate}}\nمایلم از این تاریخ لغو شود: {{cancelDate}}', 'لطفاً سفارش / قرارداد فوق را لغو کنید، لغو را کتبی تأیید کنید و هرگونه برداشت بعدی را متوقف کنید.\nدرخواست تکمیلی: {{request}}', 'لطفاً ظرف [ تعداد روز ] روز از دریافت این نامه پاسخ دهید.', '[ تأییدیه سفارش، فاکتور، پیام‌های قبلی ]'],
  ],
  ja: [
    ['解約通知', '下記の契約を終了することを通知いたします：{{contractType}}、番号 {{contractRef}}。\n希望する終了日：{{endDate}}。\n理由：{{reason}}', '本通知と終了日を受領した旨を書面でご確認のうえ、最終精算や返却物があればお知らせください。', '本書面の受領から[ 日数 ]日以内にご回答ください。', '[ 契約書の写し、これまでのやり取り ]'],
    ['敷金・保証金の返還請求', '物件：{{property}}\n支払った敷金：{{depositAmount}}\n物件は {{handoverDate}} に明け渡しました。', '敷金を全額返還いただくか、控除がある場合はその明細を根拠資料とともに書面でお送りください。\n振込先：{{paymentDetails}}', '本書面の受領から {{deadlineDays}} 日以内にお支払いまたはご回答ください。', '[ 敷金の領収書、明け渡し記録、写真 ]'],
    ['不具合の通知と修理のお願い', '対象物・物件：{{item}}\n最初に気づいた日：{{noticedDate}}\n問題：\n{{problem}}', '不具合を修理または解消していただき、作業日を書面でご連絡ください。', '本書面の受領から {{deadlineDays}} 日以内にご回答ください。', '[ 写真、動画、請求書、これまでのメッセージ ]'],
    ['賃料値上げ提案への異議', '物件：{{property}}\n現行賃料：{{currentRent}}\n提案賃料：{{proposedRent}}\n値上げ通知の受領日：{{noticeDate}}', '提案どおりの値上げには同意できません。新しい金額の計算方法と根拠を書面でお示しください。\n次の代案について話し合う用意があります：{{counterOffer}}', '本書面の受領から[ 日数 ]日以内にご回答ください。', '[ 賃貸借契約書の写し、値上げ通知 ]'],
    ['未払い賃金の支払請求', '期間：{{period}}\n未払い額：{{unpaidAmount}}\n詳細：\n{{details}}', '未払い額をお支払いのうえ、上記期間の明細（給与明細）を書面でお送りください。', '本書面の受領から {{deadlineDays}} 日以内にお支払いまたはご回答ください。', '[ 雇用契約書、給与明細、銀行取引明細、勤怠記録 ]'],
    ['個人データの開示請求', 'アカウント・顧客番号：{{accountRef}}\n対象データ：{{scope}}', '以下をお送りください：\n1. 貴社が保有する私の個人データの写し\n2. その利用目的\n3. 提供先、または提供先の区分\n4. 保存期間、またはその決め方\n回答の送付先：{{replyTo}}', '貴社に適用されるルールで定められた期間内に、遅くとも[ 日数 ]日以内にご回答ください。', '[ 本人確認書類（ご要望があれば） ]'],
    ['キャンセルの申し入れ', '注文・契約番号：{{contractRef}}\n購入日・開始日：{{purchaseDate}}\nキャンセルの効力発生日：{{cancelDate}}', '上記の注文・契約をキャンセルし、その旨を書面でご確認のうえ、今後の請求を停止してください。\n追加の要望：{{request}}', '本書面の受領から[ 日数 ]日以内にご回答ください。', '[ 注文確認書、請求書、これまでのメッセージ ]'],
  ],
  pt: [
    ['Rescisão', 'Venho por este meio comunicar que ponho termo ao seguinte contrato: {{contractType}}, referência {{contractRef}}.\nData de fim pretendida: {{endDate}}.\nMotivo: {{reason}}', 'Peço que confirme por escrito a receção desta comunicação e a data de fim, e que me indique qualquer acerto final ou bens a devolver.', 'Responda no prazo de [ número de dias ] dias após a receção desta carta.', '[ cópia do contrato, correspondência anterior ]'],
    ['Pedido de devolução da caução', 'Imóvel: {{property}}\nCaução paga: {{depositAmount}}\nO imóvel foi entregue em {{handoverDate}}.', 'Peço que devolva a caução na totalidade ou me envie por escrito a lista discriminada de eventuais descontos, com comprovativos.\nDados de pagamento: {{paymentDetails}}', 'Pague ou responda no prazo de {{deadlineDays}} dias após a receção desta carta.', '[ recibo da caução, auto de entrega, fotos ]'],
    ['Aviso de defeito e pedido de reparação', 'Bem / imóvel: {{item}}\nDetetado pela primeira vez em: {{noticedDate}}\nProblema:\n{{problem}}', 'Peço que repare ou corrija o defeito e me confirme por escrito uma data para a intervenção.', 'Responda no prazo de {{deadlineDays}} dias após a receção desta carta.', '[ fotos, vídeos, faturas, mensagens anteriores ]'],
    ['Oposição ao aumento de renda proposto', 'Imóvel: {{property}}\nRenda atual: {{currentRent}}\nRenda proposta: {{proposedRent}}\nAviso de aumento recebido em: {{noticeDate}}', 'Não aceito o aumento tal como proposto. Peço que me indique por escrito como foi calculado o novo valor e em que se baseia.\nEstou disponível para discutir esta alternativa: {{counterOffer}}', 'Responda no prazo de [ número de dias ] dias após a receção desta carta.', '[ cópia do contrato de arrendamento, aviso de aumento ]'],
    ['Pedido de pagamento de salários em atraso', 'Período: {{period}}\nValor em atraso: {{unpaidAmount}}\nDetalhes:\n{{details}}', 'Peço que pague o valor em atraso e me envie uma discriminação escrita (recibo de vencimento) do período indicado.', 'Pague ou responda no prazo de {{deadlineDays}} dias após a receção desta carta.', '[ contrato de trabalho, recibos de vencimento, extratos bancários, registos de horas ]'],
    ['Pedido de acesso aos meus dados pessoais', 'Referência de conta / cliente: {{accountRef}}\nDados em causa: {{scope}}', 'Peço que me envie:\n1. uma cópia dos dados pessoais que conserva sobre mim;\n2. as finalidades para que são utilizados;\n3. com quem foram partilhados ou as categorias de destinatários;\n4. durante quanto tempo serão conservados ou como esse prazo é definido.\nEnvie a resposta para: {{replyTo}}', 'Responda no prazo exigido pelas regras que lhe são aplicáveis e, no máximo, em [ número de dias ] dias.', '[ comprovativo de identidade, se o solicitar ]'],
    ['Pedido de cancelamento', 'Referência da encomenda / contrato: {{contractRef}}\nData de compra / início: {{purchaseDate}}\nPretendo cancelar com efeito a partir de: {{cancelDate}}', 'Peço que cancele a encomenda / contrato acima, confirme o cancelamento por escrito e pare quaisquer cobranças posteriores.\nPedido adicional: {{request}}', 'Responda no prazo de [ número de dias ] dias após a receção desta carta.', '[ confirmação da encomenda, fatura, mensagens anteriores ]'],
  ],
  nl: [
    ['Opzegging', 'Hierbij zeg ik de volgende overeenkomst op: {{contractType}}, referentie {{contractRef}}.\nGewenste einddatum: {{endDate}}.\nReden: {{reason}}', 'Graag ontvang ik een schriftelijke bevestiging van deze opzegging en de einddatum, en informatie over een eventuele eindafrekening of terug te geven zaken.', 'Reageer binnen [ aantal dagen ] dagen na ontvangst van deze brief.', '[ kopie van de overeenkomst, eerdere correspondentie ]'],
    ['Verzoek om terugbetaling van de borg', 'Woning: {{property}}\nBetaalde borg: {{depositAmount}}\nDe woning is op {{handoverDate}} opgeleverd.', 'Ik verzoek u de borg volledig terug te betalen, of mij schriftelijk een gespecificeerde lijst van inhoudingen met onderbouwing te sturen.\nBetaalgegevens: {{paymentDetails}}', 'Betaal of reageer binnen {{deadlineDays}} dagen na ontvangst van deze brief.', '[ betaalbewijs borg, opleveringsrapport, foto’s ]'],
    ['Melding van een gebrek en verzoek om herstel', 'Product / woning: {{item}}\nVoor het eerst opgemerkt op: {{noticedDate}}\nProbleem:\n{{problem}}', 'Ik verzoek u het gebrek te herstellen of op een andere manier op te lossen en mij schriftelijk een datum voor de werkzaamheden te bevestigen.', 'Reageer binnen {{deadlineDays}} dagen na ontvangst van deze brief.', '[ foto’s, video’s, facturen, eerdere berichten ]'],
    ['Bezwaar tegen de voorgestelde huurverhoging', 'Woning: {{property}}\nHuidige huur: {{currentRent}}\nVoorgestelde huur: {{proposedRent}}\nVerhogingsbrief ontvangen op: {{noticeDate}}', 'Ik ga niet akkoord met de verhoging zoals voorgesteld. Graag ontvang ik schriftelijk hoe het nieuwe bedrag is berekend en waarop het is gebaseerd.\nIk wil graag het volgende alternatief bespreken: {{counterOffer}}', 'Reageer binnen [ aantal dagen ] dagen na ontvangst van deze brief.', '[ kopie van het huurcontract, verhogingsbrief ]'],
    ['Verzoek om betaling van achterstallig loon', 'Periode: {{period}}\nOpenstaand bedrag: {{unpaidAmount}}\nDetails:\n{{details}}', 'Ik verzoek u het openstaande bedrag te betalen en mij een schriftelijke specificatie (loonstrook) over de genoemde periode te sturen.', 'Betaal of reageer binnen {{deadlineDays}} dagen na ontvangst van deze brief.', '[ arbeidscontract, loonstroken, bankafschriften, urenregistratie ]'],
    ['Verzoek om inzage in mijn persoonsgegevens', 'Account- / klantnummer: {{accountRef}}\nBetreffende gegevens: {{scope}}', 'Graag ontvang ik:\n1. een kopie van de persoonsgegevens die u over mij bewaart;\n2. de doelen waarvoor ze worden gebruikt;\n3. met wie ze zijn gedeeld, of de categorieën ontvangers;\n4. hoe lang ze worden bewaard, of hoe die termijn wordt bepaald.\nStuur uw antwoord naar: {{replyTo}}', 'Reageer binnen de termijn die de voor u geldende regels voorschrijven, en uiterlijk binnen [ aantal dagen ] dagen.', '[ identiteitsbewijs, als u daarom vraagt ]'],
    ['Verzoek tot annulering', 'Bestel- / contractnummer: {{contractRef}}\nAankoop- / begindatum: {{purchaseDate}}\nIk wil annuleren met ingang van: {{cancelDate}}', 'Ik verzoek u de bovengenoemde bestelling / overeenkomst te annuleren, de annulering schriftelijk te bevestigen en verdere afschrijvingen te stoppen.\nAanvullend verzoek: {{request}}', 'Reageer binnen [ aantal dagen ] dagen na ontvangst van deze brief.', '[ orderbevestiging, factuur, eerdere berichten ]'],
  ],
};

function letter(lang, [subject, facts, request, deadline, attach]) {
  const h = H[lang];
  const s = h.sep;
  return [
    `${h.from}${s}{{from}}`,
    `${h.to}${s}{{to}}`,
    `${h.subject}${s}${subject}`,
    '',
    `${h.facts}${s.trimEnd()}`,
    facts,
    '',
    `${h.request}${s}${request}`,
    `${h.deadline}${s}${deadline}`,
    '',
    `${h.attach}${s}${attach}`,
    h.date,
    `${h.sign}${s}{{from}}`,
  ].join('\n');
}

UNIVERSAL_IDS.forEach((id, index) => {
  const pick = (table) => Object.fromEntries(langs.map((lang) => [lang, table[lang][index]]));
  set(`draftU_${id}_title`, pick(TITLES));
  set(`draftU_${id}_desc`, pick(DESCS));
  set(`draftU_${id}_body`, Object.fromEntries(langs.map((lang) => [lang, letter(lang, B[lang][index])])));
});

const out = {};
for (const lang of langs) {
  out[lang] = {};
  for (const key of Object.keys(T)) {
    const value = T[key][lang];
    if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${lang} translation for ${key}`);
    out[lang][key] = value;
  }
}
const file = `// WAVE JP.2 — Jurisdiction availability, universal calculators and letters. Same key set in all 13 languages.\n\nexport const WAVE_JP2_I18N = ${JSON.stringify(out, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'i18n.wavejp2.js'), file, 'utf8');
console.log('Wrote i18n.wavejp2.js keys=', Object.keys(T).length, 'langs=', langs.length);
