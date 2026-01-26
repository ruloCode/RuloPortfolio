# Rulo Portfolio

## MCP Servers Configurados

### 1. playwright (Browser Automation)
Screenshots, testing visual, interacción con el browser.
```
# Tomar screenshot:
Usa browser_eval con action "screenshot" url "http://localhost:3000"

# Navegar y verificar:
Usa browser_eval con action "navigate" url "http://localhost:3000"
```

### 2. context7 (Documentación Actualizada)
Docs actualizados de Next.js, React y otros frameworks.
```
# Buscar documentación:
Usa resolve con libraryName "nextjs"
Usa resolve con libraryName "react" 
```

### 3. github (GitHub Integration)
PRs, issues, code review, repositorios.
```
# Crear PR:
Usa create_pull_request

# Ver issues:
Usa list_issues
```

### Verificar MCPs conectados
Dentro de Claude Code ejecuta: `/mcp`

## Stack
- Next.js 14.2 (App Router) + React 18
- TypeScript
- SASS/SCSS Modules para estilos
- Once UI (sistema de componentes propio)
- MDX para contenido (blog y proyectos)
- Prism.js para code highlighting

## Estructura
```
src/
├── app/
│   ├── page.tsx           # Home
│   ├── blog/              # Blog con MDX
│   │   └── posts/         # Archivos .mdx del blog
│   ├── work/              # Portfolio/Proyectos
│   │   └── projects/      # Archivos .mdx de proyectos
│   └── about/             # Página About
├── components/            # Componentes React
├── once-ui/               # Sistema de diseño Once UI
│   ├── components/        # Componentes base
│   └── tokens/            # Design tokens
└── pages/                 # API routes (si las hay)

public/
├── images/                # Imágenes estáticas
│   ├── projects/          # Screenshots de proyectos
│   └── blog/              # Imágenes del blog
└── fonts/                 # Fuentes locales
```

## Comandos
```bash
pnpm dev      # Desarrollo
pnpm build    # Build producción
pnpm lint     # Linting
```

## Convenciones

### Componentes
- Ubicar en `src/components/`
- Usar SCSS Modules (`.module.scss`)
- Export con barrel files (`index.ts`)

### Contenido MDX
- Blog posts en `src/app/blog/posts/`
- Proyectos en `src/app/work/projects/`
- Frontmatter obligatorio: title, publishedAt, summary

### Once UI
- Usar componentes de `@/once-ui/components`
- Seguir los tokens de diseño existentes
- No mezclar estilos inline con SCSS

## Agentes disponibles
- `/agent:code-reviewer` - Revisión de código
- `/agent:quality-orchestrator` - Orquestador de calidad
- `/agent:ui-reviewer` - Revisión de UI

## Skills disponibles
- `new-component` - Crear nuevo componente
- `new-project` - Agregar proyecto al portfolio
- `clean-code` - Guidelines de código limpio
- `once-ui-patterns` - Patrones de Once UI
- `mdx-content` - Contenido MDX
