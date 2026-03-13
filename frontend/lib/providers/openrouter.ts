// ─── ShadowDrive AI — OpenRouter Provider ───
// Cloud AI via OpenRouter (openrouter.ai). OpenAI-compatible API.
// Set OPENROUTER_API_KEY in env vars to enable.

import { AIProvider, registerProvider } from '@/lib/ai-provider';

const TIMEOUT_MS = 60_000;
const nativeFetch = globalThis.fetch;

const openRouterProvider: AIProvider = {
    name: 'OpenRouter',

    isConfigured(): boolean {
        return !!process.env.OPENROUTER_API_KEY;
    },

    async generate(prompt: string, maxTokens: number = 1500): Promise<string> {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b';

        if (!apiKey) {
            throw new Error('OPENROUTER_API_KEY is not configured');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const res = await nativeFetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://shadowdrive.ai',
                    'X-Title': 'ShadowDrive AI',
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: maxTokens,
                    temperature: 0.7,
                }),
                signal: controller.signal,
            });

            if (!res.ok) {
                const errorText = await res.text().catch(() => res.statusText);
                throw new Error(`OpenRouter returned ${res.status}: ${errorText}`);
            }

            const data = await res.json();
            let text: string = data.choices?.[0]?.message?.content ?? '';

            if (!text) {
                throw new Error('OpenRouter returned an empty response');
            }

            // Strip <think>...</think> blocks from thinking models (Qwen3, DeepSeek, etc.)
            text = text.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();

            return text;
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                throw new Error(`OpenRouter timed out after ${TIMEOUT_MS / 1000}s`);
            }
            throw err;
        } finally {
            clearTimeout(timeoutId);
        }
    },
};

// Auto-register on import
registerProvider(openRouterProvider);

export default openRouterProvider;
