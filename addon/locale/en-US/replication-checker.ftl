# Zotero Replication Checker Locale File
# Modern Fluent format (.ftl)

## Menu Items
replication-checker-tools-menu = Check Current Library for Replications
replication-checker-context-menu = Check for Replications
replication-checker-context-menu-ban = Ban Replication
replication-checker-context-menu-add-original = Add Original
replication-checker-context-menu-add-originals = Add Original(s)

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
replication-checker-progress-match-count =
    { $count ->
        [one] Found 1 item with replications
       *[other] Found { $count } items with replications
    }
replication-checker-progress-copying-readonly = Copying items from read-only library to Personal library...

## Alerts
replication-checker-alert-title = Zotero Replication Checker
replication-checker-alert-no-dois-selected = No DOIs found in selected items.
replication-checker-alert-no-collection = Please select a collection before running this check.
replication-checker-alert-no-originals-available = No original studies available for this replication.
replication-checker-alert-no-doi = Selected item has no DOI.
replication-checker-add-original-success = Successfully added "{ $title }" to "{ $folderName }".
replication-checker-add-original-exists = "{ $title }" is already in your library — tags, notes, and relationships have been updated in "{ $folderName }".
replication-checker-add-original-confirm =
    { $count ->
        [one] Found 1 original article for this replication. Please select which originals you would like to add to your library.
       *[other] Found { $count } original articles for this replication. Please select which originals you would like to add to your library.
    }
replication-checker-add-original-add-all-btn = Add All Originals
replication-checker-add-original-select-btn = Select which originals to add
replication-checker-add-original-batch-success =
    { $newCount ->
        [one] Added 1 new and updated { $existingCount } existing original articles in "{ $folderName }".
       *[other] Added { $newCount } new and updated { $existingCount } existing original articles in "{ $folderName }".
    }
replication-checker-add-original-batch-new-only =
    { $count ->
        [one] Successfully added 1 original article to "{ $folderName }".
       *[other] Successfully added { $count } original articles to "{ $folderName }".
    }
replication-checker-add-original-batch-exists-only =
    { $count ->
        [one] 1 original article already in your library — tags, notes, and relationships updated in "{ $folderName }".
       *[other] { $count } original articles already in your library — tags, notes, and relationships updated in "{ $folderName }".
    }
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
    { $count ->
        [one] Are you sure you want to ban 1 replication?
       *[other] Are you sure you want to ban { $count } replications?
    }

    These items will be moved to trash and won't be re-added during future checks.
replication-checker-ban-success =
    { $count ->
        [one] Successfully banned 1 replication.
       *[other] Successfully banned { $count } replications.
    }
replication-checker-alert-no-replications-selected = No replication items selected.

## Dialog
replication-checker-dialog-title = Replication Studies Found
replication-checker-dialog-intro =
    Replication studies found for:
    "{ $title }"
replication-checker-dialog-count =
    { $count ->
        [one] Found 1 replication:
       *[other] Found { $count } replications:
    }
replication-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       Outcome: { $outcome }
replication-checker-dialog-more =
    { $count ->
        [one] ...and 1 more replication
       *[other] ...and { $count } more replications
    }
replication-checker-dialog-question = Would you like to add replication information?
replication-checker-dialog-title-studies = Related Studies Found
replication-checker-dialog-intro-studies =
    Studies found for:
    "{ $title }"
replication-checker-dialog-question-studies = Would you like to add this information to your library?
replication-checker-dialog-progress-title = Replication Information Added
replication-checker-dialog-progress-line = Added replication information to "{ $title }"
replication-checker-notif-replication-new =
    { $count ->
        [one] Successfully added 1 new replication to "{ $folderName }".
       *[other] Successfully added { $count } new replications to "{ $folderName }".
    }
replication-checker-notif-replication-exists =
    { $count ->
        [one] 1 replication already in your library — tags, notes, and relationships updated in "{ $folderName }".
       *[other] { $count } replications already in your library — tags, notes, and relationships updated in "{ $folderName }".
    }
replication-checker-notif-replication-mixed =
    { $newCount ->
        [one] Added 1 new and updated { $existingCount } existing replications in "{ $folderName }".
       *[other] Added { $newCount } new and updated { $existingCount } existing replications in "{ $folderName }".
    }
