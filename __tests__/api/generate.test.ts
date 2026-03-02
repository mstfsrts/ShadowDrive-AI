// ─── ShadowDrive AI — API Generate Route Tests ───
// POST /api/generate: valid scenario JSON, validation, timeout behavior

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const validScenarioJson = JSON.stringify({
    title: 'Koffie bestellen',
    targetLang: 'nl-NL',
    nativeLang: 'tr-TR',
    lines: [
        { id: 1, targetText: 'Goedemiddag, mag ik een koffie?', nativeText: 'İyi günler, bir kahve alabilir miyim?', pauseMultiplier: 1.0 },
        { id: 2, targetText: 'Natuurlijk, met melk of zonder?', nativeText: 'Tabii, sütlü mü sade mi?', pauseMultiplier: 1.2 },
        { id: 3, targetText: 'Met melk, alstublieft.', nativeText: 'Sütlü lütfen.', pauseMultiplier: 1.0 },
        { id: 4, targetText: 'Dat is twee euro vijftig.', nativeText: 'İki euro elli.', pauseMultiplier: 1.0 },
    ],
});

vi.mock('@/lib/openrouter', () => ({
    isOpenRouterConfigured: vi.fn(() => false),
    generateWithOpenRouter: vi.fn(),
}));

vi.mock('@/lib/gemini', () => ({
    generateWithFallback: vi.fn(),
}));

describe('POST /api/generate', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        const { isOpenRouterConfigured } = await import('@/lib/openrouter');
        vi.mocked(isOpenRouterConfigured).mockReturnValue(false);
        const { generateWithFallback } = await import('@/lib/gemini');
        vi.mocked(generateWithFallback).mockResolvedValue(validScenarioJson);
    });

    it('returns 200 and valid scenario JSON for valid request', async () => {
        const { POST } = await import('@/app/api/generate/route');
        const req = new NextRequest('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: 'Koffie bestellen', difficulty: 'A0-A1' }),
        });

        const res = await POST(req);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.title).toBeDefined();
        expect(data.title).toBe('Koffie bestellen');
        expect(data.targetLang).toBe('nl-NL');
        expect(data.nativeLang).toBe('tr-TR');
        expect(Array.isArray(data.lines)).toBe(true);
        expect(data.lines.length).toBeGreaterThanOrEqual(4);
        expect(data.lines.length).toBeLessThanOrEqual(15);
        data.lines.forEach((line: { id: number; targetText: string; nativeText: string; pauseMultiplier: number }) => {
            expect(typeof line.id).toBe('number');
            expect(typeof line.targetText).toBe('string');
            expect(typeof line.nativeText).toBe('string');
            expect(line.pauseMultiplier).toBeGreaterThanOrEqual(0.5);
            expect(line.pauseMultiplier).toBeLessThanOrEqual(3);
        });
    });

    it('returns 400 for invalid request body (missing topic)', async () => {
        const { POST } = await import('@/app/api/generate/route');
        const req = new NextRequest('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ difficulty: 'A0-A1' }),
        });

        const res = await POST(req);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBeDefined();
    });

    it('returns 400 for invalid difficulty', async () => {
        const { POST } = await import('@/app/api/generate/route');
        const req = new NextRequest('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: 'Koffie', difficulty: 'beginner' }),
        });

        const res = await POST(req);

        expect(res.status).toBe(400);
    });

    it('returns 502 when AI returns invalid JSON', async () => {
        const { generateWithFallback } = await import('@/lib/gemini');
        vi.mocked(generateWithFallback).mockResolvedValue('not valid json {');

        const { POST } = await import('@/app/api/generate/route');
        const req = new NextRequest('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: 'Test', difficulty: 'A0-A1' }),
        });

        const res = await POST(req);

        expect(res.status).toBe(502);
        const data = await res.json();
        expect(data.error).toContain('invalid JSON');
    });

    it('returns 422 when AI response does not match schema (too few lines)', async () => {
        const { generateWithFallback } = await import('@/lib/gemini');
        vi.mocked(generateWithFallback).mockResolvedValue(
            JSON.stringify({
                title: 'Test',
                targetLang: 'nl-NL',
                nativeLang: 'tr-TR',
                lines: [{ id: 1, targetText: 'Een', nativeText: 'Bir', pauseMultiplier: 1 }],
            })
        );

        const { POST } = await import('@/app/api/generate/route');
        const req = new NextRequest('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: 'Test', difficulty: 'A0-A1' }),
        });

        const res = await POST(req);

        expect(res.status).toBe(422);
        const data = await res.json();
        expect(data.error).toBeDefined();
    });

    it('strips markdown code fences from AI response', async () => {
        const { generateWithFallback } = await import('@/lib/gemini');
        vi.mocked(generateWithFallback).mockResolvedValue('```json\n' + validScenarioJson + '\n```');

        const { POST } = await import('@/app/api/generate/route');
        const req = new NextRequest('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: 'Koffie bestellen', difficulty: 'A0-A1' }),
        });

        const res = await POST(req);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.title).toBe('Koffie bestellen');
    });

    it('returns 500 when all AI providers throw', async () => {
        const { generateWithFallback } = await import('@/lib/gemini');
        vi.mocked(generateWithFallback).mockRejectedValue(new Error('API unavailable'));

        const { POST } = await import('@/app/api/generate/route');
        const req = new NextRequest('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: 'Test', difficulty: 'A0-A1' }),
        });

        const res = await POST(req);

        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.error).toBeDefined();
    });
});
