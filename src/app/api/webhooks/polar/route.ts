import {
  recordOneTimeOrder,
  syncRoleForEmail,
  upsertSubscriptionEnrollment,
} from "@/lib/billing/enrollments";
import { createServiceClient } from "@/lib/supabase/service";
import type { Order } from "@polar-sh/sdk/models/components/order";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { NextResponse } from "next/server";

// THE ONLY PLACE THAT GRANTS ACCESS. The successUrl redirect is UX; this
// endpoint is authority. Every handler is an upsert + a derived-role sync,
// so Polar's at-least-once delivery replays harmlessly.
//
// Deliberately NOT using the @polar-sh/nextjs adapter: it declares a peer of
// Next ^15 || ^16 and this app is on 14.2, and it pins @polar-sh/sdk ^0.47
// which installed a SECOND copy of the SDK whose types are structurally
// incompatible with the 0.49 we import here. validateEvent is the primitive
// the adapter wraps anyway, and using it directly buys explicit control over
// the status codes — which matters, because the status code is the entire
// retry protocol.

export const dynamic = "force-dynamic";
// Signature verification and the Supabase service client both need Node.
export const runtime = "nodejs";

async function syncSubscription(sub: Subscription) {
  const supabase = createServiceClient();
  await upsertSubscriptionEnrollment(supabase, sub);
  const email = sub.customer.email?.toLowerCase();
  if (email) {
    await syncRoleForEmail(supabase, email, sub.customer.externalId ?? undefined);
  }
}

async function handleOrderPaid(order: Order) {
  const supabase = createServiceClient();
  // Renewal orders of a subscription are skipped — the subscription events
  // already carry the period rollover, and a second row would make
  // "is she still entitled?" a MAX() over duplicates.
  const recorded = await recordOneTimeOrder(supabase, order);
  if (!recorded) return;
  const email = order.customer?.email?.toLowerCase();
  if (email) {
    await syncRoleForEmail(supabase, email, order.customer?.externalId ?? undefined);
  }
}

async function handleOrderRefunded(order: Order) {
  // A subscription refund arrives alongside subscription.revoked, which the
  // lifecycle sync already handles.
  if (order.subscriptionId) return;
  const email = order.customer?.email?.toLowerCase();
  if (!email) return;

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("enrollments")
    .update({ status: "refunded" })
    .eq("provider", "polar")
    .eq("provider_reference", order.id);
  if (error) throw new Error(`billing: refund update failed: ${error.message}`);
  await syncRoleForEmail(supabase, email, order.customer?.externalId ?? undefined);
}

export async function POST(request: Request) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    console.error("webhook: POLAR_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  // The RAW body — signature verification is over the exact bytes Polar
  // signed. Parsing to JSON first and re-serializing would reorder keys and
  // every signature would fail.
  const body = await request.text();
  const headers = Object.fromEntries(request.headers);

  let event: ReturnType<typeof validateEvent>;
  try {
    event = validateEvent(body, headers, secret);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      // 403, never 500: an unsigned request is not a transient failure and
      // must not make Polar retry it.
      console.error("webhook: signature verification failed");
      return NextResponse.json({ error: "invalid_signature" }, { status: 403 });
    }
    throw error;
  }

  try {
    switch (event.type) {
      // The full lifecycle funnels into one sync: the enrollment row mirrors
      // the provider verbatim and the role follows from it. active/grant,
      // canceled/keep-until-period-end and revoked/deny are the same code
      // path reading different status values.
      case "subscription.created":
      case "subscription.active":
      case "subscription.updated":
      case "subscription.canceled":
      case "subscription.uncanceled":
      case "subscription.past_due":
      case "subscription.revoked":
        await syncSubscription(event.data);
        break;

      case "order.paid":
        await handleOrderPaid(event.data);
        break;

      case "order.refunded":
        await handleOrderRefunded(event.data);
        break;

      // Everything else is acknowledged, not retried. Returning non-200 for
      // an event we simply don't act on would put Polar into a retry loop
      // over a non-problem.
      default:
        break;
    }
  } catch (error) {
    // 500 is the signal Polar needs to retry. Swallowing this would silently
    // strand a paying customer in 'waitlist'.
    console.error(`webhook: handler failed for ${event.type}`, error);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
