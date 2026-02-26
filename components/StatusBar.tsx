'use client';

// ─── ShadowDrive AI — Status Bar ───
// Shows the current playback state in large, readable text

import { PlaybackPhase } from '@/types/dialogue';

interface StatusBarProps {
    phase: PlaybackPhase | 'idle' | 'complete' | 'loading';
    lineIndex: number;
    totalLines: number;
}

const PHASE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    idle: { label: 'Ready', color: 'text-gray-400', icon: '⏸' },
    loading: { label: 'Loading...', color: 'text-yellow-400', icon: '⏳' },
    target: { label: 'Listen — Dutch', color: 'text-emerald-400', icon: '🇳🇱' },
    pause: { label: 'Your turn — Speak!', color: 'text-amber-400', icon: '🎤' },
    native: { label: 'Answer — English', color: 'text-blue-400', icon: '🇬🇧' },
    repeat: { label: 'Listen again — Dutch', color: 'text-emerald-300', icon: '🔁' },
    gap: { label: 'Next phrase...', color: 'text-gray-500', icon: '⏭' },
    complete: { label: 'Session Complete!', color: 'text-emerald-400', icon: '✅' },
};

export default function StatusBar({ phase, lineIndex, totalLines }: StatusBarProps) {
    const config = PHASE_CONFIG[phase] || PHASE_CONFIG.idle;

    return (
        <div className="w-full flex items-center justify-between px-6 py-4">
            {/* Phase indicator */}
            <div className="flex items-center gap-3">
                <span className="text-2xl">{config.icon}</span>
                <span className={`text-lg font-semibold ${config.color} transition-colors duration-300`}>
                    {config.label}
                </span>
            </div>

            {/* Progress counter */}
            {totalLines > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">{lineIndex + 1}</span>
                    <span className="text-gray-500 text-lg">/</span>
                    <span className="text-lg text-gray-400">{totalLines}</span>
                </div>
            )}
        </div>
    );
}
