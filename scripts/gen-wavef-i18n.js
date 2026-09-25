// WAVE BL.4 — regenerate FAQ-grade guide i18n for 13 langs. Run: node scripts/gen-wavef-i18n.js
const fs = require('fs');
const path = require('path');

const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];

/** Pack: each key maps lang → string. EN+TR authored; others translated. */
const T = {};

function set(key, byLang) {
  T[key] = byLang;
}

set('guideTitle', {
  tr: 'NexuLex Rehber',
  en: 'NexuLex Guide',
  de: 'NexuLex-Leitfaden',
  fr: 'Guide NexuLex',
  es: 'Guía NexuLex',
  ar: 'دليل NexuLex',
  it: 'Guida NexuLex',
  zh: 'NexuLex 指南',
  ru: 'Гид NexuLex',
  fa: 'راهنمای NexuLex',
  ja: 'NexuLex ガイド',
  pt: 'Guia NexuLex',
  nl: 'NexuLex-gids',
});

set('guideSubtitle', {
  tr: 'Nasıl yapılır? Konu seçin; adım adım anlatırız.',
  en: 'How do I…? Pick a topic for full steps.',
  de: 'Wie geht das? Thema wählen — volle Schritte.',
  fr: 'Comment faire ? Choisissez un sujet pour les étapes.',
  es: '¿Cómo…? Elija un tema para los pasos completos.',
  ar: 'كيف أفعل…؟ اختر موضوعاً للخطوات الكاملة.',
  it: 'Come faccio…? Scegli un argomento per i passi.',
  zh: '怎么做？选一个主题查看完整步骤。',
  ru: 'Как сделать…? Выберите тему — полные шаги.',
  fa: 'چطور…؟ یک موضوع انتخاب کنید تا گام‌ها کامل بیاید.',
  ja: 'どうする？トピックを選ぶと手順が続きます。',
  pt: 'Como…? Escolha um tópico para os passos.',
  nl: 'Hoe…? Kies een onderwerp voor alle stappen.',
});

set('guideAskAdvisor', {
  tr: 'Bu hukuki bir soruya benziyor. Rehber uygulama kullanımını anlatır; hukuki yorum için Hukuk Danışmanı sekmesini kullanın.',
  en: 'This looks like a legal question. The Guide explains the app; use the Legal Advisor tab for legal Q&A.',
  de: 'Das klingt nach einer Rechtsfrage. Der Guide erklärt die App; für Recht nutzen Sie den Berater-Tab.',
  fr: 'Cela semble juridique. Le Guide explique l’app ; pour le droit, ouvrez Conseiller.',
  es: 'Parece una consulta legal. La Guía explica la app; use Asesor para derecho.',
  ar: 'يبدو سؤالاً قانونياً. الدليل يشرح التطبيق؛ للأسئلة القانونية استخدم المستشار.',
  it: 'Sembra una domanda legale. La Guida spiega l’app; per il diritto usa Consulente.',
  zh: '这像是法律问题。指南只讲用法；法律问答请用顾问页。',
  ru: 'Похоже на юридический вопрос. Гид — про приложение; для права откройте Консультант.',
  fa: 'این سؤال حقوقی به نظر می‌رسد. راهنما فقط کار با اپ را می‌گوید؛ برای حقوق از مشاور استفاده کنید.',
  ja: '法的な質問のようです。ガイドは使い方のみ。法律相談はアドバイザータブへ。',
  pt: 'Parece uma dúvida jurídica. O Guia explica a app; use Consultor para direito.',
  nl: 'Dit lijkt juridisch. De gids legt de app uit; voor recht gebruikt u Adviseur.',
});

set('guideAskAdvisorCta', {
  tr: 'Hukuk Danışmanına Sor',
  en: 'Ask Legal Advisor',
  de: 'Berater fragen',
  fr: 'Demander au conseiller',
  es: 'Preguntar al asesor',
  ar: 'اسأل المستشار',
  it: 'Chiedi al consulente',
  zh: '询问顾问',
  ru: 'Спросить консультанта',
  fa: 'از مشاور بپرس',
  ja: 'アドバイザーに質問',
  pt: 'Perguntar ao consultor',
  nl: 'Vraag de adviseur',
});

set('guideSearchPlaceholder', {
  tr: 'Ne yapmak istiyorsunuz?',
  en: 'What do you want to do?',
  de: 'Was möchten Sie tun?',
  fr: 'Que voulez-vous faire ?',
  es: '¿Qué desea hacer?',
  ar: 'ماذا تريد أن تفعل؟',
  it: 'Cosa vuoi fare?',
  zh: '您想做什么？',
  ru: 'Что вы хотите сделать?',
  fa: 'چه می‌خواهید انجام دهید؟',
  ja: '何をしたいですか？',
  pt: 'O que deseja fazer?',
  nl: 'Wat wilt u doen?',
});

set('guideEmpty', {
  tr: 'Eşleşen rehber adımı yok. Bir FAQ veya konu çipine dokunun.',
  en: 'No matching guide steps. Tap a FAQ or topic chip.',
  de: 'Keine Schritte. Tippen Sie auf FAQ oder Thema.',
  fr: 'Aucune étape. Touchez une puce FAQ ou un sujet.',
  es: 'Sin pasos. Toque un chip FAQ o tema.',
  ar: 'لا خطوات. المس رقاقة FAQ أو موضوعاً.',
  it: 'Nessuno step. Tocca un chip FAQ o argomento.',
  zh: '无匹配步骤。点按 FAQ 或主题芯片。',
  ru: 'Нет шагов. Нажмите FAQ или тему.',
  fa: 'گامی نیست. FAQ یا موضوع را لمس کنید.',
  ja: '一致なし。FAQ またはトピックをタップ。',
  pt: 'Sem passos. Toque num chip FAQ ou tópico.',
  nl: 'Geen stappen. Tik op een FAQ- of onderwerpchip.',
});

// Workflow chips
set('guideChipAnalyze', {
  tr: 'Sözleşme analiz et', en: 'Analyze a contract', de: 'Vertrag analysieren', fr: 'Analyser un contrat',
  es: 'Analizar un contrato', ar: 'تحليل عقد', it: 'Analizza un contratto', zh: '分析合同',
  ru: 'Анализ договора', fa: 'تحلیل قرارداد', ja: '契約を分析', pt: 'Analisar um contrato', nl: 'Contract analyseren',
});
set('guideChipDiff', {
  tr: 'Karşılaştır / Redline', en: 'Compare / Redline', de: 'Vergleich / Redline', fr: 'Comparer / Redline',
  es: 'Comparar / Redline', ar: 'مقارنة / Redline', it: 'Confronta / Redline', zh: '对比 / 红线',
  ru: 'Сравнение / Redline', fa: 'مقایسه / Redline', ja: '比較 / レッドライン', pt: 'Comparar / Redline', nl: 'Vergelijken / Redline',
});
set('guideChipExport', {
  tr: 'Dışa aktar / Kalkan', en: 'Export / Shield', de: 'Export / Schild', fr: 'Exporter / Bouclier',
  es: 'Exportar / Escudo', ar: 'تصدير / درع', it: 'Esporta / Scudo', zh: '导出 / 盾牌',
  ru: 'Экспорт / Щит', fa: 'خروجی / سپر', ja: '書き出し / シールド', pt: 'Exportar / Escudo', nl: 'Exporteren / Schild',
});
set('guideChipAdvisor', {
  tr: 'Hukuk Danışmanı', en: 'Legal Advisor', de: 'Rechtsberater', fr: 'Conseiller juridique',
  es: 'Asesor legal', ar: 'المستشار القانوني', it: 'Consulente legale', zh: '法律顾问',
  ru: 'Юридический консультант', fa: 'مشاور حقوقی', ja: 'リーガルアドバイザー', pt: 'Consultor jurídico', nl: 'Juridisch adviseur',
});
set('guideChipSettings', {
  tr: 'Ayarlar ve dil', en: 'Settings and language', de: 'Einstellungen und Sprache', fr: 'Réglages et langue',
  es: 'Ajustes e idioma', ar: 'الإعدادات واللغة', it: 'Impostazioni e lingua', zh: '设置与语言',
  ru: 'Настройки и язык', fa: 'تنظیمات و زبان', ja: '設定と言語', pt: 'Definições e idioma', nl: 'Instellingen en taal',
});
set('guideChipPlaybook', {
  tr: 'Playbook ve koltuk', en: 'Playbook and seat', de: 'Playbook und Sitz', fr: 'Playbook et siège',
  es: 'Playbook y asiento', ar: 'الدليل والمقعد', it: 'Playbook e posto', zh: '手册与席位',
  ru: 'Плейбук и место', fa: 'پلی‌بوک و صندلی', ja: 'プレイブックとシート', pt: 'Playbook e lugar', nl: 'Playbook en stoel',
});

// FAQ chips
set('guideFaqRevise', {
  tr: 'Lehime nasıl revize ederim?',
  en: 'How do I revise in my favor?',
  de: 'Wie revidiere ich zu meinen Gunsten?',
  fr: 'Comment réviser en ma faveur ?',
  es: '¿Cómo reviso a mi favor?',
  ar: 'كيف أراجع لصالحـي؟',
  it: 'Come revisiono a mio favore?',
  zh: '如何改成对我有利？',
  ru: 'Как переписать в мою пользу?',
  fa: 'چطور به نفع خودم اصلاح کنم؟',
  ja: '自分有利にどう直す？',
  pt: 'Como rever a meu favor?',
  nl: 'Hoe herzie ik in mijn voordeel?',
});
set('guideFaqExport', {
  tr: 'PDF / Word rapor nasıl indirilir?',
  en: 'How do I download PDF / Word?',
  de: 'Wie lade ich PDF / Word herunter?',
  fr: 'Comment télécharger PDF / Word ?',
  es: '¿Cómo descargo PDF / Word?',
  ar: 'كيف أنزّل PDF / Word؟',
  it: 'Come scarico PDF / Word?',
  zh: '如何下载 PDF / Word？',
  ru: 'Как скачать PDF / Word?',
  fa: 'چطور PDF / Word بگیرم؟',
  ja: 'PDF / Word の出し方は？',
  pt: 'Como descarregar PDF / Word?',
  nl: 'Hoe download ik PDF / Word?',
});
set('guideFaqDiff', {
  tr: 'DiffTool nasıl çalışır?',
  en: 'How does DiffTool work?',
  de: 'Wie funktioniert DiffTool?',
  fr: 'Comment marche DiffTool ?',
  es: '¿Cómo funciona DiffTool?',
  ar: 'كيف يعمل DiffTool؟',
  it: 'Come funziona DiffTool?',
  zh: 'DiffTool 怎么用？',
  ru: 'Как работает DiffTool?',
  fa: 'DiffTool چطور کار می‌کند؟',
  ja: 'DiffTool の使い方は？',
  pt: 'Como funciona o DiffTool?',
  nl: 'Hoe werkt DiffTool?',
});

