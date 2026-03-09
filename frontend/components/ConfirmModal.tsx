'use client';

// ─── ShadowDrive AI — Confirm Modal ───
// Silme vb. onay ekranı. Tasarım: ResumePromptModal ile uyumlu (koyu tema, büyük dokunma alanları).

export interface ConfirmModalProps {
    open: boolean;
    title: string;
    /** Opsiyonel: "Bu dersi silmek istediğinize emin misiniz?" altında gösterilecek (ders adı vb.) */
    subtitle?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** 'danger' = kırmızı Sil butonu */
    variant?: 'danger' | 'default';
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    open,
    title,
    subtitle,
    confirmLabel = 'Onayla',
    cancelLabel = 'İptal',
    variant = 'default',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
                aria-hidden
            />
            <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl">
                <h3 className="text-foreground font-bold text-lg mb-1">
                    {title}
                </h3>
                {subtitle ? (
                    <p className="text-foreground-muted text-sm mb-6 truncate" title={subtitle}>
                        {subtitle}
                    </p>
                ) : (
                    <div className="mb-6" />
                )}
                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`w-full min-h-[56px] rounded-2xl font-bold text-lg
                         transition-colors duration-200 active:scale-95
                         ${variant === 'danger'
                            ? 'bg-red-500 text-white hover:bg-red-400'
                            : 'bg-emerald-500 text-white hover:bg-emerald-400'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full min-h-[56px] rounded-2xl bg-card border border-border text-foreground-secondary
                         font-medium text-base hover:border-border-hover hover:text-foreground
                         transition-colors duration-200 active:scale-95"
                    >
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
