/**
 * WAVE CA′ i18n generator. EN+TR fully authored; other langs get UI chrome
 * translated and EN fallback for long step bodies (parity keys present).
 * Run: node scripts/gen-waveca-i18n.js
 */
const fs = require('fs');
const path = require('path');

// Resolve scenario keys without ESM issues (CJS require of .js exporting const).
const scenPath = path.join(__dirname, '..', 'constants', 'legalScenarios.js');
const scenSrc = fs.readFileSync(scenPath, 'utf8');
const { LEGAL_SCENARIOS } = require('../constants/legalScenarios.js');

const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];

const SHARED = {
  scenarioSectionTitle: {
    tr: 'Hızlı Aksiyon Senaryoları',
    en: 'Fast Action Scenarios',
    de: 'Schnellaktions-Szenarien',
    fr: 'Scénarios d’action rapide',
    es: 'Escenarios de acción rápida',
    ar: 'سيناريوهات إجراء سريع',
    it: 'Scenari di azione rapida',
    zh: '快速行动场景',
    ru: 'Сценарии быстрых действий',
    fa: 'سناریوهای اقدام سریع',
    ja: 'クイック行動シナリオ',
    pt: 'Cenários de ação rápida',
    nl: 'Snelle-actie scenario’s',
  },
  scenarioSectionHint: {
    tr: '3 soru → anında yerel yol haritası. Kanun uydurulmaz; avukat yerine geçmez.',
    en: '3 questions → instant local roadmap. No invented law; not a lawyer substitute.',
    de: '3 Fragen → sofortige lokale Roadmap. Kein erfundenes Recht; kein Anwaltsersatz.',
    fr: '3 questions → feuille de route locale. Pas de droit inventé ; pas un avocat.',
    es: '3 preguntas → hoja de ruta local. Sin inventar derecho; no sustituye a un abogado.',
    ar: '3 أسئلة ← خارطة طريق محلية فورية. لا قانون مخترع؛ ليست بديلاً عن محامٍ.',
    it: '3 domande → roadmap locale. Nessuna legge inventata; non sostituisce un avvocato.',
    zh: '3 个问题 → 即时本地路线图。不编造法律；不能替代律师。',
    ru: '3 вопроса → локальная дорожная карта. Без выдуманного права; не замена адвокату.',
    fa: '۳ سؤال ← نقشه راه محلی فوری. قانون جعل نمی‌شود؛ جایگزین وکیل نیست.',
    ja: '3問 → 即時ローカル道筋。法を創作しません。弁護士の代替ではありません。',
    pt: '3 perguntas → roteiro local. Sem inventar direito; não substitui advogado.',
    nl: '3 vragen → lokale roadmap. Geen verzonnen recht; geen advocaatvervanging.',
  },
  scenarioNext: {
    tr: 'İleri', en: 'Next', de: 'Weiter', fr: 'Suivant', es: 'Siguiente', ar: 'التالي',
    it: 'Avanti', zh: '下一步', ru: 'Далее', fa: 'بعدی', ja: '次へ', pt: 'Seguinte', nl: 'Volgende',
  },
  scenarioBack: {
    tr: 'Geri', en: 'Back', de: 'Zurück', fr: 'Retour', es: 'Atrás', ar: 'رجوع',
    it: 'Indietro', zh: '返回', ru: 'Назад', fa: 'بازگشت', ja: '戻る', pt: 'Voltar', nl: 'Terug',
  },
  scenarioSeeRoadmap: {
    tr: 'Yol Haritasını Gör', en: 'See Roadmap', de: 'Roadmap anzeigen', fr: 'Voir la feuille de route',
    es: 'Ver hoja de ruta', ar: 'عرض الخارطة', it: 'Vedi roadmap', zh: '查看路线图',
    ru: 'Показать карту', fa: 'مشاهده نقشه راه', ja: '道筋を見る', pt: 'Ver roteiro', nl: 'Toon roadmap',
  },
  scenarioCopyRoadmap: {
    tr: 'Kopyala', en: 'Copy', de: 'Kopieren', fr: 'Copier', es: 'Copiar', ar: 'نسخ',
    it: 'Copia', zh: '复制', ru: 'Копировать', fa: 'کپی', ja: 'コピー', pt: 'Copiar', nl: 'Kopiëren',
  },
  scenarioShareWhatsApp: {
    tr: 'WhatsApp ile Paylaş', en: 'Share via WhatsApp', de: 'Per WhatsApp teilen', fr: 'Partager via WhatsApp',
    es: 'Compartir por WhatsApp', ar: 'مشاركة عبر واتساب', it: 'Condividi su WhatsApp', zh: '通过 WhatsApp 分享',
    ru: 'Поделиться в WhatsApp', fa: 'اشتراک در واتساپ', ja: 'WhatsAppで共有', pt: 'Partilhar no WhatsApp', nl: 'Deel via WhatsApp',
  },
  scenarioAskAdvisor: {
    tr: 'Danışmana Soru Sor', en: 'Ask the Advisor', de: 'Berater fragen', fr: 'Demander au conseiller',
    es: 'Preguntar al asesor', ar: 'اسأل المستشار', it: 'Chiedi al consulente', zh: '向顾问提问',
    ru: 'Спросить консультанта', fa: 'از مشاور بپرس', ja: 'アドバイザーに質問', pt: 'Perguntar ao consultor', nl: 'Vraag de adviseur',
  },
  scenarioDocsChecklist: {
    tr: 'Gerekli Belgeler', en: 'Required Documents', de: 'Erforderliche Dokumente', fr: 'Documents requis',
    es: 'Documentos necesarios', ar: 'المستندات المطلوبة', it: 'Documenti richiesti', zh: '所需文件',
    ru: 'Нужные документы', fa: 'مدارک لازم', ja: '必要書類', pt: 'Documentos necessários', nl: 'Benodigde documenten',
  },
  scenarioLawyerTitle: {
    tr: 'Avukata Git Eşiği', en: 'Consult Attorney Threshold', de: 'Anwaltsschwelle', fr: 'Seuil avocat',
    es: 'Umbral de abogado', ar: 'عتبة استشارة محامٍ', it: 'Soglia avvocato', zh: '咨询律师门槛',
    ru: 'Порог обращения к адвокату', fa: 'آستانه مراجعه به وکیل', ja: '弁護士相談の目安', pt: 'Limiar do advogado', nl: 'Advocaat-drempel',
  },
  scenarioTimelineTitle: {
    tr: 'Aksiyon Zaman Çizelgesi', en: 'Action Timeline', de: 'Aktionszeitplan', fr: 'Chronologie d’actions',
    es: 'Cronograma de acciones', ar: 'الجدول الزمني للإجراء', it: 'Cronologia azioni', zh: '行动时间线',
    ru: 'График действий', fa: 'جدول زمانی اقدام', ja: 'アクションタイムライン', pt: 'Cronograma de ações', nl: 'Actietijdlijn',
  },
  scenarioClose: {
    tr: 'Kapat', en: 'Close', de: 'Schließen', fr: 'Fermer', es: 'Cerrar', ar: 'إغلاق',
    it: 'Chiudi', zh: '关闭', ru: 'Закрыть', fa: 'بستن', ja: '閉じる', pt: 'Fechar', nl: 'Sluiten',
  },
  scenarioLegalDisclaimer: {
    tr: 'Bu yol haritası genel bilgilendirmedir; hukuki tavsiye veya mahkeme temsili değildir. Kazanma oranı veya emsal karar uydurulmaz. Kişisel durumunuz için lisanslı bir avukata danışın.',
    en: 'This roadmap is general information only — not legal advice or court representation. No win-rate or precedent is invented. Consult a licensed attorney for your situation.',
    de: 'Diese Roadmap ist nur allgemeine Information — keine Rechtsberatung und keine Prozessvertretung. Keine Gewinnquote oder Präzedenzfälle. Fragen Sie einen zugelassenen Anwalt.',
    fr: 'Cette feuille de route est une information générale — pas un conseil juridique ni une représentation en justice. Aucun taux de succès ni précédent inventé. Consultez un avocat agréé.',
    es: 'Esta hoja de ruta es información general — no es asesoría legal ni representación judicial. No se inventan tasas de éxito ni precedentes. Consulte a un abogado colegiado.',
    ar: 'هذه الخارطة معلومات عامة فقط — ليست استشارة قانونية ولا تمثيلاً أمام المحكمة. لا تُختلق نسب فوز أو سوابق. استشر محامياً مرخصاً لوضعك.',
    it: 'Questa roadmap è solo informazione generale — non è consulenza legale né rappresentanza in giudizio. Nessuna percentuale di vittoria o precedente inventato. Consulti un avvocato abilitato.',
    zh: '本路线图仅为一般信息——不是法律意见或出庭代理。不编造胜诉率或判例。请就您的情况咨询持牌律师。',
    ru: 'Эта карта — общая информация, не юридическая консультация и не представительство в суде. Процент выигрыша и прецеденты не выдумываются. Обратитесь к лицензированному юристу.',
    fa: 'این نقشه راه فقط اطلاعات عمومی است — مشاوره حقوقی یا نمایندگی دادگاه نیست. درصد پیروزی یا سابقه جعل نمی‌شود. برای وضعیت خود با وکیل دارای مجوز مشورت کنید.',
    ja: 'この道筋は一般情報のみで、法律助言や法廷代理ではありません。勝率や判例は創作しません。ご自身の状況は資格ある弁護士にご相談ください。',
    pt: 'Este roteiro é informação geral — não é aconselhamento jurídico nem representação em tribunal. Não se inventam taxas de êxito nem precedentes. Consulte um advogado licenciado.',
    nl: 'Deze roadmap is algemene informatie — geen juridisch advies of procesvertegenwoordiging. Geen winstkans of precedent verzonnen. Raadpleeg een bevoegde advocaat.',
  },
  scenarioAskAdvisorPrompt: {
    tr: 'Aşağıdaki senaryo yol haritasına göre durumumu netleştirmek istiyorum. Lütfen genel bilgilendirme olarak yorumlayın; emsal/kazanma oranı uydurmayın:',
    en: 'Please help me clarify my situation based on this scenario roadmap. Give general information only; do not invent precedents or win rates:',
    de: 'Bitte klären Sie meine Lage anhand dieser Roadmap. Nur allgemeine Information; keine Präzedenzfälle oder Gewinnquoten erfinden:',
    fr: 'Aidez-moi à clarifier ma situation selon cette feuille de route. Information générale seulement ; n’inventez ni précédents ni taux de succès :',
    es: 'Ayúdeme a aclarar mi situación según esta hoja de ruta. Solo información general; no invente precedentes ni tasas de éxito:',
    ar: 'ساعدني في توضيح وضعي وفق هذه الخارطة. معلومات عامة فقط؛ لا تختلق سوابق أو نسب فوز:',
    it: 'Aiutami a chiarire la mia situazione in base a questa roadmap. Solo informazione generale; non inventare precedenti o percentuali di vittoria:',
    zh: '请根据此场景路线图澄清我的情况。仅提供一般信息；不要编造判例或胜诉率：',
    ru: 'Помогите уточнить мою ситуацию по этой дорожной карте. Только общая информация; не выдумывайте прецеденты и шансы выигрыша:',
    fa: 'لطفاً بر اساس این نقشه راه وضعیت مرا روشن کنید. فقط اطلاعات عمومی؛ سابقه یا درصد پیروزی جعل نکنید:',
    ja: 'このシナリオ道筋に基づき状況を整理してください。一般情報のみ。判例や勝率は創作しないでください：',
    pt: 'Ajude-me a clarificar a minha situação com base neste roteiro. Só informação geral; não invente precedentes nem taxas de êxito:',
    nl: 'Help mijn situatie te verduidelijken op basis van deze roadmap. Alleen algemene info; verzin geen precedenten of winstkansen:',
  },
  scenarioTimeImmediate: {
    tr: 'Hemen / bugün', en: 'Immediately / today', de: 'Sofort / heute', fr: 'Immédiatement / aujourd’hui',
    es: 'Inmediatamente / hoy', ar: 'فوراً / اليوم', it: 'Subito / oggi', zh: '立即 / 今天',
    ru: 'Сразу / сегодня', fa: 'فوری / امروز', ja: '直ちに / 今日', pt: 'Imediatamente / hoje', nl: 'Direct / vandaag',
  },
  scenarioTime7Days: {
    tr: '≈ 7 gün', en: '≈ 7 days', de: '≈ 7 Tage', fr: '≈ 7 jours', es: '≈ 7 días', ar: '≈ ٧ أيام',
    it: '≈ 7 giorni', zh: '约 7 天', ru: '≈ 7 дней', fa: '≈ ۷ روز', ja: '約7日', pt: '≈ 7 dias', nl: '≈ 7 dagen',
  },
  scenarioTime30Days: {
    tr: '≈ 30 gün', en: '≈ 30 days', de: '≈ 30 Tage', fr: '≈ 30 jours', es: '≈ 30 días', ar: '≈ ٣٠ يوماً',
    it: '≈ 30 giorni', zh: '约 30 天', ru: '≈ 30 дней', fa: '≈ ۳۰ روز', ja: '約30日', pt: '≈ 30 dias', nl: '≈ 30 dagen',
  },
  scenarioTime60Days: {
    tr: '≈ 60 gün', en: '≈ 60 days', de: '≈ 60 Tage', fr: '≈ 60 jours', es: '≈ 60 días', ar: '≈ ٦٠ يوماً',
    it: '≈ 60 giorni', zh: '约 60 天', ru: '≈ 60 дней', fa: '≈ ۶۰ روز', ja: '約60日', pt: '≈ 60 dias', nl: '≈ 60 dagen',
  },
  scenarioDocPayslips: {
    tr: 'Bordro / maaş kayıtları', en: 'Payslips / wage records', de: 'Lohnabrechnungen', fr: 'Bulletins de paie',
    es: 'Nóminas', ar: 'كشوف رواتب', it: 'Buste paga', zh: '工资单', ru: 'Расчётные листки', fa: 'فیش حقوقی',
    ja: '給与明細', pt: 'Recibos de vencimento', nl: 'Loonstroken',
  },
  scenarioDocContracts: {
    tr: 'Sözleşme / ek protokoller', en: 'Contract / addenda', de: 'Vertrag / Nachträge', fr: 'Contrat / avenants',
    es: 'Contrato / anexos', ar: 'العقد / الملاحق', it: 'Contratto / allegati', zh: '合同 / 附件',
    ru: 'Договор / доп. соглашения', fa: 'قرارداد / الحاقیه‌ها', ja: '契約 / 追補', pt: 'Contrato / aditamentos', nl: 'Contract / bijlagen',
  },
  scenarioDocMessages: {
    tr: 'Yazışmalar (e-posta/WhatsApp)', en: 'Messages (email/WhatsApp)', de: 'Nachrichten (E-Mail/WhatsApp)',
    fr: 'Messages (e-mail/WhatsApp)', es: 'Mensajes (correo/WhatsApp)', ar: 'الرسائل (بريد/واتساب)',
    it: 'Messaggi (email/WhatsApp)', zh: '通讯记录（邮件/WhatsApp）', ru: 'Переписка (email/WhatsApp)',
    fa: 'پیام‌ها (ایمیل/واتساپ)', ja: 'メッセージ（メール/WhatsApp）', pt: 'Mensagens (email/WhatsApp)', nl: 'Berichten (e-mail/WhatsApp)',
  },
  scenarioDocBank: {
    tr: 'Banka dekontları / ödeme kayıtları', en: 'Bank slips / payment records', de: 'Kontoauszüge / Zahlungsbelege',
    fr: 'Relevés bancaires / paiements', es: 'Extractos / pagos', ar: 'كشوف بنكية / مدفوعات',
    it: 'Estratti conto / pagamenti', zh: '银行回单 / 付款记录', ru: 'Банковские выписки / платежи',
    fa: 'فیش بانکی / پرداخت‌ها', ja: '銀行明細 / 支払記録', pt: 'Extratos / pagamentos', nl: 'Bankafschriften / betalingen',
  },
  scenarioDocLease: {
    tr: 'Kira sözleşmesi', en: 'Lease agreement', de: 'Mietvertrag', fr: 'Bail', es: 'Contrato de alquiler',
    ar: 'عقد الإيجار', it: 'Contratto di locazione', zh: '租赁合同', ru: 'Договор аренды', fa: 'اجاره‌نامه',
    ja: '賃貸契約', pt: 'Contrato de arrendamento', nl: 'Huurcontract',
  },
  scenarioDocInvoice: {
    tr: 'Fatura / sipariş fişi', en: 'Invoice / order receipt', de: 'Rechnung / Bestellbeleg', fr: 'Facture / reçu',
    es: 'Factura / recibo', ar: 'فاتورة / إيصال', it: 'Fattura / ricevuta', zh: '发票 / 订单收据',
    ru: 'Счёт / чек заказа', fa: 'فاکتور / رسید', ja: '請求書 / 注文明細', pt: 'Fatura / recibo', nl: 'Factuur / orderbewijs',
  },
  scenarioDocPhotos: {
    tr: 'Kusur fotoğrafları / video', en: 'Defect photos / video', de: 'Mangel-Fotos / Video', fr: 'Photos / vidéo du défaut',
    es: 'Fotos / vídeo del defecto', ar: 'صور / فيديو العيب', it: 'Foto / video del difetto', zh: '缺陷照片 / 视频',
    ru: 'Фото / видео дефекта', fa: 'عکس / ویدئوی نقص', ja: '欠陥の写真 / 動画', pt: 'Fotos / vídeo do defeito', nl: 'Gebreksfoto’s / video',
  },
  scenarioDocEvidence: {
    tr: 'İhlal kanıtları (ekran görüntüsü vb.)', en: 'Breach evidence (screenshots, etc.)', de: 'Verletzungsbeweise (Screenshots usw.)',
    fr: 'Preuves de violation (captures, etc.)', es: 'Pruebas de infracción (capturas, etc.)', ar: 'أدلة الإخلال (لقطات وغيرها)',
    it: 'Prove di violazione (screenshot, ecc.)', zh: '违约证据（截图等）', ru: 'Доказательства нарушения (скриншоты и т.п.)',
    fa: 'ادله نقض (اسکرین‌شات و غیره)', ja: '違反証拠（スクショ等）', pt: 'Provas de violação (capturas, etc.)', nl: 'Bewijs van schending (screenshots enz.)',
  },
  scenarioDocId: {
    tr: 'Kimlik / yetki belgeleri', en: 'ID / authority documents', de: 'Ausweis / Vollmachten', fr: 'Pièce d’identité / pouvoirs',
    es: 'Identificación / poderes', ar: 'هوية / تفويض', it: 'Documento / procure', zh: '身份 / 授权文件',
    ru: 'Удостоверение / полномочия', fa: 'مدارک هویت / نمایندگی', ja: '身分証 / 権限書類', pt: 'Identificação / procurações', nl: 'ID / bevoegdheidsdocumenten',
  },
};

