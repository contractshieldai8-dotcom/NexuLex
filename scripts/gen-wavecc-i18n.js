// WAVE CC — Guided Draft i18n. Run: node scripts/gen-wavecc-i18n.js
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
const lines = (byLang) => {
  const o = {};
  for (const L of Object.keys(byLang)) o[L] = byLang[L].join('\n');
  return o;
};

// --- UI ---------------------------------------------------------------------
set('draftSectionTitle', ui('Belge Hazırla', 'Prepare a document', 'Dokument erstellen', 'Préparer un document', 'Preparar un documento', 'إعداد مستند', 'Prepara un documento', '准备文书', 'Подготовить документ', 'تهیه سند', '書類を作成', 'Preparar documento', 'Document opstellen'));
set('draftSectionHint', ui(
  'Belge türünü seçin, birkaç soruyu yanıtlayın; doldurulmuş bir taslak alın.',
  'Pick a document type, answer a few questions and get a filled-in draft.',
  'Wählen Sie einen Dokumenttyp, beantworten Sie ein paar Fragen und erhalten Sie einen ausgefüllten Entwurf.',
  'Choisissez un type de document, répondez à quelques questions et obtenez un brouillon rempli.',
  'Elija un tipo de documento, responda algunas preguntas y obtenga un borrador completado.',
  'اختر نوع المستند وأجب عن بعض الأسئلة لتحصل على مسودة معبأة.',
  'Scegli un tipo di documento, rispondi ad alcune domande e ottieni una bozza compilata.',
  '选择文书类型，回答几个问题，即可获得已填写的草稿。',
  'Выберите тип документа, ответьте на несколько вопросов и получите заполненный черновик.',
  'نوع سند را انتخاب کنید، به چند سؤال پاسخ دهید و پیش‌نویس تکمیل‌شده بگیرید.',
  '書類の種類を選び、いくつかの質問に答えると、記入済みの下書きができます。',
  'Escolha um tipo de documento, responda a algumas perguntas e receba um rascunho preenchido.',
  'Kies een documenttype, beantwoord enkele vragen en ontvang een ingevuld concept.'
));
set('draftClose', ui('Kapat', 'Close', 'Schließen', 'Fermer', 'Cerrar', 'إغلاق', 'Chiudi', '关闭', 'Закрыть', 'بستن', '閉じる', 'Fechar', 'Sluiten'));
set('draftBack', ui('Geri', 'Back', 'Zurück', 'Retour', 'Atrás', 'رجوع', 'Indietro', '返回', 'Назад', 'بازگشت', '戻る', 'Voltar', 'Terug'));
set('draftGenerate', ui('Taslak Oluştur', 'Create draft', 'Entwurf erstellen', 'Créer le brouillon', 'Crear borrador', 'إنشاء المسودة', 'Crea bozza', '生成草稿', 'Создать черновик', 'ایجاد پیش‌نویس', '下書きを作成', 'Criar rascunho', 'Concept maken'));
set('draftBlankHint', ui(
  'Boş bıraktığınız alanlar taslakta [ … ] olarak işaretlenir; hiçbir bilgi uydurulmaz.',
  'Fields you leave empty are marked [ … ] in the draft; nothing is made up.',
  'Leere Felder werden im Entwurf als [ … ] markiert; nichts wird erfunden.',
  'Les champs laissés vides sont marqués [ … ] dans le brouillon ; rien n’est inventé.',
  'Los campos vacíos se marcan como [ … ] en el borrador; no se inventa nada.',
  'الحقول الفارغة تُعلَّم بـ [ … ] في المسودة؛ ولا يُختلق أي شيء.',
  'I campi lasciati vuoti sono segnati [ … ] nella bozza; nulla viene inventato.',
  '留空的字段会在草稿中标记为 [ … ]，不会编造任何信息。',
  'Пустые поля отмечаются в черновике как [ … ]; ничего не выдумывается.',
  'فیلدهای خالی در پیش‌نویس با [ … ] علامت می‌خورند؛ هیچ اطلاعاتی ساخته نمی‌شود.',
  '空欄の項目は下書きで [ … ] と表示されます。情報を作り出すことはありません。',
  'Campos deixados em branco ficam marcados [ … ] no rascunho; nada é inventado.',
  'Lege velden worden in het concept gemarkeerd als [ … ]; er wordt niets verzonnen.'
));
set('draftDatePlaceholder', ui('GG.AA.YYYY', 'DD.MM.YYYY', 'TT.MM.JJJJ', 'JJ.MM.AAAA', 'DD.MM.AAAA', 'يوم.شهر.سنة', 'GG.MM.AAAA', '日.月.年', 'ДД.ММ.ГГГГ', 'روز.ماه.سال', 'DD.MM.YYYY', 'DD.MM.AAAA', 'DD.MM.JJJJ'));
set('draftMissingWarning', ui(
  'Zorunlu alanlar boş, taslakta işaretlendi:',
  'Required fields are empty and marked in the draft:',
  'Pflichtfelder sind leer und im Entwurf markiert:',
  'Champs obligatoires vides, marqués dans le brouillon :',
  'Campos obligatorios vacíos, marcados en el borrador:',
  'حقول إلزامية فارغة ومُعلَّمة في المسودة:',
  'Campi obbligatori vuoti, segnati nella bozza:',
  '必填字段为空，已在草稿中标记：',
  'Обязательные поля пусты и отмечены в черновике:',
  'فیلدهای الزامی خالی‌اند و در پیش‌نویس علامت خورده‌اند:',
  '必須項目が空欄のため、下書きで印を付けました：',
  'Campos obrigatórios vazios, marcados no rascunho:',
  'Verplichte velden zijn leeg en gemarkeerd in het concept:'
));
set('draftProLockTitle', ui('Tam taslak Pro’da', 'Full draft is Pro', 'Vollständiger Entwurf mit Pro', 'Brouillon complet avec Pro', 'Borrador completo con Pro', 'المسودة الكاملة في Pro', 'Bozza completa con Pro', '完整草稿需 Pro', 'Полный черновик — в Pro', 'پیش‌نویس کامل در Pro', '完全版の下書きは Pro', 'Rascunho completo no Pro', 'Volledig concept met Pro'));
set('draftProLockBody', ui(
  'Ücretsiz planda ilk satırları görürsünüz. Pro ile tam metin, DOCX, kopyala/paylaş ve ifade iyileştirme açılır.',
  'On the free plan you see the first lines. Pro unlocks the full text, DOCX, copy/share and wording polish.',
  'Im Gratis-Tarif sehen Sie die ersten Zeilen. Pro schaltet Volltext, DOCX, Kopieren/Teilen und Formulierungshilfe frei.',
  'Avec l’offre gratuite, vous voyez les premières lignes. Pro débloque le texte complet, le DOCX, copier/partager et l’amélioration du style.',
  'En el plan gratuito ve las primeras líneas. Pro desbloquea el texto completo, DOCX, copiar/compartir y la mejora de redacción.',
  'في الخطة المجانية ترى الأسطر الأولى. يفتح Pro النص الكامل وDOCX والنسخ/المشاركة وتحسين الصياغة.',
  'Con il piano gratuito vedi le prime righe. Pro sblocca il testo completo, DOCX, copia/condividi e il miglioramento della forma.',
  '免费版仅显示前几行。Pro 可解锁全文、DOCX、复制/分享及措辞润色。',
  'В бесплатном плане видны первые строки. Pro открывает полный текст, DOCX, копирование/отправку и улучшение формулировок.',
  'در طرح رایگان خطوط اول را می‌بینید. Pro متن کامل، DOCX، کپی/اشتراک و بهبود نگارش را باز می‌کند.',
  '無料プランでは最初の数行のみ表示されます。Pro で全文・DOCX・コピー/共有・表現の改善が使えます。',
  'No plano gratuito vê as primeiras linhas. O Pro desbloqueia o texto completo, DOCX, copiar/partilhar e melhoria da redação.',
  'Met het gratis plan ziet u de eerste regels. Pro ontgrendelt de volledige tekst, DOCX, kopiëren/delen en formuleringshulp.'
));
set('draftUnlockCta', ui('Pro’ya geç', 'Upgrade to Pro', 'Auf Pro upgraden', 'Passer à Pro', 'Pasar a Pro', 'الترقية إلى Pro', 'Passa a Pro', '升级到 Pro', 'Перейти на Pro', 'ارتقا به Pro', 'Pro にアップグレード', 'Mudar para Pro', 'Upgraden naar Pro'));
set('draftExportDocx', ui('DOCX olarak dışa aktar', 'Export as DOCX', 'Als DOCX exportieren', 'Exporter en DOCX', 'Exportar como DOCX', 'تصدير بصيغة DOCX', 'Esporta in DOCX', '导出为 DOCX', 'Экспорт в DOCX', 'خروجی DOCX', 'DOCX で書き出す', 'Exportar como DOCX', 'Exporteren als DOCX'));
set('draftCopy', ui('Taslağı kopyala', 'Copy draft', 'Entwurf kopieren', 'Copier le brouillon', 'Copiar borrador', 'نسخ المسودة', 'Copia bozza', '复制草稿', 'Скопировать черновик', 'کپی پیش‌نویس', '下書きをコピー', 'Copiar rascunho', 'Concept kopiëren'));
set('draftShare', ui('Paylaş', 'Share', 'Teilen', 'Partager', 'Compartir', 'مشاركة', 'Condividi', '分享', 'Поделиться', 'اشتراک‌گذاری', '共有', 'Partilhar', 'Delen'));
set('draftImprove', ui('İfadeyi iyileştir', 'Improve wording', 'Formulierung verbessern', 'Améliorer la formulation', 'Mejorar redacción', 'تحسين الصياغة', 'Migliora la forma', '润色措辞', 'Улучшить формулировки', 'بهبود نگارش', '表現を改善', 'Melhorar redação', 'Formulering verbeteren'));
set('draftImproveHint', ui(
  'Tek seferlik AI düzeltmesi: yeni bilgi, tarih, tutar veya kanun maddesi eklenmez; eklenirse değişiklik reddedilir.',
  'One-off AI polish: no new facts, dates, amounts or statute references are added; if they are, the change is rejected.',
  'Einmalige KI-Überarbeitung: keine neuen Fakten, Daten, Beträge oder Normzitate; andernfalls wird die Änderung verworfen.',
  'Retouche IA unique : aucun fait, date, montant ou article de loi n’est ajouté ; sinon la modification est rejetée.',
  'Retoque de IA único: no se añaden hechos, fechas, importes ni artículos de ley; si ocurre, el cambio se rechaza.',
  'تحسين لمرة واحدة بالذكاء الاصطناعي: لا تُضاف وقائع أو تواريخ أو مبالغ أو مواد قانونية جديدة؛ وإلا يُرفض التعديل.',
  'Ritocco IA una tantum: nessun nuovo fatto, data, importo o articolo di legge; altrimenti la modifica viene rifiutata.',
  '一次性 AI 润色：不会添加新事实、日期、金额或法条；若添加则拒绝该修改。',
  'Разовая правка ИИ: новые факты, даты, суммы или статьи законов не добавляются; иначе изменение отклоняется.',
  'اصلاح یک‌باره با هوش مصنوعی: واقعیت، تاریخ، مبلغ یا ماده قانونی جدید اضافه نمی‌شود؛ در غیر این صورت تغییر رد می‌شود.',
  '1回限りのAI校正：新しい事実・日付・金額・条文は追加しません。追加された場合は変更を破棄します。',
  'Revisão única por IA: não são acrescentados factos, datas, montantes ou artigos de lei; caso contrário, a alteração é rejeitada.',
  'Eenmalige AI-bewerking: geen nieuwe feiten, data, bedragen of wetsartikelen; anders wordt de wijziging geweigerd.'
));
set('draftImproveApplied', ui('İfade iyileştirildi.', 'Wording improved.', 'Formulierung verbessert.', 'Formulation améliorée.', 'Redacción mejorada.', 'تم تحسين الصياغة.', 'Forma migliorata.', '措辞已润色。', 'Формулировки улучшены.', 'نگارش بهبود یافت.', '表現を改善しました。', 'Redação melhorada.', 'Formulering verbeterd.'));
set('draftImproveRejected', ui(
  'AI önerisi bilgi ekledi veya değiştirdi; orijinal taslak korundu.',
  'The AI suggestion added or changed facts; your original draft was kept.',
  'Der KI-Vorschlag hat Fakten ergänzt oder geändert; Ihr Originalentwurf bleibt erhalten.',
  'La suggestion IA a ajouté ou modifié des faits ; votre brouillon d’origine est conservé.',
  'La sugerencia de IA añadió o cambió datos; se conserva su borrador original.',
  'أضاف اقتراح الذكاء الاصطناعي وقائع أو غيّرها؛ تم الاحتفاظ بمسودتك الأصلية.',
  'Il suggerimento IA ha aggiunto o modificato fatti; la bozza originale è stata mantenuta.',
  'AI 建议添加或更改了事实，已保留原始草稿。',
  'Предложение ИИ добавило или изменило факты; исходный черновик сохранён.',
  'پیشنهاد هوش مصنوعی واقعیتی را افزود یا تغییر داد؛ پیش‌نویس اصلی حفظ شد.',
  'AIの提案が事実を追加・変更したため、元の下書きを保持しました。',
  'A sugestão da IA acrescentou ou alterou factos; o rascunho original foi mantido.',
  'Het AI-voorstel voegde feiten toe of wijzigde ze; uw oorspronkelijke concept is behouden.'
));
set('draftRevert', ui('Orijinal taslağa dön', 'Revert to original', 'Zum Original zurück', 'Revenir à l’original', 'Volver al original', 'العودة إلى الأصل', 'Torna all’originale', '恢复原稿', 'Вернуть исходный', 'بازگشت به نسخه اصلی', '元に戻す', 'Voltar ao original', 'Terug naar origineel'));
set('draftFromRoadmapCta', ui('Bu adım için belge hazırla', 'Prepare the document for this step', 'Dokument für diesen Schritt erstellen', 'Préparer le document pour cette étape', 'Preparar el documento para este paso', 'إعداد المستند لهذه الخطوة', 'Prepara il documento per questo passo', '为此步骤准备文书', 'Подготовить документ для этого шага', 'تهیه سند برای این مرحله', 'このステップの書類を作成', 'Preparar o documento para este passo', 'Document voor deze stap opstellen'));
set('draftDisclaimer', ui(
  'Taslaktır; hukuki temsil yerine geçmez. Göndermeden önce kontrol edin / avukata danışın.',
  'This is a draft; it does not replace legal representation. Check it before sending / consult a lawyer.',
  'Dies ist ein Entwurf und ersetzt keine rechtliche Vertretung. Vor dem Versand prüfen / anwaltlich beraten lassen.',
  'Ceci est un brouillon ; il ne remplace pas une représentation juridique. Vérifiez avant envoi / consultez un avocat.',
  'Esto es un borrador; no sustituye la representación legal. Revíselo antes de enviarlo / consulte a un abogado.',
  'هذه مسودة ولا تغني عن التمثيل القانوني. راجعها قبل الإرسال / استشر محاميًا.',
  'Questa è una bozza; non sostituisce la rappresentanza legale. Verificala prima dell’invio / consulta un avvocato.',
  '本文件为草稿，不能替代法律代理。发送前请核对 / 咨询律师。',
  'Это черновик; он не заменяет юридическое представительство. Проверьте перед отправкой / проконсультируйтесь с юристом.',
  'این یک پیش‌نویس است و جایگزین وکالت حقوقی نیست. پیش از ارسال بررسی کنید / با وکیل مشورت کنید.',
  'これは下書きであり、法的代理に代わるものではありません。送付前に確認してください／弁護士にご相談ください。',
  'Isto é um rascunho; não substitui a representação jurídica. Verifique antes de enviar / consulte um advogado.',
  'Dit is een concept; het vervangt geen juridische vertegenwoordiging. Controleer vóór verzending / raadpleeg een advocaat.'
));

