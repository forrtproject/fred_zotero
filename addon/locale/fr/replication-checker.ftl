# Zotero Replication Checker Locale File - French (Français)
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = Vérifier la bibliothèque actuelle pour les réplications
replication-checker-context-menu = Vérifier les réplications
replication-checker-context-menu-ban = Bannir la réplication
replication-checker-context-menu-add-original = Ajouter l'original

## Progress Messages
replication-checker-progress-checking-library = Vérification des réplications
replication-checker-progress-checking-collection = Vérification des réplications dans la collection
replication-checker-progress-scanning-library = Analyse de la bibliothèque...
replication-checker-progress-scanning-collection = Analyse de la collection...
replication-checker-progress-found-dois = { $itemCount } éléments avec des DOI trouvés ({ $uniqueCount } uniques)
replication-checker-progress-checking-database = Consultation de la base de données de réplication...
replication-checker-progress-no-dois = Aucun élément avec des DOI trouvé dans la collection
replication-checker-progress-complete = Vérification terminée
replication-checker-progress-failed = Vérification échouée
replication-checker-progress-match-count = { $count } élément(s) avec des réplications trouvé(s)
replication-checker-progress-copying-readonly = Copie des éléments de la bibliothèque en lecture seule vers la bibliothèque personnelle...

## Alerts
replication-checker-alert-title = Vérificateur de réplication Zotero
replication-checker-alert-no-dois-selected = Aucun DOI trouvé dans les éléments sélectionnés.
replication-checker-alert-no-collection = Veuillez sélectionner une collection avant d'exécuter cette vérification.
replication-checker-alert-no-originals-available = Aucune étude originale disponible pour cette réplication.
replication-checker-alert-no-doi = L'élément sélectionné n'a pas de DOI.
replication-checker-add-original-success = Étude originale ajoutée avec succès : { $title }
replication-checker-add-original-confirm = { $count } étude(s) originale(s) trouvée(s) pour cette réplication. Voulez-vous toutes les ajouter à votre bibliothèque ?
replication-checker-add-original-batch-success = { $count } étude(s) originale(s) ajoutée(s) avec succès à votre bibliothèque.
replication-checker-error-title = Vérificateur de réplication - Erreur
replication-checker-error-api = Impossible de récupérer les données depuis l'API - vérifiez votre connexion Internet ou réessayez plus tard.
replication-checker-error-body =
    Échec de la vérification de { $target } pour les réplications :

    { $details }

    Impossible de récupérer les données depuis l'API - vérifiez votre connexion Internet ou réessayez plus tard.
replication-checker-target-library = la bibliothèque actuelle
replication-checker-target-selected = les éléments sélectionnés
replication-checker-target-collection = la collection sélectionnée

## Ban Feature
replication-checker-ban-title = Bannir les réplications
replication-checker-ban-confirm =
    Êtes-vous sûr de vouloir bannir { $count } réplication(s) ?

    Ces éléments seront déplacés vers la corbeille et ne seront pas rajoutés lors des vérifications futures.
replication-checker-ban-success = { $count } réplication(s) bannie(s) avec succès.
replication-checker-alert-no-replications-selected = Aucun élément de réplication sélectionné.

## Dialog
replication-checker-dialog-title = Études de réplication trouvées
replication-checker-dialog-intro = Études de réplication trouvées pour :\n"{ $title }"
replication-checker-dialog-count = { $count } réplication(s) trouvée(s) :
replication-checker-dialog-item = { $index }. { $title }\n({ $year })\n   Résultat : { $outcome }
replication-checker-dialog-more = ...et { $count } réplication(s) supplémentaire(s)
replication-checker-dialog-question = Souhaitez-vous ajouter des informations de réplication ?
replication-checker-dialog-progress-title = Informations de réplication ajoutées
replication-checker-dialog-progress-line = Informations de réplication ajoutées à "{ $title }"
replication-checker-dialog-is-replication-title = Étude originale trouvée
replication-checker-dialog-is-replication-message = Aucune réplication trouvée, mais il semble que ce soit une étude de réplication.\n\nSouhaitez-vous ajouter le(s) article(s) original(aux) ?

