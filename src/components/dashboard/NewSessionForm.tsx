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
export const NewSessionForm = ({ email, today }: { email: string; today: string }) => {
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
          message: result.error === "invalid" ? t("invalid") : t("error"),
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
              buttons={[
                { value: "held", label: t("statusHeld"), size: "s" },
                { value: "planned", label: t("statusPlanned"), size: "s" },
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
