// ─── ShadowDrive AI — Resumable Playback (Yapı Taşı) ───
// Single abstraction for "yarıda kalma ve ders tekrarı" across Kurslar, AI, and Metnim.
// New content types only need to extend getResumableId and store logic here.

import type { Scenario } from '@/types/dialogue';

export type ResumableSource = 'course' | 'ai' | 'custom';

export interface ResumableIdParams {
    courseId?: string;
    lessonId?: string;
    topic?: string;
    level?: string;
    savedId?: string;
    scenario?: Scenario;
}

const STORAGE_PREFIX = 'sd_resume_';

/**
 * Stable id for a "lesson" or content item. Used to read/write lastLineIndex.
 * - course: courseId:lessonId (matches Progress table key)
 * - ai: unsaved = topic:level, saved = ai:id
 * - custom: unsaved = hash(scenario), saved = custom:id
 */
export function getResumableId(source: ResumableSource, params: ResumableIdParams): string {
    if (source === 'course' && params.courseId != null && params.lessonId != null) {
        return `course:${params.courseId}:${params.lessonId}`;
    }
    if (source === 'ai') {
        if (params.savedId) return `ai:${params.savedId}`;
        const topic = (params.topic ?? '').replace(/[^a-z0-9]/gi, '_').slice(0, 40);
        const level = params.level ?? 'A0-A1';
        return `ai:unsaved:${topic}:${level}`;
    }
    if (source === 'custom') {
        if (params.savedId) return `custom:${params.savedId}`;
        return `custom:unsaved:${hashScenario(params.scenario)}`;
    }
    return 'unknown';
}

function hashScenario(scenario?: Scenario): string {
    if (!scenario) return 'empty';
    const s = `${scenario.title}:${scenario.lines?.length ?? 0}:${scenario.lines?.[0]?.targetText ?? ''}`;
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36);
}

export interface ProgressDataLike {
    lessonId: string;
    courseId: string;
    lastLineIndex: number;
    completed?: boolean;
    completionCount?: number;
    targetCount?: number;
}

/** Progress for UI badges (Öğrenildi, X/Y, Yarıda). Same shape for course (from API) and ai/custom (localStorage). */
export interface ProgressDisplay {
    lastLineIndex: number;
    completionCount: number;
    targetCount: number;
}

const DEFAULT_TARGET_COUNT = 4;

/**
 * Get full progress for UI badges (Öğrenildi, X/Y, Yarıda).
 * - course: from progressMap (key = lessonId)
 * - ai/custom: from localStorage (completionCount/targetCount stored locally)
 */
export function getStoredProgress(
    resumableId: string,
    progressMap: Record<string, ProgressDataLike> | null | undefined,
    isCourse: boolean
): ProgressDisplay {
    if (isCourse && progressMap) {
        const parts = resumableId.split(':');
        if (parts[0] === 'course' && parts[2]) {
            const data = progressMap[parts[2]];
            if (data) {
                return {
                    lastLineIndex: data.lastLineIndex ?? 0,
                    completionCount: data.completionCount ?? 0,
                    targetCount: data.targetCount ?? DEFAULT_TARGET_COUNT,
                };
            }
        }
        return { lastLineIndex: 0, completionCount: 0, targetCount: DEFAULT_TARGET_COUNT };
    }
    if (typeof window === 'undefined') {
        return { lastLineIndex: 0, completionCount: 0, targetCount: DEFAULT_TARGET_COUNT };
    }
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + resumableId);
        if (!raw) return { lastLineIndex: 0, completionCount: 0, targetCount: DEFAULT_TARGET_COUNT };
        const data = JSON.parse(raw) as { lastLineIndex?: number; completionCount?: number; targetCount?: number };
        return {
            lastLineIndex: typeof data.lastLineIndex === 'number' && data.lastLineIndex > 0 ? data.lastLineIndex : 0,
            completionCount: typeof data.completionCount === 'number' ? data.completionCount : 0,
            targetCount: typeof data.targetCount === 'number' ? data.targetCount : DEFAULT_TARGET_COUNT,
        };
    } catch {
        return { lastLineIndex: 0, completionCount: 0, targetCount: DEFAULT_TARGET_COUNT };
    }
}

