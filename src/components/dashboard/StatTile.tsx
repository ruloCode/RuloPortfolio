import { Column, Icon, Row, Text } from "@/once-ui/components";

/**
 * One KPI. The value carries the weight and the hint explains what it counts —
 * a number with no denominator is a number nobody trusts.
 */
export const StatTile = ({
  icon,
  label,
  value,
  hint,
}: {
  icon: string;
  label: string;
  value: string;
  hint: string;
}) => (
  <Column
    flex={1}
    minWidth={12}
    gap="8"
    padding="16"
    radius="l"
    background="surface"
    border="neutral-medium"
  >
    <Row gap="8" vertical="center">
      <Icon name={icon} size="xs" onBackground="brand-weak" />
      <Text variant="label-default-s" onBackground="neutral-weak">
        {label}
      </Text>
    </Row>
    <Text variant="display-strong-xs" onBackground="neutral-strong">
      {value}
    </Text>
    <Text variant="body-default-xs" onBackground="neutral-weak" wrap="balance">
      {hint}
    </Text>
  </Column>
);
