/**
 * Data source module for Replication Checker
 * Handles API communication for batch DOI queries
 */

import type { PrefixLookupRequest, PrefixLookupResponse, ReplicationMatch } from "../types/replication";

/**
 * Represents a replication candidate from the API
 */
interface ReplicationCandidate {
  doi_o: string;
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
  matchedPrefix: string;
  fullData?: any;
}

/**
 * Abstract base class for data sources
 */
export abstract class ReplicationDataSource {
  abstract initialize(): Promise<void>;
  abstract queryByPrefixes(prefixes: string[]): Promise<ReplicationCandidate[]>;
}

/**
 * API implementation of data source
 * Queries the FReD replication database via API
 */
export class APIDataSource extends ReplicationDataSource {
  private apiUrl: string;

  constructor() {
    super();
    this.apiUrl = "https://ouj1xoiypb.execute-api.eu-central-1.amazonaws.com/v1/prefix-lookup";
  }

  async initialize(): Promise<void> {
    Zotero.debug("APIDataSource initialized");
  }

  /**
   * Query API with hash prefixes
   * @param prefixes Array of 3-character MD5 prefix hashes
   * @returns Array of replication candidates
   */
  async queryByPrefixes(prefixes: string[]): Promise<ReplicationCandidate[]> {
    Zotero.debug(`Querying API with ${prefixes.length} prefixes`);

    try {
      const response = await Zotero.HTTP.request("POST", this.apiUrl, {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefixes: prefixes } as PrefixLookupRequest),
      });

      if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data: PrefixLookupResponse = JSON.parse(response.response);
      const candidates: ReplicationCandidate[] = [];

      // Flatten API response into candidates
      for (const prefix in data) {
        if (data.hasOwnProperty(prefix)) {
          const results = data[prefix] || [];
          for (const entry of results) {
            const originalDoi = entry.doi_o || entry.meta?.original_doi;
            const replications = entry.replications || [];

            for (const rep of replications) {
              candidates.push({
                doi_o: originalDoi,
                doi_r: rep.doi_r || "Not available",
                title_r: rep.title_r || "No title available",
                author_r: rep.author_r || "No authors available",
                journal_r: rep.journal_r || "No journal",
                year_r: rep.year_r || undefined,
                volume_r: rep.volume_r,
                issue_r: rep.issue_r,
                pages_r: rep.pages_r,
                outcome: rep.outcome || "Not available",
                url_r: rep.url_r || "",
                matchedPrefix: prefix,
                fullData: rep,
              });
            }
          }
        }
      }

      Zotero.debug(`Received ${candidates.length} candidates from API`);
      return candidates;
    } catch (error) {
      Zotero.logError(`API query failed: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }
}
