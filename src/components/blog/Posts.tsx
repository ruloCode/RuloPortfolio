import { getPosts } from "@/app/utils/utils";
import { Grid, RevealFx } from "@/once-ui/components";
import { getTranslations } from "next-intl/server";
import { formatDate } from "@/app/utils/formatDate";
import { readingTime } from "@/app/utils/readingTime";
import { localizeHref } from "@/i18n/routing";
import { PostCard } from "./PostCard";

interface PostsProps {
  range?: [number] | [number, number];
  columns?: "1" | "2" | "3";
  locale?: string;
}

/** A strip of article cards — the same card the blog index uses. */
export async function Posts({ range, columns = "1", locale = "en" }: PostsProps) {
  const t = await getTranslations();
  const sortedBlogs = getPosts(["blog", "posts"], locale).sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
  );

  const displayedBlogs = range
    ? sortedBlogs.slice(range[0] - 1, range.length === 2 ? range[1] : sortedBlogs.length)
    : sortedBlogs;

  if (!displayedBlogs.length) return null;

  return (
    <Grid columns={columns} tabletColumns="2" mobileColumns="1" fillWidth gap="16">
      {displayedBlogs.map((post, index) => (
        <RevealFx key={post.slug} speed="fast" delay={index * 0.06} translateY="12" inView fillWidth>
          <PostCard
            post={{
              slug: post.slug,
              href: localizeHref(locale, `/blog/${post.slug}`),
              title: post.metadata.title,
              summary: post.metadata.summary,
              image: post.metadata.image || undefined,
              tag: typeof post.metadata.tag === "string" ? post.metadata.tag : undefined,
              date: formatDate(post.metadata.publishedAt, false, locale),
              readingTime: t("blog.readingTime", { minutes: readingTime(post.content) }),
            }}
          />
        </RevealFx>
      ))}
    </Grid>
  );
}
