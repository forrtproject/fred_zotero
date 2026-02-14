# Zotero Replication Checker Locale File - German
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = Aktuelle Bibliothek auf Replikationen prüfen
replication-checker-context-menu = Auf Replikationen prüfen
replication-checker-context-menu-ban = Replikation sperren
replication-checker-context-menu-add-original = Original hinzufügen

## Progress Messages
replication-checker-progress-checking-library = Prüfung auf Replikationen
replication-checker-progress-checking-collection = Prüfung auf Replikationen in Sammlung
replication-checker-progress-scanning-library = Bibliothek wird durchsucht...
replication-checker-progress-scanning-collection = Sammlung wird durchsucht...
replication-checker-progress-found-dois = { $itemCount } Einträge mit DOIs gefunden ({ $uniqueCount } eindeutig)
replication-checker-progress-checking-database = Abfrage der Replikationsdatenbank...
replication-checker-progress-no-dois = Keine Einträge mit DOIs in der Sammlung gefunden
replication-checker-progress-complete = Prüfung abgeschlossen
replication-checker-progress-failed = Prüfung fehlgeschlagen
replication-checker-progress-match-count = { $count } Eintrag/Einträge mit Replikationen gefunden
replication-checker-progress-copying-readonly = Einträge aus schreibgeschützter Bibliothek in persönliche Bibliothek kopieren...

## Alerts
replication-checker-alert-title = Zotero Replikationsprüfer
replication-checker-alert-no-dois-selected = Keine DOIs in ausgewählten Einträgen gefunden.
replication-checker-alert-no-collection = Bitte wählen Sie eine Sammlung aus, bevor Sie diese Prüfung ausführen.
replication-checker-alert-no-originals-available = Keine Originalstudien für diese Replikation verfügbar.
replication-checker-alert-no-doi = Ausgewählter Eintrag hat keine DOI.
replication-checker-add-original-success = Originalstudie erfolgreich hinzugefügt: { $title }
replication-checker-add-original-confirm = { $count } Originalstudie(n) für diese Replikation gefunden. Möchten Sie alle zu Ihrer Bibliothek hinzufügen?
replication-checker-add-original-batch-success = { $count } Originalstudie(n) erfolgreich zu Ihrer Bibliothek hinzugefügt.

## Ban Feature
replication-checker-ban-title = Replikationen sperren
replication-checker-ban-confirm =
    Sind Sie sicher, dass Sie { $count } Replikation(en) sperren möchten?

    Diese Einträge werden in den Papierkorb verschoben und bei zukünftigen Prüfungen nicht erneut hinzugefügt.
replication-checker-ban-success = { $count } Replikation(en) erfolgreich gesperrt.
replication-checker-alert-no-replications-selected = Keine Replikationseinträge ausgewählt.
replication-checker-error-title = Replikationsprüfer - Fehler
replication-checker-error-api = Daten konnten nicht von der API abgerufen werden - überprüfen Sie Ihre Internetverbindung oder versuchen Sie es später erneut.
replication-checker-error-body =
    Fehler beim Prüfen von { $target } auf Replikationen:

    { $details }

    Daten konnten nicht von der API abgerufen werden - überprüfen Sie Ihre Internetverbindung oder versuchen Sie es später erneut.
replication-checker-target-library = die aktuelle Bibliothek
replication-checker-target-selected = die ausgewählten Einträge
replication-checker-target-collection = die ausgewählte Sammlung

## Dialog
replication-checker-dialog-title = Replikationsstudien gefunden
replication-checker-dialog-intro = Replikationsstudien gefunden für:\n"{ $title }"
replication-checker-dialog-count = { $count } Replikation(en) gefunden:
replication-checker-dialog-item = { $index }. { $title }\n({ $year })\n   Ergebnis: { $outcome }
replication-checker-dialog-more = ...und { $count } weitere Replikation(en)
replication-checker-dialog-question = Möchten Sie Replikationsinformationen hinzufügen?
replication-checker-dialog-progress-title = Replikationsinformationen hinzugefügt
replication-checker-dialog-progress-line = Replikationsinformationen zu "{ $title }" hinzugefügt
replication-checker-dialog-is-replication-title = Originalstudie gefunden
replication-checker-dialog-is-replication-message = Keine Replikationen gefunden, aber dies scheint eine Replikationsstudie zu sein.\n\nMöchten Sie die Originalartikel hinzufügen?

