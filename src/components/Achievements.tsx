"use client";

import { Column, Flex, Icon, SmartLink, Tag, Text, TiltFx } from "@/once-ui/components";
import { useLocale, useTranslations } from "next-intl";
import { localizeHref } from "@/i18n/routing";
import { routes } from "@/app/resources";

// The case-study link only renders while /work is enabled — a proof link that
// 404s is worse than no link.
const ACHIEVEMENTS: { key: string; href?: string }[] = [
  { key: "hackathon", href: routes["/work"] ? "/work/hackathon-samatech" : undefined },
];

export function Achievements() {
  const t = useTranslations("achievements");
  const locale = useLocale();

  return (
    <Column fillWidth gap="m">
      {ACHIEVEMENTS.map(({ key, href }) => (
        <TiltFx key={key} fillWidth radius="l">
          <Column
            fillWidth
            gap="8"
            padding="l"
            radius="l"
            border="brand-alpha-medium"
            background="brand-alpha-weak"
          >
            <Flex gap="12" vertical="center" wrap>
              <Icon name="trophy" onBackground="brand-weak" />
              <Text variant="heading-strong-l">{t(`items.${key}.title`)}</Text>
            </Flex>
            <Tag size="s" variant="neutral" label={t(`items.${key}.meta`)} />
            <Text variant="body-default-m" onBackground="neutral-weak">
              {t(`items.${key}.description`)}
            </Text>
            {href && (
              <SmartLink suffixIcon="arrowRight" href={localizeHref(locale, href)}>
                <Text variant="body-default-s">{t(`items.${key}.cta`)}</Text>
              </SmartLink>
            )}
          </Column>
        </TiltFx>
      ))}
    </Column>
  );
}
