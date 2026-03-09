'use client';

// ─── ShadowDrive AI — Resume Prompt Modal (Yapı Taşı) ───
// Shared "yarıda bırakılmış ders" UI for Kurslar, AI, and Metnim.

export interface ResumePromptModalProps {
    title: string;
    lastLineIndex: number;
    onResume: () => void;
    onRestart: () => void;
    onDismiss: () => void;
}

export default function ResumePromptModal({
    title,
    lastLineIndex,
    onResume,
    onRestart,
    onDismiss,
}: ResumePromptModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onDismiss}
                aria-hidden
            />
            <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl">
                <p className="text-foreground-muted text-xs uppercase tracking-widest mb-1">
                    Yarıda bırakılmış ders
                </p>
                <h3 className="text-foreground font-bold text-xl mb-1 truncate" title={title}>
                    {title}
                </h3>
                <p className="text-amber-400 text-sm mb-6">
                    ⏸ {lastLineIndex + 1}. cümlede bırakmıştın
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onResume}
                        className="w-full min-h-[56px] rounded-2xl bg-emerald-500 text-white font-bold text-lg
                         hover:bg-emerald-400 transition-colors duration-200 active:scale-95"
                    >
                        ▶ Kaldığın yerden devam et
                    </button>
                    <button
                        type="button"
                        onClick={onRestart}
                        className="w-full min-h-[56px] rounded-2xl bg-card border border-border text-foreground-secondary
                         font-medium text-base hover:border-border-hover hover:text-foreground
                         transition-colors duration-200 active:scale-95"
                    >
                        ↺ Baştan başla
                    </button>
                </div>
            </div>
        </div>
    );
}