// Titles / hints (short)
const titles = {
  guideFlowAnalyzeTitle: { tr: 'Sözleşme analizi', en: 'Contract analysis', de: 'Vertragsanalyse', fr: 'Analyse de contrat', es: 'Análisis de contrato', ar: 'تحليل العقد', it: 'Analisi del contratto', zh: '合同分析', ru: 'Анализ договора', fa: 'تحلیل قرارداد', ja: '契約分析', pt: 'Análise de contrato', nl: 'Contractanalyse' },
  guideFlowDiffTitle: { tr: 'Karşılaştırma aracı', en: 'Diff tool', de: 'Vergleichstool', fr: 'Outil de comparaison', es: 'Herramienta de comparación', ar: 'أداة المقارنة', it: 'Strumento di confronto', zh: '对比工具', ru: 'Инструмент сравнения', fa: 'ابزار مقایسه', ja: '比較ツール', pt: 'Ferramenta de comparação', nl: 'Vergelijkingstool' },
  guideFlowExportTitle: { tr: 'Kalkan ve dışa aktarma', en: 'Shield and export', de: 'Schild und Export', fr: 'Bouclier et export', es: 'Escudo y exportación', ar: 'الدرع والتصدير', it: 'Scudo ed esportazione', zh: '盾牌与导出', ru: 'Щит и экспорт', fa: 'سپر و خروجی', ja: 'シールドと書き出し', pt: 'Escudo e exportação', nl: 'Schild en export' },
  guideFlowAdvisorTitle: { tr: 'Hukuk Danışmanı', en: 'Legal Advisor', de: 'Rechtsberater', fr: 'Conseiller juridique', es: 'Asesor legal', ar: 'المستشار القانوني', it: 'Consulente legale', zh: '法律顾问', ru: 'Юридический консультант', fa: 'مشاور حقوقی', ja: 'リーガルアドバイザー', pt: 'Consultor jurídico', nl: 'Juridisch adviseur' },
  guideFlowSettingsTitle: { tr: 'Ayarlar', en: 'Settings', de: 'Einstellungen', fr: 'Réglages', es: 'Ajustes', ar: 'الإعدادات', it: 'Impostazioni', zh: '设置', ru: 'Настройки', fa: 'تنظیمات', ja: '設定', pt: 'Definições', nl: 'Instellingen' },
  guideFlowPlaybookTitle: { tr: 'Playbook ve koltuklar', en: 'Playbook and seats', de: 'Playbook und Sitze', fr: 'Playbook et sièges', es: 'Playbook y asientos', ar: 'الدليل والمقاعد', it: 'Playbook e posti', zh: '手册与席位', ru: 'Плейбук и места', fa: 'پلی‌بوک و صندلی‌ها', ja: 'プレイブックとシート', pt: 'Playbook e lugares', nl: 'Playbook en stoelen' },
};
Object.entries(titles).forEach(([k, v]) => set(k, v));

set('guideFlowAnalyzeHint', {
  tr: 'Metin/PDF ile analiz → karar kartı → kalkan → lehime madde.',
  en: 'Paste/PDF → analyze → decision card → shield → your clauses.',
  de: 'Text/PDF → Analyse → Entscheidungskarte → Schild → Klauseln.',
  fr: 'Texte/PDF → analyse → carte décision → bouclier → clauses.',
  es: 'Texto/PDF → análisis → tarjeta → escudo → cláusulas.',
  ar: 'نص/PDF ← تحليل ← بطاقة قرار ← درع ← بنودك.',
  it: 'Testo/PDF → analisi → carta → scudo → clausole.',
  zh: '文本/PDF → 分析 → 决策卡 → 盾牌 → 条款。',
  ru: 'Текст/PDF → анализ → карточка → щит → пункты.',
  fa: 'متن/PDF ← تحلیل ← کارت تصمیم ← سپر ← بندها.',
  ja: 'テキスト/PDF → 分析 → 判断カード → シールド → 条項。',
  pt: 'Texto/PDF → análise → cartão → escudo → cláusulas.',
  nl: 'Tekst/PDF → analyse → besliskaart → schild → clausules.',
});
set('guideFlowDiffHint', {
  tr: 'Analiz sekmesindeki Karşılaştır ile orijinal ve revizeyi yan yana görün.',
  en: 'Use Compare under Analyze to view original vs revised side by side.',
  de: 'Vergleichen unter Analysieren: Original vs. Revision nebeneinander.',
  fr: 'Comparer sous Analyser : original vs révisé côte à côte.',
  es: 'Comparar en Analizar: original vs revisado lado a lado.',
  ar: 'المقارنة تحت التحليل: الأصل مقابل المراجعة جنباً إلى جنب.',
  it: 'Confronta in Analizza: originale vs rivisto affiancati.',
  zh: '在分析里用对比：原文与修订并排。',
  ru: 'Сравнение во вкладке Анализ: оригинал рядом с правкой.',
  fa: 'در تحلیل، مقایسه: اصل کنار نسخه اصلاح‌شده.',
  ja: '分析内の比較で原文と改訂を左右表示。',
  pt: 'Comparar em Analisar: original vs revisto lado a lado.',
  nl: 'Vergelijken onder Analyseren: origineel naast herziening.',
});
set('guideFlowExportHint', {
  tr: 'PDF rapor, kırmızı çizgi PDF ve Word (.docx) farklı düğmelerdir.',
  en: 'PDF report, redline PDF, and Word (.docx) are different buttons.',
  de: 'PDF-Bericht, Redline-PDF und Word (.docx) sind getrennte Buttons.',
  fr: 'Rapport PDF, PDF redline et Word (.docx) sont des boutons distincts.',
  es: 'Informe PDF, PDF redline y Word (.docx) son botones distintos.',
  ar: 'تقرير PDF وPDF redline وWord (.docx) أزرار مختلفة.',
  it: 'Report PDF, PDF redline e Word (.docx) sono pulsanti diversi.',
  zh: 'PDF 报告、红线 PDF 与 Word (.docx) 是不同按钮。',
  ru: 'PDF-отчёт, redline PDF и Word (.docx) — разные кнопки.',
  fa: 'گزارش PDF، PDF redline و Word (.docx) دکمه‌های جدا هستند.',
  ja: 'PDF報告・レッドラインPDF・Word (.docx) は別ボタンです。',
  pt: 'Relatório PDF, PDF redline e Word (.docx) são botões distintos.',
  nl: 'PDF-rapport, redline-PDF en Word (.docx) zijn aparte knoppen.',
});
set('guideFlowAdvisorHint', {
  tr: 'Rehber = nasıl kullanılır. Danışman = hukuki soru-cevap. Rehber hukuk uydurmaz.',
  en: 'Guide = how to use the app. Advisor = legal Q&A. The Guide never invents law.',
  de: 'Guide = App-Nutzung. Berater = Rechts-Q&A. Der Guide erfindet kein Recht.',
  fr: 'Guide = usage de l’app. Conseiller = Q&R juridiques. Le Guide n’invente pas le droit.',
  es: 'Guía = uso de la app. Asesor = Q&A legal. La Guía no inventa derecho.',
  ar: 'الدليل = استخدام التطبيق. المستشار = أسئلة قانونية. الدليل لا يخترع القانون.',
  it: 'Guida = uso app. Consulente = Q&A legale. La Guida non inventa il diritto.',
  zh: '指南=用法。顾问=法律问答。指南不编造法律。',
  ru: 'Гид = как пользоваться. Консультант = юр. Q&A. Гид не выдумывает право.',
  fa: 'راهنما = کار با اپ. مشاور = پرسش حقوقی. راهنما قانون اختراع نمی‌کند.',
  ja: 'ガイド＝使い方。アドバイザー＝法的Q&A。ガイドは法を創作しません。',
  pt: 'Guia = uso da app. Consultor = Q&A jurídica. O Guia não inventa direito.',
  nl: 'Gids = app-gebruik. Adviseur = juridische Q&A. De gids verzint geen recht.',
});
set('guideFlowSettingsHint', {
  tr: 'Dil, tema ve hesap Ayarlar sekmesinden değişir.',
  en: 'Language, theme and account live under Settings.',
  de: 'Sprache, Theme und Konto unter Einstellungen.',
  fr: 'Langue, thème et compte dans Réglages.',
  es: 'Idioma, tema y cuenta en Ajustes.',
  ar: 'اللغة والمظهر والحساب في الإعدادات.',
  it: 'Lingua, tema e account in Impostazioni.',
  zh: '语言、主题与账户在设置中。',
  ru: 'Язык, тема и аккаунт — в Настройках.',
  fa: 'زبان، تم و حساب در تنظیمات است.',
  ja: '言語・テーマ・アカウントは設定にあります。',
  pt: 'Idioma, tema e conta em Definições.',
  nl: 'Taal, thema en account staan onder Instellingen.',
});
set('guideFlowPlaybookHint', {
  tr: 'İmza öncesi kontrol listesi ve danışman/hane koltukları.',
  en: 'Pre-signature checklist plus advisor/household seats.',
  de: 'Checkliste vor Unterschrift plus Berater-/Haushaltssitze.',
  fr: 'Checklist avant signature plus sièges conseiller/foyer.',
  es: 'Lista previa a firma más asientos asesor/hogar.',
  ar: 'قائمة ما قبل التوقيع ومقاعد المستشار/الأسرة.',
  it: 'Checklist pre-firma più posti consulente/famiglia.',
  zh: '签署前清单与顾问/家庭席位。',
  ru: 'Чеклист до подписи и места консультанта/семьи.',
  fa: 'چک‌لیست پیش از امضا و صندلی مشاور/خانواده.',
  ja: '署名前チェックとアドバイザー/世帯シート。',
  pt: 'Lista pré-assinatura e lugares consultor/família.',
  nl: 'Checklist vóór ondertekening plus adviseur-/huishoudenstoelen.',
});

