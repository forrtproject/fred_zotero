/**
 * Modern Zotero 7 Bootstrap
 * Entry point for the Replication Checker plugin
 */

if (typeof Zotero == 'undefined') {
  var Zotero;
}

// Main plugin object
var ReplicationChecker = {
  id: null,
  version: null,
  rootURI: null,
  initialized: false,
  
  log(msg) {
    Zotero.debug("ReplicationChecker: " + msg);
  }
};

/**
 * Startup - called when plugin loads
 */
async function startup({ id, version, rootURI }) {
  ReplicationChecker.log("=== Starting up ===");
  ReplicationChecker.id = id;
  ReplicationChecker.version = version;
  ReplicationChecker.rootURI = rootURI;
  
  // Wait for Zotero to be ready
  await Zotero.initializationPromise;
  
  // Load main plugin code
  Services.scriptloader.loadSubScript(rootURI + 'content/scripts/index.js');
  
  ReplicationChecker.log("=== Startup complete ===");
}

/**
 * Shutdown - called when plugin unloads
 */
function shutdown() {
  ReplicationChecker.log("=== Shutting down ===");
  
  // Cleanup is handled in index.js
  if (ReplicationChecker.initialized && typeof ReplicationCheckerPlugin !== 'undefined') {
    ReplicationCheckerPlugin.shutdown();
  }
  
  ReplicationChecker.log("=== Shutdown complete ===");
}

/**
 * Install - called when plugin is installed
 */
function install() {
  ReplicationChecker.log("Plugin installed");
}

/**
 * Uninstall - called when plugin is uninstalled  
 */
function uninstall() {
  ReplicationChecker.log("Plugin uninstalled");
}
