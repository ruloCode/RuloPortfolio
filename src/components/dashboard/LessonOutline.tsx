"use client";

import { Column, Row, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { useEffect, useState } from "react";

export type OutlineSection = { title: string; slug: string };

/**
 * The shape of the class before you start reading it.
 *
 * Every learning product worth copying opens with this — a list of what the
 * session covers — because "how long is this" is the first question a reader
 * has and scrolling is a terrible way to answer it. It doubles as the agenda
 * the coach walks through out loud in the first minute.
 *
 * The active row tracks the heading you are reading, so the list stays a map
 * of where you are rather than a table of contents you read once.
 */
export const LessonOutline = ({
  sections,
  label,
}: {
  sections: OutlineSection[];
  /** "En esta clase · 6 bloques" — counted and formatted on the server. */
  label: string;
}) => {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    const headings = sections
      .map((section) => document.getElementById(section.slug))
      .filter((element): element is HTMLElement => element !== null);
    if (headings.length === 0) return;

    // rootMargin pins the trigger line near the top of the viewport: without
    // it, a heading counts as "visible" while it is still at the bottom of the
    // screen and the highlight runs ahead of the reader.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSlug(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );

    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [sections]);

  return (
    <Column
      fillWidth
      gap="8"
      padding="l"
      radius="l"
      background="surface"
      border="neutral-medium"
      className={brand.panel}
    >
      <Text variant="label-default-s" onBackground="neutral-weak" marginBottom="4">
        {label}
      </Text>
      {sections.map((section, index) => {
        const active = section.slug === activeSlug;
        return (
          // A plain anchor, not Row as="a": Row types its props as a div and
          // drops href. Native anchors also give in-page jumps for free.
          <a
            key={section.slug}
            href={`#${section.slug}`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <Row gap="12" vertical="center" paddingY="2">
              <Text
                variant="label-default-s"
                onBackground={active ? "brand-strong" : "neutral-weak"}
                style={{ width: "1.25rem", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
              >
                {String(index + 1).padStart(2, "0")}
              </Text>
              <Text
                variant={active ? "body-strong-s" : "body-default-s"}
                onBackground={active ? "neutral-strong" : "neutral-medium"}
              >
                {section.title}
              </Text>
            </Row>
          </a>
        );
      })}
    </Column>
  );
};
