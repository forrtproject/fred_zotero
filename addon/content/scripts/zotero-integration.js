/**
 * File Description: zotero-integration.js
 * This file contains utility functions for interacting with Zotero's API. It handles extracting DOIs from the library or selected items,
 * adding tags and notes to items, and getting item details. This module bridges the plugin's logic with Zotero's data model.
 */
var ZoteroIntegration = {

  async getAllDOIsFromLibrary() {
    const libraryID = Zotero.getActiveZoteroPane().getSelectedLibraryID();
    const items = [];
    const search = new Zotero.Search();
    search.libraryID = libraryID; 
    search.addCondition('itemType', 'isNot', 'attachment');
    search.addCondition('itemType', 'isNot', 'note');
    const itemIDs = await search.search();

    Zotero.debug(`Found ${itemIDs.length} items in library`);

    for (let itemID of itemIDs) {
        const item = await Zotero.Items.getAsync(itemID);
        let doi = item.getField('DOI');
        if (!doi) {
            const extra = item.getField('extra');
            if (extra) {
                const doiMatch = extra.match(/doi\s*[:=]\s*([^\n]+)/i);
                if (doiMatch) {
                    doi = doiMatch[1].trim();
                }
            }
        }
        if (doi) {
            items.push({ itemID, doi });
        }
    }

    Zotero.debug(`Found ${items.length} items with DOIs`);
    return items;
  },

  getSelectedDOIs() {
    const items = [];
    const selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();

    for (let item of selectedItems) {
      let doi = item.getField('DOI');
      if (!doi) {
          const extra = item.getField('extra');
          if (extra) {
              const doiMatch = extra.match(/doi\s*[:=]\s*([^\n]+)/i);
              if (doiMatch) {
                  doi = doiMatch[1].trim();
              }
          }
      }
      if (doi) {
        items.push({ itemID: item.id, doi });
      }
    }

    return items;
  },

  async getDOIsFromCollection(collectionID) {
    const items = [];
    const collection = Zotero.Collections.get(collectionID);
    if (!collection) {
      Zotero.debug(`Collection with ID ${collectionID} not found`);
      return items;
    }

    const libraryID = collection.libraryID;
    const processCollection = async (colID) => {
      const col = Zotero.Collections.get(colID);
      if (!col) return;

      const search = new Zotero.Search();
      search.libraryID = libraryID;
      search.addCondition('collection', 'is', colID.toString());
      search.addCondition('itemType', 'isNot', 'attachment');
      search.addCondition('itemType', 'isNot', 'note');
      const itemIDs = await search.search();

      for (let itemID of itemIDs) {
        const item = await Zotero.Items.getAsync(itemID);
        let doi = item.getField('DOI');
        if (!doi) {
            const extra = item.getField('extra');
            if (extra) {
                const doiMatch = extra.match(/doi\s*[:=]\s*([^\n]+)/i);
                if (doiMatch) {
                    doi = doiMatch[1].trim();
                }
            }
        }
        if (doi) {
          items.push({ itemID, doi });
        }
      }

      // Recursively process subcollections
      const subCollections = Zotero.Collections.getByParent(colID, true) || [];
      for (let subCol of subCollections) {
        await processCollection(subCol.id);
      }
    };

    await processCollection(collectionID);
    Zotero.debug(`Found ${items.length} items with DOIs in collection ${collectionID}`);
    return items;
  },

  async addTag(itemID, tagName) {
    const item = await Zotero.Items.getAsync(itemID);
    item.addTag(tagName);
    await item.saveTx();
  },

  async addNote(itemID, noteHTML) {
    const parentItem = await Zotero.Items.getAsync(itemID);
    const note = new Zotero.Item('note');
    note.libraryID = parentItem.libraryID;  
    note.parentID = itemID;
    note.setNote(noteHTML);
    await note.saveTx();
  },

  async getItemDetails(itemID) {
    const item = await Zotero.Items.getAsync(itemID);
    return {
      title: item.getField('title'),
      authors: item.getCreators().map(c => c.lastName).join(', '),
      year: item.getField('year')
    };
  },

  async hasReplicationTag(itemID) {
    const item = await Zotero.Items.getAsync(itemID);
    const tags = item.getTags();
    return tags.some(tag => tag.tag === 'Has Replication');
  }
};