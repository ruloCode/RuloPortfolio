# rulocode.com

Portfolio de Andrés Santana (RuloCode): frontend, LLMs en producción, consultoría
y el AI Shift Challenge. Sitio bilingüe (inglés en `/`, español en `/es`).

## Stack

Next.js 16.3, React 19, TypeScript, next-intl, MDX, Once UI, pnpm.
Auth y dashboard van por Supabase; la lista de espera por Resend; el checkout por Polar.

## Desarrollo

Requiere Node.js 18.17+. Copia `.env.example` a `.env.local` solo si vas a probar
login, waitlist o pagos. El sitio de marketing construye sin esas claves.

```bash
pnpm install
pnpm dev
```

Otros comandos: `pnpm lint`, `pnpm build`, `pnpm start`.

## Contenido y config

- Copia i18n: `messages/en.json`, `messages/es.json`
- Config del sitio: `src/app/resources/config.js`
- Posts: `src/app/[locale]/blog/posts/{en,es}/*.mdx`
- Casos: `src/app/[locale]/work/projects/{en,es}/*.mdx`

## Origen

Partió de [Magic Portfolio](https://github.com/once-ui-system/magic-portfolio)
(Once UI). Licencia del template: CC BY-NC 4.0 (ver `LICENSE`).
