import { NextResponse } from "next/server";
import { buildWelcomeEmail, CONTACT_EMAIL, resolveWelcomeLocale } from "./welcome-email";

// Signups land in the `waitlist` table (Supabase), the source of truth.
// The welcome email (Resend) and the audience sync are best-effort: if they
// fail, the signup still succeeds and the visitor sees "you're on the list".

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type WaitlistRow = { id: string };

const supabaseHeaders = (secretKey: string) => ({
  apikey: secretKey,
  "Content-Type": "application/json",
});

export async function POST(request: Request) {
  let body: { email?: string; company?: string; locale?: string; fullName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // `company` is a honeypot field: hidden in the UI, so any value means a bot.
  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !secretKey) {
    console.error("waitlist: SUPABASE_URL / SUPABASE_SECRET_KEY not configured");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const locale = resolveWelcomeLocale(body.locale);
  const source = sourcePath(request.headers.get("referer"));
  // Free text straight into a greeting: cap it so a pasted essay can't wreck
  // the email layout, and drop blanks rather than storing "".
  const fullName = body.fullName?.trim().slice(0, 80) || null;

  // `ignore-duplicates` + `return=representation`: a repeat signup returns an
  // empty array, so we know not to send the welcome email again.
  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/waitlist?on_conflict=email`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(secretKey),
      Prefer: "resolution=ignore-duplicates,return=representation",
    },
    body: JSON.stringify({ email, locale, source, full_name: fullName }),
  });

  if (!insertResponse.ok) {
    console.error("waitlist: Supabase error", insertResponse.status, await insertResponse.text());
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }

  const rows: WaitlistRow[] = await insertResponse.json();
  const isNewSignup = rows.length > 0;

  if (isNewSignup) {
    await Promise.allSettled([
      sendWelcomeEmail(email, locale, rows[0].id, supabaseUrl, secretKey, fullName),
      syncResendAudience(email, fullName),
    ]);
  }

  return NextResponse.json({ ok: true });
}

function sourcePath(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).pathname;
  } catch {
    return null;
  }
}

async function sendWelcomeEmail(
  email: string,
  locale: ReturnType<typeof resolveWelcomeLocale>,
  rowId: string,
  supabaseUrl: string,
  secretKey: string,
  fullName: string | null,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WAITLIST_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("waitlist: RESEND_API_KEY / WAITLIST_FROM_EMAIL not set, skipping welcome email");
    return;
  }

  const { subject, html, text } = buildWelcomeEmail(locale, { email, fullName });
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      html,
      text,
      // Spam-folder insurance for a domain with little sending reputation.
      // No List-Unsubscribe-Post: that advertises one-click, and Gmail would
      // POST to nothing. Add both together with a real HTTP endpoint later.
      headers: { "List-Unsubscribe": `<mailto:${CONTACT_EMAIL}?subject=unsubscribe>` },
    }),
  });

  if (!response.ok) {
    console.error("waitlist: welcome email failed", response.status, await response.text());
    return;
  }

  const stamp = await fetch(`${supabaseUrl}/rest/v1/waitlist?id=eq.${rowId}`, {
    method: "PATCH",
    headers: supabaseHeaders(secretKey),
    body: JSON.stringify({ welcome_email_sent_at: new Date().toISOString() }),
  });
  if (!stamp.ok) {
    console.error("waitlist: could not stamp welcome_email_sent_at", stamp.status);
  }
}

// Keeps the Resend audience in sync so future broadcasts (course launch)
// can go out from Resend without exporting the table.
async function syncResendAudience(email: string, fullName: string | null) {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) return;

  const [firstName, ...rest] = (fullName ?? "").split(/\s+/).filter(Boolean);
  const response = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      unsubscribed: false,
      ...(firstName ? { first_name: firstName } : {}),
      ...(rest.length ? { last_name: rest.join(" ") } : {}),
    }),
  });

  // 409 = contact already exists, which is fine.
  if (!response.ok && response.status !== 409) {
    console.error("waitlist: audience sync failed", response.status, await response.text());
  }
}
