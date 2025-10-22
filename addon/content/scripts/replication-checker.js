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

  async init(rootURI) {
    this.rootURI = rootURI;

    try {
      // Initialize data source with API (replaced CSV with API)
      Zotero.debug("ReplicationChecker: Initializing data source with API");

      this.dataSource = new APIDataSource();
      await this.dataSource.initialize();

      // Create matcher with the API data source
      this.matcher = new BatchMatcher(this.dataSource);

      Zotero.debug("ReplicationChecker: Initialized with API data source");
    } catch (error) {
      Zotero.logError("ReplicationChecker: Failed to initialize data source: " + error);
      throw error;
    }
  },

  /**
   * Check entire library for replications
   */
  async checkEntireLibrary() {
    try {
      Zotero.debug("ReplicationChecker: Starting library check");
      
      // Show progress
      const progressWin = new Zotero.ProgressWindow();
      progressWin.changeHeadline("Checking for Replications");
      progressWin.show();
      progressWin.addLines(["Scanning library..."]);

      // Get all DOIs from library
      const libraryItems = await ZoteroIntegration.getAllDOIsFromLibrary();
      const dois = libraryItems.map(item => item.doi);

      progressWin.addLines([`Found ${dois.length} items with DOIs`]);
      progressWin.addLines(["Checking against replication database..."]);

      // Check for replications using the matcher and API
      const results = await this.matcher.checkBatch(dois);

      // Process results
      let matchCount = 0;
      let newMatchCount = 0;

      for (let result of results) {
        if (result.replications.length > 0) {
          // Find the item ID for this DOI
          const libraryItem = libraryItems.find(item =>
            item.doi.toLowerCase() === result.doi.toLowerCase()
          );

          if (libraryItem) {
            // Check if already tagged
            const hasTag = await ZoteroIntegration.hasReplicationTag(libraryItem.itemID);
            if (!hasTag) {
              await this.notifyUser(libraryItem.itemID, result.replications);
              newMatchCount++;
            }
            matchCount++;
          }
        }
      }

      // Update progress
      progressWin.changeHeadline("Check Complete");
      progressWin.addLines([`Found replications for ${matchCount} items (${newMatchCount} new)`]);
      progressWin.startCloseTimer(3000);

      // Show detailed alert
      this.showResultsAlert(results, dois.length, libraryItems.length);
    } catch (error) {
      Zotero.logError("ReplicationChecker: Error checking library: " + error);
      Zotero.logError(error.stack);
      const win = Zotero.getMainWindow();
      if (win) {
        win.alert("Error", "Error checking for replications: " + error.message);
      }
    }
  },

  /**
   * Check selected items for replications
   */
  async checkSelectedItems() {
    try {
      Zotero.debug("ReplicationChecker: Starting selected items check");
      
      // Get selected DOIs
      const selectedItems = ZoteroIntegration.getSelectedDOIs();
      const dois = selectedItems.map(item => item.doi);

      Zotero.debug(`ReplicationChecker: Found ${dois.length} selected items with DOIs`);

      if (dois.length === 0) {
        const win = Zotero.getMainWindow();
        if (win) {
          win.alert("No DOIs", "No DOIs found in selected items");
        }
        return;
      }

      // Check for replications
      Zotero.debug("ReplicationChecker: Checking for replications...");
      const results = await this.matcher.checkBatch(dois);
      
      Zotero.debug(`ReplicationChecker: Got ${results.length} results`);

      // Process results
      for (let result of results) {
        Zotero.debug(`ReplicationChecker: Processing result for DOI ${result.doi}, replications: ${result.replications.length}`);
        
        if (result.replications.length > 0) {
          const libraryItem = selectedItems.find(item =>
            item.doi.toLowerCase() === result.doi.toLowerCase()
          );

          if (libraryItem) {
            Zotero.debug(`ReplicationChecker: Found library item ${libraryItem.itemID} for DOI ${result.doi}`);
            
            const hasTag = await ZoteroIntegration.hasReplicationTag(libraryItem.itemID);
            Zotero.debug(`ReplicationChecker: Item ${libraryItem.itemID} already has tag: ${hasTag}`);
            
            if (!hasTag) {
              Zotero.debug(`ReplicationChecker: Adding tag and note to item ${libraryItem.itemID}`);
              await this.notifyUser(libraryItem.itemID, result.replications);
              Zotero.debug(`ReplicationChecker: Successfully added tag and note to item ${libraryItem.itemID}`);
            } else {
              Zotero.debug(`ReplicationChecker: Item ${libraryItem.itemID} already tagged, skipping`);
            }
          }
        }
      }

      // Show detailed alert
      this.showResultsAlert(results, dois.length, selectedItems.length, true);
    } catch (error) {
      Zotero.logError("ReplicationChecker: Error checking selected items: " + error);
      Zotero.logError(error.stack);
      const win = Zotero.getMainWindow();
      if (win) {
        win.alert("Error", "Error checking for replications: " + error.message);
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
      Zotero.debug(`ReplicationChecker: notifyUser called for item ${itemID} with ${replications.length} replications`);
      
      // Add tag
      Zotero.debug(`ReplicationChecker: Adding tag to item ${itemID}`);
      await ZoteroIntegration.addTag(itemID, "Has Replication");
      Zotero.debug(`ReplicationChecker: Tag added successfully`);

      // Create note with replication details
      Zotero.debug(`ReplicationChecker: Creating note for item ${itemID}`);
      const note = this.createReplicationNote(replications);
      await ZoteroIntegration.addNote(itemID, note);
      Zotero.debug(`ReplicationChecker: Note added successfully`);
      
    } catch (error) {
      Zotero.logError(`ReplicationChecker: Error in notifyUser for item ${itemID}: ` + error);
      Zotero.logError(error.stack);
      throw error;
    }
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
      html += '<li>';
      html += `<strong>${this._escapeHtml(rep.title_r)}</strong><br>`;
      html += `${this._escapeHtml(rep.author_r)} (${this._escapeHtml(rep.year_r)})<br>`;
      html += `<em>${this._escapeHtml(rep.journal_r)}</em><br>`;
      html += `DOI: <a href="https://doi.org/${this._escapeHtml(rep.doi_r)}">${this._escapeHtml(rep.doi_r)}</a><br>`;
      if (rep.outcome) {
        html += `Outcome: <strong>${this._escapeHtml(rep.outcome)}</strong>`;
      }
      html += '</li>';
    }

    html += '</ul>';
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
   */
  showResultsAlert(results, doiCount, totalItems, isSelected = false) {
    const win = Zotero.getMainWindow();
    if (!win) return;

    let message = isSelected ? "Selected Items Scan Complete" : "Library Scan Complete";
    message += "\nTotal items: " + totalItems;
    message += "\nItems with DOIs: " + doiCount;
    message += "\n\nItems with replications:";

    const matchCount = results.filter(r => r.replications.length > 0).length;

    if (matchCount > 0) {
      message += "\n";

      for (const result of results) {
        if (result.replications.length > 0) {
          const title = result.title || result.doi;
          message += "• " + title + "\n";
          message += "  " + result.replications.length + " replication(s) found\n";
          for (const replication of result.replications) {
            message += "    - " + replication.title_r + " (DOI: " + replication.doi_r + ")\n";
          }
          message += "\n";
        }
      }
    } else {
      message += "\nNo replications found.";
    }

    message += "\nTags and notes have been added to items with replications.";

    win.alert(message);
  }
};
