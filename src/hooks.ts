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
import {
  TAG_IS_REPLICATION, TAG_IS_REPRODUCTION, itemHasTag,
  TAG_HAS_BEEN_REPLICATED, TAG_HAS_BEEN_REPRODUCED,
  TAG_REPLICATION_MULTIPLE_ORIGINALS, TAG_REPRODUCTION_MULTIPLE_ORIGINALS,
  getTag,
} from "./utils/tags";
import { migrateCollectionsToRoot } from "./utils/collectionUtils";
import { extractDOI } from "./utils/zoteroIntegration";
import { normalizeDoi } from "./utils/doi";
import {
  initThemeObserver,
  cleanupThemeObserver,
  getThemedIconPath,
  getThemedIconRelativePath,
  onThemeChange,
} from "./utils/theme";

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

  // Try locale-specific file first, then base language code (e.g. fr-FR -> fr), then fall back to en-US
  const baseLocale = locale.split("-")[0];
  const localesToTry = [...new Set([locale, baseLocale, "en-US"])];

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
    // Initialize theme observer for light/dark mode detection
    initThemeObserver();
    Zotero.debug("[ReplicationChecker] Theme observer initialized");

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

    // Move collections created by older versions into the "FLoRA" container
    await migrateCollectionsToRoot();

    // Initialize the replication checker plugin
    await replicationChecker.init(rootURI);

    // Initialize blacklist manager
    await blacklistManager.init();
    Zotero.debug("[ReplicationChecker] Blacklist manager initialized");

    // Initialize reproduction handler and blacklist manager
    await reproductionHandler.init();
    Zotero.debug("[ReplicationChecker] Reproduction handler initialized");

    // Expose plugin internals globally for preference pane and test access
    (Zotero as any).ReplicationChecker.checker = replicationChecker;
    (Zotero as any).ReplicationChecker.blacklistManager = blacklistManager;
    (Zotero as any).ReplicationChecker.reproductionHandler = reproductionHandler;

    // Expose preference pane UI initializers globally
    (Zotero as any).ReplicationChecker.initBlacklistUI = initBlacklistUI;
    (Zotero as any).ReplicationChecker.initStatsUI = initStatsUI;

    // Note: the auto-check frequency observer is registered inside
    // replicationChecker.init(), which also unregisters it by symbol on shutdown.

    // Register preference pane with theme-aware icon
    Zotero.PreferencePanes.register({
      pluginID: config.addonID,
      src: rootURI + "preferences.xhtml",
      label: config.addonName,
      image: rootURI + getThemedIconRelativePath(),
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
    const doc = win.document;

    // Zotero popup element IDs for each menu location
    const MENU_POPUPS: Record<string, string> = {
      menuTools: "menu_ToolsPopup",
      menuHelp: "menu_HelpPopup",
      item: "zotero-itemmenu",
      collection: "zotero-collectionmenu",
    };

    // Listeners added to popup elements, tracked for cleanup in onMainWindowUnload
    const popupListeners: Array<{ popup: Element; listener: EventListener }> = [];
    (win as any)._rcMenuPopupListeners = popupListeners;

    function addMenuItem(
      menuType: string,
      id: string,
      label: string,
      commandFn: () => void,
      visibilityFn?: (elem: Element) => boolean,
    ): void {
      const popup = doc.getElementById(MENU_POPUPS[menuType]);
      if (!popup) return;

      const item = ztoolkit.UI.createElement(doc, "menuitem", {
        id,
        attributes: {
          label,
          image: getThemedIconPath(),
          class: "menuitem-iconic",
        },
        listeners: [{ type: "command", listener: commandFn }],
      });

      if (visibilityFn) {
        const onShowing: EventListener = () => {
          (item as any).hidden = !visibilityFn(item as Element);
        };
        popup.addEventListener("popupshowing", onShowing);
        popupListeners.push({ popup, listener: onShowing });
      }

      popup.appendChild(item);
    }

    // Tools menu
    addMenuItem(
      "menuTools",
      "replication-checker-tools-menu",
      getString("replication-checker-tools-menu"),
      () => replicationChecker.checkEntireLibrary(),
    );
    Zotero.debug("[ReplicationChecker] Added Tools menu item");

    // Help menu - User Guide
    addMenuItem(
      "menuHelp",
      "replication-checker-help-guide",
      "Replication Checker User Guide",
      async () => {
        Zotero.debug("[ReplicationChecker] Opening user guide");
        await onboardingManager.showOnboarding(false);
      },
    );
    Zotero.debug("[ReplicationChecker] Added Help menu item");

    // Item context menu - check replications
    addMenuItem(
      "item",
      "replication-checker-item-menu",
      getString("replication-checker-context-menu"),
      () => replicationChecker.checkSelectedItems(),
    );
    Zotero.debug("[ReplicationChecker] Added Item context menu item");

    // Item context menu - ban replication/reproduction
    addMenuItem(
      "item",
      "replication-checker-ban-menu",
      getString("replication-checker-context-menu-ban"),
      () => replicationChecker.banSelectedItems(),
      () => {
        const selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();
        return selectedItems.some((item: Zotero.Item) =>
          itemHasTag(item, TAG_IS_REPLICATION) ||
          itemHasTag(item, TAG_IS_REPRODUCTION)
        );
      },
    );
    Zotero.debug("[ReplicationChecker] Added Ban Replication context menu item");

    // Item context menu - add original study
    addMenuItem(
      "item",
      "replication-checker-add-original-menu",
      getString("replication-checker-context-menu-add-original"),
      () => replicationChecker.addOriginalStudy(),
      (elem) => {
        const selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();
        const isVisible = selectedItems.some((item: Zotero.Item) =>
          itemHasTag(item, TAG_IS_REPLICATION) || itemHasTag(item, TAG_IS_REPRODUCTION)
        );
        if (isVisible) {
          const hasMultiple = selectedItems.some((item: Zotero.Item) =>
            itemHasTag(item, TAG_REPLICATION_MULTIPLE_ORIGINALS) ||
            itemHasTag(item, TAG_REPRODUCTION_MULTIPLE_ORIGINALS)
          );
          elem.setAttribute("label", getString(
            hasMultiple
              ? "replication-checker-context-menu-add-originals"
              : "replication-checker-context-menu-add-original"
          ));
        }
        return isVisible;
      },
    );
    Zotero.debug("[ReplicationChecker] Added Add Original Study context menu item");

    // Collection context menu
    addMenuItem(
      "collection",
      "replication-checker-collection-menu",
      getString("replication-checker-context-menu"),
      () => replicationChecker.checkSelectedCollection(),
    );
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

        // shouldShowOnboarding() is the only gate: it already covers both a
        // fresh install (pref absent) and an existing user whose stored version
        // is behind ONBOARDING_VERSION. Requiring !firstRunDone as well would
        // short-circuit for every existing user, so bumping the version would
        // reach new installs only — which is the opposite of why it is bumped.
        const isFirstRun = !firstRunDone;

        if (onboardingManager.shouldShowOnboarding()) {
          Zotero.debug(
            `[ReplicationChecker] Showing onboarding (firstRun=${isFirstRun})`
          );

          // Mark as shown before showing onboarding
          Zotero.Prefs.set("replication-checker.firstRunDone", true);

          // The scan prompt is a first-install concern: someone updating has a
          // library that has already been checked, so re-offering a full scan
          // as the closing step would be noise.
          const result = await onboardingManager.showOnboarding(isFirstRun);

          if (result.completed && result.shouldScan) {
            Zotero.debug("[ReplicationChecker] User accepted first-run scan from onboarding");
            replicationChecker.checkEntireLibrary();
          } else if (result.completed) {
            Zotero.debug("[ReplicationChecker] User completed onboarding but declined scan");
          } else if (isFirstRun) {
            // User skipped onboarding - show separate first scan prompt.
            // First install only: prompting an existing user to rescan a library
            // the plugin has already been through is just an interruption.
            Zotero.debug("[ReplicationChecker] User skipped onboarding, showing separate first scan prompt");
            const win = Zotero.getMainWindow();
            if (win) {
              const shouldScan = win.confirm(
                getString("replication-checker-prompt-first-run")
              );
              if (shouldScan) {
                Zotero.debug("[ReplicationChecker] User accepted first-run scan after skipping onboarding");
                replicationChecker.checkEntireLibrary();
              } else {
                Zotero.debug("[ReplicationChecker] User declined first-run scan");
              }
            }
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

    // Register theme change listener to update menu icons dynamically
    onThemeChange((newTheme) => {
      Zotero.debug(`[ReplicationChecker] Updating menu icons for theme: ${newTheme}`);
      updateMenuIcons(win);
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    Zotero.logError(new Error(`[ReplicationChecker] Error setting up window UI: ${errorMsg}`));
  }
}

/**
 * Update all menu item icons when theme changes
 */
function updateMenuIcons(win: Window) {
  const doc = win.document;
  const newIconPath = getThemedIconPath();

  const menuIds = [
    "replication-checker-tools-menu",
    "replication-checker-help-guide",
    "replication-checker-item-menu",
    "replication-checker-ban-menu",
    "replication-checker-add-original-menu",
    "replication-checker-collection-menu",
  ];

  for (const id of menuIds) {
    const menuItem = doc.getElementById(id);
    if (menuItem) {
      menuItem.setAttribute("image", newIconPath);
      Zotero.debug(`[ReplicationChecker] Updated icon for ${id}`);
    }
  }

  // Also update preference pane icon in any open preferences windows
  updatePreferencePaneIcons();
}

/**
 * Update preference pane icons in all open preferences windows
 */
function updatePreferencePaneIcons() {
  const rootURI = `chrome://${config.addonRef}/content/`;
  const newIconPath = rootURI + getThemedIconRelativePath();

  Zotero.debug(`[ReplicationChecker] updatePreferencePaneIcons called, newIconPath: ${newIconPath}`);

  try {
    // Get all windows and look for preferences windows
    const windowMediator = (Components.classes as any)["@mozilla.org/appshell/window-mediator;1"]
      .getService((Components.interfaces as any).nsIWindowMediator);
    const enumerator = windowMediator.getEnumerator(null);

    let windowCount = 0;
    while (enumerator.hasMoreElements()) {
      const win = enumerator.getNext() as Window;
      windowCount++;

      if (win.location?.href?.includes("preferences")) {
        Zotero.debug(`[ReplicationChecker] Found preferences window: ${win.location.href}`);
        const doc = win.document;

        // Method 1: Look for elements with our plugin ID in the data-pane-id
        const paneElements = doc.querySelectorAll(`[data-pane-id*="replication-checker"]`);
        Zotero.debug(`[ReplicationChecker] Found ${paneElements.length} elements with data-pane-id containing replication-checker`);
        for (const elem of paneElements) {
          const img = elem.querySelector("image, img");
          if (img) {
            img.setAttribute("src", newIconPath);
            Zotero.debug(`[ReplicationChecker] Updated preference pane icon via data-pane-id image element`);
          }
          // Try setting image attribute directly
          if (elem.hasAttribute("image")) {
            elem.setAttribute("image", newIconPath);
            Zotero.debug(`[ReplicationChecker] Updated preference pane image attribute via data-pane-id`);
          }
        }

        // Method 2: Look for elements with our plugin ID pattern
        const pluginPanes = doc.querySelectorAll(`[id*="replication-checker"]`);
        Zotero.debug(`[ReplicationChecker] Found ${pluginPanes.length} elements with id containing replication-checker`);
        for (const pane of pluginPanes) {
          Zotero.debug(`[ReplicationChecker] Found element: ${pane.tagName}#${pane.id}`);
          const img = pane.querySelector("image, img");
          if (img) {
            img.setAttribute("src", newIconPath);
            Zotero.debug(`[ReplicationChecker] Updated icon via plugin pane image element`);
          }
          if (pane.hasAttribute("image")) {
            pane.setAttribute("image", newIconPath);
            Zotero.debug(`[ReplicationChecker] Updated image attribute on plugin pane`);
          }
        }

        // Method 3: Look for button elements in preferences sidebar (Zotero 7 uses buttons)
        const buttons = doc.querySelectorAll("button");
        for (const btn of buttons) {
          const label = btn.getAttribute("label") || btn.textContent || "";
          const id = btn.id || "";
          if (label.includes("Replication Checker") || id.includes("replication-checker")) {
            Zotero.debug(`[ReplicationChecker] Found button: ${btn.tagName}#${id}, label: ${label}`);
            const img = btn.querySelector("image, img, .icon");
            if (img) {
              img.setAttribute("src", newIconPath);
              Zotero.debug(`[ReplicationChecker] Updated button icon`);
            }
            if (btn.hasAttribute("image")) {
              btn.setAttribute("image", newIconPath);
              Zotero.debug(`[ReplicationChecker] Updated button image attribute`);
            }
          }
        }

        // Method 4: Try finding richlistitem elements (older XUL style)
        const richlistItems = doc.querySelectorAll("richlistitem");
        Zotero.debug(`[ReplicationChecker] Found ${richlistItems.length} richlistitem elements`);
        for (const item of richlistItems) {
          const label = item.getAttribute("label") || item.textContent || "";
          if (label.includes("Replication Checker")) {
            Zotero.debug(`[ReplicationChecker] Found richlistitem with Replication Checker label`);
            const img = item.querySelector("image, img");
            if (img) {
              img.setAttribute("src", newIconPath);
              Zotero.debug(`[ReplicationChecker] Updated richlistitem icon`);
            }
            if (item.hasAttribute("image")) {
              item.setAttribute("image", newIconPath);
              Zotero.debug(`[ReplicationChecker] Updated richlistitem image attribute`);
            }
          }
        }

        // Method 5: Look for any element with our plugin name in various attributes
        // Then traverse up to find the parent container with the image
        const allElements = doc.querySelectorAll(`[value*="Replication Checker"], [label*="Replication Checker"]`);
        Zotero.debug(`[ReplicationChecker] Found ${allElements.length} elements with Replication Checker in value/label`);
        for (const elem of allElements) {
          Zotero.debug(`[ReplicationChecker] Found element: ${elem.tagName}#${(elem as Element).id}`);

          // Traverse up to find parent container (richlistitem, button, etc.)
          let parent = elem.parentElement;
          let depth = 0;
          while (parent && depth < 5) {
            Zotero.debug(`[ReplicationChecker] Checking parent: ${parent.tagName}#${parent.id}`);

            // Look for image element in this parent
            const img = parent.querySelector("image, img");
            if (img) {
              Zotero.debug(`[ReplicationChecker] Found image in parent: ${img.tagName}, current src: ${img.getAttribute("src")}`);
              img.setAttribute("src", newIconPath);
              Zotero.debug(`[ReplicationChecker] Updated image src to: ${newIconPath}`);
              break;
            }

            // Check if parent itself has image attribute
            if (parent.hasAttribute("image")) {
              Zotero.debug(`[ReplicationChecker] Parent has image attribute: ${parent.getAttribute("image")}`);
              parent.setAttribute("image", newIconPath);
              Zotero.debug(`[ReplicationChecker] Updated parent image attribute`);
              break;
            }

            parent = parent.parentElement;
            depth++;
          }

          // Also check if this element itself has image attribute
          if ((elem as Element).hasAttribute("image")) {
            (elem as Element).setAttribute("image", newIconPath);
            Zotero.debug(`[ReplicationChecker] Updated element image attribute`);
          }
        }
      }
    }
    Zotero.debug(`[ReplicationChecker] Checked ${windowCount} windows total`);
  } catch (e) {
    Zotero.debug(`[ReplicationChecker] Error updating preference pane icons: ${e}`);
  }
}

export async function onMainWindowUnload(win: Window) {
  Zotero.debug("[ReplicationChecker] Unloading main window");

  // Remove menu items from this window
  try {
    const menuIds = [
      "replication-checker-tools-menu",
      "replication-checker-help-guide",
      "replication-checker-item-menu",
      "replication-checker-ban-menu",
      "replication-checker-add-original-menu",
      "replication-checker-collection-menu",
    ];

    const doc = win.document;
    for (const id of menuIds) {
      const elem = doc.getElementById(id);
      if (elem) {
        elem.remove();
      }
    }

    const popupListeners: Array<{ popup: Element; listener: EventListener }> =
      (win as any)._rcMenuPopupListeners ?? [];
    for (const { popup, listener } of popupListeners) {
      popup.removeEventListener("popupshowing", listener);
    }
    delete (win as any)._rcMenuPopupListeners;
  } catch (e) {
    Zotero.debug("[ReplicationChecker] Error cleaning up window menu items: " + e);
  }
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

              // Update preference pane icon immediately to match current theme
              setTimeout(() => updatePreferencePaneIcons(), 100);

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
                  if ((Zotero as any).ReplicationChecker?.initStatsUI) {
                    (Zotero as any).ReplicationChecker.initStatsUI(doc);
                  } else {
                    Zotero.debug("[ReplicationChecker] ERROR: initStatsUI not available");
                  }
                  // Update preference pane icon to match current theme
                  updatePreferencePaneIcons();
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
    // Cleanup theme observer
    cleanupThemeObserver();

    // Cleanup plugin resources
    replicationChecker.shutdown();

    // Remove all registered menu items from the DOM to prevent duplicates on update
    try {
      const menuIds = [
        "replication-checker-tools-menu",
        "replication-checker-help-guide",
        "replication-checker-item-menu",
        "replication-checker-ban-menu",
        "replication-checker-add-original-menu",
        "replication-checker-collection-menu",
      ];

      const mainWindows = Zotero.getMainWindows();
      for (const win of mainWindows) {
        if (!win) continue;
        const doc = win.document;
        for (const id of menuIds) {
          const elem = doc.getElementById(id);
          if (elem) {
            elem.remove();
            Zotero.debug(`[ReplicationChecker] Removed menu element: ${id}`);
          }
        }
      }
      Zotero.debug("[ReplicationChecker] Menu items cleaned up");
    } catch (e) {
      Zotero.debug("[ReplicationChecker] Error cleaning up menu items: " + e);
    }

    // Note: We intentionally do NOT clear preferences on shutdown.
    // Zotero calls onShutdown during auto-updates before reloading the new version,
    // so clearing prefs here would reset user settings and re-trigger onboarding.

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

  // Both preferences.xhtml's inline script and setupPreferencePaneObserver call
  // this; without the guard each pane open would stack a second set of listeners
  // and preference observers on the same document.
  if ((doc as any)._rcBlacklistUIReady) return;
  (doc as any)._rcBlacklistUIReady = true;

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

// ---------------------------------------------------------------------------
// Stats UI for the preference pane
// ---------------------------------------------------------------------------

export async function initStatsUI(doc: Document): Promise<void> {
  Zotero.debug("[ReplicationChecker Prefs] initStatsUI called");

  // See initBlacklistUI: guards against the pane being initialised twice, which
  // would duplicate the library picker options, the Atlas click handler and the
  // item notifier.
  if ((doc as any)._rcStatsUIReady) return;
  (doc as any)._rcStatsUIReady = true;

  let statsNotifierID: string | null = null;

  // ── helpers ──────────────────────────────────────────────────────────────

  /**
   * Library the stats and the Atlas button apply to. Defaults to the personal
   * library; the picker below lets users switch to any group library.
   */
  function selectedLibraryID(): number {
    const select = doc.getElementById("stats-library-select") as HTMLSelectElement | null;
    const id = select ? parseInt(select.value, 10) : NaN;
    return Number.isNaN(id) ? Zotero.Libraries.userLibraryID : id;
  }

  // Scope comes from the Search constructor, not a "libraryID" condition: a new
  // Zotero.Search() defaults to the personal library, so a condition naming a
  // group library would contradict it and always return nothing (#100).
  async function searchByTag(tag: string, libraryID: number): Promise<number[]> {
    const search = new Zotero.Search({ libraryID });
    search.addCondition("tag", "is", tag);
    // Same filter countAllItems() uses. The plugin only ever tags top-level
    // items, but without this a tag that reached a note or attachment would
    // inflate the tag rows while leaving the total untouched.
    search.addCondition("noChildren", "true", "1");
    return search.search();
  }

  async function countAllItems(libraryID: number): Promise<number> {
    const search = new Zotero.Search({ libraryID });
    search.addCondition("noChildren", "true", "1");
    const ids = await search.search();
    return ids.length;
  }

  /** Unique item IDs carrying any of the given tags. */
  async function idsForTags(libraryID: number, tags: string[]): Promise<number[]> {
    const results = await Promise.all(tags.map((tag) => searchByTag(tag, libraryID)));
    return [...new Set(results.flat())];
  }

  /**
   * Every item the plugin tracks — originals *and* the replication/reproduction
   * items themselves. The Atlas classifies each DOI it receives, so sending only
   * originals left its "Replication" tab empty even for libraries full of them.
   */
  function allTrackedIDs(libraryID: number): Promise<number[]> {
    return idsForTags(libraryID, [
      getTag(TAG_HAS_BEEN_REPLICATED),
      getTag(TAG_HAS_BEEN_REPRODUCED),
      getTag(TAG_IS_REPLICATION),
      getTag(TAG_IS_REPRODUCTION),
    ]);
  }

  function setText(id: string, value: string): void {
    const el = doc.getElementById(id);
    if (el) el.textContent = value;
  }

  /**
   * Normalised DOI for each item id, resolved once and shared by every count
   * below so the table and the Atlas button can never disagree.
   *
   * DOIs are resolved the way every other code path does: the Extra field is a
   * valid fallback location, and normalisation strips the doi.org/ prefixes and
   * casing that would otherwise make two spellings of one article look like two
   * articles. `null` marks an item the plugin tracks but cannot identify by
   * DOI — reported by the note under the table rather than silently dropped.
   */
  async function resolveDOIs(ids: number[]): Promise<Map<number, string | null>> {
    const byID = new Map<number, string | null>();
    for (const id of ids) {
      const item = await Zotero.Items.getAsync(id);
      byID.set(id, item ? normalizeDoi(extractDOI(item)) : null);
    }
    return byID;
  }

  /**
   * How many distinct articles `ids` represents.
   *
   * The table is labelled "Articles", and an article is identified by its DOI,
   * so the same paper saved twice counts once. Items with no DOI cannot be
   * identified and are not counted here; `countWithoutDOI` reports them.
   */
  function countUniqueDOIs(ids: number[], byID: Map<number, string | null>): number {
    const seen = new Set<string>();
    for (const id of ids) {
      const doi = byID.get(id);
      if (doi) seen.add(doi);
    }
    return seen.size;
  }

  function countWithoutDOI(ids: number[], byID: Map<number, string | null>): number {
    return ids.reduce((n, id) => (byID.get(id) ? n : n + 1), 0);
  }

  /**
   * The DOIs the Atlas can actually be given, and what had to be dropped.
   * Deduplicated, because two library items can carry the same DOI.
   */
  async function collectTrackedDOIs(libraryID: number): Promise<{
    dois: string[];
    withoutDoi: number;
    duplicates: number;
  }> {
    const ids = await allTrackedIDs(libraryID);
    const byID = await resolveDOIs(ids);

    const seen = new Set<string>();
    for (const id of ids) {
      const doi = byID.get(id);
      if (doi) seen.add(doi);
    }
    const dois = [...seen];
    const withoutDoi = countWithoutDOI(ids, byID);

    return { dois, withoutDoi, duplicates: ids.length - withoutDoi - dois.length };
  }

  /**
   * Standing note naming how many tracked items carry no usable DOI. One line
   * covers both consequences — such items are excluded from the counts and are
   * not sent to the Atlas — because it is one cause, and two separate notices
   * sitting together would just read as the same sentence twice.
   *
   * Deliberately untimed; see the comment on the element in preferences.xhtml.
   */
  function renderAtlasWarning(withoutDoi: number): void {
    const el = doc.getElementById("stats-atlas-warning") as HTMLElement | null;
    if (!el) return;
    if (withoutDoi > 0) {
      el.textContent = getString("pref-stats-no-doi-note", { count: withoutDoi });
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  }

  /**
   * Fill the library picker. Hidden entirely when the user has only the
   * personal library, so nothing changes for single-library users (#100).
   */
  function initLibraryPicker(): void {
    const select = doc.getElementById("stats-library-select") as HTMLSelectElement | null;
    const row = doc.getElementById("stats-library-row") as HTMLElement | null;
    if (!select || !row) return;

    const libraries = Zotero.Libraries.getAll()
      .filter((lib: any) => lib.libraryType !== "feed");
    if (libraries.length < 2) return;

    const label = doc.getElementById("pref-stats-library-label");
    if (label) label.textContent = getString("pref-stats-library");

    for (const lib of libraries) {
      const option = doc.createElement("option");
      option.setAttribute("value", String(lib.libraryID));
      option.textContent = lib.name;
      select.appendChild(option);
    }
    select.value = String(Zotero.Libraries.userLibraryID);
    row.style.display = "flex";

    select.addEventListener("change", () => { loadStatsUI(); });
  }

  // ── load stats from Zotero library ───────────────────────────────────────

  async function loadStatsUI(): Promise<void> {
    try {
      // Show loading state
      for (const id of [
        "stat-total", "stat-originals", "stat-has-replication",
        "stat-is-replication", "stat-has-reproduction", "stat-is-reproduction",
      ]) setText(id, "…");

      const libraryID = selectedLibraryID();

      const [total, hasRepIDs, isRepIDs, hasReproIDs, isReproIDs] = await Promise.all([
        countAllItems(libraryID),
        searchByTag(getTag(TAG_HAS_BEEN_REPLICATED), libraryID),
        searchByTag(getTag(TAG_IS_REPLICATION), libraryID),
        searchByTag(getTag(TAG_HAS_BEEN_REPRODUCED), libraryID),
        searchByTag(getTag(TAG_IS_REPRODUCTION), libraryID),
      ]);

      // Original articles tracked = items tagged "Has Been Replicated" or
      // "Has Been Reproduced"; an item carrying both must still count once.
      const originalIDs = [...new Set([...hasRepIDs, ...hasReproIDs])];
      const trackedIDs = [...new Set([...originalIDs, ...isRepIDs, ...isReproIDs])];

      // One resolution pass for every tracked item, reused by all five counts.
      const doiByID = await resolveDOIs(trackedIDs);

      // Counted by distinct DOI, not by item: these rows are labelled
      // "Articles", and the Atlas button sends distinct DOIs too, so counting
      // items here would have made the two disagree whenever a library held the
      // same paper twice. Only "Total library items" stays an item count.
      const originals = countUniqueDOIs(originalIDs, doiByID);
      const hasRep    = countUniqueDOIs(hasRepIDs, doiByID);
      const isRep     = countUniqueDOIs(isRepIDs, doiByID);
      const hasRepro  = countUniqueDOIs(hasReproIDs, doiByID);
      const isRepro   = countUniqueDOIs(isReproIDs, doiByID);
      const withoutDoi = countWithoutDOI(trackedIDs, doiByID);

      setText("stat-total",            total.toLocaleString());
      setText("stat-originals",        String(originals));
      setText("stat-has-replication",  String(hasRep));
      setText("stat-is-replication",   String(isRep));
      setText("stat-has-reproduction", String(hasRepro));
      setText("stat-is-reproduction",  String(isRepro));

      Zotero.debug(
        `[ReplicationChecker Prefs] Stats (unique DOIs): total=${total} ` +
        `originals=${originals} hasRep=${hasRep} isRep=${isRep} ` +
        `hasRepro=${hasRepro} isRepro=${isRepro}; ` +
        `${trackedIDs.length} tracked items, ${withoutDoi} without a DOI`
      );

      // Nothing is dropped silently: the note names the items excluded above.
      renderAtlasWarning(withoutDoi);
    } catch (error) {
      Zotero.debug("[ReplicationChecker Prefs] Error loading stats: " + error);
    }
  }

  // ── Open FLoRA Replication Atlas ─────────────────────────────────────────
  // Tracked original DOIs travel in the query string (?dois=doi1,doi2,...).
  //
  // The Atlas is served from GitHub Pages, whose edge (Fastly) answers 414 as
  // soon as the request target — path + query, excluding scheme and host —
  // exceeds 8192 bytes. Measured against forrt.org on 2026-07-28:
  // 8192 bytes → 200, 8193 bytes → 414. MAX_REQUEST_TARGET keeps a margin below
  // that for corporate proxies with tighter limits.
  //
  // Anything longer cannot be delivered by URL at all: the Atlas reads its
  // input from query parameters only, so a hash fragment (never sent to a
  // server, hence unlimited) or a POST would need a change on the Atlas side.
  // Until then, oversized lists go to the clipboard.

  const ATLAS_PATH = "/flora-replication-atlas/";
  const ATLAS_BASE = `https://forrt.org${ATLAS_PATH}`;
  const MAX_REQUEST_TARGET = 8000;

  async function openAtlas(): Promise<void> {
    const errorEl = doc.getElementById("stats-atlas-error");

    // Only for failures that stop the Atlas from opening: the user stays on the
    // pane to read them, so hiding them again is safe. The "items with no usable
    // DOI" warning is handled by renderAtlasWarning() instead, which does not
    // time out, because that click navigates away.
    const showError = (msg: string) => {
      if (!errorEl) return;
      errorEl.textContent = msg;
      (errorEl as HTMLElement).style.display = "block";
      setTimeout(() => { (errorEl as HTMLElement).style.display = "none"; }, 6000);
    };

    try {
      const { dois, withoutDoi, duplicates } = await collectTrackedDOIs(selectedLibraryID());

      // Refresh the standing warning so it matches this click exactly.
      renderAtlasWarning(withoutDoi);

      if (dois.length === 0) {
        showError(getString("pref-stats-no-originals"));
        return;
      }

      // Percent-encode each DOI so characters that are legal in a DOI but not in
      // a URL (#, spaces, <, >, &) can't truncate or corrupt the query. "/" is
      // left as-is — it is legal inside a query string, and keeping it verbatim
      // means ordinary DOIs produce exactly the URL they always have.
      const query = dois
        .map((doi) => encodeURIComponent(doi).replace(/%2F/gi, "/"))
        .join(",");
      const requestTarget = `${ATLAS_PATH}?dois=${query}`;

      if (requestTarget.length <= MAX_REQUEST_TARGET) {
        Zotero.launchURL(`https://forrt.org${requestTarget}`);
      } else {
        // Too many DOIs for one URL — copy the raw list and open the Atlas homepage
        const clipHelper = (Components.classes as any)[
          "@mozilla.org/widget/clipboardhelper;1"
        ].getService((Components.interfaces as any).nsIClipboardHelper);
        clipHelper.copyString(dois.join(","));

        const progressWin = new Zotero.ProgressWindow();
        progressWin.changeHeadline("FLoRA Replication Atlas");
        // addDescription(), not addLines() — see addProgressLine() in
        // replicationChecker.ts: an empty icon renders as a broken-image box.
        progressWin.addDescription(
          getString("pref-stats-atlas-clipboard", { count: dois.length })
        );
        progressWin.show();
        progressWin.startCloseTimer(5000);

        Zotero.launchURL(ATLAS_BASE);
      }

      Zotero.debug(
        `[ReplicationChecker Prefs] Opening Atlas: ${dois.length} unique DOIs ` +
        `(${withoutDoi} without a usable DOI, ${duplicates} duplicate DOIs), ` +
        `request target ${requestTarget.length}/${MAX_REQUEST_TARGET} bytes`
      );
    } catch (error) {
      Zotero.debug("[ReplicationChecker Prefs] Error opening Atlas: " + error);
    }
  }

  // ── Wire up buttons ───────────────────────────────────────────────────────

  initLibraryPicker();

  const atlasBtn = doc.getElementById("stats-atlas-btn");
  if (atlasBtn) atlasBtn.addEventListener("click", () => { openAtlas(); });

  // ── Auto-update via Zotero Notifier ──────────────────────────────────────

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  statsNotifierID = Zotero.Notifier.registerObserver(
    {
      notify: (event: string, type: string, _ids: (number | string)[], _extraData: Record<string, any>) => {
        if (type === "item" && (event === "add" || event === "modify" || event === "delete")) {
          // Debounce: wait 500 ms after the last change before reloading
          if (debounceTimer !== null) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => { loadStatsUI(); }, 500);
        }
      },
    },
    ["item"]
  );
  Zotero.debug("[ReplicationChecker Prefs] Stats notifier registered: " + statsNotifierID);

  // ── Clean up on window close ──────────────────────────────────────────────

  const win = doc.defaultView;
  if (win) {
    win.addEventListener("unload", () => {
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      if (statsNotifierID) {
        try {
          Zotero.Notifier.unregisterObserver(statsNotifierID);
          Zotero.debug("[ReplicationChecker Prefs] Stats notifier unregistered");
        } catch (e) {
          Zotero.debug("[ReplicationChecker Prefs] Could not unregister stats notifier: " + e);
        }
      }
    });
  }

  // ── Initial load ──────────────────────────────────────────────────────────
  await loadStatsUI();
}

export default {
  onStartup,
  onMainWindowLoad,
  onMainWindowUnload,
  onShutdown,
};
