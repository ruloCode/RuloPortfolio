# /ia — Prompt pack para hero + imágenes

Los prompts van en inglés a propósito (los modelos de imagen rinden bastante mejor), el resto en español.

---

## 1. Diagnóstico

| Asset actual | Problema |
|---|---|
| `ia/hero.jpg` | Swoosh azul abstracto. El cliché #1 de IA, y encima **azul** cuando la marca es emerald + cyan sobre slate. No dice nada. |
| `ia/event.jpg` | Local vacío con luces. Su alt dice "Grupo de personas aprendiendo" — **no hay personas**. |
| `home/story.jpg` | Tu foto de guitarra + código (historia música→tech) haciendo de "estudio donde una idea se convierte en piezas". Nada que ver. |
| `home/pillar-automation.jpg` | Render 3D de esferas y engranajes. Cliché "AI render". |
| `services/hero.jpg`, `home/pillar-*.jpg` | Prestadas de otras páginas, elegidas por hueco, no por mensaje. |

El patrón: **la página vende "tu profesión, aumentada" y las imágenes muestran sci-fi abstracto.** Cero personas, cero trabajo real, cero resultado. El público (marketing, finanzas, RRHH, legal, salud, educación, ops, ventas) no se ve a sí mismo en ninguna imagen.

El 10x no es un swoosh mejor. Es cambiar **qué** muestran: profesionales reales + su trabajo real + el resultado (horas recuperadas).

---

## 2. Dirección de arte (el ADN)

Una sola idea, y aguanta las 7 imágenes:

> **Fotografía editorial cinematográfica de profesionales reales en espacios oscuros, donde la IA existe únicamente como luz emerald/cyan — nunca como robot, cerebro, circuito ni holograma.**

Por qué funciona: mata el cliché, calza con los tokens de marca (`slate` / `emerald` / `cyan`, tema oscuro), centra a la persona (que es el mensaje) y se ve premium.

**Bloque ADN — pegar al final de CADA prompt:**

```
Cinematic editorial photograph, full-frame camera, 35mm prime at f/2, low-key
lighting, dark slate-charcoal interior. The only saturated colours are emerald
green and cyan, and they always come from a practical in-frame source (monitor
glow, projector, phone screen, LED strip) spilling onto surfaces and faces;
everything else is desaturated slate, graphite and warm skin tones. Deep shadows
falling to near-black at the frame edges. Fine natural film grain, real lens
imperfections, slight halation on highlights. Ordinary, believable Latin American
professionals aged 30-45, natural clothing and styling, absorbed in their work,
never looking at the camera. Any on-screen or on-paper content is abstracted into
soft out-of-focus blocks, bars and rows — no legible text anywhere.
Photojournalistic, unstaged, quiet confidence. Not a stock photo.
```

**Negative prompt — el mismo para todas:**

```
blue colour palette, glowing blue swooshes, abstract energy waves, 3D render,
plastic CGI, wireframe brain, humanoid robot, android, floating holographic UI,
HUD overlay, augmented reality panels, circuit board, motherboard traces, binary
code, matrix code rain, hexagon grid, neural network node diagram, glowing
fingertip touching a screen, lens flare, god rays, teal-and-orange grade,
oversaturated, HDR, people smiling at the camera, model looks, whiteboard with
lightbulb, gears, cogs, text, letters, words, numbers, logos, watermarks,
signage, captions, deformed hands, extra fingers
```

Dos reglas que hacen la diferencia entre "bien" y AAA:

1. **Nada de texto legible.** Los modelos escriben basura. Toda pantalla/papel va abstraído en bloques desenfocados. Ya está en el ADN — no lo quites.
2. **Dark-first.** Los bordes del frame caen a casi negro para fundirse con el fondo oscuro de la página. Una imagen clara abre un agujero de luz en el layout.

---

## 3. Assets

Todos a `/images/ia/` — namespace propio. **No sobrescribas** `home/story.jpg` ni `services/hero.jpg`: los comparten la home y services, y los pisarías.

| Archivo | Ratio | px | Concepto |
|---|---|---|---|
| `ia/hero.jpg` | 21:9 | 2560×1097 | Cualquier área, la misma luz |
| `ia/feature-rol.jpg` | 4:3 | 1600×1200 | Las horas escondidas, visibles |
| `ia/feature-copiloto.jpg` | 4:3 | 1600×1200 | Una idea → muchas piezas terminadas |
| `ia/feature-automatizacion.jpg` | 4:3 | 1600×1200 | La silla vacía |
| `ia/feature-reto.jpg` | 4:3 | 1600×1200 | Seis personas, una pantalla |
| `ia/feature-posicionamiento.jpg` | 4:3 | 1600×1200 | La que sabe |
| `ia/feature-criterio.jpg` | 4:3 | 1600×1200 | Señal fuera del ruido |

---

## 4. Prompts

### HERO — `ia/hero.jpg` (21:9)

Va justo debajo del strip que lista las 9 áreas. Su trabajo es hacer tangible el "Sea cual sea tu área".

