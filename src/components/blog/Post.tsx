"use client";

import { Column, Flex, Heading, SmartImage, SmartLink, Tag, Text } from "@/once-ui/components";
import { useTranslations } from "next-intl";
import styles from "./Posts.module.scss";
import { formatDate } from "@/app/utils/formatDate";
import { readingTime } from "@/app/utils/readingTime";
import { localizeHref } from "@/i18n/routing";

interface PostProps {
  post: any;
  thumbnail: boolean;
  locale?: string;
  variant?: "default" | "featured";
}

export default function Post({ post, thumbnail, locale = "en", variant = "default" }: PostProps) {
  const t = useTranslations("blog");
  const minutes = readingTime(post.content ?? "");

  const meta = (
    <Flex gap="12" vertical="center" wrap>
      <Text variant="label-default-s" onBackground="neutral-weak">
        {formatDate(post.metadata.publishedAt, false, locale)}
      </Text>
      <Text variant="label-default-s" onBackground="neutral-weak">
        · {t("readingTime", { minutes })}
      </Text>
      {post.metadata.tag && <Tag label={post.metadata.tag} variant="neutral" />}
    </Flex>
  );

  if (variant === "featured") {
    return (
      <SmartLink
        fillWidth
        className={styles.hover}
        unstyled
        key={post.slug}
        href={localizeHref(locale, `/blog/${post.slug}`)}
      >
        <Column position="relative" fillWidth gap="16" paddingY="12" paddingX="16">
          {post.metadata.image && (
            <SmartImage
              priority
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 768px"
              border="neutral-alpha-weak"
              cursor="interactive"
              radius="l"
              src={post.metadata.image}
              alt={"Thumbnail of " + post.metadata.title}
              aspectRatio="16 / 9"
            />
          )}
          <Column gap="8">
            <Heading as="h2" variant="display-strong-xs" wrap="balance">
              {post.metadata.title}
            </Heading>
            {post.metadata.summary && (
              <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
                {post.metadata.summary}
              </Text>
            )}
            {meta}
          </Column>
        </Column>
      </SmartLink>
    );
  }

  return (
    <SmartLink
      fillWidth
      className={styles.hover}
      unstyled
      key={post.slug}
      href={localizeHref(locale, `/blog/${post.slug}`)}
    >
      <Flex
        position="relative"
        mobileDirection="column"
        fillWidth
        paddingY="12"
        paddingX="16"
        gap="32"
      >
        {post.metadata.image && thumbnail && (
          <SmartImage
            priority
            maxWidth={20}
            className={styles.image}
            sizes="640px"
            border="neutral-alpha-weak"
            cursor="interactive"
            radius="m"
            src={post.metadata.image}
            alt={"Thumbnail of " + post.metadata.title}
            aspectRatio="16 / 9"
          />
        )}
        <Column position="relative" fillWidth gap="8" vertical="center">
          <Heading as="h2" variant="heading-strong-l" wrap="balance">
            {post.metadata.title}
          </Heading>
          {meta}
        </Column>
      </Flex>
    </SmartLink>
  );
}
