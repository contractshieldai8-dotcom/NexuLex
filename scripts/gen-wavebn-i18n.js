// WAVE BN — party clarity / precision shield. Run: node scripts/gen-wavebn-i18n.js
const fs = require('fs');
const path = require('path');

const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const T = {};
function set(key, byLang) {
  T[key] = byLang;
}

set('partyProtectTitle', {
  tr: 'Sizi kim olarak koruyalım?',
  en: 'Who should we protect you as?',
  de: 'Als wen sollen wir Sie schützen?',
  fr: 'En tant que qui vous protéger ?',
  es: '¿Como quién debemos protegerle?',
  ar: 'بأي صفة نحميك؟',
  it: 'Come chi dobbiamo proteggerti?',
  zh: '我们应以哪一方保护您？',
  ru: 'Кем вас защищать?',
  fa: 'شما را در کدام نقش محافظت کنیم؟',
  ja: 'どの立場で守りますか？',
  pt: 'Como quem devemos protegê-lo?',
  nl: 'Als wie moeten we u beschermen?',
});

set('partyProtectHint', {
  tr: 'Risk skoru, kalkan ve hazır mesaj bu tarafa göre yazılır.',
  en: 'Risk score, shield, and ready message are written for this side.',
  de: 'Risikoscore, Schild und fertige Nachricht gelten für diese Seite.',
  fr: 'Score, bouclier et message prêt sont rédigés pour ce côté.',
  es: 'La puntuación, el escudo y el mensaje listo se escriben para este lado.',
  ar: 'درجة المخاطر والدرع والرسالة الجاهزة تُكتب لهذا الطرف.',
  it: 'Punteggio, scudo e messaggio pronto sono per questo lato.',
  zh: '风险分、盾牌与就绪消息按此方撰写。',
  ru: 'Оценка риска, щит и готовое сообщение — для этой стороны.',
  fa: 'امتیاز ریسک، سپر و پیام آماده برای این طرف نوشته می‌شود.',
  ja: 'リスク点・シールド・送信文はこの立場向けに書かれます。',
  pt: 'Pontuação, escudo e mensagem pronta são para este lado.',
  nl: 'Risicoscore, schild en klaar bericht gelden voor deze kant.',
});

set('partyNotSelected', {
  tr: 'Henüz seçilmedi',
  en: 'Not selected yet',
  de: 'Noch nicht gewählt',
  fr: 'Pas encore choisi',
  es: 'Aún no seleccionado',
  ar: 'لم يُختر بعد',
  it: 'Non ancora scelto',
  zh: '尚未选择',
  ru: 'Ещё не выбрано',
  fa: 'هنوز انتخاب نشده',
  ja: 'まだ未選択',
  pt: 'Ainda não selecionado',
  nl: 'Nog niet gekozen',
});

set('partyNeedSelect', {
  tr: 'Analizden önce hangi tarafı koruyacağımızı seçin.',
  en: 'Select which side to protect before analyzing.',
  de: 'Wählen Sie vor der Analyse, welche Seite geschützt wird.',
  fr: 'Choisissez le côté à protéger avant d’analyser.',
  es: 'Elija qué lado proteger antes de analizar.',
  ar: 'اختر الطرف الذي نحميه قبل التحليل.',
  it: 'Scegli quale lato proteggere prima di analizzare.',
  zh: '分析前请先选择要保护的一方。',
  ru: 'Перед анализом выберите, какую сторону защищать.',
  fa: 'قبل از تحلیل مشخص کنید کدام طرف را محافظت کنیم.',
  ja: '分析前に守る立場を選んでください。',
  pt: 'Selecione qual lado proteger antes de analisar.',
  nl: 'Kies vóór analyse welke kant we beschermen.',
});

set('partyShieldActive', {
  tr: 'Korunan: {{name}} ({{role}})',
  en: 'Protected: {{name}} ({{role}})',
  de: 'Geschützt: {{name}} ({{role}})',
  fr: 'Protégé : {{name}} ({{role}})',
  es: 'Protegido: {{name}} ({{role}})',
  ar: 'محمي: {{name}} ({{role}})',
  it: 'Protetto: {{name}} ({{role}})',
  zh: '受保护：{{name}}（{{role}}）',
  ru: 'Защищён: {{name}} ({{role}})',
  fa: 'محافظت‌شده: {{name}} ({{role}})',
  ja: '保護中: {{name}}（{{role}}）',
  pt: 'Protegido: {{name}} ({{role}})',
  nl: 'Beschermd: {{name}} ({{role}})',
});

