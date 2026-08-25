import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type UpcomingSession = {
  title: string;
  /** YYYY-MM-DD, the day the class belongs to. */
  date: string;
  /** Absolute start, or null for a class with a day but no hour yet. */
  startsAt: string | null;
  meetingUrl: string | null;
  /** "Have this open when you join", one line per item. */
  prep: string[];
  /** The class this session teaches, if it has one published. */
  lessonSlug: string | null;
};

type Row = {
  title: string;
  session_date: string;
  starts_at: string | null;
  meeting_url: string | null;
  prep_note: string | null;
  lesson_slug: string | null;
};

/** One item per non-empty line, capped: this renders on the student's home
 *  screen, and a pasted agenda must not push the join button off the page.
 *  Exported so the admin view parses it exactly the way she will read it. */
export function parsePrep(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, 6)
    .map((line) => line.slice(0, 200));
}

/**
 * The student's own next planned class. Goes through my_upcoming_session()
 * rather than a table read because mentoring_sessions is admin-only by design
 * — see the session_agenda migration.
 *
 * cache(): the page asks once, but it decides two blocks (the next-class card
 * and whether the booking CTA still makes sense).
 *
 * Degrades to null, never throws: a Supabase blip must cost the student her
 * class card, not her whole dashboard.
 */
export const getUpcomingSession = cache(async (): Promise<UpcomingSession | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_upcoming_session").maybeSingle<Row>();

  if (error) {
    console.error("sessions: upcoming read failed", error.message);
    return null;
  }
  if (!data) return null;

  return {
    title: data.title,
    date: data.session_date,
    startsAt: data.starts_at,
    // The DB rejects anything that is not https://, so this is safe as an
    // href — the check is a constraint, not a convention.
    meetingUrl: data.meeting_url,
    prep: parsePrep(data.prep_note),
    lessonSlug: data.lesson_slug,
  };
});
