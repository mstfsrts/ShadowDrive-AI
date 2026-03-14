'use client';

// ─── ShadowDrive AI — Pronunciation Tracking Card ───
// Shows failed/weak pronunciations on profile page.
// Tap a phrase → SinglePhrasePractice modal opens.

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import SinglePhrasePractice from './SinglePhrasePractice';

interface FailedPhrase {
    id: string;
    lessonType: string;
    lessonId: string;
    lessonTitle: string;
    lineIndex: number;
    targetText: string;
    transcript: string;
    score: number;
    createdAt: string;
}

interface PronunciationStats {
    totalAttempts: number;
    correctAttempts: number;
    averageScore: number;
    successRate: number;
}

export default function PronunciationCard() {
    const t = useTranslations('pronunciation');
    const [critical, setCritical] = useState<FailedPhrase[]>([]);
    const [needsRetry, setNeedsRetry] = useState<FailedPhrase[]>([]);
    const [stats, setStats] = useState<PronunciationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [practicePhrase, setPracticePhrase] = useState<FailedPhrase | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/pronunciation/failed');
            if (res.ok) {
                const data = await res.json();
                setCritical(data.critical);
                setNeedsRetry(data.needsRetry);
                setStats(data.stats);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handlePracticeComplete = useCallback((score: number) => {
        if (score >= 0.70 && practicePhrase) {
            // Remove from lists if now correct
            setCritical(prev => prev.filter(p => p.id !== practicePhrase.id));
            setNeedsRetry(prev => prev.filter(p => p.id !== practicePhrase.id));
        }
        setPracticePhrase(null);
    }, [practicePhrase]);

    if (loading) {
        return (
            <div className="bg-card border border-border/50 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-card-hover rounded w-1/3 mb-4" />
                <div className="h-20 bg-card-hover rounded" />
            </div>
        );
    }

    if (!stats || stats.totalAttempts === 0) return null;

    const hasIssues = critical.length > 0 || needsRetry.length > 0;

    return (
        <>
            <section>
                <h2 className="text-foreground-muted text-xs font-bold uppercase tracking-wider mb-3">
                    {t('title')}
                </h2>
                <div className="bg-card border border-border/50 rounded-2xl p-5">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center">
                            <p className="text-foreground font-bold text-xl">{stats.averageScore}%</p>
                            <p className="text-foreground-muted text-xs">{t('avgScore')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-foreground font-bold text-xl">{stats.successRate}%</p>
                            <p className="text-foreground-muted text-xs">{t('successRate')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-foreground font-bold text-xl">{stats.totalAttempts}</p>
                            <p className="text-foreground-muted text-xs">{t('totalAttempts')}</p>
                        </div>
                    </div>

                    {!hasIssues ? (
                        <p className="text-emerald-500 text-sm font-medium text-center py-2">
                            {t('allCorrect')}
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {/* Critical (Red) - Score < 40% */}
                            {critical.length > 0 && (
                                <div>
                                    <p className="text-red-500 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        {t('critical')} ({critical.length})
                                    </p>
                                    <div className="flex flex-col gap-1.5">
                                        {critical.slice(0, 5).map((phrase) => (
                                            <PhraseRow
                                                key={phrase.id}
                                                phrase={phrase}
                                                color="red"
                                                onPractice={() => setPracticePhrase(phrase)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Needs Retry (Orange) - Score 40-69% */}
                            {needsRetry.length > 0 && (
                                <div>
                                    <p className="text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        {t('needsRetry')} ({needsRetry.length})
                                    </p>
                                    <div className="flex flex-col gap-1.5">
                                        {needsRetry.slice(0, 5).map((phrase) => (
                                            <PhraseRow
                                                key={phrase.id}
                                                phrase={phrase}
                                                color="amber"
                                                onPractice={() => setPracticePhrase(phrase)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Single Phrase Practice Modal */}
            {practicePhrase && (
                <SinglePhrasePractice
                    targetText={practicePhrase.targetText}
                    lessonTitle={practicePhrase.lessonTitle}
                    onComplete={handlePracticeComplete}
                    onDismiss={() => setPracticePhrase(null)}
                />
            )}
        </>
    );
}

function PhraseRow({
    phrase,
    color,
    onPractice,
}: {
    phrase: FailedPhrase;
    color: 'red' | 'amber';
    onPractice: () => void;
}) {
    const scoreColor = color === 'red'
        ? 'text-red-500 dark:text-red-400'
        : 'text-amber-500 dark:text-amber-400';

    return (
        <button
            onClick={onPractice}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card-hover border border-border/50
                       hover:border-border-hover transition-all text-left active:scale-[0.98] w-full"
        >
            <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate">{phrase.targetText}</p>
                <p className="text-foreground-muted text-xs truncate">{phrase.lessonTitle}</p>
            </div>
            <span className={`text-sm font-bold ${scoreColor} flex-shrink-0`}>
                {Math.round(phrase.score * 100)}%
            </span>
            <span className="text-foreground-faint text-lg">▶</span>
        </button>
    );
}
