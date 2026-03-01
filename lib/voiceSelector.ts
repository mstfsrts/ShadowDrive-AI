// ─── ShadowDrive AI — Voice Selector ───
// Finds the best available voice for a given language on the device.
// Prioritizes neural/enhanced voices over default ones.

import { CEFRLevel } from '@/types/dialogue';

// ─── Quality tiers (higher = better) ───
const QUALITY_KEYWORDS: [RegExp, number][] = [
    [/neural/i, 100],
    [/enhanced/i, 80],
    [/premium/i, 80],
    [/natural/i, 70],
    [/\bGoogle\b/i, 60],
    [/\bMicrosoft\b/i, 50],
    [/\bApple\b/i, 40],
];

// ─── Cached voices per language ───
const voiceCache = new Map<string, SpeechSynthesisVoice>();

/**
 * Score a voice based on quality indicators in its name.
 * Higher score = better quality.
 */
function scoreVoice(voice: SpeechSynthesisVoice): number {
    let score = 0;

    for (const [pattern, points] of QUALITY_KEYWORDS) {
        if (pattern.test(voice.name)) {
            score += points;
        }
    }

    // Prefer local voices over remote (lower latency)
    if (voice.localService) {
        score += 10;
    }

    return score;
}

/**
 * Find the best available voice for a given BCP-47 language tag.
 * Results are cached per language for the lifetime of the page.
 *
 * @param lang - BCP-47 tag like "nl-NL" or "tr-TR"
 * @returns The best voice, or undefined if none found for that language
 */
export function getBestVoice(lang: string): SpeechSynthesisVoice | undefined {
    if (typeof window === 'undefined' || !window.speechSynthesis) return undefined;

    // Return cached voice if available
    const cached = voiceCache.get(lang);
    if (cached) return cached;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return undefined;

    const langPrefix = lang.split('-')[0].toLowerCase(); // "nl" from "nl-NL"

    // Find all voices matching this language
    const matching = voices.filter((v) => {
        const voiceLang = v.lang.toLowerCase();
        return voiceLang === lang.toLowerCase() || voiceLang.startsWith(langPrefix + '-');
    });

    if (matching.length === 0) return undefined;

    // Sort by quality score (descending)
    matching.sort((a, b) => scoreVoice(b) - scoreVoice(a));

    const best = matching[0];
    voiceCache.set(lang, best);

    console.log(
        `[VoiceSelector] Best voice for ${lang}: "${best.name}" (score: ${scoreVoice(best)}, ` +
        `${matching.length} candidates)`
    );

    return best;
}

/**
 * Get the optimal speech rate for a given CEFR level.
 * Lower levels get slower speech for better comprehension.
 */
export function getRateForLevel(level: CEFRLevel): number {
    switch (level) {
        case 'A0-A1': return 0.75;
        case 'A2':    return 0.82;
        case 'B1':    return 0.9;
        case 'B2':    return 0.95;
        case 'C1-C2': return 1.0;
        default:      return 0.9;
    }
}

/**
 * Clear the voice cache. Useful when voices change
 * (e.g., after a voiceschanged event).
 */
export function clearVoiceCache(): void {
    voiceCache.clear();
}
