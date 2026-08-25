/**
 * The platform's palette, restated for video.
 *
 * These are the resolved light-theme values of the tokens the web app uses
 * (--brand-on-background-strong, --accent-on-background-weak, the neutral
 * ramp). Remotion renders outside the browser's CSS, so the variables cannot
 * follow it here — but the numbers must, or the video stops looking like the
 * product it belongs to.
 */
export const brand = {
  emerald: "#047857",
  emeraldSoft: "#10b981",
  cyan: "#0e7490",
  ink: "#0a0f0d",
  body: "#4b5563",
  muted: "#9ca3af",
  surface: "#ffffff",
  page: "#fbfdfc",
  hairline: "rgba(10, 15, 13, 0.08)",
} as const;

export const gradient = `linear-gradient(100deg, ${brand.emerald}, ${brand.cyan})`;

/** Same wash the deck carries behind its slides. */
export const wash = `radial-gradient(120% 90% at 50% 0%, rgba(16, 185, 129, 0.10), transparent 60%), ${brand.page}`;
