# Zotero Replication Checker Locale File
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = Check Current Library for Replications
replication-checker-context-menu = Check for Replications
replication-checker-context-menu-ban = Ban Replication
replication-checker-context-menu-add-original = Add Original

## Progress Messages
replication-checker-progress-checking-library = Checking for Replications
replication-checker-progress-checking-collection = Checking for Replications in Collection
replication-checker-progress-scanning-library = Scanning library...
replication-checker-progress-scanning-collection = Scanning collection...
replication-checker-progress-found-dois = Found { $itemCount } items with DOIs ({ $uniqueCount } unique)
replication-checker-progress-checking-database = Checking against replication database...
replication-checker-progress-no-dois = No items with DOIs found in collection
replication-checker-progress-complete = Check Complete
replication-checker-progress-failed = Check Failed
replication-checker-progress-match-count = Found { $count } item(s) with replications
replication-checker-progress-copying-readonly = Copying items from read-only library to Personal library...

## Alerts
replication-checker-alert-title = Zotero Replication Checker
replication-checker-alert-no-dois-selected = No DOIs found in selected items.
replication-checker-alert-no-collection = Please select a collection before running this check.
replication-checker-alert-no-originals-available = No original studies available for this replication.
replication-checker-alert-no-doi = Selected item has no DOI.
replication-checker-add-original-success = Successfully added original study: { $title }
replication-checker-error-title = Replication Checker - Error
replication-checker-error-api = Could not retrieve data from API - check your internet connection or retry again later.
replication-checker-error-body =
    Failed to check { $target } for replications:

    { $details }

    Could not retrieve data from API - check your internet connection or retry again later.
replication-checker-target-library = the current library
replication-checker-target-selected = the selected items
replication-checker-target-collection = the selected collection

## Ban Feature
replication-checker-ban-title = Ban Replications
replication-checker-ban-confirm =
    Are you sure you want to ban { $count } replication(s)?

    These items will be moved to trash and won't be re-added during future checks.
replication-checker-ban-success = Successfully banned { $count } replication(s).
replication-checker-alert-no-replications-selected = No replication items selected.

## Dialog
replication-checker-dialog-title = Replication Studies Found
replication-checker-dialog-intro = Replication studies found for:\n"{ $title }"
replication-checker-dialog-count = Found { $count } replication(s):
replication-checker-dialog-item = { $index }. { $title }\n({ $year })\n   Outcome: { $outcome }
replication-checker-dialog-more = ...and { $count } more replication(s)
replication-checker-dialog-question = Would you like to add replication information?
replication-checker-dialog-progress-title = Replication Information Added
replication-checker-dialog-progress-line = Added replication information to "{ $title }"
replication-checker-dialog-is-replication-title = Original Study Found
replication-checker-dialog-is-replication-message = No replications found, but this appears to be a replication study.\n\nWould you like to add the original article(s)?

## Read-Only Library Handling
replication-checker-readonly-dialog-title = Read-Only Library Detected
replication-checker-readonly-dialog-message =
    This library is read-only. We found { $itemCount } item(s) with { $replicationCount } replication(s).

    Would you like to copy the original articles and their replications to your Personal library's "Replication folder"?

## Results Messages
replication-checker-results-title-library = Library Scan Complete
replication-checker-results-title-selected = Selected Items Scan Complete
replication-checker-results-title-collection = Collection Scan Complete
replication-checker-results-total = Total items checked: { $count }
replication-checker-results-dois = Items with DOIs: { $count }
replication-checker-results-found = { $count } item(s) have replications.
replication-checker-results-none = No replications found.
replication-checker-results-reproductions-found = { $count } item(s) have reproductions.
replication-checker-results-reproductions-none = No reproductions found.
replication-checker-results-footer = View notes for details or select items to re-check.

