"use client";

import { IconButton } from "@/once-ui/components";
import styles from "./SlideDeck.module.scss";
import { useCallback, useEffect, useState } from "react";

/**
 * One slide, described rather than drawn.
 *
 * Layout comes from the shape of the content — a quote slide is a quote slide
 * because it only has a quote — so writing a new deck never means writing CSS.
 */
export type Slide = {
  eyebrow?: string;
  /** Rendered with the brand gradient. One per deck, at most. */
  headline?: string;
  title?: string;
  quote?: string;
  support?: string;
  /** Her own words, quoted back at her. */
  example?: string;
  footnote?: string;
  levels?: { name: string; here?: boolean }[];
  items?: { title: string; note?: string }[];
};

type Labels = { prev: string; next: string; fullscreen: string; exit: string };

export const SlideDeck = ({
  slides,
  signature,
  labels,
}: {
  slides: Slide[];
  /** Sits in the bar on every slide — the deck's letterhead. */
  signature: string;
  labels: Labels;
}) => {
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (delta: number) => {
      setIndex((value) => Math.min(slides.length - 1, Math.max(0, value + delta)));
    },
    [slides.length],
  );

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Space and arrows are how every remote clicker talks to a browser.
      if (["ArrowRight", "PageDown", " ", "Enter"].includes(event.key)) {
        event.preventDefault();
        go(1);
      } else if (["ArrowLeft", "PageUp", "Backspace"].includes(event.key)) {
        event.preventDefault();
        go(-1);
      } else if (event.key === "Home") {
        setIndex(0);
      } else if (event.key === "End") {
        setIndex(slides.length - 1);
      } else if (event.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, slides.length, toggleFullscreen]);

  const slide = slides[index];
  const ratio = slides.length > 1 ? (index + 1) / slides.length : 1;

  return (
    <div className={styles.deck}>
      {/* key: remounting is what replays the entrance animation on every
          slide. Without it the second slide would appear already settled. */}
      <div className={styles.stage} key={index}>
        {slide.eyebrow && <p className={styles.eyebrow}>{slide.eyebrow}</p>}

        {slide.quote && <p className={styles.quote}>“{slide.quote}”</p>}

        {slide.headline && (
          <h1 className={`${styles.title} ${styles.headline}`}>{slide.headline}</h1>
        )}

        {slide.title && <h1 className={styles.title}>{slide.title}</h1>}

        {slide.support && <p className={styles.support}>{slide.support}</p>}

        {slide.levels && (
          <div className={styles.levels}>
            {slide.levels.map((level, position) => (
              <div
                key={level.name}
                className={`${styles.level} ${level.here ? styles.levelActive : ""}`}
                // Each rung indents a little further: the shape says "ladder"
                // before anyone reads a word.
                style={{ marginLeft: `${position * 1.5}rem` }}
              >
                <span className={styles.levelIndex}>{position + 1}</span>
                <span className={styles.levelName}>{level.name}</span>
                {level.here && <span className={styles.levelHere}>Estás aquí</span>}
              </div>
            ))}
          </div>
        )}

        {slide.items && (
          <div className={styles.items}>
            {slide.items.map((item, position) => (
              <div className={styles.item} key={item.title}>
                <span className={styles.itemIndex}>{position + 1}</span>
                <div className={styles.itemBody}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  {item.note && <span className={styles.itemNote}>{item.note}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {slide.example && <p className={styles.example}>{slide.example}</p>}

        {slide.footnote && <p className={styles.footnote}>{slide.footnote}</p>}
      </div>

      {/* Whole-edge click targets: presenting from a trackpad should not mean
          aiming at a 32px button while talking. */}
      <button
        type="button"
        className={`${styles.zone} ${styles.zonePrev}`}
        onClick={() => go(-1)}
        aria-label={labels.prev}
      />
      <button
        type="button"
        className={`${styles.zone} ${styles.zoneNext}`}
        onClick={() => go(1)}
        aria-label={labels.next}
      />

      <div className={styles.hint}>
        <IconButton
          size="s"
          variant="tertiary"
          icon="gallery"
          onClick={toggleFullscreen}
          aria-label={labels.fullscreen}
          tooltip={labels.fullscreen}
          tooltipPosition="left"
        />
      </div>

      <div className={styles.bar}>
        <span className={styles.signature}>{signature}</span>
        <div className={styles.progress}>
          <div className={styles.progressFill} style={{ transform: `scaleX(${ratio})` }} />
        </div>
        <span className={styles.count}>
          {index + 1} / {slides.length}
        </span>
      </div>
    </div>
  );
};
