import { createBrowserClient } from "@supabase/ssr";

// The publishable key maps to the `anon` Postgres role and is meant to ship to
// the browser — RLS is what protects the data, not the secrecy of this key.
// SUPABASE_SECRET_KEY must never appear here: it bypasses RLS entirely.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
