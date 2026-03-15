'use client';

// ─── ShadowDrive AI — Compact Recording Player ───
// Fetches presigned URL for a pronunciation attempt and plays audio.

import { useState, useRef, useEffect } from 'react';

interface RecordingPlayerProps {
    attemptId: string;
}

export default function RecordingPlayer({ attemptId }: RecordingPlayerProps) {
    const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const urlRef = useRef<string | null>(null);
    const stateRef = useRef(state);
    stateRef.current = state;

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
                audioRef.current = null;
            }
        };
    }, []);

    const handleToggle = async () => {
        // If playing, pause
        if (stateRef.current === 'playing' && audioRef.current) {
            audioRef.current.pause();
            setState('idle');
            return;
        }

        // If idle or error, fetch URL and play
        setState('loading');
        try {
            if (!urlRef.current) {
                const res = await fetch(`/api/recordings/${attemptId}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                urlRef.current = data.url;
            }

            // Reuse existing Audio or create once
            if (!audioRef.current) {
                audioRef.current = new Audio();
                audioRef.current.onended = () => setState('idle');
                audioRef.current.onerror = () => {
                    // Clear stale URL so next attempt refetches
                    urlRef.current = null;
                    setState('error');
                };
            }
            audioRef.current.src = urlRef.current!;
            await audioRef.current.play();
            setState('playing');
        } catch {
            urlRef.current = null;
            setState('error');
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={state === 'loading'}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                       bg-card-hover hover:bg-border/50 transition-colors
                       disabled:opacity-50 text-sm"
            title={state === 'playing' ? 'Pause' : 'Play recording'}
        >
            {state === 'loading' ? (
                <span className="w-4 h-4 border-2 border-foreground-faint border-t-emerald-500 rounded-full animate-spin" />
            ) : state === 'playing' ? (
                <span className="text-emerald-500">⏸</span>
            ) : state === 'error' ? (
                <span className="text-red-500 text-xs">!</span>
            ) : (
                <span className="text-foreground-muted">▶</span>
            )}
        </button>
    );
}
