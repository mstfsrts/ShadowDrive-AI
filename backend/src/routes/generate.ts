// ─── Generate Route ───
// POST /api/generate — Gemini-powered Dutch-Turkish scenario generator
// Migrated from app/api/generate/route.ts

import { Router, Request, Response } from 'express';
import { GenerateRequestSchema, ScenarioSchema } from '../../../packages/shared/src/validators';
import { generateWithFallback } from '../services/gemini';
import { generateLimiter } from '../middleware/rateLimiter';
import { prisma } from '../services/prisma';

export const generateRouter = Router();

generateRouter.post('/generate', generateLimiter, async (req: Request, res: Response) => {
  console.log('\n[API /generate] ========== NEW REQUEST ==========');

  try {
    // 1. Validate request
    const parsed = GenerateRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      console.error('[API /generate] Validation failed:', parsed.error.flatten());
      res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
      return;
    }

    const { topic, difficulty } = parsed.data;
    console.log(`[API /generate] Topic: "${topic}", Difficulty: "${difficulty}"`);

    // 2. Build the Gemini prompt
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

    console.log('[API /generate] Sending prompt to Gemini...');

    // 3. Call Gemini with model fallback
    const responseText = await generateWithFallback(prompt);

    console.log('[API /generate] Gemini raw response length:', responseText.length);

    // 4. Clean markdown fences if present
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?\s*```$/, '');
    }

    // 5. Parse & validate
    let scenario;
    try {
      scenario = JSON.parse(cleanJson);
    } catch {
      console.error('[API /generate] JSON parse failed');
      res.status(502).json({
        error: 'Gemini returned invalid JSON',
        raw: responseText.substring(0, 500),
      });
      return;
    }

    const validated = ScenarioSchema.safeParse(scenario);
    if (!validated.success) {
      console.error('[API /generate] Schema validation failed:', validated.error.flatten());
      res.status(422).json({
        error: 'Gemini response does not match schema',
        details: validated.error.flatten(),
      });
      return;
    }

    console.log(`[API /generate] ✅ Scenario: "${validated.data.title}" (${validated.data.lines.length} lines)`);

    // 6. Persist generated scenario to DB (fire-and-forget)
    prisma.generatedScenario.create({
      data: {
        topic,
        difficulty,
        data: validated.data,
      },
    }).catch(err => console.warn('[API /generate] Failed to persist scenario:', err));

    // 7. Return
    res.json(validated.data);

  } catch (error) {
    console.error('[API /generate] RAW ERROR:', error);
    const message = error instanceof Error ? error.message : 'Unknown API Error';
    res.status(500).json({ error: message });
  }
});
