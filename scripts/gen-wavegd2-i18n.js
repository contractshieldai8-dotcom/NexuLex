// WAVE GD.2 — Guide workflows for every feature, deep-link steps, What's new, 8 FAQ chips.
// Run: node scripts/gen-wavegd2-i18n.js
const fs = require('fs');
const path = require('path');

const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];

const SIMPLE_KEYS = [
  'guideWhatsNew', 'guideItemsHeader', 'guideStepGo', 'guideNotAvailableHere',
  'guideFaqCurrency', 'guideFaqLocked', 'guideFaqDocuments', 'guideFaqDelete', 'guideFaqReport',
  'guideNewScenarios', 'guideNewKeyboard', 'guideNewCalculators', 'guideNewDocuments', 'guideNewJurisdiction', 'guideNewGuide',
  'guideStepSettingsSecurity', 'guideStepPlaybookApply',
  'guideCtaFlipSide', 'guideCtaAnswer', 'guideCtaShare', 'guideCtaExport', 'guideCtaReminder', 'guideCtaOpenCode',
  'guideCtaRevoke', 'guideCtaStatus', 'guideCtaDelete', 'guideCtaVoice', 'guideCtaListen', 'guideCtaReport',
];

/** Flow code → [title, hint, intro, chip, step1, step2, step3]. */
const FLOWS = ['Party', 'Offers', 'Scenarios', 'Calc', 'Docs', 'Juris', 'Trap', 'Share', 'Seats', 'History', 'Voice', 'Report', 'Account'];

const S = {};
const F = {};

// ------------------------------------------------------------------ EN
S.en = [
  "What's new", 'Available here: {{count}}', 'Opens this part of the app', 'This tool is not offered for the selected country.',
  'Why no currency?', 'Why is a tool locked?', 'How do I write a letter?', 'How do I delete my account?', 'How do I report an AI answer?',
  'Scenario roadmaps in 13 languages', 'Forms stay above the keyboard', '5 universal calculators', '7 universal letters', 'Country-aware tools and currency', 'Guide steps now open the right screen',
  'Change your password under Security; it needs at least 6 characters.', 'Your saved rules are checked in every new analysis.',
  'Flip side', 'Answer questions', 'Share', 'Copy / DOCX', 'Set reminder', 'Enter code',
  'Revoke', 'Status', 'Delete', 'Microphone', 'Listen', 'Report',
];
F.en = {
  Party: ['Choose your side', 'Protect the right party', 'NexuLex reads the contract from the side you choose, such as tenant or landlord, and flags what hurts that side.', 'Your side', 'In Analyze, pick the party you are before starting.', 'Start the analysis; the result shows which side it protects.', "Picked the wrong side? Use the flip button on the result to see the other side's view."],
  Offers: ['Counter-offers', 'Balanced, Shield or Fast', 'For risky clauses NexuLex can suggest up to three counter-offers: Balanced, Shield (most protective) and Fast (easiest to accept).', 'Offers', 'Open a risky clause in your result and look for the offer chips.', 'Choose Shield when you have leverage and Fast when you need a quick deal.', 'Copy the ready-to-send message; it uses the offer you picked for each clause.'],
  Scenarios: ['Scenario roadmaps', 'Step-by-step plans for common problems', 'Guided roadmaps for situations like leaving a job, rent problems or unpaid invoices. They list steps and documents to check; they are not legal advice.', 'Scenarios', 'Open the Advisor tab and pick a scenario card.', 'Answer a few short questions to get your roadmap.', 'Where it fits, the roadmap offers a matching letter.'],
  Calc: ['Calculators', 'Deadlines, pro-rata, installments and more', 'Quick calculations that run on your phone: deadline dates, pro-rata amounts, percentage changes, installment plans and more.', 'Calculators', 'Open the Advisor tab and pick a calculator.', 'A lock marked “Awaiting verification” means the tool is country-specific and not yet reviewed for your country.', 'Share the result; the disclaimer is always added last.'],
  Docs: ['Documents', 'Guided letters with blanks', 'Answer a few questions and get a clean letter. Anything you skip stays as a visible [ … ] blank; nothing is invented.', 'Documents', 'Open the Advisor tab and pick a document.', 'Fill in the fields; the last field stays reachable above the keyboard.', 'With Pro, copy the full text, export DOCX or improve the wording.'],
  Juris: ['Country and currency', 'Why tools and currency change', 'The country you select decides which country-specific tools appear and which currency amounts use. With Auto and no clear country, amounts have no currency.', 'Country', 'Choose a country with the selector in the Advisor tab.', 'The app language matters too: Auto with Turkish uses Turkey; Auto with other languages shows universal tools.', 'Items awaiting verification open once they are reviewed for that country.'],
  Trap: ['Deadline radar', 'Never miss a notice period', 'After an analysis, dates and notice periods found in the contract appear in the deadline radar.', 'Deadlines', 'Analyse a contract that contains dates or notice periods.', 'Set a reminder so you are notified before a deadline passes.', 'No notifications? Export the dates to your calendar app.'],
  Share: ['Share a brief', 'Read-only summary by link or code', 'Send someone a read-only summary of an analysis. The link expires and the original contract is not shared.', 'Share', 'Open History or a finished result and choose Share.', 'Create the link and send it; the recipient sees the summary only.', 'Received a code? Enter it in History to open the brief.'],
  Seats: ['Advisor seats', 'Give your advisor read-only access', 'Pro can seat up to 2 advisors and 1 household member who read the briefs you share. The original contract stays private.', 'Seats', 'Open Settings and find the advisor seat card.', 'Create a seat code and send it; they paste it in their Settings.', 'You can revoke a seat at any time.'],
  History: ['History', 'Find past analyses', 'Your saved analyses live in History, with their status and share options.', 'History', 'Open the History tab.', 'Mark each contract as draft, negotiating or signed.', 'Delete an analysis you no longer need.'],
  Voice: ['Voice', 'Speak instead of typing', 'Dictate your question with the microphone and have answers read aloud.', 'Voice', 'Tap the microphone in the Advisor tab and speak.', 'Tap the speaker icon on an answer to listen to it.', 'If the microphone does nothing, allow microphone access in your phone settings.'],
  Report: ['Report an AI answer', 'Flag wrong or unsafe output', 'AI can make mistakes. If an answer looks wrong or unsafe, report it so we can review it.', 'Report', 'Open the Advisor tab and find the answer.', 'Tap Report on the answer and say what is wrong.', 'For anything else, write to Support in Settings.'],
  Account: ['Account and privacy', 'Privacy, password, account deletion', 'Read the privacy policy and terms, change your password or delete your account.', 'Account', 'Open the privacy policy and terms in Settings.', 'Change your password under Security.', 'Delete account removes your account permanently; this cannot be undone.'],
};

// ------------------------------------------------------------------ TR
S.tr = [
  'Yenilikler', 'Burada kullanılabilir: {{count}}', 'Uygulamanın bu bölümünü açar', 'Bu araç seçili ülke için sunulmuyor.',
  'Para birimi neden yok?', 'Araç neden kilitli?', 'Nasıl mektup yazarım?', 'Hesabımı nasıl silerim?', 'Yapay zekâ yanıtını nasıl bildiririm?',
  '13 dilde senaryo yol haritaları', 'Formlar klavyenin üstünde kalıyor', '5 evrensel hesaplayıcı', '7 evrensel mektup', 'Ülkeye duyarlı araçlar ve para birimi', 'Rehber adımları artık doğru ekranı açıyor',
  'Şifrenizi Güvenlik bölümünden değiştirin; en az 6 karakter olmalı.', 'Kaydettiğiniz kurallar her yeni analizde kontrol edilir.',
  'Tarafı değiştir', 'Soruları yanıtla', 'Paylaş', 'Kopyala / DOCX', 'Hatırlatıcı kur', 'Kodu gir',
  'İptal et', 'Durum', 'Sil', 'Mikrofon', 'Dinle', 'Bildir',
];
F.tr = {
  Party: ['Tarafınızı seçin', 'Doğru tarafı koruyun', 'NexuLex sözleşmeyi seçtiğiniz taraftan (ör. kiracı veya ev sahibi) okur ve o tarafın aleyhine olanları işaretler.', 'Tarafınız', 'Analiz ekranında başlamadan önce hangi taraf olduğunuzu seçin.', 'Analizi başlatın; sonuç hangi tarafı koruduğunu gösterir.', 'Yanlış taraf mı seçtiniz? Sonuçtaki değiştir düğmesiyle diğer tarafın bakışını görün.'],
  Offers: ['Karşı teklifler', 'Dengeli, Kalkan veya Hızlı', 'Riskli maddeler için NexuLex en fazla üç karşı teklif önerebilir: Dengeli, Kalkan (en koruyucu) ve Hızlı (kabulü en kolay).', 'Teklifler', 'Sonuçta riskli bir maddeyi açın ve teklif çiplerine bakın.', 'Pazarlık gücünüz varsa Kalkan, hızlı anlaşma gerekiyorsa Hızlı seçin.', 'Gönderime hazır mesajı kopyalayın; her madde için seçtiğiniz teklifi kullanır.'],
  Scenarios: ['Senaryo yol haritaları', 'Sık sorunlar için adım adım plan', 'İşten ayrılma, kira sorunları veya ödenmeyen faturalar gibi durumlar için rehberli yol haritaları. Kontrol edilecek adım ve belgeleri listeler; hukuki danışmanlık değildir.', 'Senaryolar', 'Danışman sekmesini açıp bir senaryo kartı seçin.', 'Yol haritanız için birkaç kısa soruyu yanıtlayın.', 'Uygun olduğunda yol haritası eşleşen bir mektup önerir.'],
  Calc: ['Hesaplayıcılar', 'Süreler, kıst tutar, taksitler ve fazlası', 'Telefonunuzda çalışan hızlı hesaplamalar: son gün, kıst tutar, yüzde değişim, taksit planı ve daha fazlası.', 'Hesaplayıcılar', 'Danışman sekmesini açıp bir hesaplayıcı seçin.', '“Doğrulama bekliyor” kilidi, aracın ülkeye özel olduğunu ve ülkeniz için henüz incelenmediğini gösterir.', 'Sonucu paylaşın; sorumluluk notu her zaman en sona eklenir.'],
  Docs: ['Belgeler', 'Boşluklu rehberli mektuplar', 'Birkaç soruyu yanıtlayın ve düzgün bir mektup alın. Atladığınız her şey görünür bir [ … ] boşluk olarak kalır; hiçbir şey uydurulmaz.', 'Belgeler', 'Danışman sekmesini açıp bir belge seçin.', 'Alanları doldurun; son alan klavyenin üstünde erişilebilir kalır.', 'Pro ile tam metni kopyalayın, DOCX dışa aktarın veya ifadeyi iyileştirin.'],
  Juris: ['Ülke ve para birimi', 'Araçlar ve para birimi neden değişir', 'Seçtiğiniz ülke, hangi ülkeye özel araçların görüneceğini ve tutarların para birimini belirler. Otomatik seçiliyken ülke belirsizse tutarlarda para birimi olmaz.', 'Ülke', 'Danışman sekmesindeki seçiciden bir ülke seçin.', 'Uygulama dili de önemlidir: Otomatik + Türkçe Türkiye’yi kullanır; Otomatik + diğer diller evrensel araçları gösterir.', 'Doğrulama bekleyen öğeler o ülke için incelendikten sonra açılır.'],
  Trap: ['Süre radarı', 'İhbar süresini kaçırmayın', 'Analizden sonra sözleşmede bulunan tarihler ve ihbar süreleri süre radarında görünür.', 'Süreler', 'Tarih veya ihbar süresi içeren bir sözleşmeyi analiz edin.', 'Süre dolmadan bildirim almak için hatırlatıcı kurun.', 'Bildirim yok mu? Tarihleri takvim uygulamanıza aktarın.'],
  Share: ['Brief paylaşın', 'Bağlantı veya kodla salt okunur özet', 'Bir analizin salt okunur özetini başkasına gönderin. Bağlantının süresi dolar ve orijinal sözleşme paylaşılmaz.', 'Paylaş', 'Geçmiş’i veya biten bir sonucu açıp Paylaş’ı seçin.', 'Bağlantıyı oluşturup gönderin; alıcı yalnızca özeti görür.', 'Kod mu aldınız? Geçmiş’te kodu girerek brief’i açın.'],
  Seats: ['Danışman koltukları', 'Danışmanınıza salt okunur erişim verin', 'Pro, paylaştığınız briefleri okuyan en fazla 2 danışman ve 1 hane üyesi ekleyebilir. Orijinal sözleşme gizli kalır.', 'Koltuklar', 'Ayarlar’ı açıp danışman koltuğu kartını bulun.', 'Bir koltuk kodu oluşturup gönderin; kişi kodu kendi Ayarlar’ına yapıştırır.', 'Bir koltuğu istediğiniz zaman iptal edebilirsiniz.'],
  History: ['Geçmiş', 'Eski analizleri bulun', 'Kaydedilen analizleriniz, durumları ve paylaşım seçenekleriyle Geçmiş’te durur.', 'Geçmiş', 'Geçmiş sekmesini açın.', 'Her sözleşmeyi taslak, müzakerede veya imzalandı olarak işaretleyin.', 'Artık gerekmeyen bir analizi silin.'],
  Voice: ['Ses', 'Yazmak yerine konuşun', 'Sorunuzu mikrofonla söyleyin ve yanıtları sesli dinleyin.', 'Ses', 'Danışman sekmesinde mikrofona dokunup konuşun.', 'Bir yanıtı dinlemek için hoparlör simgesine dokunun.', 'Mikrofon çalışmıyorsa telefon ayarlarından mikrofon izni verin.'],
  Report: ['Yapay zekâ yanıtını bildirin', 'Hatalı veya güvensiz çıktıyı işaretleyin', 'Yapay zekâ hata yapabilir. Bir yanıt yanlış veya güvensiz görünüyorsa incelememiz için bildirin.', 'Bildir', 'Danışman sekmesini açıp yanıtı bulun.', 'Yanıttaki Bildir’e dokunun ve sorunu yazın.', 'Diğer her konu için Ayarlar’daki Destek’e yazın.'],
  Account: ['Hesap ve gizlilik', 'Gizlilik, şifre, hesap silme', 'Gizlilik politikasını ve koşulları okuyun, şifrenizi değiştirin veya hesabınızı silin.', 'Hesap', 'Ayarlar’dan gizlilik politikasını ve koşulları açın.', 'Şifrenizi Güvenlik bölümünden değiştirin.', 'Hesabı sil, hesabınızı kalıcı olarak kaldırır; geri alınamaz.'],
};

