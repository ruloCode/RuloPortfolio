"use client";

import { createSession } from "@/app/[locale]/dashboard/admin/actions";
import {
  Button,
  Column,
  Flex,
  Input,
  Row,
  SegmentedControl,
  Text,
  Textarea,
  useToast,
} from "@/once-ui/components";
import { useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";

/**
 * Collapsed by default: the page's job is reading history, and a permanently
 * open five-field form would push that history below the fold.
 */
export const NewSessionForm = ({
  email,
  today,
  lessons,
}: {
  email: string;
  today: string;
  /** Published classes, for the slug picker. */
  lessons: { slug: string; title: string }[];
}) => {
  const t = useTranslations("dashboard.admin.sessions.form");
  const [open, setOpen] = useState(false);
  // Controlled on purpose: Input floats its label off `props.value` alone, so
  // an uncontrolled defaultValue leaves "Fecha" sitting on top of the date.
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState<"planned" | "held">("held");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { addToast } = useToast();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createSession(formData);
      if (!result.ok) {
        addToast({
          variant: "danger",
          message:
            result.error === "invalid"
              ? t("invalid")
              : result.error === "invalidTime"
                ? t("invalidTime")
                : result.error === "invalidUrl"
                  ? t("invalidUrl")
                  : t("error"),
        });
        return;
      }
      formRef.current?.reset();
      setDate(today); // reset() cannot clear a controlled field
      setOpen(false);
      addToast({ variant: "success", message: t("saved") });
    });
  };

  if (!open) {
    return (
      <Flex>
        <Button variant="secondary" size="s" prefixIcon="plus" onClick={() => setOpen(true)}>
          {t("open")}
        </Button>
      </Flex>
    );
  }

  return (
    // A native <form> wrapper: Once UI's Column forwards its ref as
    // HTMLDivElement, so `as="form"` plus a form ref does not typecheck.
    <form ref={formRef} onSubmit={onSubmit} style={{ width: "100%" }}>
      <Column
        fillWidth
        gap="16"
        padding="l"
        radius="l"
        background="surface"
        border="brand-medium"
      >
        <input type="hidden" name="email" value={email} />
        {/* SegmentedControl is not a form control, so the value rides along in
            a hidden input rather than being read off the DOM. */}
        <input type="hidden" name="status" value={status} />

        <Row fillWidth>
          <Flex style={{ flexShrink: 0 }}>
            <SegmentedControl
              selected={status}
              onToggle={(value) => setStatus(value as "planned" | "held")}
              // type="button" is load-bearing: Once UI renders a bare <button>,
              // which defaults to type="submit" inside a form — so picking a
              // segment used to try to save the session and pop the browser's
              // "please fill in this field" on the empty title.
              buttons={[
                { value: "held", label: t("statusHeld"), size: "s", type: "button" },
                { value: "planned", label: t("statusPlanned"), size: "s", type: "button" },
              ]}
            />
          </Flex>
        </Row>

        <Row fillWidth gap="12" wrap>
          <Flex flex={1} minWidth={10}>
            {/* type="date" over Once UI's DateInput: this is a form post, and a
                native date field submits a clean YYYY-MM-DD with no extra state. */}
            <Input
              id="session-date"
              name="date"
              label={t("date")}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </Flex>
          <Flex flex={2} minWidth={14}>
            <Input id="session-title" name="title" label={t("title")} required />
          </Flex>
        </Row>

        {/* Grouped and shown only on a plan: these are the only three fields
            on this form the student will ever read, and the boundary between
            "my notes" and "her card" has to be visible while typing, not
            discovered afterwards. Unmounted rather than hidden, so a note about
            a class that already happened cannot carry a join link. */}
        {status === "planned" && (
          <Column fillWidth gap="16" padding="m" radius="m" border="brand-medium">
            <Row fillWidth gap="12" wrap>
              <Flex flex={1} minWidth={8}>
                {/* A text field, not type="time": Once UI floats its label off
                    the value, so an empty native time input would sit with its
                    label on top of the browser's own "--:--". The server
                    validates the format and rejects a typo rather than
                    silently saving no hour at all. */}
                <Input
                  id="session-start-time"
                  name="startTime"
                  label={t("startTime")}
                  description={t("startTimeHint")}
                  inputMode="numeric"
                />
              </Flex>
              <Flex flex={2} minWidth={14}>
                {/* No placeholder on purpose: the label only floats once the
                    field is filled, so placeholder text would render behind it. */}
                <Input
                  id="session-meeting-url"
                  name="meetingUrl"
                  label={t("meetingUrl")}
                  type="url"
                />
              </Flex>
            </Row>
            <Textarea
              id="session-prep-note"
              name="prepNote"
              label={t("prepNote")}
              description={t("prepHint")}
              lines={3}
            />
            {/* A datalist, not a select: the coach can type a slug that is not
                published yet, and an unknown one simply renders no button. */}
            <Input
              id="session-lesson"
              name="lessonSlug"
              label={t("lessonSlug")}
              description={t("lessonHint")}
              list="session-lesson-options"
            />
            <datalist id="session-lesson-options">
              {lessons.map((lesson) => (
                <option key={lesson.slug} value={lesson.slug}>
                  {lesson.title}
                </option>
              ))}
            </datalist>
          </Column>
        )}

        <Textarea
          id="session-summary"
          name="summary"
          label={t("summary")}
          description={t("summaryHint")}
          lines={10}
        />

        <Row fillWidth gap="12" wrap>
          <Flex flex={1} minWidth={14}>
            <Textarea
              id="session-coach-actions"
              name="coachActions"
              label={t("coachActions")}
              description={t("onePerLine")}
              lines={4}
            />
          </Flex>
          <Flex flex={1} minWidth={14}>
            <Textarea
              id="session-student-actions"
              name="studentActions"
              label={t("studentActions")}
              description={t("onePerLine")}
              lines={4}
            />
          </Flex>
        </Row>

        <Row gap="12" vertical="center" wrap>
          <Button type="submit" size="s" disabled={isPending} prefixIcon="check">
            {isPending ? t("saving") : t("save")}
          </Button>
          <Button
            type="button"
            variant="tertiary"
            size="s"
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            {t("cancel")}
          </Button>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {t("privacy")}
          </Text>
        </Row>
      </Column>
    </form>
  );
};
