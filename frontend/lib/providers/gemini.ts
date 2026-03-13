// ─── ShadowDrive AI — Gemini Provider ───
// Fallback AI via Google Gemini API. Free tier with model fallback chain.
// Set GEMINI_API_KEY in env vars to enable.

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIProvider, registerProvider } from '@/lib/ai-provider';

const MODEL_CANDIDATES = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'];
const GEMINI_TIMEOUT_MS = 15_000;

let genAI: GoogleGenerativeAI | null = null;
let resolvedModel: GenerativeModel | null = null;
let resolvedModelName: string | null = null;

function getClient(): GoogleGenerativeAI {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            throw new Error('GEMINI_API_KEY is not set');
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

function isRateLimitError(err: unknown): boolean {
    const message = err instanceof Error ? err.message : String(err);
    return message.includes('429') || message.includes('quota') || message.includes('Too Many Requests');
}

async function generateFastWithTimeout(model: GenerativeModel, prompt: string, maxTokens: number): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
        const result = await model.generateContent(
            {
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: maxTokens },
            },
            { signal: controller.signal },
        );
        return result.response.text();
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error(`Gemini timed out after ${GEMINI_TIMEOUT_MS / 1000}s`);
        }
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
}

const geminiProvider: AIProvider = {
    name: 'Gemini',

    isConfigured(): boolean {
        const key = process.env.GEMINI_API_KEY;
        return !!key && key !== 'your_gemini_api_key_here';
    },

    async generate(prompt: string, maxTokens: number = 1500): Promise<string> {
        const client = getClient();

        // Try locked model first
        if (resolvedModel && resolvedModelName) {
            try {
                return await generateFastWithTimeout(resolvedModel, prompt, maxTokens);
            } catch {
                resolvedModel = null;
                resolvedModelName = null;
            }
        }

        // Try each candidate
        let lastError: Error | null = null;
        let allRateLimited = true;

        for (const modelName of MODEL_CANDIDATES) {
            try {
                const model = client.getGenerativeModel({ model: modelName });
                const text = await generateFastWithTimeout(model, prompt, maxTokens);
                resolvedModel = model;
                resolvedModelName = modelName;
                return text;
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                lastError = err instanceof Error ? err : new Error(message);
                if (!isRateLimitError(err)) {
                    allRateLimited = false;
                }
            }
        }

        if (allRateLimited) {
            throw new Error('All Gemini models are rate-limited (429). Please wait a few minutes.');
        }

        throw lastError ?? new Error(`All Gemini models failed. Tried: ${MODEL_CANDIDATES.join(', ')}`);
    },
};

// Auto-register on import (lower priority — imported after OpenRouter)
registerProvider(geminiProvider);

export default geminiProvider;
