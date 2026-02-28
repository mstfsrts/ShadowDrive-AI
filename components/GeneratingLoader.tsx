'use client';

// ─── ShadowDrive AI — AI Generating Loader ───
// Professional loading animation with orbiting rings, sound wave bars,
// and rotating status messages. Pure CSS animations for smooth 60fps.

import { useState, useEffect } from 'react';

const STATUS_MESSAGES = [
    'Senaryo oluşturuluyor...',
    'Diyalog hazırlanıyor...',
    'Cümleler düzenleniyor...',
    'Çeviriler ekleniyor...',
    'Neredeyse hazır...',
];

export default function GeneratingLoader() {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center gap-10 w-full py-12 animate-fade-in select-none">
            {/* Orbital animation container */}
            <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Outer ring 3 — slowest */}
                <div className="generating-ring-3 absolute inset-0 rounded-full border border-emerald-500/10" />

                {/* Outer ring 2 — medium */}
                <div className="generating-ring-2 absolute inset-3 rounded-full border border-emerald-500/20">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400/60" />
                </div>

                {/* Inner ring 1 — fastest */}
                <div className="generating-ring-1 absolute inset-7 rounded-full border border-emerald-500/30">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-300/40" />
                </div>

                {/* Core orb */}
                <div className="generating-orb relative z-10 w-16 h-16 rounded-full
                     bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600
                     shadow-[0_0_40px_rgba(16,185,129,0.4),0_0_80px_rgba(16,185,129,0.15)]
                     flex items-center justify-center">
                    {/* AI brain icon */}
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white"
                         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z" />
                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z" />
                    </svg>
                </div>
            </div>

            {/* Sound wave visualization */}
            <div className="flex items-end justify-center gap-1 h-8">
                {Array.from({ length: 12 }, (_, i) => (
                    <div
                        key={i}
                        className="wave-bar w-1 rounded-full bg-emerald-500/60"
                        style={{
                            height: '100%',
                            animationDelay: `${i * 0.1}s`,
                        }}
                    />
                ))}
            </div>

            {/* Rotating status text */}
            <div className="h-6 overflow-hidden">
                <p
                    key={messageIndex}
                    className="text-foreground-secondary text-sm font-medium tracking-wide text-center"
                    style={{ animation: 'status-text 3s ease-in-out' }}
                >
                    {STATUS_MESSAGES[messageIndex]}
                </p>
            </div>
        </div>
    );
}
