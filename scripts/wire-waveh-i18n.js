// WAVE H: adds the sample-contract keys to i18n.js for the 13 languages (idempotent).
// Run once:  node scripts/wire-waveh-i18n.js
const fs = require('fs');

const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];

const D = {
  tr: {
    hSampleBtn: 'Örnek sözleşmeyi dene',
    hSampleLoaded: 'Örnek yüklendi. Aşağıdan tarafınızı seçip Analiz Et’e dokunun. İlk örnek ücretsiz hakkınızdan düşmez.',
    hSampleDone: 'Bu bir örnekti. Şimdi kendi sözleşmenizi tarayın veya yapıştırın; neler sakladığını görün.',
    hSampleText: [
      'ÖRNEK SERBEST ÇALIŞAN HİZMET SÖZLEŞMESİ',
      '',
      'Taraflar: MÜŞTERİ ve SERBEST ÇALIŞAN.',
      '1. Hizmet: Serbest çalışan, müşterinin zaman zaman bildireceği taleplere göre müşterinin web sitesini tasarlayıp geliştirir.',
      '2. Ücret: Toplam ücret 60.000 TL’dir ve nihai tesliminden 90 gün sonra ödenir. Gecikmeye faiz işletilmez.',
      '3. Revizyon: Serbest çalışan, müşteri kendi takdirine göre tam memnun kalana kadar ek ücret almadan sınırsız revizyon yapar.',
      '4. Fikri haklar: Serbest çalışanın önceden var olan materyalleri dahil tüm çalışmalar, ücret ödenip ödenmediğine bakılmaksızın ilk günden itibaren müşteriye aittir.',
      '5. Fesih: Müşteri dilediği zaman bildirimsiz ve yapılan işin bedelini ödemeden feshedebilir. Serbest çalışan ancak 90 gün önceden yazılı bildirimle feshedebilir.',
      '6. Sorumluluk: Serbest çalışan, müşterinin tüm doğrudan ve dolaylı zararlarından sınırsız olarak sorumludur.',
      '7. Yenileme: Serbest çalışan bitişten en az 6 ay önce yazılı olarak iptal etmedikçe sözleşme 12 ay süreyle otomatik yenilenir.',
      '8. Uyuşmazlık: Yalnızca müşterinin yerleşim yeri mahkemeleri yetkilidir; tüm hukuki masrafları serbest çalışan öder.',
    ],
  },
  en: {
    hSampleBtn: 'Try a sample contract',
    hSampleLoaded: 'Sample loaded. Choose your side below, then tap Analyze. Your first sample does not use a free analysis.',
    hSampleDone: 'That was a sample. Now scan or paste your own contract to see what it hides.',
    hSampleText: [
      'SAMPLE FREELANCE SERVICES AGREEMENT',
      '',
      'Parties: the CLIENT and the FREELANCER.',
      '1. Services: The Freelancer will design and build the Client’s website as the Client describes from time to time.',
      '2. Fee: The total fee is 3,000 EUR, payable 90 days after final delivery. Late payment carries no interest.',
      '3. Revisions: The Freelancer will make unlimited revisions at no extra charge until the Client is fully satisfied, in the Client’s sole judgment.',
      '4. Intellectual property: All work, including the Freelancer’s pre-existing materials, belongs to the Client from the first day, whether or not the fee has been paid.',
      '5. Termination: The Client may terminate at any time without notice and without paying for work done. The Freelancer may terminate only with 90 days’ written notice.',
      '6. Liability: The Freelancer is liable without limit for all direct and indirect losses of the Client.',
      '7. Renewal: This agreement renews automatically for 12 months unless the Freelancer cancels in writing at least 6 months before the end.',
      '8. Disputes: Only the courts where the Client lives have jurisdiction, and the Freelancer pays all legal costs.',
    ],
  },
  de: {
    hSampleBtn: 'Beispielvertrag testen',
    hSampleLoaded: 'Beispiel geladen. Wählen Sie unten Ihre Seite und tippen Sie auf Analysieren. Das erste Beispiel verbraucht keine Gratis-Analyse.',
    hSampleDone: 'Das war ein Beispiel. Scannen oder fügen Sie jetzt Ihren eigenen Vertrag ein, um zu sehen, was darin steckt.',
    hSampleText: [
      'MUSTER-DIENSTLEISTUNGSVERTRAG FÜR FREIBERUFLER',
      '',
      'Parteien: der AUFTRAGGEBER und der FREIBERUFLER.',
      '1. Leistung: Der Freiberufler gestaltet und erstellt die Website des Auftraggebers nach dessen jeweiligen Vorgaben.',
      '2. Vergütung: Die Gesamtvergütung beträgt 3.000 EUR und ist 90 Tage nach der Endabnahme fällig. Für Zahlungsverzug fallen keine Zinsen an.',
      '3. Änderungen: Der Freiberufler nimmt unbegrenzt viele Änderungen ohne Mehrkosten vor, bis der Auftraggeber nach eigenem Ermessen vollständig zufrieden ist.',
      '4. Urheberrechte: Sämtliche Arbeitsergebnisse, einschließlich bereits vorhandener Materialien des Freiberuflers, gehören dem Auftraggeber ab dem ersten Tag, unabhängig davon, ob die Vergütung bezahlt wurde.',
      '5. Kündigung: Der Auftraggeber kann jederzeit ohne Frist und ohne Vergütung der geleisteten Arbeit kündigen. Der Freiberufler kann nur mit einer schriftlichen Frist von 90 Tagen kündigen.',
      '6. Haftung: Der Freiberufler haftet unbegrenzt für alle direkten und indirekten Schäden des Auftraggebers.',
      '7. Verlängerung: Der Vertrag verlängert sich automatisch um 12 Monate, sofern der Freiberufler nicht mindestens 6 Monate vor Ablauf schriftlich kündigt.',
      '8. Streitigkeiten: Ausschließlich die Gerichte am Wohnsitz des Auftraggebers sind zuständig; der Freiberufler trägt alle Rechtskosten.',
    ],
  },
  fr: {
    hSampleBtn: 'Essayer un contrat exemple',
    hSampleLoaded: 'Exemple chargé. Choisissez votre camp ci-dessous, puis touchez Analyser. Le premier exemple ne consomme pas d’analyse gratuite.',
    hSampleDone: 'C’était un exemple. Scannez ou collez maintenant votre propre contrat pour voir ce qu’il cache.',
    hSampleText: [
      'EXEMPLE DE CONTRAT DE PRESTATION DE SERVICES FREELANCE',
      '',
      'Parties : le CLIENT et le PRESTATAIRE INDÉPENDANT.',
      '1. Mission : le prestataire conçoit et développe le site web du client selon les demandes que celui-ci formulera au fil du temps.',
      '2. Prix : le prix total est de 3 000 EUR, payable 90 jours après la livraison finale. Aucun intérêt n’est dû en cas de retard.',
      '3. Révisions : le prestataire effectue des révisions illimitées sans supplément, jusqu’à ce que le client soit entièrement satisfait, à sa seule appréciation.',
      '4. Propriété intellectuelle : tous les travaux, y compris les éléments préexistants du prestataire, appartiennent au client dès le premier jour, que le prix soit payé ou non.',
      '5. Résiliation : le client peut résilier à tout moment, sans préavis et sans payer le travail effectué. Le prestataire ne peut résilier qu’avec un préavis écrit de 90 jours.',
      '6. Responsabilité : le prestataire est responsable sans limite de tous les dommages directs et indirects du client.',
      '7. Renouvellement : le contrat se renouvelle automatiquement pour 12 mois, sauf résiliation écrite du prestataire au moins 6 mois avant l’échéance.',
      '8. Litiges : seuls les tribunaux du domicile du client sont compétents ; le prestataire supporte tous les frais de justice.',
    ],
  },
  es: {
    hSampleBtn: 'Probar un contrato de ejemplo',
    hSampleLoaded: 'Ejemplo cargado. Elija su parte abajo y toque Analizar. El primer ejemplo no gasta un análisis gratuito.',
    hSampleDone: 'Eso era un ejemplo. Ahora escanee o pegue su propio contrato para ver qué esconde.',
    hSampleText: [
      'EJEMPLO DE CONTRATO DE SERVICIOS FREELANCE',
      '',
      'Partes: el CLIENTE y el PROFESIONAL AUTÓNOMO.',
      '1. Servicios: el profesional diseñará y desarrollará el sitio web del cliente según las indicaciones que este vaya comunicando.',
      '2. Honorarios: el precio total es de 3.000 EUR, pagadero 90 días después de la entrega final. El retraso en el pago no devenga intereses.',
      '3. Revisiones: el profesional realizará revisiones ilimitadas sin coste adicional hasta que el cliente quede plenamente satisfecho, a su exclusivo criterio.',
      '4. Propiedad intelectual: todo el trabajo, incluidos los materiales previos del profesional, pertenece al cliente desde el primer día, se haya pagado o no el precio.',
      '5. Resolución: el cliente puede resolver en cualquier momento, sin preaviso y sin pagar el trabajo realizado. El profesional solo puede resolver con 90 días de preaviso por escrito.',
      '6. Responsabilidad: el profesional responde sin límite de todos los daños directos e indirectos del cliente.',
      '7. Renovación: el contrato se renueva automáticamente por 12 meses salvo que el profesional lo cancele por escrito al menos 6 meses antes del vencimiento.',
      '8. Controversias: solo son competentes los tribunales del domicilio del cliente; el profesional asume todas las costas.',
    ],
  },
  ar: {
    hSampleBtn: 'جرّب عقدًا تجريبيًا',
    hSampleLoaded: 'تم تحميل النموذج. اختر جانبك أدناه ثم اضغط تحليل. النموذج الأول لا يستهلك تحليلًا مجانيًا.',
    hSampleDone: 'كان ذلك نموذجًا. الآن امسح عقدك الخاص ضوئيًا أو الصقه لترى ما يخفيه.',
    hSampleText: [
      'نموذج عقد خدمات لمستقل (مثال)',
      '',
      'الأطراف: العميل والمستقل.',
      '1. الخدمات: يصمم المستقل موقع العميل الإلكتروني ويطوره وفقًا لطلبات العميل التي يحددها من وقت لآخر.',
      '2. الأتعاب: إجمالي الأتعاب 12,000 درهم، تُدفع بعد 90 يومًا من التسليم النهائي. لا تُحتسب أي فوائد على التأخر في السداد.',
      '3. التعديلات: يجري المستقل تعديلات غير محدودة دون أي رسوم إضافية إلى أن يرضى العميل تمامًا، وفق تقديره وحده.',
      '4. الملكية الفكرية: تؤول جميع الأعمال، بما فيها المواد السابقة للمستقل، إلى العميل منذ اليوم الأول سواء دُفعت الأتعاب أم لا.',
      '5. الإنهاء: يجوز للعميل إنهاء العقد في أي وقت دون إشعار ودون دفع مقابل العمل المنجز. ولا يجوز للمستقل الإنهاء إلا بإشعار كتابي مدته 90 يومًا.',
      '6. المسؤولية: يتحمل المستقل مسؤولية غير محدودة عن جميع أضرار العميل المباشرة وغير المباشرة.',
      '7. التجديد: يتجدد العقد تلقائيًا لمدة 12 شهرًا ما لم يلغه المستقل كتابةً قبل 6 أشهر على الأقل من انتهائه.',
      '8. النزاعات: تختص محاكم موطن العميل وحدها بالنظر في النزاعات، ويتحمل المستقل جميع التكاليف القانونية.',
    ],
  },
  it: {
    hSampleBtn: 'Prova un contratto di esempio',
    hSampleLoaded: 'Esempio caricato. Scegli la tua parte qui sotto e tocca Analizza. Il primo esempio non usa un’analisi gratuita.',
    hSampleDone: 'Era un esempio. Ora scansiona o incolla il tuo contratto per scoprire cosa nasconde.',
    hSampleText: [
      'ESEMPIO DI CONTRATTO DI SERVIZI PER LIBERO PROFESSIONISTA',
      '',
      'Parti: il COMMITTENTE e il PROFESSIONISTA.',
      '1. Servizi: il professionista progetta e sviluppa il sito web del committente secondo le richieste che questi comunicherà di volta in volta.',
      '2. Compenso: il compenso totale è di 3.000 EUR, pagabile 90 giorni dopo la consegna finale. In caso di ritardo non maturano interessi.',
      '3. Revisioni: il professionista effettua revisioni illimitate senza costi aggiuntivi finché il committente non sia pienamente soddisfatto, a suo insindacabile giudizio.',
      '4. Proprietà intellettuale: tutti i lavori, compresi i materiali preesistenti del professionista, appartengono al committente dal primo giorno, indipendentemente dal pagamento del compenso.',
      '5. Recesso: il committente può recedere in qualsiasi momento senza preavviso e senza pagare il lavoro svolto. Il professionista può recedere solo con 90 giorni di preavviso scritto.',
      '6. Responsabilità: il professionista risponde senza limiti di tutti i danni diretti e indiretti del committente.',
      '7. Rinnovo: il contratto si rinnova automaticamente per 12 mesi, salvo disdetta scritta del professionista almeno 6 mesi prima della scadenza.',
      '8. Controversie: sono competenti esclusivamente i tribunali del luogo di residenza del committente; il professionista sostiene tutte le spese legali.',
    ],
  },
  zh: {
    hSampleBtn: '试用示例合同',
    hSampleLoaded: '示例已加载。请在下方选择您的立场,然后点击分析。首个示例不会消耗免费分析次数。',
    hSampleDone: '刚才是示例。现在扫描或粘贴您自己的合同,看看其中隐藏了什么。',
    hSampleText: [
      '自由职业服务合同(示例)',
      '',
      '双方:委托方与自由职业者。',
      '1. 服务内容:自由职业者按委托方不时提出的要求,为委托方设计并开发网站。',
      '2. 报酬:总报酬为人民币20,000元,在最终交付后90天支付。逾期付款不计利息。',
      '3. 修改:自由职业者须无限次免费修改,直至委托方自行判断完全满意为止。',
      '4. 知识产权:所有成果,包括自由职业者已有的素材,自第一天起归委托方所有,无论报酬是否已支付。',
      '5. 解除:委托方可随时解除合同,无需通知,也无需支付已完成工作的报酬。自由职业者只能提前90天书面通知解除。',
      '6. 责任:自由职业者对委托方的一切直接和间接损失承担无限责任。',
      '7. 续期:除非自由职业者在期满前至少6个月书面取消,本合同自动续期12个月。',
      '8. 争议:仅委托方所在地法院有管辖权,自由职业者承担全部法律费用。',
    ],
  },
  ru: {
    hSampleBtn: 'Попробовать пример договора',
    hSampleLoaded: 'Пример загружен. Выберите свою сторону ниже и нажмите «Анализ». Первый пример не расходует бесплатный анализ.',
    hSampleDone: 'Это был пример. Теперь отсканируйте или вставьте свой договор, чтобы увидеть, что в нём скрыто.',
    hSampleText: [
      'ОБРАЗЕЦ ДОГОВОРА ОКАЗАНИЯ УСЛУГ С ФРИЛАНСЕРОМ',
      '',
      'Стороны: ЗАКАЗЧИК и ФРИЛАНСЕР.',
      '1. Услуги: фрилансер разрабатывает и создаёт сайт заказчика в соответствии с требованиями, которые заказчик сообщает по мере необходимости.',
      '2. Оплата: общая стоимость составляет 250 000 руб. и выплачивается через 90 дней после окончательной сдачи. Проценты за просрочку не начисляются.',
      '3. Правки: фрилансер вносит неограниченное число правок без доплаты, пока заказчик по своему усмотрению не будет полностью доволен.',
      '4. Интеллектуальная собственность: все результаты работы, включая ранее созданные материалы фрилансера, принадлежат заказчику с первого дня независимо от того, оплачено ли вознаграждение.',
      '5. Расторжение: заказчик может расторгнуть договор в любое время без уведомления и без оплаты выполненной работы. Фрилансер может расторгнуть его только с письменным уведомлением за 90 дней.',
      '6. Ответственность: фрилансер несёт неограниченную ответственность за все прямые и косвенные убытки заказчика.',
      '7. Продление: договор автоматически продлевается на 12 месяцев, если фрилансер не отменит его письменно не позднее чем за 6 месяцев до окончания срока.',
      '8. Споры: подсудность определяется исключительно по месту нахождения заказчика; фрилансер несёт все судебные расходы.',
    ],
  },
  fa: {
    hSampleBtn: 'امتحان با قرارداد نمونه',
    hSampleLoaded: 'نمونه بارگذاری شد. طرف خود را در پایین انتخاب کنید و روی تحلیل بزنید. نمونهٔ اول از تحلیل رایگان شما کم نمی‌کند.',
    hSampleDone: 'آن یک نمونه بود. حالا قرارداد خودتان را اسکن یا جای‌گذاری کنید تا ببینید چه چیزی در آن پنهان است.',
    hSampleText: [
      'نمونه قرارداد خدمات فریلنسری',
      '',
      'طرفین: کارفرما و فریلنسر.',
      '۱. خدمات: فریلنسر وب‌سایت کارفرما را مطابق درخواست‌هایی که کارفرما هر زمان اعلام کند طراحی و توسعه می‌دهد.',
      '۲. دستمزد: کل دستمزد ۳۰۰ میلیون ریال است و ۹۰ روز پس از تحویل نهایی پرداخت می‌شود. برای تأخیر در پرداخت هیچ بهره‌ای محاسبه نمی‌شود.',
      '۳. اصلاحات: فریلنسر باید بدون دریافت هزینه اضافه، به‌تعداد نامحدود اصلاحات را انجام دهد تا کارفرما به‌صلاحدید خودش کاملاً راضی شود.',
      '۴. مالکیت فکری: همه آثار، از جمله مواد قبلی فریلنسر، از روز اول متعلق به کارفرما است، چه دستمزد پرداخت شده باشد چه نشده باشد.',
      '۵. فسخ: کارفرما هر زمان می‌تواند بدون اطلاع قبلی و بدون پرداخت بابت کار انجام‌شده قرارداد را فسخ کند. فریلنسر فقط با اطلاع کتبی ۹۰ روزه می‌تواند فسخ کند.',
      '۶. مسئولیت: فریلنسر بدون سقف در برابر همه خسارت‌های مستقیم و غیرمستقیم کارفرما مسئول است.',
      '۷. تمدید: قرارداد به‌طور خودکار برای ۱۲ ماه تمدید می‌شود مگر اینکه فریلنسر دست‌کم ۶ ماه پیش از پایان آن را کتباً لغو کند.',
      '۸. اختلافات: فقط دادگاه‌های محل اقامت کارفرما صالح‌اند و فریلنسر همه هزینه‌های حقوقی را می‌پردازد.',
    ],
  },
  ja: {
    hSampleBtn: 'サンプル契約を試す',
    hSampleLoaded: 'サンプルを読み込みました。下で立場を選び、分析をタップしてください。最初のサンプルは無料分析を消費しません。',
    hSampleDone: 'これはサンプルでした。次はご自身の契約書をスキャンまたは貼り付けて、何が隠れているか確認しましょう。',
    hSampleText: [
      'フリーランス業務委託契約書(サンプル)',
      '',
      '当事者:委託者とフリーランス。',
      '1. 業務内容:フリーランスは、委託者が随時指示する内容に従い、委託者のウェブサイトを設計・開発する。',
      '2. 報酬:報酬総額は450,000円とし、最終納品の90日後に支払う。支払遅延に利息は生じない。',
      '3. 修正:フリーランスは、委託者が自己の判断で完全に満足するまで、追加費用なしで無制限に修正を行う。',
      '4. 知的財産権:フリーランスの既存の素材を含むすべての成果物は、報酬の支払いの有無にかかわらず、初日から委託者に帰属する。',
      '5. 解除:委託者はいつでも予告なく、また既に行われた業務の対価を支払うことなく解除できる。フリーランスは90日前の書面通知がある場合に限り解除できる。',
      '6. 責任:フリーランスは、委託者の直接損害および間接損害のすべてについて、上限なく責任を負う。',
      '7. 更新:フリーランスが期間満了の6か月前までに書面で解約しない限り、本契約は12か月間自動的に更新される。',
      '8. 紛争:委託者の所在地の裁判所のみを管轄裁判所とし、法的費用はすべてフリーランスが負担する。',
    ],
  },
  pt: {
    hSampleBtn: 'Experimentar um contrato de exemplo',
    hSampleLoaded: 'Exemplo carregado. Escolha o seu lado abaixo e toque em Analisar. O primeiro exemplo não gasta uma análise gratuita.',
    hSampleDone: 'Isso foi um exemplo. Agora digitalize ou cole o seu próprio contrato para ver o que ele esconde.',
    hSampleText: [
      'EXEMPLO DE CONTRATO DE PRESTAÇÃO DE SERVIÇOS FREELANCE',
      '',
      'Partes: o CLIENTE e o PROFISSIONAL AUTÓNOMO.',
      '1. Serviços: o profissional cria e desenvolve o site do cliente conforme os pedidos que este for indicando.',
      '2. Honorários: o valor total é de 3.000 EUR, pagável 90 dias após a entrega final. Não há juros por atraso no pagamento.',
      '3. Revisões: o profissional faz revisões ilimitadas sem custo adicional até o cliente ficar totalmente satisfeito, segundo o seu critério exclusivo.',
      '4. Propriedade intelectual: todo o trabalho, incluindo os materiais pré-existentes do profissional, pertence ao cliente desde o primeiro dia, tenha ou não o valor sido pago.',
      '5. Rescisão: o cliente pode rescindir a qualquer momento, sem aviso prévio e sem pagar o trabalho já feito. O profissional só pode rescindir com 90 dias de aviso prévio por escrito.',
      '6. Responsabilidade: o profissional responde sem limite por todos os danos diretos e indiretos do cliente.',
      '7. Renovação: o contrato renova-se automaticamente por 12 meses, salvo cancelamento escrito do profissional com pelo menos 6 meses de antecedência.',
      '8. Litígios: são competentes apenas os tribunais do domicílio do cliente; o profissional suporta todos os custos legais.',
    ],
  },
  nl: {
    hSampleBtn: 'Probeer een voorbeeldcontract',
    hSampleLoaded: 'Voorbeeld geladen. Kies hieronder uw kant en tik op Analyseren. Het eerste voorbeeld kost geen gratis analyse.',
    hSampleDone: 'Dat was een voorbeeld. Scan of plak nu uw eigen contract om te zien wat erin verborgen zit.',
    hSampleText: [
      'VOORBEELD VAN EEN OVEREENKOMST VOOR FREELANCE DIENSTVERLENING',
      '',
      'Partijen: de OPDRACHTGEVER en de FREELANCER.',
      '1. Diensten: de freelancer ontwerpt en bouwt de website van de opdrachtgever volgens de wensen die de opdrachtgever van tijd tot tijd doorgeeft.',
      '2. Vergoeding: de totale vergoeding bedraagt 3.000 EUR en wordt 90 dagen na de eindoplevering betaald. Bij te late betaling is geen rente verschuldigd.',
      '3. Aanpassingen: de freelancer voert onbeperkt aanpassingen uit zonder extra kosten tot de opdrachtgever naar eigen oordeel volledig tevreden is.',
      '4. Intellectueel eigendom: al het werk, inclusief reeds bestaand materiaal van de freelancer, is vanaf dag één eigendom van de opdrachtgever, ongeacht of de vergoeding is betaald.',
      '5. Beëindiging: de opdrachtgever kan op elk moment opzeggen, zonder opzegtermijn en zonder het verrichte werk te betalen. De freelancer kan alleen opzeggen met een schriftelijke opzegtermijn van 90 dagen.',
      '6. Aansprakelijkheid: de freelancer is onbeperkt aansprakelijk voor alle directe en indirecte schade van de opdrachtgever.',
      '7. Verlenging: de overeenkomst wordt automatisch met 12 maanden verlengd, tenzij de freelancer ten minste 6 maanden voor het einde schriftelijk opzegt.',
      '8. Geschillen: uitsluitend de rechter in de woonplaats van de opdrachtgever is bevoegd; de freelancer draagt alle juridische kosten.',
    ],
  },
};

