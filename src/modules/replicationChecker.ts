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
  TAG_REPLICATION_MULTIPLE_ORIGINALS,
  TAG_READONLY_ORIGIN, TAG_HAS_BEEN_REPLICATED, TAG_HAS_BEEN_REPRODUCED,
  TAG_IN_FLORA, TAG_IS_REPRODUCTION, TAG_HAS_REPRODUCTION,
  getTag, itemHasTag,
} from "../utils/tags";
import { blacklistManager } from "./blacklistManager";
import { reproductionHandler } from "./reproductionHandler";
import {
  buildMultipleOriginalsMap as sharedBuildMultipleOriginalsMap,
  enrichOriginalsWithOutcomes as sharedEnrichOriginalsWithOutcomes,
  createOriginalArticlesNoteHtml as sharedCreateOriginalArticlesNoteHtml,
  addOriginalArticlesNote as sharedAddOriginalArticlesNote,
  escapeHtml,
  parseAuthors,
  copyItemToLibrary,
} from "../utils/studyUtils";
import {
  REPLICATION_SPEC,
  ORIGINALS_REPLICATION_SPEC,
  ORIGINALS_REPRODUCTION_SPEC,
  READONLY_SUFFIX,
  getCollectionFolderName,
  getOrCreateCollection,
  getOrCreateChildCollection,
} from "../utils/collectionUtils";
import { getSelectedCollections, getSelectedLibraryID } from "../utils/zoteroCompat";

const AUTO_CHECK_PREF = "replication-checker.autoCheckFrequency";
const NEW_ITEM_PREF = "replication-checker.autoCheckNewItems";

type LocaleParams = Record<string, string | number>;

/** Locale keys for one kind of study, so the list builder can render either. */
interface StudyListKeys {
  count: string;
  item: string;
  more: string;
  noTitle: string;
  na: string;
}

const REPLICATION_LIST_KEYS: StudyListKeys = {
  count: "replication-checker-dialog-count",
  item: "replication-checker-dialog-item",
  more: "replication-checker-dialog-more",
  noTitle: "replication-checker-li-no-title",
  na: "replication-checker-li-na",
};

