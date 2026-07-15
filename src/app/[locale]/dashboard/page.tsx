import { getLessons, lessonsForRole } from "@/app/[locale]/dashboard/lessons";
import { scheduling } from "@/app/resources";
import { LessonRow } from "@/components/dashboard/LessonRow";
import { localizeHref } from "@/i18n/routing";
import { getSessionProfile } from "@/lib/auth/session";
import { getCompletedSlugs } from "@/lib/progress";
import {
  Button,
  Column,
  Flex,
  Heading,
  Icon,
  ProgressBar,
  RevealFx,
  Row,
  Tag,
  Text,
} from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

// Reads the session, so it must never be prerendered — the parent [locale]
// layout's generateStaticParams would otherwise pull it into the static build,
// where there is no session and every visitor gets a build-time redirect.
export const dynamic = "force-dynamic";

interface PageParams {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: PageParams) {
  const t = await getTranslations({ locale, namespace: "dashboard.meta" });
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

export default async function DashboardPage({ params: { locale } }: PageParams) {
  unstable_setRequestLocale(locale);

  const profile = await getSessionProfile();
  const t = await getTranslations({ locale, namespace: "dashboard" });

  const lessons = lessonsForRole(getLessons(locale), profile?.role ?? "waitlist");
  const completed = await getCompletedSlugs();
  const done = lessons.filter((lesson) => completed.has(lesson.slug)).length;
  const allDone = lessons.length > 0 && done === lessons.length;
  const name = profile?.fullName || profile?.email?.split("@")[0] || "";

  if (lessons.length === 0) {
    return (
      <Column gap="16" horizontal="center" align="center" paddingY="xl" fillWidth>
        <Icon name="book" size="l" onBackground="neutral-weak" />
        <Heading variant="heading-strong-m">{t("empty.title")}</Heading>
        <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
          {t("empty.description")}
        </Text>
        <Button variant="secondary" size="s" href={localizeHref(locale, "/ia")}>
          {t("modules.cohorte.cta")}
        </Button>
      </Column>
    );
  }

  return (
    <Column gap="xl" fillWidth>
      <RevealFx translateY="4">
        <Column gap="8">
          <Heading variant="display-strong-s">{t("greeting.title", { name })}</Heading>
          <Text variant="body-default-l" onBackground="neutral-medium" wrap="balance">
            {allDone ? t("greeting.subtitleDone") : t("greeting.subtitle")}
          </Text>
        </Column>
      </RevealFx>

      <Column
        fillWidth
        gap="16"
        padding="l"
        radius="l"
        background="surface"
        border="neutral-medium"
      >
        <Row fillWidth horizontal="space-between" vertical="center">
          <Text variant="label-default-s" onBackground="neutral-weak">
            {t("progress.label")}
          </Text>
          <Text variant="body-strong-m">{Math.round((done / lessons.length) * 100)}%</Text>
        </Row>
        <ProgressBar value={done} max={lessons.length} size="m" fillClassName={brand.progressFill} />
        <Text variant="body-default-s" onBackground="neutral-weak">
          {t("progress.summary", { completed: done, total: lessons.length })}
        </Text>
      </Column>

      <Column fillWidth gap="16">
        <Row gap="12" vertical="center">
          <Icon name="rocket" onBackground="brand-weak" />
          <Heading variant="heading-strong-m">{t("modules.semana0.title")}</Heading>
          <Tag size="s" variant="brand" label={t("modules.semana0.badge")} />
        </Row>
        <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
          {t("modules.semana0.description")}
        </Text>
        {lessons.map((lesson) => (
          <LessonRow
            key={lesson.slug}
            href={localizeHref(locale, `/dashboard/${lesson.slug}`)}
            order={lesson.metadata.order ?? 0}
            title={lesson.metadata.title}
            summary={lesson.metadata.summary}
            duration={lesson.metadata.duration}
            image={lesson.metadata.image}
            completed={completed.has(lesson.slug)}
            durationLabel={t("lesson.duration", { minutes: lesson.metadata.duration ?? 0 })}
          />
        ))}
      </Column>

      {/* The 1:1 is what the program is built around, so it gets the signature
          halo — the only conversion moment on this page. */}
      <Column
        fillWidth
        gap="12"
        padding="l"
        radius="l"
        background="surface"
        border="neutral-medium"
        className={brand.signatureGlow}
      >
        <Text variant="label-default-s" onBackground="brand-weak">
          {t("oneOnOne.eyebrow")}
        </Text>
        <Heading variant="heading-strong-l" wrap="balance">
          {t("oneOnOne.title")}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-medium" wrap="balance">
          {t("oneOnOne.description")}
        </Text>
        <Flex gap="12" vertical="center" wrap paddingTop="4">
          <Button
            href={scheduling.oneOnOne}
            size="m"
            arrowIcon
            prefixIcon="calendar"
            className={brand.signatureCta}
          >
            {t("oneOnOne.cta")}
          </Button>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {t("oneOnOne.note")}
          </Text>
        </Flex>
      </Column>

      <Column
        fillWidth
        gap="12"
        padding="l"
        radius="l"
        background="surface"
        border="neutral-medium"
        borderStyle="dashed"
        style={{ opacity: 0.8 }}
      >
        <Row gap="12" vertical="center">
          <Icon name="lock" onBackground="neutral-weak" />
          <Heading variant="heading-strong-m" onBackground="neutral-weak">
            {t("modules.cohorte.title")}
          </Heading>
          <Tag size="s" variant="neutral" prefixIcon="lock" label={t("modules.cohorte.badge")} />
        </Row>
        <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
          {t("modules.cohorte.description")}
        </Text>
        <Flex>
          <Button variant="secondary" size="s" suffixIcon="arrowRight" href={localizeHref(locale, "/ia")}>
            {t("modules.cohorte.cta")}
          </Button>
        </Flex>
      </Column>
    </Column>
  );
}
