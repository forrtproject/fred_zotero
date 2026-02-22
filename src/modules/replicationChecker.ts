/**
 * Main replication checker module
 * Orchestrates the checking workflow, handles UI, and manages item updates
 */

import { APIDataSource } from "./dataSource";
import { BatchMatcher } from "./batchMatcher";
import * as ZoteroIntegration from "../utils/zoteroIntegration";
import type { ZoteroItemData, DOICheckResult, RelatedStudy } from "../types/replication";
import { getString } from "../utils/strings";
import {
  TAG_HAS_REPLICATION, TAG_IS_REPLICATION, TAG_ADDED_BY_CHECKER,
  TAG_REPLICATION_SUCCESS, TAG_REPLICATION_FAILURE, TAG_REPLICATION_MIXED,
  TAG_READONLY_ORIGIN, TAG_HAS_BEEN_REPLICATED, TAG_HAS_BEEN_REPRODUCED,
  TAG_IN_FLORA, TAG_IS_REPRODUCTION, TAG_HAS_REPRODUCTION,
} from "../utils/tags";
import { blacklistManager } from "./blacklistManager";
import { reproductionHandler } from "./reproductionHandler";

const AUTO_CHECK_PREF = "replication-checker.autoCheckFrequency";
const NEW_ITEM_PREF = "replication-checker.autoCheckNewItems";

