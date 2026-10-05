// WAVE K: one-time "did a friend invite you?" offer texts for the 13 languages (idempotent).
// Run once:  node scripts/wire-wavek-i18n.js
const fs = require('fs');

const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const KEYS = ['refAskBody', 'refAskYes'];

const D = {
  tr: ['Bir arkadaşınız sizi davet ettiyse kodunu Ayarlar’a girin; ikiniz de 1 ücretsiz analiz kazanırsınız.', 'Kodu gir'],
  en: ['If a friend invited you, enter their code in Settings and you both get 1 free analysis.', 'Enter code'],
  de: ['Wenn ein Freund Sie eingeladen hat, geben Sie seinen Code in den Einstellungen ein – Sie beide erhalten 1 kostenlose Analyse.', 'Code eingeben'],
  fr: ['Si un ami vous a invité, saisissez son code dans les Réglages : vous gagnez chacun 1 analyse gratuite.', 'Saisir le code'],
  es: ['Si un amigo te invitó, introduce su código en Ajustes y los dos recibís 1 análisis gratis.', 'Introducir código'],
  ar: ['إذا دعاك صديق، فأدخل رمزه في الإعدادات ليحصل كلاكما على تحليل مجاني واحد.', 'أدخل الرمز'],
  it: ['Se un amico ti ha invitato, inserisci il suo codice in Impostazioni: riceverete entrambi 1 analisi gratuita.', 'Inserisci il codice'],
  zh: ['如果有好友邀请了你，请在“设置”中输入其邀请码，你们都能获得 1 次免费分析。', '输入邀请码'],
  ru: ['Если вас пригласил друг, введите его код в Настройках, и вы оба получите по 1 бесплатному анализу.', 'Ввести код'],
  fa: ['اگر دوستی شما را دعوت کرده است، کد او را در تنظیمات وارد کنید تا هر دوی شما ۱ تحلیل رایگان بگیرید.', 'وارد کردن کد'],
  ja: ['友だちから招待された場合は、設定で招待コードを入力してください。お互いに無料分析が1回もらえます。', 'コードを入力'],
  pt: ['Se um amigo o convidou, introduza o código dele em Definições e ambos recebem 1 análise grátis.', 'Introduzir código'],
  nl: ['Als een vriend u heeft uitgenodigd, voer dan zijn code in bij Instellingen en jullie krijgen allebei 1 gratis analyse.', 'Code invoeren'],
};

module.exports = { D, LANGS, KEYS };

if (require.main === module) {
  let s = fs.readFileSync('i18n.js', 'utf8');
  const eol = s.includes('\r\n') ? '\r\n' : '\n';
  s = s.replace(/\r\n/g, '\n');
  if (/^\s+refAskBody: /m.test(s)) {
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
  console.log('wired Wave K keys x 13');
}
