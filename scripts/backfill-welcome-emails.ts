/**
 * Sends the welcome email to waitlist rows that never got one
 * (welcome_email_sent_at is null) and stamps them on success.
 *
 * Needed because the email is best-effort at signup time: when Resend is
 * misconfigured (e.g. an unverified sender domain) the signup still succeeds
 * and the row is left unstamped. Fix the config, then run this to catch up.
 *
 *   npx tsx scripts/backfill-welcome-emails.ts --dry-run   # list recipients
 *   npx tsx scripts/backfill-welcome-emails.ts             # actually send
 *
 * Reads env from .env.local. Safe to re-run: stamped rows are skipped.
 */
import { readFileSync } from "node:fs";
import { buildWelcomeEmail, resolveWelcomeLocale } from "../src/app/api/waitlist/welcome-email";

type PendingRow = { id: string; email: string; locale: string | null };

const loadEnvLocal = () => {
  let raw: string;
  try {
    raw = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  }
};

const main = async () => {
  loadEnvLocal();
  const dryRun = process.argv.includes("--dry-run");

  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WAITLIST_FROM_EMAIL;

  const missing = Object.entries({
    SUPABASE_URL: supabaseUrl,
    SUPABASE_SECRET_KEY: secretKey,
    RESEND_API_KEY: apiKey,
    WAITLIST_FROM_EMAIL: from,
  })
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(", ")}`);
    process.exit(1);
  }

  const query = `${supabaseUrl}/rest/v1/waitlist?welcome_email_sent_at=is.null&select=id,email,locale`;
  const response = await fetch(query, { headers: { apikey: secretKey! } });
  if (!response.ok) {
    console.error(`Supabase query failed: ${response.status} ${await response.text()}`);
    process.exit(1);
  }

  const pending: PendingRow[] = await response.json();
  if (!pending.length) {
    console.log("No pending welcome emails.");
    return;
  }

  console.log(`${pending.length} pending: ${pending.map((r) => r.email).join(", ")}`);
  if (dryRun) {
    console.log(`Dry run — would send from "${from}". No emails sent.`);
    return;
  }

  let sent = 0;
  for (const row of pending) {
    const { subject, html, text } = buildWelcomeEmail(resolveWelcomeLocale(row.locale ?? undefined));
    const send = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [row.email], subject, html, text }),
    });

    if (!send.ok) {
      console.error(`  ✗ ${row.email}: ${send.status} ${await send.text()}`);
      continue;
    }

    const stamp = await fetch(`${supabaseUrl}/rest/v1/waitlist?id=eq.${row.id}`, {
      method: "PATCH",
      headers: { apikey: secretKey!, "Content-Type": "application/json" },
      body: JSON.stringify({ welcome_email_sent_at: new Date().toISOString() }),
    });
    if (!stamp.ok) {
      console.error(`  ! ${row.email}: sent but not stamped (${stamp.status}) — may resend`);
      continue;
    }

    console.log(`  ✓ ${row.email}`);
    sent += 1;
  }

  console.log(`Sent ${sent}/${pending.length}.`);
};

main();
