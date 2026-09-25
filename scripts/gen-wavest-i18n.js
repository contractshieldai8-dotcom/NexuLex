// WAVE ST — Store hardening i18n (account deletion + subscription notice + AI output report).
// Run: node scripts/gen-wavest-i18n.js
const fs = require('fs');
const path = require('path');

const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const T = {};
const ui = (tr, en, de, fr, es, ar, it, zh, ru, fa, ja, pt, nl) => ({ tr, en, de, fr, es, ar, it, zh, ru, fa, ja, pt, nl });
const set = (key, byLang) => {
  T[key] = byLang;
};

// --- Account deletion ------------------------------------------------------------
set('accountDeleteTitle', ui('Hesabı sil', 'Delete account', 'Konto löschen', 'Supprimer le compte', 'Eliminar cuenta', 'حذف الحساب', 'Elimina account', '删除账户', 'Удалить аккаунт', 'حذف حساب', 'アカウントを削除', 'Excluir conta', 'Account verwijderen'));
set('accountDeleteHint', ui(
  'Hesabınızı ve buluttaki verilerinizi (analizler, paylaşım kodları, hatırlatıcılar, destek iletileri) kalıcı olarak silin.',
  'Permanently delete your account and cloud data (analyses, share codes, reminders, support messages).',
  'Konto und Cloud-Daten (Analysen, Freigabecodes, Erinnerungen, Support-Nachrichten) dauerhaft löschen.',
  'Supprimez définitivement votre compte et vos données cloud (analyses, codes de partage, rappels, messages au support).',
  'Elimina de forma permanente tu cuenta y tus datos en la nube (análisis, códigos compartidos, recordatorios, mensajes de soporte).',
  'احذف حسابك وبياناتك السحابية نهائيًا (التحليلات، رموز المشاركة، التذكيرات، رسائل الدعم).',
  'Elimina definitivamente il tuo account e i dati nel cloud (analisi, codici di condivisione, promemoria, messaggi al supporto).',
  '永久删除您的账户及云端数据（分析、分享码、提醒、支持消息）。',
  'Безвозвратно удалить аккаунт и данные в облаке (анализы, коды доступа, напоминания, сообщения в поддержку).',
  'حساب و داده‌های ابری خود (تحلیل‌ها، کدهای اشتراک، یادآورها، پیام‌های پشتیبانی) را برای همیشه حذف کنید.',
  'アカウントとクラウド上のデータ（分析、共有コード、リマインダー、サポートへのメッセージ）を完全に削除します。',
  'Exclua permanentemente sua conta e seus dados na nuvem (análises, códigos de compartilhamento, lembretes, mensagens de suporte).',
  'Verwijder uw account en clouddata (analyses, deelcodes, herinneringen, supportberichten) definitief.'
));
set('accountDeleteWarning', ui(
  'Verileriniz kalıcı olarak silinecek. Aktif bir App Store / Google Play aboneliği otomatik olarak İPTAL EDİLMEZ.',
  'Your data will be permanently deleted. An active App Store / Google Play subscription is NOT cancelled automatically.',
  'Ihre Daten werden dauerhaft gelöscht. Ein aktives App-Store-/Google-Play-Abo wird NICHT automatisch gekündigt.',
  'Vos données seront définitivement supprimées. Un abonnement App Store / Google Play actif n’est PAS résilié automatiquement.',
  'Tus datos se eliminarán de forma permanente. Una suscripción activa de App Store / Google Play NO se cancela automáticamente.',
  'سيتم حذف بياناتك نهائيًا. لا يتم إلغاء اشتراك App Store / Google Play النشط تلقائيًا.',
  'I tuoi dati verranno eliminati definitivamente. Un abbonamento App Store / Google Play attivo NON viene annullato automaticamente.',
  '您的数据将被永久删除。有效的 App Store / Google Play 订阅不会被自动取消。',
  'Ваши данные будут удалены безвозвратно. Активная подписка App Store / Google Play НЕ отменяется автоматически.',
  'داده‌های شما برای همیشه حذف می‌شود. اشتراک فعال App Store / Google Play به‌طور خودکار لغو نمی‌شود.',
  'データは完全に削除されます。有効な App Store / Google Play のサブスクリプションは自動では解約されません。',
  'Seus dados serão excluídos permanentemente. Uma assinatura ativa da App Store / Google Play NÃO é cancelada automaticamente.',
  'Uw gegevens worden definitief verwijderd. Een actief App Store-/Google Play-abonnement wordt NIET automatisch opgezegd.'
));
set('accountManageSubscription', ui('Aboneliği yönet', 'Manage subscription', 'Abo verwalten', 'Gérer l’abonnement', 'Gestionar suscripción', 'إدارة الاشتراك', 'Gestisci abbonamento', '管理订阅', 'Управлять подпиской', 'مدیریت اشتراک', 'サブスクリプションを管理', 'Gerenciar assinatura', 'Abonnement beheren'));
set('accountManageSubscriptionFailed', ui(
  'Abonelik ayarları açılamadı. Mağaza uygulamasından yönetebilirsiniz.',
  'Could not open subscription settings. You can manage it in the store app.',
  'Abo-Einstellungen konnten nicht geöffnet werden. Sie können es in der Store-App verwalten.',
  'Impossible d’ouvrir les réglages d’abonnement. Gérez-le depuis l’app du store.',
  'No se pudieron abrir los ajustes de suscripción. Puedes gestionarla desde la tienda.',
  'تعذّر فتح إعدادات الاشتراك. يمكنك إدارته من تطبيق المتجر.',
  'Impossibile aprire le impostazioni dell’abbonamento. Puoi gestirlo dall’app dello store.',
  '无法打开订阅设置。您可以在应用商店中管理。',
  'Не удалось открыть настройки подписки. Управляйте ею в приложении магазина.',
  'تنظیمات اشتراک باز نشد. می‌توانید آن را از برنامه فروشگاه مدیریت کنید.',
  'サブスクリプション設定を開けませんでした。ストアアプリから管理できます。',
  'Não foi possível abrir as configurações da assinatura. Gerencie pela loja.',
  'Abonnementsinstellingen konden niet worden geopend. Beheer het via de store-app.'
));
set('accountDeleteContinue', ui('Devam et', 'Continue', 'Weiter', 'Continuer', 'Continuar', 'متابعة', 'Continua', '继续', 'Продолжить', 'ادامه', '続ける', 'Continuar', 'Doorgaan'));
set('accountDeleteConfirmTitle', ui('Kalıcı olarak silinsin mi?', 'Delete permanently?', 'Endgültig löschen?', 'Supprimer définitivement ?', '¿Eliminar de forma permanente?', 'هل تريد الحذف نهائيًا؟', 'Eliminare definitivamente?', '确定永久删除？', 'Удалить безвозвратно?', 'برای همیشه حذف شود؟', '完全に削除しますか？', 'Excluir permanentemente?', 'Definitief verwijderen?'));
set('accountDeleteConfirmBody', ui(
  'Bu işlem geri alınamaz. Hesabınız, analizleriniz, paylaşım kodlarınız, hatırlatıcılarınız ve destek iletileriniz silinir; bu cihazdaki yerel veriler temizlenir.',
  'This cannot be undone. Your account, analyses, share codes, reminders and support messages are deleted, and local data on this device is cleared.',
  'Dies kann nicht rückgängig gemacht werden. Konto, Analysen, Freigabecodes, Erinnerungen und Support-Nachrichten werden gelöscht; lokale Daten auf diesem Gerät werden entfernt.',
  'Action irréversible. Votre compte, vos analyses, codes de partage, rappels et messages au support sont supprimés, et les données locales de cet appareil sont effacées.',
  'Esta acción no se puede deshacer. Se eliminan tu cuenta, análisis, códigos compartidos, recordatorios y mensajes de soporte, y se borran los datos locales de este dispositivo.',
  'لا يمكن التراجع عن ذلك. سيتم حذف حسابك وتحليلاتك ورموز المشاركة والتذكيرات ورسائل الدعم، ومسح البيانات المحلية على هذا الجهاز.',
  'L’operazione è irreversibile. Account, analisi, codici di condivisione, promemoria e messaggi al supporto vengono eliminati e i dati locali su questo dispositivo cancellati.',
  '此操作无法撤销。您的账户、分析、分享码、提醒和支持消息将被删除，本设备上的本地数据也会被清除。',
  'Это действие нельзя отменить. Аккаунт, анализы, коды доступа, напоминания и сообщения в поддержку будут удалены, локальные данные на устройстве — очищены.',
  'این کار برگشت‌پذیر نیست. حساب، تحلیل‌ها، کدهای اشتراک، یادآورها و پیام‌های پشتیبانی حذف و داده‌های محلی این دستگاه پاک می‌شود.',
  'この操作は取り消せません。アカウント、分析、共有コード、リマインダー、サポートへのメッセージが削除され、この端末のローカルデータも消去されます。',
  'Esta ação não pode ser desfeita. Sua conta, análises, códigos de compartilhamento, lembretes e mensagens de suporte serão excluídos, e os dados locais deste aparelho, apagados.',
  'Dit kan niet ongedaan worden gemaakt. Uw account, analyses, deelcodes, herinneringen en supportberichten worden verwijderd en lokale gegevens op dit apparaat gewist.'
));
set('accountDeleteConfirmCta', ui('Kalıcı olarak sil', 'Delete permanently', 'Endgültig löschen', 'Supprimer définitivement', 'Eliminar para siempre', 'احذف نهائيًا', 'Elimina definitivamente', '永久删除', 'Удалить навсегда', 'حذف دائمی', '完全に削除', 'Excluir permanentemente', 'Definitief verwijderen'));
set('accountDeleteDone', ui('Hesabınız silindi.', 'Your account has been deleted.', 'Ihr Konto wurde gelöscht.', 'Votre compte a été supprimé.', 'Tu cuenta se ha eliminado.', 'تم حذف حسابك.', 'Il tuo account è stato eliminato.', '您的账户已删除。', 'Ваш аккаунт удалён.', 'حساب شما حذف شد.', 'アカウントを削除しました。', 'Sua conta foi excluída.', 'Uw account is verwijderd.'));
set('accountDeleteFailed', ui(
  'Hesap silinemedi. Bağlantınızı kontrol edip tekrar deneyin; sorun sürerse Destek’e yazın.',
  'The account could not be deleted. Check your connection and try again; contact Support if it persists.',
  'Das Konto konnte nicht gelöscht werden. Verbindung prüfen und erneut versuchen; bei Bedarf Support kontaktieren.',
  'Le compte n’a pas pu être supprimé. Vérifiez la connexion et réessayez ; contactez le support si besoin.',
  'No se pudo eliminar la cuenta. Revisa la conexión e inténtalo de nuevo; si persiste, contacta con Soporte.',
  'تعذّر حذف الحساب. تحقّق من الاتصال وحاول مجددًا؛ وإن استمرت المشكلة فتواصل مع الدعم.',
  'Impossibile eliminare l’account. Controlla la connessione e riprova; se persiste, contatta il supporto.',
  '账户删除失败。请检查网络后重试；如仍失败，请联系支持。',
  'Не удалось удалить аккаунт. Проверьте соединение и повторите; если не поможет — напишите в поддержку.',
  'حساب حذف نشد. اتصال را بررسی و دوباره تلاش کنید؛ اگر ادامه داشت با پشتیبانی تماس بگیرید.',
  'アカウントを削除できませんでした。接続を確認して再試行してください。解決しない場合はサポートへご連絡ください。',
  'Não foi possível excluir a conta. Verifique a conexão e tente novamente; se persistir, fale com o Suporte.',
  'Het account kon niet worden verwijderd. Controleer de verbinding en probeer opnieuw; neem anders contact op met Support.'
));

