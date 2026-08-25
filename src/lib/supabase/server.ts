import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// One client per request — never hoist to module scope. A module-scoped client
// is reused across requests on a warm lambda and leaks one user's session into
// another user's render.
//
// `cookies()` is async as of Next 15, so every caller has to await this too.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot write cookies. Safe to ignore: the
            // middleware refreshes the session and writes them instead.
          }
        },
      },
    },
  );
}
