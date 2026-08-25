import { getLessons, lessonsForRole } from "@/app/[locale]/dashboard/lessons";
import type { Role } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export type StudentStatus = "not_started" | "in_progress" | "completed";

export type Student = {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  locale: string;
  joinedAt: string;
  /** Slugs, not titles — lessons live in the repo, so the DB only knows slugs. */
  completions: { slug: string; completedAt: string }[];
  completed: number;
  total: number;
  /**
   * Proxy for "last seen": the newest lesson completion. auth.users holds the
   * real last_sign_in_at, but exposing that table to PostgREST is a far bigger
   * surface than this view is worth. Label it as what it is — last lesson —
   * never as "last login".
   */
  lastActivityAt: string | null;
  status: StudentStatus;
};

export type LessonRef = { slug: string; title: string; order: number };

/**
 * Someone on the waitlist who never finished the magic link. They have no
 * account, so no progress can exist for them — kept out of `students` rather
 * than shown as a 0% row, which would read as "started and stalled" when the
 * truth is "never got in".
 */
export type PendingSignup = {
  /** The waitlist row id. Doubles as the URL segment for their detail page,
   *  since they have no account and therefore no profile id to use. */
  id: string;
  email: string;
  fullName: string | null;
  joinedAt: string;
  /** Null means the welcome email never went out — that is on us, not them. */
  welcomeEmailSentAt: string | null;
};

export type Roster = {
  students: Student[];
  lessons: LessonRef[];
  /** Waitlist signups with no account yet — the top of the funnel. */
  pending: PendingSignup[];
  /** Mean completion across students, 0-100. 0 when there are no students. */
  averageCompletion: number;
};

/** Reads fail loudly here: an empty roster and a broken roster look identical,
 *  and quietly rendering "0 students" would be a lie the owner acts on. */
export type RosterResult = { ok: true; roster: Roster } | { ok: false };

type ProgressRow = { user_id: string; lesson_slug: string; completed_at: string };

/**
 * Everything runs through the caller's own session, so the RLS admin policies
 * are what authorize it — the secret key is never involved. A non-admin calling
 * this gets their own row back and nothing else.
 */
export const getRoster = cache(async (locale: string): Promise<RosterResult> => {
  const supabase = createClient();

  // Semana 0 only. This roster measures the self-serve work a student does
  // before the cohort — a live class published as a lesson would drag every
  // student's percentage down for something that is not homework at all, and
  // the column is labelled "Avance de Semana 0" in both languages.
  const lessons: LessonRef[] = lessonsForRole(getLessons(locale), "student")
    .filter((lesson) => (lesson.metadata.module ?? "semana-0") === "semana-0")
    .map((lesson) => ({
      slug: lesson.slug,
      title: lesson.metadata.title,
      order: lesson.metadata.order ?? 0,
    }));

  // Three round trips, not one per student: the progress rows arrive as a flat
  // list and get grouped in memory. A per-student query would be an N+1 that
  // grows with the cohort.
  const [profilesResult, progressResult, waitlistResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, role, locale, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("lesson_progress").select("user_id, lesson_slug, completed_at"),
    supabase
      .from("waitlist")
      .select("id, email, full_name, created_at, welcome_email_sent_at")
      .order("created_at", { ascending: false }),
  ]);

  if (profilesResult.error || progressResult.error) {
    console.error(
      "admin: roster read failed",
      profilesResult.error?.message ?? progressResult.error?.message,
    );
    return { ok: false };
  }

  const byUser = new Map<string, ProgressRow[]>();
  for (const row of (progressResult.data ?? []) as ProgressRow[]) {
    const rows = byUser.get(row.user_id);
    if (rows) rows.push(row);
    else byUser.set(row.user_id, [row]);
  }

  const knownSlugs = new Set(lessons.map((lesson) => lesson.slug));

  const students: Student[] = (profilesResult.data ?? [])
    // The owner is not their own student.
    .filter((profile) => profile.role !== "admin")
    .map((profile) => {
      const rows = byUser.get(profile.id) ?? [];
      // Ignore progress for lessons that no longer exist, or the percentage
      // can exceed 100 after a lesson is renamed or removed.
      const relevant = rows.filter((row) => knownSlugs.has(row.lesson_slug));
      const completed = relevant.length;
      const total = lessons.length;

      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role as Role,
        locale: profile.locale,
        joinedAt: profile.created_at,
        completions: relevant.map((row) => ({
          slug: row.lesson_slug,
          completedAt: row.completed_at,
        })),
        completed,
        total,
        lastActivityAt:
          rows.length > 0
            ? rows.reduce((latest, row) => (row.completed_at > latest ? row.completed_at : latest), rows[0].completed_at)
            : null,
        status: completed === 0 ? "not_started" : completed >= total ? "completed" : "in_progress",
      } satisfies Student;
    });

  // Matched on email because waitlist_id is only stamped when the signup
  // predates the account — someone who joins the list after signing in keeps a
  // null waitlist_id and would otherwise be counted as never activated.
  const accountEmails = new Set(
    (profilesResult.data ?? []).map((profile) => profile.email.toLowerCase()),
  );
  // A waitlist read failure is not fatal: that section degrades, the roster
  // stands. It is the less important of the two.
  const pending: PendingSignup[] = waitlistResult.error
    ? []
    : (waitlistResult.data ?? [])
        .filter((row) => !accountEmails.has(row.email.toLowerCase()))
        .map((row) => ({
          id: row.id,
          email: row.email,
          fullName: row.full_name,
          joinedAt: row.created_at,
          welcomeEmailSentAt: row.welcome_email_sent_at,
        }));

  const averageCompletion =
    students.length === 0 || lessons.length === 0
      ? 0
      : Math.round(
          students.reduce((sum, student) => sum + student.completed / student.total, 0) /
            students.length *
            100,
        );

  return { ok: true, roster: { students, lessons, pending, averageCompletion } };
});

/**
 * One detail page serves both kinds of person, because session notes have to
 * attach to someone before they ever create an account. The id in the URL is a
 * profile id for students and a waitlist id for the rest; they come from
 * different tables so they cannot collide.
 */
export type Person = {
  id: string;
  email: string;
  name: string;
  /** Present only for people who actually have an account. */
  student: Student | null;
};

export function findPerson(roster: Roster, id: string): Person | null {
  const student = roster.students.find((candidate) => candidate.id === id);
  if (student) {
    return {
      id: student.id,
      email: student.email,
      name: student.fullName || student.email.split("@")[0],
      student,
    };
  }

  const pending = roster.pending.find((candidate) => candidate.id === id);
  if (pending) {
    return {
      id: pending.id,
      email: pending.email,
      name: pending.fullName || pending.email.split("@")[0],
      student: null,
    };
  }

  return null;
}