// Intros (longer)
set('guideFlowAnalyzeIntro', {
  tr: 'Lehinize revize için sıra şudur: metni getirin, tarafınızı kilitleyin, analizi çalıştırın, karar/radar/kırmızı bayrakları okuyun, Kalkanı uygula ile maddeleri birleştirin, hazır mesajı kopyalayın. Gerekirse Karşılaştır veya dışa aktarma ile devam edin.',
  en: 'To revise in your favor: bring the text in, lock your party, run analysis, read the decision card / radar / red flags, tap Apply shield to stitch clauses, then copy the ready message. Continue with Compare or export if needed.',
  de: 'Zu Ihren Gunsten: Text laden, Partei wählen, Analyse starten, Karte/Radar/Flaggen lesen, Schild anwenden, fertige Nachricht kopieren. Danach Vergleich oder Export.',
  fr: 'Pour réviser en votre faveur : importez le texte, verrouillez votre partie, lancez l’analyse, lisez carte/radar/alertes, appliquez le bouclier, copiez le message. Puis Comparer ou exporter.',
  es: 'Para revisar a su favor: importe el texto, fije su parte, analice, lea tarjeta/radar/alertas, aplique el escudo y copie el mensaje. Luego Comparar o exportar.',
  ar: 'للمراجعة لصالحك: أدخل النص، اقفل طرفك، حلّل، اقرأ البطاقة/الرادار/الأعلام، طبّق الدرع، انسخ الرسالة. ثم المقارنة أو التصدير.',
  it: 'Per revisionare a tuo favore: importa il testo, blocca la parte, analizza, leggi carta/radar/flag, applica lo scudo, copia il messaggio. Poi Confronta o esporta.',
  zh: '要改成对你有利：导入文本、锁定你的角色、开始分析、阅读决策卡/雷达/红旗、点应用盾牌拼接条款、复制就绪消息。需要时再对比或导出。',
  ru: 'Чтобы править в свою пользу: загрузите текст, зафиксируйте сторону, запустите анализ, прочитайте карточку/радар/флаги, примените щит, скопируйте сообщение. Затем Сравнение или экспорт.',
  fa: 'برای اصلاح به نفع خود: متن را بیاورید، نقش را قفل کنید، تحلیل کنید، کارت/رادار/پرچم‌ها را بخوانید، سپر را اعمال کنید، پیام آماده را کپی کنید. سپس مقایسه یا خروجی.',
  ja: '自分有利に直す流れ：テキスト投入→当事者ロック→分析→判断カード/レーダー/赤旗→シールド適用→準備メッセージをコピー。必要なら比較や書き出しへ。',
  pt: 'Para rever a seu favor: importe o texto, fixe a parte, analise, leia cartão/radar/alertas, aplique o escudo e copie a mensagem. Depois Comparar ou exportar.',
  nl: 'In uw voordeel herzien: tekst laden, partij vastzetten, analyseren, kaart/radar/vlaggen lezen, schild toepassen, bericht kopiëren. Daarna Vergelijken of exporteren.',
});

set('guideFlowDiffIntro', {
  tr: 'DiffTool Analiz sekmesindedir (ayrı sekme değil). Orijinal ile karşı tarafın / sizin revize metnini yan yana veya redline ile görürsünüz. Kalkan uyguladıktan veya yeni sürüm gelince “Yeni sürümü doğrula” ile boş kutuya yeni metni yapıştırın.',
  en: 'DiffTool lives under the Analyze tab (not a separate tab). Compare original vs counterparty/your revised text in split or redline view. After a shield or a new counterparty draft, use Verify new version and paste into the empty box.',
  de: 'DiffTool liegt unter Analysieren. Original vs. Revision in Split oder Redline. Nach Schild oder neuer Fassung: Neue Fassung prüfen und in das leere Feld einfügen.',
  fr: 'DiffTool est sous Analyser. Comparez original et révisé en split/redline. Après bouclier ou nouvelle version : Vérifier et collez dans la case vide.',
  es: 'DiffTool está en Analizar. Compare original y revisado en split/redline. Tras escudo o nueva versión: Verificar y pegue en el cuadro vacío.',
  ar: 'DiffTool تحت التحليل. قارن الأصل والمراجعة بـ split/redline. بعد الدرع أو نسخة جديدة: تحقق والصق في المربع الفارغ.',
  it: 'DiffTool è in Analizza. Confronta originale e rivisto in split/redline. Dopo scudo o nuova versione: Verifica e incolla nella casella vuota.',
  zh: 'DiffTool 在分析页。用分屏或红线对比原文与修订。盾牌或新版本后，用“核验新版本”粘贴到空框。',
  ru: 'DiffTool во вкладке Анализ. Сравнивайте оригинал и правку в split/redline. После щита или новой версии — «Проверить» и вставьте в пустое поле.',
  fa: 'DiffTool در تب تحلیل است. اصل و اصلاح را با split/redline ببینید. بعد از سپر یا نسخه جدید، «بررسی» کنید و در کادر خالی بچسبانید.',
  ja: 'DiffTool は分析タブ内。分割/レッドラインで原文と改訂を比較。シールドや新版の後は「照合」で空欄に貼ります。',
  pt: 'O DiffTool está em Analisar. Compare original e revisto em split/redline. Após escudo ou nova versão: Verificar e cole na caixa vazia.',
  nl: 'DiffTool zit onder Analyseren. Vergelijk origineel en herziening in split/redline. Na schild of nieuwe versie: Verifiëren en plakken in het lege vak.',
});

set('guideFlowExportIntro', {
  tr: 'Üç çıktı vardır: (1) Analiz PDF raporu — skor ve özet. (2) Kırmızı çizgi PDF — silinen/eklenen vurgulu. (3) Word (.docx) — kalkan uygulandıktan sonra temiz metin. Önce Kalkanı uygula, sonra doğru düğmeyi seçin.',
  en: 'Three outputs: (1) Analysis PDF report — score and summary. (2) Redline PDF — deletions/insertions highlighted. (3) Word (.docx) — clean stitched text after Apply shield. Apply first, then pick the right button.',
  de: 'Drei Ausgaben: (1) Analyse-PDF. (2) Redline-PDF. (3) Word (.docx) nach Schild. Zuerst anwenden, dann den richtigen Button.',
  fr: 'Trois sorties : (1) PDF d’analyse. (2) PDF redline. (3) Word (.docx) après bouclier. Appliquez d’abord, puis le bon bouton.',
  es: 'Tres salidas: (1) PDF de análisis. (2) PDF redline. (3) Word (.docx) tras escudo. Primero aplique, luego el botón correcto.',
  ar: 'ثلاث مخرجات: (1) تقرير PDF. (2) PDF redline. (3) Word بعد الدرع. طبّق أولاً ثم اختر الزر.',
  it: 'Tre output: (1) PDF analisi. (2) PDF redline. (3) Word dopo scudo. Prima Applica, poi il pulsante giusto.',
  zh: '三种输出：(1) 分析 PDF；(2) 红线 PDF；(3) 应用盾牌后的 Word。先应用再选对按钮。',
  ru: 'Три выхода: (1) PDF-отчёт. (2) Redline PDF. (3) Word после щита. Сначала примените, затем нужную кнопку.',
  fa: 'سه خروجی: (1) گزارش PDF. (2) PDF redline. (3) Word پس از سپر. اول اعمال، بعد دکمه درست.',
  ja: '出力は3種：(1)分析PDF (2)レッドラインPDF (3)シールド適用後のWord。先に適用してからボタンを選ぶ。',
  pt: 'Três saídas: (1) PDF de análise. (2) PDF redline. (3) Word após escudo. Aplique primeiro, depois o botão certo.',
  nl: 'Drie outputs: (1) analyse-PDF. (2) redline-PDF. (3) Word na schild. Eerst toepassen, dan de juiste knop.',
});

set('guideFlowAdvisorIntro', {
  tr: 'Bu Rehber yalnızca NexuLex’i nasıl kullanacağınızı anlatır; kanun veya tazminat yorumlamaz. Hukuki soru için Danışman sekmesine geçin, taraf/ülke bağlamını seçin ve soruyu yazın. Rehber ile Danışman’ı karıştırmayın.',
  en: 'This Guide only teaches how to use NexuLex; it does not interpret statutes or damages. For legal questions open Advisor, set party/country context, and type your question. Do not confuse Guide with Advisor.',
  de: 'Dieser Guide erklärt nur die App — kein Recht. Für Rechtsfragen: Berater öffnen, Partei/Land setzen, fragen. Guide ≠ Berater.',
  fr: 'Ce Guide explique l’app, pas le droit. Pour le juridique : ouvrez Conseiller, fixez partie/pays, posez la question.',
  es: 'Esta Guía enseña la app, no el derecho. Para lo legal: abra Asesor, fije parte/país y pregunte.',
  ar: 'هذا الدليل يشرح التطبيق فقط لا القانون. للأسئلة القانونية: افتح المستشار واضبط الطرف/البلد واكتب السؤال.',
  it: 'Questa Guida spiega solo l’app, non il diritto. Per domande legali: apri Consulente, imposta parte/paese e chiedi.',
  zh: '本指南只教用法，不解释法律。法律问题请打开顾问、设置角色/国家后提问。',
  ru: 'Гид учит приложению, не праву. Для юр. вопросов откройте Консультант, укажите сторону/страну и спросите.',
  fa: 'این راهنما فقط کار با اپ را می‌گوید، نه تفسیر قانون. برای سؤال حقوقی مشاور را باز کنید، نقش/کشور را بگذارید و بپرسید.',
  ja: 'このガイドは使い方のみ。法解釈はしません。法律質問はアドバイザーで当事者/国を設定して聞いてください。',
  pt: 'Este Guia ensina a app, não o direito. Para dúvidas jurídicas: abra Consultor, fixe parte/país e pergunte.',
  nl: 'Deze gids legt de app uit, geen recht. Voor juridische vragen: open Adviseur, zet partij/land en stel de vraag.',
});

