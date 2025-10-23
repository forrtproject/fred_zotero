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
      // Initialize data source with API
      Zotero.debug("Initializing data source with API");

      this.dataSource = new APIDataSource();
      await this.dataSource.initialize();

      // Create matcher with the API data source
      this.matcher = new BatchMatcher(this.dataSource);

      // Register notifier to watch for new items
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
          // Small delay to ensure item is fully saved
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
   * Check newly added items for replications
   * @param {Array} itemIDs - Array of newly added item IDs
   */
  async checkNewItems(itemIDs) {
  try {
    const itemsToCheck = [];

    for (let itemID of itemIDs) {
      const item = await Zotero.Items.getAsync(itemID);
      
      // Skip attachments, notes
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

    // Check for replications
    const dois = itemsToCheck.map(item => item.doi);
    const results = await this.matcher.checkBatch(dois);

    // Process results and show dialog for items with replications
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
      if (!item) return;

      const itemDetails = await ZoteroIntegration.getItemDetails(itemID);
      const ps = Services.prompt;

      let message = `Replications found for:\n\n${itemDetails.title}\nby ${itemDetails.authors} (${itemDetails.year || 'N/A'})\n\n`;
      message += `Number of replications: ${replications.length}\n\n`;
      message += "Do you want to add/update replication notes and tags to this item?";

      const buttonFlags = ps.BUTTON_POS_0 * ps.BUTTON_TITLE_YES +
                          ps.BUTTON_POS_1 * ps.BUTTON_TITLE_NO;

      const result = ps.confirmEx(win, "Replication Found", message, buttonFlags, null, null, null, null, {});

      if (result === 0) { // Yes
        await this.notifyUser(itemID, replications);
      }
    } catch (error) {
      Zotero.logError("Error showing replication dialog: " + error);
    }
  },

  /**
   * Check selected items for replications
   */
  async checkSelectedItems() {
    try {
      const progressWin = new Zotero.ProgressWindow();
      progressWin.changeHeadline("Checking Selected Items for Replications");
      progressWin.show();
      progressWin.addLines(["Scanning selected items..."]);

      const selectedItems = ZoteroIntegration.getSelectedDOIs();
      const uniqueDois = [...new Set(selectedItems.map(item => item.doi.toLowerCase()))].map(doi => selectedItems.find(item => item.doi.toLowerCase() === doi).doi);

      progressWin.addLines([`Found ${selectedItems.length} items with DOIs (${uniqueDois.length} unique)`]);
      progressWin.addLines(["Checking against replication database..."]);

      const results = await this.matcher.checkBatch(uniqueDois);

      const processedItems = new Set();
      let matchCount = 0;

      for (let result of results) {
        if (result.replications.length > 0) {
          const matchingItems = selectedItems.filter(item =>
            this.matcher._normalizeDoi(item.doi) === result.doi
          );
          for (let selectedItem of matchingItems) {
            if (!processedItems.has(selectedItem.itemID)) {
              try {
                await this.notifyUser(selectedItem.itemID, result.replications);
                matchCount++;
              } catch (error) {
                Zotero.logError(`Error processing item ${selectedItem.itemID}: ${error.message}`);
              }
              processedItems.add(selectedItem.itemID);
            }
          }
        }
      }

      progressWin.changeHeadline("Check Complete");
      progressWin.addLines([`Added/updated replication notes for ${matchCount} items`]);
      progressWin.startCloseTimer(3000);

      this.showResultsAlert(results, uniqueDois.length, selectedItems.length, true, false);
    } catch (error) {
      Zotero.logError("Error checking selected items: " + error);
      const win = Zotero.getMainWindow();
      if (win) {
        Services.prompt.alert(win, "Zotero Replication Checker", "Error checking selected items: " + error.message);
      }
    }
  },

  /**
   * Check entire collection for replications
   * @param {number} collectionID
   */
  async checkSelectedCollection(collectionID) {
    await this.checkEntireCollection(collectionID);
  },

  async checkEntireCollection(collectionID) {
    try {
      const progressWin = new Zotero.ProgressWindow();
      progressWin.changeHeadline("Checking Collection for Replications");
      progressWin.show();
      progressWin.addLines(["Scanning collection..."]);

      const collectionItems = await ZoteroIntegration.getDOIsFromCollection(collectionID);
      const uniqueDois = [...new Set(collectionItems.map(item => item.doi.toLowerCase()))].map(doi => collectionItems.find(item => item.doi.toLowerCase() === doi).doi);

      progressWin.addLines([`Found ${collectionItems.length} items with DOIs (${uniqueDois.length} unique)`]);
      progressWin.addLines(["Checking against replication database..."]);

      const results = await this.matcher.checkBatch(uniqueDois);

      const processedItems = new Set();
      let matchCount = 0;

      for (let result of results) {
        if (result.replications.length > 0) {
          const matchingItems = collectionItems.filter(item =>
            this.matcher._normalizeDoi(item.doi) === result.doi
          );
          for (let collectionItem of matchingItems) {
            if (!processedItems.has(collectionItem.itemID)) {
              try {
                await this.notifyUser(collectionItem.itemID, result.replications);
                matchCount++;
              } catch (error) {
                Zotero.logError(`Error processing item ${collectionItem.itemID}: ${error.message}`);
              }
              processedItems.add(collectionItem.itemID);
            }
          }
        }
      }

      progressWin.changeHeadline("Check Complete");
      progressWin.addLines([`Added/updated replication notes for ${matchCount} items`]);
      progressWin.startCloseTimer(3000);

      this.showResultsAlert(results, uniqueDois.length, collectionItems.length, false, true);
    } catch (error) {
      Zotero.logError("Error checking collection: " + error);
      const win = Zotero.getMainWindow();
      if (win) {
        Services.prompt.alert(win, "Zotero Replication Checker", "Error checking collection: " + error.message);
      }
    }
  },

  /**
   * Check entire library for replications
   */
  async checkEntireLibrary() {
    try {
      const progressWin = new Zotero.ProgressWindow();
      progressWin.changeHeadline("Checking Library for Replications");
      progressWin.show();
      progressWin.addLines(["Scanning library..."]);

      const libraryItems = await ZoteroIntegration.getAllDOIsFromLibrary();
      const uniqueDois = [...new Set(libraryItems.map(item => item.doi.toLowerCase()))].map(doi => libraryItems.find(item => item.doi.toLowerCase() === doi).doi);

      progressWin.addLines([`Found ${libraryItems.length} items with DOIs (${uniqueDois.length} unique)`]);
      progressWin.addLines(["Checking against replication database..."]);

      const results = await this.matcher.checkBatch(uniqueDois);

      const processedItems = new Set();
      let matchCount = 0;

      for (let result of results) {
        if (result.replications.length > 0) {
          const matchingItems = libraryItems.filter(item =>
            this.matcher._normalizeDoi(item.doi) === result.doi
          );
          for (let libraryItem of matchingItems) {
            if (!processedItems.has(libraryItem.itemID)) {
              try {
                await this.notifyUser(libraryItem.itemID, result.replications);
                matchCount++;
              } catch (error) {
                Zotero.logError(`Error processing item ${libraryItem.itemID}: ${error.message}`);
              }
              processedItems.add(libraryItem.itemID);
            }
          }
        }
      }

      progressWin.changeHeadline("Check Complete");
      progressWin.addLines([`Added/updated replication notes for ${matchCount} items`]);
      progressWin.startCloseTimer(3000);

      this.showResultsAlert(results, uniqueDois.length, libraryItems.length, false, false);
    } catch (error) {
      Zotero.logError("Error checking library: " + error);
      const win = Zotero.getMainWindow();
      if (win) {
        Services.prompt.alert(win, "Zotero Replication Checker", "Error checking library: " + error.message);
      }
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

    // Deduplicate replications by doi_r
    const seen = new Set();
    const uniqueReplications = replications.filter(rep => {
      const doi_r = (rep.doi_r || '').trim();
      if (doi_r && !seen.has(doi_r)) {
        seen.add(doi_r);
        return true;
      }
      return false;
    });

    // Always add "Has Replication" tag if missing
    await ZoteroIntegration.addTag(itemID, "Has Replication");

    // Add outcome tags based on current replications (duplicates ignored)
    const allowedOutcomes = {
      successful: "Replication: Successful",
      failure: "Replication: Failure",
      mixed: "Replication: Mixed"
    };
    const uniqueOutcomes = new Set(
      uniqueReplications
        .map(r => r.outcome && typeof r.outcome === 'string' ? r.outcome.toLowerCase() : null)
        .filter(o => o && Object.keys(allowedOutcomes).includes(o))
    );
    for (let outcome of uniqueOutcomes) {
      await ZoteroIntegration.addTag(itemID, allowedOutcomes[outcome]);
    }

    // Get child notes to find existing replication note
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
      // Incremental update: Parse HTML and append new <li> if DOI not present
      let currentHTML = existingNote.getNote();
      const parser = new DOMParser();
      const doc = parser.parseFromString(currentHTML, 'text/html');
      const ul = doc.querySelector('ul');
      if (!ul) {
        // Malformed note; overwrite as fallback
        existingNote.setNote(this.createReplicationNote(uniqueReplications));
        await existingNote.saveTx();
        return;
      }

      // Extract existing DOIs from <li>s
      const existingLis = Array.from(ul.querySelectorAll('li'));
      const existingDOIs = new Set();
      existingLis.forEach(liElem => {
        const doiA = liElem.querySelector('a[href^="https://doi.org/"]');
        if (doiA) {
          const doi = doiA.href.replace('https://doi.org/', '').trim();
          existingDOIs.add(doi);
        }
      });

      // Append new <li>s if not duplicate
      let added = false;
      uniqueReplications.forEach(rep => {
        const doi_r = (rep.doi_r || '').trim();
        if (doi_r && !existingDOIs.has(doi_r)) {
          const newLiHTML = this._createReplicationLi(rep);
          ul.insertAdjacentHTML('beforeend', newLiHTML);  // Add to end of <ul>
          existingDOIs.add(doi_r);
          added = true;
        }
      });

      if (added) {
        const newHTML = doc.body.innerHTML;  // Serialize back (preserves user content after <ul>)
        existingNote.setNote(newHTML);
        await existingNote.saveTx();
      }
    } else {
      // Create new note
      const noteHTML = this.createReplicationNote(uniqueReplications);
      await ZoteroIntegration.addNote(itemID, noteHTML);
    }

    // New: Automatically add replications to "Replication folder" collection
    const libraryID = item.libraryID; // Use same library as original item (personal or group)
    let collections = Zotero.Collections.getByLibrary(libraryID, true); // true for including subcollections, but we want top-level
    let replicationCollection = collections.find(c => c.name === "Replication folder");

    if (!replicationCollection) {
      replicationCollection = new Zotero.Collection();
      replicationCollection.libraryID = libraryID;
      replicationCollection.name = "Replication folder";
      await replicationCollection.save();
      Zotero.debug(`Created new "Replication folder" collection in library ${libraryID}`);
    }

    // WRAP THE LOOP IN A TRANSACTION
    await Zotero.DB.executeTransaction(async function() {
      for (let rep of uniqueReplications) {
        const doi_r = (rep.doi_r || '').trim();
        if (!doi_r || !doi_r.startsWith('10.')) {
          Zotero.debug(`Skipping invalid or missing DOI for replication: ${doi_r}`);
          continue; // Skip if no valid DOI
        }

        // Check for duplicate by DOI in the library
        const search = new Zotero.Search();
        search.libraryID = libraryID;
        search.addCondition('DOI', 'is', doi_r);
        const existingIDs = await search.search();
        if (existingIDs.length > 0) {
          Zotero.debug(`Skipping duplicate replication item with DOI: ${doi_r}`);
          continue;
        }

        try {
          // Create new journal article item
          const newItem = new Zotero.Item('journalArticle');
          newItem.libraryID = libraryID;
          newItem.setField('title', rep.title_r || 'Untitled Replication');
          newItem.setField('publicationTitle', rep.journal_r || '');
          newItem.setField('volume', rep.volume_r || '');
          newItem.setField('issue', rep.issue_r || '');
          newItem.setField('pages', rep.pages_r || '');
          newItem.setField('date', rep.year_r ? rep.year_r.toString() : '');
          newItem.setField('DOI', doi_r);

          // Save the new item FIRST (before adding creators)
          const newItemID = await newItem.save();
          Zotero.debug(`Added new replication item with ID ${newItemID} for DOI ${doi_r}`);

          // Parse authors from JSON string
          let authors = [];
          if (rep.author_r) {
            try {
              // author_r comes as a JSON string, need to parse it
              if (typeof rep.author_r === 'string') {
                authors = JSON.parse(rep.author_r);
              } else if (Array.isArray(rep.author_r)) {
                // Already an array (shouldn't happen but handle it)
                authors = rep.author_r;
              }
            } catch (e) {
              Zotero.debug(`Failed to parse authors for DOI ${doi_r}: ${e.message}`);
              authors = [];
            }
          }

          // Add authors AFTER saving item
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
            // Save again to commit authors
            await newItem.save();
          }

          // Add to collection
          replicationCollection.addItem(newItemID);
          await replicationCollection.save();
          Zotero.debug(`Added replication item ${newItemID} to "Replication folder"`);
        } catch (error) {
          Zotero.debug(`Error creating replication item for DOI ${doi_r}: ${error.message}`);
          // Continue to next replication even if one fails
        }
      }
    });

  } catch (error) {
    Zotero.logError(`Failed to notify user for item ${itemID}: ${error.message}`);
    throw error; // Re-throw for caller handling
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
    li += '<i>This is an automatically generated note. Do not make changes!</i><br>';
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