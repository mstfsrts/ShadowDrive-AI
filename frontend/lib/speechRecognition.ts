// ─── ShadowDrive AI — Speech Recognition Module ───
// Uses Web Speech API (SpeechRecognition) for browser-based Dutch speech recognition.
// Levenshtein distance scoring for pronunciation accuracy.
// Falls back gracefully on unsupported browsers (Firefox).

export interface RecognitionResult {
    transcript: string;
    score: number;       // 0.0 - 1.0
    correct: boolean;    // score >= threshold
    supported: boolean;  // false = browser doesn't support speech recognition
}

const SCORE_THRESHOLD = 0.7;
const LISTEN_TIMEOUT_MS = 8_000; // Max listening time per phrase

// ─── Feature Detection ────────────────────────────────────────────────────────

// Web Speech API types (not available in all TS configs)
interface SpeechRecognitionInstance {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    continuous: boolean;
    onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
    onerror: (() => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
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
 * Resolves with a RecognitionResult.
 * If speech recognition is not supported, returns a fallback result.
 */
export function listenAsync(
    targetText: string,
    signal?: AbortSignal,
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
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        let settled = false;

        const finish = (result: RecognitionResult) => {
            if (settled) return;
            settled = true;
            try { recognition.stop(); } catch { /* already stopped */ }
            resolve(result);
        };

        // Timeout — don't hang forever
        const timer = setTimeout(() => {
            finish({
                transcript: '',
                score: 0,
                correct: false,
                supported: true,
            });
        }, LISTEN_TIMEOUT_MS);

        // Abort signal support
        if (signal) {
            signal.addEventListener('abort', () => {
                clearTimeout(timer);
                finish({
                    transcript: '',
                    score: 0,
                    correct: false,
                    supported: true,
                });
            });
        }

        recognition.onresult = (event) => {
            clearTimeout(timer);
            const transcript = event.results[0]?.[0]?.transcript ?? '';
            const score = calculateScore(targetText, transcript);
            finish({
                transcript,
                score,
                correct: score >= SCORE_THRESHOLD,
                supported: true,
            });
        };

        recognition.onerror = () => {
            clearTimeout(timer);
            finish({
                transcript: '',
                score: 0,
                correct: false,
                supported: true,
            });
        };

        recognition.onend = () => {
            clearTimeout(timer);
            // If no result came, resolve with empty
            finish({
                transcript: '',
                score: 0,
                correct: false,
                supported: true,
            });
        };

        try {
            recognition.start();
        } catch {
            clearTimeout(timer);
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
 * Calculate pronunciation score using normalized Levenshtein distance.
 * Returns 0.0 (completely wrong) to 1.0 (perfect match).
 */
export function calculateScore(target: string, spoken: string): number {
    const a = normalize(target);
    const b = normalize(spoken);

    if (a.length === 0 && b.length === 0) return 1.0;
    if (a.length === 0 || b.length === 0) return 0.0;

    const distance = levenshtein(a, b);
    const maxLen = Math.max(a.length, b.length);

    return Math.max(0, 1 - distance / maxLen);
}

function normalize(text: string): string {
    return text
        .toLowerCase()
        .replace(/[.,!?;:'"()\-–—]/g, '')  // Remove punctuation
        .replace(/\s+/g, ' ')               // Normalize whitespace
        .trim();
}

function levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;

    // Use single array optimization
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
