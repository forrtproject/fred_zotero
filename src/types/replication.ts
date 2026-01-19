/**
 * Type definitions for Replication Checker plugin
 */

/**
 * A single replication study from the API response
 */
export interface ReplicationStudy {
  doi_r: string;
  title_r: string;
  author_r: string | string[];
  journal_r: string;
  year_r?: number;
  volume_r?: string;
  issue_r?: string;
  pages_r?: string;
  outcome: string;
  url_r?: string;
}

/**
 * An item entry in the API response for a given prefix
 */
export interface ReplicationItemEntry {
  doi_o: string;
  meta?: {
    original_doi?: string;
  };
  replications: ReplicationStudy[];
}

/**
 * A replication match found for an item
 */
export interface ReplicationMatch {
  doi: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  outcome: 'successful' | 'failure' | 'mixed' | 'informational';
  report_url?: string;
}

/**
 * Result of batch checking items for replications
 */
export interface BatchCheckResult {
  matches: Map<string, ReplicationMatch[]>;
  checked: number;
  found: number;
}

/**
 * Basic Zotero item data extracted for checking
 */
export interface ZoteroItemData {
  itemID: number;
  doi: string;
  title: string;
  authors?: string;
  year?: number;
}

/**
 * API request payload for prefix lookup
 */
export interface PrefixLookupRequest {
  prefixes: string[];
}

/**
 * API response from prefix lookup
 * Maps hash prefixes to arrays of items with their replications
 */
export interface PrefixLookupResponse {
  [prefix: string]: ReplicationItemEntry[];
}

/**
 * Options for batch checking operation
 */
export interface BatchCheckOptions {
  showProgress?: boolean;
  autoTag?: boolean;
  createFolder?: boolean;
}

/**
 * Configuration for the replication checker
 */
export interface ReplicationCheckerConfig {
  apiEndpoint: string;
  batchSize: number;
  enableAutoCheck: boolean;
  createNotes: boolean;
  createReplicationFolder: boolean;
}

/**
 * A single entry in the blacklist
 */
export interface BlacklistEntry {
  itemID: number;           // Zotero item ID when blacklisted
  doi: string;              // DOI of the replication (primary identifier)
  title: string;            // Title of the replication
  originalTitle: string;    // Title of the original paper
  originalDOI?: string;     // DOI of the original paper (if available)
  dateAdded: string;        // ISO timestamp when banned
  reason?: 'manual' | 'deletion';  // How it was blacklisted
}

/**
 * Blacklist data structure stored in preferences
 */
export interface BlacklistData {
  version: number;          // Schema version for future migrations
  entries: BlacklistEntry[];
}
