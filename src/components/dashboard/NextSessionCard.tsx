import { Button, Column, Flex, Heading, Icon, Row, Tag, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";

type Labels = {
  eyebrow: string;
  when: string;
  join: string;
  noLink: string;
  prepTitle: string;
  today?: string;
};

/**
 * What a student who already paid should see first: the next class, how to
 * join it, and what to have open. It takes the place of the booking CTA —
 * asking someone to book a session she already has on her calendar is the
 * clearest way to tell her the product does not know who she is.
 */
export const NextSessionCard = ({
  title,
  meetingUrl,
  prep,
  labels,
}: {
  title: string;
  meetingUrl: string | null;
  prep: string[];
  labels: Labels;
}) => (
  <Column
    fillWidth
    gap="12"
    padding="l"
    radius="l"
    background="surface"
    border="brand-medium"
    className={`${brand.signatureGlow} ${brand.panel}`}
  >
    <Row gap="8" vertical="center" wrap>
      <Text variant="label-default-s" onBackground="brand-weak">
        {labels.eyebrow}
      </Text>
      {/* Only on the day itself: a permanent badge is decoration, a badge that
          appears the morning of the class is information. */}
      {labels.today && <Tag size="s" variant="brand" label={labels.today} />}
    </Row>

    <Heading variant="heading-strong-l" wrap="balance">
      {title}
    </Heading>

    <Row gap="8" vertical="center">
      <Icon name="calendar" size="s" onBackground="neutral-weak" />
      <Text variant="body-default-m" onBackground="neutral-medium">
        {labels.when}
      </Text>
    </Row>

    {prep.length > 0 && (
      <Column gap="8" paddingTop="8">
        <Text variant="label-default-s" onBackground="neutral-weak">
          {labels.prepTitle}
        </Text>
        {/* start, not center: these wrap to two lines on a phone — which is
            where she reads them — and a centred tick floats mid-sentence. */}
        {prep.map((item) => (
          <Row key={item} gap="8" vertical="start">
            <Icon name="check" size="s" onBackground="brand-weak" />
            <Text variant="body-default-s" onBackground="neutral-medium">
              {item}
            </Text>
          </Row>
        ))}
      </Column>
    )}

    <Flex gap="12" vertical="center" wrap paddingTop="4">
      {meetingUrl ? (
        <Button
          href={meetingUrl}
          size="m"
          arrowIcon
          prefixIcon="team"
          className={brand.signatureCta}
        >
          {labels.join}
        </Button>
      ) : (
        <Text variant="label-default-s" onBackground="neutral-weak">
          {labels.noLink}
        </Text>
      )}
    </Flex>
  </Column>
);
