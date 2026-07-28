import { useLocale, useTranslations } from "next-intl";
import { Button, Column, Flex, Heading, Text } from "@/once-ui/components";
import { routes } from "@/app/resources";
import { localizeHref } from "@/i18n/routing";

export default function NotFound() {
  const t = useTranslations("notFound");
  const locale = useLocale();

  return (
    <Column as="section" fill center paddingBottom="160">
      <Text marginBottom="s" variant="display-strong-xl">
        404
      </Text>
      <Heading marginBottom="l" variant="display-default-xs">
        {t("heading")}
      </Heading>
      <Text onBackground="neutral-weak">{t("text")}</Text>
      {/* A dead end costs the visit; hand back the two paths that matter. */}
      <Flex gap="12" marginTop="l" wrap horizontal="center">
        <Button href={localizeHref(locale, "/")} variant="secondary" prefixIcon="home">
          {t("backHome")}
        </Button>
        {routes["/ia"] && (
          <Button href={localizeHref(locale, "/ia")} variant="primary" prefixIcon="sparkle">
            {t("startCta")}
          </Button>
        )}
      </Flex>
    </Column>
  );
}
