// WAVE L one-shot: prepend the "what is new" sentence (sample, quiet reminders, invite, anonymous reports)
// to whatsNew in every scripts/l10n/store.<lang>.js. Idempotent (skips if the marker is already there).
const fs = require('fs');
const path = require('path');

const NEWS = {
  tr: 'Yeni: tek dokunuşla örnek sözleşmeyi deneyin, imzadan önce isteğe bağlı sessiz hatırlatmalar açın, davet kodunuzla bir arkadaşınızı çağırın; ikinize de bir ek ücretsiz analiz verilir. Anonim kullanım raporlarını Ayarlar’dan kapatabilirsiniz.',
  en: 'New: try a built-in sample contract in one tap, opt in to quiet reminders before you sign, and invite a friend with your code; you both get one extra free analysis. Anonymous usage reports can be switched off in Settings.',
  de: 'Neu: Mustervertrag mit einem Tipp testen, stille Erinnerungen vor der Unterschrift freiwillig aktivieren und mit Ihrem Code einen Freund einladen; beide erhalten eine zusätzliche kostenlose Analyse. Anonyme Nutzungsberichte lassen sich in den Einstellungen abschalten.',
  fr: 'Nouveau : essayez un contrat d’exemple en un geste, activez si vous le souhaitez des rappels discrets avant la signature et invitez un ami avec votre code ; chacun gagne une analyse gratuite en plus. Les rapports d’usage anonymes se désactivent dans les Réglages.',
  es: 'Novedades: prueba un contrato de ejemplo con un toque, activa si quieres recordatorios discretos antes de firmar e invita a un amigo con tu código; ambos obtenéis un análisis gratuito extra. Los informes de uso anónimos se desactivan en Ajustes.',
  ar: 'جديد: جرّب عقدًا نموذجيًا بلمسة واحدة، وفعّل اختياريًا تذكيرات هادئة قبل التوقيع، وادعُ صديقًا بكودك فيحصل كلاكما على تحليل مجاني إضافي. يمكن إيقاف تقارير الاستخدام المجهولة من الإعدادات.',
  it: 'Novità: prova un contratto di esempio con un tocco, attiva se vuoi promemoria discreti prima della firma e invita un amico con il tuo codice; entrambi ottenete un’analisi gratuita in più. I report d’uso anonimi si disattivano nelle Impostazioni.',
  zh: '新增：一键体验示例合同，可选开启签署前的静默提醒，用你的邀请码邀请好友，双方各得一次额外免费分析。匿名使用报告可在设置中关闭。',
  ru: 'Новое: пример договора в одно касание, необязательные тихие напоминания перед подписанием и приглашение друга по вашему коду; каждый получает ещё один бесплатный анализ. Анонимные отчёты об использовании можно отключить в настройках.',
  fa: 'تازه: قرارداد نمونه را با یک لمس امتحان کنید، یادآورهای آرام پیش از امضا را اختیاری روشن کنید و با کد خود دوستی را دعوت کنید؛ هر دو یک تحلیل رایگان اضافه می‌گیرید. گزارش‌های ناشناس استفاده را می‌توانید از تنظیمات خاموش کنید.',
  ja: '新機能：ワンタップでサンプル契約を試せ、署名前の静かなリマインダーを任意でオンにでき、招待コードで友人を招くと双方に無料の分析が1回ずつ追加されます。匿名の利用レポートは設定でオフにできます。',
  pt: 'Novidade: experimente um contrato de exemplo com um toque, ative se quiser lembretes discretos antes de assinar e convide um amigo com o seu código; ambos ganham uma análise gratuita extra. Os relatórios de uso anónimos podem ser desligados nas Definições.',
  nl: 'Nieuw: probeer met één tik een voorbeeldcontract, zet desgewenst stille herinneringen aan vóór het tekenen en nodig een vriend uit met uw code; jullie krijgen allebei één extra gratis analyse. Anonieme gebruiksrapporten zet u uit bij Instellingen.',
};

let changed = 0;
for (const [lang, text] of Object.entries(NEWS)) {
  const file = path.join(__dirname, 'l10n', `store.${lang}.js`);
  const src = fs.readFileSync(file, 'utf8');
  if (src.includes(text)) continue;
  const marker = "  whatsNew: '";
  if (!src.includes(marker)) throw new Error(`${lang}: whatsNew marker missing`);
  fs.writeFileSync(file, src.replace(marker, `${marker}${text} `), 'utf8');
  changed += 1;
}
console.log('wavel store whatsNew updated:', changed);
