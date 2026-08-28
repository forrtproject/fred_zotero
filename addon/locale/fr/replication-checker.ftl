# Zotero Replication Checker Locale File - French (Français)
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = Vérifier la bibliothèque actuelle pour les réplications
replication-checker-context-menu = Vérifier les réplications
replication-checker-context-menu-ban = Exclure la réplication
replication-checker-context-menu-add-original = Ajouter l'original
replication-checker-context-menu-add-originals = Ajouter les originaux

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
replication-checker-progress-match-count =
    { $count ->
        [one] 1 élément avec des réplications trouvé
       *[other] { $count } éléments avec des réplications trouvés
    }
replication-checker-progress-copying-readonly = Copie des éléments de la bibliothèque en lecture seule vers la bibliothèque personnelle...

## Alerts
replication-checker-alert-title = Zotero Replication Checker
replication-checker-alert-no-dois-selected = Aucun DOI trouvé dans les éléments sélectionnés.
replication-checker-alert-no-collection = Veuillez sélectionner une collection avant d'exécuter cette vérification.
replication-checker-alert-no-originals-available = Aucune étude originale disponible pour cette réplication.
replication-checker-alert-no-doi = L'élément sélectionné n'a pas de DOI.
replication-checker-add-original-success = "{ $title }" ajouté avec succès dans "{ $folderName }".
replication-checker-add-original-exists = "{ $title }" est déjà dans votre bibliothèque — étiquettes, notes et relations mises à jour dans "{ $folderName }".
replication-checker-add-original-add-all-btn = Ajouter tous les originaux
replication-checker-add-original-confirm =
    { $count ->
        [one] 1 article original trouvé pour cette réplication. Veuillez sélectionner les originaux que vous souhaitez ajouter à votre bibliothèque.
       *[other] { $count } articles originaux trouvés pour cette réplication. Veuillez sélectionner les originaux que vous souhaitez ajouter à votre bibliothèque.
    }
replication-checker-add-original-select-btn = Sélectionner les originaux à ajouter
replication-checker-add-original-batch-success =
    { $newCount ->
        [one] 1 nouvelle étude originale ajoutée et { $existingCount } existante mise à jour dans "{ $folderName }".
       *[other] { $newCount } nouvelles études originales ajoutées et { $existingCount } existantes mises à jour dans "{ $folderName }".
    }
replication-checker-add-original-batch-new-only =
    { $count ->
        [one] 1 étude originale ajoutée avec succès dans "{ $folderName }".
       *[other] { $count } études originales ajoutées avec succès dans "{ $folderName }".
    }
replication-checker-add-original-batch-exists-only =
    { $count ->
        [one] 1 étude originale déjà dans votre bibliothèque — étiquettes, notes et relations mises à jour dans "{ $folderName }".
       *[other] { $count } études originales déjà dans votre bibliothèque — étiquettes, notes et relations mises à jour dans "{ $folderName }".
    }
replication-checker-error-title = Replication Checker - Erreur
replication-checker-error-api = Impossible de récupérer les données depuis l'API - vérifiez votre connexion Internet ou réessayez plus tard.
replication-checker-error-body =
    Échec de la vérification de { $target } pour les réplications :

    { $details }

    Impossible de récupérer les données depuis l'API - vérifiez votre connexion Internet ou réessayez plus tard.
replication-checker-target-library = la bibliothèque actuelle
replication-checker-target-selected = les éléments sélectionnés
replication-checker-target-collection = la collection sélectionnée

## Ban Feature
replication-checker-ban-title = Exclure les réplications
replication-checker-ban-confirm =
    { $count ->
        [one] Êtes-vous sûr de vouloir exclure 1 réplication ?
       *[other] Êtes-vous sûr de vouloir exclure { $count } réplications ?
    }

    Ces éléments seront déplacés vers la corbeille et ne seront pas rajoutés lors des vérifications futures.
replication-checker-ban-success =
    { $count ->
        [one] 1 réplication exclue avec succès.
       *[other] { $count } réplications exclues avec succès.
    }
replication-checker-alert-no-replications-selected = Aucun élément de réplication sélectionné.

## Dialog
replication-checker-dialog-title = Études de réplication trouvées
replication-checker-dialog-intro =
    Études de réplication trouvées pour :
    "{ $title }"
replication-checker-dialog-count =
    { $count ->
        [one] 1 réplication trouvée :
       *[other] { $count } réplications trouvées :
    }
replication-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       Résultat : { $outcome }
replication-checker-dialog-more =
    { $count ->
        [one] ...et 1 réplication supplémentaire
       *[other] ...et { $count } réplications supplémentaires
    }
