// WAVE I: lead-time reminder texts + check-in reminder texts for the 13 languages (idempotent).
// Run once:  node scripts/wire-wavei-i18n.js
const fs = require('fs');

const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const KEYS = [
  'remLead30', 'remLead7', 'remLead1', 'remLead0',
  'nudgeBody3', 'nudgeBody10', 'nudgeSettingTitle', 'nudgeSettingHint', 'nudgeDenied', 'nudgeAskYes',
];

const D = {
  tr: [
    '30 gün kaldı: {{label}}', '7 gün kaldı: {{label}}', 'Yarın: {{label}}', 'Bugün: {{label}}',
    'Yakında bir şey mi imzalayacaksınız? Önce tarayın; 30 saniye aylarınızı kurtarabilir.',
    'Küçük harfler tuzak saklar. İmzalamadan önce bugün bir sözleşmeyi kontrol edin.',
    'Nazik hatırlatmalar',
    'Bir süre uygulamayı açmazsanız, imzadan önce sözleşme taramanız için en fazla iki sessiz hatırlatma gönderilir. İstediğiniz zaman Ayarlar’dan kapatabilirsiniz.',
    'Bu uygulama için bildirimler kapalı. Önce telefon ayarlarından izin verin.',
    'Evet, hatırlat',
  ],
  en: [
    'In 30 days: {{label}}', 'In 7 days: {{label}}', 'Tomorrow: {{label}}', 'Today: {{label}}',
    'Signing something soon? Scan it first — 30 seconds can save you months.',
    'Fine print hides traps. Check one contract today, before you sign.',
    'Gentle check-in reminders',
    'Up to two quiet reminders if you have been away for a while, to scan a contract before you sign. You can turn this off any time in Settings.',
    'Notifications are off for this app. Allow them in your phone settings first.',
    'Yes, remind me',
  ],
  de: [
    'In 30 Tagen: {{label}}', 'In 7 Tagen: {{label}}', 'Morgen: {{label}}', 'Heute: {{label}}',
    'Bald etwas zu unterschreiben? Scannen Sie es vorher – 30 Sekunden können Monate sparen.',
    'Das Kleingedruckte versteckt Fallen. Prüfen Sie heute einen Vertrag, bevor Sie unterschreiben.',
    'Sanfte Erinnerungen',
    'Bis zu zwei dezente Erinnerungen, wenn Sie länger nicht da waren – damit Sie einen Vertrag vor der Unterschrift prüfen. Sie können das jederzeit in den Einstellungen ausschalten.',
    'Benachrichtigungen sind für diese App aus. Erlauben Sie sie zuerst in den Telefoneinstellungen.',
    'Ja, erinnern',
  ],
  fr: [
    'Dans 30 jours : {{label}}', 'Dans 7 jours : {{label}}', 'Demain : {{label}}', 'Aujourd’hui : {{label}}',
    'Vous allez bientôt signer ? Scannez d’abord : 30 secondes peuvent vous faire gagner des mois.',
    'Les petites lignes cachent des pièges. Vérifiez un contrat aujourd’hui, avant de signer.',
    'Rappels discrets',
    'Jusqu’à deux rappels discrets si vous êtes absent un moment, pour scanner un contrat avant de signer. Vous pouvez les désactiver à tout moment dans les réglages.',
    'Les notifications sont désactivées pour cette app. Autorisez-les d’abord dans les réglages du téléphone.',
    'Oui, me le rappeler',
  ],
  es: [
    'Dentro de 30 días: {{label}}', 'Dentro de 7 días: {{label}}', 'Mañana: {{label}}', 'Hoy: {{label}}',
    '¿Vas a firmar algo pronto? Escanéalo antes: 30 segundos pueden ahorrarte meses.',
    'La letra pequeña esconde trampas. Revisa un contrato hoy, antes de firmar.',
    'Recordatorios discretos',
    'Hasta dos recordatorios discretos si llevas tiempo sin entrar, para escanear un contrato antes de firmar. Puedes desactivarlos cuando quieras en Ajustes.',
    'Las notificaciones están desactivadas para esta app. Permítelas primero en los ajustes del teléfono.',
    'Sí, recuérdamelo',
  ],
  ar: [
    'بعد 30 يومًا: {{label}}', 'بعد 7 أيام: {{label}}', 'غدًا: {{label}}', 'اليوم: {{label}}',
    'هل ستوقّع على شيء قريبًا؟ امسحه ضوئيًا أولًا؛ 30 ثانية قد توفر عليك أشهرًا.',
    'الحروف الصغيرة تخفي فخاخًا. افحص عقدًا اليوم قبل أن توقّع.',
    'تذكيرات لطيفة',
    'حتى تذكيرين هادئين إذا غبت فترة، لتفحص عقدًا قبل التوقيع. يمكنك إيقافها في أي وقت من الإعدادات.',
    'الإشعارات متوقفة لهذا التطبيق. اسمح بها أولًا من إعدادات الهاتف.',
    'نعم، ذكّرني',
  ],
  it: [
    'Tra 30 giorni: {{label}}', 'Tra 7 giorni: {{label}}', 'Domani: {{label}}', 'Oggi: {{label}}',
    'Devi firmare qualcosa a breve? Scansionalo prima: 30 secondi possono farti risparmiare mesi.',
    'Le clausole in piccolo nascondono insidie. Controlla un contratto oggi, prima di firmare.',
    'Promemoria discreti',
    'Fino a due promemoria discreti se manchi da un po’, per scansionare un contratto prima di firmare. Puoi disattivarli in qualsiasi momento dalle Impostazioni.',
    'Le notifiche sono disattivate per questa app. Consentile prima nelle impostazioni del telefono.',
    'Sì, ricordamelo',
  ],
  zh: [
    '还有30天：{{label}}', '还有7天：{{label}}', '明天：{{label}}', '今天：{{label}}',
    '快要签字了吗？先扫描一下，30秒可能为您省下数月麻烦。',
    '小字里藏着陷阱。签字之前，今天先检查一份合同。',
    '温和的提醒',
    '如果您有一段时间没打开应用，最多会收到两条安静的提醒，提示您在签字前扫描合同。您可随时在设置中关闭。',
    '此应用的通知已关闭。请先在手机设置中允许通知。',
    '好的，提醒我',
  ],
  ru: [
    'Через 30 дней: {{label}}', 'Через 7 дней: {{label}}', 'Завтра: {{label}}', 'Сегодня: {{label}}',
    'Скоро что-то подписывать? Сначала отсканируйте: 30 секунд могут сэкономить вам месяцы.',
    'Мелкий шрифт скрывает ловушки. Проверьте один договор сегодня, до подписания.',
    'Мягкие напоминания',
    'До двух ненавязчивых напоминаний, если вы давно не заходили, чтобы проверить договор перед подписанием. Отключить можно в любой момент в настройках.',
    'Уведомления для этого приложения выключены. Сначала разрешите их в настройках телефона.',
    'Да, напомнить',
  ],
  fa: [
    '۳۰ روز دیگر: {{label}}', '۷ روز دیگر: {{label}}', 'فردا: {{label}}', 'امروز: {{label}}',
    'به‌زودی چیزی امضا می‌کنید؟ اول اسکنش کنید؛ ۳۰ ثانیه می‌تواند ماه‌ها در وقتتان صرفه‌جویی کند.',
    'ریزنوشته‌ها تله پنهان می‌کنند. امروز پیش از امضا یک قرارداد را بررسی کنید.',
    'یادآوری‌های ملایم',
    'اگر مدتی سر نزده باشید، حداکثر دو یادآوری آرام می‌فرستیم تا پیش از امضا قرارداد را بررسی کنید. هر زمان می‌توانید در تنظیمات خاموشش کنید.',
    'اعلان‌ها برای این برنامه خاموش است. ابتدا در تنظیمات گوشی اجازه دهید.',
    'بله، یادآوری کن',
  ],
  ja: [
    '30日後：{{label}}', '7日後：{{label}}', '明日：{{label}}', '今日：{{label}}',
    'もうすぐ署名しますか？先にスキャンを。30秒で数か月分の手間を防げることがあります。',
    '細かい文字には落とし穴があります。署名する前に、今日1件の契約書を確認しましょう。',
    'やさしいリマインダー',
    'しばらく開いていない場合に、署名前に契約書をスキャンするよう促す静かな通知を最大2回お送りします。設定でいつでもオフにできます。',
    'このアプリの通知はオフです。先に端末の設定で許可してください。',
    'はい、通知する',
  ],
  pt: [
    'Daqui a 30 dias: {{label}}', 'Daqui a 7 dias: {{label}}', 'Amanhã: {{label}}', 'Hoje: {{label}}',
    'Vai assinar algo em breve? Digitalize primeiro: 30 segundos podem poupar-lhe meses.',
    'As letras pequenas escondem armadilhas. Verifique um contrato hoje, antes de assinar.',
    'Lembretes discretos',
    'Até dois lembretes discretos se estiver ausente há algum tempo, para digitalizar um contrato antes de assinar. Pode desativá-los a qualquer momento nas Definições.',
    'As notificações estão desativadas para esta app. Permita-as primeiro nas definições do telemóvel.',
    'Sim, lembrar-me',
  ],
  nl: [
    'Over 30 dagen: {{label}}', 'Over 7 dagen: {{label}}', 'Morgen: {{label}}', 'Vandaag: {{label}}',
    'Binnenkort iets te tekenen? Scan het eerst: 30 seconden kunnen u maanden besparen.',
    'Kleine lettertjes verbergen valkuilen. Controleer vandaag één contract, vóór u tekent.',
    'Rustige herinneringen',
    'Maximaal twee discrete herinneringen als u een tijdje weg bent, om een contract te scannen voordat u tekent. U kunt dit altijd uitzetten in Instellingen.',
    'Meldingen staan uit voor deze app. Sta ze eerst toe in de telefooninstellingen.',
    'Ja, herinner mij',
  ],
};

module.exports = { D, LANGS, KEYS };

if (require.main === module) {
  let s = fs.readFileSync('i18n.js', 'utf8');
  const eol = s.includes('\r\n') ? '\r\n' : '\n';
  s = s.replace(/\r\n/g, '\n');
  if (/^\s+remLead30: /m.test(s)) {
    console.log('already wired');
    process.exit(0);
  }
  const hits = [...s.matchAll(/^(\s+)hSampleText: .*$/gm)];
  if (hits.length !== 13) throw new Error(`expected 13 hSampleText anchors, found ${hits.length}`);
  let out = '';
  let last = 0;
  hits.forEach((m, i) => {
    const vals = D[LANGS[i]];
    if (vals.length !== KEYS.length) throw new Error(`${LANGS[i]} has ${vals.length} values`);
    const lines = KEYS.map((k, j) => `${m[1]}${k}: ${JSON.stringify(vals[j])},`);
    out += s.slice(last, m.index + m[0].length) + '\n' + lines.join('\n');
    last = m.index + m[0].length;
  });
  out += s.slice(last);
  fs.writeFileSync('i18n.js', eol === '\r\n' ? out.replace(/\n/g, '\r\n') : out);
  console.log('wired Wave I keys x 13');
}
