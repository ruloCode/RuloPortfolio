import { defineRouting } from "next-intl/routing";
import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  // English keeps its current unprefixed URLs; Spanish lives under /es
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);

/** Prefixes an internal href with the locale segment when needed. */
export function localizeHref(locale: string, href: string) {
  if (locale === routing.defaultLocale) return href;
  return `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
}
