// ─── ShadowDrive AI — Screen Wake Lock ───
// Prevents screen from turning off during lesson playback.
// Uses the Screen Wake Lock API (Chrome, Edge, Safari 16.4+).
// Falls back gracefully on unsupported browsers.

let wakeLock: WakeLockSentinel | null = null;

/**
 * Request a screen wake lock to prevent the display from turning off.
 */
export async function requestWakeLock(): Promise<void> {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
    } catch {
        // Fails silently on low battery, unsupported, or non-secure context
    }
}

/**
 * Release the current wake lock.
 */
export function releaseWakeLock(): void {
    wakeLock?.release();
    wakeLock = null;
}

/**
 * Wake lock auto-releases when page becomes hidden. This sets up
 * automatic re-acquisition when the page becomes visible again.
 * Returns a cleanup function to remove the listener.
 */
export function setupWakeLockReacquisition(): () => void {
    const handler = async () => {
        if (document.visibilityState === 'visible' && !wakeLock) {
            await requestWakeLock();
        }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
}