const REPRODUCTION_LIST_KEYS: StudyListKeys = {
  count: "reproduction-checker-dialog-count",
  item: "reproduction-checker-dialog-item",
  more: "reproduction-checker-dialog-more",
  noTitle: "reproduction-checker-li-no-title",
  na: "reproduction-checker-li-na",
};
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
  private isAddingOriginals = false; // Guard: suppress auto-check while batch-adding originals

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

      // Share matcher with reproduction handler for multiple-originals checks
      reproductionHandler.setMatcher(this.matcher);

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
          if (this.isAddingOriginals) {
            Zotero.debug("ReplicationChecker: Skipping new-item auto-check (plugin is adding originals)");
            return;
          }
          // Small delay to ensure item is fully saved
          setTimeout(() => {
            if (!this.shouldCheckNewItems()) {
              Zotero.debug("ReplicationChecker: New-item auto-check disabled before execution");
              return;
            }
            if (this.isAddingOriginals) {
              Zotero.debug("ReplicationChecker: Skipping delayed auto-check (plugin is adding originals)");
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
    // addDescription(), not addLines(): addLines() builds an ItemProgress row
    // whose icon is an <img> fed straight from its second argument, so the ""
    // passed here rendered as a broken-image box beside every status line.
    // These lines are plain prose with no item behind them, which is exactly
    // what addDescription() is for.
    progressWin.addDescription(text);
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
        // Track if item was added by this plugin or by the reproduction handler
        if (this.pluginAddedItems.has(itemID)) {
          Zotero.debug(`ReplicationChecker: Item ${itemID} was added by plugin - skipping dialogs`);
          pluginAddedItemsToCheck.add(itemID);
          this.pluginAddedItems.delete(itemID);
        } else if (reproductionHandler.isPluginAddedItem(itemID)) {
          Zotero.debug(`ReplicationChecker: Item ${itemID} was added by reproduction handler - skipping dialogs`);
          pluginAddedItemsToCheck.add(itemID);
          reproductionHandler.untrackPluginAddedItem(itemID);
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

        // One dialog covering whatever was found. Reproductions used to be
        // processed silently after this block, so an item with both was only
        // asked about its replications, and an item with reproductions alone
        // was never asked at all.
        if (result.replications.length > 0 || result.reproductions.length > 0) {
          await this.showStudiesFoundDialog(
            itemData.itemID, result.replications, result.reproductions,
          );
        } else if (result.originals.length > 0) {
          // No replications or reproductions but has originals - this is a replication study
          await this.showIsReplicationDialog(itemData.itemID, result);
        }
      }
    } catch (error) {
      Zotero.logError(new Error(
        `Error checking new items: ${error instanceof Error ? error.message : String(error)}`
      ));
    }
  }

  /**
   * Group API results by the library each matching item lives in, separating
   * replications from reproductions. Each item is recorded at most once per
   * kind, so overlapping results never double-process an item.
   */
  private async groupResultsByLibrary(
    results: DOICheckResult[],
    sourceItems: ZoteroItemData[],
  ): Promise<{
    replications: Map<number, Map<number, RelatedStudy[]>>;
    reproductions: Map<number, Map<number, RelatedStudy[]>>;
  }> {
    const replications = new Map<number, Map<number, RelatedStudy[]>>();
    const reproductions = new Map<number, Map<number, RelatedStudy[]>>();
    const seenReplications = new Set<number>();
    const seenReproductions = new Set<number>();

    const record = async (
      target: Map<number, Map<number, RelatedStudy[]>>,
      seen: Set<number>,
      itemID: number,
      studies: RelatedStudy[],
    ): Promise<void> => {
      if (seen.has(itemID)) return;
      const item = await Zotero.Items.getAsync(itemID);
      if (!item) return;
      if (!target.has(item.libraryID)) target.set(item.libraryID, new Map());
      target.get(item.libraryID)!.set(itemID, studies);
      seen.add(itemID);
    };

    for (const result of results) {
      if (result.replications.length === 0 && result.reproductions.length === 0) continue;

      const matchingItems = sourceItems.filter(
        (item) => this.matcher!.normalizeDoi(item.doi) === result.doi
      );

      for (const { itemID } of matchingItems) {
        if (result.replications.length > 0) {
          await record(replications, seenReplications, itemID, result.replications);
        }
        if (result.reproductions.length > 0) {
          await record(reproductions, seenReproductions, itemID, result.reproductions);
        }
      }
    }

    return { replications, reproductions };
  }

  /**
   * Apply grouped results, routing read-only libraries through the copy-to-
   * Personal-library flow. Returns how many items were processed of each kind.
   */
  private async applyGroupedResults(grouped: {
    replications: Map<number, Map<number, RelatedStudy[]>>;
    reproductions: Map<number, Map<number, RelatedStudy[]>>;
  }): Promise<{ matchCount: number; reproductionMatchCount: number }> {
    let matchCount = 0;
    for (const [libraryID, itemsMap] of grouped.replications) {
      if (!this.isLibraryEditable(libraryID)) {
        await this.handleReadOnlyLibrary(itemsMap, libraryID);
        matchCount += itemsMap.size;
        continue;
      }
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

    let reproductionMatchCount = 0;
    for (const [libraryID, itemsMap] of grouped.reproductions) {
      if (!this.isLibraryEditable(libraryID)) {
        await reproductionHandler.handleReadOnlyReproductions(
          itemsMap, libraryID, Zotero.Libraries.userLibraryID,
        );
        reproductionMatchCount += itemsMap.size;
        continue;
      }
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

    return { matchCount, reproductionMatchCount };
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

      const grouped = await this.groupResultsByLibrary(results, libraryItems);
      const { matchCount, reproductionMatchCount } = await this.applyGroupedResults(grouped);

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

      const grouped = await this.groupResultsByLibrary(results, selectedItems);
      await this.applyGroupedResults(grouped);

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

      // Zotero 10 allows several collections to be selected at once; earlier
      // versions yield at most one. Check every selected collection.
      const collections = getSelectedCollections();
      if (collections.length === 0) {
        // If a library is selected (not a collection), run the full library check
        const selectedLibraryID = getSelectedLibraryID();
        if (selectedLibraryID !== undefined) {
          return this.checkEntireLibrary();
        }
        this.showInfoAlert("replication-checker-alert-no-collection");
        return;
      }

      // Show progress
      const progressWin = new Zotero.ProgressWindow();
      progressWin.changeHeadline(getString("replication-checker-progress-checking-collection"));
      progressWin.show();
      this.addProgressLine(progressWin, getString("replication-checker-progress-scanning-collection"));

      // Get DOIs from every selected collection, deduplicated by item: the same
      // item can sit in more than one of them.
      const byItemID = new Map<number, ZoteroItemData>();
      for (const collection of collections) {
        for (const entry of await ZoteroIntegration.getDOIsFromCollection(collection.id)) {
          byItemID.set(entry.itemID, entry);
        }
      }
      const selectedItems = [...byItemID.values()];
      Zotero.debug(
        `Retrieved ${selectedItems.length} items from ${collections.length} collection(s): ` +
        collections.map((c: any) => c.id).join(", ")
      );

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

      const grouped = await this.groupResultsByLibrary(results, selectedItems);
      const { matchCount, reproductionMatchCount } = await this.applyGroupedResults(grouped);

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

      if (selectedItems.length === 0) {
        this.showInfoAlert("replication-checker-alert-no-replications-selected");
        return;
      }

      const item = selectedItems[0];

      const isReplication = itemHasTag(item, TAG_IS_REPLICATION);
      const isReproduction = itemHasTag(item, TAG_IS_REPRODUCTION);
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

      const results = await this.matcher.checkBatch([doi]);

      if (results.length === 0 || results[0].originals.length === 0) {
        this.showInfoAlert("replication-checker-alert-no-originals-available");
        return;
      }

      const result = results[0];

      // Enrich originals with outcomes so the select dialog shows them correctly
      const enrichedItems = await this.enrichOriginalsWithOutcomes([
        { itemID: item.id, originals: result.originals },
      ]);
      const originals = enrichedItems[0]?.originals ?? result.originals;

      Zotero.debug(`[ReplicationChecker] Found ${originals.length} original(s) for ${doi}`);

      // Determine which originals folder to use
      const originalsSpec = isReplication ? ORIGINALS_REPLICATION_SPEC : ORIGINALS_REPRODUCTION_SPEC;

      // -----------------------------------------------------------------------
      // When there are multiple originals offer three choices:
      //   0 = Add All  |  1 = Cancel  |  2 = Select which to add
      // -----------------------------------------------------------------------
      let originalsToProcess = originals;

      if (originals.length > 1) {
        const promptWin = this.getPromptWindow();
        if (!promptWin) return;

        // BUTTON_POS_0 * BUTTON_TITLE_IS_STRING = 1*127 = 127
        // BUTTON_POS_1 * BUTTON_TITLE_CANCEL   = 256*2 = 512
        // BUTTON_POS_2 * BUTTON_TITLE_IS_STRING = 65536*127 = 8323072
        const buttonFlags = 127 + 512 + 8323072;

        const buttonPressed = (Services.prompt as any).confirmEx(
          promptWin,
          getString("replication-checker-dialog-is-replication-title"),
          getString("replication-checker-add-original-confirm", { count: originals.length }),
          buttonFlags,
          getString("replication-checker-add-original-add-all-btn"),    // button 0: "Add All Originals"
          "",   // button 1: uses BUTTON_TITLE_CANCEL → standard "Cancel" label
          getString("replication-checker-add-original-select-btn"),   // button 2: "Select…"
          "",   // no checkbox label
          {}
        ) as number;

        if (buttonPressed === 1) {
          Zotero.debug(`[ReplicationChecker] User cancelled adding originals`);
          return;
        }

        if (buttonPressed === 2) {
          // Open the selection dialog
          const selected = this.showSelectOriginalsDialog(originals);
          if (selected === null) return; // user cancelled inside dialog
          if (selected.length === 0) return; // nothing checked
          originalsToProcess = selected;
        }
        // buttonPressed === 0 → Add All (originalsToProcess unchanged)
      }

      const targetLibraryID = this.targetLibraryFor(item);
      const originalsCollection = await getOrCreateCollection(targetLibraryID, originalsSpec);
      const folderName = originalsCollection.name;

      let newCount = 0;
      let existingCount = 0;
      let lastOriginal: RelatedStudy | null = null;
      let lastIsNew = false;

      this.isAddingOriginals = true;
      try {
      for (const original of originalsToProcess) {
        // Check if this original already exists in the target library
        const search = new Zotero.Search({ libraryID: targetLibraryID });
        search.addCondition("DOI", "is", original.doi);
        const existingIDs = await search.search();

        let originalItemID: number;
        let isNewItem = false;

        if (existingIDs.length > 0) {
          originalItemID = existingIDs[0];
          existingCount++;
          Zotero.debug(`[ReplicationChecker] Using existing original item ${originalItemID}`);
        } else {
          originalItemID = await this.createItemFromRelatedStudy(original, targetLibraryID);
          isNewItem = true;
          newCount++;
          this.pluginAddedItems.add(originalItemID);
          Zotero.debug(`[ReplicationChecker] Created new original item ${originalItemID}`);
        }

        const originalItem = await Zotero.Items.getAsync(originalItemID);
        if (!originalItem) continue;

        // Tags – apply to both new and existing items (each addTag calls saveTx internally)
        await ZoteroIntegration.addTag(originalItemID, getTag(TAG_HAS_BEEN_REPLICATED));
        await ZoteroIntegration.addTag(originalItemID, getTag(TAG_IN_FLORA));
        if (isNewItem) {
          await ZoteroIntegration.addTag(originalItemID, getTag(TAG_ADDED_BY_CHECKER));
        }

        // Bidirectional relationship
        await this.linkReplicationAndOriginal(item, originalItem);

        // Create/update "Replications Found" note on original
        await this.createReplicationNoteForOriginal(originalItemID, original.doi);

        // Add to originals collection LAST — after all saveTx() calls, and wrapped
        // in its own transaction (required by Zotero's collection.addItem API).
        try {
          await Zotero.DB.executeTransaction(async () => {
            await originalsCollection.addItem(originalItemID);
          });
        } catch (e) {
          Zotero.debug(`[ReplicationChecker] Could not add item ${originalItemID} to "${folderName}": ${e}`);
        }

        lastOriginal = original;
        lastIsNew = isNewItem;
      }
      } finally {
        this.isAddingOriginals = false;
      }

      // Show summary via ProgressWindow (no OS warning icon)
      const total = newCount + existingCount;
      if (total === 0) return;

      const progressWin = new Zotero.ProgressWindow();
      progressWin.changeHeadline(getString("replication-checker-alert-title"));
      progressWin.show();

      if (total === 1 && lastOriginal) {
        const msgKey = lastIsNew
          ? "replication-checker-add-original-success"
          : "replication-checker-add-original-exists";
        this.addProgressLine(progressWin, getString(msgKey, {
          title: lastOriginal.title,
          folderName,
        }));
      } else if (newCount > 0 && existingCount === 0) {
        this.addProgressLine(progressWin, getString(
          "replication-checker-add-original-batch-new-only",
          { count: newCount, folderName }
        ));
      } else if (newCount === 0 && existingCount > 0) {
        this.addProgressLine(progressWin, getString(
          "replication-checker-add-original-batch-exists-only",
          { count: existingCount, folderName }
        ));
      } else {
        this.addProgressLine(progressWin, getString(
          "replication-checker-add-original-batch-success",
          { newCount, existingCount, folderName }
        ));
      }

      progressWin.startCloseTimer(3000);

    } catch (error) {
      this.isAddingOriginals = false;
      Zotero.logError(
        new Error(`Error adding original study: ${error instanceof Error ? error.message : String(error)}`)
      );
      this.showOperationError("selected", String(error));
    }
  }

  /**
   * Open the "Select which originals to add" dialog.
   * Returns the subset of originals the user selected, or null if cancelled.
   */
  private showSelectOriginalsDialog(originals: RelatedStudy[]): RelatedStudy[] | null {
    const mainWin = Zotero.getMainWindow();
    if (!mainWin) return null;

    const args: {
      originals: RelatedStudy[];
      dialogTitle?: string;
      dialogSubtitle?: string;
      cancelled: boolean;
      selectedIndices: number[];
    } = {
      originals,
      dialogTitle: getString("replication-checker-dialog-is-replication-title"),
      dialogSubtitle: getString("replication-checker-add-original-confirm", {
        count: originals.length,
      }),
      cancelled: true,
      selectedIndices: [],
    };

    (mainWin as any).openDialog(
      "chrome://replicationChecker/content/selectOriginalsDialog.xhtml",
      "flora-select-originals",
      "chrome,dialog,centerscreen,modal,resizable",
      args
    );

    if (args.cancelled) return null;
    return args.selectedIndices.map((i) => originals[i]);
  }

  /**
   * Ban selected replication items
   * Moves items to trash and adds to blacklist
   */
  /**
   * Ban selected items (replications or reproductions)
   * Unified method that handles both types
   */
  async banSelectedItems(
    _selectedItemsOverride?: Zotero.Item[],
    _confirmOverride?: boolean,
  ): Promise<void> {
    try {
      const selectedItems = _selectedItemsOverride
        ?? Zotero.getActiveZoteroPane().getSelectedItems();

      // Filter for replication or reproduction items.
      // When an override list is provided (e.g. from tests), trust the caller
      // and skip the tag check so tests don't depend on tag localisation.
      const itemsToBan = _selectedItemsOverride
        ? selectedItems
        : selectedItems.filter((item: Zotero.Item) =>
          itemHasTag(item, TAG_IS_REPLICATION) ||
          itemHasTag(item, TAG_IS_REPRODUCTION)
        );

      if (itemsToBan.length === 0) {
        this.showInfoAlert("replication-checker-alert-no-replications-selected");
        return;
      }

      // Confirm action
      let confirmed: boolean;
      if (_confirmOverride !== undefined) {
        confirmed = _confirmOverride;
      } else {
        const promptWin = this.getPromptWindow();
        const message = getString("replication-checker-ban-confirm", {
          count: itemsToBan.length
        });
        confirmed = Services.prompt.confirm(
          promptWin!,
          getString("replication-checker-ban-title"),
          message
        );
      }

      if (!confirmed) return;

      // Process each item
      for (const item of itemsToBan) {
        const doi = ZoteroIntegration.extractDOI(item) || "";
        const url = item.getField("url")?.toString() || "";

        // Determine if this is a replication or reproduction
        const isReproduction = itemHasTag(item, TAG_IS_REPRODUCTION);
        const entryType = isReproduction ? 'reproduction' : 'replication';

        // Get original paper info from related items
        let originalTitle = "Unknown Original";
        let originalDOI: string | undefined;

        try {
          const relatedKeys = item.relatedItems || [];
          for (const relatedKey of relatedKeys) {
            // Convert item key to item object
            const relatedItem = Zotero.Items.getByLibraryAndKey(item.libraryID, relatedKey);
            if (relatedItem && (itemHasTag(relatedItem, TAG_HAS_REPLICATION) || itemHasTag(relatedItem, TAG_HAS_BEEN_REPLICATED) || itemHasTag(relatedItem, TAG_HAS_REPRODUCTION) || itemHasTag(relatedItem, TAG_HAS_BEEN_REPRODUCED))) {
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

      // Show success message (suppressed when called from tests via override)
      if (!_selectedItemsOverride) {
        this.showInfoAlert("replication-checker-ban-success", {
          count: itemsToBan.length
        });
      }

    } catch (error) {
      Zotero.logError(
        new Error(`Error banning replications: ${error instanceof Error ? error.message : String(error)}`)
      );
      if (!_selectedItemsOverride) {
        this.showOperationError("selected", String(error));
      } else {
        throw error;
      }
    }
  }

  /**
   * Show dialog when article is a replication (has originals but no replications found)
   */
  private async showIsReplicationDialog(itemID: number, result: DOICheckResult): Promise<void> {
    try {
      const item = await Zotero.Items.getAsync(itemID);
      if (!item) return;

      // ── STEP 1: Always tag this item, regardless of user choice ──────────
      await ZoteroIntegration.addTag(itemID, getTag(TAG_IS_REPLICATION));
      await ZoteroIntegration.addTag(itemID, getTag(TAG_IN_FLORA));
      Zotero.debug(`[ReplicationChecker] Tagged item ${itemID} as "Is Replication" / "In FLoRA"`);

      // ── STEP 2: Enrich originals with outcomes ────────────────────────────
      const enrichedItems = await this.enrichOriginalsWithOutcomes([
        { itemID, originals: result.originals },
      ]);
      const originals = enrichedItems[0]?.originals ?? result.originals;

      // Add outcome / multiple-originals tag using enriched data
      if (originals.length > 1) {
        await ZoteroIntegration.addTag(itemID, getTag(TAG_REPLICATION_MULTIPLE_ORIGINALS));
      } else {
        const outcomes = originals
          .map((o) => (o.outcome || "").toLowerCase().trim())
          .filter((o) => o);
        if (outcomes.length > 0) {
          const allSuccessful = outcomes.every((o) => o === "successful" || o === "success");
          const allFailure = outcomes.every((o) => o === "failure" || o === "failed");
          if (allSuccessful) {
            await ZoteroIntegration.addTag(itemID, getTag(TAG_REPLICATION_SUCCESS));
          } else if (allFailure) {
            await ZoteroIntegration.addTag(itemID, getTag(TAG_REPLICATION_FAILURE));
          } else {
            await ZoteroIntegration.addTag(itemID, getTag(TAG_REPLICATION_MIXED));
          }
        }
      }

      // Create "Original Articles" note if multiple originals
      if (originals.length > 1) {
        await this.addOriginalArticlesNote(itemID, originals);
      }

      // ── STEP 3: dialog ───────────────────────────────────────────────────────
      const promptWin = this.getPromptWindow();
      if (!promptWin) return;

      let originalsToProcess = originals;

      if (originals.length === 1) {
        // Single original: simple 2-button dialog — "Add Original" | Cancel
        // BUTTON_POS_0 * IS_STRING = 127
        // BUTTON_POS_1 * CANCEL    = 256 * 2 = 512
        const singleFlags = 127 + 512;
        const singlePressed = (Services.prompt as any).confirmEx(
          promptWin,
          getString("replication-checker-dialog-is-replication-title"),
          getString("replication-checker-dialog-is-replication-message", { count: 1 }),
          singleFlags,
          getString("replication-checker-context-menu-add-original"), // button 0: Add Original
          "",   // button 1: platform Cancel
          "",
          "",
          {}
        ) as number;

        if (singlePressed !== 0) {
          Zotero.debug(`[ReplicationChecker] User cancelled adding single original — tags preserved on item ${itemID}`);
          return;
        }
        // singlePressed === 0 → add the one original (originalsToProcess unchanged)
      } else {
        // Multiple originals: 3-button dialog — "Add All Originals" | "Select which to add" | Cancel
        // BUTTON_POS_0 * IS_STRING = 127
        // BUTTON_POS_1 * IS_STRING = 256 * 127 = 32512
        // BUTTON_POS_2 * CANCEL    = 65536 * 2  = 131072
        const multiFlags = 127 + 32512 + 131072;

        const buttonPressed = (Services.prompt as any).confirmEx(
          promptWin,
          getString("replication-checker-dialog-is-replication-title"),
          getString("replication-checker-dialog-is-replication-message", { count: originals.length }),
          multiFlags,
          getString("replication-checker-add-original-add-all-btn"),  // button 0: Add All Originals
          getString("replication-checker-add-original-select-btn"),   // button 1: Select
          "",   // button 2: platform Cancel label
          "",
          {}
        ) as number;

        if (buttonPressed === 2) {
          Zotero.debug(`[ReplicationChecker] User cancelled adding originals — tags preserved on item ${itemID}`);
          return;
        }

        if (buttonPressed === 1) {
          // "Select which originals to add" → open the same selection dialog
          const selected = this.showSelectOriginalsDialog(originals);
          if (selected === null || selected.length === 0) return;
          originalsToProcess = selected;
        }
        // buttonPressed === 0 → Add All (originalsToProcess unchanged)
      }

      // ── STEP 4: Determine which originals to process ──────────────────────

      // ── STEP 5: Process the chosen originals ──────────────────────────────
      const targetLibraryID = this.targetLibraryFor(item);
      const originalsCollection = await getOrCreateCollection(targetLibraryID, ORIGINALS_REPLICATION_SPEC);
      const originalsFolder = originalsCollection.name;

      let origNewCount = 0;
      let origExistingCount = 0;
      let lastOriginal: RelatedStudy | null = null;
      let lastIsNew = false;

      this.isAddingOriginals = true;
      try {
      for (const original of originalsToProcess) {
        const search = new Zotero.Search({ libraryID: targetLibraryID });
        search.addCondition("DOI", "is", original.doi);
        const existingIDs = await search.search();

        let originalItemID: number;
        let isNewItem = false;
        if (existingIDs.length > 0) {
          originalItemID = existingIDs[0];
          origExistingCount++;
          Zotero.debug(`[ReplicationChecker] Using existing original item ${originalItemID}`);
        } else {
          originalItemID = await this.createItemFromRelatedStudy(original, targetLibraryID);
          isNewItem = true;
          origNewCount++;
          this.pluginAddedItems.add(originalItemID);
          Zotero.debug(`[ReplicationChecker] Created new original item ${originalItemID}`);
        }

        const originalItem = await Zotero.Items.getAsync(originalItemID);
        if (!originalItem) continue;

        // Tags on the original (each addTag calls saveTx internally)
        await ZoteroIntegration.addTag(originalItemID, getTag(TAG_HAS_BEEN_REPLICATED));
        await ZoteroIntegration.addTag(originalItemID, getTag(TAG_IN_FLORA));
        if (isNewItem) {
          await ZoteroIntegration.addTag(originalItemID, getTag(TAG_ADDED_BY_CHECKER));
        }

        // Bidirectional relationship
        await this.linkReplicationAndOriginal(item, originalItem);

        // Note on original
        await this.createReplicationNoteForOriginal(originalItemID, original.doi);

        // Add to originals collection LAST — after all saveTx() calls
        try {
          await Zotero.DB.executeTransaction(async () => {
            await originalsCollection.addItem(originalItemID);
          });
        } catch (e) {
          Zotero.debug(`[ReplicationChecker] Could not add ${originalItemID} to "${originalsFolder}": ${e}`);
        }

        lastOriginal = original;
        lastIsNew = isNewItem;
      }
      } finally {
        this.isAddingOriginals = false;
      }

      // ── STEP 6: Success notification ──────────────────────────────────────
      const total = origNewCount + origExistingCount;
      if (total > 0) {
        const progressWin = new Zotero.ProgressWindow();
        progressWin.changeHeadline(getString("replication-checker-alert-title"));
        progressWin.show();

        let notifMsg: string;
        if (total === 1 && lastOriginal) {
          const msgKey = lastIsNew
            ? "replication-checker-add-original-success"
            : "replication-checker-add-original-exists";
          notifMsg = getString(msgKey, { title: lastOriginal.title, folderName: originalsFolder });
        } else if (origNewCount > 0 && origExistingCount === 0) {
          notifMsg = getString("replication-checker-add-original-batch-new-only", {
            count: origNewCount, folderName: originalsFolder,
          });
        } else if (origNewCount === 0 && origExistingCount > 0) {
          notifMsg = getString("replication-checker-add-original-batch-exists-only", {
            count: origExistingCount, folderName: originalsFolder,
          });
        } else {
          notifMsg = getString("replication-checker-add-original-batch-success", {
            newCount: origNewCount, existingCount: origExistingCount, folderName: originalsFolder,
          });
        }
        this.addProgressLine(progressWin, notifMsg);
        progressWin.startCloseTimer(3000);
      }

    } catch (error) {
      this.isAddingOriginals = false;
      Zotero.logError(new Error(
        `Error showing is-replication dialog: ${error instanceof Error ? error.message : String(error)}`
      ));
    }
  }

  /**
   * Render one "Found N …:" block, listing at most three studies.
   */
  private buildStudyList(studies: RelatedStudy[], keys: StudyListKeys): string {
    let section = `${getString(keys.count, { count: studies.length })}\n\n`;

    for (let i = 0; i < Math.min(studies.length, 3); i++) {
      const study = studies[i];
      section += `${getString(keys.item, {
        index: i + 1,
        title: study.title || getString(keys.noTitle),
        year: study.year || getString(keys.na),
        outcome: study.outcome || getString(keys.na),
      })}\n\n`;
    }

    if (studies.length > 3) {
      section += `${getString(keys.more, { count: studies.length - 3 })}\n\n`;
    }

    return section;
  }

  /**
   * Ask whether to add the studies FLoRA found for an item.
   *
   * An item can be both replicated and reproduced. This dialog used to list
   * replications only, while reproductions were processed silently behind it —
   * so a user was asked about one thing and handed another, and an item with
   * reproductions but no replications got no dialog at all. Both kinds are now
   * listed, and the single answer governs both.
   *
   * The replication-only wording is kept verbatim so the existing translations
   * still apply; anything involving reproductions uses a neutral set of strings.
   */
  private async showStudiesFoundDialog(
    itemID: number,
    replications: RelatedStudy[],
    reproductions: RelatedStudy[],
  ): Promise<void> {
    try {
      const hasReplications = replications.length > 0;
      const hasReproductions = reproductions.length > 0;
      if (!hasReplications && !hasReproductions) return;

      const promptWin = this.getPromptWindow();
      if (!promptWin) return;

      const item = await Zotero.Items.getAsync(itemID);
      if (!item) return;

      const itemTitle = item.getField("title") as string;

      // Single-kind cases reuse the wording that already exists (and is already
      // translated) for that kind. Only the mixed case needs neutral strings.
      const hasBoth = hasReplications && hasReproductions;
      const pick = (both: string, repro: string, repl: string) =>
        hasBoth ? both : hasReproductions ? repro : repl;

      const title = getString(pick(
        "replication-checker-dialog-title-studies",
        "reproduction-checker-dialog-title",
        "replication-checker-dialog-title",
      ));

      let message = `${getString(pick(
        "replication-checker-dialog-intro-studies",
        "reproduction-checker-dialog-intro",
        "replication-checker-dialog-intro",
      ), { title: itemTitle })}\n\n`;

      if (hasReplications) {
        message += this.buildStudyList(replications, REPLICATION_LIST_KEYS);
      }
      if (hasReproductions) {
        message += this.buildStudyList(reproductions, REPRODUCTION_LIST_KEYS);
      }

      message += getString(pick(
        "replication-checker-dialog-question-studies",
        "reproduction-checker-dialog-question",
        "replication-checker-dialog-question",
      ));

      if (!Services.prompt.confirm(promptWin, title, message)) {
        // Declining now skips reproductions too. Previously they were written
        // regardless of the answer, which made "Cancel" only half true.
        Zotero.debug(`ReplicationChecker: User declined study info for item ${itemID}`);
        return;
      }

      const progressWin = new Zotero.ProgressWindow();
      progressWin.changeHeadline(getString("replication-checker-dialog-progress-title"));
      progressWin.show();

      if (hasReplications) {
        const { newCount, existingCount, folderName } =
          await this.notifyUserAndAddReplications(itemID, replications);

        let notifMsg: string;
        if (newCount > 0 && existingCount === 0) {
          notifMsg = getString("replication-checker-notif-replication-new", {
            count: newCount, folderName,
          });
        } else if (newCount === 0 && existingCount > 0) {
          notifMsg = getString("replication-checker-notif-replication-exists", {
            count: existingCount, folderName,
          });
        } else if (newCount > 0 && existingCount > 0) {
          notifMsg = getString("replication-checker-notif-replication-mixed", {
            newCount, existingCount, folderName,
          });
        } else {
          notifMsg = getString("replication-checker-dialog-progress-line", { title: itemTitle });
        }
        this.addProgressLine(progressWin, notifMsg);
      }

      if (hasReproductions) {
        await this.processReproductionsForItem(itemID, reproductions);
        this.addProgressLine(progressWin, getString(
          "reproduction-checker-dialog-progress-line", { title: itemTitle },
        ));
      }

      progressWin.startCloseTimer(3000);
      Zotero.debug(`ReplicationChecker: User accepted study info for item ${itemID}`);
    } catch (error) {
      Zotero.logError(new Error(
        `Error showing studies dialog: ${error instanceof Error ? error.message : String(error)}`
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
      outcome_quote: study.outcome_quote,
      outcome_quote_source: study.outcome_quote_source,
      url_r: study.url,
      bibtex_ref: study.bibtex_ref,
    }));
  }

  /**
   * Notify user and add replications
   * Combines adding tags/notes and creating replication folder entries
   */
  private async notifyUserAndAddReplications(
    itemID: number,
    replications: RelatedStudy[],
  ): Promise<{ newCount: number; existingCount: number; folderName: string }> {
    try {
      Zotero.debug(`[ReplicationChecker] Processing item ${itemID} with ${replications.length} replications`);

      // Convert new API format to old format for compatibility
      const replicationsOldFormat = this.convertRelatedStudiesToOldFormat(replications);

      // Step 1: Add tags and notes
      await this.notifyUser(itemID, replicationsOldFormat);

      // Step 2: Add to replication folder (returns new/existing counts)
      const counts = await this.addReplicationsToFolder(itemID, replicationsOldFormat);

      Zotero.debug(`[ReplicationChecker] Completed processing item ${itemID}`);
      return counts;
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

      // Add "Has Been Replicated" tag
      await ZoteroIntegration.addTag(itemID, getTag(TAG_HAS_BEEN_REPLICATED));

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
          return label ? ZoteroIntegration.addTag(itemID, getTag(label)) : Promise.resolve();
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
        const currentHTML = existingNote.getNote();
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
   * Add replications to the replication folder collection
   */
  private async addReplicationsToFolder(
    itemID: number,
    replications: any[],
  ): Promise<{ newCount: number; existingCount: number; folderName: string }> {
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
        return { newCount: 0, existingCount: 0, folderName: "" };
      }

      // Pre-check: find which replication DOIs have multiple originals (batch API call)
      const repDoisForCheck = nonBlacklistedReplications
        .map((rep: any) => (rep.doi_r || "").trim())
        .filter((doi: string) => doi && doi.startsWith("10."));
      const multipleOriginalsMap = await this.buildMultipleOriginalsMap(repDoisForCheck);
      // Track replication items that need an "Original Articles" note
      const itemsNeedingOriginalNotes: Array<{ itemID: number; originals: RelatedStudy[] }> = [];

      // Get or create replication collection
      const libraryID = item.libraryID;
      const replicationCollection = await getOrCreateCollection(libraryID, REPLICATION_SPEC);
      const folderName = replicationCollection.name;

      let newCount = 0;
      let existingCount = 0;

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
            titleSearch.addCondition("tag", "is", getTag(TAG_IS_REPLICATION));
            existingIDs = await titleSearch.search();
          }

          // If the replication item already exists in the library, don't create a duplicate.
          // Instead, (a) make sure it's in the replication folder collection and
          // (b) link it as a related item to the original.
          if (existingIDs.length > 0) {
            existingCount++;
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
                  `Ensured existing replication item ${existingID} is in "${folderName}"`
                );
              } catch (collectionError) {
                Zotero.debug(
                  `Failed to add existing replication item ${existingID} to "${folderName}": ${collectionError}`
                );
              }

              // Add "Is Replication", "Added by Replication Checker", and outcome/multiple-originals tags
              try {
                existingItem.addTag(getTag(TAG_IS_REPLICATION));
                existingItem.addTag(getTag(TAG_ADDED_BY_CHECKER));

                const normDoi = this.matcher ? this.matcher.normalizeDoi(doi_r) : doi_r.toLowerCase();
                const multipleOriginals = multipleOriginalsMap.get(normDoi);
                if (multipleOriginals) {
                  existingItem.addTag(getTag(TAG_REPLICATION_MULTIPLE_ORIGINALS));
                  itemsNeedingOriginalNotes.push({ itemID: existingID, originals: multipleOriginals });
                } else if (rep.outcome) {
                  const outcomeLower = rep.outcome.toLowerCase().trim();
                  if (outcomeLower === "successful" || outcomeLower === "success") {
                    existingItem.addTag(getTag(TAG_REPLICATION_SUCCESS));
                  } else if (outcomeLower === "failure" || outcomeLower === "failed") {
                    existingItem.addTag(getTag(TAG_REPLICATION_FAILURE));
                  } else if (outcomeLower === "mixed") {
                    existingItem.addTag(getTag(TAG_REPLICATION_MIXED));
                  }
                }

                await existingItem.save();
                Zotero.debug(`Added tags to existing replication item ${existingID}`);
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

            // Add extra field — for multiple-originals items use a redirect message
            const normDoi = this.matcher ? this.matcher.normalizeDoi(doi_r) : doi_r.toLowerCase();
            const multipleOriginals = multipleOriginalsMap.get(normDoi);
            let extraInfo = "";
            if (multipleOriginals) {
              extraInfo = "For more details read the Original Article.";
            } else {
              if (rep.outcome) {
                extraInfo += `Replication Outcome: ${rep.outcome}\n`;
              }
              if (rep.outcome_quote && rep.outcome_quote_source === "abstract") {
                extraInfo += `Outcome Quote: ${rep.outcome_quote}\n`;
              }
            }
            if (extraInfo) {
              newItem.setField("extra", extraInfo.trim());
            }

            // After Extra: falls back to an "Extra" line for item types with no DOI field
            ZoteroIntegration.setDOI(newItem, doi_r);

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
                const firstName = author.given || "";
                const lastName = author.family || "";
                if (firstName === "" && lastName === "") continue;
                creators.push({
                  creatorType: "author",
                  firstName,
                  lastName,
                });
              }
              try {
                newItem.setCreators(creators);
                await newItem.save();
              } catch (e) {
                Zotero.debug(`Failed to add creators for DOI ${doi_r}`);
              }
            }

            // Add "Is Replication", "Added by Replication Checker", and outcome/multiple-originals tags
            try {
              newItem.addTag(getTag(TAG_IS_REPLICATION));
              newItem.addTag(getTag(TAG_ADDED_BY_CHECKER));

              if (multipleOriginals) {
                newItem.addTag(getTag(TAG_REPLICATION_MULTIPLE_ORIGINALS));
                itemsNeedingOriginalNotes.push({ itemID: newItemID, originals: multipleOriginals });
              } else if (rep.outcome) {
                const outcomeLower = rep.outcome.toLowerCase().trim();
                if (outcomeLower === "successful" || outcomeLower === "success") {
                  newItem.addTag(getTag(TAG_REPLICATION_SUCCESS));
                } else if (outcomeLower === "failure" || outcomeLower === "failed") {
                  newItem.addTag(getTag(TAG_REPLICATION_FAILURE));
                } else if (outcomeLower === "mixed") {
                  newItem.addTag(getTag(TAG_REPLICATION_MIXED));
                }
              }

              await newItem.save();
              Zotero.debug(`Added tags to new replication item ${newItemID}`);
            } catch (tagError) {
              Zotero.debug(`Failed to add tags to new replication item ${newItemID}: ${tagError}`);
            }

            // Add to collection
            await replicationCollection.addItem(newItemID);
            newCount++;
            Zotero.debug(`Added replication item ${newItemID} to "${folderName}"`);
          } catch (error) {
            Zotero.debug(`Error creating replication item for DOI ${doi_r}: ${error}`);
          }
        }
      });

      // Enrich originals with outcomes (one batch API call) then create notes
      if (itemsNeedingOriginalNotes.length > 0) {
        const enriched = await this.enrichOriginalsWithOutcomes(itemsNeedingOriginalNotes);
        for (const { itemID: repItemID, originals } of enriched) {
          await this.addOriginalArticlesNote(repItemID, originals);
        }
      }

      return { newCount, existingCount, folderName };
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

  /**
   * Batch-check a list of DOIs and return a map of normalized DOI → originals[]
   * for entries where originals.length > 1 (i.e., the study has multiple originals).
   */
  private async buildMultipleOriginalsMap(
    dois: string[],
  ): Promise<Map<string, RelatedStudy[]>> {
    if (!this.matcher) return new Map();
    return sharedBuildMultipleOriginalsMap(this.matcher, dois, "[ReplicationChecker]");
  }

  private async enrichOriginalsWithOutcomes(
    items: Array<{ itemID: number; originals: RelatedStudy[] }>,
  ): Promise<Array<{ itemID: number; originals: RelatedStudy[] }>> {
    if (!this.matcher) return items;
    return sharedEnrichOriginalsWithOutcomes(this.matcher, items, "replications", "[ReplicationChecker]");
  }

  private createOriginalArticlesNoteHtml(originals: RelatedStudy[]): string {
    return sharedCreateOriginalArticlesNoteHtml(originals, "Replication", FEEDBACK_URL, DATA_ISSUES_URL);
  }

  private async addOriginalArticlesNote(
    itemID: number,
    originals: RelatedStudy[],
  ): Promise<void> {
    return sharedAddOriginalArticlesNote(
      itemID,
      originals,
      (o) => this.createOriginalArticlesNoteHtml(o),
      "[ReplicationChecker]",
    );
  }

  private getNoteHeadingHtml(): string {
    return `<h2>${escapeHtml(getString("replication-checker-note-title"))}</h2>`;
  }

  /**
   * Create HTML for a single replication list item
   */
  private createReplicationLi(rep: any): string {
    const title = rep.title_r || getString("replication-checker-li-no-title");
    const year = rep.year_r || getString("replication-checker-li-na");
    const journal = rep.journal_r || getString("replication-checker-li-no-journal");
    const doiValue = rep.doi_r || getString("replication-checker-li-na");
    const doiLabel = escapeHtml(getString("replication-checker-li-doi-label"));
    const outcomeLabel = escapeHtml(getString("replication-checker-li-outcome"));
    const linkLabel = escapeHtml(getString("replication-checker-li-link"));

    let li = "<li>";
    li += `<strong>${escapeHtml(title)}</strong><br>`;
    li += `${parseAuthors(rep.author_r, "replication-checker-li-no-authors")} (${escapeHtml(year)})<br>`;
    li += `<em>${escapeHtml(journal)}</em><br>`;

    // Only render DOI link when a real DOI is present (starts with "10.")
    if (doiValue && doiValue.startsWith("10.")) {
      li += `${doiLabel} <a href="https://doi.org/${escapeHtml(doiValue)}">${escapeHtml(doiValue)}</a><br>`;
    }

    if (rep.outcome) {
      li += `${outcomeLabel} <strong>${escapeHtml(rep.outcome)}</strong><br>`;
    }

    if (rep.outcome_quote && rep.outcome_quote_source === "abstract") {
      li += `<em>"${escapeHtml(rep.outcome_quote)}"</em><br>`;
    }

    // Show URL link independently of DOI (matches reproduction handler behavior)
    const link = typeof rep.url_r === "string" ? rep.url_r.trim() : "";
    if (link && link.toLowerCase() !== "na" && link.startsWith("http")) {
      li += `${linkLabel} <a href="${escapeHtml(link)}" target="_blank">${escapeHtml(link)}</a><br>`;
    }

    li += "</li>";
    return li;
  }

  /**
   * Format replication data as HTML note
   */
  private createReplicationNote(replications: any[]): string {
    const warning = escapeHtml(getString("replication-checker-note-warning"));
    const intro = escapeHtml(getString("replication-checker-note-intro"));
    const feedbackHtml = getString("replication-checker-note-feedback", { url: FEEDBACK_URL });
    const dataIssuesHtml = getString("replication-checker-note-data-issues", { url: DATA_ISSUES_URL });
    const footer = escapeHtml(getString("replication-checker-note-footer"));

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
    const mainWin = Zotero.getMainWindow();
    if (!mainWin) return;

    const titleKey = isCollection
      ? "replication-checker-results-title-collection"
      : isSelected
        ? "replication-checker-results-title-selected"
        : "replication-checker-results-title-library";

    const heading = getString(titleKey);
    let message = `${getString("replication-checker-results-total", { count: totalItems })}\n`;
    message += `${getString("replication-checker-results-dois", { count: doiCount })}\n\n`;

    const replicationCount = results.filter((r) => r.replications.length > 0).length;
    const reproductionCount = results.filter((r) => r.reproductions.length > 0).length;

    const replicationFolderName = getCollectionFolderName(REPLICATION_SPEC);
    const reproductionFolderName = reproductionHandler.getReproductionFolderName();

    if (replicationCount > 0) {
      message += `${getString("replication-checker-results-found", {
        count: replicationCount,
        folderName: replicationFolderName,
      })}\n`;
    } else {
      message += `${getString("replication-checker-results-none")}\n`;
    }

    if (reproductionCount > 0) {
      message += `${getString("replication-checker-results-reproductions-found", {
        count: reproductionCount,
        folderName: reproductionFolderName,
      })}\n`;
    } else {
      message += `${getString("replication-checker-results-reproductions-none")}\n`;
    }

    message += getString("replication-checker-results-footer");

    // Open the custom results dialog (shows plugin icon, not OS warning triangle)
    (mainWin as any).openDialog(
      "chrome://replicationChecker/content/resultsDialog.xhtml",
      "flora-results",
      "chrome,dialog,centerscreen,modal",
      { title: getString("replication-checker-alert-title"), heading, message }
    );
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
   * Library that "Add Original" should write the original into.
   *
   * Originals belong beside the replication that cites them, so this is the
   * replication's own library whenever Zotero will accept writes there. Only a
   * read-only group library forces the copy into Personal — previously *every*
   * original landed in Personal, which scattered group-library work across two
   * libraries and broke the linking below (#100).
   */
  private targetLibraryFor(item: Zotero.Item): number {
    return this.isLibraryEditable(item.libraryID)
      ? item.libraryID
      : Zotero.Libraries.userLibraryID;
  }

  /**
   * Relate a replication and its original to each other, in both directions.
   *
   * Zotero rejects relations that cross a library boundary, and saving an item
   * that lives in a read-only group library throws. Both happen when the
   * original had to go to Personal because the replication's library is
   * read-only, so skip the link there instead of letting the exception abort
   * the whole "Add Original" run (#100).
   */
  private async linkReplicationAndOriginal(
    replication: Zotero.Item,
    original: Zotero.Item,
  ): Promise<void> {
    if (replication.libraryID !== original.libraryID) {
      Zotero.debug(
        `[ReplicationChecker] Not relating ${replication.id} ↔ ${original.id}: ` +
        `different libraries (${replication.libraryID} vs ${original.libraryID})`
      );
      return;
    }
    try {
      replication.addRelatedItem(original);
      original.addRelatedItem(replication);
      await replication.saveTx();
      await original.saveTx();
      Zotero.debug(`[ReplicationChecker] Linked replication ${replication.id} ↔ original ${original.id}`);
    } catch (error) {
      Zotero.debug(`[ReplicationChecker] Could not relate ${replication.id} ↔ ${original.id}: ${error}`);
    }
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
    // Falls back to an "Extra" line for item types with no DOI field
    ZoteroIntegration.setDOI(newItem, study.doi);

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

    // Set creators before the first save so the item is fully populated in a
    // single saveTx() call — this fires the item-add notifier exactly once,
    // preventing a second notifier fire from bypassing pluginAddedItems guards.
    if (study.authors && Array.isArray(study.authors) && study.authors.length > 0) {
      const creators = study.authors
        .map((author) => ({
          creatorType: "author" as const,
          firstName: author.given || "",
          lastName: author.family || "",
        }))
        .filter((c) => c.firstName !== "" || c.lastName !== "");
      if (creators.length > 0) {
        newItem.setCreators(creators);
      }
    }

    const newItemID = await newItem.saveTx() as number;
    Zotero.debug(`[ReplicationChecker] Created item ${newItemID} from RelatedStudy: ${study.doi}`);

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
        outcome_quote: rep.outcome_quote,
        outcome_quote_source: rep.outcome_quote_source,
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

    // Add extra field with outcome info
    let extraInfo = "";
    if (replicationData.outcome) {
      extraInfo += `Replication Outcome: ${replicationData.outcome}\n`;
    }
    if (replicationData.outcome_quote && replicationData.outcome_quote_source === "abstract") {
      extraInfo += `Outcome Quote: ${replicationData.outcome_quote}\n`;
    }
    if (extraInfo) {
      newItem.setField("extra", extraInfo.trim());
    }

    // After Extra: falls back to an "Extra" line for item types with no DOI field
    ZoteroIntegration.setDOI(newItem, replicationData.doi_r);

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
          const creators = authors
            .map((author: any) => ({
              creatorType: "author" as const,
              firstName: author.given || "",
              lastName: author.family || "",
            }))
            .filter((c: any) => c.firstName !== "" || c.lastName !== "");
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

      // Get or create replication folder in Personal library (for replications)
      const replicationCollection = await getOrCreateCollection(personalLibraryID, REPLICATION_SPEC);

      // Get or create collection for originals named "{LibraryName} [Read-Only]"
      const originalsCollection = await getOrCreateChildCollection(
        personalLibraryID,
        `${sourceLibraryName}${READONLY_SUFFIX}`,
        "[ReplicationChecker]",
      );

      // Show progress
      const progressWin = new Zotero.ProgressWindow();
      progressWin.changeHeadline(getString("replication-checker-progress-copying-readonly"));
      progressWin.show();

      // Pre-check: which replication DOIs (across all original items) have multiple originals
      const allReadOnlyRepDois: string[] = [];
      for (const replicationsRaw of itemsWithReplications.values()) {
        const reps = this.convertRelatedStudiesToOldFormat(replicationsRaw);
        for (const rep of reps) {
          const doi_r = (rep.doi_r || "").trim();
          if (doi_r.startsWith("10.")) allReadOnlyRepDois.push(doi_r);
        }
      }
      const readOnlyMultipleOriginalsMap = await this.buildMultipleOriginalsMap(allReadOnlyRepDois);

      // Track items that need notes (created outside transaction to avoid nested saveTx)
      const itemsNeedingNotes: Array<{ itemID: number; replications: any[] }> = [];
      const itemsNeedingOriginalNotes: Array<{ itemID: number; originals: RelatedStudy[] }> = [];

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
                copiedOriginalID = await copyItemToLibrary(originalItemID, personalLibraryID, "[ReplicationChecker]");
                // Track this item so checkNewItems doesn't trigger dialogs
                this.pluginAddedItems.add(copiedOriginalID);
              }
            } else {
              copiedOriginalID = await copyItemToLibrary(originalItemID, personalLibraryID, "[ReplicationChecker]");
              // Track this item so checkNewItems doesn't trigger dialogs
              this.pluginAddedItems.add(copiedOriginalID);
            }

            const copiedOriginal = await Zotero.Items.getAsync(copiedOriginalID);

            // Add tags to copied original
            copiedOriginal.addTag(getTag(TAG_HAS_BEEN_REPLICATED));
            copiedOriginal.addTag(getTag(TAG_ADDED_BY_CHECKER));
            copiedOriginal.addTag(getTag(TAG_READONLY_ORIGIN));
            await copiedOriginal.save();

            // Add original to the read-only library collection (not to replication folder)
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
                titleSearch.addCondition("tag", "is", getTag(TAG_IS_REPLICATION));
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
              replicationItem.addTag(getTag(TAG_IS_REPLICATION));
              replicationItem.addTag(getTag(TAG_ADDED_BY_CHECKER));
              replicationItem.addTag(getTag(TAG_READONLY_ORIGIN));

              // Add outcome or multiple-originals tag
              const normRepDoi = this.matcher ? this.matcher.normalizeDoi(doi_r) : doi_r.toLowerCase();
              const readOnlyMultipleOriginals = readOnlyMultipleOriginalsMap.get(normRepDoi);
              if (readOnlyMultipleOriginals) {
                replicationItem.addTag(getTag(TAG_REPLICATION_MULTIPLE_ORIGINALS));
                // Override extra set by createReplicationItemInLibrary
                try { replicationItem.setField("extra", "For more details read the Original Article."); } catch { /* field not valid */ }
                itemsNeedingOriginalNotes.push({ itemID: replicationItemID, originals: readOnlyMultipleOriginals });
              } else if (rep.outcome) {
                const outcomeKey = rep.outcome.toLowerCase() === "failed" ? "failure" : rep.outcome.toLowerCase();
                const outcomeTags: { [key: string]: string } = {
                  successful: TAG_REPLICATION_SUCCESS,
                  failure: TAG_REPLICATION_FAILURE,
                  mixed: TAG_REPLICATION_MIXED,
                };
                if (outcomeTags[outcomeKey]) {
                  replicationItem.addTag(getTag(outcomeTags[outcomeKey]));
                }
              }

              await replicationItem.save();

              // Link items bidirectionally
              copiedOriginal.addRelatedItem(replicationItem);
              replicationItem.addRelatedItem(copiedOriginal);
              await copiedOriginal.save();
              await replicationItem.save();

              // Add to replication folder
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

      // Enrich originals with outcomes (one batch API call) then create notes
      if (itemsNeedingOriginalNotes.length > 0) {
        const enriched = await this.enrichOriginalsWithOutcomes(itemsNeedingOriginalNotes);
        for (const { itemID: repItemID, originals } of enriched) {
          await this.addOriginalArticlesNote(repItemID, originals);
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