set('guideFlowSettingsIntro', {
  tr: 'Ayarlar sekmesinde dil, koyu/açık tema, şifre ve koltuk kodlarını yönetirsiniz. Analiz dilinden bağımsız uygulama dilini buradan değiştirin.',
  en: 'Under Settings you manage language, dark/light theme, password, and seat codes. Change the app language here independently of analysis language.',
  de: 'Unter Einstellungen: Sprache, Theme, Passwort, Sitzcodes. App-Sprache hier ändern.',
  fr: 'Dans Réglages : langue, thème, mot de passe, codes siège. Changez la langue de l’app ici.',
  es: 'En Ajustes: idioma, tema, contraseña y códigos de asiento. Cambie el idioma de la app aquí.',
  ar: 'في الإعدادات: اللغة والمظهر وكلمة المرور ورموز المقاعد. غيّر لغة التطبيق من هنا.',
  it: 'In Impostazioni: lingua, tema, password e codici posto. Cambia qui la lingua dell’app.',
  zh: '设置中可管理语言、明暗主题、密码与席位码。在此更改应用语言。',
  ru: 'В Настройках: язык, тема, пароль и коды мест. Меняйте язык приложения здесь.',
  fa: 'در تنظیمات: زبان، تم، رمز و کد صندلی. زبان اپ را از اینجا عوض کنید.',
  ja: '設定で言語・テーマ・パスワード・シートコードを管理。アプリ言語はここで変更。',
  pt: 'Em Definições: idioma, tema, palavra-passe e códigos de lugar. Altere o idioma da app aqui.',
  nl: 'Onder Instellingen: taal, thema, wachtwoord en stoelcodes. Wijzig hier de app-taal.',
});

set('guideFlowPlaybookIntro', {
  tr: 'Analiz bittikten sonra İmza öncesi playbook eksik korumaları listeler. Pro ile danışman veya hane koltuğuna salt okunur brief gönderebilirsiniz; orijinal sözleşme gitmez.',
  en: 'After analysis, the pre-signature playbook lists missing protections. With Pro you can send a read-only brief to advisor or household seats — the original contract never leaves.',
  de: 'Nach der Analyse listet das Playbook fehlende Schutzklauseln. Mit Pro senden Sie Briefs an Berater-/Haushaltssitze — das Original bleibt privat.',
  fr: 'Après analyse, le playbook liste les protections manquantes. Avec Pro, envoyez un brief en lecture seule — l’original reste privé.',
  es: 'Tras el análisis, el playbook lista protecciones faltantes. Con Pro envíe un brief de solo lectura — el original no sale.',
  ar: 'بعد التحليل يسرد الدليل الحمايات الناقصة. مع Pro أرسل ملخصاً للقراءة فقط — الأصل لا يغادر.',
  it: 'Dopo l’analisi il playbook elenca protezioni mancanti. Con Pro invii brief in sola lettura — l’originale resta privato.',
  zh: '分析后手册列出缺失保护。Pro 可向顾问/家庭席位发送只读简报——原文不离开。',
  ru: 'После анализа плейбук показывает пробелы. С Pro отправьте brief только для чтения — оригинал не уходит.',
  fa: 'پس از تحلیل، پلی‌بوک حفاظت‌های کم را نشان می‌دهد. با Pro brief فقط‌خواندنی بفرستید — اصل خارج نمی‌شود.',
  ja: '分析後、プレイブックが不足保護を列挙。Pro ならアドバイザー/世帯へ読み取り専用ブリーフを送れます（原文は送られません）。',
  pt: 'Após a análise, o playbook lista proteções em falta. Com Pro envie um brief só de leitura — o original não sai.',
  nl: 'Na analyse toont het playbook ontbrekende bescherming. Met Pro stuurt u een alleen-lezen brief — het origineel blijft privé.',
});

