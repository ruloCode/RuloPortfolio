import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Secret-key client for server-to-server work that must bypass RLS: the Polar
// webhook writing enrollments and flipping roles. NEVER import this from a
// Server Component, a page, or anything that serves a user request — the
// cookie-based client in ./server is the only one allowed to touch user data
// on behalf of a session.
//
// Module-scope is safe here: the client holds no per-request state, just the
// key. The same rule does NOT apply to the cookie client — see server.ts.
export function createServiceClient() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY not configured");
  }
  return createSupabaseClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
