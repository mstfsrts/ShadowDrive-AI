'use client';

// ─── ShadowDrive AI — Scenario Input Form ───
// Topic + Difficulty selector with massive, driving-safe UI
// Localized for Turkish speakers learning Dutch

import { useState } from 'react';
import { Difficulty } from '@/types/dialogue';

interface ScenarioFormProps {
    onSubmit: (topic: string, difficulty: Difficulty) => void;
    isLoading: boolean;
}

const DIFFICULTIES: { value: Difficulty; label: string; emoji: string }[] = [
    { value: 'beginner', label: 'Başlangıç', emoji: '🌱' },
    { value: 'intermediate', label: 'Orta', emoji: '🔥' },
    { value: 'advanced', label: 'İleri', emoji: '⚡' },
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
    const [difficulty, setDifficulty] = useState<Difficulty>('beginner');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim()) {
            onSubmit(topic.trim(), difficulty);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-md mx-auto select-none">
            {/* Topic Input */}
            <div className="flex flex-col gap-2">
                <label htmlFor="topic-input" className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                    Senaryo Konusu
                </label>
                <input
                    id="topic-input"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="örn. Koffie bestellen in Amsterdam"
                    enterKeyHint="go"
                    className="w-full bg-shadow-800 border border-gray-700 rounded-2xl px-5 py-4 text-white text-lg
                     placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-2
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
                        className="px-4 py-2.5 rounded-xl bg-shadow-800 border border-gray-700 text-gray-300
                       text-sm hover:border-neon-green hover:text-neon-green transition-all duration-200
                       active:scale-95 min-h-[44px]"
                    >
                        {qt}
                    </button>
                ))}
            </div>

            {/* Difficulty Selector — large touch targets */}
            <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                    Seviye
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {DIFFICULTIES.map((d) => (
                        <button
                            key={d.value}
                            type="button"
                            onClick={() => setDifficulty(d.value)}
                            className={`flex flex-col items-center justify-center py-4 rounded-2xl border-2 
                         transition-all duration-300 active:scale-95 min-h-[72px]
                         ${difficulty === d.value
                                    ? 'border-neon-green bg-neon-green/10 text-neon-green shadow-lg shadow-neon-green/20'
                                    : 'border-gray-700 bg-shadow-800 text-gray-400 hover:border-gray-500'
                                }`}
                            disabled={isLoading}
                        >
                            <span className="text-2xl mb-1">{d.emoji}</span>
                            <span className="text-xs font-medium">{d.label}</span>
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
                        ? 'bg-emerald-500 text-shadow-950 hover:bg-emerald-400 animate-glow shadow-2xl shadow-emerald-500/30'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
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
