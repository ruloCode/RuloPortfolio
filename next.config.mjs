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
  experimental: {
    // getPosts() reads MDX with fs at request time for any path that isn't
    // prerendered. The tracer misses those files on its own because the
    // literal "[locale]" directory parses as a glob character class, so the
    // content is included explicitly ("*" matches the [locale] segment).
    outputFileTracingIncludes: {
      "*": [
        "src/app/*/blog/posts/**",
        "src/app/*/work/projects/**",
        "src/app/*/dashboard/lessons/**",
      ],
    },
  },
};

export default withNextIntl(withMDX(nextConfig));
