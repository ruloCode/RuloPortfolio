"use client";

import { Column, Flex, Icon, IconButton, SmartImage, Tag, Text } from "@/once-ui/components";
import brand from "@/styles/brand.module.scss";
import { useState } from "react";

type LessonVideoProps = {
  videoId?: string;
  title: string;
  copy: { pendingTitle: string; pendingDescription: string; pendingBadge: string; play: string };
};

export const LessonVideo = ({ videoId, title, copy }: LessonVideoProps) => {
  const [playing, setPlaying] = useState(false);

  // The state that actually ships first: lessons are written before they're
  // recorded. Dashed border + muted icon reads as "not recorded yet", not as a
  // broken player.
  if (!videoId) {
    return (
      <Column
        fillWidth
        radius="l"
        overflow="hidden"
        background="surface"
        border="neutral-medium"
        borderStyle="dashed"
        horizontal="center"
        vertical="center"
        gap="12"
        padding="l"
        style={{ aspectRatio: "16 / 9" }}
      >
        <Icon name="youtube" size="l" onBackground="neutral-weak" />
        <Text variant="body-strong-m">{copy.pendingTitle}</Text>
        <Text
          variant="body-default-s"
          onBackground="neutral-weak"
          align="center"
          wrap="balance"
          style={{ maxWidth: "36ch" }}
        >
          {copy.pendingDescription}
        </Text>
        <Tag size="s" variant="neutral" label={copy.pendingBadge} />
      </Column>
    );
  }

  return (
    <Flex
      fillWidth
      radius="l"
      overflow="hidden"
      position="relative"
      className={brand.mediaGlow}
      style={{ aspectRatio: "16 / 9" }}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title}
          loading="lazy"
          allowFullScreen
          allow="accelerated-motion; autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        // Click-to-load facade: no YouTube JS and no cookies until play is
        // pressed, and the LCP stays the heading rather than a third-party frame.
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={copy.play}
          style={{
            all: "unset",
            cursor: "pointer",
            width: "100%",
            height: "100%",
            position: "relative",
            display: "block",
          }}
        >
          <SmartImage
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            fill
            objectFit="cover"
          />
          <Flex
            position="absolute"
            fillWidth
            fillHeight
            horizontal="center"
            vertical="center"
            style={{ inset: 0 }}
          >
            <IconButton icon="playCircle" size="l" variant="primary" tabIndex={-1} />
          </Flex>
        </button>
      )}
    </Flex>
  );
};