replication-checker-dialog-question = Souhaitez-vous ajouter des informations de réplication ?
replication-checker-dialog-progress-title = Informations de réplication ajoutées
replication-checker-dialog-progress-line = Informations de réplication ajoutées à "{ $title }"
replication-checker-notif-replication-new =
    { $count ->
        [one] 1 nouvelle réplication ajoutée avec succès dans "{ $folderName }".
       *[other] { $count } nouvelles réplications ajoutées avec succès dans "{ $folderName }".
    }
replication-checker-notif-replication-exists =
    { $count ->
        [one] 1 réplication déjà dans votre bibliothèque — étiquettes, notes et relations mises à jour dans "{ $folderName }".
       *[other] { $count } réplications déjà dans votre bibliothèque — étiquettes, notes et relations mises à jour dans "{ $folderName }".
    }
replication-checker-notif-replication-mixed =
    { $newCount ->
        [one] 1 nouvelle et { $existingCount } réplication existante mises à jour dans "{ $folderName }".
       *[other] { $newCount } nouvelles et { $existingCount } réplications existantes mises à jour dans "{ $folderName }".
    }
replication-checker-dialog-is-replication-title = Étude originale trouvée
replication-checker-dialog-is-replication-message =
    { $count ->
        [one] Aucune réplication trouvée, mais il semble que ce soit une étude de réplication. 1 article original trouvé. Souhaitez-vous l'ajouter à votre bibliothèque ?
       *[other] Aucune réplication trouvée, mais il semble que ce soit une étude de réplication. { $count } articles originaux trouvés. Veuillez sélectionner les originaux que vous souhaitez ajouter à votre bibliothèque.
    }

## Read-Only Library Handling
replication-checker-readonly-dialog-title = Bibliothèque en lecture seule détectée
replication-checker-readonly-dialog-message =
    { $replicationCount ->
        [one] Cette bibliothèque est en lecture seule. Nous avons trouvé { $itemCount } élément(s) avec 1 réplication.
       *[other] Cette bibliothèque est en lecture seule. Nous avons trouvé { $itemCount } élément(s) avec { $replicationCount } réplications.
    }

    Souhaitez-vous copier les articles originaux et leurs réplications dans le "dossier réplications" de votre bibliothèque personnelle ?

## Results Messages
replication-checker-results-title-library = Analyse de la bibliothèque terminée
replication-checker-results-title-selected = Analyse des éléments sélectionnés terminée
replication-checker-results-title-collection = Analyse de la collection terminée
replication-checker-results-total = Total des éléments vérifiés : { $count }
replication-checker-results-dois = Éléments avec des DOI : { $count }
replication-checker-results-found =
    { $count ->
        [one] 1 élément a des réplications, stocké dans "{ $folderName }".
       *[other] { $count } éléments ont des réplications, stockés dans "{ $folderName }".
    }
replication-checker-results-none = Aucune réplication trouvée.
replication-checker-results-reproductions-found =
    { $count ->
        [one] 1 élément a des reproductions, stocké dans "{ $folderName }".
       *[other] { $count } éléments ont des reproductions, stockés dans "{ $folderName }".
    }
replication-checker-results-reproductions-none = Aucune reproduction trouvée.
replication-checker-results-footer = Consultez les notes pour plus de détails ou sélectionnez des éléments à revérifier.

## Tags
replication-checker-tag = A été répliqué
replication-checker-tag-is-replication = Est une réplication
replication-checker-tag-added-by-checker = Ajouté par Replication Checker
replication-checker-tag-success = Réplication : Réussie
replication-checker-tag-failure = Réplication : Échouée
replication-checker-tag-mixed = Réplication : Mitigée
replication-checker-tag-multiple-originals = Réplication : Plusieurs originaux
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
replication-checker-note-footer = Généré par Zotero Replication Checker en utilisant la base de données de littérature FORRT (FLoRA)

## Replication Item Details
replication-checker-li-no-title = Aucun titre disponible
replication-checker-li-no-authors = Aucun auteur disponible
replication-checker-li-no-journal = Aucune revue
replication-checker-li-na = N/D
replication-checker-li-doi-label = DOI :
replication-checker-li-outcome = Résultat rapporté par l'auteur :
replication-checker-li-link = Cette étude a un rapport lié :

## First Run Prompt
replication-checker-prompt-title = Bienvenue dans Zotero Replication Checker !
replication-checker-prompt-first-run =
    Merci d'avoir installé Zotero Replication Checker !

    Ce plugin vous aide à découvrir des études de réplication en vérifiant automatiquement vos éléments de bibliothèque avec la base de données de littérature FORRT (FLoRA).

    Souhaitez-vous analyser votre bibliothèque pour les réplications maintenant ?

    • Cliquez sur "OK" pour commencer l'analyse (cela peut prendre quelques minutes)
    • Cliquez sur "Annuler" pour ignorer - vous pouvez toujours analyser plus tard depuis le menu Outils

