/**
 * Type definitions for Replication Checker plugin
 */

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
 */
export interface PrefixLookupResponse {
  [prefix: string]: ReplicationMatch[];
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
