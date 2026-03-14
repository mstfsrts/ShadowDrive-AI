'use client';

// ─── /dashboard/courses/[categorySlug]/[subcategorySlug] — Course List ───

import { useParams, useRouter } from 'next/navigation';

import { useCoursesContext } from '../../../_contexts/CoursesContext';
import { slugToCategory, slugToSubcategory } from '@/lib/slugs';
import { CATEGORY_META, SUBCATEGORY_META } from '../../../_constants';

export default function SubcategoryPage() {
    const { categorySlug, subcategorySlug } = useParams<{ categorySlug: string; subcategorySlug: string }>();
    const router = useRouter();
    const { courses, progressMap } = useCoursesContext();

    const categoryName = slugToCategory(categorySlug);
    // "all" is a virtual subcategory for categories without subcategories
    const subcategoryName = subcategorySlug === 'all' ? null : slugToSubcategory(subcategorySlug);

    if (!categoryName) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center px-4">
                <p className="text-foreground-secondary text-lg">Kategori bulunamadı</p>
                <button onClick={() => router.push('/dashboard/courses')} className="mt-4 text-emerald-500 underline min-h-[44px] flex items-center">
                    Kurslara Dön
                </button>
            </main>
        );
    }

    const filteredCourses = courses.filter(
        c => c.category === categoryName &&
            (subcategorySlug === 'all' ? true : c.subcategory === subcategoryName)
    );
    const meta = CATEGORY_META[categoryName];
    const subMeta = subcategoryName ? SUBCATEGORY_META[subcategoryName] : null;

    return (
        <main className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <span className="text-5xl">{subMeta?.emoji ?? meta?.emoji ?? '📂'}</span>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {subcategoryName ?? categoryName}
                    </h1>
                    {subcategoryName && (
                        <p className="text-foreground-secondary text-sm mt-1">{categoryName}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {filteredCourses.length === 0 && (
                    <p className="text-foreground-muted text-center py-8">Bu kategoride henüz kurs bulunmuyor.</p>
                )}
                {filteredCourses.map(course => {
                    const completedLessons = course.lessons.filter(
                        l => progressMap[l.id]?.completionCount >= 1
                    ).length;

                    return (
                        <button
                            key={course.id}
                            onClick={() => router.push(`/dashboard/courses/${categorySlug}/${subcategorySlug}/${course.id}`)}
                            className="course-card group relative flex items-center gap-4 p-5 rounded-2xl
                             bg-card border border-border/50 hover:border-border-hover
                             transition-all duration-300 active:scale-[0.98] text-left overflow-hidden"
                        >
                            <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                                {course.emoji}
                            </span>
                            <div className="flex-1">
                                <h3 className="text-foreground font-bold text-base leading-tight">{course.title}</h3>
                                <p className="text-foreground-muted text-sm mt-1">{course.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                     bg-foreground/5 text-foreground-muted">
                                        {course.lessons.length} ders
                                    </span>
                                    {completedLessons > 0 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                         bg-emerald-500/10 text-emerald-400">
                                            {completedLessons}/{course.lessons.length} tamamlandı
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-foreground-faint group-hover:text-foreground transition-colors text-xl">→</span>
                        </button>
                    );
                })}
            </div>
        </main>
    );
}
