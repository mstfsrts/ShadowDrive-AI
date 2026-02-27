// ─── Gemini Service ───
// Migrated from lib/gemini.ts — standalone Express version.

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { MODEL_CANDIDATES, GEMINI_TIMEOUT_MS, GEMINI_MAX_TOKENS } from '../../packages/shared/src/constants';

let genAI: GoogleGenerativeAI | null = null;
let resolvedModel: GenerativeModel | null = null;
let resolvedModelName: string | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log('[Gemini] Initializing client...');
    console.log('[Gemini] GEMINI_API_KEY present:', !!apiKey);

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error(
        'GEMINI_API_KEY is not set. Add it to your .env file.'
      );
    }

    genAI = new GoogleGenerativeAI(apiKey);
    console.log('[Gemini] Client initialized successfully');
  }
  return genAI;
}

function isRateLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes('429') || message.includes('quota') || message.includes('Too Many Requests');
}

export async function generateWithFallback(prompt: string): Promise<string> {
  const client = getGeminiClient();

  // Try resolved model first
  if (resolvedModel && resolvedModelName) {
    try {
      console.log(`[Gemini] Using resolved model: ${resolvedModelName}`);
      return await generateFastWithTimeout(resolvedModel, prompt);
    } catch (err) {
      console.warn(`[Gemini] Resolved model failed, trying candidates. Error: ${String(err)}`);
      resolvedModel = null;
      resolvedModelName = null;
    }
  }

  let lastError: Error | null = null;
  let allRateLimited = true;

  for (const modelName of MODEL_CANDIDATES) {
    console.log(`[Gemini] Trying model: ${modelName}...`);
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const text = await generateFastWithTimeout(model, prompt);

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
    }
  }

  if (allRateLimited) {
    throw new Error(
      'All Gemini models are rate-limited (429). Please wait a few minutes and try again.'
    );
  }

  throw lastError || new Error(
    `All Gemini models failed. Tried: ${MODEL_CANDIDATES.join(', ')}.`
  );
}

async function generateFastWithTimeout(
  model: GenerativeModel,
  prompt: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const result = await model.generateContent(
      { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: GEMINI_MAX_TOKENS } },
      { signal: controller.signal }
    );
    return result.response.text();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Timeout: AI took longer than ${GEMINI_TIMEOUT_MS / 1000}s.`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
