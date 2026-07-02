import { getPosts } from "@/app/utils/utils";
import { baseURL, routes as routesConfig } from "@/app/resources";
import { routing } from "@/i18n/routing";

const localeUrl = (locale: string, path: string) =>
  `https://${baseURL}${locale === routing.defaultLocale ? "" : `/${locale}`}${
    path === "/" ? "" : path
  }` || `https://${baseURL}`;

export default async function sitemap() {
  const blogs = routing.locales.flatMap((locale) =>
    getPosts(["src", "app", "[locale]", "blog", "posts"], locale).map((post) => ({
      url: localeUrl(locale, `/blog/${post.slug}`),
      lastModified: post.metadata.publishedAt,
      alternates: {
        languages: {
          en: localeUrl("en", `/blog/${post.slug}`),
          es: localeUrl("es", `/blog/${post.slug}`),
        },
      },
    })),
  );

  const works = routing.locales.flatMap((locale) =>
    getPosts(["src", "app", "[locale]", "work", "projects"], locale).map((post) => ({
      url: localeUrl(locale, `/work/${post.slug}`),
      lastModified: post.metadata.publishedAt,
      alternates: {
        languages: {
          en: localeUrl("en", `/work/${post.slug}`),
          es: localeUrl("es", `/work/${post.slug}`),
        },
      },
    })),
  );

  const activeRoutes = Object.keys(routesConfig).filter((route) => routesConfig[route]);

  const routes = routing.locales.flatMap((locale) =>
    activeRoutes.map((route) => ({
      url: localeUrl(locale, route),
      lastModified: new Date().toISOString().split("T")[0],
      alternates: {
        languages: {
          en: localeUrl("en", route),
          es: localeUrl("es", route),
        },
      },
    })),
  );

  return [...routes, ...blogs, ...works];
}
