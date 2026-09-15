#!/usr/bin/env bash
# Regenera los pósters como el FRAME 0 exacto de cada clip.
#
# Por qué: el póster se muestra mientras el video carga y se retira cuando hay
# frame pintado. Si el póster es un fotograma de otro punto del vuelo (los
# originales eran "beauty shots"), al entrar el video la imagen salta hacia
# atrás y el usuario ve frames repetidos. Póster == frame 0 → transición
# invisible. (Se midió: SSIM 0.42-0.58 con los antiguos; ~1.0 con estos.)
#
# ffmpeg de Homebrew no trae libwebp, así que: ffmpeg → PNG → cwebp.
set -euo pipefail

# Masters y pósters viven en fauna-scroll-world (SCROLL_WORLD_SRC).
ROOT="${SCROLL_WORLD_SRC:-$(cd "$(dirname "$0")/../../../fauna-scroll-world" && pwd)}"
VID="$ROOT/assets/vid/ia"
OUT="$ROOT/assets/ia"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

names=(01-semana 02-rol 03-copiloto 04-automatiza 05-reto 06-posicionate 07-semana0)

for i in 1 2 3 4 5 6 7; do
  n="${names[$((i-1))]}"
  # Desktop: a 1920 (mismo ancho que el clip 1080p — sin reescalado al hacer swap)
  ffmpeg -y -v error -i "$VID/s$i.mp4" -frames:v 1 -vf scale=1920:-2 "$TMP/d.png"
  cwebp -quiet -q 85 "$TMP/d.png" -o "$OUT/$n.webp"
  # Móvil: tamaño nativo del clip vertical (720x1280)
  ffmpeg -y -v error -i "$VID/s$i-m.mp4" -frames:v 1 "$TMP/m.png"
  cwebp -quiet -q 85 "$TMP/m.png" -o "$OUT/$n-m.webp"
  echo "$n listo"
done
