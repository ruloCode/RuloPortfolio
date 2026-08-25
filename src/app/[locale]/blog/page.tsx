import { notFound } from "next/navigation";
import { Column, Heading } from "@/once-ui/components";
import { WaitlistForm } from "@/components";
import { Posts } from "@/components/blog/Posts";
import { baseURL, routes } from "@/app/resources";
import { createI18nContent } from "@/app/resources/content-i18n";
import { localeAlternates } from "@/app/utils/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

interface PageParams {
  params: { locale: string };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: PageParams) {
  // While the route is disabled it must not leak its real title/OG over a 404 body.
  if (!routes["/blog"]) return {};
  const t = await getTranslations({ locale });
  const { blog } = createI18nContent(t);
  const title = blog.title;
  const description = blog.description;
  const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    alternates: localeAlternates(locale, "/blog"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://${baseURL}/blog`,
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Blog({ params: { locale } }: PageParams) {
  if (!routes["/blog"]) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();
  const { blog, person, newsletter } = createI18nContent(t);

  return (
    <Column maxWidth="s">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            headline: blog.title,
            description: blog.description,
            url: `https://${baseURL}/blog`,
            image: `https://${baseURL}/og?title=${encodeURIComponent(blog.title)}`,
            author: {
              "@type": "Person",
              name: person.name,
              image: {
                "@type": "ImageObject",
                url: `https://${baseURL}${person.avatar}`,
              },
            },
          }),
        }}
      />
      <Heading marginBottom="l" variant="display-strong-s">
        {blog.title}
      </Heading>
      <Column fillWidth flex={1}>
        <Posts range={[1, 1]} variant="featured" locale={locale} />
        <Posts range={[2, 4]} thumbnail locale={locale} />
        <Posts range={[5]} columns="2" locale={locale} />
      </Column>
      {newsletter.display && <WaitlistForm newsletter={newsletter} />}
    </Column>
  );
}
