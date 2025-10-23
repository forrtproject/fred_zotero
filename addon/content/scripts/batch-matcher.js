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
        let candidates = [];
        const batchSize = 100;
        const startTime = Date.now(); 
        for (let i = 0; i < uniquePrefixes.length; i += batchSize) {
            const batchPrefixes = uniquePrefixes.slice(i, i + batchSize);
            Zotero.debug(`Querying batch ${Math.floor(i / batchSize) + 1} with ${batchPrefixes.length} prefixes`);
            const batchCandidates = await this.dataSource.queryByPrefixes(batchPrefixes);
            candidates = candidates.concat(batchCandidates);
        }
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

            // Find candidates with matching prefix AND exact doi_o match
            const matchingCandidates = candidates.filter(candidate =>
                candidate.matchedPrefix === ourPrefix &&
                this._normalizeDoi(candidate.doi_o) === doi
            );

            // Assign matching candidates as replications for this DOI
            const replications = matchingCandidates.map(candidate => ({
                ...candidate,
                doi_o: doi // Override doi_o to the original DOI (though it should match)
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

        let normalized = doi.trim().toLowerCase();

        // Remove common URL prefixes
        normalized = normalized.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');

        normalized = normalized.replace(/^doi:\s*/i, '');
        normalized = normalized.replace(/\/+/g, '/'); // Collapse multiple slashes to single
        normalized = normalized.trim();

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