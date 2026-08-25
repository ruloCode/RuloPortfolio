import mdx from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
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
