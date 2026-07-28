"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import { Button, Fade, Flex, Line, ToggleButton } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import styles from "@/components/Header.module.scss";

import { routes, display } from "@/app/resources";
import { localizeHref, routing, usePathname, useRouter } from "@/i18n/routing";
import { ThemeToggle } from "@/components/ThemeToggle";

type TimeDisplayProps = {
  timeZone: string;
  locale?: string; // Optionally allow locale, defaulting to 'en-GB'
};

const TimeDisplay: React.FC<TimeDisplayProps> = ({ timeZone, locale = "en-GB" }) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const timeString = new Intl.DateTimeFormat(locale, options).format(now);
      setCurrentTime(timeString);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, [timeZone, locale]);

  return <>{currentTime}</>;
};

const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

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

  return (
    <>
      <Fade hide="s" fillWidth position="fixed" height="80" zIndex={9} />
      <Fade show="s" fillWidth position="fixed" bottom="0" to="top" height="80" zIndex={9} />
      <Flex
        fitHeight
        className={styles.position}
        as="header"
        zIndex={9}
        fillWidth
        padding="8"
        horizontal="center"
      >
        <Flex paddingLeft="12" fillWidth vertical="center" textVariant="body-default-s" hide="s">
          {display.location && <Flex>America/Bogota</Flex>}
        </Flex>
        <Flex fillWidth horizontal="center">
          <Flex
            background="surface"
            border="neutral-medium"
            radius="m-4"
            shadow="l"
            padding="4"
            horizontal="center"
          >
            <Flex gap="4" vertical="center" textVariant="body-default-s">
              {routes["/"] && (
                <ToggleButton
                  prefixIcon="home"
                  href={href("/")}
                  aria-label={t("home")}
                  selected={pathname === "/"}
                />
              )}
              <Line vert maxHeight="24" />
              {routes["/about"] && (
                <>
                  <ToggleButton
                    className="s-flex-hide"
                    prefixIcon="person"
                    href={href("/about")}
                    label={t("about")}
                    selected={pathname === "/about"}
                  />
                  <ToggleButton
                    className="s-flex-show"
                    prefixIcon="person"
                    href={href("/about")}
                    aria-label={t("about")}
                    selected={pathname === "/about"}
                  />
                </>
              )}
              {routes["/services"] && (
                <>
                  <ToggleButton
                    className="s-flex-hide"
                    prefixIcon="briefcase"
                    href={href("/services")}
                    label={t("services")}
                    selected={pathname.startsWith("/services")}
                  />
                  <ToggleButton
                    className="s-flex-show"
                    prefixIcon="briefcase"
                    href={href("/services")}
                    aria-label={t("services")}
                    selected={pathname.startsWith("/services")}
                  />
                </>
              )}
              {routes["/ia"] && (
                <>
                  <ToggleButton
                    className="s-flex-hide"
                    prefixIcon="sparkle"
                    href={href("/ia")}
                    label={t("ia")}
                    selected={pathname.startsWith("/ia")}
                  />
                  <ToggleButton
                    className="s-flex-show"
                    prefixIcon="sparkle"
                    href={href("/ia")}
                    aria-label={t("ia")}
                    selected={pathname.startsWith("/ia")}
                  />
                </>
              )}
              {routes["/work"] && (
                <>
                  <ToggleButton
                    className="s-flex-hide"
                    prefixIcon="grid"
                    href={href("/work")}
                    label={t("work")}
                    selected={pathname.startsWith("/work")}
                  />
                  <ToggleButton
                    className="s-flex-show"
                    prefixIcon="grid"
                    href={href("/work")}
                    aria-label={t("work")}
                    selected={pathname.startsWith("/work")}
                  />
                </>
              )}
              {routes["/blog"] && (
                <>
                  <ToggleButton
                    className="s-flex-hide"
                    prefixIcon="book"
                    href={href("/blog")}
                    label={t("blog")}
                    selected={pathname.startsWith("/blog")}
                  />
                  <ToggleButton
                    className="s-flex-show"
                    prefixIcon="book"
                    href={href("/blog")}
                    aria-label={t("blog")}
                    selected={pathname.startsWith("/blog")}
                  />
                </>
              )}
              {routes["/gallery"] && (
                <>
                  <ToggleButton
                    className="s-flex-hide"
                    prefixIcon="gallery"
                    href={href("/gallery")}
                    label={t("gallery")}
                    selected={pathname.startsWith("/gallery")}
                  />
                  <ToggleButton
                    className="s-flex-show"
                    prefixIcon="gallery"
                    href={href("/gallery")}
                    aria-label={t("gallery")}
                    selected={pathname.startsWith("/gallery")}
                  />
                </>
              )}
              {/* On small screens the side clusters are hidden, so language and
                  theme live inside the pill — the only fully tappable surface. */}
              <Flex className="s-flex-show" gap="4" vertical="center">
                <Line vert maxHeight="24" />
                <LanguageSwitcher />
                <ThemeToggle />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex fillWidth horizontal="end" vertical="center" hide="s">
          <Flex
            paddingRight="12"
            horizontal="end"
            vertical="center"
            textVariant="body-default-s"
            gap="20"
          >
            <LanguageSwitcher />
            <ThemeToggle />
            {/* Persistent conversion CTA — hidden on /ia (you're already there);
                on small screens the whole cluster is hidden and language/theme
                move inside the nav pill. */}
            {routes["/ia"] && !pathname.startsWith("/ia") && (
              <Button
                href={href("/ia#lista")}
                size="s"
                className={brand.signatureCta}
                prefixIcon="sparkle"
              >
                {t("waitlistCta")}
              </Button>
            )}
            {display.time && <TimeDisplay timeZone="America/Bogota" />}
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};
