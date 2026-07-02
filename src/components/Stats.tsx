"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Column, Grid, Icon, SmartLink, Text } from "@/once-ui/components";
import { localizeHref } from "@/i18n/routing";
import styles from "./Stats.module.scss";

const STAT_KEYS = ["transactions", "users", "lcp", "hackathon"] as const;
type StatKey = (typeof STAT_KEYS)[number];

const HACKATHON_HREF = "/work/hackathon-samatech";

/** Splits "$2M+" into { prefix: "$", target: 2, suffix: "M+" } for the count-up. */
function parseValue(value: string) {
  const match = value.match(/^(.*?)(\d+)(.*)$/);
  if (!match) return null;
  return { prefix: match[1], target: parseInt(match[2], 10), suffix: match[3] };
}

function CountUpValue({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const parsed = parseValue(value);
    const element = ref.current;
    if (!parsed || !element) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || hasRun.current) return;
          hasRun.current = true;
          observer.disconnect();

          const duration = 1200;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(
              `${parsed.prefix}${Math.round(parsed.target * eased)}${parsed.suffix}`,
            );
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={styles.value}>
      {display}
    </span>
  );
}

export function Stats() {
  const t = useTranslations("stats");
  const locale = useLocale();

  return (
    <Grid columns="4" tabletColumns="2" mobileColumns="2" gap="12" fillWidth>
      {STAT_KEYS.map((key: StatKey) => {
        const tile = (
          <Column
            key={key}
            fillWidth
            fillHeight
            gap="4"
            padding="m"
            radius="l"
            border="neutral-alpha-weak"
            background="surface"
            className={styles.tile}
          >
            <Text variant="display-strong-xs" onBackground="brand-strong">
              {key === "hackathon" && (
                <Icon name="trophy" size="s" marginRight="8" onBackground="brand-weak" />
              )}
              <CountUpValue value={t(`items.${key}.value`)} />
            </Text>
            <Text variant="label-default-s" onBackground="neutral-weak" wrap="balance">
              {t(`items.${key}.label`)}
            </Text>
          </Column>
        );

        if (key === "hackathon") {
          return (
            <SmartLink
              key={key}
              unstyled
              fillWidth
              href={localizeHref(locale, HACKATHON_HREF)}
              aria-label={`${t("items.hackathon.value")} ${t("items.hackathon.label")}`}
            >
              {tile}
            </SmartLink>
          );
        }

        return tile;
      })}
    </Grid>
  );
}