## Onboarding
onboarding-welcome-title = Bienvenue dans Replication Checker !
onboarding-welcome-content =
    Merci d'avoir installé Zotero Replication Checker !

    Ce plugin vous aide à découvrir des études de réplication et de reproduction en vérifiant automatiquement vos éléments de bibliothèque avec la base de données de littérature FORRT (FLoRA).

    ✨ Fonctionnalités clés :
    • Vérifie toute la bibliothèque, les collections ou les éléments individuels
    • Détecte les réplications et les reproductions computationnelles
    • Gère les articles ayant plusieurs études originales
    • Ajoute des notes étiquetées avec résultats et liens DOI
    • Étiquette automatiquement les éléments (ex. « A une réplication », « Est une réplication »)
    • Propose d'ajouter l'étude originale lorsqu'une réplication est détectée
    • Prise en charge des bibliothèques de groupe en lecture seule — copie les éléments dans la bibliothèque personnelle
    • Toutes les collections dans une seule collection « FLoRA », aux noms configurables
    • Exclut les réplications indésirables des vérifications futures

    Faisons un tour rapide pour commencer !

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

    🚫 Exclure des réplications :
    Clic droit sur les éléments de réplication → Exclure la réplication
    • Empêche les réplications indésirables d'être rajoutées

    🗂️ Où tout est rangé :
    Tout ce que crée le module se trouve dans une seule collection « FLoRA »
    • FLoRA Replications, FLoRA Reproductions
    • FLoRA Originals linked to Replications / Reproductions

    ⚙️ Préférences :
    Édition → Paramètres → Replication Checker
    • Fréquence de vérification automatique
    • Vérification automatique des nouveaux éléments
    • Noms des collections, y compris le conteneur « FLoRA »
    • Statistiques FLoRA par bibliothèque, avec un lien vers le Replication Atlas

onboarding-stats-title = Vos statistiques FLoRA
onboarding-stats-content =
    📍 Emplacement : Édition → Paramètres → Replication Checker

    📊 Chiffres en direct sur ce que FLoRA sait de votre bibliothèque :
    • Articles ayant des réplications / reproductions
    • Articles qui sont eux-mêmes des réplications ou des reproductions
    • Comptés par DOI unique : le même article enregistré deux fois ne compte qu'une fois

    📚 Bibliothèques de groupe :
    Si vous en avez, un sélecteur de bibliothèque apparaît au-dessus du tableau — les statistiques portent sur la bibliothèque choisie, et pas seulement sur la vôtre.

    🌍 Ouvrir dans FLoRA Atlas :
    Ouvre le Replication Atlas prérempli avec les DOI suivis de la bibliothèque sélectionnée, pour situer vos lectures dans l'ensemble de la littérature sur la réplication.

    💡 Les éléments sans DOI exploitable ne peuvent pas être identifiés et sont donc exclus — une note sous le bouton en indique le nombre.

onboarding-scan-title = Prêt à analyser votre bibliothèque ?
onboarding-scan-content =
    Souhaitez-vous analyser votre bibliothèque pour les réplications maintenant ?

    • Cliquez sur "Oui" pour commencer l'analyse
      (cela peut prendre quelques minutes)

    • Cliquez sur "Non" pour ignorer - vous pouvez toujours analyser plus tard depuis le menu Outils

    💡 Accédez à ce guide à tout moment :
    Aide → Guide d'utilisation de Replication Checker

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = Exclure la reproduction

## Reproduction Feature - Tags
reproduction-checker-tag = A été reproduit
reproduction-checker-tag-is-reproduction = Est une reproduction
reproduction-checker-tag-added-by-checker = Ajouté par Replication Checker
reproduction-checker-tag-readonly-origin = Original présent dans une bibliothèque en lecture seule

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = Reproduction : Succès informatique, Robuste
reproduction-checker-tag-outcome-cs-challenges = Reproduction : Succès informatique, Défis de robustesse
reproduction-checker-tag-outcome-cs-not-checked = Reproduction : Succès informatique, Robustesse non vérifiée
reproduction-checker-tag-outcome-ci-robust = Reproduction : Problèmes informatiques, Robuste
reproduction-checker-tag-outcome-ci-challenges = Reproduction : Problèmes informatiques, Défis de robustesse
reproduction-checker-tag-outcome-ci-not-checked = Reproduction : Problèmes informatiques, Robustesse non vérifiée
reproduction-checker-tag-multiple-originals = Reproduction : Plusieurs originaux

