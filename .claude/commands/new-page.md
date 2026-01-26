# Crear Nueva Página

Crea una nueva página en el proyecto: $ARGUMENTS

## Pasos

1. Crear carpeta en `app/[locale]/$ARGUMENTS/`
2. Crear `page.tsx` con estructura base (ver template abajo)
3. Agregar traducciones en `messages/en.json` y `messages/es.json`
4. Si es página principal, agregar link en Navbar

## Template page.tsx

```tsx
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('$ARGUMENTS');
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function $ARGUMENTSPage() {
  const t = useTranslations('$ARGUMENTS');
  
  return (
    <main className="min-h-screen">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">{t('title')}</h1>
          <p className="mt-4 text-lg text-gray-600">{t('description')}</p>
        </div>
      </section>
    </main>
  );
}
```

## Traducciones a agregar

```json
{
  "$ARGUMENTS": {
    "meta": {
      "title": "Page Title | Nevada Tech",
      "description": "Page description for SEO"
    },
    "title": "Page Title",
    "description": "Page description"
  }
}
```
