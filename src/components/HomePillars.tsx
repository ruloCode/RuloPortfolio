import { Column, Flex, Grid, Heading, Icon, SmartImage, SmartLink, Text } from "@/once-ui/components";
import styles from "./HomePillars.module.scss";

export interface HomePillarItem {
  key: string;
  icon: string;
  image?: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}

interface HomePillarsProps {
  title: string;
  items: HomePillarItem[];
  viewAllLabel: string;
  viewAllHref: string;
}

export function HomePillars({ title, items, viewAllLabel, viewAllHref }: HomePillarsProps) {
  return (
    <Column fillWidth gap="l">
      <Flex fillWidth horizontal="space-between" vertical="center" wrap gap="12">
        <Heading as="h2" variant="display-strong-s">
          {title}
        </Heading>
        <SmartLink suffixIcon="arrowRight" href={viewAllHref}>
          <Text variant="body-default-s">{viewAllLabel}</Text>
        </SmartLink>
      </Flex>
      <Grid columns="3" tabletColumns="3" mobileColumns="1" gap="12" fillWidth>
        {items.map((item) => (
          <Column
            key={item.key}
            className={styles.card}
            fillWidth
            gap="12"
            padding="l"
            radius="l"
            border="neutral-alpha-weak"
            background="surface"
          >
            {item.image && (
              <SmartImage
                className={styles.media}
                src={item.image}
                alt=""
                aspectRatio="16 / 9"
                radius="m"
                sizes="(max-width: 768px) 100vw, 400px"
                border="neutral-alpha-weak"
              />
            )}
            <Flex gap="8" vertical="center">
              <Icon name={item.icon} onBackground="brand-weak" />
              <Text variant="heading-strong-m">{item.title}</Text>
            </Flex>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {item.description}
            </Text>
            <SmartLink suffixIcon="arrowRight" href={item.href} style={{ marginTop: "auto" }}>
              <Text variant="body-default-s">{item.cta}</Text>
            </SmartLink>
          </Column>
        ))}
      </Grid>
    </Column>
  );
}
