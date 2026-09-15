import { Column, Flex, Heading, RevealFx, Text } from "@/once-ui/components";
import styles from "./StoryTimeline.module.scss";

// The accents of the scroll-world stations, in their AA-legible version.
const ACTS: { key: string; dot: string }[] = [
  { key: "before", dot: "var(--accent-brick)" },
  { key: "learn", dot: "var(--accent-gold)" },
  { key: "production", dot: "var(--accent-blue)" },
  { key: "today", dot: "var(--sw-accent)" },
];

type StoryCopy = {
  quote: string;
  north: string;
  acts: Record<string, { label: string; title: string; body: string }>;
};

/** The About story: four acts on a rail, then the pull quote and the north star. */
export function StoryTimeline({ story }: { story: StoryCopy }) {
  return (
    <Column fillWidth gap="xl">
      <ol className={styles.acts}>
        {ACTS.map(({ key, dot }, index) => (
          <li key={key} className={styles.act} style={{ "--dot": dot } as React.CSSProperties}>
            <RevealFx speed="fast" delay={index * 0.05} translateY="8" inView horizontal="start">
              <Column gap="8" maxWidth={40}>
                <Text as="span" variant="label-strong-s" onBackground="brand-weak">
                  {story.acts[key].label.toUpperCase()}
                </Text>
                <Heading as="h3" variant="heading-strong-xl" wrap="balance">
                  {story.acts[key].title}
                </Heading>
                <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
                  {story.acts[key].body}
                </Text>
              </Column>
            </RevealFx>
          </li>
        ))}
      </ol>
      <RevealFx speed="fast" translateY="8" inView horizontal="start">
        <Flex fillWidth>
          <blockquote className={styles.quote}>
            <Text as="p" variant="heading-default-l" wrap="balance" style={{ margin: 0 }}>
              {story.quote}
            </Text>
            <Text
              as="p"
              variant="body-default-m"
              onBackground="neutral-weak"
              wrap="balance"
              style={{ marginTop: "var(--static-space-16)" }}
            >
              {story.north}
            </Text>
          </blockquote>
        </Flex>
      </RevealFx>
    </Column>
  );
}
