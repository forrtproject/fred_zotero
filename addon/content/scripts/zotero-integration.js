/**
 * File Description: zotero-integration.js
 * This file contains utility functions for interacting with Zotero's API. It handles extracting DOIs from the library or selected items,
 * adding tags and notes to items, and getting item details. This module bridges the plugin's logic with Zotero's data model.
 */
var ZoteroIntegration = {

  async getAllDOIsFromLibrary() {
    const items = [];

    const search = new Zotero.Search();
    search.addCondition('itemType', 'isNot', 'attachment');
    search.addCondition('itemType', 'isNot', 'note');
    const itemIDs = await search.search();

    Zotero.debug(`Found ${itemIDs.length} items in library`);

    for (let itemID of itemIDs) {
      const item = await Zotero.Items.getAsync(itemID);
      const doi = item.getField('DOI');

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
      const doi = item.getField('DOI');
      if (doi) {
        items.push({ itemID: item.id, doi });
      }
    }

    return items;
  },

  async addTag(itemID, tagName) {
    const item = await Zotero.Items.getAsync(itemID);
    item.addTag(tagName);
    await item.saveTx();
  },

  async addNote(itemID, noteHTML) {
    const note = new Zotero.Item('note');
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