// ─── ShadowDrive AI — Scenario Cache Unit Tests ───

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCachedScenario, cacheScenario, clearCache } from '@/lib/scenarioCache';
import { Scenario } from '@/types/dialogue';

const mockScenario: Scenario = {
    title: 'Test Lesson',
    targetLang: 'nl-NL',
    nativeLang: 'tr-TR',
    lines: [
        { id: 1, targetText: 'Hallo', nativeText: 'Merhaba', pauseMultiplier: 1.2 },
        { id: 2, targetText: 'Hoe gaat het?', nativeText: 'Nasılsın?', pauseMultiplier: 1.5 },
    ],
};

describe('scenarioCache', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('returns null for uncached scenario', () => {
        const result = getCachedScenario('nonexistent', 'beginner');
        expect(result).toBeNull();
    });

    it('caches and retrieves a scenario', () => {
        cacheScenario('test topic', 'beginner', mockScenario);
        const cached = getCachedScenario('test topic', 'beginner');

        expect(cached).not.toBeNull();
        expect(cached!.title).toBe('Test Lesson');
        expect(cached!.lines).toHaveLength(2);
    });

    it('normalizes cache keys (case-insensitive, trimmed)', () => {
        cacheScenario('  Test Topic  ', 'beginner', mockScenario);

        // Different casing and spacing should still hit
        const cached = getCachedScenario('test topic', 'beginner');
        expect(cached).not.toBeNull();
    });

    it('returns different results for different difficulties', () => {
        cacheScenario('topic', 'beginner', mockScenario);

        const cached = getCachedScenario('topic', 'intermediate');
        expect(cached).toBeNull();
    });

    it('clearCache removes all shadowdrive entries', () => {
        cacheScenario('a', 'beginner', mockScenario);
        cacheScenario('b', 'intermediate', mockScenario);

        // Add a non-shadowdrive key
        localStorage.setItem('other_key', 'value');

        clearCache();

        expect(getCachedScenario('a', 'beginner')).toBeNull();
        expect(getCachedScenario('b', 'intermediate')).toBeNull();
        expect(localStorage.getItem('other_key')).toBe('value');
    });

    it('cache hit: second getCachedScenario for same topic+difficulty returns data (client can skip API call)', () => {
        // First "request" — no cache yet
        expect(getCachedScenario('Koffie bestellen', 'A0-A1')).toBeNull();

        // Simulate first request having completed and cached the result
        cacheScenario('Koffie bestellen', 'A0-A1', mockScenario);

        // Second "request" with same topic+difficulty — cache hit, client must not call fetch
        const hit1 = getCachedScenario('Koffie bestellen', 'A0-A1');
        const hit2 = getCachedScenario('Koffie bestellen', 'A0-A1');

        expect(hit1).not.toBeNull();
        expect(hit2).not.toBeNull();
        expect(hit1!.title).toBe(mockScenario.title);
        expect(hit2!.lines).toEqual(mockScenario.lines);
    });
});
