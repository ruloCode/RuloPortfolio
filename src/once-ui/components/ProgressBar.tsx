"use client";

import classNames from "classnames";
import React, { forwardRef } from "react";
import { Flex } from "./Flex";
import styles from "./ProgressBar.module.scss";

interface ProgressBarProps extends Omit<React.ComponentProps<typeof Flex>, "children"> {
  value: number;
  max?: number;
  size?: "s" | "m" | "l";
  /** Applied to the fill, so the brand layer owns the gradient — once-ui must
   * not import from src/styles. */
  fillClassName?: string;
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, max = 100, size = "m", fillClassName, className, ...rest }, ref) => {
    const safeMax = max > 0 ? max : 1;
    const clamped = Math.min(Math.max(value, 0), safeMax);
    const percent = (clamped / safeMax) * 100;

    return (
      <Flex
        ref={ref}
        fillWidth
        radius="full"
        overflow="hidden"
        background="neutral-alpha-weak"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        className={classNames(styles.track, styles[size], className)}
        {...rest}
      >
        <Flex
          radius="full"
          className={classNames(styles.fill, fillClassName)}
          style={{ width: `${percent}%` }}
        />
      </Flex>
    );
  },
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
export type { ProgressBarProps };
