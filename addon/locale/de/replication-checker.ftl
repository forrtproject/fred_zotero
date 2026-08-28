# Zotero Replication Checker Locale File - German
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = Aktuelle Bibliothek auf Replikationen prüfen
replication-checker-context-menu = Auf Replikationen prüfen
replication-checker-context-menu-ban = Replikation sperren
replication-checker-context-menu-add-original = Original hinzufügen
replication-checker-context-menu-add-originals = Originale hinzufügen

## Progress Messages
replication-checker-progress-checking-library = Prüfung auf Replikationen läuft
replication-checker-progress-checking-collection = Prüfung auf Replikationen in Sammlung
replication-checker-progress-scanning-library = Bibliothek wird durchsucht...
replication-checker-progress-scanning-collection = Sammlung wird durchsucht...
replication-checker-progress-found-dois = { $itemCount } Einträge mit DOIs gefunden ({ $uniqueCount } einzigartig)
replication-checker-progress-checking-database = Abfrage der Replikationsdatenbank...
replication-checker-progress-no-dois = Keine Einträge mit DOIs in der Sammlung gefunden
replication-checker-progress-complete = Prüfung abgeschlossen
replication-checker-progress-failed = Prüfung fehlgeschlagen
replication-checker-progress-match-count =
    { $count ->
        [one] 1 Eintrag mit Replikationen gefunden
       *[other] { $count } Einträge mit Replikationen gefunden
    }
replication-checker-progress-copying-readonly = Kopiere Einträge aus schreibgeschützter Bibliothek in persönliche Bibliothek...

## Alerts
replication-checker-alert-title = Zotero Replication Checker
replication-checker-alert-no-dois-selected = Keine DOIs in den ausgewählten Einträgen gefunden.
replication-checker-alert-no-collection = Bitte wählen Sie eine Sammlung aus, bevor Sie diese Prüfung ausführen.
replication-checker-alert-no-originals-available = Keine Originalstudien für diese Replikation verfügbar.
replication-checker-alert-no-doi = Ausgewählter Eintrag hat keine DOI.
replication-checker-add-original-success = "{ $title }" erfolgreich zu "{ $folderName }" hinzugefügt.
replication-checker-add-original-exists = "{ $title }" ist bereits in Ihrer Bibliothek — Tags, Notizen und Beziehungen wurden in "{ $folderName }" aktualisiert.
replication-checker-add-original-add-all-btn = Alle Originale hinzufügen
replication-checker-add-original-confirm =
    { $count ->
        [one] 1 Originalstudie für diese Replikation gefunden. Bitte wählen Sie aus, welche Originale Sie zu Ihrer Bibliothek hinzufügen möchten.
       *[other] { $count } Originalstudien für diese Replikation gefunden. Bitte wählen Sie aus, welche Originale Sie zu Ihrer Bibliothek hinzufügen möchten.
    }
replication-checker-add-original-select-btn = Originale zur Hinzufügung auswählen
replication-checker-add-original-batch-success =
    { $newCount ->
        [one] 1 neue und { $existingCount } vorhandene Originalstudien in "{ $folderName }" aktualisiert.
       *[other] { $newCount } neue und { $existingCount } vorhandene Originalstudien in "{ $folderName }" aktualisiert.
    }
replication-checker-add-original-batch-new-only =
    { $count ->
        [one] 1 Originalstudie erfolgreich zu "{ $folderName }" hinzugefügt.
       *[other] { $count } Originalstudien erfolgreich zu "{ $folderName }" hinzugefügt.
    }
replication-checker-add-original-batch-exists-only =
    { $count ->
        [one] 1 Originalstudie bereits in Ihrer Bibliothek — Tags, Notizen und Beziehungen in "{ $folderName }" aktualisiert.
       *[other] { $count } Originalstudien bereits in Ihrer Bibliothek — Tags, Notizen und Beziehungen in "{ $folderName }" aktualisiert.
    }
replication-checker-error-title = Replication Checker - Fehler
replication-checker-error-api = Daten konnten nicht von der API abgerufen werden - überprüfen Sie Ihre Internetverbindung oder versuchen Sie es später erneut.
replication-checker-error-body =
    Fehler beim Prüfen von { $target } auf Replikationen:

    { $details }

    Daten konnten nicht von der API abgerufen werden - überprüfen Sie Ihre Internetverbindung oder versuchen Sie es später erneut.
