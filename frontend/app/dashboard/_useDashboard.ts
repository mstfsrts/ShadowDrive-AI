"use client";

// ─── ShadowDrive AI — Dashboard Orchestrating Hook (Refactored) ───
// This file is now strictly an Orchestrator. It imports domain-specific hooks
// and bridges their states together to return the final DashboardState bag.

import { useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/Toast";
import { Scenario, type CEFRLevel } from "@/types/dialogue";
import { getResumableId, getStoredLastLineIndex, setStoredLastLineIndex, incrementStoredCompletionCount, type ProgressDataLike } from "@/lib/resumablePlayback";
import { backendFetch } from "@/lib/backendFetch";

// Import Modular Hooks
import { useNavigationState } from "./_hooks/useNavigationState";
import { useCoursesState } from "./_hooks/useCoursesState";
import { useAiLessonsState } from "./_hooks/useAiLessonsState";
import { useCustomLessonsState } from "./_hooks/useCustomLessonsState";

import type { ApiLesson, ApiCourse, ProgressData, SavedAiLesson, SavedCustomLesson, GeneratedLessonState, ActiveTab, ViewState, ResumeState, PlaybackSession } from "./_types";

// ─── Hook Return Type ───
export interface DashboardState {
    session: ReturnType<typeof useSession>["data"];
    toasts: ReturnType<typeof useToast>["toasts"];

    // Navigation (from useNavigationState)
    activeTab: ActiveTab;
    viewState: ViewState;
    selectedCourse: ApiCourse | null;
    selectedCategory: string | null;
    selectedSubcategory: string | null;
    selectedLesson: ApiLesson | null;

    // Courses (from useCoursesState)
    courses: ApiCourse[];
    coursesLoading: boolean;
    progressMap: Record<string, ProgressData>;

    // Scenario / playback
    scenario: Scenario | null;
    startFromIndex: number;
    resumeState: ResumeState | null;

    // AI (from useAiLessonsState)
    isGenerating: boolean;
    isSaving: boolean; // mapped from AI
    lastGeneratedLesson: GeneratedLessonState | null;
    savedAiLessons: SavedAiLesson[];

    // Custom (from useCustomLessonsState)
    lastCustomScenario: { scenario: Scenario; savedId?: string } | null;
    savedCustomLessons: SavedCustomLesson[];

    // CRUD editing (local to orchestrator)
    editingLessonId: string | null;
    editingTitle: string;
    deleteConfirm: { type: "ai" | "custom"; id: string; title: string } | null;

    // Setters
    setActiveTab: (tab: ActiveTab) => void;
    setResumeState: (state: ResumeState | null) => void;
    setEditingTitle: (title: string) => void;
    setDeleteConfirm: (confirm: { type: "ai" | "custom"; id: string; title: string } | null) => void;
    setLastGeneratedLesson: (lesson: GeneratedLessonState | null) => void;
    setLastCustomScenario: (scenario: { scenario: Scenario; savedId?: string } | null) => void;

    // Handlers
    handleCategoryClick: (category: string) => void;
    handleSubcategoryClick: (subcategory: string) => void;
    handleCourseClick: (courseId: string) => void;
    handleLessonClick: (lesson: ApiLesson) => void;
    handleGenerate: (topic: string, difficulty: CEFRLevel) => Promise<void>;
    handleResume: () => void;
    handleRestartLesson: () => Promise<void>;
    handlePreviewClick: (lesson: ApiLesson) => void;
    handleStartFromPreview: () => void;
    handleBackFromPreview: () => void;
    handlePreviewScenario: (sc: Scenario) => void;
    handlePlayScenario: (sc: Scenario, context?: { resumableId: string }) => void;
    handlePlayAiScenario: (sc: Scenario, options: { topic: string; level: string; savedId?: string }) => void;
    handlePlayCustomScenario: (sc: Scenario, options?: { savedId?: string }) => void;
    handleComplete: () => Promise<void>;
    handleBack: (lastLineIndex: number) => Promise<void>;
    handleDeleteAiLesson: (id: string) => Promise<void>;
    handleDeleteCustomLesson: (id: string) => Promise<void>;
    handleEditStart: (id: string, currentTitle: string) => void;
    handleEditCancel: () => void;
    handleRenameAiLesson: (id: string, title: string) => Promise<void>;
    handleRenameCustomLesson: (id: string, title: string) => Promise<void>;
    handleCustomSubmit: (scenario: Scenario) => void;
    handleBackFromCourseDetail: () => void;
    handleBackFromSubcategory: () => void;
    handleBackFromCategory: () => void;
    handleBackToDashboard: () => void;
}

export function useDashboard(): DashboardState {
    const { data: session } = useSession();
    const { toasts, showToast } = useToast();
    const userId = session?.user?.id;

    // ─── LOCAL STATE (UI specifics) ───
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: "ai" | "custom"; id: string; title: string } | null>(null);

    // ─── REFS ───
    const playbackSessionRef = useRef<PlaybackSession | null>(null);

    // ─── MODULAR HOOKS INITIALIZATION ───
    const navigationConfig = useNavigationState();

    const coursesConfig = useCoursesState({
        userId,
        showToast,
    });

    const aiConfig = useAiLessonsState({
        userId,
        showToast,
        setScenario: navigationConfig.setScenario,
        setViewState: navigationConfig.setViewState,
        playbackSessionRef,
    });

    const customConfig = useCustomLessonsState({
        userId,
        showToast,
    });

    // ─── DESTRUCTURE STATE VARIABLES ───
    const {
        activeTab,
        viewState,
        selectedCourse,
        selectedCategory,
        selectedSubcategory,
        selectedLesson,
        scenario,
        startFromIndex,
        resumeState,
        setActiveTab,
        setViewState,
        setSelectedCourse,
        setSelectedLesson,
        setScenario,
        setStartFromIndex,
        setResumeState,
        handleCategoryClick: navHandleCategoryClick,
        handleCourseClick: navHandleCourseClick,
        handleBackFromSubcategory: navHandleBackFromSubcategory,
    } = navigationConfig;

    const { courses, coursesLoading, progressMap, setProgressMap } = coursesConfig;

    const {
        isGenerating,
        isSaving: isAiSaving,
        lastGeneratedLesson,
        savedAiLessons,
        setLastGeneratedLesson,
        handleGenerate,
        handleDeleteAiLesson: aiHandleDelete,
        handleRenameAiLesson: aiHandleRename,
    } = aiConfig;

    const {
        isSaving: isCustomSaving,
        lastCustomScenario,
        savedCustomLessons,
        setLastCustomScenario,
        handleCustomSubmit,
        handleDeleteCustomLesson: customHandleDelete,
        handleRenameCustomLesson: customHandleRename,
    } = customConfig;

    // ─── ORCHESTRATOR HANDLERS (Bridging Navigation + Data) ───

    const handleCategoryClick = useCallback(
        (category: string) => {
            navHandleCategoryClick(category, courses);
        },
        [navHandleCategoryClick, courses],
    );

    const handleCourseClick = useCallback(
        (courseId: string) => {
            navHandleCourseClick(courseId, courses);
        },
        [navHandleCourseClick, courses],
    );

    const handleBackFromSubcategory = useCallback(() => {
        navHandleBackFromSubcategory(courses);
    }, [navHandleBackFromSubcategory, courses]);

    const handleLessonClick = useCallback(
        (lesson: ApiLesson) => {
            if (!selectedCourse) return;
            const resumableId = getResumableId("course", { courseId: selectedCourse.id, lessonId: lesson.id });
            const lastLineIndex = getStoredLastLineIndex(resumableId, progressMap, true);

            if (lastLineIndex > 0) {
                setResumeState({
                    resumableId,
                    title: lesson.title,
                    lastLineIndex,
                    scenario: lesson.content,
                    isCourse: true,
                    lesson,
                    course: selectedCourse,
                });
                return;
            }

            showToast("Ders yüklendi!", "success");
            setSelectedLesson(lesson);
            setStartFromIndex(0);
            setScenario(lesson.content);
            playbackSessionRef.current = { resumableId, isCourse: true, courseId: selectedCourse.id, lessonId: lesson.id };
            setViewState("playback");
        },
        [progressMap, selectedCourse, showToast, setSelectedLesson, setStartFromIndex, setScenario, setViewState, setResumeState],
    );

    const handleResume = useCallback(() => {
        if (!resumeState) return;
        const { scenario: sc, lastLineIndex: idx, isCourse, lesson, course, resumableId } = resumeState;
        setScenario(sc);
        setStartFromIndex(idx);
        if (lesson) setSelectedLesson(lesson);
        if (course) setSelectedCourse(course);
        playbackSessionRef.current = { resumableId, isCourse, courseId: course?.id, lessonId: lesson?.id };
        setResumeState(null);
        showToast("Kaldığın yerden devam ediliyor", "success");
        setViewState("playback");
    }, [resumeState, setScenario, setStartFromIndex, setSelectedLesson, setSelectedCourse, setResumeState, showToast, setViewState]);

    const handleRestartLesson = useCallback(async () => {
        if (!resumeState) return;
        const { scenario: sc, resumableId, isCourse, lesson, course } = resumeState;
        await setStoredLastLineIndex(resumableId, 0, isCourse, {
            session,
            courseId: course?.id,
            lessonId: lesson?.id,
            setProgressMap: setProgressMap as (fn: (prev: Record<string, ProgressDataLike>) => Record<string, ProgressDataLike>) => void,
        });
        setScenario(sc);
        setStartFromIndex(0);
        if (lesson) setSelectedLesson(lesson);
        if (course) setSelectedCourse(course);
        playbackSessionRef.current = { resumableId, isCourse, courseId: course?.id, lessonId: lesson?.id };
        setResumeState(null);
        showToast("Ders baştan başlıyor", "success");
        setViewState("playback");
    }, [resumeState, session, setProgressMap, setScenario, setStartFromIndex, setSelectedLesson, setSelectedCourse, setResumeState, showToast, setViewState]);

    const handlePreviewClick = useCallback(
        (lesson: ApiLesson) => {
            setSelectedLesson(lesson);
            setScenario(lesson.content);
            setViewState("preview");
        },
        [setSelectedLesson, setScenario, setViewState],
    );

    const handleStartFromPreview = useCallback(() => {
        if (selectedCourse && selectedLesson) {
            playbackSessionRef.current = {
                resumableId: getResumableId("course", { courseId: selectedCourse.id, lessonId: selectedLesson.id }),
                isCourse: true,
                courseId: selectedCourse.id,
                lessonId: selectedLesson.id,
            };
        } else {
            playbackSessionRef.current = null;
        }
        setStartFromIndex(0);
        setViewState("playback");
    }, [selectedCourse, selectedLesson, setStartFromIndex, setViewState]);

    const handleBackFromPreview = useCallback(() => {
        setScenario(null);
        setSelectedLesson(null);
        setViewState(selectedCourse ? "course-detail" : "dashboard");
    }, [selectedCourse, setScenario, setSelectedLesson, setViewState]);

    const handlePlayScenario = useCallback(
        (sc: Scenario, playbackContext?: { resumableId: string }) => {
            setSelectedLesson(null);
            setSelectedCourse(null);
            setStartFromIndex(0);
            setScenario(sc);
            playbackSessionRef.current = playbackContext ? { resumableId: playbackContext.resumableId, isCourse: false } : null;
            setViewState("playback");
        },
        [setSelectedLesson, setSelectedCourse, setStartFromIndex, setScenario, setViewState],
    );

    const handlePlayAiScenario = useCallback(
        (sc: Scenario, options: { topic: string; level: string; savedId?: string }) => {
            const resumableId = getResumableId("ai", { topic: options.topic, level: options.level, savedId: options.savedId });
            const lastLineIndex = getStoredLastLineIndex(resumableId, null, false);
            if (lastLineIndex > 0) {
                setResumeState({ resumableId, title: sc.title, lastLineIndex, scenario: sc, isCourse: false });
                return;
            }
            handlePlayScenario(sc, { resumableId });
        },
        [handlePlayScenario, setResumeState],
    );

    const handlePlayCustomScenario = useCallback(
        (sc: Scenario, options: { savedId?: string } = {}) => {
            const resumableId = getResumableId("custom", { scenario: sc, savedId: options.savedId });
            const lastLineIndex = getStoredLastLineIndex(resumableId, null, false);
            if (lastLineIndex > 0) {
                setResumeState({ resumableId, title: sc.title, lastLineIndex, scenario: sc, isCourse: false });
                return;
            }
            handlePlayScenario(sc, { resumableId });
        },
        [handlePlayScenario, setResumeState],
    );

    const handlePreviewScenario = useCallback(
        (sc: Scenario) => {
            setSelectedLesson(null);
            setSelectedCourse(null);
            setScenario(sc);
            setViewState("preview");
        },
        [setSelectedLesson, setSelectedCourse, setScenario, setViewState],
    );

    const handleComplete = useCallback(async () => {
        if (userId && selectedCourse && selectedLesson) {
            try {
                const res = await backendFetch(
                    "/api/progress",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            courseId: selectedCourse.id,
                            lessonId: selectedLesson.id,
                            lastLineIndex: -1,
                            completed: true,
                        }),
                    },
                    true,
                );
                if (!res.ok) return;
                const progress: ProgressData = await res.json();
                setProgressMap(prev => ({ ...prev, [selectedLesson.id]: progress }));
                const remaining = progress.targetCount - progress.completionCount;
                showToast(remaining > 0 ? `Tekrar: ${remaining} seans kaldı` : "Bu ders tam öğrenildi!", "success");
            } catch {
                /* silent */
            }
            return;
        }

        const sessionRef = playbackSessionRef.current;
        if (sessionRef && !sessionRef.isCourse) {
            const next = incrementStoredCompletionCount(sessionRef.resumableId);
            if (next) {
                const remaining = next.targetCount - next.completionCount;
                showToast(remaining > 0 ? `Tekrar: ${remaining} seans kaldı` : "Bu ders tam öğrenildi!", "success");
            }
        }
    }, [userId, selectedCourse, selectedLesson, showToast, setProgressMap]);

    const handleBack = useCallback(
        async (lastLineIndex: number) => {
            const sessionRef = playbackSessionRef.current;
            if (sessionRef) {
                await setStoredLastLineIndex(sessionRef.resumableId, lastLineIndex, sessionRef.isCourse, {
                    session,
                    courseId: sessionRef.courseId,
                    lessonId: sessionRef.lessonId,
                    setProgressMap: setProgressMap as (fn: (prev: Record<string, ProgressDataLike>) => Record<string, ProgressDataLike>) => void,
                });
                playbackSessionRef.current = null;
            }
            setScenario(null);
            setSelectedLesson(null);
            setStartFromIndex(0);
            setViewState(selectedCourse ? "course-detail" : "dashboard");
        },
        [session, selectedCourse, setProgressMap, setScenario, setSelectedLesson, setStartFromIndex, setViewState],
    );

    const handleEditStart = useCallback((id: string, currentTitle: string) => {
        setEditingLessonId(id);
        setEditingTitle(currentTitle);
    }, []);

    const handleEditCancel = useCallback(() => {
        setEditingLessonId(null);
        setEditingTitle("");
    }, []);

    const handleRenameAiLesson = useCallback(
        async (id: string, title: string) => {
            const success = await aiHandleRename(id, title);
            if (success) {
                setEditingLessonId(null);
                setEditingTitle("");
            }
        },
        [aiHandleRename],
    );

    const handleRenameCustomLesson = useCallback(
        async (id: string, title: string) => {
            const success = await customHandleRename(id, title);
            if (success) {
                setEditingLessonId(null);
                setEditingTitle("");
            }
        },
        [customHandleRename],
    );

    return {
        session,
        toasts,
        activeTab,
        setActiveTab,
        viewState,
        selectedCourse,
        selectedCategory,
        selectedSubcategory,
        selectedLesson,
        courses,
        coursesLoading,
        progressMap,
        scenario,
        startFromIndex,
        resumeState,
        isGenerating,
        isSaving: isAiSaving || isCustomSaving,
        lastGeneratedLesson,
        savedAiLessons,
        lastCustomScenario,
        savedCustomLessons,
        editingLessonId,
        editingTitle,
        deleteConfirm,
        setResumeState,
        setEditingTitle,
        setDeleteConfirm,
        setLastGeneratedLesson,
        setLastCustomScenario,
        handleCategoryClick,
        handleSubcategoryClick: navigationConfig.handleSubcategoryClick,
        handleCourseClick,
        handleLessonClick,
        handleGenerate,
        handleResume,
        handleRestartLesson,
        handlePreviewClick,
        handleStartFromPreview,
        handleBackFromPreview,
        handlePreviewScenario,
        handlePlayScenario,
        handlePlayAiScenario,
        handlePlayCustomScenario,
        handleComplete,
        handleBack,
        handleDeleteAiLesson: aiHandleDelete,
        handleDeleteCustomLesson: customHandleDelete,
        handleEditStart,
        handleEditCancel,
        handleRenameAiLesson,
        handleRenameCustomLesson,
        handleCustomSubmit,
        handleBackFromCourseDetail: navigationConfig.handleBackFromCourseDetail,
        handleBackFromSubcategory,
        handleBackFromCategory: navigationConfig.handleBackFromCategory,
        handleBackToDashboard: navigationConfig.resetNavigationToDashboard,
    };
}
