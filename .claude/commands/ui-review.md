# UI Review

Ejecuta una revisión de UI/UX siguiendo las instrucciones del agente @ui-reviewer.

## Pasos

1. Identificar componentes visuales modificados:
   ```bash
   git diff --name-only HEAD | grep -E "components.*\.(tsx|ts)$"
   ```

2. Para cada componente:
   - Leer el código
   - Analizar estructura de Tailwind
   - Verificar responsive (mobile-first)
   - Revisar animaciones Framer Motion

3. Aplicar checklist de `.claude/agents/ui-reviewer.md`

4. Generar reporte con:
   - ✅ Aspectos positivos
   - 🔧 Mejoras UX
   - 📱 Issues responsive
   - ♿ Issues de accesibilidad
   - Puntuación X/10
