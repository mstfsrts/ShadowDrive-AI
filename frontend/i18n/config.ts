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

export const LOCALE_FLAGS: Record<Locale, string> = {
    en: "🇬🇧",
    tr: "🇹🇷",
};

export const COOKIE_NAME = "NEXT_LOCALE";
