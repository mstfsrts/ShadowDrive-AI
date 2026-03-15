// ─── ShadowDrive AI — Speech Recognition Module ───
// Uses Web Speech API (SpeechRecognition) for browser-based Dutch speech recognition.
// Hybrid word+character Levenshtein scoring for pronunciation accuracy.
// Falls back gracefully on unsupported browsers (Firefox).

export interface RecognitionResult {
    transcript: string;
    score: number;       // 0.0 - 1.0
    correct: boolean;    // score >= threshold
    supported: boolean;  // false = browser doesn't support speech recognition
}

const SCORE_THRESHOLD = 0.7;
const DEFAULT_LISTEN_TIMEOUT_MS = 8_000;
const SILENCE_TIMEOUT_MS = 2_000; // Stop after 2s of silence in continuous mode

// ─── Feature Detection ────────────────────────────────────────────────────────

interface SpeechRecognitionInstance {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    continuous: boolean;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
}

interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultItem {
    readonly isFinal: boolean;
    readonly length: number;
    [index: number]: { transcript: string };
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
    if (typeof window === 'undefined') return null;
    return (
        (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ??
        (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition ??
        null
    );
}

export function isSpeechRecognitionSupported(): boolean {
    return getSpeechRecognition() !== null;
}

// ─── Listen & Compare ─────────────────────────────────────────────────────────

/**
 * Listen for Dutch speech and compare against target text.
 * Uses continuous mode to capture full sentences without cutting off mid-speech.
 * Stops after SILENCE_TIMEOUT_MS of no new speech or timeoutMs total.
 */
export function listenAsync(
    targetText: string,
    signal?: AbortSignal,
    timeoutMs: number = DEFAULT_LISTEN_TIMEOUT_MS,
): Promise<RecognitionResult> {
    const SpeechRecognitionClass = getSpeechRecognition();

    if (!SpeechRecognitionClass) {
        return Promise.resolve({
            transcript: '',
            score: 0,
            correct: false,
            supported: false,
        });
    }

    return new Promise((resolve) => {
        const recognition = new SpeechRecognitionClass();
        recognition.lang = 'nl-NL';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.continuous = true;

        let settled = false;
        let fullTranscript = '';
        let silenceTimer: ReturnType<typeof setTimeout> | null = null;

        const finish = (result: RecognitionResult) => {
            if (settled) return;
            settled = true;
            if (silenceTimer) clearTimeout(silenceTimer);
            clearTimeout(maxTimer);
            try { recognition.stop(); } catch { /* already stopped */ }
            resolve(result);
        };

        const finishWithCurrentTranscript = () => {
            const transcript = fullTranscript.trim();
            if (transcript) {
                const score = calculateScore(targetText, transcript);
                finish({
                    transcript,
                    score,
                    correct: score >= SCORE_THRESHOLD,
                    supported: true,
                });
            } else {
                finish({
                    transcript: '',
                    score: 0,
                    correct: false,
                    supported: true,
                });
            }
        };

        // Max timeout — don't hang forever
        const maxTimer = setTimeout(finishWithCurrentTranscript, timeoutMs);

        // Abort signal support
        if (signal) {
            signal.addEventListener('abort', () => {
                finishWithCurrentTranscript();
            });
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            // Build full transcript from all results
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0]?.transcript ?? '';
            }
            fullTranscript = transcript;

            // Reset silence timer — user is still speaking
            if (silenceTimer) clearTimeout(silenceTimer);
            silenceTimer = setTimeout(finishWithCurrentTranscript, SILENCE_TIMEOUT_MS);
        };

        recognition.onerror = () => {
            finishWithCurrentTranscript();
        };

        recognition.onend = () => {
            // In continuous mode, onend may fire when browser decides to stop.
            // Finish with whatever we have.
            finishWithCurrentTranscript();
        };

        try {
            recognition.start();
        } catch {
            finish({
                transcript: '',
                score: 0,
                correct: false,
                supported: false,
            });
        }
    });
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Calculate pronunciation score using hybrid word + character Levenshtein.
 * Word-level catches missing/extra words, character-level catches pronunciation details.
 * Returns 0.0 (completely wrong) to 1.0 (perfect match).
 */
export function calculateScore(target: string, spoken: string): number {
    const a = normalize(target);
    const b = normalize(spoken);

    if (a.length === 0 && b.length === 0) return 1.0;
    if (a.length === 0 || b.length === 0) return 0.0;

    // Word-level score (catches missing/extra words)
    const wordsA = a.split(' ').filter(w => w.length > 0);
    const wordsB = b.split(' ').filter(w => w.length > 0);
    const wordDistance = levenshteinArr(wordsA, wordsB);
    const maxWords = Math.max(wordsA.length, wordsB.length);
    const wordScore = Math.max(0, 1 - wordDistance / maxWords);

    // Character-level score (catches pronunciation nuances)
    const charDistance = levenshteinStr(a, b);
    const maxChars = Math.max(a.length, b.length);
    const charScore = Math.max(0, 1 - charDistance / maxChars);

    // Hybrid: word-level weighted heavier (catches structural errors better)
    return wordScore * 0.7 + charScore * 0.3;
}

function normalize(text: string): string {
    return text
        .toLowerCase()
        .replace(/[.,!?;:'"()\-–—]/g, '')  // Remove punctuation
        .replace(/\s+/g, ' ')               // Normalize whitespace
        .trim();
}

/** Levenshtein distance for arrays of strings (word-level). */
function levenshteinArr(a: string[], b: string[]): number {
    const m = a.length;
    const n = b.length;

    const prev = Array.from({ length: n + 1 }, (_, i) => i);

    for (let i = 1; i <= m; i++) {
        let prevDiag = prev[0];
        prev[0] = i;

        for (let j = 1; j <= n; j++) {
            const temp = prev[j];
            if (a[i - 1] === b[j - 1]) {
                prev[j] = prevDiag;
            } else {
                prev[j] = 1 + Math.min(prevDiag, prev[j], prev[j - 1]);
            }
            prevDiag = temp;
        }
    }

    return prev[n];
}

/** Levenshtein distance for strings (character-level). */
function levenshteinStr(a: string, b: string): number {
    const m = a.length;
    const n = b.length;

    const prev = Array.from({ length: n + 1 }, (_, i) => i);

    for (let i = 1; i <= m; i++) {
        let prevDiag = prev[0];
        prev[0] = i;

        for (let j = 1; j <= n; j++) {
            const temp = prev[j];
            if (a[i - 1] === b[j - 1]) {
                prev[j] = prevDiag;
            } else {
                prev[j] = 1 + Math.min(prevDiag, prev[j], prev[j - 1]);
            }
            prevDiag = temp;
        }
    }

    return prev[n];
}