const KEYS = ['hSampleBtn', 'hSampleLoaded', 'hSampleDone', 'hSampleText'];

module.exports = { D, LANGS, KEYS };

if (require.main === module) {
  let s = fs.readFileSync('i18n.js', 'utf8');
  const eol = s.includes('\r\n') ? '\r\n' : '\n';
  s = s.replace(/\r\n/g, '\n');
  if (/^\s+hSampleBtn: /m.test(s)) {
    console.log('already wired');
    process.exit(0);
  }
  const re = /^(\s+)telSettingHint: .*$/gm;
  const hits = [...s.matchAll(re)];
  if (hits.length !== 13) throw new Error(`expected 13 telSettingHint anchors, found ${hits.length}`);
  let out = '';
  let last = 0;
  hits.forEach((m, i) => {
    const L = LANGS[i];
    const data = D[L];
    const lines = KEYS.map((k) => {
      const v = Array.isArray(data[k]) ? data[k].join('\n') : data[k];
      return `${m[1]}${k}: ${JSON.stringify(v)},`;
    });
    out += s.slice(last, m.index + m[0].length) + '\n' + lines.join('\n');
    last = m.index + m[0].length;
  });
  out += s.slice(last);
  fs.writeFileSync('i18n.js', eol === '\r\n' ? out.replace(/\n/g, '\r\n') : out);
  console.log('wired Wave H keys x 13');
}
