'use client';

// ─── ShadowDrive AI — Dashboard Orchestrating Hook ───
// Owns all state (19 useState), 2 refs, 3 effects, all handlers.
// Returns DashboardState bag-of-props to page.tsx.

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { Scenario, type CEFRLevel } from '@/types/dialogue';
import { getCachedScenario, cacheScenario } from '@/lib/scenarioCache';
import { getOfflineScenario } from '@/lib/offlineScenarios';
import {
    getResumableId, getStoredLastLineIndex, setStoredLastLineIndex,
    incrementStoredCompletionCount, type ProgressDataLike,
} from '@/lib/resumablePlayback';
import type {
    ApiLesson, ApiCourse, ProgressData, SavedAiLesson, SavedCustomLesson,
    GeneratedLessonState, ActiveTab, ViewState, ResumeState, PlaybackSession,
} from './_types';

// ─── Hook Return Type ───
export interface DashboardState {
    // Session + Toasts
    session: ReturnType<typeof useSession>['data'];
    toasts: ReturnType<typeof useToast>['toasts'];
    // Navigation
    activeTab: ActiveTab;
    viewState: ViewState;
    selectedCourse: ApiCourse | null;
    selectedCategory: string | null;
    selectedSubcategory: string | null;
    selectedLesson: ApiLesson | null;
    // Courses
    courses: ApiCourse[];
    coursesLoading: boolean;
    progressMap: Record<string, ProgressData>;
    // Scenario / playback
    scenario: Scenario | null;
    startFromIndex: number;
    resumeState: ResumeState | null;
    // AI
    isGenerating: boolean;
    isSaving: boolean;
    lastGeneratedLesson: GeneratedLessonState | null;
    savedAiLessons: SavedAiLesson[];
    // Custom
    lastCustomScenario: { scenario: Scenario; savedId?: string } | null;
    savedCustomLessons: SavedCustomLesson[];
    // CRUD editing
    editingLessonId: string | null;
    editingTitle: string;
    deleteConfirm: { type: 'ai' | 'custom'; id: string; title: string } | null;
    // Setters exposed for tab inline mutations
    setActiveTab: (tab: ActiveTab) => void;
    setResumeState: (state: ResumeState | null) => void;
    setEditingTitle: (title: string) => void;
    setDeleteConfirm: (confirm: { type: 'ai' | 'custom'; id: string; title: string } | null) => void;
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
    // ─── SESSION & TOASTS ───
    const { data: session } = useSession();
    const { toasts, showToast } = useToast();

    // ─── NAVIGATION STATE ───
    const [activeTab, setActiveTab] = useState<ActiveTab>('courses');
    const [viewState, setViewState] = useState<ViewState>('dashboard');
    const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<ApiLesson | null>(null);

    // ─── COURSE & PROGRESS STATE ───
    const [courses, setCourses] = useState<ApiCourse[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [progressMap, setProgressMap] = useState<Record<string, ProgressData>>({});

    // ─── PLAYBACK STATE ───
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [startFromIndex, setStartFromIndex] = useState(0);
    const [resumeState, setResumeState] = useState<ResumeState | null>(null);

    // ─── AI GENERATION STATE ───
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastGeneratedLesson, setLastGeneratedLesson] = useState<GeneratedLessonState | null>(null);
    const [savedAiLessons, setSavedAiLessons] = useState<SavedAiLesson[]>([]);

    // ─── CUSTOM LESSON STATE ───
    const [lastCustomScenario, setLastCustomScenario] = useState<{ scenario: Scenario; savedId?: string } | null>(null);
    const [savedCustomLessons, setSavedCustomLessons] = useState<SavedCustomLesson[]>([]);

