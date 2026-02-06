/**
 * Data source module for Replication Checker
 * Handles API communication for batch DOI queries with the FLoRA API format
 */

import type { PrefixLookupRequest, PrefixLookupResponse, DOICheckResult } from "../types/replication";

/**
 * Abstract base class for data sources
 */
export abstract class ReplicationDataSource {
  abstract initialize(): Promise<void>;
  abstract queryByPrefixes(prefixes: string[]): Promise<DOICheckResult[]>;
}

/**
 * API implementation of data source
 * Queries the FLoRA replication database via API
 */
export class APIDataSource extends ReplicationDataSource {
  private apiUrl: string;

  constructor() {
    super();
    this.apiUrl = "https://rep-api.forrt.org/v1/prefix-lookup";
  }

  async initialize(): Promise<void> {
    Zotero.debug("[APIDataSource] Initialized with FLoRA API v1");
  }

  /**
   * Query API with hash prefixes
   * @param prefixes Array of 3-character MD5 prefix hashes
   * @returns Array of DOI check results with replications, originals, and reproductions
   */
  async queryByPrefixes(prefixes: string[]): Promise<DOICheckResult[]> {
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
      const responseData: PrefixLookupResponse = JSON.parse(response.response);
      Zotero.debug(`[APIDataSource] Response has 'results' object: ${!!responseData.results}`);

      const results: DOICheckResult[] = [];

      // Extract results from new API format
      if (!responseData.results) {
        Zotero.debug("[APIDataSource] WARNING: No 'results' field in API response");
        return results;
      }

      const prefixKeys = Object.keys(responseData.results);
      Zotero.debug(`[APIDataSource] Found ${prefixKeys.length} prefix keys: ${prefixKeys.join(", ")}`);

      // Process each prefix
      for (const prefix of prefixKeys) {
        const articles = responseData.results[prefix];
        Zotero.debug(`[APIDataSource] Prefix '${prefix}': ${articles.length} articles`);

        // Process each article
        for (const article of articles) {
          Zotero.debug(`[APIDataSource] Processing article DOI: ${article.doi}, Title: ${article.title.substring(0, 50)}...`);

          const record = article.record;
          Zotero.debug(`[APIDataSource]   Stats - Replications: ${record.stats.n_replications}, Originals: ${record.stats.n_originals}, Reproductions: ${record.stats.n_reproductions}`);
          Zotero.debug(`[APIDataSource]   Arrays - Replications: ${record.replications.length}, Originals: ${record.originals.length}, Reproductions: ${record.reproductions.length}`);

          // Create result for this DOI
          results.push({
            doi: article.doi,
            replications: record.replications,
            originals: record.originals,
            reproductions: record.reproductions,
          });
        }
      }

      Zotero.debug(`[APIDataSource] Processed ${results.length} total articles with related studies`);
      return results;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const wrappedError = new Error(`API query failed: ${message}`);
      Zotero.logError(wrappedError);
      throw wrappedError;
    }
  }
}
