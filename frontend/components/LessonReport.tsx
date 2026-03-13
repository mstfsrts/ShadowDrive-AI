"use client";

// ─── ShadowDrive AI — Lesson Report ───
// Shows pronunciation results after a lesson completes.
// Displays per-line scores, transcript comparisons, and overall stats.

import { type PronunciationAttempt } from "./AudioPlayer";

interface LessonReportProps {
    lessonTitle: string;
    attempts: PronunciationAttempt[];
    onClose: () => void;
}

export default function LessonReport({ lessonTitle, attempts, onClose }: LessonReportProps) {
    // Only count supported attempts (skip browser-unsupported)
    const scoredAttempts = attempts.filter(a => a.result.supported && a.result.transcript);
    const totalAttempts = scoredAttempts.length;
    const correctCount = scoredAttempts.filter(a => a.result.correct).length;
    const averageScore = totalAttempts > 0
        ? scoredAttempts.reduce((sum, a) => sum + a.result.score, 0) / totalAttempts
        : 0;

    // Group by line (take best attempt per line)
    const lineMap = new Map<number, PronunciationAttempt>();
    for (const attempt of scoredAttempts) {
        const existing = lineMap.get(attempt.lineIndex);
        if (!existing || attempt.result.score > existing.result.score) {
            lineMap.set(attempt.lineIndex, attempt);
        }
    }
    const bestPerLine = Array.from(lineMap.values()).sort((a, b) => a.lineIndex - b.lineIndex);

    return (
        <div className="flex flex-col items-center min-h-dvh py-8 px-4">
            {/* Header */}
            <div className="w-full max-w-lg mb-8 text-center">
                <span className="text-4xl mb-4 block">📊</span>
                <h1 className="text-2xl font-bold text-foreground mb-2">Ders Raporu</h1>
                <p className="text-foreground-secondary text-sm">{lessonTitle}</p>
            </div>

            {/* Overall Stats */}
            <div className="w-full max-w-lg grid grid-cols-3 gap-3 mb-8">
                <StatCard
                    value={`${Math.round(averageScore * 100)}%`}
                    label="Ortalama"
                    color={averageScore >= 0.7 ? "emerald" : averageScore >= 0.4 ? "amber" : "red"}
                />
                <StatCard
                    value={`${correctCount}/${totalAttempts}`}
                    label="Doğru"
                    color="emerald"
                />
                <StatCard
                    value={String(bestPerLine.length)}
                    label="Cümle"
                    color="blue"
                />
            </div>

            {/* Per-line results */}
            <div className="w-full max-w-lg flex flex-col gap-2 mb-8">
                {bestPerLine.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-foreground-muted text-sm">
                            Telaffuz verisi bulunamadı. Tarayıcınız ses tanımayı desteklemiyor olabilir.
                        </p>
                    </div>
                ) : (
                    bestPerLine.map((attempt) => (
                        <LineResult key={attempt.lineIndex} attempt={attempt} />
                    ))
                )}
            </div>

            {/* Close button */}
            <div className="w-full max-w-lg">
                <button
                    onClick={onClose}
                    className="w-full min-h-[56px] rounded-2xl bg-emerald-500 text-white font-bold text-lg
                               hover:bg-emerald-400 active:scale-[0.98] transition-all duration-300
                               shadow-lg shadow-emerald-500/20"
                >
                    Tamam
                </button>
            </div>
        </div>
    );
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
    const colorClasses: Record<string, string> = {
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
        red: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20",
        blue: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    };

    return (
        <div className={`rounded-2xl border p-3 text-center ${colorClasses[color] || colorClasses.blue}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs mt-1 text-foreground-secondary">{label}</p>
        </div>
    );
}

function LineResult({ attempt }: { attempt: PronunciationAttempt }) {
    const { result } = attempt;
    const icon = result.correct ? "✅" : result.score >= 0.4 ? "⚠️" : "❌";
    const scoreColor = result.correct
        ? "text-emerald-600 dark:text-emerald-400"
        : result.score >= 0.4
            ? "text-amber-600 dark:text-amber-400"
            : "text-red-600 dark:text-red-400";

    return (
        <div className="bg-card border border-border/50 rounded-2xl px-4 py-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium text-sm leading-relaxed">
                        {icon} Cümle {attempt.lineIndex + 1}
                    </p>
                    {result.transcript && (
                        <p className="text-foreground-muted text-xs mt-1 truncate">
                            Sen: &quot;{result.transcript}&quot;
                        </p>
                    )}
                </div>
                <span className={`text-sm font-bold ${scoreColor} flex-shrink-0`}>
                    {Math.round(result.score * 100)}%
                </span>
            </div>
        </div>
    );
}
