"use server";

import { getLessons } from "@/app/[locale]/dashboard/lessons";
import { getSessionProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";
import { revalidatePath } from "next/cache";

type Result = { ok: true } | { ok: false; error: "unauthorized" | "unknown_lesson" | "upstream" };

export async function toggleLessonComplete(slug: string, completed: boolean): Promise<Result> {
  // The user id comes from the session, never from the client.
  const profile = await getSessionProfile();
  if (!profile) return { ok: false, error: "unauthorized" };

  // Validate against real lessons so the table can't collect arbitrary strings.
  const known = routing.locales.some((locale) =>
    getLessons(locale).some((lesson) => lesson.slug === slug),
  );
  if (!known) return { ok: false, error: "unknown_lesson" };

  const supabase = createClient();

  // Row present = completed; un-completing is a delete.
  const { error } = completed
    ? await supabase
        .from("lesson_progress")
        .upsert({ user_id: profile.userId, lesson_slug: slug }, { onConflict: "user_id,lesson_slug" })
    : await supabase
        .from("lesson_progress")
        .delete()
        .eq("user_id", profile.userId)
        .eq("lesson_slug", slug);

  if (error) {
    console.error("progress: write failed", error.message);
    return { ok: false, error: "upstream" };
  }

  // Refreshes the overview's progress bar on back-navigation — the client
  // Router Cache would otherwise serve a stale payload.
  revalidatePath("/[locale]/dashboard", "layout");
  return { ok: true };
}
