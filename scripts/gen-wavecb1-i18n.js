// WAVE CB.1 — Jurisdiction packs i18n. Run: node scripts/gen-wavecb1-i18n.js
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

// --- Calculators ----------------------------------------------------------------
set('calcNotAvailableForCountry', ui(
  'Bu hesaplayıcı seçili ülke için henüz yok (doğrulanmış kanuni tablo bulunmuyor).',
  'This calculator is not available for the selected country yet (no verified statutory table).',
  'Dieser Rechner ist für das gewählte Land noch nicht verfügbar (keine geprüfte gesetzliche Tabelle).',
  'Ce calculateur n’est pas encore disponible pour ce pays (aucune table légale vérifiée).',
  'Esta calculadora aún no está disponible para el país elegido (sin tabla legal verificada).',
  'هذه الحاسبة غير متاحة بعد للبلد المحدد (لا يوجد جدول قانوني موثّق).',
  'Questo calcolatore non è ancora disponibile per il paese scelto (nessuna tabella legale verificata).',
  '所选国家暂不支持此计算器（尚无经核实的法定表）。',
  'Этот калькулятор пока недоступен для выбранной страны (нет проверенной правовой таблицы).',
  'این محاسبه‌گر هنوز برای کشور انتخاب‌شده در دسترس نیست (جدول قانونی تأییدشده‌ای وجود ندارد).',
  'この計算機は選択した国ではまだ利用できません（検証済みの法定表がありません）。',
  'Esta calculadora ainda não está disponível para o país escolhido (sem tabela legal verificada).',
  'Deze calculator is nog niet beschikbaar voor het gekozen land (geen geverifieerde wettelijke tabel).'
));
set('calcUserRate', ui('Oran (%) — kendiniz girin', 'Rate (%) — enter it yourself', 'Satz (%) — selbst eingeben', 'Taux (%) — à saisir vous-même', 'Tasa (%) — introdúzcala usted', 'النسبة (%) — أدخلها بنفسك', 'Tasso (%) — inseriscilo tu', '比率（%）——请自行输入', 'Ставка (%) — укажите сами', 'نرخ (%) — خودتان وارد کنید', '率（%）— ご自身で入力', 'Taxa (%) — introduza você', 'Tarief (%) — zelf invullen'));
set('calcModeStatutory', ui('Kanuni tablo', 'Statutory table', 'Gesetzliche Tabelle', 'Table légale', 'Tabla legal', 'جدول قانوني', 'Tabella legale', '法定表', 'Правовая таблица', 'جدول قانونی', '法定表', 'Tabela legal', 'Wettelijke tabel'));
set('calcModeGeneric', ui('Genel hesap', 'Generic calculation', 'Allgemeine Berechnung', 'Calcul générique', 'Cálculo genérico', 'حساب عام', 'Calcolo generico', '通用计算', 'Общий расчёт', 'محاسبه عمومی', '一般計算', 'Cálculo genérico', 'Algemene berekening'));
set('calcFootnoteGenericInterest', ui(
  'Genel hesap: (Anapara × girdiğiniz oran × gün) / (365 × 100). Kanuni oran iddiası yoktur; yerel oranı kontrol edin.',
  'Generic calculation: (Principal × your rate × days) / (365 × 100). No statutory rate is claimed; check the local rate.',
  'Allgemeine Berechnung: (Kapital × Ihr Satz × Tage) / (365 × 100). Kein gesetzlicher Satz behauptet; lokalen Satz prüfen.',
  'Calcul générique : (Capital × votre taux × jours) / (365 × 100). Aucun taux légal revendiqué ; vérifiez le taux local.',
  'Cálculo genérico: (Capital × su tasa × días) / (365 × 100). No se afirma ninguna tasa legal; verifique la tasa local.',
  'حساب عام: (الأصل × نسبتك × الأيام) / (365 × 100). لا يُدّعى أي معدل قانوني؛ تحقّق من المعدل المحلي.',
  'Calcolo generico: (Capitale × tuo tasso × giorni) / (365 × 100). Nessun tasso legale dichiarato; verifica il tasso locale.',
  '通用计算：(本金×您输入的利率×天数)/(365×100)。不代表法定利率，请核对当地利率。',
  'Общий расчёт: (Сумма × ваша ставка × дни) / (365 × 100). Законная ставка не заявляется; проверьте местную ставку.',
  'محاسبه عمومی: (اصل × نرخ شما × روز) / (۳۶۵ × ۱۰۰). ادعای نرخ قانونی وجود ندارد؛ نرخ محلی را بررسی کنید.',
  '一般計算：(元本×入力した率×日数)/(365×100)。法定利率を示すものではありません。現地の利率をご確認ください。',
  'Cálculo genérico: (Principal × a sua taxa × dias) / (365 × 100). Nenhuma taxa legal é afirmada; verifique a taxa local.',
  'Algemene berekening: (Hoofdsom × uw tarief × dagen) / (365 × 100). Geen wettelijk tarief geclaimd; controleer het lokale tarief.'
));
set('calcFootnoteGenericRent', ui(
  'Genel karşılaştırma: mevcut kira × (1 + girdiğiniz oran). Yerel kira artış kuralını kontrol edin.',
  'Generic comparison: current rent × (1 + your rate). Check the local rent-increase rule.',
  'Allgemeiner Vergleich: aktuelle Miete × (1 + Ihr Satz). Lokale Mieterhöhungsregel prüfen.',
  'Comparaison générique : loyer actuel × (1 + votre taux). Vérifiez la règle locale de hausse.',
  'Comparación genérica: renta actual × (1 + su tasa). Verifique la norma local de aumento.',
  'مقارنة عامة: الإيجار الحالي × (1 + نسبتك). تحقّق من قاعدة الزيادة المحلية.',
  'Confronto generico: affitto attuale × (1 + tuo tasso). Verifica la regola locale di aumento.',
  '通用比较：当前租金×(1+您输入的比率)。请核对当地涨租规则。',
  'Общее сравнение: текущая аренда × (1 + ваша ставка). Проверьте местное правило повышения.',
  'مقایسه عمومی: اجاره فعلی × (۱ + نرخ شما). قاعده محلی افزایش اجاره را بررسی کنید.',
  '一般比較：現行賃料×(1＋入力した率)。現地の賃料改定ルールをご確認ください。',
  'Comparação genérica: renda atual × (1 + a sua taxa). Verifique a regra local de aumento.',
  'Algemene vergelijking: huidige huur × (1 + uw tarief). Controleer de lokale huurverhogingsregel.'
));
set('calcJurisdictionLine', ui(
  'Yargı alanı · para birimi: {{jurisdiction}} · {{currency}}',
  'Jurisdiction · currency: {{jurisdiction}} · {{currency}}',
  'Rechtsordnung · Währung: {{jurisdiction}} · {{currency}}',
  'Juridiction · devise : {{jurisdiction}} · {{currency}}',
  'Jurisdicción · moneda: {{jurisdiction}} · {{currency}}',
  'الولاية القضائية · العملة: {{jurisdiction}} · {{currency}}',
  'Giurisdizione · valuta: {{jurisdiction}} · {{currency}}',
  '法域 · 币种：{{jurisdiction}} · {{currency}}',
  'Юрисдикция · валюта: {{jurisdiction}} · {{currency}}',
  'حوزه قضایی · واحد پول: {{jurisdiction}} · {{currency}}',
  '法域・通貨：{{jurisdiction}} · {{currency}}',
  'Jurisdição · moeda: {{jurisdiction}} · {{currency}}',
  'Rechtsgebied · valuta: {{jurisdiction}} · {{currency}}'
));
set('calcCurrencyUnset', ui(
  'Para birimi belirlenemedi; tutarlar para birimsiz gösterilir. Doğru para birimi için ülke seçin.',
  'Currency could not be determined; amounts are shown without a currency. Pick a country to set it.',
  'Währung unbekannt; Beträge ohne Währung. Wählen Sie ein Land, um sie festzulegen.',
  'Devise indéterminée ; montants affichés sans devise. Choisissez un pays pour la définir.',
  'Moneda no determinada; importes sin moneda. Elija un país para fijarla.',
  'تعذّر تحديد العملة؛ تُعرض المبالغ بلا عملة. اختر بلدًا لتحديدها.',
  'Valuta non determinata; importi senza valuta. Scegli un paese per impostarla.',
  '无法确定币种，金额不带币种显示。请选择国家以设定币种。',
  'Валюта не определена; суммы показаны без валюты. Выберите страну.',
  'واحد پول مشخص نیست؛ مبالغ بدون واحد پول نمایش داده می‌شوند. برای تعیین آن کشور را انتخاب کنید.',
  '通貨を特定できません。金額は通貨なしで表示されます。国を選択してください。',
  'Moeda não determinada; valores sem moeda. Escolha um país para defini-la.',
  'Valuta onbekend; bedragen zonder valuta. Kies een land om die in te stellen.'
));

