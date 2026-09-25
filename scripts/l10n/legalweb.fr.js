// WAVE ST.3 — Confidentialite + suppression (FR).
module.exports = {
  privacy: `<h1>Politique de confidentialite</h1>
<p class="meta">Mise a jour: 25 septembre 2026. Traduction de commodite. Le texte anglais fait foi.</p>
<p>Cette politique explique comment NexuLex AI (« nous », « l application ») traite les informations dans l application mobile et les visionneuses web liees.</p>
<h2>1. Donnees que nous traitons</h2>
<ul>
<li>Donnees de compte telles que l e-mail et les identifiants d authentification.</li>
<li>Texte de contrat, images ou PDF que vous televersez ou collez pour analyse.</li>
<li>Photos et PDF sont choisis dans le selecteur systeme. Ils ne sont pas captures en arriere-plan.</li>
<li>Resultats d analyse, briefs, rappels et messages d assistance que vous creez.</li>
<li>Statut d achat et de droits des boutiques via RevenueCat. Notre serveur demande a RevenueCat le forfait (Pro ou Professional) de votre compte et n enregistre que ce forfait et sa date de fin sur le profil.</li>
<li>Signaux d appareil et de diagnostic necessaires pour faire tourner le service en securite.</li>
</ul>
<h2>2. Stockage cloud (Supabase)</h2>
<p>Les donnees produit authentifiees sont stockees dans Supabase (PostgreSQL et services cloud lies). L acces est limite par l authentification et des regles de securite au niveau des lignes. Les briefs partages utilisent des codes de courte duree et n incluent pas le contrat original.</p>
<h2>3. Utilisation des donnees</h2>
<ul>
<li>Analyser les contrats, produire des rapports et gerer les sieges conseiller / foyer.</li>
<li>Appliquer les quotas gratuits et Pro et restaurer les achats.</li>
<li>Envoyer les rappels locaux facultatifs que vous planifiez sur l appareil.</li>
<li>Repondre aux demandes d assistance que vous envoyez.</li>
</ul>
<h2>4. Traitement par IA</h2>
<p>Le contenu de contrat que vous envoyez peut etre transmis a notre mandataire IA cloud pour analyse. Nous ne vendons pas vos contrats. N uploadez pas d informations que vous n etes pas autorise a traiter.</p>
<p>Questions juridiques et outils Professional (chronologie, liste d issues, note de recherche): votre question, les faits, le materiau du dossier et le fichier joint (sans pieces de preuve) sont envoyes via une connexion chiffree par notre serveur au fournisseur d IA seulement pour creer la reponse. Notre serveur ne conserve qu un decompte quotidien des questions et des executions Professional, pas votre texte ni la sortie IA. Reponses, resultats et dossiers restent sur votre appareil sauf si vous les enregistrez ailleurs ou les partagez.</p>
<p>Vous pouvez signaler une sortie IA depuis le rapport d analyse, une reponse du conseiller ou un brouillon ameliore. Un signalement stocke le motif, votre note facultative, l identifiant, la langue de l app et le pays choisi. Le texte du contrat ou de la reponse (jusqu a 2000 caracteres) n est joint que si vous activez « Inclure le contexte du contrat ».</p>
<p>Trouver un avocat: le premier message et le paquet de dossier sont crees sur votre appareil sans IA et ne sont envoyes ni a nos serveurs ni a un avocat. Ils quittent l appareil seulement si vous les copiez ou les partagez. Les liens d annuaire ouvrent les sites officiels des barreaux et organismes publics, qui ont leurs propres politiques. NexuLex ne transmet pas vos donnees aux avocats et ne percoit aucun honoraire de recommandation.</p>
<h2>5. Conservation et suppression</h2>
<p>Vous pouvez supprimer le compte a tout moment dans l app sous <strong>Reglages, puis Supprimer le compte</strong>, ou via les etapes de la <a href="delete-account.html">page de suppression</a> (sans l app). La suppression retire le compte et le profil, les analyses et textes de contrat, les codes de partage, les rappels, les sieges conseiller / foyer et briefs, les messages d assistance et les signalements IA. Sur l appareil utilise pour la suppression in-app, les rappels planifies, caches locaux et fichiers exportes sont aussi effaces.</p>
<p>Apres suppression, l identifiant d appareil et le numero utilises pour reclamer le quota gratuit restent sans aucun lien avec votre compte, seulement pour empecher les demandes gratuites repetees.</p>
<p>Un abonnement App Store / Google Play actif n est pas annule automatiquement par la suppression; annulez-le dans le compte boutique. Les codes de brief expirent d eux-memes apres la fenetre indiquee.</p>
<h2>6. Avertissement juridique</h2>
<p><strong>NexuLex AI n est pas un cabinet d avocats et ne fournit pas de conseil juridique.</strong> Les sorties sont des outils d information generale. Les decisions restent les votres; consultez un avocat habilite pour votre affaire.</p>
<h2>7. Contact</h2>
<p>Questions de confidentialite: utilisez l ecran Assistance dans l app ou contactez l editeur indique sur la fiche boutique.</p>`,

  deleteAccount: `<h1>Supprimer votre compte NexuLex AI</h1>
<p class="meta">Mise a jour: 25 septembre 2026. Traduction de commodite. Le texte anglais fait foi.</p>
<h2>Dans l application (le plus rapide)</h2>
<ol>
<li>Ouvrez NexuLex AI et connectez-vous.</li>
<li>Allez dans <strong>Reglages</strong> et touchez <strong>Supprimer le compte</strong>.</li>
<li>Lisez l avis et confirmez deux fois. La suppression s execute tout de suite et vous etes deconnecte.</li>
</ol>
<p class="warn"><strong>Les abonnements ne sont pas annules automatiquement.</strong> Annulez un forfait actif dans
<a href="https://apps.apple.com/account/subscriptions">les abonnements App Store</a> ou
<a href="https://play.google.com/store/account/subscriptions">les abonnements Google Play</a>.</p>
<h2>Sans l application</h2>
<p>Ecrivez a <a href="mailto:nexulexai@gmail.com?subject=Account%20deletion%20request">nexulexai@gmail.com</a> depuis l adresse inscrite le texte « Delete my account » / « Supprimer mon compte ». Nous confirmons par e-mail et achevons la suppression sous 30 jours.</p>
<h2>Ce qui est supprime</h2>
<ul>
<li>Votre compte et profil (e-mail, identifiants, etat Pro).</li>
<li>Analyses et textes de contrat, codes de partage, rappels, sieges conseiller / foyer et briefs.</li>
<li>Messages d assistance et signalements IA que vous avez envoyes.</li>
<li>Sur l appareil de la suppression in-app: rappels planifies, caches locaux et fichiers exportes.</li>
</ul>
<h2>Ce qui est conserve</h2>
<p>L identifiant d appareil et le numero utilises pour le quota d analyse gratuit restent sans lien avec votre compte, seulement pour bloquer les demandes gratuites repetees. Les achats chez Apple, Google et RevenueCat suivent leurs propres regles.</p>
<p>Voir aussi la <a href="privacy.html">politique de confidentialite</a>.</p>`,
};
