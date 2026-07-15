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
    // getPosts() reads MDX with fs from a path built at runtime, so the file
    // tracer can't narrow it down and drags the whole project dir into every
    // serverless function (644MB+ on Vercel, over its 250MB limit). Only the
    // src/ MDX content is actually read at runtime; exclude the rest.
    outputFileTracingExcludes: {
      "*": [
        ".next/cache/**",
        ".git/**",
        "public/**",
        ".playwright-mcp/**",
        ".agents/**",
        ".claude/**",
      ],
    },
  },
};

export default withNextIntl(withMDX(nextConfig));
