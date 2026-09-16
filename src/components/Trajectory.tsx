import {
  Column,
  Flex,
  Grid,
  Heading,
  SmartImage,
  SmartLink,
  Tag,
  Text,
} from "@/once-ui/components";
import { getTranslations } from "next-intl/server";
import { getPosts } from "@/app/utils/utils";
import { localizeHref } from "@/i18n/routing";
import { Stats } from "@/components/Stats";
import brand from "@/styles/brand.module.scss";
import styles from "./Trajectory.module.scss";
import { highlight } from "./Highlight";

// Same accents as the scroll-world stations, in narrative order.
const MILESTONES: { key: string; dot: string }[] = [
  { key: "freelance", dot: "var(--accent-gold)" },
  { key: "vitau", dot: "var(--accent-blue)" },
  { key: "careways", dot: "var(--accent-coral)" },
  { key: "arkano", dot: "var(--brand)" },
];

/**
 * The track record, right after the last station: the figures, the career
 * line and the cases. Cases come from work/projects; `homeOrder` in the
 * frontmatter picks and orders them (1-2 large, 3-5 small).
 */
export async function Trajectory({ locale }: { locale: string }) {
  const t = await getTranslations("trajectory");
  const cases = getPosts(["work", "projects"], locale)
    .filter((post) => post.metadata.homeOrder)
    .sort((a, b) => a.metadata.homeOrder! - b.metadata.homeOrder!);
  const large = cases.slice(0, 2);
  const small = cases.slice(2, 5);

  return (
    <Column fillWidth gap="xl">
      <Flex fillWidth gap="l" mobileDirection="column" vertical="end">
        <Column flex={7} gap="12">
          <Flex>
            <Tag variant="brand" size="m" label={t("eyebrow")} />
          </Flex>
          <Heading as="h2" className={brand.sectionTitle} variant="display-strong-s" wrap="balance">
            {highlight(t("title"), t("highlight"))}
          </Heading>
        </Column>
        <Flex flex={5}>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            {t("intro")}
          </Text>
        </Flex>
      </Flex>

      <Stats />

      <ol className={styles.timeline}>
        {MILESTONES.map(({ key, dot }) => (
          <li
            key={key}
            className={styles.milestone}
            style={{ "--dot": dot } as React.CSSProperties}
          >
            <Text as="span" variant="heading-strong-xl">
              {t(`milestones.${key}.year`)}
            </Text>
            <Text as="span" variant="heading-strong-s">
              {t(`milestones.${key}.title`)}
            </Text>
            <Text as="span" variant="body-default-s" onBackground="neutral-weak">
              {t(`milestones.${key}.body`)}
            </Text>
          </li>
        ))}
      </ol>

      {cases.length > 0 && (
        <Column fillWidth gap="l">
          <Flex fillWidth horizontal="space-between" vertical="center" wrap gap="12">
            <Heading as="h3" className={brand.sectionTitle} variant="display-strong-xs" wrap="balance">
              {t("casesTitle")}
            </Heading>
            <SmartLink suffixIcon="arrowRight" href={localizeHref(locale, "/work")}>
              <Text variant="body-default-s">{t("viewAll")}</Text>
            </SmartLink>
          </Flex>
          <Grid columns="2" mobileColumns="1" gap="16" fillWidth>
            {large.map((post) => (
              <SmartLink
                key={post.slug}
                unstyled
                fillWidth
                href={localizeHref(locale, `/work/${post.slug}`)}
              >
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
                  {post.metadata.images[0] && (
                    <SmartImage
                      className={brand.media}
                      src={post.metadata.images[0]}
                      alt=""
                      aspectRatio="16 / 9"
                      radius="m"
                      sizes="(max-width: 768px) 100vw, 520px"
                      border="neutral-alpha-weak"
                    />
                  )}
                  {post.metadata.metric && (
                    <Flex>
                      <Tag variant="neutral" size="s" label={post.metadata.metric} />
                    </Flex>
                  )}
                  <Heading as="h4" variant="heading-strong-l" wrap="balance">
                    {post.metadata.title}
                  </Heading>
                  <Text
                    className={styles.clamp}
                    variant="body-default-s"
                    onBackground="neutral-weak"
                  >
                    {post.metadata.summary}
                  </Text>
                  <Text variant="label-strong-s" onBackground="brand-weak" style={{ marginTop: "auto" }}>
                    {t("caseCta")} →
                  </Text>
                </Column>
              </SmartLink>
            ))}
          </Grid>
          {small.length > 0 && (
            <Grid columns="3" tabletColumns="3" mobileColumns="1" gap="16" fillWidth>
              {small.map((post) => (
                <SmartLink
                  key={post.slug}
                  unstyled
                  fillWidth
                  href={localizeHref(locale, `/work/${post.slug}`)}
                >
                  <Column
                    className={brand.card}
                    fillWidth
                    fillHeight
                    gap="8"
                    padding="m"
                    radius="l"
                    border="neutral-alpha-weak"
                    background="surface"
                  >
                    {post.metadata.metric && (
                      <Flex>
                        <Tag variant="neutral" size="s" label={post.metadata.metric} />
                      </Flex>
                    )}
                    <Heading as="h4" variant="heading-strong-m" wrap="balance">
                      {post.metadata.title}
                    </Heading>
                    <Text
                      className={styles.clamp}
                      variant="body-default-s"
                      onBackground="neutral-weak"
                    >
                      {post.metadata.summary}
                    </Text>
                  </Column>
                </SmartLink>
              ))}
            </Grid>
          )}
        </Column>
      )}
    </Column>
  );
}
