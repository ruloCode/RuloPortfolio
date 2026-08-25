import { getLessons } from "@/app/[locale]/dashboard/lessons";
import { NewSessionForm } from "@/components/dashboard/NewSessionForm";
import { SessionNotes } from "@/components/dashboard/SessionNotes";
import { localizeHref } from "@/i18n/routing";
import { formatDate, formatRelative, formatTime } from "@/lib/admin/format";
import { getSessions } from "@/lib/admin/sessions";
import { findPerson, getRoster } from "@/lib/admin/students";
import {
  Avatar,
  Button,
  Column,
  Feedback,
  Flex,
  Heading,
  Icon,
  Line,
  ProgressBar,
  Row,
  Tag,
  Text,
} from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageParams {
  params: { locale: string; studentId: string };
}

export async function generateMetadata({ params: { locale } }: PageParams) {
  const t = await getTranslations({ locale, namespace: "dashboard.admin" });
  return {
    title: t("detail.meta"),
    robots: { index: false, follow: false },
  };
}

const STATUS_VARIANT = {
  not_started: "neutral",
  in_progress: "warning",
  completed: "success",
} as const;

export default async function PersonDetailPage({ params: { locale, studentId } }: PageParams) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "dashboard" });
  const result = await getRoster(locale);

  // A failed read must not render as "person not found" — that sends the owner
  // hunting for a deleted account that is actually still there.
  if (!result.ok) {
    return (
      <Column gap="16" fillWidth>
        <Feedback icon variant="danger" title={t("error.title")} description={t("error.description")} />
      </Column>
    );
  }

  const person = findPerson(result.roster, studentId);
  if (!person) notFound();

  const { lessons } = result.roster;
  const student = person.student;
  const sessionsResult = await getSessions(person.email);

  const completedAt = new Map(
    (student?.completions ?? []).map((entry) => [entry.slug, entry.completedAt]),
  );
  const percent =
    student && student.total > 0 ? Math.round((student.completed / student.total) * 100) : 0;

  // Formatted here, not in the client component: Intl on the client would
  // render the visitor's timezone against the server's UTC markup.
  const dateLabels = Object.fromEntries(
    (sessionsResult.ok ? sessionsResult.sessions : []).map((session) => [
      session.id,
      session.startsAt
        ? `${formatDate(session.date, locale)} · ${formatTime(session.startsAt, locale)}`
        : formatDate(session.date, locale),
    ]),
  );
  const today = new Date().toISOString().slice(0, 10);
  // Every class the coach could attach a session to, deck or not.
  const lessonOptions = getLessons(locale).map((lesson) => ({
    slug: lesson.slug,
    title: lesson.metadata.title,
  }));

  return (
    <Column gap="20" fillWidth>
      <Flex>
        <Button
          href={localizeHref(locale, "/dashboard/admin")}
          variant="tertiary"
          weight="default"
          size="s"
          prefixIcon="chevronLeft"
        >
          {t("admin.detail.back")}
        </Button>
      </Flex>

      <Row
        fillWidth
        gap="16"
        padding="l"
        radius="l"
        background="surface"
        border="neutral-medium"
        vertical="center"
        wrap
      >
        <Avatar size="l" value={person.name.charAt(0).toUpperCase()} />
        <Column flex={1} minWidth={16} gap="4">
          <Row gap="12" vertical="center" wrap>
            <Heading variant="heading-strong-l">{person.name}</Heading>
            {student ? (
              <Tag
                size="s"
                variant={STATUS_VARIANT[student.status]}
                label={t(`admin.status.${student.status}`)}
              />
            ) : (
              <Tag size="s" variant="neutral" prefixIcon="email" label={t("admin.detail.noAccount")} />
            )}
          </Row>
          {/* A live mailto is the one action this page needs: the whole reason
              to open someone is usually to nudge them. */}
          <Flex>
            <Button
              href={`mailto:${person.email}`}
              variant="tertiary"
              weight="default"
              size="s"
              prefixIcon="email"
            >
              {person.email}
            </Button>
          </Flex>
        </Column>
      </Row>

      {student ? (
        <Row fillWidth gap="12" wrap>
          <Column
            flex={1}
            minWidth={12}
            gap="12"
            padding="16"
            radius="l"
            background="surface"
            border="neutral-medium"
            className={brand.panel}
          >
            <Row fillWidth horizontal="space-between" vertical="center">
              <Text variant="label-default-s" onBackground="neutral-weak">
                {t("admin.detail.progress")}
              </Text>
              <Text variant="body-strong-m">{percent}%</Text>
            </Row>
            <ProgressBar
              value={student.completed}
              max={student.total || 1}
              size="m"
              fillClassName={brand.progressFill}
            />
            <Text variant="body-default-s" onBackground="neutral-weak">
              {t("progress.summary", { completed: student.completed, total: student.total })}
            </Text>
          </Column>

          <Column
            flex={1}
            minWidth={12}
            gap="12"
            padding="16"
            radius="l"
            background="surface"
            border="neutral-medium"
            className={brand.panel}
          >
            <Row gap="8" vertical="center">
              <Icon name="clock" size="xs" onBackground="neutral-weak" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                {t("admin.columns.lastActivity")}
              </Text>
            </Row>
            <Text variant="body-strong-m">
              {student.lastActivityAt
                ? formatRelative(student.lastActivityAt, locale)
                : t("admin.neverActive")}
            </Text>
            <Line background="neutral-alpha-weak" />
            <Row gap="8" vertical="center">
              <Icon name="calendar" size="xs" onBackground="neutral-weak" />
              <Text variant="body-default-s" onBackground="neutral-weak">
                {t("admin.detail.joined", { date: formatDate(student.joinedAt, locale) })}
              </Text>
            </Row>
          </Column>
        </Row>
      ) : (
        <Feedback
          icon
          variant="info"
          title={t("admin.detail.noAccountTitle")}
          description={t("admin.detail.noAccountDescription")}
        />
      )}

      {/* Sessions come before the lesson checklist: for anyone being coached
          1:1, what was said last time outranks which MDX they ticked. */}
      <Column fillWidth gap="12">
        <Row fillWidth gap="12" vertical="center" wrap>
          <Heading variant="heading-strong-m">{t("admin.sessions.title")}</Heading>
          <Flex flex={1} />
          <NewSessionForm email={person.email} today={today} lessons={lessonOptions} />
        </Row>

        {!sessionsResult.ok ? (
          <Feedback icon variant="danger" description={t("admin.sessions.readError")} />
        ) : sessionsResult.sessions.length === 0 ? (
          <Column
            gap="8"
            horizontal="center"
            align="center"
            paddingY="l"
            fillWidth
            radius="l"
            background="surface"
            border="neutral-medium"
            borderStyle="dashed"
          >
            <Icon name="book" onBackground="neutral-weak" />
            <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
              {t("admin.sessions.empty")}
            </Text>
          </Column>
        ) : (
          <SessionNotes sessions={sessionsResult.sessions} dateLabels={dateLabels} />
        )}
      </Column>

      {student && (
        <Column fillWidth gap="12">
          <Heading variant="heading-strong-m">{t("admin.detail.lessons")}</Heading>
          <Column fillWidth radius="l" background="surface" border="neutral-medium" overflow="hidden">
            {lessons.map((lesson, index) => {
              const done = completedAt.get(lesson.slug);

              return (
                <Row
                  key={lesson.slug}
                  fillWidth
                  gap="12"
                  paddingX="16"
                  paddingY="12"
                  vertical="center"
                  borderTop={index === 0 ? undefined : "neutral-alpha-weak"}
                >
                  <Flex
                    width="24"
                    height="24"
                    horizontal="center"
                    vertical="center"
                    style={{ flexShrink: 0 }}
                  >
                    {done ? (
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
                          {lesson.order}
                        </Text>
                      </Flex>
                    )}
                  </Flex>
                  <Column flex={1} minWidth="0" gap="2">
                    <Text variant="body-strong-s">{lesson.title}</Text>
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      {done
                        ? t("admin.detail.completedOn", { date: formatDate(done, locale) })
                        : t("admin.detail.pending")}
                    </Text>
                  </Column>
                </Row>
              );
            })}
          </Column>
        </Column>
      )}
    </Column>
  );
}
