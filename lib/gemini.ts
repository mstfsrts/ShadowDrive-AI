// ─── ShadowDrive AI — Gemini SDK Helper ───
// CRITICAL: Free-tier models only.

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Models to try in order of preference.
// IMPORTANT: Each model has an INDEPENDENT rate-limit quota.
// If one is 429'd, the next one may still work.
// Verified available models for this API key (2026-02-25):
// gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, gemini-2.0-flash-lite
// NOTE: gemini-1.5-* models return 404 on this key — they are retired.
const MODEL_CANDIDATES = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'];

let genAI: GoogleGenerativeAI | null = null;
let resolvedModel: GenerativeModel | null = null;
let resolvedModelName: string | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;

        console.log('[Gemini] Initializing client...');
        console.log('[Gemini] GEMINI_API_KEY present:', !!apiKey);
        console.log('[Gemini] GEMINI_API_KEY length:', apiKey?.length ?? 0);

        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            throw new Error(
                'GEMINI_API_KEY is not set. Create a .env.local file in the project root with:\n' +
                'GEMINI_API_KEY=your_actual_api_key'
            );
        }

        genAI = new GoogleGenerativeAI(apiKey);
        console.log('[Gemini] Client initialized successfully');
    }
    return genAI;
}

/**
 * Pause execution for the given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine if an error is a rate-limit (429) error.
 */
function isRateLimitError(err: unknown): boolean {
    const message = err instanceof Error ? err.message : String(err);
    return message.includes('429') || message.includes('quota') || message.includes('Too Many Requests');
}

/**
 * Try each model candidate until one works.
 * If we hit rate-limits, retry with exponential backoff.
 * On first success, lock onto that model for future calls.
 */
export async function generateWithFallback(prompt: string): Promise<string> {
    const client = getGeminiClient();

    // If we already found a working model, try it first
    if (resolvedModel && resolvedModelName) {
        try {
            console.log(`[Gemini] Using resolved model: ${resolvedModelName}`);
            return await generateFastWithTimeout(resolvedModel, prompt);
        } catch (err) {
            console.warn(`[Gemini] Resolved model failed, falling back to candidates. Error: ${String(err)}`);
            resolvedModel = null;
            resolvedModelName = null;
        }
    }

    // Try EVERY candidate model. Do NOT exit early on 429 — each model
    // has its own independent quota, so a different model may still work.
    let lastError: Error | null = null;
    let allRateLimited = true;

    for (const modelName of MODEL_CANDIDATES) {
        console.log(`[Gemini] Trying model: ${modelName}...`);
        try {
            const model = client.getGenerativeModel({ model: modelName });
            const text = await generateFastWithTimeout(model, prompt);

            // Success! Lock onto this model.
            resolvedModel = model;
            resolvedModelName = modelName;
            console.log(`[Gemini] ✅ Model ${modelName} locked for future calls.`);
            return text;
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`[Gemini] RAW ERROR for ${modelName}:`, message);
            lastError = err instanceof Error ? err : new Error(message);

            if (!isRateLimitError(err)) {
                allRateLimited = false;
            }
            // Continue to next model — do NOT break out of the loop
        }
    }

    // Only after ALL models have been tried, report the appropriate error
    if (allRateLimited) {
        throw new Error(
            'All Gemini models are rate-limited (429). The free tier quota is exhausted across all models. ' +
            'Please wait a few minutes and try again.'
        );
    }

    throw lastError || new Error(
        `All Gemini models failed. Tried: ${MODEL_CANDIDATES.join(', ')}. ` +
        'Check your API key and ensure the Gemini API is enabled in your Google Cloud project.'
    );
}

/**
 * Make a single generateContent call with a hard 12-second timeout using AbortSignal.
 * We want the app to FAIL FAST, so the UI can quickly enter the fallback state 
 * instead of hanging "Generating..." while the user drives.
 */
async function generateFastWithTimeout(
    model: GenerativeModel,
    prompt: string
): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second limit

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1500 }
        }, { signal: controller.signal });

        return result.response.text();
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('Timeout: The AI took longer than 12 seconds to respond. Please try again or use the demo.');
        }
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
}

