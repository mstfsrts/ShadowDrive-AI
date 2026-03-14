// ─── ShadowDrive AI — OpenAI Provider ───
// Cloud AI via OpenAI (api.openai.com).
// Set OPENAI_API_KEY in env vars to enable.

import { AIProvider, registerProvider } from '@/lib/ai-provider';

const TIMEOUT_MS = 25000;
const nativeFetch = globalThis.fetch;

const openAIProvider: AIProvider = {
    name: 'OpenAI',

    isConfigured(): boolean {
        return !!process.env.OPENAI_API_KEY;
    },

    async generate(prompt: string, maxTokens: number): Promise<string> {
        const apiKey = process.env.OPENAI_API_KEY;
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not configured');
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const res = await nativeFetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: maxTokens,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!res.ok) {
                const errorText = await res.text().catch(() => 'Unknown Error');
                throw new Error(`OpenAI returned ${res.status}: ${errorText}`);
            }

            const data = await res.json() as { choices?: { message?: { content?: string } }[] };
            const content = data?.choices?.[0]?.message?.content;

            if (!content || typeof content !== 'string') {
                throw new Error('OpenAI returned an empty response');
            }

            return content.trim();
        } catch (error: unknown) {
            clearTimeout(timeout);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`OpenAI timed out after ${TIMEOUT_MS / 1000}s`);
            }
            throw error;
        }
    }
};

// Auto-register on import
registerProvider(openAIProvider);

export default openAIProvider;
