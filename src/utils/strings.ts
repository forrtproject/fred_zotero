/**
 * Embedded English strings for Replication Checker plugin
 * Extracted from addon/locale/en-US/replication-checker.ftl
 */

export const strings = {
  // Menu Items
  "replication-checker-tools-menu": "Check Current Library for Replications",
  "replication-checker-context-menu": "Check for Replications",
  "replication-checker-context-menu-add-original": "Add Original",

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
  "replication-checker-progress-match-count": "Found { $count } item(s) with replications",
  "replication-checker-progress-copying-readonly": "Copying items from read-only library to Personal library...",

  // Alerts
  "replication-checker-alert-title": "Zotero Replication Checker",
  "replication-checker-alert-no-dois-selected": "No DOIs found in selected items.",
  "replication-checker-alert-no-collection": "Please select a collection before running this check.",
  "replication-checker-alert-no-originals-available": "No original studies available for this replication.",
  "replication-checker-alert-no-doi": "Selected item has no DOI.",
  "replication-checker-add-original-success": "Successfully added original study: { $title }",
  "replication-checker-error-title": "Replication Checker - Error",
  "replication-checker-error-api": "Could not retrieve data from API - check your internet connection or retry again later.",
  "replication-checker-error-body": "Failed to check { $target } for replications:\n\n{ $details }\n\nCould not retrieve data from API - check your internet connection or retry again later.",
  "replication-checker-target-library": "the current library",
  "replication-checker-target-selected": "the selected items",
  "replication-checker-target-collection": "the selected collection",

  // Ban Feature
  "replication-checker-context-menu-ban": "Ban Replication",
  "replication-checker-ban-title": "Ban Replications",
  "replication-checker-ban-confirm": "Are you sure you want to ban { $count } replication(s)?\n\nThese items will be moved to trash and won't be re-added during future checks.",
  "replication-checker-ban-success": "Successfully banned { $count } replication(s).",
  "replication-checker-alert-no-replications-selected": "No replication items selected.",

  // Dialog
  "replication-checker-dialog-title": "Replication Studies Found",
  "replication-checker-dialog-intro": "Replication studies found for:\n\"{ $title }\"",
  "replication-checker-dialog-count": "Found { $count } replication(s):",
  "replication-checker-dialog-item": "{ $index }. { $title }\n({ $year })\n   Outcome: { $outcome }",
  "replication-checker-dialog-more": "...and { $count } more replication(s)",
  "replication-checker-dialog-question": "Would you like to add replication information?",
  "replication-checker-dialog-progress-title": "Replication Information Added",
  "replication-checker-dialog-progress-line": "Added replication information to \"{ $title }\"",
  "replication-checker-dialog-is-replication-title": "Original Study Found",
  "replication-checker-dialog-is-replication-message": "No replications found, but this appears to be a replication study.\n\nWould you like to add the original article(s)?",

  // Read-Only Library Handling
  "replication-checker-readonly-dialog-title": "Read-Only Library Detected",
  "replication-checker-readonly-dialog-message": "This library is read-only. We found { $itemCount } item(s) with { $replicationCount } replication(s).\n\nWould you like to copy the original articles and their replications to your Personal library's \"Replication folder\"?",

  // Results Messages
  "replication-checker-results-title-library": "Library Scan Complete",
  "replication-checker-results-title-selected": "Selected Items Scan Complete",
  "replication-checker-results-title-collection": "Collection Scan Complete",
  "replication-checker-results-total": "Total items checked: { $count }",
  "replication-checker-results-dois": "Items with DOIs: { $count }",
  "replication-checker-results-found": "{ $count } item(s) have replications.",
  "replication-checker-results-none": "No replications found.",
  "replication-checker-results-footer": "View notes for details or select items to re-check.",

  // Tags
  "replication-checker-tag": "Has Replication",
  "replication-checker-tag-is-replication": "Is Replication",
  "replication-checker-tag-added-by-checker": "Added by Replication Checker",
  "replication-checker-tag-success": "Replication: Successful",
  "replication-checker-tag-failure": "Replication: Failure",
  "replication-checker-tag-mixed": "Replication: Mixed",
  "replication-checker-tag-readonly-origin": "Original present in Read-Only Library",
  "replication-checker-tag-has-been-replicated": "Has Been Replicated",
  "replication-checker-tag-has-been-reproduced": "Has Been Reproduced",
  "replication-checker-tag-in-fred": "In FReD",

  // Note Template
  "replication-checker-note-title": "Replications Found",
  "replication-checker-note-warning": "This is an automatically generated note. Do not make changes!",
  "replication-checker-note-intro": "This study has been replicated:",
  "replication-checker-note-feedback": "Did you find this result useful? Provide feedback <a href=\"{ $url }\" target=\"_blank\">here</a>!",
  "replication-checker-note-footer": "Generated by Zotero Replication Checker using the FORRT Replication Database (FReD)",

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
  "replication-checker-prompt-first-run": "Thank you for installing the Zotero Replication Checker!\n\nThis plugin helps you discover replication studies for your research by checking your library items against the FORRT Replication Database (FReD).\n\nWould you like to scan your library for replications now?\n\n• Click \"Yes\" to start scanning (this may take a few minutes)\n• Click \"No\" to skip - you can always scan later from Tools menu",

  // Onboarding Screens
  "onboarding-welcome-title": "Welcome to Replication Checker!",
  "onboarding-welcome-content": "Thank you for installing the Zotero Replication Checker!\n\nThis plugin helps you discover replication studies by automatically checking your library items against the FORRT Replication Database (FReD).\n\n✨ Key Features:\n• Automatic checking of DOIs against replication database\n• Works with entire library, collections, or individual items\n• Creates linked notes with replication information\n• Tags items with replication status\n\nLet's take a quick tour to get you started!",

  "onboarding-tools-title": "Check Your Entire Library",
  "onboarding-tools-content": "📍 Location: Tools → Check Current Library for Replications\n\n🔍 What it does:\n• Scans all items with DOIs\n• Queries FReD database\n• Creates notes with details\n• Tags items by outcome\n\n💡 Tip: Takes a few minutes depending on library size.",

  "onboarding-context-title": "Check Collections and Items",
  "onboarding-context-content": "📚 For Collections:\nRight-click collection → Check for Replications\n\n📄 For Individual Items:\nRight-click items → Check for Replications\n\n⚙️ Preferences:\nEdit → Settings → Replication Checker\n• Auto-check frequency\n• Auto-check new items\n\n💡 Access this guide anytime:\nHelp → Replication Checker User Guide\n\nYou're ready! 🎉",
} as const;