// --- Template titles / descriptions ------------------------------------------
set('draftNoticeTitle', ui('İhtarname (ödeme)', 'Payment demand letter', 'Zahlungsaufforderung (Mahnschreiben)', 'Mise en demeure de payer', 'Requerimiento de pago', 'إنذار بالدفع', 'Diffida di pagamento', '付款催告函', 'Претензия об оплате', 'اخطاریه پرداخت', '支払催告書', 'Interpelação para pagamento', 'Ingebrekestelling (betaling)'));
set('draftNoticeDesc', ui(
  'Vadesi geçmiş bir borç için ödeme süresi veren resmi uyarı taslağı.',
  'A formal demand giving a deadline to pay an overdue debt.',
  'Förmliche Aufforderung mit Zahlungsfrist für eine überfällige Forderung.',
  'Demande formelle fixant un délai pour payer une dette échue.',
  'Requerimiento formal con plazo para pagar una deuda vencida.',
  'مطالبة رسمية تحدد مهلة لسداد دين متأخر.',
  'Richiesta formale con termine per pagare un debito scaduto.',
  '针对逾期债务、限期付款的正式催告。',
  'Официальное требование с установленным сроком оплаты просроченного долга.',
  'مطالبه رسمی با مهلت پرداخت برای بدهی سررسیدگذشته.',
  '期限を過ぎた債務について、支払期限を定める正式な催告。',
  'Interpelação formal com prazo para pagar uma dívida vencida.',
  'Formele aanmaning met een betalingstermijn voor een achterstallige schuld.'
));
set('draftMediationTitle', ui('Arabuluculuk Başvuru Özeti', 'Mediation application summary', 'Zusammenfassung Mediationsantrag', 'Résumé de demande de médiation', 'Resumen de solicitud de mediación', 'ملخص طلب الوساطة', 'Sintesi della domanda di mediazione', '调解申请摘要', 'Краткое заявление на медиацию', 'خلاصه درخواست میانجی‌گری', '調停申立ての概要', 'Resumo do pedido de mediação', 'Samenvatting mediationaanvraag'));
set('draftMediationDesc', ui(
  'Arabuluculuk bürosuna verilecek taraflar ve uyuşmazlık özeti.',
  'Parties and dispute summary to hand to the mediation office.',
  'Parteien und Streitzusammenfassung für die Mediationsstelle.',
  'Parties et résumé du litige à remettre au bureau de médiation.',
  'Partes y resumen del conflicto para la oficina de mediación.',
  'الأطراف وملخص النزاع لتقديمه إلى مكتب الوساطة.',
  'Parti e sintesi della controversia da consegnare all’organismo di mediazione.',
  '提交调解机构的当事人及争议摘要。',
  'Стороны и суть спора для передачи в бюро медиации.',
  'طرفین و خلاصه اختلاف برای ارائه به دفتر میانجی‌گری.',
  '調停窓口に提出する当事者と紛争の概要。',
  'Partes e resumo do litígio a entregar ao serviço de mediação.',
  'Partijen en samenvatting van het geschil voor het mediationbureau.'
));
set('draftConsumerTitle', ui('Tüketici Hakem Heyeti Dilekçesi', 'Consumer arbitration committee petition', 'Antrag an die Verbraucherschlichtungsstelle', 'Requête au comité d’arbitrage des consommateurs', 'Solicitud a la junta arbitral de consumo', 'عريضة إلى هيئة تحكيم المستهلك', 'Istanza all’organismo di conciliazione dei consumatori', '消费者仲裁委员会申请书', 'Заявление в комиссию по защите прав потребителей', 'دادخواست به هیئت داوری مصرف‌کننده', '消費者仲裁委員会への申立書', 'Petição à comissão de arbitragem de consumo', 'Verzoekschrift aan de geschillencommissie consumenten'));
set('draftConsumerDesc', ui(
  'Ayıplı ürün veya hizmet için hakem heyetine başvuru dilekçesi taslağı.',
  'Draft petition for a defective product or service.',
  'Antragsentwurf wegen eines mangelhaften Produkts oder einer Dienstleistung.',
  'Projet de requête pour un produit ou service défectueux.',
  'Borrador de solicitud por un producto o servicio defectuoso.',
  'مسودة عريضة بشأن منتج أو خدمة معيبة.',
  'Bozza di istanza per un prodotto o servizio difettoso.',
  '针对瑕疵商品或服务的申请书草稿。',
  'Черновик заявления о некачественном товаре или услуге.',
  'پیش‌نویس دادخواست برای کالا یا خدمت معیوب.',
  '欠陥のある商品・サービスに関する申立書の下書き。',
  'Rascunho de petição por produto ou serviço defeituoso.',
  'Conceptverzoek voor een gebrekkig product of gebrekkige dienst.'
));

