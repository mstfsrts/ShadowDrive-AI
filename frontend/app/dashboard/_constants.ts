// ─── ShadowDrive AI — Dashboard Constants ───

// Description keys map to messages/*.json → courses namespace
export const CATEGORY_META: Record<string, { emoji: string; descriptionKey: string }> = {
    'Delftse Methode': { emoji: '📚', descriptionKey: 'delftseDesc' },
    'Goedbezig Youtube Series': { emoji: '🎬', descriptionKey: 'goedDesc' },
};

export const SUBCATEGORY_META: Record<string, { emoji: string }> = {
    'Oude Series': { emoji: '📼' },
    'Nieuwe Series': { emoji: '🆕' },
};

// ─── URL Slug Maps (used by lib/slugs.ts and route pages) ───
export const DASHBOARD_TABS = [
    { key: 'courses', href: '/dashboard/courses', label: 'Kurslar', icon: '📚' },
    { key: 'ai', href: '/dashboard/ai', label: 'AI', icon: '🤖' },
    { key: 'custom', href: '/dashboard/custom', label: 'Metnim', icon: '✏️' },
] as const;
