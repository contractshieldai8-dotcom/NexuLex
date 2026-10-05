// WAVE J: adds the "Invite codes" section (13) to the privacy page of every language and moves Contact to 14 (idempotent).
// Run once:  node scripts/wire-wavej-legal.js   then   node scripts/gen-legal-web.js
const fs = require('fs');
const path = require('path');

const T = {
  en: ['Invite codes', 'If you are signed in, NexuLex AI gives you a short invite code. When a friend enters it, we store the two account IDs, the friend’s device identifier (the one used for the free-analysis quota) and the date, only to grant the bonus analyses and to prevent abuse. Nothing about your contracts is shared. If you delete your account, your code and its account links are deleted; a record without any account ID may remain so the same device cannot claim the bonus again.'],
  tr: ['Davet kodları', 'Giriş yaptıysanız NexuLex AI size kısa bir davet kodu verir. Bir arkadaşınız kodu girdiğinde, yalnızca bonus analizleri vermek ve kötüye kullanımı önlemek amacıyla iki hesap kimliğini, arkadaşın cihaz tanımlayıcısını (ücretsiz analiz hakkı için kullanılan) ve tarihi saklarız. Sözleşmelerinize dair hiçbir şey paylaşılmaz. Hesabınızı silerseniz kodunuz ve hesap bağlantıları silinir; aynı cihazın bonusu yeniden almasını önlemek için hesap kimliği içermeyen bir kayıt kalabilir.'],
  de: ['Einladungscodes', 'Wenn Sie angemeldet sind, erhalten Sie von NexuLex AI einen kurzen Einladungscode. Gibt ein Freund ihn ein, speichern wir die beiden Konto-IDs, die Gerätekennung des Freundes (dieselbe wie für das Kontingent kostenloser Analysen) und das Datum – ausschließlich, um die Bonus-Analysen zu gewähren und Missbrauch zu verhindern. Über Ihre Verträge wird nichts geteilt. Wenn Sie Ihr Konto löschen, werden Ihr Code und dessen Kontoverknüpfungen gelöscht; ein Eintrag ohne Konto-ID kann bestehen bleiben, damit dasselbe Gerät den Bonus nicht erneut erhält.'],
  fr: ['Codes d’invitation', 'Si vous êtes connecté, NexuLex AI vous attribue un court code d’invitation. Lorsqu’un ami le saisit, nous enregistrons les deux identifiants de compte, l’identifiant d’appareil de l’ami (celui utilisé pour le quota d’analyses gratuites) et la date, uniquement pour accorder les analyses bonus et prévenir les abus. Rien sur vos contrats n’est partagé. Si vous supprimez votre compte, votre code et ses liens avec les comptes sont supprimés ; un enregistrement sans identifiant de compte peut subsister afin que le même appareil ne puisse pas réclamer à nouveau le bonus.'],
  es: ['Códigos de invitación', 'Si has iniciado sesión, NexuLex AI te asigna un código de invitación corto. Cuando un amigo lo introduce, guardamos los dos ID de cuenta, el identificador de dispositivo del amigo (el mismo que se usa para la cuota de análisis gratuitos) y la fecha, solo para conceder los análisis extra y evitar abusos. No se comparte nada sobre tus contratos. Si borras tu cuenta, se eliminan tu código y sus vínculos con cuentas; puede conservarse un registro sin ningún ID de cuenta para que el mismo dispositivo no pueda reclamar de nuevo el bonus.'],
  ar: ['رموز الدعوة', 'إذا كنت مسجّل الدخول، يمنحك NexuLex AI رمز دعوة قصيرًا. عندما يدخله صديق، نخزّن معرّفي الحسابين ومعرّف جهاز الصديق (المستخدم لحصة التحليلات المجانية) والتاريخ، وذلك فقط لمنح التحليلات الإضافية ومنع إساءة الاستخدام. لا تتم مشاركة أي شيء عن عقودك. إذا حذفت حسابك فسيُحذف رمزك وروابطه بالحسابات؛ وقد يبقى سجل لا يحتوي على أي معرّف حساب حتى لا يتمكن الجهاز نفسه من المطالبة بالمكافأة مرة أخرى.'],
  it: ['Codici invito', 'Se hai effettuato l’accesso, NexuLex AI ti assegna un breve codice invito. Quando un amico lo inserisce, conserviamo i due ID account, l’identificativo del dispositivo dell’amico (lo stesso usato per la quota di analisi gratuite) e la data, solo per assegnare le analisi bonus e prevenire abusi. Non viene condiviso nulla sui tuoi contratti. Se elimini l’account, il tuo codice e i relativi collegamenti agli account vengono eliminati; può restare un record privo di ID account affinché lo stesso dispositivo non possa richiedere di nuovo il bonus.'],
  zh: ['邀请码', '登录后，NexuLex AI 会为您提供一个简短的邀请码。好友输入该邀请码后，我们会保存双方的账户 ID、好友的设备标识符（即用于免费分析额度的那个）以及日期，仅用于发放奖励分析和防止滥用。我们不会分享任何与您合同有关的内容。如果您删除账户，您的邀请码及其账户关联会被删除；为防止同一设备再次领取奖励，可能会保留一条不含任何账户 ID 的记录。'],
  ru: ['Коды приглашения', 'Если вы вошли в аккаунт, NexuLex AI выдаёт вам короткий код приглашения. Когда друг вводит его, мы сохраняем идентификаторы двух аккаунтов, идентификатор устройства друга (тот же, что используется для лимита бесплатных анализов) и дату — только чтобы начислить бонусные анализы и предотвращать злоупотребления. Ничего о ваших договорах не передаётся. Если вы удалите аккаунт, ваш код и его связи с аккаунтами будут удалены; может остаться запись без идентификатора аккаунта, чтобы то же устройство не могло получить бонус повторно.'],
  fa: ['کدهای دعوت', 'اگر وارد حساب شده باشید، NexuLex AI یک کد دعوت کوتاه به شما می‌دهد. وقتی دوستی آن را وارد می‌کند، شناسه دو حساب، شناسه دستگاه دوست (همان که برای سهمیه تحلیل رایگان استفاده می‌شود) و تاریخ را ذخیره می‌کنیم؛ فقط برای اعطای تحلیل‌های جایزه و جلوگیری از سوءاستفاده. هیچ چیزی درباره قراردادهای شما به اشتراک گذاشته نمی‌شود. اگر حساب خود را حذف کنید، کد شما و پیوندهای آن با حساب‌ها حذف می‌شود؛ ممکن است سابقه‌ای بدون هیچ شناسه حساب باقی بماند تا همان دستگاه نتواند دوباره جایزه را دریافت کند.'],
  ja: ['招待コード', 'ログインしている場合、NexuLex AI は短い招待コードを発行します。友だちがそのコードを入力すると、ボーナス分析の付与と不正利用の防止のためだけに、双方のアカウントID、友だちの端末識別子（無料分析の回数管理に使うもの）、および日付を保存します。契約書に関する情報は一切共有されません。アカウントを削除すると、あなたのコードとアカウントとの関連付けは削除されます。同じ端末が再びボーナスを受け取れないよう、アカウントIDを含まない記録が残る場合があります。'],
  pt: ['Códigos de convite', 'Se tiver sessão iniciada, o NexuLex AI atribui-lhe um código de convite curto. Quando um amigo o introduz, guardamos os dois IDs de conta, o identificador do dispositivo do amigo (o mesmo usado para a quota de análises gratuitas) e a data, apenas para conceder as análises de bónus e evitar abusos. Nada sobre os seus contratos é partilhado. Se eliminar a conta, o seu código e as respetivas ligações a contas são eliminados; pode permanecer um registo sem qualquer ID de conta para que o mesmo dispositivo não possa reclamar novamente o bónus.'],
  nl: ['Uitnodigingscodes', 'Als u bent ingelogd, geeft NexuLex AI u een korte uitnodigingscode. Wanneer een vriend die invoert, slaan we de twee account-ID’s, de apparaat-ID van de vriend (dezelfde als voor het quotum gratis analyses) en de datum op, uitsluitend om de bonusanalyses toe te kennen en misbruik te voorkomen. Er wordt niets over uw contracten gedeeld. Als u uw account verwijdert, worden uw code en de koppelingen met accounts verwijderd; er kan een record zonder account-ID blijven bestaan zodat hetzelfde apparaat de bonus niet opnieuw kan claimen.'],
};

const LANGS = Object.keys(T);
let changed = 0;
for (const lang of LANGS) {
  const file = path.join(__dirname, 'l10n', `legalweb.${lang}.js`);
  const raw = fs.readFileSync(file, 'utf8');
  if (raw.includes('data-sec="invite"')) continue;
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const s = raw.replace(/\r\n/g, '\n');
  const re = /<h2>13\. ([^<]*)<\/h2>/; // first match = privacy page (terms comes later)
  const m = s.match(re);
  if (!m) throw new Error(`${lang}: contact heading not found`);
  const [title, body] = T[lang];
  const block = `<h2 data-sec="invite">13. ${title}</h2>\n<p>${body}</p>\n<h2>14. ${m[1]}</h2>`;
  const out = s.replace(re, () => block);
  fs.writeFileSync(file, eol === '\r\n' ? out.replace(/\n/g, '\r\n') : out);
  changed += 1;
}
console.log(changed ? `Added invite section to ${changed} languages` : 'already wired');
