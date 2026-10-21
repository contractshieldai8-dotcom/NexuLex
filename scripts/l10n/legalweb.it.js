// WAVE ST.3 — Privacy + cancellazione (IT). WAVE B: accents and apostrophes restored.
module.exports = {
  privacy: `<h1>Informativa sulla privacy</h1>
<p class="meta">Aggiornato: 21 ottobre 2026. Traduzione di comodo. Fa fede il testo inglese.</p>
<p>Questa informativa spiega come NexuLex AI («noi», «l’app») tratta le informazioni nell’applicazione mobile e nei visualizzatori web collegati.</p>
<h2>1. Dati che trattiamo</h2>
<ul>
<li>Dati dell’account come e-mail e identificativi di autenticazione.</li>
<li>Testo del contratto, immagini o PDF che carichi o incolli per l’analisi.</li>
<li>Foto e PDF si scelgono nel selettore di sistema. Non vengono acquisiti in background.</li>
<li>Esiti di analisi, brief, promemoria e messaggi di supporto che crei.</li>
<li>Stato di acquisto e diritti degli store via RevenueCat. Il nostro server chiede a RevenueCat quale piano (Pro o Professional) ha l’account e salva solo quel piano e la scadenza sul profilo.</li>
<li>Segnali di dispositivo e diagnostica necessari per far funzionare il servizio in sicurezza.</li>
</ul>
<h2>2. Archiviazione cloud (Supabase)</h2>
<p>I dati prodotto autenticati sono in Supabase (PostgreSQL e servizi cloud collegati). L’accesso è limitato da autenticazione e regole di sicurezza per riga. I brief condivisi usano codici di breve durata e non includono il contratto originale.</p>
<h2>3. Come usiamo i dati</h2>
<ul>
<li>Analizzare contratti, generare report e gestire i posti advisor / nucleo.</li>
<li>Applicare i tetti gratuiti e Pro e ripristinare gli acquisti.</li>
<li>Inviare i promemoria locali facoltativi che programmi sul dispositivo.</li>
<li>Rispondere alle richieste di supporto che invii.</li>
</ul>
<h2>4. Trattamento IA</h2>
<p>Il contenuto del contratto che invii può andare al nostro proxy IA cloud per l’analisi. Non vendiamo i tuoi contratti. Non caricare informazioni che non sei autorizzato a trattare.</p>
<p>Domande legali e strumenti Professional (cronologia, elenco issues, nota di ricerca): domanda, fatti, materiale del fascicolo e file allegato (senza prove) viaggiano su connessione cifrata attraverso il nostro server al fornitore IA solo per creare la risposta. Il nostro server conserva solo un conteggio giornaliero di domande ed esecuzioni Professional, non il tuo testo né l’output IA. Risposte, risultati e fascicoli restano sul dispositivo finché non li salvi altrove o li condividi.</p>
<p>Puoi segnalare un output IA dal report di analisi, da una risposta dell’advisor o da una bozza rivista. La segnalazione memorizza il motivo, la nota facoltativa, l’id, la lingua dell’app e il paese scelto. Il testo del contratto o della risposta (fino a 2000 caratteri) si allega solo se attivi «Includi il contesto del contratto».</p>
<p>Trova un avvocato: il primo messaggio e il pacchetto del fascicolo si creano sul dispositivo senza IA e non vanno ai nostri server né a un avvocato. Lasciano il dispositivo solo se li copi o li condividi tu. I link delle directory aprono i siti ufficiali di ordini ed enti pubblici, con proprie informative. NexuLex non passa i tuoi dati agli avvocati e non riceve commissioni di segnalazione.</p>
<h2>5. Conservazione e cancellazione</h2>
<p>Puoi cancellare l’account in qualsiasi momento nell’app in <strong>Impostazioni, poi Elimina account</strong>, oppure con i passi della <a href="delete-account.html">pagina di cancellazione</a> (senza app). La cancellazione rimuove account e profilo, analisi e testi di contratto, codici di condivisione, promemoria, posti advisor / nucleo e brief, messaggi di supporto e segnalazioni IA. Sul dispositivo della cancellazione in-app si svuotano anche promemoria pianificati, cache locali e file esportati.</p>
<p>Dopo la cancellazione, identificativo del dispositivo e numero usati per la quota gratuita restano senza alcun legame con l’account, solo per bloccare richieste gratuite ripetute.</p>
<p>Un abbonamento App Store / Google Play attivo non si disdice automaticamente con la cancellazione; disdicilo nell’account dello store. I codici brief scadono da soli dopo la finestra indicata.</p>
<h2>6. Avvertenza legale</h2>
<p><strong>NexuLex AI non è uno studio legale e non fornisce consulenza legale.</strong> Gli output sono strumenti informativi generali. Le decisioni restano tue; consulta un avvocato abilitato per la tua pratica.</p>
<h2 data-sec="signup">7. Dati di registrazione</h2>
<p>Alla registrazione fornisci un indirizzo e-mail e un numero di telefono. Il numero di telefono e un identificativo del dispositivo servono a richiedere la quota gratuita di analisi e a impedire abusi ripetuti. Non sono usati per la pubblicità e non vengono venduti.</p>
<h2 data-sec="voice">8. Input vocale</h2>
<p>L’input vocale è facoltativo. Quando usi il microfono, il riconoscimento vocale è eseguito dal servizio vocale integrato nel tuo telefono (Apple o Google), secondo le condizioni sulla privacy di quel fornitore. NexuLex AI non registra né conserva il tuo audio; riceve solo il testo che scegli di usare.</p>
<h2 data-sec="transfer">9. Fornitori di servizi e trasferimenti internazionali</h2>
<p>Per far funzionare NexuLex AI usiamo questi fornitori:</p>
<ul>
<li>Supabase: database cloud, accesso e funzioni server. Il nostro progetto è ospitato nell’Unione europea (Francoforte, Germania).</li>
<li>Anthropic (API Claude, Stati Uniti): analisi e risposte, raggiungibile solo tramite il nostro server.</li>
<li>RevenueCat (Stati Uniti): stato degli acquisti e del piano.</li>
<li>Netlify: ospita queste pagine web e può trattare dati tecnici della richiesta, come il tuo indirizzo IP.</li>
<li>Apple e Google: gli store di app, la fatturazione e il riconoscimento vocale integrato nel telefono.</li>
</ul>
<p>Alcuni fornitori, come Anthropic e RevenueCat, trattano dati negli Stati Uniti, e altri possono trattarli fuori dal tuo paese, anche fuori dallo Spazio economico europeo, dal Regno Unito, dalla Svizzera e dalla Turchia. Quando la legge richiede garanzie per tali trasferimenti, ci basiamo sugli addendum di protezione dei dati e sui meccanismi di trasferimento internazionale (come le clausole contrattuali tipo) offerti nei termini di servizio standard di questi fornitori.</p>
<h2 data-sec="rights">10. I tuoi diritti</h2>
<p>A seconda di dove vivi (ad esempio ai sensi del GDPR / UK GDPR, della LPD svizzera, della DSG austriaca, della KVKK turca, del DPDP Act indiano, della PIPEDA canadese e delle leggi provinciali o del Privacy Act australiano) puoi avere il diritto di accedere ai tuoi dati, rettificarli, cancellarli, portarli, limitarne il trattamento od opporti e di revocare il consenso. Puoi cancellare l’account nell’app. Per altre richieste scrivi a nexulexai@gmail.com dall’indirizzo registrato; rispondiamo entro il termine previsto dalla legge. Puoi anche presentare reclamo all’autorità di protezione dei dati del tuo paese.</p>
<h2 data-sec="children">11. Minori, pubblicità e tracciamento</h2>
<p>NexuLex AI è pensata per adulti dai 18 anni in su e non è rivolta ai minori. Non raccogliamo consapevolmente dati di minori; contattaci e li cancelleremo. L’app non contiene pubblicità né tracciamento tra app e non vendiamo dati personali.</p>
<h2 data-sec="analytics">12. Report anonimi di utilizzo ed errori</h2>
<p>Per mantenere l’app affidabile e migliorarla, NexuLex AI può inviare brevi eventi anonimi: ad esempio quali aree vengono usate, se un’analisi è terminata o non è riuscita, gli esiti della schermata di abbonamento e degli acquisti e il tipo di errore. Ogni report contiene un ID di installazione casuale creato sul tuo dispositivo (non l’ID hardware), la versione dell’app, la piattaforma e la lingua dell’app. I report non contengono mai i tuoi contratti, testi, immagini, indirizzo e-mail, numero di telefono o ID dell’account e non vengono usati per la pubblicità né venduti.</p>
<p>Nello Spazio economico europeo, nel Regno Unito, in Svizzera, in Turchia, in Brasile, India, Corea del Sud e Sudafrica non viene inviato nulla se non lo consenti. Altrove è attivo per impostazione predefinita. Puoi cambiarlo in qualsiasi momento in <strong>Impostazioni → Privacy</strong>; disattivandolo si eliminano i report ancora in attesa sul dispositivo. I report sono conservati in Supabase e rimossi dopo al massimo 180 giorni.</p>
<h2 data-sec="invite">13. Codici invito</h2>
<p>Se hai effettuato l’accesso, NexuLex AI ti assegna un breve codice invito. Quando un amico lo inserisce, conserviamo i due ID account, l’identificativo del dispositivo dell’amico (lo stesso usato per la quota di analisi gratuite) e la data, solo per assegnare le analisi bonus e prevenire abusi. Non viene condiviso nulla sui tuoi contratti. Se elimini l’account, il tuo codice e i relativi collegamenti agli account vengono eliminati; può restare un record privo di ID account affinché lo stesso dispositivo non possa richiedere di nuovo il bonus.</p>
<h2 data-sec="controller">14. Titolare e basi giuridiche</h2>
<p>Il titolare del trattamento dei tuoi dati personali è Doğancan Kara, ditta individuale a Bağcılar, Istanbul, Turchia (e-mail: nexulexai@gmail.com), editore di NexuLex AI. Quando si applicano il GDPR, il GDPR del Regno Unito o la LPD svizzera, ci basiamo su queste basi giuridiche: l’esecuzione del contratto con te (account, analisi, quote e acquisti); i nostri legittimi interessi (gestire il servizio in sicurezza, prevenire l’abuso della quota gratuita e correggere gli errori); il tuo consenso (funzioni facoltative che attivi, come i rapporti d’uso anonimi dove il consenso è richiesto); e gli obblighi di legge, ove applicabili. Puoi revocare il consenso in qualsiasi momento, senza effetto sui trattamenti già svolti. Dove si applicano altre leggi sulla protezione dei dati, ci basiamo sui fondamenti equivalenti che prevedono.</p>
<h2 data-sec="security">15. Sicurezza</h2>
<p>Proteggiamo i dati con connessioni cifrate (HTTPS), autenticazione degli account e policy di sicurezza a livello di riga nel nostro database; le richieste all’IA passano dal nostro server e non direttamente dall’app. Nessun sistema è completamente sicuro, quindi proteggi le tue credenziali di accesso. Se una violazione dei dati personali ti riguarda, ti informeremo, insieme alle autorità, quando la legge lo richiede.</p>
<h2 data-sec="templates">16. Modelli di contratto</h2>
<p>La libreria di contratti (scheda Consulente) compila sul tuo dispositivo modelli di contratto open source. I dati che inserisci nel modulo servono solo a costruire il documento sullo schermo e restano soltanto nella memoria dell’app per quella sessione; non vengono inviati ai nostri server, al nostro fornitore di IA né ad altri, e non vengono salvati nel tuo account. Il documento lascia il dispositivo solo quando lo copi, condividi o esporti tu stesso. I testi dei modelli sono inclusi nell’app e pubblicati da General Legal con la licenza di pubblico dominio CC0-1.0.</p>
<h2 data-sec="retention">17. Tempi di conservazione</h2>
<p>Per quanto tempo conserviamo i dati sui nostri server:</p>
<table>
<thead><tr><th>Dati</th><th>Durata</th></tr></thead>
<tbody>
<tr><td>Account e profilo</td><td>Finché non elimini l’account</td></tr>
<tr><td>Analisi salvate e testo dei contratti</td><td>Finché non le elimini o non elimini l’account</td></tr>
<tr><td>Codici di sintesi e di condivisione</td><td>Fino al termine della validità indicata; un codice scaduto smette di funzionare automaticamente</td></tr>
<tr><td>Messaggi di supporto</td><td>Al massimo 24 mesi, o finché non elimini l’account</td></tr>
<tr><td>Report anonimi di utilizzo e di errori</td><td>Al massimo 180 giorni</td></tr>
<tr><td>Registro della quota gratuita (identificativo del dispositivo e numero di telefono, senza alcun collegamento al tuo account)</td><td>Nessuna data di fine fissa; conservato solo per evitare l’abuso ripetuto della quota gratuita</td></tr>
<tr><td>Piano e data di scadenza nel tuo profilo</td><td>Finché non elimini l’account; i dati di acquisto presso Apple, Google e RevenueCat seguono le loro politiche</td></tr>
<tr><td>Dati sul tuo dispositivo (cronologia, fascicoli, risposte, bozze)</td><td>Finché non li elimini o disinstalli l’app</td></tr>
</tbody>
</table>
<h2 data-sec="kvkk">18. Turchia: informativa KVKK (legge n. 6698)</h2>
<p>Se ti trovi in Turchia, questa sezione è la nostra informativa ai sensi dell’articolo 10 della legge turca n. 6698 sulla protezione dei dati personali (KVKK). Titolare del trattamento: Doğancan Kara (ditta individuale), Bağcılar, Istanbul, Turchia; e-mail: nexulexai@gmail.com.</p>
<p>Finalità: creare e gestire il tuo account, analizzare i contratti che invii, applicare le quote, elaborare gli acquisti, fornire supporto, mantenere sicuro il servizio e prevenire abusi, e adempiere obblighi di legge. Basi giuridiche (articolo 5): esecuzione di un contratto, legittimi interessi del titolare, consenso esplicito quando richiesto (per esempio per i report di utilizzo anonimi facoltativi) e obblighi di legge. Modalità di raccolta: quanto inserisci tu e la raccolta automatica tramite l’app, con mezzi elettronici.</p>
<p>Destinatari e trasferimenti: i tuoi dati sono trattati dai fornitori indicati nella sezione 9, alcuni fuori dalla Turchia (Supabase nell’Unione europea, Anthropic e RevenueCat negli Stati Uniti). Effettuiamo i trasferimenti all’estero in conformità all’articolo 9 della KVKK. Non vendiamo i tuoi dati.</p>
<p>I tuoi diritti ai sensi dell’articolo 11: sapere se i dati sono trattati e chiedere informazioni; conoscere la finalità e se sono usati di conseguenza; conoscere i terzi ai quali sono trasferiti in Turchia o all’estero; chiedere la rettifica di dati incompleti o errati; chiedere la cancellazione o distruzione ai sensi dell’articolo 7 e che ne siano informati i terzi; opporti a un risultato a te sfavorevole derivante solo da un’analisi automatizzata; e chiedere il risarcimento dei danni causati da un trattamento illecito.</p>
<p>Per esercitarli, scrivi a nexulexai@gmail.com dall’indirizzo con cui ti sei registrato e descrivi la richiesta. Rispondiamo entro 30 giorni al massimo. Se non sei soddisfatto, puoi presentare reclamo all’Autorità turca per la protezione dei dati (Kişisel Verileri Koruma Kurulu). I contratti che carichi possono contenere dati di altre persone; devi avere il diritto di trattarli.</p>
<h2 data-sec="ccpa">19. Stati Uniti: diritti in California e in altri stati</h2>
<p>Non vendiamo le tue informazioni personali e non le condividiamo per pubblicità comportamentale cross-context. L’app non contiene pubblicità, quindi non esiste un’impostazione «Non vendere né condividere le mie informazioni personali» da attivare.</p>
<p>Se vivi in California o in un altro stato USA con una legge sulla privacy dei consumatori (per esempio CCPA/CPRA), nella misura in cui tale legge si applica a noi puoi avere il diritto di sapere quali informazioni personali raccogliamo, usiamo e comunichiamo; di accedervi, correggerle e cancellarle; di limitare l’uso di informazioni personali sensibili; e di non subire discriminazioni per aver esercitato questi diritti.</p>
<p>Negli ultimi dodici mesi abbiamo raccolto queste categorie: identificativi (indirizzo e-mail, numero di telefono, identificativi di dispositivo e di installazione); informazioni commerciali (stato del piano e degli acquisti); attività nell’app (eventi di utilizzo anonimi); e i contenuti che invii (contratti e domande). Le comunichiamo solo ai fornitori della sezione 9, per le finalità aziendali descritte in questa informativa. Non conserviamo il tuo audio vocale.</p>
<p>Per esercitare i tuoi diritti, scrivi a nexulexai@gmail.com dall’indirizzo con cui ti sei registrato. Possiamo chiedere dettagli per verificare la tua identità, puoi servirti di un agente autorizzato e rispondiamo entro 45 giorni quando la legge lo richiede.</p>
<h2 data-sec="changes">20. Modifiche a questa informativa</h2>
<p>Possiamo aggiornare questa informativa sulla privacy. In caso di modifiche rilevanti cambieremo la data in alto e, se la legge lo richiede, ti informeremo nell’app o con altri mezzi adeguati prima che la modifica si applichi. Consulta questa pagina di tanto in tanto.</p>
<h2 data-sec="language">21. Lingue</h2>
<p>Questa informativa è disponibile in più lingue per comodità. Se una traduzione differisce dalla versione inglese, prevale la versione inglese.</p>
<p lang="en" dir="ltr">In case of discrepancies, the English version shall prevail.</p>
<h2>22. Contatti</h2>
<p>Domande sulla privacy e richieste sui tuoi dati: scrivi a nexulexai@gmail.com o usa la schermata Supporto nell’app. Editore e titolare del trattamento: Doğancan Kara (ditta individuale), Bağcılar, Istanbul, Turchia.</p>`,

  deleteAccount: `<h1>Elimina il tuo account NexuLex AI</h1>
<p class="meta">Aggiornato: 25 settembre 2026. Traduzione di comodo. Fa fede il testo inglese.</p>
<h2>Nell’app (il più veloce)</h2>
<ol>
<li>Apri NexuLex AI e accedi.</li>
<li>Vai su <strong>Impostazioni</strong> e tocca <strong>Elimina account</strong>.</li>
<li>Leggi l’avviso e conferma due volte. L’eliminazione parte subito e vieni disconnesso.</li>
</ol>
<p class="warn"><strong>Gli abbonamenti non si disdicono automaticamente.</strong> Disdici un piano attivo in
<a href="https://apps.apple.com/account/subscriptions">abbonamenti App Store</a> o
<a href="https://play.google.com/store/account/subscriptions">abbonamenti Google Play</a>.</p>
<h2>Senza l’app</h2>
<p>Scrivi a <a href="mailto:nexulexai@gmail.com?subject=Account%20deletion%20request">nexulexai@gmail.com</a> dall’indirizzo registrato il testo «Delete my account» / «Elimina il mio account». Confermiamo via e-mail e completiamo l’eliminazione entro 30 giorni.</p>
<h2>Cosa viene eliminato</h2>
<ul>
<li>Account e profilo (e-mail, identificativi, stato Pro).</li>
<li>Analisi e testi di contratto, codici di condivisione, promemoria, posti advisor / nucleo e brief.</li>
<li>Messaggi di supporto e segnalazioni IA inviati.</li>
<li>Sul dispositivo della cancellazione in-app: promemoria pianificati, cache locali e file esportati.</li>
</ul>
<h2>Cosa resta</h2>
<p>Identificativo del dispositivo e numero usati per la quota gratuita di analisi restano senza legame con l’account, solo per bloccare richieste gratuite ripetute. Gli acquisti presso Apple, Google e RevenueCat seguono le loro regole.</p>
<p>Vedi anche l’<a href="privacy.html">informativa sulla privacy</a>.</p>`,

  terms: `<h1>Termini di utilizzo (EULA)</h1>
<p class="meta">Aggiornato: 21 ottobre 2026. Traduzione di comodo. Fa fede il testo inglese.</p>
<p>Scaricando o usando NexuLex AI accetti questi termini e la nostra <a href="privacy.html">informativa sulla privacy</a>.</p>
<h2>1. Descrizione del servizio</h2>
<p>NexuLex AI è un software per consumatori che aiuta a rivedere contratti, vedere rischi, bozzare un contro-linguaggio e condividere brief in sola lettura. È fornito «così com’è».</p>
<h2>2. Non è uno studio</h2>
<p><strong>NexuLex AI non è uno studio legale e non fornisce consulenza legale.</strong> Nulla nell’app crea un rapporto avvocato-cliente. Verifica le decisioni importanti con un avvocato abilitato nel tuo paese.</p>
<p>«Trova un avvocato» collega solo directory ufficiali di ordini ed enti pubblici. NexuLex AI non raccomanda, classifica o segnala avvocati, non riceve commissioni e non è responsabile dei servizi dell’avvocato che scegli. Controlla iscrizione e onorari prima di incaricarlo.</p>
<h2>3. Account e abbonamenti</h2>
<ul>
<li>Quote gratuite e diritti Pro sono applicati lato server e tramite RevenueCat / gli store.</li>
<li>Il piano Professional include tutto Pro più gli strumenti Professional e i limiti giornalieri più alti mostrati nell’app. Il piano è verificato dal nostro server con RevenueCat; non si può cambiare dall’app.</li>
<li>Gli strumenti Professional sono ausili di lavoro, non consulenza legale. Usano solo il tuo materiale e possono contenere errori; verifica ogni data, fatto e fonte. NexuLex AI non rappresenta nessuno davanti a un tribunale o un’autorità.</li>
<li>Fatturazione, rimborsi e disdette seguono le regole di App Store o Google Play.</li>
<li>Sei responsabile della sicurezza delle credenziali.</li>
</ul>
<h2>4. Uso accettabile</h2>
<ul>
<li>Non caricare contenuti illeciti né materiale che non sei autorizzato a trattare.</li>
<li>Non tentare di aggirare, saturare o smontare sicurezza, quote o paywall.</li>
<li>Non usare il servizio per molestare, truffare o ingannare.</li>
<li>Non condividere segreti, credenziali o dati personali di terzi senza base giuridica.</li>
</ul>
<h2>5. Proprietà intellettuale</h2>
<p>Nome, marchio e software NexuLex AI appartengono all’editore. Conservi i diritti sui contratti caricati. Ci concedi una licenza limitata a trattare quel contenuto solo per erogare il servizio.</p>
<h2>6. Brief condivisi e posti</h2>
<p>I link brief e i posti advisor / nucleo sono pensati per nascondere il contratto originale. I destinatari vedono comunque i riassunti di analisi che scegli di condividere. Fai attenzione prima di creare codici.</p>
<h2>7. Limitazione di responsabilità</h2>
<p>Nella misura consentita dalla legge non siamo responsabili di decisioni basate sull’output dell’app, errori di IA di terzi, controversie di fatturazione store o interruzioni fuori dal nostro ragionevole controllo.</p>
<h2>8. Modifiche</h2>
<p>Possiamo aggiornare questi termini. Continuare a usare il servizio dopo un aggiornamento vale come accettazione.</p>
<h2 data-sec="eligibility">9. Età minima</h2>
<p>Per usare NexuLex AI devi avere almeno 18 anni o la maggiore età del luogo in cui vivi. Se la usi per un’azienda, confermi di poterla vincolare.</p>
<h2 data-sec="renewal">10. Abbonamenti e rinnovo automatico</h2>
<p>I piani a pagamento si rinnovano automaticamente per lo stesso periodo al prezzo dello store mostrato, finché non li disdici. Il pagamento è addebitato sul tuo account App Store o Google Play. Puoi gestirli o disdirli nelle impostazioni dell’account dello store; su App Store almeno 24 ore prima della fine del periodo in corso. Eliminare l’account NexuLex AI non disdice l’abbonamento. I rimborsi seguono la politica dello store.</p>
<h2 data-sec="ai">11. Contenuti generati dall’IA</h2>
<p>Analisi, risposte, bozze e riassunti sono generati da intelligenza artificiale. Possono essere incompleti, superati o errati, e la legge cambia da paese a paese e nel tempo. Verifica i punti importanti su fonti ufficiali o con un avvocato abilitato prima di farvi affidamento.</p>
<h2 data-sec="termin">12. Sospensione e cessazione</h2>
<p>Puoi smettere di usare NexuLex AI e cancellare l’account in qualsiasi momento. Possiamo sospendere o chiudere un accesso che viola questi termini o mette a rischio il servizio o altri utenti.</p>
<h2 data-sec="templates">13. Modelli di contratto</h2>
<p>La libreria di contratti (scheda Consulente) offre modelli di contratti commerciali di uso generale pubblicati da General Legal con la licenza di pubblico dominio CC0-1.0. NexuLex AI inserisce i dati che scrivi e lascia invariato il resto di ogni modello, nella sua formulazione inglese originale. I modelli non sono adattati alla tua situazione, al tuo paese o al tuo settore e potrebbero non essere validi o eseguibili dove ti trovi. Sono forniti «così come sono», senza garanzie. Fai rivedere ogni contratto da un avvocato abilitato nella giurisdizione applicabile prima di firmarlo. NexuLex AI non è parte di alcun contratto che crei, e la libreria di contratti non crea un rapporto avvocato-cliente. Il documento completo, l’esportazione in Word, la copia e la condivisione fanno parte del piano Pro; gli utenti gratuiti vedono un’anteprima.</p>
<h2 data-sec="law">14. Legge applicabile e foro</h2>
<p>Questi termini sono regolati dalla legge della Repubblica di Turchia. Sono competenti i tribunali e gli uffici di esecuzione di Istanbul (Çağlayan), fatti salvi i diritti inderogabili di tutela del consumatore che ti spettano secondo la legge del tuo paese di residenza, incluso il diritto di agire davanti al tribunale o all’organismo competente del luogo.</p>
<h2 data-sec="language">15. Lingue</h2>
<p>Questi termini sono disponibili in più lingue per comodità. Se una traduzione differisce dalla versione inglese, prevale la versione inglese.</p>
<p lang="en" dir="ltr">In case of discrepancies, the English version shall prevail.</p>
<h2>16. Contatti</h2>
<p>Per account, prodotto o questioni dei consumatori usa la schermata Supporto nell’app o scrivi a nexulexai@gmail.com. Editore: Doğancan Kara (ditta individuale), Bağcılar, Istanbul, Turchia.</p>`,
};
