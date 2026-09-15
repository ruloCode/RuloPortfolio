# Plan: rebranding del portfolio con la landing scroll-world

Fecha: 2026-09-14. Fuente: `~/dev/side/fauna-scroll-world` (Next 16, motor vanilla)
→ destino: este repo (Next 16 + next-intl + Once UI).

Regla de oro: **no se regenera ningún asset ni token**. Se copian los
clips, los stills, el manifest, el motor y el CSS de vidrio tal cual, y el
portfolio se adapta alrededor de ellos.

## 0. Qué se reutiliza y qué no

| Del scroll-world | Se reutiliza | Cómo |
|---|---|---|
| `lib/stage-engine.js` (motor + CSS en `@layer sw`) | Sí, byte a byte | `src/lib/scroll-world/stage-engine.js` |
| `app/globals.css` (tokens `--sw-*`, material soft-glass, móvil) | Sí | `src/styles/scroll-world.css`, importado solo desde la home |
| `lib/asset-manifest.json` + `public/assets/vid` (65 MB) + `public/assets/ia` (1,3 MB) | Sí, hasheados como están | `public/scroll/vid`, `public/scroll/ia` (cambia solo el prefijo de URL) |
| `scripts/hash-assets.mjs`, `encode-videos.sh`, `extract-posters.sh` | Sí, con rutas nuevas | `scripts/scroll-world/` |
| `lib/sections.ts` (copy de las 7 estaciones) | La estructura sí; la copia pasa a `messages/es.json` y `en.json` | `src/lib/scroll-world/sections.ts` lee `t()` |
| `components/StageWorld.tsx` | Sí, con `mount` una vez | `src/components/scroll-world/StageWorld.tsx` |
| `app/layout.tsx` (precargas póster + clip por códec) | Sí, la lógica; va al `layout` del locale condicionada a la home | `src/components/scroll-world/ScrollWorldPreload.tsx` |
| `next.config.ts` (headers `immutable`) | Sí | se añaden a `next.config.mjs` |
| `assets/vid/ia` masters (97 MB) y `media/encoded` | No se despliegan | quedan en fauna-scroll-world; `.vercelignore` no hace falta aquí |
| `rulo-mark.svg`, `og.jpg` | Sí | `public/scroll/` con URL estable |

Tokens del portfolio que se mantienen: `style.brand = emerald`, tema claro,
Space Grotesk para display e Inter para cuerpo. El scroll-world usaba
`ui-rounded`; en la copia se mapea `--sw-font-display: var(--font-secondary)`
y `--sw-font-body: var(--font-primary)`. Nada más cambia.

## 1. Fase 1 — La landing (home)

### 1.1 Colisiones a resolver (esto es lo que rompe si se copia sin más)

1. **`html { scroll-snap-type: y mandatory }` y el fondo del body.** El motor
   los inyecta globalmente. En el portfolio hay Header, Footer y `<Background>`
   con gradiente que sigue al cursor; el snap se comería el resto de páginas
   si el CSS quedara vivo. Solución: `StageWorld` añade `data-scroll-world`
   al `<html>` al montar y lo quita al desmontar; el CSS copiado se
   envuelve en `html[data-scroll-world]`. El motor no tiene `unmount`
   (registra listeners globales): hay que añadir un `destroy()` que quite
   listeners de `scroll`, `resize`, `click` y los gestos, y liberar los
   `<video>`. Sin esto, navegar a `/about` con `Link` deja el motor
   escuchando el scroll de otra página.
2. **`SiteShell` pinta chrome de marketing.** Igual que ya hace con
   `/dashboard`, la home (`/` y `/es`) pasa a ser una ruta "sin shell": ni
   Header, ni Footer, ni `<Background>`, ni `paddingX="l"`. El topbar del
   motor es el header de la home. Lo único que se conserva es el
   `skip-link` y el `<Analytics>`.
