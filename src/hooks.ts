/**
 * Lifecycle hooks for Replication Checker plugin
 * Handles startup, window loading, and shutdown events
 */

import { replicationChecker } from "./modules/replicationChecker";
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
    // Initialize the replication checker plugin
    const rootURI = `chrome://${config.addonRef}/content/`;
    await replicationChecker.init(rootURI);

    // Register preference pane
    Zotero.PreferencePanes.register({
      pluginID: config.addonID,
      src: rootURI + "preferences.xhtml",
      label: config.addonName,
      image: rootURI + "icons/favicon@0.5x.png",
    });

    Zotero.debug("[ReplicationChecker] Preference pane registered");

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
      commandListener: () => {
        replicationChecker.checkEntireLibrary();
      },
    });
    Zotero.debug("[ReplicationChecker] Added Tools menu item");

    // Register Item context menu item
    ztoolkit.Menu.register("item", {
      tag: "menuitem",
      id: "replication-checker-item-menu",
      label: getString("replication-checker-context-menu"),
      commandListener: () => {
        replicationChecker.checkSelectedItems();
      },
    });
    Zotero.debug("[ReplicationChecker] Added Item context menu item");

    // Register Collection context menu item
    ztoolkit.Menu.register("collection", {
      tag: "menuitem",
      id: "replication-checker-collection-menu",
      label: getString("replication-checker-context-menu"),
      commandListener: () => {
        replicationChecker.checkSelectedCollection();
      },
    });
    Zotero.debug("[ReplicationChecker] Added Collection context menu item");

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

export async function onShutdown() {
  Zotero.debug("[ReplicationChecker] Shutting down...");

  try {
    // Cleanup plugin resources
    replicationChecker.shutdown();

    addon.data.alive = false;
    Zotero.debug("[ReplicationChecker] Shutdown complete");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    Zotero.logError(new Error(`[ReplicationChecker] Error during shutdown: ${errorMsg}`));
  }
}

export default {
  onStartup,
  onMainWindowLoad,
  onMainWindowUnload,
  onShutdown,
};
