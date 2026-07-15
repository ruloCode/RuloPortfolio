import { Card, Column, Flex, Icon, Row, SmartLink, Tag, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";

type LessonRowProps = {
  href: string;
  order: number;
  title: string;
  summary: string;
  duration?: number;
  completed: boolean;
  durationLabel: string;
  pendingVideoLabel?: string;
};

export const LessonRow = ({
  href,
  order,
  title,
  summary,
  duration,
  completed,
  durationLabel,
  pendingVideoLabel,
}: LessonRowProps) => (
  <SmartLink unstyled fillWidth href={href}>
    <Card
      fillWidth
      radius="l"
      padding="16"
      gap="16"
      vertical="center"
      background="surface"
      border="neutral-medium"
      className={brand.card}
    >
    <Flex width="24" height="24" horizontal="center" vertical="center" style={{ flexShrink: 0 }}>
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
    <Column flex={1} gap="4" minWidth="0">
      <Text variant="body-strong-m">{title}</Text>
      <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
        {summary}
      </Text>
      <Row gap="8" vertical="center" paddingTop="4">
        {duration !== undefined && (
          <>
            <Icon name="clock" size="xs" onBackground="neutral-weak" />
            <Text variant="label-default-s" onBackground="neutral-weak">
              {durationLabel}
            </Text>
          </>
        )}
        {pendingVideoLabel && <Tag size="s" variant="neutral" label={pendingVideoLabel} />}
      </Row>
    </Column>
      <Icon name="chevronRight" onBackground="neutral-weak" />
    </Card>
  </SmartLink>
);
