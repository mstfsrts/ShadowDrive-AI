'use client';

// ─── /play/[type]/[id] — Standalone Playback Page ───
// Reads scenario from sessionStorage. Renders AudioPlayer.
// On complete/back, saves progress and navigates back.

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AudioPlayer from '@/components/AudioPlayer';
import { ToastContainer, useToast } from '@/components/Toast';
import { getPlaySession, clearPlaySession } from '@/lib/playSession';
import {
    setStoredLastLineIndex,
    incrementStoredCompletionCount,
} from '@/lib/resumablePlayback';
import { backendFetch } from '@/lib/backendFetch';

export default function PlayPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { toasts, showToast } = useToast();
    const [playData] = useState(() => getPlaySession());

    const handleComplete = useCallback(async () => {
        if (!playData) return;

        if (playData.isCourse && session?.user?.id) {
            try {
                const res = await backendFetch(
                    '/api/progress',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            courseId: playData.courseId,
                            lessonId: playData.lessonId,
                            lastLineIndex: -1,
                            completed: true,
                        }),
                    },
                    true,
                );
                if (res.ok) {
                    const progress = await res.json();
                    const remaining = progress.targetCount - progress.completionCount;
                    showToast(
                        remaining > 0 ? `Tekrar: ${remaining} seans kaldı` : 'Bu ders tam öğrenildi!',
                        'success',
                    );
                }
            } catch {
                // silent
            }
        } else {
            const next = incrementStoredCompletionCount(playData.resumableId);
            if (next) {
                const remaining = next.targetCount - next.completionCount;
                showToast(
                    remaining > 0 ? `Tekrar: ${remaining} seans kaldı` : 'Bu ders tam öğrenildi!',
                    'success',
                );
            }
        }
    }, [playData, session, showToast]);

    const handleBack = useCallback(async (lastLineIndex: number) => {
        if (!playData) return;

        await setStoredLastLineIndex(playData.resumableId, lastLineIndex, playData.isCourse, {
            session,
            courseId: playData.courseId,
            lessonId: playData.lessonId,
        });

        clearPlaySession();
        router.back();
    }, [playData, session, router]);

    // If no session data, show fallback
    if (!playData?.scenario) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center px-4 gap-4">
                <span className="text-5xl">🔍</span>
                <p className="text-foreground-secondary text-lg text-center">Ders bulunamadı</p>
                <p className="text-foreground-muted text-sm text-center">
                    Oturum veriniz kaybolmuş olabilir. Lütfen dersi tekrar seçin.
                </p>
                <button
                    onClick={() => router.push('/dashboard/courses')}
                    className="mt-4 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold
                     hover:bg-emerald-400 transition-colors active:scale-95 min-h-[44px]"
                >
                    Kurslara Dön
                </button>
            </main>
        );
    }

    return (
        <>
            <ToastContainer toasts={toasts} />
            <AudioPlayer
                scenario={playData.scenario}
                startFromIndex={playData.startFromIndex}
                onComplete={handleComplete}
                onBack={handleBack}
            />
        </>
    );
}
