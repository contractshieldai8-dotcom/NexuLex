// WAVE ST.3 — Privacy + verwijderen (NL).
module.exports = {
  privacy: `<h1>Privacybeleid</h1>
<p class="meta">Bijgewerkt: 21 oktober 2026. Vertaling ter verduidelijking. De Engelse tekst is leidend.</p>
<p>Dit beleid legt uit hoe NexuLex AI («wij», «de app») gegevens verwerkt in de mobiele app en de bijbehorende webweergaven.</p>
<h2>1. Gegevens die we verwerken</h2>
<ul>
<li>Accountgegevens zoals e-mail en aanmeld-identificatoren.</li>
<li>Contracttekst, afbeeldingen of pdfs die u uploadt of plakt voor analyse.</li>
<li>Foto's en pdfs kiest u in de systeemkiezer. Ze worden niet op de achtergrond genomen.</li>
<li>Analyseresultaten, briefs, herinneringen en supportberichten die u maakt.</li>
<li>Aankoop- en rechtenstatus van de winkels via RevenueCat. Onze server vraagt RevenueCat welk abonnement (Pro of Professional) uw account heeft en slaat alleen dat abonnement en de einddatum op het profiel op.</li>
<li>Basis apparaat- en diagnosignalen die de dienst veilig laten draaien.</li>
</ul>
<h2>2. Cloudopslag (Supabase)</h2>
<p>Geauthenticeerde productgegevens staan in Supabase (PostgreSQL en bijbehorende clouddiensten). Toegang is beperkt door aanmelding en beveiliging per rij. Gedeelde briefs gebruiken kortlevende codes en bevatten de oorspronkelijke contracttekst niet.</p>
<h2>3. Hoe we gegevens gebruiken</h2>
<ul>
<li>Contracten analyseren, rapporten maken en adviseur- / huishoudplekken beheren.</li>
<li>Gratis- en Pro-quota afdwingen en aankopen herstellen.</li>
<li>Optionele lokale herinneringen sturen die u op het apparaat plant.</li>
<li>Reageren op supportverzoeken die u instuurt.</li>
</ul>
<h2>4. AI-verwerking</h2>
<p>Contractinhoud die u instuurt kan voor analyse naar onze cloud-AI-proxy gaan. We verkopen uw contracten niet. Upload geen informatie die u niet mag verwerken.</p>
<p>Juridische vragen en de Professional-hulpmiddelen (chronologie, kwestielijst, onderzoeksnotitie): uw vraag, feiten, dossierstof en een bijgevoegd dossier (zonder bewijsbestanden) gaan alleen om het antwoord te maken via een versleutelde verbinding door onze server naar de AI-aanbieder. Onze server bewaart alleen een dagelijkse telling van vragen en Professional-runs, niet uw tekst en niet de AI-uitvoer. Antwoorden, resultaten en dossiers blijven op uw apparaat tot u ze ergens anders bewaart of deelt.</p>
<p>U kunt een AI-uitvoer melden vanuit het analyserapport, een adviseurantwoord of een bijgewerkte concepttekst. Een melding bewaart de reden, uw optionele notitie, het item-id, de app-taal en het gekozen land. Contract- of antwoordtekst (maximaal 2000 tekens) wordt alleen bijgevoegd als u «Contractcontext toevoegen» aanzet.</p>
<p>Advocaat vinden: het eerste bericht en het dossierpakket ontstaan zonder AI op uw apparaat en gaan niet naar onze servers of naar een advocaat. Ze verlaten het apparaat alleen als u zelf kopieert of deelt. Directorylinks openen officiële sites van balies en overheidsorganen met eigen privacyregels. NexuLex geeft uw gegevens niet door aan advocaten en ontvangt geen doorverwijzingsvergoeding.</p>
<h2>5. Bewaartermijn en verwijdering</h2>
<p>U kunt het account altijd in de app verwijderen via <strong>Instellingen, daarna Account verwijderen</strong>, of via de stappen op de <a href="delete-account.html">verwijderpagina</a> (zonder app). Verwijdering haalt account en profiel weg, opgeslagen analyses en contracttekst, deelcodes, herinneringen, adviseur- / huishoudplekken en briefs, supportberichten en AI-meldingen. Op het apparaat van de in-app-verwijdering worden geplande herinneringen, lokale caches en geëxporteerde bestanden ook gewist.</p>
<p>Na verwijdering blijven het apparaatkenmerk en het telefoonnummer van het gratis quotum zonder koppeling met uw account bewaard, alleen om herhaalde gratis claims te blokkeren.</p>
<p>Een actief App Store- of Google Play-abonnement wordt niet automatisch opgezegd bij accountverwijdering; zeg het op in het winkelaccount. Briefcodes verlopen vanzelf na het genoemde venster.</p>
<h2>6. Juridische waarschuwing</h2>
<p><strong>NexuLex AI is geen advocatenkantoor en geeft geen juridisch advies.</strong> Uitvoer is algemene informatiehulpmiddelen. Beslissingen blijven van u; raadpleeg een bevoegde advocaat voor uw zaak.</p>
<h2 data-sec="signup">7. Aanmeldgegevens</h2>
<p>Bij het aanmelden geeft u een e-mailadres en een telefoonnummer op. Het telefoonnummer en een apparaat-ID worden gebruikt om het gratis analysetegoed te claimen en herhaald misbruik te voorkomen. Ze worden niet voor advertenties gebruikt en niet verkocht.</p>
<h2 data-sec="voice">8. Spraakinvoer</h2>
<p>Spraakinvoer is optioneel. Als u de microfoon gebruikt, wordt spraakherkenning uitgevoerd door de spraakdienst die in uw telefoon is ingebouwd (Apple of Google), volgens de privacyvoorwaarden van die aanbieder. NexuLex AI neemt uw audio niet op en bewaart die niet; het ontvangt alleen de tekst die u wilt gebruiken.</p>
<h2 data-sec="transfer">9. Dienstverleners en internationale doorgifte</h2>
<p>Voor het draaien van NexuLex AI gebruiken wij deze dienstverleners:</p>
<ul>
<li>Supabase: clouddatabase, inloggen en serverfuncties. Ons project wordt gehost in de Europese Unie (Frankfurt, Duitsland).</li>
<li>Anthropic (Claude-API, Verenigde Staten): analyse en antwoorden, uitsluitend bereikbaar via onze server.</li>
<li>RevenueCat (Verenigde Staten): aankoop- en abonnementsstatus.</li>
<li>Netlify: host deze webpagina’s en kan technische verzoekgegevens zoals uw IP-adres verwerken.</li>
<li>Apple en Google: de appstores, de facturering en de spraakherkenning die in uw telefoon is ingebouwd.</li>
</ul>
<p>Sommige dienstverleners, zoals Anthropic en RevenueCat, verwerken gegevens in de Verenigde Staten en andere kunnen gegevens buiten uw land verwerken, ook buiten de Europese Economische Ruimte, het Verenigd Koninkrijk, Zwitserland en Turkije. Waar de wet voor zulke doorgifte waarborgen eist, vertrouwen wij op de gegevensbeschermingsaddenda en internationale doorgiftemechanismen (zoals standaardcontractbepalingen) uit de standaardvoorwaarden van deze dienstverleners.</p>
<h2 data-sec="rights">10. Uw rechten</h2>
<p>Afhankelijk van waar u woont (bijvoorbeeld onder de AVG / UK GDPR, de Zwitserse FADP, de Oostenrijkse DSG, de Turkse KVKK, de Indiase DPDP Act, de Canadese PIPEDA en provinciale wetten of de Australische Privacy Act) heeft u mogelijk het recht op inzage, correctie, verwijdering, overdraagbaarheid, beperking van de verwerking of bezwaar, en op intrekking van uw toestemming. U kunt uw account in de app verwijderen. Voor andere verzoeken schrijft u vanaf uw geregistreerde adres naar nexulexai@gmail.com; wij antwoorden binnen de wettelijke termijn. U kunt ook een klacht indienen bij de gegevensbeschermingsautoriteit van uw land.</p>
<h2 data-sec="children">11. Kinderen, advertenties en tracking</h2>
<p>NexuLex AI is bedoeld voor volwassenen van 18 jaar of ouder en richt zich niet op kinderen. Wij verzamelen niet bewust gegevens van kinderen; neem contact op en wij verwijderen ze. De app bevat geen advertenties en geen tracking tussen apps, en wij verkopen geen persoonsgegevens.</p>
<h2 data-sec="analytics">12. Anonieme gebruiks- en foutrapporten</h2>
<p>Om de app betrouwbaar te houden en te verbeteren, kan NexuLex AI korte anonieme gebeurtenissen versturen: bijvoorbeeld welke onderdelen worden gebruikt, of een analyse is voltooid of mislukt, de uitkomsten van het abonnementsscherm en aankopen, en het type fout. Elk rapport bevat een willekeurige installatie-ID die op je apparaat wordt aangemaakt (niet de hardware-ID van je apparaat), de appversie, het platform en de taal van de app. Rapporten bevatten nooit je contracten, teksten, afbeeldingen, e-mailadres, telefoonnummer of account-ID en worden niet gebruikt voor reclame of verkocht.</p>
<p>In de Europese Economische Ruimte, het Verenigd Koninkrijk, Zwitserland, Turkije, Brazilië, India, Zuid-Korea en Zuid-Afrika wordt niets verzonden tenzij je dat toestaat. Elders staat het standaard aan. Je kunt dit op elk moment wijzigen via <strong>Instellingen → Privacy</strong>; uitzetten verwijdert rapporten die nog op je apparaat wachten. Rapporten worden opgeslagen in Supabase en uiterlijk na 180 dagen verwijderd.</p>
<h2 data-sec="invite">13. Uitnodigingscodes</h2>
<p>Als u bent ingelogd, geeft NexuLex AI u een korte uitnodigingscode. Wanneer een vriend die invoert, slaan we de twee account-ID’s, de apparaat-ID van de vriend (dezelfde als voor het quotum gratis analyses) en de datum op, uitsluitend om de bonusanalyses toe te kennen en misbruik te voorkomen. Er wordt niets over uw contracten gedeeld. Als u uw account verwijdert, worden uw code en de koppelingen met accounts verwijderd; er kan een record zonder account-ID blijven bestaan zodat hetzelfde apparaat de bonus niet opnieuw kan claimen.</p>
<h2 data-sec="controller">14. Verwerkingsverantwoordelijke en rechtsgronden</h2>
<p>De verwerkingsverantwoordelijke voor uw persoonsgegevens is Doğancan Kara, eenmanszaak in Bağcılar, Istanbul, Turkije (e-mail: nexulexai@gmail.com), uitgever van NexuLex AI. Waar de AVG, de UK GDPR of de Zwitserse FADP van toepassing is, steunen wij op deze rechtsgronden: de uitvoering van onze overeenkomst met u (uw account, analyses, tegoeden en aankopen); onze gerechtvaardigde belangen (de dienst veilig laten werken, misbruik van het gratis tegoed voorkomen en fouten herstellen); uw toestemming (optionele functies die u inschakelt, zoals anonieme gebruiksrapporten waar toestemming vereist is); en wettelijke verplichtingen waar die gelden. U kunt uw toestemming op elk moment intrekken; dat heeft geen invloed op eerdere verwerking. Waar andere wetten voor gegevensbescherming gelden, steunen wij op de gelijkwaardige gronden die zij bieden.</p>
<h2 data-sec="security">15. Beveiliging</h2>
<p>Wij beschermen gegevens met versleutelde verbindingen (HTTPS), accountauthenticatie en beveiligingsbeleid op rijniveau in onze database; AI-verzoeken lopen via onze server en niet rechtstreeks vanuit de app. Geen enkel systeem is volledig veilig, bewaar uw inloggegevens dus zorgvuldig. Als een inbreuk op persoonsgegevens u raakt, informeren wij u en de autoriteiten waar de wet dat vereist.</p>
<h2 data-sec="templates">16. Contractsjablonen</h2>
<p>De contractbibliotheek (tabblad Adviseur) vult open-source contractsjablonen in op uw apparaat. De gegevens die u in het formulier typt, worden alleen gebruikt om het document op het scherm op te bouwen en blijven voor die sessie alleen in het geheugen van de app; ze worden niet verzonden naar onze servers, onze AI-aanbieder of iemand anders en worden niet in uw account opgeslagen. Het document verlaat uw apparaat alleen wanneer u het zelf kopieert, deelt of exporteert. De sjabloonteksten worden met de app meegeleverd en door General Legal gepubliceerd onder de publiekdomeinlicentie CC0-1.0.</p>
<h2 data-sec="retention">17. Bewaartermijnen</h2>
<p>Hoe lang wij gegevens op onze servers bewaren:</p>
<table>
<thead><tr><th>Gegevens</th><th>Termijn</th></tr></thead>
<tbody>
<tr><td>Account en profiel</td><td>Tot u uw account verwijdert</td></tr>
<tr><td>Opgeslagen analyses en contracttekst</td><td>Tot u ze of uw account verwijdert</td></tr>
<tr><td>Samenvattings- en deelcodes</td><td>Tot het einde van de vermelde geldigheid; een verlopen code werkt automatisch niet meer</td></tr>
<tr><td>Supportberichten</td><td>Maximaal 24 maanden, of tot u uw account verwijdert</td></tr>
<tr><td>Anonieme gebruiks- en foutrapporten</td><td>Maximaal 180 dagen</td></tr>
<tr><td>Registratie van het gratis tegoed (apparaat-ID en telefoonnummer, zonder enige koppeling aan uw account)</td><td>Geen vaste einddatum; alleen bewaard om herhaald misbruik van het gratis tegoed te voorkomen</td></tr>
<tr><td>Abonnement en einddatum in uw profiel</td><td>Tot u uw account verwijdert; aankoopgegevens bij Apple, Google en RevenueCat volgen hun eigen beleid</td></tr>
<tr><td>Gegevens op uw apparaat (geschiedenis, dossiers, antwoorden, concepten)</td><td>Tot u ze verwijdert of de app verwijdert</td></tr>
</tbody>
</table>
<h2 data-sec="kvkk">18. Turkije: KVKK-informatie (wet nr. 6698)</h2>
<p>Bevindt u zich in Turkije, dan is dit onderdeel onze informatieverstrekking op grond van artikel 10 van de Turkse wet nr. 6698 op de bescherming van persoonsgegevens (KVKK). Verwerkingsverantwoordelijke: Doğancan Kara (eenmanszaak), Bağcılar, Istanbul, Turkije; e-mail: nexulexai@gmail.com.</p>
<p>Doeleinden: het aanmaken en laten werken van uw account, het analyseren van de contracten die u indient, het toepassen van tegoeden, het verwerken van aankopen, support, het veilig houden van de dienst en het voorkomen van misbruik, en het nakomen van wettelijke verplichtingen. Rechtsgronden (artikel 5): uitvoering van een overeenkomst, gerechtvaardigde belangen van de verantwoordelijke, uitdrukkelijke toestemming waar die vereist is (bijvoorbeeld bij optionele anonieme gebruiksrapporten) en wettelijke verplichtingen. Wijze van verzameling: wat u zelf invoert en automatische verzameling via de app, langs elektronische weg.</p>
<p>Ontvangers en doorgifte: uw gegevens worden verwerkt door de dienstverleners uit sectie 9, sommige buiten Turkije (Supabase in de Europese Unie, Anthropic en RevenueCat in de Verenigde Staten). Doorgifte naar het buitenland gebeurt overeenkomstig artikel 9 van de KVKK. Wij verkopen uw gegevens niet.</p>
<p>Uw rechten op grond van artikel 11: weten of uw gegevens worden verwerkt en informatie vragen; het doel kennen en of ze overeenkomstig worden gebruikt; de derden kennen aan wie ze in Turkije of in het buitenland worden doorgegeven; correctie van onvolledige of onjuiste gegevens vragen; verwijdering of vernietiging vragen op grond van artikel 7 en vragen dat derden worden ingelicht; bezwaar maken tegen een voor u nadelig resultaat dat uitsluitend uit geautomatiseerde analyse voortkomt; en schadevergoeding vragen voor schade door onrechtmatige verwerking.</p>
<p>Om een verzoek in te dienen, mailt u vanaf het adres waarmee u zich hebt geregistreerd naar nexulexai@gmail.com en beschrijft u uw verzoek. Wij antwoorden uiterlijk binnen 30 dagen. Bent u niet tevreden, dan kunt u een klacht indienen bij de Turkse gegevensbeschermingsautoriteit (Kişisel Verileri Koruma Kurulu). Contracten die u uploadt kunnen gegevens van anderen bevatten; u moet het recht hebben die te verwerken.</p>
<h2 data-sec="ccpa">19. Verenigde Staten: rechten in Californië en andere staten</h2>
<p>Wij verkopen uw persoonlijke gegevens niet en delen ze niet voor contextoverschrijdende gedragsgerichte reclame. De app bevat geen reclame, dus er is ook geen instelling “Mijn persoonlijke gegevens niet verkopen of delen” om in te schakelen.</p>
<p>Woont u in Californië of een andere Amerikaanse staat met een consumentenprivacywet (bijvoorbeeld de CCPA/CPRA), dan hebt u, voor zover die wet op ons van toepassing is, mogelijk het recht te weten welke persoonlijke gegevens wij verzamelen, gebruiken en openbaar maken; die in te zien, te corrigeren en te verwijderen; het gebruik van gevoelige persoonlijke gegevens te beperken; en niet te worden gediscrimineerd voor het uitoefenen van deze rechten.</p>
<p>In de afgelopen twaalf maanden hebben wij deze categorieën verzameld: identificatoren (e-mailadres, telefoonnummer, apparaat- en installatie-ID’s); commerciële gegevens (abonnements- en aankoopstatus); appactiviteit (anonieme gebruiksgebeurtenissen); en de inhoud die u indient (contracten en vragen). Wij maken ze alleen openbaar aan de dienstverleners in sectie 9, voor de zakelijke doeleinden die in dit beleid zijn beschreven. Wij slaan uw spraakopnamen niet op.</p>
<p>Om uw rechten uit te oefenen, mailt u vanaf het adres waarmee u zich hebt geregistreerd naar nexulexai@gmail.com. Wij kunnen om gegevens vragen om te controleren dat u het bent, u kunt een gemachtigde inschakelen en wij antwoorden binnen 45 dagen waar de wet dat vereist.</p>
<h2 data-sec="changes">20. Wijzigingen in dit beleid</h2>
<p>Wij kunnen dit privacybeleid bijwerken. Bij belangrijke wijzigingen passen wij de datum bovenaan aan en, waar de wet dat vereist, informeren wij u in de app of op een andere passende manier voordat de wijziging ingaat. Bekijk deze pagina af en toe.</p>
<h2 data-sec="language">21. Talen</h2>
<p>Dit beleid is voor het gemak in meerdere talen beschikbaar. Wijkt een vertaling af van de Engelse versie, dan prevaleert de Engelse versie.</p>
<p lang="en" dir="ltr">In case of discrepancies, the English version shall prevail.</p>
<h2>22. Contact</h2>
<p>Privacyvragen en verzoeken over uw gegevens: mail naar nexulexai@gmail.com of gebruik het Support-scherm in de app. Uitgever en verwerkingsverantwoordelijke: Doğancan Kara (eenmanszaak), Bağcılar, Istanbul, Turkije.</p>`,

  deleteAccount: `<h1>Verwijder uw NexuLex AI-account</h1>
<p class="meta">Bijgewerkt: 25 september 2026. Vertaling ter verduidelijking. De Engelse tekst is leidend.</p>
<h2>In de app (het snelst)</h2>
<ol>
<li>Open NexuLex AI en meld u aan.</li>
<li>Ga naar <strong>Instellingen</strong> en tik op <strong>Account verwijderen</strong>.</li>
<li>Lees de melding en bevestig twee keer. Verwijdering start meteen en u wordt afgemeld.</li>
</ol>
<p class="warn"><strong>Abonnementen worden niet automatisch opgezegd.</strong> Zeg een actief plan op in
<a href="https://apps.apple.com/account/subscriptions">App Store-abonnementen</a> of
<a href="https://play.google.com/store/account/subscriptions">Google Play-abonnementen</a>.</p>
<h2>Zonder de app</h2>
<p>Mail <a href="mailto:nexulexai@gmail.com?subject=Account%20deletion%20request">nexulexai@gmail.com</a> vanaf het geregistreerde adres de tekst «Delete my account» / «Verwijder mijn account». We bevestigen per e-mail en ronden de verwijdering binnen 30 dagen af.</p>
<h2>Wat wordt verwijderd</h2>
<ul>
<li>Account en profiel (e-mail, aanmeld-identificatoren, Pro-status).</li>
<li>Opgeslagen analyses en contracttekst, deelcodes, herinneringen, adviseur- / huishoudplekken en briefs.</li>
<li>Supportberichten en AI-meldingen die u stuurde.</li>
<li>Op het apparaat van de in-app-verwijdering: geplande herinneringen, lokale caches en geëxporteerde bestanden.</li>
</ul>
<h2>Wat blijft</h2>
<p>Het apparaatkenmerk en telefoonnummer van het gratis analysequotum blijven zonder koppeling met uw account, alleen om herhaalde gratis claims te blokkeren. Aankopen bij Apple, Google en RevenueCat volgen hun eigen regels.</p>
<p>Zie ook het <a href="privacy.html">privacybeleid</a>.</p>`,

  terms: `<h1>Gebruiksvoorwaarden (EULA)</h1>
<p class="meta">Bijgewerkt: 21 oktober 2026. Vertaling ter verduidelijking. De Engelse tekst is leidend.</p>
<p>Door NexuLex AI te downloaden of te gebruiken aanvaardt u deze voorwaarden en ons <a href="privacy.html">privacybeleid</a>.</p>
<h2>1. Dienstomschrijving</h2>
<p>NexuLex AI is consumentensoftware die helpt contracten te beoordelen, risico's te zien, tegen-taal te schetsen en beperkte alleen-lezen briefs te delen. De dienst wordt «zoals ze is» geleverd.</p>
<h2>2. Geen advocatenkantoor</h2>
<p><strong>NexuLex AI is geen advocatenkantoor en geeft geen juridisch advies.</strong> Niets in de app schept een advocaat-cliëntrelatie. Toets belangrijke beslissingen bij een bevoegde advocaat in uw land.</p>
<p>«Advocaat vinden» linkt alleen naar officiële lijsten van balies en overheidsorganen. NexuLex AI beveelt geen advocaten aan, rangschikt ze niet en verwijst niet door, ontvangt geen doorverwijzingsvergoeding en is niet verantwoordelijk voor de diensten van de advocaat die u kiest. Controleer inschrijving en honorarium voordat u opdracht geeft.</p>
<h2>3. Accounts en abonnementen</h2>
<ul>
<li>Gratis quota en Pro-rechten worden serverzijdig en via RevenueCat / de winkels afgedwongen.</li>
<li>Het Professional-plan bevat alles van Pro plus de Professional-hulpmiddelen en de hogere daglimieten in de app. Uw plan wordt door onze server met RevenueCat gecontroleerd; het kan niet vanuit de app worden gewijzigd.</li>
<li>De Professional-hulpmiddelen zijn werkhulpen, geen juridisch advies. Ze gebruiken alleen uw materiaal en kunnen fouten bevatten; controleer elke datum, elk feit en elke bron. NexuLex AI vertegenwoordigt niemand voor een rechter of instantie.</li>
<li>Facturatie, terugbetalingen en opzeggingen volgen de regels van App Store of Google Play.</li>
<li>U bent verantwoordelijk voor de veiligheid van uw inloggegevens.</li>
</ul>
<h2>4. Aanvaardbaar gebruik</h2>
<ul>
<li>Upload geen onrechtmatige inhoud of materiaal dat u niet mag verwerken.</li>
<li>Probeer beveiliging, quota of paywalls niet te omzeilen, te overbelasten of te ontleden.</li>
<li>Gebruik de dienst niet om te pesten, te frauderen of te misleiden.</li>
<li>Deel geen geheimen, inloggegevens of persoonsgegevens van derden zonder wettelijke grond.</li>
</ul>
<h2>5. Intellectuele eigendom</h2>
<p>Naam, merk en software van NexuLex AI zijn van de uitgever. Rechten op geüploade contracten blijven bij u. U geeft ons een beperkte licentie om die inhoud alleen te verwerken om de dienst te leveren.</p>
<h2>6. Gedeelde briefs en plekken</h2>
<p>Brieflinks en adviseur- / huishoudplekken zijn bedoeld om de oorspronkelijke contracttekst te verbergen. Ontvangers zien toch de analysesamenvattingen die u deelt. Wees voorzichtig voordat u codes maakt.</p>
<h2>7. Aansprakelijkheidsbeperking</h2>
<p>Voor zover de wet toestaat zijn wij niet aansprakelijk voor beslissingen op basis van app-uitvoer, fouten van derde-AI, winkelfactuurgeschillen of storingen buiten onze redelijke controle.</p>
<h2>8. Wijzigingen</h2>
<p>We kunnen deze voorwaarden bijwerken. Door na een update door te gaan, aanvaardt u de herziene tekst.</p>
<h2 data-sec="eligibility">9. Leeftijd</h2>
<p>Om NexuLex AI te gebruiken moet u minstens 18 jaar zijn of meerderjarig volgens de wet van uw woonplaats. Gebruikt u de app voor een bedrijf, dan bevestigt u dat u dat bedrijf mag binden.</p>
<h2 data-sec="renewal">10. Abonnementen en automatische verlenging</h2>
<p>Betaalde abonnementen worden automatisch verlengd voor dezelfde periode tegen de getoonde winkelprijs, totdat u opzegt. De betaling wordt afgeschreven van uw App Store- of Google Play-account. U kunt beheren of opzeggen in de instellingen van uw winkelaccount; in de App Store minstens 24 uur voor het einde van de lopende periode. Het verwijderen van uw NexuLex AI-account zegt een abonnement niet op. Terugbetalingen volgen het beleid van de winkel.</p>
<h2 data-sec="ai">11. Door AI gegenereerde uitvoer</h2>
<p>Analyses, antwoorden, concepten en samenvattingen worden door kunstmatige intelligentie gegenereerd. Ze kunnen onvolledig, verouderd of onjuist zijn, en het recht verschilt per land en verandert in de loop van de tijd. Controleer belangrijke punten bij officiële bronnen of een bevoegde advocaat voordat u erop vertrouwt.</p>
<h2 data-sec="termin">12. Schorsing en beëindiging</h2>
<p>U kunt NexuLex AI op elk moment niet meer gebruiken en uw account verwijderen. Wij kunnen toegang schorsen of beëindigen die deze voorwaarden schendt of de dienst of andere gebruikers in gevaar brengt.</p>
<h2 data-sec="templates">13. Contractsjablonen</h2>
<p>De contractbibliotheek (tabblad Adviseur) biedt algemene zakelijke contractsjablonen die General Legal publiceert onder de publiekdomeinlicentie CC0-1.0. NexuLex AI voegt de gegevens in die u typt en laat de rest van elk sjabloon ongewijzigd, in de oorspronkelijke Engelse formulering. De sjablonen zijn niet afgestemd op uw situatie, land of sector en zijn mogelijk niet geldig of afdwingbaar waar u zich bevindt. Ze worden geleverd “zoals ze zijn”, zonder garantie. Laat elk contract voor ondertekening controleren door een advocaat die bevoegd is in het toepasselijke rechtsgebied. NexuLex AI is geen partij bij een contract dat u maakt, en de contractbibliotheek schept geen relatie tussen advocaat en cliënt. Het volledige document, de Word-export, kopiëren en delen horen bij het Pro-abonnement; gratis gebruikers zien een voorbeeld.</p>
<h2 data-sec="law">14. Toepasselijk recht en bevoegde rechter</h2>
<p>Op deze voorwaarden is het recht van de Republiek Turkije van toepassing. De rechtbanken en uitvoeringskantoren van Istanbul (Çağlayan) zijn bevoegd, onverminderd de dwingende consumentenrechten die u hebt volgens het recht van uw woonland, waaronder het recht om daar naar de bevoegde rechter of instantie te stappen.</p>
<h2 data-sec="language">15. Talen</h2>
<p>Deze voorwaarden zijn voor het gemak in meerdere talen beschikbaar. Wijkt een vertaling af van de Engelse versie, dan prevaleert de Engelse versie.</p>
<p lang="en" dir="ltr">In case of discrepancies, the English version shall prevail.</p>
<h2>16. Contact</h2>
<p>Voor account-, product- en consumentenvragen gebruikt u het Support-scherm in de app of mailt u naar nexulexai@gmail.com. Uitgever: Doğancan Kara (eenmanszaak), Bağcılar, Istanbul, Turkije.</p>`,
};