// Steps — analyze
set('guideStepAnalyzePaste', {
  tr: 'Analiz sekmesinde büyük metin kutusuna sözleşmeyi yapıştırın. Satır sonları korunur; kısaltmayın. Bu, “lehime revize” yolunun ilk adımıdır.',
  en: 'On the Analyze tab, paste the full contract into the large text box. Line breaks are kept — do not trim. This is step one of revise-in-your-favor.',
  de: 'Unter Analysieren den Vertrag in das große Feld einfügen. Zeilenumbrüche bleiben. Erster Schritt zur Revision.',
  fr: 'Sous Analyser, collez le contrat dans la grande zone. Les sauts de ligne restent. Première étape de la révision.',
  es: 'En Analizar, pegue el contrato en el cuadro grande. Se conservan saltos de línea. Primer paso de la revisión.',
  ar: 'في التحليل الصق العقد في المربع الكبير. تُحفظ الأسطر. هذه أولى خطوات المراجعة لصالحك.',
  it: 'In Analizza incolla il contratto nella casella grande. Gli a capo restano. Primo passo della revisione.',
  zh: '在分析页把合同粘贴到大文本框。换行会保留。这是“对自己有利修订”的第一步。',
  ru: 'Во вкладке Анализ вставьте договор в большое поле. Переносы сохраняются. Первый шаг правки в свою пользу.',
  fa: 'در تب تحلیل کل قرارداد را در کادر بزرگ بچسبانید. خط‌ها حفظ می‌شود. گام اول اصلاح به نفع شماست.',
  ja: '分析タブの大きな欄に契約全文を貼ります。改行は残ります。自分有利改訂の第一歩です。',
  pt: 'Em Analisar, cole o contrato na caixa grande. As quebras de linha mantêm-se. Primeiro passo da revisão.',
  nl: 'Plak onder Analyseren het contract in het grote vak. Regels blijven. Eerste stap van herziening in uw voordeel.',
});
set('guideStepAnalyzeUpload', {
  tr: 'Metin yoksa PDF / Belge Seç ile dosya yükleyin. Uygulama metni çıkarır; bozulursa yeniden seçin veya yapıştırın.',
  en: 'No text? Use Pick PDF / document. The app extracts text; if it looks broken, re-pick or paste instead.',
  de: 'Kein Text? PDF/Dokument wählen. Die App extrahiert Text; bei Fehlern neu wählen oder einfügen.',
  fr: 'Pas de texte ? Choisissez PDF/document. L’app extrait le texte ; si cassé, resélectionnez ou collez.',
  es: '¿Sin texto? Elija PDF/documento. La app extrae texto; si falla, vuelva a elegir o pegue.',
  ar: 'لا نص؟ اختر PDF/مستنداً. يستخرج التطبيق النص؛ إن تلف أعد الاختيار أو الصق.',
  it: 'Niente testo? Scegli PDF/documento. L’app estrae il testo; se spezzato, riseleziona o incolla.',
  zh: '没有文本？选 PDF/文档。应用会抽取文字；若乱码请重选或粘贴。',
  ru: 'Нет текста? Выберите PDF/документ. Приложение извлечёт текст; если обрыв — выберите снова или вставьте.',
  fa: 'متن ندارید؟ PDF/سند را انتخاب کنید. اپ متن را استخراج می‌کند؛ اگر خراب بود دوباره انتخاب یا بچسبانید.',
  ja: 'テキストがなければ PDF/文書を選択。抽出が壊れていれば再選択か貼り付け。',
  pt: 'Sem texto? Escolha PDF/documento. A app extrai o texto; se falhar, volte a escolher ou cole.',
  nl: 'Geen tekst? Kies PDF/document. De app haalt tekst; bij fout opnieuw kiezen of plakken.',
});
set('guideStepAnalyzeImages', {
  tr: 'Fotoğraflı sayfalar için Çoklu Sözleşme Görseli Yükle kullanın. Net, dik sayfalar daha iyi çıkarım verir.',
  en: 'For photo pages use Upload multiple contract images. Clear, upright pages extract better.',
  de: 'Für Fotoseiten: Mehrere Bilder laden. Klare, aufrechte Seiten extrahieren besser.',
  fr: 'Pour des photos : chargez plusieurs images. Pages nettes et droites = meilleur extrait.',
  es: 'Para fotos: suba varias imágenes. Páginas nítidas y verticales extraen mejor.',
  ar: 'لصفحات الصور: ارفع عدة صور. الصفحات الواضحة العمودية أفضل.',
  it: 'Per foto: carica più immagini. Pagine nitide e dritte estraggono meglio.',
  zh: '照片页请用多图上传。清晰竖向页面抽取更好。',
  ru: 'Для фото: загрузите несколько изображений. Чёткие вертикальные страницы лучше.',
  fa: 'برای عکس صفحات چند تصویر بارگذاری کنید. صفحات واضح و عمودی بهتر استخراج می‌شوند.',
  ja: '写真ページは複数画像アップロード。鮮明で正立のページが抽出に有利。',
  pt: 'Para fotos: envie várias imagens. Páginas nítidas e verticais extraem melhor.',
  nl: 'Voor foto’s: upload meerdere afbeeldingen. Scherpe, rechtopstaande pagina’s werken beter.',
});
set('guideStepAnalyzeParty', {
  tr: 'Kimin tarafını tutalım? seçicisinden rolünüzü (Müşteri, Yüklenici vb.) seçin. Bu, karar kartı ve kalkanın sizin lehinize yazılmasını sağlar; otomatik değişmesin diye türü kilitlerseniz daha güvenli.',
  en: 'Open Whose side? and pick your role (Customer, Provider, etc.). This steers the decision card and shield toward your favor. Lock the contract type if you do not want auto-detect to flip it.',
  de: 'Öffnen Sie Wessen Seite? und wählen Sie Ihre Rolle. So zielen Karte und Schild auf Sie. Vertragstyp sperren, falls Auto-Erkennung stört.',
  fr: 'Ouvrez De quel côté ? et choisissez votre rôle. Carte et bouclier suivent votre faveur. Verrouillez le type si besoin.',
  es: 'Abra ¿De qué lado? y elija su rol. La tarjeta y el escudo le favorecen. Bloquee el tipo si no quiere auto-detección.',
  ar: 'افتح أي طرف؟ واختر دورك. تُوجَّه البطاقة والدرع لصالحك. اقفل النوع إن أردت.',
  it: 'Apri Di che parte? e scegli il ruolo. Carta e scudo seguono il tuo favore. Blocca il tipo se serve.',
  zh: '打开“站在谁一边？”并选择角色。决策卡与盾牌会偏向你。不希望自动改类型时请锁定。',
  ru: 'Откройте «Чью сторону?» и выберите роль. Карточка и щит будут в вашу пользу. Зафиксируйте тип, если авто-определение мешает.',
  fa: '«طرف چه کسی؟» را باز کنید و نقش را انتخاب کنید. کارت و سپر به نفع شما می‌چرخد. نوع را قفل کنید تا خودکار عوض نشود.',
  ja: '「どちらの側？」で役割を選ぶと判断カードとシールドが自分寄りに。自動切替を止めたいなら種別をロック。',
  pt: 'Abra De que lado? e escolha o papel. Cartão e escudo favorecem-no. Bloqueie o tipo se não quiser deteção automática.',
  nl: 'Open Wiens kant? en kies uw rol. Kaart en schild volgen uw voordeel. Vergrendel het type als autodetectie stoort.',
});
set('guideStepAnalyzeStart', {
  tr: 'Yapay Zeka Analizini Başlat’a dokunun. İlerleme adımlarını izleyin; bitince skor, Mini‑Radar, kırmızı bayraklar ve karar kartı gelir.',
  en: 'Tap Start AI Analysis. Watch the progress steps; when done you get the score, Mini-Radar, red flags, and decision card.',
  de: 'KI-Analyse starten tippen. Fortschritt verfolgen; danach Score, Mini-Radar, Flaggen und Karte.',
  fr: 'Touchez Lancer l’analyse IA. Suivez la progression ; ensuite score, Mini-Radar, alertes et carte.',
  es: 'Toque Iniciar análisis de IA. Siga el progreso; luego score, Mini-Radar, alertas y tarjeta.',
  ar: 'المس بدء التحليل. راقب التقدم؛ ثم الدرجة والرادار والأعلام وبطاقة القرار.',
  it: 'Tocca Avvia Analisi IA. Segui i passi; poi punteggio, Mini-Radar, flag e carta.',
  zh: '点按启动 AI 分析。观看进度；完成后有评分、迷你雷达、红旗与决策卡。',
  ru: 'Нажмите «Запустить ИИ-анализ». Следите за шагами; затем скор, Mini-Radar, флаги и карточка.',
  fa: '«شروع تحلیل» را بزنید. پیشرفت را ببینید؛ سپس امتیاز، رادار، پرچم و کارت تصمیم.',
  ja: 'AI 分析を開始。進捗の後にスコア・ミニレーダー・赤旗・判断カードが出ます。',
  pt: 'Toque Iniciar análise com IA. Veja o progresso; depois score, Mini-Radar, alertas e cartão.',
  nl: 'Tik AI-analyse starten. Volg de stappen; daarna score, Mini-Radar, vlaggen en kaart.',
});
set('guideStepAnalyzeDecision', {
  tr: 'Sonuçta Güvenlik Skoru, Mini‑Radar (taraflar/hukuk/bildirim) ve kırmızı bayrakları okuyun. Karar kartı SIGN / NEGOTIATE / WALK_AWAY önerir; yüksek riskte bile pazarlık edilebilirse NEGOTIATE kalabilir.',
  en: 'Read the Security Score, Mini-Radar (parties/law/notice), and red flags. The decision card suggests SIGN / NEGOTIATE / WALK_AWAY — high risk can still be NEGOTIATE when remediable.',
  de: 'Lesen Sie Score, Mini-Radar und Flaggen. Die Karte schlägt SIGN/NEGOTIATE/WALK_AWAY vor — hohes Risiko kann bei Heilbarkeit NEGOTIATE bleiben.',
  fr: 'Lisez le score, Mini-Radar et alertes. La carte propose SIGN/NEGOTIATE/WALK_AWAY — un risque élevé peut rester NEGOTIATE s’il est remédiable.',
  es: 'Lea score, Mini-Radar y alertas. La tarjeta sugiere SIGN/NEGOTIATE/WALK_AWAY — alto riesgo puede seguir NEGOTIATE si es remediable.',
  ar: 'اقرأ الدرجة والرادار والأعلام. البطاقة تقترح SIGN/NEGOTIATE/WALK_AWAY وقد يبقى التفاوض مع المخاطر القابلة للإصلاح.',
  it: 'Leggi punteggio, Mini-Radar e flag. La carta propone SIGN/NEGOTIATE/WALK_AWAY — alto rischio può restare NEGOTIATE se rimediabile.',
  zh: '阅读安全分、迷你雷达与红旗。决策卡给出 SIGN/NEGOTIATE/WALK_AWAY；可补救时高风险仍可能是 NEGOTIATE。',
  ru: 'Прочитайте скор, Mini-Radar и флаги. Карточка даёт SIGN/NEGOTIATE/WALK_AWAY — при устранимом риске может остаться NEGOTIATE.',
  fa: 'امتیاز، رادار و پرچم‌ها را بخوانید. کارت SIGN/NEGOTIATE/WALK_AWAY می‌دهد؛ ریسک قابل‌رفع می‌تواند NEGOTIATE بماند.',
  ja: 'スコア・ミニレーダー・赤旗を読む。判断カードは SIGN/NEGOTIATE/WALK_AWAY。是正可能なら高リスクでも NEGOTIATE のままのことがあります。',
  pt: 'Leia score, Mini-Radar e alertas. O cartão sugere SIGN/NEGOTIATE/WALK_AWAY — risco alto pode permanecer NEGOTIATE se for remediável.',
  nl: 'Lees score, Mini-Radar en vlaggen. De kaart stelt SIGN/NEGOTIATE/WALK_AWAY voor — hoog risico kan NEGOTIATE blijven als herstelbaar.',
});
set('guideStepAnalyzeShield', {
  tr: 'Kalkanı uygula ile seçili karşı maddeler metne işlenir. Böylece “lehime revize” somutlaşır. Uygulama sonrası Word veya kırmızı çizgi PDF paylaşabilirsiniz.',
  en: 'Tap Apply shield to stitch selected counter-clauses into the text — that is revise-in-your-favor made concrete. After Apply you can share Word or redline PDF.',
  de: 'Schild anwenden fügt Gegenklauseln ein — die Revision wird konkret. Danach Word oder Redline-PDF teilen.',
  fr: 'Appliquer le bouclier insère les contre-clauses — la révision devient concrète. Puis partagez Word ou PDF redline.',
  es: 'Aplicar escudo inserta contrapuestas — la revisión se concreta. Luego comparta Word o PDF redline.',
  ar: 'تطبيق الدرع يدمج البنود المضادة — تتجسد المراجعة لصالحك. ثم شارك Word أو PDF redline.',
  it: 'Applica scudo inserisce le controclausole — la revisione diventa concreta. Poi condividi Word o PDF redline.',
  zh: '点“应用盾牌”把对策条款织入文本——有利于你的修订落地。之后可分享 Word 或红线 PDF。',
  ru: '«Применить щит» вшивает контрпункты — правка в вашу пользу. Затем поделитесь Word или redline PDF.',
  fa: '«اعمال سپر» بندهای مقابل را در متن می‌دوزد — اصلاح به نفع شما. سپس Word یا PDF redline.',
  ja: '「シールドを適用」で対案条項を織り込む＝自分有利の具体化。その後 Word やレッドライン PDF を共有。',
  pt: 'Aplicar escudo costura as cláusulas — a revisão fica concreta. Depois partilhe Word ou PDF redline.',
  nl: 'Schild toepassen weeft tegencausules in — herziening wordt concreet. Deel daarna Word of redline-PDF.',
});
set('guideStepAnalyzeReady', {
  tr: 'Karar kartındaki hazır mesajı Mesajı kopyala ile panoya alın; WhatsApp/e‑posta ile gönderin. İsterseniz Kartı paylaş ile özet paylaşın.',
  en: 'On the decision card tap Copy message for the ready-to-send text, then paste into WhatsApp/email. Or use Share this card for a short social summary.',
  de: 'Auf der Karte Nachricht kopieren tippen und in WhatsApp/E-Mail einfügen. Oder Karte teilen für Kurzfassung.',
  fr: 'Sur la carte, Copier le message puis collez dans WhatsApp/e-mail. Ou Partager la carte pour un résumé.',
  es: 'En la tarjeta, Copiar mensaje y péguelo en WhatsApp/correo. O Compartir tarjeta para un resumen.',
  ar: 'في البطاقة انسخ الرسالة والصقها في واتساب/البريد. أو شارك البطاقة لملخص قصير.',
  it: 'Sulla carta Copia messaggio e incolla su WhatsApp/email. Oppure Condividi la card per un riepilogo.',
  zh: '在决策卡点“复制消息”粘贴到 WhatsApp/邮件。或用“分享卡片”发短摘要。',
  ru: 'На карточке «Скопировать сообщение» и вставьте в WhatsApp/почту. Или «Поделиться карточкой».',
  fa: 'روی کارت «کپی پیام» را بزنید و در واتساپ/ایمیل بچسبانید. یا کارت را برای خلاصه کوتاه به اشتراک بگذارید.',
  ja: '判断カードで「メッセージをコピー」し WhatsApp/メールへ。短い要約はカード共有。',
  pt: 'No cartão, Copiar mensagem e cole no WhatsApp/e-mail. Ou Partilhar o cartão para um resumo.',
  nl: 'Op de kaart Bericht kopiëren en plakken in WhatsApp/e-mail. Of Deel de kaart voor een korte samenvatting.',
});

