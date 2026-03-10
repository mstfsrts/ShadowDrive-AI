import { describe, it, expect } from 'vitest';
import { categoryToSlug, slugToCategory, subcategoryToSlug, slugToSubcategory } from '@/lib/slugs';

describe('slugs', () => {
    describe('categoryToSlug', () => {
        it('converts known categories', () => {
            expect(categoryToSlug('Delftse Methode')).toBe('delftse-methode');
            expect(categoryToSlug('Goedbezig Youtube Series')).toBe('goedbezig-youtube');
        });

        it('returns null for unknown categories', () => {
            expect(categoryToSlug('Unknown Category')).toBeNull();
        });
    });

    describe('slugToCategory', () => {
        it('converts known slugs', () => {
            expect(slugToCategory('delftse-methode')).toBe('Delftse Methode');
            expect(slugToCategory('goedbezig-youtube')).toBe('Goedbezig Youtube Series');
        });

        it('returns null for unknown slugs', () => {
            expect(slugToCategory('unknown-slug')).toBeNull();
        });
    });

    describe('subcategoryToSlug', () => {
        it('converts known subcategories', () => {
            expect(subcategoryToSlug('Oude Series')).toBe('oude-series');
            expect(subcategoryToSlug('Nieuwe Series')).toBe('nieuwe-series');
        });

        it('returns null for unknown subcategories', () => {
            expect(subcategoryToSlug('Unknown Sub')).toBeNull();
        });
    });

    describe('slugToSubcategory', () => {
        it('converts known slugs', () => {
            expect(slugToSubcategory('oude-series')).toBe('Oude Series');
            expect(slugToSubcategory('nieuwe-series')).toBe('Nieuwe Series');
        });

        it('returns null for unknown slugs', () => {
            expect(slugToSubcategory('no-such-sub')).toBeNull();
        });
    });

    describe('round-trip', () => {
        it('category slug round-trips correctly', () => {
            const name = 'Delftse Methode';
            expect(slugToCategory(categoryToSlug(name)!)).toBe(name);
        });

        it('subcategory slug round-trips correctly', () => {
            const name = 'Nieuwe Series';
            expect(slugToSubcategory(subcategoryToSlug(name)!)).toBe(name);
        });
    });
});
