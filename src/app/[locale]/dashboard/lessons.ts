import { getPost, getPosts, type Post } from "@/app/utils/utils";

// Relative to src/app/[locale] — getPosts anchors that prefix itself, and it
// must stay inline there for the file tracer. See utils.ts.
const LESSONS_PATH = ["dashboard", "lessons"];

export type Module = "semana-0" | "cohorte";

export const MODULES: { id: Module; requiresRole: "waitlist" | "student"; icon: string }[] = [
  { id: "semana-0", requiresRole: "waitlist", icon: "rocket" },
  // No lesson carries this module yet, so it renders as the locked state. The
  // day an MDX declares `module: cohorte`, it shows up for students — no code
  // change needed.
  { id: "cohorte", requiresRole: "student", icon: "lock" },
];

/** getPosts returns files in readdir order, so sorting by `order` is required. */
export function getLessons(locale: string): Post[] {
  return getPosts(LESSONS_PATH, locale).sort(
    (a, b) => (a.metadata.order ?? 999) - (b.metadata.order ?? 999),
  );
}

export function getLesson(locale: string, slug: string): Post | undefined {
  return getPost(LESSONS_PATH, locale, slug);
}

export function lessonsForRole(lessons: Post[], role: "waitlist" | "student"): Post[] {
  if (role === "student") return lessons;
  return lessons.filter((lesson) => lesson.metadata.requiresRole === "waitlist");
}
