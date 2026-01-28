/**
 * Text Normalization Utilities for Fuzzy Search
 * Removes accents, converts to lowercase, and provides similarity matching
 */

/**
 * Normalizes text by removing accents, converting to lowercase, and trimming
 * @param text - Text to normalize
 * @returns Normalized text
 */
export function normalizeText(text: string): string {
    if (!text) return '';

    return text
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .toLowerCase()
        .trim();
}

/**
 * Calculates Levenshtein distance between two strings
 * Used for fuzzy matching
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Distance (0 = identical, higher = more different)
 */
function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; i <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

/**
 * Calculates similarity between two strings (0-100%)
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity percentage (100 = identical, 0 = completely different)
 */
export function fuzzyMatch(str1: string, str2: string): number {
    const normalized1 = normalizeText(str1);
    const normalized2 = normalizeText(str2);

    if (normalized1 === normalized2) return 100;
    if (!normalized1 || !normalized2) return 0;

    const distance = levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);

    return Math.round((1 - distance / maxLength) * 100);
}

/**
 * Searches for terms with fuzzy matching
 * @param query - Search query
 * @param terms - Array of terms to search
 * @param threshold - Minimum similarity threshold (default: 70%)
 * @returns Array of matching terms with similarity scores
 */
export function searchTerms(
    query: string,
    terms: string[],
    threshold: number = 70
): Array<{ term: string; similarity: number }> {
    const normalizedQuery = normalizeText(query);

    return terms
        .map(term => ({
            term,
            similarity: fuzzyMatch(normalizedQuery, term)
        }))
        .filter(result => result.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity);
}

/**
 * Checks if a query contains a term (partial match)
 * @param query - Search query
 * @param term - Term to check
 * @returns True if query contains term
 */
export function containsTerm(query: string, term: string): boolean {
    const normalizedQuery = normalizeText(query);
    const normalizedTerm = normalizeText(term);

    return normalizedQuery.includes(normalizedTerm) || normalizedTerm.includes(normalizedQuery);
}
