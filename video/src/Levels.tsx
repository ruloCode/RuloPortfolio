import { loadFont as loadHeading } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brand, gradient, wash } from "./brand";

// Weights and subsets pinned: the defaults load every variant of both
// families, which is 189 network requests before the first frame renders.
const { fontFamily: heading } = loadHeading("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
});
const { fontFamily: body } = loadBody("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

export type LevelsProps = {
  title: string;
  levels: { name: string; blurb: string }[];
  closing: string;
};

/** Seconds each rung holds the screen before the next one arrives. */
const HOLD = 3;
const INTRO = 2;
const OUTRO = 4;

export const levelsDuration = (levelCount: number, fps: number) =>
  Math.round((INTRO + levelCount * HOLD + OUTRO) * fps);

/**
 * One rung of the ladder. Springs in, then stays: the earlier levels remain on
 * screen as the new ones arrive, because the point of the piece is the shape
 * of the whole ladder, not each step in isolation.
 */
const Rung = ({
  index,
  name,
  blurb,
  appearAt,
}: {
  index: number;
  name: string;
  blurb: string;
  appearAt: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - appearAt,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(0.6 * fps),
  });

  // The newest rung is the loud one; the ones below it recede rather than
  // disappear, so the eye keeps the whole ladder in view.
  const isCurrent = frame >= appearAt && frame < appearAt + HOLD * fps;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        marginLeft: index * 56,
        padding: "26px 34px",
        borderRadius: 20,
        background: brand.surface,
        border: `1px solid ${isCurrent ? brand.emeraldSoft : brand.hairline}`,
        boxShadow: isCurrent
          ? "0 18px 40px -24px rgba(4, 120, 87, 0.55)"
          : "0 8px 20px -18px rgba(10, 15, 13, 0.4)",
        opacity: interpolate(entrance, [0, 1], [0, isCurrent ? 1 : 0.55]),
        transform: `translateY(${interpolate(entrance, [0, 1], [26, 0])}px)`,
      }}
    >
      <span
        style={{
          fontFamily: heading,
          fontSize: 34,
          color: brand.emerald,
          minWidth: 40,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {index + 1}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontFamily: heading, fontSize: 40, color: brand.ink }}>{name}</span>
        <span style={{ fontFamily: body, fontSize: 24, color: brand.body }}>{blurb}</span>
      </div>
    </div>
  );
};

export const Levels = ({ title, levels, closing }: LevelsProps) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const titleIn = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(0.7 * fps),
  });

  // The ladder steps aside for the closing line rather than cutting: a hard
  // cut on the last beat reads as the file ending, not as a conclusion.
  const outroStart = durationInFrames - OUTRO * fps;
  const ladderOut = interpolate(frame, [outroStart, outroStart + 0.5 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: wash, padding: 96, justifyContent: "center" }}>
      <div style={{ opacity: ladderOut }}>
        <h1
          style={{
            fontFamily: heading,
            fontSize: 84,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: brand.ink,
            margin: "0 0 48px",
            opacity: titleIn,
            transform: `translateY(${interpolate(titleIn, [0, 1], [24, 0])}px)`,
          }}
        >
          {title}
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {levels.map((level, index) => (
            <Rung
              key={level.name}
              index={index}
              name={level.name}
              blurb={level.blurb}
              appearAt={Math.round((INTRO + index * HOLD) * fps)}
            />
          ))}
        </div>
      </div>

      <Sequence from={Math.round(outroStart + 0.3 * fps)}>
        <ClosingLine text={closing} />
      </Sequence>
    </AbsoluteFill>
  );
};

const ClosingLine = ({ text }: { text: string }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(0.8 * fps),
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: 96 }}>
      <p
        style={{
          fontFamily: heading,
          fontSize: 76,
          lineHeight: 1.12,
          letterSpacing: "-0.02em",
          margin: 0,
          maxWidth: 1500,
          backgroundImage: gradient,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [28, 0])}px)`,
        }}
      >
        {text}
      </p>
    </AbsoluteFill>
  );
};