/**
 * Get a localized string with optional parameter substitution
 * Uses Zotero's built-in localization system to load strings from .ftl files
 * based on the user's language preference
 */
export function getString(key: string, params?: Record<string, string | number>): string {
  try {
    // Try to get the string from Zotero's localization system
    // The strings are loaded from addon/locale/{locale}/replication-checker.ftl
    const addon = (Zotero as any).ReplicationChecker || (globalThis as any).addon;

    if (addon?.data?.locale?.current) {
      try {
        // Use Zotero's Localization API to format the message
        const formatted = addon.data.locale.current.formatValueSync(key, params || {});
        if (formatted && formatted !== key) {
          return formatted;
        }
      } catch (e) {
        // Fall through to fallback
        Zotero.debug(`[ReplicationChecker] Locale error for key ${key}: ${e}`);
      }
    }

    // Fallback to hardcoded strings if localization system is not available
    const value = strings[key as keyof typeof strings];

    if (!value) {
      Zotero.debug(`[ReplicationChecker] Missing string for key: ${key}`);
      return key;
    }

    if (params) {
      let result: string = value;
      for (const [paramKey, paramValue] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{\\s*\\$${paramKey}\\s*\\}`, 'g'), String(paramValue));
      }
      return result;
    }

    return value as string;
  } catch (error) {
    // Absolute fallback in case of any error
    Zotero.debug(`[ReplicationChecker] Error getting string for key ${key}: ${error}`);
    return strings[key as keyof typeof strings] || key;
  }
}
