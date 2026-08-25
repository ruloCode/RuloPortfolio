import { getLesson, getLessons, lessonsForRole } from "@/app/[locale]/dashboard/lessons";
import { MarkCompleteButton } from "@/components/dashboard/MarkCompleteButton";
import { LessonOutline, type OutlineSection } from "@/components/dashboard/LessonOutline";
import { LessonProgress } from "@/components/dashboard/LessonProgress";
import { CustomMDX, slugify } from "@/components/mdx";
import { localizeHref } from "@/i18n/routing";
import { getSessionProfile } from "@/lib/auth/session";
import { getCompletedSlugs } from "@/lib/progress";
import {
  Button,
  Column,
  Feedback,
  Flex,
  Heading,
  Icon,
  Line,
  Row,
  SmartImage,
  Tag,
  Text,
} from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface PageParams {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageParams) {
  const { locale, slug } = await params;

  const lesson = getLesson(locale, slug);
  if (!lesson) return {};
  return {
    title: lesson.metadata.title,
    description: lesson.metadata.summary,
    // Gated content must never be indexed.
    robots: { index: false, follow: false },
  };
}

export default async function LessonPage({ params }: PageParams) {
  const { locale, slug } = await params;

  setRequestLocale(locale);

  const profile = await getSessionProfile();
  const lesson = getLesson(locale, slug);
  if (!lesson) notFound();

  // Fails closed: a lesson without an explicit `waitlist` role is gated, and an
  // absent profile counts as waitlist. Written as "who is blocked" rather than
  // "who is allowed" on purpose — the previous form named `student` as the only
  // role that passes, which locked the coach out of the classes he teaches.
  const role = profile?.role ?? "waitlist";
  if (lesson.metadata.requiresRole !== "waitlist" && role === "waitlist") notFound();

  const t = await getTranslations({ locale, namespace: "dashboard" });
  // Filtered by role, not the raw list: prev/next walk this array, and an
  // unfiltered one hands someone on the waitlist a "Siguiente" button that
  // lands on a cohort class and 404s.
  const lessons = lessonsForRole(getLessons(locale), role);
  const index = lessons.findIndex((item) => item.slug === slug);
  const prev = lessons[index - 1];
  const next = lessons[index + 1];

  // Cohort classes are numbered within their own module: the coach calls this
  // "Clase 1", and "Lección 4" — its position across everything published —
  // would be a different thing than what he says out loud in the session.
  const moduleId = lesson.metadata.module ?? "semana-0";
  const numberInModule =
    lessons.filter((item) => (item.metadata.module ?? "semana-0") === moduleId).findIndex(
      (item) => item.slug === slug,
    ) + 1;
  const completed = (await getCompletedSlugs()).has(slug);

  // The class outline, read off the source rather than the rendered output:
  // this is a server component, so there is no DOM to query, and the "## "
  // lines are the same headings MDX turns into anchors.
  // Only classes with an authored deck get the button — see the presentacion
  // route, where DECKS is keyed by slug.
  const hasDeck = slug === "clase-1-tu-copiloto";

  const sections: OutlineSection[] = lesson.content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.slice(3).trim())
    .map((title) => ({ title, slug: slugify(title) }));

  return (
    // "s" rather than the blog's "xs": these lessons carry tables and prompt
    // blocks that a pure prose measure squeezes.
    <Column maxWidth="s" gap="20" fillWidth>
      <Flex>
        <Button
          href={localizeHref(locale, "/dashboard")}
          variant="tertiary"
          weight="default"
          size="s"
          prefixIcon="chevronLeft"
        >
          {t("lesson.backToOverview")}
        </Button>
      </Flex>

      <Row gap="12" vertical="center">
        <Tag
          size="s"
          variant="brand"
          label={
            moduleId === "cohorte"
              ? t("lesson.classNumber", { number: numberInModule })
              : t("lesson.number", { order: lesson.metadata.order ?? 0 })
          }
        />
        <Icon name="clock" size="xs" onBackground="neutral-weak" />
        <Text variant="label-default-s" onBackground="neutral-weak">
          {t("lesson.duration", { minutes: lesson.metadata.duration ?? 0 })}
        </Text>
      </Row>

      <Heading variant="display-strong-s">{lesson.metadata.title}</Heading>
      <Text variant="body-default-l" onBackground="neutral-medium" wrap="balance">
        {lesson.metadata.summary}
      </Text>

      {lesson.isFallback && (
        <Feedback icon variant="info" description={t("lesson.availableInEnglishOnly")} />
      )}

      {lesson.metadata.image && (
        <SmartImage
          className={brand.mediaGlow}
          src={lesson.metadata.image}
          alt={lesson.metadata.title}
          aspectRatio="16 / 9"
          radius="l"
          sizes="(max-width: 768px) 100vw, 640px"
          priority
          border="neutral-alpha-weak"
        />
      )}

      {hasDeck && (
        <Flex>
          <Button
            href={localizeHref(locale, `/dashboard/${slug}/presentacion`)}
            variant="secondary"
            size="s"
            prefixIcon="gallery"
            arrowIcon
          >
            {t("lesson.present")}
          </Button>
        </Flex>
      )}

      {sections.length > 2 && (
        <>
          <LessonProgress targetId="lesson-body" />
          <LessonOutline
            sections={sections}
            label={t("lesson.outline", { count: sections.length })}
          />
        </>
      )}

      <Column as="article" fillWidth id="lesson-body">
        <CustomMDX source={lesson.content} />
      </Column>

      <Line background="neutral-alpha-weak" />

      <Flex horizontal="center" paddingY="8">
        <MarkCompleteButton
          slug={slug}
          initialCompleted={completed}
          labels={{
            mark: t("lesson.markComplete"),
            marked: t("lesson.marked"),
            toastComplete: t("lesson.toastComplete"),
            toastIncomplete: t("lesson.toastIncomplete"),
            toastError: t("lesson.toastError"),
          }}
        />
      </Flex>

      <Row fillWidth horizontal="space-between" gap="12">
        {prev ? (
          <Button
            href={localizeHref(locale, `/dashboard/${prev.slug}`)}
            variant="secondary"
            size="s"
            prefixIcon="chevronLeft"
          >
            {t("lesson.prev")}
          </Button>
        ) : (
          <Flex />
        )}
        {next ? (
          <Button
            href={localizeHref(locale, `/dashboard/${next.slug}`)}
            variant="secondary"
            size="s"
            suffixIcon="chevronRight"
          >
            {t("lesson.next")}
          </Button>
        ) : (
          <Flex />
        )}
      </Row>
    </Column>
  );
}