/**
 * Get stored lastLineIndex for this resumable id.
 * - course: from progressMap (key = lessonId)
 * - ai/custom: from localStorage
 */
export function getStoredLastLineIndex(
    resumableId: string,
    progressMap: Record<string, ProgressDataLike> | null | undefined,
    isCourse: boolean
): number {
    if (isCourse && progressMap) {
        const parts = resumableId.split(':');
        if (parts[0] === 'course' && parts[2]) {
            const data = progressMap[parts[2]];
            if (data && !data.completed && data.lastLineIndex > 0) return data.lastLineIndex;
        }
        return 0;
    }
    if (typeof window === 'undefined') return 0;
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + resumableId);
        if (!raw) return 0;
        const data = JSON.parse(raw) as { lastLineIndex?: number };
        return typeof data.lastLineIndex === 'number' && data.lastLineIndex > 0 ? data.lastLineIndex : 0;
    } catch {
        return 0;
    }
}

/**
 * Persist lastLineIndex for this resumable id.
 * - course: POST /api/progress and call setProgressMap with returned data
 * - ai/custom: localStorage
 */
export async function setStoredLastLineIndex(
    resumableId: string,
    lastLineIndex: number,
    isCourse: boolean,
    options: {
        session: { user?: { id?: string } } | null;
        courseId?: string;
        lessonId?: string;
        completed?: boolean;
        setProgressMap?: (fn: (prev: Record<string, ProgressDataLike>) => Record<string, ProgressDataLike>) => void;
    }
): Promise<void> {
    if (isCourse && resumableId.startsWith('course:')) {
        const parts = resumableId.split(':');
        const courseId = options.courseId ?? parts[1];
        const lessonId = options.lessonId ?? parts[2];
        if (!options.session?.user?.id || !courseId || !lessonId) return;
        try {
            const res = await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    lessonId,
                    lastLineIndex,
                    completed: options.completed ?? false,
                }),
            });
            if (res.ok && options.setProgressMap) {
                const progress = (await res.json()) as ProgressDataLike;
                options.setProgressMap((prev) => ({ ...prev, [lessonId]: progress }));
            }
        } catch {
            /* non-critical */
        }
        return;
    }
    if (typeof window === 'undefined') return;
    try {
        if (lastLineIndex <= 0) {
            const raw = localStorage.getItem(STORAGE_PREFIX + resumableId);
            const existing = raw ? (JSON.parse(raw) as { completionCount?: number; targetCount?: number }) : {};
            const keep = existing.completionCount != null || existing.targetCount != null;
            if (keep) {
                localStorage.setItem(
                    STORAGE_PREFIX + resumableId,
                    JSON.stringify({ lastLineIndex: 0, ...existing })
                );
            } else {
                localStorage.removeItem(STORAGE_PREFIX + resumableId);
            }
        } else {
            const raw = localStorage.getItem(STORAGE_PREFIX + resumableId);
            const existing = raw ? (JSON.parse(raw) as { completionCount?: number; targetCount?: number }) : {};
            localStorage.setItem(
                STORAGE_PREFIX + resumableId,
                JSON.stringify({ lastLineIndex, ...existing })
            );
        }
    } catch {
        /* non-critical */
    }
}

/**
 * Increment completion count for ai/custom (localStorage). Call when user completes a full run.
 * Resets lastLineIndex to 0. Returns new progress for toast (remaining or mastered).
 */
export function incrementStoredCompletionCount(resumableId: string): ProgressDisplay | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + resumableId);
        const existing = raw ? (JSON.parse(raw) as { completionCount?: number; targetCount?: number }) : {};
        const completionCount = (existing.completionCount ?? 0) + 1;
        const targetCount = existing.targetCount ?? DEFAULT_TARGET_COUNT;
        const next = { lastLineIndex: 0, completionCount, targetCount };
        localStorage.setItem(STORAGE_PREFIX + resumableId, JSON.stringify(next));
        return next;
    } catch {
        return null;
    }
}
