/**
 * Blacklist Manager
 * Manages banned replication and reproduction items that should not be re-added during checks
 */

import type { BlacklistEntry, BlacklistData, BlacklistEntryType } from "../types/replication";

const BLACKLIST_PREF = "replication-checker.blacklist";

/**
 * Manages the blacklist of banned replication and reproduction items
 * Provides persistence via Zotero preferences and fast DOI/URL lookup
 */
class BlacklistManager {
  private blacklist: BlacklistData = { version: 2, entries: [] };
  private doiIndex: Set<string> = new Set();
  private urlIndex: Set<string> = new Set();
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
        this.blacklist = { version: 2, entries: [] };
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

      // Migrate old entries without type field
      for (const entry of this.blacklist.entries) {
        if (!entry.type) {
          entry.type = 'replication'; // Default to replication for old entries
        }
      }

      Zotero.debug(`BlacklistManager: Loaded ${this.blacklist.entries.length} blacklisted entries`);

    } catch (error) {
      Zotero.logError(
        new Error(`BlacklistManager: Blacklist corrupted, resetting: ${
          error instanceof Error ? error.message : String(error)
        }`)
      );
      this.blacklist = { version: 2, entries: [] };
      await this.saveBlacklist();
    }

    // Build indexes for O(1) lookup
    this.rebuildIndex();
    this.initialized = true;
  }

  /**
   * Rebuild the DOI and URL indexes from current entries
   */
  private rebuildIndex(): void {
    this.doiIndex.clear();
    this.urlIndex.clear();
    for (const entry of this.blacklist.entries) {
      const normalizedDoi = this.normalizeDOI(entry.doi);
      if (normalizedDoi) {
        this.doiIndex.add(normalizedDoi);
      }
      const normalizedUrl = this.normalizeUrl(entry.url);
      if (normalizedUrl) {
        this.urlIndex.add(normalizedUrl);
      }
    }
    Zotero.debug(`BlacklistManager: Index rebuilt with ${this.doiIndex.size} DOIs and ${this.urlIndex.size} URLs`);
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
   * Normalize URL for consistent comparison
   */
  private normalizeUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    let normalized = String(url).trim().toLowerCase();

    // Remove trailing slashes
    normalized = normalized.replace(/\/+$/, '');

    return normalized || null;
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
   * Add an entry to the blacklist
   */
  async addToBlacklist(entry: BlacklistEntry): Promise<void> {
    if (!this.initialized) {
      throw new Error('BlacklistManager not initialized');
    }

    const normalizedDoi = this.normalizeDOI(entry.doi);
    const normalizedUrl = this.normalizeUrl(entry.url);

    if (!normalizedDoi && !normalizedUrl) {
      Zotero.debug(`BlacklistManager: Cannot blacklist entry - no DOI or URL: ${entry.title}`);
      return;
    }

    // Check if already blacklisted by DOI or URL
    if (normalizedDoi && this.doiIndex.has(normalizedDoi)) {
      Zotero.debug(`BlacklistManager: DOI already blacklisted: ${normalizedDoi}`);
      return;
    }
    if (normalizedUrl && this.urlIndex.has(normalizedUrl)) {
      Zotero.debug(`BlacklistManager: URL already blacklisted: ${normalizedUrl}`);
      return;
    }

    // Ensure type is set
    if (!entry.type) {
      entry.type = 'replication';
    }

    // Add to entries and indexes
    this.blacklist.entries.push(entry);
    if (normalizedDoi) {
      this.doiIndex.add(normalizedDoi);
    }
    if (normalizedUrl) {
      this.urlIndex.add(normalizedUrl);
    }

    // Persist
    await this.saveBlacklist();
    Zotero.debug(`BlacklistManager: Added to blacklist: ${entry.title} (${normalizedDoi || normalizedUrl}) [${entry.type}]`);
  }

  /**
   * Check if a DOI or URL is blacklisted
   */
  isBlacklisted(doi: string | null | undefined, url?: string | null | undefined): boolean {
    if (!this.initialized) {
      Zotero.debug('BlacklistManager: isBlacklisted called before initialization, returning false');
      return false;
    }

    const normalizedDoi = this.normalizeDOI(doi);
    if (normalizedDoi && this.doiIndex.has(normalizedDoi)) {
      return true;
    }

    const normalizedUrl = this.normalizeUrl(url);
    if (normalizedUrl && this.urlIndex.has(normalizedUrl)) {
      return true;
    }

    return false;
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
    url: string;
    type: BlacklistEntryType;
    dateAdded: string;
  }> {
    if (!this.initialized) {
      return [];
    }

    return this.blacklist.entries.map(entry => ({
      replicationTitle: entry.title,
      originalTitle: entry.originalTitle,
      doi: entry.doi || '',
      url: entry.url || '',
      type: entry.type || 'replication',
      dateAdded: entry.dateAdded,
    }));
  }

  /**
   * Remove a specific entry from the blacklist by DOI or URL
   */
  async removeFromBlacklist(identifier: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('BlacklistManager not initialized');
    }

    const normalizedDoi = this.normalizeDOI(identifier);
    const normalizedUrl = this.normalizeUrl(identifier);

    // Find and remove entry by DOI or URL
    const initialLength = this.blacklist.entries.length;
    this.blacklist.entries = this.blacklist.entries.filter(entry => {
      const entryNormalizedDoi = this.normalizeDOI(entry.doi);
      const entryNormalizedUrl = this.normalizeUrl(entry.url);

      if (normalizedDoi && entryNormalizedDoi === normalizedDoi) {
        return false;
      }
      if (normalizedUrl && entryNormalizedUrl === normalizedUrl) {
        return false;
      }
      return true;
    });

    if (this.blacklist.entries.length === initialLength) {
      Zotero.debug(`BlacklistManager: Identifier not found in blacklist: ${identifier}`);
      return;
    }

    // Rebuild indexes and persist
    this.rebuildIndex();
    await this.saveBlacklist();
    Zotero.debug(`BlacklistManager: Removed from blacklist: ${identifier}`);
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
    this.urlIndex.clear();

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
