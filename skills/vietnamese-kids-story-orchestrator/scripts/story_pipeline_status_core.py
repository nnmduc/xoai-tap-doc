"""Core status inspection for the Vietnamese kids story pipeline."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
STORIES_DIR = ROOT / "assets" / "stories"
IMAGES_DIR = ROOT / "assets" / "generated-story-images"
BOOKS_DIR = ROOT / "assets" / "generated-story-books"
AUDIO_DIR = ROOT / "assets" / "generated-story-audio"
STATUS_DIR = ROOT / "assets" / "story-pipeline-status"
MAX_STORY_PAGES = 9


def slugify(value: str) -> str:
    value = value.replace("Đ", "D").replace("đ", "d")
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-zA-Z0-9]+", "-", ascii_value.lower()).strip("-") or "story"


def load_json(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return data if isinstance(data, dict) else None


def extract_frontmatter(markdown: str) -> tuple[dict[str, Any], str, list[str]]:
    match = re.match(r"\A---\s*\n(.*?)\n---\s*\n", markdown, re.DOTALL)
    if not match:
        return {}, markdown, ["missing YAML frontmatter"]

    frontmatter = match.group(1)
    body = markdown[match.end() :]
    data: dict[str, Any] = {}
    issues: list[str] = []
    for key in ["title", "summary", "reading_level", "setting", "paragraph_count"]:
        value_match = re.search(rf"^{key}:\s*(.+)$", frontmatter, re.MULTILINE)
        if value_match:
            value = value_match.group(1).strip().strip('"')
            data[key] = int(value) if key == "paragraph_count" and value.isdigit() else value
    if "title" not in data:
        issues.append("missing title in frontmatter")
    if "paragraph_count" not in data:
        issues.append("missing paragraph_count in frontmatter")
    if "characters:" not in frontmatter:
        issues.append("missing characters in frontmatter")
    return data, body, issues


def story_sections(body: str) -> list[int]:
    return [int(match.group(1)) for match in re.finditer(r"^###\s+Đoạn\s+(\d+)\s*$", body, re.MULTILINE)]


def story_status(story_path: Path | None, fallback_slug: str | None) -> dict[str, Any]:
    if not story_path or not story_path.exists():
        return {
            "exists": False,
            "path": str(story_path) if story_path else None,
            "title": None,
            "slug": fallback_slug,
            "section_count": 0,
            "paragraph_count": None,
            "issues": ["story markdown not found"],
            "ready": False,
        }

    metadata, body, issues = extract_frontmatter(story_path.read_text(encoding="utf-8"))
    sections = story_sections(body)
    title = str(metadata.get("title") or story_path.stem)
    paragraph_count = metadata.get("paragraph_count")
    if paragraph_count is not None and paragraph_count != len(sections):
        issues.append(f"paragraph_count is {paragraph_count}, but found {len(sections)} sections")
    if not sections:
        issues.append("missing Đoạn sections")
    if len(sections) > MAX_STORY_PAGES:
        issues.append(f"found {len(sections)} sections, but max supported story pages is {MAX_STORY_PAGES}")
    return {
        "exists": True,
        "path": str(story_path),
        "title": title,
        "slug": slugify(title),
        "section_count": len(sections),
        "paragraph_count": paragraph_count,
        "issues": issues,
        "ready": not issues,
    }


def expected_media(manifest: dict[str, Any] | None) -> list[dict[str, str]]:
    if not manifest:
        return []
    media: list[dict[str, str]] = []
    cover = manifest.get("cover")
    if isinstance(cover, dict) and cover.get("output_path"):
        media.append({"kind": "cover", "path": str(cover["output_path"])})
    for kind, key in [("character", "characters"), ("scene", "scenes")]:
        for item in manifest.get(key, []):
            if isinstance(item, dict) and item.get("output_path"):
                name = str(item.get("name") or item.get("index") or "")
                media.append({"kind": kind, "name": name, "path": str(item["output_path"])})
    return media


def media_status(slug: str | None) -> dict[str, Any]:
    if not slug:
        return {"manifest_exists": False, "manifest_path": None, "expected_count": 0, "existing_count": 0, "missing": []}
    manifest_path = IMAGES_DIR / slug / "story-image-manifest.json"
    manifest = load_json(manifest_path)
    expected = expected_media(manifest)
    existing = [item for item in expected if (ROOT / item["path"]).exists()]
    missing = [item for item in expected if not (ROOT / item["path"]).exists()]
    return {
        "manifest_exists": manifest is not None,
        "manifest_path": str(manifest_path),
        "expected_count": len(expected),
        "existing_count": len(existing),
        "missing_count": len(missing),
        "missing": missing,
        "existing": existing,
        "complete": bool(expected) and not missing,
    }


def audio_status(slug: str | None) -> dict[str, Any]:
    if not slug:
        return {"exists": False, "count": 0, "dir": None}
    audio_dir = AUDIO_DIR / slug
    mp3s = sorted(audio_dir.glob("*.mp3")) if audio_dir.exists() else []
    return {"exists": bool(mp3s), "count": len(mp3s), "dir": str(audio_dir)}


def book_status(slug: str | None) -> dict[str, Any]:
    path = BOOKS_DIR / slug / "index.html" if slug else None
    return {"exists": bool(path and path.exists()), "path": str(path) if path else None}


def determine_state(story: dict[str, Any], media: dict[str, Any], book: dict[str, Any]) -> str:
    if not story["exists"]:
        return "new"
    if not story["ready"]:
        return "story_incomplete"
    if not media["manifest_exists"]:
        return "story_ready"
    if media["expected_count"] == 0 or media["existing_count"] == 0:
        return "prompts_ready"
    if not media["complete"]:
        return "media_partial"
    return "complete" if book["exists"] else "media_complete"


def next_actions(state: str, story: dict[str, Any], media: dict[str, Any], book: dict[str, Any]) -> list[str]:
    slug = story.get("slug")
    story_path = story.get("path") or f"assets/stories/{slug or '<story-slug>'}.md"
    if state == "new":
        return ["Use vietnamese-first-grade-story-writer to create the story markdown."]
    if state == "story_incomplete":
        return ["Fix story markdown issues before preparing media."]
    if state == "story_ready":
        return [f"Run vietnamese-kids-story-illustrator preparation for {story_path}."]
    if state in {"prompts_ready", "media_partial"}:
        return [f"Generate missing media file: {item['path']}" for item in media["missing"]]
    if state == "media_complete":
        manifest = media.get("manifest_path") or f"assets/generated-story-images/{slug}/story-image-manifest.json"
        return [f"Use kid-story-book-html-template to render {manifest}."]
    if state == "complete":
        return [f"Story package complete: {book['path']}"]
    return []


def inspect_one(story_path: Path | None, fallback_slug: str | None) -> dict[str, Any]:
    story = story_status(story_path, fallback_slug)
    slug = story.get("slug") or fallback_slug
    media = media_status(str(slug) if slug else None)
    audio = audio_status(str(slug) if slug else None)
    book = book_status(str(slug) if slug else None)
    state = determine_state(story, media, book)
    return {"state": state, "story": story, "media": media, "audio": audio, "book": book, "next_actions": next_actions(state, story, media, book)}


def write_status(report: dict[str, Any]) -> Path:
    slug = report["story"].get("slug") or "unknown-story"
    STATUS_DIR.mkdir(parents=True, exist_ok=True)
    path = STATUS_DIR / f"{slug}.json"
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path
