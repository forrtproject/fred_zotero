/**
 * File Description: batch-matcher.js
 * Defines the BatchMatcher class, which handles the core matching workflow for replications.
 * It normalizes DOIs, computes hash prefixes, queries the data source (API), and verifies matches locally to ensure privacy.
 * This is the main logic for checking batches of DOIs against the replication database.
 */
class BatchMatcher {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }

    async checkBatch(dois) {
        Zotero.debug(`Checking ${dois.length} DOIs...`);

        const normalizedDois = dois.map(doi => this._normalizeDoi(doi))
            .filter(doi => doi !== null);

        Zotero.debug(`Normalized to ${normalizedDois.length} valid DOIs`);

        const doiToPrefixMap = new Map();
        normalizedDois.forEach(doi => {
            const prefix = this._generatePrefix(doi);
            doiToPrefixMap.set(doi, prefix);
        });

        Zotero.debug(`Generated ${doiToPrefixMap.size} unique DOIs with prefixes`);

        const uniquePrefixes = [...new Set(doiToPrefixMap.values())];
        const startTime = Date.now(); 
        const candidates = await this.dataSource.queryByPrefixes(uniquePrefixes);
        const queryTime = Date.now() - startTime;

        Zotero.debug(`Received ${candidates.length} candidates from data source in ${queryTime}ms`);

        const results = this._verifyMatches(normalizedDois, doiToPrefixMap, candidates);

        const matchCount = results.filter(r => r.replications.length > 0).length;
        Zotero.debug(`Found ${matchCount} DOIs with replications`);

        return results;
    }

    /**
     * Verify which candidates actually match our DOIs
     * This is the privacy-preserving step - happens locally
     */
    _verifyMatches(ourDois, doiToPrefixMap, candidates) {
        const results = [];

        // For each of our DOIs
        for (const doi of ourDois) {
            const ourPrefix = doiToPrefixMap.get(doi);

            // Find candidates with matching prefix
            const matchingCandidates = candidates.filter(candidate =>
                candidate.matchedPrefix === ourPrefix
            );

            // Assign all matching candidates as replications for this DOI
            const replications = matchingCandidates.map(candidate => ({
                ...candidate,
                doi_o: doi // Set doi_o to the original DOI
            }));

            results.push({
                doi: doi,
                replications: replications
            });
        }

        return results;
    }

    /**
     * Normalize DOI to standard format
     */
    _normalizeDoi(doi) {
        if (!doi) return null;

        let normalized = doi.trim();

        // Remove common URL prefixes
        normalized = normalized.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');

        normalized = normalized.replace(/^doi:\s*/i, '');
        normalized = normalized.trim();
        normalized = normalized.toLowerCase();

        if (!normalized.startsWith('10.')) {
            return null;
        }

        return normalized;
    }

    _generatePrefix(doi) {
        const hash = CryptoJS.MD5(doi).toString();
        return hash.substring(0, 3);
    }
}