type LocaleParams = Record<string, string | number>;
const FEEDBACK_URL = "https://tinyurl.com/y5evebv9";
const DATA_ISSUES_URL = "https://forms.gle/Tn2eqasUU1WE86Dq8";

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
  private pluginAddedItems: Set<number> = new Set(); // Track items added by the plugin

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
        ids: (number | string)[]
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
      test: 5 * 60 * 1000, // 5 minutes (for testing only)
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

    // Set up recurring check (starts after first interval)
    this.autoCheckTimer = setInterval(runAutoCheck, interval) as unknown as number;

    Zotero.debug(
      `ReplicationChecker: Auto-check timer started (interval: ${this.getAutoCheckFrequency()}) - first check in ${interval / 1000 / 60} minutes`
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
      const pluginAddedItemsToCheck: Set<number> = new Set();

      for (const itemID of itemIDs) {
        // Track if item was added by plugin, but don't skip it yet
        if (this.pluginAddedItems.has(itemID)) {
          Zotero.debug(`ReplicationChecker: Item ${itemID} was added by plugin - will check for further replications only`);
          pluginAddedItemsToCheck.add(itemID);
          this.pluginAddedItems.delete(itemID); // Remove from tracking set
        }

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

      // Process results and show dialog for items with replications, reproductions, or originals
      for (const result of results) {
        const itemData = itemsToCheck.find(
          (item) => item.doi.toLowerCase() === result.doi.toLowerCase()
        );

        if (!itemData) continue;

        // Check if this item was added by the plugin
        const isPluginAdded = pluginAddedItemsToCheck.has(itemData.itemID);

        // Skip all dialogs for plugin-added items (e.g., from read-only library copy)
        if (isPluginAdded) {
          Zotero.debug(`ReplicationChecker: Skipping dialogs for plugin-added item ${itemData.itemID}`);
          continue;
        }

        if (result.replications.length > 0) {
          await this.showReplicationDialog(itemData.itemID, result.replications);
        } else if (result.originals.length > 0) {
          // No replications but has originals - this is a replication study
          await this.showIsReplicationDialog(itemData.itemID, result);
        }

        // Also process reproductions if found
        if (result.reproductions.length > 0) {
          await this.processReproductionsForItem(itemData.itemID, result.reproductions);
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
      let results: DOICheckResult[];
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
      const itemsWithReproductionsByLibrary = new Map<number, Map<number, RelatedStudy[]>>();
      const processedItems = new Set<number>();
      const processedReproductionItems = new Set<number>();

      for (const result of results) {
        // Process replications
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

        // Process reproductions
        if (result.reproductions.length > 0) {
          const matchingItems = libraryItems.filter(
            (item) => this.matcher!.normalizeDoi(item.doi) === result.doi
          );

          for (const libraryItem of matchingItems) {
            if (!processedReproductionItems.has(libraryItem.itemID)) {
              const itemObj = await Zotero.Items.getAsync(libraryItem.itemID);
              if (!itemObj) continue;

              const libraryID = itemObj.libraryID;

              if (!itemsWithReproductionsByLibrary.has(libraryID)) {
                itemsWithReproductionsByLibrary.set(libraryID, new Map());
              }
              itemsWithReproductionsByLibrary.get(libraryID)!.set(libraryItem.itemID, result.reproductions);
              processedReproductionItems.add(libraryItem.itemID);
            }
          }
        }
      }

      // Process each library separately based on permissions - Replications
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

      // Process each library separately based on permissions - Reproductions
      let reproductionMatchCount = 0;
      for (const [libraryID, itemsMap] of itemsWithReproductionsByLibrary) {
        if (!this.isLibraryEditable(libraryID)) {
          // Read-only library - use special handling for reproductions
          const personalLibraryID = Zotero.Libraries.userLibraryID;
          await reproductionHandler.handleReadOnlyReproductions(itemsMap, libraryID, personalLibraryID);
          reproductionMatchCount += itemsMap.size;
        } else {
          // Editable library - process reproductions
          for (const [itemID, reproductions] of itemsMap) {
            try {
              await this.processReproductionsForItem(itemID, reproductions);
              reproductionMatchCount++;
            } catch (error) {
              Zotero.logError(new Error(
                `Error processing reproductions for item ${itemID}: ${
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
      if (reproductionMatchCount > 0) {
        this.addProgressLine(
          progressWin,
          getString("reproduction-checker-progress-reproductions-found", {
            count: reproductionMatchCount,
          })
        );
      }

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
      let results: DOICheckResult[];
      try {
        results = await this.matcher.checkBatch(uniqueDois);
      } catch (error) {
        this.handleMatchError(error, "selected");
        return;
      }

      // First, check for items that are replications (have originals but no replications)
      for (const result of results) {
        if (result.replications.length === 0 && result.originals.length > 0) {
          const matchingItems = selectedItems.filter(
            (item) => this.matcher!.normalizeDoi(item.doi) === result.doi
          );

          for (const libraryItem of matchingItems) {
            await this.showIsReplicationDialog(libraryItem.itemID, result);
          }
        }
      }

      // Process results - group items by library and check permissions
      const itemsByLibrary = new Map<number, Map<number, any[]>>();
      const itemsWithReproductionsByLibrary = new Map<number, Map<number, RelatedStudy[]>>();
      const processedItems = new Set<number>();
      const processedReproductionItems = new Set<number>();

      for (const result of results) {
        // Process replications
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

        // Process reproductions
        if (result.reproductions.length > 0) {
          const matchingItems = selectedItems.filter(
            (item) => this.matcher!.normalizeDoi(item.doi) === result.doi
          );

          for (const libraryItem of matchingItems) {
            if (!processedReproductionItems.has(libraryItem.itemID)) {
              const itemObj = await Zotero.Items.getAsync(libraryItem.itemID);
              if (!itemObj) continue;

              const libraryID = itemObj.libraryID;

              if (!itemsWithReproductionsByLibrary.has(libraryID)) {
                itemsWithReproductionsByLibrary.set(libraryID, new Map());
              }
              itemsWithReproductionsByLibrary.get(libraryID)!.set(libraryItem.itemID, result.reproductions);
              processedReproductionItems.add(libraryItem.itemID);
            }
          }
        }
      }

      // Process each library separately based on permissions - Replications
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

      // Process each library separately based on permissions - Reproductions
      for (const [libraryID, itemsMap] of itemsWithReproductionsByLibrary) {
        if (!this.isLibraryEditable(libraryID)) {
          // Read-only library - use special handling for reproductions
          const personalLibraryID = Zotero.Libraries.userLibraryID;
          await reproductionHandler.handleReadOnlyReproductions(itemsMap, libraryID, personalLibraryID);
        } else {
          // Editable library - process reproductions
          for (const [itemID, reproductions] of itemsMap) {
            try {
              await this.processReproductionsForItem(itemID, reproductions);
            } catch (error) {
              Zotero.logError(new Error(
                `Error processing reproductions for item ${itemID}: ${
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
      let results: DOICheckResult[];
      try {
        results = await this.matcher.checkBatch(uniqueDois);
      } catch (error) {
        progressWin.changeHeadline(getString("replication-checker-progress-failed"));
        this.addProgressLine(progressWin, getString("replication-checker-error-api"));
        progressWin.startCloseTimer(4000);
        this.handleMatchError(error, "collection");
        return;
      }

      // First, check for items that are replications (have originals but no replications)
      for (const result of results) {
        if (result.replications.length === 0 && result.originals.length > 0) {
          const matchingItems = selectedItems.filter(
            (item) => this.matcher!.normalizeDoi(item.doi) === result.doi
          );

          for (const libraryItem of matchingItems) {
            await this.showIsReplicationDialog(libraryItem.itemID, result);
          }
        }
      }

      // Process results - group items by library and check permissions
      const itemsByLibrary = new Map<number, Map<number, any[]>>();
      const itemsWithReproductionsByLibrary = new Map<number, Map<number, RelatedStudy[]>>();
      const processedItems = new Set<number>();
      const processedReproductionItems = new Set<number>();

      for (const result of results) {
        // Process replications
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

        // Process reproductions
        if (result.reproductions.length > 0) {
          const matchingItems = selectedItems.filter(
            (item) => this.matcher!.normalizeDoi(item.doi) === result.doi
          );

          for (const libraryItem of matchingItems) {
            if (!processedReproductionItems.has(libraryItem.itemID)) {
              const itemObj = await Zotero.Items.getAsync(libraryItem.itemID);
              if (!itemObj) continue;

              const libraryID = itemObj.libraryID;

              if (!itemsWithReproductionsByLibrary.has(libraryID)) {
                itemsWithReproductionsByLibrary.set(libraryID, new Map());
              }
              itemsWithReproductionsByLibrary.get(libraryID)!.set(libraryItem.itemID, result.reproductions);
              processedReproductionItems.add(libraryItem.itemID);
            }
          }
        }
      }

      // Process each library separately based on permissions - Replications
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

      // Process each library separately based on permissions - Reproductions
      let reproductionMatchCount = 0;
      for (const [libraryID, itemsMap] of itemsWithReproductionsByLibrary) {
        if (!this.isLibraryEditable(libraryID)) {
          // Read-only library - use special handling for reproductions
          const personalLibraryID = Zotero.Libraries.userLibraryID;
          await reproductionHandler.handleReadOnlyReproductions(itemsMap, libraryID, personalLibraryID);
          reproductionMatchCount += itemsMap.size;
        } else {
          // Editable library - process reproductions
          for (const [itemID, reproductions] of itemsMap) {
            try {
              await this.processReproductionsForItem(itemID, reproductions);
              reproductionMatchCount++;
            } catch (error) {
              Zotero.logError(new Error(
                `Error processing reproductions for item ${itemID}: ${
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
      if (reproductionMatchCount > 0) {
        this.addProgressLine(
          progressWin,
          getString("reproduction-checker-progress-reproductions-found", {
            count: reproductionMatchCount,
          })
        );
      }

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
   * Add original study for a selected replication item
   * Called from the "Add Original" context menu
   */
  async addOriginalStudy(): Promise<void> {
    try {
      const selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();

      // Only process the first selected item
      if (selectedItems.length === 0) {
        this.showInfoAlert("replication-checker-alert-no-replications-selected");
        return;
      }

      const item = selectedItems[0];

      // Check if item has "Is Replication" or "Is Reproduction" tag
      const isReplication = item.hasTag(TAG_IS_REPLICATION);
      const isReproduction = item.hasTag(TAG_IS_REPRODUCTION);
      if (!isReplication && !isReproduction) {
        this.showInfoAlert("replication-checker-alert-no-replications-selected");
        return;
      }

      const doi = ZoteroIntegration.extractDOI(item);
      if (!doi) {
        this.showInfoAlert("replication-checker-alert-no-doi");
        return;
      }

      if (!this.matcher) throw new Error("Matcher not initialized");

      // Query API for this DOI
      const results = await this.matcher.checkBatch([doi]);

      if (results.length === 0 || results[0].originals.length === 0) {
        this.showInfoAlert("replication-checker-alert-no-originals-available");
        return;
      }

      const result = results[0];
      const originals = result.originals;

      Zotero.debug(`[ReplicationChecker] Found ${originals.length} original(s) for replication ${doi}`);

      // Show single confirmation prompt when there are multiple originals
      if (originals.length > 1) {
        const promptWin = this.getPromptWindow();
        if (!promptWin) return;

        const confirmed = Services.prompt.confirm(
          promptWin,
          getString("replication-checker-dialog-is-replication-title"),
          getString("replication-checker-add-original-confirm", {
            count: originals.length,
          })
        );

        if (!confirmed) {
          Zotero.debug(`[ReplicationChecker] User declined to add ${originals.length} original(s)`);
          return;
        }
      }

      // Get Personal library ID
      const personalLibraryID = Zotero.Libraries.userLibraryID;

      let addedCount = 0;

      // Process each original study
      for (const original of originals) {
        // Check if original already exists in Personal library
        const search = new Zotero.Search({ libraryID: personalLibraryID });
        search.addCondition("DOI", "is", original.doi);
        const existingIDs = await search.search();

        let originalItemID: number;
        let isNewItem = false;
        if (existingIDs.length > 0) {
          originalItemID = existingIDs[0];
          Zotero.debug(`[ReplicationChecker] Using existing original item ${originalItemID}`);
        } else {
          // Create new item from RelatedStudy
          originalItemID = await this.createItemFromRelatedStudy(original, personalLibraryID);
          isNewItem = true;
          Zotero.debug(`[ReplicationChecker] Created new original item ${originalItemID}`);

          // Track this item so we don't auto-check it
          this.pluginAddedItems.add(originalItemID);
        }

        const originalItem = await Zotero.Items.getAsync(originalItemID);
        if (!originalItem) continue;

        // Add tags to original
        await ZoteroIntegration.addTag(originalItemID, TAG_HAS_BEEN_REPLICATED);
        await ZoteroIntegration.addTag(originalItemID, TAG_IN_FLORA);

        // Add "Added by Replication Checker" tag only for newly created items
        if (isNewItem) {
          await ZoteroIntegration.addTag(originalItemID, TAG_ADDED_BY_CHECKER);
        }

        // Create bidirectional relationship
        item.addRelatedItem(originalItem);
        originalItem.addRelatedItem(item);
        await item.saveTx();
        await originalItem.saveTx();

        Zotero.debug(`[ReplicationChecker] Linked replication ${item.id} with original ${originalItemID}`);

        // Create note on original showing ALL replications (not just this one)
        await this.createReplicationNoteForOriginal(originalItemID, original.doi);

        addedCount++;
      }

      // Show single summary message
      if (addedCount === 1) {
        this.showInfoAlert("replication-checker-add-original-success", {
          title: originals[0].title,
        });
      } else if (addedCount > 1) {
        this.showInfoAlert("replication-checker-add-original-batch-success", {
          count: addedCount,
        });
      }

    } catch (error) {
      Zotero.logError(
        new Error(`Error adding original study: ${error instanceof Error ? error.message : String(error)}`)
      );
      this.showOperationError("selected", String(error));
    }
  }

  /**
   * Ban selected replication items
   * Moves items to trash and adds to blacklist
   */
  /**
   * Ban selected items (replications or reproductions)
   * Unified method that handles both types
   */
  async banSelectedItems(): Promise<void> {
    try {
      const selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();

      // Filter for replication or reproduction items
      const itemsToBan = selectedItems.filter((item: Zotero.Item) =>
        item.hasTag(TAG_IS_REPLICATION) ||
        item.hasTag(TAG_IS_REPRODUCTION) ||
        item.hasTag(TAG_ADDED_BY_CHECKER)
      );

      if (itemsToBan.length === 0) {
        this.showInfoAlert("replication-checker-alert-no-replications-selected");
        return;
      }

      // Confirm action
      const promptWin = this.getPromptWindow();
      if (!promptWin) return;

      const message = getString("replication-checker-ban-confirm", {
        count: itemsToBan.length
      });

      const confirmed = Services.prompt.confirm(
        promptWin,
        getString("replication-checker-ban-title"),
        message
      );

      if (!confirmed) return;

      // Process each item
      for (const item of itemsToBan) {
        const doi = ZoteroIntegration.extractDOI(item) || "";
        const url = item.getField("url")?.toString() || "";

        // Determine if this is a replication or reproduction
        const isReproduction = item.hasTag(TAG_IS_REPRODUCTION);
        const entryType = isReproduction ? 'reproduction' : 'replication';

        // Get original paper info from related items
        let originalTitle = "Unknown Original";
        let originalDOI: string | undefined;

        try {
          const relatedKeys = item.relatedItems || [];
          for (const relatedKey of relatedKeys) {
            // Convert item key to item object
            const relatedItem = Zotero.Items.getByLibraryAndKey(item.libraryID, relatedKey);
            if (relatedItem && (relatedItem.hasTag(TAG_HAS_REPLICATION) || relatedItem.hasTag(TAG_HAS_REPRODUCTION))) {
              originalTitle = relatedItem.getField("title") as string;
              originalDOI = ZoteroIntegration.extractDOI(relatedItem) || undefined;

              // Remove the related item link from the original paper
              relatedItem.removeRelatedItem(item);
              await relatedItem.saveTx();
              break;
            }
          }
        } catch (e) {
          Zotero.debug(`ReplicationChecker: Could not process related items for ${item.id}`);
        }

        // Skip if no identifier
        if (!doi && !url) {
          Zotero.debug(`[ReplicationChecker] Skipping item ${item.id} - no DOI or URL`);
          continue;
        }

        // Add to blacklist
        const blacklistEntry = {
          itemID: item.id,
          doi: doi,
          url: url,
          title: item.getField("title") as string,
          originalTitle: originalTitle,
          originalDOI: originalDOI,
          dateAdded: new Date().toISOString(),
          reason: 'manual' as const,
          type: entryType as 'replication' | 'reproduction'
        };

        Zotero.debug(`[ReplicationChecker] Adding to blacklist: ${JSON.stringify(blacklistEntry)}`);
        await blacklistManager.addToBlacklist(blacklistEntry);
        Zotero.debug(`[ReplicationChecker] Successfully added ${doi || url} to blacklist [${entryType}]`);

        // Move to trash
        item.deleted = true;
        await item.saveTx();
      }

      // Show success message
      this.showInfoAlert("replication-checker-ban-success", {
        count: itemsToBan.length
      });

    } catch (error) {
      Zotero.logError(
        new Error(`Error banning replications: ${error instanceof Error ? error.message : String(error)}`)
      );
      this.showOperationError("selected", String(error));
    }
  }

  /**
   * Show dialog when article is a replication (has originals but no replications found)
   */
  private async showIsReplicationDialog(itemID: number, result: DOICheckResult): Promise<void> {
    try {
      const promptWin = this.getPromptWindow();
      if (!promptWin) return;

      const item = await Zotero.Items.getAsync(itemID);
      if (!item) return;

      // Ask user if they want to add the original article(s)
      const confirmed = Services.prompt.confirm(
        promptWin,
        getString("replication-checker-dialog-is-replication-title"),
        getString("replication-checker-dialog-is-replication-message")
      );

      if (!confirmed) {
        Zotero.debug(`[ReplicationChecker] User declined to add original for replication item ${itemID}`);
        return;
      }

      // Tag the current item as "Is Replication"
      await ZoteroIntegration.addTag(itemID, TAG_IS_REPLICATION);
      await ZoteroIntegration.addTag(itemID, TAG_IN_FLORA);
      Zotero.debug(`[ReplicationChecker] Tagged item ${itemID} as "Is Replication"`);

      // Add outcome tag based on aggregated outcomes from all originals
      const outcomes = result.originals
        .map((o) => (o.outcome || "").toLowerCase().trim())
        .filter((o) => o);
      if (outcomes.length > 0) {
        const allSuccessful = outcomes.every((o) => o === "successful" || o === "success");
        const allFailure = outcomes.every((o) => o === "failure" || o === "failed");
        if (allSuccessful) {
          await ZoteroIntegration.addTag(itemID, TAG_REPLICATION_SUCCESS);
        } else if (allFailure) {
          await ZoteroIntegration.addTag(itemID, TAG_REPLICATION_FAILURE);
        } else {
          await ZoteroIntegration.addTag(itemID, TAG_REPLICATION_MIXED);
        }
        Zotero.debug(`[ReplicationChecker] Added outcome tag to replication item ${itemID}`);
      }

      // Get Personal library ID
      const personalLibraryID = Zotero.Libraries.userLibraryID;

      // Process each original study
      for (const original of result.originals) {
        // Check if original already exists in Personal library
        const search = new Zotero.Search({ libraryID: personalLibraryID });
        search.addCondition("DOI", "is", original.doi);
        const existingIDs = await search.search();

        let originalItemID: number;
        if (existingIDs.length > 0) {
          originalItemID = existingIDs[0];
          Zotero.debug(`[ReplicationChecker] Using existing original item ${originalItemID}`);
        } else {
          // Create new item from RelatedStudy
          originalItemID = await this.createItemFromRelatedStudy(original, personalLibraryID);
          Zotero.debug(`[ReplicationChecker] Created new original item ${originalItemID}`);

          // Track this item so we don't auto-check it
          this.pluginAddedItems.add(originalItemID);
        }

        const originalItem = await Zotero.Items.getAsync(originalItemID);
        if (!originalItem) continue;

        // Add tags to original
        await ZoteroIntegration.addTag(originalItemID, TAG_HAS_BEEN_REPLICATED);
        await ZoteroIntegration.addTag(originalItemID, TAG_IN_FLORA);

        // Create bidirectional relationship
        item.addRelatedItem(originalItem);
        originalItem.addRelatedItem(item);
        await item.saveTx();
        await originalItem.saveTx();

        Zotero.debug(`[ReplicationChecker] Linked replication ${item.id} with original ${originalItemID}`);

        // Create note on original showing ALL replications (not just this one)
        await this.createReplicationNoteForOriginal(originalItemID, original.doi);
      }

      // Show success message
      const progressWin = new Zotero.ProgressWindow();
      progressWin.changeHeadline(getString("replication-checker-dialog-progress-title"));
      progressWin.show();
      this.addProgressLine(
        progressWin,
        getString("replication-checker-dialog-progress-line", {
          title: item.getField("title") as string,
        })
      );
      progressWin.startCloseTimer(3000);

    } catch (error) {
      Zotero.logError(new Error(
        `Error showing is-replication dialog: ${error instanceof Error ? error.message : String(error)}`
      ));
    }
  }

  /**
   * Show dialog asking user if they want to add replication information
   */
  private async showReplicationDialog(itemID: number, replications: RelatedStudy[]): Promise<void> {
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
          title: rep.title || getString("replication-checker-li-no-title"),
          year: rep.year || getString("replication-checker-li-na"),
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
   * Process an article that exists in FLoRA database
   * Tags the article based on whether it has replications, is a replication, etc.
   * @param itemID The Zotero item ID
   * @param result The DOICheckResult from the API
   */
  private async processArticleInFLoRA(itemID: number, result: DOICheckResult): Promise<void> {
    try {
      const item = await Zotero.Items.getAsync(itemID);
      if (!item) return;

      Zotero.debug(`[ReplicationChecker] Processing article in FLoRA: ${result.doi}`);

      // Tag the item as being in FLoRA
      await ZoteroIntegration.addTag(itemID, TAG_IN_FLORA);

      // If this article has been replicated (has replications)
      if (result.replications.length > 0) {
        await ZoteroIntegration.addTag(itemID, TAG_HAS_BEEN_REPLICATED);
        Zotero.debug(`[ReplicationChecker] Tagged ${result.doi} as "Has Been Replicated" (${result.replications.length} replications)`);
      }

      // If this article has been reproduced (has reproductions)
      if (result.reproductions.length > 0) {
        await ZoteroIntegration.addTag(itemID, TAG_HAS_BEEN_REPRODUCED);
        Zotero.debug(`[ReplicationChecker] Tagged ${result.doi} as "Has Been Reproduced" (${result.reproductions.length} reproductions)`);
      }

      // If this article is a replication of other studies (has originals)
      if (result.originals.length > 0) {
        await ZoteroIntegration.addTag(itemID, TAG_IS_REPLICATION);
        Zotero.debug(`[ReplicationChecker] Tagged ${result.doi} as "Is Replication" (replicates ${result.originals.length} studies)`);
      }

    } catch (error) {
      Zotero.logError(new Error(
        `Error processing article in FLoRA for item ${itemID}: ${
          error instanceof Error ? error.message : String(error)
        }`
      ));
    }
  }

  /**
   * Convert RelatedStudy[] from new API format to old format for backward compatibility
   */
  private convertRelatedStudiesToOldFormat(studies: RelatedStudy[]): any[] {
    return studies.map((study) => ({
      doi_r: study.doi,
      title_r: study.title,
      author_r: study.authors, // Already in array format
      year_r: study.year,
      journal_r: study.journal,
      volume_r: study.volume,
      issue_r: study.issue,
      pages_r: study.pages,
      outcome: study.outcome,
      url_r: study.url,
      bibtex_ref: study.bibtex_ref,
    }));
  }

  /**
   * Notify user and add replications
   * Combines adding tags/notes and creating replication folder entries
   */
  private async notifyUserAndAddReplications(itemID: number, replications: RelatedStudy[]): Promise<void> {
    try {
      Zotero.debug(`[ReplicationChecker] Processing item ${itemID} with ${replications.length} replications`);

      // Convert new API format to old format for compatibility
      const replicationsOldFormat = this.convertRelatedStudiesToOldFormat(replications);

      // Step 1: Add tags and notes
      await this.notifyUser(itemID, replicationsOldFormat);

      // Step 2: Add to replication folder
      await this.addReplicationsToFolder(itemID, replicationsOldFormat);

      Zotero.debug(`[ReplicationChecker] Completed processing item ${itemID}`);
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
   * Process reproductions for an item
   * Delegates to the reproduction handler module
   */
  private async processReproductionsForItem(itemID: number, reproductions: RelatedStudy[]): Promise<void> {
    try {
      if (reproductions.length === 0) return;

      Zotero.debug(`[ReplicationChecker] Processing item ${itemID} with ${reproductions.length} reproductions`);
      await reproductionHandler.processReproductions(itemID, reproductions);
      Zotero.debug(`[ReplicationChecker] Completed processing reproductions for item ${itemID}`);
    } catch (error) {
      Zotero.logError(new Error(
        `Error processing reproductions for item ${itemID}: ${
          error instanceof Error ? error.message : String(error)
        }`
      ));
      // Don't throw - let replications still work even if reproduction processing fails
    }
  }

  /**
   * Notify user about replications found
   * Adds tags and notes to the original item
   */
  private async notifyUser(itemID: number, replications: any[]): Promise<void> {
    try {
      Zotero.debug(`[ReplicationChecker] notifyUser called for item ${itemID}`);
      const item = await Zotero.Items.getAsync(itemID);
      if (!item) throw new Error(`Item ${itemID} not found`);

      // Deduplicate replications by doi_r, url_r, or title
      const seen = new Set<string>();
      const uniqueReplications = replications.filter((rep: any) => {
        const doi_r = (rep.doi_r || "").trim().toLowerCase();
        const url_r = (rep.url_r || "").trim().toLowerCase();
        const identifier = doi_r || url_r || (rep.title_r || "").trim().toLowerCase();
        if (identifier && !seen.has(identifier)) {
          seen.add(identifier);
          // Also add the other identifier to prevent duplicates from different keys
          if (doi_r && url_r) seen.add(url_r);
          return true;
        }
        // Allow items with no identifiable key (edge case)
        if (!identifier) return true;
        return false;
      });

      if (uniqueReplications.length === 0) {
        Zotero.debug(`ReplicationChecker: No replications for item ${itemID}`);
        return;
      }

      // Add "Has Replication" tag
      await ZoteroIntegration.addTag(itemID, TAG_HAS_REPLICATION);

      // Add outcome tags
      const outcomeTags: { [key: string]: string } = {
        successful: TAG_REPLICATION_SUCCESS,
        failure: TAG_REPLICATION_FAILURE,
        mixed: TAG_REPLICATION_MIXED,
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

        // Extract existing DOIs, URLs, and titles from the note
        const existingLis = Array.from(ul.querySelectorAll("li"));
        const existingIdentifiers = new Set<string>();
        const existingTitles = new Set<string>();
        existingLis.forEach((liElem: any) => {
          const doiA = liElem.querySelector('a[href^="https://doi.org/"]');
          if (doiA) {
            const doi = (doiA as HTMLAnchorElement).href.replace("https://doi.org/", "").trim().toLowerCase();
            if (doi && doi !== "n/a" && doi !== "na") {
              existingIdentifiers.add(doi);
            }
          }
          // Also check for URL links
          const allLinks = liElem.querySelectorAll("a[href]");
          allLinks.forEach((link: HTMLAnchorElement) => {
            const href = link.href.trim().toLowerCase();
            if (href && !href.startsWith("https://doi.org/")) {
              existingIdentifiers.add(href);
            }
          });
          // Extract title from <strong> as fallback identifier
          const strongEl = liElem.querySelector("strong");
          if (strongEl) {
            const titleText = strongEl.textContent?.trim().toLowerCase();
            if (titleText) {
              existingTitles.add(titleText);
            }
          }
        });

        // Append new replications (check DOI, URL, and title for uniqueness)
        let added = false;
        uniqueReplications.forEach((rep: any) => {
          const doi_r = (rep.doi_r || "").trim().toLowerCase();
          const url_r = (rep.url_r || "").trim().toLowerCase();
          const title_r = (rep.title_r || "").trim().toLowerCase();
          const doiExists = doi_r && doi_r !== "na" && doi_r !== "n/a" && existingIdentifiers.has(doi_r);
          const urlExists = url_r && existingIdentifiers.has(url_r);
          const titleExists = title_r && existingTitles.has(title_r);

          if (!doiExists && !urlExists && !titleExists) {
            const newLiHTML = this.createReplicationLi(rep);
            ul.insertAdjacentHTML("beforeend", newLiHTML);
            if (doi_r && doi_r !== "na" && doi_r !== "n/a") existingIdentifiers.add(doi_r);
            if (url_r) existingIdentifiers.add(url_r);
            if (title_r) existingTitles.add(title_r);
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

      // Deduplicate by DOI, URL, or title
      const seen = new Set<string>();
      const uniqueReplications = replications.filter((rep: any) => {
        const doi_r = (rep.doi_r || "").trim().toLowerCase();
        const url_r = (rep.url_r || "").trim().toLowerCase();
        const identifier = doi_r || url_r || (rep.title_r || "").trim().toLowerCase();
        if (identifier && !seen.has(identifier)) {
          seen.add(identifier);
          if (doi_r && url_r) seen.add(url_r);
          return true;
        }
        if (!identifier) return true;
        return false;
      });

      // Filter out blacklisted replications
      const nonBlacklistedReplications = uniqueReplications.filter((rep: any) => {
        const doi_r = (rep.doi_r || "").trim();
        const url_r = (rep.url_r || "").trim();
        if (!doi_r && !url_r) return true;

        if (blacklistManager.isBlacklisted(doi_r, url_r)) {
          Zotero.debug(
            `ReplicationChecker: Skipping blacklisted replication: ${doi_r} (${rep.title_r})`
          );
          return false;
        }
        return true;
      });

      if (nonBlacklistedReplications.length === 0) {
        Zotero.debug(
          `ReplicationChecker: All replications for item ${itemID} are blacklisted, skipping`
        );
        return;
      }

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
        for (const rep of nonBlacklistedReplications) {
          const doi_r = (rep.doi_r || "").trim();

          // Check for duplicate items with the same DOI, URL, or title already in the library
          let existingIDs: number[] = [];
          if (doi_r && doi_r.startsWith("10.")) {
            const search = new Zotero.Search({ libraryID });
            search.addCondition("DOI", "is", doi_r);
            existingIDs = await search.search();
          }

          // If not found by DOI, try to find by URL field
          const url_r = (rep.url_r || "").trim();
          if (existingIDs.length === 0 && url_r) {
            const urlSearch = new Zotero.Search({ libraryID });
            urlSearch.addCondition("url", "is", url_r);
            existingIDs = await urlSearch.search();
          }

          // If still not found, try matching by exact title + "Is Replication" tag
          // This catches items where URL might have been stored differently
          if (existingIDs.length === 0 && rep.title_r) {
            const titleSearch = new Zotero.Search({ libraryID });
            titleSearch.addCondition("title", "is", rep.title_r);
            titleSearch.addCondition("tag", "is", TAG_IS_REPLICATION);
            existingIDs = await titleSearch.search();
          }

          // If the replication item already exists in the library, don't create a duplicate.
          // Instead, (a) make sure it's in the "Replication folder" collection and
          // (b) link it as a related item to the original.
          if (existingIDs.length > 0) {
            Zotero.debug(
              `Found existing replication item(s) with identifier ${doi_r || url_r || rep.title_r}; linking instead of creating duplicate`
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

              // Add "Is Replication", "Added by Replication Checker", and outcome tags to the existing replication item
              try {
                existingItem.addTag(TAG_IS_REPLICATION);
                existingItem.addTag(TAG_ADDED_BY_CHECKER);

                // Add outcome tag based on rep.outcome
                if (rep.outcome) {
                  const outcomeLower = rep.outcome.toLowerCase().trim();
                  if (outcomeLower === "successful" || outcomeLower === "success") {
                    existingItem.addTag(TAG_REPLICATION_SUCCESS);
                  } else if (outcomeLower === "failure" || outcomeLower === "failed") {
                    existingItem.addTag(TAG_REPLICATION_FAILURE);
                  } else if (outcomeLower === "mixed") {
                    existingItem.addTag(TAG_REPLICATION_MIXED);
                  }
                }

                await existingItem.save();
                Zotero.debug(`Added "Is Replication", "Added by Replication Checker", and outcome tags to existing replication item ${existingID}`);
              } catch (tagError) {
                Zotero.debug(`Failed to add tags to existing replication item ${existingID}: ${tagError}`);
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
            // Determine item type from BibTeX if available
            const parsedBibtex = ZoteroIntegration.parseBibtex(rep.bibtex_ref);
            const itemType = parsedBibtex
              ? ZoteroIntegration.bibtexTypeToZoteroType(parsedBibtex.entryType)
              : "journalArticle";

            // Create new item
            const newItem = new Zotero.Item(itemType as any);
            (newItem as Zotero.Item & { libraryID: number }).libraryID = libraryID;
            newItem.setField("title", rep.title_r || "Untitled Replication");
            newItem.setField("date", rep.year_r ? rep.year_r.toString() : "");
            if (doi_r) {
              newItem.setField("DOI", doi_r);
            }
            if (rep.url_r) {
              newItem.setField("url", rep.url_r);
            }

            // Safely set fields that may not exist for all item types (e.g. "document")
            const safeSetField = (field: string, value: any) => {
              if (!value) return;
              try { newItem.setField(field, value); } catch { /* field not valid for this item type */ }
            };
            safeSetField("publicationTitle", rep.journal_r);
            safeSetField("volume", rep.volume_r);
            safeSetField("issue", rep.issue_r);
            safeSetField("pages", rep.pages_r);

            // Fill any missing fields from BibTeX reference
            ZoteroIntegration.fillMissingFieldsFromBibtex(newItem, rep.bibtex_ref);

            const newItemID = (await newItem.save()) as number;
            Zotero.debug(`Added new replication item with ID ${newItemID}${doi_r ? ` for DOI ${doi_r}` : ` (no DOI, title: ${rep.title_r})`}`);

            // Track this item so we don't auto-check it
            this.pluginAddedItems.add(newItemID);

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

            // Add "Is Replication", "Added by Replication Checker", and outcome tags to the new replication item
            try {
              newItem.addTag(TAG_IS_REPLICATION);
              newItem.addTag(TAG_ADDED_BY_CHECKER);

              // Add outcome tag based on rep.outcome
              if (rep.outcome) {
                const outcomeLower = rep.outcome.toLowerCase().trim();
                if (outcomeLower === "successful" || outcomeLower === "success") {
                  newItem.addTag(TAG_REPLICATION_SUCCESS);
                } else if (outcomeLower === "failure" || outcomeLower === "failed") {
                  newItem.addTag(TAG_REPLICATION_FAILURE);
                } else if (outcomeLower === "mixed") {
                  newItem.addTag(TAG_REPLICATION_MIXED);
                }
              }

              await newItem.save();
              Zotero.debug(`Added "Is Replication", "Added by Replication Checker", and outcome tags to new replication item ${newItemID}`);
            } catch (tagError) {
              Zotero.debug(`Failed to add tags to new replication item ${newItemID}: ${tagError}`);
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

    // Only render DOI link when a real DOI is present (starts with "10.")
    if (doiValue && doiValue.startsWith("10.")) {
      li += `${doiLabel} <a href="https://doi.org/${this.escapeHtml(doiValue)}">${this.escapeHtml(doiValue)}</a><br>`;
    }

    if (rep.outcome) {
      li += `${outcomeLabel} <strong>${this.escapeHtml(rep.outcome)}</strong><br>`;
    }

    // Show URL link independently of DOI (matches reproduction handler behavior)
    const link = typeof rep.url_r === "string" ? rep.url_r.trim() : "";
    if (link && link.toLowerCase() !== "na" && link.startsWith("http")) {
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
    const dataIssuesHtml = getString("replication-checker-note-data-issues", { url: DATA_ISSUES_URL });
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
        <p><strong>${dataIssuesHtml}</strong></p>
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
    results: DOICheckResult[],
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

    // Count replications and reproductions
    const replicationCount = results.filter((r) => r.replications.length > 0).length;
    const reproductionCount = results.filter((r) => r.reproductions.length > 0).length;

    // Show replication results
    if (replicationCount > 0) {
      message += `${getString("replication-checker-results-found", { count: replicationCount })}\n`;
    } else {
      message += `${getString("replication-checker-results-none")}\n`;
    }

    // Show reproduction results (use hardcoded strings due to getString() issues with reproduction keys)
    if (reproductionCount > 0) {
      message += `${reproductionCount} item(s) have reproductions.\n`;
    } else {
      message += `No reproductions found.\n`;
    }

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
   * Create a Zotero item from a RelatedStudy object
   * @param study The RelatedStudy from the API
   * @param libraryID The library to create the item in
   * @returns The new item ID
   */
  private async createItemFromRelatedStudy(study: RelatedStudy, libraryID: number): Promise<number> {
    // Determine item type from BibTeX if available
    const parsedBibtex = ZoteroIntegration.parseBibtex(study.bibtex_ref);
    const itemType = parsedBibtex
      ? ZoteroIntegration.bibtexTypeToZoteroType(parsedBibtex.entryType)
      : "journalArticle";

    const newItem = new Zotero.Item(itemType as any);
    (newItem as Zotero.Item & { libraryID: number }).libraryID = libraryID;

    newItem.setField("title", study.title || "Untitled");
    newItem.setField("date", study.year?.toString() || "");
    newItem.setField("DOI", study.doi || "");

    // Safely set fields that may not exist for all item types
    const safeSetField = (field: string, value: any) => {
      if (!value) return;
      try { newItem.setField(field, value); } catch { /* field not valid for this item type */ }
    };
    safeSetField("publicationTitle", study.journal);
    safeSetField("volume", study.volume);
    safeSetField("issue", study.issue);
    safeSetField("pages", study.pages);
    if (study.abstract) {
      safeSetField("abstractNote", study.abstract);
    }

    // Fill any missing fields from BibTeX reference
    ZoteroIntegration.fillMissingFieldsFromBibtex(newItem, study.bibtex_ref);

    const newItemID = await newItem.save() as number;
    Zotero.debug(`[ReplicationChecker] Created item ${newItemID} from RelatedStudy: ${study.doi}`);

    // Add authors
    if (study.authors && Array.isArray(study.authors) && study.authors.length > 0) {
      const creators = study.authors.map((author) => ({
        creatorType: "author" as const,
        firstName: author.given || "",
        lastName: author.family || "",
      }));

      const item = await Zotero.Items.getAsync(newItemID);
      if (item && creators.length > 0) {
        item.setCreators(creators);
        await item.save();
        Zotero.debug(`[ReplicationChecker] Added ${creators.length} authors to item ${newItemID}`);
      }
    }

    return newItemID;
  }

  /**
   * Create a replication note for an original study showing all its replications
   * @param originalItemID The original study item ID
   * @param originalDOI The DOI of the original study
   */
  private async createReplicationNoteForOriginal(originalItemID: number, originalDOI: string): Promise<void> {
    try {
      if (!this.matcher) throw new Error("Matcher not initialized");

      // Query API to get all replications for this original
      const results = await this.matcher.checkBatch([originalDOI]);

      if (results.length === 0 || results[0].replications.length === 0) {
        Zotero.debug(`[ReplicationChecker] No replications found for original ${originalDOI}`);
        return;
      }

      const replications = results[0].replications;

      // Convert RelatedStudy[] to the old format for note creation
      const replicationsForNote = replications.map((rep) => ({
        doi_r: rep.doi,
        title_r: rep.title,
        author_r: rep.authors,
        year_r: rep.year,
        journal_r: rep.journal,
        volume_r: rep.volume,
        issue_r: rep.issue,
        pages_r: rep.pages,
        outcome: rep.outcome,
        url_r: rep.url,
      }));

      // Check if note already exists
      const item = await Zotero.Items.getAsync(originalItemID);
      if (!item) return;

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
        // Update existing note
        const noteHTML = this.createReplicationNote(replicationsForNote);
        existingNote.setNote(noteHTML);
        await existingNote.saveTx();
        Zotero.debug(`[ReplicationChecker] Updated replication note for original ${originalItemID}`);
      } else {
        // Create new note
        const noteHTML = this.createReplicationNote(replicationsForNote);
        await ZoteroIntegration.addNote(originalItemID, noteHTML);
        Zotero.debug(`[ReplicationChecker] Created replication note for original ${originalItemID}`);
      }

    } catch (error) {
      Zotero.logError(new Error(
        `Error creating replication note for original ${originalItemID}: ${
          error instanceof Error ? error.message : String(error)
        }`
      ));
    }
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
    // Determine item type from BibTeX if available
    const parsedBibtex = ZoteroIntegration.parseBibtex(replicationData.bibtex_ref);
    const itemType = parsedBibtex
      ? ZoteroIntegration.bibtexTypeToZoteroType(parsedBibtex.entryType)
      : "journalArticle";

    const newItem = new Zotero.Item(itemType as any);
    (newItem as Zotero.Item & { libraryID: number }).libraryID = libraryID;

    newItem.setField("title", replicationData.title_r || "Untitled Replication");
    newItem.setField("date", replicationData.year_r?.toString() || "");
    if (replicationData.doi_r) {
      newItem.setField("DOI", replicationData.doi_r);
    }
    if (replicationData.url_r) {
      newItem.setField("url", replicationData.url_r);
    }

    // Safely set fields that may not exist for all item types (e.g. "document")
    const safeSetField = (field: string, value: any) => {
      if (!value) return;
      try { newItem.setField(field, value); } catch { /* field not valid for this item type */ }
    };
    safeSetField("publicationTitle", replicationData.journal_r);
    safeSetField("volume", replicationData.volume_r);
    safeSetField("issue", replicationData.issue_r);
    safeSetField("pages", replicationData.pages_r);

    // Fill any missing fields from BibTeX reference
    ZoteroIntegration.fillMissingFieldsFromBibtex(newItem, replicationData.bibtex_ref);

    const newItemID = await newItem.save() as number;

    // Parse and add authors
    if (replicationData.author_r) {
      try {
        // Handle both array format (from new API) and JSON string format (legacy)
        let authors;
        if (Array.isArray(replicationData.author_r)) {
          authors = replicationData.author_r;
        } else if (typeof replicationData.author_r === 'string') {
          authors = JSON.parse(replicationData.author_r);
        }

        if (Array.isArray(authors) && authors.length > 0) {
          const creators = authors.map((author: any) => ({
            creatorType: "author" as const,
            firstName: author.given || "",
            lastName: author.family || "",
          }));
          const savedItem = await Zotero.Items.getAsync(newItemID);
          if (savedItem && creators.length > 0) {
            savedItem.setCreators(creators);
            await savedItem.save();
            Zotero.debug(`[ReplicationChecker] Added ${creators.length} authors to replication item ${newItemID}`);
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

      // Track items that need notes (created outside transaction to avoid nested saveTx)
      const itemsNeedingNotes: Array<{ itemID: number; replications: any[] }> = [];

      // Process each item with transaction
      await Zotero.DB.executeTransaction(async () => {
        for (const [originalItemID, replicationsRaw] of itemsWithReplications) {
          try {
            const originalItem = await Zotero.Items.getAsync(originalItemID);
            if (!originalItem) continue;

            // Convert new API format to old format for compatibility (doi -> doi_r, etc.)
            const replications = this.convertRelatedStudiesToOldFormat(replicationsRaw);

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
                // Track existing item so checkNewItems doesn't trigger dialogs
                this.pluginAddedItems.add(copiedOriginalID);
              } else {
                copiedOriginalID = await this.copyItemToLibrary(originalItemID, personalLibraryID);
                // Track this item so checkNewItems doesn't trigger dialogs
                this.pluginAddedItems.add(copiedOriginalID);
              }
            } else {
              copiedOriginalID = await this.copyItemToLibrary(originalItemID, personalLibraryID);
              // Track this item so checkNewItems doesn't trigger dialogs
              this.pluginAddedItems.add(copiedOriginalID);
            }

            const copiedOriginal = await Zotero.Items.getAsync(copiedOriginalID);

            // Add tags to copied original
            copiedOriginal.addTag(TAG_HAS_REPLICATION);
            copiedOriginal.addTag(TAG_ADDED_BY_CHECKER);
            copiedOriginal.addTag(TAG_READONLY_ORIGIN);
            await copiedOriginal.save();

            // Add original to the read-only library collection (not to Replication folder)
            await originalsCollection.addItem(copiedOriginalID);

            // Deduplicate replications by DOI, URL, or title
            const seen = new Set<string>();
            const uniqueReplications = replications.filter((rep: any) => {
              const doi_r = (rep.doi_r || "").trim().toLowerCase();
              const url_r = (rep.url_r || "").trim().toLowerCase();
              const identifier = doi_r || url_r || (rep.title_r || "").trim().toLowerCase();
              if (identifier && !seen.has(identifier)) {
                seen.add(identifier);
                if (doi_r && url_r) seen.add(url_r);
                return true;
              }
              if (!identifier) return true;
              return false;
            });

            // Filter out blacklisted replications
            const nonBlacklistedReplications = uniqueReplications.filter((rep: any) => {
              const doi_r = (rep.doi_r || "").trim();
              const url_r = (rep.url_r || "").trim();
              if (!doi_r && !url_r) return true;

              if (blacklistManager.isBlacklisted(doi_r, url_r)) {
                Zotero.debug(`[ReplicationChecker] Skipping blacklisted replication: ${doi_r || url_r}`);
                return false;
              }
              return true;
            });

            if (nonBlacklistedReplications.length === 0) {
              Zotero.debug(`[ReplicationChecker] All replications blacklisted for read-only item ${originalItemID}`);
              continue;
            }

            // Create replication items
            for (const rep of nonBlacklistedReplications) {
              const doi_r = (rep.doi_r || "").trim();

              // Check if replication already exists in Personal library by DOI or URL
              let existingRepIDs: number[] = [];
              if (doi_r && doi_r.startsWith("10.")) {
                const search = new Zotero.Search({ libraryID: personalLibraryID });
                search.addCondition("DOI", "is", doi_r);
                existingRepIDs = await search.search();
              }

              // If not found by DOI, try URL
              const url_r = (rep.url_r || "").trim();
              if (existingRepIDs.length === 0 && url_r) {
                const urlSearch = new Zotero.Search({ libraryID: personalLibraryID });
                urlSearch.addCondition("url", "is", url_r);
                existingRepIDs = await urlSearch.search();
              }

              // If still not found, try matching by exact title + tag
              if (existingRepIDs.length === 0 && rep.title_r) {
                const titleSearch = new Zotero.Search({ libraryID: personalLibraryID });
                titleSearch.addCondition("title", "is", rep.title_r);
                titleSearch.addCondition("tag", "is", TAG_IS_REPLICATION);
                existingRepIDs = await titleSearch.search();
              }

              let replicationItemID: number;
              if (existingRepIDs.length > 0) {
                replicationItemID = existingRepIDs[0];
                // Track existing item so checkNewItems doesn't trigger dialogs
                this.pluginAddedItems.add(replicationItemID);
              } else {
                replicationItemID = await this.createReplicationItemInLibrary(rep, personalLibraryID);
                // Track this item so checkNewItems doesn't trigger dialogs
                this.pluginAddedItems.add(replicationItemID);
              }

              const replicationItem = await Zotero.Items.getAsync(replicationItemID);

              // Add tags
              replicationItem.addTag(TAG_IS_REPLICATION);
              replicationItem.addTag(TAG_ADDED_BY_CHECKER);
              replicationItem.addTag(TAG_READONLY_ORIGIN);

              // Add outcome tag
              if (rep.outcome) {
                const outcomeKey = rep.outcome.toLowerCase() === "failed" ? "failure" : rep.outcome.toLowerCase();
                const outcomeTags: { [key: string]: string } = {
                  successful: TAG_REPLICATION_SUCCESS,
                  failure: TAG_REPLICATION_FAILURE,
                  mixed: TAG_REPLICATION_MIXED,
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

            // Track this item for note creation (done outside transaction)
            if (nonBlacklistedReplications.length > 0) {
              itemsNeedingNotes.push({ itemID: copiedOriginalID, replications: nonBlacklistedReplications });
            }

            this.addProgressLine(progressWin, `Processed: ${originalItem.getField("title")}`);

          } catch (error) {
            Zotero.logError(new Error(`[ReplicationChecker] Error copying item ${originalItemID}: ${error instanceof Error ? error.message : String(error)}`));
          }
        }
      });

      // Create notes OUTSIDE the transaction (addNote uses saveTx which can't be nested)
      for (const { itemID, replications } of itemsNeedingNotes) {
        try {
          const noteHTML = this.createReplicationNote(replications);
          await ZoteroIntegration.addNote(itemID, noteHTML);
          Zotero.debug(`[ReplicationChecker] Created replication note for copied original ${itemID}`);
        } catch (noteError) {
          Zotero.debug(`[ReplicationChecker] Failed to create note for item ${itemID}: ${noteError}`);
        }
      }

      // Schedule UI refresh after a short delay to let pending operations complete
      // Using setTimeout instead of direct await to prevent UI blocking
      setTimeout(() => {
        try {
          const zp = Zotero.getActiveZoteroPane();
          if (zp && zp.collectionsView) {
            // Trigger a soft refresh by re-selecting current selection
            const currentRow = (zp.collectionsView as any).selection?.focused;
            if (currentRow !== undefined && currentRow >= 0) {
              (zp.collectionsView as any).selection.select(currentRow);
            }
          }
          Zotero.debug("[ReplicationChecker] UI refresh scheduled after read-only library processing");
        } catch (refreshError) {
          Zotero.debug(`[ReplicationChecker] UI refresh warning: ${refreshError}`);
        }
      }, 500);

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