replication-checker-target-library = die aktuelle Bibliothek
replication-checker-target-selected = die ausgewählten Einträge
replication-checker-target-collection = die ausgewählte Sammlung

## Ban Feature
replication-checker-ban-title = Replikationen sperren
replication-checker-ban-confirm =
    { $count ->
        [one] Sind Sie sicher, dass Sie 1 Replikation sperren möchten?
       *[other] Sind Sie sicher, dass Sie { $count } Replikationen sperren möchten?
    }

    Diese Einträge werden in den Papierkorb verschoben und bei zukünftigen Prüfungen nicht erneut hinzugefügt.
replication-checker-ban-success =
    { $count ->
        [one] 1 Replikation erfolgreich gesperrt.
       *[other] { $count } Replikationen erfolgreich gesperrt.
    }
replication-checker-alert-no-replications-selected = Keine Replikationseinträge ausgewählt.

## Dialog
replication-checker-dialog-title = Replikationsstudien gefunden
replication-checker-dialog-intro =
    Replikationsstudien gefunden für:
    "{ $title }"
replication-checker-dialog-count =
    { $count ->
        [one] 1 Replikation gefunden:
       *[other] { $count } Replikationen gefunden:
    }
replication-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       Ergebnis: { $outcome }
replication-checker-dialog-more =
    { $count ->
        [one] ...und 1 weitere Replikation
       *[other] ...und { $count } weitere Replikationen
    }
replication-checker-dialog-question = Möchten Sie Replikationsinformationen hinzufügen?
replication-checker-dialog-progress-title = Replikationsinformationen hinzugefügt
replication-checker-dialog-progress-line = Replikationsinformationen zu "{ $title }" hinzugefügt
replication-checker-notif-replication-new =
    { $count ->
        [one] 1 neue Replikation erfolgreich zu "{ $folderName }" hinzugefügt.
       *[other] { $count } neue Replikationen erfolgreich zu "{ $folderName }" hinzugefügt.
    }
replication-checker-notif-replication-exists =
    { $count ->
        [one] 1 Replikation bereits in Ihrer Bibliothek — Tags, Notizen und Beziehungen in "{ $folderName }" aktualisiert.
       *[other] { $count } Replikationen bereits in Ihrer Bibliothek — Tags, Notizen und Beziehungen in "{ $folderName }" aktualisiert.
    }
replication-checker-notif-replication-mixed =
    { $newCount ->
        [one] 1 neue und { $existingCount } vorhandene Replikationen in "{ $folderName }" aktualisiert.
       *[other] { $newCount } neue und { $existingCount } vorhandene Replikationen in "{ $folderName }" aktualisiert.
    }
replication-checker-dialog-is-replication-title = Originalstudie gefunden
replication-checker-dialog-is-replication-message =
    { $count ->
        [one] Keine Replikationen gefunden, aber dies scheint eine Replikationsstudie zu sein. 1 Originalartikel gefunden. Möchten Sie ihn zu Ihrer Bibliothek hinzufügen?
       *[other] Keine Replikationen gefunden, aber dies scheint eine Replikationsstudie zu sein. { $count } Originalartikel gefunden. Bitte wählen Sie aus, welche Originale Sie zu Ihrer Bibliothek hinzufügen möchten.
    }

## Read-Only Library Handling
replication-checker-readonly-dialog-title = Schreibgeschützte Bibliothek erkannt
replication-checker-readonly-dialog-message =
    { $replicationCount ->
        [one] Diese Bibliothek ist schreibgeschützt. Wir haben { $itemCount } Eintrag/Einträge mit 1 Replikation gefunden.
       *[other] Diese Bibliothek ist schreibgeschützt. Wir haben { $itemCount } Eintrag/Einträge mit { $replicationCount } Replikationen gefunden.
    }

    Möchten Sie die Originalartikel und ihre Replikationen in den "Replikationsordner" Ihrer persönlichen Bibliothek kopieren?