// --- Generic scenario roadmap (no local institutions, no fixed deadlines) ------
set('scenarioGenericBanner', ui(
  'Bu ülke için özel yol haritası henüz yok; genel adımlar gösteriliyor.',
  'No country-specific roadmap yet for this country; showing general steps.',
  'Für dieses Land gibt es noch keinen eigenen Fahrplan; allgemeine Schritte werden angezeigt.',
  'Pas encore de feuille de route propre à ce pays ; étapes générales affichées.',
  'Aún no hay hoja de ruta específica para este país; se muestran pasos generales.',
  'لا توجد بعد خارطة طريق خاصة بهذا البلد؛ تُعرض خطوات عامة.',
  'Non esiste ancora una roadmap specifica per questo paese; vengono mostrati passi generali.',
  '该国家暂无专属路线图，显示通用步骤。',
  'Для этой страны пока нет отдельной дорожной карты; показаны общие шаги.',
  'هنوز نقشه راه ویژه این کشور وجود ندارد؛ گام‌های کلی نمایش داده می‌شود.',
  'この国専用のロードマップはまだありません。一般的な手順を表示しています。',
  'Ainda não há roteiro específico para este país; são mostrados passos gerais.',
  'Voor dit land is nog geen specifieke routekaart; algemene stappen worden getoond.'
));
set('scenarioGenericS1Title', ui('Kanıtları belgeleyin', 'Document the evidence', 'Beweise dokumentieren', 'Documentez les preuves', 'Documente las pruebas', 'وثّق الأدلة', 'Documenta le prove', '整理证据', 'Зафиксируйте доказательства', 'مستندات را جمع کنید', '証拠を記録する', 'Documente as provas', 'Leg het bewijs vast'));
set('scenarioGenericS1Detail', ui(
  'Sözleşme, yazışma, fatura, fotoğraf ve ödeme kayıtlarını toplayın; tarih ve tutarları not edin.',
  'Collect contracts, messages, invoices, photos and payment records; note dates and amounts.',
  'Verträge, Nachrichten, Rechnungen, Fotos und Zahlungsbelege sammeln; Daten und Beträge notieren.',
  'Rassemblez contrats, messages, factures, photos et preuves de paiement ; notez dates et montants.',
  'Reúna contratos, mensajes, facturas, fotos y registros de pago; anote fechas e importes.',
  'اجمع العقود والرسائل والفواتير والصور وسجلات الدفع؛ ودوّن التواريخ والمبالغ.',
  'Raccogli contratti, messaggi, fatture, foto e prove di pagamento; annota date e importi.',
  '收集合同、往来消息、发票、照片和付款记录，记下日期和金额。',
  'Соберите договоры, переписку, счета, фото и платёжные документы; запишите даты и суммы.',
  'قرارداد، پیام‌ها، فاکتورها، عکس‌ها و سوابق پرداخت را جمع کنید؛ تاریخ‌ها و مبالغ را یادداشت کنید.',
  '契約書、やり取り、請求書、写真、支払記録を集め、日付と金額を控えてください。',
  'Reúna contratos, mensagens, faturas, fotos e registos de pagamento; anote datas e valores.',
  'Verzamel contracten, berichten, facturen, foto’s en betaalbewijzen; noteer data en bedragen.'
));
set('scenarioGenericS2Title', ui('Yazılı bildirim gönderin', 'Send a written notice', 'Schriftlich mitteilen', 'Envoyez une notification écrite', 'Envíe una notificación escrita', 'أرسل إشعارًا كتابيًا', 'Invia una comunicazione scritta', '发送书面通知', 'Направьте письменное уведомление', 'اطلاعیه کتبی بفرستید', '書面で通知する', 'Envie uma notificação escrita', 'Stuur een schriftelijke kennisgeving'));
set('scenarioGenericS2Detail', ui(
  'Sorunu ve talebinizi karşı tarafa makul bir süre vererek yazılı iletin; teslim kanıtını saklayın.',
  'Describe the problem and your request to the other party in writing with a reasonable deadline; keep proof of delivery.',
  'Problem und Forderung schriftlich mit angemessener Frist an die Gegenseite senden; Zustellnachweis aufbewahren.',
  'Exposez par écrit le problème et votre demande à l’autre partie avec un délai raisonnable ; gardez une preuve d’envoi.',
  'Describa por escrito el problema y su petición a la otra parte con un plazo razonable; conserve prueba de entrega.',
  'اشرح المشكلة وطلبك كتابيًا للطرف الآخر مع مهلة معقولة؛ واحتفظ بإثبات التسليم.',
  'Descrivi per iscritto il problema e la tua richiesta all’altra parte con un termine ragionevole; conserva la prova di consegna.',
  '以书面形式向对方说明问题和诉求，并给出合理期限；保留送达证明。',
  'Опишите проблему и требование другой стороне письменно с разумным сроком; сохраните подтверждение доставки.',
  'مشکل و درخواست خود را کتبی و با مهلتی معقول به طرف مقابل اعلام کنید؛ رسید تحویل را نگه دارید.',
  '問題と要望を相手方に書面で伝え、妥当な期限を示してください。送付の証拠を保管しましょう。',
  'Descreva por escrito o problema e o seu pedido à outra parte com um prazo razoável; guarde a prova de entrega.',
  'Beschrijf het probleem en uw verzoek schriftelijk aan de wederpartij met een redelijke termijn; bewaar een verzendbewijs.'
));
set('scenarioGenericS3Title', ui('Süreleri yerel bir avukatla kontrol edin', 'Check deadlines with a local lawyer', 'Fristen mit einer lokalen Anwältin / einem Anwalt prüfen', 'Vérifiez les délais avec un avocat local', 'Verifique los plazos con un abogado local', 'تحقّق من المهل مع محامٍ محلي', 'Verifica i termini con un avvocato locale', '与当地律师核对期限', 'Проверьте сроки с местным юристом', 'مهلت‌ها را با وکیل محلی بررسی کنید', '期限を現地の弁護士に確認する', 'Confirme os prazos com um advogado local', 'Controleer termijnen met een lokale advocaat'));
set('scenarioGenericS3Detail', ui(
  'Zamanaşımı ve zorunlu ön adımlar ülkeye göre değişir; uyuşmazlığın olduğu yerde yetkili bir avukata doğrulatın.',
  'Limitation periods and mandatory pre-steps differ by country; confirm them with a lawyer licensed where the dispute is.',
  'Verjährung und Pflichtvorschritte sind länderabhängig; lassen Sie sie von einer vor Ort zugelassenen Anwältin bestätigen.',
  'Prescriptions et étapes préalables obligatoires varient selon le pays ; faites-les confirmer par un avocat habilité sur place.',
  'La prescripción y los pasos previos obligatorios varían según el país; confírmelos con un abogado habilitado allí.',
  'تختلف مدد التقادم والخطوات المسبقة الإلزامية من بلد لآخر؛ أكّدها مع محامٍ مرخّص في مكان النزاع.',
  'Prescrizione e passaggi preliminari obbligatori variano per paese; falli confermare da un avvocato abilitato sul posto.',
  '诉讼时效和强制前置程序因国而异，请由争议所在地的执业律师确认。',
  'Сроки давности и обязательные предварительные шаги зависят от страны; уточните их у юриста, практикующего там, где спор.',
  'مرور زمان و گام‌های مقدماتی اجباری در هر کشور متفاوت است؛ آن‌ها را با وکیل دارای مجوز در محل اختلاف تأیید کنید.',
  '時効や義務的な事前手続は国ごとに異なります。紛争地で資格を持つ弁護士に確認してください。',
  'Prazos de prescrição e passos prévios obrigatórios variam por país; confirme-os com um advogado habilitado no local.',
  'Verjaringstermijnen en verplichte voorstappen verschillen per land; laat ze bevestigen door een advocaat ter plaatse.'
));
set('scenarioGenericS4Title', ui('Uzlaşmayı deneyin', 'Try to negotiate', 'Verhandeln versuchen', 'Tentez de négocier', 'Intente negociar', 'حاول التفاوض', 'Prova a negoziare', '尝试协商', 'Попробуйте договориться', 'مذاکره را امتحان کنید', '交渉を試みる', 'Tente negociar', 'Probeer te onderhandelen'));
set('scenarioGenericS4Detail', ui(
  'Somut bir çözüm önerin ve tüm teklifleri yazılı tutun.',
  'Propose a concrete solution and keep every offer in writing.',
  'Schlagen Sie eine konkrete Lösung vor und halten Sie jedes Angebot schriftlich fest.',
  'Proposez une solution concrète et gardez chaque offre par écrit.',
  'Proponga una solución concreta y deje cada oferta por escrito.',
  'اقترح حلًا محددًا واحتفظ بكل عرض كتابيًا.',
  'Proponi una soluzione concreta e conserva ogni offerta per iscritto.',
  '提出具体解决方案，并以书面形式保留每一次报价。',
  'Предложите конкретное решение и фиксируйте каждое предложение письменно.',
  'راه‌حلی مشخص پیشنهاد دهید و همه پیشنهادها را مکتوب نگه دارید.',
  '具体的な解決策を提案し、すべての提案を書面で残してください。',
  'Proponha uma solução concreta e guarde cada proposta por escrito.',
  'Stel een concrete oplossing voor en leg elk aanbod schriftelijk vast.'
));
set('scenarioGenericS5Title', ui('Yetkili makama başvurun', 'Contact the competent authority', 'An die zuständige Stelle wenden', 'Saisissez l’autorité compétente', 'Acuda a la autoridad competente', 'توجّه إلى الجهة المختصة', 'Rivolgiti all’autorità competente', '向主管机构求助', 'Обратитесь в компетентный орган', 'به مرجع صالح مراجعه کنید', '所管機関に相談する', 'Recorra à autoridade competente', 'Wend u tot de bevoegde instantie'));
set('scenarioGenericS5Detail', ui(
  'Sorun çözülmezse hangi mahkeme, kurum veya uyuşmazlık biriminin yetkili olduğunu yerel bir avukata sorun.',
  'If it stays unresolved, ask a local lawyer which court, agency or dispute body is competent.',
  'Bleibt es ungelöst, fragen Sie eine lokale Anwältin, welches Gericht, welche Behörde oder Stelle zuständig ist.',
  'Si rien n’est réglé, demandez à un avocat local quel tribunal, organisme ou instance est compétent.',
  'Si no se resuelve, pregunte a un abogado local qué tribunal, organismo u órgano es competente.',
  'إذا لم تُحل المشكلة، اسأل محاميًا محليًا عن المحكمة أو الجهة أو هيئة النزاعات المختصة.',
  'Se resta irrisolto, chiedi a un avvocato locale quale tribunale, ente o organismo è competente.',
  '若仍未解决，请咨询当地律师哪个法院、机构或纠纷处理部门有管辖权。',
  'Если вопрос не решён, спросите местного юриста, какой суд, ведомство или орган компетентен.',
  'اگر حل نشد، از وکیل محلی بپرسید کدام دادگاه، نهاد یا مرجع رسیدگی صالح است.',
  '解決しない場合は、どの裁判所・機関・紛争処理窓口が所管か現地の弁護士に尋ねてください。',
  'Se não se resolver, pergunte a um advogado local qual tribunal, entidade ou órgão é competente.',
  'Blijft het onopgelost, vraag een lokale advocaat welke rechtbank, instantie of geschilleninstantie bevoegd is.'
));
set('scenarioGenericLawyer', ui(
  'Bir süre dolmak üzereyse, yüksek bir tutar söz konusuysa veya resmi / mahkeme evrakı aldıysanız hemen yerel bir avukata başvurun.',
  'See a local lawyer right away if a deadline is close, a large amount is at stake, or you received official or court papers.',
  'Sofort zu einer lokalen Anwältin, wenn eine Frist naht, viel Geld auf dem Spiel steht oder Sie amtliche / gerichtliche Schreiben erhalten haben.',
  'Consultez immédiatement un avocat local si un délai approche, si le montant est élevé ou si vous avez reçu des actes officiels ou judiciaires.',
  'Acuda de inmediato a un abogado local si un plazo está cerca, hay mucho dinero en juego o recibió documentos oficiales o judiciales.',
  'راجع محاميًا محليًا فورًا إذا اقتربت مهلة، أو كان المبلغ كبيرًا، أو تلقيت أوراقًا رسمية أو قضائية.',
  'Rivolgiti subito a un avvocato locale se un termine è vicino, l’importo è elevato o hai ricevuto atti ufficiali o giudiziari.',
  '如期限临近、金额较大，或已收到官方或法院文书，请立即咨询当地律师。',
  'Срочно обратитесь к местному юристу, если срок близок, сумма велика или вы получили официальные либо судебные документы.',
  'اگر مهلتی نزدیک است، مبلغ زیادی در میان است یا اوراق رسمی / دادگاه دریافت کرده‌اید، فوراً به وکیل محلی مراجعه کنید.',
  '期限が迫っている、金額が大きい、または公的・裁判所の書類を受け取った場合は、すぐに現地の弁護士に相談してください。',
  'Procure já um advogado local se um prazo estiver próximo, o valor for elevado ou tiver recebido documentos oficiais ou judiciais.',
  'Ga meteen naar een lokale advocaat als een termijn nadert, er veel geld op het spel staat of u officiële of gerechtelijke stukken ontving.'
));

