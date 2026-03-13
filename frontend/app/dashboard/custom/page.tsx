'use client';

// ─── /dashboard/custom — Custom Text Tab Page ───
// Self-contained: owns its own hooks, handles play/preview navigation
// via sessionStorage + router.push.

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToastContext } from '../_contexts/ToastContext';
import { useCustomLessonsState } from '../_hooks/useCustomLessonsState';
import { setPlaySession, setPreviewSession } from '@/lib/playSession';
import { getResumableId, getStoredLastLineIndex, getStoredProgress } from '@/lib/resumablePlayback';
import { Scenario } from '@/types/dialogue';
import CustomTextForm from '@/components/CustomTextForm';
import SavedLessonCard from '@/components/SavedLessonCard';
import ConfirmModal from '@/components/ConfirmModal';

export default function CustomPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { showToast } = useToastContext();
    const userId = session?.user?.id;
    const t = useTranslations('lessons');
    const tc = useTranslations('common');

    const custom = useCustomLessonsState({ userId, showToast });

    // ─── Edit state (local) ───
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

    // ─── Navigation handlers ───
    const handlePlayCustomScenario = useCallback(
        (sc: Scenario, opts?: { savedId?: string }) => {
            const resumableId = getResumableId('custom', {
                savedId: opts?.savedId,
                scenario: sc,
            });
            const lastLine = getStoredLastLineIndex(resumableId, null, false);
            const urlId = opts?.savedId ?? 'text';

            setPlaySession({
                scenario: sc,
                resumableId,
                startFromIndex: lastLine > 0 ? lastLine : 0,
                isCourse: false,
                type: 'custom',
                id: urlId,
            });
            router.push(`/play/custom/${urlId}`);
        },
        [router],
    );

    const handlePreviewScenario = useCallback(
        (sc: Scenario, savedId?: string) => {
            const urlId = savedId ?? 'text';
            setPreviewSession({
                scenario: sc,
                type: 'custom',
                id: urlId,
                resumableId: getResumableId('custom', { savedId, scenario: sc }),
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
        const success = await custom.handleRenameCustomLesson(id, editingTitle);
        if (success) handleEditCancel();
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            <ConfirmModal
                open={!!deleteConfirm}
                title={t('deleteConfirmTitle')}
                subtitle={deleteConfirm?.title}
                confirmLabel={t('delete')}
                cancelLabel={tc('cancel')}
                variant="danger"
                onConfirm={async () => {
                    if (!deleteConfirm) return;
                    try {
                        await custom.handleDeleteCustomLesson(deleteConfirm.id);
                    } finally {
                        setDeleteConfirm(null);
                    }
                }}
                onCancel={() => setDeleteConfirm(null)}
            />

            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                    {t('onlineCustom')}
                </span>
            </div>

            <CustomTextForm onSubmit={custom.handleCustomSubmit} />

            <p className="mt-2 text-foreground-faint text-xs text-center max-w-xs mx-auto">
                {t('customHint')}
            </p>

            {/* ── Custom lesson card ── */}
            {custom.lastCustomScenario && (() => {
                const customResumableId = getResumableId('custom', {
                    scenario: custom.lastCustomScenario.scenario,
                    savedId: custom.lastCustomScenario.savedId ?? undefined,
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
                                    {custom.lastCustomScenario.scenario.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <p className="text-foreground-muted text-sm">
                                        {custom.lastCustomScenario.scenario.lines.length} {t('sentences')}
                                    </p>
                                    {isMastered && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                            {t('mastered')}
                                        </span>
                                    )}
                                    {!isMastered && isStarted && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                                            {prog.completionCount}/{prog.targetCount}
                                        </span>
                                    )}
                                    {isPartial && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
                                            ⏸ {t('partial')}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => custom.setLastCustomScenario(null)}
                                className="text-foreground-muted hover:text-foreground ml-2 flex-shrink-0 w-11 h-11
                                 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePreviewScenario(custom.lastCustomScenario!.scenario, custom.lastCustomScenario!.savedId)}
                                title={t('preview')}
                                className="flex items-center justify-center w-12 min-h-[44px] rounded-xl
                                 bg-background border border-border hover:border-border-hover
                                 text-foreground-muted hover:text-foreground transition-colors duration-200 active:scale-95"
                            >
                                👁
                            </button>
                            <button
                                onClick={() => handlePlayCustomScenario(custom.lastCustomScenario!.scenario, { savedId: custom.lastCustomScenario!.savedId })}
                                className="flex-1 min-h-[44px] rounded-xl bg-purple-500 text-white font-semibold
                                 hover:bg-purple-400 transition-colors duration-200 active:scale-95"
                            >
                                ▶ {t('listen')}
                            </button>
                            {session?.user?.id && (
                                <span className="flex items-center justify-center px-3 min-h-[44px] rounded-xl text-sm font-medium
                                 bg-purple-500/10 text-purple-400 border border-purple-500/30">
                                    {custom.lastCustomScenario.savedId ? `✓ ${t('saved')}` : custom.isSaving ? t('saving') : '…'}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* ── Saved custom lessons list ── */}
            {session?.user?.id && custom.savedCustomLessons.length > 0 && (
                <div className="flex flex-col gap-3 mt-2">
                    <h3 className="text-xs text-foreground-muted uppercase tracking-widest font-medium">
                        {t('savedTexts')}
                    </h3>
                    {custom.savedCustomLessons.map((lesson) => {
                        const rid = getResumableId('custom', { savedId: lesson.id });
                        const p = getStoredProgress(rid, null, false);
                        return (
                            <SavedLessonCard
                                key={lesson.id}
                                id={lesson.id}
                                title={lesson.title}
                                subtitle={`${(lesson.content as Scenario).lines?.length ?? 0} ${t('sentences')}`}
                                progress={{
                                    completionCount: p.completionCount,
                                    targetCount: p.targetCount,
                                    isPartial: p.lastLineIndex > 0,
                                }}
                                isEditing={editingLessonId === lesson.id}
                                editValue={editingTitle}
                                onPlay={() => handlePlayCustomScenario(lesson.content, { savedId: lesson.id })}
                                onPreview={() => handlePreviewScenario(lesson.content, lesson.id)}
                                onEditStart={() => handleEditStart(lesson.id, lesson.title)}
                                onEditChange={setEditingTitle}
                                onEditCommit={() => void handleEditCommit(lesson.id)}
                                onEditCancel={handleEditCancel}
                                onDelete={() => setDeleteConfirm({ id: lesson.id, title: lesson.title })}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
