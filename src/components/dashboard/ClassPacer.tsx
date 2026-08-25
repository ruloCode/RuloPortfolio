"use client";

import { Button, Column, Flex, Row, Tag, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { useEffect, useState } from "react";

export type PacerBlock = { from: number; to: number; title: string };

/**
 * Reads "0-4 · Encuadre", "10-34 · Diagnóstico" out of a session plan.
 *
 * The coach already writes his script that way, so the schedule is authored
 * once — in the note he reads during the class — instead of being duplicated
 * into a second field he would forget to update.
 */
export function parseBlocks(summary: string): PacerBlock[] {
  const blocks: PacerBlock[] = [];
  for (const raw of summary.split("\n")) {
    const match = raw.trim().match(/^(\d{1,3})\s*-\s*(\d{1,3})\s*·\s*(.+?):?$/);
    if (!match) continue;
    const from = Number(match[1]);
    const to = Number(match[2]);
    if (to <= from) continue;
    blocks.push({ from, to, title: match[3].trim() });
  }
  return blocks;
}

const clock = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

type Labels = {
  start: string;
  pause: string;
  resume: string;
  reset: string;
  idle: string;
  done: string;
  /** A function, not a string: the count is only known at tick time, and
   *  next-intl throws if you ask it to format a message without its
   *  placeholder — handing back the raw "{minutes}" is not an option. */
  remaining: (minutes: number) => string;
};

/**
 * A running clock for a live 1:1, next to the plan it belongs to.
 *
 * Teaching from a script while watching a client's screen means the pacing is
 * the first thing to go — the diagnostic eats the build time, and the close
 * gets cut, which is exactly where the commitments live. This shows which
 * block the clock says you should be in and how long is left in it, so
 * running over is a decision instead of an accident.
 */
export const ClassPacer = ({ blocks, labels }: { blocks: PacerBlock[]; labels: Labels }) => {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const minutes = seconds / 60;
  const total = blocks[blocks.length - 1]?.to ?? 0;
  const current = blocks.find((block) => minutes >= block.from && minutes < block.to);
  // Past the last block: the class is in overtime, which is worth saying.
  const overtime = !current && minutes >= total && total > 0;
  const leftInBlock = current ? Math.ceil(current.to - minutes) : 0;
  const elapsedRatio = total > 0 ? Math.min(100, (minutes / total) * 100) : 0;

  return (
    <Column
      fillWidth
      gap="12"
      padding="m"
      radius="m"
      border={running ? "brand-medium" : "neutral-medium"}
      background="surface"
    >
      <Row fillWidth gap="12" vertical="center" wrap>
        <Text
          variant="display-strong-xs"
          onBackground={overtime ? "danger-strong" : "neutral-strong"}
          style={{ fontVariantNumeric: "tabular-nums", minWidth: "4.5rem" }}
        >
          {clock(seconds)}
        </Text>

        <Column gap="2" flex={1} minWidth={10}>
          {current ? (
            <>
              <Text variant="body-strong-s" onBackground="neutral-strong">
                {current.title}
              </Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {labels.remaining(Math.max(0, leftInBlock))}
              </Text>
            </>
          ) : (
            <Text variant="body-default-s" onBackground="neutral-weak">
              {overtime ? labels.done : labels.idle}
            </Text>
          )}
        </Column>

        <Flex gap="8" style={{ flexShrink: 0 }}>
          <Button
            size="s"
            variant={running ? "secondary" : "primary"}
            prefixIcon={running ? "clock" : "playCircle"}
            onClick={() => setRunning((value) => !value)}
            className={running ? undefined : brand.signatureCta}
          >
            {running ? labels.pause : seconds > 0 ? labels.resume : labels.start}
          </Button>
          {seconds > 0 && (
            <Button
              size="s"
              variant="tertiary"
              prefixIcon="refresh"
              onClick={() => {
                setRunning(false);
                setSeconds(0);
              }}
            >
              {labels.reset}
            </Button>
          )}
        </Flex>
      </Row>

      {/* The whole session as one line: where the clock is against the plan. */}
      <Flex
        fillWidth
        radius="full"
        overflow="hidden"
        background="neutral-alpha-weak"
        style={{ height: "4px" }}
      >
        <Flex
          className={brand.progressFill}
          style={{ width: `${elapsedRatio}%`, transition: "width 1s linear" }}
        />
      </Flex>

      <Row gap="4" wrap>
        {blocks.map((block) => (
          <Tag
            key={`${block.from}-${block.title}`}
            size="s"
            variant={current === block ? "brand" : "neutral"}
            label={`${block.from}′ ${block.title}`}
          />
        ))}
      </Row>
    </Column>
  );
};
