import {
  Avatar,
  Button,
  Column,
  Flex,
  Grid,
  Heading,
  Icon,
  IconButton,
  RevealFx,
  SmartLink,
  Tag,
  Text,
} from "@/once-ui/components";
import { baseURL, scheduling } from "@/app/resources";
import { Achievements, PageHero, SectionHeader, WaitlistForm } from "@/components";
import TableOfContents from "@/components/about/TableOfContents";
import { StoryTimeline } from "@/components/about/StoryTimeline";
import brand from "@/styles/brand.module.scss";
import styles from "@/components/about/about.module.scss";
import { createI18nContent } from "@/app/resources/content-i18n";
import { localeAlternates } from "@/app/utils/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizeHref, routing } from "@/i18n/routing";

interface PageParams {
  params: Promise<{ locale: string }>;
}

// content-i18n.js is plain JS, so its return type is inferred as {} here. This
// is the shape this page actually reads from it.
type Section = { display: boolean; title: string };
type AboutContent = {
  person: { name: string; role: string; avatar: string; email: string; languages: string[] };
  social: { name: string; icon: string; link: string }[];
  waitlist: React.ComponentProps<typeof WaitlistForm>["newsletter"];
  about: {
    title: string;
    description: string;
    tableOfContent: { display: boolean; subItems: boolean };
    hero: {
      eyebrow: string;
      title: React.ReactNode;
      intro: string;
      ctaCall: string;
      ctaProgram: string;
      portraitAlt: string;
      location: string;
    };
    story: Section & {
      eyebrow: string;
      quote: string;
      north: string;
      acts: Record<string, { label: string; title: string; body: string }>;
    };
    help: Section & {
      eyebrow: string;
      intro: string;
      items: {
        key: string;
        icon: string;
        route: string;
        title: string;
        body: string;
        cta: string;
        tags: string[];
      }[];
    };
    achievements: Section;
    work: Section & {
      experiences: {
        company: string;
        timeframe: string;
        role: string;
        achievements: React.ReactNode[];
      }[];
    };
    studies: Section & { institutions: { name: string; description: string }[] };
    stack: Section & {
      eyebrow: string;
      intro: string;
      groups: { key: string; title: string; items: string[] }[];
    };
    toc: Record<string, string>;
  };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams) {
  const { locale } = await params;

  const t = await getTranslations({ locale });
  const { about } = createI18nContent(t);
  const title = about.title;
  const description = about.description;
  const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(
    t("about.hero.eyebrow"),
  )}&eyebrow=${encodeURIComponent(t("about.label"))}`;

  return {
    title,
    description,
    alternates: localeAlternates(locale, "/about"),
    openGraph: {
      title,
      description,
      type: "profile",
      url: `https://${baseURL}/about`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function About({ params }: PageParams) {
  const { locale } = await params;

  setRequestLocale(locale);
  const t = await getTranslations();
  const { person, about, social, waitlist } = createI18nContent(t) as AboutContent;

  // Anchors are stable ids, not translated titles: the same URL fragment
  // works in both locales and survives a copy rewrite.
  const structure = [
    { id: "historia", title: about.toc.story, display: about.story.display, items: [] },
    { id: "ayuda", title: about.toc.help, display: about.help.display, items: [] },
    {
      id: "experiencia",
      title: about.toc.work,
      display: about.work.display,
      items: about.work.experiences.map((experience) => experience.company),
    },
    {
      id: "logros",
      title: about.toc.achievements,
      display: about.achievements.display,
      items: [],
    },
    {
      id: "estudios",
      title: about.toc.studies,
      display: about.studies.display,
      items: about.studies.institutions.map((institution) => institution.name),
    },
    { id: "stack", title: about.toc.stack, display: about.stack.display, items: [] },
  ];

  // The skills feed `knowsAbout`: this is where a search engine reads what
  // he actually does, so it carries the AI vocabulary too.
  const knowsAbout = about.stack.groups.flatMap((group) => group.items);

  return (
    <Column maxWidth="m" gap="xl">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            url: `https://${baseURL}${locale === routing.defaultLocale ? "" : `/${locale}`}/about`,
            mainEntity: {
              "@type": "Person",
              "@id": `https://${baseURL}/#person`,
              name: person.name,
              alternateName: "Rulo",
              jobTitle: person.role,
              description: about.description,
              url: `https://${baseURL}`,
              image: `https://${baseURL}${person.avatar}`,
              email: `mailto:${person.email}`,
              knowsAbout,
              knowsLanguage: ["es", "en"],
              address: {
                "@type": "PostalAddress",
                addressLocality: "Bogotá",
                addressCountry: "CO",
              },
              sameAs: social
                .filter((item) => item.link && !item.link.startsWith("mailto:"))
                .map((item) => item.link),
              worksFor: {
                "@type": "Organization",
                name: about.work.experiences[0].company || "",
              },
            },
          }),
        }}
      />
      {about.tableOfContent.display && (
        <TableOfContents structure={structure} about={about} label={about.title} />
      )}

      <PageHero
        eyebrow={about.hero.eyebrow}
        title={about.hero.title}
        intro={about.hero.intro}
        actions={
          <>
            <Button
              href={scheduling.link}
              size="m"
              className={brand.signatureCta}
              prefixIcon="calendar"
            >
              {about.hero.ctaCall}
            </Button>
            <Button
              href={localizeHref(locale, "/ia")}
              size="m"
              variant="secondary"
              data-border="rounded"
              prefixIcon="sparkle"
            >
              {about.hero.ctaProgram}
            </Button>
          </>
        }
        facts={
          <>
            <Flex gap="8" vertical="center">
              <Icon name="globe" size="s" onBackground="brand-weak" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                {about.hero.location}
              </Text>
            </Flex>
            {person.languages.map((language) => (
              <Tag key={language} size="s" variant="neutral" label={language} />
            ))}
          </>
        }
        aside={
          <Flex fillWidth horizontal="center">
            <Avatar src={person.avatar} size="xl" className={styles.portrait} />
          </Flex>
        }
      />

      {/* Social links: same row, one visual weight. */}
      <RevealFx speed="fast" translateY="8" inView horizontal="start">
        <Flex gap="8" wrap>
          {social.map(
            (item) =>
              item.link && (
                <IconButton
                  key={item.name}
                  href={item.link}
                  icon={item.icon}
                  tooltip={item.name}
                  size="m"
                  variant="secondary"
                />
              ),
          )}
        </Flex>
      </RevealFx>

      {about.story.display && (
        <Column fillWidth gap="l">
          <SectionHeader
            id="historia"
            eyebrow={about.story.eyebrow}
            title={about.story.title}
          />
          <StoryTimeline story={about.story} />
        </Column>
      )}

      {about.help.display && (
        <Column fillWidth gap="l">
          <SectionHeader
            id="ayuda"
            eyebrow={about.help.eyebrow}
            title={about.help.title}
            intro={about.help.intro}
          />
          <Grid columns="3" tabletColumns="3" mobileColumns="1" gap="16" fillWidth>
            {about.help.items.map((item, index) => (
              <RevealFx key={item.key} speed="fast" delay={index * 0.06} translateY="12" inView fillWidth>
                <Column
                  className={brand.card}
                  fillWidth
                  fillHeight
                  gap="12"
                  padding="l"
                  radius="l"
                  border="neutral-alpha-weak"
                  background="surface"
                >
                  <Icon name={item.icon} onBackground="brand-weak" />
                  <Heading as="h3" variant="heading-strong-m" wrap="balance">
                    {item.title}
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {item.body}
                  </Text>
                  <Flex gap="8" wrap paddingTop="4">
                    {item.tags.map((tag) => (
                      <Tag key={tag} size="s" variant="neutral" label={tag} />
                    ))}
                  </Flex>
                  <SmartLink
                    suffixIcon="arrowRight"
                    href={localizeHref(locale, item.route)}
                    style={{ marginTop: "auto" }}
                  >
                    <Text variant="body-default-s">{item.cta}</Text>
                  </SmartLink>
                </Column>
              </RevealFx>
            ))}
          </Grid>
        </Column>
      )}

      {about.work.display && (
        <Column fillWidth gap="l">
          <SectionHeader id="experiencia" title={about.work.title} />
          <Column fillWidth gap="l">
            {about.work.experiences.map((experience, index) => (
              <RevealFx
                key={`${experience.company}-${index}`}
                speed="fast"
                delay={index * 0.05}
                translateY="8"
                inView
                fillWidth
              >
                <Column
                  className={brand.card}
                  fillWidth
                  gap="12"
                  padding="l"
                  radius="l"
                  border="neutral-alpha-weak"
                  background="surface"
                >
                  <Flex fillWidth horizontal="space-between" vertical="end" gap="12" wrap>
                    <Heading as="h3" variant="heading-strong-l">
                      {experience.company}
                    </Heading>
                    <Text variant="label-default-s" onBackground="neutral-weak">
                      {experience.timeframe}
                    </Text>
                  </Flex>
                  <Text variant="body-strong-s" onBackground="brand-weak">
                    {experience.role}
                  </Text>
                  <Column as="ul" gap="8" paddingLeft="16">
                    {experience.achievements.map((achievement, i) => (
                      <Text as="li" key={i} variant="body-default-m" onBackground="neutral-weak">
                        {achievement}
                      </Text>
                    ))}
                  </Column>
                </Column>
              </RevealFx>
            ))}
          </Column>
        </Column>
      )}

      {about.achievements.display && (
        <Column fillWidth gap="l">
          <SectionHeader id="logros" title={about.achievements.title} />
          <Achievements />
        </Column>
      )}

      {about.studies.display && (
        <Column fillWidth gap="l">
          <SectionHeader id="estudios" title={about.studies.title} />
          <Grid columns="3" tabletColumns="3" mobileColumns="1" gap="16" fillWidth>
            {about.studies.institutions.map((institution) => (
              <Column
                key={institution.name}
                className={brand.card}
                fillWidth
                fillHeight
                gap="8"
                padding="l"
                radius="l"
                border="neutral-alpha-weak"
                background="surface"
              >
                <Heading as="h3" variant="heading-strong-m">
                  {institution.name}
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {institution.description}
                </Text>
              </Column>
            ))}
          </Grid>
        </Column>
      )}

      {about.stack.display && (
        <Column fillWidth gap="l">
          <SectionHeader
            id="stack"
            eyebrow={about.stack.eyebrow}
            title={about.stack.title}
            intro={about.stack.intro}
          />
          <Grid columns="3" tabletColumns="3" mobileColumns="1" gap="16" fillWidth>
            {about.stack.groups.map((group) => (
              <Column
                key={group.key}
                className={brand.card}
                fillWidth
                fillHeight
                gap="12"
                padding="l"
                radius="l"
                border="neutral-alpha-weak"
                background="surface"
              >
                <Heading as="h3" variant="heading-strong-m">
                  {group.title}
                </Heading>
                <Flex gap="8" wrap>
                  {group.items.map((item) => (
                    <Tag key={item} size="s" variant="neutral" label={item} />
                  ))}
                </Flex>
              </Column>
            ))}
          </Grid>
        </Column>
      )}

      {/* About is the trust page of the funnel: it ends where every page ends. */}
      <WaitlistForm newsletter={waitlist} variant="signature" />
    </Column>
  );
}
