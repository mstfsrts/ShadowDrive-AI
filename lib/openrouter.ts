// ─── ShadowDrive AI — OpenRouter API Client ───
// Cloud AI provider via OpenRouter (openrouter.ai).
// Uses OpenAI-compatible API. Set OPENROUTER_API_KEY in .env.local to enable.

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b';
const TIMEOUT_MS = 60_000; // 60s — cloud API, no CPU bottleneck

/**
 * Returns true if OPENROUTER_API_KEY is set in the environment.
 */
export function isOpenRouterConfigured(): boolean {
    return !!OPENROUTER_API_KEY;
}

/**
 * Generate text via OpenRouter's API.
 * Handles thinking model output (strips <think> blocks).
 */
export async function generateWithOpenRouter(prompt: string): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        console.log(`[OpenRouter] → model: ${OPENROUTER_MODEL}`);

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://shadowdrive.ai',
                'X-Title': 'ShadowDrive AI',
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1500,
                temperature: 0.7,
            }),
            signal: controller.signal,
            cache: 'no-store' as RequestCache,
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

        console.log(`[OpenRouter] ✅ OK — ${text.length} chars`);
        return text;

    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error(`OpenRouter timed out after ${TIMEOUT_MS / 1000}s`);
        }
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
}
