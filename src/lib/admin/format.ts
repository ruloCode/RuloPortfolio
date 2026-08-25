/**
 * Server-side date formatting for the admin views.
 *
 * These run during the server render and their output travels to the client as
 * plain strings. That is deliberate: calling Intl in the client component would
 * format in the visitor's timezone against the server's UTC markup and trip a
 * hydration mismatch on every row.
 */

import { scheduling } from "@/app/resources";

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

/** "hace 5 minutos" — scannable in a list, where an exact timestamp is noise. */
export function formatRelative(iso: string, locale: string): string {
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  let duration = (new Date(iso).getTime() - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return formatter.format(Math.round(duration), "year");
}

/** The hour of a scheduled class, in the timezone it was scheduled in. Not
 *  UTC-pinned like formatDate: this one has to match what the student is told,
 *  and she is told Bogota. */
export function formatTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: scheduling.timeZone,
  }).format(new Date(iso));
}

/** UTC-pinned so local dev and the Vercel runtime agree on the day. */
export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