// --- AI output report --------------------------------------------------------------
set('aiReportAction', ui('Yapay zekâ çıktısını bildir', 'Report AI output', 'KI-Ausgabe melden', 'Signaler la réponse IA', 'Reportar respuesta de IA', 'الإبلاغ عن مخرجات الذكاء الاصطناعي', 'Segnala output IA', '举报 AI 输出', 'Пожаловаться на ответ ИИ', 'گزارش خروجی هوش مصنوعی', 'AI の出力を報告', 'Denunciar resposta da IA', 'AI-uitvoer melden'));
set('aiReportTitle', ui('Yapay zekâ çıktısını bildir', 'Report AI output', 'KI-Ausgabe melden', 'Signaler une réponse de l’IA', 'Reportar una respuesta de IA', 'الإبلاغ عن مخرجات الذكاء الاصطناعي', 'Segnala un output dell’IA', '举报 AI 输出', 'Пожаловаться на ответ ИИ', 'گزارش خروجی هوش مصنوعی', 'AI の出力を報告', 'Denunciar uma resposta da IA', 'AI-uitvoer melden'));
set('aiReportHint', ui(
  'Bu çıktıda bir sorun mu var? Bildiriminiz ekibimizce incelenir.',
  'Something wrong with this output? Your report is reviewed by our team.',
  'Stimmt mit dieser Ausgabe etwas nicht? Ihre Meldung wird von unserem Team geprüft.',
  'Un problème avec cette réponse ? Votre signalement est examiné par notre équipe.',
  '¿Algo va mal con esta respuesta? Nuestro equipo revisará tu reporte.',
  'هل هناك مشكلة في هذه المخرجات؟ سيراجع فريقنا بلاغك.',
  'Qualcosa non va in questo output? Il nostro team esaminerà la segnalazione.',
  '此输出有问题吗？我们的团队会审核您的举报。',
  'Что-то не так с этим ответом? Наша команда рассмотрит жалобу.',
  'مشکلی در این خروجی هست؟ گزارش شما توسط تیم ما بررسی می‌شود.',
  'この出力に問題がありますか？報告は当社チームが確認します。',
  'Algo errado com esta resposta? Nossa equipe vai analisar sua denúncia.',
  'Klopt er iets niet met deze uitvoer? Ons team bekijkt uw melding.'
));
set('aiReportReasonIncorrect', ui('Yanlış veya yanıltıcı', 'Incorrect or misleading', 'Falsch oder irreführend', 'Incorrect ou trompeur', 'Incorrecta o engañosa', 'غير صحيح أو مضلّل', 'Errato o fuorviante', '错误或误导', 'Неверно или вводит в заблуждение', 'نادرست یا گمراه‌کننده', '誤り・誤解を招く', 'Incorreta ou enganosa', 'Onjuist of misleidend'));
set('aiReportReasonHarmful', ui('Zararlı veya tehlikeli', 'Harmful or dangerous', 'Schädlich oder gefährlich', 'Nuisible ou dangereux', 'Dañina o peligrosa', 'ضار أو خطير', 'Dannoso o pericoloso', '有害或危险', 'Вредно или опасно', 'مضر یا خطرناک', '有害・危険', 'Prejudicial ou perigosa', 'Schadelijk of gevaarlijk'));
set('aiReportReasonOffensive', ui('Saldırgan veya uygunsuz', 'Offensive or inappropriate', 'Beleidigend oder unangemessen', 'Offensant ou inapproprié', 'Ofensiva o inapropiada', 'مسيء أو غير لائق', 'Offensivo o inappropriato', '冒犯或不当', 'Оскорбительно или неуместно', 'توهین‌آمیز یا نامناسب', '不快・不適切', 'Ofensiva ou inadequada', 'Beledigend of ongepast'));
set('aiReportReasonOther', ui('Diğer', 'Other', 'Sonstiges', 'Autre', 'Otro', 'أخرى', 'Altro', '其他', 'Другое', 'سایر', 'その他', 'Outro', 'Anders'));
set('aiReportNotePlaceholder', ui('İsteğe bağlı not', 'Optional note', 'Optionale Notiz', 'Note facultative', 'Nota opcional', 'ملاحظة اختيارية', 'Nota facoltativa', '补充说明（可选）', 'Комментарий (необязательно)', 'یادداشت اختیاری', 'メモ（任意）', 'Observação opcional', 'Optionele notitie'));
set('aiReportIncludeContext', ui(
  'Sözleşme bağlamını ekle',
  'Include contract context',
  'Vertragskontext anhängen',
  'Joindre le contexte du contrat',
  'Incluir contexto del contrato',
  'تضمين سياق العقد',
  'Includi il contesto del contratto',
  '附上合同上下文',
  'Приложить контекст договора',
  'افزودن زمینه قرارداد',
  '契約のコンテキストを含める',
  'Incluir contexto do contrato',
  'Contractcontext meesturen'
));
set('aiReportIncludeContextHint', ui(
  'Kapalıyken metin gönderilmez. Açıkken ilgili metnin en fazla 2000 karakteri eklenir.',
  'Off: no text is sent. On: up to 2,000 characters of the related text are attached.',
  'Aus: kein Text wird gesendet. An: bis zu 2.000 Zeichen des betreffenden Texts werden angehängt.',
  'Désactivé : aucun texte n’est envoyé. Activé : jusqu’à 2 000 caractères du texte concerné sont joints.',
  'Desactivado: no se envía texto. Activado: se adjuntan hasta 2000 caracteres del texto relacionado.',
  'عند الإيقاف لا يُرسل أي نص. عند التشغيل يُرفق حتى 2000 حرف من النص المعني.',
  'Disattivato: nessun testo viene inviato. Attivato: si allegano fino a 2.000 caratteri del testo correlato.',
  '关闭：不发送任何文本。开启：附上相关文本的最多 2000 个字符。',
  'Выкл.: текст не отправляется. Вкл.: прикладывается до 2000 символов соответствующего текста.',
  'خاموش: هیچ متنی ارسال نمی‌شود. روشن: حداکثر ۲۰۰۰ نویسه از متن مربوط پیوست می‌شود.',
  'オフ：テキストは送信されません。オン：関連テキストを最大 2,000 文字添付します。',
  'Desligado: nenhum texto é enviado. Ligado: até 2.000 caracteres do texto relacionado são anexados.',
  'Uit: er wordt geen tekst verstuurd. Aan: maximaal 2.000 tekens van de betreffende tekst worden bijgevoegd.'
));
set('aiReportSubmit', ui('Bildir', 'Send report', 'Meldung senden', 'Envoyer', 'Enviar reporte', 'إرسال البلاغ', 'Invia segnalazione', '提交举报', 'Отправить', 'ارسال گزارش', '報告を送信', 'Enviar denúncia', 'Melding versturen'));
set('aiReportSent', ui('Teşekkürler, bildiriminiz alındı.', 'Thanks, your report was received.', 'Danke, Ihre Meldung ist eingegangen.', 'Merci, votre signalement a été reçu.', 'Gracias, hemos recibido tu reporte.', 'شكرًا، تم استلام بلاغك.', 'Grazie, segnalazione ricevuta.', '感谢，已收到您的举报。', 'Спасибо, жалоба получена.', 'متشکریم، گزارش شما دریافت شد.', 'ありがとうございます。報告を受け付けました。', 'Obrigado, sua denúncia foi recebida.', 'Bedankt, uw melding is ontvangen.'));
set('aiReportFailed', ui(
  'Bildirim gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin.',
  'The report could not be sent. Check your connection and try again.',
  'Die Meldung konnte nicht gesendet werden. Verbindung prüfen und erneut versuchen.',
  'Le signalement n’a pas pu être envoyé. Vérifiez la connexion et réessayez.',
  'No se pudo enviar el reporte. Revisa la conexión e inténtalo de nuevo.',
  'تعذّر إرسال البلاغ. تحقّق من الاتصال وحاول مجددًا.',
  'Impossibile inviare la segnalazione. Controlla la connessione e riprova.',
  '举报发送失败。请检查网络后重试。',
  'Не удалось отправить жалобу. Проверьте соединение и повторите.',
  'گزارش ارسال نشد. اتصال را بررسی و دوباره تلاش کنید.',
  '報告を送信できませんでした。接続を確認して再試行してください。',
  'Não foi possível enviar a denúncia. Verifique a conexão e tente novamente.',
  'De melding kon niet worden verstuurd. Controleer de verbinding en probeer opnieuw.'
));
set('errImagePickFailed', ui('Fotoğraflar seçilemedi. Lütfen tekrar deneyin.', 'Could not select photos. Please try again.', 'Fotos konnten nicht ausgewählt werden. Bitte versuchen Sie es erneut.', 'Impossible de sélectionner les photos. Veuillez réessayer.', 'No se pudieron seleccionar las fotos. Inténtalo de nuevo.', 'تعذّر اختيار الصور. يرجى المحاولة مرة أخرى.', 'Impossibile selezionare le foto. Riprova.', '无法选择照片，请重试。', 'Не удалось выбрать фотографии. Попробуйте ещё раз.', 'انتخاب عکس‌ها ممکن نشد. لطفاً دوباره تلاش کنید.', '写真を選択できませんでした。もう一度お試しください。', 'Não foi possível selecionar as fotos. Tente novamente.', 'Foto’s konden niet worden geselecteerd. Probeer het opnieuw.'));
set('aiReportPickReason', ui('Lütfen bir neden seçin.', 'Please choose a reason.', 'Bitte wählen Sie einen Grund.', 'Veuillez choisir un motif.', 'Elige un motivo.', 'يرجى اختيار سبب.', 'Scegli un motivo.', '请选择一个原因。', 'Выберите причину.', 'لطفاً یک دلیل انتخاب کنید.', '理由を選択してください。', 'Escolha um motivo.', 'Kies een reden.'));

const out = {};
for (const lang of langs) {
  out[lang] = {};
  for (const key of Object.keys(T)) {
    const value = T[key][lang];
    if (typeof value !== 'string' || !value.trim()) throw new Error(`missing ${lang}.${key}`);
    out[lang][key] = value;
  }
}
const file = `// WAVE ST — Store hardening (account deletion, subscription notice, AI output report). Same key set in all 13 languages.\n\nexport const WAVE_ST_I18N = ${JSON.stringify(out, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'i18n.wavest.js'), file, 'utf8');
console.log('Wrote i18n.wavest.js keys=', Object.keys(T).length, 'langs=', langs.length);
