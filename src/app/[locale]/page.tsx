import React from "react";
import {
  Button,
  Column,
  Flex,
  Heading,
  SmartImage,
  SmartLink,
  Tag,
  Text,
  Avatar,
  RevealFx,
} from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { baseURL, routes, scheduling } from "@/app/resources";
import { createI18nContent } from "@/app/resources/content-i18n";
import { Posts } from "@/components/blog/Posts";
import { Projects } from "@/components/work/Projects";
import { HomePillars, Stats, WaitlistForm } from "@/components";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { localizeHref, routing } from "@/i18n/routing";

interface PageParams {
  params: { locale: string };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: PageParams) {
  const t = await getTranslations({ locale });
  const { person } = createI18nContent(t);

  // Optimized title (30-65 characters)
  const title = t("home.title");
  // Optimized description (120-320 characters)
  const description = t("home.description");
  const ogImage = `/images/gallery/og_img.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical:
        locale === routing.defaultLocale
          ? `https://${baseURL}`
          : `https://${baseURL}/${locale}`,
      languages: {
        en: `https://${baseURL}`,
        es: `https://${baseURL}/es`,
        "x-default": `https://${baseURL}`,
      },
    },
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

export default async function Home({ params: { locale } }: PageParams) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations();
  const { person, home, about, waitlist } = createI18nContent(t);

  // Generate structured data for homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `https://${baseURL}/#website`,
        url: `https://${baseURL}`,
        name: `${person.firstName}'s Portfolio`,
        description: home.description,
        potentialAction: {
          "@type": "SearchAction",
          target: `https://${baseURL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
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
        name: `${person.firstName}'s Portfolio - ${person.role}`,
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
    <Column as="section" gap="xl" fillWidth horizontal="center">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Column maxWidth="m" gap="xl" horizontal="center">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: home.title,
              description: home.description,
              url: `https://${baseURL}`,
              image: `https://${baseURL}/images/gallery/og_img.jpg`,
              publisher: {
                "@type": "Person",
                name: person.name,
                image: {
                  "@type": "ImageObject",
                  url: `https://${baseURL}${person.avatar}`,
                },
              },
            }),
          }}
        />
        <Column fillWidth paddingY="l" gap="m">
          <Column maxWidth="s">
            <RevealFx
              translateY="4"
              fillWidth
              horizontal="start"
              paddingBottom="m"
            >
              <Heading className={brand.heroTitleSub} wrap="balance" variant="display-strong-l">
                {home.headline}
              </Heading>
            </RevealFx>
            <RevealFx
              translateY="8"
              delay={0.2}
              fillWidth
              horizontal="start"
              paddingBottom="m"
            >
              <Text
                wrap="balance"
                onBackground="neutral-weak"
                variant="heading-default-xl"
              >
                {home.subline}
              </Text>
            </RevealFx>
            <RevealFx translateY="12" delay={0.4} horizontal="start">
              <Flex gap="12" wrap>
                <Button
                  id="cta-professionals"
                  href={localizeHref(locale, "/ia")}
                  variant="primary"
                  size="m"
                  prefixIcon="sparkle"
                  className={brand.signatureCta}
                >
                  {home.ctaProfessionals}
                </Button>
                <Button
                  id="cta-companies"
                  data-border="rounded"
                  href={scheduling.link}
                  variant="secondary"
                  size="m"
                  prefixIcon="calendar"
                >
                  {home.ctaCompanies}
                </Button>
                <Button
                  id="about"
                  data-border="rounded"
                  href={localizeHref(locale, "/about")}
                  variant="tertiary"
                  size="m"
                >
                  <Flex gap="8" vertical="center">
                    {about.avatar.display && (
                      <Avatar
                        style={{ marginLeft: "-0.5rem", marginRight: "0.25rem" }}
                        src={person.avatar}
                        size="s"
                      />
                    )}
                    {home.ctaStory}
                  </Flex>
                </Button>
              </Flex>
            </RevealFx>
          </Column>
        </Column>
        <RevealFx translateY="16" delay={0.5} fillWidth>
          <SmartImage
            className={brand.mediaGlow}
            src="/images/home/hero.jpg"
            alt={home.heroAlt}
            aspectRatio="21 / 9"
            radius="l"
            sizes="(max-width: 768px) 100vw, 1024px"
            priority
            border="neutral-alpha-weak"
          />
        </RevealFx>
        <RevealFx translateY="12" delay={0.6}>
          <Stats />
        </RevealFx>
        <RevealFx translateY="16" inView>
          <Flex
            className={brand.card}
            fillWidth
            gap="l"
            padding="l"
            radius="l"
            border="neutral-alpha-medium"
            background="surface"
            mobileDirection="column"
          >
            <Column gap="12" flex={7}>
              <Flex gap="8" vertical="center">
                <Tag variant="brand" size="m" label={home.story.eyebrow} />
              </Flex>
              <Heading as="h2" variant="display-strong-xs" wrap="balance">
                {home.story.title}
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
                {home.story.p1}
              </Text>
              <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
                {home.story.p2}
              </Text>
              <SmartLink suffixIcon="arrowRight" href={localizeHref(locale, "/about")}>
                <Text variant="body-default-s">{home.story.cta}</Text>
              </SmartLink>
            </Column>
            <Flex flex={5} vertical="center">
              <SmartImage
                className={brand.media}
                src="/images/home/experience.jpg"
                alt={home.story.imageAlt}
                aspectRatio="4 / 3"
                radius="l"
                sizes="(max-width: 768px) 100vw, 480px"
                border="neutral-alpha-weak"
              />
            </Flex>
          </Flex>
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
        {routes["/ia"] && (
          <RevealFx translateY="16" inView>
            <Flex
              className={`${brand.featuredCard} ${brand.signatureGlow}`}
              fillWidth
              gap="l"
              padding="l"
              radius="l"
              mobileDirection="column"
              vertical="center"
              horizontal="space-between"
            >
              <Column gap="8" flex={8}>
                <Flex gap="8" vertical="center">
                  <Tag variant="brand" size="m" label={t("ia.teaser.eyebrow")} />
                </Flex>
                <Heading as="h2" variant="display-strong-xs" wrap="balance">
                  {t("ia.teaser.title")}
                </Heading>
                <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
                  {t("ia.teaser.description")}
                </Text>
              </Column>
              <Flex flex={4} horizontal="end">
                <Button
                  href={`${localizeHref(locale, "/ia")}#lista`}
                  variant="primary"
                  size="m"
                  suffixIcon="sparkle"
                  className={brand.signatureCta}
                >
                  {t("ia.teaser.cta")}
                </Button>
              </Flex>
            </Flex>
          </RevealFx>
        )}
        {routes["/work"] && (
          <RevealFx translateY="16" inView>
            <Column fillWidth gap="l">
              <Flex fillWidth horizontal="space-between" vertical="center" wrap gap="12">
                <Heading as="h2" variant="display-strong-xs" wrap="balance">
                  {home.proofHeading}
                </Heading>
                <SmartLink suffixIcon="arrowRight" href={localizeHref(locale, "/work")}>
                  <Text variant="body-default-s">{home.proofCta}</Text>
                </SmartLink>
              </Flex>
              <Projects range={[1, 2]} locale={locale} />
            </Column>
          </RevealFx>
        )}
        {routes["/blog"] && (
          <RevealFx translateY="16" inView>
            <Flex fillWidth gap="24" mobileDirection="column">
              <Flex flex={1}>
                <Heading as="h2" variant="display-strong-xs" wrap="balance">
                  {home.blogHeading}
                </Heading>
              </Flex>
              <Flex flex={3}>
                <Posts range={[1, 2]} columns="2" locale={locale} />
              </Flex>
            </Flex>
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
  );
}
