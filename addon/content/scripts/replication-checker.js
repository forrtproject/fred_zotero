/**
 * File Description: replication-checker.js
 * This file contains the main plugin logic for checking replications. It initializes the data source (API),
 * creates the matcher, handles library and selected item checks, notifies users, and formats notes.
 * This is the core module that ties everything together.
 */
var ReplicationCheckerPlugin = {
  dataSource: null,
  matcher: null,
  rootURI: null,
  notifierID: null,

  async init(rootURI) {
    this.rootURI = rootURI;

    try {
      Zotero.debug("Initializing data source with API");
      this.dataSource = new APIDataSource();
      await this.dataSource.initialize();
      this.matcher = new BatchMatcher(this.dataSource);
      this.registerNotifier();
      Zotero.debug("ReplicationChecker initialized with API data source and notifier");
    } catch (error) {
      Zotero.logError("Failed to initialize data source: " + error);
      throw error;
    }
  },

  /**
   * Register Zotero notifier to watch for new items
   */
  registerNotifier() {
    const notifierCallback = {
      notify: async (event, type, ids, extraData) => {
        if (event === 'add' && type === 'item') {
          setTimeout(async () => {
            await this.checkNewItems(ids);
          }, 2000);
        }
      }
    };
    this.notifierID = Zotero.Notifier.registerObserver(notifierCallback, ['item']);
    Zotero.debug("ReplicationChecker: Notifier registered for new items");
  },

  /**
   * Unregister notifier on shutdown
   */
  unregisterNotifier() {
    if (this.notifierID) {
      Zotero.Notifier.unregisterObserver(this.notifierID);
      Zotero.debug("ReplicationChecker: Notifier unregistered");
    }
  },

  /**
   * Helper to create and manage progress window
   */
  _createProgressWindow(headline) {
    const progressWin = new Zotero.ProgressWindow();
    progressWin.changeHeadline(headline);
    progressWin.show();
    return {
      addLines: (lines) => progressWin.addLines(lines),
      complete: (message) => {
        progressWin.changeHeadline("Check Complete");
        progressWin.addLines([message]);
        progressWin.startCloseTimer(3000);
      }
    };
  },

  /**
   * Helper to deduplicate DOIs from items
   * @param {Array} items - Array of items with doi and itemID
   * @returns {Object} - { uniqueDois, itemCount }
   */
  _getUniqueDois(items) {
    const uniqueDois = [...new Set(items.map(item => item.doi.toLowerCase()))].map(doi => 
      items.find(item => item.doi.toLowerCase() === doi).doi
    );
    return { uniqueDois, itemCount: items.length };
  },

  /**
   * Helper to process replication results
   * @param {Array} results - Replication check results
   * @param {Array} libraryItems - Items with itemID and doi
   * @returns {number} - Number of items with replications
   */
  async _processReplicationResults(results, libraryItems) {
    const processedItems = new Set();
    let matchCount = 0;

    for (let result of results) {
      if (result.replications.length > 0) {
        const matchingItems = libraryItems.filter(item =>
          this.matcher._normalizeDoi(item.doi) === result.doi
        );
        for (let libraryItem of matchingItems) {
          if (!processedItems.has(libraryItem.itemID)) {
            const hasTag = await ZoteroIntegration.hasReplicationTag(libraryItem.itemID);
            if (!hasTag || result.replications.length > 0) {
              await this.notifyUserAndAddReplications(libraryItem.itemID, result.replications);
              processedItems.add(libraryItem.itemID);
              matchCount++;
            }
          }
        }
      }
    }
    return matchCount;
  },

  /**
   * Check newly added items for replications
   * @param {Array} itemIDs - Array of newly added item IDs
   */
  async checkNewItems(itemIDs) {
    try {
      const itemsToCheck = [];

      for (let itemID of itemIDs) {
        const item = await Zotero.Items.getAsync(itemID);
        if (!item || item.isAttachment() || item.isNote()) {
          continue;
        }

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
          const normalizedDoi = new BatchMatcher(null)._normalizeDoi(doi);
          if (normalizedDoi) {
            itemsToCheck.push({ itemID, doi: normalizedDoi });
          }
        }
      }

      if (itemsToCheck.length === 0) {
        return;
      }

      Zotero.debug(`ReplicationChecker: Checking ${itemsToCheck.length} new item(s) for replications`);
      const dois = itemsToCheck.map(item => item.doi);
      const results = await this.matcher.checkBatch(dois);

      for (let result of results) {
        if (result.replications.length > 0) {
          const itemData = itemsToCheck.find(item =>
            item.doi.toLowerCase() === result.doi.toLowerCase()
          );
          if (itemData) {
            await this.showReplicationDialog(itemData.itemID, result.replications);
          }
        }
      }
    } catch (error) {
      Zotero.logError("Error checking new items: " + error);
    }
  },

  /**
   * Show dialog asking user if they want to add replication information
   * @param {number} itemID
   * @param {Array} replications
   */
  async showReplicationDialog(itemID, replications) {
    try {
      const win = Zotero.getMainWindow();
      if (!win) return;

      const item = await Zotero.Items.getAsync(itemID);
      const itemTitle = item.getField('title');

      let message = `Replication studies found for:\n"${itemTitle}"\n\n`;
      message += `Found ${replications.length} replication(s):\n\n`;

      for (let i = 0; i < Math.min(replications.length, 3); i++) {
        const rep = replications[i];
        message += `${i + 1}. ${rep.title_r}\n`;
        message += `(${rep.year_r})\n`;
        message += `   Outcome: ${rep.outcome || 'Not specified'}\n\n`;
      }

      if (replications.length > 3) {
        message += `...and ${replications.length - 3} more replication(s)\n\n`;
      }

      message += `Would you like to:\n`;
      message += `• Add "Has Replication" tag\n`;
      message += `• Add detailed note with replication information`;

      const result = Services.prompt.confirm(
        win,
        "Replication Studies Found",
        message
      );

      if (result) {
        await this.notifyUserAndAddReplications(itemID, replications);
        const progressWin = this._createProgressWindow("Replication Information Added");
        progressWin.addLines([`Added replication information to "${itemTitle}"`]);
        progressWin.complete("Replication information added");
        Zotero.debug(`ReplicationChecker: User accepted replication info for item ${itemID}`);
      } else {
        Zotero.debug(`ReplicationChecker: User declined replication info for item ${itemID}`);
      }
    } catch (error) {
      Zotero.logError("Error showing replication dialog: " + error);
    }
  },

  /**
   * Check entire library for replications
   */
  async checkEntireLibrary() {
    try {
      const progressWin = this._createProgressWindow("Checking for Replications");
      progressWin.addLines(["Scanning library..."]);

      const libraryItems = await ZoteroIntegration.getAllDOIsFromLibrary();
      const { uniqueDois, itemCount } = this._getUniqueDois(libraryItems);

      progressWin.addLines([`Found ${itemCount} items with DOIs (${uniqueDois.length} unique)`]);
      progressWin.addLines(["Checking against replication database..."]);

      const results = await this.matcher.checkBatch(uniqueDois);
      const matchCount = await this._processReplicationResults(results, libraryItems);

      progressWin.complete(`Found ${matchCount} item(s) with replications`);
    } catch (error) {
      Zotero.logError("Error checking library: " + error);
    }
  },

  /**
   * Check selected items for replications
   */
  async checkSelectedItems() {
    try {
      const selectedItems = ZoteroIntegration.getSelectedDOIs();
      const { uniqueDois, itemCount } = this._getUniqueDois(selectedItems);

      if (uniqueDois.length === 0) {
        const win = Zotero.getMainWindow();
        if (win) {
          Services.prompt.alert(win, "Zotero Replication Checker", "No DOIs found in selected items");
        }
        return;
      }

      const results = await this.matcher.checkBatch(uniqueDois);
      const matchCount = await this._processReplicationResults(results, selectedItems);
      this.showResultsAlert(results, uniqueDois.length, itemCount, true);
    } catch (error) {
      Zotero.logError("Error checking selected items: " + error);
    }
  },

  /**
   * Check selected collection for replications
   */
  async checkSelectedCollection() {
    try {
      const collection = Zotero.getActiveZoteroPane().getSelectedCollection();
      if (!collection) {
        const win = Zotero.getMainWindow();
        if (win) {
          win.alert("No Collection", "No collection selected");
        }
        return;
      }

      const progressWin = this._createProgressWindow("Checking for Replications in Collection");
      progressWin.addLines(["Scanning collection..."]);

      const selectedItems = await ZoteroIntegration.getDOIsFromCollection(collection.id);
      Zotero.debug(`Retrieved ${selectedItems.length} items from collection ${collection.id}`);
      if (!selectedItems || selectedItems.length === 0) {
        progressWin.complete("No items with DOIs found in collection");
        const win = Zotero.getMainWindow();
        if (win) {
          win.alert("No DOIs", "No DOIs found in collection");
        }
        return;
      }

      const { uniqueDois, itemCount } = this._getUniqueDois(selectedItems);
      progressWin.addLines([`Found ${itemCount} items with DOIs (${uniqueDois.length} unique)`]);
      progressWin.addLines(["Checking against replication database..."]);

      const results = await this.matcher.checkBatch(uniqueDois);
      const matchCount = await this._processReplicationResults(results, selectedItems);
      progressWin.complete(`Found ${matchCount} item(s) with replications`);
      this.showResultsAlert(results, uniqueDois.length, itemCount, false, true);
    } catch (error) {
      Zotero.logError("Error checking collection: " + error);
    }
  },

  /**
   * Notify user about replications found
   * @param {number} itemID
   * @param {Array} replications
   */
  async notifyUser(itemID, replications) {
    try {
      const item = await Zotero.Items.getAsync(itemID);

      const seen = new Set();
      const uniqueReplications = replications.filter(rep => {
        const doi_r = (rep.doi_r || '').trim();
        if (doi_r && !seen.has(doi_r)) {
          seen.add(doi_r);
          return true;
        }
        return false;
      });

      await ZoteroIntegration.addTag(itemID, "Has Replication");

      const allowedOutcomes = {
        successful: "Replication: Successful",
        failed: "Replication: Failure",
        mixed: "Replication: Mixed"
      };
      const uniqueOutcomes = new Set(
        uniqueReplications
          .map(r => r.outcome && typeof r.outcome === 'string' ? r.outcome.toLowerCase() : null)
          .filter(o => o && Object.keys(allowedOutcomes).includes(o))
      );

      await Promise.all(
        [...uniqueOutcomes].map(outcome =>
          ZoteroIntegration.addTag(itemID, allowedOutcomes[outcome])
        )
      );

      const noteIDs = item.getNotes();
      let existingNote = null;
      for (let noteID of noteIDs) {
        const note = await Zotero.Items.getAsync(noteID);
        const currentNoteHTML = note.getNote();
        if (currentNoteHTML.startsWith('<h2>Replications Found</h2>')) {
          existingNote = note;
          break;
        }
      }

      if (existingNote) {
        let currentHTML = existingNote.getNote();
        const parser = new DOMParser();
        const doc = parser.parseFromString(currentHTML, 'text/html');
        const ul = doc.querySelector('ul');
        if (!ul) {
          existingNote.setNote(this.createReplicationNote(uniqueReplications));
          await existingNote.saveTx();
          return;
        }

        const existingLis = Array.from(ul.querySelectorAll('li'));
        const existingDOIs = new Set();
        existingLis.forEach(liElem => {
          const doiA = liElem.querySelector('a[href^="https://doi.org/"]');
          if (doiA) {
            const doi = doiA.href.replace('https://doi.org/', '').trim();
            existingDOIs.add(doi);
          }
        });

        let added = false;
        uniqueReplications.forEach(rep => {
          const doi_r = (rep.doi_r || '').trim();
          if (doi_r && !existingDOIs.has(doi_r)) {
            const newLiHTML = this._createReplicationLi(rep);
            ul.insertAdjacentHTML('beforeend', newLiHTML);
            existingDOIs.add(doi_r);
            added = true;
          }
        });

        if (added) {
          const newHTML = doc.body.innerHTML;
          existingNote.setNote(newHTML);
          await existingNote.saveTx();
        }
      } else {
        const noteHTML = this.createReplicationNote(uniqueReplications);
        await ZoteroIntegration.addNote(itemID, noteHTML);
      }
    } catch (error) {
      Zotero.logError(`Failed to notify user for item ${itemID}: ${error.message}`);
      throw error;
    }
  },

  /**
   * Notify user and add replications to folder (wrapper function)
   * @param {number} itemID
   * @param {Array} replications
   */
  async notifyUserAndAddReplications(itemID, replications) {
    try {
      await this.notifyUser(itemID, replications);
      await this.addReplicationsToFolder(itemID, replications);
    } catch (error) {
      Zotero.logError(`Error in notifyUserAndAddReplications for item ${itemID}: ${error.message}`);
      throw error;
    }
  },

  /**
   * Add replications to "Replication folder" collection
   * @param {number} itemID
   * @param {Array} replications
   */
  async addReplicationsToFolder(itemID, replications) {
    try {
      const item = await Zotero.Items.getAsync(itemID);
      const seen = new Set();
      const uniqueReplications = replications.filter(rep => {
        const doi_r = (rep.doi_r || '').trim();
        if (doi_r && !seen.has(doi_r)) {
          seen.add(doi_r);
          return true;
        }
        return false;
      });

      const libraryID = item.libraryID;
      let collections = Zotero.Collections.getByLibrary(libraryID, true);
      let replicationCollection = collections.find(c => c.name === "Replication folder" && !c.parentID);

      if (!replicationCollection) {
        replicationCollection = new Zotero.Collection();
        replicationCollection.libraryID = libraryID;
        replicationCollection.name = "Replication folder";
        await replicationCollection.saveTx();
        Zotero.debug(`Created new "Replication folder" collection in library ${libraryID}`);
      }

      await Zotero.DB.executeTransaction(async function() {
        for (let rep of uniqueReplications) {
          const doi_r = (rep.doi_r || '').trim();
          if (!doi_r || !doi_r.startsWith('10.')) {
            Zotero.debug(`Skipping invalid or missing DOI for replication: ${doi_r}`);
            continue;
          }

          const search = new Zotero.Search();
          search.libraryID = libraryID;
          search.addCondition('DOI', 'is', doi_r);
          const existingIDs = await search.search();

          let replicationItemID;
          let replicationItem;

          if (existingIDs.length > 0) {
            // Take the first existing item if multiple (you may want to handle multiples differently)
            replicationItemID = existingIDs[0];
            replicationItem = await Zotero.Items.getAsync(replicationItemID);
            Zotero.debug(`Found existing replication item with DOI: ${doi_r} (ID: ${replicationItemID})`);
          } else {
            try {
              const newItem = new Zotero.Item('journalArticle');
              newItem.libraryID = libraryID;
              newItem.setField('title', rep.title_r || 'Untitled Replication');
              newItem.setField('publicationTitle', rep.journal_r || '');
              newItem.setField('volume', rep.volume_r || '');
              newItem.setField('issue', rep.issue_r || '');
              newItem.setField('pages', rep.pages_r || '');
              newItem.setField('date', rep.year_r ? rep.year_r.toString() : '');
              newItem.setField('DOI', doi_r);

              replicationItemID = await newItem.save();
              Zotero.debug(`Added new replication item with ID ${replicationItemID} for DOI ${doi_r}`);

              let authors = [];
              if (rep.author_r) {
                try {
                  if (typeof rep.author_r === 'string') {
                    authors = JSON.parse(rep.author_r);
                  } else if (Array.isArray(rep.author_r)) {
                    authors = rep.author_r;
                  }
                } catch (e) {
                  Zotero.debug(`Failed to parse authors for DOI ${doi_r}: ${e.message}`);
                  authors = [];
                }
              }

              if (authors && Array.isArray(authors) && authors.length > 0) {
                for (let author of authors) {
                  try {
                    newItem.addCreator({
                      creatorType: 'author',
                      firstName: author.given || '',
                      lastName: author.family || ''
                    });
                  } catch (e) {
                    Zotero.debug(`Failed to add creator for DOI ${doi_r}: ${e.message}`);
                  }
                }
                await newItem.save();
              }

              replicationItem = newItem;
            } catch (error) {
              Zotero.debug(`Error creating replication item for DOI ${doi_r}: ${error.message}`);
              continue; // Skip to next if creation fails
            }
          }

          // Add to collection if not already present
          if (replicationItemID && !replicationCollection.hasItem(replicationItemID)) {
            replicationCollection.addItem(replicationItemID);
            await replicationCollection.save();
            Zotero.debug(`Added replication item ${replicationItemID} to "Replication folder"`);
          } else {
            Zotero.debug(`Replication item ${replicationItemID} already in "Replication folder"`);
          }

          // Establish bidirectional relationship
          const originalItem = await Zotero.Items.getAsync(itemID);
          replicationItem = replicationItem || await Zotero.Items.getAsync(replicationItemID); // Reload if existing
          if (originalItem && replicationItem) {
            const relatedItemsOriginal = originalItem.relatedItems;
            const relatedItemsNew = replicationItem.relatedItems;
            let relationsAdded = false;

            if (!relatedItemsOriginal.some(relItem => relItem.id === replicationItemID)) {
              originalItem.addRelatedItem(replicationItem);
              await originalItem.save();
              Zotero.debug(`Added relationship from original item ${itemID} to replication ${replicationItemID}`);
              relationsAdded = true;
            }

            if (!relatedItemsNew.some(relItem => relItem.id === itemID)) {
              replicationItem.addRelatedItem(originalItem);
              await replicationItem.save();
              Zotero.debug(`Added relationship from replication ${replicationItemID} to original ${itemID}`);
              relationsAdded = true;
            }

            if (!relationsAdded) {
              Zotero.debug(`Relationships already exist between ${itemID} and ${replicationItemID}`);
            }
          }
        }
      });
    } catch (error) {
      Zotero.logError(`Failed to add replications to folder for item ${itemID}: ${error.message}`);
      throw error;
    }
  },

  /**
   * Parse authors into formatted string
   */
  _parseAuthors(authors) {
    if (!authors || !Array.isArray(authors) || authors.length === 0) return 'No authors available';
    const authorStrings = authors.map(author => {
      const initial = author.given ? author.given.split(' ').map(part => part[0] + '.').join(' ') : '';
      return `${author.family}, ${initial}`;
    });
    return authorStrings.slice(0, -1).join(', ') + (authorStrings.length > 1 ? ' & ' : '') + authorStrings.slice(-1);
  },

  _createReplicationLi(rep) {
    let li = '<li>';
    li += `<strong>${this._escapeHtml(rep.title_r || 'No title available')}</strong><br>`;
    li += `${this._parseAuthors(rep.author_r)} (${this._escapeHtml(rep.year_r || 'N/A')})<br>`;
    li += `<em>${this._escapeHtml(rep.journal_r || 'No journal')}</em><br>`;
    li += `DOI: <a href="https://doi.org/${this._escapeHtml(rep.doi_r || 'N/A')}">${this._escapeHtml(rep.doi_r || 'N/A')}</a><br>`;
    if (rep.outcome) {
      li += `Author Reported Outcome: <strong>${this._escapeHtml(rep.outcome)}</strong><br>`;
    }
    if (rep.doi_r && rep.doi_r.trim().toLowerCase() !== 'na' &&
      rep.url_r && typeof rep.url_r === 'string' && rep.url_r.trim().toLowerCase() !== 'na' &&
      rep.url_r.trim().startsWith('https')) {
      li += `This study has a linked report: <a href="${this._escapeHtml(rep.url_r.trim())}" target="_blank">${this._escapeHtml(rep.url_r.trim())}</a><br>`;
    }
    li += '</li>';
    return li;
  },

  /**
   * Format replication data as HTML note
   * @param {Array} replications
   */
  createReplicationNote(replications) {
    let html = '<h2>Replications Found</h2>';
    html += '<i>This is an automatically generated note. Do not make changes!</i><br>';
    html += '<p>This study has been replicated:</p>';
    html += '<ul>';
    for (let rep of replications) {
      html += this._createReplicationLi(rep);
    }
    html += '</ul>';
    html += `
      <hr/>
      <div style="padding:10px; border-radius:5px; margin-top:15px;">
        <p><strong>Did you find this result useful? Provide feedback <a href="https://tinyurl.com/y5evebv9" target="_blank">here</a>!</strong></p>
      </div>
    `;
    html += '<p><small>Generated by Zotero Replication Checker using the FORRT Replication Database (FReD)</small></p>';
    return html;
  },

  /**
   * Escape HTML to prevent XSS
   */
  _escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Show formatted results alert
   * @param {Array} results
   * @param {number} doiCount
   * @param {number} totalItems
   * @param {boolean} isSelected
   * @param {boolean} isCollection
   */
  showResultsAlert(results, doiCount, totalItems, isSelected = false, isCollection = false) {
    const win = Zotero.getMainWindow();
    if (!win) return;

    let message = isCollection ? "Collection Scan Complete" : (isSelected ? "Selected Items Scan Complete" : "Library Scan Complete");
    message += `\nTotal items checked: ${totalItems}`;
    message += `\nItems with DOIs: ${doiCount}`;
    message += "\n\nReplication check results:";

    const matchCount = results.filter(r => r.replications.length > 0).length;

    if (matchCount > 0) {
      message += `\n${matchCount} item(s) have replications.`;
    } else {
      message += "\nNo replications found.";
    }

    message += "\nView notes for details or select items to re-check.";
    Services.prompt.alert(win, "Zotero Replication Checker", message);
  },

  /**
   * Shutdown function - cleanup
   */
  shutdown() {
    this.unregisterNotifier();
  }
};