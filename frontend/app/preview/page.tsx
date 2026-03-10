'use client';

// ─── /preview — Standalone Preview Page ───
// Reads scenario from sessionStorage. Renders LessonPreview.
// "Başla" → creates PlaySession + navigates to /play/[type]/[id].
// "Geri" → router.back().

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LessonPreview from '@/components/LessonPreview';
import {
    getPreviewSession, clearPreviewSession,
    setPlaySession, type PlaySession,
} from '@/lib/playSession';
import { getStoredLastLineIndex } from '@/lib/resumablePlayback';

export default function PreviewPage() {
    const router = useRouter();
    const [previewData] = useState(() => getPreviewSession());

    if (!previewData?.scenario) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center px-4 gap-4">
                <span className="text-5xl">🔍</span>
                <p className="text-foreground-secondary text-lg text-center">Önizleme bulunamadı</p>
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

    const handleStartPlayback = () => {
        const resumableId = previewData.resumableId ?? `${previewData.type}:${previewData.id}`;
        const isCourse = previewData.isCourse ?? previewData.type === 'course';
        const lastLine = getStoredLastLineIndex(resumableId, null, isCourse);

        const playSession: PlaySession = {
            scenario: previewData.scenario,
            resumableId,
            startFromIndex: lastLine > 0 ? lastLine : 0,
            isCourse,
            courseId: previewData.courseId,
            lessonId: previewData.lessonId,
            type: previewData.type,
            id: previewData.id,
        };

        setPlaySession(playSession);
        clearPreviewSession();
        router.push(`/play/${previewData.type}/${previewData.id}`);
    };

    const handleBack = () => {
        clearPreviewSession();
        router.back();
    };

    return (
        <LessonPreview
            scenario={previewData.scenario}
            onStartPlayback={handleStartPlayback}
            onBack={handleBack}
        />
    );
}