// --- Drafts ----------------------------------------------------------------------
set('draftGenericBanner', ui(
  'Bu ülke için özel şablon yok; genel mektup formatı hazırlandı. Yerel hukuku kontrol edin.',
  'No country-specific template for this country; a general letter format was prepared. Check local law.',
  'Keine landesspezifische Vorlage; ein allgemeines Briefformat wurde erstellt. Lokales Recht prüfen.',
  'Pas de modèle propre à ce pays ; un format de lettre général a été préparé. Vérifiez le droit local.',
  'No hay plantilla específica para este país; se preparó un formato de carta general. Verifique la ley local.',
  'لا يوجد قالب خاص بهذا البلد؛ تم إعداد صيغة رسالة عامة. راجع القانون المحلي.',
  'Nessun modello specifico per questo paese; è stato preparato un formato di lettera generale. Verifica la legge locale.',
  '该国家暂无专属模板，已生成通用信函格式。请核对当地法律。',
  'Для этой страны нет отдельного шаблона; подготовлен общий формат письма. Проверьте местное право.',
  'قالب ویژه این کشور وجود ندارد؛ قالب نامه عمومی آماده شد. قانون محلی را بررسی کنید.',
  'この国専用のテンプレートはありません。一般的な書簡形式を作成しました。現地法をご確認ください。',
  'Não há modelo específico para este país; foi preparado um formato de carta geral. Verifique a lei local.',
  'Geen landspecifiek sjabloon; er is een algemene briefvorm opgesteld. Controleer het lokale recht.'
));
set('draftGenericSettlementTitle', ui('Şikâyet ve çözüm talep mektubu', 'Complaint and settlement request letter', 'Beschwerde- und Einigungsschreiben', 'Lettre de réclamation et de demande de règlement', 'Carta de reclamación y solicitud de solución', 'رسالة شكوى وطلب تسوية', 'Lettera di reclamo e richiesta di soluzione', '投诉及和解请求函', 'Претензия с предложением урегулирования', 'نامه شکایت و درخواست حل‌وفصل', '苦情および解決要求の書簡', 'Carta de reclamação e pedido de solução', 'Klacht- en schikkingsbrief'));
set('draftGenericSettlementDesc', ui(
  'Ayıplı ürün veya hizmet için satıcıya yazılı şikâyet ve çözüm talebi.',
  'Written complaint to the seller about a defective product or service, with your request.',
  'Schriftliche Beschwerde an den Verkäufer wegen eines mangelhaften Produkts oder Dienstes, mit Ihrem Anliegen.',
  'Réclamation écrite au vendeur pour un produit ou service défectueux, avec votre demande.',
  'Reclamación escrita al vendedor por un producto o servicio defectuoso, con su petición.',
  'شكوى مكتوبة إلى البائع بشأن منتج أو خدمة معيبة، مع طلبك.',
  'Reclamo scritto al venditore per un prodotto o servizio difettoso, con la tua richiesta.',
  '就瑕疵商品或服务向卖方提出的书面投诉及诉求。',
  'Письменная претензия продавцу о некачественном товаре или услуге с вашим требованием.',
  'شکایت کتبی به فروشنده درباره کالا یا خدمت معیوب، همراه با درخواست شما.',
  '欠陥のある商品・サービスについて販売者へ送る書面の苦情と要望。',
  'Reclamação escrita ao vendedor sobre produto ou serviço defeituoso, com o seu pedido.',
  'Schriftelijke klacht aan de verkoper over een gebrekkig product of dienst, met uw verzoek.'
));
set('draftResetAnswers', ui('Cevapları sıfırla', 'Reset answers', 'Antworten zurücksetzen', 'Réinitialiser les réponses', 'Restablecer respuestas', 'إعادة تعيين الإجابات', 'Azzera risposte', '重置回答', 'Сбросить ответы', 'بازنشانی پاسخ‌ها', '回答をリセット', 'Repor respostas', 'Antwoorden wissen'));

