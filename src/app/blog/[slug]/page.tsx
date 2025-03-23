import { notFound } from "next/navigation";
import { CustomMDX } from "@/components/mdx";
import { getPosts } from "@/app/utils/utils";
import { AvatarGroup, Button, Column, Heading, Row, Text } from "@/once-ui/components";
import { baseURL } from "@/app/resources";
import { person } from "@/app/resources/content";
import { formatDate } from "@/app/utils/formatDate";
import ScrollToHash from "@/components/ScrollToHash";

interface BlogParams {
  params: {
    slug: string;
  };
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getPosts(["src", "app", "blog", "posts"]);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params: { slug } }: BlogParams) {
  let post = getPosts(["src", "app", "blog", "posts"]).find((post) => post.slug === slug);

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
      ? `${description} Read more about ${person.firstName}'s insights on this topic.`
      : description;
      
  let ogImage = image ? `https://${baseURL}${image}` : `https://${baseURL}/@og_img.jpg`;

  // Generate keywords based on post metadata
  const keywords = [
    title,
    description,
    person.name,
    person.role,
    'portfolio',
    'blog',
    'web development',
    `${person.firstName}'s blog`,
    'technology',
    'design'
  ].filter(Boolean).join(', ');

  return {
    title: optimizedTitle,
    description: optimizedDescription,
    keywords,
    alternates: {
      canonical: `https://${baseURL}/blog/${post.slug}`,
    },
    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      type: "article",
      publishedTime,
      url: `https://${baseURL}/blog/${post.slug}`,
      siteName: `${person.firstName}'s Portfolio`,
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} | ${person.name}`,
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

export default function Blog({ params }: BlogParams) {
  let post = getPosts(["src", "app", "blog", "posts"]).find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  const avatars =
    post.metadata.team?.map((person) => ({
      src: person.avatar,
    })) || [];

  // Generate structured data for the blog post
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metadata.title,
    datePublished: post.metadata.publishedAt,
    dateModified: post.metadata.publishedAt,
    description: post.metadata.summary,
    image: post.metadata.image
      ? `https://${baseURL}${post.metadata.image}`
      : `https://${baseURL}/og?title=${post.metadata.title}`,
    url: `https://${baseURL}/blog/${post.slug}`,
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
      "@id": `https://${baseURL}/blog/${post.slug}`,
    },
    keywords: [
      post.metadata.title,
      post.metadata.summary,
      "blog",
      "portfolio",
      person.name,
      person.role,
    ].filter(Boolean).join(", "),
  };

  return (
    <Column as="section" maxWidth="xs" gap="l">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Button href="/blog" weight="default" variant="tertiary" size="s" prefixIcon="chevronLeft">
        Posts
      </Button>
      <Heading variant="display-strong-s">{post.metadata.title}</Heading>
      <Row gap="12" vertical="center">
        {avatars.length > 0 && <AvatarGroup size="s" avatars={avatars} />}
        <Text variant="body-default-s" onBackground="neutral-weak">
          {formatDate(post.metadata.publishedAt)}
        </Text>
      </Row>
      <Column as="article" fillWidth>
        <CustomMDX source={post.content} />
      </Column>
      <ScrollToHash />
    </Column>
  );
}