// Diff steps
set('guideStepDiffOpen', {
  tr: 'Analiz sekmesinde çalışma alanı düğmelerinden Karşılaştır’ı açın. Diff ayrı bir ana sekme değildir.',
  en: 'On Analyze, open Compare in the workspace toggle. Diff is not a main tab by itself.',
  de: 'Unter Analysieren Vergleichen im Arbeitsbereich öffnen. Diff ist kein eigener Haupt-Tab.',
  fr: 'Sous Analyser, ouvrez Comparer. Diff n’est pas un onglet principal séparé.',
  es: 'En Analizar, abra Comparar. Diff no es una pestaña principal aparte.',
  ar: 'في التحليل افتح المقارنة. Diff ليس تبويباً رئيسياً منفصلاً.',
  it: 'In Analizza apri Confronta. Diff non è una scheda principale separata.',
  zh: '在分析页打开“对比”。Diff 不是单独的主标签。',
  ru: 'Во вкладке Анализ откройте «Сравнение». Diff — не отдельная главная вкладка.',
  fa: 'در تحلیل، مقایسه را باز کنید. Diff تب اصلی جدا نیست.',
  ja: '分析タブ内で「比較」を開く。Diff は独立メインタブではありません。',
  pt: 'Em Analisar, abra Comparar. O Diff não é um separador principal à parte.',
  nl: 'Open onder Analyseren Vergelijken. Diff is geen apart hoofdtabblad.',
});
set('guideStepDiffOriginal', {
  tr: 'Sol/üstte orijinal (genelde son analiz metni), sağ/altta revize veya karşı taraf metni durur. Boş kutuya yeni sürümü yapıştırın; orijinali silmeyin.',
  en: 'Original sits on one side (often your last analysis text); revised/counterparty on the other. Paste the new version into the empty box — do not wipe the original.',
  de: 'Original auf einer Seite, Revision/Gegenseite auf der anderen. Neue Fassung in das leere Feld — Original nicht löschen.',
  fr: 'Original d’un côté, révisé/contrepartie de l’autre. Collez la nouvelle version dans la case vide — ne videz pas l’original.',
  es: 'Original a un lado, revisado/contraparte al otro. Pegue la nueva versión en el vacío — no borre el original.',
  ar: 'الأصل في جهة والمراجعة/الطرف الآخر في الأخرى. الصق النسخة الجديدة في المربع الفارغ دون مسح الأصل.',
  it: 'Originale da una parte, rivisto/controparte dall’altra. Incolla la nuova versione nella casella vuota — non cancellare l’originale.',
  zh: '一侧是原文，另一侧是修订/对方文本。把新版本贴进空框，不要清空原文。',
  ru: 'Оригинал с одной стороны, правка/контрагент — с другой. Вставьте новую версию в пустое поле — оригинал не стирайте.',
  fa: 'یک‌سو اصل، سوی دیگر اصلاح/طرف مقابل. نسخه جدید را در کادر خالی بچسبانید — اصل را پاک نکنید.',
  ja: '一方が原文、他方が改訂/相手文。新版は空欄へ。原文は消さない。',
  pt: 'Original de um lado, revisto/contraparte do outro. Cole a nova versão na caixa vazia — não apague o original.',
  nl: 'Origineel aan de ene kant, herziening/wederpartij aan de andere. Plak de nieuwe versie in het lege vak — wis het origineel niet.',
});
set('guideStepDiffSplit', {
  tr: 'Karşı Taraf Metni İle Karşılaştır (split) ile iki metni yan yana okuyun; hangi cümle değiştiğini hızlı tarayın.',
  en: 'Use Compare with counterparty text (split) to read both drafts side by side and scan what changed.',
  de: 'Mit dem Text der Gegenseite vergleichen (Split) — beide Entwürfe nebeneinander lesen.',
  fr: 'Comparer avec le texte de la contrepartie (split) pour lire les deux versions côte à côte.',
  es: 'Comparar con el texto de la contraparte (split) para leer ambos lado a lado.',
  ar: 'استخدم المقارنة المقسمة لقراءة المسودتين جنباً إلى جنب.',
  it: 'Usa Confronta con testo controparte (split) per leggere entrambi affiancati.',
  zh: '用“与对方文本对比”（分屏）并排阅读两稿，快速扫变更。',
  ru: '«Сравнить с текстом контрагента» (split) — читайте оба черновика рядом.',
  fa: 'مقایسه با متن طرف مقابل (split) را برای خواندن کنارهم دو پیش‌نویس استفاده کنید.',
  ja: '「相手文と比較」（分割）で両稿を左右に読み、変更を素早く確認。',
  pt: 'Use Comparar com o texto da contraparte (split) para ler ambos lado a lado.',
  nl: 'Gebruik Vergelijken met wederpartijtekst (split) om beide concepten naast elkaar te lezen.',
});
set('guideStepDiffRedline', {
  tr: 'Redline görünümü silinenleri üstü çizili, eklenenleri vurgulu gösterir. Uzun metinde yükleme göstergesini bekleyin; kaydırma donarsa arka plana dokunmayın — listeyi kaydırın.',
  en: 'Redline strikes deletions and highlights insertions. On long texts wait for the spinner; if scroll feels stuck, swipe the list — not the dimmed backdrop.',
  de: 'Redline streicht Löschungen und hebt Einfügungen hervor. Bei langen Texten Spinner abwarten; Liste scrollen, nicht den Hintergrund.',
  fr: 'Redline barre les suppressions et surligne les ajouts. Sur longs textes attendez le chargement ; faites défiler la liste, pas le fond.',
  es: 'Redline tacha borrados y resalta altas. En textos largos espere; desplace la lista, no el fondo.',
  ar: 'Redline يشطب المحذوف ويبرز المضاف. في النصوص الطويلة انتظر التحميل؛ مرّر القائمة لا الخلفية.',
  it: 'Redline barra le cancellazioni e evidenzia le aggiunte. Su testi lunghi attendi; scorri l’elenco, non lo sfondo.',
  zh: '红线删除划掉、新增高亮。长文请等待加载；滑动列表，不要点暗背景。',
  ru: 'Redline зачёркивает удаления и подсвечивает вставки. На длинных текстах дождитесь загрузки; листайте список, не фон.',
  fa: 'Redline حذف را خط می‌زند و افزوده‌ها را برجسته می‌کند. در متن بلند صبر کنید؛ لیست را بکشید نه پس‌زمینه.',
  ja: 'レッドラインは削除に取り消し線、追加を強調。長文は読み込み待ち。背景ではなくリストをスワイプ。',
  pt: 'Redline risca eliminações e destaca inserções. Em textos longos aguarde; deslize a lista, não o fundo.',
  nl: 'Redline streept verwijderingen door en markeert toevoegingen. Bij lange tekst wachten; scroll de lijst, niet de achtergrond.',
});
set('guideStepDiffAfter', {
  tr: 'Kalkan sonrası veya karşı taraf yeni sürüm gönderince Yeni sürümü doğrula kullanın: orijinal dolu gelir, boş kutuya yeni metni yapıştırıp farkı görün.',
  en: 'After a shield or a new counterparty draft, use Verify new version: original is prefilled; paste the new text in the empty box and review the diff.',
  de: 'Nach Schild oder neuer Fassung: Neue Fassung prüfen — Original ist gefüllt; neuen Text in das leere Feld.',
  fr: 'Après bouclier ou nouvelle version : Vérifier — l’original est prérempli ; collez le nouveau dans la case vide.',
  es: 'Tras escudo o nueva versión: Verificar — el original ya está; pegue el nuevo en el vacío.',
  ar: 'بعد الدرع أو مسودة جديدة: تحقق — الأصل مُعبأ؛ الصق الجديد في المربع الفارغ.',
  it: 'Dopo scudo o nuova bozza: Verifica — l’originale è già lì; incolla il nuovo nella casella vuota.',
  zh: '盾牌或对方新稿后，用“核验新版本”：原文已填，新文本贴进空框。',
  ru: 'После щита или новой версии — «Проверить»: оригинал уже заполнен; вставьте новый текст в пустое поле.',
  fa: 'پس از سپر یا پیش‌نویس جدید، «بررسی» کنید: اصل پر است؛ متن جدید را در کادر خالی بچسبانید.',
  ja: 'シールドや相手の新稿の後は「照合」：原文は入済み。新文を空欄へ。',
  pt: 'Após escudo ou novo rascunho: Verificar — o original já está; cole o novo na caixa vazia.',
  nl: 'Na schild of nieuw concept: Verifiëren — origineel staat er al; plak de nieuwe tekst in het lege vak.',
});

