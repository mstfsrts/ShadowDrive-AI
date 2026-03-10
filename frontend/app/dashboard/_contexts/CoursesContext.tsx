'use client';

// ─── ShadowDrive AI — Courses Context ───
// Wraps useCoursesState into a React Context so all dashboard pages
// (courses tab, category, subcategory, course-detail) share the same
// courses + progress data without re-fetching.

import { createContext, useContext, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useCoursesState } from '../_hooks/useCoursesState';
import { useToastContext } from './ToastContext';
import type { ApiCourse, ProgressData } from '../_types';

interface CoursesContextValue {
    courses: ApiCourse[];
    coursesLoading: boolean;
    progressMap: Record<string, ProgressData>;
    setProgressMap: (fn: (prev: Record<string, ProgressData>) => Record<string, ProgressData>) => void;
}

const CoursesCtx = createContext<CoursesContextValue | null>(null);

export function CoursesProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const { showToast } = useToastContext();
    const userId = session?.user?.id;

    const { courses, coursesLoading, progressMap, setProgressMap } = useCoursesState({
        userId,
        showToast,
    });

    return (
        <CoursesCtx.Provider value={{ courses, coursesLoading, progressMap, setProgressMap }}>
            {children}
        </CoursesCtx.Provider>
    );
}

export function useCoursesContext(): CoursesContextValue {
    const ctx = useContext(CoursesCtx);
    if (!ctx) throw new Error('useCoursesContext must be used within <CoursesProvider>');
    return ctx;
}
