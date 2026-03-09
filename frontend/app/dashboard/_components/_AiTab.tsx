'use client';

// ─── ShadowDrive AI — AI Tab ───

import type { Session } from 'next-auth';
import ScenarioForm from '@/components/ScenarioForm';
import GeneratingLoader from '@/components/GeneratingLoader';
import SavedLessonCard from '@/components/SavedLessonCard';
import { Scenario, type CEFRLevel } from '@/types/dialogue';
import { getResumableId, getStoredProgress } from '@/lib/resumablePlayback';
import type { GeneratedLessonState, SavedAiLesson } from '../_types';

export interface AiTabProps {
    session: Session | null;
    isGenerating: boolean;
    isSaving: boolean;
    lastGeneratedLesson: GeneratedLessonState | null;
    savedAiLessons: SavedAiLesson[];
    editingLessonId: string | null;
    editingTitle: string;
    onGenerate: (topic: string, difficulty: CEFRLevel) => Promise<void>;
    onDismissLastLesson: () => void;
    onPreviewScenario: (sc: Scenario) => void;
    onPlayAiScenario: (sc: Scenario, options: { topic: string; level: string; savedId?: string }) => void;
    onEditStart: (id: string, currentTitle: string) => void;
    onEditChange: (value: string) => void;
    onEditCommit: (id: string) => void;
    onEditCancel: () => void;
    onDeleteRequest: (id: string, title: string) => void;
}

export default function AiTab({
    session,
    isGenerating,
    isSaving,
    lastGeneratedLesson,
    savedAiLessons,
    editingLessonId,
    editingTitle,
    onGenerate,
    onDismissLastLesson,
    onPreviewScenario,
    onPlayAiScenario,
    onEditStart,
    onEditChange,
    onEditCommit,
    onEditCancel,
    onDeleteRequest,
}: AiTabProps) {
    return (
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
                    <ScenarioForm onSubmit={onGenerate} isLoading={isGenerating} />
                    <p className="mt-2 text-foreground-faint text-xs text-center max-w-xs mx-auto">
                        Konunuzu yazın ve AI sizin için Hollandaca-Türkçe bir ders oluştursun.
                    </p>
                </>
            )}

            {/* ── Generated lesson card ── */}
            {lastGeneratedLesson && (() => {
                const aiResumableId = getResumableId('ai', {
                    topic: lastGeneratedLesson.topic,
                    level: lastGeneratedLesson.level,
                    savedId: lastGeneratedLesson.savedId ?? undefined,
                });
                const prog = getStoredProgress(aiResumableId, null, false);
                const isMastered = prog.completionCount >= prog.targetCount;
                const isStarted = prog.completionCount >= 1;
                const isPartial = prog.lastLineIndex > 0;
                return (
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-foreground font-semibold truncate">
                                {lastGeneratedLesson.scenario.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <p className="text-foreground-muted text-sm">
                                    {lastGeneratedLesson.level} · {lastGeneratedLesson.scenario.lines.length} cümle
                                </p>
                                {isMastered && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                        Öğrenildi
                                    </span>
                                )}
                                {!isMastered && isStarted && (
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
                        <button
                            onClick={onDismissLastLesson}
                            disabled={isSaving}
                            className="text-foreground-muted hover:text-foreground ml-2 flex-shrink-0 w-11 h-11
                             flex items-center justify-center rounded-lg hover:bg-background transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPreviewScenario(lastGeneratedLesson.scenario)}
                            title="Önizle"
                            className="flex items-center justify-center w-12 min-h-[44px] rounded-xl
                             bg-background border border-border hover:border-border-hover
                             text-foreground-muted hover:text-foreground transition-colors duration-200 active:scale-95"
                        >
                            👁
                        </button>
                        <button
                            onClick={() => onPlayAiScenario(lastGeneratedLesson.scenario, { topic: lastGeneratedLesson.topic, level: lastGeneratedLesson.level, savedId: lastGeneratedLesson.savedId })}
                            className="flex-1 min-h-[44px] rounded-xl bg-emerald-500 text-white font-semibold
                             hover:bg-emerald-400 transition-colors duration-200 active:scale-95"
                        >
                            ▶ Dinle
                        </button>
                        {session?.user?.id && (
                            <span className="flex items-center justify-center px-3 min-h-[44px] rounded-xl text-sm font-medium
                             bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                {lastGeneratedLesson.savedId ? '✓ Kaydedildi' : isSaving ? 'Kaydediliyor…' : '…'}
                            </span>
                        )}
                    </div>
                </div>
                );
            })()}

            {/* ── Saved AI lessons list ── */}
            {session?.user?.id && savedAiLessons.length > 0 && (
                <div className="flex flex-col gap-3 mt-2">
                    <h3 className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                        Kaydedilmiş Senaryolar
                    </h3>
                    {savedAiLessons.map((lesson) => {
                        const rid = getResumableId('ai', { savedId: lesson.id });
                        const p = getStoredProgress(rid, null, false);
                        return (
                        <SavedLessonCard
                            key={lesson.id}
                            id={lesson.id}
                            title={lesson.title ?? lesson.topic}
                            subtitle={`${lesson.level} · ${(lesson.content as Scenario).lines?.length ?? 0} cümle`}
                            progress={{
                                completionCount: p.completionCount,
                                targetCount: p.targetCount,
                                isPartial: p.lastLineIndex > 0,
                            }}
                            isEditing={editingLessonId === lesson.id}
                            editValue={editingTitle}
                            onPlay={() => onPlayAiScenario(lesson.content, { topic: lesson.topic, level: lesson.level, savedId: lesson.id })}
                            onPreview={() => onPreviewScenario(lesson.content)}
                            onEditStart={() => onEditStart(lesson.id, lesson.title ?? lesson.topic)}
                            onEditChange={onEditChange}
                            onEditCommit={() => onEditCommit(lesson.id)}
                            onEditCancel={onEditCancel}
                            onDelete={() => onDeleteRequest(lesson.id, lesson.title ?? lesson.topic)}
                        />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
