// ─── ShadowDrive AI — URL Slug Utilities ───
// Static mapping for category/subcategory names ↔ URL-safe slugs.
// No dynamic slugify needed — we have a small, known set of values.

const CATEGORY_SLUGS: Record<string, string> = {
    'Delftse Methode': 'delftse-methode',
    'Goedbezig Youtube Series': 'goedbezig-youtube',
};

const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
    Object.entries(CATEGORY_SLUGS).map(([k, v]) => [v, k])
);

const SUBCATEGORY_SLUGS: Record<string, string> = {
    'Oude Series': 'oude-series',
    'Nieuwe Series': 'nieuwe-series',
};

const SLUG_TO_SUBCATEGORY: Record<string, string> = Object.fromEntries(
    Object.entries(SUBCATEGORY_SLUGS).map(([k, v]) => [v, k])
);

export function categoryToSlug(category: string): string | null {
    return CATEGORY_SLUGS[category] ?? null;
}

export function slugToCategory(slug: string): string | null {
    return SLUG_TO_CATEGORY[slug] ?? null;
}

export function subcategoryToSlug(subcategory: string): string | null {
    return SUBCATEGORY_SLUGS[subcategory] ?? null;
}

export function slugToSubcategory(slug: string): string | null {
    return SLUG_TO_SUBCATEGORY[slug] ?? null;
}
