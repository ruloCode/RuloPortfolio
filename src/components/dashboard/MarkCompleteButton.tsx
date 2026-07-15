"use client";

import { toggleLessonComplete } from "@/app/[locale]/dashboard/actions";
import { Button, useToast } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { useState, useTransition } from "react";

type Props = {
  slug: string;
  initialCompleted: boolean;
  labels: {
    mark: string;
    marked: string;
    toastComplete: string;
    toastIncomplete: string;
    toastError: string;
  };
};

export const MarkCompleteButton = ({ slug, initialCompleted, labels }: Props) => {
  // useState + rollback rather than useOptimistic: this app is on react 18.3.1,
  // where useOptimistic exists only in the canary types, not the runtime.
  const [done, setDone] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const onClick = () => {
    const next = !done;
    setDone(next);
    startTransition(async () => {
      const result = await toggleLessonComplete(slug, next);
      if (!result.ok) {
        setDone(!next);
        addToast({ variant: "danger", message: labels.toastError });
        return;
      }
      addToast({
        variant: "success",
        message: next ? labels.toastComplete : labels.toastIncomplete,
      });
    });
  };

  return done ? (
    <Button variant="secondary" size="l" prefixIcon="checkCircle" disabled={isPending} onClick={onClick}>
      {labels.marked}
    </Button>
  ) : (
    <Button
      size="l"
      prefixIcon="check"
      disabled={isPending}
      onClick={onClick}
      className={brand.signatureCta}
    >
      {labels.mark}
    </Button>
  );
};
