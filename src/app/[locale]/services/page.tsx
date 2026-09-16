import {
  Accordion,
  Button,
  Column,
  Flex,
  Grid,
  Heading,
  Icon,
  RevealFx,
  SmartImage,
  Tag,
  Text,
} from "@/once-ui/components";
import { baseURL } from "@/app/resources";
import { createI18nContent } from "@/app/resources/content-i18n";
import { CtaBanner, PageHero, SectionHeader } from "@/components";
import { localeAlternates } from "@/app/utils/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizeHref, routing } from "@/i18n/routing";
import { scrollAsset } from "@/lib/scroll-world/sections";
import brand from "@/styles/brand.module.scss";

const OFFERING_ICONS: Record<string, string> = {
  automation: "robot",
  frontend: "rocket",
  performance: "gauge",
  consulting: "lightbulb",
};

interface PageParams {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams) {
  const { locale } = await params;

  const t = await getTranslations({ locale });
  const { services } = createI18nContent(t);
  const title = services.title;
  const description = services.description;
  const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    alternates: localeAlternates(locale, "/services"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://${baseURL}/services`,
      images: [
        {
          url: ogImage,
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

export default async function Services({ params }: PageParams) {
  const { locale } = await params;

  setRequestLocale(locale);
  const t = await getTranslations();
  const { person, services, testimonials } = createI18nContent(t);

  const consultingTestimonial = testimonials.items[2];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: services.title,
    description: services.description,
    provider: {
      "@type": "Person",
      name: person.name,
      jobTitle: person.role,
      url: `https://${baseURL}`,
    },
    areaServed: "Worldwide",
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: services.cta.link,
    },
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: services.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <Column maxWidth="m" gap="xl">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <PageHero
        eyebrow={services.label}
        title={services.hero.title}
        intro={services.hero.intro}
        actions={
          <>
            <Button
              href={services.cta.link}
              size="m"
              className={brand.signatureCta}
            >
              {services.cta.button}
            </Button>
            <Button
              href={localizeHref(locale, "/work")}
              size="m"
              variant="secondary"
            >
              {t("work.label")}
            </Button>
          </>
        }
      />
      <RevealFx speed="fast" translateY="12" inView fillWidth>
        <SmartImage
          className={brand.mediaGlow}
          src={scrollAsset("04-automatiza.webp")}
          alt={services.hero.imageAlt}
          aspectRatio="21 / 9"
          radius="l"
          sizes="(max-width: 768px) 100vw, 1024px"
          priority
          border="neutral-alpha-weak"
        />
      </RevealFx>

      {/* Offerings */}
      <Column gap="l">
        <SectionHeader title={services.offerings.title} />
        <Grid columns="2" mobileColumns="1" gap="12" fillWidth>
          {services.offerings.items.map((offering) => (
            <Column
              key={offering.key}
              className={brand.card}
              fillWidth
              gap="12"
              padding="l"
              radius="l"
              border="neutral-alpha-weak"
              background="surface"
            >
              <Icon name={OFFERING_ICONS[offering.key] ?? "sparkle"} onBackground="brand-weak" />
              <Heading as="h3" variant="heading-strong-l" wrap="balance">
                {offering.title}
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                {offering.description}
              </Text>
              <Tag size="m" variant="neutral" label={offering.bestFor} />
            </Column>
          ))}
        </Grid>
      </Column>

      {/* Process */}
      <Column gap="l">
        <SectionHeader title={services.process.title} />
        <Grid columns="4" tabletColumns="2" mobileColumns="1" gap="12" fillWidth>
          {services.process.steps.map((step, index) => (
            <Column
              key={step.title}
              className={brand.card}
              fillWidth
              fillHeight
              gap="8"
              padding="l"
              radius="l"
              border="neutral-alpha-weak"
              background="surface"
            >
              <Text variant="display-strong-s" onBackground="brand-weak">
                {String(index + 1).padStart(2, "0")}
              </Text>
              <Heading as="h3" variant="heading-strong-m" wrap="balance">
                {step.title}
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {step.description}
              </Text>
            </Column>
          ))}
        </Grid>
      </Column>

      {/* Engagement models */}
      <Column gap="l">
        <SectionHeader title={services.engagement.title} />
        <Grid columns="3" tabletColumns="3" mobileColumns="1" gap="12" fillWidth>
          {services.engagement.items.map((model) => (
            <Column
              key={model.key}
              className={
                model.highlight ? `${brand.featuredCard} ${brand.signatureGlow}` : brand.card
              }
              fillWidth
              gap="12"
              padding="l"
              radius="l"
              border={model.highlight ? undefined : "neutral-alpha-weak"}
              background={model.highlight ? undefined : "surface"}
            >
              {model.badge && <Tag size="s" variant="brand" label={model.badge} />}
              <Heading as="h3" variant="heading-strong-l" wrap="balance">
                {model.title}
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                {model.description}
              </Text>
            </Column>
          ))}
        </Grid>
      </Column>

      {/* Social proof */}
      <Flex
        className={brand.card}
        fillWidth
        gap="m"
        padding="l"
        radius="l"
        border="neutral-alpha-weak"
        background="surface"
        mobileDirection="column"
      >
        <Column gap="8">
          <Text variant="body-default-m" style={{ fontStyle: "italic", lineHeight: 1.6 }}>
            &ldquo;{consultingTestimonial.quote}&rdquo;
          </Text>
          <Text variant="body-strong-s">
            {consultingTestimonial.name}{" "}
            <Text as="span" variant="body-default-s" onBackground="neutral-weak">
              — {consultingTestimonial.role}
            </Text>
          </Text>
        </Column>
      </Flex>

      {/* FAQ */}
      <Column gap="l">
        <SectionHeader title={services.faq.title} />
        <Column fillWidth radius="l" border="neutral-alpha-weak" overflow="hidden">
          {services.faq.items.map((item) => (
            <Accordion key={item.question} title={item.question}>
              <Text variant="body-default-m" onBackground="neutral-weak">
                {item.answer}
              </Text>
            </Accordion>
          ))}
        </Column>
      </Column>

      {/* Bridge to the course for individual professionals */}
      <Flex
        className={brand.card}
        fillWidth
        gap="l"
        padding="l"
        radius="l"
        border="neutral-alpha-weak"
        background="surface"
        mobileDirection="column"
        vertical="center"
        horizontal="space-between"
      >
        <Column gap="8" flex={8}>
          <Heading as="h2" variant="display-strong-xs" wrap="balance">
            {services.bridge.title}
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
            {services.bridge.description}
          </Text>
        </Column>
        <Flex flex={4} horizontal="end">
          <Button href={localizeHref(locale, "/ia")} variant="secondary" size="m" suffixIcon="sparkle">
            {services.bridge.cta}
          </Button>
        </Flex>
      </Flex>

      {/* CTA — consulting is this page's own conversion */}
      <CtaBanner
        title={services.cta.title}
        description={services.cta.description}
        button={services.cta.button}
        href={services.cta.link}
      />
    </Column>
  );
}
