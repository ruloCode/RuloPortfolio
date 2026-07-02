import { Column, Flex, Grid, Heading, Icon, SmartLink, Text } from "@/once-ui/components";
import { localizeHref } from "@/i18n/routing";

const TEASER_KEYS = ["frontend", "performance", "consulting"];

const OFFERING_ICONS: Record<string, string> = {
  frontend: "rocket",
  performance: "gauge",
  ecommerce: "cart",
  consulting: "lightbulb",
};

interface ServicesTeaserProps {
  services: {
    offerings: {
      title: string;
      items: { key: string; title: string; description: string; bestFor: string }[];
    };
  };
  viewAllLabel: string;
  locale: string;
}

export function ServicesTeaser({ services, viewAllLabel, locale }: ServicesTeaserProps) {
  const items = services.offerings.items.filter((item) => TEASER_KEYS.includes(item.key));

  return (
    <Column fillWidth gap="l">
      <Flex fillWidth horizontal="space-between" vertical="center" wrap gap="12">
        <Heading as="h2" variant="display-strong-s">
          {services.offerings.title}
        </Heading>
        <SmartLink suffixIcon="arrowRight" href={localizeHref(locale, "/services")}>
          <Text variant="body-default-s">{viewAllLabel}</Text>
        </SmartLink>
      </Flex>
      <Grid columns="3" tabletColumns="3" mobileColumns="1" gap="12" fillWidth>
        {items.map((item) => (
          <Column
            key={item.key}
            fillWidth
            gap="8"
            padding="l"
            radius="l"
            border="neutral-alpha-weak"
            background="surface"
          >
            <Icon name={OFFERING_ICONS[item.key] ?? "sparkle"} onBackground="brand-weak" />
            <Text variant="heading-strong-m">{item.title}</Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {item.description}
            </Text>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