// Export steps
set('guideStepExportApply', {
  tr: 'Önce Kalkanı uygula: seçili karşı maddeler metne işlenir. Uygulamadan önce hangi maddelerin seçili olduğunu kontrol edin.',
  en: 'First tap Apply shield so selected counters stitch into the body. Check which clauses are selected before you apply.',
  de: 'Zuerst Schild anwenden — ausgewählte Gegenklauseln werden eingefügt. Auswahl vorher prüfen.',
  fr: 'D’abord Appliquer le bouclier — les contre-clauses sélectionnées s’insèrent. Vérifiez la sélection.',
  es: 'Primero Aplicar escudo — se insertan las contrapuestas seleccionadas. Revise la selección.',
  ar: 'أولاً طبّق الدرع لإدماج البنود المحددة. راجع الاختيار قبل التطبيق.',
  it: 'Prima Applica scudo — inserisce le controclausole selezionate. Controlla la selezione.',
  zh: '先点应用盾牌，把已选对策条款织入正文。应用前核对勾选。',
  ru: 'Сначала «Применить щит» — выбранные контрпункты вшиваются. Проверьте выбор.',
  fa: 'اول «اعمال سپر» تا بندهای انتخابی دوخته شود. قبل از اعمال انتخاب را چک کنید.',
  ja: 'まず「シールドを適用」。選択した対案が本文に織り込まれます。適用前に選択を確認。',
  pt: 'Primeiro Aplicar escudo — as cláusulas selecionadas são costuradas. Verifique a seleção.',
  nl: 'Eerst Schild toepassen — geselecteerde tegencausules worden geweven. Controleer de selectie.',
});
set('guideStepExportPdf', {
  tr: 'PDF Raporu İndir / Paylaş skor, özet ve madde listesini içeren analitik rapordur. Kırmızı çizgi Diff değildir.',
  en: 'Download / Share PDF Report is the analytical report (score, summary, clauses). It is not the redline Diff export.',
  de: 'PDF-Bericht herunterladen/teilen ist der Analysebericht — kein Redline-Diff.',
  fr: 'Télécharger / Partager le rapport PDF est le rapport d’analyse — pas l’export redline Diff.',
  es: 'Descargar / Compartir informe PDF es el informe analítico — no el Diff redline.',
  ar: 'تنزيل / مشاركة تقرير PDF هو التقرير التحليلي وليس تصدير Diff redline.',
  it: 'Scarica / Condividi Rapporto PDF è il report analitico — non l’export Diff redline.',
  zh: '下载/分享 PDF 报告是分析报告（分数、摘要、条款），不是红线 Diff。',
  ru: '«Скачать / поделиться PDF-отчётом» — аналитический отчёт, не redline Diff.',
  fa: 'دانلود/اشتراک گزارش PDF همان گزارش تحلیلی است، نه خروجی Diff redline.',
  ja: 'PDFレポートのダウンロード／共有は分析レポートであり、レッドライン Diff ではありません。',
  pt: 'Descarregar / partilhar relatório PDF é o relatório analítico — não o Diff redline.',
  nl: 'PDF-rapport downloaden/delen is het analyserapport — niet de redline-Diff-export.',
});
set('guideStepExportShare', {
  tr: 'Kırmızı çizgi PDF, silinen/eklenen vurgulu görsel redline’dır. Paylaşım menüsünden dışa aktarın; yazdırma önizlemesi A4 okunaklı olmalıdır.',
  en: 'Redline PDF is the visual redline with deletions/insertions. Share from the sheet; print preview should stay A4-legible.',
  de: 'Redline-PDF zeigt Löschungen/Einfügungen. Über Teilen exportieren; Druckvorschau A4-lesbar.',
  fr: 'Le PDF redline montre suppressions/ajouts. Partagez depuis la feuille ; aperçu A4 lisible.',
  es: 'El PDF redline muestra borrados/altas. Compártalo; la vista previa A4 debe ser legible.',
  ar: 'PDF redline يعرض الحذف والإضافة. شاركه من الورقة؛ معاينة الطباعة A4 واضحة.',
  it: 'Il PDF redline mostra cancellazioni/aggiunte. Condividi dal foglio; anteprima A4 leggibile.',
  zh: '红线 PDF 高亮删除/插入。从面板分享；打印预览应为可读 A4。',
  ru: 'Redline PDF показывает удаления/вставки. Делитесь из листа; превью печати — читаемый A4.',
  fa: 'PDF redline حذف/افزودن را نشان می‌دهد. از برگه به اشتراک بگذارید؛ پیش‌نمایش چاپ A4 خوانا باشد.',
  ja: 'レッドライン PDF は削除/追加の可視化。シートから共有。印刷プレビューは A4 で読めること。',
  pt: 'O PDF redline mostra eliminações/inserções. Partilhe na folha; pré-visualização A4 legível.',
  nl: 'Redline-PDF toont verwijderingen/toevoegingen. Deel vanuit het blad; afdrukvoorbeeld A4-leesbaar.',
});
set('guideStepExportDocx', {
  tr: 'Word (.docx) kalkan uygulandıktan sonra temiz dikilmiş metindir; Word içinde track-changes değildir. Uygula sonrası paylaşım satırından .docx seçin.',
  en: 'Word (.docx) is the clean stitched text after Apply shield — not Word track-changes. Pick .docx from the post-Apply share row.',
  de: 'Word (.docx) ist der saubere Text nach Schild — kein Track Changes. Nach Anwenden .docx wählen.',
  fr: 'Word (.docx) est le texte propre après bouclier — pas le suivi des modifications. Choisissez .docx après Appliquer.',
  es: 'Word (.docx) es el texto limpio tras el escudo — no control de cambios. Elija .docx tras Aplicar.',
  ar: 'Word (.docx) نص نظيف بعد الدرع وليس تعقّب تغييرات Word. اختر .docx بعد التطبيق.',
  it: 'Word (.docx) è il testo pulito dopo lo scudo — non revisioni Word. Scegli .docx dopo Applica.',
  zh: 'Word (.docx) 是应用盾牌后的干净拼接文本，不是 Word 修订追踪。应用后在分享行选 .docx。',
  ru: 'Word (.docx) — чистый сшитый текст после щита, не track changes. Выберите .docx после применения.',
  fa: 'Word (.docx) متن تمیز پس از سپر است، نه track changes. بعد از اعمال .docx را انتخاب کنید.',
  ja: 'Word (.docx) はシールド適用後のきれいな結合文。Word の変更履歴ではありません。適用後の共有で .docx を選ぶ。',
  pt: 'Word (.docx) é o texto limpo após o escudo — não controlo de alterações. Escolha .docx após Aplicar.',
  nl: 'Word (.docx) is schone tekst na schild — geen bijhouden van wijzigingen. Kies .docx na Toepassen.',
});

// Advisor steps
set('guideStepAdvisorVs', {
  tr: 'Rehber (bu sayfa) uygulama kullanımını anlatır. Danışman hukuki soru-cevaptır. Kanun, tazminat, mahkeme gibi konularda Rehber cevap uydurmaz — Danışman’a geçin.',
  en: 'The Guide (this sheet) explains app usage. Advisor is legal Q&A. For statutes, damages, courts the Guide invents nothing — switch to Advisor.',
  de: 'Der Guide erklärt die App. Der Berater ist Rechts-Q&A. Bei Gesetz/Schaden/Gericht nichts erfinden — Berater öffnen.',
  fr: 'Le Guide explique l’app. Le Conseiller est Q&R juridique. Pour loi/dommages/tribunal — ouvrez Conseiller.',
  es: 'La Guía explica la app. El Asesor es Q&A legal. Para ley/daños/tribunal — abra Asesor.',
  ar: 'الدليل يشرح التطبيق. المستشار للأسئلة القانونية. للقوانين والتعويض والمحاكم انتقل للمستشار.',
  it: 'La Guida spiega l’app. Il Consulente è Q&A legale. Per legge/danni/tribunale apri Consulente.',
  zh: '指南讲用法；顾问做法律问答。涉及法规/赔偿/法院时请用顾问，指南不编造答案。',
  ru: 'Гид — про приложение. Консультант — юр. Q&A. Закон/убытки/суд — открывайте Консультант.',
  fa: 'راهنما کار با اپ را می‌گوید. مشاور پرسش حقوقی است. برای قانون/خسارت/دادگاه به مشاور بروید.',
  ja: 'ガイドは使い方。アドバイザーは法的Q&A。法令・損害・裁判所はアドバイザーへ。',
  pt: 'O Guia explica a app. O Consultor é Q&A jurídica. Para lei/danos/tribunal abra Consultor.',
  nl: 'De gids legt de app uit. Adviseur is juridische Q&A. Voor wet/schade/rechtbank opent u Adviseur.',
});
set('guideStepAdvisorOpen', {
  tr: 'Üst sekmelerden Danışman’a geçin. Analiz sonucunuz bağlam olabilir; yine de soruyu net yazın.',
  en: 'Switch to the Advisor tab in the top bar. Your analysis may provide context — still write a clear question.',
  de: 'Zum Berater-Tab wechseln. Analyse kann Kontext geben — Frage trotzdem klar formulieren.',
  fr: 'Passez à l’onglet Conseiller. L’analyse peut contextualiser — formulez quand même clairement.',
  es: 'Cambie a Asesor. El análisis puede dar contexto — formule la pregunta con claridad.',
  ar: 'انتقل لتبويب المستشار. قد يوفّر التحليل سياقاً — اكتب السؤال بوضوح.',
  it: 'Passa a Consulente. L’analisi può dare contesto — formula comunque chiaramente.',
  zh: '切换到顾问选项卡。分析可提供上下文——仍请写清问题。',
  ru: 'Перейдите во вкладку Консультант. Анализ даёт контекст — всё равно формулируйте ясно.',
  fa: 'به تب مشاور بروید. تحلیل ممکن است زمینه بدهد — سؤال را واضح بنویسید.',
  ja: 'アドバイザータブへ。分析が文脈になっても質問は明確に。',
  pt: 'Mude para Consultor. A análise pode dar contexto — escreva a pergunta com clareza.',
  nl: 'Ga naar Adviseur. Analyse kan context geven — formuleer de vraag toch helder.',
});
set('guideStepAdvisorAsk', {
  tr: 'Danışman’da taraf ve ülke bağlamını kontrol edin, soruyu gönderin. Yanıt kaynak/mütevazılık içerir; Rehber adımlarının yerine geçmez.',
  en: 'In Advisor confirm party/country context, then send the question. Answers include humility/sources and do not replace Guide how-to steps.',
  de: 'Im Berater Partei/Land prüfen, dann senden. Antworten ersetzen keine Guide-Schritte.',
  fr: 'Dans Conseiller vérifiez partie/pays, puis envoyez. Les réponses ne remplacent pas les étapes du Guide.',
  es: 'En Asesor confirme parte/país y envíe. Las respuestas no sustituyen los pasos de la Guía.',
  ar: 'في المستشار راجع الطرف/البلد ثم أرسل. الإجابات لا تغني عن خطوات الدليل.',
  it: 'In Consulente verifica parte/paese e invia. Le risposte non sostituiscono i passi della Guida.',
  zh: '在顾问中确认角色/国家后发送。回答不能替代指南操作步骤。',
  ru: 'В Консультанте проверьте сторону/страну и отправьте. Ответы не заменяют шаги Гида.',
  fa: 'در مشاور نقش/کشور را چک کنید و بفرستید. پاسخ‌ها جایگزین گام‌های راهنما نیستند.',
  ja: 'アドバイザーで当事者/国を確認して送信。回答はガイド手順の代替ではありません。',
  pt: 'No Consultor confirme parte/país e envie. As respostas não substituem os passos do Guia.',
  nl: 'Controleer in Adviseur partij/land en verstuur. Antwoorden vervangen geen gidsstappen.',
});
set('guideStepAdvisorWhen', {
  tr: 'Kullanım (“nasıl PDF indiririm?”) → Rehber. Hukuk (“şu madde geçersiz mi?”) → Hukuk Danışmanına Sor.',
  en: 'How-to (“how do I download PDF?”) → Guide. Legal (“is this clause void?”) → Ask Legal Advisor.',
  de: 'Bedienung („wie PDF?“) → Guide. Recht („ist Klausel nichtig?“) → Berater fragen.',
  fr: 'Usage (« comment PDF ? ») → Guide. Droit (« clause nulle ? ») → Demander au conseiller.',
  es: 'Uso («¿cómo PDF?») → Guía. Derecho («¿cláusula nula?») → Preguntar al asesor.',
  ar: 'الاستخدام («كيف PDF؟») ← الدليل. القانون («هل البند باطل؟») ← اسأل المستشار.',
  it: 'Uso («come PDF?») → Guida. Diritto («clausola nulla?») → Chiedi al consulente.',
  zh: '用法（“怎么下 PDF？”）→ 指南。法律（“条款无效吗？”）→ 询问顾问。',
  ru: 'Как пользоваться («как PDF?») → Гид. Право («пункт ничтожен?») → Спросить консультанта.',
  fa: 'کاربرد («چطور PDF؟») ← راهنما. حقوق («بند باطل است؟») ← از مشاور بپرس.',
  ja: '使い方（「PDF はどう出す？」）→ガイド。法律（「条項は無効？」）→アドバイザーに質問。',
  pt: 'Uso («como PDF?») → Guia. Direito («cláusula nula?») → Perguntar ao consultor.',
  nl: 'Gebruik («hoe PDF?») → Gids. Recht («is beding nietig?») → Vraag de adviseur.',
});

