/**
 * Builds a public URL that matches the site's `localePrefix: 'as-needed'`
 * routing: English lives at the root (no prefix), other locales are prefixed.
 *
 * @param base   Origin, e.g. "https://azerbaijan-evisa.com"
 * @param locale Locale code, e.g. "en" | "es" | "ar"
 * @param path   Path beginning with a slash, e.g. "/visa" or "/visa/egypt"
 */
export function localizedUrl(base: string, locale: string, path: string): string {
  return locale === "en" ? `${base}${path}` : `${base}/${locale}${path}`;
}
