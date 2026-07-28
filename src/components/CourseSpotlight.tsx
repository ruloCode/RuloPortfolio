import { Button, Column, Flex, Heading, SmartImage, Tag, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { AuroraBackdrop } from "./AuroraBackdrop";
import styles from "./CourseSpotlight.module.scss";

export interface CourseSpotlightProps {
  eyebrow: string;
  title: string;
  description: string;
  /** Program highlights, rendered as a numbered ladder. */
  highlights: string[];
  cta: string;
  ctaHref: string;
  ctaNote: string;
  imageSrc: string;
  imageAlt: string;
}

/**
 * Home-page spotlight for the /ia program. Informational: it carries /ia's
 * ambient light so the two pages read as one brand, but the gradient CTA and
 * halo stay reserved for the waitlist block further down.
 */
export function CourseSpotlight({
  eyebrow,
  title,
  description,
  highlights,
  cta,
  ctaHref,
  ctaNote,
  imageSrc,
  imageAlt,
}: CourseSpotlightProps) {
  return (
    <Flex
      className={`${brand.card} ${styles.spotlight}`}
      fillWidth
      gap="xl"
      padding="xl"
      radius="l"
      border="neutral-alpha-medium"
      mobileDirection="column"
      vertical="center"
    >
      <AuroraBackdrop variant="section" />

      <Column flex={7} gap="16" zIndex={1} className={styles.copy}>
        <Flex>
          <Tag variant="brand" size="m" label={eyebrow} />
        </Flex>
        <Heading as="h2" variant="display-strong-s" wrap="balance">
          {title}
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
          {description}
        </Text>
        <Column className={styles.ladder} gap="16" paddingTop="8">
          {highlights.map((highlight, index) => (
            <Flex key={highlight} gap="16" vertical="center">
              <span aria-hidden="true" className={styles.marker}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <Text variant="body-default-m">{highlight}</Text>
            </Flex>
          ))}
        </Column>
        <Column gap="8" paddingTop="8">
          <Flex>
            {/* Secondary on purpose: same as /ia's feature rows. The page's one
                primary action is the waitlist at the bottom. */}
            <Button href={ctaHref} variant="secondary" size="m" arrowIcon>
              {cta}
            </Button>
          </Flex>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {ctaNote}
          </Text>
        </Column>
      </Column>

      <Flex flex={5} fillWidth vertical="center" zIndex={1}>
        <SmartImage
          className={brand.media}
          src={imageSrc}
          alt={imageAlt}
          aspectRatio="4 / 5"
          radius="l"
          sizes="(max-width: 768px) 100vw, 420px"
          border="neutral-alpha-weak"
        />
      </Flex>
    </Flex>
  );
}
