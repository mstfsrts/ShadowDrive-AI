// ─── ShadowDrive AI — Offline Course Data ───
// Structured courses for Turkish speakers learning Dutch.
// This is the "moat" — hardcoded content that loads instantly,
// no API calls, zero latency. Fill in real sentences later.

import { Scenario } from '@/types/dialogue';

// Import JSON files explicitly to avoid bloating this file.
// The JSON files mock a database response and keep the codebase clean.
import groene_boek_data from '@/data/courses/groene_boek.json';
import tweede_ronde_data from '@/data/courses/tweede_ronde.json';
import derde_ronde_data from '@/data/courses/derde_ronde.json';
import goedbezig_data from '@/data/courses/goedbezig.json';

// ─── Types ───

export interface CourseLesson {
    id: string;
    title: string;
    /** The Scenario object that feeds directly into AudioPlayer */
    scenario: Scenario;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    emoji: string;
    color: string; // Tailwind-compatible accent color class
    lessons: CourseLesson[];
}

// ─── Course Data ───

export const courses: Course[] = [
    groene_boek_data as Course,
    tweede_ronde_data as Course,
    derde_ronde_data as Course,
    goedbezig_data as Course,
];

// ─── Helper Functions ───

/**
 * Get all courses (for the dashboard grid).
 */
export function getAllCourses(): Course[] {
    return courses;
}

/**
 * Get a specific lesson scenario by lesson ID.
 * Returns null if not found.
 */
export function getLessonScenario(lessonId: string): Scenario | null {
    for (const course of courses) {
        const lesson = course.lessons.find((l) => l.id === lessonId);
        if (lesson) return lesson.scenario;
    }
    return null;
}

/**
 * Get a specific course by ID.
 */
export function getCourseById(courseId: string): Course | null {
    return courses.find((c) => c.id === courseId) ?? null;
}
