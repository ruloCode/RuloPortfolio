import { Column, Flex, IconButton, SmartLink, Text } from "@/once-ui/components";
import { getLocale, getTranslations } from "next-intl/server";
import { person, social } from "@/app/resources/content";
import { routes, scheduling } from "@/app/resources";
import { localizeHref } from "@/i18n/routing";
import styles from "./Footer.module.scss";

const NAV_ITEMS: { route: string; key: string }[] = [
  { route: "/about", key: "about" },
  { route: "/services", key: "services" },
  { route: "/ia", key: "ia" },
  { route: "/work", key: "work" },
  { route: "/blog", key: "blog" },
  { route: "/gallery", key: "gallery" },
];

export const Footer = async () => {
  const currentYear = new Date().getFullYear();
  const locale = await getLocale();
  const t = await getTranslations();

  return (
    <Flex
      as="footer"
      position="relative"
      fillWidth
      padding="8"
      horizontal="center"
      mobileDirection="column"
    >
      <Column maxWidth="m" paddingY="24" paddingX="16" gap="24" fillWidth>
        <Flex
          className={styles.mobile}
          fillWidth
          gap="24"
          horizontal="space-between"
          mobileDirection="column"
        >
          <Column gap="8" maxWidth={24}>
            <Text variant="heading-strong-s">{person.name}</Text>
            <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
              {t("footer.tagline")}
            </Text>
            {routes["/ia"] && (
              <SmartLink suffixIcon="arrowRight" href={localizeHref(locale, "/ia#lista")}>
                <Text variant="body-strong-s">{t("footer.waitlistCta")}</Text>
              </SmartLink>
            )}
            <SmartLink suffixIcon="arrowRight" href={scheduling.link}>
              <Text variant="body-default-s">{t("footer.bookCall")}</Text>
            </SmartLink>
          </Column>
          <Column gap="8">
            <Text variant="label-strong-s" onBackground="neutral-weak">
              {t("footer.navTitle")}
            </Text>
            <Flex gap="16" wrap>
              {NAV_ITEMS.filter(({ route }) => routes[route as keyof typeof routes]).map(
                ({ route, key }) => (
                  <SmartLink key={route} href={localizeHref(locale, route)}>
                    <Text variant="body-default-s">{t(`nav.${key}`)}</Text>
                  </SmartLink>
                ),
              )}
            </Flex>
          </Column>
          <Flex gap="16" fitHeight>
            {social.map(
              (item) =>
                item.link && (
                  <IconButton
                    key={item.name}
                    href={item.link}
                    icon={item.icon}
                    tooltip={item.name}
                    size="s"
                    variant="ghost"
                  />
                ),
            )}
          </Flex>
        </Flex>
        <Flex fillWidth horizontal="center">
          <Text variant="body-default-xs" onBackground="neutral-weak">
            © {currentYear} / {person.name}
          </Text>
        </Flex>
      </Column>
      <Flex height="80" show="s"></Flex>
    </Flex>
  );
};