## Results Messages
replication-checker-results-title-library = Bibliotheksscan abgeschlossen
replication-checker-results-title-selected = Scan ausgewählter Einträge abgeschlossen
replication-checker-results-title-collection = Sammlungsscan abgeschlossen
replication-checker-results-total = Geprüfte Einträge insgesamt: { $count }
replication-checker-results-dois = Einträge mit DOIs: { $count }
replication-checker-results-found =
    { $count ->
        [one] 1 Eintrag hat Replikationen, gespeichert in "{ $folderName }".
       *[other] { $count } Einträge haben Replikationen, gespeichert in "{ $folderName }".
    }
replication-checker-results-none = Keine Replikationen gefunden.
replication-checker-results-reproductions-found =
    { $count ->
        [one] 1 Eintrag hat Reproduktionen, gespeichert in "{ $folderName }".
       *[other] { $count } Einträge haben Reproduktionen, gespeichert in "{ $folderName }".
    }
replication-checker-results-reproductions-none = Keine Reproduktionen gefunden.
replication-checker-results-footer = Notizen für Details ansehen oder Einträge erneut prüfen.

## Tags
replication-checker-tag = Wurde repliziert
replication-checker-tag-is-replication = Ist Replikation
replication-checker-tag-added-by-checker = Hinzugefügt von Replication Checker
replication-checker-tag-success = Replikation: Erfolgreich
replication-checker-tag-failure = Replikation: Fehlgeschlagen
replication-checker-tag-mixed = Replikation: Gemischt
replication-checker-tag-multiple-originals = Replikation: Mehrere Originale
replication-checker-tag-readonly-origin = Original in schreibgeschützter Bibliothek vorhanden
replication-checker-tag-has-been-replicated = Wurde repliziert
replication-checker-tag-has-been-reproduced = Wurde reproduziert
replication-checker-tag-in-flora = In FLoRA

## Note Template
replication-checker-note-title = Replikationen gefunden
replication-checker-note-warning = Diese Notiz wird automatisch generiert. Wenn Sie sie bearbeiten, wird bei der nächsten Prüfung eine neue Notiz erstellt und diese Version bleibt unverändert erhalten.
replication-checker-note-intro = Diese Studie wurde repliziert:
replication-checker-note-feedback = War dieses Ergebnis hilfreich? Geben Sie <a href="{ $url }" target="_blank">hier</a> Feedback!
replication-checker-note-data-issues = Haben Sie Probleme mit den Daten gefunden? Bitte melden Sie diese <a href="{ $url }" target="_blank">hier</a>!
replication-checker-note-footer = Erstellt von Zotero Replication Checker unter Verwendung der FORRT Literaturdatenbank (FLoRA)

## Replication Item Details
replication-checker-li-no-title = Kein Titel verfügbar
replication-checker-li-no-authors = Keine Autoren verfügbar
replication-checker-li-no-journal = Keine Zeitschrift
replication-checker-li-na = k. A.
replication-checker-li-doi-label = DOI:
replication-checker-li-outcome = Von Autoren berichtetes Ergebnis:
replication-checker-li-link = Diese Studie hat einen verknüpften Bericht:

## First Run Prompt
replication-checker-prompt-title = Willkommen beim Zotero Replication Checker!
replication-checker-prompt-first-run =
    Vielen Dank für die Installation des Zotero Replication Checkers!

    Dieses Plugin hilft Ihnen, Replikationsstudien für Ihre Forschung zu entdecken, indem es Ihre Bibliothekseinträge mit der FORRT Literaturdatenbank (FLoRA) abgleicht.

    Möchten Sie Ihre Bibliothek jetzt auf Replikationen scannen?

    • Klicken Sie "OK", um den Scan zu starten (dies kann einige Minuten dauern)
    • Klicken Sie "Abbrechen", um zu überspringen - Sie können später jederzeit über das Menü scannen

