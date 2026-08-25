import type { Order } from "@polar-sh/sdk/models/components/order";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription";
import type { SupabaseClient } from "@supabase/supabase-js";

// Mirrors private.is_entitled() in the enrollments migration. The two MUST
// stay in sync: SQL uses it at signup, this uses it at webhook time. An
// unknown status fails closed (not entitled) in both.
const ENTITLED_STATUSES = new Set(["paid", "active", "trialing", "past_due", "canceled"]);

function isEntitled(status: string, currentPeriodEnd: string | null): boolean {
  if (!ENTITLED_STATUSES.has(status)) return false;
  if (!currentPeriodEnd) return true;
  return new Date(currentPeriodEnd) > new Date();
}

type Identity = { email: string; userId: string | null };

function subscriptionIdentity(sub: Subscription): Identity | null {
  const email = sub.customer.email?.toLowerCase();
  if (!email) return null;
  return { email, userId: sub.customer.externalId ?? null };
}

// One row per subscription, keyed by (provider, subscription id). Polar
// delivers webhooks at-least-once, so every handler is an upsert — replays
// are harmless by construction.
export async function upsertSubscriptionEnrollment(
  supabase: SupabaseClient,
  sub: Subscription,
): Promise<void> {
  const identity = subscriptionIdentity(sub);
  if (!identity) {
    console.error("billing: subscription without customer email", sub.id);
    return;
  }

  const row: Record<string, unknown> = {
    provider: "polar",
    provider_reference: sub.id,
    kind: "subscription",
    person_email: identity.email,
    product_id: sub.productId,
    status: sub.status,
    amount_cents: sub.amount ?? null,
    currency: sub.currency ?? null,
    current_period_end: sub.currentPeriodEnd
      ? new Date(sub.currentPeriodEnd).toISOString()
      : null,
    raw_payload: sub,
  };
  // Never overwrite a known user_id with null: the signup trigger may have
  // linked the row already, and an upsert SETs every column it is given.
  if (identity.userId) row.user_id = identity.userId;

  const { error } = await supabase
    .from("enrollments")
    .upsert(row, { onConflict: "provider,provider_reference" });
  if (error) {
    // Throwing makes the webhook route 500, which is what Polar needs to see
    // to retry. Swallowing it would silently strand a paying customer.
    throw new Error(`billing: enrollment upsert failed: ${error.message}`);
  }
}

// One-time purchases only. Renewal orders of a subscription arrive here too
// (order.paid fires per cycle) — those are the subscription events' job.
export async function recordOneTimeOrder(
  supabase: SupabaseClient,
  order: Order,
): Promise<boolean> {
  if (order.subscriptionId) return false;

  const email = order.customer?.email?.toLowerCase();
  if (!email) {
    console.error("billing: order without customer email", order.id);
    return false;
  }

  const row: Record<string, unknown> = {
    provider: "polar",
    provider_reference: order.id,
    kind: "one_time",
    person_email: email,
    product_id: order.productId,
    status: "paid",
    amount_cents: order.totalAmount,
    currency: order.currency,
    current_period_end: null,
    paid_at: new Date(order.createdAt).toISOString(),
    raw_payload: order,
  };
  const externalId = order.customer?.externalId;
  if (externalId) row.user_id = externalId;

  const { error } = await supabase
    .from("enrollments")
    .upsert(row, { onConflict: "provider,provider_reference" });
  if (error) {
    throw new Error(`billing: order insert failed: ${error.message}`);
  }
  return true;
}

// role is derived, never stored by hand: an entitled enrollment flips the
// profile to 'student', and losing the last entitlement flips it back.
// Two deliberate boundaries:
//   - 'admin' is never touched. A subscription event must not demote the owner.
//   - An email with NO enrollment rows at all is not ours to judge: the owner
//     may have comped that account by hand, and silence is not evidence.
export async function syncRoleForEmail(
  supabase: SupabaseClient,
  email: string,
  userId?: string | null,
): Promise<void> {
  const { data: rows, error } = await supabase
    .from("enrollments")
    .select("status, current_period_end")
    .eq("person_email", email);
  if (error) throw new Error(`billing: enrollment read failed: ${error.message}`);
  if (!rows || rows.length === 0) return;

  const entitled = rows.some((row) => isEntitled(row.status, row.current_period_end));

  const profileQuery = userId
    ? supabase.from("profiles").select("id, role").eq("id", userId).maybeSingle()
    : supabase
        .from("profiles")
        .select("id, role")
        .ilike("email", email.replace(/[%_\\]/g, (m) => `\\${m}`))
        .maybeSingle();
  const { data: profile, error: profileError } = await profileQuery;
  if (profileError) throw new Error(`billing: profile read failed: ${profileError.message}`);
  // No account yet: the enrollment waits, and handle_new_user() picks it up
  // at signup. That path is a feature, not a gap.
  if (!profile || profile.role === "admin") return;

  const next = entitled ? "student" : "waitlist";
  if (profile.role === next) return;

  // The service key means auth.uid() is NULL, which is exactly the condition
  // the profiles_guard_role trigger allows. This update is the audited path.
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: next })
    .eq("id", profile.id);
  if (updateError) throw new Error(`billing: role update failed: ${updateError.message}`);
  console.log(`billing: ${email} → ${next}`);
}
