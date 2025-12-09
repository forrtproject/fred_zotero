/**
 * Lifecycle hooks for Replication Checker plugin
 * Handles startup, window loading, and shutdown events
 */

import { replicationChecker } from "./modules/replicationChecker";
import { onboardingManager } from "./modules/onboarding";
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
      image: rootURI + "icons/zotero-plugin.png",
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

    // Register Help menu - User Guide
    ztoolkit.Menu.register("menuHelp", {
      tag: "menuitem",
      id: "replication-checker-help-guide",
      label: "Replication Checker User Guide",
      commandListener: async () => {
        Zotero.debug("[ReplicationChecker] Opening user guide");
        await onboardingManager.showOnboarding();
      },
    });
    Zotero.debug("[ReplicationChecker] Added Help menu item");

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

    // Show onboarding and first-run prompt
    setTimeout(async () => {
      try {
        // Check if onboarding should be shown
        if (onboardingManager.shouldShowOnboarding()) {
          Zotero.debug("[ReplicationChecker] Showing onboarding tour");
          const completed = await onboardingManager.showOnboarding();

          if (!completed) {
            Zotero.debug("[ReplicationChecker] User skipped onboarding");
            // Still mark as shown so it doesn't appear again
            onboardingManager.markOnboardingComplete();
          }
        }

        // After onboarding, check if we should show the welcome prompt
        Zotero.debug("[ReplicationChecker] Checking first-run preference");
        let welcomeShown;
        try {
          welcomeShown = Zotero.Prefs.get("extensions.zotero.replication-checker.firstRunDone");
          Zotero.debug(`[ReplicationChecker] First run check: welcomeShown = ${welcomeShown}`);
        } catch (error) {
          Zotero.debug(`[ReplicationChecker] Error getting preference: ${error}`);
          welcomeShown = false; // Assume first run if preference doesn't exist
        }

        if (!welcomeShown) {
          Zotero.debug("[ReplicationChecker] Showing first-run scan prompt");
          const promptWin = Zotero.getMainWindow();
          if (!promptWin) {
            Zotero.debug("[ReplicationChecker] Main window not available, skipping prompt");
            return;
          }

          Zotero.Prefs.set("extensions.zotero.replication-checker.firstRunDone", true);

          const ps = Services.prompt as any;
          const result = ps.confirmEx(
            promptWin as any,
            getString("replication-checker-prompt-title"),
            getString("replication-checker-prompt-first-run"),
            ps.BUTTON_POS_0 * ps.BUTTON_TITLE_YES + ps.BUTTON_POS_1 * ps.BUTTON_TITLE_NO,
            null, null, null, null, {}
          );

          if (result === 0) {
            Zotero.debug("[ReplicationChecker] User accepted first-run scan");
            replicationChecker.checkEntireLibrary();
          } else {
            Zotero.debug("[ReplicationChecker] User declined first-run scan");
          }
        } else {
          Zotero.debug("[ReplicationChecker] First-run prompt already shown, skipping");
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        Zotero.logError(new Error(`[ReplicationChecker] Error in onboarding/prompt: ${errorMsg}`));
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
