import "@/once-ui/styles/index.scss";
import "@/once-ui/tokens/index.scss";

import classNames from "classnames";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  unstable_setRequestLocale,
} from "next-intl/server";

import { Footer, Header, RouteGuard, SiteShell } from "@/components";
import { baseURL, effects, style } from "@/app/resources";
import { createI18nContent } from "@/app/resources/content-i18n";
import { routing } from "@/i18n/routing";

import { Inter } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import { Source_Code_Pro } from "next/font/google";

import { Background, Column, Flex, ToastProvider } from "@/once-ui/components";
import { Analytics } from "@vercel/analytics/react";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LayoutParams {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: LayoutParams) {
  const t = await getTranslations({ locale });
  const { person, home } = createI18nContent(t);

  return {
    metadataBase: new URL(`https://${baseURL}`),
    title: home.title,
    description: home.description,
    openGraph: {
      title: `${person.firstName}'s Portfolio`,
      description: "Portfolio website showcasing my work.",
      url: `https://${baseURL}`,
      siteName: `${person.firstName}'s Portfolio`,
      locale: locale === "es" ? "es_CO" : "en_US",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

const primary = Inter({
  variable: "--font-primary",
  subsets: ["latin"],
  display: "swap",
});

type FontConfig = {
  variable: string;
};

// Space Grotesk drives every heading via --font-family-heading -> --font-secondary.
// Latin subset covers Spanish diacritics (á é í ó ú ñ ü).
const secondary: FontConfig | undefined = Space_Grotesk({
  variable: "--font-secondary",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});
const tertiary: FontConfig | undefined = undefined;

const code = Source_Code_Pro({
  variable: "--font-code",
  subsets: ["latin"],
  display: "swap",
});

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({ children, params: { locale } }: RootLayoutProps) {
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  unstable_setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <Flex
      as="html"
      lang={locale}
      suppressHydrationWarning
      background="page"
      data-neutral={style.neutral}
      data-brand={style.brand}
      data-accent={style.accent}
      data-solid={style.solid}
      data-solid-style={style.solidStyle}
      data-theme={style.theme}
      data-border={style.border}
      data-surface={style.surface}
      data-transition={style.transition}
      className={classNames(
        primary.variable,
        secondary ? secondary.variable : "",
        tertiary ? tertiary.variable : "",
        code.variable,
      )}
    >
      <head>
        <script
          // Applies the persisted theme before first paint to avoid a flash
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`,
          }}
        />
      </head>
      <ToastProvider>
        <Column style={{ minHeight: "100vh" }} as="body" fillWidth margin="0" padding="0">
          <NextIntlClientProvider messages={messages}>
            <SiteShell
              header={<Header />}
              footer={<Footer />}
              background={
                <Background
                  mask={{
                    cursor: effects.mask.cursor,
                    x: effects.mask.x,
                    y: effects.mask.y,
                    radius: effects.mask.radius,
                  }}
                  gradient={{
                    display: effects.gradient.display,
                    x: effects.gradient.x,
                    y: effects.gradient.y,
                    width: effects.gradient.width,
                    height: effects.gradient.height,
                    tilt: effects.gradient.tilt,
                    colorStart: effects.gradient.colorStart,
                    colorEnd: effects.gradient.colorEnd,
                    opacity: effects.gradient.opacity as
                      | 0
                      | 10
                      | 20
                      | 30
                      | 40
                      | 50
                      | 60
                      | 70
                      | 80
                      | 90
                      | 100,
                  }}
                  dots={{
                    display: effects.dots.display,
                    color: effects.dots.color,
                    size: effects.dots.size as any,
                    opacity: effects.dots.opacity as any,
                  }}
                  grid={{
                    display: effects.grid.display,
                    color: effects.grid.color,
                    width: effects.grid.width as any,
                    height: effects.grid.height as any,
                    opacity: effects.grid.opacity as any,
                  }}
                  lines={{
                    display: effects.lines.display,
                    opacity: effects.lines.opacity as any,
                  }}
                />
              }
            >
              <RouteGuard>{children}</RouteGuard>
            </SiteShell>
          </NextIntlClientProvider>
          <Analytics />
        </Column>
      </ToastProvider>
    </Flex>
  );
}
