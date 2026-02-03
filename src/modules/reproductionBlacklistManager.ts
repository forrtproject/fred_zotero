/**
 * Reproduction Blacklist Manager
 * Manages banned reproduction items that should not be re-added during checks
 */

import type { ReproductionBlacklistEntry, ReproductionBlacklistData } from "../types/replication";

const REPRODUCTION_BLACKLIST_PREF = "replication-checker.reproductionBlacklist";

/**
 * Manages the blacklist of banned reproduction items
 * Provides persistence via Zotero preferences and fast URL/DOI lookup
 */
class ReproductionBlacklistManager {
  private blacklist: ReproductionBlacklistData = { version: 1, entries: [] };
  private urlIndex: Set<string> = new Set();
  private doiIndex: Set<string> = new Set();
  private initialized: boolean = false;

  /**
   * Initialize the reproduction blacklist manager
   * Loads blacklist from preferences and builds index
   */
  async init(): Promise<void> {
    if (this.initialized) {
      Zotero.debug("ReproductionBlacklistManager: Already initialized");
      return;
    }

    try {
      const prefValue = Zotero.Prefs.get(REPRODUCTION_BLACKLIST_PREF);

      if (!prefValue || typeof prefValue !== 'string' || prefValue === '') {
        Zotero.debug("ReproductionBlacklistManager: No existing blacklist, initializing empty");
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

      Zotero.debug(`ReproductionBlacklistManager: Loaded ${this.blacklist.entries.length} blacklisted entries`);

    } catch (error) {
      Zotero.logError(
        new Error(`ReproductionBlacklistManager: Blacklist corrupted, resetting: ${
          error instanceof Error ? error.message : String(error)
        }`)
      );
      this.blacklist = { version: 1, entries: [] };
      await this.saveBlacklist();
    }

    // Build indexes for O(1) lookup
    this.rebuildIndex();
    this.initialized = true;
  }

  /**
   * Rebuild the URL and DOI indexes from current entries
   */
  private rebuildIndex(): void {
    this.urlIndex.clear();
    this.doiIndex.clear();
    for (const entry of this.blacklist.entries) {
      // Index by URL (primary identifier for reproductions)
      const normalizedUrl = this.normalizeUrl(entry.url);
      if (normalizedUrl) {
        this.urlIndex.add(normalizedUrl);
      }
      // Also index by DOI if available
      const normalizedDoi = this.normalizeDOI(entry.doi);
      if (normalizedDoi) {
        this.doiIndex.add(normalizedDoi);
      }
    }
    Zotero.debug(`ReproductionBlacklistManager: Index rebuilt with ${this.urlIndex.size} URLs and ${this.doiIndex.size} DOIs`);
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
      Zotero.Prefs.set(REPRODUCTION_BLACKLIST_PREF, jsonString);
      Zotero.debug(`ReproductionBlacklistManager: Saved ${this.blacklist.entries.length} entries to preferences`);
    } catch (error) {
      Zotero.logError(
        new Error(`ReproductionBlacklistManager: Failed to save blacklist: ${
          error instanceof Error ? error.message : String(error)
        }`)
      );
      throw error;
    }
  }

  /**
   * Add a reproduction to the blacklist
   */
  async addToBlacklist(entry: ReproductionBlacklistEntry): Promise<void> {
    if (!this.initialized) {
      throw new Error('ReproductionBlacklistManager not initialized');
    }

    // Use URL as primary identifier for reproductions (since many don't have DOIs)
    const normalizedUrl = this.normalizeUrl(entry.url);
    const normalizedDoi = this.normalizeDOI(entry.doi);

    if (!normalizedUrl && !normalizedDoi) {
      Zotero.debug(`ReproductionBlacklistManager: Cannot blacklist entry - no URL or DOI: ${entry.title}`);
      return;
    }

    // Check if already blacklisted
    if (normalizedUrl && this.urlIndex.has(normalizedUrl)) {
      Zotero.debug(`ReproductionBlacklistManager: URL already blacklisted: ${normalizedUrl}`);
      return;
    }
    if (normalizedDoi && this.doiIndex.has(normalizedDoi)) {
      Zotero.debug(`ReproductionBlacklistManager: DOI already blacklisted: ${normalizedDoi}`);
      return;
    }

    // Add to entries and indexes
    this.blacklist.entries.push(entry);
    if (normalizedUrl) {
      this.urlIndex.add(normalizedUrl);
    }
    if (normalizedDoi) {
      this.doiIndex.add(normalizedDoi);
    }

    // Persist
    await this.saveBlacklist();
    Zotero.debug(`ReproductionBlacklistManager: Added to blacklist: ${entry.title} (${normalizedUrl || normalizedDoi})`);
  }

