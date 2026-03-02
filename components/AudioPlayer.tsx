'use client';

// ─── ShadowDrive AI — Audio Player ───
// The playback controller: orchestrates the speech engine and
// renders the giant pause/resume/stop controls for driving safety.

import { useState, useCallback, useRef, useEffect } from 'react';
import { Scenario, PlaybackStatus, PlaybackPhase } from '@/types/dialogue';
import { playScenario, cancelSpeech } from '@/lib/speechEngine';
import StatusBar from './StatusBar';

interface AudioPlayerProps {
    scenario: Scenario;
    startFromIndex?: number;
    onComplete: () => void;
    onBack: (lastLineIndex: number) => void;
}

export default function AudioPlayer({ scenario, startFromIndex = 0, onComplete, onBack }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<PlaybackStatus | null>(null);
    const [phase, setPhase] = useState<PlaybackPhase | 'idle' | 'complete'>('idle');

    const abortControllerRef = useRef<AbortController | null>(null);
    const isPlayingRef = useRef(false);
    // Track current line index in a ref so handleBack can read it reliably
    const currentLineIndexRef = useRef(startFromIndex);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            try { cancelSpeech(); } catch { /* ignore cleanup errors */ }
            abortControllerRef.current?.abort();
            document.body.classList.remove('playback-active');
        };
    }, []);

    const startPlayback = useCallback(async () => {
        if (isPlayingRef.current) return;

        const controller = new AbortController();
        abortControllerRef.current = controller;
        isPlayingRef.current = true;
        setIsPlaying(true);
        setHasStarted(true);
        // iOS: lock body scroll during playback
        document.body.classList.add('playback-active');

        try {
            for await (const status of playScenario(scenario, controller.signal, undefined, startFromIndex)) {
                if (controller.signal.aborted) break;
                currentLineIndexRef.current = status.lineIndex;
                setCurrentStatus(status);
                setPhase(status.phase);
            }

            // If we completed without abort, session is done
            if (!controller.signal.aborted) {
                setPhase('complete');
                setIsPlaying(false);
                isPlayingRef.current = false;
                onComplete();
            }
        } catch {
            // Aborted — expected on pause/stop
        }
    }, [scenario, onComplete]);

    const stopPlayback = useCallback(() => {
        cancelSpeech();
        abortControllerRef.current?.abort();
        isPlayingRef.current = false;
        setIsPlaying(false);
        // iOS: unlock body scroll
        document.body.classList.remove('playback-active');
    }, []);

    const togglePlayback = useCallback(() => {
        if (isPlaying) {
            stopPlayback();
        } else {
            startPlayback();
        }
    }, [isPlaying, startPlayback, stopPlayback]);

    const handleBack = useCallback(() => {
        const lastLineIndex = currentLineIndexRef.current;
        stopPlayback();
        setPhase('idle');
        setCurrentStatus(null);
        setHasStarted(false);
        onBack(lastLineIndex);
    }, [stopPlayback, onBack]);

    return (
        <div className="flex flex-col items-center justify-between min-h-dvh py-8 px-4 select-none">
            {/* Status Bar */}
            <StatusBar
                phase={phase}
                lineIndex={currentStatus?.lineIndex ?? 0}
                totalLines={currentStatus?.totalLines ?? scenario.lines.length}
            />

            {/* Current Phrase Display */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg px-4">
                {/* Scenario Title */}
                <h2 className="text-foreground-muted text-sm uppercase tracking-widest mb-8">
                    {scenario.title}
                </h2>

                {/* Main Text — very large for readability */}
                <div className="text-center min-h-[120px] flex items-center justify-center">
                    {phase === 'idle' && !hasStarted && (
                        <p className="text-foreground-secondary text-xl">
                            Dersi başlatmak için aşağıdaki düğmeye dokunun
                        </p>
                    )}
                    {phase === 'complete' && (
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-6xl">🎉</span>
                            <p className="text-emerald-600 dark:text-emerald-400 text-2xl font-bold">
                                Harika!
                            </p>
                            <p className="text-foreground-secondary text-lg">
                                Ders tamamlandı — {scenario.lines.length} cümle çalışıldı
                            </p>
                        </div>
                    )}
                    {currentStatus && phase !== 'complete' && phase !== 'idle' && (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <p
                                className={`text-3xl sm:text-4xl font-bold leading-relaxed transition-all duration-500 text-center
                                ${phase === 'target' || phase === 'repeat' ? 'text-emerald-600 dark:text-emerald-400' : ''}
                                ${phase === 'native' ? 'text-blue-600 dark:text-blue-400' : ''}
                                ${phase === 'pause' ? 'text-amber-600 dark:text-amber-400 animate-pulse-slow' : ''}
                                ${phase === 'gap' ? 'text-foreground-faint' : ''}
                            `}
                            >
                                {currentStatus.text || '...'}
                            </p>
                            {currentStatus.nativeText && (
                                <p className={`text-lg sm:text-xl font-medium text-center transition-all duration-500
                                    ${phase === 'native' ? 'text-blue-600 dark:text-blue-300' : 'text-foreground-secondary/80'}
                                `}>
                                    {currentStatus.nativeText}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Phase subtitle when speaking */}
                {phase === 'pause' && (
                    <p className="mt-6 text-amber-600/70 dark:text-amber-400/70 text-lg animate-pulse">
                        🎤 Hollandaca söyleyin!
                    </p>
                )}
            </div>

            {/* Controls — massive buttons for driving safety */}
            <div className="flex flex-col items-center gap-4 w-full max-w-md px-4 pb-4">
                {/* Main Play/Pause Button — THE BIG ONE */}
                {phase !== 'complete' && (
                    <button
                        id="play-pause-button"
                        onClick={togglePlayback}
                        className={`w-full min-h-[88px] rounded-3xl text-3xl font-bold uppercase tracking-widest
                       transition-all duration-300 active:scale-95 select-none
                       ${isPlaying
                                ? 'bg-amber-500 text-shadow-950 hover:bg-amber-400 shadow-2xl shadow-amber-500/30'
                                : 'bg-emerald-500 text-shadow-950 hover:bg-emerald-400 animate-glow shadow-2xl shadow-emerald-500/30'
                            }`}
                    >
                        {isPlaying ? '⏸  PAUSE' : hasStarted ? '▶  RESUME' : '▶  START'}
                    </button>
                )}

                {/* Back / New Session button */}
                <button
                    id="back-button"
                    onClick={handleBack}
                    className="w-full min-h-[88px] rounded-2xl text-lg font-medium text-foreground-secondary
                     bg-card border border-border hover:border-border-hover hover:text-foreground
                     transition-all duration-300 active:scale-95 select-none"
                >
                    {phase === 'complete' ? '🔄  Yeni Ders' : '←  Geri'}
                </button>
            </div>
        </div>
    );
}
