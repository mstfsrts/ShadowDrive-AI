'use client';

// ─── ShadowDrive AI — Status Bar ───
// Shows the current playback state in large, readable text

import { useTranslations } from 'next-intl';
import { PlaybackPhase } from '@/types/dialogue';

interface StatusBarProps {
    phase: PlaybackPhase | 'idle' | 'complete' | 'loading';
    lineIndex: number;
    totalLines: number;
}

const PHASE_ICONS: Record<string, string> = {
    idle: '⏸',
    loading: '⏳',
    target: '🇳🇱',
    pause: '🎤',
    listening: '🎤',
    native: '🇹🇷',
    repeat: '🔁',
    gap: '⏭',
    complete: '✅',
};

const PHASE_COLORS: Record<string, string> = {
    idle: 'text-foreground-secondary',
    loading: 'text-amber-400',
    target: 'text-emerald-600 dark:text-emerald-400',
    pause: 'text-amber-600 dark:text-amber-400',
    listening: 'text-red-500 dark:text-red-400',
    native: 'text-blue-600 dark:text-blue-400',
    repeat: 'text-emerald-600 dark:text-emerald-300',
    gap: 'text-foreground-muted',
    complete: 'text-emerald-600 dark:text-emerald-400',
};

export default function StatusBar({ phase, lineIndex, totalLines }: StatusBarProps) {
    const t = useTranslations('player');
    const tc = useTranslations('common');

    const PHASE_LABELS: Record<string, string> = {
        idle: t('ready'),
        loading: tc('loading'),
        target: t('listenDutch'),
        pause: t('yourTurn'),
        listening: t('listening'),
        native: t('answerNative'),
        repeat: t('repeatDutch'),
        gap: t('nextSentence'),
        complete: t('lessonComplete'),
    };

    const label = PHASE_LABELS[phase] ?? PHASE_LABELS.idle;
    const icon = PHASE_ICONS[phase] ?? PHASE_ICONS.idle;
    const color = PHASE_COLORS[phase] ?? PHASE_COLORS.idle;

    return (
        <div className="w-full flex items-center justify-between px-6 py-4">
            {/* Phase indicator */}
            <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <span className={`text-lg font-semibold ${color} transition-colors duration-300`}>
                    {label}
                </span>
            </div>

            {/* Progress counter */}
            {totalLines > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">{lineIndex + 1}</span>
                    <span className="text-foreground-muted text-lg">/</span>
                    <span className="text-lg text-foreground-secondary">{totalLines}</span>
                </div>
            )}
        </div>
    );
}