3. **`RevealFx` y `Background` con `mask.cursor`.** No aplican en la home;
   nada que hacer si el shell no los renderiza.
4. **`Cache-Control` de Vercel.** `next.config.mjs` gana los headers
   `immutable` para `/scroll/vid/:path*` y `/scroll/ia/:path*`, y
   `stale-while-revalidate` para `og.jpg` y `rulo-mark.svg`.
5. **Peso del repo.** 65 MB de MP4 commiteados. Vercel lo sirve sin
   problema (lo hace hoy en el otro proyecto), pero conviene `git lfs` o al
   menos `.gitattributes` con `-diff` para que los diffs no se vuelvan
   inmanejables. Decisión abierta: LFS sí/no.
6. **`generateStaticParams` + `outputFileTracingIncludes`.** La home sigue
   siendo estática; el manifest es un JSON importado, así que el tracer no
   necesita glob nuevo.

### 1.2 Estructura de archivos nueva

```
src/lib/scroll-world/
  stage-engine.js        motor copiado + destroy()
  sections.ts            WORLD_CONFIG(t, locale) — copia desde messages
  asset-manifest.json    copiado, prefijo /scroll
  preload.ts             PRELOAD (póster + clip del primer tramo)
src/components/scroll-world/
  StageWorld.tsx         client; monta una vez, destroy en unmount
  ScrollWorldPreload.tsx script inline de precarga por códec
src/styles/scroll-world.css  tema soft-glass, bajo html[data-scroll-world]
public/scroll/{vid,ia,og.jpg,rulo-mark.svg}
scripts/scroll-world/{encode-videos.sh,extract-posters.sh,hash-assets.mjs}
docs/plan-rebranding-scroll-world.md  (este archivo)
```

### 1.3 i18n

Las 7 estaciones van a `messages/*.json` bajo `scroll.stations.{semana,rol,
copiloto,automatiza,reto,posicionate,semana0}` con `label, eyebrow, title,
body, tags[]`, más `scroll.brand, scroll.cta, scroll.hint`. La versión EN se
traduce con el mismo tono. El motor escapa HTML, así que no se pueden usar
`<fx>` como en el hero actual: el titular va en texto plano.

### 1.4 CTA

`cta.href` apunta a `localizeHref(locale, "/ia#waitlist")` (hoy el
scroll-world no tiene href a propósito). El botón del topbar y el de la
estación 07 llevan al mismo destino. Se conserva `id="cta-professionals"`
para no romper analítica.

### 1.5 Página home después de la estación 07

El scroll-world ocupa las 7 primeras pantallas (`.sw-track` con 7 spacers).
Debajo, en scroll normal y sin snap, entran las secciones de la fase 2:
Trayectoria → Casos → Blog (3 últimos) → Newsletter → Footer del sitio.
Para que el snap no las atrape, el spacer 07 es el último con
`scroll-snap-align`; el resto del documento va con `scroll-snap-align: none`
y el motor deja de activar estaciones cuando `scrollY > 7 * svh`.

### 1.6 Verificación

- `pnpm build` limpio; `pnpm lint`.
- Playwright: desktop 1440 y móvil 390 (iOS Safari real si se puede: el
  autoplay con `muted+playsinline` en atributos es el punto frágil).
- `prefers-reduced-motion`: póster + texto, sin snap.
- Lighthouse en `/`: LCP debe seguir siendo el póster precargado, no el
  clip.
- Navegar `/` → `/about` → `/` con `Link`: sin listeners duplicados, sin snap
  en `/about`.

## 2. Fase 2 — Trayectoria + casos (portfolio de alto impacto)

- Activar `routes["/work"] = true` en `config.js`. Los 6 MDX de
  `work/projects` ya existen en ES/EN.
- Nuevo componente `Trajectory` (server): cabecera, banda de 4 cifras
  (+$2M/mes, 50.000 pacientes, 99,9% uptime, −56% LCP: todas viven ya en
  `messages.about.experiences`), línea de tiempo 2019 → 2026 y grid de
  casos (2 grandes + 3 pequeños) alimentado por `getPosts` de `work`.
