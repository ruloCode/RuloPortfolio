import React from "react";
import {
  Badge,
  Button,
  Column,
  Flex,
  Heading,
  StatusIndicator,
  Tag,
  Text,
  Avatar,
  RevealFx,
} from "@/once-ui/components";
import { baseURL, routes, scheduling } from "@/app/resources";
import { createI18nContent } from "@/app/resources/content-i18n";
import { Posts } from "@/components/blog/Posts";
import { Projects } from "@/components/work/Projects";
import { CtaBanner, Mailchimp, ServicesTeaser, Stats, Testimonials } from "@/components";
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
  const title = `${person.firstName}'s Portfolio | ${person.role}`;
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
  const { person, home, about, newsletter, services } = createI18nContent(t);

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
            {home.openToWork && (
              <RevealFx translateY="4" fillWidth horizontal="start" paddingBottom="s">
                <Badge arrow={false} effect={true}>
                  <Flex gap="8" vertical="center">
                    <StatusIndicator
                      size="s"
                      color="green"
                      style={{
                        animation: "pulse 2s ease-in-out infinite",
                      }}
                    />
                    <Text variant="label-strong-s" onBackground="brand-strong">
                      {home.badge}
                    </Text>
                  </Flex>
                </Badge>
              </RevealFx>
            )}
            <RevealFx
              translateY="4"
              fillWidth
              horizontal="start"
              paddingBottom="m"
            >
              <Heading wrap="balance" variant="display-strong-l">
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
                  id="cta-work"
                  href={localizeHref(locale, "/work")}
                  variant="primary"
                  size="m"
                  arrowIcon
                >
                  {home.ctaWork}
                </Button>
                <Button
                  id="cta-call"
                  data-border="rounded"
                  href={scheduling.link}
                  variant="secondary"
                  size="m"
                  prefixIcon="calendar"
                >
                  {home.ctaCall}
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
                    {about.title}
                  </Flex>
                </Button>
              </Flex>
            </RevealFx>
          </Column>
        </Column>
        <RevealFx translateY="12" delay={0.6}>
          <Stats />
        </RevealFx>
        <RevealFx translateY="16" inView>
          <Projects range={[1, 1]} locale={locale} />
        </RevealFx>
        {routes["/services"] && (
          <RevealFx translateY="16" inView>
            <ServicesTeaser
              services={services}
              viewAllLabel={t("services.viewAll")}
              locale={locale}
            />
          </RevealFx>
        )}
        {routes["/ia"] && (
          <RevealFx translateY="16" inView>
            <Flex
              fillWidth
              gap="l"
              padding="l"
              radius="l"
              border="accent-alpha-medium"
              background="accent-alpha-weak"
              mobileDirection="column"
              vertical="center"
              horizontal="space-between"
            >
              <Column gap="8" flex={8}>
                <Flex gap="8" vertical="center">
                  <Tag variant="accent" size="m" label={t("ia.teaser.eyebrow")} />
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
                  href={localizeHref(locale, "/ia")}
                  variant="secondary"
                  size="m"
                  suffixIcon="sparkle"
                >
                  {t("ia.teaser.cta")}
                </Button>
              </Flex>
            </Flex>
          </RevealFx>
        )}
        <RevealFx translateY="16" inView>
          <Testimonials />
        </RevealFx>
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
        <Projects range={[2]} locale={locale} />
        <RevealFx translateY="16" inView>
          <CtaBanner
            title={services.cta.title}
            description={services.cta.description}
            button={services.cta.button}
            href={scheduling.link}
          />
        </RevealFx>
        {newsletter.display && <Mailchimp newsletter={newsletter} />}
      </Column>
    </Column>
  );
}