// EN + TR content for scenario-specific keys (questions, steps, lawyers).
const EN_TR = {
  // Labor
  scenarioLaborTitle: { en: 'Job exit / severance', tr: 'İşten çıkarılma / tazminat' },
  scenarioLaborDesc: { en: 'Unpaid severance, overtime, or unfair-dismissal framing.', tr: 'Ödenmeyen kıdem, fazla mesai veya haksız fesih çerçevesi.' },
  scenarioLaborQTenure: { en: 'How long did you work?', tr: 'Ne kadar süre çalıştınız?' },
  scenarioLaborOptUnder1: { en: 'Under 1 year', tr: '1 yıldan az' },
  scenarioLaborOpt1to5: { en: '1–5 years', tr: '1–5 yıl' },
  scenarioLaborOptOver5: { en: 'Over 5 years', tr: '5 yıldan fazla' },
  scenarioLaborQSeverance: { en: 'Was severance / notice pay settled?', tr: 'Kıdem / ihbar tazminatı ödendi mi?' },
  scenarioLaborOptPaid: { en: 'Fully paid', tr: 'Tamamen ödendi' },
  scenarioLaborOptUnpaid: { en: 'Not paid', tr: 'Ödenmedi' },
  scenarioLaborOptPartial: { en: 'Partially paid', tr: 'Kısmen ödendi' },
  scenarioLaborQNotice: { en: 'Was written notice given?', tr: 'Yazılı bildirim yapıldı mı?' },
  scenarioLaborOptNoticeYes: { en: 'Yes', tr: 'Evet' },
  scenarioLaborOptNoticeNo: { en: 'No', tr: 'Hayır' },
  scenarioLaborOptNoticeUnknown: { en: 'Not sure', tr: 'Emin değilim' },
  scenarioLaborLawyerUnpaid: { en: 'See a labor attorney if the employer refuses a written settlement, deadlines are near, or the claim is complex (multiple years / overtime stacks).', tr: 'İşveren yazılı uzlaşmayı reddederse, süreler yaklaşıyorsa veya talep karmaşıksa (çok yıllı / fazla mesai yığını) iş hukuku avukatına gidin.' },
  scenarioLaborLawyerPaid: { en: 'Consult an attorney if you suspect underpayment despite a receipt, or if you signed a broad release under pressure.', tr: 'Makbuz olsa da eksik ödeme şüphesi veya baskı altında geniş ibraname imzaladıysanız avukata danışın.' },
  scenarioLaborLawyerDefault: { en: 'Consult a licensed labor attorney before filing any lawsuit or mediation application.', tr: 'Dava veya arabuluculuk başvurusundan önce lisanslı iş hukuku avukatına danışın.' },

  scenarioLaborUnpaidNoNotice_s1_title: { en: 'Preserve evidence', tr: 'Kanıtları koruyun' },
  scenarioLaborUnpaidNoNotice_s1_detail: { en: 'Save contracts, payslips, timesheets, and termination messages. Do not delete chats.', tr: 'Sözleşme, bordro, puantaj ve fesih yazışmalarını saklayın. Sohbetleri silmeyin.' },
  scenarioLaborUnpaidNoNotice_s2_title: { en: 'Send a written demand', tr: 'Yazılı ihtar/talep gönderin' },
  scenarioLaborUnpaidNoNotice_s2_detail: { en: 'Ask in writing for unpaid severance/notice items with a clear deadline. Keep proof of delivery.', tr: 'Ödenmeyen kıdem/ihbar kalemlerini yazılı talep edin; süre verin. Tebliğ kanıtını saklayın.' },
  scenarioLaborUnpaidNoNotice_s3_title: { en: 'Mediation / authority gate', tr: 'Arabuluculuk / merci kapısı' },
  scenarioLaborUnpaidNoNotice_s3_detail: { en: 'Where required by local labor rules, prepare mediation or labor authority filing with your document pack.', tr: 'Yerel iş kuralları gerektiriyorsa arabuluculuk veya iş merci başvurusunu belge dosyanızla hazırlayın.' },

  scenarioLaborUnpaidClaim_s1_title: { en: 'List unpaid items', tr: 'Ödenmeyen kalemleri listeleyin' },
  scenarioLaborUnpaidClaim_s1_detail: { en: 'Separate severance, notice pay, overtime, and unused leave with rough date ranges.', tr: 'Kıdem, ihbar, fazla mesai ve kullanılmayan izni tarih aralıklarıyla ayırın.' },
  scenarioLaborUnpaidClaim_s2_title: { en: 'Written follow-up', tr: 'Yazılı takip' },
  scenarioLaborUnpaidClaim_s2_detail: { en: 'Send a calm written follow-up citing the unpaid list. Avoid threats or invented statutes.', tr: 'Ödenmeyen listeyi içeren sakin bir yazılı takip gönderin. Tehdit veya uydurma madde yazmayın.' },
  scenarioLaborUnpaidClaim_s3_title: { en: 'Formal path check', tr: 'Resmi yol kontrolü' },
  scenarioLaborUnpaidClaim_s3_detail: { en: 'If unpaid after your deadline, discuss mediation/court gates with counsel — do not self-file complex claims alone.', tr: 'Süre dolunca ödeme yoksa arabuluculuk/mahkeme kapısını avukatla konuşun; karmaşık davayı yalnız açmayın.' },

  scenarioLaborPaidReview_s1_title: { en: 'Audit the settlement', tr: 'Ödemeyi denetleyin' },
  scenarioLaborPaidReview_s1_detail: { en: 'Compare receipt totals to expected severance/notice using your tenure and last wage records.', tr: 'Makbuz toplamını kıdem/ihbar beklentisiyle (kıdem + son ücret) karşılaştırın.' },
  scenarioLaborPaidReview_s2_title: { en: 'Check release language', tr: 'İbraname dilini kontrol edin' },
  scenarioLaborPaidReview_s2_detail: { en: 'If you signed a release, note date and pressure context. Do not assume it is always invalid.', tr: 'İbraname imzaladıysanız tarih ve baskı bağlamını not edin. Her zaman geçersiz sanmayın.' },
  scenarioLaborPaidReview_s3_title: { en: 'Ask counsel if short', tr: 'Eksikse avukata sorun' },
  scenarioLaborPaidReview_s3_detail: { en: 'If numbers look short or the release is sweeping, get a licensed review before further claims.', tr: 'Rakamlar eksik veya ibraname çok genişse, ek talep öncesi lisanslı inceleme alın.' },

  scenarioLaborDefault_s1_title: { en: 'Collect core file', tr: 'Temel dosyayı toplayın' },
  scenarioLaborDefault_s1_detail: { en: 'Gather contract, payroll, and exit letters before deciding next steps.', tr: 'Sonraki adımlardan önce sözleşme, bordro ve çıkış yazılarını toplayın.' },
  scenarioLaborDefault_s2_title: { en: 'Clarify open balances', tr: 'Açık bakiyeleri netleştirin' },
  scenarioLaborDefault_s2_detail: { en: 'Write a short list of what you believe is unpaid and why (dates, amounts).', tr: 'Ödenmediğini düşündüğünüz kalemleri nedenleriyle (tarih, tutar) kısa listeleyin.' },
  scenarioLaborDefault_s3_title: { en: 'Professional checkpoint', tr: 'Profesyonel kontrol noktası' },
  scenarioLaborDefault_s3_detail: { en: 'Use the advisor chat for a general Q&A, then consult an attorney for filing decisions.', tr: 'Genel soru için danışman sohbetini kullanın; başvuru kararı için avukata danışın.' },

  // Rent
  scenarioRentTitle: { en: 'Rent arrears / eviction notice', tr: 'Kira gecikmesi / tahliye ihtarı' },
  scenarioRentDesc: { en: 'Landlord or tenant unpaid rent and notice flow.', tr: 'Kiracı veya mal sahibi için ödenmeyen kira ve ihtar akışı.' },
  scenarioRentQRole: { en: 'Your role?', tr: 'Rolünüz?' },
  scenarioRentOptTenant: { en: 'Tenant', tr: 'Kiracı' },
  scenarioRentOptLandlord: { en: 'Landlord', tr: 'Mal sahibi' },
  scenarioRentQMonths: { en: 'How many months unpaid?', tr: 'Kaç aylık kira ödenmedi?' },
  scenarioRentOpt1m: { en: 'About 1 month', tr: 'Yaklaşık 1 ay' },
  scenarioRentOpt2to3: { en: '2–3 months', tr: '2–3 ay' },
  scenarioRentOpt4plus: { en: '4+ months', tr: '4+ ay' },
  scenarioRentQNotice: { en: 'Was a written notice sent/received?', tr: 'Yazılı ihtar gönderildi/alındı mı?' },
  scenarioRentOptNoticeYes: { en: 'Yes', tr: 'Evet' },
  scenarioRentOptNoticeNo: { en: 'No', tr: 'Hayır' },
  scenarioRentLawyerLand: { en: 'See a real-estate/lease attorney before eviction filings or lockouts — especially if notices are disputed.', tr: 'Tahliye başvurusu veya kapı kilitlemeden önce (ihtilaf varsa özellikle) kira/gayrimenkul avukatına gidin.' },
  scenarioRentLawyerTenant: { en: 'See counsel urgently if you received an eviction notice, utility cutoff threat, or illegal lockout.', tr: 'Tahliye ihtarı, abonelik kesme tehdidi veya hukuka aykırı kilitleme varsa acilen avukata gidin.' },

  scenarioRentLandSevere_s1_title: { en: 'Ledger the arrears', tr: 'Gecikme dökümü' },
  scenarioRentLandSevere_s1_detail: { en: 'Build a month-by-month rent ledger with bank proofs. Avoid oral-only claims.', tr: 'Banka kanıtlı ay ay kira dökümü çıkarın. Yalnızca sözlü iddiaya güvenmeyin.' },
  scenarioRentLandSevere_s2_title: { en: 'Formal written notice', tr: 'Resmi yazılı ihtar' },
  scenarioRentLandSevere_s2_detail: { en: 'Send a dated written notice of arrears with a cure deadline. Keep delivery proof.', tr: 'Tarihli yazılı gecikme ihtarı ve düzeltme süresi verin. Tebliğ kanıtını saklayın.' },
  scenarioRentLandSevere_s3_title: { en: 'Enforcement path briefing', tr: 'İcra yolu brifingi' },
  scenarioRentLandSevere_s3_detail: { en: 'Discuss lawful eviction/enforcement options with counsel — never self-help lockouts.', tr: 'Yasal tahliye/icra seçeneklerini avukatla konuşun — kendi başına kilitleme yapmayın.' },

  scenarioRentLandClaim_s1_title: { en: 'Confirm the lease terms', tr: 'Kira şartlarını doğrulayın' },
  scenarioRentLandClaim_s1_detail: { en: 'Check due date, deposit, and notice clauses in the signed lease.', tr: 'İmzalı sözleşmede vade, depozito ve ihtar maddelerini kontrol edin.' },
  scenarioRentLandClaim_s2_title: { en: 'Polite written reminder', tr: 'Kibar yazılı hatırlatma' },
  scenarioRentLandClaim_s2_detail: { en: 'Send a clear payment reminder with amount and account details.', tr: 'Tutar ve hesap bilgisiyle net bir ödeme hatırlatması gönderin.' },
  scenarioRentLandClaim_s3_title: { en: 'Escalate if unpaid', tr: 'Ödenmezse yükseltin' },
  scenarioRentLandClaim_s3_detail: { en: 'If still unpaid after the deadline, prepare a formal notice pack with counsel guidance.', tr: 'Süre sonunda ödeme yoksa avukat rehberliğinde resmi ihtar dosyası hazırlayın.' },

  scenarioRentTenantNoticed_s1_title: { en: 'Read the notice carefully', tr: 'İhtarı dikkatle okuyun' },
  scenarioRentTenantNoticed_s1_detail: { en: 'Note deadlines, claimed months, and how the notice was delivered.', tr: 'Süreleri, iddia edilen ayları ve tebliğ şeklini not edin.' },
  scenarioRentTenantNoticed_s2_title: { en: 'Respond in writing', tr: 'Yazılı yanıt verin' },
  scenarioRentTenantNoticed_s2_detail: { en: 'If you dispute amounts or already paid, reply with proofs. Stay factual.', tr: 'Tutarı tartışıyorsanız veya ödediyseniz kanıtlı yanıt verin. Olgusal kalın.' },
  scenarioRentTenantNoticed_s3_title: { en: 'Counsel before hearing', tr: 'Duruşma öncesi avukat' },
  scenarioRentTenantNoticed_s3_detail: { en: 'If eviction proceedings are threatened, contact a tenant/lease attorney promptly.', tr: 'Tahliye süreci tehdidi varsa hızla kiracı/kira avukatına başvurun.' },

  scenarioRentTenantProtect_s1_title: { en: 'Track payments', tr: 'Ödemeleri izleyin' },
  scenarioRentTenantProtect_s1_detail: { en: 'Export bank proofs for every rent payment and keep the lease handy.', tr: 'Her kira ödemesinin banka kanıtını çıkarın; sözleşmeyi hazır tutun.' },
  scenarioRentTenantProtect_s2_title: { en: 'Talk early, in writing', tr: 'Erken ve yazılı konuşun' },
  scenarioRentTenantProtect_s2_detail: { en: 'If you will be late, propose a written catch-up plan before notices escalate.', tr: 'Gecikecekseniz ihtarlar artmadan yazılı bir telafi planı önerin.' },
  scenarioRentTenantProtect_s3_title: { en: 'Know local tenant aids', tr: 'Yerel kiracı desteklerini bilin' },
  scenarioRentTenantProtect_s3_detail: { en: 'Ask the advisor for general info on local aids; verify with official sources or counsel.', tr: 'Yerel destekler için danışmandan genel bilgi alın; resmi kaynak veya avukatla doğrulayın.' },

  // Consumer
  scenarioConsumerTitle: { en: 'Defective goods / services', tr: 'Ayıplı mal / hizmet' },
  scenarioConsumerDesc: { en: 'Defect → complaint → consumer mediation / arbitration hints.', tr: 'Ayıp → şikâyet → tüketici arabuluculuk / hakem ipuçları.' },
  scenarioConsumerQKind: { en: 'What is defective?', tr: 'Ayıplı olan nedir?' },
  scenarioConsumerOptGoods: { en: 'Goods / product', tr: 'Mal / ürün' },
  scenarioConsumerOptService: { en: 'Service', tr: 'Hizmet' },
  scenarioConsumerQWarranty: { en: 'Still under warranty / guarantee?', tr: 'Hâlâ garanti kapsamında mı?' },
  scenarioConsumerOptWarrantyYes: { en: 'Yes', tr: 'Evet' },
  scenarioConsumerOptWarrantyNo: { en: 'No / expired', tr: 'Hayır / süresi dolmuş' },
  scenarioConsumerOptWarrantyUnk: { en: 'Not sure', tr: 'Emin değilim' },
  scenarioConsumerQSeller: { en: 'Seller response so far?', tr: 'Satıcı şimdiye yanıtı?' },
  scenarioConsumerOptIgnored: { en: 'Ignored', tr: 'Yok sayıldı' },
  scenarioConsumerOptRefused: { en: 'Refused remedy', tr: 'Çözümü reddetti' },
  scenarioConsumerOptPartial: { en: 'Partial offer', tr: 'Kısmi teklif' },
  scenarioConsumerLawyer: { en: 'Consult a consumer attorney if health/safety risk, high value, or the seller ignores formal complaints.', tr: 'Sağlık/güvenlik riski, yüksek tutar veya satıcı resmi şikâyetleri yok sayıyorsa tüketici avukatına danışın.' },

  scenarioConsumerEscalate_s1_title: { en: 'Document the defect', tr: 'Ayıbı belgelendirin' },
  scenarioConsumerEscalate_s1_detail: { en: 'Photos/video, invoice, and a short defect description with dates.', tr: 'Foto/video, fatura ve tarihli kısa ayıp açıklaması.' },
  scenarioConsumerEscalate_s2_title: { en: 'Written consumer complaint', tr: 'Yazılı tüketici şikâyeti' },
  scenarioConsumerEscalate_s2_detail: { en: 'Send a written remedy request (repair/replace/refund) with a deadline.', tr: 'Onarım/değişim/iade talebini yazılı gönderin; süre koyun.' },
  scenarioConsumerEscalate_s3_title: { en: 'Consumer forum gate', tr: 'Tüketici forumu kapısı' },
  scenarioConsumerEscalate_s3_detail: { en: 'If ignored, prepare consumer mediation/arbitration filing materials for your country — verify local thresholds.', tr: 'Yok sayılırsanız ülkenizdeki tüketici arabuluculuk/hakem başvuru dosyasını hazırlayın — yerel eşikleri doğrulayın.' },

  scenarioConsumerNegotiate_s1_title: { en: 'Keep the paper trail', tr: 'Yazılı iz bırakın' },
  scenarioConsumerNegotiate_s1_detail: { en: 'Save the partial offer and your purchase proof.', tr: 'Kısmi teklifi ve alış kanıtını saklayın.' },
  scenarioConsumerNegotiate_s2_title: { en: 'Counter in writing', tr: 'Yazılı karşı teklif' },
  scenarioConsumerNegotiate_s2_detail: { en: 'Propose a clear acceptable remedy without insults or invented legal threats.', tr: 'Kabul edilebilir net bir çözüm önerin; hakaret veya uydurma hukuki tehdit yok.' },
  scenarioConsumerNegotiate_s3_title: { en: 'Escalate if stalled', tr: 'Tıkanırsa yükseltin' },
  scenarioConsumerNegotiate_s3_detail: { en: 'If talks stall, move to formal consumer complaint channels with your file.', tr: 'Görüşme tıkanırsa dosyanızla resmi tüketici şikâyet kanallarına geçin.' },

  // NDA
  scenarioNdaTitle: { en: 'Suspected NDA breach', tr: 'Şüpheli NDA ihlali' },
  scenarioNdaDesc: { en: 'Evidence preservation and notice framing — not a conviction.', tr: 'Kanıt koruma ve ihtar çerçevesi — mahkûmiyet değil.' },
  scenarioNdaQEvidence: { en: 'Evidence strength?', tr: 'Kanıt gücü?' },
  scenarioNdaOptStrong: { en: 'Strong / clear', tr: 'Güçlü / net' },
  scenarioNdaOptWeak: { en: 'Weak / circumstantial', tr: 'Zayıf / dolaylı' },
  scenarioNdaOptNone: { en: 'None yet', tr: 'Henüz yok' },
  scenarioNdaQBound: { en: 'Still bound by the NDA?', tr: 'Hâlâ NDA ile bağlı mısınız?' },
  scenarioNdaOptBoundYes: { en: 'Yes', tr: 'Evet' },
  scenarioNdaOptBoundNo: { en: 'No / expired', tr: 'Hayır / süresi dolmuş' },
  scenarioNdaQUrgency: { en: 'Is leakage ongoing?', tr: 'Sızıntı devam ediyor mu?' },
  scenarioNdaOptOngoing: { en: 'Ongoing', tr: 'Devam ediyor' },
  scenarioNdaOptPast: { en: 'Past incident', tr: 'Geçmiş olay' },
  scenarioNdaLawyer: { en: 'Engage counsel before accusing anyone publicly or sending aggressive notices that could backfire.', tr: 'Herkesi kamuya suçlamadan veya geri tepebilecek agresif ihtarlardan önce avukat tutun.' },

  scenarioNdaUrgent_s1_title: { en: 'Preserve, do not confront', tr: 'Koruyun, yüzleşmeyin' },
  scenarioNdaUrgent_s1_detail: { en: 'Secure copies of suspected leaks. Avoid public accusations.', tr: 'Şüpheli sızıntı kopyalarını güvenceye alın. Kamuya suçlama yapmayın.' },
  scenarioNdaUrgent_s2_title: { en: 'Map the NDA clauses', tr: 'NDA maddelerini haritalayın' },
  scenarioNdaUrgent_s2_detail: { en: 'Note confidentiality scope, duration, and notice requirements from the signed NDA.', tr: 'İmzalı NDA’dan gizlilik kapsamı, süre ve ihtar şartlarını not edin.' },
  scenarioNdaUrgent_s3_title: { en: 'Counsel-led notice', tr: 'Avukatlı ihtar' },
  scenarioNdaUrgent_s3_detail: { en: 'Have an attorney draft any cease-and-desist / evidence preservation letter.', tr: 'Herhangi bir ihtar / delil koruma mektubunu avukatın yazmasını sağlayın.' },

  scenarioNdaPreserve_s1_title: { en: 'Build an evidence folder', tr: 'Kanıt klasörü oluşturun' },
  scenarioNdaPreserve_s1_detail: { en: 'Collect what you have without illegal access to systems.', tr: 'Yasadışı sistem erişimi olmadan elinizdekileri toplayın.' },
  scenarioNdaPreserve_s2_title: { en: 'Re-read the NDA', tr: 'NDA’yı yeniden okuyun' },
  scenarioNdaPreserve_s2_detail: { en: 'Confirm you are still bound and what remedies the contract mentions.', tr: 'Hâlâ bağlı olup olmadığınızı ve sözleşmenin bahsettiği yolları doğrulayın.' },
  scenarioNdaPreserve_s3_title: { en: 'Quiet legal check', tr: 'Sessiz hukuki kontrol' },
  scenarioNdaPreserve_s3_detail: { en: 'Ask the advisor general questions, then consult counsel before formal notices.', tr: 'Danışmana genel sorular sorun; resmi ihtardan önce avukata danışın.' },

  scenarioNdaNotice_s1_title: { en: 'Organize proof packs', tr: 'Kanıt paketlerini düzenleyin' },
  scenarioNdaNotice_s1_detail: { en: 'Label exhibits (dates, sources) without editing originals.', tr: 'Eklentileri (tarih, kaynak) orijinalleri bozmadan etiketleyin.' },
  scenarioNdaNotice_s2_title: { en: 'Draft facts only', tr: 'Yalnızca olgu taslağı' },
  scenarioNdaNotice_s2_detail: { en: 'Write a factual chronology for counsel — no invented damages figures.', tr: 'Avukat için olgusal kronoloji yazın — uydurma zarar rakamı yok.' },
  scenarioNdaNotice_s3_title: { en: 'Attorney sends notice', tr: 'İhtarı avukat göndersin' },
  scenarioNdaNotice_s3_detail: { en: 'Prefer counsel-sent notices to reduce escalation and defamation risk.', tr: 'Tırmanma ve iftira riskini azaltmak için ihtarı avukatın göndermesini tercih edin.' },

  // Invoice B2B
  scenarioInvoiceTitle: { en: 'Unpaid B2B invoice', tr: 'Ödenmeyen B2B fatura' },
  scenarioInvoiceDesc: { en: 'Commercial debt → notice → optional mediation → court gate.', tr: 'Ticari alacak → ihtar → isteğe bağlı arabuluculuk → mahkeme kapısı.' },
  scenarioInvoiceQAmount: { en: 'Rough claim size?', tr: 'Yaklaşık alacak büyüklüğü?' },
  scenarioInvoiceOptSmall: { en: 'Small', tr: 'Küçük' },
  scenarioInvoiceOptMedium: { en: 'Medium', tr: 'Orta' },
  scenarioInvoiceOptLarge: { en: 'Large', tr: 'Büyük' },
  scenarioInvoiceQDemand: { en: 'Written demand already sent?', tr: 'Yazılı talep gönderildi mi?' },
  scenarioInvoiceOptDemandYes: { en: 'Yes', tr: 'Evet' },
  scenarioInvoiceOptDemandNo: { en: 'No', tr: 'Hayır' },
  scenarioInvoiceQDisputed: { en: 'Is the debt disputed?', tr: 'Borç ihtilaflı mı?' },
  scenarioInvoiceOptDisputedYes: { en: 'Yes / quality dispute', tr: 'Evet / kalite ihtilafı' },
  scenarioInvoiceOptDisputedNo: { en: 'No, just unpaid', tr: 'Hayır, sadece ödenmedi' },
  scenarioInvoiceLawyer: { en: 'Use commercial counsel before notarized notices, mediation filings, or lawsuits — especially for large or disputed claims.', tr: 'Noterli ihtar, arabuluculuk veya dava öncesi (özellikle büyük/ihtilaflı alacaklarda) ticari avukat kullanın.' },

  scenarioInvoiceDisputed_s1_title: { en: 'Freeze the file', tr: 'Dosyayı dondurun' },
  scenarioInvoiceDisputed_s1_detail: { en: 'Keep invoices, delivery proofs, and dispute emails together.', tr: 'Fatura, teslim kanıtı ve ihtilaf e-postalarını bir arada tutun.' },
  scenarioInvoiceDisputed_s2_title: { en: 'Narrow the dispute', tr: 'İhtilafı daraltın' },
  scenarioInvoiceDisputed_s2_detail: { en: 'List agreed vs disputed amounts in writing without admitting liability you disagree with.', tr: 'Anlaşılan / ihtilaflı tutarları yazılı listeleyin; katılmadığınız sorumluluğu kabul etmeyin.' },
  scenarioInvoiceDisputed_s3_title: { en: 'Mediation / counsel', tr: 'Arabuluculuk / avukat' },
  scenarioInvoiceDisputed_s3_detail: { en: 'Consider commercial mediation with counsel if talks fail.', tr: 'Görüşme başarısızsa avukatla ticari arabuluculuğu değerlendirin.' },

  scenarioInvoiceDemand_s1_title: { en: 'Send a payment demand', tr: 'Ödeme talebi gönderin' },
  scenarioInvoiceDemand_s1_detail: { en: 'Include invoice numbers, due dates, and bank details. Keep proof of send.', tr: 'Fatura no, vadeler ve banka bilgisi ekleyin. Gönderim kanıtını saklayın.' },
  scenarioInvoiceDemand_s2_title: { en: 'Follow up once', tr: 'Bir kez takip edin' },
  scenarioInvoiceDemand_s2_detail: { en: 'One clear written follow-up with a final deadline.', tr: 'Son süreli net bir yazılı takip.' },
  scenarioInvoiceDemand_s3_title: { en: 'Formalize', tr: 'Resmileştirin' },
  scenarioInvoiceDemand_s3_detail: { en: 'If unpaid, discuss notarized notice / mediation with counsel.', tr: 'Ödenmezse noterli ihtar / arabuluculuğu avukatla konuşun.' },

  scenarioInvoiceLarge_s1_title: { en: 'Audit receivables pack', tr: 'Alacak dosyasını denetleyin' },
  scenarioInvoiceLarge_s1_detail: { en: 'Contracts, POs, delivery notes, and invoice trail must align.', tr: 'Sözleşme, sipariş, irsaliye ve fatura zinciri uyumlu olmalı.' },
  scenarioInvoiceLarge_s2_title: { en: 'Counsel-drafted notice', tr: 'Avukatlı ihtar' },
  scenarioInvoiceLarge_s2_detail: { en: 'Prefer attorney-drafted formal notice for large claims.', tr: 'Büyük alacaklarda avukatın yazdığı resmi ihtarı tercih edin.' },
  scenarioInvoiceLarge_s3_title: { en: 'Court gate briefing', tr: 'Mahkeme kapısı brifingi' },
  scenarioInvoiceLarge_s3_detail: { en: 'Review mediation prerequisites and limitation periods with counsel before filing.', tr: 'Dava öncesi arabuluculuk önkoşulları ve zamanaşımını avukatla gözden geçirin.' },

  scenarioInvoiceStd_s1_title: { en: 'Confirm delivery & invoice', tr: 'Teslim ve faturayı doğrulayın' },
  scenarioInvoiceStd_s1_detail: { en: 'Ensure the buyer received goods/services and the invoice is correct.', tr: 'Alıcının mal/hizmeti aldığını ve faturanın doğru olduğunu doğrulayın.' },
  scenarioInvoiceStd_s2_title: { en: 'Written final demand', tr: 'Yazılı son talep' },
  scenarioInvoiceStd_s2_detail: { en: 'Send a final demand with a short payment window.', tr: 'Kısa ödeme penceresi olan son talep gönderin.' },
  scenarioInvoiceStd_s3_title: { en: 'Next formal step', tr: 'Sonraki resmi adım' },
  scenarioInvoiceStd_s3_detail: { en: 'If still unpaid, escalate to notarized notice or mediation with counsel.', tr: 'Hâlâ ödenmezse avukatla noterli ihtar veya arabuluculuğa yükseltin.' },
};

