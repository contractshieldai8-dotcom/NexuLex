// WAVE ST.3 — Confidentialité + suppression (FR). WAVE B: accents and apostrophes restored.
module.exports = {
  privacy: `<h1>Politique de confidentialité</h1>
<p class="meta">Mise à jour : 21 octobre 2026. Traduction de commodité. Le texte anglais fait foi.</p>
<p>Cette politique explique comment NexuLex AI (« nous », « l’application ») traite les informations dans l’application mobile et les visionneuses web liées.</p>
<h2>1. Données que nous traitons</h2>
<ul>
<li>Données de compte telles que l’e-mail et les identifiants d’authentification.</li>
<li>Texte de contrat, images ou PDF que vous téléversez ou collez pour analyse.</li>
<li>Photos et PDF sont choisis dans le sélecteur système. Ils ne sont pas capturés en arrière-plan.</li>
<li>Résultats d’analyse, briefs, rappels et messages d’assistance que vous créez.</li>
<li>Statut d’achat et de droits des boutiques via RevenueCat. Notre serveur demande à RevenueCat le forfait (Pro ou Professional) de votre compte et n’enregistre que ce forfait et sa date de fin sur le profil.</li>
<li>Signaux d’appareil et de diagnostic nécessaires pour faire tourner le service en sécurité.</li>
</ul>
<h2>2. Stockage cloud (Supabase)</h2>
<p>Les données produit authentifiées sont stockées dans Supabase (PostgreSQL et services cloud liés). L’accès est limité par l’authentification et des règles de sécurité au niveau des lignes. Les briefs partagés utilisent des codes de courte durée et n’incluent pas le contrat original.</p>
<h2>3. Utilisation des données</h2>
<ul>
<li>Analyser les contrats, produire des rapports et gérer les sièges conseiller / foyer.</li>
<li>Appliquer les quotas gratuits et Pro et restaurer les achats.</li>
<li>Envoyer les rappels locaux facultatifs que vous planifiez sur l’appareil.</li>
<li>Répondre aux demandes d’assistance que vous envoyez.</li>
</ul>
<h2>4. Traitement par IA</h2>
<p>Le contenu de contrat que vous envoyez peut être transmis à notre mandataire IA cloud pour analyse. Nous ne vendons pas vos contrats. N’envoyez pas d’informations que vous n’êtes pas autorisé à traiter.</p>
<p>Questions juridiques et outils Professional (chronologie, liste d’issues, note de recherche) : votre question, les faits, le matériau du dossier et le fichier joint (sans pièces de preuve) sont envoyés via une connexion chiffrée par notre serveur au fournisseur d’IA seulement pour créer la réponse. Notre serveur ne conserve qu’un décompte quotidien des questions et des exécutions Professional, pas votre texte ni la sortie IA. Réponses, résultats et dossiers restent sur votre appareil sauf si vous les enregistrez ailleurs ou les partagez.</p>
<p>Vous pouvez signaler une sortie IA depuis le rapport d’analyse, une réponse du conseiller ou un brouillon amélioré. Un signalement stocke le motif, votre note facultative, l’identifiant, la langue de l’app et le pays choisi. Le texte du contrat ou de la réponse (jusqu’à 2000 caractères) n’est joint que si vous activez « Inclure le contexte du contrat ».</p>
<p>Trouver un avocat : le premier message et le paquet de dossier sont créés sur votre appareil sans IA et ne sont envoyés ni à nos serveurs ni à un avocat. Ils quittent l’appareil seulement si vous les copiez ou les partagez. Les liens d’annuaire ouvrent les sites officiels des barreaux et organismes publics, qui ont leurs propres politiques. NexuLex ne transmet pas vos données aux avocats et ne perçoit aucun honoraire de recommandation.</p>
<p data-consent-record="1">Registre de consentement IA : lorsque vous autorisez ou retirez l’autorisation d’envoyer votre contenu au fournisseur d’IA, nous enregistrons cette décision dans un registre de consentement en ajout seul : l’identifiant de votre compte, le type de consentement, la version du texte, accordé ou retiré, et l’heure. Il ne contient aucun texte de contrat. La décision s’applique immédiatement sur votre appareil, même hors ligne ; si l’enregistrement ne peut pas être écrit tout de suite, l’application le fait plus tard. Seul vous pouvez lire vos propres lignes, personne dans l’application ne peut les modifier ou les supprimer, et elles sont effacées lorsque vous supprimez votre compte.</p>
<h2>5. Conservation et suppression</h2>
<p>Vous pouvez supprimer le compte à tout moment dans l’app sous <strong>Réglages, puis Supprimer le compte</strong>, ou via les étapes de la <a href="delete-account.html">page de suppression</a> (sans l’app). La suppression retire le compte et le profil, les analyses et textes de contrat, les codes de partage, les rappels, les sièges conseiller / foyer et briefs, les messages d’assistance et les signalements IA. Sur l’appareil utilisé pour la suppression in-app, les rappels planifiés, caches locaux et fichiers exportés sont aussi effacés.</p>
<p>Après suppression, l’identifiant d’appareil utilisé pour réclamer le quota gratuit reste sans aucun lien avec votre compte, seulement pour empêcher les demandes gratuites répétées.</p>
<p>Un abonnement App Store / Google Play actif n’est pas annulé automatiquement par la suppression ; annulez-le dans le compte boutique. Les codes de brief expirent d’eux-mêmes après la fenêtre indiquée.</p>
<h2>6. Avertissement juridique</h2>
<p><strong>NexuLex AI n’est pas un cabinet d’avocats et ne fournit pas de conseil juridique.</strong> Les sorties sont des outils d’information générale. Les décisions restent les vôtres ; consultez un avocat habilité pour votre affaire.</p>
<h2 data-sec="signup">7. Données d’inscription</h2>
<p>À l’inscription, vous fournissez une adresse e-mail et un mot de passe, et vous confirmez avoir au moins 18 ans et accepter les Conditions d’utilisation et la présente Politique de confidentialité ; nous enregistrons cette confirmation et sa date. Nous ne demandons pas de numéro de téléphone. Un identifiant d’appareil sert à réclamer le quota d’analyse gratuit et à empêcher les abus répétés. Il ne sert pas à la publicité et n’est pas vendu.</p>
<p>Avant votre première requête d’IA, l’app demande votre autorisation d’envoyer ce que vous soumettez (texte du contrat, photos, pages PDF, questions) à notre fournisseur d’IA. Vous pouvez la retirer à tout moment dans Réglages, rubrique Confidentialité ; sans elle, aucune requête d’IA n’est envoyée.</p>
<h2 data-sec="voice">8. Saisie vocale</h2>
<p>La saisie vocale est facultative. Lorsque vous utilisez le micro, la reconnaissance vocale est réalisée par le service vocal intégré à votre téléphone (Apple ou Google), selon les conditions de confidentialité de ce fournisseur. NexuLex AI n’enregistre ni ne conserve votre audio ; il ne reçoit que le texte que vous choisissez d’utiliser.</p>
<h2 data-sec="transfer">9. Prestataires et transferts internationaux</h2>
<p>Nous faisons appel à ces prestataires pour faire fonctionner NexuLex AI :</p>
<ul>
<li>Supabase : base de données cloud, connexion et fonctions serveur. Notre projet est hébergé dans l’Union européenne (Francfort, Allemagne).</li>
<li>Anthropic (API Claude, États-Unis) : analyse et réponses, accessible uniquement via notre serveur.</li>
<li>RevenueCat (États-Unis) : statut des achats et de l’offre.</li>
<li>Netlify : héberge ces pages web et peut traiter des données techniques de requête, comme votre adresse IP.</li>
<li>Apple et Google : les boutiques d’applications, la facturation et la reconnaissance vocale intégrée à votre téléphone.</li>
</ul>
<p>Certains prestataires, comme Anthropic et RevenueCat, traitent des données aux États-Unis, et d’autres peuvent en traiter hors de votre pays, y compris hors de l’Espace économique européen, du Royaume-Uni, de la Suisse et de la Turquie. Lorsque la loi exige des garanties pour de tels transferts, nous nous appuyons sur les addenda de protection des données et les mécanismes de transfert international (comme les clauses contractuelles types) proposés dans les conditions de service standard de ces prestataires.</p>
<h2 data-sec="rights">10. Vos droits</h2>
<p>Selon votre lieu de résidence (par exemple au titre du RGPD / UK GDPR, de la LPD suisse, de la DSG autrichienne, de la KVKK turque, du DPDP Act indien, de la PIPEDA canadienne et des lois provinciales ou du Privacy Act australien), vous pouvez avoir le droit d’accéder à vos données, de les rectifier, de les supprimer, de les récupérer, d’en limiter le traitement ou de vous y opposer, et de retirer votre consentement. Vous pouvez supprimer votre compte dans l’app. Pour toute autre demande, écrivez à nexulexai@gmail.com depuis votre adresse inscrite ; nous répondons dans le délai prévu par la loi. Vous pouvez aussi saisir l’autorité de protection des données de votre pays.</p>
<h2 data-sec="children">11. Enfants, publicité et suivi</h2>
<p>NexuLex AI s’adresse aux adultes de 18 ans ou plus et non aux enfants. Nous ne collectons pas sciemment de données d’enfants ; contactez-nous et nous les supprimerons. L’app ne contient ni publicité ni suivi entre applications, et nous ne vendons pas de données personnelles.</p>
<h2 data-sec="analytics">12. Rapports anonymes d’utilisation et d’erreurs</h2>
<p>Pour garder l’application fiable et l’améliorer, NexuLex AI peut envoyer de courts événements anonymes : par exemple les zones utilisées, si une analyse s’est terminée ou a échoué, les résultats de l’écran d’abonnement et des achats, et le type d’une erreur. Chaque rapport contient un identifiant d’installation aléatoire créé sur votre appareil (et non l’identifiant matériel de votre appareil), la version de l’app, la plateforme et la langue de l’app. Les rapports ne contiennent jamais vos contrats, textes, images, adresse e-mail, numéro de téléphone ni identifiant de compte, et ne sont ni utilisés pour la publicité ni vendus.</p>
<p>Dans l’Espace économique européen, au Royaume-Uni, en Suisse, en Türkiye, au Brésil, en Inde, en Corée du Sud et en Afrique du Sud, rien n’est envoyé sans votre accord. Ailleurs, c’est activé par défaut. Vous pouvez le modifier à tout moment dans <strong>Réglages → Confidentialité</strong> ; le désactiver efface les rapports encore en attente sur votre appareil. Les rapports sont stockés dans Supabase et supprimés au bout de 180 jours au plus.</p>
<h2 data-sec="invite">13. Codes d’invitation</h2>
<p>Si vous êtes connecté, NexuLex AI vous attribue un court code d’invitation. Lorsqu’un ami le saisit, nous enregistrons les deux identifiants de compte, l’identifiant d’appareil de l’ami (celui utilisé pour le quota d’analyses gratuites) et la date, uniquement pour accorder les analyses bonus et prévenir les abus. Rien sur vos contrats n’est partagé. Si vous supprimez votre compte, votre code et ses liens avec les comptes sont supprimés ; un enregistrement sans identifiant de compte peut subsister afin que le même appareil ne puisse pas réclamer à nouveau le bonus.</p>
<h2 data-sec="controller">14. Responsable du traitement et bases juridiques</h2>
<p>Le responsable du traitement de vos données personnelles est Doğancan Kara, entrepreneur individuel à Bağcılar, Istanbul, Turquie (e-mail : nexulexai@gmail.com), éditeur de NexuLex AI. Lorsque le RGPD, le RGPD britannique ou la LPD suisse s’applique, nous nous appuyons sur les bases juridiques suivantes : l’exécution de notre contrat avec vous (votre compte, vos analyses, vos quotas et vos achats) ; nos intérêts légitimes (exploiter le service en sécurité, prévenir l’abus du quota gratuit et corriger les erreurs) ; votre consentement (fonctions facultatives que vous activez, comme les rapports d’utilisation anonymes là où le consentement est requis) ; et les obligations légales lorsqu’elles s’appliquent. Vous pouvez retirer votre consentement à tout moment, sans effet sur les traitements antérieurs. Lorsque d’autres lois sur la protection des données s’appliquent, nous nous appuyons sur les fondements équivalents qu’elles prévoient.</p>
<h2 data-sec="security">15. Sécurité</h2>
<p>Nous protégeons les données par des connexions chiffrées (HTTPS), l’authentification des comptes et des politiques de sécurité au niveau des lignes dans notre base de données ; les requêtes d’IA passent par notre serveur et non directement depuis l’application. Aucun système n’est totalement sûr : protégez vos identifiants de connexion. Si une violation de données personnelles vous concerne, nous vous en informerons ainsi que les autorités lorsque la loi l’exige.</p>
<h2 data-sec="templates">16. Modèles de contrats</h2>
<p>La bibliothèque de contrats (onglet Conseiller) remplit sur votre appareil des modèles de contrats open source. Les informations saisies dans le formulaire servent uniquement à construire le document à l’écran et ne sont conservées que dans la mémoire de l’application pendant la session ; elles ne sont envoyées ni à nos serveurs, ni à notre fournisseur d’IA, ni à personne d’autre, et ne sont pas enregistrées dans votre compte. Le document ne quitte votre appareil que lorsque vous le copiez, le partagez ou l’exportez vous-même. Les textes des modèles sont inclus dans l’application et publiés par General Legal sous la licence du domaine public CC0-1.0.</p>
<h2 data-sec="retention">17. Durées de conservation</h2>
<p>Combien de temps nous conservons les données sur nos serveurs :</p>
<table>
<thead><tr><th>Données</th><th>Durée</th></tr></thead>
<tbody>
<tr><td>Compte et profil</td><td>Jusqu’à la suppression de votre compte</td></tr>
<tr><td>Analyses enregistrées et texte des contrats</td><td>Jusqu’à ce que vous les supprimiez, ou supprimiez votre compte</td></tr>
<tr><td>Codes de synthèse et de partage</td><td>Jusqu’à la fin de la durée de validité indiquée ; un code expiré cesse automatiquement de fonctionner</td></tr>
<tr><td>Messages d’assistance</td><td>24 mois au plus, ou jusqu’à la suppression de votre compte</td></tr>
<tr><td>Rapports anonymes d’usage et d’erreur</td><td>180 jours au plus</td></tr>
<tr><td>Enregistrement du quota gratuit (identifiant d’appareil, sans lien avec votre compte)</td><td>Pas de date de fin fixe ; conservé uniquement pour éviter l’abus répété du quota gratuit</td></tr>
<tr><td>Offre et date d’expiration sur votre profil</td><td>Jusqu’à la suppression de votre compte ; les achats conservés par Apple, Google et RevenueCat relèvent de leurs propres politiques</td></tr>
<tr><td>Données sur votre appareil (historique, dossiers, réponses, brouillons)</td><td>Jusqu’à leur suppression ou la désinstallation de l’app</td></tr>
</tbody>
</table>
<h2 data-sec="kvkk">18. Turquie : notice d’information KVKK (loi n° 6698)</h2>
<p>Si vous êtes en Turquie, cette section est notre notice d’information au titre de l’article 10 de la loi turque n° 6698 sur la protection des données personnelles (KVKK). Responsable du traitement : Doğancan Kara (entrepreneur individuel), Bağcılar, Istanbul, Turquie ; e-mail : nexulexai@gmail.com.</p>
<p>Finalités : créer et faire fonctionner votre compte, analyser les contrats que vous soumettez, appliquer les quotas, traiter les achats, assurer l’assistance, sécuriser le service et prévenir les abus, et respecter les obligations légales. Bases juridiques (article 5) : l’exécution d’un contrat, les intérêts légitimes du responsable, le consentement explicite lorsqu’il est requis (par exemple pour les rapports d’usage anonymes facultatifs) et les obligations légales. Mode de collecte : vos propres saisies et la collecte automatique via l’app, par voie électronique.</p>
<p>Destinataires et transferts : vos données sont traitées par les prestataires cités à la section 9, dont certains hors de Turquie (Supabase dans l’Union européenne, Anthropic et RevenueCat aux États-Unis). Nous effectuons les transferts à l’étranger conformément à l’article 9 de la KVKK. Nous ne vendons pas vos données.</p>
<p>Vos droits au titre de l’article 11 : savoir si vos données sont traitées et demander des informations ; connaître la finalité et son respect ; connaître les tiers auxquels elles sont transférées en Turquie ou à l’étranger ; demander la rectification de données incomplètes ou inexactes ; demander l’effacement ou la destruction au titre de l’article 7 et que les tiers en soient informés ; vous opposer à un résultat défavorable issu uniquement d’une analyse automatisée ; et demander réparation d’un préjudice causé par un traitement illicite.</p>
<p>Pour exercer vos droits, écrivez à nexulexai@gmail.com depuis l’adresse avec laquelle vous vous êtes inscrit et décrivez votre demande. Nous répondons dans un délai maximal de 30 jours. Si vous n’êtes pas satisfait, vous pouvez saisir l’autorité turque de protection des données (Kişisel Verileri Koruma Kurulu). Les contrats que vous importez peuvent contenir des données de tiers ; vous devez avoir le droit de les traiter.</p>
<h2 data-sec="ccpa">19. États-Unis : droits en Californie et dans d’autres États</h2>
<p>Nous ne vendons pas vos informations personnelles et ne les partageons pas à des fins de publicité comportementale intercontextuelle. L’app ne contient aucune publicité ; il n’existe donc pas de réglage « Ne pas vendre ni partager mes informations personnelles » à activer.</p>
<p>Si vous vivez en Californie ou dans un autre État américain doté d’une loi sur la vie privée des consommateurs (par exemple le CCPA/CPRA), dans la mesure où cette loi s’applique à nous, vous pouvez avoir le droit de savoir quelles informations personnelles nous collectons, utilisons et divulguons ; d’y accéder, de les corriger et de les supprimer ; de limiter l’usage des informations sensibles ; et de ne subir aucune discrimination pour avoir exercé ces droits.</p>
<p>Au cours des douze derniers mois, nous avons collecté ces catégories : identifiants (adresse e-mail, identifiants d’appareil et d’installation) ; informations commerciales (statut de l’offre et des achats) ; activité dans l’app (événements d’usage anonymes) ; et le contenu que vous soumettez (contrats et questions). Nous ne les divulguons qu’aux prestataires de la section 9, pour les finalités professionnelles décrites dans cette politique. Nous ne conservons pas votre enregistrement vocal.</p>
<p>Pour exercer vos droits, écrivez à nexulexai@gmail.com depuis l’adresse avec laquelle vous vous êtes inscrit. Nous pouvons demander des informations pour vérifier votre identité, vous pouvez recourir à un mandataire autorisé, et nous répondons sous 45 jours lorsque la loi l’exige.</p>
<h2 data-sec="changes">20. Modifications de cette politique</h2>
<p>Nous pouvons mettre à jour cette politique de confidentialité. En cas de modification importante, nous changerons la date en haut de page et, si la loi l’exige, nous vous en informerons dans l’application ou par un autre moyen approprié avant son application. Consultez cette page de temps à autre.</p>
<h2 data-sec="language">21. Langues</h2>
<p>Cette politique est disponible en plusieurs langues par commodité. En cas de différence entre une traduction et la version anglaise, la version anglaise prévaut.</p>
<p lang="en" dir="ltr">In case of discrepancies, the English version shall prevail.</p>
<h2>22. Contact</h2>
<p>Questions de confidentialité et demandes relatives à vos données : écrivez à nexulexai@gmail.com ou utilisez l’écran Assistance dans l’app. Éditeur et responsable du traitement : Doğancan Kara (entrepreneur individuel), Bağcılar, Istanbul, Turquie.</p>`,

  deleteAccount: `<h1>Supprimer votre compte NexuLex AI</h1>
<p class="meta">Mise à jour : 25 septembre 2026. Traduction de commodité. Le texte anglais fait foi.</p>
<h2>Dans l’application (le plus rapide)</h2>
<ol>
<li>Ouvrez NexuLex AI et connectez-vous.</li>
<li>Allez dans <strong>Réglages</strong> et touchez <strong>Supprimer le compte</strong>.</li>
<li>Lisez l’avis et confirmez deux fois. La suppression s’exécute tout de suite et vous êtes déconnecté.</li>
</ol>
<p class="warn"><strong>Les abonnements ne sont pas annulés automatiquement.</strong> Annulez un forfait actif dans
<a href="https://apps.apple.com/account/subscriptions">les abonnements App Store</a> ou
<a href="https://play.google.com/store/account/subscriptions">les abonnements Google Play</a>.</p>
<h2>Sans l’application</h2>
<p>Écrivez à <a href="mailto:nexulexai@gmail.com?subject=Account%20deletion%20request">nexulexai@gmail.com</a> depuis l’adresse inscrite le texte « Delete my account » / « Supprimer mon compte ». Nous confirmons par e-mail et achevons la suppression sous 30 jours.</p>
<h2>Ce qui est supprimé</h2>
<ul>
<li>Votre compte et profil (e-mail, identifiants, état Pro).</li>
<li>Analyses et textes de contrat, codes de partage, rappels, sièges conseiller / foyer et briefs.</li>
<li>Messages d’assistance et signalements IA que vous avez envoyés.</li>
<li>Sur l’appareil de la suppression in-app : rappels planifiés, caches locaux et fichiers exportés.</li>
</ul>
<h2>Ce qui est conservé</h2>
<p>L’identifiant d’appareil utilisé pour le quota d’analyse gratuit reste sans lien avec votre compte, seulement pour bloquer les demandes gratuites répétées. Les achats chez Apple, Google et RevenueCat suivent leurs propres règles.</p>
<p>Voir aussi la <a href="privacy.html">politique de confidentialité</a>.</p>`,

  terms: `<h1>Conditions d’utilisation (EULA)</h1>
<p class="meta">Mise à jour : 21 octobre 2026. Traduction de commodité. Le texte anglais fait foi.</p>
<p>En téléchargeant ou en utilisant NexuLex AI vous acceptez ces conditions et notre <a href="privacy.html">politique de confidentialité</a>.</p>
<h2>1. Description du service</h2>
<p>NexuLex AI est un logiciel grand public qui aide à relire des contrats, voir des risques, rédiger un contre-langage et partager des briefs en lecture seule. Il est fourni « en l’état ».</p>
<h2>2. Pas un cabinet</h2>
<p><strong>NexuLex AI n’est pas un cabinet d’avocats et ne fournit pas de conseil juridique.</strong> Rien dans l’app ne crée de relation avocat-client. Vérifiez les décisions importantes auprès d’un avocat habilité dans votre pays.</p>
<p>« Trouver un avocat » renvoie seulement aux annuaires officiels des barreaux et organismes publics. NexuLex AI ne recommande, ne classe ni ne réoriente d’avocats, ne perçoit aucun honoraire de recommandation et n’est pas responsable des services de l’avocat que vous choisissez. Vérifiez inscription et honoraires avant de le mandater.</p>
<h2>3. Comptes et abonnements</h2>
<ul>
<li>Les quotas gratuits et droits Pro sont appliqués côté serveur et via RevenueCat / les boutiques.</li>
<li>Le forfait Professional inclut tout Pro plus les outils Professional et les plafonds quotidiens plus élevés affichés dans l’app. Votre forfait est vérifié par notre serveur avec RevenueCat ; il ne peut pas être changé depuis l’app.</li>
<li>Les outils Professional sont des aides de travail, pas un conseil juridique. Ils n’utilisent que votre matériau et peuvent contenir des erreurs ; vérifiez chaque date, fait et source. NexuLex AI ne représente personne devant une juridiction ou une autorité.</li>
<li>Facturation, remboursements et annulations suivent les règles App Store ou Google Play.</li>
<li>Vous êtes responsable de la sécurité de vos identifiants.</li>
</ul>
<h2>4. Usage acceptable</h2>
<ul>
<li>N’envoyez pas de contenu illicite ni de matériau que vous n’êtes pas autorisé à traiter.</li>
<li>N’essayez pas de contourner, surcharger ou désosser la sécurité, les quotas ou les paywalls.</li>
<li>N’utilisez pas le service pour harceler, frauder ou tromper.</li>
<li>Ne partagez pas de secrets, identifiants ou données personnelles de tiers sans base légale.</li>
</ul>
<h2>5. Propriété intellectuelle</h2>
<p>Le nom, la marque et le logiciel NexuLex AI appartiennent à l’éditeur. Vous gardez les droits sur les contrats téléversés. Vous nous accordez une licence limitée pour traiter ce contenu uniquement afin de fournir le service.</p>
<h2>6. Briefs partagés et sièges</h2>
<p>Les liens de brief et les sièges conseiller / foyer sont conçus pour cacher le contrat original. Les destinataires voient quand même les synthèses d’analyse que vous choisissez de partager. Soyez prudent avant de créer des codes.</p>
<h2>7. Limitation de responsabilité</h2>
<p>Dans la mesure permise par la loi, nous ne sommes pas responsables des décisions prises sur la sortie de l’app, des erreurs d’IA tierce, des litiges de facturation boutique ou des pannes hors de notre contrôle raisonnable.</p>
<h2>8. Modifications</h2>
<p>Nous pouvons mettre à jour ces conditions. Continuer à utiliser le service après une mise à jour vaut acceptation.</p>
<h2 data-sec="eligibility">9. Conditions d’âge</h2>
<p>Pour utiliser NexuLex AI, vous devez avoir au moins 18 ans ou avoir atteint la majorité là où vous vivez. Si vous l’utilisez pour une entreprise, vous confirmez pouvoir l’engager.</p>
<h2 data-sec="renewal">10. Abonnements et renouvellement automatique</h2>
<p>Les forfaits payants se renouvellent automatiquement pour la même durée au prix de la boutique affiché, jusqu’à résiliation. Le paiement est débité sur votre compte App Store ou Google Play. Vous pouvez gérer ou résilier dans les réglages de votre compte boutique ; sur l’App Store, au moins 24 heures avant la fin de la période en cours. Supprimer votre compte NexuLex AI ne résilie pas l’abonnement. Les remboursements suivent la politique de la boutique.</p>
<h2 data-sec="ai">11. Contenus générés par IA</h2>
<p>Les analyses, réponses, brouillons et synthèses sont générés par intelligence artificielle. Ils peuvent être incomplets, périmés ou erronés, et le droit varie selon les pays et évolue. Vérifiez les points importants auprès de sources officielles ou d’un avocat habilité avant de vous y fier.</p>
<h2 data-sec="termin">12. Suspension et résiliation</h2>
<p>Vous pouvez cesser d’utiliser NexuLex AI et supprimer votre compte à tout moment. Nous pouvons suspendre ou mettre fin à un accès qui enfreint ces conditions ou met en danger le service ou d’autres utilisateurs.</p>
<h2 data-sec="templates">13. Modèles de contrats</h2>
<p>La bibliothèque de contrats (onglet Conseiller) propose des modèles de contrats commerciaux d’usage général publiés par General Legal sous la licence du domaine public CC0-1.0. NexuLex AI insère les informations que vous saisissez et laisse le reste de chaque modèle inchangé, dans sa rédaction anglaise d’origine. Les modèles ne sont pas adaptés à votre situation, à votre pays ni à votre secteur et peuvent ne pas être valables ou exécutoires là où vous vous trouvez. Ils sont fournis « en l’état », sans garantie. Faites relire tout contrat par un avocat habilité dans la juridiction applicable avant de le signer. NexuLex AI n’est partie à aucun contrat que vous créez, et la bibliothèque de contrats ne crée pas de relation avocat-client. Le document complet, l’export Word, la copie et le partage font partie de l’offre Pro ; les utilisateurs gratuits voient un aperçu.</p>
<h2 data-sec="law">14. Droit applicable et tribunaux</h2>
<p>Ces conditions sont régies par le droit de la République de Turquie. Les tribunaux et services d’exécution d’Istanbul (Çağlayan) sont compétents, sans préjudice des droits impératifs de protection des consommateurs dont vous bénéficiez selon la loi de votre pays de résidence, y compris le droit de saisir le tribunal ou l’organisme compétent sur place.</p>
<h2 data-sec="language">15. Langues</h2>
<p>Ces conditions sont disponibles en plusieurs langues par commodité. En cas de différence entre une traduction et la version anglaise, la version anglaise prévaut.</p>
<p lang="en" dir="ltr">In case of discrepancies, the English version shall prevail.</p>
<h2>16. Contact</h2>
<p>Pour le compte, le produit ou les questions de consommateurs, utilisez l’écran Assistance dans l’app ou écrivez à nexulexai@gmail.com. Éditeur : Doğancan Kara (entrepreneur individuel), Bağcılar, Istanbul, Turquie.</p>`,
};
