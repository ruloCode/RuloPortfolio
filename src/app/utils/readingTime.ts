const WORDS_PER_MINUTE = 200;

/** Estimated reading time in minutes for raw MDX content. */
export function readingTime(content: string): number {
  const words = content
    .replace(/```[\s\S]*?```/g, " ") // code blocks read faster than prose
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
