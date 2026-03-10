'use client';

// ─── /dashboard/courses — Kategori Grid ───

import { useRouter } from 'next/navigation';
import { useCoursesContext } from '../_contexts/CoursesContext';
import { categoryToSlug } from '@/lib/slugs';
import { CATEGORY_META } from '../_constants';
import CourseCardSkeleton from '../_components/_CourseCardSkeleton';

export default function CoursesPage() {
    const router = useRouter();
    const { courses, coursesLoading } = useCoursesContext();

    // Extract unique categories from courses
    const categories = Array.from(new Set(courses.map(c => c.category)));

    if (coursesLoading) {
        return (
            <div className="flex flex-col gap-4 animate-fade-in">
                <CourseCardSkeleton />
                <CourseCardSkeleton />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                    Çevrimdışı · Hazır Kurslar
                </span>
            </div>

            {categories.map((category) => {
                const meta = CATEGORY_META[category];
                const slug = categoryToSlug(category);
                const courseCount = courses.filter(c => c.category === category).length;

                return (
                    <button
                        key={category}
                        onClick={() => slug && router.push(`/dashboard/courses/${slug}`)}
                        className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border
                         hover:border-border-hover hover:bg-card-hover transition-all duration-200
                         active:scale-[0.98] text-left w-full min-h-[44px]"
                    >
                        <span className="text-3xl flex-shrink-0">{meta?.emoji ?? '📖'}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-foreground font-semibold truncate">{category}</p>
                            <p className="text-foreground-muted text-sm">
                                {meta?.description ?? `${courseCount} kurs`}
                            </p>
                        </div>
                        <span className="text-foreground-faint text-xl">→</span>
                    </button>
                );
            })}
        </div>
    );
}
