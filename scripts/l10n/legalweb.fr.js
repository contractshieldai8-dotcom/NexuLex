// WAVE ST.3 — Confidentialité + suppression (FR). WAVE B: accents and apostrophes restored.
module.exports = {
  privacy: `<h1>Politique de confidentialité</h1>
<p class="meta">Mise à jour : 5 octobre 2026. Traduction de commodité. Le texte anglais fait foi.</p>
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
<h2>5. Conservation et suppression</h2>
<p>Vous pouvez supprimer le compte à tout moment dans l’app sous <strong>Réglages, puis Supprimer le compte</strong>, ou via les étapes de la <a href="delete-account.html">page de suppression</a> (sans l’app). La suppression retire le compte et le profil, les analyses et textes de contrat, les codes de partage, les rappels, les sièges conseiller / foyer et briefs, les messages d’assistance et les signalements IA. Sur l’appareil utilisé pour la suppression in-app, les rappels planifiés, caches locaux et fichiers exportés sont aussi effacés.</p>
<p>Après suppression, l’identifiant d’appareil et le numéro utilisés pour réclamer le quota gratuit restent sans aucun lien avec votre compte, seulement pour empêcher les demandes gratuites répétées.</p>
<p>Un abonnement App Store / Google Play actif n’est pas annulé automatiquement par la suppression ; annulez-le dans le compte boutique. Les codes de brief expirent d’eux-mêmes après la fenêtre indiquée.</p>
<h2>6. Avertissement juridique</h2>
<p><strong>NexuLex AI n’est pas un cabinet d’avocats et ne fournit pas de conseil juridique.</strong> Les sorties sont des outils d’information générale. Les décisions restent les vôtres ; consultez un avocat habilité pour votre affaire.</p>
<h2 data-sec="signup">7. Données d’inscription</h2>
<p>À l’inscription, vous fournissez une adresse e-mail et un numéro de téléphone. Le numéro de téléphone et un identifiant d’appareil servent à réclamer le quota d’analyse gratuit et à empêcher les abus répétés. Ils ne servent pas à la publicité et ne sont pas vendus.</p>
<h2 data-sec="voice">8. Saisie vocale</h2>
<p>La saisie vocale est facultative. Lorsque vous utilisez le micro, la reconnaissance vocale est réalisée par le service vocal intégré à votre téléphone (Apple ou Google), selon les conditions de confidentialité de ce fournisseur. NexuLex AI n’enregistre ni ne conserve votre audio ; il ne reçoit que le texte que vous choisissez d’utiliser.</p>
<h2 data-sec="transfer">9. Prestataires et transferts internationaux</h2>
<p>Nous utilisons Supabase (base de données cloud et connexion), un fournisseur d’IA tiers joint via notre serveur (analyses et réponses), RevenueCat (statut d’achat) et les boutiques Apple et Google. Ces prestataires peuvent traiter des données dans d’autres pays que le vôtre, y compris hors de l’Espace économique européen, du Royaume-Uni et de la Suisse. Lorsque la loi exige des garanties pour de tels transferts, nous nous appuyons sur les mécanismes de transfert proposés par ces prestataires.</p>
<h2 data-sec="rights">10. Vos droits</h2>
<p>Selon votre lieu de résidence (par exemple au titre du RGPD / UK GDPR, de la LPD suisse, de la DSG autrichienne, de la KVKK turque, du DPDP Act indien, de la PIPEDA canadienne et des lois provinciales ou du Privacy Act australien), vous pouvez avoir le droit d’accéder à vos données, de les rectifier, de les supprimer, de les récupérer, d’en limiter le traitement ou de vous y opposer, et de retirer votre consentement. Vous pouvez supprimer votre compte dans l’app. Pour toute autre demande, écrivez à nexulexai@gmail.com depuis votre adresse inscrite ; nous répondons dans le délai prévu par la loi. Vous pouvez aussi saisir l’autorité de protection des données de votre pays.</p>
<h2 data-sec="children">11. Enfants, publicité et suivi</h2>
<p>NexuLex AI s’adresse aux adultes de 18 ans ou plus et non aux enfants. Nous ne collectons pas sciemment de données d’enfants ; contactez-nous et nous les supprimerons. L’app ne contient ni publicité ni suivi entre applications, et nous ne vendons pas de données personnelles.</p>
<h2 data-sec="analytics">12. Rapports anonymes d’utilisation et d’erreurs</h2>
<p>Pour garder l’application fiable et l’améliorer, NexuLex AI peut envoyer de courts événements anonymes : par exemple les zones utilisées, si une analyse s’est terminée ou a échoué, les résultats de l’écran d’abonnement et des achats, et le type d’une erreur. Chaque rapport contient un identifiant d’installation aléatoire créé sur votre appareil (et non l’identifiant matériel de votre appareil), la version de l’app, la plateforme et la langue de l’app. Les rapports ne contiennent jamais vos contrats, textes, images, adresse e-mail, numéro de téléphone ni identifiant de compte, et ne sont ni utilisés pour la publicité ni vendus.</p>
<p>Dans l’Espace économique européen, au Royaume-Uni, en Suisse, en Türkiye, au Brésil, en Inde, en Corée du Sud et en Afrique du Sud, rien n’est envoyé sans votre accord. Ailleurs, c’est activé par défaut. Vous pouvez le modifier à tout moment dans <strong>Réglages → Confidentialité</strong> ; le désactiver efface les rapports encore en attente sur votre appareil. Les rapports sont stockés dans Supabase et supprimés au bout de 180 jours au plus.</p>
<h2 data-sec="invite">13. Codes d’invitation</h2>
<p>Si vous êtes connecté, NexuLex AI vous attribue un court code d’invitation. Lorsqu’un ami le saisit, nous enregistrons les deux identifiants de compte, l’identifiant d’appareil de l’ami (celui utilisé pour le quota d’analyses gratuites) et la date, uniquement pour accorder les analyses bonus et prévenir les abus. Rien sur vos contrats n’est partagé. Si vous supprimez votre compte, votre code et ses liens avec les comptes sont supprimés ; un enregistrement sans identifiant de compte peut subsister afin que le même appareil ne puisse pas réclamer à nouveau le bonus.</p>
<h2>14. Contact</h2>
<p>Questions de confidentialité : utilisez l’écran Assistance dans l’app ou contactez l’éditeur indiqué sur la fiche boutique.</p>`,

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
<p>L’identifiant d’appareil et le numéro utilisés pour le quota d’analyse gratuit restent sans lien avec votre compte, seulement pour bloquer les demandes gratuites répétées. Les achats chez Apple, Google et RevenueCat suivent leurs propres règles.</p>
<p>Voir aussi la <a href="privacy.html">politique de confidentialité</a>.</p>`,

  terms: `<h1>Conditions d’utilisation (EULA)</h1>
<p class="meta">Mise à jour : 5 octobre 2026. Traduction de commodité. Le texte anglais fait foi.</p>
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
<h2>13. Contact</h2>
<p>Pour le compte ou le produit, utilisez l’écran Assistance dans l’app. Pour les réclamations de consommateurs, les mentions de l’éditeur sur la fiche boutique s’appliquent.</p>`,
};
