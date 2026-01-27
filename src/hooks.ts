/**
 * Lifecycle hooks for Replication Checker plugin
 * Handles startup, window loading, and shutdown events
 */

import { replicationChecker } from "./modules/replicationChecker";
import { onboardingManager } from "./modules/onboarding";
import { blacklistManager } from "./modules/blacklistManager";
import { config } from "../package.json";
import { createZToolkit } from "./utils/ztoolkit";
import { getString } from "./utils/strings";

const ztoolkit = createZToolkit();

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

    // Load locale bundle using Zotero's Localization API
    const locale = Zotero.locale || "en-US";
    const localeURI = `${rootURI}locale/${locale}/${config.addonRef}-replication-checker.ftl`;

    try {
      // Try to load the localized .ftl file
      const L10n = new (Zotero as any).Localization([localeURI], true);
      addon.data.locale = { current: L10n };
      Zotero.debug(`[ReplicationChecker] Locale loaded: ${locale}`);
    } catch (e) {
      // Fallback to English if locale not available
      try {
        const fallbackURI = `${rootURI}locale/en-US/${config.addonRef}-replication-checker.ftl`;
        const L10n = new (Zotero as any).Localization([fallbackURI], true);
        addon.data.locale = { current: L10n };
        Zotero.debug(`[ReplicationChecker] Fallback to en-US locale`);
      } catch (fallbackError) {
        Zotero.debug(`[ReplicationChecker] Could not load locale files, using hardcoded strings`);
        addon.data.locale = { current: null };
      }
    }

    // Expose addon globally for getString to access
    (Zotero as any).ReplicationChecker = addon;

    // Initialize the replication checker plugin
    await replicationChecker.init(rootURI);

    // Initialize blacklist manager
    await blacklistManager.init();
    Zotero.debug("[ReplicationChecker] Blacklist manager initialized");

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

    // Register "Ban Replication" context menu item
    ztoolkit.Menu.register("item", {
      tag: "menuitem",
      id: "replication-checker-ban-menu",
      label: getString("replication-checker-context-menu-ban"),
      icon: `chrome://${config.addonRef}/content/icons/favicon.png`,
      getVisibility: (elem, ev) => {
        // Only show for replication items
        const selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();
        return selectedItems.some((item: Zotero.Item) =>
          item.hasTag(getString("replication-checker-tag-is-replication")) ||
          item.hasTag(getString("replication-checker-tag-added-by-checker"))
        );
      },
      commandListener: () => {
        replicationChecker.banSelectedReplications();
      },
    });
    Zotero.debug("[ReplicationChecker] Added Ban Replication context menu item");

    // Register "Add Original Study" context menu item
    ztoolkit.Menu.register("item", {
      tag: "menuitem",
      id: "replication-checker-add-original-menu",
      label: getString("replication-checker-context-menu-add-original"),
      icon: `chrome://${config.addonRef}/content/icons/favicon.png`,
      getVisibility: (elem, ev) => {
        // Only show for items tagged as "Is Replication"
        const selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();
        return selectedItems.some((item: Zotero.Item) =>
          item.hasTag(getString("replication-checker-tag-is-replication"))
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

  let selectedDOI: string | null = null;
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
        emptyCell.setAttribute("colspan", "3");
        emptyCell.style.padding = "20px";
        emptyCell.style.textAlign = "center";
        emptyCell.style.color = "#999";
        emptyCell.style.fontStyle = "italic";
        emptyCell.textContent = "No banned replications";
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);

        const removeBtn = doc.getElementById("blacklist-remove-btn") as HTMLButtonElement;
        if (removeBtn) removeBtn.disabled = true;
        selectedDOI = null;
        return;
      }

      // Create table rows for each entry
      for (const entry of entries) {
        const row = doc.createElement("tr");
        row.className = "blacklist-entry";
        row.style.cursor = "pointer";
        row.style.borderBottom = "1px solid #ddd";
        row.style.backgroundColor = "#ffffff";
        row.setAttribute("data-doi", entry.doi);

        // Replicated Article column
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
          selectedDOI = entry.doi;

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
    if (!selectedDOI) return;

    try {
      await blacklistManager.removeFromBlacklist(selectedDOI);
      Zotero.debug(`[ReplicationChecker Prefs] Removed ${selectedDOI} from blacklist`);
      selectedDOI = null;
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
      selectedDOI = null;
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