## Read-Only Library Handling
replication-checker-readonly-dialog-title = Bibliothèque en lecture seule détectée
replication-checker-readonly-dialog-message =
    Cette bibliothèque est en lecture seule. Nous avons trouvé { $itemCount } élément(s) avec { $replicationCount } réplication(s).

    Souhaitez-vous copier les articles originaux et leurs réplications dans le "dossier de réplication" de votre bibliothèque personnelle ?

## Results Messages
replication-checker-results-title-library = Analyse de la bibliothèque terminée
replication-checker-results-title-selected = Analyse des éléments sélectionnés terminée
replication-checker-results-title-collection = Analyse de la collection terminée
replication-checker-results-total = Total des éléments vérifiés : { $count }
replication-checker-results-dois = Éléments avec des DOI : { $count }
replication-checker-results-found = { $count } élément(s) ont des réplications.
replication-checker-results-none = Aucune réplication trouvée.
replication-checker-results-reproductions-found = { $count } élément(s) ont des reproductions.
replication-checker-results-reproductions-none = Aucune reproduction trouvée.
replication-checker-results-footer = Consultez les notes pour plus de détails ou sélectionnez des éléments à revérifier.

## Tags
replication-checker-tag = A une réplication
replication-checker-tag-is-replication = Est une réplication
replication-checker-tag-added-by-checker = Ajouté par le vérificateur de réplication
replication-checker-tag-success = Réplication : Réussie
replication-checker-tag-failure = Réplication : Échouée
replication-checker-tag-mixed = Réplication : Mixte
replication-checker-tag-readonly-origin = Original présent dans une bibliothèque en lecture seule
replication-checker-tag-has-been-replicated = A été répliqué
replication-checker-tag-has-been-reproduced = A été reproduit
replication-checker-tag-in-flora = Dans FLoRA

## Note Template
replication-checker-note-title = Réplications trouvées
replication-checker-note-warning = Cette note est générée automatiquement. Si vous la modifiez, une nouvelle note sera créée lors de la prochaine vérification et cette version sera conservée telle quelle.
replication-checker-note-intro = Cette étude a été répliquée :
replication-checker-note-feedback = Avez-vous trouvé ce résultat utile ? Donnez votre avis <a href="{ $url }" target="_blank">ici</a> !
replication-checker-note-data-issues = Avez-vous trouvé des problèmes dans les données ? Veuillez les signaler <a href="{ $url }" target="_blank">ici</a> !
replication-checker-note-footer = Généré par le Vérificateur de réplication Zotero en utilisant la base de données de littérature FORRT (FLoRA)

## Replication Item Details
replication-checker-li-no-title = Aucun titre disponible
replication-checker-li-no-authors = Aucun auteur disponible
replication-checker-li-no-journal = Aucune revue
replication-checker-li-na = N/D
replication-checker-li-doi-label = DOI :
replication-checker-li-outcome = Résultat rapporté par l'auteur :
replication-checker-li-link = Cette étude a un rapport lié :

## First Run Prompt
replication-checker-prompt-title = Bienvenue dans le Vérificateur de réplication Zotero !
replication-checker-prompt-first-run =
    Merci d'avoir installé le Vérificateur de réplication Zotero !

    Ce plugin vous aide à découvrir des études de réplication pour votre recherche en vérifiant vos éléments de bibliothèque dans la base de données de littérature FORRT (FLoRA).

    Souhaitez-vous analyser votre bibliothèque pour les réplications maintenant ?

    • Cliquez sur "OK" pour commencer l'analyse (cela peut prendre quelques minutes)
    • Cliquez sur "Annuler" pour ignorer - vous pouvez toujours analyser plus tard depuis le menu Outils

