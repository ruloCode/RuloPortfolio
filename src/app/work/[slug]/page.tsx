import { notFound } from "next/navigation";
import { CustomMDX } from "@/components/mdx";
import { getPosts } from "@/app/utils/utils";
import { AvatarGroup, Button, Column, Flex, Heading, SmartImage, Text } from "@/once-ui/components";
import { baseURL } from "@/app/resources";
import { person } from "@/app/resources/content";
import { formatDate } from "@/app/utils/formatDate";
import ScrollToHash from "@/components/ScrollToHash";

interface WorkParams {
  params: {
    slug: string;
  };
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getPosts(["src", "app", "work", "projects"]);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params: { slug } }: WorkParams) {
  let post = getPosts(["src", "app", "work", "projects"]).find((post) => post.slug === slug);

  if (!post) {
    return;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    images,
    image,
    team,
  } = post.metadata;
  
  // Optimize title length (30-65 characters)
  const optimizedTitle = title.length > 60 ? `${title.substring(0, 57)}...` : title;
  
  // Optimize description length (120-320 characters)
  const optimizedDescription = description.length > 320 
    ? `${description.substring(0, 317)}...` 
    : description.length < 120 
      ? `${description} View this project by ${person.firstName}.`
      : description;
      
  let ogImage = image ? `https://${baseURL}${image}` : `https://${baseURL}/@og_img.jpg`;

  // Generate keywords based on project metadata
  const keywords = [
    title,
    description,
    person.name,
    person.role,
    'portfolio',
    'project',
    'case study',
    `${person.firstName}'s work`,
    'design',
    'development'
  ].filter(Boolean).join(', ');

  return {
    title: optimizedTitle,
    description: optimizedDescription,
    keywords,
    images,
    team,
    alternates: {
      canonical: `https://${baseURL}/work/${post.slug}`,
    },
    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      type: "article",
      publishedTime,
      url: `https://${baseURL}/work/${post.slug}`,
      siteName: `${person.firstName}'s Portfolio`,
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} | Project by ${person.name}`,
        },
      ],
      authors: [person.name],
      ...(team && { "og:authors": team.map(t => t.name) }),
    },
    twitter: {
      card: "summary_large_image",
      site: person.twitter,
      title: optimizedTitle,
      description: optimizedDescription,
      images: [ogImage],
      creator: person.twitter,
    },
    viewport: "width=device-width, initial-scale=1.0",
    creator: person.name,
    publisher: person.name,
  };
}

export default function Project({ params }: WorkParams) {
  let post = getPosts(["src", "app", "work", "projects"]).find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  const avatars =
    post.metadata.team?.map((person) => ({
      src: person.avatar,
    })) || [];

  // Generate structured data for the project
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metadata.title,
    datePublished: post.metadata.publishedAt,
    dateModified: post.metadata.publishedAt,
    description: post.metadata.summary,
    image: post.metadata.image
      ? `https://${baseURL}${post.metadata.image}`
      : post.metadata.images && post.metadata.images.length > 0
      ? `https://${baseURL}${post.metadata.images[0]}`
      : `https://${baseURL}/og?title=${post.metadata.title}`,
    url: `https://${baseURL}/work/${post.slug}`,
    author: {
      "@type": "Person",
      name: person.name,
      url: `https://${baseURL}`,
      ...(person.twitter && { sameAs: `https://twitter.com/${person.twitter.replace('@', '')}` }),
    },
    publisher: {
      "@type": "Organization",
      name: person.name,
      logo: {
        "@type": "ImageObject",
        url: `https://${baseURL}/favicon.ico`,
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://${baseURL}/work/${post.slug}`,
    },
    keywords: [
      post.metadata.title,
      post.metadata.summary,
      "project",
      "portfolio",
      "case study",
      "work",
      person.name,
      person.role,
    ].filter(Boolean).join(", "),
    ...(post.metadata.team && {
      contributor: post.metadata.team.map(member => ({
        "@type": "Person",
        name: member.name,
        ...(member.linkedIn && { sameAs: member.linkedIn })
      }))
    }),
  };

  return (
    <Column as="section" maxWidth="m" horizontal="center" gap="l">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Column maxWidth="xs" gap="16">
        <Button href="/work" variant="tertiary" weight="default" size="s" prefixIcon="chevronLeft">
          Projects
        </Button>
        <Heading variant="display-strong-s">{post.metadata.title}</Heading>
      </Column>
      {post.metadata.images.length > 0 && (
        <SmartImage
          priority
          aspectRatio="16 / 9"
          radius="m"
          alt="image"
          src={post.metadata.images[0]}
        />
      )}
      <Column style={{ margin: "auto" }} as="article" maxWidth="xs">
        <Flex gap="12" marginBottom="24" vertical="center">
          {post.metadata.team && <AvatarGroup reverse avatars={avatars} size="m" />}
          <Text variant="body-default-s" onBackground="neutral-weak">
            {formatDate(post.metadata.publishedAt)}
          </Text>
        </Flex>
        <CustomMDX source={post.content} />
      </Column>
      <ScrollToHash />
    </Column>
  );
}
