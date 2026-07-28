import {
  Avatar,
  Button,
  Column,
  Flex,
  Heading,
  Icon,
  Row,
  SmartLink,
  Tag,
  Text,
} from "@/once-ui/components";

export type PendingView = {
  /** Waitlist row id — they have no profile id to link with. */
  id: string;
  email: string;
  name: string;
  joinedLabel: string;
  /** False means the welcome email never went out — a problem on our side. */
  welcomeSent: boolean;
  openActions: number;
};

/**
 * The people the roster cannot show: on the waitlist, no account. Without this
 * they exist only as a number in a KPI tile, which is exactly the state in
 * which someone gets forgotten.
 */
export const PendingSignups = ({
  signups,
  basePath,
  copy,
}: {
  signups: PendingView[];
  basePath: string;
  copy: {
    title: string;
    description: string;
    joined: string;
    welcomeSent: string;
    welcomeMissing: string;
    nudge: string;
    nudgeSubject: string;
    openActions: (count: number) => string;
  };
}) => (
  <Column fillWidth gap="12">
    <Row gap="12" vertical="center">
      <Icon name="email" onBackground="neutral-weak" />
      <Heading variant="heading-strong-m">{copy.title}</Heading>
    </Row>
    <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
      {copy.description}
    </Text>

    <Column
      fillWidth
      radius="l"
      background="surface"
      border="neutral-medium"
      borderStyle="dashed"
      overflow="hidden"
    >
      {signups.map((signup, index) => (
        <Row
          key={signup.email}
          fillWidth
          gap="12"
          paddingX="16"
          paddingY="12"
          vertical="center"
          wrap
          borderTop={index === 0 ? undefined : "neutral-alpha-weak"}
        >
          <Avatar size="s" value={signup.name.charAt(0).toUpperCase()} />
          {/* Linked even without an account: 1:1 sessions get logged against
              people long before they ever click a magic link. */}
          <SmartLink unstyled href={`${basePath}/${signup.id}`} style={{ flex: 1, minWidth: "12rem" }}>
            <Column gap="2">
              <Text variant="body-strong-s">{signup.name}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {signup.email}
              </Text>
            </Column>
          </SmartLink>

          {signup.openActions > 0 && (
            <Tag size="s" variant="warning" label={copy.openActions(signup.openActions)} />
          )}

          <Text variant="body-default-xs" onBackground="neutral-weak">
            {signup.joinedLabel}
          </Text>

          {/* Only worth a badge when it failed: "we emailed them" is the
              expected case and does not need to shout. */}
          {signup.welcomeSent ? (
            <Tag size="s" variant="neutral" label={copy.welcomeSent} />
          ) : (
            <Tag size="s" variant="danger" prefixIcon="warningTriangle" label={copy.welcomeMissing} />
          )}

          <Flex>
            <Button
              href={`mailto:${signup.email}?subject=${encodeURIComponent(copy.nudgeSubject)}`}
              variant="secondary"
              size="s"
              prefixIcon="email"
            >
              {copy.nudge}
            </Button>
          </Flex>
        </Row>
      ))}
    </Column>
  </Column>
);