replication-checker-dialog-is-replication-title = Original Study Found
replication-checker-dialog-is-replication-message =
    { $count ->
        [one] No replications found, but this appears to be a replication study. Found 1 original article. Would you like to add it to your library?
       *[other] No replications found, but this appears to be a replication study. Found { $count } original articles. Please select which originals you would like to add to your library.
    }

## Read-Only Library Handling
replication-checker-readonly-dialog-title = Read-Only Library Detected
replication-checker-readonly-dialog-message =
    { $replicationCount ->
        [one] This library is read-only. We found { $itemCount } item(s) with 1 replication.
       *[other] This library is read-only. We found { $itemCount } item(s) with { $replicationCount } replications.
    }

    Would you like to copy the original articles and their replications to your Personal library's replication folder?

## Results Messages
replication-checker-results-title-library = Library Scan Complete
replication-checker-results-title-selected = Selected Items Scan Complete
replication-checker-results-title-collection = Collection Scan Complete
replication-checker-results-total = Total items checked: { $count }
replication-checker-results-dois = Items with DOIs: { $count }
replication-checker-results-found =
    { $count ->
        [one] 1 item has replications, stored in "{ $folderName }".
       *[other] { $count } items have replications, stored in "{ $folderName }".
    }
replication-checker-results-none = No replications found.
replication-checker-results-reproductions-found =
    { $count ->
        [one] 1 item has reproductions, stored in "{ $folderName }".
       *[other] { $count } items have reproductions, stored in "{ $folderName }".
    }
replication-checker-results-reproductions-none = No reproductions found.
replication-checker-results-footer = View notes for details or select items to re-check.

## Tags
replication-checker-tag = Has Been Replicated
replication-checker-tag-is-replication = Is Replication
replication-checker-tag-added-by-checker = Added by Replication Checker
replication-checker-tag-success = Replication: Successful
replication-checker-tag-failure = Replication: Failure
replication-checker-tag-mixed = Replication: Mixed
replication-checker-tag-multiple-originals = Replication: Multiple Originals
replication-checker-tag-readonly-origin = Original present in Read-Only Library
replication-checker-tag-has-been-replicated = Has Been Replicated
replication-checker-tag-has-been-reproduced = Has Been Reproduced
replication-checker-tag-in-flora = In FLoRA

## Note Template
replication-checker-note-title = Replications Found
replication-checker-note-warning = This note is automatically generated. If you edit it, a new note will be created on the next check and this version will be kept as-is.
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

    This plugin helps you discover replication and reproduction studies by automatically checking your library items against the FORRT Literature Database (FLoRA).

    ✨ Key Features:
    • Checks entire library, collections, or individual items
    • Detects both replications and computational reproductions
    • Handles articles with multiple original studies
    • Adds outcome-tagged notes with DOI links
    • Automatically tags items (e.g. "Has Replication", "Is Replication")
    • Offers to add the original study when a replication is detected
    • Read-only group library support — copies items to Personal library
    • All collections kept inside one "FLoRA" collection, with configurable names
    • Ban unwanted replications from future checks
    • Auto-check: scans new items automatically or on a schedule
    • Privacy-preserving: your DOIs are never sent to the server
    • Available in multiple languages

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

    🗂️ Where things go:
    Everything the plugin creates lives inside one "FLoRA" collection
    • FLoRA Replications, FLoRA Reproductions
    • FLoRA Originals linked to Replications / Reproductions

    ⚙️ Preferences:
    Edit → Settings → Replication Checker
    • Auto-check frequency
    • Auto-check new items
    • Collection names, including the "FLoRA" container
    • FLoRA stats per library, with a link to the Replication Atlas

onboarding-stats-title = Your FLoRA Stats
onboarding-stats-content =
    📍 Location: Edit → Settings → Replication Checker

    📊 Live counts of what FLoRA knows about your library:
    • Articles with replications / reproductions
    • Articles that are themselves replications or reproductions
    • Counted by unique DOI, so the same paper saved twice counts once

    📚 Group libraries:
    If you belong to any, a Library picker appears above the table — stats are shown for whichever library you select, not just your personal one.

    🌍 Open in FLoRA Atlas:
    Opens the Replication Atlas pre-loaded with the tracked DOIs from the selected library, to see how your reading sits in the wider replication literature.

    💡 Items without a usable DOI can't be identified, so they're excluded — a note below the button says how many.

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
reproduction-checker-tag = Has Been Reproduced
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
reproduction-checker-tag-multiple-originals = Reproduction: Multiple Originals

