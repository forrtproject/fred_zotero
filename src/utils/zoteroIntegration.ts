/**
 * Zotero integration utilities
 * Handles extraction of DOIs from items, adding tags/notes, and other Zotero API operations
 */

import type { ZoteroItemData } from "../types/replication";
import { TAG_HAS_REPLICATION } from "./tags";

/**
 * Get all DOIs from the active library
 * Searches for items with DOI field or DOI in Extra field
 * @returns Array of items with their DOIs
 */
export async function getAllDOIsFromLibrary(): Promise<ZoteroItemData[]> {
  const libraryID = Zotero.getActiveZoteroPane().getSelectedLibraryID();
  const items: ZoteroItemData[] = [];

  const search = new Zotero.Search({ libraryID });
  search.addCondition("itemType", "isNot", "attachment");
  search.addCondition("itemType", "isNot", "note");
  const itemIDs = await search.search();

  Zotero.debug(`Found ${itemIDs.length} items in library`);

  for (const itemID of itemIDs) {
    const item = await Zotero.Items.getAsync(itemID);
    if (!item) continue;

    let doi = extractDOI(item);

    if (doi) {
      items.push({
        itemID: itemID,
        doi: doi,
        title: item.getField("title") as string,
      });
    }
  }

  Zotero.debug(`Found ${items.length} items with DOIs`);
  return items;
}

/**
 * Get DOIs from selected items
 * @returns Array of selected items with DOIs
 */
export function getSelectedDOIs(): ZoteroItemData[] {
  const items: ZoteroItemData[] = [];
  const selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();

  for (const item of selectedItems) {
    if (!item) continue;

    let doi = extractDOI(item);

    if (doi) {
      items.push({
        itemID: item.id,
        doi: doi,
        title: item.getField("title") as string,
      });
    }
  }

  return items;
}

/**
 * Get DOIs from a specific collection (including subcollections)
 * @param collectionID The collection ID to search
 * @returns Array of items in collection with DOIs
 */
export async function getDOIsFromCollection(collectionID: number): Promise<ZoteroItemData[]> {
  const items: ZoteroItemData[] = [];
  const collection = Zotero.Collections.get(collectionID);

  if (!collection) {
    Zotero.debug(`Collection with ID ${collectionID} not found`);
    return items;
  }

  const libraryID = collection.libraryID;

  /**
   * Recursively process collection and subcollections
   */
  const processCollection = async (colID: number): Promise<void> => {
    const col = Zotero.Collections.get(colID);
    if (!col) return;

    const search = new Zotero.Search({ libraryID });
    search.addCondition("collection", "is", col.key);
    search.addCondition("itemType", "isNot", "attachment");
    search.addCondition("itemType", "isNot", "note");
    const itemIDs = await search.search();

    for (const itemID of itemIDs) {
      const item = await Zotero.Items.getAsync(itemID);
      if (!item) continue;

      let doi = extractDOI(item);

      if (doi) {
        items.push({
          itemID: itemID,
          doi: doi,
          title: item.getField("title") as string,
        });
      }
    }

    // Recursively process subcollections
    const subCollections = Zotero.Collections.getByParent(colID, true) || [];
    for (const subCol of subCollections) {
      await processCollection(subCol.id);
    }
  };

  await processCollection(collectionID);
  Zotero.debug(
    `Found ${items.length} items with DOIs in collection ${collectionID} (key: ${collection.key})`
  );
  return items;
}

/**
 * Extract DOI from item
 * Checks DOI field first, then Extra field for doi: pattern
 * @param item The Zotero item
 * @returns DOI string or null if not found
 */
export function extractDOI(item: Zotero.Item): string | null {
  let doi = item.getField("DOI");

  if (!doi) {
    const extra = item.getField("extra") as string | undefined;
    if (extra) {
      const doiMatch = extra.match(/doi\s*[:=]\s*([^\n]+)/i);
      if (doiMatch) {
        doi = doiMatch[1].trim();
      }
    }
  }

  return doi ? String(doi) : null;
}

/**
 * Add a tag to an item
 * @param itemID The item ID
 * @param tagName The tag name to add
 */
export async function addTag(itemID: number, tagName: string): Promise<void> {
  const item = await Zotero.Items.getAsync(itemID);
  if (!item) throw new Error(`Item ${itemID} not found`);

  item.addTag(tagName);
  await item.saveTx();
}

/**
 * Add a note to an item
 * @param itemID The parent item ID
 * @param noteHTML The HTML content of the note
 */
export async function addNote(itemID: number, noteHTML: string): Promise<void> {
  const parentItem = await Zotero.Items.getAsync(itemID);
  if (!parentItem) throw new Error(`Item ${itemID} not found`);

  const note = new Zotero.Item("note");
  (note as Zotero.Item & { libraryID: number }).libraryID = parentItem.libraryID;
  note.parentID = itemID;
  note.setNote(noteHTML);
  await note.saveTx();
}

/**
 * Check if an item has the "Has Replication" tag
 * @param itemID The item ID
 * @returns True if item has the tag
 */
export async function hasReplicationTag(itemID: number): Promise<boolean> {
  const item = await Zotero.Items.getAsync(itemID);
  if (!item) return false;

  const tags = item.getTags();
  return tags.some((tag: any) => tag.tag === TAG_HAS_REPLICATION);
}

/**
 * Get item details
 * @param itemID The item ID
 * @returns Object with title, authors, and year
 */
