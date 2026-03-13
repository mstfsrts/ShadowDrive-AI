// ─── ShadowDrive AI — i18n Configuration ───
// Supported locales and default language settings.
// New language = add to SUPPORTED_LOCALES + create messages/xx.json

export const DEFAULT_LOCALE = "en" as const;

export const SUPPORTED_LOCALES = ["en", "tr"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
    en: "English",
    tr: "Türkçe",
};

// SVG flag components (render consistently across all platforms)
export const LOCALE_FLAGS: Record<Locale, { src: string; alt: string }> = {
    en: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 30'%3E%3CclipPath id='a'%3E%3Cpath d='M0 0v30h60V0z'/%3E%3C/clipPath%3E%3CclipPath id='b'%3E%3Cpath d='M30 15h30v15zv15H0zH0V0zV0h30z'/%3E%3C/clipPath%3E%3Cg clip-path='url(%23a)'%3E%3Cpath d='M0 0v30h60V0z' fill='%23012169'/%3E%3Cpath d='M0 0l60 30m0-30L0 30' stroke='%23fff' stroke-width='6'/%3E%3Cpath d='M0 0l60 30m0-30L0 30' clip-path='url(%23b)' stroke='%23C8102E' stroke-width='4'/%3E%3Cpath d='M30 0v30M0 15h60' stroke='%23fff' stroke-width='10'/%3E%3Cpath d='M30 0v30M0 15h60' stroke='%23C8102E' stroke-width='6'/%3E%3C/g%3E%3C/svg%3E",
        alt: "EN",
    },
    tr: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='%23E30A17'/%3E%3Ccircle cx='425' cy='400' r='200' fill='%23fff'/%3E%3Ccircle cx='475' cy='400' r='160' fill='%23E30A17'/%3E%3Cpolygon points='583.33,400 764.24,458.78 658.09,316.94 658.09,483.06 764.24,341.22' fill='%23fff'/%3E%3C/svg%3E",
        alt: "TR",
    },
};

export const COOKIE_NAME = "NEXT_LOCALE";
