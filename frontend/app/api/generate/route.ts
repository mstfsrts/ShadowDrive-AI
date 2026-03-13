// ─── ShadowDrive AI — AI Generate Route ───
// POST /api/generate
// Accepts { topic, difficulty (CEFR level) } and returns a Dutch dialogue.
// Provider priority: OpenRouter → Gemini (auto-fallback via ai-provider)

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateWithProviders } from '@/lib/providers';
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

// ─── Locale-specific prompt config ───
interface LocaleConfig {
    nativeLang: string;
    nativeLangCode: string;
    audience: string;
    nativeTextExample: string;
    translationNote: string;
}

const LOCALE_CONFIG: Record<string, LocaleConfig> = {
    en: {
        nativeLang: 'English',
        nativeLangCode: 'en-US',
        audience: 'English-speaking professionals who live and work in the Netherlands',
        nativeTextExample: 'English translation',
        translationNote: 'The English translations ("nativeText") must be natural English, not word-for-word translations.',
    },
    tr: {
        nativeLang: 'Turkish',
        nativeLangCode: 'tr-TR',
        audience: 'Turkish-speaking professionals (UX designers, psychologists, teachers, office workers) who live and work in the Netherlands',
        nativeTextExample: 'Türkçe çeviri',
        translationNote: 'The Turkish translations ("nativeText") must be natural Turkish, not word-for-word translations.',
    },
};

// ─── Smart Prompt Builder ───
function buildPrompt(topic: string, level: CEFRLevel, locale: string): string {
    const config = CEFR_GUIDELINES[level];
    const lc = LOCALE_CONFIG[locale] ?? LOCALE_CONFIG['tr'];

    return `You are an expert Dutch (Nederlands) language coach specializing in **spoken Dutch as used in the Netherlands** (NOT Belgian/Flemish Dutch). You create realistic conversational dialogues for ${lc.audience}.

USER'S REQUESTED TOPIC: "${topic}"
(Note: the user may have typed in Turkish, Dutch, or English. Interpret the intent regardless of input language and create a scenario about this topic.)

CEFR LEVEL: ${level}

${config.guide}

SCENARIO REQUIREMENTS:
1. Create a coherent, realistic conversation between 2 people about the given topic.
2. The conversation MUST flow naturally — each line should logically follow the previous one. Do NOT generate random unrelated sentences.
3. Include speaker turns (Person A and Person B alternating naturally).
4. Use spoken Dutch — contractions, particles, filler words that real Dutch people use in everyday speech.
5. ${lc.translationNote}
6. The scenario title should be a short descriptive phrase in Dutch.

TECHNICAL REQUIREMENTS:
- Generate exactly ${config.lineCount} dialogue lines.
- "pauseMultiplier": 1.0 for short simple phrases, 1.5 for medium, 2.0 for long complex sentences.
- Return ONLY raw JSON, no markdown, no code fences, no explanation.

JSON STRUCTURE:
{
  "title": "Short descriptive title in Dutch",
  "targetLang": "nl-NL",
  "nativeLang": "${lc.nativeLangCode}",
  "lines": [
    { "id": 1, "targetText": "Dutch phrase", "nativeText": "${lc.nativeTextExample}", "pauseMultiplier": 1.5 }
  ]
}`;
}

export async function POST(request: NextRequest) {
    try {
        // 1. Parse & validate request body
        const body = await request.json();

        const parsed = RequestSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { topic, difficulty } = parsed.data;
        const config = CEFR_GUIDELINES[difficulty as CEFRLevel];

        // 2. Determine locale from cookie (NEXT_LOCALE set by next-intl)
        const cookieStore = cookies();
        const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'tr';

        // 3. Build smart prompt with CEFR-specific guidelines and locale
        const prompt = buildPrompt(topic, difficulty as CEFRLevel, locale);

        // 4. Call AI — auto-fallback through provider chain
        const responseText = await generateWithProviders(prompt, config.maxTokens);

        // 5. Clean potential markdown fences from response
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?\s*```$/, '');
        }

        // 6. Parse & validate the AI response
        let scenario;
        try {
            scenario = JSON.parse(cleanJson);
        } catch {
            console.error('[generate] JSON parse failed, raw:', cleanJson.substring(0, 300));
            return NextResponse.json(
                { error: 'AI returned invalid JSON', raw: responseText.substring(0, 500) },
                { status: 502 }
            );
        }

        const validated = ScenarioSchema.safeParse(scenario);
        if (!validated.success) {
            console.error('[generate] Schema validation failed:', validated.error.flatten());
            return NextResponse.json(
                { error: 'AI response does not match schema', details: validated.error.flatten(), raw: scenario },
                { status: 422 }
            );
        }

        // 7. Return validated scenario
        return NextResponse.json(validated.data);

    } catch (error) {
        console.error('[generate] All providers failed:', error instanceof Error ? error.message : error);
        const message = error instanceof Error ? error.message : 'Unknown API Error';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