// ------------------------------------------------------------------ DE
S.de = [
  'Neuigkeiten', 'Hier verfügbar: {{count}}', 'Öffnet diesen Bereich der App', 'Dieses Werkzeug wird für das gewählte Land nicht angeboten.',
  'Warum keine Währung?', 'Warum ist ein Werkzeug gesperrt?', 'Wie schreibe ich einen Brief?', 'Wie lösche ich mein Konto?', 'Wie melde ich eine KI-Antwort?',
  'Szenario-Fahrpläne in 13 Sprachen', 'Formulare bleiben über der Tastatur', '5 universelle Rechner', '7 universelle Briefe', 'Länderbezogene Werkzeuge und Währung', 'Leitfaden-Schritte öffnen jetzt den richtigen Bildschirm',
  'Ändern Sie Ihr Passwort unter Sicherheit; es braucht mindestens 6 Zeichen.', 'Ihre gespeicherten Regeln werden bei jeder neuen Analyse geprüft.',
  'Seite wechseln', 'Fragen beantworten', 'Teilen', 'Kopieren / DOCX', 'Erinnerung setzen', 'Code eingeben',
  'Widerrufen', 'Status', 'Löschen', 'Mikrofon', 'Anhören', 'Melden',
];
F.de = {
  Party: ['Ihre Seite wählen', 'Die richtige Partei schützen', 'NexuLex liest den Vertrag aus der von Ihnen gewählten Sicht, etwa Mieter oder Vermieter, und markiert, was dieser Seite schadet.', 'Ihre Seite', 'Wählen Sie unter Analyse vor dem Start, welche Partei Sie sind.', 'Starten Sie die Analyse; das Ergebnis zeigt, welche Seite geschützt wird.', 'Falsche Seite gewählt? Mit dem Wechsel-Button im Ergebnis sehen Sie die Gegenseite.'],
  Offers: ['Gegenangebote', 'Ausgewogen, Schutz oder Schnell', 'Für riskante Klauseln schlägt NexuLex bis zu drei Gegenangebote vor: Ausgewogen, Schutz (am stärksten schützend) und Schnell (am leichtesten annehmbar).', 'Angebote', 'Öffnen Sie im Ergebnis eine riskante Klausel und achten Sie auf die Angebots-Chips.', 'Wählen Sie Schutz bei guter Verhandlungsposition und Schnell für eine rasche Einigung.', 'Kopieren Sie die versandfertige Nachricht; sie nutzt das gewählte Angebot je Klausel.'],
  Scenarios: ['Szenario-Fahrpläne', 'Schritt-für-Schritt-Pläne für häufige Probleme', 'Geführte Fahrpläne für Situationen wie Jobwechsel, Mietprobleme oder offene Rechnungen. Sie listen Schritte und Unterlagen zur Prüfung auf; keine Rechtsberatung.', 'Szenarien', 'Öffnen Sie den Berater-Tab und wählen Sie eine Szenariokarte.', 'Beantworten Sie ein paar kurze Fragen und erhalten Sie Ihren Fahrplan.', 'Wo es passt, bietet der Fahrplan einen passenden Brief an.'],
  Calc: ['Rechner', 'Fristen, anteilige Beträge, Raten und mehr', 'Schnelle Berechnungen direkt auf Ihrem Handy: Fristende, anteilige Beträge, prozentuale Änderungen, Ratenpläne und mehr.', 'Rechner', 'Öffnen Sie den Berater-Tab und wählen Sie einen Rechner.', 'Ein Schloss mit „Prüfung ausstehend“ heißt: Das Werkzeug ist länderspezifisch und für Ihr Land noch nicht geprüft.', 'Teilen Sie das Ergebnis; der Hinweis steht immer am Ende.'],
  Docs: ['Dokumente', 'Geführte Briefe mit Lücken', 'Beantworten Sie ein paar Fragen und erhalten Sie einen sauberen Brief. Was Sie auslassen, bleibt als sichtbare [ … ]-Lücke; nichts wird erfunden.', 'Dokumente', 'Öffnen Sie den Berater-Tab und wählen Sie ein Dokument.', 'Füllen Sie die Felder aus; das letzte Feld bleibt über der Tastatur erreichbar.', 'Mit Pro kopieren Sie den vollen Text, exportieren DOCX oder verbessern die Formulierung.'],
  Juris: ['Land und Währung', 'Warum sich Werkzeuge und Währung ändern', 'Das gewählte Land bestimmt, welche länderspezifischen Werkzeuge erscheinen und in welcher Währung Beträge stehen. Bei Automatisch ohne klares Land haben Beträge keine Währung.', 'Land', 'Wählen Sie im Berater-Tab ein Land über die Auswahl.', 'Auch die App-Sprache zählt: Automatisch mit Türkisch nutzt die Türkei; Automatisch mit anderen Sprachen zeigt universelle Werkzeuge.', 'Elemente mit ausstehender Prüfung öffnen sich, sobald sie für das Land geprüft sind.'],
  Trap: ['Fristen-Radar', 'Keine Kündigungsfrist verpassen', 'Nach einer Analyse erscheinen die im Vertrag gefundenen Daten und Kündigungsfristen im Fristen-Radar.', 'Fristen', 'Analysieren Sie einen Vertrag mit Daten oder Kündigungsfristen.', 'Setzen Sie eine Erinnerung, damit Sie vor Fristablauf benachrichtigt werden.', 'Keine Benachrichtigungen? Exportieren Sie die Termine in Ihre Kalender-App.'],
  Share: ['Brief teilen', 'Nur-Lese-Zusammenfassung per Link oder Code', 'Senden Sie jemandem eine Nur-Lese-Zusammenfassung einer Analyse. Der Link läuft ab und der Originalvertrag wird nicht geteilt.', 'Teilen', 'Öffnen Sie den Verlauf oder ein fertiges Ergebnis und wählen Sie Teilen.', 'Erstellen und senden Sie den Link; der Empfänger sieht nur die Zusammenfassung.', 'Code erhalten? Geben Sie ihn im Verlauf ein, um den Brief zu öffnen.'],
  Seats: ['Berater-Plätze', 'Ihrem Berater Lesezugriff geben', 'Pro kann bis zu 2 Berater und 1 Haushaltsmitglied setzen, die Ihre geteilten Briefs lesen. Der Originalvertrag bleibt privat.', 'Plätze', 'Öffnen Sie die Einstellungen und suchen Sie die Berater-Karte.', 'Erstellen Sie einen Platz-Code und senden Sie ihn; die Person fügt ihn in ihren Einstellungen ein.', 'Sie können einen Platz jederzeit widerrufen.'],
  History: ['Verlauf', 'Frühere Analysen finden', 'Ihre gespeicherten Analysen liegen im Verlauf, mit Status und Teilen-Optionen.', 'Verlauf', 'Öffnen Sie den Verlauf-Tab.', 'Markieren Sie jeden Vertrag als Entwurf, in Verhandlung oder unterschrieben.', 'Löschen Sie eine Analyse, die Sie nicht mehr brauchen.'],
  Voice: ['Sprache', 'Sprechen statt tippen', 'Diktieren Sie Ihre Frage per Mikrofon und lassen Sie Antworten vorlesen.', 'Sprache', 'Tippen Sie im Berater-Tab auf das Mikrofon und sprechen Sie.', 'Tippen Sie bei einer Antwort auf das Lautsprecher-Symbol, um sie anzuhören.', 'Reagiert das Mikrofon nicht, erlauben Sie den Zugriff in den Handy-Einstellungen.'],
  Report: ['KI-Antwort melden', 'Falsche oder unsichere Ausgabe markieren', 'KI kann Fehler machen. Wirkt eine Antwort falsch oder unsicher, melden Sie sie zur Prüfung.', 'Melden', 'Öffnen Sie den Berater-Tab und suchen Sie die Antwort.', 'Tippen Sie bei der Antwort auf Melden und beschreiben Sie das Problem.', 'Für alles andere schreiben Sie an den Support in den Einstellungen.'],
  Account: ['Konto und Datenschutz', 'Datenschutz, Passwort, Konto löschen', 'Lesen Sie Datenschutzerklärung und Bedingungen, ändern Sie Ihr Passwort oder löschen Sie Ihr Konto.', 'Konto', 'Öffnen Sie Datenschutzerklärung und Bedingungen in den Einstellungen.', 'Ändern Sie Ihr Passwort unter Sicherheit.', 'Konto löschen entfernt Ihr Konto dauerhaft; das lässt sich nicht rückgängig machen.'],
};

