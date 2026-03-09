import { useState, useEffect } from "react";
import { backendFetch } from "@/lib/backendFetch";
import type { ApiCourse, ProgressData } from "../_types";

export function useCoursesState({ userId, showToast }: { userId?: string; showToast: (msg: string, type?: "success" | "warning") => void }) {
    const [courses, setCourses] = useState<ApiCourse[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [progressMap, setProgressMapHook] = useState<Record<string, ProgressData>>({});

    // ─── EFFECTS: LOAD COURSES FROM DB ───
    useEffect(() => {
        backendFetch("/api/courses")
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data: unknown) => setCourses(Array.isArray(data) ? data : []))
            .catch(() => showToast("Kurslar yüklenemedi", "warning"))
            .finally(() => setCoursesLoading(false));
    }, [showToast]); // Disabled deep dep to prevent render loops

    // ─── EFFECTS: LOAD PROGRESS FROM DB ───
    useEffect(() => {
        if (!userId) return;
        backendFetch("/api/progress", {}, true)
            .then(r => {
                if (!r.ok) return [];
                return r.json();
            })
            .then((data: ProgressData[]) => {
                const map: Record<string, ProgressData> = {};
                data.forEach(p => {
                    map[p.lessonId] = p;
                });
                setProgressMapHook(map);
            })
            .catch(() => {
                /* silent — progress is non-critical */
            });
    }, [userId]);

    return {
        courses,
        coursesLoading,
        progressMap,
        setProgressMap: setProgressMapHook,
    };
}