## Tags
replication-checker-tag = Has Replication
replication-checker-tag-is-replication = Is Replication
replication-checker-tag-added-by-checker = Added by Replication Checker
replication-checker-tag-success = Replication: Successful
replication-checker-tag-failure = Replication: Failure
replication-checker-tag-mixed = Replication: Mixed
replication-checker-tag-readonly-origin = Original present in Read-Only Library
replication-checker-tag-has-been-replicated = Has Been Replicated
replication-checker-tag-has-been-reproduced = Has Been Reproduced
replication-checker-tag-in-flora = In FLoRA

## Note Template
replication-checker-note-title = Replications Found
replication-checker-note-warning = This is an automatically generated note. Do not make changes!
replication-checker-note-intro = This study has been replicated:
replication-checker-note-feedback = Did you find this result useful? Provide feedback <a href="{ $url }" target="_blank">here</a>!
replication-checker-note-data-issues = Did you find any issues in the data? Please report it <a href="{ $url }" target="_blank">here</a>!
replication-checker-note-footer = Generated by Zotero Replication Checker using the FORRT Literature Database (FLoRA)

## Replication Item Details
replication-checker-li-no-title = No title available
replication-checker-li-no-authors = No authors available
replication-checker-li-no-journal = No journal
replication-checker-li-na = N/A
replication-checker-li-doi-label = DOI:
replication-checker-li-outcome = Author Reported Outcome:
replication-checker-li-link = This study has a linked report:

## Onboarding
onboarding-welcome-title = Welcome to Replication Checker!
onboarding-welcome-content =
    Thank you for installing the Zotero Replication Checker!

    This plugin helps you discover replication studies by automatically checking your library items against the FORRT Literature Database (FLoRA).

    ✨ Key Features:
    • Automatic checking of DOIs against replication database
    • Works with entire library, collections, or individual items
    • Creates linked notes with replication information
    • Tags items with replication status
    • Add original studies when you have replications
    • Ban unwanted replications from future checks

    Let's take a quick tour to get you started!

onboarding-tools-title = Check Your Entire Library
onboarding-tools-content =
    📍 Location: Tools → Check Current Library for Replications

    🔍 What it does:
    • Scans all items with DOIs
    • Queries FLoRA database
    • Creates notes with details
    • Tags items by outcome

    💡 Tip: Takes a few minutes depending on library size.

onboarding-context-title = Check Collections and Items
onboarding-context-content =
    📚 For Collections:
    Right-click collection → Check for Replications

    📄 For Individual Items:
    Right-click items → Check for Replications

    🚫 Ban Replications:
    Right-click replication items → Ban Replication
    • Prevents unwanted replications from being re-added

    ⚙️ Preferences:
    Edit → Settings → Replication Checker
    • Auto-check frequency
    • Auto-check new items

onboarding-scan-title = Ready to Scan Your Library?
onboarding-scan-content =
    Would you like to scan your library for replications now?

    • Click "Yes" to start scanning
      (this may take a few minutes)

    • Click "No" to skip - you can always scan later from Tools menu

    💡 Access this guide anytime:
    Help → Replication Checker User Guide

## First Run Prompt
replication-checker-prompt-title = Welcome to Zotero Replication Checker!
replication-checker-prompt-first-run =
    Thank you for installing the Zotero Replication Checker!

    This plugin helps you discover replication studies for your research by checking your library items against the FORRT Literature Database (FLoRA).

    Would you like to scan your library for replications now?

    • Click "OK" to start scanning (this may take a few minutes)
    • Click "Cancel" to skip - you can always scan later from Tools menu

## Reproduction Feature - Menu Items
reproduction-checker-context-menu-ban = Ban Reproduction

## Reproduction Feature - Tags
reproduction-checker-tag = Has Reproduction
reproduction-checker-tag-is-reproduction = Is Reproduction
reproduction-checker-tag-added-by-checker = Added by Replication Checker
reproduction-checker-tag-readonly-origin = Original present in Read-Only Library

