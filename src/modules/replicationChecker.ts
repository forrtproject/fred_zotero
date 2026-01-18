/**
 * Main replication checker module
 * Orchestrates the checking workflow, handles UI, and manages item updates
 */

import { APIDataSource } from "./dataSource";
import { BatchMatcher } from "./batchMatcher";
import * as ZoteroIntegration from "../utils/zoteroIntegration";
import type { ZoteroItemData } from "../types/replication";
import { getString } from "../utils/strings";

const AUTO_CHECK_PREF = "extensions.zotero.replication-checker.autoCheckFrequency";
const NEW_ITEM_PREF = "extensions.zotero.replication-checker.autoCheckNewItems";

interface MatchResult {
  doi: string;
  replications: any[];
}

type LocaleParams = Record<string, string | number>;
const FEEDBACK_URL = "https://tinyurl.com/y5evebv9";

/**
 * Main plugin class for replication checking
 */
export class ReplicationCheckerPlugin {
  private dataSource: APIDataSource | null = null;
  private matcher: BatchMatcher | null = null;
  private rootURI: string = "";
  private notifierID: string | null = null;
  private autoCheckTimer: number | null = null;
  private prefObserverSymbols: symbol[] = [];

  /**
   * Initialize the plugin
   * @param rootURI The plugin root URI
   */
  async init(rootURI: string): Promise<void> {
    this.rootURI = rootURI;

    try {
      Zotero.debug("Initializing ReplicationCheckerPlugin with API data source");

      // Initialize data source with API
      this.dataSource = new APIDataSource();
      await this.dataSource.initialize();

      // Create matcher with data source
      this.matcher = new BatchMatcher(this.dataSource);

      // Register notifier to watch for new items
      this.registerNotifier();

      // Watch preference changes
      this.registerPreferenceObservers();

      // Start auto-check timer if enabled
      this.startAutoCheck();

      Zotero.debug("ReplicationCheckerPlugin initialized successfully");
    } catch (error) {
      Zotero.logError(new Error(`Failed to initialize: ${error instanceof Error ? error.message : String(error)}`));
      throw error;
    }
  }

  /**
   * Register Zotero notifier to watch for new items
   */
  private registerNotifier(): void {
    const notifierCallback: { notify: _ZoteroTypes.Notifier.Notify } = {
      notify: async (
        event: string,
        type: string,
        ids: (number | string)[],
        extraData?: any
      ): Promise<void> => {
        if (event === "add" && type === "item") {
          if (!this.shouldCheckNewItems()) {
            Zotero.debug("ReplicationChecker: Skipping new-item auto-check (preference disabled)");
            return;
          }
          // Small delay to ensure item is fully saved
          setTimeout(() => {
            if (!this.shouldCheckNewItems()) {
              Zotero.debug("ReplicationChecker: New-item auto-check disabled before execution");
              return;
            }
            this.checkNewItems(ids as number[]);
          }, 2000);
        }
      },
    };

    this.notifierID = Zotero.Notifier.registerObserver(notifierCallback, ["item"]);
    Zotero.debug("ReplicationChecker: Notifier registered for new items");
  }

