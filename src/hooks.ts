/**
 * Lifecycle hooks for Replication Checker plugin
 * Handles startup, window loading, and shutdown events
 */

import { replicationChecker } from "./modules/replicationChecker";
import { onboardingManager } from "./modules/onboarding";
import { blacklistManager } from "./modules/blacklistManager";
import { reproductionHandler } from "./modules/reproductionHandler";
import { config } from "../package.json";
import { createZToolkit } from "./utils/ztoolkit";
import { getString } from "./utils/strings";
import { TAG_IS_REPLICATION, TAG_IS_REPRODUCTION, TAG_ADDED_BY_CHECKER } from "./utils/tags";

const ztoolkit = createZToolkit();

/**
 * Load and parse FTL (Fluent) localization file
 * This is a simple parser that handles basic FTL syntax
 */
async function loadFTLStrings(
  rootURI: string,
  locale: string,
  filename: string
): Promise<Record<string, string>> {
  const strings: Record<string, string> = {};

  // Try locale-specific file first, then fall back to en-US
  const localesToTry = [locale, "en-US"];

  for (const loc of localesToTry) {
    // Locale files are registered at chrome://addonRef-locale/content/ in bootstrap.js
    // This maps to the addon's locale/ directory
    const ftlURL = `chrome://${config.addonRef}-locale/content/${loc}/${filename}`;
    Zotero.debug(`[ReplicationChecker] Trying to load FTL from: ${ftlURL}`);

    try {
      // Use XMLHttpRequest for chrome:// URLs (fetch doesn't work with chrome://)
      const ftlContent = await loadFileFromURL(ftlURL);

      if (ftlContent) {
        Zotero.debug(`[ReplicationChecker] Loaded FTL file (${ftlContent.length} chars) from ${ftlURL}`);

        // Parse the FTL content
        parseFTL(ftlContent, strings);

        if (Object.keys(strings).length > 0) {
          Zotero.debug(`[ReplicationChecker] Parsed ${Object.keys(strings).length} strings from ${loc} locale`);
          return strings;
        }
      }
    } catch (e) {
      Zotero.debug(`[ReplicationChecker] Error loading FTL from ${ftlURL}: ${e}`);
    }
  }

  return strings;
}

/**
 * Load a file from a chrome:// URL using XMLHttpRequest
 * fetch() doesn't work with chrome:// URLs in Firefox/Zotero
 */
function loadFileFromURL(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.overrideMimeType("text/plain");

      xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 0) {
          // status 0 is valid for chrome:// URLs
          resolve(xhr.responseText);
        } else {
          Zotero.debug(`[ReplicationChecker] XHR failed for ${url}: status ${xhr.status}`);
          resolve(null);
        }
      };

      xhr.onerror = function () {
        Zotero.debug(`[ReplicationChecker] XHR error for ${url}`);
        resolve(null);
      };

      xhr.send();
    } catch (e) {
      Zotero.debug(`[ReplicationChecker] XHR exception for ${url}: ${e}`);
      resolve(null);
    }
  });
}

/**
 * Parse FTL content into a key-value map
 * Handles basic Fluent syntax including multi-line values
 */
function parseFTL(content: string, strings: Record<string, string>): void {
  // The build process prefixes all FTL keys with addonRef (e.g., "replicationChecker-")
  // We need to strip this prefix so keys match what getString() looks up
  const prefix = `${config.addonRef}-`;

  const lines = content.split("\n");
  let currentKey = "";
  let currentValue = "";
  let inMultiline = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip comments
    if (line.trim().startsWith("#")) {
      continue;
    }

    // Check for new key-value pair
    const match = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*)\s*=\s*(.*)$/);
    if (match) {
      // Save previous key-value if exists
      if (currentKey && currentValue) {
        strings[currentKey] = currentValue.trim();
      }

      // Strip the build-added addonRef prefix from keys
      let key = match[1];
      if (key.startsWith(prefix)) {
        key = key.substring(prefix.length);
      }
      currentKey = key;
      currentValue = match[2];

      // Check if this is the start of a multi-line value
      if (currentValue === "" || currentValue.trim() === "") {
        inMultiline = true;
        currentValue = "";
      } else {
        inMultiline = false;
      }
    } else if (inMultiline && currentKey) {
      // Handle multi-line continuation (lines starting with whitespace)
      if (line.startsWith("    ") || line.startsWith("\t")) {
        currentValue += (currentValue ? "\n" : "") + line.trim();
      } else if (line.trim() === "") {
        // Empty line might be part of multi-line value
        if (currentValue) {
          currentValue += "\n";
        }
      } else {
        // End of multi-line value
        if (currentKey && currentValue) {
          strings[currentKey] = currentValue.trim();
        }
        currentKey = "";
        currentValue = "";
        inMultiline = false;
      }
    }
  }

  // Don't forget the last key-value pair
  if (currentKey && currentValue) {
    strings[currentKey] = currentValue.trim();
  }
}

