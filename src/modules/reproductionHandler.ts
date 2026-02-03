/**
 * Reproduction Handler Module
 * Handles all reproduction-specific logic including:
 * - Adding reproductions to "Reproduction folder"
 * - Creating "Reproductions Found" notes
 * - Adding reproduction tags
 * - Relating original and reproduced articles
 * - Banning reproductions
 */

import type { RelatedStudy } from "../types/replication";
import * as ZoteroIntegration from "../utils/zoteroIntegration";
import { blacklistManager } from "./blacklistManager";
import { getString } from "../utils/strings";
import {
  TAG_HAS_REPRODUCTION, TAG_IS_REPRODUCTION, TAG_ADDED_BY_CHECKER,
  TAG_READONLY_ORIGIN,
  TAG_REPRO_CS_ROBUST, TAG_REPRO_CS_CHALLENGES, TAG_REPRO_CS_NOT_CHECKED,
  TAG_REPRO_CI_ROBUST, TAG_REPRO_CI_CHALLENGES, TAG_REPRO_CI_NOT_CHECKED,
} from "../utils/tags";

const FEEDBACK_URL = "https://tinyurl.com/y5evebv9";
const DATA_ISSUES_URL = "https://forms.gle/Tn2eqasUU1WE86Dq8";

/**
 * Map reproduction outcome to tag name (always English constants)
 * Note: Include both "computionally" (typo in some API responses) and "computationally" (correct)
 */
const REPRODUCTION_OUTCOME_TAGS: { [key: string]: string } = {
  // Correct spelling
  'computationally successful, robust': TAG_REPRO_CS_ROBUST,
  'computationally successful, robustness challenges': TAG_REPRO_CS_CHALLENGES,
  'computationally successful, robustness not checked': TAG_REPRO_CS_NOT_CHECKED,
  // Typo spelling (in case API has this)
  'computionally successful, robust': TAG_REPRO_CS_ROBUST,
  'computionally successful, robustness challenges': TAG_REPRO_CS_CHALLENGES,
  'computionally successful, robustness not checked': TAG_REPRO_CS_NOT_CHECKED,
  // Computational issues (correct spelling)
  'computational issues, robust': TAG_REPRO_CI_ROBUST,
  'computational issues, robustness challenges': TAG_REPRO_CI_CHALLENGES,
  'computational issues, robustness not checked': TAG_REPRO_CI_NOT_CHECKED,
};

/**
 * Reproduction Handler Plugin class
 * Manages all reproduction-specific operations
 */
export class ReproductionHandler {
  private pluginAddedItems: Set<number> = new Set(); // Track items added by the handler

  /**
   * Initialize the reproduction handler
   */
  async init(): Promise<void> {
    Zotero.debug("[ReproductionHandler] Initializing...");
    await blacklistManager.init();
    Zotero.debug("[ReproductionHandler] Initialized successfully");
  }

  /**
   * Track an item ID as added by the plugin
   */
  trackPluginAddedItem(itemID: number): void {
    this.pluginAddedItems.add(itemID);
  }

  /**
   * Check if an item was added by the plugin
   */
  isPluginAddedItem(itemID: number): boolean {
    return this.pluginAddedItems.has(itemID);
  }

  /**
   * Remove item from plugin-added tracking
   */
  untrackPluginAddedItem(itemID: number): void {
    this.pluginAddedItems.delete(itemID);
  }

  /**
   * Process reproductions for an item
   * Main entry point for handling reproductions found during a check
   * @param itemID The original item ID that has reproductions
   * @param reproductions Array of reproduction studies from API
   */
  async processReproductions(itemID: number, reproductions: RelatedStudy[]): Promise<void> {
    try {
      Zotero.debug(`[ReproductionHandler] Processing item ${itemID} with ${reproductions.length} reproductions`);

      if (reproductions.length === 0) {
        return;
      }

      // Convert new API format to internal format for processing
      const reproductionsForProcessing = this.convertRelatedStudiesToInternalFormat(reproductions);

      // Step 1: Add tags and notes to original item
      await this.notifyUserAboutReproductions(itemID, reproductionsForProcessing);

      // Step 2: Add reproduction items to folder
      await this.addReproductionsToFolder(itemID, reproductionsForProcessing);

      Zotero.debug(`[ReproductionHandler] Completed processing item ${itemID}`);
    } catch (error) {
      Zotero.logError(new Error(
        `Error in processReproductions for item ${itemID}: ${
          error instanceof Error ? error.message : String(error)
        }`
      ));
      throw error;
    }
  }

