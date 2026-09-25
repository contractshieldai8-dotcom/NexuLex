// WAVE ST.3 — Privacy + verwijderen (NL).
module.exports = {
  privacy: `<h1>Privacybeleid</h1>
<p class="meta">Bijgewerkt: 25 september 2026. Vertaling ter verduidelijking. De Engelse tekst is leidend.</p>
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
<h2>7. Contact</h2>
<p>Privacyvragen: gebruik het Support-scherm in de app of schrijf de uitgever op de winkelvermelding.</p>`,

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
};
