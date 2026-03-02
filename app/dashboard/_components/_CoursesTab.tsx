'use client';

// ─── ShadowDrive AI — Courses Tab ───

import { CATEGORY_META } from '../_constants';
import type { ApiCourse } from '../_types';
import CourseCardSkeleton from './_CourseCardSkeleton';

export interface CoursesTabProps {
    courses: ApiCourse[];
    coursesLoading: boolean;
    onCategoryClick: (category: string) => void;
}

export default function CoursesTab({ courses, coursesLoading, onCategoryClick }: CoursesTabProps) {
    return (
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
                                onClick={() => onCategoryClick(category)}
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
    );
}
