import { Flex, SmartImage, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import styles from "./HeroShowcase.module.scss";

interface HeroShowcaseProps {
  src: string;
  alt: string;
  /** Short live-status line shown in the glass pill over the image. */
  caption: string;
}

/** Page-hero image with a looping light sweep and a glass status pill. */
export function HeroShowcase({ src, alt, caption }: HeroShowcaseProps) {
  return (
    <div className={styles.frame}>
      <SmartImage
        className={brand.mediaGlow}
        src={src}
        alt={alt}
        aspectRatio="21 / 9"
        radius="l"
        sizes="(max-width: 768px) 100vw, 1024px"
        priority
        border="neutral-alpha-weak"
      />
      <span aria-hidden="true" className={styles.sheen} />
      <Flex
        className={styles.caption}
        fitWidth
        vertical="center"
        gap="8"
        paddingX="16"
        paddingY="8"
        radius="full"
      >
        <span aria-hidden="true" className={styles.pulse} />
        <Text variant="label-strong-s" onBackground="neutral-strong">
          {caption}
        </Text>
      </Flex>
    </div>
  );
}
