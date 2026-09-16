"use client";

import { useLocale, useTranslations } from "next-intl";

import { Button, Flex, Line, SmartLink, Text, ToggleButton } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import styles from "@/components/Header.module.scss";
import { MobileMenu } from "@/components/MobileMenu";

import { navHidden, routes } from "@/app/resources";
import { localizeHref, routing, usePathname, useRouter } from "@/i18n/routing";

// The site's sections, in the order they are offered. One list feeds both the
// desktop pill and the phone's panel, so a route can never exist in one and be
// missing from the other.
const NAV_ITEMS = [
  { route: "/about", key: "about" },
  { route: "/services", key: "services" },
  { route: "/ia", key: "ia" },
  { route: "/work", key: "work" },
  { route: "/blog", key: "blog" },
  { route: "/gallery", key: "gallery" },
] as const;

const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (nextLocale: (typeof routing.locales)[number]) => {
    if (nextLocale === locale) return;
    // Same-slug convention across locales keeps detail pages stable on switch
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Flex gap="2" vertical="center" aria-label="Language">
      {routing.locales.map((code) => (
        <ToggleButton
          key={code}
          selected={locale === code}
          onClick={() => switchTo(code)}
          aria-label={code === "en" ? "Switch to English" : "Cambiar a español"}
          label={code.toUpperCase()}
        />
      ))}
    </Flex>
  );
};

export const Header = () => {
  const pathname = usePathname() ?? "";
  const locale = useLocale();
  const t = useTranslations("nav");

  const href = (path: string) => localizeHref(locale, path);
  // The home is the scroll-world: the bar floats over the film in the
  // diorama's cream and becomes the site's bone strip once the film ends
  // (html[data-sw-past], set by the engine).
  const isHome = pathname === "/";
  const isActive = (route: string) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route);

  const items = NAV_ITEMS.filter(({ route }) => routes[route] && !navHidden[route]);
  const showCta = routes["/ia"] && !pathname.startsWith("/ia");

  return (
    <Flex
      fitHeight
      className={isHome ? `${styles.position} ${styles.overWorld}` : styles.position}
      as="header"
      fillWidth
      paddingY="8"
      paddingX="16"
      gap="16"
      vertical="center"
      horizontal="space-between"
    >
      {/* The mark, linking home — on every page and at every width. 30 px y no
          26: el rulo lleva un contraluz que a 26 empieza a cerrarse, y ese
          hueco es lo que lo distingue de una mancha verde. */}
      <SmartLink unstyled className={styles.brand} href={href("/")} aria-label={t("home")}>
        <Flex gap="8" vertical="center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mark.svg" alt="" width={30} height={30} />
          {/* En el teléfono la palabra cede su sitio al botón: la marca sigue
              ahí en el símbolo, y lo que no puede faltar es la conversión. */}
          <Text className={styles.wordmark} variant="heading-strong-s">
            rulocode
          </Text>
        </Flex>
      </SmartLink>

      <Flex hide="s" horizontal="center">
        <Flex
          background="surface"
          border="neutral-medium"
          radius="m-4"
          shadow="l"
          padding="4"
          horizontal="center"
        >
          <Flex
            as="nav"
            aria-label={t("mainNav")}
            gap="4"
            vertical="center"
            textVariant="body-default-s"
          >
            {routes["/"] && (
              <>
                <ToggleButton
                  prefixIcon="home"
                  href={href("/")}
                  aria-label={t("home")}
                  selected={isActive("/")}
                />
                <Line vert maxHeight="24" />
              </>
            )}
            {items.map(({ route, key }) => (
              <ToggleButton
                key={route}
                href={href(route)}
                label={t(key)}
                selected={isActive(route)}
              />
            ))}
          </Flex>
        </Flex>
      </Flex>

      <Flex hide="s" vertical="center" gap="16">
        <LanguageSwitcher />
        {/* Persistent conversion CTA — hidden on /ia (you are already there). */}
        {showCta && (
          <Button href={href("/ia#lista")} size="s" className={brand.signatureCta}>
            {t("waitlistCta")}
          </Button>
        )}
      </Flex>

      {/* El botón de conversión vive fuera del menú en el teléfono. Medido
          antes de esto: la primera pantalla de un móvil ofrecía dos acciones,
          el logo y el burger, y ninguna convertía. Nadie abre un menú para
          comprar. */}
      <Flex className={styles.phoneActions} vertical="center" gap="4">
        {showCta && (
          <Button href={href("/ia#lista")} size="s" className={brand.signatureCta}>
            {t("waitlistCta")}
          </Button>
        )}
        <MobileMenu
          labels={{ open: t("openMenu"), close: t("closeMenu"), nav: t("mainNav") }}
          items={[
            ...(routes["/"] ? [{ href: href("/"), label: t("home"), active: isActive("/") }] : []),
            ...items.map(({ route, key }) => ({
              href: href(route),
              label: t(key),
              active: isActive(route),
            })),
          ]}
          cta={showCta ? { href: href("/ia#lista"), label: t("waitlistCta") } : undefined}
          footer={<LanguageSwitcher />}
        />
      </Flex>
    </Flex>
  );
};
