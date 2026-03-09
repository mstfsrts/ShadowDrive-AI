'use client';

// ─── ShadowDrive AI — Custom Tab ───

import type { Session } from 'next-auth';
import CustomTextForm from '@/components/CustomTextForm';
import SavedLessonCard from '@/components/SavedLessonCard';
import { Scenario } from '@/types/dialogue';
import { getResumableId, getStoredProgress } from '@/lib/resumablePlayback';
import type { SavedCustomLesson } from '../_types';

export interface CustomTabProps {
    session: Session | null;
    isSaving: boolean;
    lastCustomScenario: { scenario: Scenario; savedId?: string } | null;
    savedCustomLessons: SavedCustomLesson[];
    editingLessonId: string | null;
    editingTitle: string;
    onCustomSubmit: (scenario: Scenario) => void;
    onDismissLastScenario: () => void;
    onPreviewScenario: (sc: Scenario) => void;
    onPlayCustomScenario: (sc: Scenario, options?: { savedId?: string }) => void;
    onEditStart: (id: string, currentTitle: string) => void;
    onEditChange: (value: string) => void;
    onEditCommit: (id: string) => void;
    onEditCancel: () => void;
    onDeleteRequest: (id: string, title: string) => void;
}

export default function CustomTab({
    session,
    isSaving,
    lastCustomScenario,
    savedCustomLessons,
    editingLessonId,
    editingTitle,
    onCustomSubmit,
    onDismissLastScenario,
    onPreviewScenario,
    onPlayCustomScenario,
    onEditStart,
    onEditChange,
    onEditCommit,
    onEditCancel,
    onDeleteRequest,
}: CustomTabProps) {
    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                    Özel İçerik · Manuel Format
                </span>
            </div>

            <CustomTextForm onSubmit={onCustomSubmit} />

            <p className="mt-2 text-foreground-faint text-xs text-center max-w-xs mx-auto">
                Kendi cümlelerinizi yapıştırın ve anında çalışın.
            </p>

            {/* ── Custom lesson card ── */}
            {lastCustomScenario && (() => {
                const customResumableId = getResumableId('custom', {
                    scenario: lastCustomScenario.scenario,
                    savedId: lastCustomScenario.savedId ?? undefined,
                });
                const prog = getStoredProgress(customResumableId, null, false);
                const isMastered = prog.completionCount >= prog.targetCount;
                const isStarted = prog.completionCount >= 1;
                const isPartial = prog.lastLineIndex > 0;
                return (
                <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-foreground font-semibold truncate">
                                {lastCustomScenario.scenario.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <p className="text-foreground-muted text-sm">
                                    {lastCustomScenario.scenario.lines.length} cümle
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
                            onClick={onDismissLastScenario}
                            className="text-foreground-muted hover:text-foreground ml-2 flex-shrink-0 w-11 h-11
                             flex items-center justify-center rounded-lg hover:bg-background transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPreviewScenario(lastCustomScenario.scenario)}
                            title="Önizle"
                            className="flex items-center justify-center w-12 min-h-[44px] rounded-xl
                             bg-background border border-border hover:border-border-hover
                             text-foreground-muted hover:text-foreground transition-colors duration-200 active:scale-95"
                        >
                            👁
                        </button>
                        <button
                            onClick={() => onPlayCustomScenario(lastCustomScenario.scenario, { savedId: lastCustomScenario.savedId })}
                            className="flex-1 min-h-[44px] rounded-xl bg-purple-500 text-white font-semibold
                             hover:bg-purple-400 transition-colors duration-200 active:scale-95"
                        >
                            ▶ Dinle
                        </button>
                        {session?.user?.id && (
                            <span className="flex items-center justify-center px-3 min-h-[44px] rounded-xl text-sm font-medium
                             bg-purple-500/10 text-purple-400 border border-purple-500/30">
                                {lastCustomScenario.savedId ? '✓ Kaydedildi' : isSaving ? 'Kaydediliyor…' : '…'}
                            </span>
                        )}
                    </div>
                </div>
                );
            })()}

            {/* ── Saved custom lessons list ── */}
            {session?.user?.id && savedCustomLessons.length > 0 && (
                <div className="flex flex-col gap-3 mt-2">
                    <h3 className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                        Kaydedilmiş Metinlerim
                    </h3>
                    {savedCustomLessons.map((lesson) => {
                        const rid = getResumableId('custom', { savedId: lesson.id });
                        const p = getStoredProgress(rid, null, false);
                        return (
                        <SavedLessonCard
                            key={lesson.id}
                            id={lesson.id}
                            title={lesson.title}
                            subtitle={`${(lesson.content as Scenario).lines?.length ?? 0} cümle`}
                            progress={{
                                completionCount: p.completionCount,
                                targetCount: p.targetCount,
                                isPartial: p.lastLineIndex > 0,
                            }}
                            isEditing={editingLessonId === lesson.id}
                            editValue={editingTitle}
                            onPlay={() => onPlayCustomScenario(lesson.content, { savedId: lesson.id })}
                            onPreview={() => onPreviewScenario(lesson.content)}
                            onEditStart={() => onEditStart(lesson.id, lesson.title)}
                            onEditChange={onEditChange}
                            onEditCommit={() => onEditCommit(lesson.id)}
                            onEditCancel={onEditCancel}
                            onDelete={() => onDeleteRequest(lesson.id, lesson.title)}
                        />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
