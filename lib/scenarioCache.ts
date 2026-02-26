// ─── ShadowDrive AI — LocalStorage Scenario Cache ───
// Prevents duplicate Gemini API calls by caching generated scenarios.
// Key format: shadowdrive_<topic_slug>_<difficulty>

import { Scenario } from '@/types/dialogue';

const CACHE_PREFIX = 'shadowdrive_';

/**
 * Build a deterministic cache key from topic + difficulty.
 * Normalizes to lowercase, strips special chars, replaces spaces with underscores.
 */
function buildKey(topic: string, difficulty: string): string {
    const slug = topic
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 60); // Cap key length
    return `${CACHE_PREFIX}${slug}_${difficulty}`;
}

/**
 * Attempt to load a cached scenario from localStorage.
 * Returns null if not found or if parsing fails.
 */
export function getCachedScenario(topic: string, difficulty: string): Scenario | null {
    if (typeof window === 'undefined') return null;

    const key = buildKey(topic, difficulty);
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const parsed: Scenario = JSON.parse(raw);
        // Basic sanity check
        if (parsed.title && Array.isArray(parsed.lines) && parsed.lines.length > 0) {
            console.log(`[Cache] ✅ HIT for "${key}" — ${parsed.lines.length} lines`);
            return parsed;
        }
        return null;
    } catch {
        console.warn(`[Cache] Failed to parse cached scenario for key "${key}"`);
        return null;
    }
}

/**
 * Save a scenario to localStorage for future cache hits.
 */
export function cacheScenario(topic: string, difficulty: string, scenario: Scenario): void {
    if (typeof window === 'undefined') return;

    const key = buildKey(topic, difficulty);
    try {
        localStorage.setItem(key, JSON.stringify(scenario));
        console.log(`[Cache] 💾 Saved scenario to "${key}"`);
    } catch (err) {
        // localStorage might be full — non-fatal
        console.warn(`[Cache] Failed to save scenario: ${err}`);
    }
}

/**
 * Clear all cached ShadowDrive scenarios.
 */
export function clearCache(): void {
    if (typeof window === 'undefined') return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    console.log(`[Cache] 🗑 Cleared ${keysToRemove.length} cached scenarios`);
}
