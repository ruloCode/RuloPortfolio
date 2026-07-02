import { Column, Grid, Heading } from "@/once-ui/components";
import { getTranslations } from "next-intl/server";
import { getPosts } from "@/app/utils/utils";
import Post from "./Post";

interface RelatedPostsProps {
  currentSlug: string;
  tag?: string;
  locale: string;
}

/** Two related posts: same tag first, newest fill the rest. */
export async function RelatedPosts({ currentSlug, tag, locale }: RelatedPostsProps) {
  const t = await getTranslations("blog");

  const others = getPosts(["src", "app", "[locale]", "blog", "posts"], locale)
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
          <Post key={post.slug} post={post} thumbnail locale={locale} />
        ))}
      </Grid>
    </Column>
  );
}
