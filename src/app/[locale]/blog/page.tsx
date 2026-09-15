import { notFound } from "next/navigation";
import { Column } from "@/once-ui/components";
import { NewsletterBand, PageHero } from "@/components";
import { BlogIndex, type BlogIndexPost } from "@/components/blog/BlogIndex";
import { baseURL, routes } from "@/app/resources";
import { createI18nContent } from "@/app/resources/content-i18n";
import { localeAlternates } from "@/app/utils/seo";
import { getPosts } from "@/app/utils/utils";
import { formatDate } from "@/app/utils/formatDate";
import { readingTime } from "@/app/utils/readingTime";
import { scrollAsset } from "@/lib/scroll-world/sections";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizeHref, routing } from "@/i18n/routing";

interface PageParams {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams) {
  const { locale } = await params;

  // While the route is disabled it must not leak its real title/OG over a 404 body.
  if (!routes["/blog"]) return {};
  const t = await getTranslations({ locale });
  const { blog } = createI18nContent(t);
  const title = blog.title;
  const description = blog.description;
  const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    alternates: localeAlternates(locale, "/blog"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://${baseURL}/blog`,
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

export default async function Blog({ params }: PageParams) {
  const { locale } = await params;

  if (!routes["/blog"]) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();
  const { blog, person, newsletter } = createI18nContent(t);

  // Newest first. Dates and reading times are formatted here, where the
  // locale and the MDX body live; the client only filters.
  const posts: BlogIndexPost[] = getPosts(["blog", "posts"], locale)
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
    )
    .map((post) => ({
      slug: post.slug,
      href: localizeHref(locale, `/blog/${post.slug}`),
      title: post.metadata.title,
      summary: post.metadata.summary,
      image: post.metadata.image || undefined,
      tag: typeof post.metadata.tag === "string" ? post.metadata.tag : undefined,
      date: formatDate(post.metadata.publishedAt, false, locale),
      readingTime: t("blog.readingTime", { minutes: readingTime(post.content) }),
    }));

  return (
    <Column maxWidth="m" gap="xl">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            headline: blog.title,
            description: blog.description,
            url: `https://${baseURL}/blog`,
            image: `https://${baseURL}/og?title=${encodeURIComponent(blog.title)}`,
            author: {
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
      <PageHero eyebrow={blog.label} title={blog.title} intro={blog.description} />
      <BlogIndex
        posts={posts}
        allLabel={t("blog.all")}
        filterLabel={t("blog.filterLabel")}
        readLabel={t("blog.readArticle")}
      />
      <NewsletterBand copy={newsletter} image={scrollAsset("07-semana0.webp")} />
    </Column>
  );
}