set('partyFlipCta', {
  tr: 'Taraf değiştir → {{name}} ({{role}})',
  en: 'Flip side → {{name}} ({{role}})',
  de: 'Seite wechseln → {{name}} ({{role}})',
  fr: 'Changer de côté → {{name}} ({{role}})',
  es: 'Cambiar de lado → {{name}} ({{role}})',
  ar: 'بدّل الطرف → {{name}} ({{role}})',
  it: 'Cambia lato → {{name}} ({{role}})',
  zh: '切换方 → {{name}}（{{role}}）',
  ru: 'Сменить сторону → {{name}} ({{role}})',
  fa: 'تغییر طرف → {{name}} ({{role}})',
  ja: '立場切替 → {{name}}（{{role}}）',
  pt: 'Trocar lado → {{name}} ({{role}})',
  nl: 'Wissel kant → {{name}} ({{role}})',
});

set('partyOtherRoles', {
  tr: 'Diğer roller…',
  en: 'Other roles…',
  de: 'Andere Rollen…',
  fr: 'Autres rôles…',
  es: 'Otros roles…',
  ar: 'أدوار أخرى…',
  it: 'Altri ruoli…',
  zh: '其他角色…',
  ru: 'Другие роли…',
  fa: 'نقش‌های دیگر…',
  ja: 'その他の役割…',
  pt: 'Outros papéis…',
  nl: 'Andere rollen…',
});

set('partyFlipHint', {
  tr: 'Taraf değişti. Yeni kişilikle analizi yeniden çalıştırın.',
  en: 'Side flipped. Re-run analyze with the new persona.',
  de: 'Seite gewechselt. Analyse mit neuer Persona erneut starten.',
  fr: 'Côté changé. Relancez l’analyse avec la nouvelle persona.',
  es: 'Lado cambiado. Vuelva a analizar con la nueva persona.',
  ar: 'تم تبديل الطرف. أعد التحليل بالشخصية الجديدة.',
  it: 'Lato cambiato. Riesegui l’analisi con la nuova persona.',
  zh: '已切换方。请用新身份重新分析。',
  ru: 'Сторона сменена. Запустите анализ с новой персоной.',
  fa: 'طرف عوض شد. با نقش جدید دوباره تحلیل کنید.',
  ja: '立場を切り替えました。新しい人格で再分析してください。',
  pt: 'Lado alterado. Execute a análise de novo com a nova persona.',
  nl: 'Kant gewisseld. Start analyse opnieuw met de nieuwe persona.',
});

set('paywallPartyContext', {
  tr: 'Seçilen taraf: {{party}}. {{harm}}',
  en: 'Selected side: {{party}}. {{harm}}',
  de: 'Gewählte Seite: {{party}}. {{harm}}',
  fr: 'Côté choisi : {{party}}. {{harm}}',
  es: 'Lado elegido: {{party}}. {{harm}}',
  ar: 'الطرف المختار: {{party}}. {{harm}}',
  it: 'Lato scelto: {{party}}. {{harm}}',
  zh: '已选方：{{party}}。{{harm}}',
  ru: 'Выбранная сторона: {{party}}. {{harm}}',
  fa: 'طرف انتخاب‌شده: {{party}}. {{harm}}',
  ja: '選択した立場: {{party}}。{{harm}}',
  pt: 'Lado selecionado: {{party}}. {{harm}}',
  nl: 'Gekozen kant: {{party}}. {{harm}}',
});

set('paywallPartyContextGeneric', {
  tr: 'Kritik kalkanlar ve hazır mesaj bu tarafa kilitlenir.',
  en: 'Critical shields and the ready message lock to this side.',
  de: 'Kritische Schilde und die fertige Nachricht gelten für diese Seite.',
  fr: 'Boucliers critiques et message prêt sont verrouillés sur ce côté.',
  es: 'Escudos críticos y el mensaje listo se fijan a este lado.',
  ar: 'الدروع الحرجة والرسالة الجاهزة تُقفل لهذا الطرف.',
  it: 'Scudi critici e messaggio pronto restano su questo lato.',
  zh: '关键盾与就绪消息锁定到此方。',
  ru: 'Критические щиты и готовое сообщение закреплены за этой стороной.',
  fa: 'سپرهای حیاتی و پیام آماده به این طرف قفل می‌شوند.',
  ja: '重要シールドと送信文はこの立場に固定されます。',
  pt: 'Escudos críticos e a mensagem pronta ficam neste lado.',
  nl: 'Kritieke schilden en het klaar bericht horen bij deze kant.',
});