// Generic letters: parties / facts / request / deadline / signature. Same placeholders as TR bodies.
set('draftNoticeGenericBody', lines({
  tr: ['GÖNDEREN: {{sender}}', 'ALICI: {{recipient}}', 'KONU: Ödeme talebi', '', 'OLAYLAR: {{basis}} kapsamında {{amount}} tutarındaki ödemenin vadesi {{dueDate}} tarihidir.', 'TALEP: {{amount}} tutarının ödenmesini talep ediyorum.', 'SÜRE: Lütfen bu mektubu aldığınız tarihten itibaren {{deadlineDays}} gün içinde ödeme yapın.', 'Bu süre içinde ödeme yapılmazsa, bana açık olan diğer adımları değerlendireceğim.', '', 'Tarih: [ gün.ay.yıl ]', 'İmza: {{sender}}'],
  en: ['FROM: {{sender}}', 'TO: {{recipient}}', 'SUBJECT: Request for payment', '', 'FACTS: Under {{basis}}, the amount of {{amount}} fell due on {{dueDate}}.', 'REQUEST: I ask you to pay {{amount}}.', 'DEADLINE: Please pay within {{deadlineDays}} days of receiving this letter.', 'If payment is not made within this period, I will consider the further steps available to me.', '', 'Date: [ dd.mm.yyyy ]', 'Signature: {{sender}}'],
  de: ['VON: {{sender}}', 'AN: {{recipient}}', 'BETREFF: Zahlungsaufforderung', '', 'SACHVERHALT: Aus {{basis}} wurde der Betrag von {{amount}} am {{dueDate}} fällig.', 'FORDERUNG: Ich bitte Sie, {{amount}} zu zahlen.', 'FRIST: Bitte zahlen Sie innerhalb von {{deadlineDays}} Tagen nach Erhalt dieses Schreibens.', 'Erfolgt keine Zahlung in dieser Frist, prüfe ich die mir offenstehenden weiteren Schritte.', '', 'Datum: [ TT.MM.JJJJ ]', 'Unterschrift: {{sender}}'],
  fr: ['DE : {{sender}}', 'À : {{recipient}}', 'OBJET : Demande de paiement', '', 'FAITS : Au titre de {{basis}}, la somme de {{amount}} était exigible le {{dueDate}}.', 'DEMANDE : Je vous demande de régler {{amount}}.', 'DÉLAI : Merci de payer dans les {{deadlineDays}} jours suivant la réception de cette lettre.', 'À défaut de paiement dans ce délai, j’examinerai les autres démarches à ma disposition.', '', 'Date : [ jj.mm.aaaa ]', 'Signature : {{sender}}'],
  es: ['DE: {{sender}}', 'PARA: {{recipient}}', 'ASUNTO: Solicitud de pago', '', 'HECHOS: En virtud de {{basis}}, el importe de {{amount}} venció el {{dueDate}}.', 'PETICIÓN: Le solicito el pago de {{amount}}.', 'PLAZO: Pague dentro de los {{deadlineDays}} días siguientes a la recepción de esta carta.', 'Si no se realiza el pago en ese plazo, valoraré los demás pasos a mi alcance.', '', 'Fecha: [ dd.mm.aaaa ]', 'Firma: {{sender}}'],
  ar: ['من: {{sender}}', 'إلى: {{recipient}}', 'الموضوع: طلب سداد', '', 'الوقائع: بموجب {{basis}} استحق المبلغ {{amount}} بتاريخ {{dueDate}}.', 'الطلب: أطلب منكم سداد {{amount}}.', 'المهلة: يرجى السداد خلال {{deadlineDays}} يومًا من استلام هذه الرسالة.', 'في حال عدم السداد خلال هذه المهلة، سأدرس الخطوات الأخرى المتاحة لي.', '', 'التاريخ: [ يوم.شهر.سنة ]', 'التوقيع: {{sender}}'],
  it: ['DA: {{sender}}', 'A: {{recipient}}', 'OGGETTO: Richiesta di pagamento', '', 'FATTI: In base a {{basis}}, l’importo di {{amount}} è scaduto il {{dueDate}}.', 'RICHIESTA: Vi chiedo di pagare {{amount}}.', 'TERMINE: Vi prego di pagare entro {{deadlineDays}} giorni dal ricevimento di questa lettera.', 'In mancanza di pagamento entro tale termine, valuterò gli ulteriori passi a mia disposizione.', '', 'Data: [ gg.mm.aaaa ]', 'Firma: {{sender}}'],
  zh: ['发件人：{{sender}}', '收件人：{{recipient}}', '事由：付款请求', '', '事实：根据{{basis}}，{{amount}}已于{{dueDate}}到期。', '请求：请支付{{amount}}。', '期限：请在收到本函之日起{{deadlineDays}}日内付款。', '如未在上述期限内付款，我将考虑可采取的其他措施。', '', '日期：[ 日.月.年 ]', '签名：{{sender}}'],
  ru: ['ОТ: {{sender}}', 'КОМУ: {{recipient}}', 'ТЕМА: Просьба об оплате', '', 'ОБСТОЯТЕЛЬСТВА: По {{basis}} сумма {{amount}} подлежала оплате {{dueDate}}.', 'ТРЕБОВАНИЕ: Прошу оплатить {{amount}}.', 'СРОК: Пожалуйста, оплатите в течение {{deadlineDays}} дней с момента получения письма.', 'Если оплата не поступит в этот срок, я рассмотрю доступные мне дальнейшие шаги.', '', 'Дата: [ дд.мм.гггг ]', 'Подпись: {{sender}}'],
  fa: ['از: {{sender}}', 'به: {{recipient}}', 'موضوع: درخواست پرداخت', '', 'شرح: بر اساس {{basis}}، مبلغ {{amount}} در تاریخ {{dueDate}} سررسید شد.', 'درخواست: خواهشمندم {{amount}} را پرداخت کنید.', 'مهلت: لطفاً ظرف {{deadlineDays}} روز از دریافت این نامه پرداخت کنید.', 'در صورت عدم پرداخت در این مهلت، گام‌های دیگری را که در اختیار دارم بررسی خواهم کرد.', '', 'تاریخ: [ روز.ماه.سال ]', 'امضا: {{sender}}'],
  ja: ['差出人：{{sender}}', '宛先：{{recipient}}', '件名：お支払いのお願い', '', '事実：{{basis}}に基づき、{{amount}}は{{dueDate}}に支払期日を迎えました。', '要望：{{amount}}のお支払いをお願いします。', '期限：本書面の受領から{{deadlineDays}}日以内にお支払いください。', '期限内にお支払いがない場合、とり得る次の手段を検討します。', '', '日付：[ 年.月.日 ]', '署名：{{sender}}'],
  pt: ['DE: {{sender}}', 'PARA: {{recipient}}', 'ASSUNTO: Pedido de pagamento', '', 'FACTOS: Nos termos de {{basis}}, o montante de {{amount}} venceu em {{dueDate}}.', 'PEDIDO: Solicito o pagamento de {{amount}}.', 'PRAZO: Pague no prazo de {{deadlineDays}} dias após a receção desta carta.', 'Na falta de pagamento neste prazo, ponderarei os demais passos ao meu dispor.', '', 'Data: [ dd.mm.aaaa ]', 'Assinatura: {{sender}}'],
  nl: ['VAN: {{sender}}', 'AAN: {{recipient}}', 'BETREFT: Verzoek tot betaling', '', 'FEITEN: Op grond van {{basis}} is het bedrag van {{amount}} op {{dueDate}} verschuldigd geworden.', 'VERZOEK: Ik verzoek u {{amount}} te betalen.', 'TERMIJN: Betaal binnen {{deadlineDays}} dagen na ontvangst van deze brief.', 'Blijft betaling binnen deze termijn uit, dan overweeg ik de verdere stappen die mij openstaan.', '', 'Datum: [ dd.mm.jjjj ]', 'Handtekening: {{sender}}'],
}));
set('draftConsumerGenericBody', lines({
  tr: ['GÖNDEREN: {{consumer}}', 'ALICI: {{seller}}', 'KONU: Şikâyet ve çözüm talebi', '', 'ÜRÜN / HİZMET: {{product}}', 'SATIN ALMA TARİHİ: {{purchaseDate}}', '', 'OLAYLAR:', '{{problem}}', '', 'TALEP: {{request}}', 'SÜRE: Lütfen bu mektubu aldığınız tarihten itibaren [ gün sayısı ] gün içinde yanıt verin.', '', 'EKLER: [ fatura / fiş, yazışmalar, fotoğraflar ]', 'Tarih: [ gün.ay.yıl ]', 'İmza: {{consumer}}'],
  en: ['FROM: {{consumer}}', 'TO: {{seller}}', 'SUBJECT: Complaint and request for a solution', '', 'PRODUCT / SERVICE: {{product}}', 'PURCHASE DATE: {{purchaseDate}}', '', 'FACTS:', '{{problem}}', '', 'REQUEST: {{request}}', 'DEADLINE: Please reply within [ number of days ] days of receiving this letter.', '', 'ATTACHMENTS: [ invoice / receipt, correspondence, photos ]', 'Date: [ dd.mm.yyyy ]', 'Signature: {{consumer}}'],
  de: ['VON: {{consumer}}', 'AN: {{seller}}', 'BETREFF: Beschwerde und Bitte um Lösung', '', 'PRODUKT / DIENSTLEISTUNG: {{product}}', 'KAUFDATUM: {{purchaseDate}}', '', 'SACHVERHALT:', '{{problem}}', '', 'ANLIEGEN: {{request}}', 'FRIST: Bitte antworten Sie innerhalb von [ Anzahl Tage ] Tagen nach Erhalt dieses Schreibens.', '', 'ANLAGEN: [ Rechnung / Beleg, Schriftverkehr, Fotos ]', 'Datum: [ TT.MM.JJJJ ]', 'Unterschrift: {{consumer}}'],
  fr: ['DE : {{consumer}}', 'À : {{seller}}', 'OBJET : Réclamation et demande de solution', '', 'PRODUIT / SERVICE : {{product}}', 'DATE D’ACHAT : {{purchaseDate}}', '', 'FAITS :', '{{problem}}', '', 'DEMANDE : {{request}}', 'DÉLAI : Merci de répondre dans les [ nombre de jours ] jours suivant la réception de cette lettre.', '', 'PIÈCES JOINTES : [ facture / ticket, échanges, photos ]', 'Date : [ jj.mm.aaaa ]', 'Signature : {{consumer}}'],
  es: ['DE: {{consumer}}', 'PARA: {{seller}}', 'ASUNTO: Reclamación y solicitud de solución', '', 'PRODUCTO / SERVICIO: {{product}}', 'FECHA DE COMPRA: {{purchaseDate}}', '', 'HECHOS:', '{{problem}}', '', 'PETICIÓN: {{request}}', 'PLAZO: Responda dentro de los [ número de días ] días siguientes a la recepción de esta carta.', '', 'ANEXOS: [ factura / tique, correspondencia, fotos ]', 'Fecha: [ dd.mm.aaaa ]', 'Firma: {{consumer}}'],
  ar: ['من: {{consumer}}', 'إلى: {{seller}}', 'الموضوع: شكوى وطلب حل', '', 'المنتج / الخدمة: {{product}}', 'تاريخ الشراء: {{purchaseDate}}', '', 'الوقائع:', '{{problem}}', '', 'الطلب: {{request}}', 'المهلة: يرجى الرد خلال [ عدد الأيام ] يومًا من استلام هذه الرسالة.', '', 'المرفقات: [ فاتورة / إيصال، مراسلات، صور ]', 'التاريخ: [ يوم.شهر.سنة ]', 'التوقيع: {{consumer}}'],
  it: ['DA: {{consumer}}', 'A: {{seller}}', 'OGGETTO: Reclamo e richiesta di soluzione', '', 'PRODOTTO / SERVIZIO: {{product}}', 'DATA DI ACQUISTO: {{purchaseDate}}', '', 'FATTI:', '{{problem}}', '', 'RICHIESTA: {{request}}', 'TERMINE: Vi prego di rispondere entro [ numero di giorni ] giorni dal ricevimento di questa lettera.', '', 'ALLEGATI: [ fattura / scontrino, corrispondenza, foto ]', 'Data: [ gg.mm.aaaa ]', 'Firma: {{consumer}}'],
  zh: ['发件人：{{consumer}}', '收件人：{{seller}}', '事由：投诉及解决请求', '', '商品 / 服务：{{product}}', '购买日期：{{purchaseDate}}', '', '事实：', '{{problem}}', '', '请求：{{request}}', '期限：请在收到本函之日起[ 天数 ]日内答复。', '', '附件：[ 发票 / 收据、往来记录、照片 ]', '日期：[ 日.月.年 ]', '签名：{{consumer}}'],
  ru: ['ОТ: {{consumer}}', 'КОМУ: {{seller}}', 'ТЕМА: Претензия и просьба о решении', '', 'ТОВАР / УСЛУГА: {{product}}', 'ДАТА ПОКУПКИ: {{purchaseDate}}', '', 'ОБСТОЯТЕЛЬСТВА:', '{{problem}}', '', 'ТРЕБОВАНИЕ: {{request}}', 'СРОК: Пожалуйста, ответьте в течение [ число дней ] дней с момента получения письма.', '', 'ПРИЛОЖЕНИЯ: [ счёт / чек, переписка, фото ]', 'Дата: [ дд.мм.гггг ]', 'Подпись: {{consumer}}'],
  fa: ['از: {{consumer}}', 'به: {{seller}}', 'موضوع: شکایت و درخواست راه‌حل', '', 'کالا / خدمت: {{product}}', 'تاریخ خرید: {{purchaseDate}}', '', 'شرح ماجرا:', '{{problem}}', '', 'درخواست: {{request}}', 'مهلت: لطفاً ظرف [ تعداد روز ] روز از دریافت این نامه پاسخ دهید.', '', 'پیوست‌ها: [ فاکتور / رسید، مکاتبات، عکس‌ها ]', 'تاریخ: [ روز.ماه.سال ]', 'امضا: {{consumer}}'],
  ja: ['差出人：{{consumer}}', '宛先：{{seller}}', '件名：苦情および解決のお願い', '', '商品・サービス：{{product}}', '購入日：{{purchaseDate}}', '', '経緯：', '{{problem}}', '', '要望：{{request}}', '期限：本書面の受領から[ 日数 ]日以内にご回答ください。', '', '添付書類：[ 請求書・レシート、やり取りの記録、写真 ]', '日付：[ 年.月.日 ]', '署名：{{consumer}}'],
  pt: ['DE: {{consumer}}', 'PARA: {{seller}}', 'ASSUNTO: Reclamação e pedido de solução', '', 'PRODUTO / SERVIÇO: {{product}}', 'DATA DE COMPRA: {{purchaseDate}}', '', 'FACTOS:', '{{problem}}', '', 'PEDIDO: {{request}}', 'PRAZO: Responda no prazo de [ número de dias ] dias após a receção desta carta.', '', 'ANEXOS: [ fatura / recibo, correspondência, fotos ]', 'Data: [ dd.mm.aaaa ]', 'Assinatura: {{consumer}}'],
  nl: ['VAN: {{consumer}}', 'AAN: {{seller}}', 'BETREFT: Klacht en verzoek om een oplossing', '', 'PRODUCT / DIENST: {{product}}', 'AANKOOPDATUM: {{purchaseDate}}', '', 'FEITEN:', '{{problem}}', '', 'VERZOEK: {{request}}', 'TERMIJN: Reageer binnen [ aantal dagen ] dagen na ontvangst van deze brief.', '', 'BIJLAGEN: [ factuur / bon, correspondentie, foto’s ]', 'Datum: [ dd.mm.jjjj ]', 'Handtekening: {{consumer}}'],
}));

const out = {};
for (const lang of langs) {
  out[lang] = {};
  for (const key of Object.keys(T)) {
    const value = T[key][lang];
    if (typeof value !== 'string' || !value.trim()) throw new Error(`missing ${lang}.${key}`);
    out[lang][key] = value;
  }
}
const file = `// WAVE CB.1 — Jurisdiction packs. Same key set in all 13 languages.\n\nexport const WAVE_CB1_I18N = ${JSON.stringify(out, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'i18n.wavecb1.js'), file, 'utf8');
console.log('Wrote i18n.wavecb1.js keys=', Object.keys(T).length, 'langs=', langs.length);