// ------------------------------------------------------------------ FR
S.fr = [
  'Nouveautés', 'Disponibles ici : {{count}}', 'Ouvre cette partie de l’app', 'Cet outil n’est pas proposé pour le pays choisi.',
  'Pourquoi pas de devise ?', 'Pourquoi un outil est verrouillé ?', 'Comment écrire une lettre ?', 'Comment supprimer mon compte ?', 'Comment signaler une réponse IA ?',
  'Feuilles de route en 13 langues', 'Les formulaires restent au-dessus du clavier', '5 calculateurs universels', '7 lettres universelles', 'Outils et devise selon le pays', 'Les étapes du guide ouvrent le bon écran',
  'Changez votre mot de passe dans Sécurité ; il faut au moins 6 caractères.', 'Vos règles enregistrées sont vérifiées à chaque nouvelle analyse.',
  'Changer de camp', 'Répondre aux questions', 'Partager', 'Copier / DOCX', 'Créer un rappel', 'Saisir le code',
  'Révoquer', 'Statut', 'Supprimer', 'Micro', 'Écouter', 'Signaler',
];
F.fr = {
  Party: ['Choisir votre camp', 'Protéger la bonne partie', 'NexuLex lit le contrat du point de vue que vous choisissez, par exemple locataire ou bailleur, et signale ce qui nuit à cette partie.', 'Votre camp', 'Dans Analyse, choisissez votre partie avant de lancer.', 'Lancez l’analyse ; le résultat indique la partie protégée.', 'Mauvais camp ? Le bouton d’inversion du résultat montre le point de vue adverse.'],
  Offers: ['Contre-propositions', 'Équilibrée, Bouclier ou Rapide', 'Pour les clauses risquées, NexuLex peut proposer jusqu’à trois contre-propositions : Équilibrée, Bouclier (la plus protectrice) et Rapide (la plus facile à accepter).', 'Offres', 'Ouvrez une clause risquée dans le résultat et repérez les puces d’offre.', 'Choisissez Bouclier si vous avez du poids, Rapide pour conclure vite.', 'Copiez le message prêt à envoyer ; il reprend l’offre choisie pour chaque clause.'],
  Scenarios: ['Feuilles de route', 'Plans pas à pas pour les problèmes courants', 'Feuilles de route guidées pour quitter un emploi, un litige locatif ou une facture impayée. Elles listent étapes et documents à vérifier ; ce n’est pas un conseil juridique.', 'Scénarios', 'Ouvrez l’onglet Conseiller et choisissez une carte de scénario.', 'Répondez à quelques questions courtes pour obtenir votre feuille de route.', 'Si cela s’y prête, la feuille de route propose une lettre adaptée.'],
  Calc: ['Calculateurs', 'Délais, prorata, échéanciers et plus', 'Des calculs rapides sur votre téléphone : date d’échéance, montant au prorata, variation en pourcentage, échéancier et plus.', 'Calculateurs', 'Ouvrez l’onglet Conseiller et choisissez un calculateur.', 'Un cadenas « Vérification en cours » signifie que l’outil est propre à un pays et pas encore vérifié pour le vôtre.', 'Partagez le résultat ; l’avertissement est toujours ajouté à la fin.'],
  Docs: ['Documents', 'Lettres guidées avec blancs', 'Répondez à quelques questions et obtenez une lettre propre. Ce que vous sautez reste un blanc [ … ] visible ; rien n’est inventé.', 'Documents', 'Ouvrez l’onglet Conseiller et choisissez un document.', 'Remplissez les champs ; le dernier reste accessible au-dessus du clavier.', 'Avec Pro, copiez le texte complet, exportez en DOCX ou améliorez la formulation.'],
  Juris: ['Pays et devise', 'Pourquoi outils et devise changent', 'Le pays choisi détermine les outils propres au pays affichés et la devise des montants. En Auto sans pays clair, les montants n’ont pas de devise.', 'Pays', 'Choisissez un pays avec le sélecteur de l’onglet Conseiller.', 'La langue compte aussi : Auto avec le turc utilise la Turquie ; Auto avec une autre langue affiche les outils universels.', 'Les éléments en attente s’ouvrent une fois vérifiés pour ce pays.'],
  Trap: ['Radar des délais', 'Ne manquez aucun préavis', 'Après une analyse, les dates et préavis trouvés dans le contrat apparaissent dans le radar des délais.', 'Délais', 'Analysez un contrat qui contient des dates ou des préavis.', 'Créez un rappel pour être prévenu avant l’échéance.', 'Pas de notifications ? Exportez les dates vers votre agenda.'],
  Share: ['Partager un résumé', 'Résumé en lecture seule par lien ou code', 'Envoyez à quelqu’un un résumé en lecture seule d’une analyse. Le lien expire et le contrat original n’est pas partagé.', 'Partager', 'Ouvrez l’Historique ou un résultat terminé et choisissez Partager.', 'Créez le lien et envoyez-le ; le destinataire ne voit que le résumé.', 'Vous avez reçu un code ? Saisissez-le dans l’Historique pour ouvrir le résumé.'],
  Seats: ['Places conseiller', 'Donner un accès en lecture à votre conseiller', 'Pro peut attribuer jusqu’à 2 places conseiller et 1 place foyer pour lire les résumés partagés. Le contrat original reste privé.', 'Places', 'Ouvrez Réglages et trouvez la carte des places conseiller.', 'Créez un code de place et envoyez-le ; la personne le colle dans ses Réglages.', 'Vous pouvez révoquer une place à tout moment.'],
  History: ['Historique', 'Retrouver vos analyses', 'Vos analyses enregistrées se trouvent dans l’Historique, avec leur statut et les options de partage.', 'Historique', 'Ouvrez l’onglet Historique.', 'Marquez chaque contrat comme brouillon, en négociation ou signé.', 'Supprimez une analyse dont vous n’avez plus besoin.'],
  Voice: ['Voix', 'Parler au lieu de taper', 'Dictez votre question au micro et faites lire les réponses à voix haute.', 'Voix', 'Touchez le micro dans l’onglet Conseiller et parlez.', 'Touchez l’icône haut-parleur d’une réponse pour l’écouter.', 'Si le micro ne réagit pas, autorisez-le dans les réglages du téléphone.'],
  Report: ['Signaler une réponse IA', 'Signaler une sortie fausse ou risquée', 'L’IA peut se tromper. Si une réponse semble fausse ou risquée, signalez-la pour que nous l’examinions.', 'Signaler', 'Ouvrez l’onglet Conseiller et retrouvez la réponse.', 'Touchez Signaler sur la réponse et décrivez le problème.', 'Pour tout le reste, écrivez au Support dans Réglages.'],
  Account: ['Compte et confidentialité', 'Confidentialité, mot de passe, suppression', 'Lisez la politique de confidentialité et les conditions, changez votre mot de passe ou supprimez votre compte.', 'Compte', 'Ouvrez la politique de confidentialité et les conditions dans Réglages.', 'Changez votre mot de passe dans Sécurité.', 'Supprimer le compte l’efface définitivement ; c’est irréversible.'],
};

// ------------------------------------------------------------------ ES
S.es = [
  'Novedades', 'Disponibles aquí: {{count}}', 'Abre esta parte de la app', 'Esta herramienta no se ofrece para el país elegido.',
  '¿Por qué no hay moneda?', '¿Por qué está bloqueada una herramienta?', '¿Cómo escribo una carta?', '¿Cómo elimino mi cuenta?', '¿Cómo reporto una respuesta de IA?',
  'Hojas de ruta en 13 idiomas', 'Los formularios quedan sobre el teclado', '5 calculadoras universales', '7 cartas universales', 'Herramientas y moneda según el país', 'Los pasos de la guía abren la pantalla correcta',
  'Cambie su contraseña en Seguridad; necesita al menos 6 caracteres.', 'Sus reglas guardadas se revisan en cada nuevo análisis.',
  'Cambiar de parte', 'Responder preguntas', 'Compartir', 'Copiar / DOCX', 'Crear recordatorio', 'Introducir código',
  'Revocar', 'Estado', 'Eliminar', 'Micrófono', 'Escuchar', 'Reportar',
];
F.es = {
  Party: ['Elija su parte', 'Proteja a la parte correcta', 'NexuLex lee el contrato desde la parte que elija, como inquilino o arrendador, y señala lo que perjudica a esa parte.', 'Su parte', 'En Analizar, elija qué parte es antes de empezar.', 'Inicie el análisis; el resultado indica qué parte protege.', '¿Eligió la parte equivocada? Use el botón de cambio del resultado para ver la otra perspectiva.'],
  Offers: ['Contraofertas', 'Equilibrada, Escudo o Rápida', 'Para cláusulas de riesgo, NexuLex puede sugerir hasta tres contraofertas: Equilibrada, Escudo (la más protectora) y Rápida (la más fácil de aceptar).', 'Ofertas', 'Abra una cláusula de riesgo en el resultado y busque los chips de oferta.', 'Elija Escudo si tiene poder de negociación y Rápida si necesita cerrar pronto.', 'Copie el mensaje listo para enviar; usa la oferta elegida en cada cláusula.'],
  Scenarios: ['Hojas de ruta', 'Planes paso a paso para problemas comunes', 'Hojas de ruta guiadas para dejar un empleo, problemas de alquiler o facturas impagadas. Enumeran pasos y documentos que revisar; no son asesoramiento jurídico.', 'Escenarios', 'Abra la pestaña Asesor y elija una tarjeta de escenario.', 'Responda unas preguntas breves para obtener su hoja de ruta.', 'Cuando encaja, la hoja de ruta ofrece una carta adecuada.'],
  Calc: ['Calculadoras', 'Plazos, prorrateo, cuotas y más', 'Cálculos rápidos en su teléfono: fecha límite, importe prorrateado, variación porcentual, plan de pagos y más.', 'Calculadoras', 'Abra la pestaña Asesor y elija una calculadora.', 'Un candado con «Pendiente de verificación» indica que la herramienta es propia de un país y aún no se ha revisado para el suyo.', 'Comparta el resultado; el aviso siempre se añade al final.'],
  Docs: ['Documentos', 'Cartas guiadas con espacios en blanco', 'Responda unas preguntas y obtenga una carta limpia. Lo que omita queda como un espacio [ … ] visible; no se inventa nada.', 'Documentos', 'Abra la pestaña Asesor y elija un documento.', 'Rellene los campos; el último sigue accesible sobre el teclado.', 'Con Pro, copie el texto completo, exporte a DOCX o mejore la redacción.'],
  Juris: ['País y moneda', 'Por qué cambian herramientas y moneda', 'El país elegido decide qué herramientas específicas aparecen y en qué moneda van los importes. Con Auto y sin país claro, los importes no llevan moneda.', 'País', 'Elija un país con el selector de la pestaña Asesor.', 'El idioma también cuenta: Auto con turco usa Turquía; Auto con otros idiomas muestra herramientas universales.', 'Los elementos pendientes se abrirán cuando se revisen para ese país.'],
  Trap: ['Radar de plazos', 'No pierda ningún preaviso', 'Tras un análisis, las fechas y preavisos del contrato aparecen en el radar de plazos.', 'Plazos', 'Analice un contrato que tenga fechas o preavisos.', 'Cree un recordatorio para recibir un aviso antes del vencimiento.', '¿Sin notificaciones? Exporte las fechas a su calendario.'],
  Share: ['Compartir un resumen', 'Resumen de solo lectura por enlace o código', 'Envíe a alguien un resumen de solo lectura de un análisis. El enlace caduca y el contrato original no se comparte.', 'Compartir', 'Abra el Historial o un resultado terminado y elija Compartir.', 'Cree el enlace y envíelo; el destinatario solo ve el resumen.', '¿Recibió un código? Introdúzcalo en el Historial para abrir el resumen.'],
  Seats: ['Plazas de asesor', 'Dé acceso de lectura a su asesor', 'Pro puede asignar hasta 2 asesores y 1 miembro del hogar que leen los resúmenes compartidos. El contrato original sigue siendo privado.', 'Plazas', 'Abra Ajustes y busque la tarjeta de plazas de asesor.', 'Cree un código de plaza y envíelo; la persona lo pega en sus Ajustes.', 'Puede revocar una plaza en cualquier momento.'],
  History: ['Historial', 'Encuentre análisis anteriores', 'Sus análisis guardados están en el Historial, con su estado y opciones para compartir.', 'Historial', 'Abra la pestaña Historial.', 'Marque cada contrato como borrador, en negociación o firmado.', 'Elimine un análisis que ya no necesite.'],
  Voice: ['Voz', 'Hable en lugar de escribir', 'Dicte su pregunta con el micrófono y escuche las respuestas en voz alta.', 'Voz', 'Toque el micrófono en la pestaña Asesor y hable.', 'Toque el icono de altavoz de una respuesta para escucharla.', 'Si el micrófono no responde, permita el acceso en los ajustes del teléfono.'],
  Report: ['Reportar una respuesta de IA', 'Señale resultados erróneos o inseguros', 'La IA puede equivocarse. Si una respuesta parece errónea o insegura, repórtela para que la revisemos.', 'Reportar', 'Abra la pestaña Asesor y busque la respuesta.', 'Toque Reportar en la respuesta y explique el problema.', 'Para cualquier otra cosa, escriba a Soporte en Ajustes.'],
  Account: ['Cuenta y privacidad', 'Privacidad, contraseña, eliminar cuenta', 'Lea la política de privacidad y las condiciones, cambie su contraseña o elimine su cuenta.', 'Cuenta', 'Abra la política de privacidad y las condiciones en Ajustes.', 'Cambie su contraseña en Seguridad.', 'Eliminar cuenta la borra de forma permanente; no se puede deshacer.'],
};

