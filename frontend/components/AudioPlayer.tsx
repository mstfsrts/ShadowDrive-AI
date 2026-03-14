"use client";

// ─── ShadowDrive AI — Audio Player ───
// The playback controller: orchestrates the speech engine and
// renders the giant pause/resume/stop controls for driving safety.

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Scenario, PlaybackStatus, PlaybackPhase, RecognitionResult } from "@/types/dialogue";
import { playScenario, cancelSpeech, type PronunciationOptions } from "@/lib/speechEngine";
import { requestMicPermission, releaseMic, type RecordingResult } from "@/lib/audioRecorder";
import { unlockAudio } from "@/lib/soundEffects";
import { isSpeechRecognitionSupported } from "@/lib/speechRecognition";
import StatusBar from "./StatusBar";
import ConfirmModal from "./ConfirmModal";

/** Collected pronunciation attempt data for lesson report */
export interface PronunciationAttempt {
    lineIndex: number;
    result: RecognitionResult;
    recording?: RecordingResult;
}

interface AudioPlayerProps {
    scenario: Scenario;
    startFromIndex?: number;
    /** Enable pronunciation checking (speech recognition + recording) */
    enablePronunciation?: boolean;
    onComplete: (attempts?: PronunciationAttempt[]) => void;
    onBack: (lastLineIndex: number) => void;
}

