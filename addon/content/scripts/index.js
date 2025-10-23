/**
 * Main Entry Point
 * Loads all modules and initializes the plugin
 */

(function() {
  'use strict';
  
  const rootURI = ReplicationChecker.rootURI;
  
  ReplicationChecker.log("Loading modules...");
  
  // Load dependencies in order
  Services.scriptloader.loadSubScript(rootURI + 'content/scripts/crypto-js.min.js');
  ReplicationChecker.log("✓ CryptoJS loaded");
  
  Services.scriptloader.loadSubScript(rootURI + 'content/scripts/zotero-integration.js');
  ReplicationChecker.log("✓ Zotero integration loaded");
  
  Services.scriptloader.loadSubScript(rootURI + 'content/scripts/data-source.js');
  ReplicationChecker.log("✓ Data source loaded");
  
  Services.scriptloader.loadSubScript(rootURI + 'content/scripts/batch-matcher.js');
  ReplicationChecker.log("✓ Batch matcher loaded");
  
  Services.scriptloader.loadSubScript(rootURI + 'content/scripts/replication-checker.js');
  ReplicationChecker.log("✓ Replication checker loaded");
  
  // Initialize the plugin
  (async function init() {
    try {
      ReplicationChecker.log("Initializing plugin...");
      
      // Initialize the main plugin logic
      await ReplicationCheckerPlugin.init(rootURI);
      
      // Setup UI after a short delay to ensure Zotero UI is ready
      setTimeout(() => {
        setupUI();
      }, 1000);
      
      ReplicationChecker.initialized = true;
      ReplicationChecker.log("✓ Plugin initialized successfully");
      
    } catch (error) {
      ReplicationChecker.log("ERROR during initialization: " + error);
      Zotero.logError(error);
    }
  })();
  
  /**
   * Setup UI elements (menu items)
   */
  function setupUI() {
    try {
      const win = Zotero.getMainWindow();
      if (!win || !win.document) {
        ReplicationChecker.log("Main window not ready, retrying...");
        setTimeout(setupUI, 500);
        return;
      }
      
      ReplicationChecker.log("Setting up UI...");
      
      // Add to Tools menu (disabled initially)
      const toolsPopup = win.document.getElementById('menu_ToolsPopup');
      if (toolsPopup) {
        const menuitem = win.document.createXULElement('menuitem');
        menuitem.id = 'replication-checker-tools-menu';
        menuitem.setAttribute('label', 'Check Library for Replications (Initializing...)');
        menuitem.setAttribute('disabled', 'true');
        menuitem.addEventListener('command', () => {
          ReplicationCheckerPlugin.checkEntireLibrary();
        });
        toolsPopup.appendChild(menuitem);
        ReplicationChecker.menuItems = ReplicationChecker.menuItems || [];
        ReplicationChecker.menuItems.push(menuitem);
        ReplicationChecker.log("✓ Tools menu item added (disabled)");
      }
      
      // Add to item context menu (disabled initially)
      const itemMenu = win.document.getElementById('zotero-itemmenu');
      if (itemMenu) {
        const menuitem = win.document.createXULElement('menuitem');
        menuitem.id = 'replication-checker-context-menu';
        menuitem.setAttribute('label', 'Check for Replications (Initializing...)');
        menuitem.setAttribute('disabled', 'true');
        menuitem.addEventListener('command', () => {
          ReplicationCheckerPlugin.checkSelectedItems();
        });
        itemMenu.appendChild(menuitem);
        ReplicationChecker.menuItems = ReplicationChecker.menuItems || [];
        ReplicationChecker.menuItems.push(menuitem);
        ReplicationChecker.log("Context menu item added (disabled)");
      }

      // Add to collection context menu (disabled initially)
      const collectionMenu = win.document.getElementById('zotero-collectionmenu');
      if (collectionMenu) {
        const menuitem = win.document.createXULElement('menuitem');
        menuitem.id = 'replication-checker-collection-menu';
        menuitem.setAttribute('label', 'Check for Replications (Initializing...)');
        menuitem.setAttribute('disabled', 'true');
        menuitem.addEventListener('command', () => {
          ReplicationCheckerPlugin.checkSelectedCollection();
        });
        collectionMenu.appendChild(menuitem);
        ReplicationChecker.menuItems = ReplicationChecker.menuItems || [];
        ReplicationChecker.menuItems.push(menuitem);
        ReplicationChecker.log("Collection menu item added (disabled)");
      }
      
      ReplicationChecker.log("UI setup complete (menus disabled)");
      
      // Enable menus after 15 seconds (15000 milliseconds)
      ReplicationChecker.log("Scheduling menu enablement in 15 seconds...");
      setTimeout(() => {
        enableMenus();
      }, 15000);
      
    } catch (error) {
      ReplicationChecker.log("ERROR setting up UI: " + error);
      Zotero.logError(error);
    }
  }
  
  /**
   * Enable menu items after initialization period
   */
  function enableMenus() {
    try {
      ReplicationChecker.log("Enabling menu items...");
      
      const win = Zotero.getMainWindow();
      if (!win || !win.document) {
        ReplicationChecker.log("Main window not available, retrying...");
        setTimeout(enableMenus, 500);
        return;
      }
      
      // Enable Tools menu item
      const toolsMenuItem = win.document.getElementById('replication-checker-tools-menu');
      if (toolsMenuItem) {
        toolsMenuItem.removeAttribute('disabled');
        toolsMenuItem.setAttribute('label', 'Check Library for Replications');
        ReplicationChecker.log("Tools menu item enabled");
      }
      
      // Enable context menu item
      const contextMenuItem = win.document.getElementById('replication-checker-context-menu');
      if (contextMenuItem) {
        contextMenuItem.removeAttribute('disabled');
        contextMenuItem.setAttribute('label', 'Check for Replications');
        ReplicationChecker.log("Context menu item enabled");
      }

      // Enable collection menu item
      const collectionMenuItem = win.document.getElementById('replication-checker-collection-menu');
      if (collectionMenuItem) {
        collectionMenuItem.removeAttribute('disabled');
        collectionMenuItem.setAttribute('label', 'Check for Replications');
        ReplicationChecker.log("Collection menu item enabled");
      }
      
      ReplicationChecker.log("All menu items enabled and ready to use");
      
    } catch (error) {
      ReplicationChecker.log("ERROR enabling menus: " + error);
      Zotero.logError(error);
    }
  }
  
  /**
   * Cleanup function called on shutdown
   */
  const originalShutdown = ReplicationCheckerPlugin.shutdown;
  ReplicationCheckerPlugin.shutdown = function() {
    try {
      ReplicationChecker.log("Cleaning up UI...");
      
      // Call original shutdown (unregister notifier)
      if (originalShutdown && typeof originalShutdown === 'function') {
        originalShutdown.call(ReplicationCheckerPlugin);
      }
      
      // Remove menu items
      if (ReplicationChecker.menuItems) {
        for (const menuitem of ReplicationChecker.menuItems) {
          if (menuitem && menuitem.parentNode) {
            menuitem.parentNode.removeChild(menuitem);
          }
        }
        ReplicationChecker.menuItems = [];
      }
      
      ReplicationChecker.log("Cleanup complete");
    } catch (error) {
      ReplicationChecker.log("ERROR during cleanup: " + error);
    }
  };
  
})();