// ------------------------------------------------------------------ AR
S.ar = [
  'الجديد', 'متاح هنا: {{count}}', 'يفتح هذا الجزء من التطبيق', 'هذه الأداة غير متاحة للبلد المحدد.',
  'لماذا لا توجد عملة؟', 'لماذا الأداة مقفلة؟', 'كيف أكتب رسالة؟', 'كيف أحذف حسابي؟', 'كيف أبلّغ عن إجابة الذكاء الاصطناعي؟',
  'خرائط طريق السيناريوهات بـ 13 لغة', 'النماذج تبقى فوق لوحة المفاتيح', '5 حاسبات عامة', '7 رسائل عامة', 'أدوات وعملة حسب البلد', 'خطوات الدليل تفتح الشاشة الصحيحة الآن',
  'غيّر كلمة المرور من قسم الأمان؛ يجب أن تكون 6 أحرف على الأقل.', 'تُفحص قواعدك المحفوظة في كل تحليل جديد.',
  'تبديل الطرف', 'أجب عن الأسئلة', 'مشاركة', 'نسخ / DOCX', 'ضبط تذكير', 'أدخل الرمز',
  'إلغاء', 'الحالة', 'حذف', 'الميكروفون', 'استماع', 'إبلاغ',
];
F.ar = {
  Party: ['اختر طرفك', 'احمِ الطرف الصحيح', 'يقرأ NexuLex العقد من جهة الطرف الذي تختاره، مثل المستأجر أو المؤجر، ويبرز ما يضر بهذا الطرف.', 'طرفك', 'في شاشة التحليل، اختر الطرف الذي تمثله قبل البدء.', 'ابدأ التحليل؛ تُظهر النتيجة الطرف الذي تحميه.', 'اخترت الطرف الخطأ؟ استخدم زر التبديل في النتيجة لرؤية وجهة نظر الطرف الآخر.'],
  Offers: ['العروض المقابلة', 'متوازن أو درع أو سريع', 'للبنود الخطرة يمكن لـ NexuLex اقتراح حتى ثلاثة عروض مقابلة: متوازن، ودرع (الأكثر حماية)، وسريع (الأسهل قبولًا).', 'العروض', 'افتح بندًا خطرًا في النتيجة وابحث عن رقائق العروض.', 'اختر درع إذا كان موقفك التفاوضي قويًا، وسريع إذا احتجت اتفاقًا عاجلًا.', 'انسخ الرسالة الجاهزة للإرسال؛ فهي تستخدم العرض الذي اخترته لكل بند.'],
  Scenarios: ['خرائط طريق السيناريوهات', 'خطط خطوة بخطوة للمشكلات الشائعة', 'خرائط طريق موجهة لحالات مثل ترك العمل أو مشكلات الإيجار أو الفواتير غير المدفوعة. تسرد الخطوات والمستندات للتحقق؛ وليست استشارة قانونية.', 'السيناريوهات', 'افتح تبويب المستشار واختر بطاقة سيناريو.', 'أجب عن بضعة أسئلة قصيرة لتحصل على خريطة طريقك.', 'عند الملاءمة، تقترح خريطة الطريق رسالة مناسبة.'],
  Calc: ['الحاسبات', 'المهل والمبالغ النسبية والأقساط وغيرها', 'حسابات سريعة تعمل على هاتفك: تاريخ انتهاء المهلة، المبلغ النسبي، التغير بالنسبة المئوية، خطة التقسيط وغيرها.', 'الحاسبات', 'افتح تبويب المستشار واختر حاسبة.', 'القفل مع عبارة «بانتظار التحقق» يعني أن الأداة خاصة ببلد ما ولم تُراجع لبلدك بعد.', 'شارك النتيجة؛ يُضاف إخلاء المسؤولية دائمًا في النهاية.'],
  Docs: ['المستندات', 'رسائل موجهة مع فراغات', 'أجب عن بضعة أسئلة واحصل على رسالة مرتبة. ما تتخطاه يبقى فراغًا ظاهرًا [ … ]؛ لا يُختلق أي شيء.', 'المستندات', 'افتح تبويب المستشار واختر مستندًا.', 'املأ الحقول؛ يبقى الحقل الأخير متاحًا فوق لوحة المفاتيح.', 'مع Pro انسخ النص كاملًا أو صدّر DOCX أو حسّن الصياغة.'],
  Juris: ['البلد والعملة', 'لماذا تتغير الأدوات والعملة', 'يحدد البلد الذي تختاره الأدوات الخاصة التي تظهر وعملة المبالغ. مع الوضع التلقائي ودون بلد واضح، تظهر المبالغ دون عملة.', 'البلد', 'اختر بلدًا من المحدد في تبويب المستشار.', 'لغة التطبيق مهمة أيضًا: التلقائي مع التركية يستخدم تركيا؛ والتلقائي مع لغات أخرى يعرض الأدوات العامة.', 'العناصر التي بانتظار التحقق تُفتح بعد مراجعتها لذلك البلد.'],
  Trap: ['رادار المهل', 'لا تفوّت أي مهلة إخطار', 'بعد التحليل، تظهر التواريخ ومهل الإخطار الموجودة في العقد في رادار المهل.', 'المهل', 'حلّل عقدًا يحتوي على تواريخ أو مهل إخطار.', 'اضبط تذكيرًا ليصلك تنبيه قبل انقضاء المهلة.', 'لا توجد إشعارات؟ صدّر التواريخ إلى تطبيق التقويم.'],
  Share: ['مشاركة ملخص', 'ملخص للقراءة فقط عبر رابط أو رمز', 'أرسل لشخص ما ملخصًا للقراءة فقط لتحليل ما. تنتهي صلاحية الرابط ولا يُشارك العقد الأصلي.', 'مشاركة', 'افتح السجل أو نتيجة مكتملة واختر مشاركة.', 'أنشئ الرابط وأرسله؛ يرى المستلم الملخص فقط.', 'استلمت رمزًا؟ أدخله في السجل لفتح الملخص.'],
  Seats: ['مقاعد المستشار', 'امنح مستشارك وصولًا للقراءة فقط', 'يمكن لحساب Pro منح مقاعد لمستشارَين وفرد واحد من الأسرة لقراءة الملخصات التي تشاركها. يبقى العقد الأصلي خاصًا.', 'المقاعد', 'افتح الإعدادات وابحث عن بطاقة مقاعد المستشار.', 'أنشئ رمز مقعد وأرسله؛ يلصقه الشخص في إعداداته.', 'يمكنك إلغاء أي مقعد في أي وقت.'],
  History: ['السجل', 'اعثر على التحليلات السابقة', 'تحليلاتك المحفوظة موجودة في السجل مع حالتها وخيارات المشاركة.', 'السجل', 'افتح تبويب السجل.', 'ضع علامة على كل عقد: مسودة أو قيد التفاوض أو موقّع.', 'احذف تحليلًا لم تعد تحتاجه.'],
  Voice: ['الصوت', 'تحدّث بدل الكتابة', 'أملِ سؤالك عبر الميكروفون واستمع إلى الإجابات بصوت مسموع.', 'الصوت', 'المس الميكروفون في تبويب المستشار وتحدّث.', 'المس أيقونة السماعة في الإجابة للاستماع إليها.', 'إذا لم يستجب الميكروفون، اسمح بالوصول إليه من إعدادات الهاتف.'],
  Report: ['الإبلاغ عن إجابة الذكاء الاصطناعي', 'أشر إلى مخرجات خاطئة أو غير آمنة', 'قد يخطئ الذكاء الاصطناعي. إذا بدت إجابة خاطئة أو غير آمنة، أبلغ عنها لنراجعها.', 'إبلاغ', 'افتح تبويب المستشار وابحث عن الإجابة.', 'المس إبلاغ على الإجابة واذكر المشكلة.', 'لأي أمر آخر، راسل الدعم من الإعدادات.'],
  Account: ['الحساب والخصوصية', 'الخصوصية وكلمة المرور وحذف الحساب', 'اقرأ سياسة الخصوصية والشروط، أو غيّر كلمة المرور، أو احذف حسابك.', 'الحساب', 'افتح سياسة الخصوصية والشروط من الإعدادات.', 'غيّر كلمة المرور من قسم الأمان.', 'حذف الحساب يزيله نهائيًا؛ ولا يمكن التراجع عن ذلك.'],
};

