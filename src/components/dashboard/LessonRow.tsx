import { Card, Column, Flex, Icon, Row, SmartImage, SmartLink, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";

type LessonRowProps = {
  href: string;
  order: number;
  title: string;
  summary: string;
  duration?: number;
  image?: string;
  completed: boolean;
  durationLabel: string;
};

export const LessonRow = ({
  href,
  order,
  title,
  summary,
  duration,
  image,
  completed,
  durationLabel,
}: LessonRowProps) => (
  <SmartLink unstyled fillWidth href={href}>
    <Card
      fillWidth
      radius="l"
      padding="12"
      gap="16"
      vertical="center"
      background="surface"
      border="neutral-medium"
      className={brand.card}
    >
      {image && (
        <Flex
          className={brand.media}
          hide="s"
          radius="m"
          overflow="hidden"
          style={{ width: "7.5rem", flexShrink: 0 }}
        >
          <SmartImage src={image} alt="" aspectRatio="16 / 9" sizes="120px" />
        </Flex>
      )}
      <Flex
        width="24"
        height="24"
        horizontal="center"
        vertical="center"
        style={{ flexShrink: 0 }}
      >
        {completed ? (
          <Icon name="checkCircle" onBackground="brand-strong" />
        ) : (
          <Flex
            width="24"
            height="24"
            radius="full"
            border="neutral-medium"
            horizontal="center"
            vertical="center"
          >
            <Text variant="label-default-s" onBackground="neutral-weak">
              {order}
            </Text>
          </Flex>
        )}
      </Flex>
      <Column flex={1} gap="4" minWidth="0" paddingY="8">
        <Text variant="body-strong-m">{title}</Text>
        <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
          {summary}
        </Text>
        {duration !== undefined && (
          <Row gap="8" vertical="center" paddingTop="4">
            <Icon name="clock" size="xs" onBackground="neutral-weak" />
            <Text variant="label-default-s" onBackground="neutral-weak">
              {durationLabel}
            </Text>
          </Row>
        )}
      </Column>
      <Icon name="chevronRight" onBackground="neutral-weak" />
    </Card>
  </SmartLink>
);
