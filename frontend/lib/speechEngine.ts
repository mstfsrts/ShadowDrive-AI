// ─── ShadowDrive AI — Speech Engine ───
// Pure logic module: Promise-based TTS using Web Speech API.
// Integrates pronunciation checking (speech recognition + audio recording).
// No UI dependencies. This is the heart of the app.

import { Scenario, PlaybackStatus, PlaybackPhase, CEFRLevel, RecognitionResult } from "@/types/dialogue";
import { getBestVoice, getRateForLevel, clearVoiceCache } from "@/lib/voiceSelector";
import { listenAsync, isSpeechRecognitionSupported } from "@/lib/speechRecognition";
import { recordAsync, type RecordingResult } from "@/lib/audioRecorder";
import { cueUserTurn, cuePronunciationResult, unlockAudio } from "@/lib/soundEffects";

/** Options for pronunciation features in playScenario */
export interface PronunciationOptions {
    /** Enable speech recognition during pause phases */
    enableRecognition?: boolean;
    /** Enable audio recording during pause phases */
    enableRecording?: boolean;
    /** Callback for each pronunciation attempt (for saving to DB) */
    onAttempt?: (lineIndex: number, result: RecognitionResult, recording?: RecordingResult) => void;
}

// ─── iOS WebKit: Preload voices ───
// iOS Safari has a known delay loading voices. Call this once on first user gesture.
let voicesLoaded = false;
export function preloadVoices(): void {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (voicesLoaded) return;

    // Force voice loading
    window.speechSynthesis.getVoices();

    // iOS fires 'voiceschanged' after initial load
    window.speechSynthesis.addEventListener(
        "voiceschanged",
        () => {
            voicesLoaded = true;
            clearVoiceCache(); // Re-evaluate voices after they finish loading
            console.log("[SpeechEngine] Voices loaded:", window.speechSynthesis.getVoices().length);
        },
        { once: true },
    );

    console.log("[SpeechEngine] Voice preload triggered");
}

/**
 * Speak text aloud using the Web Speech API.
 * Uses the best available voice for the language and adjusts rate by CEFR level.
 * Returns a Promise that resolves with the approximate duration in ms.
 */
export function speakAsync(text: string, lang: string, level?: CEFRLevel): Promise<number> {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
            reject(new Error("Speech synthesis not available"));
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Use best available voice for this language
        const voice = getBestVoice(lang);
        if (voice) {
            utterance.voice = voice;
        }

        // Adjust rate based on CEFR level
        utterance.rate = level ? getRateForLevel(level) : 0.9;

        const startTime = Date.now();

        utterance.onend = () => {
            const duration = Date.now() - startTime;
            resolve(duration);
        };

        utterance.onerror = event => {
            // 'interrupted' and 'cancelled' are expected when user stops playback
            if (event.error === "interrupted" || event.error === "canceled") {
                resolve(0);
            } else {
                reject(new Error(`Speech synthesis error: ${event.error}`));
            }
        };

        window.speechSynthesis.speak(utterance);
    });
}

/**
 * Wait for a given number of milliseconds.
 * Respects AbortSignal for clean cancellation.
 */
export function waitMs(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
        }

        const timer = setTimeout(resolve, ms);

        signal?.addEventListener(
            "abort",
            () => {
                clearTimeout(timer);
                reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true },
        );
    });
}

/**
 * Cancel all queued and active speech synthesis.
 * iOS 17+ workaround: double-cancel to ensure utterance queue is fully cleared.
 */
export function cancelSpeech(): void {
    if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        // iOS 17+ bug: first cancel() sometimes leaves utterance in pending state
        setTimeout(() => {
            window.speechSynthesis.cancel();
        }, 50);
    }
}

/**
 * Check if a language has any usable TTS voice on this device.
 */
function hasVoiceForLang(lang: string): boolean {
    return getBestVoice(lang) !== undefined;
}

/**
 * Run speech recognition + recording during a pause phase.
 * Returns the recognition result and optional recording.
 */
async function listenAndRecord(
    targetText: string,
    pronunciationOpts: PronunciationOptions,
    signal: AbortSignal,
): Promise<{ result: RecognitionResult; recording?: RecordingResult }> {
    const doRecognition = pronunciationOpts.enableRecognition && isSpeechRecognitionSupported();
    const doRecording = pronunciationOpts.enableRecording;

    // Run recognition and recording in parallel
    const [recognitionResult, recordingResult] = await Promise.all([
        doRecognition
            ? listenAsync(targetText, signal)
            : Promise.resolve({ transcript: '', score: 0, correct: false, supported: false } as RecognitionResult),
        doRecording
            ? recordAsync(8000, signal).catch(() => undefined)
            : Promise.resolve(undefined),
    ]);

    return { result: recognitionResult, recording: recordingResult };
}

/**
 * Play through an entire scenario using the core loop:
 *   Target Language → [BOOP] → Listen+Record → Feedback → Native → Gap → Repeat → [BOOP] → Listen+Record → Feedback
 *
 * Yields PlaybackStatus on each phase transition so the UI can update.
 * Accepts an AbortSignal for clean cancellation (pause/stop).
 *
 * Resume behavior: always resumes from the START of the given line index,
 * so the user always hears the full sentence before being asked to repeat.
 *
 * @param scenario - The scenario to play
 * @param signal - AbortSignal for cancellation
 * @param level - CEFR level for speech rate adjustment
 * @param startFromIndex - Line index to resume from (0 = start)
 * @param pronunciationOpts - Options for pronunciation features
 */
