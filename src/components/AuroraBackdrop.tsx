import styles from "./AuroraBackdrop.module.scss";

interface AuroraBackdropProps {
  /**
   * `hero` is the tall field behind a page's opening statement; `section` is a
   * shorter, softer one for a block further down the page.
   */
  variant?: "hero" | "section";
}

/**
 * Purely decorative brand light behind a section. The parent must be positioned
 * (`position="relative"`) and its content raised (`zIndex={1}`), since this
 * paints at `z-index: 0`. The parent should also clip horizontally
 * (`overflow-x: clip`) so the drift transform can never widen the page.
 */
export function AuroraBackdrop({ variant = "hero" }: AuroraBackdropProps) {
  return <div aria-hidden="true" className={`${styles.aura} ${styles[variant]}`} />;
}