export async function onStartup() {
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);

  Zotero.debug("[ReplicationChecker] Starting up...");

  try {
    // Initialize localization
    const rootURI = `chrome://${config.addonRef}/content/`;

    // Load locale using direct FTL file parsing (more reliable than Firefox Localization API)
    const locale = Zotero.locale || "en-US";
    // Build process prefixes the addon reference to the filename
    const localeFilename = `${config.addonRef}-replication-checker.ftl`;

    Zotero.debug(`[ReplicationChecker] Loading locale: ${locale}`);

    try {
      // Parse FTL file directly - this is more reliable than the Firefox Localization API
      const ftlStrings = await loadFTLStrings(rootURI, locale, localeFilename);

      if (Object.keys(ftlStrings).length > 0) {
        (addon.data as any).locale = { strings: ftlStrings };
        Zotero.debug(`[ReplicationChecker] Loaded ${Object.keys(ftlStrings).length} strings for locale: ${locale}`);
      } else {
        Zotero.debug(`[ReplicationChecker] No strings loaded, using hardcoded fallback`);
        (addon.data as any).locale = { strings: null };
      }
    } catch (e) {
      Zotero.debug(`[ReplicationChecker] Failed to load locale: ${e}`);
      (addon.data as any).locale = { strings: null };
    }

    // Expose addon globally for getString to access
    (Zotero as any).ReplicationChecker = addon;

    // Initialize the replication checker plugin
    await replicationChecker.init(rootURI);

    // Initialize blacklist manager
    await blacklistManager.init();
    Zotero.debug("[ReplicationChecker] Blacklist manager initialized");

    // Initialize reproduction handler and blacklist manager
    await reproductionHandler.init();
    Zotero.debug("[ReplicationChecker] Reproduction handler initialized");

    // Expose blacklist manager globally for preference pane access
    (Zotero as any).ReplicationChecker.blacklistManager = blacklistManager;

    // Expose preference pane UI initializer globally
    (Zotero as any).ReplicationChecker.initBlacklistUI = initBlacklistUI;

    // Register preference observer for auto-check frequency changes
    Zotero.Prefs.registerObserver(
      "replication-checker.autoCheckFrequency",
      () => {
        Zotero.debug("[ReplicationChecker] Auto-check frequency preference changed, restarting timer");
        // Restart the auto-check with new frequency
        (replicationChecker as any).startAutoCheck();
      }
    );

    // Register preference pane
    Zotero.PreferencePanes.register({
      pluginID: config.addonID,
      src: rootURI + "preferences.xhtml",
      label: config.addonName,
      image: rootURI + "icons/favicon.png",
    });

    Zotero.debug("[ReplicationChecker] Preference pane registered");

    // Watch for preference pane window to populate blacklist UI
    setupPreferencePaneObserver();

    // Setup UI for all existing windows
    const mainWindows = Zotero.getMainWindows();
    for (const win of mainWindows) {
      try {
        await onMainWindowLoad(win);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        Zotero.logError(new Error(`[ReplicationChecker] Error loading window: ${errorMsg}`));
      }
    }

    // Mark as initialized
    addon.data.initialized = true;
    Zotero.debug("[ReplicationChecker] Startup complete");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    Zotero.logError(new Error(`[ReplicationChecker] Startup failed: ${errorMsg}`));
    throw error;
  }
}

