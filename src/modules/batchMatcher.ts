/**
 * Batch matcher module for Replication Checker
 * Implements privacy-preserving matching algorithm using MD5 hash prefixes
 */

import CryptoJS from "crypto-js";
import type { ReplicationDataSource } from "./dataSource";

interface MatchResult {
  doi: string;
  replications: any[];
}

interface DoiPrefixMap {
  [doi: string]: string;
}

interface Candidate {
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
 * BatchMatcher - Implements privacy-preserving DOI matching
 * Uses MD5 hash prefixes for privacy while matching replications
 */
export class BatchMatcher {
  private dataSource: ReplicationDataSource;
  private readonly BATCH_SIZE = 100;

  constructor(dataSource: ReplicationDataSource) {
    this.dataSource = dataSource;
  }

  /**
   * Check a batch of DOIs for replications
   * @param dois Array of DOI strings to check
   * @returns Array of match results
   */
  async checkBatch(dois: string[]): Promise<MatchResult[]> {
    Zotero.debug(`[BatchMatcher] Checking ${dois.length} DOIs...`);
    Zotero.debug(`[BatchMatcher] Input DOIs: ${dois.slice(0, 5).join(", ")}${dois.length > 5 ? "..." : ""}`);

    // Normalize and filter DOIs
    const normalizedDois = dois
      .map((doi) => this.normalizeDoi(doi))
      .filter((doi) => doi !== null) as string[];

    Zotero.debug(`[BatchMatcher] Normalized to ${normalizedDois.length} valid DOIs`);
    if (normalizedDois.length > 0) {
      Zotero.debug(`[BatchMatcher] First few normalized: ${normalizedDois.slice(0, 3).join(", ")}`);
    }

    // Create DOI to prefix map
    const doiToPrefixMap: DoiPrefixMap = {};
    normalizedDois.forEach((doi) => {
      const prefix = this.generatePrefix(doi);
      doiToPrefixMap[doi] = prefix;
      if (normalizedDois.indexOf(doi) < 3) {
        Zotero.debug(`[BatchMatcher] DOI: ${doi} -> Prefix: ${prefix}`);
      }
    });

    Zotero.debug(`[BatchMatcher] Generated ${Object.keys(doiToPrefixMap).length} unique DOIs with prefixes`);

    // Get unique prefixes
    const uniquePrefixes = Array.from(new Set(Object.values(doiToPrefixMap)));
    Zotero.debug(`[BatchMatcher] Unique prefixes count: ${uniquePrefixes.length}`);
    Zotero.debug(`[BatchMatcher] Unique prefixes: ${uniquePrefixes.join(", ")}`);

    let candidates: Candidate[] = [];

    // Query in batches
    const startTime = Date.now();
    for (let i = 0; i < uniquePrefixes.length; i += this.BATCH_SIZE) {
      const batchPrefixes = uniquePrefixes.slice(i, i + this.BATCH_SIZE);
      Zotero.debug(
        `[BatchMatcher] Querying batch ${Math.floor(i / this.BATCH_SIZE) + 1} with ${batchPrefixes.length} prefixes: ${batchPrefixes.join(", ")}`
      );
      const batchCandidates = await this.dataSource.queryByPrefixes(batchPrefixes);
      Zotero.debug(`[BatchMatcher] Batch returned ${batchCandidates.length} candidates`);
      candidates = candidates.concat(batchCandidates);
    }
    const queryTime = Date.now() - startTime;

    Zotero.debug(`[BatchMatcher] Received ${candidates.length} total candidates from data source in ${queryTime}ms`);
    if (candidates.length > 0) {
      Zotero.debug(`[BatchMatcher] First candidate DOI_O: ${candidates[0].doi_o}, DOI_R: ${candidates[0].doi_r}`);
    }

    // Verify matches locally (privacy-preserving step)
    const results = this.verifyMatches(normalizedDois, doiToPrefixMap, candidates);

    const matchCount = results.filter((r) => r.replications.length > 0).length;
    Zotero.debug(`[BatchMatcher] Found ${matchCount} DOIs with replications out of ${results.length} checked`);

    // Log details of matches found
    for (const result of results) {
      if (result.replications.length > 0) {
        Zotero.debug(`[BatchMatcher] Match: ${result.doi} -> ${result.replications.length} replications`);
      }
    }

    return results;
  }

  /**
   * Verify which candidates actually match our DOIs
   * This is the privacy-preserving step - happens locally
   * @param ourDois The DOIs we're checking
   * @param doiToPrefixMap Map of DOIs to their hash prefixes
   * @param candidates Candidates returned from API
   * @returns Array of match results
   */
  private verifyMatches(
    ourDois: string[],
    doiToPrefixMap: DoiPrefixMap,
    candidates: Candidate[]
  ): MatchResult[] {
    const results: MatchResult[] = [];

    Zotero.debug(`[BatchMatcher] Starting verifyMatches: ${ourDois.length} DOIs, ${candidates.length} candidates`);

    // For each of our DOIs
    for (const doi of ourDois) {
      const ourPrefix = doiToPrefixMap[doi];
      const normalizedOurDoi = this.normalizeDoi(doi);

      if (ourDois.indexOf(doi) < 3) {
        Zotero.debug(`[BatchMatcher] Verifying DOI: ${doi} (normalized: ${normalizedOurDoi}, prefix: ${ourPrefix})`);
      }

      // Find candidates with matching prefix AND exact DOI match
      const matchingCandidates = candidates.filter(
        (candidate) => {
          const candidateNormalizedDoi = this.normalizeDoi(candidate.doi_o);
          const prefixMatch = candidate.matchedPrefix === ourPrefix;
          const doiMatch = candidateNormalizedDoi === normalizedOurDoi;

          if (ourDois.indexOf(doi) < 3 && candidate === candidates[0]) {
            Zotero.debug(
              `[BatchMatcher] Candidate check: prefix ${candidate.matchedPrefix} vs ${ourPrefix} (${prefixMatch}), ` +
              `doi ${candidateNormalizedDoi} vs ${normalizedOurDoi} (${doiMatch})`
            );
          }

          return prefixMatch && doiMatch;
        }
      );

      if (ourDois.indexOf(doi) < 3) {
        Zotero.debug(`[BatchMatcher] Found ${matchingCandidates.length} matching candidates for ${doi}`);
      }

      // Assign matching candidates as replications
      const replications = matchingCandidates.map((candidate) => ({
        ...candidate,
        doi_o: doi, // Use original DOI
      }));

      results.push({
        doi: doi,
        replications: replications,
      });
    }

    Zotero.debug(`[BatchMatcher] verifyMatches complete: ${results.filter(r => r.replications.length > 0).length} matches found`);

    return results;
  }

  /**
   * Normalize DOI to standard format
   * Removes URL prefixes, lowercases, and validates format
   * @param doi The DOI to normalize
   * @returns Normalized DOI or null if invalid
   */
  normalizeDoi(doi: string | null | undefined): string | null {
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
   * Generate MD5 hash prefix from DOI (3 characters)
   * @param doi The DOI to hash
   * @returns 3-character hash prefix
   */
  private generatePrefix(doi: string): string {
    const hash = CryptoJS.MD5(doi).toString();
    return hash.substring(0, 3);
  }
}
