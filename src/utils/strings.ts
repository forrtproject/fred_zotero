/**
 * Embedded English strings for Replication Checker plugin
 * Extracted from addon/locale/en-US/replication-checker.ftl
 */

export const strings = {
  // Menu Items
  "replication-checker-tools-menu": "Check Current Library for Replications",
  "replication-checker-context-menu": "Check for Replications",
  "replication-checker-context-menu-add-original": "Add Original",
  "replication-checker-context-menu-add-originals": "Add Original(s)",

  // Progress Messages
  "replication-checker-progress-checking-library": "Checking for Replications",
  "replication-checker-progress-checking-collection": "Checking for Replications in Collection",
  "replication-checker-progress-scanning-library": "Scanning library...",
  "replication-checker-progress-scanning-collection": "Scanning collection...",
  "replication-checker-progress-found-dois": "Found { $itemCount } items with DOIs ({ $uniqueCount } unique)",
  "replication-checker-progress-checking-database": "Checking against replication database...",
  "replication-checker-progress-no-dois": "No items with DOIs found in collection",
  "replication-checker-progress-complete": "Check Complete",
  "replication-checker-progress-failed": "Check Failed",
  "replication-checker-progress-match-count": "{ $count -> [one] Found 1 item with replications *[other] Found { $count } items with replications }",
  "replication-checker-progress-copying-readonly": "Copying items from read-only library to Personal library...",

  // Alerts
  "replication-checker-alert-title": "Zotero Replication Checker",
  "replication-checker-alert-no-dois-selected": "No DOIs found in selected items.",
  "replication-checker-alert-no-collection": "Please select a collection before running this check.",
  "replication-checker-alert-no-originals-available": "No original studies available for this replication.",
  "replication-checker-alert-no-doi": "Selected item has no DOI.",
  "replication-checker-add-original-success": "Successfully added original study: { $title }",
  "replication-checker-add-original-add-all-btn": "Add All Originals",
  "replication-checker-add-original-confirm": "Found { $count } original articles for this replication. Please select which originals you would like to add to your library.",
  "replication-checker-add-original-select-btn": "Select which originals to add",
  "replication-checker-add-original-batch-success": "Successfully added { $count } original articles to your library.",
  "replication-checker-error-title": "Replication Checker - Error",
  "replication-checker-error-api": "Could not retrieve data from API - check your internet connection or retry again later.",
  "replication-checker-error-body": "Failed to check { $target } for replications:\n\n{ $details }\n\nCould not retrieve data from API - check your internet connection or retry again later.",
  "replication-checker-target-library": "the current library",
  "replication-checker-target-selected": "the selected items",
  "replication-checker-target-collection": "the selected collection",

  // Ban Feature
  "replication-checker-context-menu-ban": "Ban Replication",
  "replication-checker-ban-title": "Ban Replications",
  "replication-checker-ban-confirm": "{ $count -> [one] Are you sure you want to ban 1 replication? *[other] Are you sure you want to ban { $count } replications? }\n\nThese items will be moved to trash and won't be re-added during future checks.",
  "replication-checker-ban-success": "{ $count -> [one] Successfully banned 1 replication. *[other] Successfully banned { $count } replications. }",
  "replication-checker-alert-no-replications-selected": "No replication items selected.",

  // Dialog
  "replication-checker-dialog-title": "Replication Studies Found",
  "replication-checker-dialog-intro": "Replication studies found for:\n\"{ $title }\"",
  "replication-checker-dialog-count": "Found { $count } replication(s):",
  "replication-checker-dialog-item": "{ $index }. { $title }\n({ $year })\n   Outcome: { $outcome }",
  "replication-checker-dialog-more": "...and { $count } more replication(s)",
  "replication-checker-dialog-question": "Would you like to add replication information?",
  // Used only when an item has replications *and* reproductions; the
  // single-kind cases reuse the existing replication-/reproduction- strings.
  "replication-checker-dialog-title-studies": "Related Studies Found",
  "replication-checker-dialog-intro-studies": "Studies found for:\n\"{ $title }\"",
  "replication-checker-dialog-question-studies": "Would you like to add this information to your library?",
  "replication-checker-dialog-progress-title": "Replication Information Added",
  "replication-checker-dialog-progress-line": "Added replication information to \"{ $title }\"",
  "replication-checker-dialog-is-replication-title": "Original Study Found",
  "replication-checker-dialog-is-replication-message": "{ $count -> [one] No replications found, but this appears to be a replication study. Found 1 original article. Would you like to add it to your library? *[other] No replications found, but this appears to be a replication study. Found { $count } original articles. Please select which originals you would like to add to your library. }",

  // Read-Only Library Handling
  "replication-checker-readonly-dialog-title": "Read-Only Library Detected",
  "replication-checker-readonly-dialog-message": "This library is read-only. We found { $itemCount } item(s) with { $replicationCount } replication(s).\n\nWould you like to copy the original articles and their replications to your Personal library's replication folder?",

  // Results Messages
  "replication-checker-results-title-library": "Library Scan Complete",
  "replication-checker-results-title-selected": "Selected Items Scan Complete",
  "replication-checker-results-title-collection": "Collection Scan Complete",
  "replication-checker-results-total": "Total items checked: { $count }",
  "replication-checker-results-dois": "Items with DOIs: { $count }",
  "replication-checker-results-found": "{ $count } item(s) have replications.",
  "replication-checker-results-none": "No replications found.",
  "replication-checker-results-footer": "View notes for details or select items to re-check.",
  "replication-checker-notif-replication-new": "Successfully added { $count } new replication(s) to \"{ $folderName }\".",
  "replication-checker-notif-replication-exists": "{ $count } replication(s) already in your library — tags, notes, and relationships updated in \"{ $folderName }\".",
  "replication-checker-notif-replication-mixed": "Added { $newCount } new and updated { $existingCount } existing replication(s) in \"{ $folderName }\".",

  // Tags
  "replication-checker-tag": "Has Been Replicated",
  "replication-checker-tag-is-replication": "Is Replication",
  "replication-checker-tag-added-by-checker": "Added by Replication Checker",
  "replication-checker-tag-success": "Replication: Successful",
  "replication-checker-tag-failure": "Replication: Failure",
  "replication-checker-tag-mixed": "Replication: Mixed",
  "replication-checker-tag-readonly-origin": "Original present in Read-Only Library",
  "replication-checker-tag-has-been-replicated": "Has Been Replicated",
  "replication-checker-tag-has-been-reproduced": "Has Been Reproduced",
  "replication-checker-tag-in-flora": "In FLoRA",

  // Note Template
  "replication-checker-note-title": "Replications Found",
  "replication-checker-note-warning": "This note is automatically generated. If you edit it, a new note will be created on the next check and this version will be kept as-is.",
  "replication-checker-note-intro": "This study has been replicated:",
  "replication-checker-note-feedback": "Did you find this result useful? Provide feedback <a href=\"{ $url }\" target=\"_blank\">here</a>!",
  "replication-checker-note-data-issues": "Did you find any issues in the data? Please report it <a href=\"{ $url }\" target=\"_blank\">here</a>!",
  "replication-checker-note-footer": "Generated by Zotero Replication Checker using the FORRT Literature Database (FLoRA)",

  // Replication Item Details
  "replication-checker-li-no-title": "No title available",
  "replication-checker-li-no-authors": "No authors available",
  "replication-checker-li-no-journal": "No journal",
  "replication-checker-li-na": "N/A",
  "replication-checker-li-doi-label": "DOI:",
  "replication-checker-li-outcome": "Author Reported Outcome:",
  "replication-checker-li-link": "This study has a linked report:",

  // First Run Prompt
  "replication-checker-prompt-title": "Welcome to Zotero Replication Checker!",
  "replication-checker-prompt-first-run": "Thank you for installing the Zotero Replication Checker!\n\nThis plugin helps you discover replication studies for your research by checking your library items against the FORRT Literature Database (FLoRA).\n\nWould you like to scan your library for replications now?\n\n• Click \"OK\" to start scanning (this may take a few minutes)\n• Click \"Cancel\" to skip - you can always scan later from Tools menu",

  // Reproduction Tags
  "reproduction-checker-tag": "Has Been Reproduced",
  "reproduction-checker-tag-is-reproduction": "Is Reproduction",
  "reproduction-checker-tag-added-by-checker": "Added by Replication Checker",
  "reproduction-checker-tag-readonly-origin": "Original present in Read-Only Library",
  "reproduction-checker-tag-outcome-cs-robust": "Reproduction: Computationally Successful, Robust",
  "reproduction-checker-tag-outcome-cs-challenges": "Reproduction: Computationally Successful, Robustness Challenges",
  "reproduction-checker-tag-outcome-cs-not-checked": "Reproduction: Computationally Successful, Robustness Not Checked",
  "reproduction-checker-tag-outcome-ci-robust": "Reproduction: Computational Issues, Robust",
  "reproduction-checker-tag-outcome-ci-challenges": "Reproduction: Computational Issues, Robustness Challenges",
  "reproduction-checker-tag-outcome-ci-not-checked": "Reproduction: Computational Issues, Robustness Not Checked",

  // Reproduction Progress
  "reproduction-checker-progress-reproductions-found": "Found { $count } item(s) with reproductions",

  // Reproduction Notes
  // English fallbacks for the reproduction dialog. The FTL files have carried
  // these in every locale for a while; strings.ts had not, so getString() would
  // have returned the raw key had a locale failed to load.
  "reproduction-checker-dialog-title": "Reproduction Studies Found",
  "reproduction-checker-dialog-intro": "Reproduction studies found for:\n\"{ $title }\"",
  "reproduction-checker-dialog-count": "{ $count -> [one] Found 1 reproduction: *[other] Found { $count } reproductions: }",
  "reproduction-checker-dialog-item": "{ $index }. { $title }\n({ $year })\n   Outcome: { $outcome }",
  "reproduction-checker-dialog-more": "{ $count -> [one] ...and 1 more reproduction *[other] ...and { $count } more reproductions }",
  "reproduction-checker-dialog-question": "Would you like to add reproduction information?",
  "reproduction-checker-dialog-progress-line": "Added reproduction information to \"{ $title }\"",

  "reproduction-checker-note-title": "Reproductions Found",
  "reproduction-checker-note-warning": "This note is automatically generated. If you edit it, a new note will be created on the next check and this version will be kept as-is.",
  "reproduction-checker-note-intro": "This study has been reproduced:",
  "reproduction-checker-note-feedback": "Did you find this result useful? Provide feedback <a href=\"{ $url }\" target=\"_blank\">here</a>!",
  "reproduction-checker-note-data-issues": "Did you find any issues in the data? Please report it <a href=\"{ $url }\" target=\"_blank\">here</a>!",
  "reproduction-checker-note-footer": "Generated by Zotero Replication Checker using the FORRT Literature Database (FLoRA)",

  // Reproduction Item Labels
  "reproduction-checker-li-no-title": "No title available",
  "reproduction-checker-li-no-authors": "No authors available",
  "reproduction-checker-li-no-journal": "No journal",
  "reproduction-checker-li-na": "N/A",
  "reproduction-checker-li-doi-label": "DOI:",
  "reproduction-checker-li-outcome": "Reproduction Outcome:",
  "reproduction-checker-li-link": "This study has a linked report:",

  // Onboarding
  "onboarding-welcome-title": "Welcome to Replication Checker!",
  "onboarding-welcome-content": "Thank you for installing the Zotero Replication Checker!\n\nThis plugin helps you discover replication studies by automatically checking your library items against the FORRT Literature Database (FLoRA).\n\n✨ Key Features:\n• Automatic checking of DOIs against replication database\n• Works with entire library, collections, or individual items\n• Creates linked notes with replication information\n• Tags items with replication status\n• Add original studies when you have replications\n• Ban unwanted replications from future checks\n\nLet's take a quick tour to get you started!",

  "onboarding-tools-title": "Check Your Entire Library",
  "onboarding-tools-content": "📍 Location: Tools → Check Current Library for Replications\n\n🔍 What it does:\n• Scans all items with DOIs\n• Queries FLoRA database\n• Creates notes with details\n• Tags items by outcome\n\n💡 Tip: Takes a few minutes depending on library size.",

  "onboarding-context-title": "Check Collections and Items",
  "onboarding-context-content": "📚 For Collections:\nRight-click collection → Check for Replications\n\n📄 For Individual Items:\nRight-click items → Check for Replications\n\n🚫 Ban Replications:\nRight-click replication items → Ban Replication\n• Prevents unwanted replications from being re-added\n\n🗂️ Where things go:\nEverything the plugin creates lives inside one \"FLoRA\" collection\n• FLoRA Replications, FLoRA Reproductions\n• FLoRA Originals linked to Replications / Reproductions\n\n⚙️ Preferences:\nEdit → Settings → Replication Checker\n• Auto-check frequency\n• Auto-check new items\n• Collection names, including the \"FLoRA\" container\n• FLoRA stats per library, with a link to the Replication Atlas",

  "onboarding-stats-title": "Your FLoRA Stats",
  "onboarding-stats-content": "📍 Location: Edit → Settings → Replication Checker\n\n📊 Live counts of what FLoRA knows about your library:\n• Articles with replications / reproductions\n• Articles that are themselves replications or reproductions\n• Counted by unique DOI, so the same paper saved twice counts once\n\n📚 Group libraries:\nIf you belong to any, a Library picker appears above the table — stats are shown for whichever library you select, not just your personal one.\n\n🌍 Open in FLoRA Atlas:\nOpens the Replication Atlas pre-loaded with the tracked DOIs from the selected library, to see how your reading sits in the wider replication literature.\n\n💡 Items without a usable DOI can't be identified, so they're excluded — a note below the button says how many.",

  "onboarding-scan-title": "Ready to Scan Your Library?",
  "onboarding-scan-content": "Would you like to scan your library for replications now?\n\n• Click \"Yes\" to start scanning\n  (this may take a few minutes)\n\n• Click \"No\" to skip - you can always scan later from Tools menu\n\n💡 Access this guide anytime:\nHelp → Replication Checker User Guide",
  // Stats Pane
  "pref-stats-title": "Your FLoRA Stats",
  "pref-stats-description": "Statistics based on your current Zotero library",
  "pref-stats-has-replication": "Articles with replications",
  "pref-stats-has-reproduction": "Articles with reproductions",
  "pref-stats-is-replication": "Articles identified as replications",
  "pref-stats-originals": "Original articles tracked",
  "pref-stats-refresh": "Refresh Stats",
  "pref-stats-no-originals": "No tracked originals found in your library. Run a replication check first.",
  "pref-stats-open-atlas": "Open in FLoRA Atlas ↗",
  "pref-stats-view-flora": "View FLoRA Database →",
  "pref-stats-library": "Library:",
  "pref-stats-no-doi-note": "{ $count -> [one] 1 tracked item has no usable DOI — it is not counted above and is not sent to the Atlas *[other] { $count } tracked items have no usable DOI — they are not counted above and are not sent to the Atlas }",
  "pref-stats-atlas-clipboard": "{ $count -> [one] 1 DOI copied — paste it into the Atlas DOI search field *[other] { $count } DOIs copied — paste them into the Atlas DOI search field }",

  // Preference Pane
  "pref-autocheck-title": "Auto-Check Library for Replications",
  "pref-autocheck-description": "Automatically check your library for replication studies at regular intervals",
  "pref-autocheck-disabled": "Disabled (manual checking only)",
  "pref-autocheck-daily": "Daily (check every 24 hours)",
  "pref-autocheck-weekly": "Weekly (check every 7 days)",
  "pref-autocheck-monthly": "Monthly (check every 30 days)",
  "pref-autocheck-new-items": "Automatically check newly added library items (recommended)",
  "pref-autocheck-new-items-hint": "Disable this option if you prefer to run all replication checks manually.",
  "pref-autocheck-note": "Auto-check runs in the background when Zotero is open. You can still manually check using the Tools menu.",
  "pref-root-folder-title": "FLoRA Container Collection",
  "pref-root-folder-description": "Name of the top-level Zotero collection that holds all FLoRA collections below",
  "pref-root-folder-hint": "Every collection below is created inside this one. Changing this will rename the existing collection automatically. All items will remain in the same collections.",
  "pref-folder-title": "Replication Folder Name",
  "pref-folder-description": "Name of the Zotero collection where replication items are stored",
  "pref-folder-hint": "Changing this will create a new collection for future checks. Existing items will remain in the old collection.",
  "pref-blacklist-title": "Banned Replications",
  "pref-blacklist-description": "Manage replications you've banned from appearing in your library",
  "pref-blacklist-col-replication": "Replication Article",
  "pref-blacklist-col-original": "Original Article",
  "pref-blacklist-col-type": "Type",
  "pref-blacklist-col-banned": "Banned On",
  "pref-blacklist-empty": "No banned replications",
  "pref-blacklist-remove": "Remove Selected",
  "pref-blacklist-clear": "Clear All Banned Replications",
  "pref-blacklist-hint": "Banned replications will not be re-added during future checks. You can ban replications using the context menu.",
} as const;