set('guideStepSettingsOpen', {
  tr: 'Üstten Ayarlar sekmesini açın. Dil, tema, güvenlik ve koltuk kodları burada toplanır.',
  en: 'Open the Settings tab from the top bar. Language, theme, security, and seat codes live here.',
  de: 'Einstellungen oben öffnen. Sprache, Theme, Sicherheit und Sitzcodes sind hier.',
  fr: 'Ouvrez Réglages en haut. Langue, thème, sécurité et codes siège sont ici.',
  es: 'Abra Ajustes arriba. Idioma, tema, seguridad y códigos de asiento están aquí.',
  ar: 'افتح الإعدادات من الأعلى. اللغة والمظهر والأمان ورموز المقاعد هنا.',
  it: 'Apri Impostazioni in alto. Lingua, tema, sicurezza e codici posto sono qui.',
  zh: '从顶部打开设置。语言、主题、安全与席位码都在这里。',
  ru: 'Откройте Настройки сверху. Язык, тема, безопасность и коды мест здесь.',
  fa: 'از بالا تنظیمات را باز کنید. زبان، تم، امنیت و کد صندلی اینجاست.',
  ja: '上部から設定を開く。言語・テーマ・セキュリティ・シートコードはここ。',
  pt: 'Abra Definições no topo. Idioma, tema, segurança e códigos de lugar estão aqui.',
  nl: 'Open Instellingen bovenaan. Taal, thema, beveiliging en stoelcodes staan hier.',
});
set('guideStepSettingsLang', {
  tr: 'Uygulama Dili listesinden 13 dilden birini seçin. Rapor dili ayrı seçilebilir; karıştırmayın.',
  en: 'Pick one of 13 languages under App language. Report language can differ — do not confuse them.',
  de: 'Unter App-Sprache eine von 13 Sprachen wählen. Berichtssprache kann abweichen.',
  fr: 'Choisissez une des 13 langues. La langue du rapport peut différer.',
  es: 'Elija uno de 13 idiomas. El idioma del informe puede diferir.',
  ar: 'اختر إحدى 13 لغة. لغة التقرير قد تختلف.',
  it: 'Scegli una delle 13 lingue. La lingua del report può differire.',
  zh: '在应用语言中选 13 种之一。报告语言可以不同——勿混淆。',
  ru: 'Выберите один из 13 языков. Язык отчёта может отличаться.',
  fa: 'یکی از ۱۳ زبان را انتخاب کنید. زبان گزارش می‌تواند جدا باشد.',
  ja: 'アプリ言語で13言語から選択。レポート言語は別でも可。混同しない。',
  pt: 'Escolha um dos 13 idiomas. O idioma do relatório pode diferir.',
  nl: 'Kies een van 13 talen. Rapporttaal kan afwijken — niet verwarren.',
});
set('guideStepPlaybookOpen', {
  tr: 'Analiz sonucunu aşağı kaydırıp İmza öncesi playbook’u açın. Eksik korumaları işaretleyin; kalkan bunlardan beslenir.',
  en: 'Scroll the analysis result and open Pre-signature playbook. Tick missing protections — the shield feeds on them.',
  de: 'Analyseergebnis scrollen und Playbook öffnen. Fehlende Schutzpunkte markieren — das Schild speist sich daraus.',
  fr: 'Faites défiler le résultat et ouvrez le playbook. Cochez les protections manquantes — le bouclier s’en nourrit.',
  es: 'Desplácese al resultado y abra el playbook. Marque protecciones faltantes — el escudo se alimenta de ellas.',
  ar: 'مرّر لنتيجة التحليل وافتح الدليل. علّم الحمايات الناقصة — الدرع يعتمد عليها.',
  it: 'Scorri il risultato e apri il playbook. Spunta le protezioni mancanti — lo scudo le usa.',
  zh: '向下滚动分析结果并打开签署前手册。勾选缺失保护——盾牌会用到它们。',
  ru: 'Прокрутите результат и откройте плейбук. Отметьте пробелы — щит опирается на них.',
  fa: 'نتیجه تحلیل را پایین بکشید و پلی‌بوک را باز کنید. حفاظت‌های کم را علامت بزنید — سپر از آن‌ها تغذیه می‌کند.',
  ja: '分析結果をスクロールし署名前プレイブックを開く。不足保護をチェック — シールドの材料になります。',
  pt: 'Desça o resultado e abra o playbook. Marque proteções em falta — o escudo alimenta-se delas.',
  nl: 'Scroll naar het resultaat en open het playbook. Vink ontbrekende bescherming — het schild gebruikt die.',
});
set('guideStepPlaybookSeat', {
  tr: 'Ayarlar’da Danışman koltuğu / Hane koltuğu ile salt okunur brief kodu üretin. Orijinal sözleşme gönderilmez; Pro limitlerine uyun.',
  en: 'In Settings use Advisor seat / Household seat to mint a read-only brief code. The original contract is not sent; respect Pro limits.',
  de: 'In Einstellungen Berater-/Haushaltssitz für Brief-Code. Original wird nicht gesendet; Pro-Limits beachten.',
  fr: 'Dans Réglages, siège conseiller/foyer pour un code brief. L’original n’est pas envoyé ; respectez les limites Pro.',
  es: 'En Ajustes, asiento asesor/hogar para un código brief. El original no se envía; respete límites Pro.',
  ar: 'في الإعدادات مقعد المستشار/الأسرة لرمز brief. الأصل لا يُرسل؛ احترم حدود Pro.',
  it: 'In Impostazioni posto consulente/famiglia per un codice brief. L’originale non viene inviato; rispetta i limiti Pro.',
  zh: '在设置用顾问/家庭席位生成只读简报码。原文不会发送；遵守 Pro 限额。',
  ru: 'В Настройках место консультанта/семьи для кода brief. Оригинал не отправляется; лимиты Pro.',
  fa: 'در تنظیمات صندلی مشاور/خانواده برای کد brief. اصل ارسال نمی‌شود؛ سقف Pro را رعایت کنید.',
  ja: '設定のアドバイザー/世帯シートで読み取り専用ブリーフコードを発行。原文は送られません。Pro 上限に注意。',
  pt: 'Em Definições, lugar consultor/família para um código brief. O original não é enviado; respeite limites Pro.',
  nl: 'In Instellingen adviseur-/huishoudenstoel voor een briefcode. Het origineel wordt niet gestuurd; respecteer Pro-limieten.',
});

const keys = Object.keys(T);
const out = {};
for (const lang of langs) {
  out[lang] = {};
  for (const key of keys) {
    if (!T[key][lang]) throw new Error(`missing ${key}.${lang}`);
    out[lang][key] = T[key][lang];
  }
}

const dest = path.join(__dirname, '..', 'i18n.wavef.js');
fs.writeFileSync(
  dest,
  `// WAVE BL.4 — FAQ-grade NexuLex Guide strings. Same key set in all 13 languages.\n\nexport const WAVE_F_I18N = ${JSON.stringify(out, null, 2)};\n`,
  'utf8'
);
console.log(`Wrote ${dest} keys=${keys.length} langs=${langs.length}`);