// --- Questions ----------------------------------------------------------------
set('draftQSender', ui('İhtar eden (ad soyad / unvan)', 'Sender (full name / company)', 'Absender (Name / Firma)', 'Expéditeur (nom / société)', 'Remitente (nombre / empresa)', 'المُرسِل (الاسم / الشركة)', 'Mittente (nome / società)', '催告人（姓名 / 公司）', 'Отправитель (ФИО / компания)', 'فرستنده (نام / شرکت)', '差出人（氏名・会社名）', 'Remetente (nome / empresa)', 'Afzender (naam / bedrijf)'));
set('draftQRecipient', ui('Muhatap (ad soyad / unvan)', 'Recipient (full name / company)', 'Empfänger (Name / Firma)', 'Destinataire (nom / société)', 'Destinatario (nombre / empresa)', 'المُرسَل إليه (الاسم / الشركة)', 'Destinatario (nome / società)', '被催告人（姓名 / 公司）', 'Получатель (ФИО / компания)', 'گیرنده (نام / شرکت)', '宛先（氏名・会社名）', 'Destinatário (nome / empresa)', 'Ontvanger (naam / bedrijf)'));
set('draftQBasis', ui('Borcun dayanağı (sözleşme, fatura no vb.)', 'Basis of the debt (contract, invoice no., etc.)', 'Grundlage der Forderung (Vertrag, Rechnungsnr. usw.)', 'Fondement de la dette (contrat, n° de facture, etc.)', 'Origen de la deuda (contrato, n.º de factura, etc.)', 'أساس الدين (عقد، رقم فاتورة، إلخ)', 'Titolo del debito (contratto, n. fattura, ecc.)', '债务依据（合同、发票号等）', 'Основание долга (договор, № счёта и т. п.)', 'مبنای بدهی (قرارداد، شماره فاکتور و…)', '債務の根拠（契約、請求書番号など）', 'Origem da dívida (contrato, n.º de fatura, etc.)', 'Grondslag van de schuld (contract, factuurnr., enz.)'));
set('draftQAmount', ui('Borç tutarı (para birimiyle)', 'Amount owed (with currency)', 'Offener Betrag (mit Währung)', 'Montant dû (avec devise)', 'Importe adeudado (con moneda)', 'المبلغ المستحق (مع العملة)', 'Importo dovuto (con valuta)', '欠款金额（含币种）', 'Сумма долга (с валютой)', 'مبلغ بدهی (با واحد پول)', '未払金額（通貨を含む）', 'Montante em dívida (com moeda)', 'Verschuldigd bedrag (met valuta)'));
set('draftQDueDate', ui('Vade tarihi', 'Due date', 'Fälligkeitsdatum', 'Date d’échéance', 'Fecha de vencimiento', 'تاريخ الاستحقاق', 'Data di scadenza', '到期日', 'Срок оплаты', 'تاریخ سررسید', '支払期日', 'Data de vencimento', 'Vervaldatum'));
set('draftQDeadlineDays', ui('Ödeme için verilen süre (gün)', 'Days given to pay', 'Zahlungsfrist (Tage)', 'Délai de paiement (jours)', 'Plazo de pago (días)', 'مهلة الدفع (بالأيام)', 'Termine di pagamento (giorni)', '付款期限（天）', 'Срок для оплаты (дней)', 'مهلت پرداخت (روز)', '支払猶予（日数）', 'Prazo de pagamento (dias)', 'Betalingstermijn (dagen)'));
set('draftQApplicant', ui('Başvuran (ad soyad / unvan)', 'Applicant (full name / company)', 'Antragsteller (Name / Firma)', 'Demandeur (nom / société)', 'Solicitante (nombre / empresa)', 'مقدِّم الطلب (الاسم / الشركة)', 'Istante (nome / società)', '申请人（姓名 / 公司）', 'Заявитель (ФИО / компания)', 'متقاضی (نام / شرکت)', '申立人（氏名・会社名）', 'Requerente (nome / empresa)', 'Aanvrager (naam / bedrijf)'));
set('draftQRespondent', ui('Karşı taraf (ad soyad / unvan)', 'Other party (full name / company)', 'Gegenpartei (Name / Firma)', 'Partie adverse (nom / société)', 'Parte contraria (nombre / empresa)', 'الطرف الآخر (الاسم / الشركة)', 'Controparte (nome / società)', '对方（姓名 / 公司）', 'Другая сторона (ФИО / компания)', 'طرف مقابل (نام / شرکت)', '相手方（氏名・会社名）', 'Outra parte (nome / empresa)', 'Wederpartij (naam / bedrijf)'));
set('draftQDisputeType', ui('Uyuşmazlık türü (iş, kira, ticari vb.)', 'Type of dispute (employment, rent, commercial, etc.)', 'Art des Streits (Arbeit, Miete, Handel usw.)', 'Type de litige (travail, bail, commercial, etc.)', 'Tipo de conflicto (laboral, alquiler, mercantil, etc.)', 'نوع النزاع (عمل، إيجار، تجاري، إلخ)', 'Tipo di controversia (lavoro, locazione, commerciale, ecc.)', '争议类型（劳动、租赁、商事等）', 'Вид спора (трудовой, аренда, коммерческий и т. п.)', 'نوع اختلاف (کار، اجاره، تجاری و…)', '紛争の種類（労働、賃貸、商取引など）', 'Tipo de litígio (laboral, arrendamento, comercial, etc.)', 'Soort geschil (arbeid, huur, zakelijk, enz.)'));
set('draftQSummary', ui('Uyuşmazlığın kısa özeti', 'Short summary of the dispute', 'Kurze Zusammenfassung des Streits', 'Bref résumé du litige', 'Breve resumen del conflicto', 'ملخص قصير للنزاع', 'Breve sintesi della controversia', '争议简述', 'Краткое описание спора', 'خلاصه کوتاه اختلاف', '紛争の簡単な概要', 'Breve resumo do litígio', 'Korte samenvatting van het geschil'));
set('draftQAmountOptional', ui('Talep tutarı (varsa)', 'Amount claimed (if any)', 'Geforderter Betrag (falls vorhanden)', 'Montant réclamé (le cas échéant)', 'Importe reclamado (si lo hay)', 'المبلغ المطالب به (إن وجد)', 'Importo richiesto (se presente)', '请求金额（如有）', 'Сумма требования (если есть)', 'مبلغ مورد مطالبه (در صورت وجود)', '請求額（ある場合）', 'Montante reclamado (se houver)', 'Gevorderd bedrag (indien van toepassing)'));
set('draftQCity', ui('Başvuru yapılacak il', 'City where you apply', 'Ort der Antragstellung', 'Ville de dépôt', 'Ciudad de presentación', 'المدينة التي تُقدَّم فيها', 'Città di presentazione', '申请所在城市', 'Город подачи', 'شهر محل درخواست', '申立先の都市', 'Cidade de apresentação', 'Plaats van indiening'));
set('draftQConsumer', ui('Tüketici (ad soyad)', 'Consumer (full name)', 'Verbraucher (Name)', 'Consommateur (nom)', 'Consumidor (nombre)', 'المستهلك (الاسم)', 'Consumatore (nome)', '消费者（姓名）', 'Потребитель (ФИО)', 'مصرف‌کننده (نام)', '消費者（氏名）', 'Consumidor (nome)', 'Consument (naam)'));
set('draftQSeller', ui('Satıcı / sağlayıcı', 'Seller / provider', 'Verkäufer / Anbieter', 'Vendeur / prestataire', 'Vendedor / proveedor', 'البائع / مقدِّم الخدمة', 'Venditore / fornitore', '卖方 / 服务商', 'Продавец / исполнитель', 'فروشنده / ارائه‌دهنده', '販売者・提供者', 'Vendedor / prestador', 'Verkoper / aanbieder'));
set('draftQProduct', ui('Ürün veya hizmet', 'Product or service', 'Produkt oder Dienstleistung', 'Produit ou service', 'Producto o servicio', 'المنتج أو الخدمة', 'Prodotto o servizio', '商品或服务', 'Товар или услуга', 'کالا یا خدمت', '商品またはサービス', 'Produto ou serviço', 'Product of dienst'));
set('draftQPurchaseDate', ui('Satın alma tarihi', 'Purchase date', 'Kaufdatum', 'Date d’achat', 'Fecha de compra', 'تاريخ الشراء', 'Data di acquisto', '购买日期', 'Дата покупки', 'تاریخ خرید', '購入日', 'Data de compra', 'Aankoopdatum'));
set('draftQProblem', ui('Sorun nedir? (ne oldu, ne zaman)', 'What is the problem? (what happened, when)', 'Was ist das Problem? (was, wann)', 'Quel est le problème ? (quoi, quand)', '¿Cuál es el problema? (qué pasó, cuándo)', 'ما المشكلة؟ (ماذا حدث ومتى)', 'Qual è il problema? (cosa, quando)', '问题是什么？（发生了什么、何时）', 'В чём проблема? (что и когда)', 'مشکل چیست؟ (چه شد، چه زمانی)', '問題は何ですか？（何が・いつ）', 'Qual é o problema? (o quê, quando)', 'Wat is het probleem? (wat, wanneer)'));
set('draftQRequest', ui('Talebiniz (iade, değişim, onarım, indirim)', 'Your request (refund, replacement, repair, price cut)', 'Ihr Anliegen (Erstattung, Ersatz, Reparatur, Minderung)', 'Votre demande (remboursement, échange, réparation, réduction)', 'Su petición (reembolso, cambio, reparación, rebaja)', 'طلبك (استرداد، استبدال، إصلاح، تخفيض)', 'La tua richiesta (rimborso, sostituzione, riparazione, riduzione)', '您的诉求（退款、换货、维修、降价）', 'Ваше требование (возврат, замена, ремонт, скидка)', 'درخواست شما (بازپرداخت، تعویض، تعمیر، تخفیف)', 'ご要望（返金・交換・修理・減額）', 'O seu pedido (reembolso, troca, reparação, redução)', 'Uw verzoek (terugbetaling, vervanging, herstel, prijsverlaging)'));

