import { Column, Grid, Heading } from "@/once-ui/components";
import { formatDate } from "@/app/utils/formatDate";
import { readingTime } from "@/app/utils/readingTime";
import { localizeHref } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { getPosts } from "@/app/utils/utils";
import { PostCard } from "./PostCard";

interface RelatedPostsProps {
  currentSlug: string;
  tag?: string;
  locale: string;
}

/** Two related posts: same tag first, newest fill the rest. */
export async function RelatedPosts({ currentSlug, tag, locale }: RelatedPostsProps) {
  const t = await getTranslations("blog");
  const tRoot = await getTranslations();

  const others = getPosts(["blog", "posts"], locale)
    .filter((post) => post.slug !== currentSlug)
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
    );

  const sameTag = tag ? others.filter((post) => post.metadata.tag === tag) : [];
  const rest = others.filter((post) => !sameTag.includes(post));
  const related = [...sameTag, ...rest].slice(0, 2);

  if (related.length === 0) return null;

  return (
    <Column fillWidth gap="m" marginTop="24">
      <Heading as="h2" variant="heading-strong-l">
        {t("related")}
      </Heading>
      <Grid columns="2" mobileColumns="1" fillWidth gap="m">
        {related.map((post) => (
          <PostCard
            key={post.slug}
            post={{
              slug: post.slug,
              href: localizeHref(locale, `/blog/${post.slug}`),
              title: post.metadata.title,
              summary: post.metadata.summary,
              image: post.metadata.image || undefined,
              tag: typeof post.metadata.tag === "string" ? post.metadata.tag : undefined,
              date: formatDate(post.metadata.publishedAt, false, locale),
              readingTime: tRoot("blog.readingTime", { minutes: readingTime(post.content) }),
            }}
          />
        ))}
      </Grid>
    </Column>
  );
}