## Onboarding
onboarding-welcome-title = Bienvenue dans le Vérificateur de réplication !
onboarding-welcome-content =
    Merci d'avoir installé le Vérificateur de réplication Zotero !

    Ce plugin vous aide à découvrir des études de réplication en vérifiant automatiquement vos éléments de bibliothèque dans la base de données de littérature FORRT (FLoRA).

    ✨ Fonctionnalités clés :
    • Vérification automatique des DOI dans la base de données de réplication
    • Fonctionne avec toute la bibliothèque, des collections ou des éléments individuels
    • Crée des notes liées avec des informations de réplication
    • Étiquette les éléments avec leur statut de réplication
    • Ajoute des études originales lorsque vous avez des réplications
    • Bannit les réplications indésirables des vérifications futures

    Faisons un tour rapide pour vous démarrer !

onboarding-tools-title = Vérifier toute votre bibliothèque
onboarding-tools-content =
    📍 Emplacement : Outils → Vérifier la bibliothèque actuelle pour les réplications

    🔍 Ce que ça fait :
    • Analyse tous les éléments avec des DOI
    • Consulte la base de données FLoRA
    • Crée des notes avec des détails
    • Étiquette les éléments par résultat

    💡 Conseil : Prend quelques minutes selon la taille de la bibliothèque.

onboarding-context-title = Vérifier les collections et les éléments
onboarding-context-content =
    📚 Pour les collections :
    Clic droit sur la collection → Vérifier les réplications

    📄 Pour les éléments individuels :
    Clic droit sur les éléments → Vérifier les réplications

    🚫 Bannir des réplications :
    Clic droit sur les éléments de réplication → Bannir la réplication
    • Empêche les réplications indésirables d'être rajoutées

    ⚙️ Préférences :
    Édition → Paramètres → Vérificateur de réplication
    • Fréquence de vérification automatique
    • Vérification automatique des nouveaux éléments

onboarding-scan-title = Prêt à analyser votre bibliothèque ?
onboarding-scan-content =
    Souhaitez-vous analyser votre bibliothèque pour les réplications maintenant ?

    • Cliquez sur "Oui" pour commencer l'analyse
      (cela peut prendre quelques minutes)

    • Cliquez sur "Non" pour ignorer - vous pouvez toujours analyser plus tard depuis le menu Outils

    💡 Accédez à ce guide à tout moment :
    Aide → Guide d'utilisation du Vérificateur de réplication

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = Bannir la reproduction

## Reproduction Feature - Tags
reproduction-checker-tag = A une reproduction
reproduction-checker-tag-is-reproduction = Est une reproduction
reproduction-checker-tag-added-by-checker = Ajouté par le vérificateur de réplication
reproduction-checker-tag-readonly-origin = Original présent dans une bibliothèque en lecture seule

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = Reproduction : Succès informatique, Robuste
reproduction-checker-tag-outcome-cs-challenges = Reproduction : Succès informatique, Défis de robustesse
reproduction-checker-tag-outcome-cs-not-checked = Reproduction : Succès informatique, Robustesse non vérifiée
reproduction-checker-tag-outcome-ci-robust = Reproduction : Problèmes informatiques, Robuste
reproduction-checker-tag-outcome-ci-challenges = Reproduction : Problèmes informatiques, Défis de robustesse
reproduction-checker-tag-outcome-ci-not-checked = Reproduction : Problèmes informatiques, Robustesse non vérifiée

