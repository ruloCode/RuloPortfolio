import { getTranslations } from "next-intl/server";
import { routes } from "@/app/resources";
import { localizeHref } from "@/i18n/routing";
import { buildWorldConfig, PRELOAD } from "@/lib/scroll-world/sections";
import { StageWorld } from "./StageWorld";

// El primer clip se precarga eligiendo el mismo códec y viewport que elegirá
// el motor (misma detección con canPlayType). Un <link rel=preload> estático
// no sirve aquí: la URL correcta depende del navegador.
const PRELOAD_CLIP_SCRIPT = `(function(){try{
var v=document.createElement('video');
var c=v.canPlayType('video/mp4; codecs="av01.0.08M.08"')?'av1':v.canPlayType('video/mp4; codecs="hvc1.1.6.L123.B0"')?'hevc':'h264';
var mob=matchMedia('(hover:none) and (pointer:coarse)').matches||matchMedia('(max-width:860px)').matches;
var S=${JSON.stringify({ d: PRELOAD.clipDesktop, m: PRELOAD.clipMobile })};
var l=document.createElement('link');l.rel='preload';l.as='video';l.href=(mob?S.m:S.d)[c];
document.head.appendChild(l);
}catch(e){}})();`;

/** Las 7 estaciones de la home: config del locale + precargas del primer tramo. */
export async function ScrollWorld({ locale }: { locale: string }) {
  const t = await getTranslations("scroll");
  const tNav = await getTranslations("nav");
  const links = (["/about", "/services", "/blog"] as const)
    .filter((route) => routes[route])
    .map((route) => ({ label: tNav(route.slice(1)), href: localizeHref(locale, route) }));
  const config = buildWorldConfig(t, localizeHref(locale, "/ia"), links, {
    navLabel: t("stationsNav"),
    linksLabel: tNav("mainNav"),
  });

  return (
    <>
      {/* React 19 los eleva al <head>; media= evita bajar el póster que no toca. */}
      <link rel="preload" as="image" href={PRELOAD.stillMobile} media="(max-width:860px)" />
      <link rel="preload" as="image" href={PRELOAD.stillDesktop} media="(min-width:861px)" />
      <script dangerouslySetInnerHTML={{ __html: PRELOAD_CLIP_SCRIPT }} />
      <div id="top" />
      <StageWorld config={config} />
    </>
  );
}
