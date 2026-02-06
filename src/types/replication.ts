/**
 * Type definitions for Replication Checker plugin
 */

/**
 * Author object from API
 */
export interface Author {
  given: string;
  family: string;
  sequence: 'first' | 'additional';
}

/**
 * Statistics about an article's replication status
 */
export interface ReplicationStats {
  n_replications: number;
  n_unique_replication_dois: number;
  n_originals: number;
  n_unique_original_dois: number;
  n_reproductions: number;
  n_reproduction_only: number;
}

/**
 * A related study (replication, original, or reproduction)
 */
export interface RelatedStudy {
  doi: string;
  doi_hash: string;
  rep_type?: 'replication' | 'original' | 'reproduction';
  title: string;
  authors: Author[];
  journal: string;
  year: number;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  apa_ref: string;
  bibtex_ref: string;
  url?: string | null;
  outcome?: string;  // For replications: 'successful', 'failed', 'mixed', 'informational'
  abstract?: string | null;
  outcome_quote?: string | null;
}

/**
 * Record containing all related studies
 */
export interface RelatedStudiesRecord {
  stats: ReplicationStats;
  replications: RelatedStudy[];  // Studies that replicated this article
  originals: RelatedStudy[];     // Original studies that this article replicated
  reproductions: RelatedStudy[]; // Studies that reproduced this article
}

/**
 * Main article entry from FLoRA API
 */
export interface FLoRAArticle {
  doi: string;
  doi_hash: string;
  title: string;
  authors: Author[];
  journal: string;
  year: number;
  volume?: string;
  issue?: string;
  pages?: string;
  apa_ref: string;
  bibtex_ref: string;
  url?: string | null;
  record: RelatedStudiesRecord;
}

/**
 * API response from prefix lookup
 */
export interface PrefixLookupResponse {
  results: {
    [prefix: string]: FLoRAArticle[];
  };
}

/**
 * API request payload for prefix lookup
 */
export interface PrefixLookupRequest {
  prefixes: string[];
}

/**
 * A replication match found for an item (internal format)
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
 * Result of checking a single DOI
 */
export interface DOICheckResult {
  doi: string;
  replications: RelatedStudy[];
  originals: RelatedStudy[];
  reproductions: RelatedStudy[];
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
 * Type of blacklisted item
 */
export type BlacklistEntryType = 'replication' | 'reproduction';

/**
 * A single entry in the blacklist
 */
export interface BlacklistEntry {
  itemID: number;           // Zotero item ID when blacklisted
  doi: string;              // DOI of the replication/reproduction (primary identifier)
  url?: string;             // URL of the item (used as identifier when no DOI, especially for reproductions)
  title: string;            // Title of the replication/reproduction
  originalTitle: string;    // Title of the original paper
  originalDOI?: string;     // DOI of the original paper (if available)
  dateAdded: string;        // ISO timestamp when banned
  reason?: 'manual' | 'deletion';  // How it was blacklisted
  type: BlacklistEntryType; // Type of entry: 'replication' or 'reproduction'
}

/**
 * Blacklist data structure stored in preferences
 */
export interface BlacklistData {
  version: number;          // Schema version for future migrations
  entries: BlacklistEntry[];
}

/**
 * Reproduction outcomes (6 possible values)
 */
export type ReproductionOutcome =
  | 'computionally successful, robust'
  | 'computionally successful, robustness challenges'
  | 'computionally successful, robustness not checked'
  | 'computational issues, robust'
  | 'computational issues, robustness challenges'
  | 'computational issues, robustness not checked';

/**
 * A single entry in the reproduction blacklist
 */
export interface ReproductionBlacklistEntry {
  itemID: number;           // Zotero item ID when blacklisted
  doi: string;              // DOI of the reproduction (primary identifier) - can be empty for reproductions
  url: string;              // URL of the reproduction (used as identifier when no DOI)
  title: string;            // Title of the reproduction
  originalTitle: string;    // Title of the original paper
  originalDOI?: string;     // DOI of the original paper (if available)
  dateAdded: string;        // ISO timestamp when banned
  reason?: 'manual' | 'deletion';  // How it was blacklisted
}

/**
 * Reproduction blacklist data structure stored in preferences
 */
export interface ReproductionBlacklistData {
  version: number;          // Schema version for future migrations
  entries: ReproductionBlacklistEntry[];
}
