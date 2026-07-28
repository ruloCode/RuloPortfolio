"use client";

import styles from "@/components/dashboard/StudentRoster.module.scss";
import type { StudentStatus } from "@/lib/admin/students";
import {
  Avatar,
  Column,
  Flex,
  Icon,
  Input,
  ProgressBar,
  Row,
  SegmentedControl,
  SmartLink,
  Tag,
  Text,
} from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

/**
 * Dates arrive pre-formatted from the server. Formatting them here would render
 * UTC on the server and the visitor's zone on the client, and React would throw
 * a hydration mismatch on every row.
 */
export type StudentView = {
  id: string;
  name: string;
  email: string;
  completed: number;
  total: number;
  status: StudentStatus;
  lastActivityLabel: string;
  /** Open action items from 1:1 sessions. The column that answers "who is
   *  waiting on me, and who am I waiting on" without opening every row. */
  openActions: number;
};

type Filter = "all" | StudentStatus;

const FILTERS: Filter[] = ["all", "not_started", "in_progress", "completed"];

const STATUS_VARIANT: Record<StudentStatus, "neutral" | "warning" | "success"> = {
  not_started: "neutral",
  in_progress: "warning",
  completed: "success",
};

export const StudentRoster = ({
  students,
  basePath,
}: {
  students: StudentView[];
  basePath: string;
}) => {
  // Copy is read here rather than passed down: the counter and the empty state
  // change with client-side filtering, so the strings have to live client-side
  // too. NextIntlClientProvider already ships these messages.
  const t = useTranslations("dashboard.admin");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return students.filter((student) => {
      if (filter !== "all" && student.status !== filter) return false;
      if (!needle) return true;
      return (
        student.name.toLowerCase().includes(needle) || student.email.toLowerCase().includes(needle)
      );
    });
  }, [students, query, filter]);

  return (
    <Column fillWidth gap="16">
      <Row fillWidth gap="12" vertical="center" wrap>
        <Flex flex={1} minWidth={16}>
          <Input
            id="student-search"
            label={t("search.label")}
            labelAsPlaceholder
            height="s"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            hasPrefix={<Icon name="search" size="xs" onBackground="neutral-weak" />}
          />
        </Flex>
        {/* Wrapped because SegmentedControl's inner Scroller is always 100%
            wide: left as a direct flex child it swallows the row and pushes
            the search box onto its own line. */}
        <Flex style={{ flexShrink: 0 }}>
          <SegmentedControl
            selected={filter}
            onToggle={(value) => setFilter(value as Filter)}
            buttons={FILTERS.map((value) => ({ value, label: t(`filters.${value}`), size: "s" }))}
          />
        </Flex>
      </Row>

      <Column fillWidth radius="l" background="surface" border="neutral-medium" overflow="hidden">
        {/* Presentational only. The rows below are links, not cells, so real
            table semantics would promise navigation this markup can't deliver. */}
        <Row
          fillWidth
          paddingX="16"
          paddingY="12"
          borderBottom="neutral-medium"
          className={`${styles.grid} ${styles.header}`}
          aria-hidden="true"
        >
          <Text variant="label-default-s" onBackground="neutral-weak" className={styles.student}>
            {t("columns.student")}
          </Text>
          <Text variant="label-default-s" onBackground="neutral-weak" className={styles.status}>
            {t("columns.status")}
          </Text>
          <Text variant="label-default-s" onBackground="neutral-weak" className={styles.progress}>
            {t("columns.progress")}
          </Text>
          <Text variant="label-default-s" onBackground="neutral-weak" className={styles.last}>
            {t("columns.lastActivity")}
          </Text>
          <Text variant="label-default-s" onBackground="neutral-weak" className={styles.joined}>
            {t("columns.openActions")}
          </Text>
          <Flex className={styles.chevron} />
        </Row>

        {visible.length === 0 ? (
          <Column paddingX="16" paddingY="xl" gap="8" horizontal="center" align="center">
            <Icon name="search" onBackground="neutral-weak" />
            <Text variant="body-default-s" onBackground="neutral-weak">
              {t("noResults")}
            </Text>
          </Column>
        ) : (
          visible.map((student, index) => {
            const percent =
              student.total > 0 ? Math.round((student.completed / student.total) * 100) : 0;

            return (
              <SmartLink key={student.id} unstyled fillWidth href={`${basePath}/${student.id}`}>
                <Row
                  fillWidth
                  paddingX="16"
                  paddingY="12"
                  borderTop={index === 0 ? undefined : "neutral-alpha-weak"}
                  className={`${styles.grid} ${brand.card}`}
                >
                  <Row gap="12" vertical="center" minWidth="0" className={styles.student}>
                    <Avatar size="s" value={student.name.charAt(0).toUpperCase()} />
                    <Column gap="2" minWidth="0">
                      <Text variant="body-strong-s" onBackground="neutral-strong">
                        {student.name}
                      </Text>
                      <Text
                        variant="body-default-xs"
                        onBackground="neutral-weak"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {student.email}
                      </Text>
                    </Column>
                  </Row>

                  <Flex className={styles.status}>
                    <Tag
                      size="s"
                      variant={STATUS_VARIANT[student.status]}
                      label={t(`status.${student.status}`)}
                    />
                  </Flex>

                  <Row gap="8" vertical="center" className={styles.progress}>
                    {/* Hidden from AT: the "42%" beside it already states the
                        value, and a nested progressbar role only pads the
                        link's accessible name with a stray number. */}
                    <ProgressBar
                      value={student.completed}
                      max={student.total || 1}
                      size="s"
                      fillClassName={brand.progressFill}
                      aria-hidden="true"
                    />
                    <Text
                      variant="label-default-s"
                      onBackground="neutral-medium"
                      style={{ flexShrink: 0, minWidth: "2.5rem", textAlign: "right" }}
                    >
                      {percent}%
                    </Text>
                  </Row>

                  <Text
                    variant="body-default-xs"
                    onBackground="neutral-weak"
                    className={styles.last}
                  >
                    <span className={styles.inlineLabel}>{t("columns.lastActivity")}: </span>
                    {student.lastActivityLabel}
                  </Text>

                  <Flex className={styles.joined}>
                    {student.openActions > 0 ? (
                      <Tag
                        size="s"
                        variant="warning"
                        label={t("openActions", { count: student.openActions })}
                      />
                    ) : (
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        —
                      </Text>
                    )}
                  </Flex>

                  <Icon
                    name="chevronRight"
                    size="xs"
                    onBackground="neutral-weak"
                    className={styles.chevron}
                  />
                </Row>
              </SmartLink>
            );
          })
        )}
      </Column>

      <Text variant="body-default-xs" onBackground="neutral-weak" aria-live="polite">
        {t("count", { shown: visible.length, total: students.length })}
      </Text>
    </Column>
  );
};