    // ─── CRUD EDITING STATE ───
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'ai' | 'custom'; id: string; title: string } | null>(null);

    // ─── REFS ───
    const playbackSessionRef = useRef<PlaybackSession | null>(null);
    const isFetchingRef = useRef(false);

    // ─── EFFECTS: LOAD COURSES FROM DB ───
    useEffect(() => {
        fetch('/api/courses')
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data: unknown) => setCourses(Array.isArray(data) ? data : []))
            .catch(() => showToast('Kurslar yüklenemedi', 'warning'))
            .finally(() => setCoursesLoading(false));
    }, [showToast]);

    // ─── EFFECTS: LOAD PROGRESS FROM DB ───
    useEffect(() => {
        if (!session?.user?.id) return;
        fetch('/api/progress')
            .then((r) => {
                if (!r.ok) return [];
                return r.json();
            })
            .then((data: ProgressData[]) => {
                const map: Record<string, ProgressData> = {};
                data.forEach((p) => { map[p.lessonId] = p; });
                setProgressMap(map);
            })
            .catch(() => { /* silent — progress is non-critical */ });
    }, [session]);

    // ─── EFFECTS: LOAD SAVED LESSONS FROM DB ───
    useEffect(() => {
        if (!session?.user?.id) return;
        fetch('/api/ai-lessons')
            .then((r) => r.ok ? r.json() : [])
            .then((data: SavedAiLesson[]) => setSavedAiLessons(Array.isArray(data) ? data : []))
            .catch(() => { /* silent */ });
        fetch('/api/custom-lessons')
            .then((r) => r.ok ? r.json() : [])
            .then((data: SavedCustomLesson[]) => setSavedCustomLessons(Array.isArray(data) ? data : []))
            .catch(() => { /* silent */ });
    }, [session]);

    // ─── HANDLER: Course Navigation ───
    const handleCategoryClick = useCallback((category: string) => {
        setSelectedCategory(category);
        const categoryCourses = courses.filter((c) => c.category === category);
        const hasSubcategories = categoryCourses.some((c) => c.subcategory !== null);
        if (hasSubcategories) {
            setViewState('category');
        } else {
            setViewState('subcategory');
        }
    }, [courses]);

    const handleSubcategoryClick = useCallback((subcategory: string) => {
        setSelectedSubcategory(subcategory);
        setViewState('subcategory');
    }, []);

    const handleCourseClick = useCallback((courseId: string) => {
        const course = courses.find((c) => c.id === courseId);
        if (course) {
            setSelectedCourse(course);
            setViewState('course-detail');
        }
    }, [courses]);

    const handleLessonClick = useCallback((lesson: ApiLesson) => {
        console.log(`[DashboardPage] Loading lesson: "${lesson.title}"`);
        if (!selectedCourse) return;
        const resumableId = getResumableId('course', { courseId: selectedCourse.id, lessonId: lesson.id });
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

        showToast('Ders yüklendi!', 'success');
        setSelectedLesson(lesson);
        setStartFromIndex(0);
        setScenario(lesson.content);
        playbackSessionRef.current = { resumableId, isCourse: true, courseId: selectedCourse.id, lessonId: lesson.id };
        setViewState('playback');
    }, [progressMap, selectedCourse, showToast]);

    // ─── HANDLER: Auto-save helpers ───
    const saveNewAiLessonImmediate = useCallback(async (payload: { scenario: Scenario; topic: string; level: CEFRLevel }) => {
        if (!session?.user?.id) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/ai-lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: payload.topic,
                    title: payload.scenario.title,
                    level: payload.level,
                    content: payload.scenario,
                }),
            });
            if (res.ok) {
                const saved: SavedAiLesson = await res.json();
                setSavedAiLessons((prev) => [saved, ...prev]);
                setLastGeneratedLesson((prev) => prev ? { ...prev, savedId: saved.id } : null);
                showToast('Senaryo kaydedildi!', 'success');
            }
        } catch { /* silent */ } finally {
            setIsSaving(false);
        }
    }, [session, showToast]);

    const saveNewCustomLessonImmediate = useCallback(async (scenario: Scenario) => {
        if (!session?.user?.id) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/custom-lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: scenario.title || 'Kendi Metnim',
                    content: scenario,
                }),
            });
            if (res.ok) {
                const saved: SavedCustomLesson = await res.json();
                setSavedCustomLessons((prev) => [saved, ...prev]);
                setLastCustomScenario((prev) => prev ? { ...prev, savedId: saved.id } : null);
                showToast('Ders kaydedildi!', 'success');
            }
        } catch { /* silent */ } finally {
            setIsSaving(false);
        }
    }, [session, showToast]);

    // ─── HANDLER: AI Generation ───
    const handleGenerate = useCallback(async (topic: string, difficulty: CEFRLevel) => {
        if (isFetchingRef.current) {
            console.warn('[DashboardPage] Blocked duplicate fetch — already in progress');
            return;
        }

        console.log(`[DashboardPage] ── GENERATE START ── topic="${topic}", difficulty="${difficulty}"`);
        isFetchingRef.current = true;
        setIsGenerating(true);

        const cached = getCachedScenario(topic, difficulty);
        if (cached) {
            console.log('[DashboardPage] ✅ CACHE HIT — skipping API call entirely');
            showToast('Önbellekten yüklendi — Anında!', 'success');
            setLastGeneratedLesson({ scenario: cached, topic, level: difficulty });
            if (session?.user?.id) void saveNewAiLessonImmediate({ scenario: cached, topic, level: difficulty });
            setIsGenerating(false);
            isFetchingRef.current = false;
            return;
        }

        console.log('[DashboardPage] Cache MISS — calling AI API...');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, difficulty }),
            });

            console.log(`[DashboardPage] API response: ${response.status}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.error || `Server error (${response.status})`;
                console.warn(`[DashboardPage] API error: ${errorMsg}`);

                const isRateLimit = response.status === 429 || errorMsg.includes('429') || errorMsg.includes('rate limit') || errorMsg.includes('quota');
                showToast(
                    isRateLimit ? 'API meşgul — çevrimdışı ders yükleniyor' : 'API hatası — çevrimdışı ders yükleniyor',
                    'warning'
                );

                const offline = getOfflineScenario(topic);
                const rid = getResumableId('ai', { topic, level: difficulty });
                playbackSessionRef.current = { resumableId: rid, isCourse: false };
                setScenario(offline);
                setViewState('playback');
                return;
            }

            const data: Scenario = await response.json();
            console.log(`[DashboardPage] ✅ Scenario received: "${data.title}" (${data.lines.length} lines)`);

            cacheScenario(topic, difficulty, data);
            showToast('Yeni ders oluşturuldu!', 'success');
            setLastGeneratedLesson({ scenario: data, topic, level: difficulty });
            if (session?.user?.id) void saveNewAiLessonImmediate({ scenario: data, topic, level: difficulty });

        } catch (err) {
            console.error('[DashboardPage] ❌ Fetch error:', err);
            showToast('Bağlantı sorunu — çevrimdışı ders yükleniyor', 'warning');
            const offline = getOfflineScenario(topic);
            const rid = getResumableId('ai', { topic, level: difficulty });
            playbackSessionRef.current = { resumableId: rid, isCourse: false };
            setScenario(offline);
            setViewState('playback');
        } finally {
            setIsGenerating(false);
            isFetchingRef.current = false;
            console.log('[DashboardPage] ── GENERATE END ──');
        }
    }, [session, showToast, saveNewAiLessonImmediate]);

    // ─── HANDLER: Resume ───
    const handleResume = useCallback(() => {
        if (!resumeState) return;
        const { scenario: sc, lastLineIndex: idx, isCourse, lesson, course, resumableId } = resumeState;
        setScenario(sc);
        setStartFromIndex(idx);
        if (lesson) setSelectedLesson(lesson);
        if (course) setSelectedCourse(course);
        playbackSessionRef.current = {
            resumableId,
            isCourse,
            courseId: course?.id,
            lessonId: lesson?.id,
        };
        setResumeState(null);
        showToast('Kaldığın yerden devam ediliyor', 'success');
        setViewState('playback');
    }, [resumeState, showToast]);

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
        playbackSessionRef.current = {
            resumableId,
            isCourse,
            courseId: course?.id,
            lessonId: lesson?.id,
        };
        setResumeState(null);
        showToast('Ders baştan başlıyor', 'success');
        setViewState('playback');
    }, [resumeState, session, showToast]);

    // ─── HANDLER: Preview ───
    const handlePreviewClick = useCallback((lesson: ApiLesson) => {
        setSelectedLesson(lesson);
        setScenario(lesson.content);
        setViewState('preview');
    }, []);

    const handleStartFromPreview = useCallback(() => {
        if (selectedCourse && selectedLesson) {
            playbackSessionRef.current = {
                resumableId: getResumableId('course', { courseId: selectedCourse.id, lessonId: selectedLesson.id }),
                isCourse: true,
                courseId: selectedCourse.id,
                lessonId: selectedLesson.id,
            };
        } else {
            playbackSessionRef.current = null;
        }
        setStartFromIndex(0);
        setViewState('playback');
    }, [selectedCourse, selectedLesson]);

    const handleBackFromPreview = useCallback(() => {
        setScenario(null);
        setSelectedLesson(null);
        if (selectedCourse) {
            setViewState('course-detail');
        } else {
            setViewState('dashboard');
        }
    }, [selectedCourse]);

    // ─── HANDLER: Playback (AI / Custom) ───
    const handlePlayScenario = useCallback((sc: Scenario, playbackContext?: { resumableId: string }) => {
        setSelectedLesson(null);
        setSelectedCourse(null);
        setStartFromIndex(0);
        setScenario(sc);
        playbackSessionRef.current = playbackContext
            ? { resumableId: playbackContext.resumableId, isCourse: false }
            : null;
        setViewState('playback');
    }, []);

    const handlePlayAiScenario = useCallback(
        (sc: Scenario, options: { topic: string; level: string; savedId?: string }) => {
            const resumableId = getResumableId('ai', {
                topic: options.topic,
                level: options.level,
                savedId: options.savedId,
            });
            const lastLineIndex = getStoredLastLineIndex(resumableId, null, false);
            if (lastLineIndex > 0) {
                setResumeState({
                    resumableId,
                    title: sc.title,
                    lastLineIndex,
                    scenario: sc,
                    isCourse: false,
                });
                return;
            }
            handlePlayScenario(sc, { resumableId });
        },
        [handlePlayScenario]
    );

    const handlePlayCustomScenario = useCallback(
        (sc: Scenario, options: { savedId?: string } = {}) => {
            const resumableId = getResumableId('custom', { scenario: sc, savedId: options.savedId });
            const lastLineIndex = getStoredLastLineIndex(resumableId, null, false);
            if (lastLineIndex > 0) {
                setResumeState({
                    resumableId,
                    title: sc.title,
                    lastLineIndex,
                    scenario: sc,
                    isCourse: false,
                });
                return;
            }
            handlePlayScenario(sc, { resumableId });
        },
        [handlePlayScenario]
    );

    const handlePreviewScenario = useCallback((sc: Scenario) => {
        setSelectedLesson(null);
        setSelectedCourse(null);
        setScenario(sc);
        setViewState('preview');
    }, []);

    // ─── HANDLER: CRUD (Saved Lessons) ───
    const handleDeleteAiLesson = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/ai-lessons/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSavedAiLessons((prev) => prev.filter((l) => l.id !== id));
                showToast('Silindi', 'success');
            } else {
                showToast('Silinemedi, tekrar deneyin', 'warning');
            }
        } catch {
            showToast('Bağlantı hatası', 'warning');
        }
    }, [showToast]);

    const handleDeleteCustomLesson = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/custom-lessons/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSavedCustomLessons((prev) => prev.filter((l) => l.id !== id));
                showToast('Silindi', 'success');
            } else {
                showToast('Silinemedi, tekrar deneyin', 'warning');
            }
        } catch {
            showToast('Bağlantı hatası', 'warning');
        }
    }, [showToast]);

    const handleEditStart = useCallback((id: string, currentTitle: string) => {
        setEditingLessonId(id);
        setEditingTitle(currentTitle);
    }, []);

    const handleEditCancel = useCallback(() => {
        setEditingLessonId(null);
        setEditingTitle('');
    }, []);

    const handleRenameAiLesson = useCallback(async (id: string, title: string) => {
        if (!title.trim()) { setEditingLessonId(null); setEditingTitle(''); return; }
        try {
            const res = await fetch(`/api/ai-lessons/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title.trim() }),
            });
            if (res.ok) {
                setSavedAiLessons((prev) =>
                    prev.map((l) => l.id === id ? { ...l, title: title.trim() } : l)
                );
            } else {
                showToast('Yeniden adlandırılamadı', 'warning');
            }
        } catch {
            showToast('Bağlantı hatası', 'warning');
        }
        setEditingLessonId(null);
        setEditingTitle('');
    }, [showToast]);

    const handleRenameCustomLesson = useCallback(async (id: string, title: string) => {
        if (!title.trim()) { setEditingLessonId(null); setEditingTitle(''); return; }
        try {
            const res = await fetch(`/api/custom-lessons/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title.trim() }),
            });
            if (res.ok) {
                setSavedCustomLessons((prev) =>
                    prev.map((l) => l.id === id ? { ...l, title: title.trim() } : l)
                );
            } else {
                showToast('Yeniden adlandırılamadı', 'warning');
            }
        } catch {
            showToast('Bağlantı hatası', 'warning');
        }
        setEditingLessonId(null);
        setEditingTitle('');
    }, [showToast]);

    // ─── HANDLER: Custom Submit ───
    const handleCustomSubmit = useCallback((customScenario: Scenario) => {
        showToast('Kendi metniniz yüklendi!', 'success');
        setLastCustomScenario({ scenario: customScenario });
        if (session?.user?.id) void saveNewCustomLessonImmediate(customScenario);
    }, [session, showToast, saveNewCustomLessonImmediate]);

    // ─── HANDLER: Progress / Completion ───
    const handleComplete = useCallback(async () => {
        console.log('[DashboardPage] ✅ Session complete');

        // Kurs: giriş yapılmış ve yapılandırılmış ders ise API ile kaydet
        if (session?.user?.id && selectedCourse && selectedLesson) {
            try {
                const res = await fetch('/api/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        courseId: selectedCourse.id,
                        lessonId: selectedLesson.id,
                        lastLineIndex: -1,
                        completed: true,
                    }),
                });
                if (!res.ok) return;
                const progress: ProgressData = await res.json();
                setProgressMap((prev) => ({ ...prev, [selectedLesson.id]: progress }));
                const remaining = progress.targetCount - progress.completionCount;
                if (remaining > 0) {
                    showToast(`Tekrar: ${remaining} seans kaldı`, 'success');
                } else {
                    showToast('Bu ders tam öğrenildi!', 'success');
                }
            } catch {
                /* silent — progress saving is non-critical */
            }
            return;
        }

        // AI / Metnim: localStorage ile tamamlanma sayısını artır
        const sessionRef = playbackSessionRef.current;
        if (sessionRef && !sessionRef.isCourse) {
            const next = incrementStoredCompletionCount(sessionRef.resumableId);
            if (next) {
                const remaining = next.targetCount - next.completionCount;
                if (remaining > 0) {
                    showToast(`Tekrar: ${remaining} seans kaldı`, 'success');
                } else {
                    showToast('Bu ders tam öğrenildi!', 'success');
                }
            }
        }
    }, [session, selectedCourse, selectedLesson, showToast]);

    const handleBack = useCallback(async (lastLineIndex: number) => {
        console.log(`[DashboardPage] ← Back (lastLineIndex: ${lastLineIndex})`);

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
        if (selectedCourse) {
            setViewState('course-detail');
        } else {
            setViewState('dashboard');
        }
    }, [session, selectedCourse]);

    // ─── HANDLER: Back Navigation ───
    const handleBackFromCourseDetail = useCallback(() => {
        setScenario(null);
        setSelectedCourse(null);
        if (selectedSubcategory || selectedCategory) {
            setViewState('subcategory');
        } else {
            setViewState('dashboard');
        }
    }, [selectedCategory, selectedSubcategory]);

    const handleBackFromSubcategory = useCallback(() => {
        setSelectedSubcategory(null);
        if (selectedCategory) {
            const categoryCourses = courses.filter((c) => c.category === selectedCategory);
            const hasSubcategories = categoryCourses.some((c) => c.subcategory !== null);
            if (hasSubcategories) {
                setViewState('category');
            } else {
                setSelectedCategory(null);
                setViewState('dashboard');
            }
        } else {
            setViewState('dashboard');
        }
    }, [selectedCategory, courses]);

    const handleBackFromCategory = useCallback(() => {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setViewState('dashboard');
    }, []);

    const handleBackToDashboard = useCallback(() => {
        setScenario(null);
        setSelectedCourse(null);
        setSelectedLesson(null);
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setViewState('dashboard');
    }, []);

    // ─── RETURN STATE BAG ───
    return {
        session,
        toasts,
        activeTab,
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
        isSaving,
        lastGeneratedLesson,
        savedAiLessons,
        lastCustomScenario,
        savedCustomLessons,
        editingLessonId,
        editingTitle,
        deleteConfirm,
        setActiveTab,
        setResumeState,
        setEditingTitle,
        setDeleteConfirm,
        setLastGeneratedLesson,
        setLastCustomScenario,
        handleCategoryClick,
        handleSubcategoryClick,
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
        handleDeleteAiLesson,
        handleDeleteCustomLesson,
        handleEditStart,
        handleEditCancel,
        handleRenameAiLesson,
        handleRenameCustomLesson,
        handleCustomSubmit,
        handleBackFromCourseDetail,
        handleBackFromSubcategory,
        handleBackFromCategory,
        handleBackToDashboard,
    };
}
