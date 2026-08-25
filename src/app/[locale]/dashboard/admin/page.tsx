import { PendingSignups } from "@/components/dashboard/PendingSignups";
import { StatTile } from "@/components/dashboard/StatTile";
import { StudentRoster, type StudentView } from "@/components/dashboard/StudentRoster";
import { localizeHref } from "@/i18n/routing";
import { getOpenActionCounts } from "@/lib/admin/sessions";
import { getRoster } from "@/lib/admin/students";
import { formatRelative } from "@/lib/admin/format";
import { Column, Feedback, Heading, Icon, RevealFx, Row, Text } from "@/once-ui/components";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

interface PageParams {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: PageParams) {
  const t = await getTranslations({ locale, namespace: "dashboard.admin" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    robots: { index: false, follow: false },
  };
}

export default async function AdminPage({ params: { locale } }: PageParams) {
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "dashboard" });
  const [result, openActions] = await Promise.all([getRoster(locale), getOpenActionCounts()]);

  // An empty roster and a broken one look identical on screen, and the owner
  // would act on the difference. Say which one it is.
  if (!result.ok) {
    return (
      <Column gap="16" fillWidth>
        <Heading variant="display-strong-s">{t("admin.title")}</Heading>
        <Feedback icon variant="danger" title={t("error.title")} description={t("error.description")} />
      </Column>
    );
  }

  // "Finished" is deliberately not a tile: average progress already carries it,
  // and open action items are the number that actually changes what you do next.
  const { students, pending, averageCompletion } = result.roster;

  const pendingRows = pending.map((signup) => ({
    id: signup.id,
    email: signup.email,
    name: signup.fullName || signup.email.split("@")[0],
    joinedLabel: formatRelative(signup.joinedAt, locale),
    welcomeSent: signup.welcomeEmailSentAt !== null,
    openActions: openActions[signup.email.toLowerCase()] ?? 0,
  }));

  const totalOpenActions = Object.values(openActions).reduce((sum, count) => sum + count, 0);

  const rows: StudentView[] = students.map((student) => ({
    id: student.id,
    name: student.fullName || student.email.split("@")[0],
    email: student.email,
    completed: student.completed,
    total: student.total,
    status: student.status,
    lastActivityLabel: student.lastActivityAt
      ? formatRelative(student.lastActivityAt, locale)
      : t("admin.neverActive"),
    openActions: openActions[student.email.toLowerCase()] ?? 0,
  }));

  return (
    <Column gap="xl" fillWidth>
      <RevealFx translateY="4">
        <Column gap="8">
          <Row gap="12" vertical="center">
            <Icon name="team" onBackground="brand-weak" />
            <Heading variant="display-strong-s">{t("admin.title")}</Heading>
          </Row>
          <Text variant="body-default-l" onBackground="neutral-medium" wrap="balance">
            {t("admin.subtitle")}
          </Text>
        </Column>
      </RevealFx>

      <Row fillWidth gap="12" wrap>
        <StatTile
          icon="person"
          label={t("admin.stats.students.label")}
          value={String(students.length)}
          hint={t("admin.stats.students.hint")}
        />
        <StatTile
          icon="chartUp"
          label={t("admin.stats.completion.label")}
          value={`${averageCompletion}%`}
          hint={t("admin.stats.completion.hint")}
        />
        <StatTile
          icon="check"
          label={t("admin.stats.openActions.label")}
          value={String(totalOpenActions)}
          hint={t("admin.stats.openActions.hint")}
        />
        <StatTile
          icon="email"
          label={t("admin.stats.pending.label")}
          value={String(pending.length)}
          hint={t("admin.stats.pending.hint")}
        />
      </Row>

      {students.length === 0 ? (
        <Column
          gap="12"
          horizontal="center"
          align="center"
          paddingY="xl"
          fillWidth
          radius="l"
          background="surface"
          border="neutral-medium"
          borderStyle="dashed"
        >
          <Icon name="team" size="l" onBackground="neutral-weak" />
          <Heading variant="heading-strong-m">{t("admin.empty.title")}</Heading>
          <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
            {t("admin.empty.description")}
          </Text>
        </Column>
      ) : (
        <StudentRoster students={rows} basePath={localizeHref(locale, "/dashboard/admin")} />
      )}

      {pendingRows.length > 0 && (
        <PendingSignups
          signups={pendingRows}
          basePath={localizeHref(locale, "/dashboard/admin")}
          copy={{
            title: t("admin.pending.title"),
            description: t("admin.pending.description"),
            joined: t("admin.columns.joined"),
            welcomeSent: t("admin.pending.welcomeSent"),
            welcomeMissing: t("admin.pending.welcomeMissing"),
            nudge: t("admin.pending.nudge"),
            nudgeSubject: t("admin.pending.nudgeSubject"),
            openActions: (count) => t("admin.openActions", { count }),
          }}
        />
      )}
    </Column>
  );
}
