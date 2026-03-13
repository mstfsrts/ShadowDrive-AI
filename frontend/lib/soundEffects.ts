// ─── ShadowDrive AI — Sound Effects System ───
// Hands-free audio cues for driving scenario.
// Uses Web Audio API to generate tones (no external files needed).
// iOS requires user interaction to unlock AudioContext — handled by unlockAudio().

type SoundType = 'boop' | 'ding' | 'error' | 'hmm';

let audioCtx: AudioContext | null = null;
let unlocked = false;

function getAudioContext(): AudioContext {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtx;
}

/**
 * Must be called from a user gesture (click/touch) to unlock iOS AudioContext.
 * Call this on the first BAŞLAT button press.
 */
export function unlockAudio(): void {
    if (unlocked) return;
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        // Play silent buffer to fully unlock on iOS
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        unlocked = true;
    } catch {
        // Silently fail — sounds will work on next user interaction
    }
}

/**
 * Play a synthesized sound effect.
 * Returns a promise that resolves when the sound finishes.
 */
export async function playSound(type: SoundType): Promise<void> {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') await ctx.resume();

        switch (type) {
            case 'boop':
                await playTone(ctx, 440, 0.15, 'sine', 0.4);  // A4, short beep
                break;
            case 'ding':
                await playTone(ctx, 880, 0.3, 'sine', 0.3);   // A5, pleasant chime
                break;
            case 'error':
                await playTone(ctx, 220, 0.12, 'square', 0.3); // Low buzz
                await wait(80);
                await playTone(ctx, 220, 0.12, 'square', 0.3); // Double buzz
                break;
            case 'hmm':
                await playTone(ctx, 330, 0.25, 'triangle', 0.25); // E4, uncertain
                break;
        }
    } catch {
        // Audio not available — fail silently (user is driving, no crash)
    }
}

/**
 * Trigger device vibration if supported.
 */
export function vibrate(pattern: number | number[] = 100): void {
    try {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    } catch {
        // Vibration not available
    }
}

/**
 * Combined audio cue: sound + vibration.
 * Used when it's user's turn to speak.
 */
export async function cueUserTurn(): Promise<void> {
    vibrate(100);
    await playSound('boop');
}

/**
 * Feedback after pronunciation attempt.
 */
export async function cuePronunciationResult(score: number): Promise<void> {
    if (score >= 0.7) {
        await playSound('ding');
    } else if (score >= 0.4) {
        await playSound('hmm');
    } else {
        vibrate([100, 50, 100]); // double vibrate for error
        await playSound('error');
    }
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function playTone(
    ctx: AudioContext,
    frequency: number,
    duration: number,
    waveType: OscillatorType,
    volume: number,
): Promise<void> {
    return new Promise(resolve => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = waveType;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        // Fade out to avoid click
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);

        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
            resolve();
        };
    });
}

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
