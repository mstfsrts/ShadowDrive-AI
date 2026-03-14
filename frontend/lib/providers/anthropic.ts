// ─── ShadowDrive AI — Anthropic Provider ───
// Cloud AI via Anthropic (api.anthropic.com).
// Set ANTHROPIC_API_KEY in env vars to enable.

import { AIProvider, registerProvider } from '@/lib/ai-provider';

const TIMEOUT_MS = 25000;
const nativeFetch = globalThis.fetch;

const anthropicProvider: AIProvider = {
    name: 'Anthropic',

    isConfigured(): boolean {
        return !!process.env.ANTHROPIC_API_KEY;
    },

    async generate(prompt: string, maxTokens: number): Promise<string> {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        const model = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307';

        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY is not configured');
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const res = await nativeFetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    model,
                    max_tokens: maxTokens,
                    messages: [{ role: 'user', content: prompt }],
                }),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!res.ok) {
                const errorText = await res.text().catch(() => 'Unknown Error');
                throw new Error(`Anthropic returned ${res.status}: ${errorText}`);
            }

            const data = await res.json() as { content?: { text?: string }[] };
            const content = data?.content?.[0]?.text;

            if (!content || typeof content !== 'string') {
                throw new Error('Anthropic returned an empty response');
            }

            return content.trim();
        } catch (error: unknown) {
            clearTimeout(timeout);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Anthropic timed out after ${TIMEOUT_MS / 1000}s`);
            }
            throw error;
        }
    }
};

// Auto-register on import
registerProvider(anthropicProvider);

export default anthropicProvider;