## Onboarding
onboarding-welcome-title = Willkommen beim Replication Checker!
onboarding-welcome-content =
    Vielen Dank für die Installation des Zotero Replication Checkers!

    Dieses Plugin hilft Ihnen, Replikations- und Reproduktionsstudien zu entdecken, indem es Ihre Bibliothekseinträge automatisch mit der FORRT Literaturdatenbank (FLoRA) abgleicht.

    ✨ Hauptfunktionen:
    • Prüft die gesamte Bibliothek, Sammlungen oder einzelne Einträge
    • Erkennt sowohl Replikationen als auch computergestützte Reproduktionen
    • Verarbeitet Artikel mit mehreren Originalstudien
    • Fügt ergebnisgetaggte Notizen mit DOI-Links hinzu
    • Markiert Einträge automatisch (z. B. „Hat Replikation", „Ist Replikation")
    • Bietet an, die Originalstudie hinzuzufügen, wenn eine Replikation erkannt wird
    • Unterstützt schreibgeschützte Gruppenbiblotheken — kopiert Einträge in die Persönliche Bibliothek
    • Alle Sammlungen in einer einzigen Sammlung „FLoRA“, mit konfigurierbaren Namen
    • Sperrt unerwünschte Replikationen für zukünftige Prüfungen
    • Auto-Prüfung: scannt neue Einträge automatisch oder nach Zeitplan
    • Datenschutzkonform: Ihre DOIs werden nie an den Server übertragen
    • In mehreren Sprachen verfügbar

    Lassen Sie uns eine kurze Tour machen!

onboarding-tools-title = Gesamte Bibliothek prüfen
onboarding-tools-content =
    📍 Ort: Werkzeuge → Aktuelle Bibliothek auf Replikationen prüfen

    🔍 Was es macht:
    • Durchsucht alle Einträge mit DOIs
    • Fragt die FLoRA-Datenbank ab
    • Erstellt Notizen mit Details
    • Markiert Einträge nach Ergebnis

    💡 Tipp: Kann je nach Bibliotheksgröße einige Minuten dauern.

onboarding-context-title = Sammlungen und Einträge prüfen
onboarding-context-content =
    📚 Für Sammlungen:
    Rechtsklick auf Sammlung → Auf Replikationen prüfen

    📄 Für einzelne Einträge:
    Rechtsklick auf Einträge → Auf Replikationen prüfen

    🚫 Replikationen sperren:
    Rechtsklick auf Replikationseinträge → Replikation sperren
    • Verhindert, dass unerwünschte Replikationen erneut hinzugefügt werden

    🗂️ Wo alles landet:
    Alles, was das Plugin anlegt, liegt in einer einzigen Sammlung „FLoRA“
    • FLoRA Replications, FLoRA Reproductions
    • FLoRA Originals linked to Replications / Reproductions

    ⚙️ Einstellungen:
    Bearbeiten → Einstellungen → Replication Checker
    • Automatische Prüfhäufigkeit
    • Neue Einträge automatisch prüfen
    • Sammlungsnamen, einschließlich des Containers „FLoRA“
    • FLoRA-Statistiken pro Bibliothek, mit Link zum Replication Atlas

onboarding-stats-title = Ihre FLoRA-Statistiken
onboarding-stats-content =
    📍 Ort: Bearbeiten → Einstellungen → Replication Checker

    📊 Aktuelle Zahlen dazu, was FLoRA über Ihre Bibliothek weiß:
    • Artikel mit Replikationen / Reproduktionen
    • Artikel, die selbst Replikationen oder Reproduktionen sind
    • Gezählt nach eindeutiger DOI — dasselbe Paper zweimal gespeichert zählt einmal

    📚 Gruppenbibliotheken:
    Wenn Sie welchen angehören, erscheint über der Tabelle eine Bibliotheksauswahl — die Statistiken gelten für die dort gewählte Bibliothek, nicht nur für Ihre persönliche.

    🌍 In FLoRA Atlas öffnen:
    Öffnet den Replication Atlas, vorbefüllt mit den erfassten DOIs der gewählten Bibliothek, um Ihre Lektüre im Kontext der Replikationsliteratur zu sehen.

    💡 Einträge ohne verwertbare DOI lassen sich nicht identifizieren und bleiben daher unberücksichtigt — ein Hinweis unter der Schaltfläche nennt die Anzahl.

onboarding-scan-title = Bereit, Ihre Bibliothek zu scannen?
onboarding-scan-content =
    Möchten Sie Ihre Bibliothek jetzt auf Replikationen scannen?

    • Klicken Sie "Ja", um den Scan zu starten
      (dies kann einige Minuten dauern)

    • Klicken Sie "Nein", um zu überspringen - Sie können später jederzeit über das Menü Werkzeuge scannen

    💡 Zugriff auf diese Anleitung jederzeit:
    Hilfe → Replication Checker Benutzerhandbuch

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = Reproduktion sperren

