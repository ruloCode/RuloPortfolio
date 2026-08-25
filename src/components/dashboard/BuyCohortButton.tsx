"use client";

import { Button, useToast } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { useState } from "react";

type Props = {
  labels: {
    cta: string;
    loading: string;
    error: string;
  };
};

// Opens the Polar checkout in a modal iframe over the dashboard — the buyer
// never leaves rulocode.com. The button knows nothing about price or
// product: POST /api/checkout decides all of that server-side and returns
// only the session URL.
export const BuyCohortButton = ({ labels }: Props) => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const onClick = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      if (!response.ok) throw new Error(`checkout ${response.status}`);
      const { url } = (await response.json()) as { url?: string };
      if (!url) throw new Error("checkout: no url");

      // Dynamic import: the embed script is only needed at the exact moment
      // of purchase, not on every dashboard load.
      const { PolarEmbedCheckout } = await import("@polar-sh/checkout/embed");
      const theme =
        document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      // On success the iframe redirects the parent window to successUrl, so
      // there is nothing to await here — the page navigates away.
      await PolarEmbedCheckout.create(url, { theme });
      // Closed without paying: give the button back.
      setLoading(false);
    } catch (error) {
      console.error(error);
      addToast({ variant: "danger", message: labels.error });
      setLoading(false);
    }
  };

  return (
    <Button
      size="m"
      arrowIcon
      // 'card' is not in the icon registry — Icon warns and renders null, so
      // the button would silently lose its glyph. 'cart' is the closest one
      // that exists.
      prefixIcon="cart"
      onClick={onClick}
      disabled={loading}
      className={brand.signatureCta}
    >
      {loading ? labels.loading : labels.cta}
    </Button>
  );
};
