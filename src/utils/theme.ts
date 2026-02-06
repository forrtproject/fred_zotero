/**
 * Theme utility for detecting Zotero's light/dark mode
 * and providing theme-aware icon paths
 */

import { config } from "../../package.json";

export type ThemeMode = "light" | "dark";

// Cached theme state
let currentTheme: ThemeMode = "light";
let themeObserverInitialized = false;
let themeChangeCallbacks: Array<(theme: ThemeMode) => void> = [];

/**
 * Detect current theme mode from Zotero's UI
 * Uses multiple methods to detect the actual rendered theme
 */
export function detectTheme(): ThemeMode {
  try {
    const mainWindow = Zotero.getMainWindow();
    if (!mainWindow) {
      return "light";
    }

    // Method 1: Check the document element for dark theme indicators
    // Zotero 7 may add attributes or classes when in dark mode
    const doc = mainWindow.document;
    const docEl = doc?.documentElement;

    // Check for common dark theme indicators
    if (docEl && (
        docEl.hasAttribute("lwtheme-brighttext") ||
        docEl.getAttribute("data-theme") === "dark" ||
        docEl.classList.contains("dark") ||
        doc.body?.classList.contains("dark"))) {
      currentTheme = "dark";
      Zotero.debug(`[ReplicationChecker] Detected dark theme via DOM attributes`);
      return "dark";
    }

    // Method 2: Fall back to matchMedia (system preference)
    const darkModeQuery = mainWindow.matchMedia?.("(prefers-color-scheme: dark)");
    if (darkModeQuery?.matches) {
      currentTheme = "dark";
      Zotero.debug(`[ReplicationChecker] Detected dark theme via matchMedia`);
      return "dark";
    }

    currentTheme = "light";
    Zotero.debug(`[ReplicationChecker] Detected light theme (default)`);
    return "light";
  } catch (e) {
    Zotero.debug(`[ReplicationChecker] Error detecting theme: ${e}`);
    return "light";
  }
}

/**
 * Get the current cached theme
 */
export function getCurrentTheme(): ThemeMode {
  return currentTheme;
}

/**
 * Get the icon path for the current theme
 * @param size - Icon size: "normal" (96px) or "half" (48px / 0.5x)
 * @returns The chrome:// URI for the appropriate icon
 *
 * Icon naming convention:
 * - favicon-light.png = light-colored icon (for use on DARK backgrounds)
 * - favicon-dark.png = dark-colored icon (for use on LIGHT backgrounds)
 */
export function getThemedIconPath(size: "normal" | "half" = "normal"): string {
  const theme = detectTheme();
  const suffix = size === "half" ? "@0.5x" : "";
  // Use theme directly: dark theme -> favicon-dark, light theme -> favicon-light
  const iconPath = `chrome://${config.addonRef}/content/icons/favicon-${theme}${suffix}.png`;
  Zotero.debug(`[ReplicationChecker] getThemedIconPath: theme=${theme}, path=${iconPath}`);
  return iconPath;
}

/**
 * Get the root URI path for themed icons (for preference pane which uses rootURI)
 * @param size - Icon size: "normal" (96px) or "half" (48px / 0.5x)
 * @returns The relative path for the appropriate icon
 */
export function getThemedIconRelativePath(
  size: "normal" | "half" = "normal"
): string {
  const theme = detectTheme();
  const suffix = size === "half" ? "@0.5x" : "";
  // Use theme directly: dark theme -> favicon-dark, light theme -> favicon-light
  return `icons/favicon-${theme}${suffix}.png`;
}

/**
 * Register a callback for theme changes
 * @param callback - Function to call when theme changes
 * @returns Unsubscribe function
 */
export function onThemeChange(
  callback: (theme: ThemeMode) => void
): () => void {
  themeChangeCallbacks.push(callback);
  return () => {
    themeChangeCallbacks = themeChangeCallbacks.filter((cb) => cb !== callback);
  };
}

/**
 * Notify all registered callbacks of theme change
 */
function notifyThemeChange(theme: ThemeMode): void {
  Zotero.debug(`[ReplicationChecker] Theme changed to: ${theme}`);
  for (const callback of themeChangeCallbacks) {
    try {
      callback(theme);
    } catch (e) {
      Zotero.debug(`[ReplicationChecker] Error in theme change callback: ${e}`);
    }
  }
}

/**
 * Initialize the theme observer to detect theme changes
 * Should be called once during plugin startup
 */
export function initThemeObserver(): void {
  if (themeObserverInitialized) {
    return;
  }

  try {
    const mainWindow = Zotero.getMainWindow();
    if (!mainWindow) {
      Zotero.debug("[ReplicationChecker] No main window available for theme observer");
      return;
    }

    // Listen for system theme changes via matchMedia
    const darkModeQuery = mainWindow.matchMedia("(prefers-color-scheme: dark)");

    if (!darkModeQuery) {
      Zotero.debug("[ReplicationChecker] matchMedia not available for theme detection");
      return;
    }

    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const newTheme: ThemeMode = e.matches ? "dark" : "light";
      if (newTheme !== currentTheme) {
        currentTheme = newTheme;
        notifyThemeChange(newTheme);
      }
    };

    // Modern browsers use addEventListener, older ones use addListener
    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener("change", handleThemeChange);
    } else if ((darkModeQuery as any).addListener) {
      (darkModeQuery as any).addListener(handleThemeChange);
    }

    // Set initial theme
    currentTheme = darkModeQuery.matches ? "dark" : "light";
    themeObserverInitialized = true;

    Zotero.debug(
      `[ReplicationChecker] Theme observer initialized, current theme: ${currentTheme}`
    );
  } catch (e) {
    Zotero.debug(`[ReplicationChecker] Error initializing theme observer: ${e}`);
  }
}

/**
 * Cleanup theme observer
 */
export function cleanupThemeObserver(): void {
  themeChangeCallbacks = [];
  themeObserverInitialized = false;
}
