'use client';

// ─── /dashboard/profile/recordings — Recordings Page ───

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import RecordingPlayer from '@/components/RecordingPlayer';

interface Recording {
    id: string;
    lessonTitle: string;
    lessonId: string;
    lineIndex: number;
    targetText: string;
    score: number;
    recordingUrl: string | null;
    createdAt: string;
}

export default function RecordingsPage() {
    const router = useRouter();
    const t = useTranslations('pronunciation');
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/recordings')
            .then(res => res.ok ? res.json() : { recordings: [] })
            .then(data => setRecordings(data.recordings || []))
            .catch(() => setRecordings([]))
            .finally(() => setLoading(false));
    }, []);

    // Group by lessonTitle
    const grouped = recordings.reduce<Record<string, Recording[]>>((acc, r) => {
        (acc[r.lessonTitle] ??= []).push(r);
        return acc;
    }, {});

    return (
        <main className="min-h-dvh flex flex-col px-4 py-6 max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-foreground-muted hover:text-foreground transition-colors text-xl"
                >
                    ←
                </button>
                <h1 className="text-xl font-bold text-foreground">{t('recordings')}</h1>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-card-hover rounded-xl" />
                    ))}
                </div>
            ) : recordings.length === 0 ? (
                <p className="text-foreground-muted text-sm text-center py-12">
                    {t('noRecordings')}
                </p>
            ) : (
                <div className="flex flex-col gap-5">
                    {Object.entries(grouped).map(([title, items]) => (
                        <section key={title}>
                            <h2 className="text-foreground-muted text-xs font-bold uppercase tracking-wider mb-2">
                                {title}
                            </h2>
                            <div className="bg-card border border-border/50 rounded-2xl divide-y divide-border/30">
                                {items.map(rec => {
                                    const scorePercent = Math.round(rec.score * 100);
                                    const scoreColor = scorePercent >= 70
                                        ? 'text-emerald-500'
                                        : scorePercent >= 40
                                            ? 'text-amber-500'
                                            : 'text-red-500';

                                    return (
                                        <div key={rec.id} className="flex items-center gap-3 px-4 py-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-foreground text-sm font-medium truncate">
                                                    {rec.targetText}
                                                </p>
                                                <p className="text-foreground-faint text-xs">
                                                    {new Date(rec.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`text-sm font-bold ${scoreColor} flex-shrink-0`}>
                                                {scorePercent}%
                                            </span>
                                            {rec.recordingUrl && <RecordingPlayer attemptId={rec.id} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </main>
    );
}
