import { useState, useEffect, useCallback, useRef } from "react";
import { backendFetch } from "@/lib/backendFetch";
import { Scenario, type CEFRLevel } from "@/types/dialogue";
import { getCachedScenario, cacheScenario } from "@/lib/scenarioCache";
import { getOfflineScenario } from "@/lib/offlineScenarios";
import type { SavedAiLesson, GeneratedLessonState } from "../_types";

interface AiLessonsConfig {
    userId?: string;
    showToast: (msg: string, type?: "success" | "warning") => void;
    onOfflineFallback?: (scenario: Scenario, topic: string, level: CEFRLevel) => void;
}

export function useAiLessonsState({ userId, showToast, onOfflineFallback }: AiLessonsConfig) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastGeneratedLesson, setLastGeneratedLesson] = useState<GeneratedLessonState | null>(null);
    const [savedAiLessons, setSavedAiLessons] = useState<SavedAiLesson[]>([]);

    const isFetchingRef = useRef(false);

    // ─── EFFECTS: LOAD SAVED LESSONS FROM DB ───
    useEffect(() => {
        if (!userId) return;
        (async () => {
            try {
                const r = await backendFetch("/api/ai-lessons", {}, true);
                if (!r.ok) return;
                const data = await r.json();
                setSavedAiLessons(Array.isArray(data) ? data : []);
            } catch {
                // silent
            }
        })();
    }, [userId]);

    const saveNewAiLessonImmediate = useCallback(
        async (payload: { scenario: Scenario; topic: string; level: CEFRLevel }) => {
            if (!userId) return;
            setIsSaving(true);
            try {
                const res = await backendFetch(
                    "/api/ai-lessons",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            topic: payload.topic,
                            title: payload.scenario.title,
                            level: payload.level,
                            content: payload.scenario,
                        }),
                    },
                    true,
                );
                if (res.ok) {
                    const saved: SavedAiLesson = await res.json();
                    setSavedAiLessons(prev => [saved, ...prev]);
                    setLastGeneratedLesson(prev => (prev ? { ...prev, savedId: saved.id } : null));
                    showToast("Senaryo kaydedildi!", "success");
                } else {
                    showToast("Ders kaydedilemedi", "warning");
                }
            } catch {
                showToast("Ders kaydedilemedi", "warning");
            } finally {
                setIsSaving(false);
            }
        },
        [userId, showToast],
    );

    const handleGenerate = useCallback(
        async (topic: string, difficulty: CEFRLevel) => {
            if (isFetchingRef.current) return;
            isFetchingRef.current = true;
            setIsGenerating(true);

            const cached = getCachedScenario(topic, difficulty);
            if (cached) {
                showToast("Önbellekten yüklendi — Anında!", "success");
                setLastGeneratedLesson({ scenario: cached, topic, level: difficulty });
                if (userId) void saveNewAiLessonImmediate({ scenario: cached, topic, level: difficulty });
                setIsGenerating(false);
                isFetchingRef.current = false;
                return;
            }

            try {
                const response = await backendFetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ topic, difficulty }),
                });

                if (!response.ok) {
                    throw new Error(`Status ${response.status}`);
                }

                const data: Scenario = await response.json();
                cacheScenario(topic, difficulty, data);
                showToast("Yeni ders oluşturuldu!", "success");
                setLastGeneratedLesson({ scenario: data, topic, level: difficulty });
                if (userId) void saveNewAiLessonImmediate({ scenario: data, topic, level: difficulty });
            } catch {
                showToast("Bağlantı sorunu — çevrimdışı ders yükleniyor", "warning");
                const offline = getOfflineScenario(topic);
                onOfflineFallback?.(offline, topic, difficulty);
            } finally {
                setIsGenerating(false);
                isFetchingRef.current = false;
            }
        },
        [userId, showToast, saveNewAiLessonImmediate, onOfflineFallback],
    );

    const handleDeleteAiLesson = useCallback(
        async (id: string) => {
            try {
                const res = await backendFetch(`/api/ai-lessons/${id}`, { method: "DELETE" }, true);
                if (res.ok) {
                    setSavedAiLessons(prev => prev.filter(l => l.id !== id));
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

    const handleRenameAiLesson = useCallback(
        async (id: string, title: string) => {
            if (!title.trim()) return false;
            try {
                const res = await backendFetch(
                    `/api/ai-lessons/${id}`,
                    {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: title.trim() }),
                    },
                    true,
                );
                if (res.ok) {
                    setSavedAiLessons(prev => prev.map(l => (l.id === id ? { ...l, title: title.trim() } : l)));
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
        isGenerating,
        isSaving,
        lastGeneratedLesson,
        setLastGeneratedLesson,
        savedAiLessons,
        handleGenerate,
        handleDeleteAiLesson,
        handleRenameAiLesson,
    };
}
