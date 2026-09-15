import { Button, Column, Heading, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";

interface CtaBannerProps {
  title: string;
  description: string;
  button: string;
  href: string;
}

/** Conversion banner reused on home, services, case studies and blog posts. */
export function CtaBanner({ title, description, button, href }: CtaBannerProps) {
  return (
    <Column
      fillWidth
      gap="m"
      padding="xl"
      radius="l"
      border="neutral-alpha-weak"
      background="surface"
      className={brand.signatureGlow}
      horizontal="center"
    >
      <Heading as="h2" variant="display-strong-xs" align="center" wrap="balance">
        {title}
      </Heading>
      <Text
        variant="body-default-m"
        onBackground="neutral-weak"
        align="center"
        wrap="balance"
      >
        {description}
      </Text>
      <Button href={href} size="m" arrowIcon className={brand.signatureCta}>
        {button}
      </Button>
    </Column>
  );
}
