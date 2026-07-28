"use server";

import { getSessionProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type Result = { ok: true } | { ok: false; error: "unauthorized" | "invalid" | "upstream" };

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

  // The DB check constraint would reject these anyway; failing here turns a
  // 500 into a message the form can show.
  if (!EMAIL_PATTERN.test(email) || title.length === 0) return { ok: false, error: "invalid" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: "invalid" };

  const supabase = createClient();

  const { data: session, error } = await supabase
    .from("mentoring_sessions")
    .insert({ person_email: email, title, summary, session_date: date, status })
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
