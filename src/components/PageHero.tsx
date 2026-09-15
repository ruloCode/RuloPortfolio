import type { ReactNode } from "react";
import { Column, Flex, Heading, RevealFx, Tag, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  actions?: ReactNode;
  /** Portrait, image or any visual for the right column. */
  aside?: ReactNode;
  /** Small facts under the actions (location, languages...). */
  facts?: ReactNode;
}

/**
 * The one page opening every section page shares: eyebrow tag, an H1 at the
 * same scale as the scroll-world's first station, an intro and the actions,
 * revealed in a short stagger. With `aside`, the visual sits to the right on
 * desktop and above the text on phones.
 */
export function PageHero({ eyebrow, title, intro, actions, aside, facts }: PageHeroProps) {
  const copy = (
    <Column flex={7} gap="20" maxWidth={40}>
      <RevealFx speed="fast" translateY="4" horizontal="start">
        <Tag variant="brand" size="m" label={eyebrow} />
      </RevealFx>
      <RevealFx speed="fast" delay={0.08} translateY="8" horizontal="start">
        <Heading className={brand.heroTitle} variant="display-strong-l" wrap="balance">
          {title}
        </Heading>
      </RevealFx>
      {intro && (
        <RevealFx speed="fast" delay={0.16} translateY="8" horizontal="start">
          <Text as="div" variant="heading-default-l" onBackground="neutral-weak" wrap="balance">
            {intro}
          </Text>
        </RevealFx>
      )}
      {actions && (
        <RevealFx speed="fast" delay={0.24} translateY="12" horizontal="start">
          <Flex gap="12" wrap vertical="center">
            {actions}
          </Flex>
        </RevealFx>
      )}
      {facts && (
        <RevealFx speed="fast" delay={0.3} translateY="8" horizontal="start">
          <Flex gap="16" wrap vertical="center">
            {facts}
          </Flex>
        </RevealFx>
      )}
    </Column>
  );

  if (!aside) return <Column fillWidth>{copy}</Column>;

  return (
    <Flex fillWidth gap="xl" mobileDirection="column-reverse" vertical="center">
      {copy}
      <RevealFx speed="fast" delay={0.12} translateY="12" flex={5} fillWidth>
        {aside}
      </RevealFx>
    </Flex>
  );
}
