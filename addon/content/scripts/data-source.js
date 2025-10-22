/**
 * File Description: data-source.js
 * This file defines the abstract ReplicationDataSource class and its API implementation.
 * It handles querying the replication database using hash prefixes. Uses API for batch queries.
 */
class ReplicationDataSource {
    async initialize() {
        throw new Error('Must implement initialize()');
    }

    /**
     * Batch query by hash prefixes
     * This simulates the API call - in production, this would be an HTTP request
     * @param {string[]} prefixes - Array of hash prefixes (3-char hex strings)
     * @returns {Promise<ReplicationCandidate[]>} All candidates matching any prefix
     */
    async queryByPrefixes(prefixes) {
        throw new Error('Must implement queryByPrefixes()');
    }
}

/**
 * @typedef {Object} ReplicationCandidate
 * @property {string} doi_o - Original study DOI (inferred or from context)
 * @property {string} doi_r - Replication DOI
 * @property {string} title_r - Replication title
 * @property {string} author_r - Replication authors
 * @property {string} journal_r - Replication journal
 * @property {number} year_r - Replication year
 * @property {string} outcome - Replication outcome
 * @property {string} matchedPrefix - The prefix that caused this to be returned
 * @property {Object} fullData - Complete row from API
 */

/**
 * API implementation of data source
 * Replaces the local CSV with API calls
 */
class APIDataSource extends ReplicationDataSource {
    constructor() {
        super();
        this.apiUrl = "https://ouj1xoiypb.execute-api.eu-central-1.amazonaws.com/v1/prefix-lookup";
    }

    async initialize() {
        Zotero.debug('APIDataSource initialized');
    }

    async queryByPrefixes(prefixes) {
        Zotero.debug(`Querying API with prefixes: ${JSON.stringify(prefixes)}`);

        try {
            const response = await Zotero.HTTP.request("POST", this.apiUrl, {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prefixes: prefixes })
            });

            if (response.status !== 200) {
                throw new Error(`API returned status ${response.status}`);
            }

            const data = JSON.parse(response.response);
            const candidates = [];

            for (let prefix in data.results) {
                data.results[prefix].forEach(entry => {
                    const originalDoi = entry.meta.original_doi;
                    entry.meta.replications.forEach(rep => {
                        candidates.push({
                            doi_o: originalDoi,
                            doi_r: rep.doi_r || 'Not available',
                            title_r: rep.title_r || 'No title available',
                            author_r: rep.author_r || 'No authors available',
                            journal_r: rep.journal_r || 'No journal',
                            year_r: rep.year_r || null,
                            outcome: rep.outcome || 'Not available',
                            matchedPrefix: prefix,
                            fullData: rep
                        });
                    });
                });
            }

            Zotero.debug(`Received ${candidates.length} candidates from API`);
            return candidates;
        } catch (error) {
            Zotero.logError('API query failed: ' + error);
            return [];
        }
    }
}