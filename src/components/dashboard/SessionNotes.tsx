"use client";

import { toggleAction } from "@/app/[locale]/dashboard/admin/actions";
import type { MentoringSession } from "@/lib/admin/sessions";
import { Button, Checkbox, Column, Flex, Icon, Row, Tag, Text, useToast } from "@/once-ui/components";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

/**
 * Deliberately not MDX. These notes are pasted prose about a real client, and
 * MDX would try to parse a stray `<` or `{` in a quote as JSX and take the
 * whole page down. Paragraphs and "- " bullets cover what a session note needs.
 */
type Node =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

/**
 * Line-driven, not block-driven. Notes routinely put a heading and its bullets
 * in one block ("Las 3 tareas:\n- a\n- b"); splitting on blank lines only would
 * flatten that whole group into a single run-on paragraph.
 */
function parseSummary(summary: string): Node[] {
  const nodes: Node[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      nodes.push({ kind: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length > 0) {
      nodes.push({ kind: "list", items: list });
      list = [];
    }
  };

  for (const raw of summary.split("\n")) {
    const line = raw.trim();

    if (line.length === 0) {
      flushList();
      flushParagraph();
      continue;
    }
    if (/^[-*•]\s+/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^[-*•]\s+/, ""));
      continue;
    }

    flushList();
    // A short line ending in ":" is a heading in handwritten notes. The length
    // guard keeps a real sentence that happens to end in a colon out of it.
    if (line.endsWith(":") && line.length < 80) {
      flushParagraph();
      nodes.push({ kind: "heading", text: line.slice(0, -1) });
      continue;
    }
    paragraph.push(line);
  }

  flushList();
  flushParagraph();
  return nodes;
}

const SummaryText = ({ summary }: { summary: string }) => (
  <Column gap="12" fillWidth>
    {parseSummary(summary).map((node, index) => {
      if (node.kind === "heading") {
        return (
          <Text
            key={index}
            variant="label-strong-s"
            onBackground="neutral-strong"
            paddingTop={index === 0 ? undefined : "8"}
          >
            {node.text}
          </Text>
        );
      }

      if (node.kind === "list") {
        return (
          <Column key={index} gap="4" fillWidth>
            {node.items.map((item, itemIndex) => (
              <Row key={itemIndex} gap="8" vertical="start" fillWidth>
                <Text variant="body-default-s" onBackground="brand-weak" style={{ flexShrink: 0 }}>
                  •
                </Text>
                <Text variant="body-default-s" onBackground="neutral-medium">
                  {item}
                </Text>
              </Row>
            ))}
          </Column>
        );
      }

      return (
        <Text key={index} variant="body-default-s" onBackground="neutral-medium">
          {node.text}
        </Text>
      );
    })}
  </Column>
);

const ActionRow = ({ action }: { action: MentoringSession["actions"][number] }) => {
  const t = useTranslations("dashboard.admin.sessions");
  // useState + rollback, matching MarkCompleteButton: this app is on React
  // 18.3.1, where useOptimistic exists in the types but not the runtime.
  const [done, setDone] = useState(action.done);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const onToggle = () => {
    const next = !done;
    setDone(next);
    startTransition(async () => {
      const result = await toggleAction(action.id, next);
      if (!result.ok) {
        setDone(!next);
        addToast({ variant: "danger", message: t("toggleError") });
      }
    });
  };

  return (
    <Row
      fillWidth
      gap="12"
      paddingY="4"
      vertical="center"
      style={{ opacity: isPending ? 0.6 : 1 }}
    >
      {/* A real checkbox rather than a styled div: keyboard operation and the
          checked state come for free instead of being reimplemented. */}
      <Checkbox
        // Stable across server and client: Checkbox otherwise invents a random
        // id and the aria-labelledby it emits fails to hydrate.
        id={`action-${action.id}`}
        isChecked={done}
        onToggle={onToggle}
        disabled={isPending}
        label={
          <Text
            variant="body-default-s"
            onBackground={done ? "neutral-weak" : "neutral-medium"}
            style={{ textDecoration: done ? "line-through" : "none" }}
          >
            {action.title}
          </Text>
        }
      />
      <Flex flex={1} />
      <Flex style={{ flexShrink: 0 }}>
        <Tag
          size="s"
          variant={action.owner === "coach" ? "brand" : "neutral"}
          label={action.owner === "coach" ? t("ownerCoach") : t("ownerStudent")}
        />
      </Flex>
    </Row>
  );
};

export const SessionNotes = ({
  sessions,
  dateLabels,
}: {
  sessions: MentoringSession[];
  /** Formatted on the server, keyed by session id — see lib/admin/format.ts. */
  dateLabels: Record<string, string>;
}) => {
  const t = useTranslations("dashboard.admin.sessions");
  // Oldest held session first, so session 1 stays session 1 as history grows.
  const held = sessions
    .filter((session) => session.status !== "planned")
    .map((session) => session.id)
    .reverse();

  return (
    <Column fillWidth gap="16">
      {sessions.map((session) => {
        const open = session.actions.filter((action) => !action.done).length;
        const planned = session.status === "planned";
        // Numbered against held sessions only — a plan has no ordinal until it
        // actually happens, and counting it would renumber the history.
        const number = held.indexOf(session.id) + 1;

        return (
          <Column
            key={session.id}
            fillWidth
            gap="12"
            padding="l"
            radius="l"
            background="surface"
            border={planned ? "brand-medium" : "neutral-medium"}
            borderStyle={planned ? "dashed" : "solid"}
          >
            <Row fillWidth gap="12" vertical="center" wrap>
              <Tag
                size="s"
                variant={planned ? "brand" : "neutral"}
                prefixIcon={planned ? "calendar" : undefined}
                label={planned ? t("planned") : t("number", { number })}
              />
              <Text variant="label-default-s" onBackground="neutral-weak">
                {dateLabels[session.id]}
              </Text>
              <Flex flex={1} />
              {open > 0 && (
                <Tag
                  size="s"
                  variant="warning"
                  label={planned ? t("prepCount", { count: open }) : t("openCount", { count: open })}
                />
              )}
            </Row>

            <Text variant="heading-strong-s">{session.title}</Text>

            {/* Everything else on this card is private. This block is not, and
                saying so here is cheaper than remembering it. */}
            {planned && (session.meetingUrl || session.prep.length > 0) && (
              <Column fillWidth gap="8" padding="m" radius="m" border="brand-medium">
                <Text variant="label-default-s" onBackground="brand-weak">
                  {t("studentSees")}
                </Text>
                {session.prep.map((item) => (
                  <Row key={item} gap="8" vertical="center">
                    <Icon name="check" size="xs" onBackground="neutral-weak" />
                    <Text variant="body-default-s" onBackground="neutral-medium">
                      {item}
                    </Text>
                  </Row>
                ))}
                {session.meetingUrl && (
                  <Flex paddingTop="4">
                    <Button
                      href={session.meetingUrl}
                      variant="tertiary"
                      size="s"
                      prefixIcon="team"
                      suffixIcon="arrowUpRightFromSquare"
                    >
                      {t("joinLink")}
                    </Button>
                  </Flex>
                )}
              </Column>
            )}

            {session.summary.trim().length > 0 && <SummaryText summary={session.summary} />}

            {session.actions.length > 0 && (
              <Column fillWidth gap="4" paddingTop="8">
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {planned ? t("prep") : t("actions")}
                </Text>
                {session.actions.map((action) => (
                  <ActionRow key={action.id} action={action} />
                ))}
              </Column>
            )}
          </Column>
        );
      })}
    </Column>
  );
};
