import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

type Team = {
  name: string;
  role: string;
  avatar: string;
  linkedIn: string;
};

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  images: string[];
  tag?: string;
  team: Team[];
  link?: string;
  repository?: string;
};

export type Post = {
  metadata: Metadata;
  slug: string;
  content: string;
  locale: string;
  isFallback: boolean;
};

function getMDXFiles(dir: string) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(rawContent);

  const metadata: Metadata = {
    title: data.title || "",
    publishedAt: data.publishedAt,
    summary: data.summary || "",
    image: data.image || "",
    images: data.images || [],
    tag: data.tag || [],
    team: data.team || [],
    link: data.link || "",
    repository: data.repository || "",
  };

  return { metadata, content };
}

function getMDXData(dir: string, locale: string, isFallback = false): Post[] {
  const mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
      locale,
      isFallback,
    };
  });
}

/**
 * Reads MDX posts for a locale from `src/app/[locale]/<customPath>/<locale>/*.mdx`.
 * Content that only exists in the default locale is not listed for other
 * locales; use getPost() to resolve a single slug with fallback.
 */
export function getPosts(customPath: string[], locale: string = routing.defaultLocale): Post[] {
  // The static "src/app/[locale]" prefix must stay inline in this call: the
  // file tracer resolves fs reads by partially evaluating path.join, and a
  // fully dynamic path makes it bundle the entire project dir into every
  // serverless function (575MB+, over Vercel's 250MB limit).
  const postsDir = path.join(process.cwd(), "src", "app", "[locale]", ...customPath, locale);
  return getMDXData(postsDir, locale);
}

/**
 * Resolves a single post by slug for a locale, falling back to the default
 * locale when no translation exists (marked with isFallback for the UI).
 */
export function getPost(
  customPath: string[],
  locale: string,
  slug: string,
): Post | undefined {
  const localized = getPosts(customPath, locale).find((post) => post.slug === slug);
  if (localized) {
    return localized;
  }

  if (locale !== routing.defaultLocale) {
    const fallback = getPosts(customPath, routing.defaultLocale).find(
      (post) => post.slug === slug,
    );
    if (fallback) {
      return { ...fallback, isFallback: true };
    }
  }

  return undefined;
}

/** Union of slugs available across all locales (for generateStaticParams). */
export function getAllSlugs(customPath: string[]): { locale: string; slug: string }[] {
  return routing.locales.flatMap((locale) =>
    getPosts(customPath, locale).map((post) => ({ locale, slug: post.slug })),
  );
}
