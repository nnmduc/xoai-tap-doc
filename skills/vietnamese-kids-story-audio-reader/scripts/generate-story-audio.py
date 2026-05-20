#!/usr/bin/env python3
"""Generate per-page Vietnamese MP3 audio for a story using edge-tts.

Run from project root:
  python3 skills/vietnamese-kids-story-audio-reader/scripts/generate-story-audio.py <story-slug>
  python3 skills/vietnamese-kids-story-audio-reader/scripts/generate-story-audio.py --all
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
IMAGES_DIR = ROOT / "assets" / "generated-story-images"
AUDIO_DIR = ROOT / "assets" / "generated-story-audio"

VOICE = "vi-VN-HoaiMyNeural"
RATE = "-10%"


def check_edge_tts() -> None:
    try:
        import edge_tts  # noqa: F401
    except ImportError:
        print("edge-tts is not installed. Run: pip install edge-tts", file=sys.stderr)
        sys.exit(1)


def load_manifest(slug: str) -> dict | None:
    path = IMAGES_DIR / slug / "story-image-manifest.json"
    if not path.exists():
        print(f"  WARN: manifest not found: {path}", file=sys.stderr)
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def collect_pages(manifest: dict) -> list[tuple[int, str]]:
    """Return (page_index, text) pairs in book order: cover=0, scenes=1…N."""
    pages: list[tuple[int, str]] = []
    title = (manifest.get("title") or "").strip()
    if title:
        pages.append((0, title))
    for scene in manifest.get("scenes", []):
        text = (scene.get("content") or scene.get("text") or "").strip()
        if text:
            pages.append((len(pages), text))
    return pages


async def speak(text: str, output: Path) -> None:
    import edge_tts
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(str(output))


async def generate_for_slug(slug: str, force: bool) -> int:
    """Generate audio for one story. Returns count of generated files."""
    manifest = load_manifest(slug)
    if not manifest:
        return 0

    pages = collect_pages(manifest)
    if not pages:
        print(f"  {slug}: no pages found in manifest", file=sys.stderr)
        return 0

    out_dir = AUDIO_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    generated = 0
    for page_index, text in pages:
        out_path = out_dir / f"page-{page_index:02d}.mp3"
        if out_path.exists() and not force:
            print(f"  skip  {slug}/page-{page_index:02d}.mp3 (exists)")
            continue
        print(f"  gen   {slug}/page-{page_index:02d}.mp3 …")
        await speak(text, out_path)
        print(f"  done  {slug}/page-{page_index:02d}.mp3")
        generated += 1

    return generated


async def main_async(args: argparse.Namespace) -> int:
    check_edge_tts()

    if args.all:
        slugs = sorted(p.name for p in IMAGES_DIR.iterdir() if p.is_dir() and (p / "story-image-manifest.json").exists())
        if not slugs:
            print("No story manifests found.", file=sys.stderr)
            return 1
    elif args.slug:
        slugs = [args.slug]
    else:
        print("Provide a story slug or --all.", file=sys.stderr)
        return 1

    total = 0
    for slug in slugs:
        print(f"\n{slug}:")
        total += await generate_for_slug(slug, args.force)

    print(f"\nGenerated {total} audio file(s).")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group()
    group.add_argument("slug", nargs="?", help="Story slug.")
    group.add_argument("--all", action="store_true", help="Generate audio for all stories.")
    parser.add_argument("--force", action="store_true", help="Overwrite existing MP3 files.")
    args = parser.parse_args()
    return asyncio.run(main_async(args))


if __name__ == "__main__":
    raise SystemExit(main())