## Read-Only Library Handling
replication-checker-readonly-dialog-title = Schreibgeschützte Bibliothek erkannt
replication-checker-readonly-dialog-message =
    Diese Bibliothek ist schreibgeschützt. Wir haben { $itemCount } Eintrag/Einträge mit { $replicationCount } Replikation(en) gefunden.

    Möchten Sie die Originalartikel und ihre Replikationen in den "Replikationsordner" Ihrer persönlichen Bibliothek kopieren?

## Results Messages
replication-checker-results-title-library = Bibliotheksscan abgeschlossen
replication-checker-results-title-selected = Scan ausgewählter Einträge abgeschlossen
replication-checker-results-title-collection = Sammlungsscan abgeschlossen
replication-checker-results-total = Geprüfte Einträge insgesamt: { $count }
replication-checker-results-dois = Einträge mit DOIs: { $count }
replication-checker-results-found = { $count } Eintrag/Einträge haben Replikationen.
replication-checker-results-none = Keine Replikationen gefunden.
replication-checker-results-reproductions-found = { $count } Eintrag/Einträge haben Reproduktionen.
replication-checker-results-reproductions-none = Keine Reproduktionen gefunden.
replication-checker-results-footer = Notizen für Details ansehen oder Einträge erneut prüfen.

## Tags
replication-checker-tag = Hat Replikation
replication-checker-tag-is-replication = Ist Replikation
replication-checker-tag-added-by-checker = Hinzugefügt von Replikationsprüfer
replication-checker-tag-success = Replikation: Erfolgreich
replication-checker-tag-failure = Replikation: Fehlgeschlagen
replication-checker-tag-mixed = Replikation: Gemischt
replication-checker-tag-readonly-origin = Original in schreibgeschützter Bibliothek vorhanden
replication-checker-tag-has-been-replicated = Wurde repliziert
replication-checker-tag-has-been-reproduced = Wurde reproduziert
replication-checker-tag-in-flora = In FLoRA

## Note Template
replication-checker-note-title = Replikationen gefunden
replication-checker-note-warning = Dies ist eine automatisch generierte Notiz. Bitte keine Änderungen vornehmen!
replication-checker-note-intro = Diese Studie wurde repliziert:
replication-checker-note-feedback = War dieses Ergebnis hilfreich? Feedback geben <a href="{ $url }" target="_blank">hier</a>!
replication-checker-note-data-issues = Haben Sie Probleme mit den Daten gefunden? Bitte melden Sie diese <a href="{ $url }" target="_blank">hier</a>!
replication-checker-note-footer = Erstellt von Zotero Replikationsprüfer unter Verwendung der FORRT Literaturdatenbank (FLoRA)

## Replication Item Details
replication-checker-li-no-title = Kein Titel verfügbar
replication-checker-li-no-authors = Keine Autoren verfügbar
replication-checker-li-no-journal = Keine Zeitschrift
replication-checker-li-na = k. A.
replication-checker-li-doi-label = DOI:
replication-checker-li-outcome = Von Autoren berichtetes Ergebnis:
replication-checker-li-link = Diese Studie hat einen verknüpften Bericht:

## First Run Prompt
replication-checker-prompt-title = Willkommen beim Zotero Replikationsprüfer!
replication-checker-prompt-first-run =
    Vielen Dank für die Installation des Zotero Replikationsprüfers!

    Dieses Plugin hilft Ihnen, Replikationsstudien für Ihre Forschung zu entdecken, indem es Ihre Bibliothekseinträge mit der FORRT Literaturdatenbank (FLoRA) abgleicht.

    Möchten Sie Ihre Bibliothek jetzt auf Replikationen scannen?

    • Klicken Sie "OK", um den Scan zu starten (dies kann einige Minuten dauern)
    • Klicken Sie "Abbrechen", um zu überspringen - Sie können später jederzeit über das Menü scannen

## Onboarding
onboarding-welcome-title = Willkommen beim Replikationsprüfer!
onboarding-welcome-content =
    Vielen Dank für die Installation des Zotero Replikationsprüfers!

    Dieses Plugin hilft Ihnen, Replikationsstudien zu entdecken, indem es Ihre Bibliothekseinträge automatisch mit der FORRT Literaturdatenbank (FLoRA) abgleicht.

    ✨ Hauptfunktionen:
    • Automatische Prüfung von DOIs gegen die Replikationsdatenbank
    • Funktioniert mit der gesamten Bibliothek, Sammlungen oder einzelnen Einträgen
    • Erstellt verknüpfte Notizen mit Replikationsinformationen
    • Markiert Einträge mit Replikationsstatus
    • Fügt Originalstudien hinzu, wenn Replikationen vorhanden sind
    • Sperrt unerwünschte Replikationen für zukünftige Prüfungen

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

    ⚙️ Einstellungen:
    Bearbeiten → Einstellungen → Replikationsprüfer
    • Automatische Prüfhäufigkeit
    • Neue Einträge automatisch prüfen