export async function onMainWindowLoad(win: _ZoteroTypes.MainWindow) {
  Zotero.debug("[ReplicationChecker] Loading main window");

  try {
    // Register Tools menu item
    ztoolkit.Menu.register("menuTools", {
      tag: "menuitem",
      id: "replication-checker-tools-menu",
      label: getString("replication-checker-tools-menu"),
      icon: `chrome://${config.addonRef}/content/icons/favicon.png`,
      commandListener: () => {
        replicationChecker.checkEntireLibrary();
      },
    });
    Zotero.debug("[ReplicationChecker] Added Tools menu item");

    // Register Help menu - User Guide
    ztoolkit.Menu.register("menuHelp", {
      tag: "menuitem",
      id: "replication-checker-help-guide",
      label: "Replication Checker User Guide",
      icon: `chrome://${config.addonRef}/content/icons/favicon.png`,
      commandListener: async () => {
        Zotero.debug("[ReplicationChecker] Opening user guide");
        // Don't show scan prompt when opened from Help menu
        await onboardingManager.showOnboarding(false);
      },
    });
    Zotero.debug("[ReplicationChecker] Added Help menu item");

    // Register Item context menu item
    ztoolkit.Menu.register("item", {
      tag: "menuitem",
      id: "replication-checker-item-menu",
      label: getString("replication-checker-context-menu"),
      icon: `chrome://${config.addonRef}/content/icons/favicon.png`,
      commandListener: () => {
        replicationChecker.checkSelectedItems();
      },
    });
    Zotero.debug("[ReplicationChecker] Added Item context menu item");

    // Register "Ban Replication" context menu item - handles both replications and reproductions
    ztoolkit.Menu.register("item", {
      tag: "menuitem",
      id: "replication-checker-ban-menu",
      label: getString("replication-checker-context-menu-ban"),
      icon: `chrome://${config.addonRef}/content/icons/favicon.png`,
      getVisibility: (elem, ev) => {
        // Show for replication or reproduction items
        const selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();
        return selectedItems.some((item: Zotero.Item) =>
          item.hasTag(TAG_IS_REPLICATION) ||
          item.hasTag(TAG_IS_REPRODUCTION) ||
          item.hasTag(TAG_ADDED_BY_CHECKER)
        );
      },
      commandListener: () => {
        // Call the unified ban function that handles both types
        replicationChecker.banSelectedItems();
      },
    });
    Zotero.debug("[ReplicationChecker] Added Ban Replication context menu item");

    // Register "Add Original Study" context menu item - for both replications and reproductions
    ztoolkit.Menu.register("item", {
      tag: "menuitem",
      id: "replication-checker-add-original-menu",
      label: getString("replication-checker-context-menu-add-original"),
      icon: `chrome://${config.addonRef}/content/icons/favicon.png`,
      getVisibility: (elem, ev) => {
        // Show for items tagged as "Is Replication" or "Is Reproduction"
        const selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();
        return selectedItems.some((item: Zotero.Item) =>
          item.hasTag(TAG_IS_REPLICATION) || item.hasTag(TAG_IS_REPRODUCTION)
        );
      },
      commandListener: () => {
        replicationChecker.addOriginalStudy();
      },
    });
    Zotero.debug("[ReplicationChecker] Added Add Original Study context menu item");

    // Register Collection context menu item
    ztoolkit.Menu.register("collection", {
      tag: "menuitem",
      id: "replication-checker-collection-menu",
      label: getString("replication-checker-context-menu"),
      icon: `chrome://${config.addonRef}/content/icons/favicon.png`,
      commandListener: () => {
        replicationChecker.checkSelectedCollection();
      },
    });
    Zotero.debug("[ReplicationChecker] Added Collection context menu item");

    // Show onboarding on first run
    setTimeout(async () => {
      try {
        // Check if this is first run
        let firstRunDone;
        try {
          firstRunDone = Zotero.Prefs.get("replication-checker.firstRunDone");
          Zotero.debug(`[ReplicationChecker] First run check: firstRunDone = ${firstRunDone}`);
        } catch (error) {
          Zotero.debug(`[ReplicationChecker] Error getting preference: ${error}`);
          firstRunDone = false; // Assume first run if preference doesn't exist
        }

        if (!firstRunDone && onboardingManager.shouldShowOnboarding()) {
          Zotero.debug("[ReplicationChecker] Showing onboarding with scan prompt");

          // Mark as shown before showing onboarding
          Zotero.Prefs.set("replication-checker.firstRunDone", true);

          // Show onboarding with scan prompt on last page
          const result = await onboardingManager.showOnboarding(true);

          if (result.completed && result.shouldScan) {
            Zotero.debug("[ReplicationChecker] User accepted first-run scan from onboarding");
            replicationChecker.checkEntireLibrary();
          } else if (result.completed) {
            Zotero.debug("[ReplicationChecker] User completed onboarding but declined scan");
          } else {
            Zotero.debug("[ReplicationChecker] User skipped onboarding");
          }
        } else {
          Zotero.debug("[ReplicationChecker] First-run already done or onboarding not needed, skipping");
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        Zotero.logError(new Error(`[ReplicationChecker] Error in onboarding: ${errorMsg}`));
      }
    }, 3000);

    Zotero.debug("[ReplicationChecker] Main window UI setup complete");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    Zotero.logError(new Error(`[ReplicationChecker] Error setting up window UI: ${errorMsg}`));
  }
}

export async function onMainWindowUnload(win: Window) {
  Zotero.debug("[ReplicationChecker] Unloading main window");
  // Cleanup is handled by shutdown
}

/**
 * Setup observer to detect when preferences window opens and initialize blacklist UI
 */
function setupPreferencePaneObserver() {
  Zotero.debug("[ReplicationChecker] Setting up preference pane observer");

  // Observe DOM-window-created events to catch when preferences window opens
  const observerService = (Components.classes as any)["@mozilla.org/observer-service;1"]
    .getService((Components.interfaces as any).nsIObserverService);

  const prefObserver = {
    observe: function (subject: any, topic: string, _data: string) {
      if (topic === "domwindowopened") {
        const win = subject as Window;

        win.addEventListener("load", function () {
          try {
            // Check if this is the preferences window
            if (win.location?.href?.includes("preferences")) {
              Zotero.debug("[ReplicationChecker] Preferences window detected, waiting for DOM");

              // Poll for our preference pane to load (preference panes load asynchronously)
              let attempts = 0;
              const maxAttempts = 20; // Try for up to 10 seconds (20 * 500ms)

              const checkForPane = () => {
                attempts++;
                const doc = win.document;
                const blacklistContainer = doc.getElementById("blacklist-list");

                if (blacklistContainer) {
                  Zotero.debug(`[ReplicationChecker] Our preference pane loaded after ${attempts} attempts, initializing UI`);
                  if ((Zotero as any).ReplicationChecker?.initBlacklistUI) {
                    (Zotero as any).ReplicationChecker.initBlacklistUI(doc);
                  } else {
                    Zotero.debug("[ReplicationChecker] ERROR: initBlacklistUI not available");
                  }
                } else if (attempts < maxAttempts) {
                  Zotero.debug(`[ReplicationChecker] Preference pane not loaded yet, attempt ${attempts}/${maxAttempts}`);
                  setTimeout(checkForPane, 500);
                } else {
                  Zotero.debug("[ReplicationChecker] Gave up waiting for preference pane after 10 seconds");
                }
              };

              // Start polling after initial delay
              setTimeout(checkForPane, 500);
            }
          } catch (error) {
            Zotero.debug("[ReplicationChecker] Error in preference pane observer: " + error);
          }
        }, { once: true });
      }
    },
  };

  observerService.addObserver(prefObserver, "domwindowopened", false);
  Zotero.debug("[ReplicationChecker] Preference pane observer registered");
}

export async function onShutdown() {
  Zotero.debug("[ReplicationChecker] Shutting down...");

  try {
    // Cleanup plugin resources
    replicationChecker.shutdown();

    // Unregister preference observer
    try {
      Zotero.Prefs.unregisterObserver(
        "replication-checker.autoCheckFrequency" as any
      );
    } catch (e) {
      // Observer might not be registered
      Zotero.debug("[ReplicationChecker] Could not unregister preference observer: " + e);
    }

    // Clear all plugin preferences on uninstall/disable
    // This ensures fresh onboarding on reinstall
    try {
      Zotero.debug("[ReplicationChecker] Clearing plugin preferences");
      Zotero.Prefs.clear("replication-checker.autoCheckFrequency");
      Zotero.Prefs.clear("replication-checker.autoCheckNewItems");
      Zotero.Prefs.clear("replication-checker.blacklist");
      Zotero.Prefs.clear("replication-checker.onboardingVersion");
      Zotero.Prefs.clear("replication-checker.firstRunDone");
      Zotero.debug("[ReplicationChecker] Plugin preferences cleared");
    } catch (e) {
      Zotero.debug("[ReplicationChecker] Error clearing preferences: " + e);
    }

    // Cleanup global reference
    delete (Zotero as any).ReplicationChecker;

    addon.data.alive = false;
    Zotero.debug("[ReplicationChecker] Shutdown complete");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    Zotero.logError(new Error(`[ReplicationChecker] Error during shutdown: ${errorMsg}`));
  }
}

/**
 * Initialize the blacklist UI in the preferences pane
 * Called from preferences.xhtml when the pane loads
 */
export async function initBlacklistUI(doc: Document) {
  Zotero.debug("[ReplicationChecker Prefs] initBlacklistUI called");

  let selectedIdentifier: string | null = null;
  let prefObserverSymbol: symbol | null = null;

  async function loadBlacklistUI() {
    try {
      Zotero.debug("[ReplicationChecker Prefs] loadBlacklistUI called");

      if (!blacklistManager) {
        Zotero.debug("[ReplicationChecker Prefs] BlacklistManager not available");
        return;
      }

      const entries = blacklistManager.getEntriesWithMetadata();
      Zotero.debug(`[ReplicationChecker Prefs] Retrieved ${entries.length} blacklist entries`);

      const tbody = doc.getElementById("blacklist-list");
      if (!tbody) {
        Zotero.debug("[ReplicationChecker Prefs] blacklist-list tbody not found");
        return;
      }

      // Clear existing rows (except template)
      tbody.innerHTML = "";

      if (entries.length === 0) {
        // Show empty row
        const emptyRow = doc.createElement("tr");
        emptyRow.id = "blacklist-empty-row";
        const emptyCell = doc.createElement("td");
        emptyCell.setAttribute("colspan", "4");
        emptyCell.style.padding = "20px";
        emptyCell.style.textAlign = "center";
        emptyCell.style.color = "#999";
        emptyCell.style.fontStyle = "italic";
        emptyCell.textContent = "No banned replications";
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);

        const removeBtn = doc.getElementById("blacklist-remove-btn") as HTMLButtonElement;
        if (removeBtn) removeBtn.disabled = true;
        selectedIdentifier = null;
        return;
      }

      // Create table rows for each entry
      for (const entry of entries) {
        const row = doc.createElement("tr");
        row.className = "blacklist-entry";
        row.style.cursor = "pointer";
        row.style.borderBottom = "1px solid #ddd";
        row.style.backgroundColor = "#ffffff";
        // Use DOI if available, otherwise use URL as identifier
        const identifier = entry.doi || entry.url || "";
        row.setAttribute("data-identifier", identifier);

        // Replication Article column
        const replicatedCell = doc.createElement("td");
        replicatedCell.style.padding = "8px";
        replicatedCell.style.borderRight = "1px solid #ddd";
        replicatedCell.style.color = "#000000";
        replicatedCell.style.fontSize = "0.9em";
        replicatedCell.textContent = entry.replicationTitle || "Unknown Title";

        // Original Article column
        const originalCell = doc.createElement("td");
        originalCell.style.padding = "8px";
        originalCell.style.borderRight = "1px solid #ddd";
        originalCell.style.color = "#000000";
        originalCell.style.fontSize = "0.9em";
        originalCell.textContent = entry.originalTitle || "Unknown Original";

        // Type column
        const typeCell = doc.createElement("td");
        typeCell.style.padding = "8px";
        typeCell.style.textAlign = "center";
        typeCell.style.borderRight = "1px solid #ddd";
        typeCell.style.color = "#333333";
        typeCell.style.fontSize = "0.85em";
        typeCell.textContent = entry.type === 'reproduction' ? 'Reproduction' : 'Replication';

        // Banned On column
        const dateCell = doc.createElement("td");
        dateCell.style.padding = "8px";
        dateCell.style.textAlign = "center";
        dateCell.style.color = "#333333";
        dateCell.style.fontSize = "0.85em";
        const date = new Date(entry.dateAdded);
        dateCell.textContent = date.toLocaleDateString();

        row.appendChild(replicatedCell);
        row.appendChild(originalCell);
        row.appendChild(typeCell);
        row.appendChild(dateCell);

        // Click handler for row selection
        row.addEventListener("click", function () {
          // Remove selection from all rows
          const allRows = doc.querySelectorAll(".blacklist-entry");
          allRows.forEach((r: Element) => {
            const rowEl = r as HTMLElement;
            rowEl.style.backgroundColor = "#ffffff";
            // Reset text colors to default
            const cells = rowEl.querySelectorAll("td");
            cells.forEach((cell: Element, index: number) => {
              if (index < 2) {
                (cell as HTMLElement).style.color = "#000000";
              } else {
                (cell as HTMLElement).style.color = "#333333";
              }
            });
          });

          // Select this row with light blue background
          row.style.backgroundColor = "#cce5ff";
          // Keep text dark even when selected
          const cells = row.querySelectorAll("td");
          cells.forEach((cell: Element, index: number) => {
            if (index < 2) {
              (cell as HTMLElement).style.color = "#000000";
            } else {
              (cell as HTMLElement).style.color = "#333333";
            }
          });
          selectedIdentifier = identifier;

          // Enable remove button
          const removeBtn = doc.getElementById("blacklist-remove-btn") as HTMLButtonElement;
          if (removeBtn) removeBtn.disabled = false;
        });

        tbody.appendChild(row);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Zotero.logError(err);
      Zotero.debug("[ReplicationChecker Prefs] Error loading blacklist UI: " + error);
    }
  }

  async function removeSelectedBlacklist() {
    if (!selectedIdentifier) return;

    try {
      await blacklistManager.removeFromBlacklist(selectedIdentifier);
      Zotero.debug(`[ReplicationChecker Prefs] Removed ${selectedIdentifier} from blacklist`);
      selectedIdentifier = null;
      await loadBlacklistUI();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Zotero.logError(err);
      const win = doc.defaultView;
      if (win) win.alert("Failed to remove entry from blacklist");
    }
  }

  async function clearAllBlacklist() {
    const win = doc.defaultView;
    if (!win) return;

    const confirmed = win.confirm(
      "Are you sure you want to clear all banned replications? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      await blacklistManager.clearBlacklist();
      Zotero.debug("[ReplicationChecker Prefs] Cleared all blacklist entries");
      selectedIdentifier = null;
      await loadBlacklistUI();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Zotero.logError(err);
      win.alert("Failed to clear blacklist");
    }
  }

  // Wire up event listeners
  const removeBtn = doc.getElementById("blacklist-remove-btn");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => removeSelectedBlacklist());
    Zotero.debug("[ReplicationChecker Prefs] Remove button listener attached");
  }

  const clearBtn = doc.getElementById("blacklist-clear-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => clearAllBlacklist());
    Zotero.debug("[ReplicationChecker Prefs] Clear button listener attached");
  }

  // Register preference observer to reload UI when blacklist changes
  try {
    prefObserverSymbol = Zotero.Prefs.registerObserver(
      "replication-checker.blacklist",
      async () => {
        Zotero.debug("[ReplicationChecker Prefs] Blacklist preference changed, reloading UI");
        await loadBlacklistUI();
      }
    );
    Zotero.debug("[ReplicationChecker Prefs] Preference observer registered");
  } catch (error) {
    Zotero.debug("[ReplicationChecker Prefs] Could not register preference observer: " + error);
  }

  // Clean up observer when window is closed
  const win = doc.defaultView;
  if (win) {
    win.addEventListener("unload", () => {
      if (prefObserverSymbol) {
        try {
          Zotero.Prefs.unregisterObserver(prefObserverSymbol);
          Zotero.debug("[ReplicationChecker Prefs] Preference observer unregistered");
        } catch (error) {
          Zotero.debug("[ReplicationChecker Prefs] Could not unregister observer: " + error);
        }
      }
    });
  }

  // Load the UI
  await loadBlacklistUI();
}

export default {
  onStartup,
  onMainWindowLoad,
  onMainWindowUnload,
  onShutdown,
};
