import { describe, it, expect, beforeEach } from 'vitest';
import {
    setPlaySession, getPlaySession, clearPlaySession,
    setPreviewSession, getPreviewSession, clearPreviewSession,
    type PlaySession, type PreviewSession,
} from '@/lib/playSession';

const mockScenario = {
    title: 'Test Lesson',
    level: 'A1' as const,
    lines: [
        { targetText: 'Hallo', nativeText: 'Merhaba', speaker: 'A' as const },
        { targetText: 'Goedemorgen', nativeText: 'Günaydın', speaker: 'B' as const },
    ],
};

const mockPlaySession: PlaySession = {
    scenario: mockScenario,
    resumableId: 'course:groene_boek:les_1',
    startFromIndex: 3,
    isCourse: true,
    courseId: 'groene_boek',
    lessonId: 'les_1',
    type: 'course',
    id: 'groene_boek__les_1',
};

const mockPreviewSession: PreviewSession = {
    scenario: mockScenario,
    type: 'course',
    id: 'groene_boek__les_1',
};

describe('playSession', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    describe('PlaySession', () => {
        it('set and get round-trips correctly', () => {
            setPlaySession(mockPlaySession);
            const result = getPlaySession();
            expect(result).toEqual(mockPlaySession);
        });

        it('returns null when empty', () => {
            expect(getPlaySession()).toBeNull();
        });

        it('clears correctly', () => {
            setPlaySession(mockPlaySession);
            clearPlaySession();
            expect(getPlaySession()).toBeNull();
        });

        it('preserves all fields', () => {
            setPlaySession(mockPlaySession);
            const result = getPlaySession()!;
            expect(result.scenario.title).toBe('Test Lesson');
            expect(result.startFromIndex).toBe(3);
            expect(result.isCourse).toBe(true);
            expect(result.courseId).toBe('groene_boek');
            expect(result.lessonId).toBe('les_1');
            expect(result.type).toBe('course');
            expect(result.id).toBe('groene_boek__les_1');
        });
    });

    describe('PreviewSession', () => {
        it('set and get round-trips correctly', () => {
            setPreviewSession(mockPreviewSession);
            const result = getPreviewSession();
            expect(result).toEqual(mockPreviewSession);
        });

        it('returns null when empty', () => {
            expect(getPreviewSession()).toBeNull();
        });

        it('clears correctly', () => {
            setPreviewSession(mockPreviewSession);
            clearPreviewSession();
            expect(getPreviewSession()).toBeNull();
        });
    });

    describe('isolation', () => {
        it('play and preview sessions are independent', () => {
            setPlaySession(mockPlaySession);
            setPreviewSession(mockPreviewSession);

            clearPlaySession();
            expect(getPlaySession()).toBeNull();
            expect(getPreviewSession()).not.toBeNull();

            clearPreviewSession();
            expect(getPreviewSession()).toBeNull();
        });
    });
});
