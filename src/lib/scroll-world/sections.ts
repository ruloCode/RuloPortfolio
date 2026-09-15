// Config del mundo: las 7 estaciones de la home. Los textos viven en
// messages/{es,en}.json bajo `scroll`; aquí solo se casan con sus clips.
//
// Las URLs salen del manifest hasheado (pnpm scroll:assets). Si falta una
// entrada, el build revienta aquí en vez de servir un 404 silencioso.
import manifest from "./asset-manifest.json";

export type ClipSources = { av1: string; hevc: string; h264: string };

export type StationConfig = {
  id: string;
  label: string;
  still: string;
  stillMobile: string;
  clip: ClipSources;
  clipMobile: ClipSources;
  accent: string;
  copyAt?: number;
  eyebrow: string;
  title: string;
  body: string;
  tags: string[];
  cta?: { primary: { label: string; href: string } };
};

export type WorldConfig = {
  brand: { name: string; href: string; logo: string };
  cta: { label: string; href: string };
  hint: string;
  copyAt: number;
  sections: StationConfig[];
};

/** URL pública (hasheada) de un asset del scroll-world, por su nombre original. */
export const scrollAsset = (name: string): string => asset(name);

const asset = (name: string): string => {
  const url = (manifest as Record<string, string>)[name];
  if (!url) throw new Error(`Asset sin entrada en el manifest: ${name} — corre \`pnpm scroll:assets\``);
  return url;
};

const clips = (n: number): { clip: ClipSources; clipMobile: ClipSources } => ({
  clip: {
    av1: asset(`s${n}-1080.av1.mp4`),
    hevc: asset(`s${n}-1080.hevc.mp4`),
    h264: asset(`s${n}-1080.h264.mp4`),
  },
  clipMobile: {
    av1: asset(`s${n}-720m.av1.mp4`),
    hevc: asset(`s${n}-720m.hevc.mp4`),
    h264: asset(`s${n}-720m.h264.mp4`),
  },
});

const stills = (name: string) => ({
  still: asset(`${name}.webp`),
  stillMobile: asset(`${name}-m.webp`),
});

// Orden narrativo: la semana atascada → tu rol → copiloto → automatización →
// el reto → posicionarte → Semana 0. El id es la clave en messages y el
// ancla (#id) de la estación.
const STATIONS: { id: string; still: string; clip: number; accent: string; copyAt?: number }[] = [
  { id: "semana", still: "01-semana", clip: 1, accent: "#2E9C7B", copyAt: 2.6 },
  { id: "rol", still: "02-rol", clip: 2, accent: "#D3A048" },
  { id: "copiloto", still: "03-copiloto", clip: 3, accent: "#4C90A3" },
  { id: "automatiza", still: "04-automatiza", clip: 4, accent: "#E85E3E" },
  { id: "reto", still: "05-reto", clip: 5, accent: "#9E4B3F" },
  { id: "posicionate", still: "06-posicionate", clip: 6, accent: "#4C90A3" },
  { id: "semana0", still: "07-semana0", clip: 7, accent: "#2E9C7B" },
];

// Etiquetas: hasta 6 por estación, numeradas "1".."6" en messages, como el
// resto del catálogo (ia.pricing.card.features.N).
const TAG_KEYS = ["1", "2", "3", "4", "5", "6"] as const;

type Translator = ((key: string) => string) & { has: (key: string) => boolean };

/** Arma la config del motor con los textos del locale activo. */
export function buildWorldConfig(t: Translator, ctaHref: string): WorldConfig {
  const cta = { label: t("cta"), href: ctaHref };
  return {
    brand: { name: t("brand"), href: "#top", logo: asset("rulo-mark.svg") },
    cta,
    hint: t("hint"),
    // El panel entra a los 2.2s de clip, con la animación todavía corriendo:
    // así se puede leer sin esperar a que el vuelo termine.
    copyAt: 2.2,
    sections: STATIONS.map((s, i) => ({
      id: s.id,
      label: t(`stations.${s.id}.label`),
      ...stills(s.still),
      ...clips(s.clip),
      accent: s.accent,
      copyAt: s.copyAt,
      eyebrow: t(`stations.${s.id}.eyebrow`),
      title: t(`stations.${s.id}.title`),
      body: t(`stations.${s.id}.body`),
      tags: TAG_KEYS.filter((k) => t.has(`stations.${s.id}.tags.${k}`)).map((k) =>
        t(`stations.${s.id}.tags.${k}`),
      ),
      ...(i === STATIONS.length - 1 ? { cta: { primary: cta } } : {}),
    })),
  };
}

// Lo primero que se ve: la página lo precarga sin esperar a que el motor monte.
export const PRELOAD = {
  stillDesktop: asset("01-semana.webp"),
  stillMobile: asset("01-semana-m.webp"),
  clipDesktop: clips(1).clip,
  clipMobile: clips(1).clipMobile,
};
