/**
 * Preference utilities for Replication Checker
 * Wraps Zotero's preference system with typed getters/setters
 */

const PREF_PREFIX = "extensions.zotero.replication-checker.";

/**
 * Get a preference value
 * @param key The preference key (without prefix)
 * @returns The preference value
 */
export function getPref(key: string): any {
  return Zotero.Prefs.get(PREF_PREFIX + key, true);
}

/**
 * Set a preference value
 * @param key The preference key (without prefix)
 * @param value The value to set
 */
export function setPref(key: string, value: any): void {
  Zotero.Prefs.set(PREF_PREFIX + key, value, true);
}

/**
 * Clear a preference value
 * @param key The preference key (without prefix)
 */
export function clearPref(key: string): void {
  Zotero.Prefs.clear(PREF_PREFIX + key, true);
}

/**
 * Preference helpers class for type-safe preference access
 */
export const ReplicationCheckerPrefs = {
  /**
   * Check if auto-checking is enabled
   */
  get enableAutoCheck(): boolean {
    return getPref("enableAutoCheck") ?? false;
  },

  set enableAutoCheck(value: boolean) {
    setPref("enableAutoCheck", value);
  },

  /**
   * Check if notes should be created
   */
  get createNotes(): boolean {
    return getPref("createNotes") ?? true;
  },

  set createNotes(value: boolean) {
    setPref("createNotes", value);
  },

  /**
   * Check if replication folder should be created
   */
  get createReplicationFolder(): boolean {
    return getPref("createReplicationFolder") ?? true;
  },

  set createReplicationFolder(value: boolean) {
    setPref("createReplicationFolder", value);
  }
};
