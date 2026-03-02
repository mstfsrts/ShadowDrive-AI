'use client';

// ─── ShadowDrive AI — Lesson Preview ───
// Sessiz metin önizleme: Hollandaca + Türkçe cümle listesi.
// Her cümlenin yanında bireysel dinleme butonu var.

import { useState, useCallback } from 'react';
import { Scenario } from '@/types/dialogue';
import { speakAsync, cancelSpeech } from '@/lib/speechEngine';

interface LessonPreviewProps {
    scenario: Scenario;
    onStartPlayback: () => void;
    onBack: () => void;
}

export default function LessonPreview({ scenario, onStartPlayback, onBack }: LessonPreviewProps) {
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);

    const handlePlayLine = useCallback(async (idx: number) => {
        // If this line is already playing → stop
        if (playingIndex === idx) {
            cancelSpeech();
            setPlayingIndex(null);
            return;
        }

        // Cancel any currently playing line, then start new one
        cancelSpeech();
        setPlayingIndex(idx);

        try {
            await speakAsync(scenario.lines[idx].targetText, scenario.targetLang);
        } finally {
            setPlayingIndex(null);
        }
    }, [playingIndex, scenario]);

    return (
        <div className="flex flex-col min-h-dvh bg-background">
            {/* ─── Header ─── */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-foreground-secondary hover:text-foreground
                         transition-colors duration-200 text-sm min-h-[44px]"
                    >
                        <span>←</span> Geri
                    </button>
                    <div className="text-center">
                        <p className="text-foreground font-semibold text-sm leading-tight line-clamp-1 max-w-[180px]">
                            {scenario.title}
                        </p>
                        <p className="text-foreground-muted text-xs mt-0.5">
                            {scenario.lines.length} cümle · Metin önizleme
                        </p>
                    </div>
                    <button
                        onClick={onStartPlayback}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white
                         font-semibold text-sm hover:bg-emerald-400 transition-colors duration-200 active:scale-95
                         min-h-[44px]"
                    >
                        ▶ Başla
                    </button>
                </div>
            </div>

            {/* ─── Dialogue Lines ─── */}
            <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
                <div className="flex flex-col gap-4">
                    {scenario.lines.map((line, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 p-4 rounded-2xl border transition-colors duration-200
                             ${playingIndex === idx
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'bg-card border-border/50'
                            }`}
                        >
                            {/* Line number */}
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center
                             rounded-lg bg-background text-foreground-muted text-sm font-bold mt-0.5">
                                {idx + 1}
                            </div>

                            {/* Texts */}
                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                <p className={`font-semibold text-lg leading-snug transition-colors duration-200
                                    ${playingIndex === idx
                                        ? 'text-emerald-500'
                                        : 'text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                    {line.targetText}
                                </p>
                                <p className="text-blue-600 dark:text-blue-400 text-sm leading-snug">
                                    {line.nativeText}
                                </p>
                            </div>

                            {/* Per-line play button */}
                            <button
                                onClick={() => handlePlayLine(idx)}
                                title={playingIndex === idx ? 'Durdur' : 'Bu cümleyi dinle'}
                                className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl
                                 transition-all duration-200 active:scale-95 self-center
                                 ${playingIndex === idx
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                    : 'bg-background border border-border text-foreground-muted hover:text-foreground hover:border-border-hover'
                                }`}
                            >
                                {playingIndex === idx ? '⏸' : '▶'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-8 pb-8">
                    <button
                        onClick={onStartPlayback}
                        className="w-full min-h-[64px] rounded-2xl bg-emerald-500 text-white font-bold text-xl
                         hover:bg-emerald-400 transition-colors duration-200 active:scale-95 shadow-lg
                         shadow-emerald-500/20"
                    >
                        ▶ Tam Dersi Dinle
                    </button>
                    <p className="text-center text-foreground-muted text-xs mt-3">
                        {scenario.lines.length} cümle · Aralıklı tekrar yöntemi
                    </p>
                </div>
            </div>
        </div>
    );
}
