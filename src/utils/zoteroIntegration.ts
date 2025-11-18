/**
 * Zotero integration utilities
 * Handles extraction of DOIs from items, adding tags/notes, and other Zotero API operations
 */

import type { ZoteroItemData } from "../types/replication";

/**
 * Get all DOIs from the active library
 * Searches for items with DOI field or DOI in Extra field
 * @returns Array of items with their DOIs
 */
export async function getAllDOIsFromLibrary(): Promise<ZoteroItemData[]> {
  const libraryID = Zotero.getActiveZoteroPane().getSelectedLibraryID();
  const items: ZoteroItemData[] = [];

  const search = new Zotero.Search();
  search.libraryID = libraryID;
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

    const search = new Zotero.Search();
    search.libraryID = libraryID;
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
  note.libraryID = parentItem.libraryID;
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
  return tags.some((tag: any) => tag.tag === "Has Replication");
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
