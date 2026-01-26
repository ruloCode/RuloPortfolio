# Sincronizar Traducciones

Sincroniza las traducciones entre en.json y es.json.

## Pasos

1. Lee `messages/en.json` y `messages/es.json`
2. Compara las estructuras de ambos archivos recursivamente
3. Identifica claves que existen en uno pero no en el otro
4. Para claves faltantes en español: agrega con valor `"[TRADUCIR] {valor_ingles}"`
5. Para claves faltantes en inglés: agrega con valor `"[TRANSLATE] {valor_español}"`
6. Reporta qué claves fueron agregadas a cada archivo
7. Mantén el orden alfabético de las claves

## Ejemplo de Output

```
✅ Sincronización completada

Agregadas a es.json:
- NewSection.title: "[TRADUCIR] Our New Section"
- NewSection.description: "[TRADUCIR] Description here"

Agregadas a en.json:
- (ninguna)

⚠️ Recuerda traducir las claves marcadas con [TRADUCIR]
```
