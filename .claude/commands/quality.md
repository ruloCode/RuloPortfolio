# Quality Gate - Pipeline Completo

Ejecuta el pipeline completo de calidad siguiendo @quality-orchestrator.

## Flujo

### 1. Verificación Técnica
```bash
npm run lint
npm run build
```

### 2. Identificar Cambios
```bash
git diff --name-only
git diff --cached --name-only
```

### 3. Code Review
- Aplicar checklist de `.claude/agents/code-reviewer.md`
- Revisar TypeScript, React best practices, clean code

### 4. UI Review (si hay componentes)
- Aplicar checklist de `.claude/agents/ui-reviewer.md`
- Solo si hay archivos en `app/components/`

### 5. i18n Check
- Leer `messages/en.json` y `messages/es.json`
- Verificar que tengan las mismas claves
- Buscar textos hardcodeados en componentes modificados

### 6. Generar Reporte Final

```markdown
# 🎯 Quality Gate Report

## 📊 Resumen
| Check | Estado |
|-------|--------|
| Lint | ✅/❌ |
| Build | ✅/❌ |
| Code Review | X/10 |
| UI Review | X/10 |
| i18n | ✅/❌ |

## Veredicto: ✅ READY / ❌ NEEDS WORK
```

### 7. Si todo pasa
Ofrecer hacer commit con mensaje descriptivo.
