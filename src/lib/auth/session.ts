import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Role = "waitlist" | "student";

export type SessionProfile = {
  userId: string;
  email: string | null;
  role: Role;
  locale: string;
  fullName: string | null;
};

// cache(): the layout and the page both call this — one query per request.
export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  const supabase = createClient();

  // getClaims() verifies the JWT signature, so its output is safe to trust.
  // getSession() is not, and must never gate anything on the server.
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  if (error || !userId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role, locale, full_name")
    .eq("id", userId)
    .maybeSingle();

  // Self-heal: if the signup trigger ever failed, the user exists without a
  // profile. Degrade to the least-privileged role rather than 500.
  if (!profile) {
    return {
      userId,
      email: (data?.claims?.email as string) ?? null,
      role: "waitlist",
      locale: "en",
      fullName: null,
    };
  }

  return {
    userId,
    email: profile.email,
    role: profile.role as Role,
    locale: profile.locale,
    fullName: profile.full_name,
  };
});
