"use client";

import { useEffect, useState } from "react";
import { IconButton } from "@/once-ui/components";

/**
 * Light/dark switcher. The initial value is applied before paint by the
 * inline script in [locale]/layout.tsx; this component just reflects and
 * persists changes.
 */
export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") {
      setTheme(current);
    }
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  return (
    <IconButton
      icon={mounted && theme === "light" ? "moon" : "sun"}
      variant="ghost"
      size="s"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    />
  );
};
