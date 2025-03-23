import React from "react";
import {
  Button,
  Column,
  Flex,
  Heading,
  Row,
  Text,
  Avatar,
  RevealFx,
  Arrow,
} from "@/once-ui/components";
import { baseURL, routes } from "@/app/resources";
import { person, home, about, newsletter } from "@/app/resources/content";
import { Posts } from "@/components/blog/Posts";
import { Projects } from "@/components/work/Projects";
import { Mailchimp } from "@/components";

export async function generateMetadata() {
  // Optimized title (30-65 characters)
  const title = `${person.firstName}'s Portfolio | ${person.role}`;
  // Optimized description (120-320 characters)
  const description = `Explore ${person.firstName}'s professional portfolio showcasing innovative projects, case studies, and insights about ${person.role.toLowerCase()}. Discover creative solutions, technical expertise, and professional achievements.`;
  const ogImage = `/images/gallery/og_img.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: ogImage,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: person.twitter,
    },
  };
}

export default function Home() {
  // Generate structured data for homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `https://${baseURL}/#website`,
        url: `https://${baseURL}`,
        name: `${person.firstName}'s Portfolio`,
        description: home.description,
        potentialAction: {
          "@type": "SearchAction",
          target: `https://${baseURL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Person",
        "@id": `https://${baseURL}/#person`,
        name: person.name,
        jobTitle: person.role,
        description: person.headline,
        email: person.email,
        url: `https://${baseURL}`,
        sameAs: [
          person.twitter &&
            `https://twitter.com/${person.twitter.replace("@", "")}`,
          person.github && `https://github.com/${person.github}`,
          person.linkedin && person.linkedin,
        ].filter(Boolean),
      },
      {
        "@type": "ProfilePage",
        "@id": `https://${baseURL}/#profilepage`,
        url: `https://${baseURL}`,
        name: `${person.firstName}'s Portfolio - ${person.role}`,
        description: home.description,
        about: {
          "@id": `https://${baseURL}/#person`,
        },
        mainEntity: {
          "@id": `https://${baseURL}/#person`,
        },
        isPartOf: {
          "@id": `https://${baseURL}/#website`,
        },
      },
    ],
  };

  return (
    <Column as="section" gap="xl">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Column maxWidth="m" gap="xl" horizontal="center">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: home.title,
              description: home.description,
              url: `https://${baseURL}`,
              image: `https://${baseURL}/@og_img.jpg`,
              publisher: {
                "@type": "Person",
                name: person.name,
                image: {
                  "@type": "ImageObject",
                  url: `${baseURL}${person.avatar}`,
                },
              },
            }),
          }}
        />
        <Column fillWidth paddingY="l" gap="m">
          <Column maxWidth="s">
            <RevealFx
              translateY="4"
              fillWidth
              horizontal="start"
              paddingBottom="m"
            >
              <Heading wrap="balance" variant="display-strong-l">
                {home.headline}
              </Heading>
            </RevealFx>
            <RevealFx
              translateY="8"
              delay={0.2}
              fillWidth
              horizontal="start"
              paddingBottom="m"
            >
              <Text
                wrap="balance"
                onBackground="neutral-weak"
                variant="heading-default-xl"
              >
                {home.subline}
              </Text>
            </RevealFx>
            <RevealFx translateY="12" delay={0.4} horizontal="start">
              <Button
                id="about"
                data-border="rounded"
                href="/about"
                variant="secondary"
                size="m"
                arrowIcon
              >
                <Flex gap="8" vertical="center">
                  {about.avatar.display && (
                    <Avatar
                      style={{ marginLeft: "-0.75rem", marginRight: "0.25rem" }}
                      src={person.avatar}
                      size="m"
                    />
                  )}
                  {about.title}
                </Flex>
              </Button>
            </RevealFx>
          </Column>
        </Column>
        <RevealFx translateY="16" delay={0.6}>
          <Projects range={[1, 1]} />
        </RevealFx>
        {routes["/blog"] && (
          <Flex fillWidth gap="24" mobileDirection="column">
            <Flex flex={1} paddingLeft="l">
              <Heading as="h2" variant="display-strong-xs" wrap="balance">
                Latest from the blog
              </Heading>
            </Flex>
            <Flex flex={3} paddingX="20">
              <Posts range={[1, 2]} columns="2" />
            </Flex>
          </Flex>
        )}
        <Projects range={[2]} />
        {newsletter.display && <Mailchimp newsletter={newsletter} />}
      </Column>
    </Column>
  );
}