// ------------------------------------------------------------------ IT
S.it = [
  'Novità', 'Disponibili qui: {{count}}', 'Apre questa parte dell’app', 'Questo strumento non è offerto per il paese scelto.',
  'Perché nessuna valuta?', 'Perché uno strumento è bloccato?', 'Come scrivo una lettera?', 'Come elimino il mio account?', 'Come segnalo una risposta IA?',
  'Percorsi guidati in 13 lingue', 'I moduli restano sopra la tastiera', '5 calcolatori universali', '7 lettere universali', 'Strumenti e valuta in base al paese', 'I passi della guida aprono la schermata giusta',
  'Cambia la password in Sicurezza; servono almeno 6 caratteri.', 'Le regole salvate vengono controllate in ogni nuova analisi.',
  'Cambia parte', 'Rispondi alle domande', 'Condividi', 'Copia / DOCX', 'Imposta promemoria', 'Inserisci codice',
  'Revoca', 'Stato', 'Elimina', 'Microfono', 'Ascolta', 'Segnala',
];
F.it = {
  Party: ['Scegli la tua parte', 'Proteggi la parte giusta', 'NexuLex legge il contratto dal lato che scegli, ad esempio inquilino o locatore, e segnala ciò che danneggia quella parte.', 'La tua parte', 'In Analisi, scegli quale parte sei prima di iniziare.', 'Avvia l’analisi; il risultato indica quale parte tutela.', 'Parte sbagliata? Usa il pulsante di inversione nel risultato per vedere l’altro punto di vista.'],
  Offers: ['Controproposte', 'Equilibrata, Scudo o Rapida', 'Per le clausole rischiose NexuLex può suggerire fino a tre controproposte: Equilibrata, Scudo (la più protettiva) e Rapida (la più facile da accettare).', 'Offerte', 'Apri una clausola rischiosa nel risultato e cerca i chip delle offerte.', 'Scegli Scudo se hai potere negoziale e Rapida se ti serve un accordo veloce.', 'Copia il messaggio pronto da inviare; usa l’offerta scelta per ogni clausola.'],
  Scenarios: ['Percorsi guidati', 'Piani passo passo per problemi comuni', 'Percorsi guidati per situazioni come lasciare un lavoro, problemi d’affitto o fatture non pagate. Elencano passi e documenti da verificare; non sono consulenza legale.', 'Scenari', 'Apri la scheda Consulente e scegli una scheda scenario.', 'Rispondi a poche domande brevi per ottenere il tuo percorso.', 'Quando è adatto, il percorso propone una lettera corrispondente.'],
  Calc: ['Calcolatori', 'Scadenze, pro rata, rate e altro', 'Calcoli rapidi sul tuo telefono: data di scadenza, importo pro rata, variazione percentuale, piano rateale e altro.', 'Calcolatori', 'Apri la scheda Consulente e scegli un calcolatore.', 'Un lucchetto con «In attesa di verifica» indica che lo strumento è specifico di un paese e non ancora verificato per il tuo.', 'Condividi il risultato; l’avvertenza è sempre aggiunta alla fine.'],
  Docs: ['Documenti', 'Lettere guidate con spazi vuoti', 'Rispondi a poche domande e ottieni una lettera pulita. Ciò che salti resta uno spazio [ … ] visibile; nulla viene inventato.', 'Documenti', 'Apri la scheda Consulente e scegli un documento.', 'Compila i campi; l’ultimo resta raggiungibile sopra la tastiera.', 'Con Pro copia il testo completo, esporta in DOCX o migliora la formulazione.'],
  Juris: ['Paese e valuta', 'Perché strumenti e valuta cambiano', 'Il paese scelto decide quali strumenti specifici compaiono e in quale valuta sono gli importi. Con Auto e nessun paese chiaro, gli importi non hanno valuta.', 'Paese', 'Scegli un paese con il selettore nella scheda Consulente.', 'Conta anche la lingua: Auto con il turco usa la Turchia; Auto con altre lingue mostra strumenti universali.', 'Gli elementi in attesa di verifica si apriranno dopo la revisione per quel paese.'],
  Trap: ['Radar delle scadenze', 'Non perdere nessun preavviso', 'Dopo un’analisi, date e preavvisi trovati nel contratto compaiono nel radar delle scadenze.', 'Scadenze', 'Analizza un contratto che contiene date o preavvisi.', 'Imposta un promemoria per essere avvisato prima della scadenza.', 'Nessuna notifica? Esporta le date nella tua app calendario.'],
  Share: ['Condividi un riepilogo', 'Riepilogo in sola lettura tramite link o codice', 'Invia a qualcuno un riepilogo in sola lettura di un’analisi. Il link scade e il contratto originale non viene condiviso.', 'Condividi', 'Apri la Cronologia o un risultato completato e scegli Condividi.', 'Crea il link e invialo; il destinatario vede solo il riepilogo.', 'Hai ricevuto un codice? Inseriscilo nella Cronologia per aprire il riepilogo.'],
  Seats: ['Posti consulente', 'Dai al consulente accesso in sola lettura', 'Pro può assegnare fino a 2 consulenti e 1 familiare che leggono i riepiloghi condivisi. Il contratto originale resta privato.', 'Posti', 'Apri Impostazioni e trova la scheda dei posti consulente.', 'Crea un codice posto e invialo; la persona lo incolla nelle sue Impostazioni.', 'Puoi revocare un posto in qualsiasi momento.'],
  History: ['Cronologia', 'Trova le analisi passate', 'Le analisi salvate sono nella Cronologia, con stato e opzioni di condivisione.', 'Cronologia', 'Apri la scheda Cronologia.', 'Segna ogni contratto come bozza, in trattativa o firmato.', 'Elimina un’analisi che non ti serve più.'],
  Voice: ['Voce', 'Parla invece di scrivere', 'Detta la domanda al microfono e fatti leggere le risposte ad alta voce.', 'Voce', 'Tocca il microfono nella scheda Consulente e parla.', 'Tocca l’icona dell’altoparlante su una risposta per ascoltarla.', 'Se il microfono non risponde, consenti l’accesso nelle impostazioni del telefono.'],
  Report: ['Segnala una risposta IA', 'Segnala output errati o non sicuri', 'L’IA può sbagliare. Se una risposta sembra errata o non sicura, segnalala così possiamo verificarla.', 'Segnala', 'Apri la scheda Consulente e trova la risposta.', 'Tocca Segnala sulla risposta e descrivi il problema.', 'Per tutto il resto, scrivi al Supporto in Impostazioni.'],
  Account: ['Account e privacy', 'Privacy, password, eliminazione account', 'Leggi l’informativa privacy e i termini, cambia la password o elimina l’account.', 'Account', 'Apri l’informativa privacy e i termini in Impostazioni.', 'Cambia la password in Sicurezza.', 'Elimina account lo rimuove in modo definitivo; non si può annullare.'],
};

// ------------------------------------------------------------------ ZH
S.zh = [
  '新功能', '此处可用：{{count}}', '打开应用的这一部分', '所选国家不提供此工具。',
  '为什么没有币种？', '为什么工具被锁定？', '如何写一封信函？', '如何删除我的账户？', '如何举报 AI 回答？',
  '13 种语言的情景路线图', '表单始终位于键盘上方', '5 个通用计算器', '7 封通用信函', '按国家适配的工具与币种', '指南步骤现在可直接打开对应页面',
  '在“安全”中修改密码；至少需要 6 个字符。', '您保存的规则会在每次新分析中检查。',
  '切换立场', '回答问题', '分享', '复制 / DOCX', '设置提醒', '输入代码',
  '撤销', '状态', '删除', '麦克风', '收听', '举报',
];
F.zh = {
  Party: ['选择您的立场', '保护正确的一方', 'NexuLex 会从您选择的一方（如承租人或出租人）解读合同，并标出对该方不利的内容。', '您的立场', '在“分析”页开始前，先选择您是哪一方。', '开始分析；结果会显示保护的是哪一方。', '选错了？用结果中的切换按钮查看另一方的视角。'],
  Offers: ['反提案', '平衡、护盾或快速', '针对高风险条款，NexuLex 最多可提供三种反提案：平衡、护盾（保护最强）和快速（最易被接受）。', '提案', '在结果中打开一条高风险条款，查找提案标签。', '有谈判筹码时选护盾，需要尽快达成时选快速。', '复制可直接发送的消息；它会使用您为每条条款选择的提案。'],
  Scenarios: ['情景路线图', '常见问题的分步计划', '针对离职、租赁纠纷或欠款等情况的引导式路线图，列出需要核对的步骤和文件；不构成法律意见。', '情景', '打开“顾问”页并选择一张情景卡片。', '回答几个简短问题即可获得路线图。', '在合适时，路线图会推荐相应的信函。'],
  Calc: ['计算器', '期限、按比例金额、分期等', '在手机上完成的快速计算：期限日期、按比例金额、百分比变化、分期计划等。', '计算器', '打开“顾问”页并选择一个计算器。', '带“等待核实”的锁表示该工具仅适用于特定国家，尚未针对您的国家审核。', '分享结果；免责声明始终附在最后。'],
  Docs: ['文书', '带空白处的引导式信函', '回答几个问题即可得到一封整洁的信函。您跳过的内容会显示为 [ … ] 空白，不会编造任何信息。', '文书', '打开“顾问”页并选择一份文书。', '填写字段；最后一个字段始终可在键盘上方访问。', 'Pro 用户可复制全文、导出 DOCX 或优化措辞。'],
  Juris: ['国家与币种', '工具和币种为何变化', '您选择的国家决定显示哪些特定国家工具以及金额使用的币种。选择“自动”且国家不明确时，金额不带币种。', '国家', '在“顾问”页用选择器选择国家。', '应用语言同样重要：自动 + 土耳其语使用土耳其；自动 + 其他语言显示通用工具。', '等待核实的项目在针对该国家审核后开放。'],
  Trap: ['期限雷达', '不再错过通知期', '分析后，合同中的日期和通知期会显示在期限雷达中。', '期限', '分析一份包含日期或通知期的合同。', '设置提醒，在期限届满前收到通知。', '没有通知？把日期导出到日历应用。'],
  Share: ['分享摘要', '通过链接或代码分享只读摘要', '向他人发送分析的只读摘要。链接会过期，原始合同不会被分享。', '分享', '打开“历史记录”或已完成的结果，选择分享。', '创建链接并发送；对方只能看到摘要。', '收到代码？在“历史记录”中输入即可打开摘要。'],
  Seats: ['顾问席位', '为顾问提供只读访问', 'Pro 最多可为 2 位顾问和 1 位家庭成员分配席位，用于阅读您分享的摘要。原始合同保持私密。', '席位', '打开“设置”并找到顾问席位卡片。', '创建席位代码并发送；对方将其粘贴到自己的“设置”中。', '您可随时撤销席位。'],
  History: ['历史记录', '查找以往分析', '已保存的分析都在“历史记录”中，附带状态和分享选项。', '历史记录', '打开“历史记录”页。', '将每份合同标记为草稿、谈判中或已签署。', '删除不再需要的分析。'],
  Voice: ['语音', '用说代替打字', '用麦克风口述问题，并让回答朗读出来。', '语音', '在“顾问”页点按麦克风并说话。', '点按回答上的扬声器图标即可收听。', '若麦克风无反应，请在手机设置中允许麦克风权限。'],
  Report: ['举报 AI 回答', '标记错误或不安全的内容', 'AI 可能出错。若回答看起来错误或不安全，请举报以便我们审核。', '举报', '打开“顾问”页并找到该回答。', '点按回答上的“举报”并说明问题。', '其他问题请在“设置”中联系支持。'],
  Account: ['账户与隐私', '隐私、密码、删除账户', '阅读隐私政策和条款、修改密码或删除账户。', '账户', '在“设置”中打开隐私政策和条款。', '在“安全”中修改密码。', '删除账户将永久移除您的账户，且无法撤销。'],
};