- Cada MDX de proyecto gana `metric` y `year` en el frontmatter para que la
  tarjeta muestre una cifra sin tocar el cuerpo.
- Reemplaza en la home actual: `story` card + `Stats` + `Projects range`.

## 3. Fase 3 — Blog

- `routes["/blog"] = true`. Hay 7 posts ES/EN con `tag` en el frontmatter.
- Rediseño de `blog/page.tsx`: destacado (el más reciente o `featured: true`)
  + chips por tag (client, filtra en memoria) + grid 3 columnas con
  `readingTime` que ya existe en `utils`.
- Copy nuevo: título del índice orientado a IA aplicada + frontend (hoy dice
  "frontend, performance y fintech").
- Cada artículo termina con el bloque Newsletter (fase 4) y `RelatedPosts`.
- Tags nuevos a introducir en los próximos posts: `IA aplicada`,
  `Automatización`.

## 4. Fase 4 — Newsletter

- No hay que construir backend: `/api/waitlist` ya inserta en Supabase,
  manda el welcome por Resend y sincroniza el `RESEND_AUDIENCE_ID`.
- Se añade `source: "newsletter"` (hoy el `source` se deduce del referer)
  y un `kind` en la tabla `waitlist` para distinguir Semana 0 de
  newsletter sin duplicar filas.
- Componente `NewsletterBand` = `WaitlistForm` con `variant="newsletter"`:
  dos columnas, tarjeta de vidrio, un solo input, nota legal corta.
- Ubicaciones: final de la home, final del índice de blog, final de cada
  artículo, y CTA "Newsletter" en la nav del scroll-world (patrón Zoox).
- Envío de números: Resend Broadcasts sobre la audiencia existente; sin
  herramienta nueva.

## 5. Orden de commits propuesto

1. `chore(scroll): assets hasheados, manifest y headers immutable`
2. `feat(scroll): motor + CSS de vidrio bajo html[data-scroll-world], con destroy()`
3. `feat(home): la home es el scroll-world; SiteShell sin chrome en /`
4. `feat(i18n): estaciones en messages ES/EN`
5. `feat(home): trayectoria y casos debajo de la estación 07`
6. `feat(blog): índice con destacado y filtros; ruta activa`
7. `feat(newsletter): banda reutilizando waitlist; source y kind`
8. `chore(qa): Playwright desktop/móvil + reduced-motion`

## 6. Referencias de diseño (Mobbin)

- Hero video + CTA newsletter en la nav: https://mobbin.com/sites/sections/20682e5f-c100-420a-9fa4-c903409d30ed (Zoox), https://mobbin.com/sites/sections/a684fe3f-b68b-4048-a35f-6d173cad1292 (Framer)
- Timeline por años: https://mobbin.com/sites/sections/fe2855ba-d425-4440-aae5-2309ce937cf5 (Revolut), https://mobbin.com/sites/sections/2acef3f3-6363-43c3-b1f8-9c457b424f27 (Slash)
- Casos: https://mobbin.com/sites/sections/1daa8f6e-1c26-4ea3-91d7-4ff6a2f6b0c8 (Framer), https://mobbin.com/sites/sections/2971fcd4-d3c4-457f-aadd-3841b9b1d33d (FLORA)
- Blog: https://mobbin.com/screens/2ff80227-d048-4a46-954d-97c58ecdb01e (Assembly), https://mobbin.com/screens/756cbee5-cff7-4fe2-9b56-0c6d4e5a6baf (Ghost)
- Newsletter: https://mobbin.com/sites/sections/835b95cf-00d3-4e20-b8ec-fe9cb43a9b70 (GitBook), https://mobbin.com/sites/sections/030f6359-2059-4c49-8640-f4dda24dce68 (Shopify)
