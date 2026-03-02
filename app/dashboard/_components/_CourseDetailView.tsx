'use client';

// ─── ShadowDrive AI — Course Detail View ───

import ThemeToggle from '@/components/ThemeToggle';
import { ToastContainer } from '@/components/Toast';
import ResumePromptModal from '@/components/ResumePromptModal';
import type { ApiCourse, ApiLesson, ProgressDataMap, ResumeState, ToastData } from '../_types';

export interface CourseDetailViewProps {
    toasts: ToastData[];
    selectedCourse: ApiCourse;
    progressMap: ProgressDataMap;
    resumeState: ResumeState | null;
    onBack: () => void;
    onLessonClick: (lesson: ApiLesson) => void;
    onPreviewClick: (lesson: ApiLesson) => void;
    onResume: () => void;
    onRestart: () => void;
    onDismissResume: () => void;
}

export default function CourseDetailView({
    toasts,
    selectedCourse,
    progressMap,
    resumeState,
    onBack,
    onLessonClick,
    onPreviewClick,
    onResume,
    onRestart,
    onDismissResume,
}: CourseDetailViewProps) {
    return (
        <main className="min-h-dvh flex flex-col px-4 py-8 max-w-lg mx-auto">
            <ToastContainer toasts={toasts} />

            {resumeState && (
                <ResumePromptModal
                    title={resumeState.title}
                    lastLineIndex={resumeState.lastLineIndex}
                    onResume={onResume}
                    onRestart={() => void onRestart()}
                    onDismiss={onDismissResume}
                />
            )}

            <div className="flex items-center justify-between mb-6">
                <button
                    id="back-to-dashboard"
                    onClick={onBack}
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
                                onClick={() => onLessonClick(lesson)}
                                className="lesson-card group flex-1 flex items-center gap-4 p-5 rounded-2xl
                                 bg-card border border-border/50 hover:border-border-hover
                                 transition-all duration-300 active:scale-[0.98] text-left"
                            >
                                <div
                                    className={`flex items-center justify-center w-12 h-12 rounded-xl
                                      text-lg font-bold group-hover:scale-110 transition-transform duration-300
                                      ${
                                          isMastered
                                              ? 'bg-emerald-500/20 text-emerald-400'
                                              : `bg-${selectedCourse.color}-500/10 text-${selectedCourse.color}-400`
                                      }`}
                                >
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
                                onClick={() => onPreviewClick(lesson)}
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
