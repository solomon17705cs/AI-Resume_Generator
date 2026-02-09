export const normalizeJobDescription = (text: string) => {
    // 1. Fix common stemming errors or weird artifacts
    const fixes: Record<string, string> = {
        'plany': 'planning',
        'manag': 'manage',
        'develop': 'development',
        'engin': 'engineer',
        'analys': 'analysis',
        'requir': 'requirement'
    };

    // 2. Apply fixes and common cleanup
    let normalized = text.toLowerCase();
    Object.entries(fixes).forEach(([from, to]) => {
        normalized = normalized.replace(new RegExp(`\\b${from}\\w*\\b`, 'g'), to);
    });

    // 3. Remove irrelevant content to focus the analysis
    // This helps prevent "About Us" or "Benefits" from polluting the keyword extraction
    normalized = normalized
        .replace(/(.*?)(required|responsibilities|qualifications|requirements)(.*?)/gi, '$3')
        .replace(/(.*?)(about\s*us|company\s*overview)(.*?)/gi, '')
        .replace(/(.*?)(benefits|perks|compensation)(.*?)/gi, '')
        .replace(/(.*?)(apply\s*now|how\s*to\s*apply)(.*?)/gi, '');

    return normalized.trim();
};
