'use client';

// ─── ShadowDrive AI — Category View ───

import ThemeToggle from '@/components/ThemeToggle';
import { ToastContainer } from '@/components/Toast';
import { CATEGORY_META, SUBCATEGORY_META } from '../_constants';
import type { ApiCourse, ToastData } from '../_types';

export interface CategoryViewProps {
    toasts: ToastData[];
    selectedCategory: string;
    courses: ApiCourse[];
    onBack: () => void;
    onSubcategoryClick: (subcategory: string) => void;
}

export default function CategoryView({
    toasts,
    selectedCategory,
    courses,
    onBack,
    onSubcategoryClick,
}: CategoryViewProps) {
    const categoryCourses = courses.filter((c) => c.category === selectedCategory);
    const subcategories = Array.from(new Set(categoryCourses.map((c) => c.subcategory).filter(Boolean))) as string[];
    const meta = CATEGORY_META[selectedCategory];

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
                            onClick={() => onSubcategoryClick(sub)}
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
