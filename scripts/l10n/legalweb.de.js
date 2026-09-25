// WAVE ST.3 — Datenschutz + Löschen (DE).
module.exports = {
  privacy: `<h1>Datenschutzrichtlinie</h1>
<p class="meta">Stand: 25. September 2026. Diese Übersetzung dient der Verständlichkeit. Maßgeblich ist der englische Text.</p>
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
<h2>7. Kontakt</h2>
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
};
