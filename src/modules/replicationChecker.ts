/**
 * Main replication checker module
 * Orchestrates the checking workflow, handles UI, and manages item updates
 */

import { APIDataSource } from "./dataSource";
import { BatchMatcher } from "./batchMatcher";
import * as ZoteroIntegration from "../utils/zoteroIntegration";
import type { ZoteroItemData } from "../types/replication";

interface MatchResult {
  doi: string;
  replications: any[];
}

/**
 * Main plugin class for replication checking
 */
export class ReplicationCheckerPlugin {
  private dataSource: APIDataSource | null = null;
  private matcher: BatchMatcher | null = null;
  private rootURI: string = "";
  private notifierID: string | null = null;

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

      Zotero.debug("ReplicationCheckerPlugin initialized successfully");
    } catch (error) {
      Zotero.logError(`Failed to initialize: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Register Zotero notifier to watch for new items
   */
  private registerNotifier(): void {
    const notifierCallback = {
      notify: async (event: string, type: string, ids: number[], extraData?: any) => {
        if (event === "add" && type === "item") {
          // Small delay to ensure item is fully saved
          setTimeout(() => {
            this.checkNewItems(ids);
          }, 2000);
        }
      },
    };

    this.notifierID = Zotero.Notifier.registerObserver(notifierCallback, ["item"]);
    Zotero.debug("ReplicationChecker: Notifier registered for new items");
  }

  /**
   * Check newly added items for replications
   * @param itemIDs Array of newly added item IDs
   */
  async checkNewItems(itemIDs: number[]): Promise<void> {
    try {
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
      Zotero.logError(
        `Error checking new items: ${error instanceof Error ? error.message : String(error)}`
      );
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
      progressWin.changeHeadline("Checking for Replications");
      progressWin.show();
      progressWin.addLines(["Scanning library..."]);

      // Get all DOIs from library
      const libraryItems = await ZoteroIntegration.getAllDOIsFromLibrary();
      const uniqueDois = this.getUniqueDOIs(libraryItems);

      progressWin.addLines([`Found ${libraryItems.length} items with DOIs (${uniqueDois.length} unique)`]);
      progressWin.addLines(["Checking against replication database..."]);

      // Check for replications
      const results = await this.matcher.checkBatch(uniqueDois);

      // Process results
      const processedItems = new Set<number>();
      let matchCount = 0;

      for (const result of results) {
        if (result.replications.length > 0) {
          const matchingItems = libraryItems.filter(
            (item) => this.matcher!.normalizeDoi(item.doi) === result.doi
          );

          for (const libraryItem of matchingItems) {
            if (!processedItems.has(libraryItem.itemID)) {
              try {
                await this.notifyUserAndAddReplications(libraryItem.itemID, result.replications);
                processedItems.add(libraryItem.itemID);
                matchCount++;
              } catch (error) {
                Zotero.logError(
                  `Error processing item ${libraryItem.itemID}: ${
                    error instanceof Error ? error.message : String(error)
                  }`
                );
              }
            }
          }
        }
      }

      // Update progress
      progressWin.changeHeadline("Check Complete");
      progressWin.addLines([`Found ${matchCount} item(s) with replications`]);
      progressWin.startCloseTimer(3000);
    } catch (error) {
      Zotero.logError(
        `Error checking library: ${error instanceof Error ? error.message : String(error)}`
      );
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
        const win = Zotero.getMainWindow();
        if (win) {
          Services.prompt.alert(win, "Zotero Replication Checker", "No DOIs found in selected items");
        }
        return;
      }

      // Check for replications
      const results = await this.matcher.checkBatch(uniqueDois);

      // Process results
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
                try {
                  await this.notifyUserAndAddReplications(libraryItem.itemID, result.replications);
                  processedItems.add(libraryItem.itemID);
                } catch (error) {
                  Zotero.logError(
                    `Error processing item ${libraryItem.itemID}: ${
                      error instanceof Error ? error.message : String(error)
                    }`
                  );
                }
              }
            }
          }
        }
      }

      // Show results alert
      this.showResultsAlert(results, uniqueDois.length, selectedItems.length, true);
    } catch (error) {
      Zotero.logError(
        `Error checking selected items: ${error instanceof Error ? error.message : String(error)}`
      );
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
        const win = Zotero.getMainWindow();
        if (win) {
          win.alert("No Collection Selected", "Please select a collection first");
        }
        return;
      }

      // Show progress
      const progressWin = new Zotero.ProgressWindow();
      progressWin.changeHeadline("Checking for Replications in Collection");
      progressWin.show();
      progressWin.addLines(["Scanning collection..."]);

      // Get DOIs from collection
      const selectedItems = await ZoteroIntegration.getDOIsFromCollection(collection.id);
      Zotero.debug(`Retrieved ${selectedItems.length} items from collection ${collection.id}`);

      if (!selectedItems || selectedItems.length === 0) {
        progressWin.changeHeadline("Check Complete");
        progressWin.addLines(["No items with DOIs found in collection"]);
        progressWin.startCloseTimer(3000);
        return;
      }

      const uniqueDois = this.getUniqueDOIs(selectedItems);
      progressWin.addLines([`Found ${selectedItems.length} items with DOIs (${uniqueDois.length} unique)`]);
      progressWin.addLines(["Checking against replication database..."]);

      // Check for replications
      const results = await this.matcher.checkBatch(uniqueDois);

      // Process results
      const processedItems = new Set<number>();
      let matchCount = 0;

      for (const result of results) {
        if (result.replications.length > 0) {
          const matchingItems = selectedItems.filter(
            (item) => this.matcher!.normalizeDoi(item.doi) === result.doi
          );

          for (const libraryItem of matchingItems) {
            if (!processedItems.has(libraryItem.itemID)) {
              const hasTag = await ZoteroIntegration.hasReplicationTag(libraryItem.itemID);
              if (!hasTag || result.replications.length > 0) {
                try {
                  await this.notifyUserAndAddReplications(libraryItem.itemID, result.replications);
                  processedItems.add(libraryItem.itemID);
                  matchCount++;
                } catch (error) {
                  Zotero.logError(
                    `Error processing item ${libraryItem.itemID}: ${
                      error instanceof Error ? error.message : String(error)
                    }`
                  );
                }
              }
            }
          }
        }
      }

      // Update progress
      progressWin.changeHeadline("Check Complete");
      progressWin.addLines([`Found ${matchCount} item(s) with replications`]);
      progressWin.startCloseTimer(3000);

      // Show results alert
      this.showResultsAlert(results, uniqueDois.length, selectedItems.length, false, true);
    } catch (error) {
      Zotero.logError(
        `Error checking collection: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Show dialog asking user if they want to add replication information
   */
  private async showReplicationDialog(itemID: number, replications: any[]): Promise<void> {
    try {
      const win = Zotero.getMainWindow();
      if (!win) return;

      const item = await Zotero.Items.getAsync(itemID);
      if (!item) return;

      const itemTitle = item.getField("title") as string;

      // Build message
      let message = `Replication studies found for:\n"${itemTitle}"\n\n`;
      message += `Found ${replications.length} replication(s):\n\n`;

      for (let i = 0; i < Math.min(replications.length, 3); i++) {
        const rep = replications[i];
        message += `${i + 1}. ${rep.title_r}\n`;
        message += `(${rep.year_r})\n`;
        message += `   Outcome: ${rep.outcome || "Not specified"}\n\n`;
      }

      if (replications.length > 3) {
        message += `...and ${replications.length - 3} more replication(s)\n\n`;
      }

      message += `Would you like to add replication information?`;

      // Show confirmation dialog
      const result = Services.prompt.confirm(win, "Replication Studies Found", message);

      if (result) {
        // User clicked "OK" - add tag and note
        await this.notifyUserAndAddReplications(itemID, replications);

        // Show success message
        const progressWin = new Zotero.ProgressWindow();
        progressWin.changeHeadline("Replication Information Added");
        progressWin.show();
        progressWin.addLines([`Added replication information to "${itemTitle}"`]);
        progressWin.startCloseTimer(3000);

        Zotero.debug(`ReplicationChecker: User accepted replication info for item ${itemID}`);
      } else {
        Zotero.debug(`ReplicationChecker: User declined replication info for item ${itemID}`);
      }
    } catch (error) {
      Zotero.logError(
        `Error showing replication dialog: ${error instanceof Error ? error.message : String(error)}`
      );
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
      Zotero.logError(
        `Error in notifyUserAndAddReplications for item ${itemID}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
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
      await ZoteroIntegration.addTag(itemID, "Has Replication");

      // Add outcome tags
      const allowedOutcomes: { [key: string]: string } = {
        successful: "Replication: Successful",
        failure: "Replication: Failure",
        mixed: "Replication: Mixed",
      };

      const uniqueOutcomes = new Set<string>(
        uniqueReplications
          .map((r: any) => (r.outcome && typeof r.outcome === "string" ? r.outcome.toLowerCase() : null))
          .filter((o: any) => o && Object.keys(allowedOutcomes).includes(o))
      );

      // Add all tags
      await Promise.all(
        Array.from(uniqueOutcomes).map((outcome) =>
          ZoteroIntegration.addTag(itemID, allowedOutcomes[outcome])
        )
      );

      // Get or create replication note
      const noteIDs = item.getNotes();
      let existingNote = null;

      for (const noteID of noteIDs) {
        const note = await Zotero.Items.getAsync(noteID);
        if (!note) continue;

        const currentNoteHTML = note.getNote();
        if (currentNoteHTML.startsWith("<h2>Replications Found</h2>")) {
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
          existingNote.setNote(newHTML);
          await existingNote.saveTx();
        }
      } else {
        // Create new note
        const noteHTML = this.createReplicationNote(uniqueReplications);
        await ZoteroIntegration.addNote(itemID, noteHTML);
      }
    } catch (error) {
      Zotero.logError(
        `Failed to notify user for item ${itemID}: ${error instanceof Error ? error.message : String(error)}`
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
        replicationCollection = new Zotero.Collection();
        replicationCollection.libraryID = libraryID;
        replicationCollection.name = "Replication folder";
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

          // Check for duplicate
          const search = new Zotero.Search();
          search.libraryID = libraryID;
          search.addCondition("DOI", "is", doi_r);
          const existingIDs = await search.search();
          if (existingIDs.length > 0) {
            Zotero.debug(`Skipping duplicate replication item with DOI: ${doi_r}`);
            continue;
          }

          try {
            // Create new item
            const newItem = new Zotero.Item("journalArticle");
            newItem.libraryID = libraryID;
            newItem.setField("title", rep.title_r || "Untitled Replication");
            newItem.setField("publicationTitle", rep.journal_r || "");
            newItem.setField("volume", rep.volume_r || "");
            newItem.setField("issue", rep.issue_r || "");
            newItem.setField("pages", rep.pages_r || "");
            newItem.setField("date", rep.year_r ? rep.year_r.toString() : "");
            newItem.setField("DOI", doi_r);

            const newItemID = await newItem.save();
            Zotero.debug(`Added new replication item with ID ${newItemID} for DOI ${doi_r}`);

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
              for (const author of authors) {
                try {
                  newItem.addCreator({
                    creatorType: "author",
                    firstName: author.given || "",
                    lastName: author.family || "",
                  });
                } catch (e) {
                  Zotero.debug(`Failed to add creator for DOI ${doi_r}`);
                }
              }
              await newItem.save();
            }

            // Add to collection
            replicationCollection.addItem(newItemID);
            await replicationCollection.save();
            Zotero.debug(`Added replication item ${newItemID} to "Replication folder"`);
          } catch (error) {
            Zotero.debug(`Error creating replication item for DOI ${doi_r}: ${error}`);
          }
        }
      });
    } catch (error) {
      Zotero.logError(
        `Failed to add replications to folder for item ${itemID}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }

  /**
   * Create HTML for a single replication list item
   */
  private createReplicationLi(rep: any): string {
    let li = "<li>";
    li += `<strong>${this.escapeHtml(rep.title_r || "No title available")}</strong><br>`;
    li += `${this.parseAuthors(rep.author_r)} (${this.escapeHtml(rep.year_r || "N/A")})<br>`;
    li += `<em>${this.escapeHtml(rep.journal_r || "No journal")}</em><br>`;
    li += `DOI: <a href="https://doi.org/${this.escapeHtml(rep.doi_r || "N/A")}">${this.escapeHtml(
      rep.doi_r || "N/A"
    )}</a><br>`;

    if (rep.outcome) {
      li += `Author Reported Outcome: <strong>${this.escapeHtml(rep.outcome)}</strong><br>`;
    }

    if (
      rep.doi_r &&
      rep.doi_r.trim().toLowerCase() !== "na" &&
      rep.url_r &&
      typeof rep.url_r === "string" &&
      rep.url_r.trim().toLowerCase() !== "na" &&
      rep.url_r.trim().startsWith("https")
    ) {
      li += `This study has a linked report: <a href="${this.escapeHtml(
        rep.url_r.trim()
      )}" target="_blank">${this.escapeHtml(rep.url_r.trim())}</a><br>`;
    }

    li += "</li>";
    return li;
  }

  /**
   * Format replication data as HTML note
   */
  private createReplicationNote(replications: any[]): string {
    let html = "<h2>Replications Found</h2>";
    html += "<i>This is an automatically generated note. Do not make changes!</i><br>";
    html += "<p>This study has been replicated:</p>";
    html += "<ul>";
    for (const rep of replications) {
      html += this.createReplicationLi(rep);
    }
    html += "</ul>";
    html += `
      <hr/>
      <div style="padding:10px; border-radius:5px; margin-top:15px;">
        <p><strong>Did you find this result useful? Provide feedback <a href="https://tinyurl.com/y5evebv9" target="_blank">here</a>!</strong></p>
      </div>
    `;
    html += "<p><small>Generated by Zotero Replication Checker using the FORRT Replication Database (FReD)</small></p>";
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
      return "No authors available";
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
    const win = Zotero.getMainWindow();
    if (!win) return;

    let message = isCollection
      ? "Collection Scan Complete"
      : isSelected
        ? "Selected Items Scan Complete"
        : "Library Scan Complete";
    message += `\nTotal items checked: ${totalItems}`;
    message += `\nItems with DOIs: ${doiCount}`;
    message += "\n\nReplication check results:";

    const matchCount = results.filter((r) => r.replications.length > 0).length;

    if (matchCount > 0) {
      message += `\n${matchCount} item(s) have replications.`;
    } else {
      message += "\nNo replications found.";
    }

    message += "\nView notes for details or select items to re-check.";

    Services.prompt.alert(win, "Zotero Replication Checker", message);
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
   * Shutdown the plugin
   */
  shutdown(): void {
    if (this.notifierID) {
      Zotero.Notifier.unregisterObserver(this.notifierID);
      Zotero.debug("ReplicationChecker: Notifier unregistered");
    }
  }
}

// Export singleton instance
export const replicationChecker = new ReplicationCheckerPlugin();