  /**
   * Register observers for preference changes
   */
  private registerPreferenceObservers(): void {
    this.unregisterPreferenceObservers();

    try {
      const symbol = Zotero.Prefs.registerObserver(AUTO_CHECK_PREF, () => {
        Zotero.debug("ReplicationChecker: Auto-check preference changed; restarting timer");
        this.restartAutoCheckTimer();
      });
      this.prefObserverSymbols.push(symbol);
    } catch (error) {
      Zotero.logError(
        new Error(
          `Failed to register auto-check preference observer: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      );
    }
  }

  /**
   * Remove any registered preference observers
   */
  private unregisterPreferenceObservers(): void {
    for (const symbol of this.prefObserverSymbols) {
      try {
        Zotero.Prefs.unregisterObserver(symbol);
      } catch (error) {
        Zotero.debug(
          `ReplicationChecker: Failed to unregister preference observer: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
    this.prefObserverSymbols = [];
  }

  /**
   * Restart the auto-check timer when preferences change
   */
  private restartAutoCheckTimer(): void {
    this.stopAutoCheck();
    this.startAutoCheck();
  }

  /**
   * Determine if new items should be auto-checked
   */
  private shouldCheckNewItems(): boolean {
    try {
      const prefValue = Zotero.Prefs.get(NEW_ITEM_PREF);
      if (typeof prefValue === "boolean") {
        return prefValue;
      }
      return true;
    } catch (error) {
      Zotero.debug(`ReplicationChecker: Failed to read new-item preference: ${error}`);
      return true;
    }
  }

  /**
   * Handle errors returned from the replication API
   */
  private handleMatchError(error: unknown, context: "library" | "selected" | "collection"): void {
    const message = error instanceof Error ? error.message : String(error);
    Zotero.logError(new Error(`ReplicationChecker: API error during ${context} check: ${message}`));
    this.showApiUnavailableAlert();
  }

  /**
   * Display a canonical alert when the API cannot be reached
   */
  private showApiUnavailableAlert(): void {
    const promptWin = this.getPromptWindow();
    if (!promptWin) return;

    Services.prompt.alert(
      promptWin,
      getString("replication-checker-error-title"),
      getString("replication-checker-error-api")
    );
  }


  /**
   * Show a simple information alert with a localized title and message
   */
  private showInfoAlert(messageKey: string, params?: LocaleParams): void {
    const promptWin = this.getPromptWindow();
    if (!promptWin) return;

    Services.prompt.alert(
      promptWin,
      getString("replication-checker-alert-title"),
      getString(messageKey, params)
    );
  }

  /**
   * Show a detailed error alert for contextual operations
   */
  private showOperationError(target: "library" | "selected" | "collection", details: string): void {
    const promptWin = this.getPromptWindow();
    if (!promptWin) return;

    const title = getString("replication-checker-error-title");
    const targetLabel = getString(`replication-checker-target-${target}`);
    const message = getString("replication-checker-error-body", {
      target: targetLabel,
      details,
    });

    Services.prompt.alert(promptWin, title, message);
  }

  /**
   * Retrieve the main Zotero window cast to the type expected by Services.prompt
   */
  private getPromptWindow(): mozIDOMWindowProxy | null {
    const win = Zotero.getMainWindow();
    if (!win) {
      return null;
    }
    return win as unknown as mozIDOMWindowProxy;
  }

  /**
   * Convenience helper to add a line to the progress window without an icon
   */
  private addProgressLine(progressWin: Zotero.ProgressWindow, text: string): void {
    progressWin.addLines(text, "");
  }

  /**
   * Get auto-check frequency from preferences
   */
  private getAutoCheckFrequency(): string {
    try {
      const prefValue = Zotero.Prefs.get(AUTO_CHECK_PREF);
      if (typeof prefValue === "string" && prefValue.length > 0) {
        return prefValue;
      }
      return "disabled";
    } catch (error) {
      Zotero.debug(`Failed to get auto-check frequency preference: ${error}`);
      return "disabled";
    }
  }

  /**
   * Calculate auto-check interval in milliseconds
   */
  private getAutoCheckInterval(): number {
    const frequency = this.getAutoCheckFrequency();
    const intervals: { [key: string]: number } = {
      disabled: 0,
      daily: 24 * 60 * 60 * 1000, // 24 hours
      weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
      monthly: 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    return intervals[frequency] || 0;
  }

  /**
   * Start auto-check timer based on preferences
   */
  private startAutoCheck(): void {
    this.stopAutoCheck();
    const interval = this.getAutoCheckInterval();
    if (interval === 0) {
      Zotero.debug("ReplicationChecker: Auto-check is disabled");
      return;
    }

    const runAutoCheck = () => {
      Zotero.debug(
        `ReplicationChecker: Running auto-check (interval: ${this.getAutoCheckFrequency()})`
      );
      this.checkEntireLibrary();
    };

    // Check immediately on startup
    setTimeout(runAutoCheck, 5000); // Wait 5 seconds for plugin to fully initialize

    // Set up recurring check
    this.autoCheckTimer = setInterval(runAutoCheck, interval) as unknown as number;

    Zotero.debug(
      `ReplicationChecker: Auto-check timer started (interval: ${this.getAutoCheckFrequency()})`
    );
  }

  /**
   * Stop auto-check timer
   */
  private stopAutoCheck(): void {
    if (this.autoCheckTimer !== null) {
      clearInterval(this.autoCheckTimer);
      this.autoCheckTimer = null;
      Zotero.debug("ReplicationChecker: Auto-check timer stopped");
    }
  }

  /**
   * Check newly added items for replications
   * @param itemIDs Array of newly added item IDs
   */
  async checkNewItems(itemIDs: number[]): Promise<void> {
    try {
      if (!this.shouldCheckNewItems()) {
        Zotero.debug("ReplicationChecker: Received new items but auto-check is disabled");
        return;
      }

      const itemsToCheck: ZoteroItemData[] = [];

      for (const itemID of itemIDs) {
        const item = await Zotero.Items.getAsync(itemID);
        if (!item) continue;

        // Skip attachments and notes
        if (item.isAttachment() || item.isNote()) {
          continue;
        }

        const doi = ZoteroIntegration.extractDOI(item);
        if (doi && this.matcher) {
          const normalizedDoi = this.matcher.normalizeDoi(doi);
          if (normalizedDoi) {
            itemsToCheck.push({
              itemID: itemID,
              doi: normalizedDoi,
              title: item.getField("title") as string,
            });
          }
        }
      }

      if (itemsToCheck.length === 0) {
        return;
      }

      Zotero.debug(`ReplicationChecker: Checking ${itemsToCheck.length} new item(s) for replications`);

      // Check for replications
      const dois = itemsToCheck.map((item) => item.doi);
      const results = await this.matcher!.checkBatch(dois);

      // Process results and show dialog for items with replications
      for (const result of results) {
        if (result.replications.length > 0) {
          const itemData = itemsToCheck.find(
            (item) => item.doi.toLowerCase() === result.doi.toLowerCase()
          );

          if (itemData) {
            await this.showReplicationDialog(itemData.itemID, result.replications);
          }
        }
      }
    } catch (error) {
      Zotero.logError(new Error(
        `Error checking new items: ${error instanceof Error ? error.message : String(error)}`
      ));
    }
  }

  /**
   * Check entire library for replications
   */
  async checkEntireLibrary(): Promise<void> {
    try {
      if (!this.matcher) throw new Error("Matcher not initialized");

      // Show progress
      const progressWin = new Zotero.ProgressWindow();
      progressWin.changeHeadline(getString("replication-checker-progress-checking-library"));
      progressWin.show();
      this.addProgressLine(progressWin, getString("replication-checker-progress-scanning-library"));

      // Get all DOIs from library
      const libraryItems = await ZoteroIntegration.getAllDOIsFromLibrary();
      const uniqueDois = this.getUniqueDOIs(libraryItems);

      this.addProgressLine(
        progressWin,
        getString("replication-checker-progress-found-dois", {
          itemCount: libraryItems.length,
          uniqueCount: uniqueDois.length,
        })
      );
      this.addProgressLine(progressWin, getString("replication-checker-progress-checking-database"));

      // Check for replications
      let results: MatchResult[];
      try {
        results = await this.matcher.checkBatch(uniqueDois);
      } catch (error) {
        progressWin.changeHeadline(getString("replication-checker-progress-failed"));
        this.addProgressLine(progressWin, getString("replication-checker-error-api"));
        progressWin.startCloseTimer(4000);
        this.handleMatchError(error, "library");
        return;
      }

      // Process results - group items by library and check permissions
      const itemsByLibrary = new Map<number, Map<number, any[]>>();
      const processedItems = new Set<number>();

      for (const result of results) {
        if (result.replications.length > 0) {
          const matchingItems = libraryItems.filter(
            (item) => this.matcher!.normalizeDoi(item.doi) === result.doi
          );

          for (const libraryItem of matchingItems) {
            if (!processedItems.has(libraryItem.itemID)) {
              const itemObj = await Zotero.Items.getAsync(libraryItem.itemID);
              if (!itemObj) continue;

              const libraryID = itemObj.libraryID;

              if (!itemsByLibrary.has(libraryID)) {
                itemsByLibrary.set(libraryID, new Map());
              }
              itemsByLibrary.get(libraryID)!.set(libraryItem.itemID, result.replications);
              processedItems.add(libraryItem.itemID);
            }
          }
        }
      }

      // Process each library separately based on permissions
      let matchCount = 0;
      for (const [libraryID, itemsMap] of itemsByLibrary) {
        if (!this.isLibraryEditable(libraryID)) {
          // Read-only library - use special handling
          await this.handleReadOnlyLibrary(itemsMap, libraryID);
          matchCount += itemsMap.size;
        } else {
          // Editable library - use existing flow
          for (const [itemID, replications] of itemsMap) {
            try {
              await this.notifyUserAndAddReplications(itemID, replications);
              matchCount++;
            } catch (error) {
              Zotero.logError(new Error(
                `Error processing item ${itemID}: ${
                  error instanceof Error ? error.message : String(error)
                }`
              ));
            }
          }
        }
      }

      // Update progress
      progressWin.changeHeadline(getString("replication-checker-progress-complete"));
      this.addProgressLine(
        progressWin,
        getString("replication-checker-progress-match-count", {
          count: matchCount,
        })
      );

      progressWin.startCloseTimer(3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Zotero.logError(new Error(`Error checking library: ${errorMsg}`));

      // Show error alert to user
      this.showOperationError("library", errorMsg);
    }
  }

  /**
   * Check selected items for replications
   */
  async checkSelectedItems(): Promise<void> {
    try {
      if (!this.matcher) throw new Error("Matcher not initialized");

      // Get selected DOIs
      const selectedItems = ZoteroIntegration.getSelectedDOIs();
      const uniqueDois = this.getUniqueDOIs(selectedItems);

      if (uniqueDois.length === 0) {
        this.showInfoAlert("replication-checker-alert-no-dois-selected");
        return;
      }

      // Check for replications
      let results: MatchResult[];
      try {
        results = await this.matcher.checkBatch(uniqueDois);
      } catch (error) {
        this.handleMatchError(error, "selected");
        return;
      }

      // Process results - group items by library and check permissions
      const itemsByLibrary = new Map<number, Map<number, any[]>>();
      const processedItems = new Set<number>();

      for (const result of results) {
        if (result.replications.length > 0) {
          const matchingItems = selectedItems.filter(
            (item) => this.matcher!.normalizeDoi(item.doi) === result.doi
          );

          for (const libraryItem of matchingItems) {
            if (!processedItems.has(libraryItem.itemID)) {
              const hasTag = await ZoteroIntegration.hasReplicationTag(libraryItem.itemID);
              if (!hasTag || result.replications.length > 0) {
                const itemObj = await Zotero.Items.getAsync(libraryItem.itemID);
                if (!itemObj) continue;

                const libraryID = itemObj.libraryID;

                if (!itemsByLibrary.has(libraryID)) {
                  itemsByLibrary.set(libraryID, new Map());
                }
                itemsByLibrary.get(libraryID)!.set(libraryItem.itemID, result.replications);
                processedItems.add(libraryItem.itemID);
              }
            }
          }
        }
      }

      // Process each library separately based on permissions
      for (const [libraryID, itemsMap] of itemsByLibrary) {
        if (!this.isLibraryEditable(libraryID)) {
          // Read-only library - use special handling
          await this.handleReadOnlyLibrary(itemsMap, libraryID);
        } else {
          // Editable library - use existing flow
          for (const [itemID, replications] of itemsMap) {
            try {
              await this.notifyUserAndAddReplications(itemID, replications);
            } catch (error) {
              Zotero.logError(new Error(
                `Error processing item ${itemID}: ${
                  error instanceof Error ? error.message : String(error)
                }`
              ));
            }
          }
        }
      }

      // Show results alert
      this.showResultsAlert(results, uniqueDois.length, selectedItems.length, true);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Zotero.logError(new Error(`Error checking selected items: ${errorMsg}`));

      // Show error alert to user
      this.showOperationError("selected", errorMsg);
    }
  }

  /**
   * Check selected collection for replications
   */
  async checkSelectedCollection(): Promise<void> {
    try {
      if (!this.matcher) throw new Error("Matcher not initialized");

      const collection = Zotero.getActiveZoteroPane().getSelectedCollection();
      if (!collection) {
        this.showInfoAlert("replication-checker-alert-no-collection");
        return;
      }

      // Show progress
      const progressWin = new Zotero.ProgressWindow();
      progressWin.changeHeadline(getString("replication-checker-progress-checking-collection"));
      progressWin.show();
      this.addProgressLine(progressWin, getString("replication-checker-progress-scanning-collection"));

      // Get DOIs from collection
      const selectedItems = await ZoteroIntegration.getDOIsFromCollection(collection.id);
      Zotero.debug(`Retrieved ${selectedItems.length} items from collection ${collection.id}`);

      if (!selectedItems || selectedItems.length === 0) {
        progressWin.changeHeadline(getString("replication-checker-progress-complete"));
        this.addProgressLine(progressWin, getString("replication-checker-progress-no-dois"));
        progressWin.startCloseTimer(3000);
        return;
      }

      const uniqueDois = this.getUniqueDOIs(selectedItems);
      this.addProgressLine(
        progressWin,
        getString("replication-checker-progress-found-dois", {
          itemCount: selectedItems.length,
          uniqueCount: uniqueDois.length,
        })
      );

      this.addProgressLine(progressWin, getString("replication-checker-progress-checking-database"));

      // Check for replications
      let results: MatchResult[];
      try {
        results = await this.matcher.checkBatch(uniqueDois);
      } catch (error) {
        progressWin.changeHeadline(getString("replication-checker-progress-failed"));
        this.addProgressLine(progressWin, getString("replication-checker-error-api"));
        progressWin.startCloseTimer(4000);
        this.handleMatchError(error, "collection");
        return;
      }

      // Process results - group items by library and check permissions
      const itemsByLibrary = new Map<number, Map<number, any[]>>();
      const processedItems = new Set<number>();

      for (const result of results) {
        if (result.replications.length > 0) {
          const matchingItems = selectedItems.filter(
            (item) => this.matcher!.normalizeDoi(item.doi) === result.doi
          );

          for (const libraryItem of matchingItems) {
            if (!processedItems.has(libraryItem.itemID)) {
              const hasTag = await ZoteroIntegration.hasReplicationTag(libraryItem.itemID);
              if (!hasTag || result.replications.length > 0) {
                const itemObj = await Zotero.Items.getAsync(libraryItem.itemID);
                if (!itemObj) continue;

                const libraryID = itemObj.libraryID;

                if (!itemsByLibrary.has(libraryID)) {
                  itemsByLibrary.set(libraryID, new Map());
                }
                itemsByLibrary.get(libraryID)!.set(libraryItem.itemID, result.replications);
                processedItems.add(libraryItem.itemID);
              }
            }
          }
        }
      }

      // Process each library separately based on permissions
      let matchCount = 0;
      for (const [libraryID, itemsMap] of itemsByLibrary) {
        if (!this.isLibraryEditable(libraryID)) {
          // Read-only library - use special handling
          await this.handleReadOnlyLibrary(itemsMap, libraryID);
          matchCount += itemsMap.size;
        } else {
          // Editable library - use existing flow
          for (const [itemID, replications] of itemsMap) {
            try {
              await this.notifyUserAndAddReplications(itemID, replications);
              matchCount++;
            } catch (error) {
              Zotero.logError(new Error(
                `Error processing item ${itemID}: ${
                  error instanceof Error ? error.message : String(error)
                }`
              ));
            }
          }
        }
      }

      // Update progress
      progressWin.changeHeadline(getString("replication-checker-progress-complete"));
      this.addProgressLine(
        progressWin,
        getString("replication-checker-progress-match-count", {
          count: matchCount,
        })
      );

      progressWin.startCloseTimer(3000);

      // Show results alert
      this.showResultsAlert(results, uniqueDois.length, selectedItems.length, false, true);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      Zotero.logError(new Error(`Error checking collection: ${errorMsg}`));

      // Show error alert to user
      this.showOperationError("collection", errorMsg);
    }
  }

  /**
   * Show dialog asking user if they want to add replication information
   */
  private async showReplicationDialog(itemID: number, replications: any[]): Promise<void> {
    try {
      const promptWin = this.getPromptWindow();
      if (!promptWin) return;

      const item = await Zotero.Items.getAsync(itemID);
      if (!item) return;

      const itemTitle = item.getField("title") as string;

      // Build message
      let message = `${getString("replication-checker-dialog-intro", { title: itemTitle })}\n\n`;
      message += `${getString("replication-checker-dialog-count", { count: replications.length })}\n\n`;

      for (let i = 0; i < Math.min(replications.length, 3); i++) {
        const rep = replications[i];
        const entry = getString("replication-checker-dialog-item", {
          index: i + 1,
          title: rep.title_r || getString("replication-checker-li-no-title"),
          year: rep.year_r || getString("replication-checker-li-na"),
          outcome: rep.outcome || getString("replication-checker-li-na"),
        });
        message += `${entry}\n\n`;
      }

      if (replications.length > 3) {
        message += `${getString("replication-checker-dialog-more", {
          count: replications.length - 3,
        })}\n\n`;
      }

      message += getString("replication-checker-dialog-question");

      // Show confirmation dialog
      const result = Services.prompt.confirm(promptWin, getString("replication-checker-dialog-title"), message);

      if (result) {
        // User clicked "OK" - add tag and note
        await this.notifyUserAndAddReplications(itemID, replications);

        // Show success message
        const progressWin = new Zotero.ProgressWindow();
        progressWin.changeHeadline(getString("replication-checker-dialog-progress-title"));
        progressWin.show();
        this.addProgressLine(
          progressWin,
          getString("replication-checker-dialog-progress-line", {
            title: itemTitle,
          })
        );

        progressWin.startCloseTimer(3000);

        Zotero.debug(`ReplicationChecker: User accepted replication info for item ${itemID}`);
      } else {
        Zotero.debug(`ReplicationChecker: User declined replication info for item ${itemID}`);
      }
    } catch (error) {
      Zotero.logError(new Error(
        `Error showing replication dialog: ${error instanceof Error ? error.message : String(error)}`
      ));
    }
  }

  /**
   * Notify user and add replications
   * Combines adding tags/notes and creating replication folder entries
   */
  private async notifyUserAndAddReplications(itemID: number, replications: any[]): Promise<void> {
    try {
      // Step 1: Add tags and notes
      await this.notifyUser(itemID, replications);

      // Step 2: Add to replication folder
      await this.addReplicationsToFolder(itemID, replications);
    } catch (error) {
      Zotero.logError(new Error(
        `Error in notifyUserAndAddReplications for item ${itemID}: ${
          error instanceof Error ? error.message : String(error)
        }`
      ));
      throw error;
    }
  }

  /**
   * Notify user about replications found
   * Adds tags and notes to the original item
   */
  private async notifyUser(itemID: number, replications: any[]): Promise<void> {
    try {
      const item = await Zotero.Items.getAsync(itemID);
      if (!item) throw new Error(`Item ${itemID} not found`);

      // Deduplicate replications by doi_r
      const seen = new Set<string>();
      const uniqueReplications = replications.filter((rep: any) => {
        const doi_r = (rep.doi_r || "").trim();
        if (doi_r && !seen.has(doi_r)) {
          seen.add(doi_r);
          return true;
        }
        return false;
      });

      // Add "Has Replication" tag
      await ZoteroIntegration.addTag(itemID, getString("replication-checker-tag"));

      // Add outcome tags
      const outcomeTags: { [key: string]: string } = {
        successful: getString("replication-checker-tag-success"),
        failure: getString("replication-checker-tag-failure"),
        mixed: getString("replication-checker-tag-mixed"),
      };

      const uniqueOutcomes = new Set<string>(
        uniqueReplications
          .map((r: any) => {
            if (!r.outcome || typeof r.outcome !== "string") return null;
            const lower = r.outcome.toLowerCase();
            return lower === "failed" ? "failure" : lower;
          })
          .filter((o: any) => o && Object.keys(outcomeTags).includes(o))
      );

      // Add all tags
      await Promise.all(
        Array.from(uniqueOutcomes).map((outcome) => {
          const label = outcomeTags[outcome];
          return label ? ZoteroIntegration.addTag(itemID, label) : Promise.resolve();
        })
      );

      // Get or create replication note
      const noteIDs = item.getNotes();
      let existingNote = null;
      const noteHeadingHtml = this.getNoteHeadingHtml();

      for (const noteID of noteIDs) {
        const note = await Zotero.Items.getAsync(noteID);
        if (!note) continue;

        const currentNoteHTML = note.getNote();
        if (
          currentNoteHTML.startsWith(noteHeadingHtml) ||
          currentNoteHTML.startsWith("<h2>Replications Found</h2>")
        ) {
          existingNote = note;
          break;
        }
      }

      if (existingNote) {
        // Incremental update
        let currentHTML = existingNote.getNote();
        const parser = new DOMParser();
        const doc = parser.parseFromString(currentHTML, "text/html");
        const ul = doc.querySelector("ul");

        if (!ul) {
          // Malformed note; overwrite
          existingNote.setNote(this.createReplicationNote(uniqueReplications));
          await existingNote.saveTx();
          return;
        }

        // Extract existing DOIs
        const existingLis = Array.from(ul.querySelectorAll("li"));
        const existingDOIs = new Set<string>();
        existingLis.forEach((liElem: any) => {
          const doiA = liElem.querySelector('a[href^="https://doi.org/"]');
          if (doiA) {
            const doi = (doiA as HTMLAnchorElement).href.replace("https://doi.org/", "").trim();
            existingDOIs.add(doi);
          }
        });

        // Append new replications
        let added = false;
        uniqueReplications.forEach((rep: any) => {
          const doi_r = (rep.doi_r || "").trim();
          if (doi_r && !existingDOIs.has(doi_r)) {
            const newLiHTML = this.createReplicationLi(rep);
            ul.insertAdjacentHTML("beforeend", newLiHTML);
            existingDOIs.add(doi_r);
            added = true;
          }
        });

        if (added) {
          const newHTML = (doc.body as HTMLBodyElement).innerHTML;
          existingNote.setNote(String(newHTML));
          await existingNote.saveTx();
        }
      } else {
        // Create new note
        const noteHTML = this.createReplicationNote(uniqueReplications);
        await ZoteroIntegration.addNote(itemID, noteHTML);
      }
    } catch (error) {
      Zotero.logError(
        new Error(
          `Failed to notify user for item ${itemID}: ${error instanceof Error ? error.message : String(error)}`
        )
      );
      throw error;
    }
  }

  /**
   * Add replications to the "Replication folder" collection
   */
  private async addReplicationsToFolder(itemID: number, replications: any[]): Promise<void> {
    try {
      const item = await Zotero.Items.getAsync(itemID);
      if (!item) throw new Error(`Item ${itemID} not found`);

      // Deduplicate by DOI
      const seen = new Set<string>();
      const uniqueReplications = replications.filter((rep: any) => {
        const doi_r = (rep.doi_r || "").trim();
        if (doi_r && !seen.has(doi_r)) {
          seen.add(doi_r);
          return true;
        }
        return false;
      });

      // Get or create replication collection
      const libraryID = item.libraryID;
      let collections = Zotero.Collections.getByLibrary(libraryID, true);
      let replicationCollection = collections.find(
        (c: any) => c.name === "Replication folder" && !c.parentID
      );

      if (!replicationCollection) {
        replicationCollection = new Zotero.Collection({
          libraryID: libraryID,
          name: "Replication folder",
        });
        await replicationCollection.saveTx();
        Zotero.debug(`Created new "Replication folder" collection in library ${libraryID}`);
      }

      // Process replications in transaction
      await Zotero.DB.executeTransaction(async () => {
        for (const rep of uniqueReplications) {
          const doi_r = (rep.doi_r || "").trim();
          if (!doi_r || !doi_r.startsWith("10.")) {
            Zotero.debug(`Skipping invalid or missing DOI for replication: ${doi_r}`);
            continue;
          }

          // Check for duplicate items with the same DOI already in the library
          const search = new Zotero.Search({ libraryID });
          search.addCondition("DOI", "is", doi_r);
          const existingIDs = await search.search();

          // If the replication item already exists in the library, don't create a duplicate.
          // Instead, (a) make sure it's in the "Replication folder" collection and
          // (b) link it as a related item to the original.
          if (existingIDs.length > 0) {
            Zotero.debug(
              `Found existing replication item(s) with DOI ${doi_r}; linking instead of creating duplicate`
            );

            for (const existingID of existingIDs) {
              const existingItem = await Zotero.Items.getAsync(existingID);
              if (!existingItem) continue;

              // Ensure the existing item is in the replication collection
              try {
                await replicationCollection.addItem(existingID);
                Zotero.debug(
                  `Ensured existing replication item ${existingID} is in "Replication folder"`
                );
              } catch (collectionError) {
                Zotero.debug(
                  `Failed to add existing replication item ${existingID} to "Replication folder": ${collectionError}`
                );
              }

              // Add "Is Replication" tag to the existing replication item
              try {
                existingItem.addTag(getString("replication-checker-tag-is-replication"));
                await existingItem.save();
                Zotero.debug(`Added "Is Replication" tag to existing replication item ${existingID}`);
              } catch (tagError) {
                Zotero.debug(`Failed to add tag to existing replication item ${existingID}: ${tagError}`);
              }

              // Link original item and existing replication item as related items (bidirectional)
              try {
                item.addRelatedItem(existingItem);
                existingItem.addRelatedItem(item);
                Zotero.debug(
                  `Added bidirectional related items link: ${itemID} ↔ ${existingID}`
                );

                // Save both items to persist the relationship
                // We're in a transaction, so use save() not saveTx()
                await item.save();
                await existingItem.save();
                Zotero.debug(
                  `Linked original item ${itemID} with existing replication item ${existingID}`
                );
              } catch (linkError) {
                Zotero.debug(
                  `Failed to create related items link between ${itemID} and ${existingID}: ${linkError}`
                );
              }
            }

            continue;
          }

          try {
            // Create new item
            const newItem = new Zotero.Item("journalArticle");
            (newItem as Zotero.Item & { libraryID: number }).libraryID = libraryID;
            newItem.setField("title", rep.title_r || "Untitled Replication");
            newItem.setField("publicationTitle", rep.journal_r || "");
            newItem.setField("volume", rep.volume_r || "");
            newItem.setField("issue", rep.issue_r || "");
            newItem.setField("pages", rep.pages_r || "");
            newItem.setField("date", rep.year_r ? rep.year_r.toString() : "");
            newItem.setField("DOI", doi_r);

            const newItemID = (await newItem.save()) as number;
            Zotero.debug(`Added new replication item with ID ${newItemID} for DOI ${doi_r}`);

            // Add bidirectional "related items" link between original and replication
            try {
              // Add relationship from original to replication and vice versa
              item.addRelatedItem(newItem);
              newItem.addRelatedItem(item);
              Zotero.debug(`Added bidirectional related items link: ${itemID} ↔ ${newItemID}`);

              // Save both items to persist the relationship
              // We're in a transaction, so use save() not saveTx()
              await item.save();
              await newItem.save();
              Zotero.debug(`Linked original item ${itemID} with replication item ${newItemID}`);
            } catch (linkError) {
              Zotero.debug(`Failed to create related items link: ${linkError}`);
              // Don't throw - we still want to add the replication even if linking fails
            }

            // Parse and add authors
            let authors: any[] = [];
            if (rep.author_r) {
              try {
                if (typeof rep.author_r === "string") {
                  authors = JSON.parse(rep.author_r);
                } else if (Array.isArray(rep.author_r)) {
                  authors = rep.author_r;
                }
              } catch (e) {
                Zotero.debug(`Failed to parse authors for DOI ${doi_r}`);
              }
            }

            // Add creators
            if (authors && Array.isArray(authors) && authors.length > 0) {
              const creators: Array<_ZoteroTypes.Item.CreatorJSON> = [];
              for (const author of authors) {
                creators.push({
                  creatorType: "author",
                  firstName: author.given || "",
                  lastName: author.family || "",
                });
              }
              try {
                newItem.setCreators(creators);
                await newItem.save();
              } catch (e) {
                Zotero.debug(`Failed to add creators for DOI ${doi_r}`);
              }
            }

            // Add "Is Replication" tag to the new replication item
            try {
              newItem.addTag(getString("replication-checker-tag-is-replication"));
              await newItem.save();
              Zotero.debug(`Added "Is Replication" tag to new replication item ${newItemID}`);
            } catch (tagError) {
              Zotero.debug(`Failed to add tag to new replication item ${newItemID}: ${tagError}`);
            }

            // Add to collection
            await replicationCollection.addItem(newItemID);
            Zotero.debug(`Added replication item ${newItemID} to "Replication folder"`);
          } catch (error) {
            Zotero.debug(`Error creating replication item for DOI ${doi_r}: ${error}`);
          }
        }
      });
    } catch (error) {
      Zotero.logError(
        new Error(
          `Failed to add replications to folder for item ${itemID}: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      );
      throw error;
    }
  }

  private getNoteHeadingHtml(): string {
    return `<h2>${this.escapeHtml(getString("replication-checker-note-title"))}</h2>`;
  }

  /**
   * Create HTML for a single replication list item
   */
  private createReplicationLi(rep: any): string {
    const title = rep.title_r || getString("replication-checker-li-no-title");
    const year = rep.year_r || getString("replication-checker-li-na");
    const journal = rep.journal_r || getString("replication-checker-li-no-journal");
    const doiValue = rep.doi_r || getString("replication-checker-li-na");
    const doiLabel = this.escapeHtml(getString("replication-checker-li-doi-label"));
    const outcomeLabel = this.escapeHtml(getString("replication-checker-li-outcome"));
    const linkLabel = this.escapeHtml(getString("replication-checker-li-link"));

    let li = "<li>";
    li += `<strong>${this.escapeHtml(title)}</strong><br>`;
    li += `${this.parseAuthors(rep.author_r)} (${this.escapeHtml(year)})<br>`;
    li += `<em>${this.escapeHtml(journal)}</em><br>`;
    li += `${doiLabel} <a href="https://doi.org/${this.escapeHtml(doiValue)}">${this.escapeHtml(doiValue)}</a><br>`;

    if (rep.outcome) {
      li += `${outcomeLabel} <strong>${this.escapeHtml(rep.outcome)}</strong><br>`;
    }

    const link = typeof rep.url_r === "string" ? rep.url_r.trim() : "";
    if (
      rep.doi_r &&
      rep.doi_r.trim().toLowerCase() !== "na" &&
      link &&
      link.toLowerCase() !== "na" &&
      link.startsWith("https")
    ) {
      li += `${linkLabel} <a href="${this.escapeHtml(link)}" target="_blank">${this.escapeHtml(link)}</a><br>`;
    }

    li += "</li>";
    return li;
  }

  /**
   * Format replication data as HTML note
   */
  private createReplicationNote(replications: any[]): string {
    const warning = this.escapeHtml(getString("replication-checker-note-warning"));
    const intro = this.escapeHtml(getString("replication-checker-note-intro"));
    const feedbackHtml = getString("replication-checker-note-feedback", { url: FEEDBACK_URL });
    const footer = this.escapeHtml(getString("replication-checker-note-footer"));

    let html = this.getNoteHeadingHtml();
    html += `<i>${warning}</i><br>`;
    html += `<p>${intro}</p>`;
    html += "<ul>";
    for (const rep of replications) {
      html += this.createReplicationLi(rep);
    }
    html += "</ul>";
    html += `
      <hr/>
      <div style="padding:10px; border-radius:5px; margin-top:15px;">
        <p><strong>${feedbackHtml}</strong></p>
      </div>
    `;
    html += `<p><small>${footer}</small></p>`;
    return html;
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: any): string {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Parse authors array into formatted string
   */
  private parseAuthors(authors: any): string {
    if (!authors || !Array.isArray(authors) || authors.length === 0) {
      return getString("replication-checker-li-no-authors");
    }

    const authorStrings = authors.map((author: any) => {
      const initial = author.given ? author.given.split(" ").map((part: string) => part[0] + ".").join(" ") : "";
      return `${author.family}, ${initial}`;
    });

    return (
      authorStrings.slice(0, -1).join(", ") +
      (authorStrings.length > 1 ? " & " : "") +
      authorStrings.slice(-1)
    );
  }

  /**
   * Show formatted results alert
   */
  private showResultsAlert(
    results: MatchResult[],
    doiCount: number,
    totalItems: number,
    isSelected = false,
    isCollection = false
  ): void {
    const promptWin = this.getPromptWindow();
    if (!promptWin) return;

    const titleKey = isCollection
      ? "replication-checker-results-title-collection"
      : isSelected
        ? "replication-checker-results-title-selected"
        : "replication-checker-results-title-library";

    let message = `${getString(titleKey)}\n`;
    message += `${getString("replication-checker-results-total", { count: totalItems })}\n`;
    message += `${getString("replication-checker-results-dois", { count: doiCount })}\n\n`;

    const matchCount = results.filter((r) => r.replications.length > 0).length;

    const matchKey =
      matchCount > 0 ? "replication-checker-results-found" : "replication-checker-results-none";
    message += `${getString(matchKey, { count: matchCount })}\n`;
    message += getString("replication-checker-results-footer");

    Services.prompt.alert(promptWin, getString("replication-checker-alert-title"), message);
  }

  /**
   * Get unique DOIs from items
   */
  private getUniqueDOIs(items: ZoteroItemData[]): string[] {
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const item of items) {
      const lower = item.doi.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        unique.push(item.doi);
      }
    }

    return unique;
  }

  /**
   * Check if a library is editable
   */
  private isLibraryEditable(libraryID: number): boolean {
    const library = Zotero.Libraries.get(libraryID);
    return library ? library.editable : false;
  }

  /**
   * Copy an item to another library, preserving all bibliographic data
   */
  private async copyItemToLibrary(sourceItemID: number, targetLibraryID: number): Promise<number> {
    const sourceItem = await Zotero.Items.getAsync(sourceItemID);
    if (!sourceItem) throw new Error(`Source item ${sourceItemID} not found`);

    const newItem = new Zotero.Item(sourceItem.itemType as any);
    (newItem as Zotero.Item & { libraryID: number }).libraryID = targetLibraryID;

    // Copy all used fields
    const fields = sourceItem.getUsedFields();
    for (const field of fields) {
      const value = sourceItem.getField(field);
      if (value) {
        newItem.setField(field, value);
      }
    }

    // Copy creators
    const creators = sourceItem.getCreators();
    if (creators.length > 0) {
      newItem.setCreators(creators);
    }

    const newItemID = await newItem.save() as number;
    Zotero.debug(`[ReplicationChecker] Copied item ${sourceItemID} to library ${targetLibraryID} as ${newItemID}`);
    return newItemID;
  }

  /**
   * Create a replication item in a specified library
   */
  private async createReplicationItemInLibrary(replicationData: any, libraryID: number): Promise<number> {
    const newItem = new Zotero.Item("journalArticle");
    (newItem as Zotero.Item & { libraryID: number }).libraryID = libraryID;

    newItem.setField("title", replicationData.title_r || "Untitled Replication");
    newItem.setField("publicationTitle", replicationData.journal_r || "");
    newItem.setField("volume", replicationData.volume_r || "");
    newItem.setField("issue", replicationData.issue_r || "");
    newItem.setField("pages", replicationData.pages_r || "");
    newItem.setField("date", replicationData.year_r?.toString() || "");
    newItem.setField("DOI", replicationData.doi_r || "");

    const newItemID = await newItem.save() as number;

    // Parse and add authors
    if (replicationData.author_r) {
      try {
        const authors = JSON.parse(replicationData.author_r);
        if (Array.isArray(authors)) {
          const creators = authors.map((author: any) => ({
            creatorType: "author" as const,
            firstName: author.given || "",
            lastName: author.family || "",
          }));
          const newItem = await Zotero.Items.getAsync(newItemID);
          if (newItem && creators.length > 0) {
            newItem.setCreators(creators);
            await newItem.save();
          }
        }
      } catch (error) {
        Zotero.logError(new Error(`[ReplicationChecker] Error parsing authors: ${error}`));
      }
    }

    return newItemID;
  }

  /**
   * Handle replications found in a read-only library by copying to Personal library
   */
  private async handleReadOnlyLibrary(
    itemsWithReplications: Map<number, any[]>,
    sourceLibraryID: number
  ): Promise<void> {
    try {
      const promptWin = this.getPromptWindow();
      if (!promptWin) return;

      // Count items and replications
      const itemCount = itemsWithReplications.size;
      let replicationCount = 0;
      for (const replications of itemsWithReplications.values()) {
        replicationCount += replications.length;
      }

      // Show confirmation dialog
      const message = getString("replication-checker-readonly-dialog-message", {
        itemCount: itemCount,
        replicationCount: replicationCount
      });

      const result = Services.prompt.confirm(
        promptWin,
        getString("replication-checker-readonly-dialog-title"),
        message
      );

      if (!result) {
        Zotero.debug("[ReplicationChecker] User declined read-only library copy");
        return;
      }

      // Get Personal library ID
      const personalLibraryID = Zotero.Libraries.userLibraryID;

      // Get source library name
      const sourceLibrary = Zotero.Libraries.get(sourceLibraryID);
      const sourceLibraryName = sourceLibrary ? sourceLibrary.name : "Unknown Library";

      // Get or create "Replication folder" in Personal library (for replications)
      let collections = Zotero.Collections.getByLibrary(personalLibraryID, true);
      let replicationCollection = collections.find(
        (c: any) => c.name === "Replication folder" && !c.parentID
      );

      if (!replicationCollection) {
        replicationCollection = new Zotero.Collection({
          libraryID: personalLibraryID,
          name: "Replication folder",
        });
        await replicationCollection.saveTx();
        Zotero.debug(`[ReplicationChecker] Created "Replication folder" in Personal library`);
      }

      // Get or create collection for originals named "{LibraryName} [Read-Only]"
      const originalsCollectionName = `${sourceLibraryName} [Read-Only]`;
      let originalsCollection = collections.find(
        (c: any) => c.name === originalsCollectionName && !c.parentID
      );

      if (!originalsCollection) {
        originalsCollection = new Zotero.Collection({
          libraryID: personalLibraryID,
          name: originalsCollectionName,
        });
        await originalsCollection.saveTx();
        Zotero.debug(`[ReplicationChecker] Created "${originalsCollectionName}" collection in Personal library`);
        // Refresh collections list after creating new collection
        collections = Zotero.Collections.getByLibrary(personalLibraryID, true);
      }

      // Show progress
      const progressWin = new Zotero.ProgressWindow();
      progressWin.changeHeadline(getString("replication-checker-progress-copying-readonly"));
      progressWin.show();

      // Process each item with transaction
      await Zotero.DB.executeTransaction(async () => {
        for (const [originalItemID, replications] of itemsWithReplications) {
          try {
            const originalItem = await Zotero.Items.getAsync(originalItemID);
            if (!originalItem) continue;

            const originalDOI = ZoteroIntegration.extractDOI(originalItem);

            // Check if original already exists in Personal library
            let copiedOriginalID: number;
            if (originalDOI) {
              const search = new Zotero.Search({ libraryID: personalLibraryID });
              search.addCondition("DOI", "is", originalDOI);
              const existingIDs = await search.search();

              if (existingIDs.length > 0) {
                copiedOriginalID = existingIDs[0];
                Zotero.debug(`[ReplicationChecker] Using existing item ${copiedOriginalID} in Personal library`);
              } else {
                copiedOriginalID = await this.copyItemToLibrary(originalItemID, personalLibraryID);
              }
            } else {
              copiedOriginalID = await this.copyItemToLibrary(originalItemID, personalLibraryID);
            }

            const copiedOriginal = await Zotero.Items.getAsync(copiedOriginalID);

            // Add tags to copied original
            copiedOriginal.addTag(getString("replication-checker-tag"));
            copiedOriginal.addTag(getString("replication-checker-tag-readonly-origin"));
            await copiedOriginal.save();

            // Add original to the read-only library collection (not to Replication folder)
            await originalsCollection.addItem(copiedOriginalID);

            // Deduplicate replications by DOI
            const seen = new Set<string>();
            const uniqueReplications = replications.filter((rep: any) => {
              const doi_r = (rep.doi_r || "").trim();
              if (doi_r && !seen.has(doi_r)) {
                seen.add(doi_r);
                return true;
              }
              return false;
            });

            // Create replication items
            for (const rep of uniqueReplications) {
              const doi_r = (rep.doi_r || "").trim();
              if (!doi_r || !doi_r.startsWith("10.")) continue;

              // Check if replication already exists in Personal library
              const search = new Zotero.Search({ libraryID: personalLibraryID });
              search.addCondition("DOI", "is", doi_r);
              const existingRepIDs = await search.search();

              let replicationItemID: number;
              if (existingRepIDs.length > 0) {
                replicationItemID = existingRepIDs[0];
              } else {
                replicationItemID = await this.createReplicationItemInLibrary(rep, personalLibraryID);
              }

              const replicationItem = await Zotero.Items.getAsync(replicationItemID);

              // Add tags
              replicationItem.addTag(getString("replication-checker-tag-is-replication"));
              replicationItem.addTag(getString("replication-checker-tag-added-by-checker"));
              replicationItem.addTag(getString("replication-checker-tag-readonly-origin"));

              // Add outcome tag
              if (rep.outcome) {
                const outcomeKey = rep.outcome.toLowerCase() === "failed" ? "failure" : rep.outcome.toLowerCase();
                const outcomeTags: { [key: string]: string } = {
                  successful: getString("replication-checker-tag-success"),
                  failure: getString("replication-checker-tag-failure"),
                  mixed: getString("replication-checker-tag-mixed"),
                };
                if (outcomeTags[outcomeKey]) {
                  replicationItem.addTag(outcomeTags[outcomeKey]);
                }
              }

              await replicationItem.save();

              // Link items bidirectionally
              copiedOriginal.addRelatedItem(replicationItem);
              replicationItem.addRelatedItem(copiedOriginal);
              await copiedOriginal.save();
              await replicationItem.save();

              // Add to Replication folder
              await replicationCollection.addItem(replicationItemID);
            }

            this.addProgressLine(progressWin, `Processed: ${originalItem.getField("title")}`);

          } catch (error) {
            Zotero.logError(new Error(`[ReplicationChecker] Error copying item ${originalItemID}: ${error instanceof Error ? error.message : String(error)}`));
          }
        }
      });

      progressWin.changeHeadline(getString("replication-checker-progress-complete"));
      progressWin.startCloseTimer(3000);

    } catch (error) {
      Zotero.logError(new Error(`[ReplicationChecker] Error in handleReadOnlyLibrary: ${error instanceof Error ? error.message : String(error)}`));
      throw error;
    }
  }

  /**
   * Shutdown the plugin
   */
  shutdown(): void {
    // Stop auto-check timer
    this.stopAutoCheck();

    // Remove preference observers
    this.unregisterPreferenceObservers();

    // Unregister notifier
    if (this.notifierID) {
      Zotero.Notifier.unregisterObserver(this.notifierID);
      Zotero.debug("ReplicationChecker: Notifier unregistered");
    }
  }
}

// Export singleton instance
export const replicationChecker = new ReplicationCheckerPlugin();
