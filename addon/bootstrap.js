/**
 * Most of this code is from Zotero team's official Make It Red example[1]
 * or the Zotero 7 documentation[2].
 * [1] https://github.com/zotero/make-it-red
 * [2] https://www.zotero.org/support/dev/zotero_7_for_developers
 */

var chromeHandle;

function install(data, reason) {}

async function startup({ id, version, resourceURI, rootURI }, reason) {
  var aomStartup = Components.classes[
    "@mozilla.org/addons/addon-manager-startup;1"
  ].getService(Components.interfaces.amIAddonManagerStartup);
  var manifestURI = Services.io.newURI(rootURI + "manifest.json");
  chromeHandle = aomStartup.registerChrome(manifestURI, [
    ["content", "replicationChecker", rootURI + "content/"],
  ]);

  /**
   * Global variables for plugin code.
   * The `_globalThis` is the global root variable of the plugin sandbox environment
   * and all child variables assigned to it is globally accessible.
   * See `src/index.ts` for details.
   */
  const ctx = { rootURI };
  ctx._globalThis = ctx;

  Services.scriptloader.loadSubScript(
    `${rootURI}/content/scripts/replicationChecker.js`,
    ctx,
  );
  await Zotero.ReplicationChecker.hooks.onStartup();
}

async function onMainWindowLoad({ window }, reason) {
  await Zotero.ReplicationChecker?.hooks.onMainWindowLoad(window);
}

async function onMainWindowUnload({ window }, reason) {
  await Zotero.ReplicationChecker?.hooks.onMainWindowUnload(window);
}

async function shutdown({ id, version, resourceURI, rootURI }, reason) {
  if (reason === APP_SHUTDOWN) {
    return;
  }

  await Zotero.ReplicationChecker?.hooks.onShutdown();

  if (chromeHandle) {
    chromeHandle.destruct();
    chromeHandle = null;
  }
}

async function uninstall(data, reason) {
  // Clear all plugin preferences on uninstall
  if (reason === ADDON_UNINSTALL) {
    const prefs = [
      "extensions.zotero.replication-checker.onboardingVersion",
      "extensions.zotero.replication-checker.firstRunDone",
      "extensions.zotero.replication-checker.autoCheckFrequency",
      "extensions.zotero.replication-checker.autoCheckNewItems"
    ];

    for (const pref of prefs) {
      try {
        if (Zotero.Prefs.get(pref) !== undefined) {
          Zotero.Prefs.clear(pref);
        }
      } catch (e) {
        // Preference doesn't exist, ignore
      }
    }
  }
}