export async function getItemDetails(
  itemID: number
): Promise<{ title: string; authors: string; year: string }> {
  const item = await Zotero.Items.getAsync(itemID);
  if (!item) throw new Error(`Item ${itemID} not found`);

  return {
    title: item.getField("title") as string,
    authors: item
      .getCreators()
      .map((c: any) => c.lastName)
      .join(", "),
    year: item.getField("year") as string,
  };
}

/**
 * Parsed BibTeX entry fields
 */
export interface ParsedBibtex {
  entryType: string;      // e.g. "article", "misc", "inproceedings"
  title?: string;
  author?: string;
  year?: string;
  journal?: string;
  volume?: string;
  number?: string;        // BibTeX uses "number" for issue
  pages?: string;
  publisher?: string;
  url?: string;
  doi?: string;
  booktitle?: string;
  institution?: string;
  howpublished?: string;
  issn?: string;
}

/**
 * Parse a BibTeX reference string into structured fields.
 * This is a lightweight parser that handles the common BibTeX format
 * returned by the FLoRA API.
 * @param bibtex The BibTeX string to parse
 * @returns Parsed fields, or null if parsing fails
 */
export function parseBibtex(bibtex: string | null | undefined): ParsedBibtex | null {
  if (!bibtex || typeof bibtex !== "string") return null;

  try {
    // Extract entry type (e.g., @article, @misc, @inproceedings)
    const typeMatch = bibtex.match(/@(\w+)\s*\{/);
    if (!typeMatch) return null;

    const result: ParsedBibtex = {
      entryType: typeMatch[1].toLowerCase(),
    };

    // Extract fields using regex - handles both single-line and multiline values
    // Match field = {value} or field = "value" patterns
    const fieldRegex = /(\w+)\s*=\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
    let match;

    while ((match = fieldRegex.exec(bibtex)) !== null) {
      const fieldName = match[1].toLowerCase().trim();
      const fieldValue = match[2].trim();

      switch (fieldName) {
        case "title":
          result.title = fieldValue;
          break;
        case "author":
          result.author = fieldValue;
          break;
        case "year":
          result.year = fieldValue;
          break;
        case "journal":
          result.journal = fieldValue;
          break;
        case "volume":
          result.volume = fieldValue;
          break;
        case "number":
          result.number = fieldValue;
          break;
        case "pages":
          result.pages = fieldValue;
          break;
        case "publisher":
          result.publisher = fieldValue;
          break;
        case "url":
          result.url = fieldValue;
          break;
        case "doi":
          result.doi = fieldValue;
          break;
        case "booktitle":
          result.booktitle = fieldValue;
          break;
        case "institution":
          result.institution = fieldValue;
          break;
        case "howpublished":
          result.howpublished = fieldValue;
          break;
        case "issn":
          result.issn = fieldValue;
          break;
      }
    }

    return result;
  } catch (error) {
    Zotero.debug(`[parseBibtex] Failed to parse BibTeX: ${error}`);
    return null;
  }
}

/**
 * Determine the best Zotero item type based on BibTeX entry type
 * @param bibtexType The BibTeX entry type (e.g., "article", "misc")
 * @returns The corresponding Zotero item type
 */
export function bibtexTypeToZoteroType(bibtexType: string): string {
  const mapping: Record<string, string> = {
    article: "journalArticle",
    inproceedings: "conferencePaper",
    proceedings: "conferencePaper",
    incollection: "bookSection",
    book: "book",
    phdthesis: "thesis",
    mastersthesis: "thesis",
    techreport: "report",
    manual: "document",
    misc: "document",
    unpublished: "manuscript",
  };
  return mapping[bibtexType.toLowerCase()] || "journalArticle";
}

/**
 * Fill missing fields on a Zotero item using parsed BibTeX data.
 * Only fills fields that are currently empty/null on the item.
 * @param item The Zotero item to fill
 * @param bibtexRef The raw BibTeX string from the API
 * @returns true if any fields were updated
 */
export function fillMissingFieldsFromBibtex(item: Zotero.Item, bibtexRef: string | null | undefined): boolean {
  const parsed = parseBibtex(bibtexRef);
  if (!parsed) return false;

  let updated = false;

  const setIfEmpty = (field: string, value: string | undefined): boolean => {
    if (!value) return false;
    try {
      const current = item.getField(field);
      if (!current || String(current).trim() === "") {
        item.setField(field, value);
        updated = true;
        return true;
      }
    } catch {
      // Field may not be valid for this item type
    }
    return false;
  };

  // Fill publicationTitle from journal or booktitle (NOT publisher)
  // - journalArticle uses "publicationTitle"
  // - conferencePaper uses "conferenceName" or "publicationTitle"
  // - bookSection uses "publicationTitle" (booktitle)
  const publicationTitle = parsed.journal || parsed.booktitle;
  if (publicationTitle) {
    setIfEmpty("publicationTitle", publicationTitle);
  }

  // Fill publisher separately — this is always the actual publisher (e.g., "Springer")
  // For item types that don't support publicationTitle (document, report, etc.),
  // also try using journal/booktitle as publicationTitle fallback
  if (parsed.publisher) {
    setIfEmpty("publisher", parsed.publisher);
  }
  // For item types without publicationTitle (e.g., document/misc),
  // use journal/booktitle as publisher if publisher wasn't set from BibTeX
  if (!parsed.publisher && publicationTitle) {
    setIfEmpty("publisher", publicationTitle);
  }

  setIfEmpty("volume", parsed.volume);
  setIfEmpty("issue", parsed.number);
  setIfEmpty("pages", parsed.pages);
  setIfEmpty("url", parsed.url);
  setIfEmpty("DOI", parsed.doi);
  setIfEmpty("date", parsed.year);
  setIfEmpty("ISSN", parsed.issn);

  return updated;
}
