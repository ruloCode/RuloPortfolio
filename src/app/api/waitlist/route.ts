import { NextResponse } from "next/server";

// Waitlist signups go to a Resend audience (https://resend.com/audiences).
// Called via the Resend REST API directly so we don't need the SDK.
const RESEND_CONTACTS_URL = (audienceId: string) =>
  `https://api.resend.com/audiences/${audienceId}/contacts`;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { email?: string; company?: string };
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

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    console.error("waitlist: RESEND_API_KEY / RESEND_AUDIENCE_ID not configured");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const response = await fetch(RESEND_CONTACTS_URL(audienceId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, unsubscribed: false }),
  });

  if (!response.ok) {
    // Resend returns 409 for contacts that already exist — that's a success
    // for the visitor ("you're on the list"), not an error.
    if (response.status === 409) {
      return NextResponse.json({ ok: true });
    }
    console.error("waitlist: Resend error", response.status, await response.text());
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
