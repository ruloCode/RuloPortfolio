import type { ReactNode } from "react";
import { Column, Flex, Heading, SmartLink, Tag, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { highlight } from "./Highlight";

interface SectionHeaderProps {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  /** Substring of a plain-text title to set in the brand green. */
  highlight?: string;
  intro?: ReactNode;
  /** Optional "see all" link on the right. */
  link?: { label: string; href: string };
  as?: "h2" | "h3";
}

/**
 * One heading recipe for every section on every page: the station's solid
 * pill, a title one step under the hero with its key phrase in green, and
 * an optional intro — the same voice the home opens with.
 */
export function SectionHeader({
  id,
  eyebrow,
  title,
  highlight: word,
  intro,
  link,
  as = "h2",
}: SectionHeaderProps) {
  return (
    <Flex id={id} fillWidth gap="l" horizontal="space-between" vertical="end" mobileDirection="column">
      <Column gap="12" maxWidth={40}>
        {eyebrow && (
          <Flex>
            <Tag variant="brand" size="m" label={eyebrow} />
          </Flex>
        )}
        <Heading as={as} className={brand.sectionTitle} variant="display-strong-s" wrap="balance">
          {highlight(title, word)}
        </Heading>
        {intro && (
          <Text as="div" variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            {intro}
          </Text>
        )}
      </Column>
      {link && (
        <SmartLink suffixIcon="arrowRight" href={link.href}>
          <Text variant="body-default-s">{link.label}</Text>
        </SmartLink>
      )}
    </Flex>
  );
}
