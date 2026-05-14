/**
 * requesty.ts — OpenRouter API Configuration

 */

export const REQUESTY_CONFIG = {
    baseURL: 'https://openrouter.ai/api/v1',

    // ─── Model Priority Lists ───────────────────────────────────────────────
    // Each list is tried in order. First successful response wins.
    // All models below are verified OpenRouter IDs.

    models: [
        'qwen/qwen-2.5-72b-instruct',
        'deepseek/deepseek-v4-flash',
        'meta-llama/llama-3.3-70b-instruct',
        'google/gemini-3.1-flash-lite',
    ],


    // models: [
    //    'qwen/qwen3.5-flash-02-23',        // Free Qwen
    //    'deepseek/deepseek-v4-flash',       // Free Gemini alternative
    //    'amazon/nova-micro-v1',           // Free Claude alternative
    //],

    modelPriorities: {
        // Keyword/JD extraction — needs precision, not creativity
        extraction: [
            'deepseek/deepseek-chat',
            'qwen/qwen-2.5-72b-instruct',
            'meta-llama/llama-3.3-70b-instruct',
        ],

        // Resume/bullet optimization — needs instruction following
        optimization: [
            'meta-llama/llama-3.3-70b-instruct',
            'qwen/qwen-2.5-72b-instruct',
            'deepseek/deepseek-chat',
        ],

        // Strategic analysis/reasoning
        analysis: [
            'meta-llama/llama-3.3-70b-instruct',
            'qwen/qwen-2.5-72b-instruct',
            'google/gemini-3.1-flash-lite',
        ],

        // Summary/cover letter generation — needs writing quality
        generation: [
            'meta-llama/llama-3.3-70b-instruct',
            'qwen/qwen-2.5-72b-instruct',
            'deepseek/deepseek-chat',
        ],

        fallback: [
            'google/gemini-3.1-flash-lite',
            'deepseek/deepseek-chat',
        ],
    } as Record<string, string[]>,
};

export function getOpenRouterHeaders(apiKey: string) {
    return {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://atsense.ai',
        'X-Title': 'ATSense Resume Optimizer',
    };
}
