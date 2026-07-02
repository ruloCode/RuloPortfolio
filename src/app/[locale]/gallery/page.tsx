import { Flex } from "@/once-ui/components";
import MasonryGrid from "@/components/gallery/MasonryGrid";
import { baseURL } from "@/app/resources";
import { createI18nContent } from "@/app/resources/content-i18n";
import { localeAlternates } from "@/app/utils/seo";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

interface PageParams {
  params: { locale: string };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: PageParams) {
  const t = await getTranslations({ locale });
  const { gallery } = createI18nContent(t);
  const title = gallery.title;
  const description = gallery.description;
  const ogImage = `https://${baseURL}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    alternates: localeAlternates(locale, "/gallery"),
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://${baseURL}/gallery`,
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

export default async function Gallery({ params: { locale } }: PageParams) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations();
  const { gallery, person } = createI18nContent(t);

  return (
    <Flex fillWidth>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            name: gallery.title,
            description: gallery.description,
            url: `https://${baseURL}/gallery`,
            image: gallery.images.map((image) => ({
              "@type": "ImageObject",
              url: `https://${baseURL}${image.src}`,
              description: image.alt,
            })),
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
      <MasonryGrid />
    </Flex>
  );
}