// ------------------------------------------------------------------ RU
S.ru = [
  'Что нового', 'Доступно здесь: {{count}}', 'Открывает этот раздел приложения', 'Этот инструмент не предлагается для выбранной страны.',
  'Почему нет валюты?', 'Почему инструмент заблокирован?', 'Как написать письмо?', 'Как удалить аккаунт?', 'Как пожаловаться на ответ ИИ?',
  'Сценарии на 13 языках', 'Формы остаются над клавиатурой', '5 универсальных калькуляторов', '7 универсальных писем', 'Инструменты и валюта по стране', 'Шаги гида теперь открывают нужный экран',
  'Смените пароль в разделе «Безопасность»; нужно не менее 6 символов.', 'Сохранённые правила проверяются при каждом новом анализе.',
  'Сменить сторону', 'Ответить на вопросы', 'Поделиться', 'Копировать / DOCX', 'Напомнить', 'Ввести код',
  'Отозвать', 'Статус', 'Удалить', 'Микрофон', 'Прослушать', 'Пожаловаться',
];
F.ru = {
  Party: ['Выберите свою сторону', 'Защищайте нужную сторону', 'NexuLex читает договор с позиции выбранной стороны, например арендатора или арендодателя, и отмечает, что ей вредит.', 'Ваша сторона', 'В разделе «Анализ» перед запуском выберите, какая вы сторона.', 'Запустите анализ; результат покажет, чью сторону он защищает.', 'Ошиблись стороной? Кнопка смены в результате покажет взгляд другой стороны.'],
  Offers: ['Встречные предложения', 'Сбалансированное, Щит или Быстрое', 'Для рискованных пунктов NexuLex может предложить до трёх встречных вариантов: Сбалансированный, Щит (максимальная защита) и Быстрый (проще всего принять).', 'Варианты', 'Откройте рискованный пункт в результате и найдите метки вариантов.', 'Выбирайте Щит при сильной позиции и Быстрый, когда нужна скорая сделка.', 'Скопируйте готовое сообщение; в нём выбранный вариант для каждого пункта.'],
  Scenarios: ['Сценарии', 'Пошаговые планы для частых проблем', 'Пошаговые планы для ситуаций вроде увольнения, проблем с арендой или неоплаченных счетов. Они перечисляют шаги и документы для проверки; это не юридическая консультация.', 'Сценарии', 'Откройте вкладку «Советник» и выберите карточку сценария.', 'Ответьте на несколько коротких вопросов и получите план.', 'Когда уместно, план предложит подходящее письмо.'],
  Calc: ['Калькуляторы', 'Сроки, пропорции, рассрочка и другое', 'Быстрые расчёты прямо на телефоне: дата окончания срока, пропорциональная сумма, изменение в процентах, план рассрочки и другое.', 'Калькуляторы', 'Откройте вкладку «Советник» и выберите калькулятор.', 'Замок с надписью «Ожидает проверки» означает, что инструмент привязан к стране и ещё не проверен для вашей.', 'Поделитесь результатом; оговорка всегда добавляется в конце.'],
  Docs: ['Документы', 'Письма по шагам с пропусками', 'Ответьте на несколько вопросов и получите аккуратное письмо. Пропущенное останется видимым пропуском [ … ]; ничего не выдумывается.', 'Документы', 'Откройте вкладку «Советник» и выберите документ.', 'Заполните поля; последнее поле остаётся доступным над клавиатурой.', 'С Pro можно скопировать весь текст, экспортировать DOCX или улучшить формулировки.'],
  Juris: ['Страна и валюта', 'Почему меняются инструменты и валюта', 'Выбранная страна определяет, какие специальные инструменты видны и в какой валюте суммы. В режиме «Авто» без явной страны суммы указываются без валюты.', 'Страна', 'Выберите страну в селекторе на вкладке «Советник».', 'Важен и язык: «Авто» с турецким использует Турцию; «Авто» с другими языками показывает универсальные инструменты.', 'Элементы, ожидающие проверки, откроются после проверки для этой страны.'],
  Trap: ['Радар сроков', 'Не пропустите срок уведомления', 'После анализа даты и сроки уведомления из договора появляются в радаре сроков.', 'Сроки', 'Проанализируйте договор с датами или сроками уведомления.', 'Поставьте напоминание, чтобы получить сигнал до истечения срока.', 'Нет уведомлений? Экспортируйте даты в приложение календаря.'],
  Share: ['Поделиться сводкой', 'Сводка только для чтения по ссылке или коду', 'Отправьте кому-то сводку анализа только для чтения. Ссылка истекает, а исходный договор не передаётся.', 'Поделиться', 'Откройте «Историю» или готовый результат и выберите «Поделиться».', 'Создайте ссылку и отправьте её; получатель видит только сводку.', 'Получили код? Введите его в «Истории», чтобы открыть сводку.'],
  Seats: ['Места советников', 'Дайте советнику доступ только для чтения', 'Pro может выдать места 2 советникам и 1 члену семьи для чтения сводок, которыми вы делитесь. Исходный договор остаётся закрытым.', 'Места', 'Откройте «Настройки» и найдите карточку мест советников.', 'Создайте код места и отправьте; человек вставит его в своих «Настройках».', 'Вы можете отозвать место в любой момент.'],
  History: ['История', 'Находите прошлые анализы', 'Сохранённые анализы находятся в «Истории» вместе со статусом и вариантами отправки.', 'История', 'Откройте вкладку «История».', 'Отмечайте каждый договор как черновик, на согласовании или подписан.', 'Удалите анализ, который больше не нужен.'],
  Voice: ['Голос', 'Говорите вместо набора', 'Продиктуйте вопрос в микрофон и прослушайте ответы вслух.', 'Голос', 'Нажмите на микрофон во вкладке «Советник» и говорите.', 'Нажмите значок динамика у ответа, чтобы прослушать его.', 'Если микрофон не реагирует, разрешите доступ в настройках телефона.'],
  Report: ['Пожаловаться на ответ ИИ', 'Отметьте неверный или небезопасный ответ', 'ИИ может ошибаться. Если ответ кажется неверным или небезопасным, пожалуйтесь, и мы его проверим.', 'Жалоба', 'Откройте вкладку «Советник» и найдите ответ.', 'Нажмите «Пожаловаться» у ответа и опишите проблему.', 'По остальным вопросам пишите в поддержку в «Настройках».'],
  Account: ['Аккаунт и конфиденциальность', 'Конфиденциальность, пароль, удаление', 'Прочитайте политику конфиденциальности и условия, смените пароль или удалите аккаунт.', 'Аккаунт', 'Откройте политику конфиденциальности и условия в «Настройках».', 'Смените пароль в разделе «Безопасность».', 'Удаление аккаунта необратимо стирает его; отменить нельзя.'],
};

// ------------------------------------------------------------------ FA
S.fa = [
  'تازه‌ها', 'در اینجا در دسترس: {{count}}', 'این بخش از برنامه را باز می‌کند', 'این ابزار برای کشور انتخاب‌شده ارائه نمی‌شود.',
  'چرا واحد پول نیست؟', 'چرا ابزار قفل است؟', 'چگونه نامه بنویسم؟', 'چگونه حسابم را حذف کنم؟', 'چگونه پاسخ هوش مصنوعی را گزارش کنم؟',
  'نقشه‌راه سناریوها به ۱۳ زبان', 'فرم‌ها بالای صفحه‌کلید می‌مانند', '۵ محاسبه‌گر جهانی', '۷ نامه جهانی', 'ابزار و واحد پول بر اساس کشور', 'مراحل راهنما اکنون صفحه درست را باز می‌کنند',
  'رمز عبور را در بخش امنیت تغییر دهید؛ دست‌کم ۶ نویسه لازم است.', 'قواعد ذخیره‌شده شما در هر تحلیل جدید بررسی می‌شود.',
  'تغییر طرف', 'پاسخ به پرسش‌ها', 'اشتراک‌گذاری', 'کپی / DOCX', 'تنظیم یادآور', 'وارد کردن کد',
  'لغو دسترسی', 'وضعیت', 'حذف', 'میکروفون', 'گوش دادن', 'گزارش',
];
F.fa = {
  Party: ['طرف خود را انتخاب کنید', 'از طرف درست محافظت کنید', 'NexuLex قرارداد را از دید طرفی که انتخاب می‌کنید، مثلاً مستأجر یا موجر، می‌خواند و آنچه به زیان آن طرف است را نشان می‌دهد.', 'طرف شما', 'در بخش تحلیل پیش از شروع، طرف خود را انتخاب کنید.', 'تحلیل را شروع کنید؛ نتیجه نشان می‌دهد از کدام طرف محافظت می‌کند.', 'طرف اشتباه را انتخاب کردید؛ با دکمه تغییر در نتیجه، دیدگاه طرف مقابل را ببینید.'],
  Offers: ['پیشنهادهای متقابل', 'متعادل، سپر یا سریع', 'برای بندهای پرخطر، NexuLex تا سه پیشنهاد متقابل ارائه می‌دهد: متعادل، سپر (بیشترین حمایت) و سریع (آسان‌ترین برای پذیرش).', 'پیشنهادها', 'یک بند پرخطر را در نتیجه باز کنید و برچسب‌های پیشنهاد را پیدا کنید.', 'اگر قدرت چانه‌زنی دارید سپر، و اگر توافق سریع لازم است سریع را انتخاب کنید.', 'پیام آماده ارسال را کپی کنید؛ برای هر بند از پیشنهاد انتخابی شما استفاده می‌کند.'],
  Scenarios: ['نقشه‌راه سناریوها', 'برنامه گام‌به‌گام برای مشکلات رایج', 'نقشه‌راه‌های راهنما برای موقعیت‌هایی مانند ترک کار، مشکلات اجاره یا صورت‌حساب‌های پرداخت‌نشده. گام‌ها و مدارک لازم برای بررسی را فهرست می‌کنند؛ مشاوره حقوقی نیستند.', 'سناریوها', 'زبانه مشاور را باز کنید و یک کارت سناریو انتخاب کنید.', 'به چند پرسش کوتاه پاسخ دهید تا نقشه‌راه خود را بگیرید.', 'در صورت تناسب، نقشه‌راه نامه مرتبطی پیشنهاد می‌دهد.'],
  Calc: ['محاسبه‌گرها', 'مهلت‌ها، مبلغ تناسبی، اقساط و بیشتر', 'محاسبه‌های سریع روی گوشی شما: تاریخ پایان مهلت، مبلغ تناسبی، تغییر درصدی، برنامه اقساط و بیشتر.', 'محاسبه‌گرها', 'زبانه مشاور را باز کنید و یک محاسبه‌گر انتخاب کنید.', 'قفل با عبارت «در انتظار تأیید» یعنی ابزار مخصوص یک کشور است و هنوز برای کشور شما بررسی نشده است.', 'نتیجه را به اشتراک بگذارید؛ سلب مسئولیت همیشه در پایان می‌آید.'],
  Docs: ['اسناد', 'نامه‌های راهنما با جای خالی', 'به چند پرسش پاسخ دهید و نامه‌ای مرتب بگیرید. هر چه را رد کنید به‌صورت جای خالی [ … ] می‌ماند؛ چیزی ساختگی اضافه نمی‌شود.', 'اسناد', 'زبانه مشاور را باز کنید و یک سند انتخاب کنید.', 'فیلدها را پر کنید؛ آخرین فیلد بالای صفحه‌کلید در دسترس می‌ماند.', 'با Pro متن کامل را کپی کنید، DOCX بگیرید یا نگارش را بهتر کنید.'],
  Juris: ['کشور و واحد پول', 'چرا ابزارها و واحد پول تغییر می‌کنند', 'کشوری که انتخاب می‌کنید تعیین می‌کند کدام ابزارهای ویژه نمایش داده شوند و مبالغ با چه واحد پولی باشند. در حالت خودکار و بدون کشور مشخص، مبالغ واحد پول ندارند.', 'کشور', 'در زبانه مشاور با انتخابگر، کشور را انتخاب کنید.', 'زبان برنامه هم مهم است: خودکار با ترکی از ترکیه استفاده می‌کند؛ خودکار با زبان‌های دیگر ابزارهای جهانی را نشان می‌دهد.', 'موارد در انتظار تأیید پس از بررسی برای آن کشور باز می‌شوند.'],
  Trap: ['رادار مهلت‌ها', 'هیچ مهلت اخطاری را از دست ندهید', 'پس از تحلیل، تاریخ‌ها و مهلت‌های اخطار موجود در قرارداد در رادار مهلت‌ها نمایش داده می‌شوند.', 'مهلت‌ها', 'قراردادی را که تاریخ یا مهلت اخطار دارد تحلیل کنید.', 'یادآور تنظیم کنید تا پیش از پایان مهلت باخبر شوید.', 'اعلان ندارید؛ تاریخ‌ها را به برنامه تقویم منتقل کنید.'],
  Share: ['اشتراک خلاصه', 'خلاصه فقط‌خواندنی با پیوند یا کد', 'خلاصه فقط‌خواندنی یک تحلیل را برای کسی بفرستید. پیوند منقضی می‌شود و قرارداد اصلی به اشتراک گذاشته نمی‌شود.', 'اشتراک', 'تاریخچه یا یک نتیجه کامل را باز کنید و اشتراک‌گذاری را انتخاب کنید.', 'پیوند را بسازید و بفرستید؛ گیرنده فقط خلاصه را می‌بیند.', 'کدی دریافت کرده‌اید؛ آن را در تاریخچه وارد کنید تا خلاصه باز شود.'],
  Seats: ['جایگاه‌های مشاور', 'به مشاورتان دسترسی فقط‌خواندنی بدهید', 'حساب Pro می‌تواند تا ۲ مشاور و ۱ عضو خانواده را برای خواندن خلاصه‌های اشتراکی اضافه کند. قرارداد اصلی خصوصی می‌ماند.', 'جایگاه‌ها', 'تنظیمات را باز کنید و کارت جایگاه مشاور را پیدا کنید.', 'یک کد جایگاه بسازید و بفرستید؛ آن فرد کد را در تنظیمات خود می‌چسباند.', 'هر زمان بخواهید می‌توانید یک جایگاه را لغو کنید.'],
  History: ['تاریخچه', 'تحلیل‌های قبلی را پیدا کنید', 'تحلیل‌های ذخیره‌شده شما با وضعیت و گزینه‌های اشتراک در تاریخچه هستند.', 'تاریخچه', 'زبانه تاریخچه را باز کنید.', 'هر قرارداد را پیش‌نویس، در حال مذاکره یا امضاشده علامت بزنید.', 'تحلیلی را که دیگر لازم ندارید حذف کنید.'],
  Voice: ['صدا', 'به‌جای تایپ حرف بزنید', 'پرسش خود را با میکروفون بگویید و پاسخ‌ها را با صدای بلند بشنوید.', 'صدا', 'در زبانه مشاور روی میکروفون بزنید و صحبت کنید.', 'برای شنیدن پاسخ، روی نماد بلندگو بزنید.', 'اگر میکروفون کار نمی‌کند، دسترسی آن را در تنظیمات گوشی مجاز کنید.'],
  Report: ['گزارش پاسخ هوش مصنوعی', 'خروجی نادرست یا ناامن را علامت بزنید', 'هوش مصنوعی ممکن است اشتباه کند. اگر پاسخی نادرست یا ناامن به نظر می‌رسد، گزارش دهید تا بررسی کنیم.', 'گزارش', 'زبانه مشاور را باز کنید و پاسخ را پیدا کنید.', 'روی گزارش در پاسخ بزنید و مشکل را بنویسید.', 'برای هر موضوع دیگر، از تنظیمات به پشتیبانی پیام دهید.'],
  Account: ['حساب و حریم خصوصی', 'حریم خصوصی، رمز عبور، حذف حساب', 'سیاست حفظ حریم خصوصی و شرایط را بخوانید، رمز عبور را تغییر دهید یا حساب خود را حذف کنید.', 'حساب', 'سیاست حریم خصوصی و شرایط را از تنظیمات باز کنید.', 'رمز عبور را در بخش امنیت تغییر دهید.', 'حذف حساب آن را برای همیشه پاک می‌کند و بازگشت‌پذیر نیست.'],
};

