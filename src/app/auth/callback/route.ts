import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * `next` round-trips through the email link, so treat it as attacker-influenced:
 * anything but a same-origin relative path is an open redirect.
 */
function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return "/dashboard";
  }
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const next = safeNext(searchParams.get("next"));

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = createClient();

  // token_hash is preferred over PKCE: no code verifier is involved, so the
  // link still works when opened on a different device than it was requested
  // from — the most common path for a magic link.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect(next);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
  }

  // `next` is already locale-prefixed by the caller, so next/navigation's
  // redirect is correct here: this route lives outside [locale] and has no
  // next-intl request context to derive a locale from.
  redirect(`${next.startsWith("/es") ? "/es" : ""}/login?error=auth`);
}
