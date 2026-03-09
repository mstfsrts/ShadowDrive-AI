// ─── ShadowDrive AI — Offline Scenarios Unit Tests ───

import { describe, it, expect } from 'vitest';
import { getOfflineScenario } from '@/lib/offlineScenarios';

describe('getOfflineScenario', () => {
    it('returns a scenario without topic (random)', () => {
        const scenario = getOfflineScenario();
        expect(scenario).toBeDefined();
        expect(scenario.title).toBeTruthy();
        expect(scenario.lines.length).toBeGreaterThanOrEqual(4);
        expect(scenario.targetLang).toBe('nl-NL');
        expect(scenario.nativeLang).toBe('tr-TR');
    });

    it('title includes (Çevrimdışı) suffix', () => {
        const scenario = getOfflineScenario();
        expect(scenario.title).toContain('Çevrimdışı');
    });

    it('returns scenario with valid dialogue lines', () => {
        const scenario = getOfflineScenario();
        for (const line of scenario.lines) {
            expect(line.id).toBeGreaterThan(0);
            expect(line.targetText).toBeTruthy();
            expect(line.nativeText).toBeTruthy();
            expect(line.pauseMultiplier).toBeGreaterThanOrEqual(1.0);
            expect(line.pauseMultiplier).toBeLessThanOrEqual(2.5);
        }
    });

    it('returns different scenarios on multiple calls (randomness)', () => {
        const titles = new Set<string>();
        // Call 20 times — with 5 scenarios, we should see at least 2 different ones
        for (let i = 0; i < 20; i++) {
            titles.add(getOfflineScenario().title);
        }
        expect(titles.size).toBeGreaterThanOrEqual(2);
    });
});