// --- Bodies ({{placeholders}} = question ids; only answers are inserted) ------
set('draftNoticeBody', lines({
  tr: ['İHTAR EDEN: {{sender}}', 'MUHATAP: {{recipient}}', 'KONU: Ödeme ihtarı', '', '1. Aramızdaki {{basis}} kapsamında tarafınızca ödenmesi gereken {{amount}} tutarındaki borcun vadesi {{dueDate}} tarihidir.', '2. İşbu ihtarnamenin tebliğinden itibaren {{deadlineDays}} gün içinde söz konusu tutarın ödenmesini talep ederiz.', '3. Bu süre içinde ödeme yapılmaması halinde yasal yollara başvurma hakkımızı saklı tuttuğumuzu ihtar ederiz.', '', 'Tarih: [ gün.ay.yıl ]', 'İhtar eden (imza): {{sender}}'],
  en: ['FROM: {{sender}}', 'TO: {{recipient}}', 'RE: Demand for payment', '', '1. Under {{basis}} between us, the amount of {{amount}} owed by you fell due on {{dueDate}}.', '2. We request payment of this amount within {{deadlineDays}} days of receipt of this letter.', '3. If payment is not made within this period, we reserve the right to take legal steps.', '', 'Date: [ dd.mm.yyyy ]', 'Signature: {{sender}}'],
  de: ['ABSENDER: {{sender}}', 'EMPFÄNGER: {{recipient}}', 'BETREFF: Zahlungsaufforderung', '', '1. Aus {{basis}} zwischen uns ist der von Ihnen geschuldete Betrag von {{amount}} am {{dueDate}} fällig geworden.', '2. Wir fordern Sie auf, diesen Betrag innerhalb von {{deadlineDays}} Tagen nach Zugang dieses Schreibens zu zahlen.', '3. Erfolgt die Zahlung nicht fristgerecht, behalten wir uns rechtliche Schritte vor.', '', 'Datum: [ TT.MM.JJJJ ]', 'Unterschrift: {{sender}}'],
  fr: ['EXPÉDITEUR : {{sender}}', 'DESTINATAIRE : {{recipient}}', 'OBJET : Mise en demeure de payer', '', '1. Au titre de {{basis}} entre nous, la somme de {{amount}} dont vous êtes redevable était exigible le {{dueDate}}.', '2. Nous vous demandons de régler cette somme dans un délai de {{deadlineDays}} jours à compter de la réception de la présente.', '3. À défaut de paiement dans ce délai, nous nous réservons le droit d’engager des démarches juridiques.', '', 'Date : [ jj.mm.aaaa ]', 'Signature : {{sender}}'],
  es: ['REMITENTE: {{sender}}', 'DESTINATARIO: {{recipient}}', 'ASUNTO: Requerimiento de pago', '', '1. En virtud de {{basis}} entre nosotros, el importe de {{amount}} que usted adeuda venció el {{dueDate}}.', '2. Le requerimos el pago de dicho importe en el plazo de {{deadlineDays}} días desde la recepción de esta carta.', '3. De no efectuarse el pago en dicho plazo, nos reservamos el derecho de emprender acciones legales.', '', 'Fecha: [ dd.mm.aaaa ]', 'Firma: {{sender}}'],
  ar: ['المُرسِل: {{sender}}', 'المُرسَل إليه: {{recipient}}', 'الموضوع: إنذار بالدفع', '', '1. بموجب {{basis}} المبرم بيننا، استحق المبلغ {{amount}} المترتب عليكم بتاريخ {{dueDate}}.', '2. نطالبكم بسداد هذا المبلغ خلال {{deadlineDays}} يومًا من تاريخ استلام هذا الإنذار.', '3. في حال عدم السداد خلال هذه المهلة، نحتفظ بحقنا في اتخاذ الإجراءات القانونية.', '', 'التاريخ: [ يوم.شهر.سنة ]', 'التوقيع: {{sender}}'],
  it: ['MITTENTE: {{sender}}', 'DESTINATARIO: {{recipient}}', 'OGGETTO: Diffida di pagamento', '', '1. In base a {{basis}} tra noi, l’importo di {{amount}} da voi dovuto è scaduto il {{dueDate}}.', '2. Vi chiediamo di pagare tale importo entro {{deadlineDays}} giorni dal ricevimento della presente.', '3. In mancanza di pagamento entro tale termine, ci riserviamo di intraprendere azioni legali.', '', 'Data: [ gg.mm.aaaa ]', 'Firma: {{sender}}'],
  zh: ['催告人：{{sender}}', '被催告人：{{recipient}}', '事由：付款催告', '', '1. 根据双方之间的{{basis}}，贵方应付的{{amount}}已于{{dueDate}}到期。', '2. 请贵方自收到本函之日起{{deadlineDays}}日内支付上述款项。', '3. 如未在上述期限内付款，我方保留采取法律措施的权利。', '', '日期：[ 日.月.年 ]', '签名：{{sender}}'],
  ru: ['ОТПРАВИТЕЛЬ: {{sender}}', 'ПОЛУЧАТЕЛЬ: {{recipient}}', 'ТЕМА: Требование об оплате', '', '1. По {{basis}} между нами сумма {{amount}}, подлежащая оплате вами, стала подлежать уплате {{dueDate}}.', '2. Просим оплатить указанную сумму в течение {{deadlineDays}} дней с момента получения настоящего письма.', '3. В случае неоплаты в указанный срок мы оставляем за собой право обратиться к правовым мерам.', '', 'Дата: [ дд.мм.гггг ]', 'Подпись: {{sender}}'],
  fa: ['فرستنده: {{sender}}', 'گیرنده: {{recipient}}', 'موضوع: اخطار پرداخت', '', '۱. بر اساس {{basis}} میان ما، مبلغ {{amount}} که بر عهده شماست در تاریخ {{dueDate}} سررسید شده است.', '۲. خواهشمندیم ظرف {{deadlineDays}} روز از دریافت این اخطاریه مبلغ مذکور را پرداخت کنید.', '۳. در صورت عدم پرداخت در این مهلت، حق اقدام قانونی برای ما محفوظ است.', '', 'تاریخ: [ روز.ماه.سال ]', 'امضا: {{sender}}'],
  ja: ['差出人：{{sender}}', '宛先：{{recipient}}', '件名：支払催告', '', '1. 当事者間の{{basis}}に基づき、貴殿が支払うべき{{amount}}は{{dueDate}}に支払期日を迎えました。', '2. 本書面の受領日から{{deadlineDays}}日以内に上記金額をお支払いください。', '3. 期限内にお支払いがない場合、法的手続をとる権利を留保します。', '', '日付：[ 年.月.日 ]', '署名：{{sender}}'],
  pt: ['REMETENTE: {{sender}}', 'DESTINATÁRIO: {{recipient}}', 'ASSUNTO: Interpelação para pagamento', '', '1. Nos termos de {{basis}} entre nós, o montante de {{amount}} em dívida venceu em {{dueDate}}.', '2. Solicitamos o pagamento deste montante no prazo de {{deadlineDays}} dias a contar da receção desta carta.', '3. Na falta de pagamento neste prazo, reservamo-nos o direito de tomar medidas legais.', '', 'Data: [ dd.mm.aaaa ]', 'Assinatura: {{sender}}'],
  nl: ['AFZENDER: {{sender}}', 'AAN: {{recipient}}', 'BETREFT: Ingebrekestelling tot betaling', '', '1. Op grond van {{basis}} tussen ons is het door u verschuldigde bedrag van {{amount}} op {{dueDate}} opeisbaar geworden.', '2. Wij verzoeken u dit bedrag binnen {{deadlineDays}} dagen na ontvangst van deze brief te betalen.', '3. Indien betaling binnen deze termijn uitblijft, behouden wij ons het recht voor juridische stappen te zetten.', '', 'Datum: [ dd.mm.jjjj ]', 'Handtekening: {{sender}}'],
}));
set('draftMediationBody', lines({
  tr: ['BAŞVURAN: {{applicant}}', 'KARŞI TARAF: {{respondent}}', 'UYUŞMAZLIK TÜRÜ: {{disputeType}}', 'TALEP TUTARI (varsa): {{amount}}', 'BAŞVURU YERİ: {{city}}', '', 'UYUŞMAZLIĞIN ÖZETİ:', '{{summary}}', '', 'TALEP: Uyuşmazlığın arabuluculuk yoluyla görüşülmesi için arabulucu atanmasını talep ederim.', '', 'Tarih: [ gün.ay.yıl ]', 'Başvuran (imza): {{applicant}}'],
  en: ['APPLICANT: {{applicant}}', 'OTHER PARTY: {{respondent}}', 'TYPE OF DISPUTE: {{disputeType}}', 'AMOUNT CLAIMED (if any): {{amount}}', 'PLACE OF APPLICATION: {{city}}', '', 'SUMMARY OF THE DISPUTE:', '{{summary}}', '', 'REQUEST: I request the appointment of a mediator so that the dispute can be discussed through mediation.', '', 'Date: [ dd.mm.yyyy ]', 'Applicant (signature): {{applicant}}'],
  de: ['ANTRAGSTELLER: {{applicant}}', 'GEGENPARTEI: {{respondent}}', 'ART DES STREITS: {{disputeType}}', 'GEFORDERTER BETRAG (falls vorhanden): {{amount}}', 'ORT DER ANTRAGSTELLUNG: {{city}}', '', 'ZUSAMMENFASSUNG DES STREITS:', '{{summary}}', '', 'ANTRAG: Ich beantrage die Bestellung eines Mediators, damit der Streit im Wege der Mediation erörtert werden kann.', '', 'Datum: [ TT.MM.JJJJ ]', 'Antragsteller (Unterschrift): {{applicant}}'],
  fr: ['DEMANDEUR : {{applicant}}', 'PARTIE ADVERSE : {{respondent}}', 'TYPE DE LITIGE : {{disputeType}}', 'MONTANT RÉCLAMÉ (le cas échéant) : {{amount}}', 'LIEU DE DÉPÔT : {{city}}', '', 'RÉSUMÉ DU LITIGE :', '{{summary}}', '', 'DEMANDE : Je sollicite la désignation d’un médiateur afin que le litige soit examiné par voie de médiation.', '', 'Date : [ jj.mm.aaaa ]', 'Demandeur (signature) : {{applicant}}'],
  es: ['SOLICITANTE: {{applicant}}', 'PARTE CONTRARIA: {{respondent}}', 'TIPO DE CONFLICTO: {{disputeType}}', 'IMPORTE RECLAMADO (si lo hay): {{amount}}', 'LUGAR DE PRESENTACIÓN: {{city}}', '', 'RESUMEN DEL CONFLICTO:', '{{summary}}', '', 'SOLICITUD: Solicito la designación de un mediador para tratar el conflicto mediante mediación.', '', 'Fecha: [ dd.mm.aaaa ]', 'Solicitante (firma): {{applicant}}'],
  ar: ['مقدِّم الطلب: {{applicant}}', 'الطرف الآخر: {{respondent}}', 'نوع النزاع: {{disputeType}}', 'المبلغ المطالب به (إن وجد): {{amount}}', 'مكان تقديم الطلب: {{city}}', '', 'ملخص النزاع:', '{{summary}}', '', 'الطلب: ألتمس تعيين وسيط لمناقشة النزاع عن طريق الوساطة.', '', 'التاريخ: [ يوم.شهر.سنة ]', 'مقدِّم الطلب (التوقيع): {{applicant}}'],
  it: ['ISTANTE: {{applicant}}', 'CONTROPARTE: {{respondent}}', 'TIPO DI CONTROVERSIA: {{disputeType}}', 'IMPORTO RICHIESTO (se presente): {{amount}}', 'LUOGO DI PRESENTAZIONE: {{city}}', '', 'SINTESI DELLA CONTROVERSIA:', '{{summary}}', '', 'RICHIESTA: Chiedo la nomina di un mediatore affinché la controversia sia esaminata in mediazione.', '', 'Data: [ gg.mm.aaaa ]', 'Istante (firma): {{applicant}}'],
  zh: ['申请人：{{applicant}}', '对方：{{respondent}}', '争议类型：{{disputeType}}', '请求金额（如有）：{{amount}}', '申请地点：{{city}}', '', '争议摘要：', '{{summary}}', '', '请求：申请指定调解员，通过调解方式协商解决本争议。', '', '日期：[ 日.月.年 ]', '申请人（签名）：{{applicant}}'],
  ru: ['ЗАЯВИТЕЛЬ: {{applicant}}', 'ДРУГАЯ СТОРОНА: {{respondent}}', 'ВИД СПОРА: {{disputeType}}', 'СУММА ТРЕБОВАНИЯ (если есть): {{amount}}', 'МЕСТО ПОДАЧИ: {{city}}', '', 'СУТЬ СПОРА:', '{{summary}}', '', 'ПРОСЬБА: Прошу назначить медиатора для обсуждения спора в порядке медиации.', '', 'Дата: [ дд.мм.гггг ]', 'Заявитель (подпись): {{applicant}}'],
  fa: ['متقاضی: {{applicant}}', 'طرف مقابل: {{respondent}}', 'نوع اختلاف: {{disputeType}}', 'مبلغ مورد مطالبه (در صورت وجود): {{amount}}', 'محل ارائه درخواست: {{city}}', '', 'خلاصه اختلاف:', '{{summary}}', '', 'درخواست: تعیین میانجی برای بررسی اختلاف از طریق میانجی‌گری را درخواست می‌کنم.', '', 'تاریخ: [ روز.ماه.سال ]', 'متقاضی (امضا): {{applicant}}'],
  ja: ['申立人：{{applicant}}', '相手方：{{respondent}}', '紛争の種類：{{disputeType}}', '請求額（ある場合）：{{amount}}', '申立先：{{city}}', '', '紛争の概要：', '{{summary}}', '', '申立ての趣旨：本紛争を調停により協議するため、調停人の選任を求めます。', '', '日付：[ 年.月.日 ]', '申立人（署名）：{{applicant}}'],
  pt: ['REQUERENTE: {{applicant}}', 'OUTRA PARTE: {{respondent}}', 'TIPO DE LITÍGIO: {{disputeType}}', 'MONTANTE RECLAMADO (se houver): {{amount}}', 'LOCAL DE APRESENTAÇÃO: {{city}}', '', 'RESUMO DO LITÍGIO:', '{{summary}}', '', 'PEDIDO: Solicito a nomeação de um mediador para que o litígio seja discutido por via de mediação.', '', 'Data: [ dd.mm.aaaa ]', 'Requerente (assinatura): {{applicant}}'],
  nl: ['AANVRAGER: {{applicant}}', 'WEDERPARTIJ: {{respondent}}', 'SOORT GESCHIL: {{disputeType}}', 'GEVORDERD BEDRAG (indien van toepassing): {{amount}}', 'PLAATS VAN INDIENING: {{city}}', '', 'SAMENVATTING VAN HET GESCHIL:', '{{summary}}', '', 'VERZOEK: Ik verzoek om aanwijzing van een mediator zodat het geschil via mediatie kan worden besproken.', '', 'Datum: [ dd.mm.jjjj ]', 'Aanvrager (handtekening): {{applicant}}'],
}));
set('draftConsumerBody', lines({
  tr: ["[ il / ilçe ] TÜKETİCİ HAKEM HEYETİ BAŞKANLIĞI'NA", '', 'BAŞVURAN (TÜKETİCİ): {{consumer}}', 'KARŞI TARAF (SATICI / SAĞLAYICI): {{seller}}', 'ÜRÜN / HİZMET: {{product}}', 'SATIN ALMA TARİHİ: {{purchaseDate}}', '', 'AÇIKLAMALAR:', '{{problem}}', '', 'TALEP: {{request}}', '', 'EKLER: [ fatura / fiş, yazışmalar, fotoğraflar ]', 'Tarih: [ gün.ay.yıl ]', 'Başvuran (imza): {{consumer}}'],
  en: ['TO: [ city / district ] CONSUMER ARBITRATION COMMITTEE', '', 'APPLICANT (CONSUMER): {{consumer}}', 'OTHER PARTY (SELLER / PROVIDER): {{seller}}', 'PRODUCT / SERVICE: {{product}}', 'PURCHASE DATE: {{purchaseDate}}', '', 'STATEMENT:', '{{problem}}', '', 'REQUEST: {{request}}', '', 'ATTACHMENTS: [ invoice / receipt, correspondence, photos ]', 'Date: [ dd.mm.yyyy ]', 'Applicant (signature): {{consumer}}'],
  de: ['AN: Verbraucherschlichtungsstelle [ Ort / Bezirk ]', '', 'ANTRAGSTELLER (VERBRAUCHER): {{consumer}}', 'GEGENPARTEI (VERKÄUFER / ANBIETER): {{seller}}', 'PRODUKT / DIENSTLEISTUNG: {{product}}', 'KAUFDATUM: {{purchaseDate}}', '', 'SACHVERHALT:', '{{problem}}', '', 'ANTRAG: {{request}}', '', 'ANLAGEN: [ Rechnung / Beleg, Schriftverkehr, Fotos ]', 'Datum: [ TT.MM.JJJJ ]', 'Antragsteller (Unterschrift): {{consumer}}'],
  fr: ['À : Comité d’arbitrage des consommateurs de [ ville / district ]', '', 'DEMANDEUR (CONSOMMATEUR) : {{consumer}}', 'PARTIE ADVERSE (VENDEUR / PRESTATAIRE) : {{seller}}', 'PRODUIT / SERVICE : {{product}}', 'DATE D’ACHAT : {{purchaseDate}}', '', 'EXPOSÉ DES FAITS :', '{{problem}}', '', 'DEMANDE : {{request}}', '', 'PIÈCES JOINTES : [ facture / ticket, échanges, photos ]', 'Date : [ jj.mm.aaaa ]', 'Demandeur (signature) : {{consumer}}'],
  es: ['A: Junta arbitral de consumo de [ ciudad / distrito ]', '', 'SOLICITANTE (CONSUMIDOR): {{consumer}}', 'PARTE CONTRARIA (VENDEDOR / PROVEEDOR): {{seller}}', 'PRODUCTO / SERVICIO: {{product}}', 'FECHA DE COMPRA: {{purchaseDate}}', '', 'HECHOS:', '{{problem}}', '', 'PETICIÓN: {{request}}', '', 'ANEXOS: [ factura / tique, correspondencia, fotos ]', 'Fecha: [ dd.mm.aaaa ]', 'Solicitante (firma): {{consumer}}'],
  ar: ['إلى: هيئة تحكيم المستهلك في [ المدينة / المنطقة ]', '', 'مقدِّم الطلب (المستهلك): {{consumer}}', 'الطرف الآخر (البائع / مقدِّم الخدمة): {{seller}}', 'المنتج / الخدمة: {{product}}', 'تاريخ الشراء: {{purchaseDate}}', '', 'الوقائع:', '{{problem}}', '', 'الطلب: {{request}}', '', 'المرفقات: [ فاتورة / إيصال، مراسلات، صور ]', 'التاريخ: [ يوم.شهر.سنة ]', 'مقدِّم الطلب (التوقيع): {{consumer}}'],
  it: ['A: Organismo di conciliazione dei consumatori di [ città / distretto ]', '', 'ISTANTE (CONSUMATORE): {{consumer}}', 'CONTROPARTE (VENDITORE / FORNITORE): {{seller}}', 'PRODOTTO / SERVIZIO: {{product}}', 'DATA DI ACQUISTO: {{purchaseDate}}', '', 'ESPOSIZIONE DEI FATTI:', '{{problem}}', '', 'RICHIESTA: {{request}}', '', 'ALLEGATI: [ fattura / scontrino, corrispondenza, foto ]', 'Data: [ gg.mm.aaaa ]', 'Istante (firma): {{consumer}}'],
  zh: ['致：[ 城市 / 区县 ] 消费者仲裁委员会', '', '申请人（消费者）：{{consumer}}', '对方（卖方 / 服务商）：{{seller}}', '商品 / 服务：{{product}}', '购买日期：{{purchaseDate}}', '', '事实陈述：', '{{problem}}', '', '请求：{{request}}', '', '附件：[ 发票 / 收据、往来记录、照片 ]', '日期：[ 日.月.年 ]', '申请人（签名）：{{consumer}}'],
  ru: ['В: комиссию по защите прав потребителей [ город / район ]', '', 'ЗАЯВИТЕЛЬ (ПОТРЕБИТЕЛЬ): {{consumer}}', 'ДРУГАЯ СТОРОНА (ПРОДАВЕЦ / ИСПОЛНИТЕЛЬ): {{seller}}', 'ТОВАР / УСЛУГА: {{product}}', 'ДАТА ПОКУПКИ: {{purchaseDate}}', '', 'ОБСТОЯТЕЛЬСТВА:', '{{problem}}', '', 'ТРЕБОВАНИЕ: {{request}}', '', 'ПРИЛОЖЕНИЯ: [ счёт / чек, переписка, фото ]', 'Дата: [ дд.мм.гггг ]', 'Заявитель (подпись): {{consumer}}'],
  fa: ['به: هیئت داوری مصرف‌کننده [ شهر / منطقه ]', '', 'متقاضی (مصرف‌کننده): {{consumer}}', 'طرف مقابل (فروشنده / ارائه‌دهنده): {{seller}}', 'کالا / خدمت: {{product}}', 'تاریخ خرید: {{purchaseDate}}', '', 'شرح ماجرا:', '{{problem}}', '', 'درخواست: {{request}}', '', 'پیوست‌ها: [ فاکتور / رسید، مکاتبات، عکس‌ها ]', 'تاریخ: [ روز.ماه.سال ]', 'متقاضی (امضا): {{consumer}}'],
  ja: ['宛先：[ 市区町村 ] 消費者仲裁委員会', '', '申立人（消費者）：{{consumer}}', '相手方（販売者・提供者）：{{seller}}', '商品・サービス：{{product}}', '購入日：{{purchaseDate}}', '', '経緯：', '{{problem}}', '', '請求：{{request}}', '', '添付書類：[ 請求書・レシート、やり取りの記録、写真 ]', '日付：[ 年.月.日 ]', '申立人（署名）：{{consumer}}'],
  pt: ['A: Comissão de arbitragem de consumo de [ cidade / distrito ]', '', 'REQUERENTE (CONSUMIDOR): {{consumer}}', 'OUTRA PARTE (VENDEDOR / PRESTADOR): {{seller}}', 'PRODUTO / SERVIÇO: {{product}}', 'DATA DE COMPRA: {{purchaseDate}}', '', 'FACTOS:', '{{problem}}', '', 'PEDIDO: {{request}}', '', 'ANEXOS: [ fatura / recibo, correspondência, fotos ]', 'Data: [ dd.mm.aaaa ]', 'Requerente (assinatura): {{consumer}}'],
  nl: ['AAN: Geschillencommissie consumenten [ plaats / district ]', '', 'VERZOEKER (CONSUMENT): {{consumer}}', 'WEDERPARTIJ (VERKOPER / AANBIEDER): {{seller}}', 'PRODUCT / DIENST: {{product}}', 'AANKOOPDATUM: {{purchaseDate}}', '', 'FEITEN:', '{{problem}}', '', 'VERZOEK: {{request}}', '', 'BIJLAGEN: [ factuur / bon, correspondentie, foto’s ]', 'Datum: [ dd.mm.jjjj ]', 'Verzoeker (handtekening): {{consumer}}'],
}));

