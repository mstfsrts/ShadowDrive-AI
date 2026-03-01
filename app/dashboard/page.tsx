'use client';

// ─── ShadowDrive AI — Dashboard Page ───
// ARCHITECTURE:
//   Section A: Structured Courses — DB-backed (Delftse Methode, GoedBezig)
//   Section B: Custom AI Scenarios — Online, Gemini-powered
//   Section C: Custom Text Input — Manual entry

import { useState, useCallback, useRef, useEffect } from 'react';
import ScenarioForm from '@/components/ScenarioForm';
import CustomTextForm from '@/components/CustomTextForm';
import AudioPlayer from '@/components/AudioPlayer';
import ThemeToggle from '@/components/ThemeToggle';
import AuthButton from '@/components/AuthButton';
import { useToast, ToastContainer } from '@/components/Toast';
import { Scenario, type CEFRLevel } from '@/types/dialogue';
import GeneratingLoader from '@/components/GeneratingLoader';
import { getCachedScenario, cacheScenario } from '@/lib/scenarioCache';
import { getOfflineScenario } from '@/lib/offlineScenarios';

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

type ActiveTab = 'courses' | 'ai' | 'custom';
type ViewState = 'dashboard' | 'category' | 'subcategory' | 'course-detail' | 'playback';

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
    const [activeTab, setActiveTab] = useState<ActiveTab>('courses');
    const [viewState, setViewState] = useState<ViewState>('dashboard');
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [courses, setCourses] = useState<ApiCourse[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
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
        showToast('Ders yüklendi!', 'success');
        setScenario(lesson.content);
        setViewState('playback');
    }, [showToast]);

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
            setScenario(cached);
            setViewState('playback');
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
                setScenario(offline);
                setViewState('playback');
                return;
            }

            const data: Scenario = await response.json();
            console.log(`[DashboardPage] ✅ Scenario received: "${data.title}" (${data.lines.length} lines)`);

            cacheScenario(topic, difficulty, data);
            showToast('Yeni ders oluşturuldu!', 'success');
            setScenario(data);
            setViewState('playback');

        } catch (err) {
            console.error('[DashboardPage] ❌ Fetch error:', err);
            showToast('Bağlantı sorunu — çevrimdışı ders yükleniyor', 'warning');
            const offline = getOfflineScenario(topic);
            setScenario(offline);
            setViewState('playback');
        } finally {
            setIsGenerating(false);
            isFetchingRef.current = false;
            console.log('[DashboardPage] ── GENERATE END ──');
        }
    }, [showToast]);

    // ─── CUSTOM TEXT HANDLER (Section C) ───
    const handleCustomSubmit = useCallback((customScenario: Scenario) => {
        showToast('Kendi metniniz yüklendi!', 'success');
        setScenario(customScenario);
        setViewState('playback');
    }, [showToast]);

    const handleComplete = useCallback(() => {
        console.log('[DashboardPage] ✅ Session complete');
    }, []);

    const handleBack = useCallback(() => {
        console.log('[DashboardPage] ← Back');
        setScenario(null);
        if (selectedCourse) {
            setViewState('course-detail');
        } else {
            setViewState('dashboard');
        }
    }, [selectedCourse]);

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
        setSelectedCategory(null);
        setSelectedSubcategory(null);
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
                    {filteredCourses.map((course) => (
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
            </main>
        );
    }

    // ─── COURSE DETAIL VIEW ───
    if (viewState === 'course-detail' && selectedCourse) {
        return (
            <main className="min-h-dvh flex flex-col px-4 py-8 max-w-lg mx-auto">
                <ToastContainer toasts={toasts} />

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
                                    {lesson.content.lines.length} cümle
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

    // ─── DASHBOARD MODE ───
    return (
        <main className="min-h-dvh flex flex-col px-4 py-8 max-w-lg mx-auto">
            <ToastContainer toasts={toasts} />

            {/* Header Bar */}
            <div className="flex items-center justify-between mb-6">
                <AuthButton />
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
                            <p className="mt-4 text-foreground-faint text-xs text-center max-w-xs mx-auto">
                                Konunuzu yazın ve AI sizin için Hollandaca-Türkçe bir ders oluştursun.
                            </p>
                        </>
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

                    <p className="mt-4 text-foreground-faint text-xs text-center max-w-xs mx-auto">
                        Kendi cümlelerinizi yapıştırın ve anında çalışın.
                    </p>
                </div>
            )}
        </main>
    );
}
