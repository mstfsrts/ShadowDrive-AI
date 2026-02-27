// ─── ShadowDrive AI — AI Generate Route ───
// POST /api/generate
// Accepts { topic, difficulty } and returns a Dutch-Turkish dialogue.
// Priority: OpenRouter (Qwen3) → Gemini API (fallback)

import { NextRequest, NextResponse } from 'next/server';
import { generateWithOpenRouter, isOpenRouterConfigured } from '@/lib/openrouter';
import { generateWithFallback } from '@/lib/gemini';
import { z } from 'zod';

// Validate incoming request
const RequestSchema = z.object({
    topic: z.string().min(1).max(200),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});

// Validate Gemini response matches our Scenario type
const DialogueLineSchema = z.object({
    id: z.number(),
    targetText: z.string(),
    nativeText: z.string(),
    pauseMultiplier: z.number().min(0.5).max(3.0),
});

const ScenarioSchema = z.object({
    title: z.string(),
    targetLang: z.string(),
    nativeLang: z.string(),
    lines: z.array(DialogueLineSchema).min(4).max(15),
});

export async function POST(request: NextRequest) {
    console.log('\n[API /generate] ========== NEW REQUEST ==========');

    try {
        // 1. Parse & validate request body
        const body = await request.json();
        console.log('[API /generate] Request body:', JSON.stringify(body));

        const parsed = RequestSchema.safeParse(body);
        if (!parsed.success) {
            console.error('[API /generate] Validation failed:', parsed.error.flatten());
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { topic, difficulty } = parsed.data;
        console.log(`[API /generate] Topic: "${topic}", Difficulty: "${difficulty}"`);

        // 2. Build the Gemini prompt — Turkish professionals learning Dutch
        const prompt = `You are an expert Dutch language coach for Turkish-speaking professionals living in the Netherlands (such as UX Designers, Psychologists, teachers, or office workers).

The user wants to practice a scenario about: "${topic}"
Difficulty level: ${difficulty}

Generate a highly natural, everyday conversational dialogue in Dutch with Turkish translations.

RULES:
- Generate exactly 8 dialogue lines.
- "targetText": Natural, casual Dutch — the way real people talk in the Netherlands. Avoid robotic or overly formal phrasing.
- "nativeText": Accurate, natural Turkish translation.
- "pauseMultiplier": 1.0 for short phrases, up to 2.0 for complex sentences.
- For "beginner": use simple, A1-A2 level sentences with basic vocabulary.
- For "intermediate": use everyday B1 speech — small talk, office chats, appointments.
- For "advanced": use complex sentences with idioms, opinions, and informal speech patterns.

Return ONLY a raw JSON object (no markdown, no code fences) matching this exact structure:
{
  "title": "Short scenario title in English",
  "targetLang": "nl-NL",
  "nativeLang": "tr-TR",
  "lines": [
    { "id": 1, "targetText": "Dutch phrase", "nativeText": "Türkçe çeviri", "pauseMultiplier": 1.5 }
  ]
}

MUST return raw JSON only. No explanation, no markdown.`;

        // 3. Call AI — OpenRouter first, Gemini as fallback
        let responseText: string;

        if (isOpenRouterConfigured()) {
            try {
                console.log('[API /generate] Using OpenRouter...');
                responseText = await generateWithOpenRouter(prompt);
            } catch (routerErr) {
                console.warn('[API /generate] OpenRouter failed:', routerErr instanceof Error ? routerErr.message : routerErr);

                // Only fall back to Gemini if a real API key is configured
                const geminiKey = process.env.GEMINI_API_KEY;
                if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
                    console.log('[API /generate] Falling back to Gemini...');
                    responseText = await generateWithFallback(prompt);
                } else {
                    throw routerErr;
                }
            }
        } else {
            console.log('[API /generate] OpenRouter not configured, using Gemini...');
            responseText = await generateWithFallback(prompt);
        }

        console.log('[API /generate] Raw response length:', responseText.length);
        console.log('[API /generate] Raw response (first 500 chars):', responseText.substring(0, 500));

        // 4. Clean potential markdown fences from response
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('```')) {
            console.log('[API /generate] Detected markdown fences, stripping...');
            cleanJson = cleanJson.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?\s*```$/, '');
        }

        // 5. Parse & validate the Gemini response
        let scenario;
        try {
            scenario = JSON.parse(cleanJson);
            console.log('[API /generate] JSON parsed successfully');
            console.log('[API /generate] Scenario title:', scenario.title);
            console.log('[API /generate] Number of lines:', scenario.lines?.length);
        } catch (parseError) {
            console.error('[API /generate] JSON parse failed:', parseError);
            console.error('[API /generate] Attempted to parse:', cleanJson.substring(0, 300));
            return NextResponse.json(
                { error: 'AI returned invalid JSON', raw: responseText.substring(0, 500) },
                { status: 502 }
            );
        }

        const validated = ScenarioSchema.safeParse(scenario);
        if (!validated.success) {
            console.error('[API /generate] Schema validation failed:', validated.error.flatten());
            return NextResponse.json(
                { error: 'AI response does not match schema', details: validated.error.flatten(), raw: scenario },
                { status: 422 }
            );
        }

        console.log('[API /generate] ✅ Response validated successfully');
        console.log('[API /generate] Returning scenario:', validated.data.title, `(${validated.data.lines.length} lines)`);

        // 6. Return validated scenario
        return NextResponse.json(validated.data);

    } catch (error) {
        // ── RAW ERROR — both AI providers failed ──
        console.error('[API /generate] All AI providers failed:', error);
        const message = error instanceof Error ? error.message : 'Unknown API Error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
