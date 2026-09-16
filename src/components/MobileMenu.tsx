"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Column, Flex, SmartLink, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import styles from "./MobileMenu.module.scss";

export type MobileMenuItem = { href: string; label: string; active: boolean };

type MobileMenuProps = {
  items: MobileMenuItem[];
  cta?: { href: string; label: string };
  labels: { open: string; close: string; nav: string };
  /** Language switch, rendered at the foot of the panel. */
  footer?: React.ReactNode;
};

/**
 * The phone's navigation: a burger in the top bar and a full-screen panel with
 * the real routes. It replaces the fixed bottom bar, which could only ever
 * show icons and had no room for the conversion CTA.
 *
 * The panel is the only surface on the phone that lists every section, so it
 * closes on every way out: a link, the CTA, Escape, the burger, and the
 * browser's back button.
 */
export function MobileMenu({ items, cta, labels, footer }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    // Tapping a link closes the panel; this covers the other way to leave the
    // page with it open — the browser's back and forward buttons.
    const onPopState = () => setOpen(false);

    // The page behind must not scroll: on the home it is a snap container, and
    // a stray wheel event would change station under the open panel.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", onPopState);
    // Focus moves into the panel so the next Tab lands on the first link.
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", onPopState);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.burger}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen((value) => !value)}
      >
        {/* Three bars that fold into a cross — no icon font needed, and the
            shape animates with transform only. */}
        <span className={styles.bars} data-open={open || undefined} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>

      <div
        id="mobile-menu"
        ref={panelRef}
        tabIndex={-1}
        className={styles.panel}
        data-open={open || undefined}
        // Hidden from assistive tech and from tab order while closed.
        inert={!open || undefined}
        aria-hidden={!open || undefined}
      >
        <Column as="nav" aria-label={labels.nav} className={styles.list} gap="4" fillWidth>
          {items.map((item, index) => (
            <SmartLink
              key={item.href}
              unstyled
              href={item.href}
              className={styles.item}
              data-active={item.active || undefined}
              style={{ "--i": index } as React.CSSProperties}
              aria-current={item.active ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <Text as="span" variant="display-strong-xs">
                {item.label}
              </Text>
            </SmartLink>
          ))}
        </Column>
        <Column gap="20" fillWidth horizontal="center">
          {cta && (
            <Button
              href={cta.href}
              size="l"
              fillWidth
              className={brand.signatureCta}
              arrowIcon
              onClick={() => setOpen(false)}
            >
              {cta.label}
            </Button>
          )}
          {footer && (
            <Flex horizontal="center" fillWidth>
              {footer}
            </Flex>
          )}
        </Column>
      </div>
    </>
  );
}
