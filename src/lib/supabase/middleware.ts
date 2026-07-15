import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest } from "next/server";

export type RefreshedSession = {
  cookiesToSet: { name: string; value: string; options: CookieOptions }[];
  cacheHeaders: Record<string, string>;
};

/**
 * Refreshes the Supabase session for `request`.
 *
 * Deliberately builds no response. It mutates `request.cookies` (which rewrites
 * the underlying `cookie` header) so the response next-intl builds afterwards
 * carries the refreshed token, and hands the cookies back for the caller to
 * apply. See src/middleware.ts for why the ordering matters.
 */
export async function refreshSession(request: NextRequest): Promise<RefreshedSession> {
  const cookiesToSet: RefreshedSession["cookiesToSet"] = [];
  let cacheHeaders: Record<string, string> = {};

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(newCookies, headers) {
          for (const { name, value, options } of newCookies) {
            // Downstream view: RequestCookies.set() rewrites the request's
            // `cookie` header, so the server render sees the NEW token.
            request.cookies.set(name, value);
            // Browser view: applied to the intl response by the caller.
            cookiesToSet.push({ name, value, options });
          }
          // Cache-Control/Expires/Pragma. Without these a CDN can cache a
          // response carrying someone's Set-Cookie and hand their session to
          // the next visitor.
          cacheHeaders = { ...cacheHeaders, ...headers };
        },
      },
    },
  );

  // Nothing may run between createServerClient and this call. getClaims()
  // verifies the JWT signature (locally, via WebCrypto — this project signs
  // with ES256); getSession() is not safe to trust on the server.
  await supabase.auth.getClaims();

  return { cookiesToSet, cacheHeaders };
}
