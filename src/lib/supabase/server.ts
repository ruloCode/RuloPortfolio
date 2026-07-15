import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// One client per request — never hoist to module scope. A module-scoped client
// is reused across requests on a warm lambda and leaks one user's session into
// another user's render.
//
// NOTE: `cookies()` is synchronous on Next 14. Supabase's published examples
// target Next 15 and `await` it; copying them here yields a Promise with no
// .getAll and every session read silently returns "no session".
export function createClient() {
  const cookieStore = cookies();

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
