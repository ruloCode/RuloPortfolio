import { getPosts } from "@/app/utils/utils";
import { Column, Flex, Grid, Heading, RevealFx, SmartImage, SmartLink, Tag, Text } from "@/once-ui/components";
import { getTranslations } from "next-intl/server";
import { localizeHref } from "@/i18n/routing";
import brand from "@/styles/brand.module.scss";
import styles from "./Projects.module.scss";

interface ProjectsProps {
  range?: [number, number?];
  locale?: string;
}

/** The case grid: the same card as the home's trajectory and the blog. */
export async function Projects({ range, locale = "en" }: ProjectsProps) {
  const t = await getTranslations("projectCard");
  const sortedProjects = getPosts(["work", "projects"], locale).sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
  );

  const displayedProjects = range
    ? sortedProjects.slice(range[0] - 1, range[1] ?? sortedProjects.length)
    : sortedProjects;

  return (
    <Grid columns="2" mobileColumns="1" gap="16" fillWidth>
      {displayedProjects.map((post, index) => (
        <RevealFx key={post.slug} speed="fast" delay={(index % 2) * 0.06} translateY="12" inView fillWidth>
          <SmartLink unstyled fillWidth href={localizeHref(locale, `/work/${post.slug}`)}>
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
              {post.metadata.images?.[0] && (
                <SmartImage
                  className={brand.media}
                  src={post.metadata.images[0]}
                  alt=""
                  aspectRatio="16 / 9"
                  radius="m"
                  sizes="(max-width: 768px) 100vw, 520px"
                  priority={index < 2}
                  border="neutral-alpha-weak"
                />
              )}
              {post.metadata.metric && (
                <Flex>
                  <Tag variant="neutral" size="s" label={post.metadata.metric} />
                </Flex>
              )}
              <Heading as="h2" variant="heading-strong-l" wrap="balance">
                {post.metadata.title}
              </Heading>
              <Text className={styles.clamp} variant="body-default-s" onBackground="neutral-weak">
                {post.metadata.summary}
              </Text>
              <Text
                variant="label-strong-s"
                onBackground="brand-weak"
                style={{ marginTop: "auto" }}
              >
                {t("caseStudy")} →
              </Text>
            </Column>
          </SmartLink>
        </RevealFx>
      ))}
    </Grid>
  );
}