// ------------------------------------------------------------------ JA
S.ja = [
  '新着情報', 'ここで利用可能：{{count}}', 'アプリのこの部分を開きます', 'このツールは選択した国では提供されていません。',
  '通貨が表示されないのは？', 'ツールがロックされているのは？', '書面の作り方は？', 'アカウントの削除方法は？', 'AIの回答を報告するには？',
  '13言語のシナリオ・ロードマップ', 'フォームがキーボードの上に表示されます', '汎用計算ツール5種', '汎用レター7種', '国に応じたツールと通貨', 'ガイドの手順から該当画面を直接開けます',
  'パスワードは「セキュリティ」で変更できます。6文字以上が必要です。', '保存したルールは新しい分析のたびに確認されます。',
  '立場を切り替え', '質問に答える', '共有', 'コピー / DOCX', 'リマインダー設定', 'コードを入力',
  '取り消し', 'ステータス', '削除', 'マイク', '読み上げ', '報告',
];
F.ja = {
  Party: ['あなたの立場を選ぶ', '正しい当事者を守る', 'NexuLexは、借主や貸主など選んだ立場から契約を読み、その立場に不利な点を指摘します。', 'あなたの立場', '「分析」で開始前に、自分がどの当事者かを選びます。', '分析を開始すると、結果にどちらの立場を守っているかが表示されます。', '立場を間違えた場合は、結果の切り替えボタンで相手方の視点を確認できます。'],
  Offers: ['対案', 'バランス・シールド・スピード', 'リスクのある条項について、NexuLexは最大3つの対案を提示します：バランス、シールド（最も保護的）、スピード（最も受け入れられやすい）。', '対案', '結果でリスクのある条項を開き、対案のチップを確認します。', '交渉力があるときはシールド、早くまとめたいときはスピードを選びます。', '送信用メッセージをコピーします。条項ごとに選んだ対案が使われます。'],
  Scenarios: ['シナリオ・ロードマップ', 'よくある問題の段階的プラン', '退職、賃貸トラブル、未払い請求などの状況に向けたガイド付きロードマップです。確認すべき手順と書類を示すもので、法的助言ではありません。', 'シナリオ', '「アドバイザー」タブでシナリオカードを選びます。', 'いくつかの短い質問に答えるとロードマップが表示されます。', '該当する場合、ロードマップが対応する書面を提案します。'],
  Calc: ['計算ツール', '期限・日割り・分割払いなど', 'スマホ上で完結する簡単な計算：期限日、日割り金額、変化率、分割払い計画など。', '計算ツール', '「アドバイザー」タブで計算ツールを選びます。', '「確認待ち」の鍵マークは、国別のツールで、あなたの国ではまだ確認されていないことを示します。', '結果を共有できます。免責事項は常に最後に付きます。'],
  Docs: ['書面', '空欄付きのガイド付きレター', 'いくつかの質問に答えるだけで整った書面ができます。未入力の項目は [ … ] の空欄として残り、内容を作り出すことはありません。', '書面', '「アドバイザー」タブで書面を選びます。', '項目を入力します。最後の項目もキーボードの上に表示されます。', 'Proでは全文のコピー、DOCX書き出し、表現の改善が使えます。'],
  Juris: ['国と通貨', 'ツールや通貨が変わる理由', '選んだ国によって、表示される国別ツールと金額の通貨が決まります。「自動」で国が特定できない場合、金額に通貨は付きません。', '国', '「アドバイザー」タブの選択欄で国を選びます。', 'アプリの言語も影響します：自動＋トルコ語はトルコ、自動＋その他の言語は汎用ツールを表示します。', '確認待ちの項目は、その国向けの確認が済むと利用可能になります。'],
  Trap: ['期限レーダー', '通知期間を見逃さない', '分析後、契約から見つかった日付や通知期間が期限レーダーに表示されます。', '期限', '日付や通知期間を含む契約を分析します。', 'リマインダーを設定すると、期限前に通知を受け取れます。', '通知が届かない場合は、日付をカレンダーアプリに書き出します。'],
  Share: ['要約を共有', 'リンクやコードで閲覧専用の要約', '分析の閲覧専用の要約を相手に送れます。リンクには有効期限があり、元の契約書は共有されません。', '共有', '「履歴」または完了した結果を開き、共有を選びます。', 'リンクを作成して送ります。相手は要約だけを閲覧できます。', 'コードを受け取った場合は、「履歴」で入力すると要約が開きます。'],
  Seats: ['アドバイザー席', 'アドバイザーに閲覧専用アクセスを付与', 'Proでは最大2名のアドバイザーと1名の家族に席を割り当て、共有した要約を閲覧してもらえます。元の契約書は非公開のままです。', '席', '「設定」でアドバイザー席のカードを探します。', '席コードを作成して送ります。相手は自分の「設定」に貼り付けます。', '席はいつでも取り消せます。'],
  History: ['履歴', '過去の分析を探す', '保存した分析は、ステータスや共有オプションと一緒に「履歴」にあります。', '履歴', '「履歴」タブを開きます。', '各契約を下書き・交渉中・署名済みとしてマークします。', '不要になった分析を削除します。'],
  Voice: ['音声', '入力の代わりに話す', 'マイクで質問を音声入力し、回答を読み上げで聞けます。', '音声', '「アドバイザー」タブでマイクをタップして話します。', '回答のスピーカーアイコンをタップすると読み上げます。', 'マイクが反応しない場合は、端末の設定でマイクへのアクセスを許可します。'],
  Report: ['AIの回答を報告', '誤りや危険な出力を指摘', 'AIは誤ることがあります。回答が誤っている、または危険だと思われる場合は、確認のため報告してください。', '報告', '「アドバイザー」タブで該当の回答を探します。', '回答の「報告」をタップし、問題点を記入します。', 'その他のご用件は「設定」のサポートへご連絡ください。'],
  Account: ['アカウントとプライバシー', 'プライバシー・パスワード・削除', 'プライバシーポリシーと規約の確認、パスワード変更、アカウント削除ができます。', 'アカウント', '「設定」でプライバシーポリシーと規約を開きます。', '「セキュリティ」でパスワードを変更します。', 'アカウントを削除すると完全に消去され、元に戻せません。'],
};

// ------------------------------------------------------------------ PT
S.pt = [
  'Novidades', 'Disponíveis aqui: {{count}}', 'Abre esta parte da app', 'Esta ferramenta não é oferecida para o país escolhido.',
  'Porque não há moeda?', 'Porque está uma ferramenta bloqueada?', 'Como escrevo uma carta?', 'Como elimino a minha conta?', 'Como denuncio uma resposta de IA?',
  'Roteiros de cenários em 13 línguas', 'Os formulários ficam acima do teclado', '5 calculadoras universais', '7 cartas universais', 'Ferramentas e moeda conforme o país', 'Os passos do guia abrem o ecrã certo',
  'Altere a palavra-passe em Segurança; precisa de pelo menos 6 caracteres.', 'As suas regras guardadas são verificadas em cada nova análise.',
  'Trocar de parte', 'Responder a perguntas', 'Partilhar', 'Copiar / DOCX', 'Criar lembrete', 'Introduzir código',
  'Revogar', 'Estado', 'Eliminar', 'Microfone', 'Ouvir', 'Denunciar',
];
F.pt = {
  Party: ['Escolha a sua parte', 'Proteja a parte certa', 'O NexuLex lê o contrato do lado que escolher, como inquilino ou senhorio, e assinala o que prejudica essa parte.', 'A sua parte', 'Em Analisar, escolha qual parte é antes de começar.', 'Inicie a análise; o resultado indica que parte protege.', 'Escolheu a parte errada? Use o botão de troca no resultado para ver a perspetiva da outra parte.'],
  Offers: ['Contrapropostas', 'Equilibrada, Escudo ou Rápida', 'Para cláusulas de risco, o NexuLex pode sugerir até três contrapropostas: Equilibrada, Escudo (a mais protetora) e Rápida (a mais fácil de aceitar).', 'Propostas', 'Abra uma cláusula de risco no resultado e procure as etiquetas de proposta.', 'Escolha Escudo quando tem poder negocial e Rápida quando precisa de fechar depressa.', 'Copie a mensagem pronta a enviar; usa a proposta escolhida para cada cláusula.'],
  Scenarios: ['Roteiros de cenários', 'Planos passo a passo para problemas comuns', 'Roteiros guiados para situações como sair de um emprego, problemas de arrendamento ou faturas por pagar. Indicam passos e documentos a verificar; não são aconselhamento jurídico.', 'Cenários', 'Abra o separador Consultor e escolha um cartão de cenário.', 'Responda a algumas perguntas curtas para obter o seu roteiro.', 'Quando se aplica, o roteiro propõe uma carta adequada.'],
  Calc: ['Calculadoras', 'Prazos, proporcional, prestações e mais', 'Cálculos rápidos no seu telemóvel: data-limite, montante proporcional, variação percentual, plano de prestações e mais.', 'Calculadoras', 'Abra o separador Consultor e escolha uma calculadora.', 'Um cadeado com «A aguardar verificação» indica que a ferramenta é específica de um país e ainda não foi revista para o seu.', 'Partilhe o resultado; o aviso é sempre acrescentado no fim.'],
  Docs: ['Documentos', 'Cartas guiadas com espaços em branco', 'Responda a algumas perguntas e obtenha uma carta limpa. O que saltar fica como um espaço [ … ] visível; nada é inventado.', 'Documentos', 'Abra o separador Consultor e escolha um documento.', 'Preencha os campos; o último continua acessível acima do teclado.', 'Com Pro, copie o texto completo, exporte em DOCX ou melhore a redação.'],
  Juris: ['País e moeda', 'Porque mudam as ferramentas e a moeda', 'O país escolhido decide que ferramentas específicas aparecem e em que moeda ficam os montantes. Com Automático e sem país claro, os montantes não têm moeda.', 'País', 'Escolha um país no seletor do separador Consultor.', 'A língua da app também conta: Automático com turco usa a Turquia; Automático com outras línguas mostra ferramentas universais.', 'Os itens a aguardar verificação abrem depois de revistos para esse país.'],
  Trap: ['Radar de prazos', 'Não perca nenhum pré-aviso', 'Após uma análise, as datas e pré-avisos encontrados no contrato aparecem no radar de prazos.', 'Prazos', 'Analise um contrato que contenha datas ou pré-avisos.', 'Crie um lembrete para ser avisado antes do fim do prazo.', 'Sem notificações? Exporte as datas para a sua app de calendário.'],
  Share: ['Partilhar um resumo', 'Resumo só de leitura por ligação ou código', 'Envie a alguém um resumo só de leitura de uma análise. A ligação expira e o contrato original não é partilhado.', 'Partilhar', 'Abra o Histórico ou um resultado concluído e escolha Partilhar.', 'Crie a ligação e envie-a; o destinatário só vê o resumo.', 'Recebeu um código? Introduza-o no Histórico para abrir o resumo.'],
  Seats: ['Lugares de consultor', 'Dê acesso só de leitura ao seu consultor', 'O Pro pode atribuir até 2 consultores e 1 membro do agregado que leem os resumos partilhados. O contrato original continua privado.', 'Lugares', 'Abra as Definições e encontre o cartão de lugares de consultor.', 'Crie um código de lugar e envie-o; a pessoa cola-o nas suas Definições.', 'Pode revogar um lugar a qualquer momento.'],
  History: ['Histórico', 'Encontre análises anteriores', 'As suas análises guardadas estão no Histórico, com o estado e opções de partilha.', 'Histórico', 'Abra o separador Histórico.', 'Marque cada contrato como rascunho, em negociação ou assinado.', 'Elimine uma análise de que já não precisa.'],
  Voice: ['Voz', 'Fale em vez de escrever', 'Dite a sua pergunta ao microfone e ouça as respostas em voz alta.', 'Voz', 'Toque no microfone no separador Consultor e fale.', 'Toque no ícone do altifalante numa resposta para a ouvir.', 'Se o microfone não reagir, permita o acesso nas definições do telemóvel.'],
  Report: ['Denunciar uma resposta de IA', 'Assinale resultados errados ou inseguros', 'A IA pode errar. Se uma resposta parecer errada ou insegura, denuncie-a para a revermos.', 'Denunciar', 'Abra o separador Consultor e encontre a resposta.', 'Toque em Denunciar na resposta e explique o problema.', 'Para tudo o resto, escreva ao Suporte nas Definições.'],
  Account: ['Conta e privacidade', 'Privacidade, palavra-passe, eliminar conta', 'Leia a política de privacidade e os termos, altere a palavra-passe ou elimine a sua conta.', 'Conta', 'Abra a política de privacidade e os termos nas Definições.', 'Altere a palavra-passe em Segurança.', 'Eliminar a conta remove-a definitivamente; não pode ser anulado.'],
};

