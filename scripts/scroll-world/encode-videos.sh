#!/usr/bin/env bash
# Re-encode de los clips del landing a un ladder moderno de códecs.
#
# Desktop (fuente 2560x1440 H.264 ~7.8Mbps): se baja a 1080p — el clip es un fondo
# escalado por CSS, 1440p no aporta nitidez visible y sí ~2x de peso.
# Móvil (fuente 720x1280): se conserva la resolución; el H.264 móvil NO se
# re-encodea (evita pérdida de generación), solo se copia.
#
# Por clip se generan: AV1 (Chrome/Firefox/Safari M3+), HEVC (Safari/iPhone) y
# H.264 (red de seguridad universal). El motor elige en runtime con canPlayType.
#
# -g 48 = keyframe cada 2s a 24fps: el motor reproduce lineal (no scrubbing),
# solo hace seek a 0, así que no necesita keyframes densos.
set -euo pipefail

# Masters e intermedios viven en fauna-scroll-world (SCROLL_WORLD_SRC).
SRCROOT="${SCROLL_WORLD_SRC:-$(cd "$(dirname "$0")/../../../fauna-scroll-world" && pwd)}"
SRC="$SRCROOT/assets/vid/ia"
OUT="$SRCROOT/media/encoded"
mkdir -p "$OUT"

for i in 1 2 3 4 5 6 7; do
  d="$SRC/s$i.mp4"      # desktop 1440p
  m="$SRC/s$i-m.mp4"    # móvil 720x1280

  # --- desktop → 1080p ---
  ffmpeg -y -v error -i "$d" -vf scale=1920:-2 -an \
    -c:v libx264 -crf 23 -preset slow -g 48 -pix_fmt yuv420p \
    -movflags +faststart "$OUT/s$i-1080.h264.mp4"

  ffmpeg -y -v error -i "$d" -vf scale=1920:-2 -an \
    -c:v libx265 -crf 26 -preset medium -tag:v hvc1 -g 48 -pix_fmt yuv420p \
    -x265-params log-level=error -movflags +faststart "$OUT/s$i-1080.hevc.mp4"

  # crf 35 y no 32: con tune=0 el 32 gastaba más bits que HEVC crf 26 sin
  # diferencia visible; 35 es el equivalente perceptual real.
  ffmpeg -y -v error -i "$d" -vf scale=1920:-2 -an \
    -c:v libsvtav1 -crf 35 -preset 5 -g 48 -svtav1-params tune=0 \
    -movflags +faststart "$OUT/s$i-1080.av1.mp4"

  # --- móvil (720x1280, misma resolución) ---
  cp "$m" "$OUT/s$i-720m.h264.mp4"

  ffmpeg -y -v error -i "$m" -an \
    -c:v libx265 -crf 27 -preset medium -tag:v hvc1 -g 48 -pix_fmt yuv420p \
    -x265-params log-level=error -movflags +faststart "$OUT/s$i-720m.hevc.mp4"

  # crf 38: la fuente móvil ya viene comprimida a ~2.1Mbps; con crf 33 el AV1
  # salía MÁS pesado que esa fuente. A 38 queda por debajo de HEVC sin artefactos.
  ffmpeg -y -v error -i "$m" -an \
    -c:v libsvtav1 -crf 38 -preset 5 -g 48 -svtav1-params tune=0 \
    -movflags +faststart "$OUT/s$i-720m.av1.mp4"

  echo "s$i listo"
done

echo "--- tamaños ---"
ls -lh "$OUT" | sort -k9
