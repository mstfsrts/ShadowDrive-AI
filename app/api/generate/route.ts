// ─── ShadowDrive AI — AI Generate Route ───
// POST /api/generate
// Accepts { topic, difficulty (CEFR level) } and returns a Dutch-Turkish dialogue.
// Priority: OpenRouter (Qwen3) → Gemini API (fallback)

import { NextRequest, NextResponse } from 'next/server';
import { generateWithOpenRouter, isOpenRouterConfigured } from '@/lib/openrouter';
import { generateWithFallback } from '@/lib/gemini';
import { z } from 'zod';
import type { CEFRLevel } from '@/types/dialogue';

// ─── Request Validation ───
const RequestSchema = z.object({
    topic: z.string().min(1).max(200),
    difficulty: z.enum(['A0-A1', 'A2', 'B1', 'B2', 'C1-C2']),
});

// ─── Response Validation ───
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

// ─── CEFR-Specific Language Guidelines ───
const CEFR_GUIDELINES: Record<CEFRLevel, { lineCount: number; maxTokens: number; guide: string }> = {
    'A0-A1': {
        lineCount: 6,
        maxTokens: 1000,
        guide: `GRAMMAR & VOCABULARY (A0-A1):
- Use ONLY present tense (tegenwoordige tijd).
- Maximum 5-7 words per sentence.
- Basic vocabulary: greetings, numbers, colors, common objects, simple verbs (zijn, hebben, gaan, willen).
- Simple subject-verb-object structure.
- No subordinate clauses, no conjunctions beyond "en" and "of".
- Example complexity: "Hallo, ik ben Mustafa." / "Hoeveel kost dit?" / "Ik wil koffie, alstublieft."`,
    },
    'A2': {
        lineCount: 6,
        maxTokens: 1100,
        guide: `GRAMMAR & VOCABULARY (A2):
- Present tense + basic past tense (heb/ben + voltooid deelwoord).
- 6-10 words per sentence.
- Everyday vocabulary: shopping, transport, weather, family, food, work.
- Simple conjunctions: en, maar, want, omdat, als.
- Separable verbs: meenemen, opbellen, aankomen.
- Example: "Ik heb gisteren boodschappen gedaan bij de Albert Heijn." / "Kun je me helpen?"`,
    },
    'B1': {
        lineCount: 8,
        maxTokens: 1300,
        guide: `GRAMMAR & VOCABULARY (B1):
- All basic tenses including future (zullen/gaan) and past continuous.
- 8-15 words per sentence.
- Professional vocabulary: office, appointments, small talk with colleagues, healthcare.
- Subordinate clauses with dat, die, als, wanneer, omdat, hoewel.
- Modal verbs: moeten, kunnen, willen, mogen, zullen.
- Polite forms: zou u, kunt u, mag ik.
- Example: "Ik denk dat we het project volgende week kunnen afronden."`,
    },
    'B2': {
        lineCount: 8,
        maxTokens: 1400,
        guide: `GRAMMAR & VOCABULARY (B2):
- Complex tenses, passive voice (worden/zijn + voltooid deelwoord), conditional (zou/zouden).
- 10-20 words per sentence.
- Nuanced vocabulary: opinions, debates, professional discussions, emotions.
- Relative clauses, indirect speech, comparison structures.
- Common expressions: "het valt me op dat...", "naar mijn mening...", "het lijkt erop dat..."
- Discourse markers: trouwens, overigens, eerlijk gezegd, aan de andere kant.
- Example: "Als ik jou was, zou ik het voorstel nog eens goed bekijken voordat je een beslissing neemt."`,
    },
    'C1-C2': {
        lineCount: 8,
        maxTokens: 1500,
        guide: `GRAMMAR & VOCABULARY (C1-C2):
- All tenses, subjunctive mood, complex passive constructions, nominal style.
- Natural sentence length with varying rhythm — mix short punchy lines with longer complex ones.
- Idiomatic expressions, proverbs, slang, humor.
- Dutch-specific particles and fillers: er, wel, toch, maar, even, hoor, zeg, nou, eigenlijk, best wel.
- Register switching: formal to informal within same conversation.
- Colloquial contractions: 't, 'n, d'r, ie.
- Example: "Nou, daar heb je wel een punt hoor, maar ik zou er toch niet te veel van verwachten als ik jou was."`,
    },
};

// ─── Smart Prompt Builder ───
function buildPrompt(topic: string, level: CEFRLevel): string {
    const config = CEFR_GUIDELINES[level];

    return `You are an expert Dutch (Nederlands) language coach specializing in **spoken Dutch as used in the Netherlands** (NOT Belgian/Flemish Dutch). You create realistic conversational dialogues for Turkish-speaking professionals (UX designers, psychologists, teachers, office workers) who live and work in the Netherlands.

USER'S REQUESTED TOPIC: "${topic}"
(Note: the user may have typed in Turkish, Dutch, or English. Interpret the intent regardless of input language and create a scenario about this topic.)

CEFR LEVEL: ${level}

${config.guide}

SCENARIO REQUIREMENTS:
1. Create a coherent, realistic conversation between 2 people about the given topic.
2. The conversation MUST flow naturally — each line should logically follow the previous one. Do NOT generate random unrelated sentences.
3. Include speaker turns (Person A and Person B alternating naturally).
4. Use spoken Dutch — contractions, particles, filler words that real Dutch people use in everyday speech.
5. The Turkish translations ("nativeText") must be natural Turkish, not word-for-word translations.
6. The scenario title should be a short descriptive phrase in Dutch.

TECHNICAL REQUIREMENTS:
- Generate exactly ${config.lineCount} dialogue lines.
- "pauseMultiplier": 1.0 for short simple phrases, 1.5 for medium, 2.0 for long complex sentences.
- Return ONLY raw JSON, no markdown, no code fences, no explanation.

JSON STRUCTURE:
{
  "title": "Short descriptive title in Dutch",
  "targetLang": "nl-NL",
  "nativeLang": "tr-TR",
  "lines": [
    { "id": 1, "targetText": "Dutch phrase", "nativeText": "Türkçe çeviri", "pauseMultiplier": 1.5 }
  ]
}`;
}

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
        const config = CEFR_GUIDELINES[difficulty as CEFRLevel];
        console.log(`[API /generate] Topic: "${topic}", CEFR Level: "${difficulty}", Lines: ${config.lineCount}`);

        // 2. Build smart prompt with CEFR-specific guidelines
        const prompt = buildPrompt(topic, difficulty as CEFRLevel);

        // 3. Call AI — OpenRouter first, Gemini as fallback
        let responseText: string;

        if (isOpenRouterConfigured()) {
            try {
                console.log('[API /generate] Using OpenRouter...');
                responseText = await generateWithOpenRouter(prompt, config.maxTokens);
            } catch (routerErr) {
                console.warn('[API /generate] OpenRouter failed:', routerErr instanceof Error ? routerErr.message : routerErr);

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

        // 5. Parse & validate the AI response
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

        console.log('[API /generate] Response validated successfully');
        console.log('[API /generate] Returning scenario:', validated.data.title, `(${validated.data.lines.length} lines)`);

        // 6. Return validated scenario
        return NextResponse.json(validated.data);

    } catch (error) {
        console.error('[API /generate] All AI providers failed:', error);
        const message = error instanceof Error ? error.message : 'Unknown API Error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
