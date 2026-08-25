import { getLessons, lessonsForRole } from "@/app/[locale]/dashboard/lessons";
import { scheduling } from "@/app/resources";
import { BuyCohortButton } from "@/components/dashboard/BuyCohortButton";
import { LessonRow } from "@/components/dashboard/LessonRow";
import { NextSessionCard } from "@/components/dashboard/NextSessionCard";
import { PaymentReturnNotice } from "@/components/dashboard/PaymentReturnNotice";
import { localizeHref } from "@/i18n/routing";
import { getSessionProfile } from "@/lib/auth/session";
import { getCompletedSlugs } from "@/lib/progress";
import { getUpcomingSession } from "@/lib/sessions";
import {
  Button,
  Column,
  Feedback,
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
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

// Reads the session, so it must never be prerendered — the parent [locale]
// layout's generateStaticParams would otherwise pull it into the static build,
// where there is no session and every visitor gets a build-time redirect.
export const dynamic = "force-dynamic";

interface PageParams {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageParams) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: "dashboard.meta" });
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

export default async function DashboardPage({ params }: PageParams) {
  const { locale } = await params;

  setRequestLocale(locale);

  const profile = await getSessionProfile();
  const t = await getTranslations({ locale, namespace: "dashboard" });

  const lessons = lessonsForRole(getLessons(locale), profile?.role ?? "waitlist");
  // Independent reads: serialising them would add a round-trip to the one page
  // every student lands on.
  const [completed, upcoming] = await Promise.all([getCompletedSlugs(), getUpcomingSession()]);
  // Split by module rather than rendering one flat list: a cohort class landing
  // in the Semana 0 block would arrive wearing its "Gratis" badge, and the
  // progress bar would read "0 de 4" the day a paid class is published.
  const semana0 = lessons.filter((lesson) => (lesson.metadata.module ?? "semana-0") === "semana-0");
  const cohorte = lessons.filter((lesson) => lesson.metadata.module === "cohorte");
  const done = semana0.filter((lesson) => completed.has(lesson.slug)).length;
  const allDone = semana0.length > 0 && done === semana0.length;
  const name = profile?.fullName || profile?.email?.split("@")[0] || "";
  // A class is one moment for both of us, so it renders in Bogota time for
  // everyone rather than in each visitor's zone — see scheduling.timeZone.
  const sessionWhen = upcoming
    ? new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: scheduling.timeZone,
        ...(upcoming.startsAt ? { hour: "numeric", minute: "2-digit" } : {}),
      }).format(
        // Noon UTC for the date-only case: parsed at midnight, a bare date
        // lands on the previous day in every zone west of UTC — including this
        // one, which would print the class a day early.
        new Date(upcoming.startsAt ?? `${upcoming.date}T12:00:00Z`),
      )
    : null;
  // en-CA is the shortest way to ask Intl for a YYYY-MM-DD in a given zone,
  // which is the format session_date already speaks.
  const isToday =
    upcoming?.date ===
    new Intl.DateTimeFormat("en-CA", { timeZone: scheduling.timeZone }).format(new Date());

  // The one thing the cohort block branches on. 'student' and 'admin' are
  // already entitled, so there is nothing to sell them — and nothing to
  // confirm on return from checkout either.
  const isWaitlist = (profile?.role ?? "waitlist") === "waitlist";

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

      {/* The coach lands on the student home too — same route, same shell — and
          during a screen-shared class that ambiguity is expensive. Say it once,
          at the top, with the way out. */}
      {profile?.role === "admin" && (
        <Feedback
          icon
          variant="info"
          title={t("coachView.title")}
          description={t("coachView.description")}
          actionButtonProps={{
            label: t("coachView.cta"),
            href: localizeHref(locale, "/dashboard/admin"),
            variant: "secondary",
            size: "s",
          }}
        />
      )}

      {/* Above everything, including her progress: for someone with a class on
          the calendar, "when do we meet" outranks "how far along am I". */}
      {upcoming && sessionWhen && (
        <RevealFx translateY="8" delay={0.05}>
          <NextSessionCard
            title={upcoming.title}
            meetingUrl={upcoming.meetingUrl}
            deckHref={
              upcoming.lessonSlug
                ? localizeHref(locale, `/dashboard/${upcoming.lessonSlug}/presentacion`)
                : null
            }
            prep={upcoming.prep}
            labels={{
              eyebrow: t("nextSession.eyebrow"),
              when: t("nextSession.when", { when: sessionWhen }),
              join: t("nextSession.join"),
              noLink: t("nextSession.noLink"),
              prepTitle: t("nextSession.prepTitle"),
              today: isToday ? t("nextSession.today") : undefined,
              deck: t("nextSession.deck"),
            }}
          />
        </RevealFx>
      )}

      {/* Only while still unentitled: the render that grants access is the one
          that unmounts this. Suspense because useSearchParams needs a boundary
          — this page is force-dynamic, but the boundary costs nothing and
          keeps it correct if that ever changes. */}
      {isWaitlist && (
        <Suspense fallback={null}>
          <PaymentReturnNotice
            labels={{
              confirmingTitle: t("payment.confirmingTitle"),
              confirmingBody: t("payment.confirmingBody"),
              slowTitle: t("payment.slowTitle"),
              slowBody: t("payment.slowBody"),
            }}
          />
        </Suspense>
      )}

      {/* Guarded: the day Semana 0 is retired, this block would divide by zero
          and render "NaN%" rather than simply not existing. */}
      {semana0.length > 0 && (
        <Column
          fillWidth
          gap="16"
          padding="l"
          radius="l"
          background="surface"
          border="neutral-medium"
          className={brand.panel}
        >
          <Row fillWidth horizontal="space-between" vertical="center">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {t("progress.label")}
            </Text>
            <Text variant="body-strong-m">{Math.round((done / semana0.length) * 100)}%</Text>
          </Row>
          <ProgressBar
            value={done}
            max={semana0.length}
            size="m"
            fillClassName={brand.progressFill}
          />
          <Text variant="body-default-s" onBackground="neutral-weak">
            {t("progress.summary", { completed: done, total: semana0.length })}
          </Text>
        </Column>
      )}

      {semana0.length > 0 && (
        <Column fillWidth gap="16">
          <Row gap="12" vertical="center">
            <Icon name="rocket" onBackground="brand-weak" />
            <Heading variant="heading-strong-m">{t("modules.semana0.title")}</Heading>
            <Tag size="s" variant="brand" label={t("modules.semana0.badge")} />
          </Row>
          <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
            {t("modules.semana0.description")}
          </Text>
          {semana0.map((lesson) => (
            <LessonRow
              key={lesson.slug}
              href={localizeHref(locale, `/dashboard/${lesson.slug}`)}
              order={lesson.metadata.order ?? 0}
              title={lesson.metadata.title}
              summary={lesson.metadata.summary}
              duration={lesson.metadata.duration}
              image={lesson.metadata.image}
              completed={completed.has(lesson.slug)}
              durationLabel={t("lesson.duration", {
                minutes: lesson.metadata.duration ?? 0,
              })}
            />
          ))}
        </Column>
      )}

      {/* The 1:1 is what the program is built around, so it keeps the signature
          halo — but only while there is nothing booked. Asking someone to
          schedule the session she already has on her calendar is the loudest
          way to tell her the product does not know who she is. */}
      {!upcoming && (
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
      )}

      {/* The cohort block is the padlock or the checkout, never both. For a
          waitlist user it is the only paid thing on the page, so it carries
          brand borders; entitled users keep the original "not published yet"
          state, because no lesson declares `module: cohorte` yet. */}
      {isWaitlist ? (
        <Column
          fillWidth
          gap="12"
          padding="l"
          radius="l"
          background="surface"
          border="brand-medium"
          className={brand.signatureGlow}
        >
          <Text variant="label-default-s" onBackground="brand-weak">
            {t("modules.cohorte.buy.eyebrow")}
          </Text>
          <Heading variant="heading-strong-l" wrap="balance">
            {t("modules.cohorte.buy.title")}
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-medium" wrap="balance">
            {t("modules.cohorte.buy.description")}
          </Text>
          <Flex gap="12" vertical="center" wrap paddingTop="4">
            <BuyCohortButton
              labels={{
                cta: t("modules.cohorte.buy.cta"),
                loading: t("modules.cohorte.buy.loading"),
                error: t("modules.cohorte.buy.error"),
              }}
            />
            <Text variant="label-default-s" onBackground="neutral-weak">
              {t("modules.cohorte.buy.note")}
            </Text>
          </Flex>
        </Column>
      ) : (
        <Column
          fillWidth
          gap="12"
          padding="l"
          radius="l"
          background="surface"
          border="neutral-medium"
          className={brand.panel}
        >
          <Row gap="12" vertical="center">
            <Icon name="graduationCap" onBackground="brand-weak" />
            <Heading variant="heading-strong-m">{t("modules.cohorte.active.title")}</Heading>
            <Tag size="s" variant="brand" label={t("modules.cohorte.active.badge")} />
          </Row>
          <Text variant="body-default-m" onBackground="neutral-medium" wrap="balance">
            {t("modules.cohorte.active.description")}
          </Text>
          {/* Published classes live inside the cohort card, not in their own
              section: while there is one class the list would be a heading with
              a single row under it. */}
          {cohorte.map((lesson, index) => (
            <LessonRow
              key={lesson.slug}
              href={localizeHref(locale, `/dashboard/${lesson.slug}`)}
              // Numbered within the module, like the lesson page does: `order`
              // is its rank across everything published, so class 1 would wear
              // a 4 — the three Semana 0 lessons come before it.
              order={index + 1}
              title={lesson.metadata.title}
              summary={lesson.metadata.summary}
              duration={lesson.metadata.duration}
              image={lesson.metadata.image}
              completed={completed.has(lesson.slug)}
              durationLabel={t("lesson.duration", {
                minutes: lesson.metadata.duration ?? 0,
              })}
            />
          ))}
        </Column>
      )}
    </Column>
  );
}
