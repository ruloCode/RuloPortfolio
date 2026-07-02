import { useTranslations } from "next-intl";
import { Column, Heading, Text } from "@/once-ui/components";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <Column as="section" fill center paddingBottom="160">
      <Text marginBottom="s" variant="display-strong-xl">
        404
      </Text>
      <Heading marginBottom="l" variant="display-default-xs">
        {t("heading")}
      </Heading>
      <Text onBackground="neutral-weak">{t("text")}</Text>
    </Column>
  );
}
