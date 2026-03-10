// ─── ShadowDrive AI — Dashboard Constants ───

export const CATEGORY_META: Record<string, { emoji: string; description: string }> = {
    'Delftse Methode': { emoji: '📚', description: 'Üniversite müfredatı bazlı kurslar' },
    'Goedbezig Youtube Series': { emoji: '🎬', description: 'YouTube video derslerinden uyarlama' },
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
