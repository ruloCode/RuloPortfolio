import {
  Accordion,
  Column,
  Flex,
  Grid,
  Heading,
  Icon,
  Tag,
  Text,
} from "@/once-ui/components";
import { baseURL } from "@/app/resources";
import { createI18nContent } from "@/app/resources/content-i18n";
import { CtaBanner } from "@/components";
import { localeAlternates } from "@/app/utils/seo";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

const OFFERING_ICONS: Record<string, string> = {
  frontend: "rocket",
  performance: "gauge",
  ecommerce: "cart",
  consulting: "lightbulb",
};

interface PageParams {
  params: { locale: string };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: PageParams) {
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

export default async function Services({ params: { locale } }: PageParams) {
  unstable_setRequestLocale(locale);
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

      {/* Hero */}
      <Column gap="m" maxWidth="s">
        <Heading variant="display-strong-l" wrap="balance">
          {services.hero.title}
        </Heading>
        <Text variant="heading-default-l" onBackground="neutral-weak" wrap="balance">
          {services.hero.intro}
        </Text>
      </Column>

      {/* Offerings */}
      <Column gap="l">
        <Heading as="h2" variant="display-strong-s">
          {services.offerings.title}
        </Heading>
        <Grid columns="2" mobileColumns="1" gap="12" fillWidth>
          {services.offerings.items.map((offering) => (
            <Column
              key={offering.key}
              fillWidth
              gap="12"
              padding="l"
              radius="l"
              border="neutral-alpha-weak"
              background="surface"
            >
              <Icon name={OFFERING_ICONS[offering.key] ?? "sparkle"} onBackground="brand-weak" />
              <Text variant="heading-strong-l">{offering.title}</Text>
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
        <Heading as="h2" variant="display-strong-s">
          {services.process.title}
        </Heading>
        <Grid columns="4" tabletColumns="2" mobileColumns="1" gap="12" fillWidth>
          {services.process.steps.map((step, index) => (
            <Column key={step.title} fillWidth gap="8" padding="m">
              <Text variant="display-strong-s" onBackground="brand-weak">
                {String(index + 1).padStart(2, "0")}
              </Text>
              <Text variant="heading-strong-m">{step.title}</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {step.description}
              </Text>
            </Column>
          ))}
        </Grid>
      </Column>

      {/* Engagement models */}
      <Column gap="l">
        <Heading as="h2" variant="display-strong-s">
          {services.engagement.title}
        </Heading>
        <Grid columns="3" tabletColumns="3" mobileColumns="1" gap="12" fillWidth>
          {services.engagement.items.map((model) => (
            <Column
              key={model.key}
              fillWidth
              gap="12"
              padding="l"
              radius="l"
              border={model.highlight ? "brand-medium" : "neutral-alpha-weak"}
              background={model.highlight ? "brand-alpha-weak" : "surface"}
            >
              {model.badge && <Tag size="s" variant="brand" label={model.badge} />}
              <Text variant="heading-strong-l">{model.title}</Text>
              <Text variant="body-default-m" onBackground="neutral-weak">
                {model.description}
              </Text>
            </Column>
          ))}
        </Grid>
      </Column>

      {/* Social proof */}
      <Flex
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
            "{consultingTestimonial.quote}"
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
        <Heading as="h2" variant="display-strong-s">
          {services.faq.title}
        </Heading>
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

      {/* CTA */}
      <CtaBanner
        title={services.cta.title}
        description={services.cta.description}
        button={services.cta.button}
        href={services.cta.link}
      />
    </Column>
  );
}
