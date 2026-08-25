"use client";

import { useRouter } from "@/i18n/routing";
import { Column, Icon, Row, Spinner, Text } from "@/once-ui/components";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Shown when Polar redirects back with ?checkout_id=... The payment is
// already real — what may lag a few seconds is the webhook that flips the
// role. So this banner polls router.refresh() until the server render stops
// mounting it: the parent renders this ONLY while the role is still
// 'waitlist', so the entitled render is what unmounts it. The checkout_id
// itself grants nothing; it drives a spinner, it is not a credential.
//
// The stale ?checkout_id stays in the URL until the next navigation. Harmless
// by the same argument — it authorizes nothing.
const MAX_ATTEMPTS = 8;
const POLL_MS = 4000;

type Props = {
  labels: {
    confirmingTitle: string;
    confirmingBody: string;
    slowTitle: string;
    slowBody: string;
  };
};

export const PaymentReturnNotice = ({ labels }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutId = searchParams.get("checkout_id");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!checkoutId || attempts >= MAX_ATTEMPTS) return;
    const timer = setTimeout(() => {
      router.refresh();
      setAttempts((value) => value + 1);
    }, POLL_MS);
    return () => clearTimeout(timer);
  }, [checkoutId, attempts, router]);

  if (!checkoutId) return null;

  const slow = attempts >= MAX_ATTEMPTS;
  return (
    <Row
      fillWidth
      gap="12"
      padding="m"
      radius="m"
      background="surface"
      border="brand-medium"
      vertical="start"
    >
      {slow ? (
        <Icon name="warningTriangle" onBackground="brand-weak" />
      ) : (
        <Spinner size="s" />
      )}
      <Column gap="4">
        <Text variant="body-strong-s">
          {slow ? labels.slowTitle : labels.confirmingTitle}
        </Text>
        <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
          {slow ? labels.slowBody : labels.confirmingBody}
        </Text>
      </Column>
    </Row>
  );
};
