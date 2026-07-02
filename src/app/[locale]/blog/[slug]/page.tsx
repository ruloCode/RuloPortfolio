import { notFound } from "next/navigation";
import { CustomMDX } from "@/components/mdx";
import { getAllSlugs, getPost } from "@/app/utils/utils";
import {
  AvatarGroup,
  Button,
  Column,
  Feedback,
  Heading,
  Row,
  Text,
} from "@/once-ui/components";
import { baseURL } from "@/app/resources";
import { person } from "@/app/resources/content";
import { formatDate } from "@/app/utils/formatDate";
import ScrollToHash from "@/components/ScrollToHash";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { localizeHref, routing } from "@/i18n/routing";

const BLOG_PATH = ["src", "app", "[locale]", "blog", "posts"];

interface BlogParams {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateStaticParams(): Promise<{ locale: string; slug: string }[]> {
  // Union of slugs per locale so fallback (EN-only) posts still render under /es
  const slugs = new Set(getAllSlugs(BLOG_PATH).map(({ slug }) => slug));
  return routing.locales.flatMap((locale) =>
    Array.from(slugs).map((slug) => ({ locale, slug })),
  );
}

export function generateMetadata({ params: { locale, slug } }: BlogParams) {
  let post = getPost(BLOG_PATH, locale, slug);

  if (!post) {
    return;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
    team,
  } = post.metadata;

  // Optimize title length (30-65 characters)
  const optimizedTitle = title.length > 60 ? `${title.substring(0, 57)}...` : title;

  // Optimize description length (120-320 characters)
  const optimizedDescription = description.length > 320
    ? `${description.substring(0, 317)}...`
    : description.length < 120
      ? `${description} Read more about ${person.firstName}'s insights on this topic.`
      : description;

  let ogImage = image
    ? `https://${baseURL}${image}`
    : `https://${baseURL}/og?title=${encodeURIComponent(title)}`;

  // Generate keywords based on post metadata
  const keywords = [
    title,
    description,
    person.name,
    person.role,
    'portfolio',
    'blog',
    'web development',
    `${person.firstName}'s blog`,
    'technology',
    'design'
  ].filter(Boolean).join(', ');

  const enUrl = `https://${baseURL}/blog/${post.slug}`;
  const esUrl = `https://${baseURL}/es/blog/${post.slug}`;

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
          alt: `${title} | ${person.name}`,
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
    viewport: "width=device-width, initial-scale=1.0",
    creator: person.name,
    publisher: person.name,
  };
}

export default async function Blog({ params }: BlogParams) {
  unstable_setRequestLocale(params.locale);

  const t = await getTranslations();
  let post = getPost(BLOG_PATH, params.locale, params.slug);

  if (!post) {
    notFound();
  }

  const avatars =
    post.metadata.team?.map((person) => ({
      src: person.avatar,
    })) || [];

  // Generate structured data for the blog post
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metadata.title,
    datePublished: post.metadata.publishedAt,
    dateModified: post.metadata.publishedAt,
    description: post.metadata.summary,
    image: post.metadata.image
      ? `https://${baseURL}${post.metadata.image}`
      : `https://${baseURL}/og?title=${encodeURIComponent(post.metadata.title)}`,
    url: `https://${baseURL}${localizeHref(params.locale, `/blog/${post.slug}`)}`,
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
      "@id": `https://${baseURL}${localizeHref(params.locale, `/blog/${post.slug}`)}`,
    },
    keywords: [
      post.metadata.title,
      post.metadata.summary,
      "blog",
      "portfolio",
      person.name,
      person.role,
    ].filter(Boolean).join(", "),
  };

  return (
    <Column as="section" maxWidth="xs" gap="l">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Button
        href={localizeHref(params.locale, "/blog")}
        weight="default"
        variant="tertiary"
        size="s"
        prefixIcon="chevronLeft"
      >
        Posts
      </Button>
      <Heading variant="display-strong-s">{post.metadata.title}</Heading>
      <Row gap="12" vertical="center">
        {avatars.length > 0 && <AvatarGroup size="s" avatars={avatars} />}
        <Text variant="body-default-s" onBackground="neutral-weak">
          {formatDate(post.metadata.publishedAt, false, params.locale)}
        </Text>
      </Row>
      {post.isFallback && (
        <Feedback icon variant="info" description={t("blog.availableInEnglishOnly")} />
      )}
      <Column as="article" fillWidth>
        <CustomMDX source={post.content} />
      </Column>
      <ScrollToHash />
    </Column>
  );
}
