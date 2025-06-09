"use client";

import React from "react";
import { Avatar, Flex } from "@/once-ui/components";

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  linkedIn: string;
}

interface TeamAvatarsProps {
  team: TeamMember[];
  size?: "xs" | "s" | "m" | "l" | "xl";
  reverse?: boolean;
}

export const TeamAvatars: React.FC<TeamAvatarsProps> = ({ 
  team, 
  size = "m", 
  reverse = false 
}) => {
  const displayTeam = reverse ? [...team].reverse() : team;

  return (
    <Flex gap="8" vertical="center">
      {displayTeam.map((member, index) => (
        <a
          key={index}
          href={member.linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'relative',
            zIndex: displayTeam.length - index,
            marginLeft: index > 0 ? '-8px' : '0',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.transform = 'scale(1)';
          }}
          title={`${member.name} - ${member.role}`}
        >
          <Avatar
            src={member.avatar}
            size={size}
            style={{
              border: '2px solid var(--neutral-border-strong)',
            }}
          />
        </a>
      ))}
    </Flex>
  );
}; 