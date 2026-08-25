"use client";

import brand from "@/styles/brand.module.scss";
import { useEffect, useState } from "react";

/**
 * How much of this class is left, said without words.
 *
 * A class runs on one long page, and on a phone that page is a scroll with no
 * horizon: the reader cannot tell whether she is a third of the way in or
 * almost done. The bar answers that at a glance, and during a live session the
 * coach is reading the same page on the shared screen — so it paces both sides
 * at once.
 *
 * Measured against the article, not the document: the header above it and the
 * navigation below it are not part of the class, and counting them would
 * report progress that was never read.
 */
export const LessonProgress = ({ targetId }: { targetId: string }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.getElementById(targetId);
    if (!article) return;

    const measure = () => {
      const rect = article.getBoundingClientRect();
      const viewport = window.innerHeight;
      // Distance the article's bottom edge has to travel before the last line
      // is on screen. Short articles that never scroll count as fully read.
      const scrollable = rect.height - viewport;
      if (scrollable <= 0) {
        setProgress(rect.bottom <= viewport ? 100 : 0);
        return;
      }
      const scrolled = -rect.top;
      setProgress(Math.min(100, Math.max(0, (scrolled / scrollable) * 100)));
    };

    measure();
    // passive: this runs on every scroll frame and never calls preventDefault.
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [targetId]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        // Above the mobile top bar (z-index 8), below dialogs and toasts.
        zIndex: 9,
        pointerEvents: "none",
      }}
    >
      <div
        className={brand.progressFill}
        style={{
          height: "100%",
          width: `${progress}%`,
          // No transition on width: it tracks the scroll, and easing it would
          // make the bar lag behind the thumb.
          borderTopRightRadius: "2px",
          borderBottomRightRadius: "2px",
        }}
      />
    </div>
  );
};
