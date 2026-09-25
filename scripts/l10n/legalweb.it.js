// WAVE ST.3 — Privacy + cancellazione (IT).
module.exports = {
  privacy: `<h1>Informativa sulla privacy</h1>
<p class="meta">Aggiornato: 25 settembre 2026. Traduzione di comodo. Fa fede il testo inglese.</p>
<p>Questa informativa spiega come NexuLex AI («noi», «l app») tratta le informazioni nell applicazione mobile e nei visualizzatori web collegati.</p>
<h2>1. Dati che trattiamo</h2>
<ul>
<li>Dati dell account come e-mail e identificativi di autenticazione.</li>
<li>Testo del contratto, immagini o PDF che carichi o incolli per l analisi.</li>
<li>Foto e PDF si scelgono nel selettore di sistema. Non vengono acquisiti in background.</li>
<li>Esiti di analisi, brief, promemoria e messaggi di supporto che crei.</li>
<li>Stato di acquisto e diritti degli store via RevenueCat. Il nostro server chiede a RevenueCat quale piano (Pro o Professional) ha l account e salva solo quel piano e la scadenza sul profilo.</li>
<li>Segnali di dispositivo e diagnostica necessari per far funzionare il servizio in sicurezza.</li>
</ul>
<h2>2. Archiviazione cloud (Supabase)</h2>
<p>I dati prodotto autenticati sono in Supabase (PostgreSQL e servizi cloud collegati). L accesso e limitato da autenticazione e regole di sicurezza per riga. I brief condivisi usano codici di breve durata e non includono il contratto originale.</p>
<h2>3. Come usiamo i dati</h2>
<ul>
<li>Analizzare contratti, generare report e gestire i posti advisor / nucleo.</li>
<li>Applicare i tetti gratuiti e Pro e ripristinare gli acquisti.</li>
<li>Inviare i promemoria locali facoltativi che programmi sul dispositivo.</li>
<li>Rispondere alle richieste di supporto che invii.</li>
</ul>
<h2>4. Trattamento IA</h2>
<p>Il contenuto del contratto che invii puo andare al nostro proxy IA cloud per l analisi. Non vendiamo i tuoi contratti. Non caricare informazioni che non sei autorizzato a trattare.</p>
<p>Domande legali e strumenti Professional (cronologia, elenco issues, nota di ricerca): domanda, fatti, materiale del fascicolo e file allegato (senza prove) viaggiano su connessione cifrata attraverso il nostro server al fornitore IA solo per creare la risposta. Il nostro server conserva solo un conteggio giornaliero di domande e esecuzioni Professional, non il tuo testo ne l output IA. Risposte, risultati e fascicoli restano sul dispositivo finche non li salvi altrove o li condividi.</p>
<p>Puoi segnalare un output IA dal report di analisi, da una risposta dell advisor o da una bozza rivista. La segnalazione memorizza il motivo, la nota facoltativa, l id, la lingua dell app e il paese scelto. Il testo del contratto o della risposta (fino a 2000 caratteri) si allega solo se attivi «Includi il contesto del contratto».</p>
<p>Trova un avvocato: il primo messaggio e il pacchetto del fascicolo si creano sul dispositivo senza IA e non vanno ai nostri server ne a un avvocato. Lasciano il dispositivo solo se li copi o li condividi tu. I link delle directory aprono i siti ufficiali di ordini e enti pubblici, con proprie informative. NexuLex non passa i tuoi dati agli avvocati e non riceve commissioni di segnalazione.</p>
<h2>5. Conservazione e cancellazione</h2>
<p>Puoi cancellare l account in qualsiasi momento nell app in <strong>Impostazioni, poi Elimina account</strong>, oppure con i passi della <a href="delete-account.html">pagina di cancellazione</a> (senza app). La cancellazione rimuove account e profilo, analisi e testi di contratto, codici di condivisione, promemoria, posti advisor / nucleo e brief, messaggi di supporto e segnalazioni IA. Sul dispositivo della cancellazione in-app si svuotano anche promemoria pianificati, cache locali e file esportati.</p>
<p>Dopo la cancellazione, identificativo del dispositivo e numero usati per la quota gratuita restano senza alcun legame con l account, solo per bloccare richieste gratuite ripetute.</p>
<p>Un abbonamento App Store / Google Play attivo non si disdice automaticamente con la cancellazione; disdicilo nell account dello store. I codici brief scadono da soli dopo la finestra indicata.</p>
<h2>6. Avvertenza legale</h2>
<p><strong>NexuLex AI non e uno studio legale e non fornisce consulenza legale.</strong> Gli output sono strumenti informativi generali. Le decisioni restano tue; consulta un avvocato abilitato per la tua pratica.</p>
<h2>7. Contatti</h2>
<p>Domande sulla privacy: usa la schermata Supporto nell app o contatta l editore indicato sulla scheda store.</p>`,

  deleteAccount: `<h1>Elimina il tuo account NexuLex AI</h1>
<p class="meta">Aggiornato: 25 settembre 2026. Traduzione di comodo. Fa fede il testo inglese.</p>
<h2>Nell app (il piu veloce)</h2>
<ol>
<li>Apri NexuLex AI e accedi.</li>
<li>Vai su <strong>Impostazioni</strong> e tocca <strong>Elimina account</strong>.</li>
<li>Leggi l avviso e conferma due volte. L eliminazione parte subito e vieni disconnesso.</li>
</ol>
<p class="warn"><strong>Gli abbonamenti non si disdicono automaticamente.</strong> Disdici un piano attivo in
<a href="https://apps.apple.com/account/subscriptions">abbonamenti App Store</a> o
<a href="https://play.google.com/store/account/subscriptions">abbonamenti Google Play</a>.</p>
<h2>Senza l app</h2>
<p>Scrivi a <a href="mailto:nexulexai@gmail.com?subject=Account%20deletion%20request">nexulexai@gmail.com</a> dall indirizzo registrato il testo «Delete my account» / «Elimina il mio account». Confermiamo via e-mail e completiamo l eliminazione entro 30 giorni.</p>
<h2>Cosa viene eliminato</h2>
<ul>
<li>Account e profilo (e-mail, identificativi, stato Pro).</li>
<li>Analisi e testi di contratto, codici di condivisione, promemoria, posti advisor / nucleo e brief.</li>
<li>Messaggi di supporto e segnalazioni IA inviati.</li>
<li>Sul dispositivo della cancellazione in-app: promemoria pianificati, cache locali e file esportati.</li>
</ul>
<h2>Cosa resta</h2>
<p>Identificativo del dispositivo e numero usati per la quota gratuita di analisi restano senza legame con l account, solo per bloccare richieste gratuite ripetute. Gli acquisti presso Apple, Google e RevenueCat seguono le loro regole.</p>
<p>Vedi anche l <a href="privacy.html">informativa sulla privacy</a>.</p>`,
};
