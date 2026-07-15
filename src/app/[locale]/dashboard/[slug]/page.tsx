import { getLesson, getLessons } from "@/app/[locale]/dashboard/lessons";
import { MarkCompleteButton } from "@/components/dashboard/MarkCompleteButton";
import { CustomMDX } from "@/components/mdx";
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
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

interface PageParams {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params: { locale, slug } }: PageParams) {
  const lesson = getLesson(locale, slug);
  if (!lesson) return {};
  return {
    title: lesson.metadata.title,
    description: lesson.metadata.summary,
    // Gated content must never be indexed.
    robots: { index: false, follow: false },
  };
}

export default async function LessonPage({ params: { locale, slug } }: PageParams) {
  unstable_setRequestLocale(locale);

  const profile = await getSessionProfile();
  const lesson = getLesson(locale, slug);
  if (!lesson) notFound();

  // Fails closed: a lesson without an explicit `waitlist` role is student-only.
  if (lesson.metadata.requiresRole !== "waitlist" && profile?.role !== "student") notFound();

  const t = await getTranslations({ locale, namespace: "dashboard" });
  const lessons = getLessons(locale);
  const index = lessons.findIndex((item) => item.slug === slug);
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const completed = (await getCompletedSlugs()).has(slug);

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
        <Tag size="s" variant="brand" label={t("lesson.number", { order: lesson.metadata.order ?? 0 })} />
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

      <Column as="article" fillWidth>
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