  /**
   * Check if a reproduction is blacklisted by URL or DOI
   */
  isBlacklisted(url: string | null | undefined, doi?: string | null | undefined): boolean {
    if (!this.initialized) {
      Zotero.debug('ReproductionBlacklistManager: isBlacklisted called before initialization, returning false');
      return false;
    }

    const normalizedUrl = this.normalizeUrl(url);
    if (normalizedUrl && this.urlIndex.has(normalizedUrl)) {
      return true;
    }

    const normalizedDoi = this.normalizeDOI(doi);
    if (normalizedDoi && this.doiIndex.has(normalizedDoi)) {
      return true;
    }

    return false;
  }

  /**
   * Get all blacklist entries
   */
  getEntries(): ReproductionBlacklistEntry[] {
    if (!this.initialized) {
      Zotero.debug('ReproductionBlacklistManager: getEntries called before initialization');
      return [];
    }
    return [...this.blacklist.entries];
  }

  /**
   * Get entries formatted for UI display
   */
  getEntriesWithMetadata(): Array<{
    reproductionTitle: string;
    originalTitle: string;
    url: string;
    doi: string;
    dateAdded: string;
  }> {
    if (!this.initialized) {
      return [];
    }

    return this.blacklist.entries.map(entry => ({
      reproductionTitle: entry.title,
      originalTitle: entry.originalTitle,
      url: entry.url,
      doi: entry.doi,
      dateAdded: entry.dateAdded,
    }));
  }

  /**
   * Remove a specific entry from the blacklist by URL
   */
  async removeFromBlacklist(url: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('ReproductionBlacklistManager not initialized');
    }

    const normalizedUrl = this.normalizeUrl(url);
    if (!normalizedUrl) {
      Zotero.debug(`ReproductionBlacklistManager: Cannot remove - invalid URL: ${url}`);
      return;
    }

    // Find and remove entry
    const initialLength = this.blacklist.entries.length;
    this.blacklist.entries = this.blacklist.entries.filter(entry => {
      const entryNormalizedUrl = this.normalizeUrl(entry.url);
      return entryNormalizedUrl !== normalizedUrl;
    });

    if (this.blacklist.entries.length === initialLength) {
      Zotero.debug(`ReproductionBlacklistManager: URL not found in blacklist: ${normalizedUrl}`);
      return;
    }

    // Rebuild indexes and persist
    this.rebuildIndex();
    await this.saveBlacklist();
    Zotero.debug(`ReproductionBlacklistManager: Removed from blacklist: ${normalizedUrl}`);
  }

  /**
   * Clear all entries from the blacklist
   */
  async clearBlacklist(): Promise<void> {
    if (!this.initialized) {
      throw new Error('ReproductionBlacklistManager not initialized');
    }

    const count = this.blacklist.entries.length;
    this.blacklist.entries = [];
    this.urlIndex.clear();
    this.doiIndex.clear();

    await this.saveBlacklist();
    Zotero.debug(`ReproductionBlacklistManager: Cleared ${count} entries from blacklist`);
  }

  /**
   * Get the count of blacklisted entries
   */
  getCount(): number {
    return this.blacklist.entries.length;
  }
}

// Export singleton instance
export const reproductionBlacklistManager = new ReproductionBlacklistManager();
