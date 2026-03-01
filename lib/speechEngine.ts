// ─── ShadowDrive AI — Speech Engine ───
// Pure logic module: Promise-based TTS using Web Speech API.
// No UI dependencies. This is the heart of the app.

import { Scenario, PlaybackStatus, PlaybackPhase, CEFRLevel } from '@/types/dialogue';
import { getBestVoice, getRateForLevel, clearVoiceCache } from '@/lib/voiceSelector';

// ─── iOS WebKit: Preload voices ───
// iOS Safari has a known delay loading voices. Call this once on first user gesture.
let voicesLoaded = false;
export function preloadVoices(): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (voicesLoaded) return;

    // Force voice loading
    window.speechSynthesis.getVoices();

    // iOS fires 'voiceschanged' after initial load
    window.speechSynthesis.addEventListener('voiceschanged', () => {
        voicesLoaded = true;
        clearVoiceCache(); // Re-evaluate voices after they finish loading
        console.log('[SpeechEngine] Voices loaded:', window.speechSynthesis.getVoices().length);
    }, { once: true });

    console.log('[SpeechEngine] Voice preload triggered');
}

/**
 * Speak text aloud using the Web Speech API.
 * Uses the best available voice for the language and adjusts rate by CEFR level.
 * Returns a Promise that resolves with the approximate duration in ms.
 */
export function speakAsync(text: string, lang: string, level?: CEFRLevel): Promise<number> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            reject(new Error('Speech synthesis not available'));
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

        utterance.onerror = (event) => {
            // 'interrupted' and 'cancelled' are expected when user stops playback
            if (event.error === 'interrupted' || event.error === 'canceled') {
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
            reject(new DOMException('Aborted', 'AbortError'));
            return;
        }

        const timer = setTimeout(resolve, ms);

        signal?.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
        }, { once: true });
    });
}

/**
 * Cancel all queued and active speech synthesis.
 * iOS 17+ workaround: double-cancel to ensure utterance queue is fully cleared.
 */
export function cancelSpeech(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
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
 * Play through an entire scenario using the core loop:
 *   Target Language → Calculated Silence → Native Language → Short Gap → Target Language (repeat)
 *
 * Yields PlaybackStatus on each phase transition so the UI can update.
 * Accepts an AbortSignal for clean cancellation (pause/stop).
 *
 * @param scenario - The scenario to play
 * @param signal - AbortSignal for cancellation
 * @param level - CEFR level for speech rate adjustment
 * @param startFromIndex - Line index to resume from (0 = start)
 */
export async function* playScenario(
    scenario: Scenario,
    signal: AbortSignal,
    level?: CEFRLevel,
    startFromIndex: number = 0
): AsyncGenerator<PlaybackStatus> {
    const { lines, targetLang, nativeLang } = scenario;

    // iOS: preload voices on first playback
    preloadVoices();

    // Check if native language has a usable voice
    const nativeHasVoice = hasVoiceForLang(nativeLang);
    if (!nativeHasVoice) {
        console.log(`[SpeechEngine] No voice for ${nativeLang} — will show text with timed pause`);
    }

    // iOS: resume speechSynthesis when returning from background
    const handleVisibility = () => {
        if (document.visibilityState === 'visible' && typeof window !== 'undefined') {
            window.speechSynthesis.resume();
        }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Cleanup listener when generator completes
    const cleanup = () => document.removeEventListener('visibilitychange', handleVisibility);

    for (let i = startFromIndex; i < lines.length; i++) {
        const line = lines[i];

        if (signal.aborted) return;

        // Phase 1: Speak target language (e.g. Dutch) — Edge TTS or Web Speech
        yield {
            lineIndex: i,
            totalLines: lines.length,
            phase: 'target' as PlaybackPhase,
            text: line.targetText,
            nativeText: line.nativeText,
        };
        const targetDuration = await speakAsync(line.targetText, targetLang, level);

        if (signal.aborted) return;

        // Phase 2: Calculated silence — user speaks aloud
        const pauseMs = Math.max(targetDuration * line.pauseMultiplier, 1500);
        yield {
            lineIndex: i,
            totalLines: lines.length,
            phase: 'pause' as PlaybackPhase,
            text: line.targetText,
            nativeText: line.nativeText,
        };
        try {
            await waitMs(pauseMs, signal);
        } catch {
            return; // AbortError — user stopped
        }

        if (signal.aborted) return;

        // Phase 3: Native language (e.g. Turkish) — NEVER spoken, text displayed only
        yield {
            lineIndex: i,
            totalLines: lines.length,
            phase: 'native' as PlaybackPhase,
            text: line.targetText,
            nativeText: line.nativeText,
        };

        // Always show text with a reading-time pause — native language is never spoken
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
            phase: 'gap' as PlaybackPhase,
            text: '',
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
            phase: 'repeat' as PlaybackPhase,
            text: line.targetText,
            nativeText: line.nativeText,
        };
        await speakAsync(line.targetText, targetLang, level);

        if (signal.aborted) return;

        // Phase 6: Second calculated silence — user repeats aloud again
        yield {
            lineIndex: i,
            totalLines: lines.length,
            phase: 'pause' as PlaybackPhase,
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

    // Cleanup visibility handler when scenario completes normally
    cleanup();
}
