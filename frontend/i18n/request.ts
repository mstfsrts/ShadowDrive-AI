// ─── ShadowDrive AI — next-intl Request Configuration ───
// Reads locale from cookie. No URL prefix (PWA-friendly).

import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, COOKIE_NAME, type Locale } from "./config";

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(COOKIE_NAME)?.value;

    const locale: Locale =
        cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as Locale)
            ? (cookieLocale as Locale)
            : DEFAULT_LOCALE;

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
});
