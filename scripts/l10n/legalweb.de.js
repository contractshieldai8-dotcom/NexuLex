// WAVE ST.3 — Datenschutz + Löschen (DE).
module.exports = {
  privacy: `<h1>Datenschutzrichtlinie</h1>
<p class="meta">Stand: 5. Oktober 2026. Diese Übersetzung dient der Verständlichkeit. Maßgeblich ist der englische Text.</p>
<p>Diese Richtlinie erklärt, wie NexuLex AI („wir“, „die App“) Daten in der mobilen App und in den zugehörigen Web-Ansichten verarbeitet.</p>
<h2>1. Welche Daten wir verarbeiten</h2>
<ul>
<li>Kontodaten wie E-Mail-Adresse und Anmeldekennungen.</li>
<li>Vertragstext, Bilder oder PDFs, die Sie zur Analyse hochladen oder einfügen.</li>
<li>Fotos und PDFs wählen Sie im Systemwähler. Sie werden nicht im Hintergrund erfasst.</li>
<li>Analyseergebnisse, Briefs, Erinnerungen und Support-Nachrichten, die Sie erstellen.</li>
<li>Kauf- und Berechtigungsstatus der Stores über RevenueCat. Unser Server fragt RevenueCat, welchen Plan (Pro oder Professional) Ihr Konto hat, und speichert nur diesen Plan und sein Ablaufdatum im Profil.</li>
<li>Grundlegende Geräte- und Diagnosesignale, die den Dienst sicher betreiben.</li>
</ul>
<h2>2. Cloud-Speicher (Supabase)</h2>
<p>Authentifizierte Produktdaten liegen in Supabase (PostgreSQL und zugehörige Cloud-Dienste). Der Zugriff ist durch Kontoanmeldung und Zeilen-Sicherheitsregeln begrenzt. Geteilte Briefs nutzen kurzlebige Codes und enthalten nicht den Originalvertrag.</p>
<h2>3. Wofür wir Daten nutzen</h2>
<ul>
<li>Verträge analysieren, Berichte erzeugen und Berater- / Haushaltsplätze betreiben.</li>
<li>Gratis- und Pro-Kontingente durchsetzen und Käufe wiederherstellen.</li>
<li>Optionale lokale Erinnerungen, die Sie auf dem Gerät planen.</li>
<li>Support-Anfragen beantworten, die Sie senden.</li>
</ul>
<h2>4. KI-Verarbeitung</h2>
<p>Von Ihnen gesendeter Vertragsinhalt kann zur Analyse an unseren Cloud-KI-Proxy gehen. Wir verkaufen Ihre Verträge nicht. Laden Sie nichts hoch, das Sie nicht verarbeiten dürfen.</p>
<p>Rechtsfragen und die Professional-Werkzeuge (Chronologie, Streitpunkte, Recherchevermerk): Ihre Frage, Sachverhalt, Aktenmaterial und eine angehängte Akte (ohne Beweisdateien) gehen nur zur Antwort über eine verschlüsselte Verbindung durch unseren Server an den KI-Anbieter. Unser Server behält nur eine tägliche Zählung der Fragen und Professional-Läufe, nicht Ihren Text und nicht die KI-Ausgabe. Antworten, Ergebnisse und Akten bleiben auf Ihrem Gerät, bis Sie sie woanders speichern oder teilen.</p>
<p>Sie können eine KI-Ausgabe aus dem Analysebericht, einer Beraterantwort oder einem überarbeiteten Entwurf melden. Eine Meldung speichert den Grund, Ihre optionale Notiz, die Element-ID, die App-Sprache und das gewählte Land. Vertrags- oder Antworttext (höchstens 2000 Zeichen) wird nur angehängt, wenn Sie „Vertragskontext einbeziehen“ einschalten.</p>
<p>Anwalt finden: die erste Nachricht und das Aktenpaket entstehen ohne KI auf Ihrem Gerät und werden nicht an unsere Server oder an einen Anwalt gesendet. Sie verlassen das Gerät nur, wenn Sie selbst kopieren oder teilen. Verzeichnislinks öffnen amtliche Seiten von Kammern und öffentlichen Stellen mit eigenen Datenschutzregeln. NexuLex gibt Ihre Daten nicht an Anwälte weiter und erhält keine Vermittlungsgebühr.</p>
<h2>5. Aufbewahrung und Löschung</h2>
<p>Sie können das Konto jederzeit in der App unter <strong>Einstellungen, dann Konto löschen</strong> oder über die Schritte auf der <a href="delete-account.html">Löschseite</a> (ohne App) löschen. Die Löschung entfernt Konto und Profil, gespeicherte Analysen und Vertragstext, Freigabecodes, Erinnerungen, Berater- / Haushaltsplätze und Briefs, Support-Nachrichten und KI-Meldungen. Auf dem Gerät der In-App-Löschung werden geplante Erinnerungen, lokale Caches und exportierte Dateien ebenfalls geleert.</p>
<p>Nach der Kontolöschung bleiben Gerätekennung und Telefonnummer der Gratisquote ohne jede Verbindung zu Ihrem Konto erhalten, nur um wiederholte Gratisansprüche zu sperren.</p>
<p>Ein aktives App Store- oder Google Play-Abo wird durch die Kontolöschung nicht automatisch gekündigt; kündigen Sie es im Store-Konto. Brief-Codes enden nach dem angegebenen Fenster von selbst.</p>
<h2>6. Rechtlicher Hinweis</h2>
<p><strong>NexuLex AI ist keine Anwaltskanzlei und erteilt keine Rechtsberatung.</strong> Ausgaben sind allgemeine Informationshilfen. Entscheidungen bleiben Ihre; ziehen Sie für Ihren Fall eine zugelassene Anwältin oder einen zugelassenen Anwalt hinzu.</p>
<h2 data-sec="signup">7. Anmeldedaten</h2>
<p>Bei der Anmeldung geben Sie eine E-Mail-Adresse und eine Telefonnummer an. Telefonnummer und Gerätekennung dienen dazu, das kostenlose Analysekontingent zu beanspruchen und wiederholten Missbrauch zu verhindern. Sie werden nicht für Werbung genutzt und nicht verkauft.</p>
<h2 data-sec="voice">8. Spracheingabe</h2>
<p>Die Spracheingabe ist optional. Wenn Sie das Mikrofon nutzen, erfolgt die Spracherkennung durch den in Ihr Telefon integrierten Sprachdienst (Apple oder Google) nach den Datenschutzbedingungen dieses Anbieters. NexuLex AI nimmt Ihr Audio weder auf noch speichert es; wir erhalten nur den Text, den Sie verwenden möchten.</p>
<h2 data-sec="transfer">9. Dienstleister und internationale Übermittlung</h2>
<p>Wir nutzen Supabase (Cloud-Datenbank und Anmeldung), einen KI-Anbieter eines Dritten, der über unseren Server angesprochen wird (Analysen und Antworten), RevenueCat (Kaufstatus) sowie die Stores von Apple und Google. Diese Anbieter können Daten auch in anderen Ländern als Ihrem verarbeiten, einschließlich Ländern außerhalb des Europäischen Wirtschaftsraums, des Vereinigten Königreichs und der Schweiz. Verlangt das Recht für solche Übermittlungen Garantien, stützen wir uns auf die Übermittlungsmechanismen dieser Anbieter.</p>
<h2 data-sec="rights">10. Ihre Rechte</h2>
<p>Je nach Wohnort (zum Beispiel nach DSGVO / UK GDPR, dem Schweizer Datenschutzgesetz, dem österreichischen DSG, dem türkischen KVKK, dem indischen DPDP Act, dem kanadischen PIPEDA und Provinzrecht oder dem australischen Privacy Act) haben Sie möglicherweise das Recht auf Auskunft, Berichtigung, Löschung, Übertragung, Einschränkung der Verarbeitung oder Widerspruch sowie auf Widerruf einer Einwilligung. Ihr Konto können Sie in der App löschen. Für andere Anfragen schreiben Sie von Ihrer registrierten Adresse an nexulexai@gmail.com; wir antworten innerhalb der gesetzlichen Frist. Sie können sich außerdem bei der Datenschutzaufsichtsbehörde Ihres Landes beschweren.</p>
<h2 data-sec="children">11. Kinder, Werbung und Tracking</h2>
<p>NexuLex AI richtet sich an Erwachsene ab 18 Jahren und nicht an Kinder. Wir erheben wissentlich keine Daten von Kindern; melden Sie sich bei uns, dann löschen wir sie. Die App enthält keine Werbung und kein App-übergreifendes Tracking, und wir verkaufen keine personenbezogenen Daten.</p>
<h2>12. Kontakt</h2>
<p>Fragen zum Datenschutz: nutzen Sie den Support in der App oder schreiben Sie dem im Store genannten Herausgeber.</p>`,

  deleteAccount: `<h1>NexuLex AI-Konto löschen</h1>
<p class="meta">Stand: 25. September 2026. Diese Übersetzung dient der Verständlichkeit. Maßgeblich ist der englische Text.</p>
<h2>In der App (am schnellsten)</h2>
<ol>
<li>NexuLex AI öffnen und anmelden.</li>
<li>Unter <strong>Einstellungen</strong> auf <strong>Konto löschen</strong> tippen.</li>
<li>Den Hinweis lesen und zweimal bestätigen. Die Löschung läuft sofort, Sie werden abgemeldet.</li>
</ol>
<p class="warn"><strong>Abos werden nicht automatisch gekündigt.</strong> Kündigen Sie einen aktiven Plan in
<a href="https://apps.apple.com/account/subscriptions">App Store-Abos</a> oder
<a href="https://play.google.com/store/account/subscriptions">Google Play-Abos</a>.</p>
<h2>Ohne die App</h2>
<p>Schreiben Sie von der registrierten Adresse an <a href="mailto:nexulexai@gmail.com?subject=Account%20deletion%20request">nexulexai@gmail.com</a> den Satz „Delete my account“ / „Konto löschen“. Wir bestätigen per E-Mail und schließen die Löschung innerhalb von 30 Tagen ab.</p>
<h2>Was gelöscht wird</h2>
<ul>
<li>Konto und Profil (E-Mail, Anmeldekennungen, Pro-Status).</li>
<li>Gespeicherte Analysen und Vertragstext, von Ihnen erzeugte Freigabecodes, Erinnerungen, Berater- / Haushaltsplätze und Briefs.</li>
<li>Von Ihnen gesendete Support-Nachrichten und KI-Meldungen.</li>
<li>Auf dem Gerät der In-App-Löschung: geplante Erinnerungen, lokale Caches und exportierte Dateien.</li>
</ul>
<h2>Was bleibt</h2>
<p>Gerätekennung und Telefonnummer der Gratis-Analysequote bleiben ohne Verbindung zu Ihrem Konto, nur um wiederholte Gratisansprüche zu sperren. Kaufdaten bei Apple, Google und RevenueCat folgen deren eigenen Regeln.</p>
<p>Siehe auch die <a href="privacy.html">Datenschutzrichtlinie</a>.</p>`,

  terms: `<h1>Nutzungsbedingungen (EULA)</h1>
<p class="meta">Stand: 5. Oktober 2026. Diese Übersetzung dient der Verständlichkeit. Maßgeblich ist der englische Text.</p>
<p>Mit dem Download oder der Nutzung von NexuLex AI akzeptieren Sie diese Bedingungen und unsere <a href="privacy.html">Datenschutzrichtlinie</a>.</p>
<h2>1. Leistungsbeschreibung</h2>
<p>NexuLex AI ist ein Verbraucherprogramm, das Verträge prüfen, Risiken zeigen, Gegensprache entwerfen und begrenzte nur-lese Briefs teilen hilft. Es wird „wie besehen“ bereitgestellt.</p>
<h2>2. Keine Anwaltskanzlei</h2>
<p><strong>NexuLex AI ist keine Anwaltskanzlei und erteilt keine Rechtsberatung.</strong> Nichts in der App begründet ein Anwaltsverhältnis. Prüfen Sie wichtige Entscheidungen bei einer zugelassenen Anwältin oder einem zugelassenen Anwalt in Ihrem Land.</p>
<p>„Anwalt finden“ verlinkt nur amtliche Verzeichnisse von Kammern und öffentlichen Stellen. NexuLex AI empfiehlt, reiht oder vermittelt keine Anwälte, erhält keine Vermittlungsgebühr und haftet nicht für Leistungen eines von Ihnen gewählten Anwalts. Prüfen Sie Zulassung und Honorar, bevor Sie beauftragen.</p>
<h2>3. Konten und Abos</h2>
<ul>
<li>Gratisquoten und Pro-Rechte werden serverseitig und über RevenueCat / die Stores durchgesetzt.</li>
<li>Der Professional-Plan enthält alles aus Pro plus die Professional-Werkzeuge und die in der App gezeigten höheren Tagesgrenzen. Ihr Plan wird von unserem Server mit RevenueCat geprüft; er lässt sich in der App nicht ändern.</li>
<li>Die Professional-Werkzeuge sind Arbeitshilfen, keine Rechtsberatung. Sie nutzen nur Ihr Material und können Fehler enthalten; prüfen Sie jedes Datum, jede Tatsache und jede Quelle. NexuLex AI vertritt niemanden vor Gericht oder Behörde.</li>
<li>Abrechnung, Erstattung und Kündigung folgen den Regeln von Apple App Store oder Google Play.</li>
<li>Sie sind für die Sicherheit Ihrer Anmeldedaten verantwortlich.</li>
</ul>
<h2>4. Zulässige Nutzung</h2>
<ul>
<li>Laden Sie nichts Rechtswidriges und nichts hoch, das Sie nicht verarbeiten dürfen.</li>
<li>Versuchen Sie nicht, Sicherheit, Quoten oder Paywalls zu umgehen, zu überlasten oder rückzubauen.</li>
<li>Nutzen Sie den Dienst nicht zur Belästigung, zum Betrug oder zur Täuschung.</li>
<li>Teilen Sie ohne Rechtsgrundlage keine Geheimnisse, Zugangsdaten oder fremden Personendaten.</li>
</ul>
<h2>5. Geistiges Eigentum</h2>
<p>Name, Marke und Software von NexuLex AI gehören dem Herausgeber. Rechte an hochgeladenen Verträgen bleiben bei Ihnen. Sie erteilen uns eine beschränkte Lizenz, den Inhalt nur zur Leistungserbringung zu verarbeiten.</p>
<h2>6. Geteilte Briefs und Plätze</h2>
<p>Brief-Links und Berater- / Haushaltsplätze sollen den Originalvertrag verbergen. Empfänger sehen trotzdem von Ihnen geteilte Analysezusammenfassungen. Seien Sie vorsichtig, bevor Sie Codes erzeugen.</p>
<h2>7. Haftungsgrenze</h2>
<p>Soweit gesetzlich zulässig haften wir nicht für Entscheidungen auf Basis der App-Ausgabe, Fehler dritter KI, Store-Abrechnungsstreit oder Ausfälle außerhalb unserer zumutbaren Kontrolle.</p>
<h2>8. Änderungen</h2>
<p>Wir können diese Bedingungen aktualisieren. Die weitere Nutzung nach einer Änderung gilt als Annahme.</p>
<h2 data-sec="eligibility">9. Teilnahmevoraussetzung</h2>
<p>Zur Nutzung von NexuLex AI müssen Sie mindestens 18 Jahre alt sein oder an Ihrem Wohnort volljährig. Nutzen Sie die App für ein Unternehmen, bestätigen Sie, dass Sie dieses Unternehmen binden dürfen.</p>
<h2 data-sec="renewal">10. Abonnements und automatische Verlängerung</h2>
<p>Kostenpflichtige Pläne verlängern sich automatisch um denselben Zeitraum zum angezeigten Store-Preis, bis Sie kündigen. Die Zahlung wird Ihrem App-Store- oder Google-Play-Konto belastet. Sie können in den Einstellungen Ihres Store-Kontos verwalten oder kündigen; im App Store mindestens 24 Stunden vor Ende des laufenden Zeitraums. Das Löschen Ihres NexuLex-AI-Kontos kündigt kein Abonnement. Erstattungen richten sich nach der Richtlinie des Stores.</p>
<h2 data-sec="ai">11. KI-generierte Ergebnisse</h2>
<p>Analysen, Antworten, Entwürfe und Zusammenfassungen werden von künstlicher Intelligenz erzeugt. Sie können unvollständig, veraltet oder falsch sein, und das Recht unterscheidet sich je nach Land und ändert sich. Prüfen Sie wichtige Punkte anhand amtlicher Quellen oder mit einer zugelassenen Anwältin oder einem zugelassenen Anwalt, bevor Sie sich darauf verlassen.</p>
<h2 data-sec="termin">12. Sperrung und Beendigung</h2>
<p>Sie können die Nutzung von NexuLex AI jederzeit beenden und Ihr Konto löschen. Wir können einen Zugang sperren oder beenden, der gegen diese Bedingungen verstößt oder den Dienst oder andere Nutzer gefährdet.</p>
<h2>13. Kontakt</h2>
<p>Für Konto- oder Produktfragen nutzen Sie den Support in der App. Für Verbraucherbeschwerden gelten die Angaben des Herausgebers im Store.</p>`,
};
