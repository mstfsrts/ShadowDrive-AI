'use client';

// ─── ShadowDrive AI — Dual-Engine Home Page ───
// ARCHITECTURE:
//   Section A: Structured Courses — Offline, zero latency (Delftse Methode, GoedBezig)
//   Section B: Custom AI Scenarios — Online, Gemini-powered
//
// RULES:
// 1. ZERO useEffect API calls — fetch ONLY fires on explicit user click
// 2. LocalStorage caching — never ask Gemini for the same scenario twice
// 3. Seamless offline fallback — app NEVER shows a dead end
// 4. useRef guard prevents double-click / double-fetch

import { useState, useCallback, useRef } from 'react';
import ScenarioForm from '@/components/ScenarioForm';
import CustomTextForm from '@/components/CustomTextForm';
import AudioPlayer from '@/components/AudioPlayer';
import ThemeToggle from '@/components/ThemeToggle';
import { useToast, ToastContainer } from '@/components/Toast';
import { Scenario, type CEFRLevel } from '@/types/dialogue';
import GeneratingLoader from '@/components/GeneratingLoader';
import { getCachedScenario, cacheScenario } from '@/lib/scenarioCache';
import { getOfflineScenario } from '@/lib/offlineScenarios';
import { getAllCourses, getCourseById, type Course, type CourseLesson } from '@/lib/offline-courses';

type ActiveTab = 'courses' | 'ai' | 'custom';
type ViewState = 'dashboard' | 'course-detail' | 'playback';

