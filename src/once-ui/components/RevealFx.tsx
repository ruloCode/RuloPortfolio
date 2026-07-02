"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";
import { SpacingToken } from "../types";
import styles from "./RevealFx.module.scss";
import { Flex } from ".";

interface RevealFxProps extends React.ComponentProps<typeof Flex> {
  children: React.ReactNode;
  speed?: "slow" | "medium" | "fast";
  delay?: number;
  revealedByDefault?: boolean;
  translateY?: number | SpacingToken;
  trigger?: boolean;
  inView?: boolean;
  inViewThreshold?: number;
  style?: React.CSSProperties;
  className?: string;
}

const RevealFx = forwardRef<HTMLDivElement, RevealFxProps>(
  (
    {
      children,
      speed = "medium",
      delay = 0,
      revealedByDefault = false,
      translateY,
      trigger,
      inView = false,
      inViewThreshold = 0.2,
      style,
      className,
      ...rest
    },
    ref,
  ) => {
    const [isRevealed, setIsRevealed] = useState(revealedByDefault);
    const localRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (inView) return;

      const timer = setTimeout(() => {
        setIsRevealed(true);
      }, delay * 1000);

      return () => clearTimeout(timer);
    }, [delay, inView]);

    // inView mode: reveal when the element enters the viewport instead of on mount
    useEffect(() => {
      if (!inView) return;

      const element = localRef.current;
      if (!element) return;

      if (typeof IntersectionObserver === "undefined") {
        setIsRevealed(true);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const timer = setTimeout(() => setIsRevealed(true), delay * 1000);
              observer.disconnect();
              return () => clearTimeout(timer);
            }
          });
        },
        { threshold: inViewThreshold },
      );

      observer.observe(element);
      return () => observer.disconnect();
    }, [inView, inViewThreshold, delay]);

    useEffect(() => {
      if (trigger !== undefined) {
        setIsRevealed(trigger);
      }
    }, [trigger]);

    const getSpeedDuration = () => {
      switch (speed) {
        case "fast":
          return "1s";
        case "medium":
          return "2s";
        case "slow":
          return "3s";
        default:
          return "2s";
      }
    };

    const getTranslateYValue = () => {
      if (typeof translateY === "number") {
        return `${translateY}rem`;
      } else if (typeof translateY === "string") {
        return `var(--static-space-${translateY})`;
      }
      return undefined;
    };

    const translateValue = getTranslateYValue();

    const revealStyle: React.CSSProperties = {
      transitionDuration: getSpeedDuration(),
      transform: isRevealed ? "translateY(0)" : `translateY(${translateValue})`,
      ...style,
    };

    const assignRef = (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    };

    return (
      <Flex
        fillWidth
        position="relative"
        horizontal="center"
        ref={assignRef}
        style={revealStyle}
        className={`${styles.revealFx} ${isRevealed ? styles.revealed : styles.hidden} ${className || ""}`}
        {...rest}
      >
        {children}
      </Flex>
    );
  },
);

RevealFx.displayName = "RevealFx";
export { RevealFx };
