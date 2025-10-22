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
      // Initialize data source with API (replaced CSV with API)
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
        
        // Skip attachments, notes, and items already tagged
        if (!item || item.isAttachment() || item.isNote()) {
          continue;
        }

        const doi = item.getField('DOI');
        if (doi) {
          // Check if already has replication tag
          const hasTag = await ZoteroIntegration.hasReplicationTag(itemID);
          if (!hasTag) {
            itemsToCheck.push({ itemID, doi });
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
      const itemTitle = item.getField('title');

      // Build message
      let message = `Replication studies found for:\n"${itemTitle}"\n\n`;
      message += `Found ${replications.length} replication(s):\n\n`;

      for (let i = 0; i < Math.min(replications.length, 3); i++) {
        const rep = replications[i];
        message += `${i + 1}. ${rep.title_r}\n`;
        message += `   ${rep.author_r} (${rep.year_r})\n`;
        message += `   Outcome: ${rep.outcome || 'Not specified'}\n\n`;
      }

      if (replications.length > 3) {
        message += `...and ${replications.length - 3} more replication(s)\n\n`;
      }

      message += `Would you like to:\n`;
      message += `• Add "Has Replication" tag\n`;
      message += `• Add detailed note with replication information`;

      // Show confirmation dialog
      const ps = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
        .getService(Components.interfaces.nsIPromptService);

      const result = ps.confirm(
        win,
        "Replication Studies Found",
        message
      );

      if (result) {
        // User clicked "OK" - add tag and note
        await this.notifyUser(itemID, replications);
        
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
      Zotero.logError("Error showing replication dialog: " + error);
    }
  },

  /**
   * Check entire library for replications
   */
  async checkEntireLibrary() {
    try {
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
      Zotero.logError("Error checking library: " + error);
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
      // Get selected DOIs
      const selectedItems = ZoteroIntegration.getSelectedDOIs();
      const dois = selectedItems.map(item => item.doi);

      if (dois.length === 0) {
        const win = Zotero.getMainWindow();
        if (win) {
          win.alert("No DOIs", "No DOIs found in selected items");
        }
        return;
      }

      // Check for replications
      const results = await this.matcher.checkBatch(dois);

      // Process results
      for (let result of results) {
        if (result.replications.length > 0) {
          const libraryItem = selectedItems.find(item =>
            item.doi.toLowerCase() === result.doi.toLowerCase()
          );

          if (libraryItem) {
            const hasTag = await ZoteroIntegration.hasReplicationTag(libraryItem.itemID);
            if (!hasTag) {
              await this.notifyUser(libraryItem.itemID, result.replications);
            }
          }
        }
      }

      // Show detailed alert
      this.showResultsAlert(results, dois.length, selectedItems.length, true);
    } catch (error) {
      Zotero.logError("Error checking selected items: " + error);
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
    // Add tag
    await ZoteroIntegration.addTag(itemID, "Has Replication");

    // Create note with replication details
    const note = this.createReplicationNote(replications);
    await ZoteroIntegration.addNote(itemID, note);
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
    html += `
      <hr/>
      <div style="background:#e6f2ff; padding:10px; border-radius:5px; margin-top:15px;">
        <p><strong>Did you find this result useful? Leave us <a href="https://tinyurl.com/y5evebv9" target="_blank">feedback</a>!</strong></p>
        <p>
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

    message += "\nSelect individual items and use 'Check for Replications' for details.";

    win.alert(message);
  },

  /**
   * Shutdown function - cleanup
   */
  shutdown() {
    this.unregisterNotifier();
  }
};
