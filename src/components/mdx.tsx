import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import React, { ReactNode } from "react";
import remarkGfm from "remark-gfm";

import { SmartImage, SmartLink, Text } from "@/once-ui/components";
import { CodeBlock } from "@/once-ui/modules";
import { HeadingLink } from "@/components";

import { TextProps } from "@/once-ui/interfaces";
import { SmartImageProps } from "@/once-ui/components/SmartImage";
import styles from "./mdx.module.scss";

type TableProps = {
  data: {
    headers: string[];
    rows: string[][];
  };
};

function Table({ data }: TableProps) {
  const headers = data.headers.map((header, index) => <th key={index}>{header}</th>);
  const rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

type CustomLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

function CustomLink({ href, children, ...props }: CustomLinkProps) {
  if (href.startsWith("/")) {
    return (
      <SmartLink href={href} {...props}>
        {children}
      </SmartLink>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

function createImage({ alt, src, ...props }: SmartImageProps & { src: string }) {
  if (!src) {
    console.error("SmartImage requires a valid 'src' property.");
    return null;
  }

  return (
    <SmartImage
      className="my-20"
      enlarge
      radius="m"
      aspectRatio="16 / 9"
      alt={alt}
      src={src}
      {...props}
    />
  );
}

function slugify(str: string): string {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters except for -
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const CustomHeading = ({ children, ...props }: TextProps) => {
    const slug = slugify(children as string);
    return (
      <HeadingLink
        style={{ marginTop: "var(--static-space-24)", marginBottom: "var(--static-space-12)" }}
        level={level}
        id={slug}
        {...props}
      >
        {children}
      </HeadingLink>
    );
  };

  CustomHeading.displayName = `Heading${level}`;

  return CustomHeading;
}

function createParagraph({ children }: TextProps) {
  return (
    <Text
      style={{ lineHeight: "175%" }}
      variant="body-default-m"
      onBackground="neutral-medium"
      marginTop="8"
      marginBottom="12"
    >
      {children}
    </Text>
  );
}

// Markdown emits plain HTML for tables, lists, quotes and fenced code. Without
// entries here they render with no styling at all.

function MarkdownTable({ children }: { children?: ReactNode }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}

function MarkdownList({ children, ...props }: { children?: ReactNode }) {
  return (
    <ul className={styles.list} {...props}>
      {children}
    </ul>
  );
}

function MarkdownOrderedList({ children, ...props }: { children?: ReactNode }) {
  return (
    <ol className={styles.list} {...props}>
      {children}
    </ol>
  );
}

function MarkdownQuote({ children }: { children?: ReactNode }) {
  return <blockquote className={styles.blockquote}>{children}</blockquote>;
}

function MarkdownRule() {
  return <hr className={styles.hr} />;
}

/** Inline `code`. Fenced blocks arrive wrapped in <pre> and are handled there. */
function MarkdownInlineCode({ children, ...props }: { children?: ReactNode }) {
  return (
    <code className={styles.inlineCode} {...props}>
      {children}
    </code>
  );
}

/**
 * A fenced block reaches us as <pre><code class="language-x">…</code></pre>.
 * Unwrap it into CodeBlock so lesson prompts get syntax highlighting and a
 * copy button instead of raw monospace text.
 */
function MarkdownPre({ children }: { children?: ReactNode }) {
  const child = React.isValidElement(children) ? children : null;
  const className: string = child?.props?.className ?? "";
  const language = className.replace("language-", "") || "text";
  const code = String(child?.props?.children ?? "").replace(/\n$/, "");

  return (
    <CodeBlock
      marginTop="12"
      marginBottom="16"
      compact
      copyButton
      codeInstances={[{ code, language, label: language }]}
    />
  );
}

const components = {
  p: createParagraph as any,
  h1: createHeading(1) as any,
  h2: createHeading(2) as any,
  h3: createHeading(3) as any,
  h4: createHeading(4) as any,
  h5: createHeading(5) as any,
  h6: createHeading(6) as any,
  img: createImage as any,
  a: CustomLink as any,
  table: MarkdownTable as any,
  ul: MarkdownList as any,
  ol: MarkdownOrderedList as any,
  blockquote: MarkdownQuote as any,
  hr: MarkdownRule as any,
  code: MarkdownInlineCode as any,
  pre: MarkdownPre as any,
  Table,
  CodeBlock,
};

type CustomMDXProps = MDXRemoteProps & {
  components?: typeof components;
};

export function CustomMDX(props: CustomMDXProps) {
  return (
    // @ts-ignore: Suppressing type error for MDXRemote usage
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
      options={{
        mdxOptions: {
          // Tables, strikethrough and task lists are GFM extensions, not core
          // markdown. Without this they stay as literal pipe text.
          remarkPlugins: [remarkGfm],
        },
        ...(props as any).options,
      }}
    />
  );
}