onboarding-scan-title = Bereit, Ihre Bibliothek zu scannen?
onboarding-scan-content =
    Möchten Sie Ihre Bibliothek jetzt auf Replikationen scannen?

    • Klicken Sie "Ja", um den Scan zu starten
      (dies kann einige Minuten dauern)

    • Klicken Sie "Nein", um zu überspringen - Sie können später jederzeit über das Menü Werkzeuge scannen

    💡 Zugriff auf diese Anleitung jederzeit:
    Hilfe → Replikationsprüfer Benutzerhandbuch

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = Reproduktion sperren

## Reproduction Feature - Tags
reproduction-checker-tag = Hat Reproduktion
reproduction-checker-tag-is-reproduction = Ist Reproduktion
reproduction-checker-tag-added-by-checker = Hinzugefügt von Replikationsprüfer
reproduction-checker-tag-readonly-origin = Original in schreibgeschützter Bibliothek vorhanden

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = Reproduktion: Rechnerisch erfolgreich, Robust
reproduction-checker-tag-outcome-cs-challenges = Reproduktion: Rechnerisch erfolgreich, Robustheitsprobleme
reproduction-checker-tag-outcome-cs-not-checked = Reproduktion: Rechnerisch erfolgreich, Robustheit nicht geprüft
reproduction-checker-tag-outcome-ci-robust = Reproduktion: Rechnerische Probleme, Robust
reproduction-checker-tag-outcome-ci-challenges = Reproduktion: Rechnerische Probleme, Robustheitsprobleme
reproduction-checker-tag-outcome-ci-not-checked = Reproduktion: Rechnerische Probleme, Robustheit nicht geprüft

## Reproduction Feature - Note Template
reproduction-checker-note-title = Reproduktionen gefunden
reproduction-checker-note-warning = Dies ist eine automatisch generierte Notiz. Bitte keine Änderungen vornehmen!
reproduction-checker-note-intro = Diese Studie wurde reproduziert:
reproduction-checker-note-feedback = War dieses Ergebnis hilfreich? Feedback geben <a href="{ $url }" target="_blank">hier</a>!
reproduction-checker-note-data-issues = Haben Sie Probleme mit den Daten gefunden? Bitte melden Sie diese <a href="{ $url }" target="_blank">hier</a>!
reproduction-checker-note-footer = Erstellt von Zotero Replikationsprüfer unter Verwendung der FORRT Literaturdatenbank (FLoRA)

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
    Sind Sie sicher, dass Sie { $count } Reproduktion(en) sperren möchten?

    Diese Einträge werden in den Papierkorb verschoben und bei zukünftigen Prüfungen nicht erneut hinzugefügt.
reproduction-checker-ban-success = { $count } Reproduktion(en) erfolgreich gesperrt.

## Reproduction Feature - Dialog
reproduction-checker-dialog-title = Reproduktionsstudien gefunden
reproduction-checker-dialog-intro = Reproduktionsstudien gefunden für:\n"{ $title }"
reproduction-checker-dialog-count = { $count } Reproduktion(en) gefunden:
reproduction-checker-dialog-item = { $index }. { $title }\n({ $year })\n   Ergebnis: { $outcome }
reproduction-checker-dialog-more = ...und { $count } weitere Reproduktion(en)
reproduction-checker-dialog-question = Möchten Sie Reproduktionsinformationen hinzufügen?
reproduction-checker-dialog-progress-title = Reproduktionsinformationen hinzugefügt
reproduction-checker-dialog-progress-line = Reproduktionsinformationen zu "{ $title }" hinzugefügt

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found = { $count } Eintrag/Einträge mit Reproduktionen gefunden

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
pref-blacklist-title = Gesperrte Replikationen
pref-blacklist-description = Verwalten Sie Replikationen, die Sie vom Erscheinen in Ihrer Bibliothek gesperrt haben
pref-blacklist-col-replication = Replikationsartikel
pref-blacklist-col-original = Originalartikel
pref-blacklist-col-type = Typ
pref-blacklist-col-banned = Gesperrt am
pref-blacklist-empty = Keine gesperrten Replikationen
pref-blacklist-remove = Auswahl entfernen
pref-blacklist-clear = Alle gesperrten Replikationen löschen
pref-blacklist-hint = Gesperrte Replikationen werden bei zukünftigen Prüfungen nicht erneut hinzugefügt. Sie können Replikationen über das Kontextmenü sperren.