## Reproduction Feature - Note Template
reproduction-checker-note-title = Reproductions trouvées
reproduction-checker-note-warning = Cette note est générée automatiquement. Si vous la modifiez, une nouvelle note sera créée lors de la prochaine vérification et cette version sera conservée telle quelle.
reproduction-checker-note-intro = Cette étude a été reproduite :
reproduction-checker-note-feedback = Avez-vous trouvé ce résultat utile ? Donnez votre avis <a href="{ $url }" target="_blank">ici</a> !
reproduction-checker-note-data-issues = Avez-vous trouvé des problèmes dans les données ? Veuillez les signaler <a href="{ $url }" target="_blank">ici</a> !
reproduction-checker-note-footer = Généré par Zotero Replication Checker en utilisant la base de données de littérature FORRT (FLoRA)

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
reproduction-checker-ban-title = Exclure les reproductions
reproduction-checker-ban-confirm =
    { $count ->
        [one] Êtes-vous sûr de vouloir exclure 1 reproduction ?
       *[other] Êtes-vous sûr de vouloir exclure { $count } reproductions ?
    }

    Ces éléments seront déplacés vers la corbeille et ne seront pas rajoutés lors des vérifications futures.
reproduction-checker-ban-success =
    { $count ->
        [one] 1 reproduction exclue avec succès.
       *[other] { $count } reproductions exclues avec succès.
    }

## Reproduction Feature - Dialog
replication-checker-dialog-title-studies = Études associées trouvées
replication-checker-dialog-intro-studies =
    Études trouvées pour :
    « { $title } »
replication-checker-dialog-question-studies = Souhaitez-vous ajouter ces informations à votre bibliothèque ?
reproduction-checker-dialog-title = Études de reproduction trouvées
reproduction-checker-dialog-intro =
    Études de reproduction trouvées pour :
    "{ $title }"
reproduction-checker-dialog-count =
    { $count ->
        [one] 1 reproduction trouvée :
       *[other] { $count } reproductions trouvées :
    }
reproduction-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       Résultat : { $outcome }
reproduction-checker-dialog-more =
    { $count ->
        [one] ...et 1 reproduction supplémentaire
       *[other] ...et { $count } reproductions supplémentaires
    }
reproduction-checker-dialog-question = Souhaitez-vous ajouter des informations de reproduction ?
reproduction-checker-dialog-progress-title = Informations de reproduction ajoutées
reproduction-checker-dialog-progress-line = Informations de reproduction ajoutées à "{ $title }"

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found =
    { $count ->
        [one] 1 élément avec des reproductions trouvé
       *[other] { $count } éléments avec des reproductions trouvés
    }

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
pref-folder-title = Nom du dossier de réplication
pref-folder-description = Nom de la collection Zotero dans laquelle sont stockés les éléments de réplication
pref-folder-hint = La modification renommera automatiquement la collection existante. Tous les éléments resteront dans la même collection.
pref-repro-folder-title = Nom du dossier de reproduction
pref-repro-folder-description = Nom de la collection Zotero dans laquelle sont stockés les éléments de reproduction
pref-repro-folder-hint = La modification renommera automatiquement la collection existante. Tous les éléments resteront dans la même collection.
pref-originals-replication-folder-title = Dossier des originaux (liés aux réplications)
pref-originals-replication-folder-description = Nom de la collection Zotero dans laquelle sont stockés les articles originaux (dont les réplications ont été ajoutées)
pref-originals-replication-folder-hint = La modification renommera automatiquement la collection existante. Tous les éléments resteront dans la même collection.
pref-originals-reproduction-folder-title = Dossier des originaux (liés aux reproductions)
pref-originals-reproduction-folder-description = Nom de la collection Zotero dans laquelle sont stockés les articles originaux (dont les reproductions ont été ajoutées)
pref-originals-reproduction-folder-hint = La modification renommera automatiquement la collection existante. Tous les éléments resteront dans la même collection.

## Stats Pane
pref-stats-title = Vos statistiques FLoRA
pref-stats-description = Statistiques basées sur votre bibliothèque Zotero actuelle
pref-stats-has-replication = Articles avec réplications
pref-stats-has-reproduction = Articles avec reproductions
pref-stats-is-replication = Articles identifiés comme réplications
pref-stats-originals = Articles originaux suivis
pref-stats-refresh = Actualiser les statistiques
pref-stats-no-originals = Aucun article original suivi trouvé dans votre bibliothèque. Effectuez d'abord une vérification des réplications.
pref-stats-open-atlas = Ouvrir dans FLoRA Atlas ↗
pref-stats-view-flora = Voir la base de données FLoRA →

pref-blacklist-title = Réplications exclues
pref-blacklist-description = Gérer les réplications que vous avez exclues de votre bibliothèque
pref-blacklist-col-replication = Article de réplication
pref-blacklist-col-original = Article original
pref-blacklist-col-type = Type
pref-blacklist-col-banned = Exclu le
pref-blacklist-empty = Aucune réplication exclue
pref-blacklist-remove = Supprimer la sélection
pref-blacklist-clear = Effacer toutes les réplications exclues
pref-blacklist-hint = Les réplications exclues ne seront pas rajoutées lors des vérifications futures. Vous pouvez exclure des réplications depuis le menu contextuel.
