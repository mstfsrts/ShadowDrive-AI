'use client';

// ─── ShadowDrive AI — Dashboard Page ───
// ARCHITECTURE:
//   Section A: Structured Courses — DB-backed (Delftse Methode, GoedBezig)
//   Section B: Custom AI Scenarios — Online, Gemini-powered
//   Section C: Custom Text Input — Manual entry

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ScenarioForm from '@/components/ScenarioForm';
import CustomTextForm from '@/components/CustomTextForm';
import AudioPlayer from '@/components/AudioPlayer';
import LessonPreview from '@/components/LessonPreview';
import SavedLessonCard from '@/components/SavedLessonCard';
import ThemeToggle from '@/components/ThemeToggle';
import AuthButton from '@/components/AuthButton';
import { useToast, ToastContainer } from '@/components/Toast';
import { Scenario, type CEFRLevel } from '@/types/dialogue';
import GeneratingLoader from '@/components/GeneratingLoader';
import ResumePromptModal from '@/components/ResumePromptModal';
import ConfirmModal from '@/components/ConfirmModal';
import { getCachedScenario, cacheScenario } from '@/lib/scenarioCache';
import { getOfflineScenario } from '@/lib/offlineScenarios';
import { getResumableId, getStoredLastLineIndex, getStoredProgress, setStoredLastLineIndex, incrementStoredCompletionCount } from '@/lib/resumablePlayback';

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface ProgressData {
    lessonId: string;
    courseId: string;
    completionCount: number;
    targetCount: number;
    completed: boolean;
    lastLineIndex: number;
}

interface SavedAiLesson {
    id: string;
    title: string | null;
    topic: string;
    level: string;
    content: Scenario;
    createdAt: string;
}

interface SavedCustomLesson {
    id: string;
    title: string;
    content: Scenario;
    createdAt: string;
}

interface GeneratedLessonState {
    scenario: Scenario;
    topic: string;
    level: CEFRLevel;
    savedId?: string;
}

type ActiveTab = 'courses' | 'ai' | 'custom';
type ViewState = 'dashboard' | 'category' | 'subcategory' | 'course-detail' | 'preview' | 'playback';

/** Unified resume state for Kurslar, AI, and Metnim (yapı taşı) */
interface ResumeState {
    resumableId: string;
    title: string;
    lastLineIndex: number;
    scenario: Scenario;
    isCourse: boolean;
    lesson?: ApiLesson;
    course?: ApiCourse;
}

/** Current playback session: used by handleBack to save progress */
interface PlaybackSession {
    resumableId: string;
    isCourse: boolean;
    courseId?: string;
    lessonId?: string;
}

// ─── Category Metadata ──────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { emoji: string; description: string }> = {
    'Delftse Methode': { emoji: '📚', description: 'Üniversite müfredatı bazlı kurslar' },
    'Goedbezig Youtube Series': { emoji: '🎬', description: 'YouTube video derslerinden uyarlama' },
};

const SUBCATEGORY_META: Record<string, { emoji: string }> = {
    'Oude Series': { emoji: '📼' },
    'Nieuwe Series': { emoji: '🆕' },
};

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

