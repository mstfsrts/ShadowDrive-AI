'use client';

// ─── ShadowDrive AI — Scenario Input Form ───
// Topic + CEFR level selector with massive, driving-safe UI
// Localized for Turkish speakers learning Dutch

import { useState } from 'react';
import type { CEFRLevel } from '@/types/dialogue';

interface ScenarioFormProps {
    onSubmit: (topic: string, difficulty: CEFRLevel) => void;
    isLoading: boolean;
}

const CEFR_LEVELS: { value: CEFRLevel; label: string; desc: string; emoji: string }[] = [
    { value: 'A0-A1', label: 'Başlangıç', desc: 'Temel kelimeler, kısa cümleler', emoji: '🌱' },
    { value: 'A2', label: 'Temel', desc: 'Günlük basit konuşmalar', emoji: '🌿' },
    { value: 'B1', label: 'Orta', desc: 'Ofis sohbetleri, randevular', emoji: '🔥' },
    { value: 'B2', label: 'İleri Orta', desc: 'Detaylı tartışmalar, fikirler', emoji: '⚡' },
    { value: 'C1-C2', label: 'İleri', desc: 'Deyimler, karmaşık yapılar', emoji: '🎯' },
];

const QUICK_TOPICS = [
    'Koffie bestellen',
    'Bij de huisarts',
    'Sollicitatiegesprek',
    'UX design meeting',
    'Boodschappen doen',
    'Smalltalk met collega\'s',
    'Bij de gemeente',
    'Telefoneren met klanten',
];

export default function ScenarioForm({ onSubmit, isLoading }: ScenarioFormProps) {
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState<CEFRLevel>('A0-A1');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim()) {
            onSubmit(topic.trim(), level);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-md mx-auto select-none">
            {/* Topic Input */}
            <div className="flex flex-col gap-2">
                <label htmlFor="topic-input" className="text-foreground-secondary text-sm font-medium uppercase tracking-wider">
                    Senaryo Konusu
                </label>
                <input
                    id="topic-input"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="örn. Yeni iş arkadaşlarımla tanışma"
                    enterKeyHint="go"
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-foreground text-lg
                     placeholder-foreground-muted focus:outline-none focus:border-neon-green focus:ring-2
                     focus:ring-neon-green/30 transition-all duration-300"
                    disabled={isLoading}
                    autoComplete="off"
                />
            </div>

            {/* Quick Topic Buttons */}
            <div className="flex flex-wrap gap-2">
                {QUICK_TOPICS.map((qt) => (
                    <button
                        key={qt}
                        type="button"
                        onClick={() => setTopic(qt)}
                        className="px-4 py-2.5 rounded-xl bg-card border border-border text-foreground-secondary
                       text-sm hover:border-neon-green hover:text-neon-green transition-all duration-200
                       active:scale-95 min-h-[44px]"
                    >
                        {qt}
                    </button>
                ))}
            </div>

            {/* CEFR Level Selector — 5 levels with descriptions */}
            <div className="flex flex-col gap-2">
                <label className="text-foreground-secondary text-sm font-medium uppercase tracking-wider">
                    Dil Seviyesi
                </label>
                <div className="flex flex-col gap-2">
                    {CEFR_LEVELS.map((l) => (
                        <button
                            key={l.value}
                            type="button"
                            onClick={() => setLevel(l.value)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2
                             transition-all duration-300 active:scale-[0.98] min-h-[56px] text-left
                             ${level === l.value
                                    ? 'border-neon-green bg-neon-green/10 shadow-lg shadow-neon-green/20'
                                    : 'border-border bg-card hover:border-border-hover'
                                }`}
                            disabled={isLoading}
                        >
                            <span className="text-xl flex-shrink-0">{l.emoji}</span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold ${level === l.value ? 'text-neon-green' : 'text-foreground'}`}>
                                        {l.label}
                                    </span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-mono ${level === l.value
                                            ? 'bg-neon-green/20 text-neon-green'
                                            : 'bg-card-hover text-foreground-secondary'
                                        }`}>
                                        {l.value}
                                    </span>
                                </div>
                                <p className={`text-xs mt-0.5 ${level === l.value ? 'text-emerald-600 dark:text-emerald-300' : 'text-foreground-muted'}`}>
                                    {l.desc}
                                </p>
                            </div>
                            {level === l.value && (
                                <span className="text-neon-green text-lg flex-shrink-0">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* GO Button — MASSIVE, neon green, for driving safety */}
            <button
                id="go-button"
                type="submit"
                disabled={!topic.trim() || isLoading}
                className={`relative w-full min-h-[80px] rounded-3xl text-2xl font-bold uppercase tracking-widest
                   transition-all duration-300 active:scale-95
                   ${topic.trim() && !isLoading
                        ? 'bg-emerald-500 text-white dark:text-shadow-950 hover:bg-emerald-400 animate-glow shadow-2xl shadow-emerald-500/30'
                        : 'bg-card-hover text-foreground-muted cursor-not-allowed'
                    }`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-7 w-7" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Oluşturuluyor...
                    </span>
                ) : (
                    'BAŞLA'
                )}
            </button>
        </form>
    );
}