/**
 * Pick the correct branch text from a Fluent selector body.
 * Finds all *?[tag] markers by position and returns the text for `category`
 * (falling back to "other" then the first branch).
 */
function pickFtlBranch(body: string, category: string): string {
  const tagRe = /\*?\[(\w+)\]/g;
  const positions: Array<{ tag: string; contentStart: number; markerStart: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(body)) !== null) {
    positions.push({ tag: m[1], contentStart: m.index + m[0].length, markerStart: m.index });
  }
  if (positions.length === 0) return body.trim();
  const branches: Record<string, string> = {};
  for (let idx = 0; idx < positions.length; idx++) {
    const start = positions[idx].contentStart;
    const end = idx + 1 < positions.length ? positions[idx + 1].markerStart : body.length;
    branches[positions[idx].tag] = body.slice(start, end).trim();
  }
  return branches[category] ?? branches["other"] ?? Object.values(branches)[0] ?? "";
}

/**
 * Resolve Fluent plural selector blocks within a string.
 * Handles { $var -> [one] ... *[other] ... } — including selectors whose
 * branch bodies contain nested { $param } variable references.
 * Uses brace-depth counting so nested braces never truncate the outer selector.
 */
function resolveFluentSelectors(value: string, params: Record<string, string | number>): string {
  let result = "";
  let i = 0;
  while (i < value.length) {
    if (value[i] !== '{') {
      result += value[i++];
      continue;
    }
    // Check ahead: is this a selector  { $varName -> … }  ?
    const selectorMatch = /^\{\s*\$(\w+)\s*->/.exec(value.slice(i));
    if (!selectorMatch) {
      result += value[i++];
      continue;
    }
    // Walk forward counting brace depth to find the matching closing }
    let depth = 1;
    let j = i + 1;
    while (j < value.length && depth > 0) {
      if (value[j] === '{') depth++;
      else if (value[j] === '}') depth--;
      j++;
    }
    // value[i..j) is the full selector block; body is between "->" and the final "}"
    const bodyStart = i + selectorMatch[0].length;
    const bodyEnd = j - 1;
    const body = value.slice(bodyStart, bodyEnd);
    const varName = selectorMatch[1];
    const numVal = Number(params[varName] ?? 0);
    const category = numVal === 1 ? "one" : "other";
    result += pickFtlBranch(body, category);
    i = j;
  }
  return result;
}

/**
 * Apply { $key } variable substitution to a string.
 */
function applyParams(value: string, params: Record<string, string | number>): string {
  let result = value;
  for (const [paramKey, paramValue] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{\\s*\\$${paramKey}\\s*\\}`, 'g'), String(paramValue));
  }
  return result;
}

/**
 * Get a localized string with optional parameter substitution.
 * Supports Fluent plural selectors ({ $count -> [one] ... *[other] ... }).
 */
export function getString(key: string, params?: Record<string, string | number>): string {
  try {
    // Try to get the string from loaded FTL locale strings
    const addonFromZotero = (Zotero as any).ReplicationChecker;
    const addonFromGlobal = (globalThis as any).addon;
    const addon = addonFromZotero || addonFromGlobal;

    // Check if we have loaded locale strings from FTL file
    if (addon?.data?.locale?.strings) {
      const localizedValue = addon.data.locale.strings[key];
      if (localizedValue) {
        if (params) {
          const resolved = resolveFluentSelectors(localizedValue, params);
          return applyParams(resolved, params);
        }
        return localizedValue;
      }
    }

    // Fallback to hardcoded English strings
    const value = strings[key as keyof typeof strings];

    if (!value) {
      Zotero.debug(`[ReplicationChecker] Missing string for key: ${key}`);
      return key;
    }

    if (params) {
      const resolved = resolveFluentSelectors(value, params);
      return applyParams(resolved, params);
    }

    return value as string;
  } catch (error) {
    // Absolute fallback in case of any error
    Zotero.debug(`[ReplicationChecker] Error getting string for key ${key}: ${error}`);
    return strings[key as keyof typeof strings] || key;
  }
}
