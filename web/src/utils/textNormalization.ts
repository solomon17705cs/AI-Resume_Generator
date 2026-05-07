/**
 * textNormalization.ts
 *
 * FIXED: The previous version had a catastrophically broken regex:
 *   normalized.replace(/(.*?)(required|responsibilities|...)(.*?)/gi, '$3')
 * This was stripping everything BEFORE "required/responsibilities" which is the
 * most keyword-rich part of any JD (the opening summary, role description, etc.)
 *
 * New approach: clean noise WITHOUT destroying content.
 */

export const normalizeJobDescription = (text: string): string => {
    if (!text) return '';

    let normalized = text;

    // 1. Normalize whitespace artifacts (smart quotes, tabs, non-breaking spaces)
    normalized = normalized
        .replace(/\u00a0/g, ' ')       // non-breaking space → regular space
        .replace(/[""]/g, '"')          // smart double quotes → straight
        .replace(/['']/g, "'")          // smart single quotes → straight
        .replace(/\t/g, ' ')            // tabs → space
        .replace(/\r\n/g, '\n')         // windows line endings
        .replace(/\r/g, '\n');          // old mac line endings

    // 2. Collapse excessive blank lines (3+ → 2) but preserve paragraph structure
    normalized = normalized.replace(/\n{3,}/g, '\n\n');

    // 3. Remove only clearly non-keyword boilerplate SECTIONS by heading label,
    //    not by destroying everything before a keyword like "required".
    //    We do this by removing entire lines that are ONLY a boilerplate heading.
    const boilerplateHeadings = [
        /^about\s+(us|the\s+company|our\s+team)\s*:?\s*$/im,
        /^company\s+overview\s*:?\s*$/im,
        /^(equal\s+opportunity|eeo)\s+employer\s*:?\s*$/im,
        /^(benefits|perks|compensation(\s+&\s+benefits)?)\s*:?\s*$/im,
        /^how\s+to\s+apply\s*:?\s*$/im,
        /^apply\s+now\s*:?\s*$/im,
    ];

    boilerplateHeadings.forEach(heading => {
        normalized = normalized.replace(heading, '');
    });

    // 4. Fix common stemming artifacts from copy-pasted JDs
    //    Only fix clearly broken tokens, not broad word replacements.
    const stemFixes: [RegExp, string][] = [
        [/\bplany\b/gi, 'planning'],
        [/\bmanag\b/gi, 'manage'],
        [/\bengin\b/gi, 'engineer'],
        [/\banalys\b/gi, 'analysis'],
        [/\brequir\b/gi, 'requirement'],
    ];

    stemFixes.forEach(([pattern, replacement]) => {
        normalized = normalized.replace(pattern, replacement);
    });

    // 5. Collapse multiple spaces to single
    normalized = normalized.replace(/ {2,}/g, ' ');

    return normalized.trim();
};

/**
 * Light cleanup for resume text before analysis.
 * Preserves all content — just normalizes encoding and whitespace.
 */
export const cleanResumeText = (text: string): string => {
    if (!text) return '';

    return text
        .replace(/\u00a0/g, ' ')
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .replace(/\t/g, ' ')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/ {2,}/g, ' ')
        .trim();
};