## Reproduction Feature - Tags
reproduction-checker-tag = Wurde reproduziert
reproduction-checker-tag-is-reproduction = Ist Reproduktion
reproduction-checker-tag-added-by-checker = Hinzugefügt von Replication Checker
reproduction-checker-tag-readonly-origin = Original in schreibgeschützter Bibliothek vorhanden

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = Reproduktion: Rechnerisch erfolgreich, Robust
reproduction-checker-tag-outcome-cs-challenges = Reproduktion: Rechnerisch erfolgreich, Robustheitsprobleme
reproduction-checker-tag-outcome-cs-not-checked = Reproduktion: Rechnerisch erfolgreich, Robustheit nicht geprüft
reproduction-checker-tag-outcome-ci-robust = Reproduktion: Rechnerische Probleme, Robust
reproduction-checker-tag-outcome-ci-challenges = Reproduktion: Rechnerische Probleme, Robustheitsprobleme
reproduction-checker-tag-outcome-ci-not-checked = Reproduktion: Rechnerische Probleme, Robustheit nicht geprüft
reproduction-checker-tag-multiple-originals = Reproduktion: Mehrere Originale

## Reproduction Feature - Note Template
reproduction-checker-note-title = Reproduktionen gefunden
reproduction-checker-note-warning = Diese Notiz wird automatisch generiert. Wenn Sie sie bearbeiten, wird bei der nächsten Prüfung eine neue Notiz erstellt und diese Version bleibt unverändert erhalten.
reproduction-checker-note-intro = Diese Studie wurde reproduziert:
reproduction-checker-note-feedback = War dieses Ergebnis hilfreich? Geben Sie <a href="{ $url }" target="_blank">hier</a> Feedback!
reproduction-checker-note-data-issues = Haben Sie Probleme mit den Daten gefunden? Bitte melden Sie diese <a href="{ $url }" target="_blank">hier</a>!
reproduction-checker-note-footer = Erstellt von Zotero Replication Checker unter Verwendung der FORRT Literaturdatenbank (FLoRA)

## Reproduction Feature - Item Details
reproduction-checker-li-no-title = Kein Titel verfügbar
reproduction-checker-li-no-authors = Keine Autoren verfügbar
reproduction-checker-li-no-journal = Keine Zeitschrift
reproduction-checker-li-na = k. A.
reproduction-checker-li-doi-label = DOI:
reproduction-checker-li-outcome = Reproduktionsergebnis:
reproduction-checker-li-link = Diese Studie hat einen verknüpften Bericht:

## Reproduction Feature - Alerts
reproduction-checker-alert-no-reproductions-selected = Keine Reproduktionseinträge ausgewählt.
reproduction-checker-ban-title = Reproduktionen sperren
reproduction-checker-ban-confirm =
    { $count ->
        [one] Sind Sie sicher, dass Sie 1 Reproduktion sperren möchten?
       *[other] Sind Sie sicher, dass Sie { $count } Reproduktionen sperren möchten?
    }

    Diese Einträge werden in den Papierkorb verschoben und bei zukünftigen Prüfungen nicht erneut hinzugefügt.
reproduction-checker-ban-success =
    { $count ->
        [one] 1 Reproduktion erfolgreich gesperrt.
       *[other] { $count } Reproduktionen erfolgreich gesperrt.
    }

## Reproduction Feature - Dialog
replication-checker-dialog-title-studies = Zugehörige Studien gefunden
replication-checker-dialog-intro-studies =
    Studien gefunden für:
    „{ $title }“
replication-checker-dialog-question-studies = Möchten Sie diese Informationen zu Ihrer Bibliothek hinzufügen?
reproduction-checker-dialog-title = Reproduktionsstudien gefunden
reproduction-checker-dialog-intro =
    Reproduktionsstudien gefunden für:
    "{ $title }"
reproduction-checker-dialog-count =
    { $count ->
        [one] 1 Reproduktion gefunden:
       *[other] { $count } Reproduktionen gefunden:
    }
reproduction-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       Ergebnis: { $outcome }
reproduction-checker-dialog-more =
    { $count ->
        [one] ...und 1 weitere Reproduktion
       *[other] ...und { $count } weitere Reproduktionen
    }
