/**
 * Preferences Pane Script for Blacklist Management
 * Loaded when the preference pane opens
 */

let selectedDOI = null;

/**
 * Load and display the blacklist UI
 */
async function loadBlacklistUI() {
  try {
    // Wait for blacklist manager to be available
    if (!Zotero.ReplicationChecker?.blacklistManager) {
      Zotero.debug('[ReplicationChecker Prefs] BlacklistManager not yet available, retrying in 100ms...');
      // Retry after a short delay
      setTimeout(() => loadBlacklistUI(), 100);
      return;
    }

    const blacklistManager = Zotero.ReplicationChecker.blacklistManager;
    Zotero.debug('[ReplicationChecker Prefs] BlacklistManager found, getting entries...');

    // Check raw preference value for debugging
    try {
      const rawPref = Zotero.Prefs.get('extensions.zotero.replication-checker.blacklist');
      Zotero.debug(`[ReplicationChecker Prefs] Raw preference value: ${rawPref}`);
    } catch (e) {
      Zotero.debug(`[ReplicationChecker Prefs] Could not read raw preference: ${e}`);
    }

    const entries = blacklistManager.getEntriesWithMetadata();
    Zotero.debug(`[ReplicationChecker Prefs] Retrieved ${entries.length} blacklist entries`);

    // Log first entry for debugging if available
    if (entries.length > 0) {
      Zotero.debug(`[ReplicationChecker Prefs] First entry: ${JSON.stringify(entries[0])}`);
    }

    const listContainer = document.getElementById('blacklist-list');
    if (!listContainer) {
      Zotero.debug('[ReplicationChecker Prefs] blacklist-list container not found');
      return;
    }

    // Clear existing content
    listContainer.innerHTML = '';

    if (entries.length === 0) {
      // Show empty message
      const emptyP = document.createElement('p');
      emptyP.id = 'blacklist-empty';
      emptyP.style.color = '#999';
      emptyP.style.fontStyle = 'italic';
      emptyP.textContent = 'No banned replications';
      listContainer.appendChild(emptyP);

      // Disable remove button
      document.getElementById('blacklist-remove-btn').disabled = true;
      selectedDOI = null;
      return;
    }

    // Create list of entries
    for (const entry of entries) {
      const entryDiv = document.createElement('div');
      entryDiv.className = 'blacklist-entry';
      entryDiv.style.padding = '8px';
      entryDiv.style.marginBottom = '4px';
      entryDiv.style.cursor = 'pointer';
      entryDiv.style.borderRadius = '4px';
      entryDiv.style.border = '1px solid transparent';
      entryDiv.setAttribute('data-doi', entry.doi);

      const titleDiv = document.createElement('div');
      titleDiv.style.fontWeight = 'bold';
      titleDiv.style.marginBottom = '2px';
      titleDiv.textContent = entry.replicationTitle;

      const originalDiv = document.createElement('div');
      originalDiv.style.fontSize = '0.9em';
      originalDiv.style.color = '#666';
      originalDiv.textContent = `Original: ${entry.originalTitle}`;

      const dateDiv = document.createElement('div');
      dateDiv.style.fontSize = '0.8em';
      dateDiv.style.color = '#999';
      dateDiv.style.marginTop = '2px';
      const date = new Date(entry.dateAdded);
      dateDiv.textContent = `Banned: ${date.toLocaleDateString()}`;

      entryDiv.appendChild(titleDiv);
      entryDiv.appendChild(originalDiv);
      entryDiv.appendChild(dateDiv);

      // Click handler for selection
      entryDiv.addEventListener('click', function() {
        // Remove selection from all entries
        const allEntries = document.querySelectorAll('.blacklist-entry');
        allEntries.forEach(e => {
          e.style.backgroundColor = '';
          e.style.border = '1px solid transparent';
        });

        // Select this entry
        entryDiv.style.backgroundColor = '#e3f2fd';
        entryDiv.style.border = '1px solid #2196f3';
        selectedDOI = entry.doi;

        // Enable remove button
        document.getElementById('blacklist-remove-btn').disabled = false;
      });

      listContainer.appendChild(entryDiv);
    }

  } catch (error) {
    Zotero.logError(error);
    Zotero.debug('[ReplicationChecker Prefs] Error loading blacklist UI: ' + error);
  }
}

/**
 * Remove selected entry from blacklist
 */
async function removeSelectedBlacklist() {
  if (!selectedDOI) return;

  try {
    const blacklistManager = Zotero.ReplicationChecker.blacklistManager;
    await blacklistManager.removeFromBlacklist(selectedDOI);
    Zotero.debug(`[ReplicationChecker Prefs] Removed ${selectedDOI} from blacklist`);
    selectedDOI = null;
    await loadBlacklistUI();
  } catch (error) {
    Zotero.logError(error);
    alert('Failed to remove entry from blacklist');
  }
}

/**
 * Clear all entries from blacklist
 */
async function clearAllBlacklist() {
  const confirmed = confirm('Are you sure you want to clear all banned replications? This cannot be undone.');
  if (!confirmed) return;

  try {
    const blacklistManager = Zotero.ReplicationChecker.blacklistManager;
    await blacklistManager.clearBlacklist();
    Zotero.debug('[ReplicationChecker Prefs] Cleared all blacklist entries');
    selectedDOI = null;
    await loadBlacklistUI();
  } catch (error) {
    Zotero.logError(error);
    alert('Failed to clear blacklist');
  }
}

/**
 * Initialize the preference pane
 */
function initPreferences() {
  // Load blacklist UI
  loadBlacklistUI();

  // Wire up event listeners
  const removeBtn = document.getElementById('blacklist-remove-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', removeSelectedBlacklist);
  }

  const clearBtn = document.getElementById('blacklist-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllBlacklist);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPreferences);
} else {
  initPreferences();
}
