import React from "react";
import { Column, Flex, Heading, RevealFx, SmartLink, Text } from "@/once-ui/components";
import styles from "./home.module.scss";
import { baseURL, routes } from "@/app/resources";
import { createI18nContent } from "@/app/resources/content-i18n";
import { Posts } from "@/components/blog/Posts";
import { HomePillars, Trajectory, WaitlistForm } from "@/components";
import { ScrollWorld } from "@/components/scroll-world";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizeHref, routing } from "@/i18n/routing";
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
  const { person, home, waitlist } = createI18nContent(t);

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
      {/* The seven stations: full-viewport, snap-scrolled, video per station. */}
      <ScrollWorld locale={locale} />
      {/* After the last station the document scrolls normally. The wrapper is
          itself a snap area so the mandatory snap can land on it, and it sits
          above the engine's fixed sky (z 0). */}
      <Column
        as="section"
        className={styles.afterWorld}
        fillWidth
        horizontal="center"
        paddingX="l"
        paddingY="xl"
        gap="xl"
      >
        <Column maxWidth="m" gap="xl" horizontal="center">
          <RevealFx translateY="16" inView>
            <Trajectory locale={locale} />
          </RevealFx>
          {routes["/services"] && (
            <RevealFx translateY="16" inView>
              <HomePillars
                title={home.pillars.title}
                items={home.pillars.items.map((item) => ({
                  ...item,
                  href: localizeHref(locale, item.route),
                }))}
                viewAllLabel={t("services.viewAll")}
                viewAllHref={localizeHref(locale, "/services")}
              />
            </RevealFx>
          )}
          {routes["/blog"] && (
            <RevealFx translateY="16" inView>
              <Column fillWidth gap="l">
                <Flex fillWidth horizontal="space-between" vertical="center" wrap gap="12">
                  <Heading as="h2" variant="display-strong-xs" wrap="balance">
                    {home.blogHeading}
                  </Heading>
                  <SmartLink suffixIcon="arrowRight" href={localizeHref(locale, "/blog")}>
                    <Text variant="body-default-s">{t("blog.label")}</Text>
                  </SmartLink>
                </Flex>
                <Posts range={[1, 3]} columns="3" locale={locale} />
              </Column>
            </RevealFx>
          )}
          {/* Primary conversion: the course waitlist, inline (no extra hop). */}
          <RevealFx translateY="16" inView>
            <WaitlistForm
              variant="signature"
              newsletter={{
                ...waitlist,
                title: home.finalCta.title,
                description: home.finalCta.description,
                button: home.finalCta.button,
              }}
            />
          </RevealFx>
        </Column>
      </Column>
    </>
  );
}
