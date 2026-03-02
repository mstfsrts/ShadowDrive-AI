// ─── ShadowDrive AI — Speech Engine Unit Tests ───
// Tests the core waitMs, cancelSpeech, and playScenario phase sequence.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitMs, cancelSpeech, playScenario } from '@/lib/speechEngine';
import type { Scenario } from '@/types/dialogue';

describe('waitMs', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('resolves after the specified duration', async () => {
        const promise = waitMs(1000);
        vi.advanceTimersByTime(1000);
        await expect(promise).resolves.toBeUndefined();
    });

    it('resolves with undefined (no return value)', async () => {
        const promise = waitMs(100);
        vi.advanceTimersByTime(100);
        const result = await promise;
        expect(result).toBeUndefined();
    });

    it('does not resolve before the specified duration', async () => {
        let resolved = false;
        const promise = waitMs(1000).then(() => { resolved = true; });

        vi.advanceTimersByTime(500);
        await Promise.resolve(); // flush microtasks
        expect(resolved).toBe(false);

        vi.advanceTimersByTime(500);
        await promise;
        expect(resolved).toBe(true);
    });

    it('rejects immediately if signal is already aborted', async () => {
        const controller = new AbortController();
        controller.abort();

        await expect(waitMs(1000, controller.signal)).rejects.toThrow('Aborted');
    });

    it('rejects when signal is aborted during wait', async () => {
        const controller = new AbortController();
        const promise = waitMs(5000, controller.signal);

        vi.advanceTimersByTime(100);
        controller.abort();

        await expect(promise).rejects.toThrow('Aborted');
    });

    it('clears timeout when aborted (no leaked timers)', async () => {
        const controller = new AbortController();
        const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

        const promise = waitMs(5000, controller.signal);
        controller.abort();

        try { await promise; } catch { /* expected */ }

        expect(clearTimeoutSpy).toHaveBeenCalled();
        clearTimeoutSpy.mockRestore();
    });
});

describe('cancelSpeech', () => {
    it('calls speechSynthesis.cancel()', () => {
        // speechSynthesis is already mocked in setup.ts
        const cancelFn = window.speechSynthesis.cancel as ReturnType<typeof vi.fn>;
        cancelFn.mockClear();

        cancelSpeech();

        // Should call cancel at least once (may call twice due to iOS 17 workaround)
        expect(cancelFn).toHaveBeenCalled();
    });
});

describe('playScenario', () => {
    const minimalScenario: Scenario = {
        title: 'Test',
        targetLang: 'nl-NL',
        nativeLang: 'tr-TR',
        lines: [
            { id: 1, targetText: 'Hallo', nativeText: 'Merhaba', pauseMultiplier: 1.0 },
        ],
    };

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('yields target phase first with correct structure (phase order: target→pause→native→gap→repeat→pause)', async () => {
        const controller = new AbortController();
        const gen = playScenario(minimalScenario, controller.signal);
        const first = await gen.next();
        controller.abort();

        expect(first.done).toBe(false);
        expect(first.value.phase).toBe('target');
        expect(first.value.text).toBe(minimalScenario.lines[0].targetText);
        expect(first.value.nativeText).toBe(minimalScenario.lines[0].nativeText);
    });

    it('yields correct lineIndex and totalLines on first status', async () => {
        const controller = new AbortController();
        const gen = playScenario(minimalScenario, controller.signal);
        const first = await gen.next();
        controller.abort();

        expect(first.done).toBe(false);
        expect(first.value.lineIndex).toBe(0);
        expect(first.value.totalLines).toBe(1);
        expect(first.value.phase).toBe('target');
    });
});
