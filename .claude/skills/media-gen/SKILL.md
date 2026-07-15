---
name: media-gen
description: Generate AI images with Nano Banana via the Gemini API (GEMINI_API_KEY). Use whenever the user asks to create, generate, make, render, or produce a photo, image, picture, hero, texture, OG image or visual asset for this project. Adapted from the Fal.ai media-gen skill — images only, no pip dependencies.
---

# Media Gen (Gemini / Nano Banana)

Local image pipeline hitting the Gemini API directly. Models are swappable via `models.json`. Requires `GEMINI_API_KEY` in the environment (already in ~/.zshrc).

## Operating principles

1. **Refine the prompt before sending it.** The user's casual description is the brief, not the prompt. Expand it into 2-4 sentences with lighting, composition, lens/camera language, environment and mood. Nano Banana likes natural-language descriptive prompts, NOT weighted token syntax.
2. **Pick the model from `models.json`.** `nano-banana-pro` (default) for finals/heroes/2K+; `nano-banana` for cheap drafts.
3. **Save everything.** Each generation gets a dated folder in `~/Documents/Media Gen` with a `prompt.md` recording model + prompt. Copy final picks into `public/images/` in the repo.
4. **One generation per request** unless the user asks for variants.

## Generate

```bash
python3 .claude/skills/media-gen/scripts/generate.py image \
  --prompt "<refined prompt>" \
  --title "<working-title-slug>" \
  [--model nano-banana-pro|nano-banana] \
  [--aspect-ratio "16:9"] \
  [--resolution "2K"] \
  [--input-image "<ref-path>" ...] \
  [--out "public/images/home/hero.png"]
```

- `--aspect-ratio`: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9.
- `--resolution`: 1K / 2K / 4K (Pro only; omit for nano-banana).
- `--input-image` (repeatable): reference images for edits or style/character consistency. Phrase the prompt as "the same X from the reference, now …".
- `--out`: write directly to an explicit path (e.g. into `public/images/`); the dated folder still records provenance in `prompt.md`.

The script prints a JSON line with `image_path` and `folder`.

## Errors

- `GEMINI_API_KEY not set` → tell the user to export it in `~/.zshrc`.
- HTTP 404 on the model → the `model_id` in `models.json` drifted; check https://ai.google.dev/gemini-api/docs/image-generation and update.
- HTTP 429 → quota; wait or switch to `nano-banana`.

## Portfolio conventions (this repo)

- Final assets live in `public/images/<section>/` (e.g. `home/`, `ia/`, `og/`). Prefer 16:9 2K for heroes, 1200x630-ish (16:9 1K is fine) for OG.
- Keep one consistent art direction per page. Record the shared style prompt in the generation `prompt.md` and reuse it with `--input-image` anchors for consistency.
- Compress/serve via Next `SmartImage` — no need to pre-optimize beyond PNG.
