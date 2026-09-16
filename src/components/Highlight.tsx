import type { ReactNode } from "react";
import brand from "@/styles/brand.module.scss";

/**
 * Wraps one substring of a heading in the brand mark — the same solid green
 * the scroll-world's stations use for their key phrase. Works on plain text
 * only: a ReactNode title is returned untouched. No HTML is parsed, so the
 * copy in messages can never inject markup.
 */
export function highlight(title: ReactNode, word?: string): ReactNode {
  if (typeof title !== "string" || !word) return title;
  const at = title.indexOf(word);
  if (at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <em className={brand.mark}>{word}</em>
      {title.slice(at + word.length)}
    </>
  );
}
