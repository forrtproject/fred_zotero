/*
* File Description: bootstrap.js
 * This file is the entry point for the Zotero plugin. It handles the plugin's lifecycle events (startup, shutdown, install, uninstall).
 * It initializes the replication checker, loads necessary scripts (CryptoJS for hashing and core plugin modules), adds menu items to Zotero's UI,
 * and sets up event listeners for main window load/unload. It does not handle core logic but delegates to other modules like ReplicationCheckerPlugin.
*/
const { classes: Cc, interfaces: Ci, utils: Cu } = Components;
Cu.import("resource://gre/modules/Services.jsm");

var ReplicationCheckerMinimal = {
  menuItemIDs: [],
  replicationData: null,
  rootURI: null,

  async startup({ id, version, resourceURI, rootURI }) {
    Zotero.debug("=== Replication Checker: Starting ===");
    this.rootURI = rootURI;

    Services.scriptloader.loadSubScript(rootURI + "chrome/content/scripts/crypto-js.min.js");
    Zotero.debug("CryptoJS loaded");

    Services.scriptloader.loadSubScript(rootURI + "chrome/content/zotero-integration.js");
    Zotero.debug("zotero-integration.js loaded");

    Services.scriptloader.loadSubScript(rootURI + "chrome/content/data-source.js");
    Zotero.debug("data-source.js loaded");

    Services.scriptloader.loadSubScript(rootURI + "chrome/content/batch-matcher.js");
    Zotero.debug("batch-matcher.js loaded");

    Services.scriptloader.loadSubScript(rootURI + "chrome/content/replication-checker.js");
    Zotero.debug("replication-checker.js loaded");

    Zotero.debug("Initializing ReplicationCheckerPlugin...");
    await ReplicationCheckerPlugin.init(rootURI);

    // Wait a bit for Zotero UI to be ready, then add menu items.
    setTimeout(() => {
      this.addMenuItems();
    }, 1000);

    Zotero.debug("=== Replication Checker: Startup complete ===");
  },

  addMenuItems() {
    // This function adds the "Check for Replications" menu item to Zotero's Tools menu and item context menu (right-click).
    const win = Zotero.getMainWindow();
    if (!win || !win.document) return;

    // Add to Tools menu
    const toolsPopup = win.document.getElementById('menu_ToolsPopup');
    if (toolsPopup) {
      const menuitem = win.document.createXULElement('menuitem');
      menuitem.id = 'replication-checker-tools';
      menuitem.setAttribute('label', 'Check Library for Replications');
      menuitem.addEventListener('command', () => ReplicationCheckerPlugin.checkEntireLibrary());
      toolsPopup.appendChild(menuitem);
      this.menuItemIDs.push('replication-checker-tools');
    }

    // Add to item context menu
    const itemMenu = win.document.getElementById('zotero-itemmenu');
    if (itemMenu) {
      const menuitem = win.document.createXULElement('menuitem');
      menuitem.id = 'replication-checker-context';
      menuitem.setAttribute('label', 'Check for Replications');
      menuitem.addEventListener('command', () => ReplicationCheckerPlugin.checkSelectedItems());
      itemMenu.appendChild(menuitem);
      this.menuItemIDs.push('replication-checker-context');
    }
  },

  shutdown() {
    Zotero.debug("Replication Checker: Shutting down...");

    // Remove menu items
    const win = Zotero.getMainWindow();
    if (win && win.document) {
      for (const id of this.menuItemIDs) {
        const elem = win.document.getElementById(id);
        if (elem) {
          elem.remove();
        }
      }
    }
    this.menuItemIDs = [];
  },

  install() {
    Zotero.debug("Replication Checker: Installed");
  },

  uninstall() {
    Zotero.debug("Replication Checker: Uninstalled");
  }
};

// Zotero lifecycle hooks: These functions are called by Zotero at specific lifecycle events.
function startup(data, reason) { ReplicationCheckerMinimal.startup(data); }
function shutdown(data, reason) { ReplicationCheckerMinimal.shutdown(); }
function install(data, reason) { ReplicationCheckerMinimal.install(); }
function uninstall(data, reason) { ReplicationCheckerMinimal.uninstall(); }

function onMainWindowLoad({ window }) {
  Zotero.debug("Replication Checker: Main window loaded");
}

function onMainWindowUnload({ window }) {
  Zotero.debug("Replication Checker: Main window unloaded");
}