export default function HomePage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('courses');
    const [viewState, setViewState] = useState<ViewState>('dashboard');
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toasts, showToast } = useToast();

    // ─── DOUBLE-CLICK GUARD ───
    const isFetchingRef = useRef(false);

    const allCourses = getAllCourses();

    // ─── COURSE HANDLERS (Section A — Offline) ───

    const handleCourseClick = useCallback((courseId: string) => {
        const course = getCourseById(courseId);
        if (course) {
            setSelectedCourse(course);
            setViewState('course-detail');
        }
    }, []);

    const handleLessonClick = useCallback((lesson: CourseLesson) => {
        console.log(`[HomePage] Loading offline lesson: "${lesson.title}"`);
        showToast('Ders yüklendi — Anında!', 'success');
        setScenario(lesson.scenario);
        setViewState('playback');
    }, [showToast]);

    // ─── AI GENERATE HANDLER (Section B — Online) ───
    const handleGenerate = useCallback(async (topic: string, difficulty: CEFRLevel) => {
        if (isFetchingRef.current) {
            console.warn('[HomePage] Blocked duplicate fetch — already in progress');
            return;
        }

        console.log(`[HomePage] ── GENERATE START ── topic="${topic}", difficulty="${difficulty}"`);
        isFetchingRef.current = true;
        setIsGenerating(true);

        // Check LocalStorage cache
        const cached = getCachedScenario(topic, difficulty);
        if (cached) {
            console.log('[HomePage] ✅ CACHE HIT — skipping API call entirely');
            showToast('Önbellekten yüklendi — Anında!', 'success');
            setScenario(cached);
            setViewState('playback');
            setIsGenerating(false);
            isFetchingRef.current = false;
            return;
        }

        console.log('[HomePage] Cache MISS — calling Gemini API...');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, difficulty }),
            });

            console.log(`[HomePage] API response: ${response.status}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.error || `Server error (${response.status})`;
                console.warn(`[HomePage] API error: ${errorMsg}`);

                const isRateLimit = response.status === 429 || errorMsg.includes('429') || errorMsg.includes('rate limit') || errorMsg.includes('quota');
                showToast(
                    isRateLimit ? 'API meşgul — çevrimdışı ders yükleniyor' : 'API hatası — çevrimdışı ders yükleniyor',
                    'warning'
                );

                const offline = getOfflineScenario(topic);
                console.log(`[HomePage] Loaded offline scenario: "${offline.title}"`);
                setScenario(offline);
                setViewState('playback');
                return;
            }

            const data: Scenario = await response.json();
            console.log(`[HomePage] ✅ Scenario received: "${data.title}" (${data.lines.length} lines)`);

            cacheScenario(topic, difficulty, data);
            showToast('Yeni ders oluşturuldu!', 'success');
            setScenario(data);
            setViewState('playback');

        } catch (err) {
            console.error('[HomePage] ❌ Fetch error:', err);
            showToast('Bağlantı sorunu — çevrimdışı ders yükleniyor', 'warning');
            const offline = getOfflineScenario(topic);
            setScenario(offline);
            setViewState('playback');
        } finally {
            setIsGenerating(false);
            isFetchingRef.current = false;
            console.log('[HomePage] ── GENERATE END ──');
        }
    }, [showToast]);

    // ─── CUSTOM TEXT HANDLER (Section C) ───
    const handleCustomSubmit = useCallback((customScenario: Scenario) => {
        showToast('Kendi metniniz yüklendi!', 'success');
        setScenario(customScenario);
        setViewState('playback');
    }, [showToast]);

    const handleComplete = useCallback(() => {
        console.log('[HomePage] ✅ Session complete');
    }, []);

    const handleBack = useCallback(() => {
        console.log('[HomePage] ← Back');
        setScenario(null);
        if (selectedCourse) {
            setViewState('course-detail');
        } else {
            setViewState('dashboard');
        }
    }, [selectedCourse]);

    const handleBackToDashboard = useCallback(() => {
        console.log('[HomePage] ← Back to dashboard');
        setScenario(null);
        setSelectedCourse(null);
        setViewState('dashboard');
    }, []);

    // ─── PLAYBACK MODE ───
    if (viewState === 'playback' && scenario) {
        return (
            <>
                <ToastContainer toasts={toasts} />
                <AudioPlayer scenario={scenario} onComplete={handleComplete} onBack={handleBack} />
            </>
        );
    }

    // ─── COURSE DETAIL VIEW ───
    if (viewState === 'course-detail' && selectedCourse) {
        return (
            <main className="min-h-dvh flex flex-col px-4 py-8 max-w-lg mx-auto">
                <ToastContainer toasts={toasts} />

                {/* Back button */}
                <button
                    id="back-to-dashboard"
                    onClick={handleBackToDashboard}
                    className="self-start flex items-center gap-2 text-foreground-secondary hover:text-foreground
                     transition-colors duration-200 mb-6 text-sm"
                >
                    <span>←</span> Geri
                </button>

                {/* Course header */}
                <div className="flex items-center gap-4 mb-8">
                    <span className="text-5xl">{selectedCourse.emoji}</span>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{selectedCourse.title}</h1>
                        <p className="text-foreground-secondary text-sm mt-1">{selectedCourse.description}</p>
                    </div>
                </div>

                {/* Lessons list */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-foreground-muted text-xs font-medium uppercase tracking-wider mb-1">
                        Dersler ({selectedCourse.lessons.length})
                    </h2>
                    {selectedCourse.lessons.map((lesson, idx) => (
                        <button
                            key={lesson.id}
                            id={`lesson-${lesson.id}`}
                            onClick={() => handleLessonClick(lesson)}
                            className="lesson-card group flex items-center gap-4 p-5 rounded-2xl
                             bg-card border border-border/50 hover:border-border-hover
                             transition-all duration-300 active:scale-[0.98] text-left"
                        >
                            <div className={`flex items-center justify-center w-12 h-12 rounded-xl
                              bg-${selectedCourse.color}-500/10 text-${selectedCourse.color}-400
                              text-lg font-bold group-hover:scale-110 transition-transform duration-300`}>
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <p className="text-foreground font-medium text-lg">{lesson.title}</p>
                                <p className="text-foreground-muted text-sm mt-0.5">
                                    {lesson.scenario.lines.length} cümle · {selectedCourse.color === 'emerald' ? 'Başlangıç' :
                                        selectedCourse.color === 'blue' ? 'Orta' :
                                            selectedCourse.color === 'rose' ? 'İleri' : 'Günlük'}
                                </p>
                            </div>
                            <span className="text-foreground-faint group-hover:text-emerald-400 transition-colors duration-300 text-2xl">
                                ▶
                            </span>
                        </button>
                    ))}
                </div>
            </main>
        );
    }

    // ─── DASHBOARD MODE (Dual Tabs) ───
    return (
        <main className="min-h-dvh flex flex-col px-4 py-8 max-w-lg mx-auto">
            <ToastContainer toasts={toasts} />

            {/* Hero Section */}
            <div className="relative flex flex-col items-center mb-8">
                <div className="absolute top-0 right-0">
                    <ThemeToggle />
                </div>
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
                <button
                    id="tab-courses"
                    onClick={() => setActiveTab('courses')}
                    className={`flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider
                     transition-all duration-300 ${activeTab === 'courses'
                            ? 'bg-emerald-500 text-white dark:text-shadow-950 shadow-lg shadow-emerald-500/30'
                            : 'text-foreground-secondary hover:text-foreground'
                        }`}
                >
                    📚 Kurslar
                </button>
                <button
                    id="tab-ai"
                    onClick={() => setActiveTab('ai')}
                    className={`flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider
                     transition-all duration-300 ${activeTab === 'ai'
                            ? 'bg-emerald-500 text-white dark:text-shadow-950 shadow-lg shadow-emerald-500/30'
                            : 'text-foreground-secondary hover:text-foreground'
                        }`}
                >
                    🤖 AI
                </button>
                <button
                    id="tab-custom"
                    onClick={() => setActiveTab('custom')}
                    className={`flex-1 py-3.5 rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider
                     transition-all duration-300 ${activeTab === 'custom'
                            ? 'bg-emerald-500 text-white dark:text-shadow-950 shadow-lg shadow-emerald-500/30'
                            : 'text-foreground-secondary hover:text-foreground'
                        }`}
                >
                    ✍️ Metnim
                </button>
            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* Section A: Structured Courses (Offline)        */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'courses' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                            Çevrimdışı · Sıfır Gecikme
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {allCourses.map((course) => (
                            <button
                                key={course.id}
                                id={`course-${course.id}`}
                                onClick={() => handleCourseClick(course.id)}
                                className="course-card group relative flex items-center gap-4 p-5 rounded-2xl
                                 bg-card border border-border/50 hover:border-border-hover
                                 transition-all duration-300 active:scale-[0.98] text-left overflow-hidden"
                            >
                                {/* Accent glow */}
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
                                            {course.lessons.length} ders
                                        </span>
                                    </div>
                                </div>
                                <span className="text-foreground-faint group-hover:text-foreground transition-colors duration-300 text-xl relative z-10">
                                    →
                                </span>
                            </button>
                        ))}
                    </div>

                    <p className="mt-4 text-foreground-faint text-xs text-center">
                        Bu dersler internet bağlantısı gerektirmez.
                    </p>
                </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* Section B: Custom AI Scenarios (Online)         */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'ai' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                            Çevrimiçi · AI Senaryo
                        </span>
                    </div>

                    {isGenerating ? (
                        <GeneratingLoader />
                    ) : (
                        <>
                            <ScenarioForm onSubmit={handleGenerate} isLoading={isGenerating} />
                            <p className="mt-4 text-foreground-faint text-xs text-center max-w-xs mx-auto">
                                Konunuzu yazın ve AI sizin için Hollandaca-Türkçe bir ders oluştursun.
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* Section C: Custom Text Input                     */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'custom' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                            Özel İçerik · Manuel Format
                        </span>
                    </div>

                    <CustomTextForm onSubmit={handleCustomSubmit} />

                    <p className="mt-4 text-foreground-faint text-xs text-center max-w-xs mx-auto">
                        Kendi cümlelerinizi yapıştırın ve anında çalışın.
                    </p>
                </div>
            )}
        </main>
    );
}
