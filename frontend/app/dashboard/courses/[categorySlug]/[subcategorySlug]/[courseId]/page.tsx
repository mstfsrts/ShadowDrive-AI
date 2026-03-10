'use client';

// ─── /dashboard/courses/[...]/[courseId] — Course Detail (Lesson List) ───

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ThemeToggle from '@/components/ThemeToggle';
import ResumePromptModal from '@/components/ResumePromptModal';
import { useCoursesContext } from '../../../../_contexts/CoursesContext';
import { useToastContext } from '../../../../_contexts/ToastContext';
import { setPlaySession, setPreviewSession } from '@/lib/playSession';
import { getResumableId, getStoredLastLineIndex, setStoredLastLineIndex, type ProgressDataLike } from '@/lib/resumablePlayback';
import type { ApiLesson, ResumeState } from '../../../../_types';

export default function CourseDetailPage() {
    const { categorySlug, subcategorySlug, courseId } = useParams<{
        categorySlug: string;
        subcategorySlug: string;
        courseId: string;
    }>();
    const router = useRouter();
    const { data: session } = useSession();
    const { courses, progressMap, setProgressMap } = useCoursesContext();
    const { showToast } = useToastContext();
    const [resumeState, setResumeState] = useState<ResumeState | null>(null);

    const course = courses.find(c => c.id === courseId);

    const navigateToPlay = useCallback((lesson: ApiLesson, startFromIndex: number) => {
        if (!course) return;
        const resumableId = getResumableId('course', { courseId: course.id, lessonId: lesson.id });
        setPlaySession({
            scenario: lesson.content,
            resumableId,
            startFromIndex,
            isCourse: true,
            courseId: course.id,
            lessonId: lesson.id,
            type: 'course',
            id: `${course.id}__${lesson.id}`,
        });
        router.push(`/play/course/${course.id}__${lesson.id}`);
    }, [course, router]);

    const handleLessonClick = useCallback((lesson: ApiLesson) => {
        if (!course) return;
        const resumableId = getResumableId('course', { courseId: course.id, lessonId: lesson.id });
        const lastLineIndex = getStoredLastLineIndex(resumableId, progressMap, true);

        if (lastLineIndex > 0) {
            setResumeState({
                resumableId,
                title: lesson.title,
                lastLineIndex,
                scenario: lesson.content,
                isCourse: true,
                lesson,
                course,
            });
            return;
        }

        showToast('Ders yüklendi!', 'success');
        navigateToPlay(lesson, 0);
    }, [course, progressMap, showToast, navigateToPlay]);

    const handleResume = useCallback(() => {
        if (!resumeState?.lesson) return;
        showToast('Kaldığın yerden devam ediliyor', 'success');
        navigateToPlay(resumeState.lesson, resumeState.lastLineIndex);
        setResumeState(null);
    }, [resumeState, showToast, navigateToPlay]);

    const handleRestart = useCallback(async () => {
        if (!course || !resumeState?.lesson) return;
        const resumableId = getResumableId('course', { courseId: course.id, lessonId: resumeState.lesson.id });
        await setStoredLastLineIndex(resumableId, 0, true, {
            session,
            courseId: course.id,
            lessonId: resumeState.lesson.id,
            setProgressMap: setProgressMap as (fn: (prev: Record<string, ProgressDataLike>) => Record<string, ProgressDataLike>) => void,
        });
        showToast('Ders baştan başlıyor', 'success');
        navigateToPlay(resumeState.lesson, 0);
        setResumeState(null);
    }, [resumeState, course, session, setProgressMap, showToast, navigateToPlay]);

    const handlePreview = useCallback((lesson: ApiLesson) => {
        if (!course) return;
        setPreviewSession({
            scenario: lesson.content,
            type: 'course',
            id: `${course.id}__${lesson.id}`,
            resumableId: getResumableId('course', { courseId: course.id, lessonId: lesson.id }),
            isCourse: true,
            courseId: course.id,
            lessonId: lesson.id,
        });
        router.push('/preview');
    }, [course, router]);

    if (!course) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center px-4">
                <p className="text-foreground-secondary text-lg">Kurs bulunamadı</p>
                <button onClick={() => router.push('/dashboard/courses')} className="mt-4 text-emerald-500 underline">
                    Kurslara Dön
                </button>
            </main>
        );
    }

    return (
        <main className="min-h-dvh flex flex-col px-4 py-8 max-w-lg mx-auto">
            {resumeState && (
                <ResumePromptModal
                    title={resumeState.title}
                    lastLineIndex={resumeState.lastLineIndex}
                    onResume={handleResume}
                    onRestart={() => void handleRestart()}
                    onDismiss={() => setResumeState(null)}
                />
            )}

            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => router.push(`/dashboard/courses/${categorySlug}/${subcategorySlug}`)}
                    className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors text-sm min-h-[44px]"
                >
                    <span>←</span> Geri
                </button>
                <ThemeToggle />
            </div>

            <div className="flex items-center gap-4 mb-8">
                <span className="text-5xl">{course.emoji}</span>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
                    <p className="text-foreground-secondary text-sm mt-1">{course.description}</p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="text-foreground-muted text-xs font-medium uppercase tracking-wider mb-1">
                    Dersler ({course.lessons.length})
                </h2>
                {course.lessons.map((lesson, idx) => {
                    const prog = progressMap[lesson.id];
                    const isMastered = prog && prog.completionCount >= prog.targetCount;
                    const isStarted = prog && prog.completionCount >= 1;
                    const isPartial = prog && !prog.completed && prog.lastLineIndex > 0;

                    return (
                        <div key={lesson.id} className="flex items-stretch gap-2">
                            <button
                                onClick={() => handleLessonClick(lesson)}
                                className="lesson-card group flex-1 flex items-center gap-4 p-5 rounded-2xl
                                 bg-card border border-border/50 hover:border-border-hover
                                 transition-all duration-300 active:scale-[0.98] text-left"
                            >
                                <div className={`flex items-center justify-center w-12 h-12 rounded-xl
                                  text-lg font-bold group-hover:scale-110 transition-transform duration-300
                                  ${isMastered
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : `bg-${course.color}-500/10 text-${course.color}-400`
                                  }`}
                                >
                                    {isMastered ? '★' : idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-foreground font-medium text-lg">{lesson.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <p className="text-foreground-muted text-sm">{lesson.content.lines.length} cümle</p>
                                        {isMastered && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                                Öğrenildi
                                            </span>
                                        )}
                                        {!isMastered && isStarted && prog && (
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
                                <span className="text-foreground-faint group-hover:text-emerald-400 transition-colors text-2xl">
                                    {isMastered ? '✓' : '▶'}
                                </span>
                            </button>

                            <button
                                onClick={() => handlePreview(lesson)}
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
