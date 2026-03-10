// ─── ShadowDrive AI — Play Session Storage ───
// Transfers scenario data between pages via sessionStorage.
// Used when navigating to /play/[type]/[id] or /preview.

import type { Scenario } from "@/types/dialogue";

const PLAY_KEY = "sd_play_session";
const PREVIEW_KEY = "sd_preview_session";

export interface PlaySession {
    scenario: Scenario;
    resumableId: string;
    startFromIndex: number;
    isCourse: boolean;
    courseId?: string;
    lessonId?: string;
    /** "course" | "ai" | "custom" */
    type: string;
    /** URL-safe identifier for the play route */
    id: string;
}

export interface PreviewSession {
    scenario: Scenario;
    type: string;
    id: string;
    /** Optional context for "Start" button to create a PlaySession */
    resumableId?: string;
    isCourse?: boolean;
    courseId?: string;
    lessonId?: string;
}

// ─── Play Session ───

export function setPlaySession(session: PlaySession): void {
    try {
        sessionStorage.setItem(PLAY_KEY, JSON.stringify(session));
    } catch {
        // Storage full or unavailable — playback will show fallback
    }
}

export function getPlaySession(): PlaySession | null {
    try {
        const raw = sessionStorage.getItem(PLAY_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as PlaySession;
    } catch {
        return null;
    }
}

export function clearPlaySession(): void {
    try {
        sessionStorage.removeItem(PLAY_KEY);
    } catch {
        // ignore
    }
}

// ─── Preview Session ───

export function setPreviewSession(session: PreviewSession): void {
    try {
        sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(session));
    } catch {
        // ignore
    }
}

export function getPreviewSession(): PreviewSession | null {
    try {
        const raw = sessionStorage.getItem(PREVIEW_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as PreviewSession;
    } catch {
        return null;
    }
}

export function clearPreviewSession(): void {
    try {
        sessionStorage.removeItem(PREVIEW_KEY);
    } catch {
        // ignore
    }
}