```
Wide cinematic photograph of a large open-plan workspace late at night, shot from
a low three-quarter angle. Four separate workstations recede into the depth of the
frame, each occupied by a professional from a different field, each lit only by the
emerald-green glow of their own monitor: nearest to camera, a woman in her late
thirties leaning back with her arms crossed, calm, watching a process complete on
screen; behind her, a man reviewing a wall of soft out-of-focus document cards;
deeper still, two more figures reduced to silhouettes against cyan screen light.
Long horizontal desks, cables, coffee cups, loose paper — an ordinary real office,
not a set. Emerald and cyan light spills across the desks and up onto the ceiling;
the rest of the room falls to near-black slate at the edges of the frame.

[ADN]
```

**Alternativa** (más íntima, menos "todas las áreas" — la guardaría para A/B):

```
Wide cinematic photograph, over the shoulder of one professional at a dark desk.
She has leaned back with her hands off the keyboard, watching the work finish
itself on screen, emerald glow across her face and the wall behind her. Two thirds
of the frame is empty dark room. Nothing is happening except a woman calmly
watching her own work complete without her.

[ADN]
```

### 01 · `ia/feature-rol.jpg` — "Empezamos por tu trabajo, no por las herramientas"

```
Overhead photograph of a dark desk with a large printed weekly calendar grid
spread across it, its columns and time blocks abstracted into soft shapes with no
legible text. A woman's hands annotate it with a marker. Several blocks on the grid
are lit from beneath with emerald green light, as if those specific hours were being
found and pulled out of the week. A laptop at the edge of frame throws a cyan rim
across the paper. Everything else is deep slate shadow.

[ADN]
```

### 02 · `ia/feature-copiloto.jpg` — "Flujos, no prompts sueltos"

```
Photograph of a professional at a dark desk from a high three-quarter angle. On his
left, a single scrappy handwritten sticky note. Fanned out across the rest of the
desk, a dozen finished polished printed pieces — documents, cards, layouts — their
content abstracted into clean out-of-focus blocks. His monitor washes the scene in
emerald; a cyan desk lamp rims the edges of the paper. The composition reads left
to right as one rough idea becoming many finished pieces.

[ADN]
```

### 03 · `ia/feature-automatizacion.jpg` — "Tus tareas repetitivas, en piloto automático"

La imagen más importante del set. La silla vacía **es** la promesa: recuperas horas.

```
Photograph of a dark office desk at night with an empty chair pushed slightly back
— nobody is there. The monitor is alive: soft out-of-focus emerald rows and cards
advancing down the screen, one lighting up after another, work moving on its own.
A cold cup of coffee and a closed notebook sit on the desk. The emerald screen light
is the only light in the room, spilling across the empty chair and onto the floor.
Quiet, calm, faintly uncanny — the work is running without its owner.

[ADN]
```

### 04 · `ia/feature-reto.jpg` — "4 semanas, grupos pequeños"

Reemplaza el local vacío. Aquí sí van personas.

```
Photograph of a small group of six adult professionals gathered around a single
table in a dark room, laptops open, leaning in toward one screen that one of them
is pointing at. Their faces are lit from below by the emerald glow of the laptops;
a cyan projection washes the wall behind them, out of focus. Mixed ages and fields,
ordinary clothes, mid-conversation, engaged and slightly amused — a real working
session, not a classroom. Shot from just outside the group at eye level.

[ADN]
```

### 05 · `ia/feature-posicionamiento.jpg` — "La referencia de IA de tu equipo"

```
Photograph from the back of a dark meeting room: a woman stands presenting beside
a large screen, mid-gesture, confident and relaxed, her face and shoulders lit
emerald by the display next to her; the screen content is abstracted into soft
out-of-focus blocks. In the foreground, the blurred silhouettes and shoulders of
four colleagues watching her, backlit in cyan. She is clearly the one who knows.
Shallow depth of field — she is the only thing in focus.

[ADN]
```

### 06 · `ia/feature-criterio.jpg` — "Un sistema para que el hype no te ahogue"

```
Overhead photograph of a dark desk: a chaotic scattered drift of dozens of small
cards covering most of the frame, dim and colourless, out of focus, overlapping —
noise. A pair of hands has pulled three of them out and set them apart in a clean
row; those three are lit emerald and sharply in focus. The gesture is calm and
deliberate, not frantic. The rest of the desk falls to near-black. Signal being
separated from noise by someone who knows what they're looking for.

[ADN]
```

---

## 5. Después de generar

- **Actualizar el array `FEATURES`** en `src/app/[locale]/ia/page.tsx` a las rutas nuevas de `/images/ia/`.
- **Reescribir los alt.** Los actuales describen imágenes que no existen. `imageAlt` de `reto` promete personas sobre un local vacío, y `criterio` dice "encuentro presencial con networking" sobre lo mismo. Van en `messages/es.json` y `en.json`.
- **Peso.** Objetivo < 250 KB por imagen (jpg q80). De referencia, `cover.png` pesa 1.9 MB y `gallery/img-03.jpg` 3.5 MB — no repitas eso en la landing de conversión.
- **`priority`** ya está solo en el hero, que es lo correcto.
- **Verificar en desktop y móvil** con el tema oscuro: lo que se rompe es el punto 2 del ADN (una imagen demasiado clara abre un hueco de luz).

## 6. Un apunte más allá de las imágenes

El banner está **separado del hero por el strip de proof**, así que llega como decoración y no como parte del titular. Si quieres el 10x completo del hero, vale la pena probarlo full-bleed o subirlo justo debajo de los CTA — pero eso ya es cambio de layout, no de assets. Lo dejo anotado.
