import { baseURL } from "@/app/resources";
import { routing } from "@/i18n/routing";

/** Canonical + hreflang alternates for a route, given the current locale. */
export function localeAlternates(locale: string, path: string) {
  const enUrl = `https://${baseURL}${path}`;
  const esUrl = `https://${baseURL}/es${path === "/" ? "" : path}`;

  return {
    canonical: locale === routing.defaultLocale ? enUrl : esUrl,
    languages: {
      en: enUrl,
      es: esUrl,
      "x-default": enUrl,
    },
  };
}
