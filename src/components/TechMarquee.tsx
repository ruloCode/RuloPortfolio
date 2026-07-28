import { Column, Text } from "@/once-ui/components";
import styles from "./TechMarquee.module.scss";

// Product names, so they are not translated. Order is deliberate: the engineering
// stack first, then the AI/automation layer — the same story the copy tells.
const STACK = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Supabase",
  "Vercel",
  "n8n",
  "Claude",
  "OpenAI",
  "LangChain",
  "GitHub Actions",
] as const;

interface TechMarqueeProps {
  label: string;
}

/**
 * Scrolling strip of the stack. The second track is a visual duplicate of the
 * first (that is what makes the loop seamless), so it is hidden from assistive
 * tech to avoid reading every name twice.
 */
export function TechMarquee({ label }: TechMarqueeProps) {
  return (
    <Column fillWidth gap="16" horizontal="center">
      <Text variant="label-default-s" onBackground="neutral-weak" align="center">
        {label}
      </Text>
      <div className={styles.viewport}>
        <div className={styles.track}>
          <ul className={styles.row}>
            {STACK.map((name) => (
              <li key={name} className={styles.chip}>
                {name}
              </li>
            ))}
          </ul>
          <ul className={styles.row} aria-hidden="true">
            {STACK.map((name) => (
              <li key={name} className={styles.chip}>
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Column>
  );
}