function collectKeys() {
  const keys = new Set(Object.keys(SHARED));
  for (const s of LEGAL_SCENARIOS) {
    keys.add(s.titleKey);
    keys.add(s.descriptionKey);
    for (const q of s.questions) {
      keys.add(q.labelKey);
      for (const o of q.options) keys.add(o.labelKey);
    }
    for (const t of Object.values(s.templates)) {
      keys.add(t.lawyerThresholdKey);
      keys.add(t.disclaimerKey);
      for (const st of t.steps) {
        keys.add(st.titleKey);
        keys.add(st.detailKey);
        if (st.timeHintKey) keys.add(st.timeHintKey);
        if (st.docHintKey) keys.add(st.docHintKey);
      }
    }
  }
  return [...keys].sort();
}

// WAVE L10N.1 — authored translations for EN_TR keys, one file per locale.
const L10N = {};
for (const lang of langs) {
  if (lang === 'tr' || lang === 'en') continue;
  const file = path.join(__dirname, 'l10n', `waveca.${lang}.js`);
  L10N[lang] = require(file);
  const extra = Object.keys(L10N[lang]).filter((key) => !EN_TR[key]);
  if (extra.length) throw new Error(`waveca.${lang}.js has unknown keys: ${extra.join(', ')}`);
}

function valueFor(key, lang) {
  if (SHARED[key]) return SHARED[key][lang] || SHARED[key].en;
  if (EN_TR[key]) {
    if (EN_TR[key][lang]) return EN_TR[key][lang];
    if (L10N[lang]) {
      if (!L10N[lang][key]) throw new Error(`Missing ${lang} translation for key: ${key}`);
      return L10N[lang][key];
    }
    return EN_TR[key].en;
  }
  // Missing authored string — fail loudly at gen time
  throw new Error(`Missing i18n authoring for key: ${key}`);
}

const allKeys = collectKeys();
const out = {};
for (const lang of langs) {
  out[lang] = {};
  for (const key of allKeys) {
    out[lang][key] = valueFor(key, lang === 'tr' ? 'tr' : lang === 'en' ? 'en' : lang);
  }
}

// For non-en/tr langs, EN_TR keys fall back to EN via valueFor — SHARED has all langs.
// Fix: valueFor for EN_TR non-tr uses EN_TR[key][lang] || EN_TR[key].en — good.

const file = `// WAVE CA′ — Scenario Legal Roadmaps. Same key set in all 13 languages.\n// Generated by scripts/gen-waveca-i18n.js — do not hand-edit key parity.\n\nexport const WAVE_CA_I18N = ${JSON.stringify(out, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'i18n.waveca.js'), file, 'utf8');
console.log('Wrote i18n.waveca.js keys=', allKeys.length, 'langs=', langs.length);
