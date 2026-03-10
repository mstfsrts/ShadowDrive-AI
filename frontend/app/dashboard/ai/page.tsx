'use client';

// ─── /dashboard/ai — AI Tab Page ───
// Self-contained: owns its own hooks, handles play/preview navigation
// via sessionStorage + router.push.

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToastContext } from '../_contexts/ToastContext';
import { useAiLessonsState } from '../_hooks/useAiLessonsState';
import { setPlaySession, setPreviewSession } from '@/lib/playSession';
import { getResumableId, getStoredLastLineIndex } from '@/lib/resumablePlayback';
import { Scenario, type CEFRLevel } from '@/types/dialogue';
import ScenarioForm from '@/components/ScenarioForm';
import GeneratingLoader from '@/components/GeneratingLoader';
import SavedLessonCard from '@/components/SavedLessonCard';
import ConfirmModal from '@/components/ConfirmModal';
import { getStoredProgress } from '@/lib/resumablePlayback';

export default function AiPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { showToast } = useToastContext();
    const userId = session?.user?.id;

    // ─── AI lessons state ───
    const ai = useAiLessonsState({
        userId,
        showToast,
        onOfflineFallback: (sc: Scenario, topic: string, level: CEFRLevel) => {
            const resumableId = getResumableId('ai', { topic, level });
            setPlaySession({
                scenario: sc,
                resumableId,
                startFromIndex: 0,
                isCourse: false,
                type: 'ai',
                id: 'offline',
            });
            router.push('/play/ai/offline');
        },
    });

    // ─── Edit state (local) ───
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

    // ─── Navigation handlers ───
    const handlePlayAiScenario = useCallback(
        (sc: Scenario, opts: { topic: string; level: string; savedId?: string }) => {
            const resumableId = getResumableId('ai', {
                topic: opts.topic,
                level: opts.level,
                savedId: opts.savedId,
            });
            const lastLine = getStoredLastLineIndex(resumableId, null, false);
            const urlId = opts.savedId ?? `${opts.topic}_${opts.level}`.replace(/[^a-z0-9]/gi, '_').slice(0, 60);

            setPlaySession({
                scenario: sc,
                resumableId,
                startFromIndex: lastLine > 0 ? lastLine : 0,
                isCourse: false,
                type: 'ai',
                id: urlId,
            });
            router.push(`/play/ai/${urlId}`);
        },
        [router],
    );

    const handlePreviewScenario = useCallback(
        (sc: Scenario, opts?: { topic?: string; level?: string; savedId?: string }) => {
            const urlId = opts?.savedId ?? 'generated';
            setPreviewSession({
                scenario: sc,
                type: 'ai',
                id: urlId,
                resumableId: opts ? getResumableId('ai', {
                    topic: opts.topic,
                    level: opts.level,
                    savedId: opts.savedId,
                }) : undefined,
                isCourse: false,
            });
            router.push('/preview');
        },
        [router],
    );

    // ─── Edit handlers ───
    const handleEditStart = (id: string, currentTitle: string) => {
        setEditingLessonId(id);
        setEditingTitle(currentTitle);
    };
    const handleEditCancel = () => {
        setEditingLessonId(null);
        setEditingTitle('');
    };
    const handleEditCommit = async (id: string) => {
        const success = await ai.handleRenameAiLesson(id, editingTitle);
        if (success) handleEditCancel();
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <ConfirmModal
                open={!!deleteConfirm}
                title="Bu dersi silmek istediğinize emin misiniz?"
                subtitle={deleteConfirm?.title}
                confirmLabel="Sil"
                cancelLabel="İptal"
                variant="danger"
                onConfirm={async () => {
                    if (!deleteConfirm) return;
                    try {
                        await ai.handleDeleteAiLesson(deleteConfirm.id);
                    } finally {
                        setDeleteConfirm(null);
                    }
                }}
                onCancel={() => setDeleteConfirm(null)}
            />

            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                    Çevrimiçi · AI Senaryo
                </span>
            </div>

            {ai.isGenerating ? (
                <GeneratingLoader />
            ) : (
                <>
                    <ScenarioForm onSubmit={ai.handleGenerate} isLoading={ai.isGenerating} />
                    <p className="mt-2 text-foreground-faint text-xs text-center max-w-xs mx-auto">
                        Konunuzu yazın ve AI sizin için Hollandaca-Türkçe bir ders oluştursun.
                    </p>
                </>
            )}

            {/* ── Generated lesson card ── */}
            {ai.lastGeneratedLesson && (() => {
                const aiResumableId = getResumableId('ai', {
                    topic: ai.lastGeneratedLesson.topic,
                    level: ai.lastGeneratedLesson.level,
                    savedId: ai.lastGeneratedLesson.savedId ?? undefined,
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
                                    {ai.lastGeneratedLesson.scenario.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <p className="text-foreground-muted text-sm">
                                        {ai.lastGeneratedLesson.level} · {ai.lastGeneratedLesson.scenario.lines.length} cümle
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
                                onClick={() => ai.setLastGeneratedLesson(null)}
                                disabled={ai.isSaving}
                                className="text-foreground-muted hover:text-foreground ml-2 flex-shrink-0 w-11 h-11
                                 flex items-center justify-center rounded-lg hover:bg-background transition-colors
                                 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePreviewScenario(ai.lastGeneratedLesson!.scenario, {
                                    topic: ai.lastGeneratedLesson!.topic,
                                    level: ai.lastGeneratedLesson!.level,
                                    savedId: ai.lastGeneratedLesson!.savedId,
                                })}
                                title="Önizle"
                                className="flex items-center justify-center w-12 min-h-[44px] rounded-xl
                                 bg-background border border-border hover:border-border-hover
                                 text-foreground-muted hover:text-foreground transition-colors duration-200 active:scale-95"
                            >
                                👁
                            </button>
                            <button
                                onClick={() => handlePlayAiScenario(ai.lastGeneratedLesson!.scenario, {
                                    topic: ai.lastGeneratedLesson!.topic,
                                    level: ai.lastGeneratedLesson!.level,
                                    savedId: ai.lastGeneratedLesson!.savedId,
                                })}
                                className="flex-1 min-h-[44px] rounded-xl bg-emerald-500 text-white font-semibold
                                 hover:bg-emerald-400 transition-colors duration-200 active:scale-95"
                            >
                                ▶ Dinle
                            </button>
                            {session?.user?.id && (
                                <span className="flex items-center justify-center px-3 min-h-[44px] rounded-xl text-sm font-medium
                                 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                    {ai.lastGeneratedLesson.savedId ? '✓ Kaydedildi' : ai.isSaving ? 'Kaydediliyor…' : '…'}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* ── Saved AI lessons list ── */}
            {session?.user?.id && ai.savedAiLessons.length > 0 && (
                <div className="flex flex-col gap-3 mt-2">
                    <h3 className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                        Kaydedilmiş Senaryolar
                    </h3>
                    {ai.savedAiLessons.map((lesson) => {
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
                                onPlay={() => handlePlayAiScenario(lesson.content, { topic: lesson.topic, level: lesson.level, savedId: lesson.id })}
                                onPreview={() => handlePreviewScenario(lesson.content, { savedId: lesson.id })}
                                onEditStart={() => handleEditStart(lesson.id, lesson.title ?? lesson.topic)}
                                onEditChange={setEditingTitle}
                                onEditCommit={() => void handleEditCommit(lesson.id)}
                                onEditCancel={handleEditCancel}
                                onDelete={() => setDeleteConfirm({ id: lesson.id, title: lesson.title ?? lesson.topic })}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