// --- Fixed references (reviewed; the only statute references a draft carries) --
set('draftNoticeRef', ui(
  'Dayanak (sabit atıf): 6098 sayılı Türk Borçlar Kanunu m.117 (borçlunun temerrüdü). Noter kanalıyla gönderilmesi önerilir.',
  'Reference (Türkiye, fixed): Turkish Code of Obligations No. 6098, Art. 117 (default of the debtor). Sending via a notary is recommended. Outside Türkiye, check your local law.',
  'Bezug (Türkei, fest): Türkisches Obligationengesetz Nr. 6098, Art. 117 (Schuldnerverzug). Zustellung über einen Notar empfohlen. Außerhalb der Türkei lokales Recht prüfen.',
  'Référence (Turquie, fixe) : Code turc des obligations n° 6098, art. 117 (demeure du débiteur). Envoi par notaire recommandé. Hors de Turquie, vérifiez le droit local.',
  'Referencia (Turquía, fija): Código turco de Obligaciones n.º 6098, art. 117 (mora del deudor). Se recomienda el envío por notario. Fuera de Turquía, consulte la ley local.',
  'المرجع (تركيا، ثابت): قانون الالتزامات التركي رقم 6098، المادة 117 (تأخر المدين). يُنصح بالإرسال عبر كاتب العدل. خارج تركيا راجع القانون المحلي.',
  'Riferimento (Turchia, fisso): Codice turco delle obbligazioni n. 6098, art. 117 (mora del debitore). Si consiglia l’invio tramite notaio. Fuori dalla Turchia verifica la legge locale.',
  '依据（土耳其，固定）：土耳其《债法典》第6098号法律第117条（债务人迟延）。建议经公证人送达。土耳其以外请核对当地法律。',
  'Ссылка (Турция, фиксированная): Обязательственный кодекс Турции № 6098, ст. 117 (просрочка должника). Рекомендуется отправка через нотариуса. За пределами Турции проверьте местное право.',
  'مرجع (ترکیه، ثابت): قانون تعهدات ترکیه شماره 6098، ماده 117 (تأخیر بدهکار). ارسال از طریق دفتر اسناد رسمی توصیه می‌شود. خارج از ترکیه قانون محلی را بررسی کنید.',
  '根拠（トルコ、固定）：トルコ債務法（法律第6098号）第117条（債務者の遅滞）。公証人経由での送付を推奨。トルコ国外では現地法を確認してください。',
  'Referência (Turquia, fixa): Código turco das Obrigações n.º 6098, art. 117 (mora do devedor). Recomenda-se o envio por notário. Fora da Turquia, verifique a lei local.',
  'Verwijzing (Turkije, vast): Turks Verbintenissenwetboek nr. 6098, art. 117 (verzuim van de schuldenaar). Verzending via een notaris aanbevolen. Buiten Turkije: controleer het lokale recht.'
));
set('draftMediationRef', ui(
  'Dayanak (sabit atıf): 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu. Başvuru adliyedeki arabuluculuk bürosuna yapılır; uyuşmazlığın zorunlu arabuluculuğa tabi olup olmadığını kontrol edin.',
  'Reference (Türkiye, fixed): Law No. 6325 on Mediation in Civil Disputes. Applications go to the courthouse mediation office; check whether your dispute requires mandatory mediation. Outside Türkiye, check your local law.',
  'Bezug (Türkei, fest): Gesetz Nr. 6325 über Mediation in Zivilstreitigkeiten. Antrag beim Mediationsbüro des Gerichts; prüfen Sie, ob Pflichtmediation gilt. Außerhalb der Türkei lokales Recht prüfen.',
  'Référence (Turquie, fixe) : Loi n° 6325 sur la médiation dans les litiges civils. Demande auprès du bureau de médiation du palais de justice ; vérifiez si la médiation est obligatoire. Hors de Turquie, vérifiez le droit local.',
  'Referencia (Turquía, fija): Ley n.º 6325 de Mediación en Conflictos Civiles. La solicitud se presenta en la oficina de mediación del juzgado; compruebe si la mediación es obligatoria. Fuera de Turquía, consulte la ley local.',
  'المرجع (تركيا، ثابت): القانون رقم 6325 بشأن الوساطة في المنازعات المدنية. يُقدَّم الطلب إلى مكتب الوساطة في المحكمة؛ تحقّق مما إذا كانت الوساطة إلزامية. خارج تركيا راجع القانون المحلي.',
  'Riferimento (Turchia, fisso): Legge n. 6325 sulla mediazione nelle controversie civili. La domanda si presenta all’ufficio di mediazione del tribunale; verifica se la mediazione è obbligatoria. Fuori dalla Turchia verifica la legge locale.',
  '依据（土耳其，固定）：第6325号《民事纠纷调解法》。向法院调解办公室提出申请；请确认争议是否适用强制调解。土耳其以外请核对当地法律。',
  'Ссылка (Турция, фиксированная): Закон № 6325 о медиации в гражданских спорах. Заявление подаётся в бюро медиации при суде; проверьте, обязательна ли медиация. За пределами Турции проверьте местное право.',
  'مرجع (ترکیه، ثابت): قانون شماره 6325 درباره میانجی‌گری در اختلافات حقوقی. درخواست به دفتر میانجی‌گری دادگستری ارائه می‌شود؛ بررسی کنید میانجی‌گری اجباری است یا نه. خارج از ترکیه قانون محلی را بررسی کنید.',
  '根拠（トルコ、固定）：民事紛争調停法（法律第6325号）。裁判所の調停窓口に申し立てます。調停前置が義務か確認してください。トルコ国外では現地法を確認してください。',
  'Referência (Turquia, fixa): Lei n.º 6325 sobre Mediação em Litígios Civis. O pedido é apresentado no gabinete de mediação do tribunal; verifique se a mediação é obrigatória. Fora da Turquia, verifique a lei local.',
  'Verwijzing (Turkije, vast): Wet nr. 6325 inzake mediation in civiele geschillen. Aanvraag bij het mediationbureau van de rechtbank; controleer of mediation verplicht is. Buiten Turkije: controleer het lokale recht.'
));
set('draftConsumerRef', ui(
  'Dayanak (sabit atıf): 6502 sayılı Tüketicinin Korunması Hakkında Kanun m.68 (tüketici hakem heyetleri). Parasal sınırlar her yıl güncellenir; başvurmadan önce güncel sınırı kontrol edin.',
  'Reference (Türkiye, fixed): Consumer Protection Law No. 6502, Art. 68 (consumer arbitration committees). Monetary limits are updated yearly; check the current limit before applying. Outside Türkiye, check your local law.',
  'Bezug (Türkei, fest): Verbraucherschutzgesetz Nr. 6502, Art. 68 (Verbraucherschiedsstellen). Wertgrenzen werden jährlich angepasst; aktuelle Grenze vorab prüfen. Außerhalb der Türkei lokales Recht prüfen.',
  'Référence (Turquie, fixe) : Loi n° 6502 sur la protection des consommateurs, art. 68 (comités d’arbitrage). Les seuils sont mis à jour chaque année ; vérifiez le seuil actuel. Hors de Turquie, vérifiez le droit local.',
  'Referencia (Turquía, fija): Ley n.º 6502 de Protección del Consumidor, art. 68 (juntas arbitrales). Los límites se actualizan cada año; compruebe el límite vigente. Fuera de Turquía, consulte la ley local.',
  'المرجع (تركيا، ثابت): قانون حماية المستهلك رقم 6502، المادة 68 (هيئات تحكيم المستهلك). تُحدَّث الحدود المالية سنويًا؛ تحقّق من الحد الحالي قبل التقديم. خارج تركيا راجع القانون المحلي.',
  'Riferimento (Turchia, fisso): Legge n. 6502 sulla tutela dei consumatori, art. 68 (comitati arbitrali). Le soglie sono aggiornate ogni anno; verifica la soglia vigente. Fuori dalla Turchia verifica la legge locale.',
  '依据（土耳其，固定）：第6502号《消费者保护法》第68条（消费者仲裁委员会）。金额上限每年更新，申请前请核对最新标准。土耳其以外请核对当地法律。',
  'Ссылка (Турция, фиксированная): Закон № 6502 о защите прав потребителей, ст. 68 (арбитражные комиссии). Денежные пороги обновляются ежегодно; проверьте текущий порог. За пределами Турции проверьте местное право.',
  'مرجع (ترکیه، ثابت): قانون حمایت از مصرف‌کننده شماره 6502، ماده 68 (هیئت‌های داوری مصرف‌کننده). سقف‌های مالی هر سال به‌روز می‌شوند؛ پیش از درخواست سقف فعلی را بررسی کنید. خارج از ترکیه قانون محلی را بررسی کنید.',
  '根拠（トルコ、固定）：消費者保護法（法律第6502号）第68条（消費者仲裁委員会）。金額上限は毎年改定されます。申立前に最新の上限を確認してください。トルコ国外では現地法を確認してください。',
  'Referência (Turquia, fixa): Lei n.º 6502 de Proteção do Consumidor, art. 68 (comissões de arbitragem). Os limites são atualizados anualmente; verifique o limite em vigor. Fora da Turquia, verifique a lei local.',
  'Verwijzing (Turkije, vast): Consumentenbeschermingswet nr. 6502, art. 68 (geschillencommissies). Bedragsgrenzen worden jaarlijks bijgewerkt; controleer de actuele grens. Buiten Turkije: controleer het lokale recht.'
));

const out = {};
for (const lang of langs) {
  out[lang] = {};
  for (const key of Object.keys(T)) {
    const value = T[key][lang];
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`missing ${lang}.${key}`);
    }
    out[lang][key] = value;
  }
}
const file = `// WAVE CC — Guided Draft. Same key set in all 13 languages.\n\nexport const WAVE_CC_I18N = ${JSON.stringify(out, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'i18n.wavecc.js'), file, 'utf8');
console.log('Wrote i18n.wavecc.js keys=', Object.keys(T).length, 'langs=', langs.length);
