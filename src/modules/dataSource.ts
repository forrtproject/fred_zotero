/**
 * Data source module for Replication Checker
 * Handles API communication for batch DOI queries
 */

import type { PrefixLookupRequest } from "../types/replication";

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
    this.apiUrl = "https://rep-api.forrt.org/v1/prefix-lookup";
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
    Zotero.debug(`[APIDataSource] Querying API with ${prefixes.length} prefixes: ${prefixes.join(", ")}`);
    Zotero.debug(`[APIDataSource] API Endpoint: ${this.apiUrl}`);

    try {
      let response;
      try {
        const requestBody = { prefixes: prefixes } as PrefixLookupRequest;
        Zotero.debug(`[APIDataSource] Sending request with prefixes: ${JSON.stringify(requestBody)}`);

        response = await Zotero.HTTP.request("POST", this.apiUrl, {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
      } catch (httpError) {
        const errorMsg = httpError instanceof Error ? httpError.message : String(httpError);
        Zotero.debug(`[APIDataSource] HTTP Request error: ${errorMsg}`);
        throw new Error(`Failed to reach replication API: ${errorMsg}`);
      }

      if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}: ${response.responseText || "unknown error"}`);
      }

      Zotero.debug(`[APIDataSource] API Response status: ${response.status}`);
      const responseData = JSON.parse(response.response);
      Zotero.debug(`[APIDataSource] Raw response object keys: ${Object.keys(responseData).join(", ")}`);

      const candidates: ReplicationCandidate[] = [];

      // Extract the results object from API response
      const data = responseData.results || responseData;
      Zotero.debug(`[APIDataSource] Data object has prefixes: ${Object.keys(data).join(", ")}`);

      // Flatten API response into candidates
      for (const prefix in data) {
        if (data.hasOwnProperty(prefix)) {
          const prefixResults = Array.isArray(data[prefix]) ? data[prefix] : [];
          Zotero.debug(`[APIDataSource] Prefix '${prefix}': ${prefixResults.length} entries`);

          for (const entry of prefixResults) {
            // API returns replications inside meta.replications
            const originalDoi = entry.meta?.original_doi || entry.meta?.doi_o || entry.doi_o || "";
            const replications = Array.isArray(entry.meta?.replications) ? entry.meta.replications : [];

            Zotero.debug(`[APIDataSource] Entry DOI_O: ${originalDoi}, Replications count: ${replications.length}`);

            for (const rep of replications) {
              candidates.push({
                doi_o: rep.doi_o || originalDoi || "Not available",
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

      Zotero.debug(`[APIDataSource] Total candidates extracted: ${candidates.length}`);
      return candidates;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const wrappedError = new Error(`API query failed: ${message}`);
      Zotero.logError(wrappedError);
      throw wrappedError;
    }
  }
}
