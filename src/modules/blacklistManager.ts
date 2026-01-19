/**
 * Blacklist Manager
 * Manages banned replication items that should not be re-added during checks
 */

import type { BlacklistEntry, BlacklistData } from "../types/replication";

const BLACKLIST_PREF = "replication-checker.blacklist";

/**
 * Manages the blacklist of banned replication items
 * Provides persistence via Zotero preferences and fast DOI lookup
 */
class BlacklistManager {
  private blacklist: BlacklistData = { version: 1, entries: [] };
  private doiIndex: Set<string> = new Set();
  private initialized: boolean = false;

  /**
   * Initialize the blacklist manager
   * Loads blacklist from preferences and builds index
   */
  async init(): Promise<void> {
    if (this.initialized) {
      Zotero.debug("BlacklistManager: Already initialized");
      return;
    }

    try {
      const prefValue = Zotero.Prefs.get(BLACKLIST_PREF);

      if (!prefValue || typeof prefValue !== 'string' || prefValue === '') {
        Zotero.debug("BlacklistManager: No existing blacklist, initializing empty");
        this.blacklist = { version: 1, entries: [] };
        this.initialized = true;
        return;
      }

      this.blacklist = JSON.parse(prefValue as string);

      // Validate structure
      if (!this.blacklist.entries || !Array.isArray(this.blacklist.entries)) {
        throw new Error('Invalid blacklist structure: entries is not an array');
      }

      if (typeof this.blacklist.version !== 'number') {
        throw new Error('Invalid blacklist structure: version is not a number');
      }

      Zotero.debug(`BlacklistManager: Loaded ${this.blacklist.entries.length} blacklisted entries`);

    } catch (error) {
      Zotero.logError(
        new Error(`BlacklistManager: Blacklist corrupted, resetting: ${
          error instanceof Error ? error.message : String(error)
        }`)
      );
      this.blacklist = { version: 1, entries: [] };
      await this.saveBlacklist();
    }

    // Build DOI index for O(1) lookup
    this.rebuildIndex();
    this.initialized = true;
  }

  /**
   * Rebuild the DOI index from current entries
   */
  private rebuildIndex(): void {
    this.doiIndex.clear();
    for (const entry of this.blacklist.entries) {
      const normalizedDoi = this.normalizeDOI(entry.doi);
      if (normalizedDoi) {
        this.doiIndex.add(normalizedDoi);
      }
    }
    Zotero.debug(`BlacklistManager: Index rebuilt with ${this.doiIndex.size} DOIs`);
  }

  /**
   * Normalize DOI for consistent comparison
   * Uses same pattern as BatchMatcher
   */
  private normalizeDOI(doi: string | null | undefined): string | null {
    if (!doi) return null;

    let normalized = String(doi).trim().toLowerCase();

    // Remove common URL prefixes
    normalized = normalized.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
    normalized = normalized.replace(/^doi:\s*/i, "");
    normalized = normalized.replace(/\/+/g, "/"); // Collapse multiple slashes
    normalized = normalized.trim();

    // Validate DOI format
    if (!normalized.startsWith("10.")) {
      return null;
    }

    return normalized;
  }

  /**
   * Save blacklist to preferences
   */
  private async saveBlacklist(): Promise<void> {
    try {
      const jsonString = JSON.stringify(this.blacklist);
      Zotero.Prefs.set(BLACKLIST_PREF, jsonString);
      Zotero.debug(`BlacklistManager: Saved ${this.blacklist.entries.length} entries to preferences`);
    } catch (error) {
      Zotero.logError(
        new Error(`BlacklistManager: Failed to save blacklist: ${
          error instanceof Error ? error.message : String(error)
        }`)
      );
      throw error;
    }
  }

  /**
   * Add a replication to the blacklist
   */
  async addToBlacklist(entry: BlacklistEntry): Promise<void> {
    if (!this.initialized) {
      throw new Error('BlacklistManager not initialized');
    }

    const normalizedDoi = this.normalizeDOI(entry.doi);
    if (!normalizedDoi) {
      Zotero.debug(`BlacklistManager: Cannot blacklist entry - invalid DOI: ${entry.doi}`);
      return;
    }

    // Check if already blacklisted
    if (this.doiIndex.has(normalizedDoi)) {
      Zotero.debug(`BlacklistManager: DOI already blacklisted: ${normalizedDoi}`);
      return;
    }

    // Add to entries and index
    this.blacklist.entries.push(entry);
    this.doiIndex.add(normalizedDoi);

    // Persist
    await this.saveBlacklist();
    Zotero.debug(`BlacklistManager: Added to blacklist: ${entry.title} (${normalizedDoi})`);
  }

  /**
   * Check if a DOI is blacklisted
   */
  isBlacklisted(doi: string | null | undefined): boolean {
    if (!this.initialized) {
      Zotero.debug('BlacklistManager: isBlacklisted called before initialization, returning false');
      return false;
    }

    const normalizedDoi = this.normalizeDOI(doi);
    if (!normalizedDoi) return false;

    return this.doiIndex.has(normalizedDoi);
  }

  /**
   * Get all blacklist entries
   */
  getEntries(): BlacklistEntry[] {
    if (!this.initialized) {
      Zotero.debug('BlacklistManager: getEntries called before initialization');
      return [];
    }
    return [...this.blacklist.entries];
  }

  /**
   * Get entries formatted for UI display
   */
  getEntriesWithMetadata(): Array<{
    replicationTitle: string;
    originalTitle: string;
    doi: string;
    dateAdded: string;
  }> {
    if (!this.initialized) {
      return [];
    }

    return this.blacklist.entries.map(entry => ({
      replicationTitle: entry.title,
      originalTitle: entry.originalTitle,
      doi: entry.doi,
      dateAdded: entry.dateAdded,
    }));
  }

  /**
   * Remove a specific entry from the blacklist by DOI
   */
  async removeFromBlacklist(doi: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('BlacklistManager not initialized');
    }

    const normalizedDoi = this.normalizeDOI(doi);
    if (!normalizedDoi) {
      Zotero.debug(`BlacklistManager: Cannot remove - invalid DOI: ${doi}`);
      return;
    }

    // Find and remove entry
    const initialLength = this.blacklist.entries.length;
    this.blacklist.entries = this.blacklist.entries.filter(entry => {
      const entryNormalizedDoi = this.normalizeDOI(entry.doi);
      return entryNormalizedDoi !== normalizedDoi;
    });

    if (this.blacklist.entries.length === initialLength) {
      Zotero.debug(`BlacklistManager: DOI not found in blacklist: ${normalizedDoi}`);
      return;
    }

    // Remove from index and persist
    this.doiIndex.delete(normalizedDoi);
    await this.saveBlacklist();
    Zotero.debug(`BlacklistManager: Removed from blacklist: ${normalizedDoi}`);
  }

  /**
   * Clear all entries from the blacklist
   */
  async clearBlacklist(): Promise<void> {
    if (!this.initialized) {
      throw new Error('BlacklistManager not initialized');
    }

    const count = this.blacklist.entries.length;
    this.blacklist.entries = [];
    this.doiIndex.clear();

    await this.saveBlacklist();
    Zotero.debug(`BlacklistManager: Cleared ${count} entries from blacklist`);
  }

  /**
   * Get the count of blacklisted entries
   */
  getCount(): number {
    return this.blacklist.entries.length;
  }
}

// Export singleton instance
export const blacklistManager = new BlacklistManager();
