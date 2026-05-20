#!/usr/bin/env python3
"""Generate assets/stories-manifest.json from pipeline image manifests.

Run from project root:
  python3 web-app/scripts/generate-stories-manifest.py

Output: assets/stories-manifest.json
  - Lives inside Vite publicDir ("../assets") → served at /stories-manifest.json
  - Re-run whenever new stories are added to the pipeline.
"""
import json
import re
import sys
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).parent.parent.parent  # project root
IMAGE_DIR = ROOT / "assets" / "generated-story-images"
BOOKS_DIR = ROOT / "assets" / "generated-story-books"
AUDIO_DIR = ROOT / "assets" / "generated-story-audio"
OUT_PATH = ROOT / "assets" / "stories-manifest.json"


def load_json(path: Path) -> dict | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        print(f"  WARN: skipping {path}: {e}", file=sys.stderr)
        return None


def extract_reading_level(story_path: Path) -> str:
    """Extract reading_level from story markdown YAML frontmatter."""
    try:
        text = story_path.read_text(encoding="utf-8")
        m = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
        if m:
            level_m = re.search(r'^reading_level:\s*"([^"]+)"', m.group(1), re.MULTILINE)
            if level_m:
                return level_m.group(1)
    except OSError:
        pass
    return "Lớp 1"


def main() -> None:
    manifests = sorted(IMAGE_DIR.glob("*/story-image-manifest.json"))
    if not manifests:
        print(f"No story manifests found in {IMAGE_DIR}", file=sys.stderr)
        sys.exit(1)

    stories = []
    for path in manifests:
        data = load_json(path)
        if not data:
            continue
        slug = data.get("story_slug", "")
        title = data.get("title", slug)
        if not slug:
            continue
        has_book = (BOOKS_DIR / slug / "index.html").exists()
        has_audio = (AUDIO_DIR / slug).is_dir() and any((AUDIO_DIR / slug).glob("*.mp3"))
        story_path = ROOT / data.get("story_path", f"assets/stories/{slug}.md")
        reading_level = extract_reading_level(story_path)
        stories.append({
            "slug": slug,
            "title": title,
            "summary": "",
            "themes": [],
            "coverPath": f"/generated-story-images/{slug}/cover/cover.png",
            "hasHtmlBook": has_book,
            "hasAudio": has_audio,
            "readingLevel": reading_level,
        })
        audio_icon = "🔊" if has_audio else "  "
        status = "✅" if has_book else "⏳"
        print(f"  {status} {audio_icon} {slug}: {title}")

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    output = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "stories": stories,
    }
    OUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nWrote {len(stories)} stories → {OUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
