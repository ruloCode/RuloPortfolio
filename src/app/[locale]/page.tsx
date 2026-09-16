import React from "react";
import { baseURL } from "@/app/resources";
import { createI18nContent } from "@/app/resources/content-i18n";
import { ScrollWorld } from "@/components/scroll-world";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { localeAlternates } from "@/app/utils/seo";

interface PageParams {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams) {
  const { locale } = await params;

  const t = await getTranslations({ locale });

  // Optimized title (30-65 characters)
  const title = t("home.title");
  // Optimized description (120-320 characters)
  const description = t("home.description");
  // The scroll-world card: Rulo surrounded by the pieces of his world.
  const ogImage = `/scroll/og.jpg`;

  return {
    title,
    description,
    alternates: localeAlternates(locale, "/"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://${baseURL}${locale === routing.defaultLocale ? "" : `/${locale}`}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Home({ params }: PageParams) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations();
  const { person, home } = createI18nContent(t);

  // Generate structured data for homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `https://${baseURL}/#website`,
        url: `https://${baseURL}`,
        name: `${person.name} — ${person.role}`,
        description: home.description,
      },
      {
        "@type": "Person",
        "@id": `https://${baseURL}/#person`,
        name: person.name,
        jobTitle: person.role,
        email: person.email,
        url: `https://${baseURL}`,
        sameAs: [
          person.github && `https://github.com/${person.github}`,
          person.linkedin && person.linkedin,
        ].filter(Boolean),
      },
      {
        "@type": "ProfilePage",
        "@id": `https://${baseURL}/#profilepage`,
        url: `https://${baseURL}`,
        name: `${person.name} — ${person.role}`,
        description: home.description,
        about: {
          "@id": `https://${baseURL}/#person`,
        },
        mainEntity: {
          "@id": `https://${baseURL}/#person`,
        },
        isPartOf: {
          "@id": `https://${baseURL}/#website`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      {/* The landing is the seven stations and nothing else. Track record,
          cases, articles and the sign-up form each live on their own route,
          which the header navigates — the home no longer repeats them, and the
          last station hands the visitor the one next step. */}
      <ScrollWorld locale={locale} />
    </>
  );
}
