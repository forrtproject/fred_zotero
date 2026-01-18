# Zotero Replication Checker Locale File - German
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = Aktuelle Bibliothek auf Replikationen prüfen
replication-checker-context-menu = Auf Replikationen prüfen

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
replication-checker-results-footer = Notizen für Details ansehen oder Einträge erneut prüfen.

## Tags
replication-checker-tag = Hat Replikation
replication-checker-tag-is-replication = Ist Replikation
replication-checker-tag-added-by-checker = Hinzugefügt von Replikationsprüfer
replication-checker-tag-success = Replikation: Erfolgreich
replication-checker-tag-failure = Replikation: Fehlgeschlagen
replication-checker-tag-mixed = Replikation: Gemischt
replication-checker-tag-readonly-origin = Original in schreibgeschützter Bibliothek vorhanden

## Note Template
replication-checker-note-title = Replikationen gefunden
replication-checker-note-warning = Dies ist eine automatisch generierte Notiz. Bitte keine Änderungen vornehmen!
replication-checker-note-intro = Diese Studie wurde repliziert:
replication-checker-note-feedback = War dieses Ergebnis hilfreich? Feedback geben <a href="{ $url }" target="_blank">hier</a>!
replication-checker-note-footer = Erstellt von Zotero Replikationsprüfer unter Verwendung der FORRT Replikationsdatenbank (FReD)

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

    Dieses Plugin hilft Ihnen, Replikationsstudien für Ihre Forschung zu entdecken, indem es Ihre Bibliothekseinträge mit der FORRT Replikationsdatenbank (FReD) abgleicht.

    Möchten Sie Ihre Bibliothek jetzt auf Replikationen scannen?

    • Klicken Sie "Ja", um den Scan zu starten (dies kann einige Minuten dauern)
    • Klicken Sie "Nein", um zu überspringen - Sie können später jederzeit über das Menü scannen
