'use client';

import { useState } from 'react';
import { Scenario, DialogueLine } from '@/types/dialogue';

interface CustomTextFormProps {
    onSubmit: (scenario: Scenario) => void;
}

export default function CustomTextForm({ onSubmit }: CustomTextFormProps) {
    const [title, setTitle] = useState('');
    const [rawText, setRawText] = useState('');
    const [error, setError] = useState('');

    const handleParseAndSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Lütfen bir başlık girin.');
            return;
        }

        if (!rawText.trim()) {
            setError('Lütfen metin girin.');
            return;
        }

        const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const parsedLines: DialogueLine[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.includes('=')) {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const dutch = parts[0].trim();
                    const turkish = parts.slice(1).join('=').trim();

                    parsedLines.push({
                        id: i + 1,
                        targetText: dutch,
                        nativeText: turkish,
                        pauseMultiplier: 1.5
                    });
                }
            } else {
                parsedLines.push({
                    id: i + 1,
                    targetText: line,
                    nativeText: '',
                    pauseMultiplier: 1.5
                });
            }
        }

        if (parsedLines.length === 0) {
            setError('Geçerli bir metin bulunamadı. Lütfen "Hollandaca = Türkçe" formatında girin.');
            return;
        }

        const customScenario: Scenario = {
            title: title.trim(),
            targetLang: 'nl-NL',
            nativeLang: 'tr-TR',
            lines: parsedLines,
        };

        onSubmit(customScenario);
    };

    return (
        <form onSubmit={handleParseAndSubmit} className="flex flex-col gap-6 w-full max-w-md mx-auto">
            {/* Title Input */}
            <div className="flex flex-col gap-2">
                <label className="text-foreground-secondary text-sm font-medium uppercase tracking-wider">
                    Ders Başlığı
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="örn. Benim Özel Dersim"
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-foreground text-lg
                     placeholder-foreground-muted focus:outline-none focus:border-neon-green focus:ring-2
                     focus:ring-neon-green/30 transition-all duration-300"
                    autoComplete="off"
                />
            </div>

            {/* Textarea */}
            <div className="flex flex-col gap-2">
                <label className="text-foreground-secondary text-sm font-medium uppercase tracking-wider flex justify-between">
                    <span>Metniniz</span>
                    <span className="text-foreground-muted text-xs normal-case">Format: Hollandaca = Türkçe</span>
                </label>
                <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={'Ik drink water = Su içiyorum.\nHoe gaat het? = Nasılsın?'}
                    rows={8}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-foreground text-base
                     placeholder-foreground-muted focus:outline-none focus:border-neon-green focus:ring-2
                     focus:ring-neon-green/30 transition-all duration-300 resize-none font-mono"
                />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            {/* Submit Button */}
            <button
                type="submit"
                className={`relative w-full min-h-[80px] rounded-3xl text-2xl font-bold uppercase tracking-widest
                   transition-all duration-300 active:scale-95
                   ${title.trim() && rawText.trim()
                        ? 'bg-emerald-500 text-white dark:text-shadow-950 hover:bg-emerald-400 animate-glow shadow-2xl shadow-emerald-500/30'
                        : 'bg-card-hover text-foreground-muted cursor-not-allowed'
                    }`}
                disabled={!title.trim() || !rawText.trim()}
            >
                BAŞLA
            </button>
        </form>
    );
}