## Reproduction Feature - Outcome Tags
reproduction-checker-tag-outcome-cs-robust = Reproduction: Computationally Successful, Robust
reproduction-checker-tag-outcome-cs-challenges = Reproduction: Computationally Successful, Robustness Challenges
reproduction-checker-tag-outcome-cs-not-checked = Reproduction: Computationally Successful, Robustness Not Checked
reproduction-checker-tag-outcome-ci-robust = Reproduction: Computational Issues, Robust
reproduction-checker-tag-outcome-ci-challenges = Reproduction: Computational Issues, Robustness Challenges
reproduction-checker-tag-outcome-ci-not-checked = Reproduction: Computational Issues, Robustness Not Checked

## Reproduction Feature - Note Template
reproduction-checker-note-title = Reproductions Found
reproduction-checker-note-warning = This is an automatically generated note. Do not make changes!
reproduction-checker-note-intro = This study has been reproduced:
reproduction-checker-note-feedback = Did you find this result useful? Provide feedback <a href="{ $url }" target="_blank">here</a>!
reproduction-checker-note-data-issues = Did you find any issues in the data? Please report it <a href="{ $url }" target="_blank">here</a>!
reproduction-checker-note-footer = Generated by Zotero Replication Checker using the FORRT Literature Database (FLoRA)

## Reproduction Feature - Item Details
reproduction-checker-li-no-title = No title available
reproduction-checker-li-no-authors = No authors available
reproduction-checker-li-no-journal = No journal
reproduction-checker-li-na = N/A
reproduction-checker-li-doi-label = DOI:
reproduction-checker-li-outcome = Reproduction Outcome:
reproduction-checker-li-link = This study has a linked report:

## Reproduction Feature - Alerts
reproduction-checker-alert-no-reproductions-selected = No reproduction items selected.
reproduction-checker-ban-title = Ban Reproductions
reproduction-checker-ban-confirm =
    Are you sure you want to ban { $count } reproduction(s)?

    These items will be moved to trash and won't be re-added during future checks.
reproduction-checker-ban-success = Successfully banned { $count } reproduction(s).

## Reproduction Feature - Dialog
reproduction-checker-dialog-title = Reproduction Studies Found
reproduction-checker-dialog-intro = Reproduction studies found for:\n"{ $title }"
reproduction-checker-dialog-count = Found { $count } reproduction(s):
reproduction-checker-dialog-item = { $index }. { $title }\n({ $year })\n   Outcome: { $outcome }
reproduction-checker-dialog-more = ...and { $count } more reproduction(s)
reproduction-checker-dialog-question = Would you like to add reproduction information?
reproduction-checker-dialog-progress-title = Reproduction Information Added
reproduction-checker-dialog-progress-line = Added reproduction information to "{ $title }"

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found = Found { $count } item(s) with reproductions

## Preference Pane
pref-autocheck-title = Auto-Check Library for Replications
pref-autocheck-description = Automatically check your library for replication studies at regular intervals
pref-autocheck-disabled = Disabled (manual checking only)
pref-autocheck-daily = Daily (check every 24 hours)
pref-autocheck-weekly = Weekly (check every 7 days)
pref-autocheck-monthly = Monthly (check every 30 days)
pref-autocheck-new-items = Automatically check newly added library items (recommended)
pref-autocheck-new-items-hint = Disable this option if you prefer to run all replication checks manually.
pref-autocheck-note = Auto-check runs in the background when Zotero is open. You can still manually check using the Tools menu.
pref-blacklist-title = Banned Replications
pref-blacklist-description = Manage replications you've banned from appearing in your library
pref-blacklist-col-replication = Replication Article
pref-blacklist-col-original = Original Article
pref-blacklist-col-type = Type
pref-blacklist-col-banned = Banned On
pref-blacklist-empty = No banned replications
pref-blacklist-remove = Remove Selected
pref-blacklist-clear = Clear All Banned Replications
pref-blacklist-hint = Banned replications will not be re-added during future checks. You can ban replications using the context menu.