reproduction-checker-dialog-question = Möchten Sie Reproduktionsinformationen hinzufügen?
reproduction-checker-dialog-progress-title = Reproduktionsinformationen hinzugefügt
reproduction-checker-dialog-progress-line = Reproduktionsinformationen zu "{ $title }" hinzugefügt

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found =
    { $count ->
        [one] 1 Eintrag mit Reproduktionen gefunden
       *[other] { $count } Einträge mit Reproduktionen gefunden
    }

## Preference Pane
pref-autocheck-title = Automatische Bibliotheksprüfung auf Replikationen
pref-autocheck-description = Ihre Bibliothek wird automatisch in regelmäßigen Abständen auf Replikationsstudien geprüft
pref-autocheck-disabled = Deaktiviert (nur manuelle Prüfung)
pref-autocheck-daily = Täglich (alle 24 Stunden prüfen)
pref-autocheck-weekly = Wöchentlich (alle 7 Tage prüfen)
pref-autocheck-monthly = Monatlich (alle 30 Tage prüfen)
pref-autocheck-new-items = Neu hinzugefügte Bibliothekseinträge automatisch prüfen (empfohlen)
pref-autocheck-new-items-hint = Deaktivieren Sie diese Option, wenn Sie alle Replikationsprüfungen manuell durchführen möchten.
pref-autocheck-note = Die automatische Prüfung läuft im Hintergrund, wenn Zotero geöffnet ist. Sie können weiterhin manuell über das Menü Werkzeuge prüfen.
pref-folder-title = Name des Replikationsordners
pref-folder-description = Name der Zotero-Sammlung, in der Replikationseinträge gespeichert werden
pref-folder-hint = Eine Änderung benennt die vorhandene Sammlung automatisch um. Alle Einträge verbleiben in derselben Sammlung.
pref-repro-folder-title = Name des Reproduktionsordners
pref-repro-folder-description = Name der Zotero-Sammlung, in der Reproduktionseinträge gespeichert werden
pref-repro-folder-hint = Eine Änderung benennt die vorhandene Sammlung automatisch um. Alle Einträge verbleiben in derselben Sammlung.
pref-originals-replication-folder-title = Originalordner (verknüpft mit Replikationen)
pref-originals-replication-folder-description = Name der Zotero-Sammlung, in der Originalartikel (deren Replikationen hinzugefügt wurden) gespeichert werden
pref-originals-replication-folder-hint = Eine Änderung benennt die vorhandene Sammlung automatisch um. Alle Einträge verbleiben in derselben Sammlung.
pref-originals-reproduction-folder-title = Originalordner (verknüpft mit Reproduktionen)
pref-originals-reproduction-folder-description = Name der Zotero-Sammlung, in der Originalartikel (deren Reproduktionen hinzugefügt wurden) gespeichert werden
pref-originals-reproduction-folder-hint = Eine Änderung benennt die vorhandene Sammlung automatisch um. Alle Einträge verbleiben in derselben Sammlung.

## Stats Pane
pref-stats-title = Ihre FLoRA-Statistiken
pref-stats-description = Statistiken basierend auf Ihrer aktuellen Zotero-Bibliothek
pref-stats-has-replication = Artikel mit Replikationen
pref-stats-has-reproduction = Artikel mit Reproduktionen
pref-stats-is-replication = Als Replikationen identifizierte Artikel
pref-stats-originals = Verfolgte Originalartikel
pref-stats-refresh = Statistiken aktualisieren
pref-stats-no-originals = Keine verfolgten Originalartikel in Ihrer Bibliothek gefunden. Führen Sie zuerst eine Replikationsprüfung durch.
pref-stats-open-atlas = In FLoRA Atlas öffnen ↗
pref-stats-view-flora = FLoRA-Datenbank anzeigen →

pref-blacklist-title = Gesperrte Replikationen
pref-blacklist-description = Verwalten Sie Replikationen, die Sie aus Ihrer Bibliothek ausgeschlossen haben.
pref-blacklist-col-replication = Replikationsartikel
pref-blacklist-col-original = Originalartikel
pref-blacklist-col-type = Typ
pref-blacklist-col-banned = Gesperrt am
pref-blacklist-empty = Keine gesperrten Replikationen
pref-blacklist-remove = Auswahl entfernen
pref-blacklist-clear = Alle gesperrten Replikationen löschen
pref-blacklist-hint = Gesperrte Replikationen werden bei zukünftigen Prüfungen nicht erneut hinzugefügt. Sie können Replikationen über das Kontextmenü sperren.
