"use server";

import { scheduling } from "@/app/resources";
import { getSessionProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type Result =
  | { ok: true }
  | { ok: false; error: "unauthorized" | "invalid" | "invalidTime" | "invalidUrl" | "upstream" };

/**
 * Every action here re-checks the role server-side. The admin layout already
 * gates the page, but a Server Action is a public HTTP endpoint: it can be
 * invoked directly with a crafted request that never renders that layout.
 * RLS is the third lock — the policies on these tables demand is_admin() too.
 */
async function requireAdmin() {
  const profile = await getSessionProfile();
  return profile?.role === "admin" ? profile : null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** One action item per non-empty line, capped so a pasted document cannot
 *  become three hundred checkboxes. */
function parseActions(raw: string, limit = 25): string[] {
  return raw
    .split("\n")
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, limit)
    .map((line) => line.slice(0, 300));
}

export async function createSession(formData: FormData): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "unauthorized" };

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const summary = String(formData.get("summary") ?? "").trim().slice(0, 20_000);
  const date = String(formData.get("date") ?? "").trim();
  const coachActions = parseActions(String(formData.get("coachActions") ?? ""));
  const studentActions = parseActions(String(formData.get("studentActions") ?? ""));
  // Anything but the explicit "planned" is a record of a class that happened —
  // the safe default, since a stray value must not fake a session into history.
  const status = formData.get("status") === "planned" ? "planned" : "held";

  // The three fields the student actually sees. They only mean something on a
  // plan — a class that already happened has no link left to join — so they
  // are read as empty on a 'held' note rather than carried over silently.
  const planned = status === "planned";
  const startTime = planned ? String(formData.get("startTime") ?? "").trim() : "";
  const meetingUrl = planned ? String(formData.get("meetingUrl") ?? "").trim() : "";
  const prepNote = planned
    ? String(formData.get("prepNote") ?? "")
        .trim()
        .slice(0, 2_000)
    : "";

  // The DB check constraint would reject these anyway; failing here turns a
  // 500 into a message the form can show.
  if (!EMAIL_PATTERN.test(email) || title.length === 0) return { ok: false, error: "invalid" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: "invalid" };
  // Rejected rather than dropped: a mistyped link that saves as null looks
  // identical to one that was never entered, and the student is the one who
  // finds out.
  if (meetingUrl.length > 0 && !meetingUrl.startsWith("https://")) {
    return { ok: false, error: "invalidUrl" };
  }

  // Same reasoning as the link: "11:15am" failing the pattern and saving as
  // null would leave her card showing a day with no hour, and nobody would
  // know until she asked.
  if (startTime.length > 0 && !/^([01]?\d|2[0-3]):[0-5]\d$/.test(startTime)) {
    return { ok: false, error: "invalidTime" };
  }

  // A wall-clock time in Bogota becomes an absolute instant here, once, so the
  // dashboard never has to guess what "11:15" meant. Colombia has no DST, so
  // the fixed offset is exact — not an approximation.
  const startsAt =
    startTime.length > 0 ? `${date}T${startTime.padStart(5, "0")}:00${scheduling.utcOffset}` : null;

  const supabase = createClient();

  const { data: session, error } = await supabase
    .from("mentoring_sessions")
    .insert({
      person_email: email,
      title,
      summary,
      session_date: date,
      status,
      starts_at: startsAt,
      // Empty string would satisfy the https:// check on neither column and
      // would render as a blank line on her card; null is the honest "unset".
      meeting_url: meetingUrl || null,
      prep_note: prepNote || null,
    })
    .select("id")
    .single();

  if (error || !session) {
    console.error("admin: session insert failed", error?.message);
    return { ok: false, error: "upstream" };
  }

  const rows = [
    ...coachActions.map((title, index) => ({
      session_id: session.id,
      owner: "coach" as const,
      title,
      position: index,
    })),
    ...studentActions.map((title, index) => ({
      session_id: session.id,
      owner: "student" as const,
      title,
      position: coachActions.length + index,
    })),
  ];

  if (rows.length > 0) {
    const { error: actionsError } = await supabase.from("session_actions").insert(rows);
    // The session itself is saved and is the valuable part; losing the
    // checklist is worth reporting but not worth discarding the note.
    if (actionsError) {
      console.error("admin: session actions insert failed", actionsError.message);
      revalidatePath("/[locale]/dashboard/admin", "layout");
      return { ok: false, error: "upstream" };
    }
  }

  revalidatePath("/[locale]/dashboard/admin", "layout");
  return { ok: true };
}

export async function toggleAction(id: string, done: boolean): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "unauthorized" };

  const supabase = createClient();
  const { error } = await supabase
    .from("session_actions")
    // done_at cleared on un-checking, so the timestamp never claims a
    // completion that was taken back.
    .update({ done, done_at: done ? new Date().toISOString() : null })
    .eq("id", id);

  if (error) {
    console.error("admin: action toggle failed", error.message);
    return { ok: false, error: "upstream" };
  }

  revalidatePath("/[locale]/dashboard/admin", "layout");
  return { ok: true };
}