export async function* playScenario(
    scenario: Scenario,
    signal: AbortSignal,
    level?: CEFRLevel,
    startFromIndex: number = 0,
    pronunciationOpts: PronunciationOptions = {},
): AsyncGenerator<PlaybackStatus> {
    const { lines, targetLang, nativeLang } = scenario;
    const hasPronunciation = pronunciationOpts.enableRecognition || pronunciationOpts.enableRecording;

    // iOS: preload voices on first playback
    preloadVoices();

    // Unlock audio context for sound effects (needs user gesture — called from BAŞLAT)
    unlockAudio();

    // Check if native language has a usable voice
    const nativeHasVoice = hasVoiceForLang(nativeLang);
    if (!nativeHasVoice) {
        console.log(`[SpeechEngine] No voice for ${nativeLang} — will show text with timed pause`);
    }

    // iOS: resume speechSynthesis when returning from background
    const handleVisibility = () => {
        if (document.visibilityState === "visible" && typeof window !== "undefined") {
            window.speechSynthesis.resume();
        }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Cleanup listener when generator completes or is aborted
    const cleanup = () => document.removeEventListener("visibilitychange", handleVisibility);

    // Ensure cleanup runs even if the generator is abandoned (component unmount)
    signal.addEventListener("abort", cleanup, { once: true });

    for (let i = startFromIndex; i < lines.length; i++) {
        const line = lines[i];

        if (signal.aborted) return;

        // Phase 1: Speak target language (e.g. Dutch)
        yield {
            lineIndex: i,
            totalLines: lines.length,
            phase: "target" as PlaybackPhase,
            text: line.targetText,
            nativeText: line.nativeText,
        };
        const targetDuration = await speakAsync(line.targetText, targetLang, level);

        if (signal.aborted) return;

        // Phase 2: User's turn — listen + record OR timed silence
        const pauseMs = Math.max(targetDuration * line.pauseMultiplier, 1500);

        if (hasPronunciation) {
            // Play "boop" sound + vibrate to signal user's turn
            await cueUserTurn();

            // Yield "listening" phase so UI can show mic animation
            yield {
                lineIndex: i,
                totalLines: lines.length,
                phase: "listening" as PlaybackPhase,
                text: line.targetText,
                nativeText: line.nativeText,
            };

            // Listen + record simultaneously
            const { result, recording } = await listenAndRecord(line.targetText, pronunciationOpts, signal);

            if (signal.aborted) return;

            // Play audio feedback based on score
            if (result.supported) {
                await cuePronunciationResult(result.score);
            }

            // Yield result to UI
            yield {
                lineIndex: i,
                totalLines: lines.length,
                phase: "pause" as PlaybackPhase,
                text: line.targetText,
                nativeText: line.nativeText,
                recognitionResult: result,
            };

            // Notify caller (for DB save)
            pronunciationOpts.onAttempt?.(i, result, recording);

            // Brief pause after feedback
            try {
                await waitMs(500, signal);
            } catch {
                return;
            }

            // Phase D1 Auto-Advance: If score >= 70%, skip retry phases and move directly to next line
            if (result.supported && result.score >= 0.70) {
                continue;
            }
        } else {
            // Legacy behavior: timed silence
            yield {
                lineIndex: i,
                totalLines: lines.length,
                phase: "pause" as PlaybackPhase,
                text: line.targetText,
                nativeText: line.nativeText,
            };
            try {
                await waitMs(pauseMs, signal);
            } catch {
                return;
            }
        }

        if (signal.aborted) return;

        // Phase 3: Native language — NEVER spoken, text displayed only
        yield {
            lineIndex: i,
            totalLines: lines.length,
            phase: "native" as PlaybackPhase,
            text: line.targetText,
            nativeText: line.nativeText,
        };

        // Always show text with a reading-time pause
        const estimatedReadingMs = Math.max(1500, line.nativeText.length * 60);
        try {
            await waitMs(estimatedReadingMs, signal);
        } catch {
            return;
        }

        if (signal.aborted) return;

        // Phase 4: Short gap before repeating
        yield {
            lineIndex: i,
            totalLines: lines.length,
            phase: "gap" as PlaybackPhase,
            text: "",
        };
        try {
            await waitMs(800, signal);
        } catch {
            return;
        }

        if (signal.aborted) return;

        // Phase 5: Repeat target language for reinforcement
        yield {
            lineIndex: i,
            totalLines: lines.length,
            phase: "repeat" as PlaybackPhase,
            text: line.targetText,
            nativeText: line.nativeText,
        };
        await speakAsync(line.targetText, targetLang, level);

        if (signal.aborted) return;

        // Phase 6: Second user turn — listen + record OR timed silence
        if (hasPronunciation) {
            await cueUserTurn();

            yield {
                lineIndex: i,
                totalLines: lines.length,
                phase: "listening" as PlaybackPhase,
                text: line.targetText,
                nativeText: line.nativeText,
            };

            const { result, recording } = await listenAndRecord(line.targetText, pronunciationOpts, signal);

            if (signal.aborted) return;

            if (result.supported) {
                await cuePronunciationResult(result.score);
            }

            yield {
                lineIndex: i,
                totalLines: lines.length,
                phase: "pause" as PlaybackPhase,
                text: line.targetText,
                nativeText: line.nativeText,
                recognitionResult: result,
            };

            pronunciationOpts.onAttempt?.(i, result, recording);

            try {
                await waitMs(500, signal);
            } catch {
                return;
            }
        } else {
            yield {
                lineIndex: i,
                totalLines: lines.length,
                phase: "pause" as PlaybackPhase,
                text: line.targetText,
                nativeText: line.nativeText,
            };
            try {
                await waitMs(pauseMs, signal);
            } catch {
                cleanup();
                return;
            }
        }
    }

    // Cleanup visibility handler when scenario completes normally
    cleanup();
}