  /**
   * Convert RelatedStudy[] from API format to internal format
   */
  private convertRelatedStudiesToInternalFormat(studies: RelatedStudy[]): any[] {
    return studies.map((study) => ({
      doi_rep: study.doi || "",
      title_rep: study.title,
      author_rep: study.authors,
      year_rep: study.year,
      journal_rep: study.journal,
      volume_rep: study.volume,
      issue_rep: study.issue,
      pages_rep: study.pages,
      outcome: study.outcome,
      outcome_quote: study.outcome_quote,
      url_rep: study.url,
    }));
  }

  /**
   * Notify user about reproductions found
   * Adds tags and notes to the original item
   */
  private async notifyUserAboutReproductions(itemID: number, reproductions: any[]): Promise<void> {
    try {
      Zotero.debug(`[ReproductionHandler] notifyUserAboutReproductions called for item ${itemID}`);
      const item = await Zotero.Items.getAsync(itemID);
      if (!item) throw new Error(`Item ${itemID} not found`);

      // Deduplicate reproductions by URL (since many don't have DOIs)
      const seen = new Set<string>();
      const uniqueReproductions = reproductions.filter((rep: any) => {
        const identifier = (rep.url_rep || rep.doi_rep || rep.title_rep || "").trim().toLowerCase();
        if (identifier && !seen.has(identifier)) {
          seen.add(identifier);
          return true;
        }
        return false;
      });

      if (uniqueReproductions.length === 0) {
        Zotero.debug(`[ReproductionHandler] No reproductions for item ${itemID}`);
        return;
      }

      // Add "Has Reproduction" tag
      await ZoteroIntegration.addTag(itemID, TAG_HAS_REPRODUCTION);

      // Add outcome tags for each unique outcome
      const uniqueOutcomes = new Set<string>(
        uniqueReproductions
          .map((r: any) => r.outcome?.toLowerCase().trim())
          .filter((o: any) => o && REPRODUCTION_OUTCOME_TAGS[o])
      );

      // Add all outcome tags
      await Promise.all(
        Array.from(uniqueOutcomes).map((outcome) => {
          const tagKey = REPRODUCTION_OUTCOME_TAGS[outcome];
          if (tagKey) {
            return ZoteroIntegration.addTag(itemID, tagKey);
          }
          return Promise.resolve();
        })
      );

      // Get or create reproduction note
      const noteIDs = item.getNotes();
      let existingNote = null;
      const noteHeadingHtml = this.getNoteHeadingHtml();

      for (const noteID of noteIDs) {
        const note = await Zotero.Items.getAsync(noteID);
        if (!note) continue;

        const currentNoteHTML = note.getNote();
        if (
          currentNoteHTML.startsWith(noteHeadingHtml) ||
          currentNoteHTML.startsWith("<h2>Reproductions Found</h2>")
        ) {
          existingNote = note;
          break;
        }
      }

      if (existingNote) {
        // Incremental update - append new reproductions
        let currentHTML = existingNote.getNote();
        const parser = new DOMParser();
        const doc = parser.parseFromString(currentHTML, "text/html");
        const ul = doc.querySelector("ul");

        if (!ul) {
          // Malformed note; overwrite
          existingNote.setNote(this.createReproductionNote(uniqueReproductions));
          await existingNote.saveTx();
          return;
        }

        // Extract existing URLs/DOIs
        const existingLis = Array.from(ul.querySelectorAll("li"));
        const existingIdentifiers = new Set<string>();
        existingLis.forEach((liElem: any) => {
          // Check for URL links
          const urlA = liElem.querySelector('a[href^="https://osf.io/"], a[href^="http://osf.io/"]');
          if (urlA) {
            const url = (urlA as HTMLAnchorElement).href.toLowerCase().trim();
            existingIdentifiers.add(url);
          }
          // Check for DOI links
          const doiA = liElem.querySelector('a[href^="https://doi.org/"]');
          if (doiA) {
            const doi = (doiA as HTMLAnchorElement).href.replace("https://doi.org/", "").trim().toLowerCase();
            existingIdentifiers.add(doi);
          }
        });

        // Append new reproductions
        let added = false;
        uniqueReproductions.forEach((rep: any) => {
          const urlId = (rep.url_rep || "").trim().toLowerCase();
          const doiId = (rep.doi_rep || "").trim().toLowerCase();
          if ((urlId && !existingIdentifiers.has(urlId)) || (doiId && !existingIdentifiers.has(doiId))) {
            const newLiHTML = this.createReproductionLi(rep);
            ul.insertAdjacentHTML("beforeend", newLiHTML);
            if (urlId) existingIdentifiers.add(urlId);
            if (doiId) existingIdentifiers.add(doiId);
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
        const noteHTML = this.createReproductionNote(uniqueReproductions);
        await ZoteroIntegration.addNote(itemID, noteHTML);
      }
    } catch (error) {
      Zotero.logError(
        new Error(
          `Failed to notify user about reproductions for item ${itemID}: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      );
      throw error;
    }
  }

  /**
   * Add reproductions to the "Reproduction folder" collection
   */
  private async addReproductionsToFolder(itemID: number, reproductions: any[]): Promise<void> {
    try {
      const item = await Zotero.Items.getAsync(itemID);
      if (!item) throw new Error(`Item ${itemID} not found`);

      // Deduplicate by URL/DOI
      const seen = new Set<string>();
      const uniqueReproductions = reproductions.filter((rep: any) => {
        const identifier = (rep.url_rep || rep.doi_rep || "").trim().toLowerCase();
        if (identifier && !seen.has(identifier)) {
          seen.add(identifier);
          return true;
        }
        return false;
      });

      // Filter out blacklisted reproductions
      const nonBlacklistedReproductions = uniqueReproductions.filter((rep: any) => {
        const url_rep = (rep.url_rep || "").trim();
        const doi_rep = (rep.doi_rep || "").trim();

        if (blacklistManager.isBlacklisted(doi_rep, url_rep)) {
          Zotero.debug(
            `[ReproductionHandler] Skipping blacklisted reproduction: ${url_rep || doi_rep} (${rep.title_rep})`
          );
          return false;
        }
        return true;
      });

      if (nonBlacklistedReproductions.length === 0) {
        Zotero.debug(
          `[ReproductionHandler] All reproductions for item ${itemID} are blacklisted, skipping`
        );
        return;
      }

      // Get or create reproduction collection
      const libraryID = item.libraryID;
      let collections = Zotero.Collections.getByLibrary(libraryID, true);
      let reproductionCollection = collections.find(
        (c: any) => c.name === "Reproduction folder" && !c.parentID
      );

      if (!reproductionCollection) {
        reproductionCollection = new Zotero.Collection({
          libraryID: libraryID,
          name: "Reproduction folder",
        });
        await reproductionCollection.saveTx();
        Zotero.debug(`[ReproductionHandler] Created new "Reproduction folder" collection in library ${libraryID}`);
      }

      // Process reproductions in transaction
      await Zotero.DB.executeTransaction(async () => {
        for (const rep of nonBlacklistedReproductions) {
          const url_rep = (rep.url_rep || "").trim();
          const doi_rep = (rep.doi_rep || "").trim();
          const identifier = url_rep || doi_rep;

          if (!identifier) {
            Zotero.debug(`[ReproductionHandler] Skipping reproduction with no URL or DOI: ${rep.title_rep}`);
            continue;
          }

          // Check for existing items by URL or DOI
          let existingIDs: number[] = [];

          // First try to find by DOI if available
          if (doi_rep && doi_rep.startsWith("10.")) {
            const doiSearch = new Zotero.Search({ libraryID });
            doiSearch.addCondition("DOI", "is", doi_rep);
            existingIDs = await doiSearch.search();
          }

          // If not found by DOI, try to find by URL in Extra field
          if (existingIDs.length === 0 && url_rep) {
            const urlSearch = new Zotero.Search({ libraryID });
            urlSearch.addCondition("extra", "contains", url_rep);
            existingIDs = await urlSearch.search();
          }

          // If the reproduction item already exists in the library, don't create a duplicate
          if (existingIDs.length > 0) {
            Zotero.debug(
              `[ReproductionHandler] Found existing reproduction item(s) with identifier ${identifier}; linking instead of creating duplicate`
            );

            for (const existingID of existingIDs) {
              const existingItem = await Zotero.Items.getAsync(existingID);
              if (!existingItem) continue;

              // Ensure the existing item is in the reproduction collection
              try {
                await reproductionCollection.addItem(existingID);
                Zotero.debug(
                  `[ReproductionHandler] Ensured existing reproduction item ${existingID} is in "Reproduction folder"`
                );
              } catch (collectionError) {
                Zotero.debug(
                  `[ReproductionHandler] Failed to add existing reproduction item ${existingID} to "Reproduction folder": ${collectionError}`
                );
              }

              // Add "Is Reproduction" tag to the existing reproduction item
              try {
                existingItem.addTag(TAG_IS_REPRODUCTION);
                await existingItem.save();
                Zotero.debug(`[ReproductionHandler] Added "Is Reproduction" tag to existing item ${existingID}`);
              } catch (tagError) {
                Zotero.debug(`[ReproductionHandler] Failed to add tag to existing reproduction item ${existingID}: ${tagError}`);
              }

              // Link original item and existing reproduction item as related items (bidirectional)
              try {
                item.addRelatedItem(existingItem);
                existingItem.addRelatedItem(item);
                Zotero.debug(
                  `[ReproductionHandler] Added bidirectional related items link: ${itemID} <-> ${existingID}`
                );
                await item.save();
                await existingItem.save();
              } catch (linkError) {
                Zotero.debug(
                  `[ReproductionHandler] Failed to create related items link between ${itemID} and ${existingID}: ${linkError}`
                );
              }
            }

            continue;
          }

          try {
            // Create new item - use document type since many reproductions are OSF reports
            const newItem = new Zotero.Item("document");
            (newItem as Zotero.Item & { libraryID: number }).libraryID = libraryID;
            newItem.setField("title", rep.title_rep || "Untitled Reproduction");
            newItem.setField("date", rep.year_rep ? rep.year_rep.toString() : "");

            // Store URL in URL field and Extra
            if (url_rep) {
              newItem.setField("url", url_rep);
            }
            if (doi_rep) {
              newItem.setField("DOI", doi_rep);
            }

            // Add extra info including URL for searchability
            let extraInfo = "";
            if (rep.outcome) {
              extraInfo += `Reproduction Outcome: ${rep.outcome}\n`;
            }
            if (rep.outcome_quote) {
              extraInfo += `Outcome Quote: ${rep.outcome_quote}\n`;
            }
            if (extraInfo) {
              newItem.setField("extra", extraInfo.trim());
            }

            const newItemID = (await newItem.save()) as number;
            Zotero.debug(`[ReproductionHandler] Added new reproduction item with ID ${newItemID}`);

            // Track this item so we don't auto-check it
            this.pluginAddedItems.add(newItemID);

            // Add bidirectional "related items" link between original and reproduction
            try {
              item.addRelatedItem(newItem);
              newItem.addRelatedItem(item);
              Zotero.debug(`[ReproductionHandler] Added bidirectional related items link: ${itemID} <-> ${newItemID}`);
              await item.save();
              await newItem.save();
            } catch (linkError) {
              Zotero.debug(`[ReproductionHandler] Failed to create related items link: ${linkError}`);
            }

            // Parse and add authors
            let authors: any[] = [];
            if (rep.author_rep) {
              try {
                if (typeof rep.author_rep === "string") {
                  authors = JSON.parse(rep.author_rep);
                } else if (Array.isArray(rep.author_rep)) {
                  authors = rep.author_rep;
                }
              } catch (e) {
                Zotero.debug(`[ReproductionHandler] Failed to parse authors for reproduction: ${rep.title_rep}`);
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
                Zotero.debug(`[ReproductionHandler] Failed to add creators for reproduction: ${rep.title_rep}`);
              }
            }

            // Add "Is Reproduction" tag to the new reproduction item
            try {
              newItem.addTag(TAG_IS_REPRODUCTION);
              newItem.addTag(TAG_ADDED_BY_CHECKER);

              // Add outcome-specific tag
              if (rep.outcome) {
                const outcomeKey = rep.outcome.toLowerCase().trim();
                const tagKey = REPRODUCTION_OUTCOME_TAGS[outcomeKey];
                if (tagKey) {
                  newItem.addTag(tagKey);
                }
              }

              await newItem.save();
              Zotero.debug(`[ReproductionHandler] Added tags to new reproduction item ${newItemID}`);
            } catch (tagError) {
              Zotero.debug(`[ReproductionHandler] Failed to add tags to new reproduction item ${newItemID}: ${tagError}`);
            }

            // Add to collection
            await reproductionCollection.addItem(newItemID);
            Zotero.debug(`[ReproductionHandler] Added reproduction item ${newItemID} to "Reproduction folder"`);
          } catch (error) {
            Zotero.debug(`[ReproductionHandler] Error creating reproduction item: ${error}`);
          }
        }
      });
    } catch (error) {
      Zotero.logError(
        new Error(
          `Failed to add reproductions to folder for item ${itemID}: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      );
      throw error;
    }
  }

  /**
   * Get the note heading HTML for reproduction notes
   */
  private getNoteHeadingHtml(): string {
    return `<h2>${this.escapeHtml(getString("reproduction-checker-note-title"))}</h2>`;
  }

  /**
   * Create HTML for a single reproduction list item
   */
  private createReproductionLi(rep: any): string {
    const title = rep.title_rep || getString("reproduction-checker-li-no-title");
    const year = rep.year_rep || getString("reproduction-checker-li-na");
    const journal = rep.journal_rep || getString("reproduction-checker-li-no-journal");
    const doiValue = rep.doi_rep || "";
    const urlValue = rep.url_rep || "";
    const doiLabel = this.escapeHtml(getString("reproduction-checker-li-doi-label"));
    const outcomeLabel = this.escapeHtml(getString("reproduction-checker-li-outcome"));
    const linkLabel = this.escapeHtml(getString("reproduction-checker-li-link"));

    let li = "<li>";
    li += `<strong>${this.escapeHtml(title)}</strong><br>`;
    li += `${this.parseAuthors(rep.author_rep)} (${this.escapeHtml(year)})<br>`;

    if (journal && journal !== getString("reproduction-checker-li-no-journal")) {
      li += `<em>${this.escapeHtml(journal)}</em><br>`;
    }

    if (doiValue && doiValue.startsWith("10.")) {
      li += `${doiLabel} <a href="https://doi.org/${this.escapeHtml(doiValue)}">${this.escapeHtml(doiValue)}</a><br>`;
    }

    if (rep.outcome) {
      li += `${outcomeLabel} <strong>${this.escapeHtml(rep.outcome)}</strong><br>`;
    }

    if (rep.outcome_quote) {
      li += `<em>"${this.escapeHtml(rep.outcome_quote)}"</em><br>`;
    }

    // Show URL link
    if (urlValue && urlValue.startsWith("http")) {
      li += `${linkLabel} <a href="${this.escapeHtml(urlValue)}" target="_blank">${this.escapeHtml(urlValue)}</a><br>`;
    }

    li += "</li>";
    return li;
  }

  /**
   * Format reproduction data as HTML note
   */
  private createReproductionNote(reproductions: any[]): string {
    const warning = this.escapeHtml(getString("reproduction-checker-note-warning"));
    const intro = this.escapeHtml(getString("reproduction-checker-note-intro"));
    const feedbackHtml = getString("reproduction-checker-note-feedback", { url: FEEDBACK_URL });
    const dataIssuesHtml = getString("reproduction-checker-note-data-issues", { url: DATA_ISSUES_URL });
    const footer = this.escapeHtml(getString("reproduction-checker-note-footer"));

    let html = this.getNoteHeadingHtml();
    html += `<i>${warning}</i><br>`;
    html += `<p>${intro}</p>`;
    html += "<ul>";
    for (const rep of reproductions) {
      html += this.createReproductionLi(rep);
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
      return getString("reproduction-checker-li-no-authors");
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
   * Ban selected reproduction items
   * Moves items to trash and adds to blacklist
   */
  async banSelectedReproductions(selectedItems: Zotero.Item[]): Promise<number> {
    try {
      // Filter for reproduction items only
      const reproductionItems = selectedItems.filter((item: Zotero.Item) =>
        item.hasTag(TAG_IS_REPRODUCTION) ||
        (item.hasTag(TAG_ADDED_BY_CHECKER) &&
         item.getField("url")?.toString().includes("osf.io"))
      );

      if (reproductionItems.length === 0) {
        return 0;
      }

      // Process each item
      for (const item of reproductionItems) {
        const doi = ZoteroIntegration.extractDOI(item) || "";
        const url = item.getField("url")?.toString() || "";

        if (!doi && !url) continue;

        // Get original paper info from related items
        let originalTitle = "Unknown Original";
        let originalDOI: string | undefined;

        try {
          const relatedKeys = item.relatedItems || [];
          for (const relatedKey of relatedKeys) {
            const relatedItem = Zotero.Items.getByLibraryAndKey(item.libraryID, relatedKey);
            if (relatedItem && relatedItem.hasTag(TAG_HAS_REPRODUCTION)) {
              originalTitle = relatedItem.getField("title") as string;
              originalDOI = ZoteroIntegration.extractDOI(relatedItem) || undefined;

              // Remove the related item link from the original paper
              relatedItem.removeRelatedItem(item);
              await relatedItem.saveTx();
              break;
            }
          }
        } catch (e) {
          Zotero.debug(`[ReproductionHandler] Could not process related items for ${item.id}`);
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
          type: 'reproduction' as const
        };

        Zotero.debug(`[ReproductionHandler] Adding to blacklist: ${JSON.stringify(blacklistEntry)}`);
        await blacklistManager.addToBlacklist(blacklistEntry);

        // Move to trash
        item.deleted = true;
        await item.saveTx();
      }

      return reproductionItems.length;
    } catch (error) {
      Zotero.logError(
        new Error(`Error banning reproductions: ${error instanceof Error ? error.message : String(error)}`)
      );
      throw error;
    }
  }

  /**
   * Handle reproductions found in a read-only library
   * Copies items to Personal library
   */
  async handleReadOnlyReproductions(
    itemsWithReproductions: Map<number, RelatedStudy[]>,
    sourceLibraryID: number,
    personalLibraryID: number
  ): Promise<void> {
    try {
      // Get source library name
      const sourceLibrary = Zotero.Libraries.get(sourceLibraryID);
      const sourceLibraryName = sourceLibrary ? sourceLibrary.name : "Unknown Library";

      // Get or create "Reproduction folder" in Personal library
      let collections = Zotero.Collections.getByLibrary(personalLibraryID, true);
      let reproductionCollection = collections.find(
        (c: any) => c.name === "Reproduction folder" && !c.parentID
      );

      if (!reproductionCollection) {
        reproductionCollection = new Zotero.Collection({
          libraryID: personalLibraryID,
          name: "Reproduction folder",
        });
        await reproductionCollection.saveTx();
        Zotero.debug(`[ReproductionHandler] Created "Reproduction folder" in Personal library`);
      }

      // Get or create collection for originals
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
        collections = Zotero.Collections.getByLibrary(personalLibraryID, true);
      }

      // Track items that need notes (created outside transaction to avoid nested saveTx)
      const itemsNeedingNotes: Array<{ itemID: number; reproductions: any[] }> = [];

      // Process each item
      await Zotero.DB.executeTransaction(async () => {
        for (const [originalItemID, reproductions] of itemsWithReproductions) {
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
                // Track item so auto-check doesn't trigger dialogs
                this.pluginAddedItems.add(copiedOriginalID);
              } else {
                copiedOriginalID = await this.copyItemToLibrary(originalItemID, personalLibraryID);
                // Track item so auto-check doesn't trigger dialogs
                this.pluginAddedItems.add(copiedOriginalID);
              }
            } else {
              copiedOriginalID = await this.copyItemToLibrary(originalItemID, personalLibraryID);
              // Track item so auto-check doesn't trigger dialogs
              this.pluginAddedItems.add(copiedOriginalID);
            }

            const copiedOriginal = await Zotero.Items.getAsync(copiedOriginalID);
            if (!copiedOriginal) continue;

            // Add tags to copied original
            copiedOriginal.addTag(TAG_HAS_REPRODUCTION);
            copiedOriginal.addTag(TAG_ADDED_BY_CHECKER);
            copiedOriginal.addTag(TAG_READONLY_ORIGIN);
            await copiedOriginal.save();

            // Add original to the read-only library collection
            await originalsCollection.addItem(copiedOriginalID);

            // Convert and process reproductions
            const reproductionsForProcessing = this.convertRelatedStudiesToInternalFormat(reproductions);

            // Filter out blacklisted reproductions
            const nonBlacklistedReproductions = reproductionsForProcessing.filter((rep: any) => {
              const url_rep = (rep.url_rep || "").trim();
              const doi_rep = (rep.doi_rep || "").trim();
              return !blacklistManager.isBlacklisted(doi_rep, url_rep);
            });

            if (nonBlacklistedReproductions.length === 0) {
              continue;
            }

            // Track this item for note creation (done outside transaction)
            itemsNeedingNotes.push({ itemID: copiedOriginalID, reproductions: nonBlacklistedReproductions });

            // Create reproduction items
            for (const rep of nonBlacklistedReproductions) {
              const url_rep = (rep.url_rep || "").trim();
              const doi_rep = (rep.doi_rep || "").trim();
              const identifier = url_rep || doi_rep;
              if (!identifier) continue;

              // Check if reproduction already exists
              let existingRepIDs: number[] = [];
              if (doi_rep) {
                const search = new Zotero.Search({ libraryID: personalLibraryID });
                search.addCondition("DOI", "is", doi_rep);
                existingRepIDs = await search.search();
              }
              if (existingRepIDs.length === 0 && url_rep) {
                const search = new Zotero.Search({ libraryID: personalLibraryID });
                search.addCondition("extra", "contains", url_rep);
                existingRepIDs = await search.search();
              }

              let reproductionItemID: number;
              if (existingRepIDs.length > 0) {
                reproductionItemID = existingRepIDs[0];
                // Track item so auto-check doesn't trigger dialogs
                this.pluginAddedItems.add(reproductionItemID);
              } else {
                reproductionItemID = await this.createReproductionItemInLibrary(rep, personalLibraryID);
                // Track item so auto-check doesn't trigger dialogs
                this.pluginAddedItems.add(reproductionItemID);
              }

              const reproductionItem = await Zotero.Items.getAsync(reproductionItemID);
              if (!reproductionItem) continue;

              // Add tags
              reproductionItem.addTag(TAG_IS_REPRODUCTION);
              reproductionItem.addTag(TAG_ADDED_BY_CHECKER);
              reproductionItem.addTag(TAG_READONLY_ORIGIN);

              // Add outcome tag
              if (rep.outcome) {
                const outcomeKey = rep.outcome.toLowerCase().trim();
                const tagKey = REPRODUCTION_OUTCOME_TAGS[outcomeKey];
                if (tagKey) {
                  reproductionItem.addTag(tagKey);
                }
              }

              await reproductionItem.save();

              // Link items bidirectionally
              copiedOriginal.addRelatedItem(reproductionItem);
              reproductionItem.addRelatedItem(copiedOriginal);
              await copiedOriginal.save();
              await reproductionItem.save();

              // Add to Reproduction folder
              await reproductionCollection.addItem(reproductionItemID);
            }
          } catch (error) {
            Zotero.logError(new Error(
              `[ReproductionHandler] Error copying item ${originalItemID}: ${
                error instanceof Error ? error.message : String(error)
              }`
            ));
          }
        }
      });

      // Create notes OUTSIDE the transaction (addNote uses saveTx which can't be nested)
      for (const { itemID, reproductions } of itemsNeedingNotes) {
        try {
          const noteHTML = this.createReproductionNote(reproductions);
          await ZoteroIntegration.addNote(itemID, noteHTML);
          Zotero.debug(`[ReproductionHandler] Created reproduction note for copied original ${itemID}`);
        } catch (noteError) {
          Zotero.debug(`[ReproductionHandler] Failed to create note for item ${itemID}: ${noteError}`);
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
          Zotero.debug("[ReproductionHandler] UI refresh scheduled after read-only library processing");
        } catch (refreshError) {
          Zotero.debug(`[ReproductionHandler] UI refresh warning: ${refreshError}`);
        }
      }, 500);
    } catch (error) {
      Zotero.logError(new Error(
        `[ReproductionHandler] Error in handleReadOnlyReproductions: ${
          error instanceof Error ? error.message : String(error)
        }`
      ));
      throw error;
    }
  }

  /**
   * Copy an item to another library
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
    Zotero.debug(`[ReproductionHandler] Copied item ${sourceItemID} to library ${targetLibraryID} as ${newItemID}`);
    return newItemID;
  }

  /**
   * Create a reproduction item in a specified library
   */
  private async createReproductionItemInLibrary(reproductionData: any, libraryID: number): Promise<number> {
    const newItem = new Zotero.Item("document");
    (newItem as Zotero.Item & { libraryID: number }).libraryID = libraryID;

    newItem.setField("title", reproductionData.title_rep || "Untitled Reproduction");
    newItem.setField("date", reproductionData.year_rep?.toString() || "");
    newItem.setField("url", reproductionData.url_rep || "");
    if (reproductionData.doi_rep) {
      newItem.setField("DOI", reproductionData.doi_rep);
    }

    // Add extra info
    let extraInfo = "";
    if (reproductionData.outcome) {
      extraInfo += `Reproduction Outcome: ${reproductionData.outcome}\n`;
    }
    if (reproductionData.outcome_quote) {
      extraInfo += `Outcome Quote: ${reproductionData.outcome_quote}\n`;
    }
    if (extraInfo) {
      newItem.setField("extra", extraInfo.trim());
    }

    const newItemID = await newItem.save() as number;

    // Parse and add authors
    if (reproductionData.author_rep) {
      try {
        const authors = typeof reproductionData.author_rep === 'string'
          ? JSON.parse(reproductionData.author_rep)
          : reproductionData.author_rep;

        if (Array.isArray(authors)) {
          const creators = authors.map((author: any) => ({
            creatorType: "author" as const,
            firstName: author.given || "",
            lastName: author.family || "",
          }));
          const item = await Zotero.Items.getAsync(newItemID);
          if (item && creators.length > 0) {
            item.setCreators(creators);
            await item.save();
          }
        }
      } catch (error) {
        Zotero.logError(new Error(`[ReproductionHandler] Error parsing authors: ${error}`));
      }
    }

    return newItemID;
  }
}

// Export singleton instance
export const reproductionHandler = new ReproductionHandler();
