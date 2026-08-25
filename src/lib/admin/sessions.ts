import { parsePrep } from "@/lib/sessions";
import { createClient } from "@/lib/supabase/server";

export type ActionOwner = "coach" | "student";

export type SessionAction = {
  id: string;
  owner: ActionOwner;
  title: string;
  done: boolean;
};

export type SessionStatus = "planned" | "held";

export type MentoringSession = {
  id: string;
  date: string;
  title: string;
  summary: string;
  /** 'planned' is the agenda for the next class; 'held' is what happened. */
  status: SessionStatus;
  actions: SessionAction[];
  /** The three fields below are the ones the student sees on her own
   *  dashboard. They are echoed back here so the coach can check what he
   *  actually published, instead of typing into a black box. */
  startsAt: string | null;
  meetingUrl: string | null;
  prep: string[];
  /** The class this session teaches — the deck hangs off it. */
  lessonSlug: string | null;
};

type ActionRow = {
  id: string;
  session_id: string;
  owner: ActionOwner;
  title: string;
  done: boolean;
  position: number;
};

export type SessionsResult = { ok: true; sessions: MentoringSession[] } | { ok: false };

/**
 * Open action items per person, for the roster. One embedded query rather than
 * one per row: without this the owner has to open every student to find out
 * who is waiting on what, which is the whole job of a follow-up view.
 *
 * Degrades to an empty map — a missing badge is a far better failure than a
 * roster that will not render.
 */
export async function getOpenActionCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();

  // !inner turns the embed into a join instead of a nullable side-load, so
  // rows whose session vanished cannot come back with a null email.
  const { data, error } = await supabase
    .from("session_actions")
    .select("id, mentoring_sessions!inner(person_email)")
    .eq("done", false);

  if (error) {
    console.error("admin: open action count failed", error.message);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    // PostgREST types the embed as an array even on a to-one relationship.
    const embedded = row.mentoring_sessions as unknown as
      | { person_email: string }
      | { person_email: string }[]
      | null;
    const email = Array.isArray(embedded) ? embedded[0]?.person_email : embedded?.person_email;
    if (!email) continue;
    counts[email] = (counts[email] ?? 0) + 1;
  }
  return counts;
}

/**
 * Every session for one person, newest first. Keyed on the lowercased email
 * rather than a user id, so notes taken before someone activates their account
 * stay attached afterwards. Two queries, then joined in memory — one query per
 * session would be an N+1 that grows with the relationship.
 */
export async function getSessions(email: string): Promise<SessionsResult> {
  const supabase = await createClient();

  // The next class goes on top, history underneath. That needs status
  // DESCENDING: 'held' < 'planned' alphabetically, so ascending would bury the
  // plan below every session that already happened.
  const { data: sessions, error } = await supabase
    .from("mentoring_sessions")
    .select(
      "id, session_date, title, summary, status, starts_at, meeting_url, prep_note, lesson_slug",
    )
    .eq("person_email", email.toLowerCase())
    .order("status", { ascending: false })
    .order("session_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin: sessions read failed", error.message);
    return { ok: false };
  }
  if (!sessions || sessions.length === 0) return { ok: true, sessions: [] };

  const { data: actions, error: actionsError } = await supabase
    .from("session_actions")
    .select("id, session_id, owner, title, done, position")
    .in(
      "session_id",
      sessions.map((session) => session.id),
    )
    .order("position", { ascending: true });

  if (actionsError) {
    console.error("admin: session actions read failed", actionsError.message);
    return { ok: false };
  }

  const bySession = new Map<string, ActionRow[]>();
  for (const action of (actions ?? []) as ActionRow[]) {
    const rows = bySession.get(action.session_id);
    if (rows) rows.push(action);
    else bySession.set(action.session_id, [action]);
  }

  return {
    ok: true,
    sessions: sessions.map((session) => ({
      id: session.id,
      date: session.session_date,
      title: session.title,
      summary: session.summary,
      status: (session.status ?? "held") as SessionStatus,
      startsAt: session.starts_at ?? null,
      meetingUrl: session.meeting_url ?? null,
      prep: parsePrep(session.prep_note ?? null),
      lessonSlug: session.lesson_slug ?? null,
      actions: (bySession.get(session.id) ?? []).map((action) => ({
        id: action.id,
        owner: action.owner,
        title: action.title,
        done: action.done,
      })),
    })),
  };
}
