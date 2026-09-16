import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { baseURL } from "@/app/resources";
import { person } from "@/app/resources/content";

// The edge runtime is deprecated as of Next 16. On Node the font can't be
// fetch()ed from a file URL, so it's read off disk instead — which is why
// next.config.mjs traces public/fonts into the lambda.
export const runtime = "nodejs";

// La tarjeta lleva la paleta del sitio: papel hueso, título en tinta, el rulo
// en verde. 1200×630 es lo que recorta cualquier scraper.
//
// Los titulares van en Space Grotesk 700, la misma fuente que los del sitio.
// Antes se componían en Inter porque era la única cargada, y la tarjeta que
// se comparte —que para mucha gente es el primer contacto con la marca— no
// hablaba el mismo idioma que la página a la que lleva.
const BONE = "#F4F1EA";
const INK = "#111110";
const INK_SOFT = "#4F4C45";
const EMERALD = "#08533C";
const HAIR = "#DCD7CB";

// El título manda, así que el cuerpo se elige por lo que ocupa, no al revés.
// Con Space Grotesk 700 a -0,03 em entran ~19 caracteres por línea a 88 px
// sobre los 1000 px de caja, y tres líneas es el techo antes de comerse la
// firma de abajo.
function titleSize(length: number) {
  if (length <= 34) return 88;
  if (length <= 60) return 72;
  if (length <= 92) return 58;
  return 48;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = (url.searchParams.get("title") || "rulocode").slice(0, 140);
  const eyebrow = (url.searchParams.get("eyebrow") || "rulocode.com").slice(0, 40);
  // OJO con los pesos: public/fonts/Inter.ttf es Inter BOLD (usWeightClass
  // 700), pese al nombre. Era la única cara cargada, así que TODO el texto de
  // la tarjeta salía en negrita — el cargo, el epígrafe, todo. De ahí que la
  // pieza se viera apelmazada sin que se notara por qué.
  const [interRegular, interBold, spaceGrotesk, markSvg] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/Inter-Regular.ttf")),
    readFile(join(process.cwd(), "public/fonts/Inter.ttf")),
    readFile(join(process.cwd(), "public/fonts/SpaceGrotesk-Bold.ttf")),
    // El transparente, no la placa: sobre el papel hueso el rulo va suelto,
    // como en la cabecera del sitio. Está quieto, así que satori lo rasteriza
    // completo — con la animación dentro salía el trazo a medio dibujar.
    readFile(join(process.cwd(), "public/brand/mark.svg"), "utf8"),
  ]);
  const mark = `data:image/svg+xml;base64,${Buffer.from(markSvg).toString("base64")}`;
  const size = titleSize(title.length);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: BONE,
        fontFamily: "Inter",
        color: INK,
      }}
    >
      {/* La franja verde del borde superior es la misma que corona el sitio.
          A tamaño de miniatura, en un feed, es lo único que se lee como
          color de marca antes de que el título sea legible. */}
      <div style={{ display: "flex", width: "100%", height: "12px", background: EMERALD }} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "space-between",
          padding: "52px 72px 56px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: EMERALD,
              letterSpacing: "0.14em",
            }}
          >
            {eyebrow.toUpperCase()}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark} width={108} height={108} alt="" />
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Space Grotesk",
            fontSize: `${size}px`,
            lineHeight: 1.04,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            maxWidth: "1000px",
            paddingBottom: "8px",
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: "100%", height: "1px", background: HAIR }} />
          <div style={{ display: "flex", alignItems: "center", gap: "22px", paddingTop: "28px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={"https://" + baseURL + person.avatar}
              width={68}
              height={68}
              style={{ objectFit: "cover", borderRadius: "100%" }}
              alt=""
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {/* El nombre en la fuente de los titulares y el cargo en la del
                  cuerpo: es la misma jerarquía del sitio, y además evita
                  pedirle a satori dos pesos de Inter cuando solo hay una cara
                  cargada — que era por lo que el cargo salía en negrita. */}
              <span
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: "30px",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {person.name}
              </span>
              <span style={{ fontSize: "23px", fontWeight: 400, color: INK_SOFT }}>
                {person.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: interRegular, weight: 400, style: "normal" },
        { name: "Inter", data: interBold, weight: 700, style: "normal" },
        { name: "Space Grotesk", data: spaceGrotesk, weight: 700, style: "normal" },
      ],
    },
  );
}
