import { useState, useEffect, useCallback } from "react";
import { backendFetch } from "@/lib/backendFetch";
import { Scenario } from "@/types/dialogue";
import type { SavedCustomLesson } from "../_types";

interface CustomLessonsConfig {
    userId?: string;
    showToast: (msg: string, type?: "success" | "warning") => void;
}

export function useCustomLessonsState({ userId, showToast }: CustomLessonsConfig) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastCustomScenario, setLastCustomScenario] = useState<{ scenario: Scenario; savedId?: string } | null>(null);
    const [savedCustomLessons, setSavedCustomLessons] = useState<SavedCustomLesson[]>([]);

    useEffect(() => {
        if (!userId) return;
        backendFetch("/api/custom-lessons", {}, true)
            .then(r => (r.ok ? r.json() : []))
            .then((data: SavedCustomLesson[]) => setSavedCustomLessons(Array.isArray(data) ? data : []))
            .catch(() => {
                /* silent */
            });
    }, [userId]);

    const saveNewCustomLessonImmediate = useCallback(
        async (scenario: Scenario) => {
            if (!userId) return;
            setIsSaving(true);
            try {
                const res = await backendFetch(
                    "/api/custom-lessons",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: scenario.title || "Kendi Metnim",
                            content: scenario,
                        }),
                    },
                    true,
                );
                if (res.ok) {
                    const saved: SavedCustomLesson = await res.json();
                    setSavedCustomLessons(prev => [saved, ...prev]);
                    setLastCustomScenario(prev => (prev ? { ...prev, savedId: saved.id } : null));
                    showToast("Ders kaydedildi!", "success");
                }
            } catch {
                /* silent */
            } finally {
                setIsSaving(false);
            }
        },
        [userId, showToast],
    );

    const handleCustomSubmit = useCallback(
        (customScenario: Scenario) => {
            showToast("Kendi metniniz yüklendi!", "success");
            setLastCustomScenario({ scenario: customScenario });
            if (userId) void saveNewCustomLessonImmediate(customScenario);
        },
        [userId, showToast, saveNewCustomLessonImmediate],
    );

    const handleDeleteCustomLesson = useCallback(
        async (id: string) => {
            try {
                const res = await backendFetch(`/api/custom-lessons/${id}`, { method: "DELETE" }, true);
                if (res.ok) {
                    setSavedCustomLessons(prev => prev.filter(l => l.id !== id));
                    showToast("Silindi", "success");
                } else {
                    showToast("Silinemedi, tekrar deneyin", "warning");
                }
            } catch {
                showToast("Bağlantı hatası", "warning");
            }
        },
        [showToast],
    );

    const handleRenameCustomLesson = useCallback(
        async (id: string, title: string) => {
            if (!title.trim()) return false;
            try {
                const res = await backendFetch(
                    `/api/custom-lessons/${id}`,
                    {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: title.trim() }),
                    },
                    true,
                );
                if (res.ok) {
                    setSavedCustomLessons(prev => prev.map(l => (l.id === id ? { ...l, title: title.trim() } : l)));
                    return true;
                }
                showToast("Yeniden adlandırılamadı", "warning");
                return false;
            } catch {
                showToast("Bağlantı hatası", "warning");
                return false;
            }
        },
        [showToast],
    );

    return {
        isSaving,
        lastCustomScenario,
        setLastCustomScenario,
        savedCustomLessons,
        handleCustomSubmit,
        handleDeleteCustomLesson,
        handleRenameCustomLesson,
    };
}