// ------------------------------------------------------------------ NL
S.nl = [
  'Nieuw', 'Hier beschikbaar: {{count}}', 'Opent dit deel van de app', 'Deze tool wordt voor het gekozen land niet aangeboden.',
  'Waarom geen valuta?', 'Waarom is een tool vergrendeld?', 'Hoe schrijf ik een brief?', 'Hoe verwijder ik mijn account?', 'Hoe meld ik een AI-antwoord?',
  'Stappenplannen in 13 talen', 'Formulieren blijven boven het toetsenbord', '5 universele rekenhulpen', '7 universele brieven', 'Tools en valuta per land', 'Gidsstappen openen nu het juiste scherm',
  'Wijzig uw wachtwoord onder Beveiliging; minimaal 6 tekens nodig.', 'Uw opgeslagen regels worden bij elke nieuwe analyse gecontroleerd.',
  'Kant wisselen', 'Vragen beantwoorden', 'Delen', 'Kopiëren / DOCX', 'Herinnering zetten', 'Code invoeren',
  'Intrekken', 'Status', 'Verwijderen', 'Microfoon', 'Beluisteren', 'Melden',
];
F.nl = {
  Party: ['Kies uw kant', 'Bescherm de juiste partij', 'NexuLex leest het contract vanuit de kant die u kiest, zoals huurder of verhuurder, en markeert wat die kant benadeelt.', 'Uw kant', 'Kies bij Analyseren vóór de start welke partij u bent.', 'Start de analyse; het resultaat toont welke kant wordt beschermd.', 'Verkeerde kant gekozen? Met de wisselknop in het resultaat ziet u de andere kant.'],
  Offers: ['Tegenvoorstellen', 'Gebalanceerd, Schild of Snel', 'Voor risicovolle bepalingen kan NexuLex tot drie tegenvoorstellen doen: Gebalanceerd, Schild (meest beschermend) en Snel (makkelijkst te accepteren).', 'Voorstellen', 'Open een risicovolle bepaling in het resultaat en zoek de voorstel-chips.', 'Kies Schild als u onderhandelingsmacht heeft en Snel als u snel wilt afronden.', 'Kopieer het verzendklare bericht; het gebruikt per bepaling het gekozen voorstel.'],
  Scenarios: ['Stappenplannen', 'Stap-voor-stap plannen voor veelvoorkomende problemen', 'Begeleide stappenplannen voor situaties als ontslag nemen, huurproblemen of onbetaalde facturen. Ze noemen stappen en documenten om te controleren; geen juridisch advies.', 'Scenario’s', 'Open het tabblad Adviseur en kies een scenariokaart.', 'Beantwoord een paar korte vragen voor uw stappenplan.', 'Waar het past, stelt het stappenplan een passende brief voor.'],
  Calc: ['Rekenhulpen', 'Termijnen, naar rato, afbetaling en meer', 'Snelle berekeningen op uw telefoon: einddatum van een termijn, bedrag naar rato, procentuele wijziging, afbetalingsplan en meer.', 'Rekenhulpen', 'Open het tabblad Adviseur en kies een rekenhulp.', 'Een slot met „Wacht op controle” betekent dat de tool landspecifiek is en nog niet voor uw land is gecontroleerd.', 'Deel het resultaat; de disclaimer staat altijd onderaan.'],
  Docs: ['Documenten', 'Begeleide brieven met open plekken', 'Beantwoord een paar vragen en krijg een nette brief. Wat u overslaat blijft een zichtbare [ … ]-plek; er wordt niets verzonnen.', 'Documenten', 'Open het tabblad Adviseur en kies een document.', 'Vul de velden in; het laatste veld blijft boven het toetsenbord bereikbaar.', 'Met Pro kopieert u de volledige tekst, exporteert u DOCX of verbetert u de formulering.'],
  Juris: ['Land en valuta', 'Waarom tools en valuta veranderen', 'Het gekozen land bepaalt welke landspecifieke tools verschijnen en in welke valuta bedragen staan. Bij Automatisch zonder duidelijk land hebben bedragen geen valuta.', 'Land', 'Kies een land met de keuzelijst in het tabblad Adviseur.', 'Ook de app-taal telt: Automatisch met Turks gebruikt Turkije; Automatisch met andere talen toont universele tools.', 'Onderdelen die op controle wachten openen zodra ze voor dat land zijn gecontroleerd.'],
  Trap: ['Termijnradar', 'Mis nooit een opzegtermijn', 'Na een analyse verschijnen de data en opzegtermijnen uit het contract in de termijnradar.', 'Termijnen', 'Analyseer een contract met data of opzegtermijnen.', 'Zet een herinnering zodat u vóór het verstrijken een melding krijgt.', 'Geen meldingen? Exporteer de data naar uw agenda-app.'],
  Share: ['Samenvatting delen', 'Alleen-lezen samenvatting via link of code', 'Stuur iemand een alleen-lezen samenvatting van een analyse. De link verloopt en het originele contract wordt niet gedeeld.', 'Delen', 'Open Geschiedenis of een afgerond resultaat en kies Delen.', 'Maak de link en verstuur hem; de ontvanger ziet alleen de samenvatting.', 'Een code ontvangen? Voer die in bij Geschiedenis om de samenvatting te openen.'],
  Seats: ['Adviseursplaatsen', 'Geef uw adviseur alleen-lezen toegang', 'Met Pro kunt u tot 2 adviseurs en 1 gezinslid een plaats geven om gedeelde samenvattingen te lezen. Het originele contract blijft privé.', 'Plaatsen', 'Open Instellingen en zoek de kaart met adviseursplaatsen.', 'Maak een plaatscode en verstuur die; de ander plakt hem in zijn Instellingen.', 'U kunt een plaats op elk moment intrekken.'],
  History: ['Geschiedenis', 'Eerdere analyses terugvinden', 'Uw opgeslagen analyses staan in Geschiedenis, met status en deelopties.', 'Geschiedenis', 'Open het tabblad Geschiedenis.', 'Markeer elk contract als concept, in onderhandeling of ondertekend.', 'Verwijder een analyse die u niet meer nodig heeft.'],
  Voice: ['Spraak', 'Spreek in plaats van typen', 'Dicteer uw vraag met de microfoon en laat antwoorden voorlezen.', 'Spraak', 'Tik op de microfoon in het tabblad Adviseur en spreek.', 'Tik op het luidsprekericoon bij een antwoord om het te beluisteren.', 'Reageert de microfoon niet? Sta toegang toe in de instellingen van uw telefoon.'],
  Report: ['AI-antwoord melden', 'Markeer foute of onveilige uitvoer', 'AI kan fouten maken. Lijkt een antwoord fout of onveilig, meld het dan zodat we het kunnen bekijken.', 'Melden', 'Open het tabblad Adviseur en zoek het antwoord.', 'Tik bij het antwoord op Melden en beschrijf het probleem.', 'Voor al het andere schrijft u naar Support in Instellingen.'],
  Account: ['Account en privacy', 'Privacy, wachtwoord, account verwijderen', 'Lees het privacybeleid en de voorwaarden, wijzig uw wachtwoord of verwijder uw account.', 'Account', 'Open het privacybeleid en de voorwaarden in Instellingen.', 'Wijzig uw wachtwoord onder Beveiliging.', 'Account verwijderen wist uw account definitief; dit kan niet ongedaan worden gemaakt.'],
};

const out = {};
for (const lang of langs) {
  if (!S[lang] || S[lang].length !== SIMPLE_KEYS.length) throw new Error(`Missing ${lang} translation for simple keys (${S[lang] ? S[lang].length : 0}/${SIMPLE_KEYS.length})`);
  out[lang] = {};
  SIMPLE_KEYS.forEach((key, index) => {
    out[lang][key] = S[lang][index];
  });
  for (const code of FLOWS) {
    const row = F[lang] && F[lang][code];
    if (!row || row.length !== 7 || row.some((v) => typeof v !== 'string' || !v.trim())) throw new Error(`Missing ${lang} translation for flow ${code}`);
    const [title, hint, intro, chip, s1, s2, s3] = row;
    Object.assign(out[lang], {
      [`guideFlow${code}Title`]: title,
      [`guideFlow${code}Hint`]: hint,
      [`guideFlow${code}Intro`]: intro,
      [`guideChip${code}`]: chip,
      [`guideStep${code}1`]: s1,
      [`guideStep${code}2`]: s2,
      [`guideStep${code}3`]: s3,
    });
  }
}
const file = `// WAVE GD.2 — Guide workflows for every feature, deep-link steps, What's new, FAQ. Same key set in all 13 languages.\n\nexport const WAVE_GD2_I18N = ${JSON.stringify(out, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'i18n.wavegd2.js'), file, 'utf8');
console.log('Wrote i18n.wavegd2.js keys=', Object.keys(out.en).length, 'langs=', langs.length);
