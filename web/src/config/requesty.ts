// OpenRouter API Configuration

export const REQUESTY_CONFIG = {
    baseURL: 'https://openrouter.ai/api/v1',
    
    // Models (in priority order - free models first)
    models: [
        'qwen/qwen3.5-flash-02-23',        // Free Qwen
        'deepseek/deepseek-v4-flash',       // Free Gemini alternative
        'amazon/nova-micro-v1',           // Free Claude alternative
    ],
    
    // Fallback order for each purpose
    modelPriorities: {
        optimization: [
            'qwen/qwen3.5-flash-02-23',
            'deepseek/deepseek-v4-flash',
        ],
        analysis: [
            'qwen/qwen3.5-flash-02-23', 
            'deepseek/deepseek-v4-flash',
        ],
        generation: [
            'qwen/qwen3.5-flash-02-23',
            'amazon/nova-micro-v1',
        ],
        extraction: [
            'qwen/qwen3.5-flash-02-23',
        ],
        fallback: [
            'deepseek/deepseek-v4-flash',
        ]
    }
};

export function getOpenRouterHeaders(apiKey: string) {
    return {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://atsense.ai',
        'X-Title': 'ATSense'
    };
}