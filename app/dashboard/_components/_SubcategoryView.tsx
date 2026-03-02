'use client';

// ─── ShadowDrive AI — Subcategory View ───

import ThemeToggle from '@/components/ThemeToggle';
import { ToastContainer } from '@/components/Toast';
import { CATEGORY_META, SUBCATEGORY_META } from '../_constants';
import type { ApiCourse, ProgressDataMap, ToastData } from '../_types';

export interface SubcategoryViewProps {
    toasts: ToastData[];
    selectedCategory: string;
    selectedSubcategory: string | null;
    courses: ApiCourse[];
    progressMap: ProgressDataMap;
    onBack: () => void;
    onCourseClick: (courseId: string) => void;
}

export default function SubcategoryView({
    toasts,
    selectedCategory,
    selectedSubcategory,
    courses,
    progressMap,
    onBack,
    onCourseClick,
}: SubcategoryViewProps) {
    const filteredCourses = courses.filter(
        (c) =>
            c.category === selectedCategory &&
            (selectedSubcategory ? c.subcategory === selectedSubcategory : c.subcategory === null)
    );
    const meta = CATEGORY_META[selectedCategory];
    const subMeta = selectedSubcategory ? SUBCATEGORY_META[selectedSubcategory] : null;

    return (
        <main className="min-h-dvh flex flex-col px-4 py-8 max-w-lg mx-auto">
            <ToastContainer toasts={toasts} />

            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-foreground-secondary hover:text-foreground
                     transition-colors duration-200 text-sm min-h-[44px]"
                >
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
                            onClick={() => onCourseClick(course.id)}
                            className="course-card group relative flex items-center gap-4 p-5 rounded-2xl
                             bg-card border border-border/50 hover:border-border-hover
                             transition-all duration-300 active:scale-[0.98] text-left overflow-hidden"
                        >
                            <div
                                className={`absolute inset-0 opacity-0 group-hover:opacity-100
                             transition-opacity duration-500 bg-gradient-to-r
                             from-${course.color}-500/5 to-transparent pointer-events-none`}
                            />
                            <span className="text-4xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                                {course.emoji}
                            </span>
                            <div className="flex-1 relative z-10">
                                <h3 className="text-foreground font-bold text-base leading-tight">{course.title}</h3>
                                <p className="text-foreground-muted text-sm mt-1">{course.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                     bg-${course.color}-500/10 text-${course.color}-400`}
                                    >
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
