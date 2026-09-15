"use client";

import React from "react";
import { Column, Flex, Text } from "@/once-ui/components";
import styles from "./about.module.scss";

interface TableOfContentsProps {
  structure: {
    /** Stable anchor, independent of the (translated) title. */
    id: string;
    title: string;
    display: boolean;
    items: string[];
  }[];
  about: {
    tableOfContent: {
      display: boolean;
      subItems: boolean;
    };
  };
  label: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ structure, about, label }) => {
  const scrollTo = (id: string, offset: number) => {
    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (!about.tableOfContent.display) return null;

  return (
    <Column
      as="nav"
      aria-label={label}
      left="0"
      style={{
        top: "50%",
        transform: "translateY(-50%)",
        whiteSpace: "nowrap",
      }}
      position="fixed"
      paddingLeft="24"
      gap="32"
      hide="m"
    >
      {structure
        .filter((section) => section.display)
        .map((section, sectionIndex) => (
          <Column key={sectionIndex} gap="12">
            {/* A real link: it works without JS, is keyboard-reachable and
                can be opened in a new tab. The handler only smooths it. */}
            <a
              href={`#${section.id}`}
              className={styles.tocLink}
              onClick={(event) => {
                event.preventDefault();
                scrollTo(section.id, 80);
                history.replaceState(null, "", `#${section.id}`);
              }}
            >
              <Flex className={styles.hover} gap="8" vertical="center">
                <Flex height="1" minWidth="16" background="neutral-strong"></Flex>
                <Text>{section.title}</Text>
              </Flex>
            </a>
            {about.tableOfContent.subItems && (
              <>
                {section.items.map((item, itemIndex) => (
                  <Flex
                    hide="l"
                    key={itemIndex}
                    style={{ cursor: "pointer" }}
                    className={styles.hover}
                    gap="12"
                    paddingLeft="24"
                    vertical="center"
                    onClick={() => scrollTo(item, 80)}
                  >
                    <Flex height="1" minWidth="8" background="neutral-strong"></Flex>
                    <Text>{item}</Text>
                  </Flex>
                ))}
              </>
            )}
          </Column>
        ))}
    </Column>
  );
};

export default TableOfContents;