## Reproduction Feature - Note Template
reproduction-checker-note-title = Reproductions trouvées
reproduction-checker-note-warning = Cette note est générée automatiquement. Si vous la modifiez, une nouvelle note sera créée lors de la prochaine vérification et cette version sera conservée telle quelle.
reproduction-checker-note-intro = Cette étude a été reproduite :
reproduction-checker-note-feedback = Avez-vous trouvé ce résultat utile ? Donnez votre avis <a href="{ $url }" target="_blank">ici</a> !
reproduction-checker-note-data-issues = Avez-vous trouvé des problèmes dans les données ? Veuillez les signaler <a href="{ $url }" target="_blank">ici</a> !
reproduction-checker-note-footer = Généré par le Vérificateur de réplication Zotero en utilisant la base de données de littérature FORRT (FLoRA)

## Reproduction Feature - Item Details
reproduction-checker-li-no-title = Aucun titre disponible
reproduction-checker-li-no-authors = Aucun auteur disponible
reproduction-checker-li-no-journal = Aucune revue
reproduction-checker-li-na = N/D
reproduction-checker-li-doi-label = DOI :
reproduction-checker-li-outcome = Résultat de la reproduction :
reproduction-checker-li-link = Cette étude a un rapport lié :

## Reproduction Feature - Alerts
reproduction-checker-alert-no-reproductions-selected = Aucun élément de reproduction sélectionné.
reproduction-checker-ban-title = Bannir les reproductions
reproduction-checker-ban-confirm =
    Êtes-vous sûr de vouloir bannir { $count } reproduction(s) ?

    Ces éléments seront déplacés vers la corbeille et ne seront pas rajoutés lors des vérifications futures.
reproduction-checker-ban-success = { $count } reproduction(s) bannie(s) avec succès.

## Reproduction Feature - Dialog
reproduction-checker-dialog-title = Études de reproduction trouvées
reproduction-checker-dialog-intro = Études de reproduction trouvées pour :\n"{ $title }"
reproduction-checker-dialog-count = { $count } reproduction(s) trouvée(s) :
reproduction-checker-dialog-item = { $index }. { $title }\n({ $year })\n   Résultat : { $outcome }
reproduction-checker-dialog-more = ...et { $count } reproduction(s) supplémentaire(s)
reproduction-checker-dialog-question = Souhaitez-vous ajouter des informations de reproduction ?
reproduction-checker-dialog-progress-title = Informations de reproduction ajoutées
reproduction-checker-dialog-progress-line = Informations de reproduction ajoutées à "{ $title }"

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found = { $count } élément(s) avec des reproductions trouvé(s)

## Preference Pane
pref-autocheck-title = Vérification automatique de la bibliothèque pour les réplications
pref-autocheck-description = Vérifier automatiquement votre bibliothèque pour les études de réplication à intervalles réguliers
pref-autocheck-disabled = Désactivé (vérification manuelle uniquement)
pref-autocheck-daily = Quotidien (vérifier toutes les 24 heures)
pref-autocheck-weekly = Hebdomadaire (vérifier tous les 7 jours)
pref-autocheck-monthly = Mensuel (vérifier tous les 30 jours)
pref-autocheck-new-items = Vérifier automatiquement les nouveaux éléments ajoutés à la bibliothèque (recommandé)
pref-autocheck-new-items-hint = Désactivez cette option si vous préférez effectuer toutes les vérifications de réplication manuellement.
pref-autocheck-note = La vérification automatique s'exécute en arrière-plan lorsque Zotero est ouvert. Vous pouvez toujours vérifier manuellement depuis le menu Outils.
pref-blacklist-title = Réplications bannies
pref-blacklist-description = Gérer les réplications que vous avez bannies de votre bibliothèque
pref-blacklist-col-replication = Article de réplication
pref-blacklist-col-original = Article original
pref-blacklist-col-type = Type
pref-blacklist-col-banned = Banni le
pref-blacklist-empty = Aucune réplication bannie
pref-blacklist-remove = Supprimer la sélection
pref-blacklist-clear = Effacer toutes les réplications bannies
pref-blacklist-hint = Les réplications bannies ne seront pas rajoutées lors des vérifications futures. Vous pouvez bannir des réplications depuis le menu contextuel.
