import { notFound } from "next/navigation";
import { CustomMDX } from "@/components/mdx";
import { getAllSlugs, getPost } from "@/app/utils/utils";
import {
  Button,
  Column,
  Feedback,
  Flex,
  Heading,
  SmartImage,
  Text,
} from "@/once-ui/components";
import { TeamAvatars } from "@/components/TeamAvatars";
import { baseURL } from "@/app/resources";
import { person } from "@/app/resources/content";
import { formatDate } from "@/app/utils/formatDate";
import ScrollToHash from "@/components/ScrollToHash";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { localizeHref, routing } from "@/i18n/routing";

const WORK_PATH = ["src", "app", "[locale]", "work", "projects"];

interface WorkParams {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateStaticParams(): Promise<{ locale: string; slug: string }[]> {
  // Union of slugs per locale so fallback (EN-only) projects still render under /es
  const slugs = new Set(getAllSlugs(WORK_PATH).map(({ slug }) => slug));
  return routing.locales.flatMap((locale) =>
    Array.from(slugs).map((slug) => ({ locale, slug })),
  );
}

export function generateMetadata({ params: { locale, slug } }: WorkParams) {
  let post = getPost(WORK_PATH, locale, slug);

  if (!post) {
    return;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    images,
    image,
    team,
  } = post.metadata;

  // Optimize title length (30-65 characters)
  const optimizedTitle = title.length > 60 ? `${title.substring(0, 57)}...` : title;

  // Optimize description length (120-320 characters)
  const optimizedDescription = description.length > 320
    ? `${description.substring(0, 317)}...`
    : description.length < 120
      ? `${description} View this project by ${person.firstName}.`
      : description;

  let ogImage = image
    ? `https://${baseURL}${image}`
    : `https://${baseURL}/og?title=${encodeURIComponent(title)}`;

  // Generate keywords based on project metadata
  const keywords = [
    title,
    description,
    person.name,
    person.role,
    'portfolio',
    'project',
    'case study',
    `${person.firstName}'s work`,
    'design',
    'development'
  ].filter(Boolean).join(', ');

  const enUrl = `https://${baseURL}/work/${post.slug}`;
  const esUrl = `https://${baseURL}/es/work/${post.slug}`;

  return {
    title: optimizedTitle,
    description: optimizedDescription,
    keywords,
    alternates: {
      canonical: locale === routing.defaultLocale ? enUrl : esUrl,
      languages: {
        en: enUrl,
        es: esUrl,
        "x-default": enUrl,
      },
    },
    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      type: "article",
      publishedTime,
      url: locale === routing.defaultLocale ? enUrl : esUrl,
      siteName: `${person.firstName}'s Portfolio`,
      locale: locale === "es" ? "es_CO" : "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} | Project by ${person.name}`,
        },
      ],
      authors: [person.name],
      ...(team && { "og:authors": team.map(t => t.name) }),
    },
    twitter: {
      card: "summary_large_image",
      title: optimizedTitle,
      description: optimizedDescription,
      images: [ogImage],
    },
    creator: person.name,
    publisher: person.name,
  };
}

export default async function Project({ params }: WorkParams) {
  unstable_setRequestLocale(params.locale);

  const t = await getTranslations();
  let post = getPost(WORK_PATH, params.locale, params.slug);

  if (!post) {
    notFound();
  }

  const avatars =
    post.metadata.team?.map((person) => ({
      src: person.avatar,
    })) || [];

  // Generate structured data for the project
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metadata.title,
    datePublished: post.metadata.publishedAt,
    dateModified: post.metadata.publishedAt,
    description: post.metadata.summary,
    image: post.metadata.image
      ? `https://${baseURL}${post.metadata.image}`
      : post.metadata.images && post.metadata.images.length > 0
      ? `https://${baseURL}${post.metadata.images[0]}`
      : `https://${baseURL}/og?title=${encodeURIComponent(post.metadata.title)}`,
    url: `https://${baseURL}${localizeHref(params.locale, `/work/${post.slug}`)}`,
    author: {
      "@type": "Person",
      name: person.name,
      url: `https://${baseURL}`,
    },
    publisher: {
      "@type": "Organization",
      name: person.name,
      logo: {
        "@type": "ImageObject",
        url: `https://${baseURL}/favicon.ico`,
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://${baseURL}${localizeHref(params.locale, `/work/${post.slug}`)}`,
    },
    keywords: [
      post.metadata.title,
      post.metadata.summary,
      "project",
      "portfolio",
      "case study",
      "work",
      person.name,
      person.role,
    ].filter(Boolean).join(", "),
    ...(post.metadata.team && {
      contributor: post.metadata.team.map(member => ({
        "@type": "Person",
        name: member.name,
        ...(member.linkedIn && { sameAs: member.linkedIn })
      }))
    }),
  };

  return (
    <Column as="section" maxWidth="m" horizontal="center" gap="l">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Column maxWidth="xs" gap="16">
        <Button
          href={localizeHref(params.locale, "/work")}
          variant="tertiary"
          weight="default"
          size="s"
          prefixIcon="chevronLeft"
        >
          {t("nav.work")}
        </Button>
        <Heading variant="display-strong-s">{post.metadata.title}</Heading>
      </Column>
      {post.metadata.images.length > 0 && (
        <SmartImage
          priority
          aspectRatio="16 / 9"
          radius="m"
          alt="image"
          src={post.metadata.images[0]}
        />
      )}
      <Column style={{ margin: "auto" }} as="article" maxWidth="xs">
        <Flex gap="12" marginBottom="24" vertical="center">
          {post.metadata.team && <TeamAvatars team={post.metadata.team} size="m" reverse />}
          <Text variant="body-default-s" onBackground="neutral-weak">
            {formatDate(post.metadata.publishedAt, false, params.locale)}
          </Text>
        </Flex>
        {post.isFallback && (
          <Feedback
            icon
            variant="info"
            marginBottom="24"
            description={t("blog.availableInEnglishOnly")}
          />
        )}
        {(post.metadata.link || post.metadata.repository) && (
          <Flex gap="12" marginBottom="24" wrap>
            {post.metadata.link && (
              <Button
                href={post.metadata.link}
                variant="secondary"
                size="s"
                suffixIcon="arrowUpRightFromSquare"
              >
                {t("projectPage.viewLive")}
              </Button>
            )}
            {post.metadata.repository && (
              <Button
                href={post.metadata.repository}
                variant="tertiary"
                size="s"
                prefixIcon="github"
              >
                {t("projectPage.viewCode")}
              </Button>
            )}
          </Flex>
        )}
        <CustomMDX source={post.content} />
      </Column>
      <ScrollToHash />
    </Column>
  );
}
