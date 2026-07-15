"use client";

import { waitlistEffects } from "@/app/resources";
import {
  Background,
  Button,
  Column,
  Flex,
  Heading,
  Icon,
  Input,
  Tag,
  Text,
} from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { useRef, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type WaitlistCopy = {
  title: string | JSX.Element;
  description: string | JSX.Element;
  button?: string;
  placeholder?: string;
  invalidEmail: string;
  success: string;
  error: string;
  note?: string;
};

type WaitlistFormProps = {
  newsletter: WaitlistCopy;
  // "signature" marks the site's primary conversion block: gradient halo
  // around the card and the signature gradient on the submit button.
  variant?: "signature";
};

export const WaitlistForm = ({ newsletter, variant }: WaitlistFormProps) => {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  // Honeypot: hidden from humans; bots that fill it get a silent accept.
  const honeypotRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setFieldError(newsletter.invalidEmail);
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
        }),
      });
      setStatus(response.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Column
      overflow="hidden"
      position="relative"
      fillWidth
      padding="xl"
      radius="l"
      marginBottom="m"
      horizontal="center"
      align="center"
      background="surface"
      border="neutral-medium"
      className={variant === "signature" ? brand.signatureGlow : undefined}
    >
      <Background
        mask={{
          cursor: waitlistEffects.mask.cursor,
          x: waitlistEffects.mask.x,
          y: waitlistEffects.mask.y,
          radius: waitlistEffects.mask.radius,
        }}
        gradient={{
          display: waitlistEffects.gradient.display,
          x: waitlistEffects.gradient.x,
          y: waitlistEffects.gradient.y,
          width: waitlistEffects.gradient.width,
          height: waitlistEffects.gradient.height,
          tilt: waitlistEffects.gradient.tilt,
          colorStart: waitlistEffects.gradient.colorStart,
          colorEnd: waitlistEffects.gradient.colorEnd,
          opacity: waitlistEffects.gradient.opacity as
            | 0
            | 10
            | 20
            | 30
            | 40
            | 50
            | 60
            | 70
            | 80
            | 90
            | 100,
        }}
        dots={{
          display: waitlistEffects.dots.display,
          color: waitlistEffects.dots.color,
          size: waitlistEffects.dots.size as any,
          opacity: waitlistEffects.dots.opacity as any,
        }}
        grid={{
          display: waitlistEffects.grid.display,
          color: waitlistEffects.grid.color,
          opacity: waitlistEffects.grid.opacity as any,
        }}
        lines={{
          display: waitlistEffects.lines.display,
          opacity: waitlistEffects.lines.opacity as any,
        }}
      />
      <Heading style={{ position: "relative" }} marginBottom="s" variant="display-strong-xs">
        {newsletter.title}
      </Heading>
      <Text
        style={{
          position: "relative",
          maxWidth: "var(--responsive-width-xs)",
        }}
        wrap="balance"
        marginBottom="l"
        onBackground="neutral-medium"
      >
        {newsletter.description}
      </Text>
      {status === "success" ? (
        <Flex gap="12" vertical="center" style={{ position: "relative" }}>
          <Icon name="checkCircle" onBackground="brand-weak" />
          <Text variant="body-strong-m">{newsletter.success}</Text>
        </Flex>
      ) : (
        <form
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--static-space-12)",
          }}
          onSubmit={handleSubmit}
        >
          <Flex fillWidth maxWidth={24} gap="8">
            <Input
              formNoValidate
              labelAsPlaceholder
              id="waitlist-email"
              name="email"
              type="email"
              label={newsletter.placeholder ?? "Email"}
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldError && EMAIL_PATTERN.test(e.target.value.trim())) {
                  setFieldError("");
                }
              }}
              onBlur={() => {
                if (email !== "" && !EMAIL_PATTERN.test(email.trim())) {
                  setFieldError(newsletter.invalidEmail);
                }
              }}
              errorMessage={fieldError}
            />
            <div aria-hidden="true" style={{ position: "absolute", left: "-5000px" }}>
              <input
                ref={honeypotRef}
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </div>
            <Flex height="48" vertical="center">
              <Button
                type="submit"
                size="m"
                fillWidth
                disabled={status === "loading"}
                className={variant === "signature" ? brand.signatureCta : undefined}
              >
                {newsletter.button ?? "Subscribe"}
              </Button>
            </Flex>
          </Flex>
          {status === "error" && (
            <Text variant="body-default-s" onBackground="danger-weak" style={{ position: "relative" }}>
              {newsletter.error}
            </Text>
          )}
          {newsletter.note && <Tag size="s" variant="neutral" label={newsletter.note} />}
        </form>
      )}
    </Column>
  );
};
