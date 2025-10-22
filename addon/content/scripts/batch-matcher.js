/**
 * Debug version of batch-matcher with detailed logging
 */
class BatchMatcher {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }

    async checkBatch(dois) {
        const win = Zotero.getMainWindow();
        
        Zotero.debug(`BatchMatcher: Checking ${dois.length} DOIs...`);
        win.alert(`Starting check for ${dois.length} DOIs:\n${dois.join('\n')}`);

        const normalizedDois = dois.map(doi => this._normalizeDoi(doi))
            .filter(doi => doi !== null);

        Zotero.debug(`BatchMatcher: Normalized to ${normalizedDois.length} valid DOIs`);
        win.alert(`Normalized DOIs:\n${normalizedDois.join('\n')}`);

        const doiToPrefixMap = new Map();
        normalizedDois.forEach(doi => {
            const prefix = this._generatePrefix(doi);
            doiToPrefixMap.set(doi, prefix);
            Zotero.debug(`BatchMatcher: DOI ${doi} -> prefix ${prefix}`);
        });

        const uniquePrefixes = [...new Set(doiToPrefixMap.values())];
        win.alert(`Generated ${uniquePrefixes.length} unique prefixes:\n${uniquePrefixes.join(', ')}`);

        const startTime = Date.now();
        const candidates = await this.dataSource.queryByPrefixes(uniquePrefixes);
        const queryTime = Date.now() - startTime;

        Zotero.debug(`BatchMatcher: Received ${candidates.length} candidates from data source in ${queryTime}ms`);
        
        if (candidates.length === 0) {
            win.alert(`⚠️ API returned 0 candidates!\n\nThis means the API didn't find any matches for your prefixes.\n\nPrefixes sent: ${uniquePrefixes.join(', ')}`);
        } else {
            let candidateInfo = `Received ${candidates.length} candidates from API:\n\n`;
            candidates.slice(0, 3).forEach((c, i) => {
                candidateInfo += `${i+1}. Original DOI: ${c.doi_o}\n`;
                candidateInfo += `   Replication: ${c.doi_r}\n`;
                candidateInfo += `   Prefix: ${c.matchedPrefix}\n\n`;
            });
            if (candidates.length > 3) {
                candidateInfo += `... and ${candidates.length - 3} more`;
            }
            win.alert(candidateInfo);
        }

        const results = this._verifyMatches(normalizedDois, doiToPrefixMap, candidates);

        const matchCount = results.filter(r => r.replications.length > 0).length;
        Zotero.debug(`BatchMatcher: Found ${matchCount} DOIs with replications`);
        
        win.alert(`Verification complete:\n${matchCount} of ${normalizedDois.length} DOIs have replications`);

        return results;
    }

    _verifyMatches(ourDois, doiToPrefixMap, candidates) {
        const results = [];
        const win = Zotero.getMainWindow();

        for (const doi of ourDois) {
            const ourPrefix = doiToPrefixMap.get(doi);

            // Find candidates with matching prefix
            const matchingCandidates = candidates.filter(candidate =>
                candidate.matchedPrefix === ourPrefix
            );

            Zotero.debug(`BatchMatcher: DOI ${doi} (prefix ${ourPrefix}) has ${matchingCandidates.length} matching candidates`);

            // Check if any candidate's doi_o matches our DOI
            const actualMatches = matchingCandidates.filter(candidate => {
                const candidateDoi = this._normalizeDoi(candidate.doi_o);
                const match = candidateDoi === doi;
                
                if (!match) {
                    Zotero.debug(`BatchMatcher: Candidate doi_o "${candidate.doi_o}" (normalized: "${candidateDoi}") doesn't match our DOI "${doi}"`);
                } else {
                    Zotero.debug(`BatchMatcher: ✓ Match found! Candidate doi_o "${candidateDoi}" matches our DOI "${doi}"`);
                }
                
                return match;
            });

            results.push({
                doi: doi,
                replications: actualMatches
            });
            
            if (actualMatches.length > 0) {
                Zotero.debug(`BatchMatcher: ✓ Found ${actualMatches.length} replications for ${doi}`);
            }
        }

        return results;
    }

    _normalizeDoi(doi) {
        if (!doi) return null;

        let normalized = doi.trim();
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
