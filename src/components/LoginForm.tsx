"use client";

import { localizeHref } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button, Column, Flex, Heading, Icon, Input, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginCopy = {
  title: string;
  description: string;
  placeholder: string;
  button: string;
  invalidEmail: string;
  error: string;
  sentTitle: string;
  sentDescription: string;
  resend: string;
  note: string;
};

export const LoginForm = ({ copy }: { copy: LoginCopy }) => {
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  // The welcome email links here with ?email= so the field is prefilled. Read it
  // once, then strip it from the URL so the address doesn't linger in history.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefill = params.get("email");
    if (prefill) {
      setEmail(prefill);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setFieldError(copy.invalidEmail);
      return;
    }
    setFieldError("");
    setStatus("loading");

    const next = localizeHref(locale, "/dashboard");
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        // First signup only -> raw_user_meta_data. Read by the profile trigger
        // for locale only, never for authorization.
        data: { locale },
      },
    });

    setStatus(error ? "error" : "sent");
  };

  if (status === "sent") {
    return (
      <Column gap="16" horizontal="center" align="center" fillWidth>
        <Icon name="checkCircle" size="l" onBackground="brand-weak" />
        <Heading variant="heading-strong-m" wrap="balance">
          {copy.sentTitle}
        </Heading>
        <Text
          variant="body-default-m"
          onBackground="neutral-medium"
          wrap="balance"
          style={{ maxWidth: "var(--responsive-width-xs)" }}
        >
          {copy.sentDescription.replace("{email}", email.trim())}
        </Text>
        <Button variant="tertiary" size="s" onClick={() => setStatus("idle")}>
          {copy.resend}
        </Button>
      </Column>
    );
  }

  return (
    <Column gap="24" horizontal="center" align="center" fillWidth>
      <Column gap="8" horizontal="center" align="center">
        <Heading variant="display-strong-xs" wrap="balance">
          {copy.title}
        </Heading>
        <Text
          variant="body-default-m"
          onBackground="neutral-medium"
          wrap="balance"
          style={{ maxWidth: "var(--responsive-width-xs)" }}
        >
          {copy.description}
        </Text>
      </Column>
      <form
        style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
        onSubmit={handleSubmit}
      >
        <Flex fillWidth maxWidth={24} gap="8">
          <Input
            formNoValidate
            labelAsPlaceholder
            id="login-email"
            name="email"
            type="email"
            label={copy.placeholder}
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldError && EMAIL_PATTERN.test(e.target.value.trim())) setFieldError("");
            }}
            errorMessage={fieldError}
          />
          <Flex height="48" vertical="center">
            <Button
              type="submit"
              size="m"
              fillWidth
              disabled={status === "loading"}
              className={brand.signatureCta}
            >
              {copy.button}
            </Button>
          </Flex>
        </Flex>
        {status === "error" && (
          <Text variant="body-default-s" onBackground="danger-weak" paddingTop="12">
            {copy.error}
          </Text>
        )}
        <Text variant="body-default-s" onBackground="neutral-weak" paddingTop="12" align="center">
          {copy.note}
        </Text>
      </form>
    </Column>
  );
};
