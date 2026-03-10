// ─── ShadowDrive AI — Dashboard Types ───

import type { Scenario, CEFRLevel } from '@/types/dialogue';

export interface ApiLesson {
    id: string;
    title: string;
    order: number;
    content: Scenario;
}

export interface ApiCourse {
    id: string;
    title: string;
    description: string;
    emoji: string;
    color: string;
    order: number;
    category: string;
    subcategory: string | null;
    lessons: ApiLesson[];
}

export interface ProgressData {
    lessonId: string;
    courseId: string;
    completionCount: number;
    targetCount: number;
    completed: boolean;
    lastLineIndex: number;
}

export interface SavedAiLesson {
    id: string;
    title: string | null;
    topic: string;
    level: string;
    content: Scenario;
    createdAt: string;
}

export interface SavedCustomLesson {
    id: string;
    title: string;
    content: Scenario;
    createdAt: string;
}

export interface GeneratedLessonState {
    scenario: Scenario;
    topic: string;
    level: CEFRLevel;
    savedId?: string;
}

export interface ResumeState {
    resumableId: string;
    title: string;
    lastLineIndex: number;
    scenario: Scenario;
    isCourse: boolean;
    lesson?: ApiLesson;
    course?: ApiCourse;
}

