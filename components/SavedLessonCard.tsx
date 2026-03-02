'use client';

// ─── ShadowDrive AI — Saved Lesson Card ───
// Reusable card for saved AI scenarios and custom lessons.
// Shows title (inline-editable), subtitle, and action buttons.

interface SavedLessonCardProps {
    id: string;
    title: string;
    subtitle: string;
    isEditing: boolean;
    editValue: string;
    onPlay: () => void;
    onPreview: () => void;
    onEditStart: () => void;
    onEditChange: (value: string) => void;
    onEditCommit: () => void;
    onEditCancel: () => void;
    onDelete: () => void;
}

export default function SavedLessonCard({
    title,
    subtitle,
    isEditing,
    editValue,
    onPlay,
    onPreview,
    onEditStart,
    onEditChange,
    onEditCommit,
    onEditCancel,
    onDelete,
}: SavedLessonCardProps) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50
         hover:border-border-hover transition-colors duration-200">
            {/* Title + subtitle */}
            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => onEditChange(e.target.value)}
                        onBlur={onEditCommit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onEditCommit();
                            if (e.key === 'Escape') onEditCancel();
                        }}
                        className="w-full bg-transparent border-b border-emerald-500 text-foreground
                         font-medium text-base outline-none pb-0.5"
                    />
                ) : (
                    <p className="text-foreground font-medium text-base truncate">{title}</p>
                )}
                <p className="text-foreground-muted text-xs mt-0.5">{subtitle}</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                    onClick={onPreview}
                    title="Önizle"
                    className="w-9 h-9 flex items-center justify-center rounded-xl
                     text-foreground-muted hover:text-foreground hover:bg-background
                     transition-colors duration-200 active:scale-95"
                >
                    👁
                </button>
                <button
                    onClick={onPlay}
                    title="Dinle"
                    className="w-9 h-9 flex items-center justify-center rounded-xl
                     text-foreground-muted hover:text-emerald-400 hover:bg-emerald-500/10
                     transition-colors duration-200 active:scale-95 text-sm"
                >
                    ▶
                </button>
                <button
                    onClick={isEditing ? onEditCancel : onEditStart}
                    title={isEditing ? 'İptal' : 'Yeniden adlandır'}
                    className="w-9 h-9 flex items-center justify-center rounded-xl
                     text-foreground-muted hover:text-foreground hover:bg-background
                     transition-colors duration-200 active:scale-95 text-sm"
                >
                    {isEditing ? '✕' : '✏'}
                </button>
                <button
                    onClick={onDelete}
                    title="Sil"
                    className="w-9 h-9 flex items-center justify-center rounded-xl
                     text-foreground-muted hover:text-red-400 hover:bg-red-500/10
                     transition-colors duration-200 active:scale-95 text-sm"
                >
                    🗑
                </button>
            </div>
        </div>
    );
}
