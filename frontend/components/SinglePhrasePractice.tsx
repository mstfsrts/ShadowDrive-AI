'use client';

// ─── ShadowDrive AI — Single Phrase Practice ───
// Mini modal for practicing a single pronunciation phrase.
// Flow: Listen (TTS) → Speak (mic) → Score → Repeat or Done

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { speakAsync } from '@/lib/speechEngine';
import { listenAsync } from '@/lib/speechRecognition';
import { cueUserTurn, cuePronunciationResult } from '@/lib/soundEffects';

interface SinglePhrasePracticeProps {
    targetText: string;
    lessonTitle: string;
    onComplete: (score: number) => void;
    onDismiss: () => void;
}

type PracticePhase = 'ready' | 'listening-tts' | 'your-turn' | 'listening-mic' | 'result';

export default function SinglePhrasePractice({
    targetText,
    lessonTitle,
    onComplete,
    onDismiss,
}: SinglePhrasePracticeProps) {
    const t = useTranslations('pronunciation');
    const [phase, setPhase] = useState<PracticePhase>('ready');
    const [score, setScore] = useState<number | null>(null);
    const [transcript, setTranscript] = useState('');

    const handleStart = useCallback(async () => {
        setPhase('listening-tts');
        setScore(null);
        setTranscript('');

        try {
            // Play the Dutch phrase
            await speakAsync(targetText, 'nl-NL');

            // Cue user's turn
            cueUserTurn();
            setPhase('your-turn');

            // Brief pause then start listening
            await new Promise(r => setTimeout(r, 300));
            setPhase('listening-mic');

            const result = await listenAsync(targetText);

            // Show result
            cuePronunciationResult(result.score);
            setScore(result.score);
            setTranscript(result.transcript);
            setPhase('result');
        } catch {
            setPhase('ready');
        }
    }, [targetText]);

    const handleDone = useCallback(() => {
        onComplete(score ?? 0);
    }, [score, onComplete]);

    const scorePercent = score !== null ? Math.round(score * 100) : 0;
    const isCorrect = score !== null && score >= 0.70;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onDismiss} />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-card border-t border-border rounded-t-3xl p-6 pb-8
                            animate-slide-up safe-bottom">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="min-w-0">
                        <p className="text-foreground-muted text-xs truncate">{lessonTitle}</p>
                        <p className="text-foreground font-semibold text-lg mt-1">{targetText}</p>
                    </div>
                    <button
                        onClick={onDismiss}
                        className="text-foreground-muted hover:text-foreground text-xl transition-colors p-2"
                    >
                        ✕
                    </button>
                </div>

                {/* Phase Content */}
                <div className="flex flex-col items-center gap-4 py-6">
                    {phase === 'ready' && (
                        <button
                            onClick={handleStart}
                            className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-base
                                       hover:bg-emerald-400 active:scale-[0.98] transition-all"
                        >
                            {t('startPractice')}
                        </button>
                    )}

                    {phase === 'listening-tts' && (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                                <span className="text-3xl">🔊</span>
                            </div>
                            <p className="text-foreground-secondary text-sm">{t('listening')}</p>
                        </div>
                    )}

                    {(phase === 'your-turn' || phase === 'listening-mic') && (
                        <div className="flex flex-col items-center gap-3">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center
                                ${phase === 'listening-mic'
                                    ? 'bg-red-500/10 border-2 border-red-500/30 animate-pulse'
                                    : 'bg-amber-500/10 border-2 border-amber-500/30'
                                }`}>
                                <span className="text-3xl">🎤</span>
                            </div>
                            <p className="text-foreground-secondary text-sm">
                                {phase === 'listening-mic' ? t('speakNow') : t('getReady')}
                            </p>
                        </div>
                    )}

                    {phase === 'result' && (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl
                                ${isCorrect
                                    ? 'bg-emerald-500/10 border-2 border-emerald-500/30'
                                    : scorePercent >= 40
                                        ? 'bg-amber-500/10 border-2 border-amber-500/30'
                                        : 'bg-red-500/10 border-2 border-red-500/30'
                                }`}>
                                {isCorrect ? '✅' : scorePercent >= 40 ? '⚠️' : '❌'}
                            </div>
                            <p className={`text-3xl font-bold ${
                                isCorrect ? 'text-emerald-500' : scorePercent >= 40 ? 'text-amber-500' : 'text-red-500'
                            }`}>
                                {scorePercent}%
                            </p>
                            {transcript && (
                                <p className="text-foreground-muted text-sm text-center">
                                    {t('youSaid')}: &ldquo;{transcript}&rdquo;
                                </p>
                            )}
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={handleStart}
                                    className="flex-1 py-3 rounded-xl border border-border bg-card-hover text-foreground
                                               font-semibold text-sm hover:border-border-hover transition-colors"
                                >
                                    {t('tryAgain')}
                                </button>
                                <button
                                    onClick={handleDone}
                                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
                                        isCorrect
                                            ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                            : 'bg-card-hover border border-border text-foreground hover:border-border-hover'
                                    }`}
                                >
                                    {isCorrect ? t('done') : t('skip')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
