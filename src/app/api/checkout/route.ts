import { getSessionProfile } from "@/lib/auth/session";
import { Polar } from "@polar-sh/sdk";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Creates a Polar checkout session for the signed-in waitlist user.
//
// The client sends NOTHING about what is being bought or who is buying it —
// "quiero comprar" is the entire request. The product (and therefore the
// price) comes from POLAR_PRODUCT_ID on the server, and the identity comes
// from the verified session. A browser that could pick the product or the
// email would be a browser that could buy the course for $1 under someone
// else's name.
export async function POST() {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // Students and admins already have access — there is nothing to sell them.
  if (profile.role !== "waitlist") {
    return NextResponse.json({ error: "already_enrolled" }, { status: 409 });
  }

  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  const productId = process.env.POLAR_PRODUCT_ID;
  if (!accessToken || !productId) {
    console.error("checkout: POLAR_ACCESS_TOKEN / POLAR_PRODUCT_ID not configured");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://rulocode.com").replace(/\/$/, "");
  const polar = new Polar({
    accessToken,
    // Fails closed to sandbox: an unset POLAR_SERVER must never charge real
    // money. Production sets POLAR_SERVER=production explicitly.
    server: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
  });

  try {
    const checkout = await polar.checkouts.create({
      products: [productId],
      // This is the piece that lets the webhook grant access without
      // guessing: the Supabase user id rides along and comes back in every
      // subscription/order event as customer.externalId.
      externalCustomerId: profile.userId,
      customerEmail: profile.email ?? undefined,
      customerName: profile.fullName ?? undefined,
      // The embed iframe redirects the parent window here on success. This
      // URL grants NOTHING — it is UX ("we're confirming"), the webhook is
      // the authority. checkout_id in the query is a hint, not a credential.
      successUrl: `${siteUrl}/${profile.locale}/dashboard?checkout_id={CHECKOUT_ID}`,
      returnUrl: `${siteUrl}/${profile.locale}/dashboard`,
      embedOrigin: siteUrl,
      metadata: { supabase_user_id: profile.userId },
    });
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("checkout: Polar session failed", error);
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
