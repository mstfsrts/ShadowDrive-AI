// ─── ShadowDrive AI — Audio Recorder Module ───
// Records user's pronunciation via MediaRecorder API.
// Recordings are saved as Blob (WebM/Opus) for later upload to MinIO.

export interface RecordingResult {
    blob: Blob;
    duration: number; // milliseconds
    mimeType: string;
}

let mediaStream: MediaStream | null = null;

/**
 * Request microphone permission. Call early (on user gesture) to avoid
 * permission prompts during playback.
 */
export async function requestMicPermission(): Promise<boolean> {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if microphone permission has been granted.
 */
export function hasMicPermission(): boolean {
    return mediaStream !== null && mediaStream.active;
}

/**
 * Release the microphone stream.
 */
export function releaseMic(): void {
    if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
        mediaStream = null;
    }
}

/**
 * Record audio for a given duration or until signal aborts.
 * Returns a Blob with the recorded audio.
 */
export function recordAsync(
    maxDurationMs: number = 10_000,
    signal?: AbortSignal,
): Promise<RecordingResult> {
    return new Promise(async (resolve, reject) => {
        try {
            // Reuse existing stream or request new one
            if (!mediaStream || !mediaStream.active) {
                mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }

            // Pick best available codec
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4'; // Safari fallback

            const recorder = new MediaRecorder(mediaStream, { mimeType });
            const chunks: Blob[] = [];
            const startTime = Date.now();

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = () => {
                const duration = Date.now() - startTime;
                const blob = new Blob(chunks, { type: mimeType });
                resolve({ blob, duration, mimeType });
            };

            recorder.onerror = () => {
                reject(new Error('Recording failed'));
            };

            // Auto-stop after max duration
            const timer = setTimeout(() => {
                if (recorder.state === 'recording') {
                    recorder.stop();
                }
            }, maxDurationMs);

            // Abort signal support
            if (signal) {
                signal.addEventListener('abort', () => {
                    clearTimeout(timer);
                    if (recorder.state === 'recording') {
                        recorder.stop();
                    }
                });
            }

            recorder.start();
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Upload a recording blob to the server.
 * Returns the URL of the uploaded file, or null if upload fails.
 */
export async function uploadRecording(
    blob: Blob,
    lessonId: string,
    lineIndex: number,
): Promise<string | null> {
    try {
        const formData = new FormData();
        const ext = blob.type.includes('webm') ? 'webm' : 'mp4';
        formData.append('file', blob, `${lessonId}_line${lineIndex}.${ext}`);
        formData.append('lessonId', lessonId);
        formData.append('lineIndex', String(lineIndex));

        const res = await fetch('/api/recordings/upload', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) return null;
        const data = await res.json();
        return data.url ?? null;
    } catch {
        return null; // Upload failures should not block playback
    }
}
