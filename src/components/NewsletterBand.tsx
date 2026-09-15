"use client";

import { useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Button, Column, Heading, Icon, Input, Tag, Text } from "@/once-ui/components";
import styles from "./NewsletterBand.module.scss";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NewsletterCopy = {
  title: string;
  description: string;
  button: string;
  placeholder: string;
  note: string;
  imageAlt: string;
  invalidEmail: string;
  success: string;
  error: string;
};

type NewsletterBandProps = {
  copy: NewsletterCopy;
  /** The still shown beside the form (the world's last station). */
  image: string;
};

/**
 * Newsletter signup. Posts to the same endpoint as the Week 0 waitlist — one
 * table, one welcome email, one Resend audience — tagged source "newsletter"
 * so the two can be told apart without a schema change.
 */
export function NewsletterBand({ copy, image }: NewsletterBandProps) {
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const honeypotRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setFieldError(copy.invalidEmail);
      return;
    }
    setFieldError("");
    setStatus("loading");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          company: honeypotRef.current?.value ?? "",
          locale,
          source: "newsletter",
        }),
      });
      setStatus(response.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Column
      as="section"
      className={styles.band}
      fillWidth
      radius="l"
      border="neutral-alpha-medium"
      background="surface"
    >
      <div className={styles.copy}>
        <Tag variant="brand" size="m" label="Newsletter" />
        <Heading as="h2" variant="display-strong-xs" wrap="balance">
          {copy.title}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
          {copy.description}
        </Text>
        {status === "success" ? (
          <Column gap="8" paddingTop="8" role="status">
            <Icon name="checkCircle" size="l" onBackground="brand-weak" />
            <Text variant="heading-strong-m">{copy.success}</Text>
          </Column>
        ) : (
          <form noValidate className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <Input
                labelAsPlaceholder
                id="newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                label={copy.placeholder}
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldError && EMAIL_PATTERN.test(e.target.value.trim())) setFieldError("");
                }}
                errorMessage={fieldError || (status === "error" ? copy.error : "")}
              />
            </div>
            <div aria-hidden="true" style={{ position: "absolute", left: "-5000px" }}>
              <input ref={honeypotRef} type="text" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
            </div>
            <Button type="submit" size="m" disabled={status === "loading"}>
              {copy.button}
            </Button>
          </form>
        )}
        <Text variant="label-default-s" onBackground="neutral-weak">
          {copy.note}
        </Text>
      </div>
      <div className={styles.visual}>
        {/* Plain <img>: the still is a hashed, immutable asset from the
            scroll-world manifest; next/image would only re-encode it. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={copy.imageAlt} loading="lazy" decoding="async" />
      </div>
    </Column>
  );
}
