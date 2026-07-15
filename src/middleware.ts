import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { refreshSession } from "./lib/supabase/middleware";

const handleI18n = createMiddleware(routing);

// Paths whose render reads the auth session. Refreshing only here keeps
// `Cache-Control: private, no-store` — which @supabase/ssr emits on refresh —
// off the marketing pages, where it would disable CDN caching entirely.
const AUTH_AWARE = /^\/(?:en|es)?\/?(?:dashboard|login)(?:\/|$)/;

function needsSession(pathname: string) {
  return AUTH_AWARE.test(pathname.endsWith("/") ? pathname : `${pathname}/`);
}

export default async function middleware(request: NextRequest) {
  if (!needsSession(request.nextUrl.pathname)) {
    return handleI18n(request);
  }

  // 1. Supabase first: refreshes the token and mutates request.cookies, which
  //    rewrites the request's `cookie` header.
  const { cookiesToSet, cacheHeaders } = await refreshSession(request);

  // 2. next-intl second: its rewrite branch does `new Headers(request.headers)`,
  //    so it snapshots the cookie header we just rewrote and forwards it to the
  //    server render. Swap these two and the refreshed token never arrives.
  const response = handleI18n(request);

  // 3. Copy Supabase's cookies onto whatever next-intl produced — rewrite OR
  //    redirect. The redirect branch is not hypothetical: with localePrefix
  //    "as-needed", every Spanish visitor hits it via /dashboard -> 307 ->
  //    /es/dashboard, and skipping it means they never refresh their token.
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options);
  }
  for (const [key, value] of Object.entries(cacheHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  // `auth` is excluded alongside `api`: /auth/callback is a non-localized route
  // handler, and next-intl would rewrite it to /en/auth/callback -> 404.
  matcher: ["/((?!api|auth|_next|_vercel|og|.*\\..*).*)"],
};
