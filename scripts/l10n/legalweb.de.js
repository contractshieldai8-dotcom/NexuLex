// WAVE ST.3 — Datenschutz + Löschen (DE).
module.exports = {
  privacy: `<h1>Datenschutzrichtlinie</h1>
<p class="meta">Stand: 21. Oktober 2026. Diese Übersetzung dient der Verständlichkeit. Maßgeblich ist der englische Text.</p>
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
<p>Für den Betrieb von NexuLex AI nutzen wir diese Dienstleister:</p>
<ul>
<li>Supabase: Cloud-Datenbank, Anmeldung und Serverfunktionen. Unser Projekt wird in der Europäischen Union gehostet (Frankfurt, Deutschland).</li>
<li>Anthropic (Claude-API, USA): Analyse und Antworten, nur über unseren Server erreichbar.</li>
<li>RevenueCat (USA): Kauf- und Tarifstatus.</li>
<li>Netlify: hostet diese Webseiten und kann technische Anfragedaten wie Ihre IP-Adresse verarbeiten.</li>
<li>Apple und Google: die App-Stores, die Abrechnung und die in Ihr Telefon integrierte Spracherkennung.</li>
</ul>
<p>Einige Dienstleister, etwa Anthropic und RevenueCat, verarbeiten Daten in den USA; andere können Daten außerhalb Ihres Landes verarbeiten, auch außerhalb des Europäischen Wirtschaftsraums, des Vereinigten Königreichs, der Schweiz und der Türkei. Verlangt das Recht für solche Übermittlungen Garantien, stützen wir uns auf die Datenschutzzusätze und internationalen Übermittlungsmechanismen (etwa Standardvertragsklauseln) aus den Standard-Nutzungsbedingungen dieser Dienstleister.</p>
<h2 data-sec="rights">10. Ihre Rechte</h2>
<p>Je nach Wohnort (zum Beispiel nach DSGVO / UK GDPR, dem Schweizer Datenschutzgesetz, dem österreichischen DSG, dem türkischen KVKK, dem indischen DPDP Act, dem kanadischen PIPEDA und Provinzrecht oder dem australischen Privacy Act) haben Sie möglicherweise das Recht auf Auskunft, Berichtigung, Löschung, Übertragung, Einschränkung der Verarbeitung oder Widerspruch sowie auf Widerruf einer Einwilligung. Ihr Konto können Sie in der App löschen. Für andere Anfragen schreiben Sie von Ihrer registrierten Adresse an nexulexai@gmail.com; wir antworten innerhalb der gesetzlichen Frist. Sie können sich außerdem bei der Datenschutzaufsichtsbehörde Ihres Landes beschweren.</p>
<h2 data-sec="children">11. Kinder, Werbung und Tracking</h2>
<p>NexuLex AI richtet sich an Erwachsene ab 18 Jahren und nicht an Kinder. Wir erheben wissentlich keine Daten von Kindern; melden Sie sich bei uns, dann löschen wir sie. Die App enthält keine Werbung und kein App-übergreifendes Tracking, und wir verkaufen keine personenbezogenen Daten.</p>
<h2 data-sec="analytics">12. Anonyme Nutzungs- und Fehlerberichte</h2>
<p>Damit die App zuverlässig bleibt und besser wird, kann NexuLex AI kurze anonyme Ereignisse senden: etwa welche Bereiche genutzt werden, ob eine Analyse abgeschlossen wurde oder fehlgeschlagen ist, Paywall- und Kaufergebnisse sowie die Art eines Fehlers. Jeder Bericht enthält eine zufällige Installations-ID, die auf Ihrem Gerät erzeugt wird (nicht die Hardware-ID Ihres Geräts), die App-Version, die Plattform und die App-Sprache. Berichte enthalten niemals Ihre Verträge, Texte, Bilder, E-Mail-Adresse, Telefonnummer oder Konto-ID und werden weder für Werbung genutzt noch verkauft.</p>
<p>Im Europäischen Wirtschaftsraum, im Vereinigten Königreich, in der Schweiz, in der Türkei, in Brasilien, Indien, Südkorea und Südafrika wird nichts gesendet, solange Sie nicht zustimmen. Anderswo ist die Funktion standardmäßig aktiv. Sie können das jederzeit unter <strong>Einstellungen → Datenschutz</strong> ändern; beim Ausschalten werden noch wartende Berichte auf Ihrem Gerät gelöscht. Die Berichte werden in Supabase gespeichert und nach spätestens 180 Tagen entfernt.</p>
<h2 data-sec="invite">13. Einladungscodes</h2>
<p>Wenn Sie angemeldet sind, erhalten Sie von NexuLex AI einen kurzen Einladungscode. Gibt ein Freund ihn ein, speichern wir die beiden Konto-IDs, die Gerätekennung des Freundes (dieselbe wie für das Kontingent kostenloser Analysen) und das Datum – ausschließlich, um die Bonus-Analysen zu gewähren und Missbrauch zu verhindern. Über Ihre Verträge wird nichts geteilt. Wenn Sie Ihr Konto löschen, werden Ihr Code und dessen Kontoverknüpfungen gelöscht; ein Eintrag ohne Konto-ID kann bestehen bleiben, damit dasselbe Gerät den Bonus nicht erneut erhält.</p>
<h2 data-sec="controller">14. Verantwortlicher und Rechtsgrundlagen</h2>
<p>Verantwortlicher für Ihre personenbezogenen Daten ist Doğancan Kara, Einzelunternehmer in Bağcılar, Istanbul, Türkei (E-Mail: nexulexai@gmail.com), Herausgeber von NexuLex AI. Soweit die DSGVO, die UK-DSGVO oder das Schweizer DSG gilt, stützen wir uns auf diese Rechtsgrundlagen: die Erfüllung unseres Vertrags mit Ihnen (Konto, Analysen, Kontingente und Käufe); unsere berechtigten Interessen (sicherer Betrieb des Dienstes, Verhinderung von Missbrauch des Gratis-Kontingents und Fehlerbehebung); Ihre Einwilligung (optionale Funktionen, die Sie einschalten, etwa anonyme Nutzungsberichte, wo eine Einwilligung erforderlich ist); sowie gesetzliche Pflichten, soweit sie gelten. Sie können Ihre Einwilligung jederzeit widerrufen; die Rechtmäßigkeit der bisherigen Verarbeitung bleibt unberührt. Gelten andere Datenschutzgesetze, stützen wir uns auf die dort vorgesehenen gleichwertigen Grundlagen.</p>
<h2 data-sec="security">15. Sicherheit</h2>
<p>Wir schützen Daten durch verschlüsselte Verbindungen (HTTPS), Kontoauthentifizierung und Row-Level-Security-Richtlinien in unserer Datenbank; KI-Anfragen laufen über unseren Server und nicht direkt aus der App. Kein System ist vollkommen sicher, bitte schützen Sie daher Ihre Zugangsdaten. Betrifft Sie eine Verletzung des Schutzes personenbezogener Daten, informieren wir Sie und die Behörden, soweit das Gesetz es verlangt.</p>
<h2 data-sec="templates">16. Vertragsvorlagen</h2>
<p>Die Vertragsbibliothek (Tab Berater) füllt quelloffene Vertragsvorlagen auf Ihrem Gerät aus. Die Angaben, die Sie in das Formular eintragen, dienen nur dazu, das Dokument auf dem Bildschirm zu erstellen, und werden nur für diese Sitzung im Arbeitsspeicher der App gehalten; sie werden weder an unsere Server noch an unseren KI-Anbieter oder an andere gesendet und nicht in Ihrem Konto gespeichert. Das Dokument verlässt Ihr Gerät nur, wenn Sie es selbst kopieren, teilen oder exportieren. Die Vorlagentexte sind in der App enthalten und werden von General Legal unter der gemeinfreien Lizenz CC0-1.0 veröffentlicht.</p>
<h2 data-sec="retention">17. Aufbewahrungsfristen</h2>
<p>So lange speichern wir Daten auf unseren Servern:</p>
<table>
<thead><tr><th>Daten</th><th>Dauer</th></tr></thead>
<tbody>
<tr><td>Konto und Profil</td><td>Bis Sie Ihr Konto löschen</td></tr>
<tr><td>Gespeicherte Analysen und Vertragstext</td><td>Bis Sie sie oder Ihr Konto löschen</td></tr>
<tr><td>Kurzbericht- und Freigabecodes</td><td>Bis zum Ende der angegebenen Gültigkeit; ein abgelaufener Code funktioniert automatisch nicht mehr</td></tr>
<tr><td>Support-Nachrichten</td><td>Höchstens 24 Monate oder bis Sie Ihr Konto löschen</td></tr>
<tr><td>Anonyme Nutzungs- und Fehlerberichte</td><td>Höchstens 180 Tage</td></tr>
<tr><td>Eintrag zum Gratis-Kontingent (Gerätekennung und Telefonnummer, ohne Verknüpfung mit Ihrem Konto)</td><td>Kein festes Ende; nur zur Verhinderung wiederholten Missbrauchs des Gratis-Kontingents gespeichert</td></tr>
<tr><td>Tarif und Ablaufdatum in Ihrem Profil</td><td>Bis Sie Ihr Konto löschen; Kaufdaten bei Apple, Google und RevenueCat unterliegen deren eigenen Richtlinien</td></tr>
<tr><td>Daten auf Ihrem Gerät (Verlauf, Fallakten, Antworten, Entwürfe)</td><td>Bis Sie sie löschen oder die App deinstallieren</td></tr>
</tbody>
</table>
<h2 data-sec="kvkk">18. Türkei: KVKK-Informationen (Gesetz Nr. 6698)</h2>
<p>Wenn Sie sich in der Türkei befinden, sind dies unsere Informationen nach Artikel 10 des türkischen Datenschutzgesetzes Nr. 6698 (KVKK). Verantwortlicher: Doğancan Kara (Einzelunternehmer), Bağcılar, Istanbul, Türkei; E-Mail: nexulexai@gmail.com.</p>
<p>Zwecke: Einrichtung und Betrieb Ihres Kontos, Analyse der von Ihnen eingereichten Verträge, Durchsetzung von Kontingenten, Abwicklung von Käufen, Support, sicherer Betrieb und Missbrauchsabwehr sowie die Erfüllung rechtlicher Pflichten. Rechtsgrundlagen (Artikel 5): Vertragserfüllung, berechtigte Interessen des Verantwortlichen, ausdrückliche Einwilligung, wo sie erforderlich ist (etwa bei optionalen anonymen Nutzungsberichten), und rechtliche Verpflichtungen. Erhebung: Ihre eigenen Eingaben und die automatische Erfassung über die App, auf elektronischem Weg.</p>
<p>Empfänger und Übermittlungen: Ihre Daten werden von den in Abschnitt 9 genannten Dienstleistern verarbeitet, teils außerhalb der Türkei (Supabase in der Europäischen Union, Anthropic und RevenueCat in den USA). Übermittlungen ins Ausland erfolgen nach Artikel 9 des KVKK. Wir verkaufen Ihre Daten nicht.</p>
<p>Ihre Rechte nach Artikel 11: zu erfahren, ob Daten verarbeitet werden, und Auskunft zu verlangen; Zweck und zweckgemäße Nutzung zu erfahren; die Dritten zu kennen, an die Daten im In- oder Ausland übermittelt werden; die Berichtigung unvollständiger oder falscher Daten zu verlangen; nach Artikel 7 Löschung oder Vernichtung zu verlangen und die Mitteilung an Dritte zu fordern; einem für Sie nachteiligen Ergebnis zu widersprechen, das ausschließlich aus automatisierter Analyse stammt; und Ersatz für Schäden durch rechtswidrige Verarbeitung zu verlangen.</p>
<p>Für einen Antrag schreiben Sie von Ihrer registrierten Adresse an nexulexai@gmail.com und beschreiben Ihr Anliegen. Wir antworten spätestens innerhalb von 30 Tagen. Sind Sie nicht zufrieden, können Sie sich bei der türkischen Datenschutzbehörde (Kişisel Verileri Koruma Kurulu) beschweren. Hochgeladene Verträge können Daten Dritter enthalten; Sie müssen zur Verarbeitung berechtigt sein.</p>
<h2 data-sec="ccpa">19. USA: Datenschutzrechte in Kalifornien und anderen Bundesstaaten</h2>
<p>Wir verkaufen Ihre personenbezogenen Daten nicht und geben sie nicht für kontextübergreifende verhaltensbasierte Werbung weiter. Die App enthält keine Werbung; deshalb gibt es auch keine Einstellung „Meine personenbezogenen Daten nicht verkaufen oder weitergeben“.</p>
<p>Wenn Sie in Kalifornien oder einem anderen US-Bundesstaat mit Verbraucherdatenschutzgesetz leben (zum Beispiel CCPA/CPRA), haben Sie, soweit dieses Gesetz auf uns anwendbar ist, möglicherweise das Recht zu erfahren, welche personenbezogenen Daten wir erheben, nutzen und offenlegen; sie einzusehen, zu berichtigen und zu löschen; die Nutzung sensibler Daten einzuschränken; und wegen der Ausübung dieser Rechte nicht benachteiligt zu werden.</p>
<p>In den vergangenen zwölf Monaten haben wir diese Kategorien erhoben: Kennungen (E-Mail-Adresse, Telefonnummer, Geräte- und Installationskennungen); kommerzielle Angaben (Tarif- und Kaufstatus); App-Aktivität (anonyme Nutzungsereignisse); und von Ihnen übermittelte Inhalte (Verträge und Fragen). Wir legen sie nur gegenüber den Dienstleistern in Abschnitt 9 offen, für die in dieser Richtlinie beschriebenen geschäftlichen Zwecke. Ihre Sprachaufnahmen speichern wir nicht.</p>
<p>Zur Ausübung Ihrer Rechte schreiben Sie von Ihrer registrierten Adresse an nexulexai@gmail.com. Wir können Angaben zur Überprüfung Ihrer Identität verlangen, Sie können einen Bevollmächtigten einsetzen, und wir antworten innerhalb von 45 Tagen, soweit das Gesetz es verlangt.</p>
<h2 data-sec="changes">20. Änderungen dieser Richtlinie</h2>
<p>Wir können diese Datenschutzrichtlinie aktualisieren. Bei wesentlichen Änderungen ändern wir das Datum oben und informieren Sie, soweit gesetzlich erforderlich, vor Geltung der Änderung in der App oder auf andere geeignete Weise. Bitte sehen Sie diese Seite von Zeit zu Zeit durch.</p>
<h2 data-sec="language">21. Sprachen</h2>
<p>Diese Richtlinie ist der Einfachheit halber in mehreren Sprachen verfügbar. Weicht eine Übersetzung von der englischen Fassung ab, gilt die englische Fassung.</p>
<p lang="en" dir="ltr">In case of discrepancies, the English version shall prevail.</p>
<h2>22. Kontakt</h2>
<p>Fragen zum Datenschutz und Anträge zu Ihren Daten: schreiben Sie an nexulexai@gmail.com oder nutzen Sie den Support in der App. Herausgeber und Verantwortlicher: Doğancan Kara (Einzelunternehmer), Bağcılar, Istanbul, Türkei.</p>`,

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
<p class="meta">Stand: 21. Oktober 2026. Diese Übersetzung dient der Verständlichkeit. Maßgeblich ist der englische Text.</p>
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
<h2 data-sec="templates">13. Vertragsvorlagen</h2>
<p>Die Vertragsbibliothek (Tab Berater) bietet allgemeine Geschäftsvertragsvorlagen, die General Legal unter der gemeinfreien Lizenz CC0-1.0 veröffentlicht hat. NexuLex AI setzt Ihre Angaben ein und lässt den Rest jeder Vorlage unverändert im englischen Originalwortlaut. Die Vorlagen sind nicht auf Ihre Situation, Ihr Land oder Ihre Branche zugeschnitten und sind an Ihrem Ort möglicherweise nicht wirksam oder durchsetzbar. Sie werden „wie besehen“ ohne Gewähr bereitgestellt. Lassen Sie jeden Vertrag vor der Unterzeichnung von einer im maßgeblichen Recht zugelassenen Anwältin oder einem Anwalt prüfen. NexuLex AI ist nicht Partei eines von Ihnen erstellten Vertrags, und die Vertragsbibliothek begründet kein Mandatsverhältnis. Vollständiges Dokument, Word-Export, Kopieren und Teilen gehören zum Pro-Tarif; kostenlose Nutzer sehen eine Vorschau.</p>
<h2 data-sec="law">14. Anwendbares Recht und Gerichtsstand</h2>
<p>Diese Bedingungen unterliegen dem Recht der Republik Türkei. Zuständig sind die Gerichte und Vollstreckungsämter in Istanbul (Çağlayan); zwingende Verbraucherschutzrechte, die Ihnen nach dem Recht Ihres Wohnsitzlandes zustehen, einschließlich des Rechts, dort das zuständige Gericht oder die zuständige Stelle anzurufen, bleiben unberührt.</p>
<h2 data-sec="language">15. Sprachen</h2>
<p>Diese Bedingungen sind der Einfachheit halber in mehreren Sprachen verfügbar. Weicht eine Übersetzung von der englischen Fassung ab, gilt die englische Fassung.</p>
<p lang="en" dir="ltr">In case of discrepancies, the English version shall prevail.</p>
<h2>16. Kontakt</h2>
<p>Für Konto-, Produkt- und Verbraucherfragen nutzen Sie den Support in der App oder schreiben Sie an nexulexai@gmail.com. Herausgeber: Doğancan Kara (Einzelunternehmer), Bağcılar, Istanbul, Türkei.</p>`,
};
