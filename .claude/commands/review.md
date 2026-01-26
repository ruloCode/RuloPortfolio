# Code Review

Ejecuta una revisión de código completa siguiendo las instrucciones del agente @code-reviewer.

## Pasos

1. Identificar archivos modificados:
   ```bash
   git diff --name-only HEAD
   git status --short
   ```

2. Leer cada archivo modificado (.ts, .tsx)

3. Aplicar el checklist de `.claude/agents/code-reviewer.md`

4. Generar reporte con:
   - ✅ Lo que está bien
   - ⚠️ Sugerencias
   - ❌ Issues críticos
   - Puntuación X/10

5. Si hay issues críticos, ofrecer corregirlos automáticamente
