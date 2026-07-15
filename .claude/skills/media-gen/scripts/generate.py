"""Media-gen skill (Gemini backend): image generation via Nano Banana.

Adapted from the Fal.ai media-gen skill to hit the Gemini API directly
(GEMINI_API_KEY). Images only — no video/upscale in this variant.

Usage:

  python3 generate.py image --prompt "<text>" --title "<slug>" [--model KEY]
                            [--aspect-ratio 16:9] [--resolution 1K|2K|4K]
                            [--input-image <path> ...] [--out <explicit path>]

Prints a JSON line on stdout with image_path and folder. Uses only the
standard library (urllib), no pip dependencies.
"""
from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import re
import shutil
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parent.parent
API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def load_config() -> tuple[dict, dict]:
    config = json.loads((SKILL_ROOT / "config.json").read_text(encoding="utf-8"))
    models = json.loads((SKILL_ROOT / "models.json").read_text(encoding="utf-8"))
    return config, models


def slugify(text: str) -> str:
    s = re.sub(r"[^\w\s-]", "", text.lower())
    s = re.sub(r"[-\s]+", "-", s).strip("-")
    return s[:50] or "untitled"


def expand_path(p: str) -> Path:
    return Path(os.path.expanduser(os.path.expandvars(p)))


def get_or_make_folder(output_dir: Path, working_title: str) -> Path:
    date = time.strftime("%Y-%m-%d")
    folder = output_dir / f"{date}-{slugify(working_title)}"
    folder.mkdir(parents=True, exist_ok=True)
    return folder


def next_index(folder: Path, kind: str, ext: str) -> int:
    pat = re.compile(rf"^{kind}-(\d+)\.{ext}$")
    used = [int(m.group(1)) for f in folder.iterdir() if (m := pat.match(f.name))]
    return (max(used) + 1) if used else 1


def require_key() -> str:
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.stderr.write(
            "ERROR: GEMINI_API_KEY not set.\n"
            "  Mac/Linux: add `export GEMINI_API_KEY=\"<your-key>\"` to ~/.zshrc, then `source ~/.zshrc`\n"
        )
        sys.exit(3)
    return key


def write_prompt_md(folder: Path, payload: dict) -> None:
    md = folder / "prompt.md"
    if not md.exists():
        md.write_text(
            f"# {payload.get('working_title', folder.name)}\n\n"
            f"**Created:** {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n",
            encoding="utf-8",
        )
    with md.open("a", encoding="utf-8") as f:
        f.write(f"\n## Image generation\n\n")
        f.write(f"- **Model:** `{payload['model_id']}`\n")
        f.write(f"- **File:** `{payload['filename']}`\n")
        for k, v in payload.get("args", {}).items():
            f.write(f"- **{k}:** {v}\n")
        f.write(f"\n### Prompt\n\n{payload['prompt']}\n")


def call_gemini(model_id: str, api_key: str, prompt: str,
                aspect_ratio: str | None, resolution: str | None,
                input_images: list[Path]) -> bytes:
    parts: list[dict] = []
    for ip in input_images:
        mime = mimetypes.guess_type(ip.name)[0] or "image/png"
        parts.append({
            "inline_data": {
                "mime_type": mime,
                "data": base64.b64encode(ip.read_bytes()).decode(),
            }
        })
    parts.append({"text": prompt})

    generation_config: dict = {"responseModalities": ["IMAGE"]}
    image_config: dict = {}
    if aspect_ratio:
        image_config["aspectRatio"] = aspect_ratio
    if resolution:
        image_config["imageSize"] = resolution
    if image_config:
        generation_config["imageConfig"] = image_config

    body = json.dumps({
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": generation_config,
    }).encode()

    req = urllib.request.Request(
        f"{API_BASE}/{model_id}:generateContent",
        data=body,
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            result = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")[:800]
        sys.stderr.write(f"ERROR: Gemini API {e.code} on {model_id}:\n{detail}\n")
        sys.exit(7)

    for cand in result.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            data = part.get("inlineData") or part.get("inline_data")
            if data and data.get("data"):
                return base64.b64decode(data["data"])

    sys.stderr.write(
        "ERROR: no image in response. Raw (truncated):\n"
        + json.dumps(result, default=str)[:800] + "\n"
    )
    sys.exit(8)


def cmd_image(args) -> None:
    api_key = require_key()
    config, models = load_config()
    output_dir = expand_path(config["output_dir"])

    img_cfg = models["image"]
    key = args.model or img_cfg["default"]
    if key not in img_cfg["models"]:
        sys.stderr.write(
            f"ERROR: unknown image model key '{key}'. Available: {list(img_cfg['models'])}\n")
        sys.exit(4)
    spec = img_cfg["models"][key]
    model_id = spec["model_id"]

    input_images: list[Path] = []
    for raw in args.input_image or []:
        ip = expand_path(raw)
        if not ip.is_file():
            sys.stderr.write(f"ERROR: input image not found: {ip}\n")
            sys.exit(5)
        input_images.append(ip)

    folder = get_or_make_folder(output_dir, args.title)
    idx = next_index(folder, "image", "png")
    filename = f"image-{idx:02d}.png"
    out_path = expand_path(args.out) if args.out else folder / filename

    sys.stderr.write(f"[media-gen] Generating image with {model_id}...\n")
    sys.stderr.flush()

    png = call_gemini(model_id, api_key, args.prompt,
                      args.aspect_ratio, args.resolution, input_images)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(png)

    write_prompt_md(folder, {
        "kind": "image",
        "model_id": model_id,
        "filename": str(out_path) if args.out else filename,
        "prompt": args.prompt,
        "working_title": args.title,
        "args": {
            "aspect_ratio": args.aspect_ratio,
            "resolution": args.resolution,
            "references": [str(p) for p in input_images] or None,
        },
    })
    for ip in input_images:
        try:
            shutil.copy2(ip, folder / f"source-{ip.name}")
        except Exception:
            pass

    print(json.dumps({
        "image_path": str(out_path),
        "folder": str(folder),
        "model": model_id,
    }))


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="media-gen")
    sub = p.add_subparsers(dest="cmd", required=True)

    pi = sub.add_parser("image", help="Generate an image from a prompt")
    pi.add_argument("--prompt", required=True)
    pi.add_argument("--title", required=True, help="Working title slug")
    pi.add_argument("--model", default=None, help="Model key from models.json")
    pi.add_argument("--aspect-ratio", dest="aspect_ratio", default=None,
                    help="e.g. 16:9, 1:1, 21:9, 9:16")
    pi.add_argument("--resolution", default=None, help="1K, 2K or 4K (Pro only)")
    pi.add_argument("--input-image", dest="input_image", action="append", default=None,
                    help="Reference image path; repeatable (editing / consistency)")
    pi.add_argument("--out", default=None,
                    help="Explicit output file path (overrides dated folder)")
    pi.set_defaults(func=cmd_image)
    return p


if __name__ == "__main__":
    args = build_parser().parse_args()
    args.func(args)
