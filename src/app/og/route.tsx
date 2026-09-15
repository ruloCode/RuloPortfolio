import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { baseURL } from "@/app/resources";
import { person } from "@/app/resources/content";

// The edge runtime is deprecated as of Next 16. On Node the font can't be
// fetch()ed from a file URL, so it's read off disk instead — which is why
// next.config.mjs traces public/fonts into the lambda.
export const runtime = "nodejs";

// The share card wears the site's palette: cream ground, ink title, the
// emerald mark. 1200×630 is what every scraper actually crops to.
const CREAM = "#F4EAD5";
const INK = "#241C18";
const INK_SOFT = "#5F5346";
const EMERALD = "#1A6B53";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = (url.searchParams.get("title") || "rulocode").slice(0, 120);
  const eyebrow = (url.searchParams.get("eyebrow") || "rulocode.com").slice(0, 40);
  const [fontData, markSvg] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/Inter.ttf")),
    readFile(join(process.cwd(), "public/scroll/rulo-mark.svg"), "utf8"),
  ]);
  const mark = `data:image/svg+xml;base64,${Buffer.from(markSvg).toString("base64")}`;
  // Long titles get a smaller size instead of a third line that clips.
  const titleSize = title.length > 70 ? 56 : title.length > 40 ? 68 : 84;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "64px 72px",
        background: CREAM,
        fontFamily: "Inter",
        color: INK,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mark} width={56} height={56} style={{ borderRadius: "14px" }} alt="" />
        <span style={{ fontSize: "28px", fontWeight: 700, color: EMERALD, letterSpacing: "0.08em" }}>
          {eyebrow.toUpperCase()}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: `${titleSize}px`,
          lineHeight: 1.06,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          maxWidth: "1000px",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={"https://" + baseURL + person.avatar}
          width={72}
          height={72}
          style={{ objectFit: "cover", borderRadius: "100%" }}
          alt=""
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "30px", fontWeight: 700 }}>{person.name}</span>
          <span style={{ fontSize: "24px", color: INK_SOFT }}>{person.role}</span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Inter", data: fontData, style: "normal" }],
    },
  );
}
