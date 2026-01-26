# Pre-Commit Check

Verificación rápida antes de hacer commit.

## Pasos (rápidos, < 30 segundos)

1. **Lint**
   ```bash
   npm run lint
   ```

2. **TypeScript Check**
   ```bash
   npx tsc --noEmit
   ```

3. **i18n Sync**
   - Verificar que en.json y es.json tengan las mismas claves
   - Reportar discrepancias

4. **Build Test** (opcional, si el usuario quiere)
   ```bash
   npm run build
   ```

## Output

```
🔍 Pre-commit Check

✅ Lint: passed
✅ TypeScript: no errors
✅ i18n: synced
⏭️ Build: skipped (run /project:quality for full check)

Ready to commit!
```

## Si hay errores

Listar errores y ofrecer:
1. Corregirlos automáticamente
2. Mostrar cómo corregirlos manualmente
