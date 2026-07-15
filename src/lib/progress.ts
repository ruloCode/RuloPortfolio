import { createClient } from "@/lib/supabase/server";

/**
 * Progress runs through the user's own session, so RLS applies — the secret key
 * is never involved. Reads degrade to "nothing completed" instead of throwing:
 * a Supabase blip must never take down the lesson content.
 */
export async function getCompletedSlugs(): Promise<Set<string>> {
  const supabase = createClient();
  const { data, error } = await supabase.from("lesson_progress").select("lesson_slug");

  if (error) {
    console.error("progress: read failed", error.message);
    return new Set();
  }
  return new Set((data ?? []).map((row) => row.lesson_slug));
}