function CourseCardSkeleton() {
    return (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/50 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-foreground/10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-foreground/10 rounded w-3/4" />
                <div className="h-3 bg-foreground/10 rounded w-1/2" />
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<ActiveTab>('courses');
    const [viewState, setViewState] = useState<ViewState>('dashboard');
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<ApiLesson | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [courses, setCourses] = useState<ApiCourse[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [progressMap, setProgressMap] = useState<Record<string, ProgressData>>({});
    const [resumeState, setResumeState] = useState<ResumeState | null>(null);
    const [startFromIndex, setStartFromIndex] = useState(0);
    const playbackSessionRef = useRef<PlaybackSession | null>(null);
    const [lastGeneratedLesson, setLastGeneratedLesson] = useState<GeneratedLessonState | null>(null);
    const [lastCustomScenario, setLastCustomScenario] = useState<{ scenario: Scenario; savedId?: string } | null>(null);
    const [savedAiLessons, setSavedAiLessons] = useState<SavedAiLesson[]>([]);
    const [savedCustomLessons, setSavedCustomLessons] = useState<SavedCustomLesson[]>([]);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    /** Silme onayı: { type: 'ai'|'custom', id, title } */
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'ai' | 'custom'; id: string; title: string } | null>(null);
    const { toasts, showToast } = useToast();

    // ─── DOUBLE-CLICK GUARD ───
    const isFetchingRef = useRef(false);

    // ─── LOAD COURSES FROM DB ───
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

    // ─── LOAD PROGRESS FROM DB ───
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

    // ─── LOAD SAVED LESSONS FROM DB ───
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

    // ─── COURSE HANDLERS (Section A) ───

    const handleCategoryClick = useCallback((category: string) => {
        setSelectedCategory(category);
        // Check if this category has subcategories
        const categoryCourses = courses.filter((c) => c.category === category);
        const hasSubcategories = categoryCourses.some((c) => c.subcategory !== null);
        if (hasSubcategories) {
            setViewState('category');
        } else {
            // No subcategories — show courses directly (e.g. Delftse Methode)
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

    /** Yeni oluşturulan AI dersini hemen kaydet (otomatik kayıt). handleGenerate'den önce tanımlanmalı. */
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

    /** Yeni oluşturulan Metnim içeriğini hemen kaydet (otomatik kayıt). */
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

    // ─── AI GENERATE HANDLER (Section B) ───
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

    // ─── RESUME HANDLERS (unified for course / AI / Metnim) ───
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
            setProgressMap,
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

    // ─── PREVIEW HANDLERS ───
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

    // ─── SAVED LESSON HANDLERS (Section B + C) ───

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

    /** AI tab: play with resume check (unsaved or saved by id) */
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

    /** Metnim tab: play with resume check (unsaved or saved by id) */
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

    const handleDeleteAiLesson = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/ai-lessons/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSavedAiLessons((prev) => prev.filter((l) => l.id !== id));
                showToast('Silindi', 'success');
            }
        } catch { /* silent */ }
    }, [showToast]);

    const handleDeleteCustomLesson = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/custom-lessons/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSavedCustomLessons((prev) => prev.filter((l) => l.id !== id));
                showToast('Silindi', 'success');
            }
        } catch { /* silent */ }
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
            }
        } catch { /* silent */ }
        setEditingLessonId(null);
        setEditingTitle('');
    }, []);

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
            }
        } catch { /* silent */ }
        setEditingLessonId(null);
        setEditingTitle('');
    }, []);

    // ─── CUSTOM TEXT HANDLER (Section C) ───
    const handleCustomSubmit = useCallback((customScenario: Scenario) => {
        showToast('Kendi metniniz yüklendi!', 'success');
        setLastCustomScenario({ scenario: customScenario });
        if (session?.user?.id) void saveNewCustomLessonImmediate(customScenario);
    }, [session, showToast, saveNewCustomLessonImmediate]);

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
                setProgressMap,
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

    const handleBackFromCourseDetail = useCallback(() => {
        setScenario(null);
        setSelectedCourse(null);
        // Go back to subcategory/course list
        if (selectedSubcategory || selectedCategory) {
            setViewState('subcategory');
        } else {
            setViewState('dashboard');
        }
    }, [selectedCategory, selectedSubcategory]);

    const handleBackFromSubcategory = useCallback(() => {
        setSelectedSubcategory(null);
        if (selectedCategory) {
            // Check if category has subcategories
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

    // ─── PREVIEW MODE ───
    if (viewState === 'preview' && scenario) {
        return (
            <LessonPreview
                scenario={scenario}
                onStartPlayback={handleStartFromPreview}
                onBack={handleBackFromPreview}
            />
        );
    }

    // ─── PLAYBACK MODE ───
    if (viewState === 'playback' && scenario) {
        return (
            <>
                <ToastContainer toasts={toasts} />
                <AudioPlayer scenario={scenario} startFromIndex={startFromIndex} onComplete={handleComplete} onBack={handleBack} />
            </>
        );
    }

    // ─── CATEGORY VIEW (subcategory selection) ───
    if (viewState === 'category' && selectedCategory) {
        const categoryCourses = courses.filter((c) => c.category === selectedCategory);
        const subcategories = Array.from(new Set(categoryCourses.map((c) => c.subcategory).filter(Boolean))) as string[];
        const meta = CATEGORY_META[selectedCategory];

        return (
            <main className="min-h-dvh flex flex-col px-4 py-8 max-w-lg mx-auto">
                <ToastContainer toasts={toasts} />

                <div className="flex items-center justify-between mb-6">
                    <button onClick={handleBackFromCategory}
                        className="flex items-center gap-2 text-foreground-secondary hover:text-foreground
                         transition-colors duration-200 text-sm min-h-[44px]">
                        <span>←</span> Geri
                    </button>
                    <ThemeToggle />
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <span className="text-5xl">{meta?.emoji ?? '📂'}</span>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{selectedCategory}</h1>
                        <p className="text-foreground-secondary text-sm mt-1">{meta?.description}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {subcategories.map((sub) => {
                        const subCourses = categoryCourses.filter((c) => c.subcategory === sub);
                        const subMeta = SUBCATEGORY_META[sub];
                        return (
                            <button
                                key={sub}
                                onClick={() => handleSubcategoryClick(sub)}
                                className="group relative flex items-center gap-4 p-5 rounded-2xl
                                 bg-card border border-border/50 hover:border-border-hover
                                 transition-all duration-300 active:scale-[0.98] text-left overflow-hidden"
                            >
                                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                                    {subMeta?.emoji ?? '📁'}
                                </span>
                                <div className="flex-1">
                                    <h3 className="text-foreground font-bold text-base leading-tight">{sub}</h3>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                     bg-foreground/5 text-foreground-muted mt-2">
                                        {subCourses.length} kurs
                                    </span>
                                </div>
                                <span className="text-foreground-faint group-hover:text-foreground transition-colors duration-300 text-xl">
                                    →
                                </span>
                            </button>
                        );
                    })}
                </div>
            </main>
        );
    }

    // ─── SUBCATEGORY / COURSE LIST VIEW ───
    if (viewState === 'subcategory' && selectedCategory) {
        const filteredCourses = courses.filter((c) =>
            c.category === selectedCategory &&
            (selectedSubcategory ? c.subcategory === selectedSubcategory : c.subcategory === null)
        );
        const meta = CATEGORY_META[selectedCategory];
        const subMeta = selectedSubcategory ? SUBCATEGORY_META[selectedSubcategory] : null;

        return (
            <main className="min-h-dvh flex flex-col px-4 py-8 max-w-lg mx-auto">
                <ToastContainer toasts={toasts} />

                <div className="flex items-center justify-between mb-6">
                    <button onClick={handleBackFromSubcategory}
                        className="flex items-center gap-2 text-foreground-secondary hover:text-foreground
                         transition-colors duration-200 text-sm min-h-[44px]">
                        <span>←</span> Geri
                    </button>
                    <ThemeToggle />
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <span className="text-5xl">{subMeta?.emoji ?? meta?.emoji ?? '📂'}</span>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {selectedSubcategory ?? selectedCategory}
                        </h1>
                        {selectedSubcategory && (
                            <p className="text-foreground-secondary text-sm mt-1">{selectedCategory}</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {filteredCourses.map((course) => {
                        const completedLessons = course.lessons.filter(
                            (l) => progressMap[l.id]?.completionCount >= 1
                        ).length;
                        const totalLessons = course.lessons.length;

                        return (
                            <button
                                key={course.id}
                                onClick={() => handleCourseClick(course.id)}
                                className="course-card group relative flex items-center gap-4 p-5 rounded-2xl
                                 bg-card border border-border/50 hover:border-border-hover
                                 transition-all duration-300 active:scale-[0.98] text-left overflow-hidden"
                            >
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100
                                 transition-opacity duration-500 bg-gradient-to-r
                                 from-${course.color}-500/5 to-transparent pointer-events-none`} />
                                <span className="text-4xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                                    {course.emoji}
                                </span>
                                <div className="flex-1 relative z-10">
                                    <h3 className="text-foreground font-bold text-base leading-tight">{course.title}</h3>
                                    <p className="text-foreground-muted text-sm mt-1">{course.description}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                         bg-${course.color}-500/10 text-${course.color}-400`}>
                                            {totalLessons} ders
                                        </span>
                                        {completedLessons > 0 && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                             bg-emerald-500/10 text-emerald-400">
                                                {completedLessons}/{totalLessons} tamamlandı
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-foreground-faint group-hover:text-foreground transition-colors duration-300 text-xl relative z-10">
                                    →
                                </span>
                            </button>
                        );
                    })}
                </div>
            </main>
        );
    }

    // ─── COURSE DETAIL VIEW ───
    if (viewState === 'course-detail' && selectedCourse) {
        return (
            <main className="min-h-dvh flex flex-col px-4 py-8 max-w-lg mx-auto">
                <ToastContainer toasts={toasts} />

                {resumeState && (
                    <ResumePromptModal
                        title={resumeState.title}
                        lastLineIndex={resumeState.lastLineIndex}
                        onResume={handleResume}
                        onRestart={() => void handleRestartLesson()}
                        onDismiss={() => setResumeState(null)}
                    />
                )}

                <div className="flex items-center justify-between mb-6">
                    <button
                        id="back-to-dashboard"
                        onClick={handleBackFromCourseDetail}
                        className="flex items-center gap-2 text-foreground-secondary hover:text-foreground
                         transition-colors duration-200 text-sm min-h-[44px]"
                    >
                        <span>←</span> Geri
                    </button>
                    <ThemeToggle />
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <span className="text-5xl">{selectedCourse.emoji}</span>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{selectedCourse.title}</h1>
                        <p className="text-foreground-secondary text-sm mt-1">{selectedCourse.description}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <h2 className="text-foreground-muted text-xs font-medium uppercase tracking-wider mb-1">
                        Dersler ({selectedCourse.lessons.length})
                    </h2>
                    {selectedCourse.lessons.map((lesson, idx) => {
                        const prog = progressMap[lesson.id];
                        const isMastered = prog && prog.completionCount >= prog.targetCount;
                        const isStarted = prog && prog.completionCount >= 1;
                        const isPartial = prog && !prog.completed && prog.lastLineIndex > 0;

                        return (
                            <div key={lesson.id} className="flex items-stretch gap-2">
                                {/* ── Main tap area → play / resume ── */}
                                <button
                                    id={`lesson-${lesson.id}`}
                                    onClick={() => handleLessonClick(lesson)}
                                    className="lesson-card group flex-1 flex items-center gap-4 p-5 rounded-2xl
                                     bg-card border border-border/50 hover:border-border-hover
                                     transition-all duration-300 active:scale-[0.98] text-left"
                                >
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl
                                      text-lg font-bold group-hover:scale-110 transition-transform duration-300
                                      ${isMastered
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : `bg-${selectedCourse.color}-500/10 text-${selectedCourse.color}-400`
                                        }`}>
                                        {isMastered ? '★' : idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-foreground font-medium text-lg">{lesson.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <p className="text-foreground-muted text-sm">
                                                {lesson.content.lines.length} cümle
                                            </p>
                                            {isMastered && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                                 bg-emerald-500/10 text-emerald-400">
                                                    Öğrenildi
                                                </span>
                                            )}
                                            {!isMastered && isStarted && prog && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                                 bg-blue-500/10 text-blue-400">
                                                    {prog.completionCount}/{prog.targetCount}
                                                </span>
                                            )}
                                            {isPartial && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                                 bg-amber-500/10 text-amber-400">
                                                    ⏸ Yarıda
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-foreground-faint group-hover:text-emerald-400 transition-colors duration-300 text-2xl">
                                        {isMastered ? '✓' : '▶'}
                                    </span>
                                </button>

                                {/* ── Preview button → silent text view ── */}
                                <button
                                    onClick={() => handlePreviewClick(lesson)}
                                    title="Metni önizle"
                                    className="flex items-center justify-center w-12 rounded-2xl
                                     bg-card border border-border/50 hover:border-border-hover
                                     text-foreground-muted hover:text-foreground
                                     transition-all duration-200 active:scale-95 text-lg"
                                >
                                    👁
                                </button>
                            </div>
                        );
                    })}
                </div>
            </main>
        );
    }

    // ─── DASHBOARD MODE ───
    return (
        <main className="min-h-dvh flex flex-col px-4 py-8 max-w-lg mx-auto">
            <ToastContainer toasts={toasts} />

            {resumeState && (
                <ResumePromptModal
                    title={resumeState.title}
                    lastLineIndex={resumeState.lastLineIndex}
                    onResume={handleResume}
                    onRestart={() => void handleRestartLesson()}
                    onDismiss={() => setResumeState(null)}
                />
            )}

            <ConfirmModal
                open={!!deleteConfirm}
                title="Bu dersi silmek istediğinize emin misiniz?"
                subtitle={deleteConfirm?.title}
                confirmLabel="Sil"
                cancelLabel="İptal"
                variant="danger"
                onConfirm={() => {
                    if (!deleteConfirm) return;
                    if (deleteConfirm.type === 'ai') handleDeleteAiLesson(deleteConfirm.id);
                    else handleDeleteCustomLesson(deleteConfirm.id);
                    setDeleteConfirm(null);
                }}
                onCancel={() => setDeleteConfirm(null)}
            />

            {/* Header Bar */}
            <div className="flex items-center justify-between gap-2 mb-6">
                <div className="flex-shrink-0 min-w-[44px]">
                    <AuthButton />
                </div>
                <ThemeToggle />
            </div>

            {/* Hero Branding */}
            <div className="flex flex-col items-center mb-8">
                <div className="mb-3 text-5xl">🚗</div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                    <span className="text-gradient">Shadow</span>
                    <span className="text-foreground">Drive</span>
                    <span className="text-foreground-muted font-light ml-2 text-xl align-middle">AI</span>
                </h1>
                <p className="text-foreground-secondary text-center text-base max-w-xs leading-relaxed">
                    Araba kullanırken Hollandaca öğren
                </p>
                <div className="mt-4 w-16 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 opacity-60" />
            </div>

            {/* Tab Switcher */}
            <div className="tab-switcher flex rounded-2xl bg-card border border-border/50 p-1.5 mb-8">
                {(['courses', 'ai', 'custom'] as ActiveTab[]).map((tab) => (
                    <button
                        key={tab}
                        id={`tab-${tab}`}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider
                         transition-all duration-300 ${activeTab === tab
                                ? 'bg-emerald-500 text-white dark:text-shadow-950 shadow-lg shadow-emerald-500/30'
                                : 'text-foreground-secondary hover:text-foreground'
                            }`}
                    >
                        {tab === 'courses' ? '📚 Kurslar' : tab === 'ai' ? '🤖 AI' : '✍️ Metnim'}
                    </button>
                ))}
            </div>

            {/* ── Courses Tab ── */}
            {activeTab === 'courses' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-slate-500 dark:bg-slate-400 animate-pulse" />
                        <span className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                            Yapılandırılmış Müfredat
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {coursesLoading ? (
                            <>
                                <CourseCardSkeleton />
                                <CourseCardSkeleton />
                            </>
                        ) : courses.length === 0 ? (
                            <p className="text-foreground-muted text-sm text-center py-8">
                                Kurslar yüklenemedi.
                            </p>
                        ) : (
                            Array.from(new Set(courses.map((c) => c.category))).map((category) => {
                                const meta = CATEGORY_META[category];
                                const categoryCourses = courses.filter((c) => c.category === category);
                                return (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryClick(category)}
                                        className="course-card group relative flex items-center gap-4 p-5 rounded-2xl
                                         bg-card border border-border/50 hover:border-border-hover
                                         transition-all duration-300 active:scale-[0.98] text-left overflow-hidden"
                                    >
                                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                                            {meta?.emoji ?? '📂'}
                                        </span>
                                        <div className="flex-1">
                                            <h3 className="text-foreground font-bold text-base leading-tight">{category}</h3>
                                            <p className="text-foreground-muted text-sm mt-1">{meta?.description}</p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                             bg-foreground/5 text-foreground-muted mt-2">
                                                {categoryCourses.length} kurs
                                            </span>
                                        </div>
                                        <span className="text-foreground-faint group-hover:text-foreground transition-colors duration-300 text-xl">
                                            →
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <p className="mt-4 text-foreground-faint text-xs text-center">
                        Delftse Methode · GoedBezig müfredatı
                    </p>
                </div>
            )}

            {/* ── AI Tab ── */}
            {activeTab === 'ai' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                            Çevrimiçi · AI Senaryo
                        </span>
                    </div>

                    {isGenerating ? (
                        <GeneratingLoader />
                    ) : (
                        <>
                            <ScenarioForm onSubmit={handleGenerate} isLoading={isGenerating} />
                            <p className="mt-2 text-foreground-faint text-xs text-center max-w-xs mx-auto">
                                Konunuzu yazın ve AI sizin için Hollandaca-Türkçe bir ders oluştursun.
                            </p>
                        </>
                    )}

                    {/* ── Generated lesson card ── */}
                    {lastGeneratedLesson && (() => {
                        const aiResumableId = getResumableId('ai', {
                            topic: lastGeneratedLesson.topic,
                            level: lastGeneratedLesson.level,
                            savedId: lastGeneratedLesson.savedId ?? undefined,
                        });
                        const prog = getStoredProgress(aiResumableId, null, false);
                        const isMastered = prog.completionCount >= prog.targetCount;
                        const isStarted = prog.completionCount >= 1;
                        const isPartial = prog.lastLineIndex > 0;
                        return (
                        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-foreground font-semibold truncate">
                                        {lastGeneratedLesson.scenario.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <p className="text-foreground-muted text-sm">
                                            {lastGeneratedLesson.level} · {lastGeneratedLesson.scenario.lines.length} cümle
                                        </p>
                                        {isMastered && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                                Öğrenildi
                                            </span>
                                        )}
                                        {!isMastered && isStarted && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                                                {prog.completionCount}/{prog.targetCount}
                                            </span>
                                        )}
                                        {isPartial && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                                                ⏸ Yarıda
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setLastGeneratedLesson(null)}
                                    className="text-foreground-muted hover:text-foreground ml-2 flex-shrink-0 w-8 h-8
                                     flex items-center justify-center rounded-lg hover:bg-background transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePreviewScenario(lastGeneratedLesson.scenario)}
                                    title="Önizle"
                                    className="flex items-center justify-center w-12 min-h-[44px] rounded-xl
                                     bg-background border border-border hover:border-border-hover
                                     text-foreground-muted hover:text-foreground transition-colors duration-200 active:scale-95"
                                >
                                    👁
                                </button>
                                <button
                                    onClick={() => handlePlayAiScenario(lastGeneratedLesson.scenario, { topic: lastGeneratedLesson.topic, level: lastGeneratedLesson.level, savedId: lastGeneratedLesson.savedId })}
                                    className="flex-1 min-h-[44px] rounded-xl bg-emerald-500 text-white font-semibold
                                     hover:bg-emerald-400 transition-colors duration-200 active:scale-95"
                                >
                                    ▶ Dinle
                                </button>
                                {session?.user?.id && (
                                    <span className="flex items-center justify-center px-3 min-h-[44px] rounded-xl text-sm font-medium
                                     bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                        {lastGeneratedLesson.savedId ? '✓ Kaydedildi' : isSaving ? 'Kaydediliyor…' : '…'}
                                    </span>
                                )}
                            </div>
                        </div>
                        );
                    })()}

                    {/* ── Saved AI lessons list ── */}
                    {session?.user?.id && savedAiLessons.length > 0 && (
                        <div className="flex flex-col gap-3 mt-2">
                            <h3 className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                                Kaydedilmiş Senaryolar
                            </h3>
                            {savedAiLessons.map((lesson) => {
                                const rid = getResumableId('ai', { savedId: lesson.id });
                                const p = getStoredProgress(rid, null, false);
                                return (
                                <SavedLessonCard
                                    key={lesson.id}
                                    id={lesson.id}
                                    title={lesson.title ?? lesson.topic}
                                    subtitle={`${lesson.level} · ${(lesson.content as Scenario).lines?.length ?? 0} cümle`}
                                    progress={{
                                        completionCount: p.completionCount,
                                        targetCount: p.targetCount,
                                        isPartial: p.lastLineIndex > 0,
                                    }}
                                    isEditing={editingLessonId === lesson.id}
                                    editValue={editingTitle}
                                    onPlay={() => handlePlayAiScenario(lesson.content, { topic: lesson.topic, level: lesson.level, savedId: lesson.id })}
                                    onPreview={() => handlePreviewScenario(lesson.content)}
                                    onEditStart={() => handleEditStart(lesson.id, lesson.title ?? lesson.topic)}
                                    onEditChange={(v) => setEditingTitle(v)}
                                    onEditCommit={() => handleRenameAiLesson(lesson.id, editingTitle)}
                                    onEditCancel={handleEditCancel}
                                    onDelete={() => setDeleteConfirm({ type: 'ai', id: lesson.id, title: lesson.title ?? lesson.topic })}
                                />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Custom Text Tab ── */}
            {activeTab === 'custom' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                            Özel İçerik · Manuel Format
                        </span>
                    </div>

                    <CustomTextForm onSubmit={handleCustomSubmit} />

                    <p className="mt-2 text-foreground-faint text-xs text-center max-w-xs mx-auto">
                        Kendi cümlelerinizi yapıştırın ve anında çalışın.
                    </p>

                    {/* ── Custom lesson card ── */}
                    {lastCustomScenario && (() => {
                        const customResumableId = getResumableId('custom', {
                            scenario: lastCustomScenario.scenario,
                            savedId: lastCustomScenario.savedId ?? undefined,
                        });
                        const prog = getStoredProgress(customResumableId, null, false);
                        const isMastered = prog.completionCount >= prog.targetCount;
                        const isStarted = prog.completionCount >= 1;
                        const isPartial = prog.lastLineIndex > 0;
                        return (
                        <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-foreground font-semibold truncate">
                                        {lastCustomScenario.scenario.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <p className="text-foreground-muted text-sm">
                                            {lastCustomScenario.scenario.lines.length} cümle
                                        </p>
                                        {isMastered && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                                Öğrenildi
                                            </span>
                                        )}
                                        {!isMastered && isStarted && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                                                {prog.completionCount}/{prog.targetCount}
                                            </span>
                                        )}
                                        {isPartial && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                                                ⏸ Yarıda
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setLastCustomScenario(null)}
                                    className="text-foreground-muted hover:text-foreground ml-2 flex-shrink-0 w-8 h-8
                                     flex items-center justify-center rounded-lg hover:bg-background transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePreviewScenario(lastCustomScenario.scenario)}
                                    title="Önizle"
                                    className="flex items-center justify-center w-12 min-h-[44px] rounded-xl
                                     bg-background border border-border hover:border-border-hover
                                     text-foreground-muted hover:text-foreground transition-colors duration-200 active:scale-95"
                                >
                                    👁
                                </button>
                                <button
                                    onClick={() => handlePlayCustomScenario(lastCustomScenario.scenario, { savedId: lastCustomScenario.savedId })}
                                    className="flex-1 min-h-[44px] rounded-xl bg-purple-500 text-white font-semibold
                                     hover:bg-purple-400 transition-colors duration-200 active:scale-95"
                                >
                                    ▶ Dinle
                                </button>
                                {session?.user?.id && (
                                    <span className="flex items-center justify-center px-3 min-h-[44px] rounded-xl text-sm font-medium
                                     bg-purple-500/10 text-purple-400 border border-purple-500/30">
                                        {lastCustomScenario.savedId ? '✓ Kaydedildi' : isSaving ? 'Kaydediliyor…' : '…'}
                                    </span>
                                )}
                            </div>
                        </div>
                        );
                    })()}

                    {/* ── Saved custom lessons list ── */}
                    {session?.user?.id && savedCustomLessons.length > 0 && (
                        <div className="flex flex-col gap-3 mt-2">
                            <h3 className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                                Kaydedilmiş Metinlerim
                            </h3>
                            {savedCustomLessons.map((lesson) => {
                                const rid = getResumableId('custom', { savedId: lesson.id });
                                const p = getStoredProgress(rid, null, false);
                                return (
                                <SavedLessonCard
                                    key={lesson.id}
                                    id={lesson.id}
                                    title={lesson.title}
                                    subtitle={`${(lesson.content as Scenario).lines?.length ?? 0} cümle`}
                                    progress={{
                                        completionCount: p.completionCount,
                                        targetCount: p.targetCount,
                                        isPartial: p.lastLineIndex > 0,
                                    }}
                                    isEditing={editingLessonId === lesson.id}
                                    editValue={editingTitle}
                                    onPlay={() => handlePlayCustomScenario(lesson.content, { savedId: lesson.id })}
                                    onPreview={() => handlePreviewScenario(lesson.content)}
                                    onEditStart={() => handleEditStart(lesson.id, lesson.title)}
                                    onEditChange={(v) => setEditingTitle(v)}
                                    onEditCommit={() => handleRenameCustomLesson(lesson.id, editingTitle)}
                                    onEditCancel={handleEditCancel}
                                    onDelete={() => setDeleteConfirm({ type: 'custom', id: lesson.id, title: lesson.title })}
                                />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
