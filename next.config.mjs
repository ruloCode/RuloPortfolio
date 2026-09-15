import mdx from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const IMMUTABLE = "public, max-age=31536000, immutable";

const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  async headers() {
    return [
      // Clips y stills del scroll-world llevan hash de contenido en el nombre
      // (scripts/scroll-world/hash-assets.mjs): se cachean para siempre — un
      // cambio de contenido cambia la URL.
      { source: "/scroll/vid/:path*", headers: [{ key: "Cache-Control", value: IMMUTABLE }] },
      { source: "/scroll/ia/:path*", headers: [{ key: "Cache-Control", value: IMMUTABLE }] },
      // og.jpg y rulo-mark.svg mantienen URL estable (los scrapers de redes ya
      // la tienen guardada): caché corta con revalidación en background.
      {
        source: "/scroll/:file((?:og\\.jpg|rulo-mark\\.svg))",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
  // getPosts() reads MDX with fs at request time for any path that isn't
  // prerendered. The tracer misses those files on its own because the
  // literal "[locale]" directory parses as a glob character class, so the
  // content is included explicitly ("*" matches the [locale] segment).
  // Top-level since Next 15 — it left `experimental` and is silently ignored
  // there, which looks exactly like the bug it was added to fix.
  outputFileTracingIncludes: {
    "*": [
      "src/app/*/blog/posts/**",
      "src/app/*/work/projects/**",
      "src/app/*/dashboard/lessons/**",
    ],
    // /og reads the font off disk now that it runs on Node, and public/ is
    // served by the CDN — it isn't in the lambda unless traced in.
    "/og": ["public/fonts/Inter.ttf"],
  },
};

export default withNextIntl(withMDX(nextConfig));
