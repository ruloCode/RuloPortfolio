import { getLesson } from "@/app/[locale]/dashboard/lessons";
import { SlideDeck, type Slide } from "@/components/dashboard/SlideDeck";
import { localizeHref } from "@/i18n/routing";
import { getSessionProfile } from "@/lib/auth/session";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

// Reads the session, so it must never be prerendered.
export const dynamic = "force-dynamic";

interface PageParams {
  params: { locale: string; slug: string };
}

export function generateMetadata() {
  return { robots: { index: false, follow: false } };
}

/**
 * The live deck for a class — the part the coach talks over before anyone
 * touches a keyboard.
 *
 * Authored here rather than in MDX because a deck is not prose: the slides
 * are data, and giving them a shape in TypeScript is what lets the component
 * pick a layout per slide instead of styling a wall of markdown.
 *
 * Deliberately not translated: it is one client, in one language, on one day.
 * The day a second cohort needs it in English, the slides move to MDX
 * frontmatter or to messages — not before.
 */
const DECKS: Record<string, { signature: string; slides: Slide[] }> = {
  "clase-1-tu-copiloto": {
    signature: "AI Shift · Clase 1 · Camilo",
    slides: [
      {
        eyebrow: "AI Shift · Clase 1",
        headline: "Tu primer mes con IA",
        support: "Evelyn · 25 de agosto de 2026",
      },
      {
        quote: "Cerré los ojos y me dejó.",
        footnote: "Evelyn, julio de 2026",
      },
      {
        title: "No te dejó. Cambió el mapa.",
        support:
          "En seis meses cambió el juego entero. Nadie te lo explicó porque casi nadie lo entiende completo. Empezamos por el mapa.",
      },
      {
        eyebrow: "Te hablé de capas en julio",
        title: "Hoy les ponemos nombre",
        levels: [
          { name: "El asistente", here: true },
          { name: "El proyecto" },
          { name: "El conector" },
          { name: "El agente" },
        ],
      },
      {
        eyebrow: "Nivel 1",
        title: "Le hablas, te responde",
        support:
          "Cada conversación empieza en blanco: le explicas quién eres, qué hace la fundación, para quién es el documento. Mañana lo vuelves a hacer.",
        footnote: "Aquí estás hoy. Es donde empieza todo el mundo.",
      },
      {
        eyebrow: "Nivel 2",
        title: "Una carpeta que se acuerda",
        support:
          "Le explicas tu contexto una sola vez. Todas las conversaciones que abras adentro arrancan sabiéndolo: quiénes son, cómo escribes, qué no debe inventar.",
        footnote: "Esto montamos hoy.",
      },
      {
        eyebrow: "Nivel 3",
        title: "Deja de copiar y pegar",
        support:
          "El asistente entra directo a donde tu información ya vive. Se llaman MCP: un enchufe estándar entre tus herramientas y la IA. No tienes que entenderlo — tienes que saber que existe.",
        example:
          "«Mira la carpeta de la misión de mayo y dime quién no mandó su formulario.»",
      },
      {
        eyebrow: "Nivel 4",
        title: "No responde. Hace.",
        support:
          "Le das un objetivo en vez de una pregunta, y ejecuta los pasos: busca, decide, escribe, corrige y te trae el resultado.",
        example:
          "«Arma la propuesta para este donante con el formato del año pasado y déjamela lista para revisar.»",
      },
      {
        headline: "No es qué tan inteligente es la máquina. Es cuánto contexto tiene y cuánta cuerda le das.",
      },
      {
        eyebrow: "Tu primer mes",
        title: "Tres cosas funcionando",
        items: [
          {
            title: "Un copiloto que conoce tu fundación",
            note: "Hoy, en tu teléfono. Se acabó explicarle quién eres cada vez.",
          },
          {
            title: "Una sola lista de participantes",
            note: "«La mayoría a veces son gente recurrente», dijiste. Se llena sola y sirve para cualquier misión.",
          },
          {
            title: "Propuestas armadas desde esa lista",
            note: "Del formato que ya te funciona al PDF del donante, en minutos.",
          },
        ],
        footnote: "Y los gafetes salen solos. Tenías razón: sí había algo fácil.",
      },
      {
        eyebrow: "Cómo trabajamos",
        title: "Cuatro sesiones. Tú al teclado.",
        items: [
          { title: "Todo desde el teléfono", note: "Si necesita computador, no te va a servir." },
          { title: "Tú construyes, yo explico", note: "No vienes a delegar. Vienes a saber hacerlo." },
          { title: "Cada clase queda escrita", note: "Con lo que quedó de tu lado y lo que quedó del mío." },
          { title: "Medimos las horas que recuperas", note: "Con números, no con sensaciones." },
        ],
      },
      {
        eyebrow: "En los próximos 40 minutos",
        title: "Tu proyecto, funcionando",
        items: [
          { title: "Crear el proyecto" },
          { title: "Darle tu contexto" },
          { title: "Pedirle algo real que tengas pendiente" },
        ],
        footnote: "Sales con algo funcionando, no con apuntes.",
      },
    ],
  },
};

export default async function PresentationPage({ params: { locale, slug } }: PageParams) {
  setRequestLocale(locale);

  const profile = await getSessionProfile();
  const lesson = getLesson(locale, slug);
  const deck = DECKS[slug];
  if (!lesson || !deck) notFound();

  // Same gate as the lesson it belongs to: gated classes are coach-and-student.
  const role = profile?.role ?? "waitlist";
  if (lesson.metadata.requiresRole !== "waitlist" && role === "waitlist") notFound();

  return (
    <SlideDeck
      slides={deck.slides}
      signature={deck.signature}
      exitHref={localizeHref(locale, `/dashboard/${slug}`)}
      labels={{
        prev: "Anterior",
        next: "Siguiente",
        fullscreen: "Pantalla completa (F)",
        exit: "Volver a la clase",
      }}
    />
  );
}
