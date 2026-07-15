import {
  Accordion,
  Badge,
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
import { baseURL, scheduling } from "@/app/resources";
import { createI18nContent } from "@/app/resources/content-i18n";
import { WaitlistForm } from "@/components";
import { localeAlternates } from "@/app/utils/seo";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import brand from "@/styles/brand.module.scss";
import styles from "./ia.module.scss";

const PROOF_CHIP_KEYS = ["1", "2", "3"] as const;

const FEATURES: { key: string; icon: string; image: string }[] = [
  { key: "rol", icon: "gauge", image: "/images/ia/feature-rol.jpg" },
  { key: "copiloto", icon: "sparkle", image: "/images/ia/feature-copiloto.jpg" },
  { key: "automatizacion", icon: "robot", image: "/images/ia/feature-automatizacion.jpg" },
  { key: "reto", icon: "graduationCap", image: "/images/ia/feature-reto.jpg" },
  { key: "posicionamiento", icon: "trophy", image: "/images/ia/feature-posicionamiento.jpg" },
  { key: "criterio", icon: "lightbulb", image: "/images/ia/feature-criterio.jpg" },
];

const PRICING_FEATURE_KEYS = ["1", "2", "3", "4", "5", "6"] as const;

const USE_CASES: { key: string; icon: string }[] = [
  { key: "1", icon: "email" },
  { key: "2", icon: "chartUp" },
  { key: "3", icon: "sparkle" },
  { key: "4", icon: "robot" },
];

const FAQ_KEYS = ["1", "2", "3", "4", "5"] as const;

interface PageParams {
  params: { locale: string };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: PageParams) {
  const t = await getTranslations({ locale });
  const title = t("ia.meta.title");
  const description = t("ia.meta.description");
  const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(t("ia.hero.titleA"))}`;

  return {
    title,
    description,
    alternates: localeAlternates(locale, "/ia"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://${baseURL}/ia`,
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

export default async function Ia({ params: { locale } }: PageParams) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations("ia");
  const tRoot = await getTranslations();
  const { person } = createI18nContent(tRoot);

  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t("meta.title"),
    description: t("meta.description"),
    provider: {
      "@type": "Person",
      name: person.name,
      jobTitle: person.role,
      url: `https://${baseURL}`,
    },
    areaServed: "Worldwide",
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: scheduling.link,
    },
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_KEYS.map((key) => ({
      "@type": "Question",
      name: t(`faq.items.${key}.question`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`faq.items.${key}.answer`),
      },
    })),
  };

  const waitlist = {
    title: t("waitlist.title"),
    description: t("waitlist.description"),
    button: t("waitlist.button"),
    placeholder: t("waitlist.placeholder"),
    namePlaceholder: t("waitlist.namePlaceholder"),
    invalidName: t("waitlist.invalidName"),
    invalidEmail: t("waitlist.invalidEmail"),
    success: t("waitlist.success"),
    successNamed: t.raw("waitlist.successNamed"),
    successDescription: t("waitlist.successDescription"),
    successCta: t("waitlist.successCta"),
    error: t("waitlist.error"),
    note: t("waitlist.note"),
  };

  return (
    <Column maxWidth="m" gap="xl">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceStructuredData) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      {/* Hero — big centered statement with dual CTA */}
      <Column gap="l" fillWidth horizontal="center" paddingTop="l">
        <RevealFx translateY="4" fillWidth horizontal="center">
          <Badge arrow={false} effect={true}>
            <Text variant="label-strong-s" onBackground="brand-strong">
              {t("hero.badge")}
            </Text>
          </Badge>
        </RevealFx>
        <RevealFx translateY="8" delay={0.1} fillWidth horizontal="center">
          <Heading className={brand.heroTitle} variant="display-strong-l" align="center" wrap="balance">
            {t("hero.titleA")}
            <br />
            <span className={brand.gradientText}>{t("hero.titleB")}</span>
          </Heading>
        </RevealFx>
        <RevealFx translateY="8" delay={0.2} fillWidth horizontal="center">
          <Text
            variant="heading-default-l"
            onBackground="neutral-weak"
            align="center"
            wrap="balance"
            className={styles.heroSubtitle}
          >
            {t("hero.subtitle")}
          </Text>
        </RevealFx>
        <RevealFx translateY="8" delay={0.3} fillWidth horizontal="center">
          <Column gap="12" horizontal="center">
            <Flex gap="12" wrap horizontal="center">
              <Button href="#lista" variant="primary" size="l" arrowIcon className={brand.signatureCta}>
                {t("hero.primaryCta")}
              </Button>
              <Button href="#reto" variant="secondary" size="l">
                {t("hero.secondaryCta")}
              </Button>
            </Flex>
            <Text variant="label-default-s" onBackground="neutral-weak" align="center">
              {t("hero.ctaNote")}
            </Text>
          </Column>
        </RevealFx>
      </Column>

      {/* Social proof strip + wide banner */}
      <RevealFx translateY="12" delay={0.4} fillWidth>
        <Column gap="l" fillWidth>
          <Column gap="12" fillWidth horizontal="center">
            <Text variant="label-default-s" onBackground="neutral-weak" align="center">
              {t("proof.label")}
            </Text>
            <Flex gap="8" wrap horizontal="center">
              {PROOF_CHIP_KEYS.map((key) => (
                <Tag key={key} size="m" variant="neutral" label={t(`proof.chips.${key}`)} />
              ))}
            </Flex>
          </Column>
          <SmartImage
            className={brand.mediaGlow}
            src="/images/ia/hero.jpg"
            alt={t("proof.bannerAlt")}
            aspectRatio="21 / 9"
            radius="l"
            sizes="(max-width: 768px) 100vw, 1024px"
            priority
            border="neutral-alpha-weak"
          />
        </Column>
      </RevealFx>

      {/* Alternating feature sections, each with its own CTA */}
      <Column gap="xl" fillWidth>
        {FEATURES.map(({ key, icon, image }, index) => (
          <RevealFx key={key} translateY="16" inView>
            <Flex
              fillWidth
              gap="xl"
              vertical="center"
              mobileDirection="column"
              className={index % 2 === 1 ? styles.reverse : undefined}
            >
              <Column flex={1} gap="m" fillWidth>
                <Flex gap="8" vertical="center">
                  <Icon name={icon} onBackground="brand-weak" />
                  <Text variant="label-strong-s" onBackground="brand-strong">
                    {t(`features.items.${key}.eyebrow`)}
                  </Text>
                </Flex>
                <Heading as="h2" variant="display-strong-s" wrap="balance">
                  {t(`features.items.${key}.title`)}
                </Heading>
                <Text variant="body-default-l" onBackground="neutral-weak">
                  {t(`features.items.${key}.description`)}
                </Text>
                <Flex>
                  <Button href="#lista" variant="secondary" size="m" arrowIcon>
                    {t("features.cta")}
                  </Button>
                </Flex>
              </Column>
              <Column flex={1} fillWidth>
                <SmartImage
                  className={brand.media}
                  src={image}
                  alt={t(`features.items.${key}.imageAlt`)}
                  aspectRatio="4 / 3"
                  radius="l"
                  sizes="(max-width: 768px) 100vw, 480px"
                  border="neutral-alpha-weak"
                />
              </Column>
            </Flex>
          </RevealFx>
        ))}
      </Column>

      {/* The challenge offer — the "pricing" card */}
      <RevealFx translateY="16" inView>
        <Column id="reto" gap="l" fillWidth horizontal="center">
          <Heading as="h2" variant="display-strong-m" align="center" wrap="balance">
            {t("pricing.title")}
          </Heading>
          <Column
            className={`${brand.featuredCard} ${brand.signatureGlow}`}
            maxWidth="s"
            fillWidth
            gap="m"
            padding="xl"
            radius="l"
          >
            <Tag size="s" variant="brand" label={t("pricing.card.name")} />
            <Flex gap="12" vertical="end" wrap>
              <Heading as="h3" variant="display-strong-m">
                {t("pricing.card.price")}
              </Heading>
              <Text variant="heading-default-m" onBackground="neutral-weak" paddingBottom="8">
                {t("pricing.card.unit")}
              </Text>
            </Flex>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {t("pricing.card.note")}
            </Text>
            <Button href="#lista" variant="primary" size="l" fillWidth arrowIcon className={brand.signatureCta}>
              {t("pricing.card.button")}
            </Button>
            <Column gap="12" paddingTop="s">
              {PRICING_FEATURE_KEYS.map((key) => (
                <Flex key={key} gap="12" vertical="start">
                  <Icon name="checkCircle" size="s" onBackground="brand-weak" />
                  <Text variant="body-default-m">{t(`pricing.card.features.${key}`)}</Text>
                </Flex>
              ))}
            </Column>
          </Column>
        </Column>
      </RevealFx>

      {/* Use cases gallery */}
      <RevealFx translateY="16" inView>
        <Column gap="l" fillWidth>
          <Heading as="h2" variant="display-strong-m" align="center" wrap="balance">
            {t("useCases.title")}
          </Heading>
          <Grid columns="4" tabletColumns="2" mobileColumns="1" gap="12" fillWidth>
            {USE_CASES.map(({ key, icon }) => (
              <Column
                key={key}
                className={`${brand.card} ${brand.cardWash}`}
                fillWidth
                gap="12"
                padding="l"
                radius="l"
                border="neutral-alpha-weak"
              >
                <Icon name={icon} onBackground="brand-weak" />
                <Text variant="heading-strong-m">{t(`useCases.items.${key}.title`)}</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {t(`useCases.items.${key}.description`)}
                </Text>
              </Column>
            ))}
          </Grid>
        </Column>
      </RevealFx>

      {/* Waitlist — the primary conversion */}
      <RevealFx translateY="16" inView>
        <Column id="lista" fillWidth>
          <WaitlistForm newsletter={waitlist} variant="signature" />
        </Column>
      </RevealFx>

      {/* FAQ */}
      <RevealFx translateY="16" inView>
        <Column gap="l" fillWidth>
          <Heading as="h2" variant="display-strong-s" wrap="balance">
            {t("faq.title")}
          </Heading>
          <Column fillWidth radius="l" border="neutral-alpha-weak" overflow="hidden">
            {FAQ_KEYS.map((key) => (
              <Accordion key={key} title={t(`faq.items.${key}.question`)}>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {t(`faq.items.${key}.answer`)}
                </Text>
              </Accordion>
            ))}
          </Column>
        </Column>
      </RevealFx>
    </Column>
  );
}
