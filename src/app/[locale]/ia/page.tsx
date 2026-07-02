import {
  Accordion,
  Badge,
  Column,
  Flex,
  Grid,
  Heading,
  Icon,
  RevealFx,
  Tag,
  Text,
} from "@/once-ui/components";
import { baseURL } from "@/app/resources";
import { createI18nContent } from "@/app/resources/content-i18n";
import { Mailchimp } from "@/components";
import { localeAlternates } from "@/app/utils/seo";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

const AUDIENCE_KEYS = ["1", "2", "3"] as const;
const FORMAT_ITEMS: { key: string; icon: string }[] = [
  { key: "cohort", icon: "team" },
  { key: "templates", icon: "sparkle" },
  { key: "community", icon: "chartUp" },
];
const FAQ_KEYS = ["1", "2", "3"] as const;

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
  const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(t("ia.hero.title"))}`;

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

  // TODO(rulo): create the Mailchimp audience (or alternative) for the waitlist
  // and set config.mailchimp.action to its real POST URL.
  const waitlist = {
    title: t("waitlist.title"),
    description: t("waitlist.description"),
    button: t("waitlist.button"),
    placeholder: t("waitlist.placeholder"),
  };

  return (
    <Column maxWidth="m" gap="xl">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      {/* Hero */}
      <Column gap="m" maxWidth="s" paddingY="l">
        <RevealFx translateY="4" fillWidth horizontal="start" paddingBottom="s">
          <Badge arrow={false} effect={true}>
            <Text variant="label-strong-s" onBackground="accent-strong">
              {t("hero.badge")}
            </Text>
          </Badge>
        </RevealFx>
        <RevealFx translateY="4" fillWidth horizontal="start">
          <Heading variant="display-strong-l" wrap="balance">
            {t("hero.title")}
          </Heading>
        </RevealFx>
        <RevealFx translateY="8" delay={0.2} fillWidth horizontal="start">
          <Text variant="heading-default-l" onBackground="neutral-weak" wrap="balance">
            {t("hero.subtitle")}
          </Text>
        </RevealFx>
      </Column>

      {/* Problem */}
      <RevealFx translateY="16" inView>
        <Column
          gap="m"
          padding="l"
          radius="l"
          border="neutral-alpha-weak"
          background="surface"
        >
          <Heading as="h2" variant="display-strong-xs">
            {t("problem.title")}
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            {t("problem.p1")}
          </Text>
          <Text variant="body-default-l" onBackground="neutral-weak">
            {t("problem.p2")}
          </Text>
        </Column>
      </RevealFx>

      {/* Audience */}
      <RevealFx translateY="16" inView>
        <Column gap="l" fillWidth>
          <Heading as="h2" variant="display-strong-s">
            {t("audience.title")}
          </Heading>
          <Grid columns="3" tabletColumns="3" mobileColumns="1" gap="12" fillWidth>
            {AUDIENCE_KEYS.map((key) => (
              <Column
                key={key}
                fillWidth
                gap="8"
                padding="l"
                radius="l"
                border="neutral-alpha-weak"
                background="surface"
              >
                <Text variant="heading-strong-m">{t(`audience.items.${key}.title`)}</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {t(`audience.items.${key}.description`)}
                </Text>
              </Column>
            ))}
          </Grid>
        </Column>
      </RevealFx>

      {/* Format */}
      <RevealFx translateY="16" inView>
        <Column gap="l" fillWidth>
          <Flex gap="12" vertical="center" wrap>
            <Heading as="h2" variant="display-strong-s">
              {t("format.title")}
            </Heading>
            <Tag size="m" variant="accent" label={t("format.badge")} />
          </Flex>
          <Grid columns="3" tabletColumns="3" mobileColumns="1" gap="12" fillWidth>
            {FORMAT_ITEMS.map(({ key, icon }) => (
              <Column
                key={key}
                fillWidth
                gap="8"
                padding="l"
                radius="l"
                border="neutral-alpha-weak"
                background="surface"
              >
                <Icon name={icon} onBackground="accent-weak" />
                <Text variant="heading-strong-m">{t(`format.items.${key}.title`)}</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {t(`format.items.${key}.description`)}
                </Text>
              </Column>
            ))}
          </Grid>
        </Column>
      </RevealFx>

      {/* Why me */}
      <RevealFx translateY="16" inView>
        <Column gap="m" maxWidth="s">
          <Heading as="h2" variant="display-strong-s">
            {t("whyMe.title")}
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            {t("whyMe.p1")}
          </Text>
          <Text variant="body-default-l" onBackground="neutral-weak">
            {t("whyMe.p2")}
          </Text>
          <Text variant="body-default-l" onBackground="neutral-weak">
            {t("whyMe.p3")}
          </Text>
        </Column>
      </RevealFx>

      {/* Waitlist */}
      <RevealFx translateY="16" inView>
        <Mailchimp newsletter={waitlist} />
      </RevealFx>

      {/* FAQ */}
      <RevealFx translateY="16" inView>
        <Column gap="l" fillWidth>
          <Heading as="h2" variant="display-strong-s">
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
