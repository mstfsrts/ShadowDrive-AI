'use client';

// ─── /dashboard/courses/[categorySlug] — Subcategory or Course List ───

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useCoursesContext } from '../../_contexts/CoursesContext';
import { slugToCategory, subcategoryToSlug } from '@/lib/slugs';
import { CATEGORY_META, SUBCATEGORY_META } from '../../_constants';

export default function CategoryPage() {
    const { categorySlug } = useParams<{ categorySlug: string }>();
    const router = useRouter();
    const { courses } = useCoursesContext();
    const tc = useTranslations('courses');
    const tCommon = useTranslations('common');

    const categoryName = slugToCategory(categorySlug);
    if (!categoryName) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center px-4">
                <p className="text-foreground-secondary text-lg">{tCommon('error')}</p>
                <button onClick={() => router.push('/dashboard/courses')} className="mt-4 text-emerald-500 underline min-h-[44px] flex items-center">
                    {tCommon('back')}
                </button>
            </main>
        );
    }

    const categoryCourses = courses.filter(c => c.category === categoryName);
    const subcategories = Array.from(new Set(categoryCourses.map(c => c.subcategory).filter(Boolean))) as string[];
    const meta = CATEGORY_META[categoryName];

    // If no subcategories, redirect to a virtual "all" subcategory
    if (subcategories.length === 0) {
        // Show courses directly (same as subcategory page)
        return (
            <main className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <span className="text-5xl">{meta?.emoji ?? '📂'}</span>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{categoryName}</h1>
                        <p className="text-foreground-secondary text-sm mt-1">{categoryCourses.length} kurs</p>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    {categoryCourses.map(course => (
                        <button
                            key={course.id}
                            onClick={() => router.push(`/dashboard/courses/${categorySlug}/all/${course.id}`)}
                            className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border
                             hover:border-border-hover transition-all duration-200 active:scale-[0.98] text-left"
                        >
                            <span className="text-3xl">{course.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-foreground font-semibold truncate">{course.title}</p>
                                <p className="text-foreground-muted text-sm">{course.lessons.length} ders</p>
                            </div>
                            <span className="text-foreground-faint text-xl">→</span>
                        </button>
                    ))}
                </div>
            </main>
        );
    }

    // Show subcategory list
    return (
        <main className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <span className="text-5xl">{meta?.emoji ?? '📂'}</span>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{categoryName}</h1>
                    <p className="text-foreground-secondary text-sm mt-1">{meta?.descriptionKey ? tc(meta.descriptionKey as 'delftseDesc' | 'goedDesc') : ''}</p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {subcategories.map(sub => {
                    const subCourses = categoryCourses.filter(c => c.subcategory === sub);
                    const subMeta = SUBCATEGORY_META[sub];
                    const subSlug = subcategoryToSlug(sub) ?? sub.toLowerCase().replace(/\s+/g, '-');

                    return (
                        <button
                            key={sub}
                            onClick={() => router.push(`/dashboard/courses/${categorySlug}/${subSlug}`)}
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
                            <span className="text-foreground-faint group-hover:text-foreground transition-colors text-xl">→</span>
                        </button>
                    );
                })}
            </div>
        </main>
    );
}