// Optional BL guide nudge (overrides WAVE_F same key — merged count unchanged).
set('guideStepAnalyzeParty', {
  tr: '“Sizi kim olarak koruyalım?” altında iki karta dokunun (isim varsa Apex/Anadolu). Analiz, kalkan ve mesaj bu tarafa yazılır; Diğer roller… ile tam liste açılır. Onaysız analiz başlamaz.',
  en: 'Under “Who should we protect you as?” tap a dual card (named when radar finds Apex/Anadolu). Analyze, shield, and message follow that side; Other roles… opens the full list. Analyze stays blocked until you confirm.',
  de: 'Unter „Als wen schützen?“ tippen Sie eine der zwei Karten (mit Namen, wenn Radar sie findet). Analyse, Schild und Nachricht folgen dieser Seite; Andere Rollen… öffnet die Liste. Ohne Bestätigung keine Analyse.',
  fr: 'Sous « En tant que qui ? », touchez une des deux cartes (noms si le radar les trouve). Analyse, bouclier et message suivent ce côté ; Autres rôles… ouvre la liste. Sans confirmation, pas d’analyse.',
  es: 'En «¿Como quién protegerle?» toque una de las dos tarjetas (con nombres si el radar los halla). Análisis, escudo y mensaje siguen ese lado; Otros roles… abre la lista. Sin confirmar no se analiza.',
  ar: 'تحت «بأي صفة نحميك؟» المس إحدى البطاقتين (بأسماء إن وُجدت). التحليل والدرع والرسالة لهذا الطرف؛ أدوار أخرى… للقائمة الكاملة. بلا تأكيد لا يبدأ التحليل.',
  it: 'Sotto «Come chi proteggerti?» tocca una delle due card (con nomi se il radar li trova). Analisi, scudo e messaggio seguono quel lato; Altri ruoli… apre l’elenco. Senza conferma l’analisi resta bloccata.',
  zh: '在「我们应以哪一方保护您？」下点选双卡（雷达有名则显示）。分析、盾牌与消息按该方；其他角色…打开完整列表。未确认则无法分析。',
  ru: 'Под «Кем вас защищать?» нажмите одну из двух карточек (с именами, если радар нашёл). Анализ, щит и сообщение — для этой стороны; «Другие роли…» — полный список. Без подтверждения анализ не стартует.',
  fa: 'زیر «شما را در کدام نقش؟» یکی از دو کارت را بزنید (اگر رادار نام یافت). تحلیل، سپر و پیام برای همان طرف است؛ نقش‌های دیگر… فهرست کامل. بدون تأیید تحلیل شروع نمی‌شود.',
  ja: '「どの立場で守りますか？」の二枚カードをタップ（レーダーが社名を出せば表示）。分析・シールド・文面はその立場向け。その他の役割…で一覧。未確定のままでは分析しません。',
  pt: 'Em «Como quem proteger?» toque num dos dois cartões (com nomes se o radar achar). Análise, escudo e mensagem seguem esse lado; Outros papéis… abre a lista. Sem confirmar, a análise não corre.',
  nl: 'Onder «Als wie beschermen?» tikt u een van de twee kaarten (met namen als radar ze vindt). Analyse, schild en bericht volgen die kant; Andere rollen… opent de lijst. Zonder bevestiging start analyse niet.',
});

const out = {};
for (const lang of langs) {
  out[lang] = {};
  for (const key of Object.keys(T)) {
    out[lang][key] = T[key][lang] || T[key].en;
  }
}

const file = `// WAVE BN — Party Clarity & Precision Shield. Same key set in all 13 languages.\n\nexport const WAVE_BN_I18N = ${JSON.stringify(out, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'i18n.wavebn.js'), file, 'utf8');
console.log('Wrote i18n.wavebn.js keys=', Object.keys(T).length, 'langs=', langs.length);
