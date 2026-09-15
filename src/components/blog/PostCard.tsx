import { Column, Flex, Heading, SmartImage, SmartLink, Tag, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import styles from "./PostCard.module.scss";

export type PostCardData = {
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

/**
 * One article card, used by the blog index and the home's latest strip — so a
 * post looks the same wherever it appears.
 */
export function PostCard({ post, priority = false }: { post: PostCardData; priority?: boolean }) {
  return (
    <SmartLink unstyled fillWidth href={post.href}>
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
            priority={priority}
            border="neutral-alpha-weak"
          />
        )}
        <Flex gap="12" vertical="center" wrap>
          {post.tag && <Tag variant="neutral" size="s" label={post.tag} />}
          <Text variant="label-default-s" onBackground="neutral-weak">
            {post.date}
          </Text>
        </Flex>
        <Heading as="h3" variant="heading-strong-m" wrap="balance">
          {post.title}
        </Heading>
        <Text className={styles.clamp} variant="body-default-s" onBackground="neutral-weak">
          {post.summary}
        </Text>
        <Text variant="label-default-s" onBackground="neutral-weak" style={{ marginTop: "auto" }}>
          {post.readingTime}
        </Text>
      </Column>
    </SmartLink>
  );
}
