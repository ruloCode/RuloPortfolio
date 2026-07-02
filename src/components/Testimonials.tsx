"use client";

import { Avatar, Card, Column, Heading, Text, Flex, Grid } from "@/once-ui/components";
import { useTranslations } from "next-intl";

const TESTIMONIAL_KEYS = ["diego", "carolina", "alvaro"] as const;

export function Testimonials() {
  const t = useTranslations("testimonials");

  return (
    <Column fillWidth gap="l">
      <Heading as="h2" variant="display-strong-s">
        {t("title")}
      </Heading>

      <Grid
        columns="3"
        tabletColumns="2"
        mobileColumns="1"
        gap="l"
        fillWidth
      >
        {TESTIMONIAL_KEYS.map((key) => (
          <Card
            key={key}
            padding="l"
            radius="l"
          >
            <Column gap="m" fillWidth>
              <Text
                variant="body-default-m"
                style={{ fontStyle: 'italic', lineHeight: 1.6 }}
              >
                &ldquo;{t(`items.${key}.quote`)}&rdquo;
              </Text>

              <Flex gap="s" vertical="center">
                <Avatar
                  size="m"
                  src={`/images/testimonials/${key}.png`}
                />
                <Column gap="2">
                  <Text variant="body-strong-s">
                    {t(`items.${key}.name`)}
                  </Text>
                  <Text
                    variant="body-default-xs"
                    onBackground="neutral-weak"
                  >
                    {t(`items.${key}.role`)}
                  </Text>
                </Column>
              </Flex>
            </Column>
          </Card>
        ))}
      </Grid>
    </Column>
  );
}