## Reproduction Feature - Note Template
reproduction-checker-note-title = Reproductions Found
reproduction-checker-note-warning = This note is automatically generated. If you edit it, a new note will be created on the next check and this version will be kept as-is.
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
    { $count ->
        [one] Are you sure you want to ban 1 reproduction?
       *[other] Are you sure you want to ban { $count } reproductions?
    }

    These items will be moved to trash and won't be re-added during future checks.
reproduction-checker-ban-success =
    { $count ->
        [one] Successfully banned 1 reproduction.
       *[other] Successfully banned { $count } reproductions.
    }

## Reproduction Feature - Dialog
reproduction-checker-dialog-title = Reproduction Studies Found
reproduction-checker-dialog-intro =
    Reproduction studies found for:
    "{ $title }"
reproduction-checker-dialog-count =
    { $count ->
        [one] Found 1 reproduction:
       *[other] Found { $count } reproductions:
    }
reproduction-checker-dialog-item =
    { $index }. { $title }
    ({ $year })
       Outcome: { $outcome }
reproduction-checker-dialog-more =
    { $count ->
        [one] ...and 1 more reproduction
       *[other] ...and { $count } more reproductions
    }
reproduction-checker-dialog-question = Would you like to add reproduction information?
reproduction-checker-dialog-progress-title = Reproduction Information Added
reproduction-checker-dialog-progress-line = Added reproduction information to "{ $title }"

## Reproduction Feature - Progress
reproduction-checker-progress-reproductions-found =
    { $count ->
        [one] Found 1 item with reproductions
       *[other] Found { $count } items with reproductions
    }

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
pref-root-folder-title = FLoRA Container Collection
pref-root-folder-description = Name of the top-level Zotero collection that holds all FLoRA collections below
pref-root-folder-hint = Every collection below is created inside this one. Changing this will rename the existing collection automatically. All items will remain in the same collections.
pref-folder-title = Replication Folder Name
pref-folder-description = Name of the Zotero collection where replication items are stored
pref-folder-hint = Changing this will rename the existing collection automatically. All items will remain in the same collection.
pref-repro-folder-title = Reproduction Folder Name
pref-repro-folder-description = Name of the Zotero collection where reproduction items are stored
pref-repro-folder-hint = Changing this will rename the existing collection automatically. All items will remain in the same collection.
pref-originals-replication-folder-title = Originals Folder (linked to Replications)
pref-originals-replication-folder-description = Name of the Zotero collection where original articles (whose replications were added) are stored
pref-originals-replication-folder-hint = Changing this will rename the existing collection automatically. All items will remain in the same collection.
pref-originals-reproduction-folder-title = Originals Folder (linked to Reproductions)
pref-originals-reproduction-folder-description = Name of the Zotero collection where original articles (whose reproductions were added) are stored
pref-originals-reproduction-folder-hint = Changing this will rename the existing collection automatically. All items will remain in the same collection.

## Stats Pane
pref-stats-title = Your FLoRA Stats
pref-stats-description = Statistics based on your current Zotero library
pref-stats-has-replication = Articles with replications
pref-stats-has-reproduction = Articles with reproductions
pref-stats-is-replication = Articles identified as replications
pref-stats-originals = Original articles tracked
pref-stats-refresh = Refresh Stats
pref-stats-no-originals = No tracked originals found in your library. Run a replication check first.
pref-stats-open-atlas = Open in FLoRA Atlas ↗
pref-stats-view-flora = View FLoRA Database →
pref-stats-library = Library:
pref-stats-no-doi-note =
    { $count ->
        [one] 1 tracked item has no usable DOI — it is not counted above and is not sent to the Atlas
       *[other] { $count } tracked items have no usable DOI — they are not counted above and are not sent to the Atlas
    }
pref-stats-atlas-clipboard =
    { $count ->
        [one] 1 DOI copied — paste it into the Atlas DOI search field
       *[other] { $count } DOIs copied — paste them into the Atlas DOI search field
    }

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
