import type { ReactNode } from "react";
import { Column, Flex, Heading, SmartLink, Tag, Text } from "@/once-ui/components";

interface SectionHeaderProps {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Optional "see all" link on the right. */
  link?: { label: string; href: string };
  as?: "h2" | "h3";
}

/** One heading recipe for every section on every page. */
export function SectionHeader({ id, eyebrow, title, intro, link, as = "h2" }: SectionHeaderProps) {
  return (
    <Flex id={id} fillWidth gap="l" horizontal="space-between" vertical="end" mobileDirection="column">
      <Column gap="12" maxWidth={40}>
        {eyebrow && (
          <Flex>
            <Tag variant="brand" size="m" label={eyebrow} />
          </Flex>
        )}
        <Heading as={as} variant="display-strong-s" wrap="balance">
          {title}
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
