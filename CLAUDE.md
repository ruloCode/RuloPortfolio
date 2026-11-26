# Rulo Portfolio (rulocode.com)

Portfolio personal y plataforma del AI Shift Challenge.

## Stack

- Next.js 16.3 (App Router) + React 19 + TypeScript
- pnpm
- next-intl (`en` por defecto sin prefijo; `es` bajo `/es`; `localePrefix: "as-needed"`)
- MDX para blog y casos (`src/app/[locale]/blog/posts/{en,es}`, `.../work/projects/{en,es}`)
- Once UI (componentes y tokens) + SASS/SCSS Modules
- Supabase (auth, waitlist, dashboard), Resend (emails), Polar (checkout)
- Home: scroll-world (motor client-side en `src/lib/scroll-world`)
- Proxy: `src/proxy.ts` (i18n + refresh de sesión solo en `/login` y `/dashboard`)

## Estructura

```
src/
├── app/
│   ├── [locale]/          # Home, about, work, blog, services, ia, gallery, login, dashboard
│   ├── api/               # waitlist, checkout, webhooks/polar
│   ├── auth/callback/     # OAuth/magic link (no localizado)
│   ├── og/                # Imagen OG dinámica
│   ├── robots.ts
│   └── sitemap.ts
├── components/            # UI de la app (no Once UI)
├── i18n/                  # routing y request config
├── lib/                   # supabase, auth, billing, scroll-world
└── once-ui/               # Sistema de diseño

messages/                  # en.json, es.json
public/                    # imágenes, videos, scroll-world assets
supabase/migrations/
```

## Comandos

```bash
pnpm dev      # Desarrollo
pnpm build    # Build producción
pnpm lint     # ESLint
pnpm start    # Servir el build
```

El build de marketing no requiere variables de entorno. Auth, waitlist y checkout
sí: ver nombres en `.env.example` (copiar a `.env.local`, nunca commitear `.env`).

## Convenciones

- Componentes de app en `src/components/`, SCSS Modules, barrels `index.ts`
- Frontmatter MDX: `title`, `publishedAt`, `summary`
- Usar componentes de `@/once-ui/components` y los tokens existentes
- Rutas públicas se encienden/apagan en `src/app/resources/config.js` (`routes`)
- Canonical y hreflang: `localeAlternates()` / `localeOpenGraph()` en `src/app/utils/seo.ts`
- No mezclar estilos inline con SCSS cuando exista un token o módulo

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
