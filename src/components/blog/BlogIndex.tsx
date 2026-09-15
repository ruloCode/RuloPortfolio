"use client";

import { useState } from "react";
import { Column, Flex, Grid, Heading, SmartImage, SmartLink, Tag, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import styles from "./BlogIndex.module.scss";

export type BlogIndexPost = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  image?: string;
  tag?: string;
  /** Already formatted for the locale on the server. */
  date: string;
  /** Already localized ("8 min de lectura"). */
  readingTime: string;
};

type BlogIndexProps = {
  posts: BlogIndexPost[];
  allLabel: string;
  filterLabel: string;
  readLabel: string;
};

/**
 * Featured post + topic chips + card grid. Filtering is in memory — there
 * are a handful of posts and the tags come from their frontmatter — so the
 * server hands over the list and the client only picks which to show.
 */
export function BlogIndex({ posts, allLabel, filterLabel, readLabel }: BlogIndexProps) {
  const [active, setActive] = useState<string | null>(null);
  // Tags in order of first appearance (posts arrive newest first).
  const tags = Array.from(new Set(posts.map((p) => p.tag).filter(Boolean))) as string[];
  const visible = active ? posts.filter((p) => p.tag === active) : posts;
  // The lead card only when nothing is filtered: once a topic is picked the
  // grid is the answer, not one post.
  const featured = active ? undefined : visible[0];
  const rest = active ? visible : visible.slice(1);

  return (
    <Column fillWidth gap="l">
      {featured && (
        <SmartLink unstyled fillWidth href={featured.href}>
          <Flex
            className={brand.card}
            fillWidth
            gap="l"
            padding="m"
            radius="l"
            border="neutral-alpha-weak"
            background="surface"
            mobileDirection="column"
          >
            {featured.image && (
              <Flex flex={6}>
                <SmartImage
                  priority
                  className={brand.media}
                  src={featured.image}
                  alt=""
                  aspectRatio="16 / 10"
                  radius="m"
                  sizes="(max-width: 768px) 100vw, 560px"
                  border="neutral-alpha-weak"
                />
              </Flex>
            )}
            <Column flex={6} gap="12" vertical="center" paddingY="s">
              <Flex gap="12" vertical="center" wrap>
                {featured.tag && <Tag variant="brand" size="s" label={featured.tag} />}
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {featured.date}
                </Text>
              </Flex>
              <Heading as="h2" variant="display-strong-xs" wrap="balance">
                {featured.title}
              </Heading>
              <Text
                className={styles.clamp3}
                variant="body-default-m"
                onBackground="neutral-weak"
                wrap="balance"
              >
                {featured.summary}
              </Text>
              <Text variant="label-strong-s" onBackground="brand-weak">
                {readLabel} →
              </Text>
            </Column>
          </Flex>
        </SmartLink>
      )}

      <div className={styles.chips} role="group" aria-label={filterLabel}>
        <button
          type="button"
          className={styles.chip}
          aria-pressed={active === null}
          onClick={() => setActive(null)}
        >
          {allLabel}
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={styles.chip}
            aria-pressed={active === tag}
            onClick={() => setActive(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <Grid columns="3" tabletColumns="2" mobileColumns="1" gap="16" fillWidth>
        {rest.map((post) => (
          <SmartLink key={post.slug} unstyled fillWidth href={post.href}>
            <Column
              className={brand.card}
              fillWidth
              fillHeight
              gap="12"
              padding="m"
              radius="l"
              border="neutral-alpha-weak"
              background="surface"
            >
              {post.image && (
                <SmartImage
                  className={brand.media}
                  src={post.image}
                  alt=""
                  aspectRatio="16 / 9"
                  radius="m"
                  sizes="(max-width: 768px) 100vw, 360px"
                  border="neutral-alpha-weak"
                />
              )}
              <Flex gap="12" vertical="center" wrap>
                {post.tag && <Tag variant="neutral" size="s" label={post.tag} />}
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {post.date}
                </Text>
              </Flex>
              <Heading as="h2" variant="heading-strong-m" wrap="balance">
                {post.title}
              </Heading>
              <Text className={styles.clamp} variant="body-default-s" onBackground="neutral-weak">
                {post.summary}
              </Text>
              <Text
                variant="label-default-s"
                onBackground="neutral-weak"
                style={{ marginTop: "auto" }}
              >
                {post.readingTime}
              </Text>
            </Column>
          </SmartLink>
        ))}
      </Grid>
    </Column>
  );
}