export default function AudioPlayer({ scenario, startFromIndex = 0, enablePronunciation = false, onComplete, onBack }: AudioPlayerProps) {
    const t = useTranslations('player');
    const tc = useTranslations('common');

    const [isPlaying, setIsPlaying] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<PlaybackStatus | null>(null);
    const [phase, setPhase] = useState<PlaybackPhase | "idle" | "complete">("idle");
    const [showRestartConfirm, setShowRestartConfirm] = useState(false);
    const [lastRecognitionResult, setLastRecognitionResult] = useState<RecognitionResult | null>(null);
    const [micGranted, setMicGranted] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const isPlayingRef = useRef(false);
    const attemptsRef = useRef<PronunciationAttempt[]>([]);
    // Track current line index in a ref so handleBack and resume can read it reliably
    const currentLineIndexRef = useRef(startFromIndex);

    // Sync ref when startFromIndex prop changes (e.g., resume from different position)
    useEffect(() => {
        if (!isPlayingRef.current) {
            currentLineIndexRef.current = startFromIndex;
        }
    }, [startFromIndex]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            try {
                cancelSpeech();
            } catch {
                /* ignore cleanup errors */
            }
            abortControllerRef.current?.abort();
            releaseMic();
            document.body.classList.remove("playback-active");
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
        document.body.classList.add("playback-active");

        // Unlock audio context for sound effects (needs user gesture)
        unlockAudio();

        // Request mic permission on first start if pronunciation is enabled
        if (enablePronunciation && !micGranted) {
            const granted = await requestMicPermission();
            setMicGranted(granted);
        }

        // Build pronunciation options
        const pronunciationOpts: PronunciationOptions = enablePronunciation
            ? {
                enableRecognition: isSpeechRecognitionSupported(),
                enableRecording: micGranted,
                onAttempt: (lineIndex, result, recording) => {
                    attemptsRef.current.push({ lineIndex, result, recording });
                    setLastRecognitionResult(result);
                },
            }
            : {};

        try {
            for await (const status of playScenario(scenario, controller.signal, undefined, currentLineIndexRef.current, pronunciationOpts)) {
                if (controller.signal.aborted) break;
                currentLineIndexRef.current = status.lineIndex;
                setCurrentStatus(status);
                setPhase(status.phase);

                // Update last recognition result from status
                if (status.recognitionResult) {
                    setLastRecognitionResult(status.recognitionResult);
                }
            }

            // If we completed without abort, session is done
            if (!controller.signal.aborted) {
                setPhase("complete");
                setIsPlaying(false);
                isPlayingRef.current = false;
                onComplete(attemptsRef.current.length > 0 ? attemptsRef.current : undefined);
            }
        } catch {
            // Aborted — expected on pause/stop
        }
    }, [scenario, onComplete, enablePronunciation, micGranted]);

    const stopPlayback = useCallback(() => {
        cancelSpeech();
        abortControllerRef.current?.abort();
        isPlayingRef.current = false;
        setIsPlaying(false);
        // iOS: unlock body scroll
        document.body.classList.remove("playback-active");
    }, []);

    const togglePlayback = useCallback(() => {
        if (isPlaying) {
            stopPlayback();
        } else {
            startPlayback();
        }
    }, [isPlaying, startPlayback, stopPlayback]);

    const handleRestartRequest = useCallback(() => {
        setShowRestartConfirm(true);
    }, []);

    const handleRestartConfirm = useCallback(() => {
        setShowRestartConfirm(false);
        stopPlayback();
        currentLineIndexRef.current = 0;
        setPhase("idle");
        setCurrentStatus(null);
        setHasStarted(false);
    }, [stopPlayback]);

    const handleBack = useCallback(() => {
        const lastLineIndex = currentLineIndexRef.current;
        stopPlayback();
        setPhase("idle");
        setCurrentStatus(null);
        setHasStarted(false);
        onBack(lastLineIndex);
    }, [stopPlayback, onBack]);

    return (
        <div className="flex flex-col items-center justify-between min-h-dvh py-8 px-4 select-none max-w-lg mx-auto w-full">
            {/* Status Bar */}
            <StatusBar phase={phase} lineIndex={currentStatus?.lineIndex ?? 0} totalLines={currentStatus?.totalLines ?? scenario.lines.length} />

            {/* Current Phrase Display */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg px-4">
                {/* Scenario Title */}
                <h2 className="text-foreground-muted text-sm uppercase tracking-widest mb-8">{scenario.title}</h2>

                {/* Main Text — very large for readability */}
                <div className="text-center min-h-[120px] flex items-center justify-center">
                    {phase === "idle" && !hasStarted && <p className="text-foreground-secondary text-xl">{t('startPrompt')}</p>}
                    {phase === "complete" && (
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-6xl">🎉</span>
                            <p className="text-emerald-600 dark:text-emerald-400 text-2xl font-bold">{t('great')}</p>
                            <p className="text-foreground-secondary text-lg">{t('lessonDone', { count: scenario.lines.length })}</p>
                        </div>
                    )}
                    {currentStatus && phase !== "complete" && phase !== "idle" && (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <p
                                className={`text-3xl sm:text-4xl font-bold leading-relaxed transition-all duration-500 text-center
                                ${phase === "target" || phase === "repeat" ? "text-emerald-600 dark:text-emerald-400" : ""}
                                ${phase === "native" ? "text-blue-600 dark:text-blue-400" : ""}
                                ${phase === "pause" || phase === "listening" ? "text-amber-600 dark:text-amber-400 animate-pulse-slow" : ""}
                                ${phase === "gap" ? "text-foreground-faint" : ""}
                            `}
                            >
                                {currentStatus.text || "..."}
                            </p>
                            {currentStatus.nativeText && (
                                <p
                                    className={`text-lg sm:text-xl font-medium text-center transition-all duration-500
                                    ${phase === "native" ? "text-blue-600 dark:text-blue-300" : "text-foreground-secondary/80"}
                                `}
                                >
                                    {currentStatus.nativeText}
                                </p>
                            )}

                            {/* Recognition result badge */}
                            {lastRecognitionResult && lastRecognitionResult.supported && phase === "pause" && currentStatus.recognitionResult && (
                                <div className={`mt-3 px-4 py-2 rounded-xl text-sm font-medium text-center
                                    ${currentStatus.recognitionResult.correct
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                        : currentStatus.recognitionResult.score >= 0.4
                                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                    }`}
                                >
                                    {currentStatus.recognitionResult.correct ? "✅" : currentStatus.recognitionResult.score >= 0.4 ? "⚠️" : "❌"}
                                    {" "}
                                    {Math.round(currentStatus.recognitionResult.score * 100)}%
                                    {currentStatus.recognitionResult.transcript && (
                                        <span className="ml-2 text-foreground-secondary">
                                            &quot;{currentStatus.recognitionResult.transcript}&quot;
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Phase subtitle — listening or pause */}
                {phase === "listening" && (
                    <div className="mt-6 flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center animate-pulse">
                            <span className="text-2xl">🎤</span>
                        </div>
                        <p className="text-red-500 dark:text-red-400 text-sm font-medium">{t('listening')}</p>
                    </div>
                )}
                {phase === "pause" && !currentStatus?.recognitionResult && (
                    <p className="mt-6 text-amber-600/70 dark:text-amber-400/70 text-lg animate-pulse">🎤 {t('speakDutch')}</p>
                )}
            </div>

            {/* Controls — massive buttons for driving safety */}
            <div className="flex flex-col items-center gap-4 w-full max-w-md px-4 pb-4">
                {/* Main Play/Pause Button — THE BIG ONE */}
                {phase !== "complete" && (
                    <div className="w-full flex gap-4">
                        {!isPlaying && hasStarted && (
                            <button
                                onClick={handleRestartRequest}
                                className="w-1/3 min-h-[88px] rounded-3xl text-sm sm:text-lg font-bold uppercase tracking-widest
                                transition-all duration-300 active:scale-95 select-none
                                bg-card border border-border hover:border-border-hover text-foreground-secondary hover:text-foreground"
                            >
                                🔄 {t('restart')}
                            </button>
                        )}
                        <button
                            id="play-pause-button"
                            onClick={togglePlayback}
                            className={`min-h-[88px] rounded-3xl text-xl sm:text-3xl font-bold uppercase tracking-widest
                           transition-all duration-300 active:scale-95 select-none
                           ${!isPlaying && hasStarted ? "w-2/3" : "w-full"}
                           ${
                               isPlaying
                                   ? "bg-amber-500 text-shadow-950 hover:bg-amber-400 shadow-2xl shadow-amber-500/30"
                                   : "bg-emerald-500 text-shadow-950 hover:bg-emerald-400 animate-glow shadow-2xl shadow-emerald-500/30"
                           }`}
                        >
                            {isPlaying ? `⏸  ${t('pause')}` : hasStarted ? `▶  ${t('resume')}` : `▶  ${t('start')}`}
                        </button>
                    </div>
                )}

                {/* Back / New Session button */}
                <button
                    id="back-button"
                    onClick={handleBack}
                    className="w-full min-h-[88px] rounded-2xl text-lg font-medium text-foreground-secondary
                     bg-card border border-border hover:border-border-hover hover:text-foreground
                     transition-all duration-300 active:scale-95 select-none"
                >
                    {phase === "complete" ? `🔄  ${t('newLesson')}` : `←  ${tc('back')}`}
                </button>
            </div>
            <ConfirmModal
                open={showRestartConfirm}
                title={t('restartConfirm')}
                subtitle={t('restartSubtitle')}
                confirmLabel={t('restartButton')}
                cancelLabel={tc('cancel')}
                variant="danger"
                onConfirm={handleRestartConfirm}
                onCancel={() => setShowRestartConfirm(false)}
            />
        </div>
    );
}
